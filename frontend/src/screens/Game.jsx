import React, { useState, useEffect } from 'react';
import './Game.css';
import GameEnvironment from '../features/GameEnvironment';

function Game({ serverMessage, sendMessage, setErrorMessage, errorMessage, showScreen }) {
    const [gameState, setGameState] = useState("")

    useEffect(() => {
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
            setGameState(gameState)
    };

    const handleEndGame = (event) => {
        sendMessage("endGame", "")
    };

    return (
        <div>
            <button onClick={handleEndGame}>End Game</button>
            <GameEnvironment 
                gameState={gameState}
                sendMessage={sendMessage}
                errorMessage={errorMessage}
                showScreen={showScreen}
            />
        </div>
    );
}

export default Game;
