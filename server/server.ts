import express = require('express')
import { Server } from 'socket.io'

class Player {
    name: string
    hand: string[]
    socket: string
    host: boolean
    team: number
    dealer: boolean
    turn: boolean
    switching: boolean
    play: string

    constructor(name: string, socket: string) {
	this.name = name
	this.socket = socket

	this.hand = []
	this.host = false
	this.team = 0

	this.dealer = false
	this.turn = false
	this.switching = false
	this.play = ""
    }
}

const app = express()
const server = require('http').createServer(app)
const io = new Server(server, {
    cors: {
	origin: "*",
    }
})

const port = 6942

// Game Specific

const newDeck = () => {
    let d: string[] = []
    
    for(let suit of ["S", "C", "H", "D"])
	for(let card of ["9", "10", "A", "J", "Q", "K"])
	    d.push(suit + card)

    for(let c of d) {
	const newSlot = Math.floor(Math.random() * d.length)
	const oldSlot = d.indexOf(c)

	const newC = d[newSlot]

	d[newSlot] = c
	d[oldSlot] = newC
    }

    return d
}

let gameStarted = false
let deciding = false
let decidingSuit = false
let players: Player[] = []
let deck: string[] = newDeck()
let topCard = ""
let trump = ""

const getPlayer = (socketId: string) => {
    for(let p of players)
	if(p.socket == socketId) return p

    return undefined
}

const deal = () => {
    if(deck.length == 0) return

    for(let p of players)
	for(let i = 0; i < 5; i++) {
	    p.hand.push(deck[i])
	    deck.splice(i, 1)
	}

    topCard = deck[0]
    
}

const update = () => {
    io.emit("update", {
	players: players,
	gameStarted: gameStarted,
	topCard: topCard,
	deciding: deciding,
	decidingSuit: decidingSuit,
	trump: trump,
    })

}

io.on("connect", (socket) => {
    console.log("New Connection")

    socket.on("disconnect", () => {
	console.log("Disconnected")
	const player = getPlayer(socket.id)

	if(player != undefined) {
	    const i = players.indexOf(player)
	    players.splice(i, 1)
	    
	    if(player.host && players.length > 0) players[i].host = true
	}
	
	update()
    })

    socket.on("join", (res) => {
	if(players.length == 4) {
	    socket.emit("full")
	    return
	}
	
	let player = new Player(res.name, socket.id)
	if(players.length == 0) player.host = true
	players.push(player)
	
	console.log(`${res.name} Joined!`)
	// console.log(players)
	
	update()
    })

    socket.on("startGame", () => {
	if(players.length == 4) {
	    let team0Count = 0
	    let team1Count = 0

	    for(let p of players)
		if(team0Count == 2) p.team = 1
		else if(team1Count == 2) p.team = 0
		else {
		    const team = Math.floor(Math.random() * 2)
		    p.team = team

		    if(team == 0) team0Count++
		    else if(team == 1) team1Count++
		}

	    gameStarted = true
	    deal()
	    deciding = true

	    players.sort((a, b) => {
		return a.team - b.team
	    })
	    
	    // Sorts players in alternating team order
	    let b: Player[] = []
    
	    let l = players.length - 1
	    let L = l / 2
	    for(let i = 0; i < L; i++) {
		b.push(players[l - i], players[i])
		if(players.length % 2) b.push(players[i])
	    }

	    // console.log(players)
	    console.log(b)

	    players = b

	    players[0].dealer = true
	    players[1].turn = true

	    update()
	}
    })

    socket.on("decision", (res) => {
	const choice = res.choice
	const player = getPlayer(socket.id)
	
	if(player == undefined) return

	const i = players.indexOf(player)
	players[i].turn = false
	
	if(choice == "pass") {
	    if(players[i].dealer) {
		deciding = false
		decidingSuit = true
	    }

	    let nextI = i + 1
	    if(nextI == players.length)
		nextI = 0

	    players[nextI].turn = true
	}
	else if(choice == "pick") {
	    deciding = false

	    trump = topCard.charAt(0)

	    

	    players[i].switching = true
	}

	update()
    })

    socket.on("switch", (res) => {
	const player = getPlayer(socket.id)

	if(player == undefined) return

	const card = res.card
	const i = players.indexOf(player)

	players[i].hand.splice(players[i].hand.indexOf(card), 1)
	players[i].hand.push(topCard)
	players[i].switching = false
	
	const dealerI = players.findIndex(p => p.dealer)
	if(dealerI == -1) console.log("No Dealer, something is wrong...")

	let startI = dealerI + 1
	if(startI == players.length) startI = 0

	players[startI].turn = true

	update()
    })

    socket.on("suitDecision", (res) => {
	const choice = res.choice
	const player = getPlayer(socket.id)

	if(player == undefined) return

	const i = players.indexOf(player)
	players[i].turn = false

	switch(choice) {
	    case "pass":
		let nextI = i + 1
		if(nextI == players.length) nextI = 0

		players[nextI].turn = true
		break
	    default:
		trump = choice
		decidingSuit = false

		const dealerI = players.findIndex(p => p.dealer)
		if(dealerI == -1) console.log("No Dealer, something is wrong...")
		
		let startI = dealerI + 1
		if(startI == players.length) startI = 0

		players[startI].turn = true
		break
	}

	update()
    })

    socket.on("play", (res) => {
	const player = getPlayer(socket.id)

	if(player == undefined) return
    })

})

server.listen(port, () => {
    console.log(`Server Listening on ${port}`)
})

