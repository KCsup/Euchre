import Image from "next/image"
import styles from '../styles/Card.module.css'

type CardProps = {
    value: string
    onClick?: () => void
}

const Card = ({value, onClick = () => {}}: CardProps) => {
    return (
	<div className={styles.container}>
	    <a onClick={onClick}><Image src={require(`../public/cards/${value}.png`)} /></a>
	</div>
    )
}

export default Card

