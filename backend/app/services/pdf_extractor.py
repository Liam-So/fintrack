import fitz
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel
import re
from datetime import date, datetime

class Institution(str, Enum):
    AMEX = "AMEX"
    SCOTIA = "SCOTIA"

class PageContent(BaseModel):
    content: str
    open_close_dates: list[str]

class PDFContent(BaseModel):
    pages: Dict[str, PageContent]

# Pydantic model with a 'date' field
class DateModel(BaseModel):
    date: date

def extract_dates(strings: List[str]) -> List[Optional[DateModel]]:
    date_format = "%b %d, %Y"
    pattern = re.compile(r"^[A-Za-z]{3} \d{2}, \d{4}$")  # Regex to match "MMM DD, YYYY"
    
    dates = []
    
    for string in strings:
      if pattern.match(string):
        try:
            # Try to convert the string to a datetime object
            date_obj = datetime.strptime(string, date_format).date()  # Convert to date
            # Append a Pydantic model instance
            dates.append(DateModel(date=date_obj))
        except ValueError:
            pass  # Ignore if strptime fails (shouldn't happen if pattern matches)
    
    return dates

class PDFExtractor:
    @staticmethod
    def extract_text(pdf_path: str, institution: Institution) -> PDFContent:
        if institution == Institution.AMEX:
            return PDFExtractor._extract_text_for_amex(pdf_path)
        raise NotImplementedError(f"Extraction for {institution.value} not implemented")

    @staticmethod
    def _extract_text_for_amex(pdf_path: str) -> PDFContent:
        pages = {}
        open_close_dates = []

        with fitz.open(pdf_path) as pdf:
          for page_num, page in enumerate(pdf, start=1):
            page_dimensions = page.rect

            # we search and extract the open and close dates from the first page we see
            if len(open_close_dates) == 0:
              prepared_for_row = page.search_for("Prepared For")
              
              if prepared_for_row:
                prepared_for_row = prepared_for_row[0]
                prepared_for_row = fitz.Rect(prepared_for_row.top_left.x, prepared_for_row.top_left.y, page_dimensions.width, prepared_for_row.bottom_right.y + 10)
                text = page.get_text("text", clip=prepared_for_row)
                text_list = text.split("\n")
                open_close_dates = extract_dates(text_list)

            your_transactions = page.search_for("Your Transactions")

            if len(your_transactions) > 0:
              list_of_transactions = fitz.Rect(18, 199, page_dimensions.width, page_dimensions.height)
              # Only the first page has a different clip
              if not pages:
                text = "New Transactions for" 
                text_instances = page.search_for(text, clip=list_of_transactions)
                if text_instances:
                    top_left = text_instances[0].top_left
                    first_page_transactions = fitz.Rect(top_left.x, top_left.y, page_dimensions.width, page_dimensions.height)
                    text = page.get_text("text", clip=first_page_transactions, sort=True)
              else:
                text = page.get_text("text", clip=list_of_transactions, sort=True)
              pages[f"page_{page_num}"] = text
        return pages, open_close_dates
