import express = require('express')
import { Server } from 'socket.io'

class Player {
    name: string
    hand: string[]

    constructor(name: string) {
	this.name = name

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

let players: Player[] = []

//app.get('/', (req, res) => {
//  res.sendFile(__dirname + '/index.html');
//})

io.on("connection", (socket) => {
    console.log("New Connection")

    socket.on("disconnect", () => {
	console.log("Disconnected")
    })

    socket.on("join", (res) => {
	players.push(new Player(res.name))
	console.log(`Player ${res.name} Joined!`)
	console.log(players)
    })

    socket.on("event", (res) => {
	console.log(res)
	io.emit("amongus", "fuck you")
    })
})

server.listen(port, () => {
    console.log(`Server Listening on ${port}`)
})

