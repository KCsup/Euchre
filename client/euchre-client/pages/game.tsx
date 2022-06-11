import { io, Socket } from 'socket.io-client'

type GameProps = {
    socket: Socket
    name: string
}

const Game = ({socket, name}: GameProps) => {
    
    socket.emit("join", {
	name: name
    })

    return (
	<div>
	    <h1>Game Screen</h1> 
	</div>
    ) 
}

export default Game

