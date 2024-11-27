import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import OfficialFileUploader from './OfficialFileUploader';
import TrialFileUploaderPage from './TrialFileUploaderPage';

const UploadPage = ({ isTrial }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className='flex min-h-screen bg-custom'>
      <Sidebar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col">
        {isTrial ? (
        <TrialFileUploaderPage />
        ) : (
        <OfficialFileUploader />
        )}
      </div> 
    </div> 
  )
}

export default UploadPage