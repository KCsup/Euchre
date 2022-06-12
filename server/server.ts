import express = require('express')
import { Server } from 'socket.io'

class Player {
    name: string
    hand: string[]
    socket: string
    host: boolean

    constructor(name: string, socket: string) {
	this.name = name
	this.socket = socket

	this.hand = []
	this.host = false
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
let players: Player[] = []
let deck: string[] = newDeck()

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
}

const update = () => {
    io.emit("update", {
	players: players,
	gameStarted: gameStarted,
    })

}

io.on("connect", (socket) => {
    console.log("New Connection")

    socket.on("disconnect", () => {
	console.log("Disconnected")
	for(let i = 0; i < players.length; i++)
	    if(players[i].socket == socket.id) {
		const player = players[i]
		players.splice(i, 1)

		if(player.host) players[i].host = true
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
	
	if(players.length == 4) {
	    deal()
	}

	console.log(`${res.name} Joined!`)
	console.log(players)
	
	update()
    })

    socket.on("button", (res) => {
	console.log("button")
    })
})

server.listen(port, () => {
    console.log(`Server Listening on ${port}`)
})

