import pandas as pd
import os

from werkzeug.utils import secure_filename
from werkzeug.exceptions import BadRequest

class CSVExtractorService:
  @staticmethod
  def load_csv_file(file) -> list[str, pd.DataFrame]:
    filename = secure_filename(file.filename)
    # should we make this a unique filename?
    temp_file_path = os.path.join("/tmp", filename)
    file.save(temp_file_path)

    if file.filename == '':
        raise BadRequest('No selected file')
    
    if not file.filename.endswith('.csv') or file.filename.endswith('.xlsx'):
      raise BadRequest('Invalid file format. Please upload a CSV file.')
    
    return temp_file_path, pd.read_csv(temp_file_path, parse_dates=['Date'])
