import React, { useState } from 'react';

function AddressForm({ initialData = {}, onSubmit, onCancel }) {
    const [address, setAddress] = useState(initialData);

    const handleChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(address);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="address_details" placeholder="Address Details" value={address.address_details || ''} onChange={handleChange} required />
            <input type="text" name="city" placeholder="City" value={address.city || ''} onChange={handleChange} required />
            <input type="text" name="state" placeholder="State" value={address.state || ''} onChange={handleChange} required />
            <input type="text" name="pin_code" placeholder="Pin Code" value={address.pin_code || ''} onChange={handleChange} required />
            <button type="submit">Save Address</button>
            <button type="button" onClick={onCancel}>Cancel</button>
        </form>
    );
}

export default AddressForm;


