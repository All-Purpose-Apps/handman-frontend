import { useEffect } from 'react';
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

    // Fetch clients, invoices, and proposals when the component mounts
    useEffect(() => {
        dispatch(fetchClients());
        dispatch(fetchInvoices());
        dispatch(fetchProposals());
    }, [dispatch]);

    const clients = useSelector((state) => state.clients.clients);
    const invoices = useSelector((state) => state.invoices.invoices);
    const proposals = useSelector((state) => state.proposals.proposals);

    const handleNavigate = (path) => () => {
        navigate(path);
    };

    const handleAddClient = () => {
        navigate('/clients', { state: { openAddClientModal: true } }); // Adjust this path to your add-client page
    };

    const handleAddInvoice = () => {
        navigate('/invoices', { state: { openAddInvoiceModal: true } });
    };

    const handleAddProposal = () => {
        navigate('/add-proposal'); // Adjust this path to your add-proposal page
    };

    const handleGoToInvoice = (id) => () => {
        navigate(`/invoices/${id}`);
    }

    const handleGoToClient = (id) => () => {
        navigate(`/clients/${id}`);
    }

    const getLatestStatus = (statusHistory) => {
        if (!statusHistory || statusHistory.length === 0) return 'No Status Available';

        const latestStatus = statusHistory.reduce((latest, current) => {
            return moment(current.timestamp).isAfter(latest.timestamp) ? current : latest;
        });

        return latestStatus.status;
    };


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

                {/* Recent Clients */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardHeader
                            title="Recent Clients"
                            sx={{ backgroundColor: 'primary.main', color: 'white' }}
                        />
                        <CardContent>
                            <List>
                                {[...clients]
                                    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                                    .slice(0, 10)
                                    .map((client, index) => (
                                        <div key={index}>
                                            <ListItem
                                                sx={{
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        backgroundColor: '#f0f0f0',
                                                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                                    },
                                                }}
                                                onClick={handleGoToClient(client._id)}
                                            >
                                                <ListItemText
                                                    primary={client.name + ' - ' + getLatestStatus(client.statusHistory)}
                                                    secondary={moment(client.updatedAt).format('LL')}
                                                />
                                            </ListItem>
                                            {index < clients.length - 1 && <Divider />}
                                        </div>
                                    ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Invoices */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardHeader
                            title="Recent Invoices"
                            sx={{ backgroundColor: 'primary.main', color: 'white' }}
                        />
                        <CardContent>
                            <List>
                                {invoices.map((invoice, index) => (
                                    <div key={index}>
                                        <ListItem
                                            onClick={handleGoToInvoice(invoice._id)}
                                            sx={{
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    backgroundColor: '#f0f0f0',
                                                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                                },
                                            }}
                                        >
                                            <ListItemText
                                                primary={`Invoice: ${invoice.invoiceNumber}`}
                                                secondary={`Amount: $${invoice.total} - ${moment(
                                                    invoice.date
                                                ).format('LL')}`}
                                            />
                                        </ListItem>
                                        {index < invoices.length - 1 && <Divider />}
                                    </div>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;