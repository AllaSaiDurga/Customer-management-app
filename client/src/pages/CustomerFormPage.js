import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import CustomerForm from '../components/CustomerForm';

function CustomerFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState({
        first_name: '',
        last_name: '',
        phone_number: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchCustomer();
        }
    }, [id]);

    const fetchCustomer = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/customers/${id}`);
            setCustomer(response.data.data);
        } catch (error) {
            console.error('Error fetching customer:', error);
            setError('Failed to load customer data.');
        }
    };

    const handleSubmit = async (formData) => {
        setError('');

        if (!formData.first_name || !formData.last_name || !formData.phone_number) {
            setError('All fields are required.');
            return;
        }

        try {
            if (id) {
                await axios.put(`http://localhost:5000/api/customers/${id}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/customers', formData);
            }
            navigate('/customers');
        } catch (error) {
            console.error('Error saving customer:', error);
            setError(error.response?.data?.error || 'An error occurred while saving the customer.');
        }
    };

    const handleCancel = () => {
        navigate('/customers');
    };

    return (
        <div>
            <h1>{id ? 'Edit Customer' : 'Create New Customer'}</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <CustomerForm initialData={customer} onSubmit={handleSubmit} onCancel={handleCancel} />
        </div>
    );
}

export default CustomerFormPage;


