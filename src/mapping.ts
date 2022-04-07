import { BigInt, Address, log } from "@graphprotocol/graph-ts"
import {Contract__playersResult} from "../generated/Contract/Contract"
import {
  Contract,
  Deposit,
  FundsRedeemedFromExternalPool,
  JoinedGame,
  OwnershipTransferred,
  Paused,
  Unpaused,
  WinnersAnnouncement,
  Withdrawal,
  EarlyWithdrawal
} from "../generated/Contract/Contract"
import { Player, Game } from "../generated/schema"

export function handleDeposit(event: Deposit): void {
  let contract = Contract.bind(event.address);
  let address = event.params.player
  let player = Player.load(address.toHex())
  player.mostRecentSegmentPaid = event.params.segment
  player.amountPaid = player.amountPaid + event.params.amount

  let game = Game.load(event.address.toHex())
  let callResult = contract.try_totalGamePrincipal()
  if (callResult.reverted) {
    log.info('totalGamePrincipal call reverted', [])
  } else {
    game.totalGamePrincipal = callResult.value
  }

  callResult = contract.try_getCurrentSegment()
  if (callResult.reverted) {
    log.info('getCurrentSegment call reverted', [])
  } else {
    game.currentSegment = callResult.value
  }
  
  let segmentCounter = game.segmentCounter;
  if (segmentCounter.length - 1 < game.currentSegment.toI32()) {
    segmentCounter.push(BigInt.fromI32(1))
  } else if (segmentCounter.length - 1 == game.currentSegment.toI32()) {
    segmentCounter[segmentCounter.length - 1] = segmentCounter[segmentCounter.length - 1] + BigInt.fromI32(1);
  }
  segmentCounter[segmentCounter.length - 2] = segmentCounter[segmentCounter.length - 2] - BigInt.fromI32(1);
  
  game.segmentCounter = segmentCounter;
  game.save()
  player.save()
}

export function handleFundsRedeemedFromExternalPool(event: FundsRedeemedFromExternalPool): void {
  let contract = Contract.bind(event.address);

  let game = Game.load(event.address.toHex())
  game.totalGamePrincipal = event.params.totalGamePrincipal
  game.totalGameInterest = event.params.totalGameInterest
  let callResult = contract.try_getCurrentSegment()
  if (callResult.reverted) {
    log.info('getCurrentSegment call reverted', [])
  } else {
    game.currentSegment = callResult.value
  }
  game.redeemed = true
  game.rewards = event.params.rewards;
  game.curveRewards = event.params.curveRewards;
  game.additionalIncentives = event.params.totalIncentiveAmount;
  game.save()
}

export function handleJoinedGame(event: JoinedGame): void {
  let contract = Contract.bind(event.address);
  let address = event.params.player
  let player = Player.load(address.toHex())
  if (player == null) {
    player = new Player(address.toHex());
    player.canRejoin = false;
  }
  player.address = address
  let callResult = contract.try_getCurrentSegment()
  if (callResult.reverted) {
    log.info('getCurrentSegment call reverted', [])
  } else {
    player.mostRecentSegmentPaid = callResult.value
  }
  player.amountPaid = event.params.amount
  player.withdrawAmount = BigInt.fromI32(0);
  player.playerReward = BigInt.fromI32(0);
  player.playerCurveReward = BigInt.fromI32(0);
  player.additionalPlayerReward = BigInt.fromI32(0);

  player.withdrawn = false;

  let game = Game.load(event.address.toHex())

  if (game == null) {
    game = new Game(event.address.toHex())
    game.players = new Array<string>();
    game.totalGamePrincipal = event.params.amount
    game.totalGameInterest = BigInt.fromI32(0);
    game.rewards = BigInt.fromI32(0);
    game.curveRewards = BigInt.fromI32(0);
    game.totalDropouts = BigInt.fromI32(0);
    game.additionalIncentives = BigInt.fromI32(0);
    game.winners = new Array<string>();
    game.dropOuts = new Array<string>();
    game.segmentCounter = new Array<BigInt>();
    game.segmentPayment = contract.segmentPayment();
    game.adminFeePercent = contract.customFee();
    game.earlyWithdrawFeePercent = contract.earlyWithdrawalFee();
    game.firstSegmentStart = contract.firstSegmentStart()
    game.segmentLength = contract.segmentLength()
    game.redeemed = false
    game.lastSegment = contract.lastSegment()
    game.withdrawAmountAllocated = false
  }
  if (player.canRejoin == true) {
    let dropOutPlayers = game.dropOuts
    let playerIndex = dropOutPlayers.indexOf(player.id);
    dropOutPlayers.splice(playerIndex, 1);
    game.dropOuts = dropOutPlayers;
    game.totalDropouts = BigInt.fromI32(dropOutPlayers.length)
  }
  game.currentSegment = contract.getCurrentSegment()
  game.totalGamePrincipal = contract.totalGamePrincipal()
  let segmentCounter = game.segmentCounter;

  if (segmentCounter.length == 0) {
    segmentCounter.push(BigInt.fromI32(1))
  } else {
    segmentCounter[0] = segmentCounter[0] + BigInt.fromI32(1);
  }
  game.segmentCounter = segmentCounter;
  let players = game.players
  players.push(player.id)
  game.players = players
  player.canRejoin = false;
  game.save()
  player.save()
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void { }

export function handlePaused(event: Paused): void { }

export function handleUnpaused(event: Unpaused): void { }

export function handleWinnersAnnouncement(event: WinnersAnnouncement): void {
  let contract = Contract.bind(event.address);
  let game = Game.load(event.address.toHex())
  let gameWinners = game.winners
  let winners = event.params.winners
  for (var i = 0; i < winners.length; i++) {
    let player = Player.load(winners[i].toHex())
    let playerInfo: Contract__playersResult
    let callResult = contract.try_players(winners[i])
    if (callResult.reverted) {
      log.info('players call reverted', [])
    } else {
      playerInfo = callResult.value
    }
    if (playerInfo.value2) {
      gameWinners.push(player.id)
    }
  }
  game.winners = gameWinners
  game.withdrawAmountAllocated = true
  game.save()
}

export function handleWithdrawal(event: Withdrawal): void {
  let address = event.params.player
  let player = Player.load(address.toHex())
  player.withdrawn = true;
  player.playerReward = event.params.playerReward;
  player.playerCurveReward = event.params.playerCurveReward;
  player.additionalPlayerReward = event.params.playerIncentive;
  player.withdrawAmount = event.params.amount
  player.save()
}

export function handleEarlyWithdrawal(event: EarlyWithdrawal): void {
  let contract = Contract.bind(event.address);
  let currentSegment = BigInt.fromI32(0);
  let callResult = contract.try_getCurrentSegment()
  if (callResult.reverted) {
    log.info('getCurrentSegment call reverted', [])
  } else {
    currentSegment = callResult.value
  }
  let game = Game.load(event.address.toHex())
  let address = event.params.player
  let gameDropOuts = game.dropOuts
  let player = Player.load(address.toHex())
  let playerInfo: Contract__playersResult
  let playerCallResult = contract.try_players(event.params.player)
  if (playerCallResult.reverted) {
    log.info('players call reverted', [])
  } else {
    playerInfo = playerCallResult.value
  }

  gameDropOuts.push(player.id)
  game.dropOuts = gameDropOuts
  game.totalDropouts = BigInt.fromI32(gameDropOuts.length)
  let gamePlayers = game.players
  let playerIndex = gamePlayers.indexOf(player.id);
  gamePlayers.splice(playerIndex, 1);
  game.players = gamePlayers;
  game.totalGamePrincipal = event.params.totalGamePrincipal;
  let segmentCounter = game.segmentCounter;
  for (var i = 0; i < segmentCounter.length; i++) {
    if (i == playerInfo.value4.toI32()) {
      segmentCounter[i] = segmentCounter[i] - BigInt.fromI32(1);
    }
  }
  game.segmentCounter = segmentCounter;
  game.currentSegment = currentSegment;
  game.save();

  player.withdrawn = true;
  if (currentSegment == BigInt.fromI32(0)) {
    player.canRejoin = true;
  }
  player.mostRecentSegmentPaid = BigInt.fromI32(-1);
  player.withdrawAmount = event.params.amount
  player.save();
}