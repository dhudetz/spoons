import { memo, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import GameSpace from './components/GameSpace'

function App() {
  const[message, changeMessage] = useState("")
  console.log("app rerendered")

  const currentUrl = window.location.hostname;
  var webSocket = new WebSocket("ws:"+currentUrl+":8765");

  return(
    <>
    <h1>Good mornin</h1>
    <h2>{message}</h2>
    <GameSpace webSocket={webSocket}/>
    </>
  )
}

export default App
