import pandas as pd
import os
import uuid
import chardet
from typing import Tuple
from werkzeug.utils import secure_filename
from werkzeug.exceptions import BadRequest
from werkzeug.datastructures import FileStorage

class CSVExtractorService:
    REQUIRED_COLUMNS = {'Date', 'Description', 'Amount'}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB limit
    ALLOWED_ENCODINGS = {'utf-8', 'ascii', 'iso-8859-1', 'utf-16', 'utf-8-sig'} 

    @staticmethod
    def load_csv_file(file: FileStorage) -> Tuple[str, pd.DataFrame]:
        """
        Securely loads and validates a CSV file.
        
        Args:
            file: The uploaded FileStorage object from request.files
            
        Returns:
            Tuple containing:
                - Path to temporary file
                - DataFrame with the validated CSV data
                
        Raises:
            BadRequest: If file is invalid, malformed, or fails security checks
        """
        if not file or file.filename == '':
            raise BadRequest('No file uploaded')

        # Check file size
        file.seek(0, os.SEEK_END)
        size = file.tell()
        file.seek(0)
        if size > CSVExtractorService.MAX_FILE_SIZE:
            raise BadRequest('File too large. Maximum size is 10MB')

        # Validate file extension
        if not file.filename.lower().endswith('.csv'):
            raise BadRequest('Invalid file format. Please upload a CSV file.')

        # Create unique filename
        unique_filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
        temp_file_path = os.path.join("/tmp", unique_filename)

        try:
            # Save file
            file.save(temp_file_path)

            # Detect and validate file encoding
            with open(temp_file_path, 'rb') as f:
                raw_data = f.read()
                result = chardet.detect(raw_data)
                encoding = result['encoding'].lower()

                print(encoding)

                if not encoding or encoding not in CSVExtractorService.ALLOWED_ENCODINGS:
                    raise BadRequest('Unsupported file encoding')

                if result['confidence'] < 0.8:
                    raise BadRequest('Unable to determine file encoding with confidence')

            # Read and validate CSV
            df = pd.read_csv(
                temp_file_path,
                encoding=encoding,
                parse_dates=['Date'],
                on_bad_lines='warn',
                dtype={
                    'Description': str,
                    'Amount': float
                }
            )

            # Validate required columns
            missing_cols = CSVExtractorService.REQUIRED_COLUMNS - set(df.columns)
            if missing_cols:
                raise BadRequest(f'Missing required columns: {", ".join(missing_cols)}')

            # Validate data is not empty
            if df.empty:
                raise BadRequest('CSV file is empty')

            # Clean and standardize data
            df = CSVExtractorService._clean_dataframe(df)

            return temp_file_path, df

        except pd.errors.EmptyDataError:
            raise BadRequest('The CSV file is empty')
        except pd.errors.ParserError:
            raise BadRequest('Invalid CSV format or corrupted file')
        except ValueError as e:
            raise BadRequest(f'Invalid data in CSV: {str(e)}')
        except Exception as e:
            raise BadRequest(f'Error processing CSV: {str(e)}')
        finally:
            # If any error occurred and file exists, clean it up
            if 'df' not in locals() and os.path.exists(temp_file_path):
                os.remove(temp_file_path)

    @staticmethod
    def _clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
        """Cleans and standardizes the DataFrame"""
        # Ensure dates are in consistent format
        df['Date'] = pd.to_datetime(df['Date']).dt.strftime('%Y-%m-%d')

        # Clean description field
        df['Description'] = (df['Description']
                           .astype(str)
                           .apply(lambda x: ' '.join(x.split()))  # normalize spaces
                           .str.strip()
                           .str[:255])  # limit length

        # Standardize amounts
        df['Amount'] = pd.to_numeric(df['Amount'], errors='coerce')

        # Remove any rows with NaN values
        df = df.dropna(subset=['Date', 'Description', 'Amount'])

        # Reset index after cleaning
        return df.reset_index(drop=True)