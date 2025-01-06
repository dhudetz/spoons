import {useState} from 'react'

function Card(){
    const [cardValue, setCardValue] = useState("")

    return(
        <>
        <div className="card">
            <p>A♠</p>
        </div>
        </>
    )
}

export default Card