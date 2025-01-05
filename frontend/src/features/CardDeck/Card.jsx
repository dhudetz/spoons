import {useState} from 'react'

function Card(){
    const [cardValue, setCardValue] = useState("")

    return(
        <>
        <div class="card">
            <p>A♠</p>
        </div>
        </>
    )
}

export default Card