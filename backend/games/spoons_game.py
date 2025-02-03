import random
from typing import override
from games._game import Player, Game
from util import Vector2
from typing import Coroutine

class Card:
    def __init__(self, value: str, color: str):
        """Initialize the Card."""
        self.value = value
        self.color = color


class SpoonsPlayer(Player):
    @override
    def __init__(self, username: str) -> None:
        """Initialize the SpoonsPlayer."""
        super().__init__(username)
        self.cards = []
        self.cursor_pos = Vector2(-1, -1)

    @override
    @property
    def properties(self):
        """properties associated with this player"""
        return {"username": self.username, "cursorX": self.cursor_pos.x, "cursorY": self.cursor_pos.y}


class SpoonsGame(Game):
    """Game class for the table top game spoons."""

    @override
    def __init__(self, broadcast_state: Coroutine, players: dict) -> None:
        """Initialize the SpoonsGame."""
        super().__init__(broadcast_state, players)
        self.spoons = 5
        self.colors = ["♤", "♡", "♢", "♧"]
        self.values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
        self.deck = [
            Card(value, color) for value in self.values for color in self.colors
        ]
        random.shuffle(self.deck)

    @override
    @property
    def state(self):
        """state of the game"""
        return {**super().state, "numSpoons": self.spoons}

    @override
    async def handle_incoming_message(self, connection_id: str, message: dict) -> None:
        """Handle incoming game message from a player

        Args:
            connection_id: connection id of the associated player
            message: dictionary of the message payload

        """
        await super().handle_incoming_message(connection_id, message)
        new_cursor_x = self.message_data["cursorX"]
        new_cursor_y = self.message_data["cursorY"]
        
        self.players[connection_id].cursor_pos.set(new_cursor_x, new_cursor_y)
        await self.broadcast_state()
