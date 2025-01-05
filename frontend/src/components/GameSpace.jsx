import { useState } from 'react'

function GameSpace({webSocket}){
    const [incomingMessage, setIncomingMessage] = useState("");
    const [outgoingMessage, setOutgoingMessage] = useState("");
    console.log("GameSpace rerendered.")

    function sendMessage(){
        webSocket.send(outgoingMessage);
    }

    webSocket.addEventListener("message", (event) => {
        setIncomingMessage(event.data); // The received message
    });    

    const handleInputChange = (event) => {
        const newValue = event.target.value; // Get the current input value
        setOutgoingMessage(newValue); // Update the state
    };

    return (
        <>
        <form>
            <input type='text' onChange={handleInputChange}></input>
        </form>
        <button onClick={sendMessage}>Send</button>
        <p>{"Last message: " + incomingMessage}</p>
        </>
    )
}
  
export default GameSpace