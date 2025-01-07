import { useState, useEffect, useRef } from 'react';
import GameScreen from './GameScreen';
import './App.css';

function App() {
    console.log("app rerendered.")
    const [serverMessage, setServerMessage] = useState("")
    const [username, setUsername] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const webSocketRef = useRef(null); 

    useEffect(() => {
        const currentUrl = window.location.hostname;
        const webSocketUrl = `ws://${currentUrl}:8765`;

        toggleScreens()
        
        webSocketRef.current = new WebSocket(webSocketUrl);

        webSocketRef.current.addEventListener("message", (event) => {
            let messageData = JSON.parse(event.data);
            setServerMessage(messageData)
            
            if(messageData.messageType === "error"){
                console.log(messageData.payload)
                setErrorMessage(messageData.payload)
                setUsername("");
            }
            else if(messageData.messageType === "usernameCreated" || messageData.messageType === "usernameChange") {
                console.log("Username accepted/changed!");
                setErrorMessage("");
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

    function sendMessage(messageType, payload){
        if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
            let outgoingMessage = JSON.stringify({ messageType: messageType, payload: payload });
            webSocketRef.current.send(outgoingMessage);
        } else {
            console.error("WebSocket is not open. Unable to send message.");
        }
    }

    function sendUsername(){
        sendMessage("username", username)
    }

    const handleUsernameChange = (event) => setUsername(event.target.value);

    return (
        <>
            <div id="login-screen">
                <h1 className="title">cum brains spoons</h1>
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
            </div>
            <div id="game-screen">
                <GameScreen serverMessage = {serverMessage} sendMessage = {sendMessage} errorMessage={errorMessage}/>
            </div>

        </>
    );
}

export default App;
