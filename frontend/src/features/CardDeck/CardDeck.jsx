import {useState} from 'react'
import './CardDeck.css'
import Card from './Card.jsx'

function CardDeck(){
    return(
        <>
        <div class='deck'>
            <Card/>
            <Card/>
            <Card/>
            <Card/>
        </div>
        </>
    )
}

export default CardDeck