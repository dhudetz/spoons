import React, { useState, useEffect } from 'react';
import './Game.css';
import ThreeScene from '../features/ThreeScene';

function Game({ serverMessage, sendMessage, setErrorMessage, errorMessage, showScreen }) {

    useEffect(() => {
        console.log(serverMessage);
        let messageType = serverMessage.messageType
        switch(messageType) {
            case "gameState":
                handleNewGameState(serverMessage)
        }
    }, [serverMessage]); // Re-run effect when serverMessage changes

    const handleNewGameState = (gameState) => {
        if(!gameState.started) // Game was ended
            showScreen("lobby")
        else
            console.log(gameState)
    };

    const handleEndGame = (event) => {
        sendMessage("endGame", "")
    };

    return (
        <div>
            <button onClick={handleEndGame}>End Game</button>
            <ThreeScene />
        </div>
    );
}

export default Game;
