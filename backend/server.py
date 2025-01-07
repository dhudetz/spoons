import websockets
import asyncio
import json
from spoons_game import Player,SpoonsGame


class GameServer():

    MAX_USERNAME_LENGTH = 30
    players = {}
    user_connections = set()
    usernames = set()
    game = None

    async def attempt_create_player(self, connection, username):
        """Create a new player if username is valid. Update game state."""
        success = False
        if username in self.usernames:
            await self.send_message_to_user(connection, "error", "username already exists! be more original!")
        elif username == "":
            await self.send_message_to_user(connection, "error", "username cannot be empty! dumbaaaah!")
        elif len(username) > self.MAX_USERNAME_LENGTH:
            await self.send_message_to_user(connection, "error", f"username cannot be longer than {self.MAX_USERNAME_LENGTH} characters, you greedy goblin!")
        elif self.game:
            await self.send_message_to_user(connection, "error", f"Game has already started!")
        elif connection.id in self.players:  # Username change
            old_username = self.players[connection.id].username
            self.usernames.remove(old_username)
            self.players[connection.id].change_username(username)
            self.usernames.add(username)
            await self.send_message_to_user(connection, "usernameChange", f"Username changed from {old_username} to {username}")
            success = True
        else:  # New user
            self.players[connection.id] = Player(connection, username)
            self.usernames.add(username)
            await self.send_message_to_user(connection, "usernameCreated", f"Welcome, {username}!")
            success = True
        print(f"Current users: {[self.players[p].username for p in self.players]}")
        if success:
            await self.broadcast_game_state()


    async def attempt_start_game(self, connection):
        """Start the game if there is not already one and if players > 2."""
        if self.game != None:
            await self.send_message_to_user(connection, "error", "Game already started!")
        elif len(self.players) < 2:
            await self.send_message_to_user(connection, "error", "Failed to start game. Not enough players!")
        else:
            self.game = SpoonsGame(self.players)
            await self.broadcast_game_state()
            print("Starting game!")


    async def send_message_to_user(self, connection, message_type: str, payload: str):
        """Send a message to a specific user."""
        message = json.dumps({"messageType": message_type, "payload": payload})
        await connection.send(message)


    async def broadcast_game_state(self):
        """Broadcast a game state to all connected users."""
        message_content = {"messageType":"gameState", "players":list(self.usernames)}
        if self.game:
            game_state = self.game.get_state_properties()
            message_content.update(game_state)
        broadcast_message = json.dumps(message_content)
        websockets.broadcast(self.user_connections, broadcast_message)


    async def process_message(self, connection, message):
        """Process incoming WebSocket messages."""
        print(f"message received: {message}")
        try:
            game_message = json.loads(message)
            message_type = game_message['messageType']
            if message_type == "username":
                await self.attempt_create_player(connection, game_message["payload"])
            elif message_type == "startGame":
                await self.attempt_start_game(connection)
            else:
                await self.send_message_to_user(connection, "error", "Unknown message type.")
        except (json.JSONDecodeError, KeyError):
            await self.send_message_to_user(connection, "error", "Invalid message format.")


    async def handle_client(self, connection):
        """Handle individual client connections."""
        try:
            self.user_connections.add(connection)
            print(f"New client connected. Total connections: {len(self.user_connections)}")

            async for message in connection:
                await self.process_message(connection, message)
        except websockets.exceptions.ConnectionClosed:
            print("Client connection closed unexpectedly")
        finally:
            self.user_connections.remove(connection)
            if connection.id in self.players:
                self.usernames.remove(self.players[connection.id].username)
                del self.players[connection.id]
            print(f"Client disconnected. Total connections: {len(self.user_connections)}")
            await self.broadcast_game_state()


    async def start_server(self):
        """Open the game server."""
        async with websockets.serve(self.handle_client, "0.0.0.0", 8765):
            print("Server running on ws://0.0.0.0:8765")
            await asyncio.Future()  # Keep the server running indefinitely


if __name__ == "__main__":
    server = GameServer()
    asyncio.run(server.start_server())
