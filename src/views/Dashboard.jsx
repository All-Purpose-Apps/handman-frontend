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

    // Fetch clients, invoices, and proposals when the component mounts, only if a user is present
    useEffect(() => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
            Promise.all([
                dispatch(fetchClients()),
                dispatch(fetchInvoices()),
                dispatch(fetchProposals())
            ]).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [dispatch]);

    const clients = useSelector((state) => state.clients.clients);
    const invoices = useSelector((state) => state.invoices.invoices);
    const proposals = useSelector((state) => state.proposals.proposals);
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
        navigate('/proposals', { state: { openAddProposalModal: true } });
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

    // Combine invoices and proposals, sort by date (most recent first)
    const recentItems = [
        ...invoices.map((invoice) => ({
            ...invoice,
            type: 'Invoice'
        })),
        ...proposals.map((proposal) => ({
            ...proposal,
            type: 'Proposal'
        }))
    ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 10);

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
                            {[...clients]
                                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                                .slice(0, 10).length === 0 ? (
                                <Typography>No clients available</Typography>
                            ) : (
                                <List>
                                    {[...clients]
                                        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                                        .filter(client => {
                                            const latest = [...(client.statusHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                                            return latest && !['imported from google', 'created by user'].includes(latest.status.toLowerCase());
                                        })
                                        .slice(0, 10)
                                        .map((client, index) => {
                                            // Status color logic
                                            const statusHistory = client.statusHistory || [];

                                            const proposalStatus = [...statusHistory]
                                                .filter(s => s.status?.toLowerCase().includes('proposal'))
                                                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

                                            const invoiceStatus = [...statusHistory]
                                                .filter(s => s.status?.toLowerCase().includes('invoice'))
                                                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

                                            const reviewStatus = [...statusHistory]
                                                .filter(s => s.status?.toLowerCase().includes('review'))
                                                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

                                            let backgroundColor = 'white';

                                            if (proposalStatus) {
                                                const pStatus = proposalStatus.status.toLowerCase();
                                                const validProposal = ['accepted', 'signed', 'approved', 'converted to invoice'].some(k => pStatus.includes(k));
                                                const proposalCreated = ['created'].some(k => pStatus.includes(k));

                                                if (validProposal && !proposalCreated) {
                                                    backgroundColor = '#a5d6a7'; // green
                                                } else if (!validProposal) {
                                                    backgroundColor = '#eeeeee'; // gray
                                                } else if (proposalCreated) {
                                                    backgroundColor = '#fff59d'; // yellow
                                                }
                                            }
                                            if (invoiceStatus) {
                                                const iStatus = invoiceStatus.status.toLowerCase();
                                                if (iStatus.includes('paid')) backgroundColor = '#a5d6a7';
                                                else if (iStatus.includes('rejected') || iStatus.includes('deleted')) backgroundColor = '#eeeeee';
                                                else if (iStatus.includes('created') || iStatus.includes('sent')) backgroundColor = '#ef9a9a';
                                            }

                                            const latestStatus = [...statusHistory].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                                            if (latestStatus) {
                                                const diffInMs = new Date() - new Date(latestStatus.date);
                                                const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
                                                if (
                                                    diffInDays > urgentDays &&
                                                    !['imported from google', 'created by user', 'proposal deleted', 'invoice deleted'].includes(latestStatus.status.toLowerCase())
                                                ) {
                                                    backgroundColor = '#ef9a9a'; // override with red
                                                }
                                            }

                                            return (
                                                <div key={index}>
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
                                                            secondary={moment(client.updatedAt).format('LL')}
                                                        />
                                                        <Typography sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                            {getLatestStatus(client.statusHistory)}
                                                        </Typography>
                                                    </ListItem>
                                                    {index < clients.length - 1 && <Divider />}
                                                </div>
                                            );
                                        })}
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
                                    {recentItems.map((item, index) => (
                                        <div key={index}>
                                            <ListItem
                                                onClick={() => navigate(`/${item.type.toLowerCase()}s/${item._id}`)}
                                                sx={{
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        backgroundColor: '#f0f0f0',
                                                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                                    },
                                                }}
                                            >
                                                <ListItemText
                                                    primary={`${item.type}: ${item.number || item.proposalNumber || item.invoiceNumber}`}
                                                    secondary={`${moment(item.date).format('LL')}`}
                                                />
                                                <Typography sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                    {item.status}
                                                </Typography>
                                            </ListItem>
                                            {index < recentItems.length - 1 && <Divider />}
                                        </div>
                                    ))}
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