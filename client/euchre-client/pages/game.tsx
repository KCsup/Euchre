import {useState} from 'react'
import { Socket } from 'socket.io-client'
import Card from '../components/Card'
import styles from '../styles/Game.module.css'

type Player = {
    name: string
    hand: string[]
    socket: string
    host: boolean
    team: number
    dealer: boolean
    turn: boolean
    switching: boolean
    play: string
    tricks: number
}

type GameProps = {
    socket: Socket
}

const Game = ({socket}: GameProps) => {
    
    const [players, setPlayers] = useState<Player[]>([])
    const [hand, setHand] = useState<string[]>([])
    const [gameStarted, setGameStarted] = useState(false)
    const [topCard, setTopCard] = useState("")
    const [deciding, setDeciding] = useState(false)
    const [decidingSuit, setDecidingSuit] = useState(false)
    const [trump, setTrump] = useState("")
    const [followSuit, setFollowSuit] = useState("")
    const [foundWinner, setFoundWinner] = useState(false)
    const [turnWinner, setTurnWinner] = useState("")
    const [foundRoundWinner, setFoundRoundWinner] = useState(false)
    const [roundWinner, setRoundWinner] = useState("")
    const [scores, setScores] = useState(new Array(2).fill(0))

    const isSelf = (player: Player) => {
	return player.socket == socket.id
    }

    const getSelf = () => {
	for(const p of players)
	    if(isSelf(p)) return p

	return undefined
    }

    const opposites: {[key: string]: string} = {
	 "H": "D",
	 "D": "H",
	 "S": "C",
	 "C": "S"
     }
 
    socket.on("update", (res) => {
	setGameStarted(res.gameStarted)

	const newPlayers: Player[] = res.players
	setPlayers(newPlayers)

	for(let p of newPlayers)
	    if(isSelf(p)) setHand(p.hand)

	setTopCard(res.topCard)
	setDeciding(res.deciding)
	setDecidingSuit(res.decidingSuit)

	setTrump(res.trump)
	setFollowSuit(res.followSuit)

	setFoundWinner(res.foundWinner)
	setTurnWinner(res.turnWinner)

	setFoundRoundWinner(res.foundRoundWinner)
	setRoundWinner(res.roundWinner)

	setScores(res.scores)

	console.log(res)
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
		    <div className={styles.scoreboard}>
			<div>
			    <h2>Team Scores:</h2>
			    <h2>Team 1: {scores[0]}</h2>
			    <h2>Team 2: {scores[1]}</h2>
			</div>
			<div>
			    <h2>Tricks:</h2>
			    {players.map(p => {
				return <h3>{`${p.name}: ${p.tricks}`}</h3>
			    })}
			</div>
		    </div>

		    <h2>Team {getSelf()?.team! + 1}</h2>
		    {deciding ? (
			<><Card value={topCard} /></>
		    ) : null}

		    {getSelf()?.dealer ? (
			<>
			    <h1>You are the dealer.</h1>
			</>
		    ) : null}

		    {!deciding && !decidingSuit ? (
			<>
			    <h2>Trump: {trump}</h2>
			</>
		    ) : null}

		    {foundWinner ? (
			<>
			    <h1>Winner: {players.find(p => p.socket == turnWinner)?.name}</h1>
			    {getSelf()?.host ? (
				<button className={styles.button} onClick={() => {
				    socket.emit("nextTurn")
				}}>Next Turn</button>
			    ) : null}
			</>
		    ) : null}
			
		    {foundRoundWinner ? (
			<>
			    <h2>Turn Winner: {players.find(p => p.socket == turnWinner)?.name}</h2>
			    <h1>Round Winner: Team {parseInt(roundWinner) + 1}</h1>
			    {getSelf()?.host ? (
				<button className={styles.button} onClick={() => {
				    socket.emit("nextRound")
				}}>Next Round</button>
			    ) : null}
			</>
		    ) : null}


		    {/*
		      * I don't want to use CSS grid :)
		      */
		    }
		    <div className={styles.plays}>
			{players.map(p => {
			    return (
				<div>
				    <h3 className={styles.playName}>{p.name} {p.socket != socket.id && p.team == getSelf()?.team ? (
					"[Teammate]"
				    ) : ""}{p.socket == socket.id ? "(You)" : ""}</h3>
				    <div className={p.turn ? (p.play == "" ? styles.emptyTurn : "") : (p.play == "" ? styles.empty : "")}>
					{p.play != "" ? (
					    <Card value={p.play} />
					) : null}
				    </div>
				</div>
			    )
			})}
		    </div>

		    {getSelf()?.turn ? (
			<>
			    <h2>It's Your Turn</h2>
			    {deciding ? (
				<div className={styles.decision}>
				    <button className={styles.button} onClick={() => {
					socket.emit("decision", {
					    choice: "pick"
					})
				    }}>Pick Up</button>
				    <button className={styles.button} onClick={() => {
					socket.emit("decision", {
					    choice: "pass"
					})
				    }}>Pass</button>
				</div>
			    ) : null} 
			    
			    {decidingSuit ? (
				<>
				    <h2>Decide the trump...</h2>
				    <div className={styles.suitDecision}>
					<button className={styles.button} onClick={() => {
					    socket.emit("suitDecision", {
						choice: "S"
					    })
					}}>Spades</button>
					
					<button className={styles.button} onClick={() => {
					    socket.emit("suitDecision", {
						choice: "C"
					    })
					}}>Clubs</button>

					<button className={styles.button} onClick={() => {
					    socket.emit("suitDecision", {
						choice: "H"
					    })
					}}>Hearts</button>

					<button className={styles.button} onClick={() => {
					    socket.emit("suitDecision", {
						choice: "D"
					    })
					}}>Diamonds</button>

			    `		<button className={styles.button} onClick={() => {
					    socket.emit("suitDecision", {
						choice: "pass"
					    })
					}}>Pass</button>
				    </div>
				</>
			    ) : null}
			</>
		    ) : null}

		    {getSelf()?.switching ? (
			<>
			    <h2>Pick a card to switch.</h2>
			    <Card value={topCard} onClick={() => {}}/>
			</>
		    ) : null}

		    <ul className={styles.handDisplay}>
	    		{hand.map(c => {
			    return <Card value={c} onClick={() => {
				if(getSelf()?.switching)
				    socket.emit("switch", {
					card: c
				    })

				if(getSelf()?.turn) {
				    if(followSuit != "") {
					let hasSuit = false
					for(const card of hand)
					    if(card.charAt(0) == followSuit || (followSuit == trump && card == opposites[trump] + "J")) hasSuit = true

					console.log(hasSuit)

					if(hasSuit && (c.charAt(0) != followSuit && c != opposites[trump] + "J")) return
				    }

				    socket.emit("play", {
					play: c
				    })
				}
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

