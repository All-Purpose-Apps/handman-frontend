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
    CircularProgress,
    Box,
    Modal,
    useTheme,
    useMediaQuery,
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
import { formatPhoneNumber } from '../../utils/formatPhoneNumber';
import axios from 'axios';


const ClientsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const auth = getAuth();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
    const [isCreatingClient, setIsCreatingClient] = useState(false);
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
                `${import.meta.env.VITE_BACKEND_URL}/api/google/contacts`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: { email: userEmail },
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error fetching contacts:', error);
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
        fetchClientsFromMongo();
        if (userEmail) {
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

    // useEffect(() => {
    //     localStorage.setItem('tableView', JSON.stringify(tableView));
    // }, [tableView]);

    useEffect(() => {
        setFilteredClients(clients);
    }, [clients]);

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
    const handleCloseModal = (event, reason) => {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            setOpenModal(false);
        }
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
        setIsCreatingClient(true);
        try {
            const contact = await dispatch(createGoogleContact(newClientData));
            const resourceName = contact.payload.contact.resourceName;

            await dispatch(addClient({ ...newClientData, name: `${newClientData.givenName} ${newClientData.familyName}`, resourceName, statusHistory: [{ status: 'created by user', date: new Date().toISOString() }] }));
            handleCloseModal();
            navigate('/clients');
        } catch (error) {
            console.error('Error adding client:', error);
            alert('Failed to add client.');
        } finally {
            setIsCreatingClient(false);
        }
    };

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearchText(value);

        if (value === '') {
            setFilteredClients(clients);
        } else {
            const filtered = clients.filter((client) =>
                ['name', 'email', 'phone', 'address'].some((field) => {
                    return client[field]?.toLowerCase().includes(value.toLowerCase())
                }
                )
            );
            setFilteredClients(filtered);
        }
    };

    const handleToggleChange = () => setTableView(!tableView);

    const handleRowClick = (params) => navigate(`/clients/${params.row._id}`);
    const handleCardClick = (clientId) => navigate(`/clients/${clientId}`);
    const columns = isMobile
        ? [
            {
                field: 'name',
                headerName: 'Name',
                flex: 1,
                minWidth: 150,
                sortable: true,
            },
            {
                field: 'statusHistory',
                headerName: 'Status',
                flex: 1,
                minWidth: 150,
                sortable: true,
                renderCell: (params) => {
                    const sortedStatusHistory = [...params.value].sort((a, b) => new Date(b.date) - new Date(a.date));
                    const recentStatus = sortedStatusHistory[0]?.status || 'N/A';
                    const colorMap = {
                        'ACTIVE': '#388e3c',
                        'INACTIVE': '#757575',
                        'ARCHIVED': '#616161',
                        'WORK IN PROGRESS': '#1976d2',
                        'COMPLETED': '#388e3c',
                        'CANCELED': '#b71c1c',
                        'FOLLOW-UP': '#fbc02d',
                        'CREATED BY USER': '#0288d1',
                        'IMPORTED FROM GOOGLE': '#7b1fa2',
                        'INQUIRY RECEIVED': '#fbc02d',
                        'PROPOSAL CREATED': '#0288d1',
                        'PROPOSAL SENT': '#fbc02d',
                        'PROPOSAL UPDATED': '#0288d1',
                        'PROPOSAL ACCEPTED': '#388e3c',
                        'PROPOSAL SIGNED': '#388e3c',
                        'PROPOSAL REJECTED': '#b71c1c',
                        'PROPOSAL DELETED': '#757575',
                        'INVOICE CREATED': '#0288d1',
                        'INVOICE SENT': '#fbc02d',
                        'INVOICE UPDATED': '#0288d1',
                        'INVOICE APPROVED': '#388e3c',
                        'INVOICE REJECTED': '#b71c1c',
                        'INVOICE PAID': '#ffd600',
                        'INVOICE PAID AND SIGNED': '#ffd600',
                        'INVOICE DELETED': '#757575',
                        'APPOINTMENT SCHEDULED': '#1976d2',
                        'TASK ASSIGNED': '#1976d2',
                        'REVIEW REQUESTED': '#388e3c',
                    };
                    const bgColor = colorMap[recentStatus.toUpperCase()] || '#e0e0e0';
                    return (
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: bgColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 1,
                            }}
                        >
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                                {recentStatus}
                            </Typography>
                        </Box>
                    );
                },
            },
        ]
        : isTablet
            ? [
                {
                    field: 'name',
                    headerName: 'Name',
                    flex: 1,
                    minWidth: 150,
                    sortable: true,
                },
                {
                    field: 'email',
                    headerName: 'Email',
                    flex: 1,
                    minWidth: 180,
                    sortable: true,
                },
                {
                    field: 'statusHistory',
                    headerName: 'Status',
                    flex: 1,
                    minWidth: 150,
                    sortable: true,
                    renderCell: (params) => {
                        const sortedStatusHistory = [...params.value].sort((a, b) => new Date(b.date) - new Date(a.date));
                        const recentStatus = sortedStatusHistory[0]?.status || 'N/A';
                        const colorMap = {
                            'ACTIVE': '#388e3c',
                            'INACTIVE': '#757575',
                            'ARCHIVED': '#616161',
                            'WORK IN PROGRESS': '#1976d2',
                            'COMPLETED': '#388e3c',
                            'CANCELED': '#b71c1c',
                            'FOLLOW-UP': '#fbc02d',
                            'CREATED BY USER': '#0288d1',
                            'IMPORTED FROM GOOGLE': '#7b1fa2',
                            'INQUIRY RECEIVED': '#fbc02d',
                            'PROPOSAL CREATED': '#0288d1',
                            'PROPOSAL SENT': '#fbc02d',
                            'PROPOSAL UPDATED': '#0288d1',
                            'PROPOSAL ACCEPTED': '#388e3c',
                            'PROPOSAL SIGNED': '#388e3c',
                            'PROPOSAL REJECTED': '#b71c1c',
                            'PROPOSAL DELETED': '#757575',
                            'INVOICE CREATED': '#0288d1',
                            'INVOICE SENT': '#fbc02d',
                            'INVOICE UPDATED': '#0288d1',
                            'INVOICE APPROVED': '#388e3c',
                            'INVOICE REJECTED': '#b71c1c',
                            'INVOICE PAID': '#ffd600',
                            'INVOICE PAID AND SIGNED': '#ffd600',
                            'INVOICE DELETED': '#757575',
                            'APPOINTMENT SCHEDULED': '#1976d2',
                            'TASK ASSIGNED': '#1976d2',
                            'REVIEW REQUESTED': '#388e3c',
                        };
                        const bgColor = colorMap[recentStatus.toUpperCase()] || '#e0e0e0';
                        return (
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: bgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 1,
                                }}
                            >
                                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    {recentStatus}
                                </Typography>
                            </Box>
                        );
                    },
                },
            ]
            : [
                {
                    field: 'name',
                    headerName: 'Name',
                    flex: 1,
                    minWidth: 150,
                    sortable: true,
                },
                {
                    field: 'email',
                    headerName: 'Email',
                    flex: 1,
                    minWidth: 180,
                    sortable: true,
                },
                {
                    field: 'phone',
                    headerName: 'Phone',
                    flex: 1,
                    minWidth: 120,
                    sortable: true,
                    valueFormatter: (params) => formatPhoneNumber(params),
                },
                {
                    field: 'address',
                    headerName: 'Address',
                    flex: 1,
                    minWidth: 180,
                    sortable: true,
                },
                {
                    field: 'statusHistory',
                    headerName: 'Status',
                    flex: 1,
                    minWidth: 150,
                    sortable: true,
                    renderCell: (params) => {
                        const sortedStatusHistory = [...params.value].sort((a, b) => new Date(b.date) - new Date(a.date));
                        const recentStatus = sortedStatusHistory[0]?.status || 'N/A';
                        const colorMap = {
                            'ACTIVE': '#388e3c',
                            'INACTIVE': '#757575',
                            'ARCHIVED': '#616161',
                            'WORK IN PROGRESS': '#1976d2',
                            'COMPLETED': '#388e3c',
                            'CANCELED': '#b71c1c',
                            'FOLLOW-UP': '#fbc02d',
                            'CREATED BY USER': '#0288d1',
                            'IMPORTED FROM GOOGLE': '#7b1fa2',
                            'INQUIRY RECEIVED': '#fbc02d',
                            'PROPOSAL CREATED': '#0288d1',
                            'PROPOSAL SENT': '#fbc02d',
                            'PROPOSAL UPDATED': '#0288d1',
                            'PROPOSAL ACCEPTED': '#388e3c',
                            'PROPOSAL SIGNED': '#388e3c',
                            'PROPOSAL REJECTED': '#b71c1c',
                            'PROPOSAL DELETED': '#757575',
                            'INVOICE CREATED': '#0288d1',
                            'INVOICE SENT': '#fbc02d',
                            'INVOICE UPDATED': '#0288d1',
                            'INVOICE APPROVED': '#388e3c',
                            'INVOICE REJECTED': '#b71c1c',
                            'INVOICE PAID': '#ffd600',
                            'INVOICE PAID AND SIGNED': '#ffd600',
                            'INVOICE DELETED': '#757575',
                            'APPOINTMENT SCHEDULED': '#1976d2',
                            'TASK ASSIGNED': '#1976d2',
                            'REVIEW REQUESTED': '#388e3c',
                        };
                        const bgColor = colorMap[recentStatus.toUpperCase()] || '#e0e0e0';
                        return (
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: bgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 1,
                                }}
                            >
                                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    {recentStatus}
                                </Typography>
                            </Box>
                        );
                    },
                },
            ];

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', flexDirection: (isMobile || isTablet) ? 'column' : 'row', gap: 16, marginBottom: 20 }}>
                <TextField
                    label="Search Clients"
                    variant="outlined"
                    value={searchText}
                    onChange={handleSearch}
                    style={{ width: '100%' }}
                />
                <ClientButtons
                    lastSyncedAt={lastSyncedAt}
                    handleSyncGoogleContacts={handleSyncGoogleContacts}
                    handleOpenModal={handleOpenModal}
                />
            </div>


            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '100%' }}>
                {isMobile ? (
                    <Box>
                        {filteredClients.map((client) => (
                            <Card
                                key={client._id}
                                onClick={() => handleCardClick(client._id)}
                                sx={{
                                    mb: 1,
                                    p: 2,
                                    cursor: 'pointer',
                                    '&:hover': { backgroundColor: '#f5f5f5' },
                                }}
                            >
                                <Typography variant="body1">{client.name}</Typography>
                            </Card>
                        ))}
                    </Box>
                ) : (
                    <DataGrid
                        rows={filteredClients}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10, 20]}
                        getRowId={(row) => row._id}
                        onRowClick={handleRowClick}
                        pageSizeOptions={[5, 10, 25]}
                        initialState={{
                            sorting: {
                                sortModel: [{ field: 'name', sort: 'asc' }],
                            },
                            pagination: {
                                paginationModel: { pageSize: 10, page: 0 },
                            },
                        }}
                        sx={{
                            '& .MuiDataGrid-row:hover': { cursor: 'pointer' },
                        }}
                    />
                )}
            </div>


            <AddClientModal
                handleAddClient={handleAddClient}
                handleCloseModal={handleCloseModal}
                openModal={openModal}
                newClientData={newClientData}
                handleInputChange={handleInputChange}
            />
            <Modal
                open={isCreatingClient}
                aria-labelledby="creating-client-modal"
                aria-describedby="creating-client-description"
            >
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="20vh"
                    bgcolor="background.paper"
                    p={3}
                    borderRadius={1}
                    boxShadow={3}
                >
                    <Box textAlign="center">
                        <CircularProgress />
                        <Typography variant="h6" mt={2}>
                            Creating Client...
                        </Typography>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

export default ClientsPage;