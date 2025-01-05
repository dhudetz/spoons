import websockets
import asyncio

CONNECTIONS = set()

async def echo(websocket):
    if websocket not in CONNECTIONS:
        CONNECTIONS.add(websocket)
    async for message in websocket:
        websockets.broadcast(CONNECTIONS,message)

async def main():
    async with websockets.serve(echo, "0.0.0.0", 8765):
        await asyncio.Future()
    print("HI")



asyncio.run(main())