import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { TextField } from '@mui/material';

const invoicesData = [
    {
        id: 1,
        invoiceNumber: 'INV-001',
        clientName: 'John Doe',
        amount: 250.0,
        date: '2023-09-01',
    },
    {
        id: 2,
        invoiceNumber: 'INV-002',
        clientName: 'Jane Smith',
        amount: 150.0,
        date: '2023-09-05',
    },
    // Add more invoices as needed, ensuring each has a valid 'amount' field
];

const columns = [
    { field: 'invoiceNumber', headerName: 'Invoice Number', width: 150 },
    { field: 'clientName', headerName: 'Client Name', width: 200 },
    {
        field: 'amount',
        headerName: 'Amount',
        width: 100,
        type: 'number',
        valueFormatter: (params) => {
            const value = Number(params.value);
            return !isNaN(value) ? `$${value.toFixed(2)}` : '';
        },
    },
    { field: 'date', headerName: 'Date', width: 150 },
];

const InvoicesPage = () => {
    const [searchText, setSearchText] = useState('');
    const [filteredInvoices, setFilteredInvoices] = useState(invoicesData);

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearchText(value);

        const filtered = invoicesData.filter((invoice) =>
            invoice.invoiceNumber.toLowerCase().includes(value.toLowerCase()) ||
            invoice.clientName.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredInvoices(filtered);
    };

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
                />
            </div>
        </div>
    );
};

export default InvoicesPage;