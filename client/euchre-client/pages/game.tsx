import {useState} from 'react'
import { Socket } from 'socket.io-client'
import styles from '../styles/Game.module.css'

type Player = {
    name: string
    hand: string[]
    socket: string
    host: boolean
}

type GameProps = {
    socket: Socket
}

const Game = ({socket}: GameProps) => {
    
    const [players, setPlayers] = useState<Player[]>([])
    const [hand, setHand] = useState<string[]>([])

    const isSelf = (player: Player) => {
	return player.socket == socket.id
    }
 
    socket.on("update", (res) => {
	const newPlayers: Player[] = res.players
	setPlayers(newPlayers)

	for(let p of newPlayers)
	    if(isSelf(p)) setHand(p.hand)
    })

    socket.on("full", () => {
	alert("The game is currently full.")
	window.close()
    })

    return (
	<div className={styles.container}>
	    <h1>Waiting for more players...</h1>
	    <ul className={styles.players}>
		{players.map((p) => {
		    let playerString = p.name
		    if(isSelf(p)) playerString += " (That's You!)"
		    if(p.host) playerString += " [HOST]"
		    return <h2>{playerString}</h2>
		})}
	    </ul>
	    <ul>
		{hand.map(c => {
		    return <h2>{c}</h2>
		})}
	    </ul>
	    <button onClick={() => {
		socket.emit("button")
	    }}>Buttom</button>
	</div>
    ) 
}

export default Game

