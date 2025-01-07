import random

class Card:
    def __init__(self, value, color):
        self.value = value
        self.color = color

class Player:
    def __init__(self, username):
        self.username = username
        self.cards = []
    
    def change_username(self, new_username):
        self.username = new_username

    def to_dict(self):
        return {"username":self.username, "cards":self.cards}

class SpoonsGame:
    def __init__(self, players) -> None:
        self.players = players
        self.spoons = 5
        self.colors = ['♡', '♦', '♠', '♧']
        self.values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']
        self.deck = [Card(value, color) for value in self.values for color in self.colors]
        random.shuffle(self.deck)

    def get_game_state(self):
        return {"players":self.players}.update(self.get_state_props)
    
    def get_state_properties(self):
        return {"numSpoons":self.spoons}

    
    
