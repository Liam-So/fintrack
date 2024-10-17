import React, { useState, useEffect } from 'react';
import { Upload, Lock, CheckCircle } from 'lucide-react';
import TransactionReview from '../components/TransactionReview';
import { api } from '../axios';
import { useParams, useLocation } from 'react-router-dom';

const SecureFileUpload = ({ isTrial }) => {
  const [publicKey, setPublicKey] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const location = useLocation();
  const { id } = useParams();

  // Access the state
  const { state } = location;

  useEffect(() => {
    if (isTrial) {
      setCategories(state.selectedCategories);
    } else {
      const fetchUserCategories = async () => {
        try {
          const { data } = await api.get(`/users/${id}/categories`);
          setCategories(data);
        } catch (error) {
          console.error(error);
        }
      }
      fetchUserCategories();
    }
  }, []);

  const encryptAndUploadFile = async () => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    try {
      setUploading(true);

      const { data } = await api.post(`/extract_csv/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Decrypt the transactions
      data.transactions.map(transaction => {
        let newDate = new Date(transaction.date);
        transaction.date = newDate;
      })

      setTransactions(data.transactions)
      setUploadComplete(true)
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <>
    {(transactions.length > 0 && uploadComplete) ? (
     <TransactionReview 
        transactions={transactions}
        categories={categories} 
        isTrialFlow={isTrial}
        income={state?.income}
     /> 
    ): (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-semibold text-gray-900">
              Secure File Upload
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Upload your sensitive documents with end-to-end encryption
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
                          <span className="relative bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            Upload a file
                          </span>
                          <p className="pl-1">or drag and drop</p>
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
                        <p className="mt-2 text-sm text-gray-600">Encrypting and uploading...</p>
                      </div>
                    )}
                    {uploadComplete && (
                      <div className="flex flex-col items-center">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                        <p className="mt-2 text-sm text-gray-600">Upload complete!</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
            <div className='flex items-center justify-center'>
              <button
                  onClick={encryptAndUploadFile}
                  className="mr-4 px-4 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-80"
                >
                  <div className="flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload PDF
                  </div>
              </button>
            </div>
            <div className="flex items-center justify-center">
              <Lock className="h-5 w-5 text-indigo-500 mr-2" />
              <p className="text-xs text-gray-500">Your files are encrypted end-to-end</p>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default SecureFileUpload;