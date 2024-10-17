import React from 'react';
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
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
    People as PeopleIcon,
    Receipt as ReceiptIcon,
    Description as DescriptionIcon,
} from '@mui/icons-material';
import moment from 'moment';

const DashboardPage = () => {
    const navigate = useNavigate();
    // Sample data
    const totalClients = 150;
    const totalInvoices = 75;
    const totalProposals = 50;

    const recentClients = [
        { name: 'Client A', date: '2023-11-01' },
        { name: 'Client B', date: '2023-10-28' },
        { name: 'Client C', date: '2023-10-25' },
    ];

    const recentInvoices = [
        { id: 'INV-001', amount: 500, date: '2023-11-02' },
        { id: 'INV-002', amount: 750, date: '2023-10-30' },
        { id: 'INV-003', amount: 250, date: '2023-10-27' },
    ];

    const handleNavigate = (path) => () => {
        navigate(path);
    }

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Grid container spacing={3}>
                {/* Info Cards */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card onClick={handleNavigate('/clients')} sx={{ cursor: 'pointer' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <PeopleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                            <Box>
                                <Typography variant="h5">{totalClients}</Typography>
                                <Typography color="textSecondary">Total Clients</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card onClick={handleNavigate('/invoices')} sx={{ cursor: 'pointer' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <ReceiptIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                            <Box>
                                <Typography variant="h5">{totalInvoices}</Typography>
                                <Typography color="textSecondary">Total Invoices</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card onClick={handleNavigate('/proposals')} sx={{ cursor: 'pointer' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <DescriptionIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                            <Box>
                                <Typography variant="h5">{totalProposals}</Typography>
                                <Typography color="textSecondary">Total Proposals</Typography>
                            </Box>
                        </CardContent>
                    </Card>
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
                                {recentClients.map((client, index) => (
                                    <div key={index}>
                                        <ListItem>
                                            <ListItemText
                                                primary={client.name}
                                                secondary={moment(client.date).format('LL')}
                                            />
                                        </ListItem>
                                        {index < recentClients.length - 1 && <Divider />}
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
                                {recentInvoices.map((invoice, index) => (
                                    <div key={index}>
                                        <ListItem>
                                            <ListItemText
                                                primary={`Invoice ${invoice.id}`}
                                                secondary={`Amount: $${invoice.amount} - ${moment(
                                                    invoice.date
                                                ).format('LL')}`}
                                            />
                                        </ListItem>
                                        {index < recentInvoices.length - 1 && <Divider />}
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