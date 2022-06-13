import {useState} from 'react'
import { Socket } from 'socket.io-client'
import Card from '../components/Card'
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
    const [gameStarted, setGameStarted] = useState(false)

    const isSelf = (player: Player) => {
	return player.socket == socket.id
    }

    const getSelf = () => {
	for(const p of players)
	    if(isSelf(p)) return p

	return undefined
    }
 
    socket.on("update", (res) => {
	setGameStarted(res.gameStarted)

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
	    { !gameStarted ? (
		<>
		    <h1>{players.length == 4 ? "Game Full!" : "Waiting for more players..."} {players.length}/4</h1>
	    	    <ul className={styles.players}>
	    		{players.map((p) => {
	    		    let playerString = p.name
	    		    if(isSelf(p)) playerString += " (That's You!)"
	    		    if(p.host) playerString += " [HOST]"
			    return <li key={p.name}><h2>{playerString}</h2></li>
	    		})}
	    	    </ul>

		    {getSelf()?.host && players.length == 4 ? (
			<button className={styles.button} onClick={() => {
			    socket.emit("startGame")
			}}>Start Game</button>
		    ) : null}
	    	</>
	    ) : (
		<>
		    <ul className={styles.handDisplay}>
	    		{hand.map(c => {
			    return <Card value={c} onClick={() => {
				console.log(c)
			    }} />
	    		})}
	    	    </ul>
		</>
	    )}
	</div>
    ) 
}

export default Game

