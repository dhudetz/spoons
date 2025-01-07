import React, { useState, useEffect } from 'react';
import './GameScreen.css';

function GameScreen({ serverMessage }) {
    const [playerList, setPlayerList] = useState([]);

    useEffect(() => {
        console.log(serverMessage)
        if(serverMessage.messageType == "gameState")
            setPlayerList(serverMessage.players)
    }, [serverMessage]); // Re-run effect when webSocketRef changes

    return (
        <div>
            <h1 className="title">cum lobby</h1>
            <p>Wait for fellow cum brains, then click 'Start Game'.</p>
            <h3>Players:</h3>
            <ul>
                {playerList.map((player, index) => (
                    <li className='player-list-item' key={index}>{player}</li>
                ))}
            </ul>
            <button>Start Game</button>
        </div>
    );
}

export default GameScreen;
