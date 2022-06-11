import net = require('net')

const port = 6942
const address = "localhost"

const client = new net.Socket()

client.on("data", (data) => {
    console.log(data.toString())
})

client.on("close", () => {
    console.log("Connection Lost")
})

client.connect({"port": port, "host": address}, () => {
    client.write(JSON.stringify({
	"eventType": "join",
	"data": {
	    "name": "Gamer"
	}
    }))


})

