import React, { useState, useEffect } from 'react';
import './Lobby.css';

function Lobby({ serverMessage, sendMessage, errorMessage, showScreen}) {
    const [playerList, setPlayerList] = useState([]);

    useEffect(() => {
        console.log(serverMessage)
        let messageType = serverMessage.messageType
        let gameStarted = serverMessage.started
        switch(messageType){
            case "gameState":
                if (gameStarted) showScreen('game');
                setPlayerList(serverMessage.players)
        }
        
    }, [serverMessage]); // Re-run effect when webSocketRef changes

    const handleStartGame = (event) => {
        sendMessage("startGame","");
    };

    return (
        <div>
            <h1 className="title">cum lobby</h1>
            <p>Wait for fellow cum brains, then click 'Start Game'.</p>
            <p className='error'>{errorMessage}</p>
            <h3>Players:</h3>
            <ul>
                {playerList.map((player, index) => (
                    <li className='player-list-item' key={index}>{player.username}</li>
                ))}
            </ul>
            <button onClick={handleStartGame}>Start Game</button>
        </div>
    );
}

export default Lobby;
