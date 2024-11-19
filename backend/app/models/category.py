from pydantic import BaseModel, Field

class UserCategory(BaseModel):
  category_id: int
  name: str
  essential: bool = Field(default=False)
