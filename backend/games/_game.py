import logging
from typing import Coroutine

class Player:
    """A player of a Game."""

    def __init__(self, username: str) -> None:
        """Initialize the Player."""
        self.username = username

    def change_username(self, new_username: str) -> None:
        """Change the username of this player.
        
        Args:
            new_username: the new username of the player."""
        self.username = new_username

    @property
    def properties(self) -> dict:
        """properties associated with this player"""
        return self.__dict__


class Game:
    """An base class for defining a game and managing its state."""

    def __init__(self, broadcast_state: Coroutine, players: dict) -> None:
        """Initialize the Game."""
        self.logger = logging.getLogger("GameServer")
        self.players = players
        self.message_data = {}
        print(broadcast_state)
        self.broadcast_state = broadcast_state

    @property
    def state(self):
        """state of the game"""
        return {}
    
    async def handle_incoming_message(self, connection_id: str, message: dict) -> None:
        """Handle incoming game message from a player

        Args:
            connection_id: connection id of the associated player
            message: dictionary of the message payload

        """
        if connection_id not in self.players:
            self.logger.error(f"No player exists for {connection_id}!")
            return
        
        self.message_data = message["data"]
