import { useState, useEffect, useRef } from 'react'
import Login from './screens/Login'
import Lobby from './screens/Lobby'
import Game from './screens/Game'
import './App.css'

function App() {
    const [connectionId, setConnectionId] = useState(null)
    const [serverMessage, setServerMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [currentScreen, setCurrentScreen] = useState("login")
    const [timeSinceSend, setTimeSinceSend] = useState(0)
    const webSocketRef = useRef(null)

    const MESSAGE_COOLDOWN_MS = 15

    useEffect(() => {
        setTimeout(() => {createConnection();}, 1)
        
        // On exit
        return () => {
            if (webSocketRef.current) {
                webSocketRef.current.close()
                webSocketRef.current = null
            }
        }
    }, [])

    function createConnection(){
        const WEBSOCKET_URL = `ws://${window.location.hostname}:8765`
        
        // Open server connection if there is not one already.
        if(webSocketRef.current) return
        webSocketRef.current = new WebSocket(WEBSOCKET_URL)

        webSocketRef.current.addEventListener("open", (event) => {
            setErrorMessage("")
            console.log("Connected!")
        })

        webSocketRef.current.addEventListener("message", (event) => {
            let messageData = JSON.parse(event.data)
            setServerMessage(messageData)
            let messageType = messageData.messageType
            
            if(messageData.messageType === "error"){
                console.log(messageData.payload)
                setErrorMessage(messageData.payload)
            }
            else if(messageType == "usernameCreated" || messageType == "usernameChange") {
                console.log("Username accepted/changed!")
                showScreen("lobby")
            }
        });

        webSocketRef.current.addEventListener("close", (event) => {
            console.log('Websocket failed:', event)
            webSocketRef.current = null

            showScreen('login')
            setErrorMessage("Cannot connect to server.")

            console.log('Attempting reconnect...')
            setTimeout(() => {createConnection();}, 1000)
        });

    }

    function showScreen(screenID) {
        setErrorMessage("")
        setCurrentScreen(screenID)
    }

    function sendMessage(messageType, data) {
        if (!webSocketRef.current || webSocketRef.current.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not connected. Attempting to reconnect...")
            setTimeout(createConnection, 1);  // Try to reconnect
            return;
        }
        
        const time = new Date().getTime();
        if(time - timeSinceSend > MESSAGE_COOLDOWN_MS){
            const outgoingMessage = JSON.stringify({ messageType, data })
            webSocketRef.current.send(outgoingMessage)
            setTimeSinceSend(time)
        }
    }

    return (
        <>
            {currentScreen === "login" && (
                <Login 
                    serverMessage={serverMessage}
                    sendMessage={sendMessage}
                    setErrorMessage={setErrorMessage}
                    errorMessage={errorMessage}
                    showScreen={showScreen}
                />
            )}
            {currentScreen === "lobby" && (
                <Lobby 
                    serverMessage={serverMessage}
                    sendMessage={sendMessage}
                    setErrorMessage={setErrorMessage}
                    errorMessage={errorMessage}
                    showScreen={showScreen}
                />
            )}
            {currentScreen === "game" && (
                <Game 
                    serverMessage={serverMessage}
                    sendMessage={sendMessage}
                    setErrorMessage={setErrorMessage}
                    errorMessage={errorMessage}
                    showScreen={showScreen}
                />
            )}
        </>
    );
}

export default App;