import {useState} from 'react'
import { Socket } from 'socket.io-client'

type GameProps = {
    socket: Socket
    name: string
}

const Game = ({socket, name}: GameProps) => {
    
    const [deck, setDeck] = useState<string[]>([])
    const [players, setPlayers] = useState([])
 
    socket.on("update", (res) => {
	setDeck(res.deck)
	setPlayers(res.players)
    })

    socket.on("full", () => {
	alert("The game is currently full.")
	window.close()
    })

    return (
	<div>
	    <h1>Game Screen</h1>
	    <ul>
		{players.map((p) => {
		    return <h1>{p["name"]}</h1>
		})}
	    </ul>
	    <button onClick={() => {
		socket.emit("button")
	    }}>Buttom</button>
	</div>
    ) 
}

export default Game

