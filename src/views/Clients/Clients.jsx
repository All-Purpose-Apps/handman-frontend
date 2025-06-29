import React, { useState, useEffect, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
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
    Backdrop,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Fade
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate, useLocation } from 'react-router';
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

    const [sortField, setSortField] = useState('updatedAt');
    const [sortOrder, setSortOrder] = useState('desc');

    const [device, setDevice] = useState('desktop');

    useEffect(() => {
        const updateDevice = () => {
            const width = window.innerWidth;
            const newDevice =
                width <= theme.breakpoints.values.sm
                    ? 'mobile'
                    : width <= theme.breakpoints.values.md
                        ? 'tablet'
                        : 'desktop';
            setDevice((prev) => (prev !== newDevice ? newDevice : prev));
        };

        updateDevice();
        window.addEventListener('resize', updateDevice);
        return () => window.removeEventListener('resize', updateDevice);
    }, [theme]);

    const [userEmail, setUserEmail] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [tableView, setTableView] = useState(() => {
        const savedTableView = localStorage.getItem('tableView');
        return savedTableView !== null ? JSON.parse(savedTableView) : true;
    });
    const [searchText, setSearchText] = useState('');
    const [filteredClients, setFilteredClients] = useState([]);
    // Infinite scroll state
    const [visibleClients, setVisibleClients] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const itemsPerLoad = 10;
    const [openModal, setOpenModal] = useState(false);
    const [lastSyncedAt, setLastSyncedAt] = useState(null);
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [newClientData, setNewClientData] = useState({
        givenName: '',
        middleName: '',
        familyName: '',
        email: '',
        phone: '',
        address: '',
        streetAddress: '',
        city: '',
        state: '',
        zip: ''
    });
    const [loading, setLoading] = useState(false);
    const [isFetchingClients, setIsFetchingClients] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [isSyncingContacts, setIsSyncingContacts] = useState(false);

    const lastSync = useSelector((state) => state.lastSync.lastSync);
    const clients = useSelector((state) => state.clients.clients);
    const isLoading = useSelector((state) => state.clients.isLoading);
    const isError = useSelector((state) => state.clients.isError);

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
        setIsFetchingClients(true);
        setFetchError(null);
        try {
            const { payload } = await dispatch(fetchClients());

            // Sort by most recent status date
            const sortedByRecentStatus = [...payload].sort((a, b) => {
                const aDate = new Date(
                    [...(a.statusHistory || [])]
                        .sort((x, y) => new Date(y.date) - new Date(x.date))[0]?.date || 0
                );
                const bDate = new Date(
                    [...(b.statusHistory || [])]
                        .sort((x, y) => new Date(y.date) - new Date(x.date))[0]?.date || 0
                );
                return bDate - aDate;
            });

            setFilteredClients(sortedByRecentStatus);
        } catch (error) {
            console.error('Error fetching clients:', error);
            setFetchError('Failed to fetch clients. Please try again.');
        } finally {
            setIsFetchingClients(false);
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
        if (Array.isArray(clients)) {
            const sanitized = clients.filter((c) => typeof c === 'object' && c !== null && c._id);
            setFilteredClients(sanitized);
        } else {
            console.warn('clients is not an array:', clients);
            setFilteredClients([]);
        }
    }, [clients]);

    // Sort filteredClients based on sortField and sortOrder for mobile
    useEffect(() => {
        if (!isMobile) return;

        const sorted = [...filteredClients].sort((a, b) => {
            let fieldA = a[sortField];
            let fieldB = b[sortField];

            if (sortField === 'updatedAt') {
                fieldA = new Date(fieldA || 0);
                fieldB = new Date(fieldB || 0);
                return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
            }

            fieldA = (fieldA || '').toString().toLowerCase();
            fieldB = (fieldB || '').toString().toLowerCase();
            return sortOrder === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
        });

        setFilteredClients(sorted);
    }, [sortField, sortOrder]);

    // Initialize visibleClients when filteredClients changes (for infinite scroll)
    useEffect(() => {
        setVisibleClients(filteredClients.slice(0, itemsPerLoad));
        setHasMore(filteredClients.length > itemsPerLoad);
    }, [filteredClients]);

    // Handler to load more clients for infinite scroll
    const loadMoreClients = () => {
        const next = filteredClients.slice(visibleClients.length, visibleClients.length + itemsPerLoad);
        setVisibleClients(prev => [...prev, ...next]);
        if (visibleClients.length + next.length >= filteredClients.length) {
            setHasMore(false);
        }
    };

    const handleSyncGoogleContacts = async () => {
        setIsSyncingContacts(true);
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
        } finally {
            setIsSyncingContacts(false);
        }
    };

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = (event, reason) => {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            setOpenModal(false);
        }
        setNewClientData({
            givenName: '',
            middleName: '',
            familyName: '',
            email: '',
            phone: '',
            address: '',
            streetAddress: '',
            city: '',
            state: '',
            zip: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewClientData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handles address change from AddressAutocomplete
    const handleAddressChange = (addressObj, isValidSelection) => {
        setNewClientData((prevData) => ({
            ...prevData,
            ...{
                address: addressObj.address,
                streetAddress: addressObj.streetAddress,
                city: addressObj.city,
                state: addressObj.state,
                zip: addressObj.zip
            }
        }));
    };

    const handleAddClient = async (e) => {
        e.preventDefault();
        setIsCreatingClient(true);
        try {
            // Derive address string if not already present
            const contact = await dispatch(createGoogleContact({ ...newClientData }));
            const resourceName = contact.payload.contact.resourceName;

            await dispatch(addClient({
                ...newClientData,
                name: `${newClientData.givenName} ${newClientData.middleName} ${newClientData.familyName}`,
                resourceName,
                statusHistory: [{ status: 'created by user', date: new Date().toISOString() }]
            })).then((response) => {
                console.log("response", response);
                const clientId = response?.payload?._id;
                if (!clientId) {
                    throw new Error('Client creation failed');
                }
                navigate(`/clients/${clientId}`);
            });

            handleCloseModal();

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
        'INVOICE SIGNED AND PAID': '#388e3c',
        'INVOICE DELETED': '#757575',
        'APPOINTMENT SCHEDULED': '#1976d2',
        'TASK ASSIGNED': '#1976d2',
        'REVIEW REQUESTED': '#388e3c',
        'PROPOSAL PDF CREATED': '#0288d1',
        'INVOICE PDF CREATED': '#0288d1',

    }

    const columns = isMobile
        ? [
            {
                field: 'name',
                headerName: 'Name',
                flex: 1,
                minWidth: 150,
                sortable: true,
                renderCell: (params) => {
                    return `${params.row.givenName || 'N/A'} ${params.row.familyName || 'N/A'}`;
                },
                sortComparator: (v1, v2, cellParams1, cellParams2) => {
                    const name1 = `${cellParams1.value || ''} ${cellParams1.value || ''}`;
                    const name2 = `${cellParams2.value || ''} ${cellParams2.value || ''}`;
                    return name1.localeCompare(name2);
                }
            },
            {
                field: 'statusHistory',
                headerName: 'Status',
                flex: 1,
                minWidth: 150,
                sortable: false,
                renderCell: (params) => {
                    const sortedStatusHistory = [...params.value].sort((a, b) => new Date(b.date) - new Date(a.date));
                    const recentStatus = sortedStatusHistory[0]?.status || 'N/A';
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
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: {
                                        xs: '0.75rem',
                                        sm: '0.85rem',
                                        md: '0.95rem',
                                        lg: '1rem',
                                    },
                                }}
                            >
                                {recentStatus}
                            </Typography>
                        </Box>
                    );
                },

            },
        ]
        : isTablet || window.innerWidth <= 1220
            ? [
                {
                    field: 'name',
                    headerName: 'Name',
                    flex: 1,
                    minWidth: 150,
                    sortable: true,
                    renderCell: (params) => {
                        return `${params.row.givenName || 'N/A'} ${params.row.familyName || 'N/A'}`;
                    },
                    sortComparator: (v1, v2, cellParams1, cellParams2) => {
                        const name1 = `${cellParams1.value || ''} ${cellParams1.value || ''}`;
                        const name2 = `${cellParams2.value || ''} ${cellParams2.value || ''}`;
                        return name1.localeCompare(name2);
                    }
                },
                {
                    field: 'email',
                    headerName: 'Email',
                    flex: 1,
                    minWidth: 180,
                    sortable: true,
                },
                {
                    field: 'updatedAt',
                    headerName: 'Updated At',
                    flex: 1,
                    minWidth: 150,
                    sortable: true,
                    valueFormatter: (params) => {
                        return moment(params).format('MM/DD/YY h:mm A');
                    }
                },
                {
                    field: 'statusHistory',
                    headerName: 'Status',
                    flex: 1,
                    minWidth: 150,
                    sortable: false,
                    renderCell: (params) => {
                        const sortedStatusHistory = [...params.value].sort((a, b) => new Date(b.date) - new Date(a.date));
                        const recentStatus = sortedStatusHistory[0]?.status || 'N/A';
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
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: {
                                            xs: '0.75rem',
                                            sm: '0.85rem',
                                            md: '0.95rem',
                                            lg: '1rem',
                                        },
                                    }}
                                >
                                    {recentStatus.toUpperCase()}
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
                    renderCell: (params) => {
                        return `${params.row.givenName || 'N/A'} ${params.row.familyName || 'N/A'}`;
                    },
                    sortComparator: (v1, v2, cellParams1, cellParams2) => {
                        const name1 = `${cellParams1.value || ''} ${cellParams1.value || ''}`;
                        const name2 = `${cellParams2.value || ''} ${cellParams2.value || ''}`;
                        return name1.localeCompare(name2);
                    }
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
                    field: 'createdAt',
                    headerName: 'Created At',
                    flex: 1,
                    minWidth: 150,
                    sortable: true,
                    valueFormatter: (params) => {
                        return moment(params).format('MM/DD/YY h:mm A');
                    }
                },
                {
                    field: 'updatedAt',
                    headerName: 'Updated At',
                    flex: 1,
                    minWidth: 150,
                    sortable: true,
                    valueFormatter: (params) => {
                        return moment(params).format('MM/DD/YY h:mm A');
                    }
                },
                {
                    field: 'statusHistory',
                    headerName: 'Status',
                    flex: 1,
                    minWidth: 150,
                    sortable: false,
                    renderCell: (params) => {
                        const sortedStatusHistory = [...params.value].sort((a, b) => new Date(b.date) - new Date(a.date));
                        const recentStatus = sortedStatusHistory[0]?.status || 'N/A';
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
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: {
                                            xs: '0.75rem',
                                            sm: '0.85rem',
                                            md: '0.95rem',
                                            lg: '1rem',
                                        },
                                    }}
                                >
                                    {recentStatus.toUpperCase()}
                                </Typography>
                            </Box>
                        );
                    },
                },
            ];


    // Remove loading spinner on initial load, will show spinners above table instead

    return (
        <div style={{ padding: 20 }}>
            <div style={{
                display: 'flex',
                flexDirection: device === 'tablet' || window.innerWidth <= 1220 ? 'column' : 'row',
                gap: 16,
                marginBottom: 20
            }}>
                <div style={{ width: '100%' }}>
                    <TextField
                        label="Search Clients"
                        variant="outlined"
                        value={searchText}
                        onChange={handleSearch}
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{
                    width: '100%',
                    display: device === 'tablet' || window.innerWidth <= 1220 ? 'block' : 'flex',
                    justifyContent: device === 'tablet' || window.innerWidth <= 1220 ? 'flex-start' : 'flex-end'
                }}>
                    <ClientButtons
                        lastSyncedAt={lastSyncedAt}
                        handleSyncGoogleContacts={handleSyncGoogleContacts}
                        handleOpenModal={handleOpenModal}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '100%' }}>
                {isMobile ? (
                    <>
                        <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" gap={2} mb={2}>
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                                <InputLabel id="sort-field-label">Sort By</InputLabel>
                                <Select
                                    labelId="sort-field-label"
                                    value={sortField}
                                    label="Sort By"
                                    onChange={(e) => setSortField(e.target.value)}
                                >
                                    <MenuItem value="givenName">First Name</MenuItem>
                                    <MenuItem value="familyName">Last Name</MenuItem>
                                    <MenuItem value="updatedAt">Last Updated</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                                <InputLabel id="sort-order-label">Order</InputLabel>
                                <Select
                                    labelId="sort-order-label"
                                    value={sortOrder}
                                    label="Order"
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <MenuItem value="asc">Ascending</MenuItem>
                                    <MenuItem value="desc">Descending</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Fade in={sortField === 'updatedAt' && sortOrder === 'desc'} sx={{
                            display: sortField === 'updatedAt' ? 'block' : 'none',
                            mb: 1,
                        }}>
                            <Typography variant="caption" sx={{ ml: 1, mb: 1, color: 'text.secondary' }}>
                                Default sorting: Last Updated (Descending)
                            </Typography>
                        </Fade>
                        <InfiniteScroll
                            dataLength={visibleClients.length}
                            next={loadMoreClients}
                            hasMore={hasMore}
                            loader={<Typography textAlign="center">Loading...</Typography>}
                            scrollThreshold={0.9}
                        >
                            {visibleClients.map((client) => {
                                const sortedStatusHistory = [...(client.statusHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
                                const recentStatus = sortedStatusHistory[0]?.status || 'N/A';
                                const bgColor = colorMap[recentStatus.toUpperCase()] || '#e0e0e0';
                                return (
                                    <Card
                                        key={client._id}
                                        onClick={() => handleCardClick(client._id)}
                                        sx={{
                                            mb: 1,
                                            p: 2,
                                            cursor: 'pointer',
                                            '&:hover': { backgroundColor: '#33daff' },
                                            backgroundColor: bgColor,
                                            color: '#fff',
                                        }}
                                    >
                                        <Typography variant="body1">{`${client.givenName || ''} ${client.familyName || ''}`}</Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 'bold',
                                                mt: 1,
                                                fontSize: {
                                                    xs: '0.75rem',
                                                    sm: '0.85rem',
                                                    md: '0.95rem',
                                                    lg: '1rem',
                                                },
                                            }}
                                        >
                                            {recentStatus.toUpperCase()} - {moment(client.updatedAt).format('MM/DD/YY h:mm A')}
                                        </Typography>
                                    </Card>
                                );
                            })}
                        </InfiniteScroll>
                    </>
                ) : (
                    Array.isArray(filteredClients) && filteredClients.length > 0 ? (
                        <DataGrid
                            rows={filteredClients.filter((c) => typeof c === 'object' && c !== null && c._id)}
                            columns={columns}
                            pageSize={5}
                            getRowId={(row) => row._id}
                            pageSizeOptions={[5, 10, 25, 50, 100]}
                            initialState={{
                                sorting: {
                                    sortModel: [{ field: 'updatedAt', sort: 'desc' }],
                                },
                                pagination: {
                                    paginationModel: { pageSize: 10, page: 0 },
                                },
                            }}
                            sx={{
                                '& .MuiDataGrid-row:hover': { cursor: 'pointer' },
                            }}
                            onRowClick={handleRowClick}
                        />
                    ) : (
                        <Typography>No valid clients found.</Typography>
                    )
                )}
            </div>

            <AddClientModal
                handleAddClient={handleAddClient}
                handleCloseModal={handleCloseModal}
                openModal={openModal}
                newClientData={newClientData}
                handleInputChange={handleInputChange}
                handleAddressChange={handleAddressChange}
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

            <Modal open={isFetchingClients}>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100vh"
                >
                    <Box
                        bgcolor="background.paper"
                        p={3}
                        borderRadius={1}
                        boxShadow={3}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                    >
                        <CircularProgress />
                        <Typography mt={2}>Loading Clients...</Typography>
                    </Box>
                </Box>
            </Modal>

            <Modal open={isSyncingContacts}>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100vh"
                >
                    <Box
                        bgcolor="background.paper"
                        p={3}
                        borderRadius={1}
                        boxShadow={3}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                    >
                        <CircularProgress />
                        <Typography mt={2}>Syncing Contacts...</Typography>
                    </Box>
                </Box>
            </Modal>

            <Modal open={Boolean(fetchError)}>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100vh"
                >
                    <Box
                        bgcolor="background.paper"
                        p={3}
                        borderRadius={1}
                        boxShadow={3}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        gap={2}
                    >
                        <Typography color="error" variant="h6">{fetchError}</Typography>
                        <Box display="flex" gap={2}>
                            <Button variant="contained" onClick={fetchClientsFromMongo}>
                                Retry
                            </Button>
                            <Button variant="outlined" onClick={() => setFetchError(null)}>
                                Dismiss
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
            <Modal open={Boolean(isError)}>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100vh"
                >
                    <Box
                        bgcolor="background.paper"
                        p={3}
                        borderRadius={1}
                        boxShadow={3}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        gap={2}
                    >
                        <Typography color="error" variant="h6">
                            An error occurred while loading clients.
                        </Typography>
                        <Box display="flex" gap={2}>
                            <Button variant="contained" onClick={fetchClientsFromMongo}>
                                Retry
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

export default ClientsPage;