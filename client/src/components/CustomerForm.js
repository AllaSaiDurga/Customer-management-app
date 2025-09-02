import React, { useState, useEffect } from 'react';

function CustomerForm({ initialData = {}, onSubmit, onCancel }) {
    const [customer, setCustomer] = useState(initialData);

    useEffect(() => {
        setCustomer(initialData);
    }, [initialData]);

    const handleChange = (e) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(customer);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>First Name:</label>
                <input type="text" name="first_name" value={customer.first_name || ''} onChange={handleChange} required />
            </div>
            <div>
                <label>Last Name:</label>
                <input type="text" name="last_name" value={customer.last_name || ''} onChange={handleChange} required />
            </div>
            <div>
                <label>Phone Number:</label>
                <input type="text" name="phone_number" value={customer.phone_number || ''} onChange={handleChange} required />
            </div>
            <button type="submit">Save Customer</button>
            <button type="button" onClick={onCancel}>Cancel</button>
        </form>
    );
}

export default CustomerForm;


