import { useState, useEffect, useRef } from 'react';
import GameScreen from './GameScreen';
import './App.css';

function App() {
    const [incomingMessage, setIncomingMessage] = useState("");
    const [username, setUsername] = useState("");
    const webSocketRef = useRef(null); 

    useEffect(() => {
        const currentUrl = window.location.hostname;
        const webSocketUrl = `ws://${currentUrl}:8765`;

        toggleScreens()
        
        webSocketRef.current = new WebSocket(webSocketUrl);

        webSocketRef.current.addEventListener("message", (event) => {
            setIncomingMessage(event.data);
            let messageData = JSON.parse(event.data);
            
            if(messageData.messageType === "error"){
                console.log(messageData.payload)
            }
            else if(messageData.messageType === "username_created" || messageData.messageType === "username_change") {
                console.log("Username accepted/changed!");
                toggleScreens();
            }
        });

        return () => {
            if (webSocketRef.current) {
                webSocketRef.current.close();
            }
        };
    }, []);

    function toggleScreens(){
        let loginScreenElement = document.getElementById("login-screen")
        let gameScreenElement = document.getElementById("game-screen")
        if (gameScreenElement.style.display === "none") {
            gameScreenElement.style.display = "block";
            loginScreenElement.style.display = "none";
          } else {
            gameScreenElement.style.display = "none";
            loginScreenElement.style.display = "block";
          }

    }

    function sendUsername() {
        if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
            let outgoingMessage = JSON.stringify({ messageType: "username", payload: username });
            webSocketRef.current.send(outgoingMessage);
        } else {
            console.error("WebSocket is not open. Unable to send message.");
        }
    }

    const handleUsernameChange = (event) => setUsername(event.target.value);

    return (
        <>
            <div id="login-screen">
                <h1>cum brains spoons</h1>
                <form>
                    <h2>Choose your username:</h2>
                    <input type="text" onChange={handleUsernameChange} />
                </form>
                <button onClick={sendUsername}>Enter Game</button>
            </div>
            <div id="game-screen">
                <GameScreen />
            </div>

        </>
    );
}

export default App;
