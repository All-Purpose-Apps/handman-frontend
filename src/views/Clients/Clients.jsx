import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { handleGoogleSignIn } from '../../utils/handleGoogleSignIn';
import {
    Card,
    CardContent,
    Typography,
    TextField,
    FormControlLabel,
    Switch,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate, useLocation } from 'react-router-dom';
import AddClientModal from './AddClientModal';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { fetchLastSync, updateLastSync } from '../../store/lastSyncSlice';
import { addClient, fetchClients, syncClients, createGoogleContact } from '../../store/clientSlice';
import ClientCard from '../../components/ClientCard';
import ClientButtons from '../../components/ClientButtons';
import axios from 'axios';

const columns = [
    { field: 'name', headerName: 'Name', width: 200, sortable: true },
    { field: 'email', headerName: 'Email', width: 250, sortable: true },
    { field: 'phone', headerName: 'Phone', width: 150, sortable: true },
    { field: 'address', headerName: 'Address', width: 250, sortable: true },
    { field: 'status', headerName: 'Status', width: 240, sortable: true },
];

const ClientsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const auth = getAuth();
    const location = useLocation();

    const [userEmail, setUserEmail] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [tableView, setTableView] = useState(() => {
        const savedTableView = localStorage.getItem('tableView');
        return savedTableView !== null ? JSON.parse(savedTableView) : true;
    });
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
    const clients = useSelector((state) => state.clients.clients);

    // Auth listener to capture logged-in user's email

    useEffect(() => {
        if (location.state?.openAddClientModal) {
            setOpenModal(true);

            // Clear the location state after opening the modal
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email);
            } else {
                setUserEmail(null);
            }
        });
        return () => unsubscribe();
    }, [auth]);

    // Fetch contacts with userEmail as a query param
    const fetchContacts = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken || !userEmail) {
            console.error('Access token or user email not found.');
            return;
        }

        try {
            const response = await axios.get(
                'http://localhost:3000/api/google/contacts',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: { email: userEmail },
                }
            );
            return response.data;
        } catch (error) {
            try {
                await handleGoogleSignIn(auth);
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        }
    };

    const fetchClientsFromMongo = async () => {
        try {
            const { payload } = await dispatch(fetchClients());
            setFilteredClients(payload);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    useEffect(() => {
        if (userEmail) {
            fetchClientsFromMongo();
            handleSyncGoogleContacts();
        }
    }, [dispatch, userEmail]);

    useEffect(() => {
        if (lastSync && lastSync.length > 0) {
            const lastSyncTime = moment(lastSync[0].lastSyncedAt).fromNow();
            setLastSyncedAt(lastSyncTime);

            const intervalId = setInterval(() => {
                setLastSyncedAt(moment(lastSync[0].lastSyncedAt).fromNow());
            }, 60000); // 1 minute

            return () => clearInterval(intervalId);
        }
    }, [lastSync]);

    useEffect(() => {
        localStorage.setItem('tableView', JSON.stringify(tableView));
    }, [tableView]);

    const handleSyncGoogleContacts = async () => {
        try {
            const contacts = await fetchContacts();
            await dispatch(syncClients(contacts));
            if (lastSync && lastSync.length > 0) {
                await dispatch(updateLastSync(lastSync[0]._id));
            }
            await dispatch(fetchLastSync());
            await fetchClientsFromMongo();
        } catch (error) {
            console.error('Error syncing Google Contacts:', error);
            alert('Failed to sync Google Contacts.');
        }
    };

    const handleOpenModal = () => setOpenModal(true);
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

    const handleAddClient = async (e) => {
        e.preventDefault();
        try {
            const contact = await dispatch(createGoogleContact(newClientData));
            const resourceName = contact.payload.contact.resourceName;
            await dispatch(addClient({ ...newClientData, name: `${newClientData.givenName} ${newClientData.familyName}`, resourceName }));
            handleCloseModal();
            await handleSyncGoogleContacts();
            await dispatch(fetchLastSync());
            await fetchClientsFromMongo();
        } catch (error) {
            console.error('Error adding client:', error);
            alert('Failed to add client.');
        }
    };

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearchText(value);

        if (value === '') {
            setFilteredClients(clients);
        } else {
            const filtered = clients.filter((client) =>
                ['name', 'email', 'phone', 'fullAddress', 'status'].some((field) =>
                    client[field]?.toLowerCase().includes(value.toLowerCase())
                )
            );
            setFilteredClients(filtered);
        }
    };

    const handleToggleChange = () => setTableView(!tableView);

    const handleRowClick = (params) => navigate(`/clients/${params.row._id}`);
    const handleCardClick = (clientId) => navigate(`/clients/${clientId}`);

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <FormControlLabel
                    control={<Switch checked={tableView} onChange={handleToggleChange} color="primary" />}
                    label={tableView ? 'Table View' : 'Card View'}
                />
                <ClientButtons
                    lastSyncedAt={lastSyncedAt}
                    handleSyncGoogleContacts={handleSyncGoogleContacts}
                    handleOpenModal={handleOpenModal}
                />
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
                        getRowId={(row) => row._id}
                        onRowClick={handleRowClick}
                        sx={{
                            '& .MuiDataGrid-row:hover': { cursor: 'pointer' },
                        }}
                    />
                </div>
            ) : (
                <Grid container spacing={2}>
                    {filteredClients.map((client) => (
                        <Grid xs={12} sm={6} md={4} key={client._id}>
                            <ClientCard client={client} handleCardClick={handleCardClick} />
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