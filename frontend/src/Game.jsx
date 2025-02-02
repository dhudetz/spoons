import React, { useState, useEffect } from 'react';
import './Game.css';

function Game({ serverMessage, sendMessage, errorMessage, showScreen}) {

    useEffect(() => {
        console.log(serverMessage)
        if(serverMessage.messageType == "gameState")
            console.log(serverMessage)
    }, [serverMessage]); // Re-run effect when webSocketRef changes

    return (
        <div>
            <h1 className="title">GAME SCREEN</h1>
            <p>The game goes here.</p>
        </div>
    );
}

export default Game;
