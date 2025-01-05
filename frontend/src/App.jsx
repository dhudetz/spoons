import GameSpace from './GameSpace'

function App() {
  console.log("app rerendered")

  const currentUrl = window.location.hostname;
  var webSocket = new WebSocket("ws:"+currentUrl+":8765");

  return(
    <GameSpace webSocket={webSocket}/>
  )
}

export default App
