import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CustomerList from '../components/CustomerList';

function CustomerListPage() {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchCustomers();
    }, [search, city, state, pinCode, page, limit]);

    const fetchCustomers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/customers', {
                params: { search, city, state, pin_code: pinCode, page, limit }
            });
            setCustomers(response.data.data);
            setTotalPages(Math.ceil(response.data.totalCount / limit) || 1);
        } catch (error) {
            console.error('There was an error fetching the customers!', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await axios.delete(`http://localhost:5000/api/customers/${id}`);
                fetchCustomers();
            } catch (error) {
                console.error('There was an error deleting the customer!', error);
            }
        }
    };

    const handleClearFilters = () => {
        setSearch('');
        setCity('');
        setState('');
        setPinCode('');
        setPage(1);
    };

    return (
        <div>
            <h1>Customer List</h1>
            <div>
                <input type="text" placeholder="Search by name or phone" value={search} onChange={(e) => setSearch(e.target.value)} />
                <input type="text" placeholder="Filter by City" value={city} onChange={(e) => setCity(e.target.value)} />
                <input type="text" placeholder="Filter by State" value={state} onChange={(e) => setState(e.target.value)} />
                <input type="text" placeholder="Filter by Pin Code" value={pinCode} onChange={(e) => setPinCode(e.target.value)} />
                <button onClick={handleClearFilters}>Clear Filters</button>
            </div>
            <Link to="/customers/new"><button>Create New Customer</button></Link>
            <CustomerList customers={customers} handleDelete={handleDelete} />
            <div>
                <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1}>Previous</button>
                <span> Page {page} of {totalPages} </span>
                <button onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>Next</button>
                <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                </select>
            </div>
        </div>
    );
}

export default CustomerListPage;


