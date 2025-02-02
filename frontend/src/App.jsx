import { useState, useEffect, useRef } from 'react';
import Login from './Login';
import Lobby from './Lobby';
import Game from './Game';
import './App.css';

function App() {
    console.log("app rerendered.")
    const [connectionId, setConnectionId] = useState(null);
    const [serverMessage, setServerMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("");
    const [currentScreen, setCurrentScreen] = useState("login");
    const webSocketRef = useRef(null); 

    useEffect(() => {
        setTimeout(() => {createConnection();}, 1);
        
        // On exit
        return () => {
            if (webSocketRef.current) {
                webSocketRef.current.close();
                webSocketRef.current.removeEventListener("open");
                webSocketRef.current.removeEventListener("message");
                webSocketRef.current.removeEventListener("close");
            }
        };
    }, []);

    function createConnection(){
        const WEBSOCKET_URL = `ws://${window.location.hostname}:8765`;
        
        if(!webSocketRef.current){
            webSocketRef.current = new WebSocket(WEBSOCKET_URL);
            webSocketRef.current.addEventListener("open", (event) => {console.log("Connected!")});
        }

        webSocketRef.current.addEventListener("message", (event) => {
            let messageData = JSON.parse(event.data);
            setServerMessage(messageData);
            let messageType = messageData.messageType
            
            if(messageData.messageType === "error"){
                console.log(messageData.payload);
                setErrorMessage(messageData.payload);
            }
            else if(messageType == "usernameCreated" || messageType == "usernameChange") {
                console.log("Username accepted/changed!");
                setErrorMessage("");
                showScreen("lobby");
            }
        });

        webSocketRef.current.addEventListener("close", (event) => {
            console.log('Websocket failed:', event);
            webSocketRef.current = null

            showScreen('login')

            console.log('Attempting reconnect...');
            setTimeout(() => {createConnection();}, 1000);
        });

    }

    function showScreen(screenID) {
        setCurrentScreen(screenID);
    }

    function sendMessage(messageType, payload) {
        if (!webSocketRef.current || webSocketRef.current.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not connected. Attempting to reconnect...");
            setTimeout(createConnection, 1);  // Try to reconnect
            return;
        }
        
        const outgoingMessage = JSON.stringify({ messageType, payload });
        webSocketRef.current.send(outgoingMessage);
    }

    return (
        <>
            {currentScreen === "login" && (
                <Login serverMessage={serverMessage} sendMessage={sendMessage} errorMessage={errorMessage} showScreen={showScreen}/>
            )}
            {currentScreen === "lobby" && (
                <Lobby serverMessage={serverMessage} sendMessage={sendMessage} errorMessage={errorMessage} showScreen={showScreen}/>
            )}
            {currentScreen === "game" && (
                <Game serverMessage={serverMessage} sendMessage={sendMessage} errorMessage={errorMessage} showScreen={showScreen}/>
            )}
        </>
    );
}

export default App;