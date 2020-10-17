import { BigInt } from "@graphprotocol/graph-ts"
import {
  Contract,
  Deposit,
  FundsRedeemedFromExternalPool,
  JoinedGame,
  OwnershipTransferred,
  Paused,
  Unpaused,
  WinnersAnnouncement,
  Withdrawal
} from "../generated/Contract/Contract"
import {  Player, Game } from "../generated/schema"

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
    game.save()
}

export function handleJoinedGame(event: JoinedGame): void {
  let contract = Contract.bind(event.address);
    let address = event.params.player
    let player = new Player(address.toHex())
    player.address = address
    player.mostRecentSegmentPaid = contract.getCurrentSegment()
    player.amountPaid = event.params.amount
    player.withdrawAmount = BigInt.fromI32(0);

    let admin = '0x0fFfBe0ABfE89298376A2E3C04bC0AD22618A48e'
    let game = Game.load(admin)

    if (game == null) {
      game = new Game(admin)
      game.players = new Array<string>();
      game.totalGamePrincipal = event.params.amount
      game.totalGameInterest = BigInt.fromI32(0);
      game.winners = new Array<string>();
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

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handlePaused(event: Paused): void {}

export function handleUnpaused(event: Unpaused): void {}

export function handleWinnersAnnouncement(event: WinnersAnnouncement): void {
    let admin = '0x0fFfBe0ABfE89298376A2E3C04bC0AD22618A48e'
    let game = Game.load(admin)
    let gameWinners = game.winners
    let winners = event.params.winners
    for(var i = 0; i < winners.length; i ++) {
      let player = Player.load(winners[i].toHex())
      gameWinners.push(player.id)
    }    
    game.winners = gameWinners
    game.withdrawAmountAllocated = true
    game.save()
}

export function handleWithdrawal(event: Withdrawal): void {
 let contract = Contract.bind(event.address);
    let address = event.params.player
    let player = new Player(address.toHex())
    
    player.withdrawAmount = event.params.amount
    player.save()
}
