import {useState} from 'react'
import './CardDeck.css'
import Card from './Card.jsx'

function CardDeck(){
    return(
        <>
        <div className='deck'>
            <Card/>
            <Card/>
            <Card/>
            <Card/>
        </div>
        </>
    )
}

export default CardDeck