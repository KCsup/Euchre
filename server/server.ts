import express = require('express')
import { Server, Socket } from 'socket.io'

class Player {
    name: string
    hand: string[]
    socket: string

    constructor(name: string, socket: string) {
	this.name = name
	this.socket = socket

	this.hand = []
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

let players: Player[] = []
let deck: string[] = newDeck()

const update = () => {
    io.emit("update", {
	players: players,
	deck: deck,
    })

}

io.on("connect", (socket) => {
    console.log("New Connection")

    socket.on("disconnect", () => {
	console.log("Disconnected")
	for(let i = 0; i < players.length; i++)
	    if(players[i].socket == socket.id) players.splice(i, 1)
	update()
    })

    socket.on("join", (res) => {
	if(players.length == 4) {
	    socket.emit("full")
	    return
	}

	players.push(new Player(res.name, socket.id))
	console.log(`${res.name} Joined!`)
	console.log(players)
	
	update()

	if(players.length == 4) {

	}
    })

    socket.on("button", (res) => {
	console.log("button")
    })
})

server.listen(port, () => {
    console.log(`Server Listening on ${port}`)
})

