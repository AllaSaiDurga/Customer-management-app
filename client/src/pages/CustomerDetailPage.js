import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import AddressList from '../components/AddressList';
import AddressForm from '../components/AddressForm';

function CustomerDetailPage() {
    const { id } = useParams();
    const [customer, setCustomer] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    useEffect(() => {
        fetchCustomer();
        fetchAddresses();
    }, [id]);

    const fetchCustomer = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/customers/${id}`);
            setCustomer(response.data.data);
        } catch (error) {
            console.error('There was an error fetching the customer details!', error);
        }
    };

    const fetchAddresses = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/customers/${id}/addresses`);
            setAddresses(response.data.data);
        } catch (error) {
            console.error('There was an error fetching the addresses!', error);
        }
    };

    const handleAddAddress = async (formData) => {
        try {
            await axios.post(`http://localhost:5000/api/customers/${id}/addresses`, formData);
            setShowAddressForm(false);
            fetchAddresses();
        } catch (error) {
            console.error('There was an error adding the address!', error);
        }
    };

    const handleUpdateAddress = async (formData) => {
        try {
            await axios.put(`http://localhost:5000/api/addresses/${editingAddress.id}`, formData);
            setEditingAddress(null);
            setShowAddressForm(false);
            fetchAddresses();
        } catch (error) {
            console.error('There was an error updating the address!', error);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                await axios.delete(`http://localhost:5000/api/addresses/${addressId}`);
                fetchAddresses();
            } catch (error) {
                console.error('There was an error deleting the address!', error);
            }
        }
    };

    const handleEditClick = (address) => {
        setEditingAddress(address);
        setShowAddressForm(true);
    };

    const handleCancelAddressForm = () => {
        setShowAddressForm(false);
        setEditingAddress(null);
    };

    if (!customer) {
        return <div>Loading customer details...</div>;
    }

    return (
        <div>
            <h1>Customer Details</h1>
            <p><strong>Name:</strong> {customer.first_name} {customer.last_name}</p>
            <p><strong>Phone:</strong> {customer.phone_number}</p>
            <Link to={`/customers/${customer.id}/edit`}><button>Edit Customer</button></Link>
            <Link to="/customers"><button>Back to Customer List</button></Link>

            <h2>Addresses</h2>
            <button onClick={() => setShowAddressForm(true)}>Add New Address</button>
            <AddressList addresses={addresses} handleDeleteAddress={handleDeleteAddress} handleEditClick={handleEditClick} />

            {showAddressForm && (
                <div>
                    <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                    <AddressForm
                        initialData={editingAddress || {}}
                        onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress}
                        onCancel={handleCancelAddressForm}
                    />
                </div>
            )}
        </div>
    );
}

export default CustomerDetailPage;


