import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Switch,
    FormControlLabel,
    TextField,
} from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';

const clientsData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '555-1234' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '555-5678' },
    // Add more clients as needed
];

const columns = [
    { field: 'name', headerName: 'Name', width: 150, sortable: true },
    { field: 'email', headerName: 'Email', width: 200, sortable: true },
    { field: 'phone', headerName: 'Phone', width: 150, sortable: true },
];

const ClientsPage = () => {
    const [tableView, setTableView] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filteredClients, setFilteredClients] = useState(clientsData);

    const handleToggleChange = (event) => {
        setTableView(event.target.checked);
    };

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearchText(value);
        const filtered = clientsData.filter((client) =>
            client.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredClients(filtered);
    };

    return (
        <div style={{ padding: 20 }}>
            <FormControlLabel
                control={
                    <Switch
                        checked={tableView}
                        onChange={handleToggleChange}
                        color="primary"
                    />
                }
                label={tableView ? 'Table View' : 'Card View'}
            />

            <TextField
                label="Search Clients"
                variant="outlined"
                value={searchText}
                onChange={handleSearch}
                style={{ marginBottom: 20, width: '100%' }}
            />

            {tableView ? (
                <div style={{ height: 500, width: '100%' }}>
                    <DataGrid
                        rows={filteredClients}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                    />
                </div>
            ) : (
                <Grid container spacing={2}>
                    {filteredClients.map((client) => (
                        <Grid item xs={12} sm={6} md={4} key={client.id}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6">{client.name}</Typography>
                                    <Typography color="textSecondary">{client.email}</Typography>
                                    <Typography color="textSecondary">{client.phone}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </div>
    );
};

export default ClientsPage;