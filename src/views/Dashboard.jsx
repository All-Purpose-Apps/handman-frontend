import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { useSettings } from '../contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider,
    Button
} from '@mui/material';
import { CircularProgress, Modal } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
    People as PeopleIcon,
    Receipt as ReceiptIcon,
    Description as DescriptionIcon,
} from '@mui/icons-material';
import moment from 'moment';
import { fetchClients } from '../store/clientSlice';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInvoices } from '../store/invoiceSlice';
import { fetchProposals } from '../store/proposalSlice';

const DashboardPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { urgentDays } = useSettings();

    // Loading state for data fetching
    const [loading, setLoading] = useState(true);
    const [filteredClients, setFilteredClients] = useState([]);

    // Selectors for clients, invoices, and proposals
    const clients = useSelector((state) => state.clients.clients) || [];
    const invoices = useSelector((state) => state.invoices.invoices) || [];
    const proposals = useSelector((state) => state.proposals.proposals) || [];

    // Fetch clients, invoices, and proposals when the component mounts, only if a user is present
    useEffect(() => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
            Promise.all([
                dispatch(fetchClients()),
                dispatch(fetchInvoices()),
                dispatch(fetchProposals())
            ]).finally(() => {
                setLoading(false)
            });
        } else {
            setLoading(false);
        }
    }, [dispatch]);

    // Update filteredClients whenever clients changes
    useEffect(() => {
        if (clients.length > 0) {
            const updatedFilteredClients = [...clients]
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .filter(client => {
                    const latest = [...(client.statusHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                    return latest && !['imported from google', 'created by user'].includes(latest.status.toLowerCase());
                })
                .slice(0, 10);
            setFilteredClients(updatedFilteredClients);
        }
    }, [clients]);
    const handleNavigate = (path) => () => {
        navigate(path);
    };

    const handleAddClient = () => {
        navigate('/clients', { state: { openAddClientModal: true } });
    };

    const handleAddInvoice = () => {
        navigate('/invoices', { state: { openAddInvoiceModal: true } });
    };

    const handleAddProposal = () => {
        navigate('/proposals/new')
    };

    const handleGoToClient = (id) => () => {
        navigate(`/clients/${id}`);
    };

    // Helper function to get the most recent status
    const getLatestStatus = (statusHistory) => {
        if (!statusHistory || statusHistory.length === 0) return 'No Status Available';
        return statusHistory.reduce((latest, current) =>
            new Date(current.date) > new Date(latest.date) ? current : latest
        ).status;
    };

    // Combine invoices and proposals, sort urgent to top (oldest first), then non-urgent (newest first)
    const now = Date.now();
    const ignoredStatuses = ['imported from google', 'created by user', 'proposal deleted', 'invoice deleted'];

    const combinedItems = [
        ...invoices.map((invoice) => ({ ...invoice, type: 'Invoice' })),
        ...proposals.map((proposal) => ({ ...proposal, type: 'Proposal' }))
    ];

    const sortedItems = combinedItems
        .map((item) => {
            const s = (item.status || '').toLowerCase();
            const statusAgeInDays = (now - new Date(item.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
            const isUrgent = statusAgeInDays > urgentDays && !ignoredStatuses.includes(s);
            return { ...item, isUrgent };
        })
        .sort((a, b) => {
            if (a.isUrgent && !b.isUrgent) return -1;
            if (!a.isUrgent && b.isUrgent) return 1;
            if (a.isUrgent && b.isUrgent) {
                return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(); // oldest urgent first
            }
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(); // newest non-urgent first
        })
        .slice(0, 10);

    const recentItems = sortedItems;

    if (loading) {
        return (
            <Modal open={true}>
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
                        <Typography mt={2}>Loading Dashboard...</Typography>
                    </Box>
                </Box>
            </Modal>
        );
    }


    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>

            <Grid container spacing={3}>
                {/* Info Cards */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ mb: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleAddClient}
                        >
                            Add Client
                        </Button>
                        <Card onClick={handleNavigate('/clients')} sx={{ cursor: 'pointer' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                <PeopleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                                <Box>
                                    <Typography variant="h5">{clients.length}</Typography>
                                    <Typography color="textSecondary">Total Clients</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ mb: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleAddProposal}
                        >
                            Add Proposal
                        </Button>
                        <Card onClick={handleNavigate('/proposals')} sx={{ cursor: 'pointer' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                <DescriptionIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                                <Box>
                                    <Typography variant="h5">{proposals.length}</Typography>
                                    <Typography color="textSecondary">Total Proposals</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ mb: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleAddInvoice}
                        >
                            Add Invoice
                        </Button>
                        <Card onClick={handleNavigate('/invoices')} sx={{ cursor: 'pointer' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                <ReceiptIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                                <Box>
                                    <Typography variant="h5">{invoices.length}</Typography>
                                    <Typography color="textSecondary">Total Invoices</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Grid>



                {/* Recent Clients */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardHeader
                            title="Recent Clients"
                            sx={{ backgroundColor: 'primary.main', color: 'white' }}
                        />
                        <CardContent>
                            {filteredClients?.length === 0 ? (
                                <Typography>No clients available</Typography>
                            ) : (
                                <List>
                                    {(() => {
                                        const ignoredStatuses = ['imported from google', 'created by user', 'proposal deleted', 'invoice deleted'];

                                        const getStatusAgeInDays = (entry) =>
                                            (Date.now() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24);

                                        const urgentClients = [];
                                        const nonUrgentClients = [];

                                        filteredClients.forEach((client) => {
                                            const statusHistory = client.statusHistory || [];
                                            const latestStatusEntry = [...statusHistory].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                                            if (!latestStatusEntry) return;

                                            const s = latestStatusEntry.status.toLowerCase();
                                            const isUrgent = getStatusAgeInDays(latestStatusEntry) > urgentDays && !ignoredStatuses.includes(s);

                                            if (isUrgent) urgentClients.push({ ...client, latestStatusEntry });
                                            else nonUrgentClients.push({ ...client, latestStatusEntry });
                                        });

                                        urgentClients.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)); // oldest first
                                        nonUrgentClients.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); // newest first

                                        const orderedClients = [...urgentClients, ...nonUrgentClients];

                                        return orderedClients.map((client, index) => {
                                            const s = client.latestStatusEntry.status.toLowerCase();
                                            const statusAgeInDays = getStatusAgeInDays(client.latestStatusEntry);
                                            const isUrgent = statusAgeInDays > urgentDays && !ignoredStatuses.includes(s);

                                            let backgroundColor = '#eeeeee';
                                            if (s.includes('deleted')) backgroundColor = '#eeeeee';
                                            else if (s.includes('accepted') || s.includes('signed') || s.includes('approved') || s.includes('paid') || s.includes('paid in full')) backgroundColor = '#a5d6a7';
                                            else if (s.includes('created') || s.includes('sent')) backgroundColor = '#fff59d';
                                            else if (s.includes('review')) backgroundColor = '#ffcc80';
                                            if (isUrgent) backgroundColor = '#ef9a9a';

                                            const sectionHeading =
                                                index === 0 && urgentClients.length > 0
                                                    ? <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>Urgent Clients</Typography>
                                                    : index === urgentClients.length && nonUrgentClients.length > 0
                                                        ? <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>Other Clients</Typography>
                                                        : null;

                                            return (
                                                <div key={client._id}>
                                                    {sectionHeading}
                                                    <ListItem
                                                        sx={{
                                                            backgroundColor,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            '&:hover': {
                                                                backgroundColor: '#f0f0f0',
                                                                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                                            },
                                                        }}
                                                        onClick={handleGoToClient(client._id)}
                                                    >
                                                        <ListItemText
                                                            primary={client.givenName + ' ' + client.familyName}
                                                            secondary={moment(client.updatedAt).format('LLL')}
                                                        />
                                                        <Typography sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                            {client.latestStatusEntry.status}
                                                        </Typography>
                                                    </ListItem>
                                                    {index < orderedClients.length - 1 && <Divider />}
                                                </div>
                                            );
                                        });
                                    })()}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Invoices & Proposals */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardHeader
                            title="Recent Invoices and Proposals"
                            sx={{ backgroundColor: 'primary.main', color: 'white' }}
                        />
                        <CardContent>
                            {recentItems.length > 0 ? (
                                <List>
                                    {(() => {
                                        let urgentSectionShown = false;
                                        let nonUrgentSectionShown = false;
                                        return recentItems.map((item, index) => {
                                            const s = (item.status || '').toLowerCase();
                                            const statusAgeInDays = (Date.now() - new Date(item.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
                                            const ignoredStatuses = ['imported from google', 'created by user', 'proposal deleted', 'invoice deleted'];
                                            const isUrgent = statusAgeInDays > urgentDays && !ignoredStatuses.includes(s);

                                            let backgroundColor = '#eeeeee'; // default gray
                                            if (s.includes('deleted')) backgroundColor = '#eeeeee';
                                            else if (s.includes('accepted') || s.includes('signed') || s.includes('approved') || s.includes('paid') || s.includes('paid in full')) backgroundColor = '#a5d6a7';
                                            else if (s.includes('created') || s.includes('sent')) backgroundColor = '#fff59d';
                                            else if (s.includes('review')) backgroundColor = '#ffcc80';

                                            if (isUrgent) backgroundColor = '#ef9a9a';

                                            const sectionHeading = (!urgentSectionShown && isUrgent) ? (
                                                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                                                    Urgent Items
                                                </Typography>
                                            ) : (!nonUrgentSectionShown && !isUrgent) ? (
                                                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                                                    Other Recent Items
                                                </Typography>
                                            ) : null;

                                            if (isUrgent) urgentSectionShown = true;
                                            else nonUrgentSectionShown = true;

                                            return (
                                                <div key={index}>
                                                    {sectionHeading}
                                                    <ListItem
                                                        onClick={() => navigate(`/${item.type.toLowerCase()}s/${item._id}`)}
                                                        sx={{
                                                            backgroundColor,
                                                            cursor: 'pointer',
                                                            '&:hover': {
                                                                backgroundColor: '#f0f0f0',
                                                                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                                            },
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={`${item.type}: ${item.number || item.proposalNumber || item.invoiceNumber}`}
                                                            secondary={`${moment(item.updatedAt).format('LLL')}`}
                                                        />
                                                        <Typography sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                            {item.status}
                                                        </Typography>
                                                    </ListItem>
                                                    {index < recentItems.length - 1 && <Divider />}
                                                </div>
                                            );
                                        });
                                    })()}
                                </List>
                            ) : (
                                <Typography>No recent items available</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;