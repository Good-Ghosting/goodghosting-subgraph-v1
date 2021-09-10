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
  EarlyWithdrawal
} from "../generated/Contract/Contract"

import {
  Registry,
  RegistryInitialized,
  PoolAdded,
  PoolRemoved
} from "../generated/Registry/Registry"

import { Player, Game, GameRegistry } from "../generated/schema"

export function handleRegistryInitialized(event: RegistryInitialized): void {
  let gameRegistry = GameRegistry.load(event.address.toHex())
  if (gameRegistry === null) {
    gameRegistry = new GameRegistry(event.address.toHex())
  }
  let games = gameRegistry.games
  let pools = event.params.contracts;
  for (var i = 0; i < pools.length; i++) {
    let game = Game.load(pools[i].toHex())
    if (game === null) {
      let contract = Contract.bind(pools[i]);
      game = new Game(event.address.toHex())
      game.players = new Array<string>();
      game.totalGamePrincipal = BigInt.fromI32(0)
      game.totalGameInterest = BigInt.fromI32(0);
      game.rewards = BigInt.fromI32(0);
      game.additionalIncentives = BigInt.fromI32(0);
      game.winners = new Array<string>();
      game.dropOuts = new Array<string>();
      game.firstSegmentStart = contract.firstSegmentStart()
      game.segmentLength = contract.segmentLength()
      game.redeemed = false
      game.lastSegment = contract.lastSegment()
      game.withdrawAmountAllocated = false
    }
    games.push(game.id)
    game.save()
  }
  gameRegistry.games = games;
  gameRegistry.save()
}

export function handlePoolAdded(event: PoolAdded): void {

}

export function handlePoolRemoved(event: PoolRemoved): void {
  
}

export function handleDeposit(event: Deposit): void {
  let contract = Contract.bind(event.address);
  let address = event.params.player
  let player = Player.load(address.toHex())
  player.mostRecentSegmentPaid = event.params.segment
  player.amountPaid = player.amountPaid + event.params.amount

  let game = Game.load(event.address.toHex())
  game.totalGamePrincipal = contract.totalGamePrincipal()
  game.currentSegment = contract.getCurrentSegment()
  game.save()
  player.save()
}

export function handleFundsRedeemedFromExternalPool(event: FundsRedeemedFromExternalPool): void {
  let contract = Contract.bind(event.address);

  let game = Game.load(event.address.toHex())
  game.totalGamePrincipal = event.params.totalGamePrincipal
  game.totalGameInterest = event.params.totalGameInterest
  game.currentSegment = contract.getCurrentSegment()
  game.redeemed = true
  game.rewards = event.params.rewards;
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
  player.mostRecentSegmentPaid = contract.getCurrentSegment()
  player.amountPaid = event.params.amount
  player.withdrawAmount = BigInt.fromI32(0);
  player.playerReward = BigInt.fromI32(0);
  player.additionalPlayerReward = BigInt.fromI32(0);

  player.withdrawn = false;

  let game = Game.load(event.address.toHex())

  if (game == null) {
    game = new Game(event.address.toHex())
    game.players = new Array<string>();
    game.totalGamePrincipal = event.params.amount
    game.totalGameInterest = BigInt.fromI32(0);
    game.rewards = BigInt.fromI32(0);
    game.additionalIncentives = BigInt.fromI32(0);
    game.winners = new Array<string>();
    game.dropOuts = new Array<string>();
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
  }
  game.currentSegment = contract.getCurrentSegment()
  game.totalGamePrincipal = contract.totalGamePrincipal()
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
  let game = Game.load(event.address.toHex())
  let gameWinners = game.winners
  let winners = event.params.winners
  for (var i = 0; i < winners.length; i++) {
    let player = Player.load(winners[i].toHex())
    gameWinners.push(player.id)
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
  player.additionalPlayerReward = event.params.playerIncentive;
  player.withdrawAmount = event.params.amount
  player.save()
}

export function handleEarlyWithdrawal(event: EarlyWithdrawal): void {
  let contract = Contract.bind(event.address);
  let currentSegment = contract.getCurrentSegment()
  let game = Game.load(event.address.toHex())
  let address = event.params.player
  let gameDropOuts = game.dropOuts
  let player = Player.load(address.toHex())
  gameDropOuts.push(player.id)
  game.dropOuts = gameDropOuts
  let gamePlayers = game.players
  let playerIndex = gamePlayers.indexOf(player.id);
  gamePlayers.splice(playerIndex, 1);
  game.players = gamePlayers;
  game.totalGamePrincipal = event.params.totalGamePrincipal;
  game.save();
  player.withdrawn = true;
  if (currentSegment == BigInt.fromI32(0)) {
    player.canRejoin = true;
  }
  player.mostRecentSegmentPaid = BigInt.fromI32(-1);
  player.withdrawAmount = event.params.amount
  player.save();
}
