from websockets import ServerConnection, serve, broadcast
import websockets
import asyncio
import json
from spoons_game import Player, SpoonsGame
import logging

class GameServer():
    """A server that runs a Game."""
    
    LOG_LEVEL = logging.INFO

    INCOMING_MESSAGE_TYPES=[
        'username',
        'startGame',
        'gameMessage',
    ]

    OUTGOING_MESSAGE_TYPES=[
        'error',
        'usernameChange',
        'usernameCreated',
        'gameState',
    ]

    MAX_USERNAME_LENGTH = 30
    user_connections = set()
    players = {}
    usernames = set()
    game = None

    def __init__(self) -> None:
        self._init_logger()

    def _init_logger(self) -> None:
        """Initializes the logger."""
        
        # Configure logging settings
        self.logger = logging.getLogger("GameServer")
        self.logger.setLevel(self.LOG_LEVEL)  # Set the logging level for your program

        if not self.logger.handlers:
            console_handler = logging.StreamHandler()
            console_handler.setLevel(self.LOG_LEVEL)
            formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
            console_handler.setFormatter(formatter)
            self.logger.addHandler(console_handler)

    async def attempt_create_player(self, connection: ServerConnection, username: str) -> None:
        """Create a new player if username is valid. Update game state.
        
        Args: 
            connection: connection of the user attempting to create a new player
            
        """
        success = False
        # Username already exists
        if username in self.usernames:
            await self.send_message_to_user(connection, "error", "username already exists! be more original!")
        # Username is empty
        elif username == "":
            await self.send_message_to_user(connection, "error", "username cannot be empty! dumbaaaah!")
        # Username too long
        elif len(username) > self.MAX_USERNAME_LENGTH:
            await self.send_message_to_user(
                connection,
                "error",
                f"username cannot be longer than {self.MAX_USERNAME_LENGTH} characters, you greedy goblin!"
            )
        # Game has already started
        elif self.game:
            await self.send_message_to_user(
                connection,
                "error", 
                f"Game has already started! Wait until the next one to join!"
            )
        # Username change
        elif connection.id in self.players:  
            old_username = self.players[connection.id].username
            self.usernames.remove(old_username)
            self.players[connection.id].change_username(username)
            self.usernames.add(username)
            await self.send_message_to_user(
                connection,
                "usernameChange",
                f"Username changed from {old_username} to {username}"
            )
            self.logger.info(f"{old_username} changed username to {username}!")
            success = True
        # Valid username, create the username
        else:
            await self.create_player(connection, username)
            success = True
        
        if success:
            await self.broadcast_game_state()

    async def create_player(self, connection: ServerConnection, username: str) -> None:
        """Create a new player.
        
        Args:
            connection: user's connection
            username: player's username
        
        """
        self.players[connection.id] = Player(username)
        self.usernames.add(username)
        await self.send_message_to_user(connection, "usernameCreated", f"Welcome, {username}!")
        self.logger.info(f"{username} has joined.")
        self.logger.debug(f"Current users: {self.usernames}")

    def disconnect_player(self, connection: ServerConnection) -> None:
        """Disconnects a player with connection.
        
        Args:
            connection: player's connection
        
        """
        self.user_connections.remove(connection)
        if connection.id in self.players:
            self.logger.info(f"{self.players[connection.id].username} left.")
            self.usernames.remove(self.players[connection.id].username)
            self.players.pop(connection.id, None)
        self.logger.debug(f"Current users: {self.usernames}")

    async def attempt_start_game(self, connection: ServerConnection) -> None:
        """Start the game if there is not already one and if players > 2.
        
        Args: 
            connection: connection of the user attempting to start the game
        
        """
        if self.game != None:
            await self.send_message_to_user(connection, "error", "Game already started!")
        elif len(self.players) < 2:
            await self.send_message_to_user(connection, "error", "Failed to start game. Not enough players!")
        else:
            self.game = SpoonsGame(self.players)
            await self.broadcast_game_state()
            self.logger.info("Starting game!")

    async def send_message_to_user(self, connection: ServerConnection, message_type: str, payload: str) -> None:
        """Send a message to a specific user.
        
        Args:
            connection: connection of the user to send message to
            message_type: type of message
            payload: the data being

        """
        if message_type not in self.OUTGOING_MESSAGE_TYPES:
            self.logger.error(f"Invalid outgoing message type {message_type}")
        
        message = json.dumps({"messageType": message_type, "payload": payload})
        await connection.send(message)

    async def get_game_state(self) -> None:
        """Get a dictionary of the current game state including players and game properties.
        
        Returns: 
            dictionary of the current state of the game

        """
        game_state = {"players":[player.to_dict() for player in self.players.values()]}
        game_started = False
        if self.game:
            game_properties = self.game.get_state_properties()
            game_state.update(game_properties)
            game_started = True
        game_state["started"] = game_started
        return game_state

    async def broadcast_game_state(self):
        """Broadcast a game state to all connected users."""
        message_content = {"messageType":"gameState"}
        game_state = await self.get_game_state()
        message_content.update(game_state)
        await self.broadcast_message(message_content)

    async def broadcast_message(self, message_content: dict) -> None:
        """Broadcast a message to all players.
        
        Args:
            message: dictionary of message to be sent
            
        """
        broadcast_message = json.dumps(message_content)
        broadcast(self.user_connections, broadcast_message)

    async def process_incoming_message(self, connection: ServerConnection, message: dict) -> None:
        """Process incoming user message.
        
        Args:
            connection: connection that the message came from
            message: dictionary of the message content

        """
        try:
            game_message = json.loads(message)

            message_type = game_message['messageType']
            if message_type not in self.INCOMING_MESSAGE_TYPES: # bad message type
                self.logger.error(f"Invalid message type received from connection {connection}.")
                await self.send_message_to_user(connection, "error", "Unknown message type.")
            
            if message_type == "username":
                await self.attempt_create_player(connection, game_message["payload"])
            elif message_type == "startGame":
                await self.attempt_start_game(connection)
            elif message_type == "gameMessage":
                if not self.game:
                    await self.send_message_to_user(connection, "error", "Not accepting game messages!")
                    self.logger.error(f"Game message received from {connection} without a game started.")
                    return
                #self.game.process_game_message()
                
        except (json.JSONDecodeError, KeyError):
            await self.send_message_to_user(connection, "error", "Invalid message format.")

    async def handle_client(self, connection: ServerConnection) -> None:
        """Handle a new individual client connection.
        
        Args:
            connection: new client connection
        
        """
        try:
            self.user_connections.add(connection)
            self.logger.debug(f"New client connected. Total connections: {len(self.user_connections)}")

            async for message in connection:
                await self.process_incoming_message(connection, message)
        except websockets.exceptions.ConnectionClosed:
            self.logger.info("Client connection closed unexpectedly")
        finally:
            self.disconnect_player(connection)
            self.logger.debug(f"Client disconnected. Total connections: {len(self.user_connections)}")
            await self.broadcast_game_state()


    async def initialize_server(self) -> None:
        """Initialize the game server."""
        async with serve(self.handle_client, "0.0.0.0", 8765):
            self.logger.info("Server running on ws://0.0.0.0:8765")
            await asyncio.Future()  # Keep the server running indefinitely


if __name__ == "__main__":
    server = GameServer()
    asyncio.run(server.initialize_server())
