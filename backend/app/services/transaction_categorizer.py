from typing import Dict, List
from app.models.transaction import UserTransaction
from app.services.llm_controller import generate_response, PromptRequest, CategorizedTransaction
from dataclasses import dataclass

import logging
import os

OPEN_AI_MODEL = 'gpt-4o-mini'
OLLAMA_MODEL = 'llama3.1'

# TODO: Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TransactionCategorizationError(Exception):
  '''Custom exception for transaction categorization errors'''
  pass


@dataclass
class CategorizationResult:
    """Stores the result of a categorization attempt"""
    successful: List[UserTransaction]
    failed: List[UserTransaction]
    failure_reasons: Dict[int, str]

class TransactionCategorizer:
    def __init__(self, categories: Dict[str, int], max_retries: int = 3):
        self.categories = categories
        self.model = OLLAMA_MODEL if os.getenv("FLASK_ENV", "dev") == "dev" else OPEN_AI_MODEL # Default to OLLAMA
        self.max_retries = max_retries
        self.environment = os.getenv("FLASK_ENV", "dev")


    def _create_descriptions(self, transactions: List[UserTransaction]) -> List[str]:
        '''Extract descriptions from transactions'''
        return [t.description for t in transactions]


    def _get_llm_response(self, prompt_request: PromptRequest) -> List[str]:
        '''Invoke LLM to categorize transactions'''
        try:
            return generate_response(prompt_request)
        except Exception as e:
            raise Exception(f'Error invoking LLM: {e}')


    def _validate_response(self, parsed_items: Dict[str, str], chunk_size: int) -> bool:
        '''Validate the response from LLM'''
        return len(parsed_items) == chunk_size


    def _process_open_ai_transactions(self, transactions: List[UserTransaction],
                                    parsed_items: List[CategorizedTransaction]) -> CategorizationResult:
        '''Process transactions and separate successful and failed ones'''
        successful = []
        failed = []
        failure_reasons = {}

        for i in range(len(transactions)):
            row_data = transactions[i]
            new_category = parsed_items[i].category

            if row_data.category_id == -1 and new_category in self.categories:
                print(f'✨: {row_data.description} -> {new_category}')
                row_data.category_id = self.categories[new_category]
                successful.append(row_data)
            elif row_data.category_id == -1:
                print(f'❌: {row_data.description} -> {new_category}')
                failed.append(row_data)
                failure_reasons[i] = f"Invalid category: {new_category}"

        return CategorizationResult(successful, failed, failure_reasons)


    def _process_transactions(self, transactions: List[UserTransaction], 
                            parsed_items: Dict[str, str]) -> CategorizationResult:
        '''Process transactions and separate successful and failed ones'''
        successful = []
        failed = []
        failure_reasons = {}

        for item in parsed_items:
            idx = int(item) - 1
            row_data = transactions[idx]
            new_category = parsed_items[item]

            if row_data.category_id == -1 and new_category in self.categories:
                print(f'✨: {row_data.description} -> {new_category}')
                row_data.category_id = self.categories[new_category]
                successful.append(row_data)
            else:
                if row_data.category_id == -1:
                    print(f'❌: {row_data.description} -> {new_category}')
                    failed.append(row_data)
                    failure_reasons[idx] = f"Invalid category: {new_category}"

        return CategorizationResult(successful, failed, failure_reasons)


    def categorize_chunk(self, chunk: List[UserTransaction], 
                        retry_count: int = 0) -> CategorizationResult:
        """Categorize a chunk of transactions with detailed error tracking."""
        try:
            descriptions = self._create_descriptions(chunk)
            category_list = list(self.categories.keys())

            if self.environment == 'dev':
              prompt = self.create_prompt(category_list, descriptions)
            elif self.environment == 'demo':
              prompt = self.create_open_ai_prompt(category_list, descriptions)
            
            prompt_request = PromptRequest(prompt=prompt, model=self.model)
            
            parsed_items = self._get_llm_response(prompt_request)
            
            if not self._validate_response(parsed_items, len(chunk)):
                raise TransactionCategorizationError("Invalid response length")

            if self.environment == 'demo':
              return self._process_open_ai_transactions(chunk, parsed_items)

            return self._process_transactions(chunk, parsed_items)

        except Exception as e:
            logger.error(f"Categorization failed: {str(e)}")
            return CategorizationResult([], chunk, {i: str(e) for i in range(len(chunk))})


    def categorize_all(self, transactions_df: List[List[UserTransaction]]) -> None:
        """Categorize all transactions with smart retry logic."""
        failed_transactions = []
        retry_count = 0
        
        logger.info(f'Using model: {self.model}')

        # First pass through all chunks
        for i, chunk in enumerate(transactions_df):
            logger.info(f'Processing chunk {i}')
            result = self.categorize_chunk(chunk)
            failed_transactions.extend(result.failed)

        # Retry logic for failed transactions. OpenAI will likely not have failed transactions
        while failed_transactions and retry_count < self.max_retries:
            retry_count += 1
            print(f'Retry attempt {retry_count} for {len(failed_transactions)} failed transactions')
            print(failed_transactions)
            
            # Process failed transactions in a new chunk
            retry_result = self.categorize_chunk(failed_transactions, retry_count)
            
            # Update failed_transactions list with only the new failures
            failed_transactions = retry_result.failed

            if not failed_transactions:
                print('All transactions successfully categorized after retry')
                break

        if failed_transactions:
            print(f"Failed to categorize {len(failed_transactions)} transactions "
                        f"after {self.max_retries} retries")
            for tx in failed_transactions:
                print(f"Failed transaction: {tx.description}")


    def create_open_ai_prompt(self, categories: list[str], descriptions: list[str]):
        enumerated_categories = ""
        enumerated_descriptions = ""

        for index, description in enumerate(descriptions):
          enumerated_descriptions += f"{index+1}. {description}\n"

        for index, category in enumerate(categories):
          enumerated_categories += f"{index+1}. {category}\n"

        return f'''Classify the following transactions into the most suitable categories:

Categories:
{enumerated_categories}
Transactions:
{enumerated_descriptions}
## IMPORTANT ##
ONLY USE THE CATEGORIES I PROVIDED. DO NOT ADD OR REMOVE CATEGORIES.

I have provided {len(descriptions)} transactions.
You MUST return {len(descriptions)} categories.

Before returning, double check that the category you selected is in the list of categories provided above.''' 


    def create_prompt(self, categories: list[str], descriptions: list[str]):
      enumerated_descriptions = ""
      enumerated_categories = ""

      for index, description in enumerate(descriptions):
        enumerated_descriptions += f"{index+1}. {description}\n"
      for index, category in enumerate(categories):
        enumerated_categories += f"{index+1}. {category}\n"

      return f'''You are the most precise and accurate classifier. Your task is to categorize the following transactions into the correct categories.

Categories:
{enumerated_categories}
Transactions:
{enumerated_descriptions}
## IMPORTANT ##
ONLY USE THE CATEGORIES I PROVIDED. DO NOT ADD OR REMOVE CATEGORIES. 

Output a JSON where the key is the index of the transaction and the value is the category.
{{
  "1": "{categories[0]}",
  "2": "{categories[len(categories)-1]}",
  ...
}}

I have provided {len(descriptions)} transactions.
You MUST return {len(descriptions)} categories.

Only output the JSON, nothing else.
The value of the JSON should be the category name nothing else.

Before returning, double check that the category you selected is in the list of categories provided above.
If not, retry.'''