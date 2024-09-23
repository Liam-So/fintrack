from pydantic import Field, BaseModel
import requests
import re
from typing import List, Optional, Any
import json

OLLAMA_API_URL = "http://localhost:11434/api/generate"  # Adjust this URL if your Ollama server is running elsewhere

# LLM Misinterpretation
LLM_MISS = "UNKNOWN"

class PromptRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="The prompt to send to the Ollama model")
    model: str = Field(default="llama2", description="The name of the Ollama model to use")


def generate_response(prompt_request: PromptRequest) -> str:
    return send_to_ollama(prompt_request.prompt, prompt_request.model)

def send_to_ollama(prompt, model="llama2"):
  payload = {
    "model": model,
    "prompt": prompt,
    "stream": False
  }

  try:
      response = requests.post(OLLAMA_API_URL, json=payload, timeout=30)
      response.raise_for_status()
      return response.json()["response"]
  except requests.RequestException as e:
      return f"Error calling Ollama API: {str(e)}"


def parse_json_response(response: str) -> List[dict]:
    # Find the JSON list in the response
    match = re.search(r'\[.*\]', response, re.DOTALL)
    if not match:
        raise ValueError("No JSON list found in the response")
    
    json_str = match.group(0)
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        raise ValueError("Invalid JSON in the response")
    

def clean_response(parsed_items: List[dict], categories: List[str], descriptions: List[str], chunk_of_transactions) -> List[str]:
   if len(parsed_items) != len(descriptions):
      difference = len(descriptions) - len(parsed_items)
      parsed_items.extend([LLM_MISS] * difference)

   for index, item in enumerate(parsed_items):
      if item not in categories:
        print(f'Item not in categories: {item}')
        parsed_items[index] = LLM_MISS

      chunk_of_transactions[index].category = parsed_items[index]

   return chunk_of_transactions

def get_transaction_prompt(categories: list, descriptions: str) -> str:
    return f"""
You are an AI assistant designed to categorize financial transactions with extreme precision. Your task is to classify each description into EXACTLY ONE of the provided categories. You must ONLY use categories from the given list. No exceptions.
Categories
{categories}

Critical Instructions:
Do NOT create or select categories outside this list.
You MUST ONLY use categories from the above list. Do not create new categories or use any category not listed.
Assign EXACTLY ONE category to each description.
If no category seems to fit perfectly, choose the closest match from the provided options.
After categorizing, verify that each assigned category is in the original list.

Descriptions to Categorize
{descriptions}

Output Format:
Output your response as a list of categories, one for each description, in the same order as the input descriptions.
It should be JSON readable.
For example:
["Category1", "Category2", "Category3", ...]

Verification Step
After generating your response, perform these checks:

Ensure every "category" value is EXACTLY as it appears in the Categories list above.
If any category is not in the list, replace it with the closest match from the provided categories.
Confirm that the number of objects in your output matches the number of input descriptions. Even if there are duplicate descriptions.
No need to explain reasoning, just return the list of categories.

Remember: It is CRITICAL that you ONLY use categories from the provided list. Your task is not complete until you've verified this.
    """
