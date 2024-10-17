import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
    Card,
    CardContent,
    Typography,
    Grid2 as Grid,
    Switch,
    FormControlLabel,
    TextField,
    Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import AddClientModal from './AddClientModal';
import { authenticateGoogleContacts, listGoogleContacts, createGoogleContact } from '../../utils/googleContactsApi';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { fetchLastSync, updateLastSync } from '../../store/lastSyncSlice';

const columns = [
    { field: 'name', headerName: 'Name', width: 200, sortable: true, renderCell: (params) => params.row.names[0].displayName },
    { field: 'email', headerName: 'Email', width: 250, sortable: true },
    { field: 'phone', headerName: 'Phone', width: 150, sortable: true },
    { field: 'fullAddress', headerName: 'Address', width: 250, sortable: true },
    { field: 'status', headerName: 'Status', width: 120, sortable: true },
];

const ClientsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Initialize the hook
    const [contacts, setContacts] = useState([]);
    const [tableView, setTableView] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filteredClients, setFilteredClients] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [lastSyncedAt, setLastSyncedAt] = useState(null);
    const [newClientData, setNewClientData] = useState({
        givenName: '',
        familyName: '',
        email: '',
        phone: '',
    });

    const lastSync = useSelector((state) => state.lastSync.lastSync);

    useEffect(() => {
        dispatch(fetchLastSync());
        const fetchContacts = async () => {
            try {
                await authenticateGoogleContacts();
                const googleContacts = await listGoogleContacts();
                const formattedContacts = googleContacts.map((contact) => {
                    const name = contact.names ? contact.names[0].displayName : '';
                    const email = contact.emailAddresses ? contact.emailAddresses[0].value : '';
                    const phone = contact.phoneNumbers ? contact.phoneNumbers[0].value : '';
                    const fullAddress = contact.addresses ? contact.addresses[0].formattedValue : '';
                    const status = contact.memberships ? contact.memberships[0].contactGroupMembership.contactGroupId : '';
                    return { ...contact, name, email, phone, fullAddress, status };
                });
                setContacts(formattedContacts);
                setFilteredClients(formattedContacts);
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        };

        fetchContacts();
    }, []);

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setNewClientData({
            givenName: '',
            familyName: '',
            email: '',
            phone: '',
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewClientData({ ...newClientData, [name]: value });
    };

    const handleAddClient = async () => {
        try {
            await createGoogleContact(newClientData);
            setContacts([...contacts, newClientData]);
            setFilteredClients([...contacts, newClientData]);
            handleCloseModal();
            alert('Client added successfully!');
        } catch (error) {
            console.error('Error adding client:', error);
            alert('Failed to add client.');
        }
    };

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearchText(value);

        if (value === '') {
            setFilteredClients(contacts);
        } else {
            const filtered = contacts.filter((client) =>
                ['name', 'email', 'phone', 'fullAddress', 'status'].some((field) =>
                    client[field]?.toLowerCase().includes(value.toLowerCase())
                )
            );
            setFilteredClients(filtered);
        }
    };

    const handleToggleChange = () => {
        setTableView(!tableView);
    };

    const handleSyncGoogleContacts = async () => {
        try {
            console.log('Syncing Google Contacts...');
            await dispatch(updateLastSync(lastSync && lastSync[0]._id));
        } catch (error) {
            console.error('Error syncing Google Contacts:', error);
            alert('Failed to sync Google Contacts.');
        }
    };

    useEffect(() => {
        if (lastSync) {
            const lastSyncTime = moment(lastSync[0].lastSyncedAt).fromNow();
            setLastSyncedAt(lastSyncTime);
        }
    }, [lastSync]);

    // Handle row click to navigate to client detail page
    const handleRowClick = (params) => {
        navigate(`/clients/${params.row.resourceName}`);
    };

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <FormControlLabel
                    control={<Switch checked={tableView} onChange={handleToggleChange} color="primary" />}
                    label={tableView ? 'Table View' : 'Card View'}
                />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="textSecondary" style={{ marginRight: '20px' }}>
                        Last Synced: {lastSyncedAt || 'Never'}
                    </Typography>
                    <Button variant="contained" color="primary" onClick={handleSyncGoogleContacts} sx={{ m: 2 }}>
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
                        rowsPerPageOptions={[5, 10, 20]}
                        getRowId={(row) => row.resourceName}
                        onRowClick={handleRowClick} // Add onRowClick event
                    />
                </div>
            ) : (
                <Grid container spacing={2}>
                    {filteredClients.map((client) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={client.resourceName}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6">{client.name}</Typography>
                                    <Typography color="textSecondary">
                                        <strong>Email: </strong>{client.email}
                                    </Typography>
                                    <Typography color="textSecondary">Phone: {client.phone}</Typography>
                                    <Typography color="textSecondary">Address: {client.fullAddress}</Typography>
                                    <Typography color="textSecondary">Status: {client.status}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <AddClientModal
                handleAddClient={handleAddClient}
                handleCloseModal={handleCloseModal}
                openModal={openModal}
                newClientData={newClientData}
                handleInputChange={handleInputChange}
            />
        </div>
    );
};

export default ClientsPage;