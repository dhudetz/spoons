import websockets
import asyncio
import json

class Player:
    def __init__(self, connection, username):
        self.username = username
        self.connection = connection
        self.cards = []
    
    def change_username(self, new_username):
        self.username = new_username


players = {}
user_connections = set()
usernames = set()

async def create_player(connection, username):
    if username in usernames:
        await send_message_to_user(connection, "error", "Username already exists")
    elif username == "":
        await send_message_to_user(connection, "error", "Username cannot be empty")
    elif connection.id in players:  # Username change
        old_username = players[connection.id].username
        usernames.remove(old_username)
        players[connection.id].change_username(username)
        usernames.add(username)
        await send_message_to_user(connection, "username_change", f"Username changed from {old_username} to {username}")
    else:  # New user
        players[connection.id] = Player(connection, username)
        usernames.add(username)
        await send_message_to_user(connection, "username_created", f"Welcome, {username}!")
    print(f"Current users: {[players[p].username for p in players]}")


async def send_message_to_user(connection, message_type: str, payload: str):
    """Send a message to a specific user."""
    message = json.dumps({"messageType": message_type, "payload": payload})
    await connection.send(message)


async def broadcast_game_state(message_type: str, payload: str):
    """Broadcast a game state to all connected users."""
    message = json.dumps({"messageType": message_type, "payload": payload})
    websockets.broadcast(user_connections, message)


async def process_message(connection, message):
    """Process incoming WebSocket messages."""
    try:
        game_message = json.loads(message)
        if game_message['messageType'] == "username":
            await create_player(connection, game_message["payload"])
        else:
            await send_message_to_user(connection, "error", "Unknown message type")
    except (json.JSONDecodeError, KeyError):
        await send_message_to_user(connection, "error", "Invalid message format")


async def handle_client(connection):
    """Handle individual client connections."""
    try:
        user_connections.add(connection)
        print(f"New client connected. Total connections: {len(user_connections)}")

        async for message in connection:
            await process_message(connection, message)
    except websockets.exceptions.ConnectionClosed:
        print("Client connection closed unexpectedly")
    finally:
        user_connections.remove(connection)
        if connection.id in players:
            usernames.remove(players[connection.id].username)
            del players[connection.id]
        print(f"Client disconnected. Total connections: {len(user_connections)}")


async def main():
    async with websockets.serve(handle_client, "0.0.0.0", 8765):
        print("Server running on ws://0.0.0.0:8765")
        await asyncio.Future()  # Keep the server running indefinitely


if __name__ == "__main__":
    asyncio.run(main())
