import React, { useState, useEffect } from 'react';
import './Game.css';
import Lobby from './Lobby';

function Game({ serverMessage, sendMessage, errorMessage, showScreen}) {

    useEffect(() => {
        console.log(serverMessage)
        let messageType = serverMessage.messageType
        switch(messageType){
            case "gameState":
                handleNewGameState(serverMessage)
        }
    }, [serverMessage]); // Re-run effect when webSocketRef changes

    function handleNewGameState(gameState){
        if(!gameState.started) // Game was ended
            showScreen("lobby")
        else
            console.log(gameState)
    }

    const handleEndGame = (event) => {
        sendMessage("endGame","");
    };

    return (
        <div>
            <h1 className="title">GAME SCREEN</h1>
            <p>The game goes here.</p>
            <button onClick={handleEndGame}>End Game</button>
        </div>
    );
}

export default Game;
