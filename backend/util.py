class Vector2:
    def __init__(self, x: int = 0, y: int = 0):
        """Initialize the Card."""
        self.x = x
        self.y = y

    def set(self, x: int, y: int):
        """Set the value of the vector.
        
        Args:
            x: new x value
            y: new y value
        
        """
        self.x = x
        self.y = y

    def set_x(self, x: int):
        """Set the value of the vector.
        
        Args:
            x: new x value
        
        """
        self.x = x

    def set_y(self, y: int):
        """Set the value of the vector.
        
        Args:
            y: new y value
        
        """
        self.y = y

    def to_dict(self):
        """Return a dictionary representation of the Vector2 object."""
        return {"x": self.x, "y": self.y}