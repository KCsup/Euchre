import net = require('net')

class Player {
    name: string
    hand: string[]
    socket: number

    constructor(name: string, socket: number) {
	this.name = name
	this.socket = socket

	this.hand = []
    }
}

const port = 6942
const server = net.createServer()

const isJson = (str: string) => {
    try {
	JSON.parse(str)
	return true
    } catch(e) {
	return false
    }
}

let clients: net.Socket[] = []

let turnNumber = 0
let players: Player[] = []

server.on("connection", (socket) => {
    clients.push(socket)

    console.log(`New Connection from ${socket.remoteAddress}`)
    
    socket.on("data", (data) => {
	if(!isJson(data.toString())) return	
	
	const json = JSON.parse(data.toString())
	if(json["data"] == undefined) return

	switch(json["eventType"]) {
	    case "join":
		/* Join Data:
		 * "name": string
		 */

		players.push(new Player(json["data"]["name"], clients.indexOf(socket)))
		
		let out = "Players:"

		for(const p of players)
		    out += `\nName: ${p.name}\n`
		socket.write(out)
		break
	    case "list":
		socket.write(players.toString())
	    default:
		break
	}
    })

    socket.on("close", () => {
	const i = clients.indexOf(socket)
	clients.splice(i, 1)
	
	console.log(`${socket.remoteAddress} Disconnected`)
    })
})

server.listen(port, () => {
    console.log(`Server Started on ${port}`)
})

