class Player:
    """A player of a Game."""

    def __init__(self, username: str) -> None:
        self.username = username
    
    def change_username(self, new_username: str) -> None:
        self.username = new_username

    @property
    def properties(self) -> dict:
        return self.__dict__

class Game:
    """An base class for defining a game and managing its state."""
    def __init__(self, players) -> None:
        self.players = players
    
    def get_state(self):
        return {}