import React, { useEffect } from 'react';
import { api } from '../axios';

const Dashboard = () => {

  useEffect(() => {
    api.get('/categories/percentages')
      .then(response => console.log(response.data))
      .catch(error => console.error('Error fetching public key:', error));
  }, []);

  return (
    <div>Dashboard</div>
  )
}

export default Dashboard