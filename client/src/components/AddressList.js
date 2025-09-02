import React from 'react';

function AddressList({ addresses, handleDeleteAddress, handleEditClick }) {
    return (
        <ul>
            {addresses.map(address => (
                <li key={address.id}>
                    {address.address_details}, {address.city}, {address.state}, {address.pin_code}
                    <button onClick={() => handleEditClick(address)}>Edit</button>
                    <button onClick={() => handleDeleteAddress(address.id)}>Delete</button>
                </li>
            ))}
        </ul>
    );
}

export default AddressList;


