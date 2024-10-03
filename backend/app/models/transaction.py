# from dataclasses import dataclass
from pydantic import BaseModel, Field
from datetime import date
from decimal import Decimal

class Transaction(BaseModel):
    id: str
    date: date
    amount: Decimal = Field(..., decimal_places=2)
    description: str
    category: str
