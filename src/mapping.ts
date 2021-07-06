import { BigInt, Address } from "@graphprotocol/graph-ts"
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
  EarlyWithdrawal,
  FundsDepositedIntoExternalPool
} from "../generated/Contract/Contract"
import { Player, Game } from "../generated/schema"

export function handleDeposit(event: Deposit): void {
  let contract = Contract.bind(event.address);
  let address = event.params.player
  let player = Player.load(address.toHex())
  player.mostRecentSegmentPaid = event.params.segment
  player.amountPaid = player.amountPaid + event.params.amount

  let admin = '0x0fFfBe0ABfE89298376A2E3C04bC0AD22618A48e'
  let game = Game.load(admin)
  game.totalGamePrincipal = contract.totalGamePrincipal()
  game.currentSegment = contract.getCurrentSegment()
  let waitingPlayers = game.waiting;
  let ghostedPlayers = game.ghosted;
  
  // getting players who haven't made the deposit in current segment
  for (let i = 0; i < game.players.length; i++) {
    let players = game.players
    let player = players[i]
    let playerEntity = Player.load(player)
    if (playerEntity.mostRecentSegmentPaid === (contract.getCurrentSegment() - BigInt.fromI32(1))) {
    waitingPlayers.push(playerEntity.id)
    game.waiting = waitingPlayers
    }
  }
 // getting ghosted players
  for (var j = 0; j < game.players.length; j++) {
    let players = game.players
    let player = players[j]
    let playerEntity = Player.load(player)
    if (playerEntity.mostRecentSegmentPaid <= (contract.getCurrentSegment() - BigInt.fromI32(2))) {
      ghostedPlayers.push(playerEntity.id)
      game.ghosted = ghostedPlayers
    }
  }
  game.save()
  player.save()
}

export function handleFundsRedeemedFromExternalPool(event: FundsRedeemedFromExternalPool): void {
  let contract = Contract.bind(event.address);

  let admin = '0x0fFfBe0ABfE89298376A2E3C04bC0AD22618A48e'
  let game = Game.load(admin)
  game.totalGamePrincipal = event.params.totalGamePrincipal
  game.totalGameInterest = event.params.totalGameInterest
  game.currentSegment = contract.getCurrentSegment()
  game.redeemed = true
  game.rewards = event.params.rewards;
  game.save()
}

export function handleJoinedGame(event: JoinedGame): void {
  let contract = Contract.bind(event.address);
  let address = event.params.player
  let player = Player.load(address.toString())
  if (player == null) {
    player = new Player(address.toString());
  }
  player.address = address
  player.mostRecentSegmentPaid = contract.getCurrentSegment()
  player.amountPaid = event.params.amount
  player.withdrawAmount = BigInt.fromI32(0);
  player.playerReward = BigInt.fromI32(0);
  player.withdrawn = false;
  let admin = '0x0fFfBe0ABfE89298376A2E3C04bC0AD22618A48e'
  let game = Game.load(admin)

  if (game == null) {
    game = new Game(admin)
    game.players = new Array<string>();
    game.totalGamePrincipal = event.params.amount
    game.externalPoolLiquidity = BigInt.fromI32(0);
    game.totalGameInterest = BigInt.fromI32(0);
    game.rewards = BigInt.fromI32(0);
    game.winners = new Array<string>();
    game.dropOuts = new Array<string>();
    game.waiting = new Array<string>();
    game.ghosted = new Array<string>();
    game.firstSegmentStart = contract.firstSegmentStart()
    game.segmentLength = contract.segmentLength()
    game.redeemed = false
    game.lastSegment = contract.lastSegment()
    game.withdrawAmountAllocated = false
  }
  game.currentSegment = contract.getCurrentSegment()
  game.totalGamePrincipal = contract.totalGamePrincipal()
  let players = game.players
  players.push(player.id)
  game.players = players

  game.save()
  player.save()
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void { }

export function handlePaused(event: Paused): void { }

export function handleUnpaused(event: Unpaused): void { }

export function handleWinnersAnnouncement(event: WinnersAnnouncement): void {
  let admin = '0x0fFfBe0ABfE89298376A2E3C04bC0AD22618A48e'
  let game = Game.load(admin)
  let gameWinners = game.winners
  let winners = event.params.winners
  for (var i = 0; i < winners.length; i++) {
    let player = Player.load(winners[i].toString())
    gameWinners.push(player.id)
  }
  game.winners = gameWinners
  game.withdrawAmountAllocated = true
  game.save()
}

export function handleWithdrawal(event: Withdrawal): void {
  let address = event.params.player
  let player = Player.load(address.toString())
  player.withdrawn = true;
  player.playerReward = event.params.playerReward;
  player.withdrawAmount = event.params.amount
  player.save()
}

export function handleEarlyWithdrawal(event: EarlyWithdrawal): void {
  let admin = '0x0fFfBe0ABfE89298376A2E3C04bC0AD22618A48e'
  let game = Game.load(admin)
  let address = event.params.player
  let gameDropOuts = game.dropOuts
  let player = Player.load(address.toString())
  gameDropOuts.push(player.id)
  game.dropOuts = gameDropOuts
  let gamePlayers = game.players
  let playerIndex = gamePlayers.indexOf(player.id);
  gamePlayers.splice(playerIndex, 1);
  game.players = gamePlayers;
  game.totalGamePrincipal = event.params.totalGamePrincipal;
  game.save();
  player.withdrawn = true;
  player.mostRecentSegmentPaid = BigInt.fromI32(-1);
  player.withdrawAmount = event.params.amount
  player.save();
}

export function handleFundsDepositedIntoExternalPool(event: FundsDepositedIntoExternalPool): void {
  let admin = '0x0fFfBe0ABfE89298376A2E3C04bC0AD22618A48e'
  let game = Game.load(admin)
  game.externalPoolLiquidity = game.externalPoolLiquidity + event.params.amount;
  game.save()
}
