import React from 'react';
import { Link } from 'react-router-dom';

function CustomerList({ customers, handleDelete }) {
    return (
        <ul>
            {customers.map(customer => (
                <li key={customer.id}>
                    <Link to={`/customers/${customer.id}`}>
                        {customer.first_name} {customer.last_name} - {customer.phone_number}
                    </Link>
                    <Link to={`/customers/${customer.id}/edit`}><button>Edit</button></Link>
                    <button onClick={() => handleDelete(customer.id)}>Delete</button>
                </li>
            ))}
        </ul>
    );
}

export default CustomerList;


