import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Game from './game'
import {useState} from 'react'
import {io, Socket} from 'socket.io-client'

const Home: NextPage = () => {
    
    const [game, setGame] = useState(false)
    const [socket, setSocket] = useState<Socket>()
    
    return !game || socket == undefined ? (
	<div className={styles.container}>
	    <Head>
		<title>Euchre</title>
		<link rel="icon" href="/favicon.ico" />
	    </Head>
	
	    <h1 className={styles.title}>Bad Euchre</h1>
	    <button className={styles.button} onClick={() => {
		let name = window.prompt("Name: ")
		while(typeof name != 'string' || name.length < 1)
		    name = window.prompt("Name: ")
		
		const s = io("http://localhost:6942")
		
		console.log(s.disconnected)
		setSocket(s)

		alert(name)
		setGame(true)

		s.emit("join", {
		    name: name
		})
	    }}>Join</button>
	</div>
    ) : (
	<Game socket={socket} />
    )
}

export default Home

