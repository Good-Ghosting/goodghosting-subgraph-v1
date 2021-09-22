import { BigInt, store } from "@graphprotocol/graph-ts"
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
} from "../generated/templates/Contract/Contract"

import { Contract as Pool } from "../generated/templates"

import {  PoolAdded } from "../generated/Registry/Registry"
import { Player, Game } from "../generated/schema"

export function handlePoolAdded(event: PoolAdded): void {
  let pool = event.params.contracts;
  let game = Game.load(pool.toHex())
  if (game === null) {
    Pool.create(pool)
    let contract = Contract.bind(pool);
    game = new Game(pool.toHex())
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
    game.currentSegment = contract.getCurrentSegment()
    game.totalGamePrincipal = contract.totalGamePrincipal()
  }
  game.save()
}

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

  let admin = '0x0fFfBe0ABfE89298376A2E3C04bC0AD22618A48e'
  let game = Game.load(admin)

  if (game == null) {
    Pool.create(event.address)
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
  let admin = '0x0fFfBe0ABfE89298376A2E3C04bC0AD22618A48e'
  let game = Game.load(admin)
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
  let admin = '0x0fFfBe0ABfE89298376A2E3C04bC0AD22618A48e'
  let game = Game.load(admin)
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