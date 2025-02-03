import React, { useState, useEffect } from 'react';
import './Login.css';

function Login({ serverMessage, sendMessage, setErrorMessage, errorMessage, showScreen}) {
    const [playerList, setPlayerList] = useState([]);
    const [username, setUsername] = useState("");

    useEffect(() => {
        if(serverMessage.messageType == "gameState")
            setPlayerList(serverMessage.players)
    }, [serverMessage]);

    function sendUsername(){
        sendMessage("username", username)
    }

    const handleEndGame = (event) => { // For debugging
        sendMessage("endGame", "")
    };

    const handleUsernameChange = (event) => setUsername(event.target.value);

    return (
        <div id="login-screen">
            <h1 className="extreme-title">cum brains spoons</h1>
            <form onSubmit={(e) => e.preventDefault()}>
                <h2>choose your username:</h2>
                <input 
                    type="text"
                    value={username}
                    onChange={handleUsernameChange} 
                    onKeyDown={(e) => e.key === "Enter" && sendUsername()} 
                />
            </form>
            <p className='error'>{errorMessage}</p>
            <button onClick={sendUsername}>Enter Game</button>
            <button onClick={handleEndGame}>Stop Game</button>
        </div>
    );
}

export default Login;
