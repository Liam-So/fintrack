from pydantic import Field, BaseModel
import requests
import re
from typing import List, Optional, Any
import json
from retry import retry
import time

import openai
from pydantic import BaseModel
from enum import Enum

class Category(str, Enum):
  GROCERIES = "🛒 Groceries"
  DINING = "🍽️ Dining Out"
  DRINKS = "🍷 Drinks"
  RENT = "🏠 Rent"
  ENTERTAINMENT = "🎭 Entertainment"
  UTILITIES = "💡 Utilities"
  SHOPPING = "🛍️ Shopping"
  TRANSPORTATION = "🚗 Transportation"
  TRAVEL = "✈️ Travel"
  HEALTH = "💪🏼 Health"
  SUBSCRIPTIONS = "📦 Subscriptions"
  PETCARE = "🐾 Pet Care"
  EDUCATION = "📚 Education"
  CLOTHING = "👗 Clothing"
  PHONE = "📱 Cell Phone"
  INSURANCE = "💊 Insurance"
  REPAIRS = "🔧 Repairs"

  def __str__(self):
    return self.value

class CategorizedTransaction(BaseModel):
  description: str
  category: Category

class CategorizedTransactions(BaseModel):
  transactions: list[CategorizedTransaction]

OLLAMA_API_URL = "http://localhost:11434/api/generate"  # Adjust this URL if your Ollama server is running elsewhere
client = openai.OpenAI()
# LLM Misinterpretation
LLM_MISS = "UNKNOWN"

OPEN_AI_MODEL = 'gpt-4o-mini'
OLLAMA_MODEL = 'llama3.1'

class PromptRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="The prompt to send to the Ollama model")
    model: str = Field(default="llama2", description="The name of the Ollama model to use")

@retry(ValueError, tries=3)
def generate_response(prompt_request: PromptRequest) -> List[dict]:
    if prompt_request.model == OLLAMA_MODEL:
      raw_response = send_to_ollama(prompt_request.prompt, prompt_request.model)
      print(f'Response from Ollama: {raw_response}')
      return json.loads(raw_response)
    elif prompt_request.model == OPEN_AI_MODEL:
       response = send_to_openai(prompt_request.prompt, prompt_request.model)
       return response
    
    return []

def send_to_openai(prompt, model=OPEN_AI_MODEL):
   try:
      start = time.time()
      print(f'Starting inference ✨')

      completion = client.beta.chat.completions.parse(
          model=model,
          messages=[
              {"role": "system", "content": "You are the most precise and accurate classifier. Your task is to categorize the following transactions into the correct categories."},
              {
                  "role": "user",
                  "content": prompt
              }
          ],
          response_format=CategorizedTransactions,
          max_tokens=1000
      )
      categorization_task = completion.choices[0].message
      end = time.time()

      print(f"⏱️ Elapsed time: {end - start} seconds")

      if categorization_task.parsed:
        transactions = categorization_task.parsed.transactions

        for transaction in transactions:
          print(f'{transaction.description}: {transaction.category}')

      elif categorization_task.refusal:
        print(categorization_task.refusal)
      
      return transactions
   except Exception as e:
      # Handle edge cases
      if type(e) == openai.LengthFinishReasonError:
          # Retry with a higher max tokens
          print("Too many tokens: ", e)
          pass
      else:
          # Handle other exceptions
          print(e)
          pass


def send_to_ollama(prompt, model="llama3.1"):
  payload = {
    "model": model,
    "prompt": prompt,
    "stream": False,
    "format": "json",
    "options": {
      "temperature": 0.1,
      "top_p": 0.9,
      "top_k": 10
    }
  }

  try:
      response = requests.post(OLLAMA_API_URL, json=payload, timeout=30)
      response.raise_for_status()
      return response.json()["response"]
  except requests.RequestException as e:
      return f"Error calling Ollama API: {str(e)}"

def parse_json_response(response: str) -> List[dict]:
    # Find the JSON list in the response
    match = re.search(r'\{.*\}', response, re.DOTALL)
    if not match:
        raise ValueError("No JSON list found in the response")
    
    json_str = match.group(0)
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        raise ValueError("Invalid JSON in the response")
    

def clean_response(parsed_items: List[dict], categories: List[str], descriptions: List[str], chunk_of_transactions) -> List[str]:
   if len(parsed_items) < len(descriptions):
      difference = len(descriptions) - len(parsed_items)
      parsed_items.extend([LLM_MISS] * difference)
  
   # Truncate parsed items if it's longer than descriptions
   if len(parsed_items) > len(descriptions):
      parsed_items = parsed_items[:len(descriptions)]

   if len(chunk_of_transactions) != len(parsed_items):
       print("Length of transactions and parsed items do not match")
       print(f'Chunk of transactions: {chunk_of_transactions}')
       print(f'Parsed items: {parsed_items}')
       print(f'Descriptions: {descriptions}')
   else:
       print("Good!")


   for index, item in enumerate(parsed_items):
      if item not in categories:
        print(f'Item not in categories: {item}')
        parsed_items[index] = LLM_MISS

      chunk_of_transactions[index].category = parsed_items[index]

   return chunk_of_transactions
