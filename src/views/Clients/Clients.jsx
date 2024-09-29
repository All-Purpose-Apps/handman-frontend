import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchClients, addClient } from '../../store/clientSlice';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router
import { DataGrid } from '@mui/x-data-grid';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Switch,
    FormControlLabel,
    TextField,
    Button,
    Modal,
    Box,
} from '@mui/material';

const columns = [
    { field: 'name', headerName: 'Name', width: 200, sortable: true },
    { field: 'email', headerName: 'Email', width: 250, sortable: true },
    { field: 'phone', headerName: 'Phone', width: 150, sortable: true },
    {
        field: 'fullAddress',
        headerName: 'Address',
        width: 250,
        sortable: true,
        renderCell: (params) => {
            const address = params.value;
            const maxLength = 50; // Limit the displayed address length
            return address.length > maxLength
                ? `${address.substring(0, maxLength)}...`
                : address;
        },
    },
    { field: 'status', headerName: 'Status', width: 120, sortable: true },
];

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const ClientsPage = () => {
    const clientsFromRedux = useSelector((state) => state.clients.clients);
    const dispatch = useDispatch();
    const navigate = useNavigate(); // React Router hook to navigate

    const [tableView, setTableView] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filteredClients, setFilteredClients] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [newClientData, setNewClientData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        status: '',
    });

    useEffect(() => {
        dispatch(fetchClients());
    }, [dispatch]);

    useEffect(() => {
        if (clientsFromRedux && clientsFromRedux.length > 0) {
            // Process clients to include 'name' and 'fullAddress' fields
            const clientsWithNames = clientsFromRedux.map((client) => {
                const fullAddress = `${client.address || ''}, ${client.city || ''}, ${client.state || ''
                    } ${client.zip || ''}`
                    .trim()
                    .replace(/,\s*,/g, ',')
                    .replace(/^,|,$/g, '');

                return {
                    ...client,
                    name: `${client.firstName} ${client.lastName}`.trim(),
                    fullAddress,
                    id: client._id, // Assuming _id is the unique identifier
                };
            });

            // Fields to search
            const searchableFields = ['name', 'email', 'phone', 'fullAddress', 'status'];

            // Filter clients based on searchText
            const filtered = clientsWithNames.filter((client) =>
                searchableFields.some((field) => {
                    const value = client[field];
                    if (value) {
                        return value.toString().toLowerCase().includes(searchText.toLowerCase());
                    }
                    return false;
                })
            );
            setFilteredClients(filtered);
        }
    }, [clientsFromRedux, searchText]);

    const handleToggleChange = (event) => {
        setTableView(event.target.checked);
    };

    const handleSearch = (event) => {
        setSearchText(event.target.value);
    };

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setNewClientData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zip: '',
            status: '',
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewClientData({ ...newClientData, [name]: value });
    };

    const handleAddClient = (e) => {
        e.preventDefault();
        // Dispatch action to add client
        dispatch(addClient(newClientData));
        handleCloseModal();
    };

    // Placeholder function for syncing Google Contacts
    const handleSyncGoogleContacts = () => {
        // Placeholder function
        // You can implement the actual sync logic here
        console.log('Syncing Google Contacts...');
    };

    // Handle row click
    const handleRowClick = (params) => {
        const clientId = params.row.id; // Get the client id from the clicked row
        navigate(`/clients/${clientId}`); // Navigate to the view client page
    };

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
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
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSyncGoogleContacts}
                        style={{ marginRight: 10 }}
                    >
                        Sync Google Contacts
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleOpenModal}>
                        Add Client
                    </Button>
                </div>
            </div>

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
                        onRowClick={handleRowClick} // Add onRowClick to navigate on click
                    />
                </div>
            ) : (
                <Grid container spacing={2}>
                    {filteredClients.map((client) => (
                        <Grid item xs={12} sm={6} md={4} key={client.id}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6">{client.name}</Typography>
                                    <Typography color="textSecondary">
                                        Email: {client.email}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        Phone: {client.phone}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        Address: {client.fullAddress}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        Status: {client.status}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Modal open={openModal} onClose={handleCloseModal}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2" gutterBottom>
                        Add New Client
                    </Typography>
                    <form onSubmit={handleAddClient}>
                        <TextField
                            label="First Name"
                            name="firstName"
                            value={newClientData.firstName}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Last Name"
                            name="lastName"
                            value={newClientData.lastName}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={newClientData.email}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Phone"
                            name="phone"
                            value={newClientData.phone}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Address"
                            name="address"
                            value={newClientData.address}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="City"
                            name="city"
                            value={newClientData.city}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="State"
                            name="state"
                            value={newClientData.state}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Zip"
                            name="zip"
                            value={newClientData.zip}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Status"
                            name="status"
                            value={newClientData.status}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            style={{ marginTop: 16 }}
                        >
                            Save
                        </Button>
                    </form>
                </Box>
            </Modal>
        </div>
    );
};

export default ClientsPage;