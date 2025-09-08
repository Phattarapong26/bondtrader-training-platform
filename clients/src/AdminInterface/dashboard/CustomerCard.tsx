import React from 'react';
import Avatar from './Avatar';

interface Customer {
  _id: string;
  name: string;
  citizen_id: string;
  created_at: string;
  updated_at: string;
  bond_status?: { status?: string };
  company: string;
  email: string;
  phone: string;
  profilePicture?: string;
}

interface Props {
  customer: Customer;
  onViewDetails: (customer: Customer) => void;
}

const CustomerCard: React.FC<Props> = ({ customer, onViewDetails }) => {
  const handleViewDetails = () => {
    console.log('CustomerCard: Sending customer data:', customer);
    onViewDetails(customer);
  };

  // Add console.log to debug profilePicture
  console.log('Profile Picture URL:', customer.profilePicture);

  return (
    <div id={`customer-card-${customer._id}`} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between h-full">
      <div>
        <div id={`customer-header-${customer._id}`} className="flex items-center mb-4">
          <Avatar 
            name={customer.name} 
            size="md" 
            profilePicture={customer.profilePicture} 
          />
          <span id={`customer-name-${customer._id}`} className="ml-4 text-gray-700 font-semibold">{customer.name}</span>
        </div>
        <div id={`customer-details-${customer._id}`} className="text-gray-600">
          <span id={`customer-company-${customer._id}`}>Company: {customer.company}</span>
          <br />
          <span id={`customer-email-${customer._id}`}>Email: {customer.email}</span>
          <br />
          <span id={`customer-phone-${customer._id}`}>Phone: {customer.phone}</span>
          <br />
          <span id={`customer-status-${customer._id}`}>Bond Status: {customer.bond_status?.status || 'No status available'}</span>
        </div>
      </div>
      <button
        id={`view-details-btn-${customer._id}`}
        onClick={handleViewDetails}
        className="mt-4 bg-yellow-500 text-white py-1 px-4 rounded hover:bg-blue-700 transition-colors duration-300 mb-2"
      >
        View Details
      </button>
    </div>
  );  
};

export default CustomerCard;