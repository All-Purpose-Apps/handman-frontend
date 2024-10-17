import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInvoices } from '../../store/invoiceSlice';
import { useNavigate } from 'react-router-dom';

const columns = [

    { field: 'invoiceNumber', headerName: 'Invoice Number', width: 150 },
    {
        field: 'invoiceDate',
        headerName: 'Invoice Date',
        width: 150,
        valueGetter: (params) => new Date(params).toLocaleDateString(),
    },
    {
        field: 'dueDate',
        headerName: 'Due Date',
        width: 150,
        valueGetter: (params) => {
            return new Date(params).toLocaleDateString()
        },
    },
    {
        field: 'client', headerName: 'Client', width: 200, valueGetter: (params) => {
            return params.firstName + ' ' + params.lastName;
        }
    },
    {
        field: 'items',
        headerName: 'Items',
        width: 300,
        valueGetter: (params) => {
            return params
                .map((item) => `${item.description} (Qty: ${item.quantity}, Rate: $${item.rate})`)
                .join(', ');
        }
    },
    { field: 'subTotal', headerName: 'Sub Total', width: 120 },
    { field: 'total', headerName: 'Total', width: 120 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'notes', headerName: 'Notes', width: 200 },
    {
        field: 'createdAt',
        headerName: 'Created At',
        width: 150,
        valueGetter: (params) => new Date(params.createdAt).toLocaleDateString(),
    },
];

const InvoicesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const invoices = useSelector((state) => state.invoices.invoices);
    const [searchText, setSearchText] = useState('');
    const [filteredInvoices, setFilteredInvoices] = useState([]);

    useEffect(() => {
        const getInvoices = async () => {
            try {
                await dispatch(fetchInvoices());
            } catch (error) {
                console.error('Failed to fetch invoices', error);
            }
        };
        getInvoices();
    }, [dispatch]);
    useEffect(() => {
        // Whenever `invoices` or `searchText` changes, update filteredInvoices
        setFilteredInvoices(
            invoices.filter((invoice) =>
                invoice.invoiceNumber.toLowerCase().includes(searchText.toLowerCase()) ||
                (invoice.firstName + ' ' + invoice.lastName).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [invoices, searchText]);

    const handleSearch = (event) => {
        setSearchText(event.target.value);
    };

    const handleGoToInvoice = (params) => {
        navigate(`/invoices/${params}`);
    }

    return (
        <div style={{ padding: 20 }}>
            <TextField
                label="Search Invoices"
                variant="outlined"
                value={searchText}
                onChange={handleSearch}
                style={{ marginBottom: 20, width: '100%' }}
            />

            <div style={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={filteredInvoices}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    onRowClick={(params) => handleGoToInvoice(params.row._id)}
                    getRowId={(row) => row._id}
                    sx={{
                        '& .MuiDataGrid-row:hover': {
                            cursor: 'pointer',
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default InvoicesPage;