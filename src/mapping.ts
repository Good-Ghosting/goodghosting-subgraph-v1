import { NewGravatar, UpdatedGravatar } from '../generated/Gravity/Gravity'
import { Player, Game } from '../generated/schema'



export function handleJoinGame(event: JoinedGame): void {
    let contract = GoodGhosting.bind(event.address);
    let address = event.params.player
    let player = new Player(address.toHex())
    player.address = address
    player.mostRecentSegmentPaid = contract.getCurrentSegment()
    player.amountPaid = event.params.amount
    player.withdrawAmount = BigInt(0)

    let admin = contract.admin()
    let game = Game.load(admin.toHex())

    if (game == null) {
      game = new Game(admin.toHex())
      game.players = new Array<string>();
      game.totalGamePrincipal = event.params.amount
      game.totalGameInterest = BigInt(0)
      game.winners = new Array<string>();
      game.redeemed = false
      game.withdrawAmountAllocated = false
    }
    game.totalGamePrincipal = game.totalGamePrincipal.add(event.params.amount)
    let players = game.players
    players.push(player)
    game.players = player
   
    game.save()
    player.save()
}

export function handleDeposit(event: Deposit): void {
    let contract = GoodGhosting.bind(event.address);
    let address = event.params.player
    let player = Player.load(address.toHex())
    player.mostRecentSegmentPaid = event.params.segment
    player.amountPaid = player.amountPaid.add(event.params.amount)

    let admin = contract.admin()
    let game = Game.load(admin.toHex())
    game.totalGamePrincipal = game.totalGamePrincipal.add(event.params.amount)
    game.save()
    player.save()
}





export function handleFundsRedeemedFromExternalPool(event: FundsRedeemedFromExternalPool): void {
    let contract = GoodGhosting.bind(event.address);
    
    let admin = contract.admin()
    let game = Game.load(admin.toHex())
    game.totalGamePrincipal = event.params.totalGamePrincipal
    game.totalGameInterest = event.params.totalGameInterest
    game.redeemed = true
    game.save()
}




export function handleWinnersAnnouncement(event: WinnersAnnouncement): void {
    let contract = GoodGhosting.bind(event.address);
    let admin = contract.admin()
    let game = Game.load(admin.toHex())
    let gameWinners = game.winners
    let winners = event.param.winners
    for(var i = 0; i < winners.length; i ++) {
      let player = Player.load(winners[i].toHex())
      gameWinners.push(player)
    }    
    game.winners = gameWinners
    game.withdrawAmountAllocated = true
    game.save()
}



export function handleWithdrawal(event: Withdrawal): void {
    let contract = GoodGhosting.bind(event.address);
    let address = event.params.player
    let player = new Player(address.toHex())
    
    player.withdrawAmount = event.params.amount

  
    player.save()
}
