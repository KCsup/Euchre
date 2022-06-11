import express = require('express')
import { Server } from 'socket.io'

const app = express()
const server = require('http').createServer(app)
const io = new Server(server, {
    cors: {
	origin: "*",
    }
})


const port = 6942

//app.get('/', (req, res) => {
//  res.sendFile(__dirname + '/index.html');
//})

io.on("connection", (socket) => {
    socket.on("disconnect", () => {
	console.log("Disconnected")
    })

    socket.on("event", (res) => {
	console.log(res)
	io.emit("amongus", "fuck you")
    })
})

server.listen(port, () => {
    console.log(`Server Listening on ${port}`)
})

