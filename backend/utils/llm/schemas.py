from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime

class OriginalReservationData(BaseModel):
    name: str
    reviews: List[dict]
    emails: List[dict]

class FoodOrder(BaseModel):
    """Model for food orders."""
    item: str = Field(..., description="Name of the food item")
    quantity: int = Field(..., gt=0, description="Quantity ordered")
    dietary_tags: List[str] = Field(default_factory=list, description="Dietary tags for this item")
    price: float = Field(..., description="Price per item in currency units")

class ReservationOutput(BaseModel):
    """Structured output for reservation processing."""
    client_name: str = Field(..., description="Name of the client booking the reservation")
    number_of_guests: int = Field(..., gt=0, description="Number of guests in the party")
    date: str = Field(..., description="Reservation date in YYYY-MM-DD format")
    food_ordered: List[FoodOrder] = Field(default_factory=list, description="List of food items ordered")
    is_vip: bool = Field(..., description="VIP status of the client")
    special_requests: List[str] = Field(default_factory=list, description="List of special requests")
    preferences: List[str] = Field(default_factory=list, description="List of preferences")

    @validator('date')
    def validate_date_format(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')