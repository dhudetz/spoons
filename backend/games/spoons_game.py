import random
from typing import override
from games._game import Player, Game


class Card:
    def __init__(self, value, color):
        self.value = value
        self.color = color


class SpoonsPlayer(Player):
    @override
    def __init__(self, username: str) -> None:
        super().__init__(username)
        self.cards = []

    @override
    @property
    def properties(self):
        return {**super().properties, "cards": self.cards}


class SpoonsGame(Game):
    """Game class for the table top game spoons."""

    @override
    def __init__(self, players) -> None:
        super().__init__(players)
        self.spoons = 5
        self.colors = ["♡", "♦", "♠", "♧"]
        self.values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
        self.deck = [
            Card(value, color) for value in self.values for color in self.colors
        ]
        random.shuffle(self.deck)

    @override
    def get_state(self):
        return {"numSpoons": self.spoons}
