import { useState, useEffect, useRef } from 'react';
import Login from './features/Login/Login';
import Lobby from './features/Lobby/Lobby';
import Game from './features/Game/Game';
import './App.css';

function App() {
    console.log("app rerendered.")
    const [serverMessage, setServerMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("");
    const [currentScreen, setCurrentScreen] = useState("login");
    const webSocketRef = useRef(null); 

    useEffect(() => {
        setTimeout(() => {createConnection();}, 1000);
        return () => {
            if (webSocketRef.current) {
                webSocketRef.current.close();
                webSocketRef.current.removeEventListener("open", handleOpen);
                webSocketRef.current.removeEventListener("message", handleMessage);
                webSocketRef.current.removeEventListener("close", handleClose);
            }
        };
    }, []);

    function createConnection(){
        const currentUrl = window.location.hostname;
        const webSocketUrl = `ws://${currentUrl}:8765`;
        
        webSocketRef.current = new WebSocket(webSocketUrl);

        webSocketRef.current.addEventListener("open", (event) => {console.log("Connected!")});

        webSocketRef.current.addEventListener("message", (event) => {
            let messageData = JSON.parse(event.data);
            setServerMessage(messageData);
            
            if(messageData.messageType === "error"){
                console.log(messageData.payload);
                setErrorMessage(messageData.payload);
                setUsername("");
            }
            else if(messageData.messageType === "usernameCreated" || messageData.messageType === "usernameChange") {
                console.log("Username accepted/changed!");
                setErrorMessage("");
                showScreen("lobby");
            }
        });

        webSocketRef.current.addEventListener("close", (event) => {
            console.log('Websocket failed:', event);
            setTimeout(() => {createConnection();}, 1000);
        });

    }

    function showScreen(screenID) {
        setCurrentScreen(screenID);
    }

    function sendMessage(messageType, payload) {
        if (!webSocketRef.current || webSocketRef.current.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not connected.");
            return;
        }
    
        const outgoingMessage = JSON.stringify({ messageType, payload });
        webSocketRef.current.send(outgoingMessage);
    }

    return (
        <>
            {currentScreen === "login" && (
                <Login serverMessage={serverMessage} sendMessage={sendMessage} errorMessage={errorMessage} />
            )}
            {currentScreen === "lobby" && (
                <Lobby serverMessage={serverMessage} sendMessage={sendMessage} errorMessage={errorMessage} />
            )}
            {currentScreen === "game" && (
                <Game serverMessage={serverMessage} sendMessage={sendMessage} errorMessage={errorMessage} />
            )}
        </>
    );
}

export default App;