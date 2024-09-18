import fitz
from enum import Enum
from typing import Dict, List, Optional

class Institution(Enum):
    AMEX = "AMEX"
    SCOTIA = "SCOTIA"

class PDFExtractor:
    @staticmethod
    def extract_text(pdf_path: str, institution: Institution) -> Dict[str, str]:
        if institution == Institution.AMEX:
            return PDFExtractor._extract_text_for_amex(pdf_path)
        raise NotImplementedError(f"Extraction for {institution.value} not implemented")

    @staticmethod
    def _extract_text_for_amex(pdf_path: str) -> Dict[str, str]:
        pages = {}
        with fitz.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf, start=1):
                # We need to make the name dynamic
                your_transactions = fitz.Rect(19.5, 150.05201721191406, 127.6919937133789, 166.67201232910156)
                text = page.get_text("text", clip=your_transactions).replace("\n", "")

                if text == "Your Transactions":
                    list_of_transactions = fitz.Rect(18, 199, 533, 731)
                    # Only the first page has a different clip
                    if not pages:
                        text = "New Transactions for" 
                        text_instances = page.search_for(text, clip=list_of_transactions)
                        if text_instances:
                            top_left = text_instances[0].top_left
                            first_page_transactions = fitz.Rect(top_left.x, top_left.y, 533, 731)
                            text = page.get_text("text", clip=first_page_transactions, sort=True)
                    else:
                        text = page.get_text("text", clip=list_of_transactions, sort=True)
                    pages[f"page_{page_num}"] = text
        return pages