import { useState } from 'react';
import { Upload, Lock, CheckCircle, Download } from 'lucide-react';
import { api } from '../axios';
import { useUser } from '../context/UserContext';
import { generateCSV } from '../api/dashboardApi';

const sampleFiles = [
  {
    name: "Personal Banking",
    description: "Common personal checking account transactions",
    rowCount: "📍 Montreal, Canada",
    type: "MTL"
  },
  {
    name: "Personal Banking",
    description: "Common personal checking account transactions",
    rowCount: "📍 Texas, USA",
    type: "TX"
  }
];

const FileUploader = ({ categories, setTransactions, isTrial }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [activeSample, setActiveSample] = useState(null);
  const [error, setError] = useState('');
  const { user } = useUser();
  const { id } = user;

  const encryptAndUploadFile = async () => {
    setError('');
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const jsonMetadata = { categories: categories };
    formData.append('json', JSON.stringify(jsonMetadata));

    try {
      setUploading(true);
      setActiveSample(null);

      const { data } = await api.post(`/extraction/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      data.transactions.map(transaction => {
        let newDate = new Date(transaction.date);
        let formattedDate = newDate.toISOString().split('T')[0];
        transaction.date = formattedDate;
      })

      setTransactions(data.transactions)
      setUploadComplete(true)
    } catch (error) {
      setError(error.response.data)
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setActiveSample(null);
    }
  };

  const handleDownload = async (sample) => {
    try {
      const response = await generateCSV(sample);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = 'export.csv';
      
      // Append to document, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-3xl w-full space-y-8">
        {/* Original File Uploader */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-semibold text-gray-900">
            Upload your CSV of transactions.
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your data is sent securely over a HTTPS connection and not saved on our servers. In this demo, data is preserved in session storage. Only your transaction descriptions are sent to the LLM server for categorization.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                className="sr-only"
                id="file-upload"
                disabled={uploading || uploadComplete}
              />
              <label
                htmlFor="file-upload"
                className={`relative w-full flex justify-center py-6 px-4 border-2 border-gray-300 border-dashed rounded-md transition duration-150 ease-in-out ${
                  !uploading && !uploadComplete
                    ? 'cursor-pointer hover:border-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500'
                    : 'cursor-not-allowed'
                }`}
              >
                <div className="space-y-1 text-center">
                  {!uploading && !uploadComplete && (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <span className="relative rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          Upload a file
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 10MB</p>
                    </>
                  )}
                  {file && (
                    <p className="text-lg text-gray-600 font-semibold">{file.name}</p>
                  )}
                  {uploading && (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                      <p className="mt-2 text-sm text-gray-600">
                        {file ? "Encrypting and uploading..." : "Loading sample data..."}
                      </p>
                    </div>
                  )}
                  {uploadComplete && (
                    <div className="flex flex-col items-center">
                      <CheckCircle className="h-12 w-12 text-green-500" />
                      <p className="mt-2 text-sm text-gray-600">
                        {file ? "Upload complete!" : `${activeSample} sample data loaded!`}
                      </p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            {error && <p className="text-red-500 text-sm py-2">{error}</p>}
            {!activeSample && (
              <button
                onClick={encryptAndUploadFile}
                disabled={!file || uploading}
                className="mr-4 px-4 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload PDF
                </div>
              </button>
            )}
          </div>
          <div className="flex items-center justify-center">
            <Lock className="h-5 w-5 text-indigo-500 mr-2" />
            <p className="text-xs text-gray-500">Your CSV is deleted immediately after processing.</p>
          </div>
        </div>

        {/* Sample Files Section */}
        {isTrial && (
          <div>
            {/* Separator */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
            </div>
            
            <div className="text-center py-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Not ready to upload? Try our sample data
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Explore our platform features with pre-made sample datasets
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleFiles.map((sample, index) => (
                <div 
                  key={index} 
                  className="rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-center mb-1">
                      <h4 className="text-lg font-semibold text-gray-900">{sample.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{sample.description}</p>
                    <p className="text-sm text-gray-500 mb-1">
                      {sample.rowCount}
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleDownload(sample.type)}
                        disabled={uploading}
                        className="w-full px-4 py-2 text-sm font-medium text-gray-100 bg-gray-600 rounded-md hover:bg-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center justify-center">
                          <Download className="h-4 w-4 mr-2" />
                          Try this sample
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      
      </div>
    </div>
  );
};

export default FileUploader;