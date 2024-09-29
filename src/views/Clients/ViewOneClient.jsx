import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOneClient } from '../../store/clientSlice';
import {
    CircularProgress,
    Typography,
    Box,
    Button,
    Grid2 as Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import ClientTimeline from '../../components/ClientTimeline'; // Import the ClientTimeline component

const ViewClient = () => {
    const { id } = useParams(); // Get client ID from the URL
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { client, status, error } = useSelector((state) => state.clients); // Access client state

    useEffect(() => {
        dispatch(fetchOneClient(id)); // Fetch the client by ID when the component mounts
    }, [dispatch, id]);

    // Loading state
    if (status === 'loading') {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    // Error state
    if (status === 'failed') {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography variant="h6" color="error">
                    Error: {error}
                </Typography>
            </Box>
        );
    }

    // Function to format dates
    const formatDate = (date) => new Date(date).toLocaleString();

    const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };

    // Invoices data (assuming client.invoices is an array of invoice objects)
    const invoices = client.invoices || [];

    return (
        <Box padding={3}>
            <Button
                variant="contained"
                color="primary"
                onClick={handleBack}
                style={{ marginBottom: 16 }}
            >
                Back
            </Button>

            <Grid container spacing={4}>
                {/* Client Details */}
                <Grid item="true" xs={12} md={6}>
                    <Typography variant="h4" gutterBottom>
                        {client.firstName} {client.lastName}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Email:</strong> {client.email || 'N/A'}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Phone:</strong> {client.phone || 'N/A'}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Address:</strong> {client.address}, {client.city}, {client.state}{' '}
                        {client.zip}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Status:</strong> {client.status || 'N/A'}
                    </Typography>
                    {/* Add more client details as needed */}
                </Grid>

                {/* Client Timeline */}
                <Grid item="true" xs={12} md={6}>
                    <ClientTimeline client={client} />
                </Grid>

                {/* Invoices Table */}
                <Grid item="true" xs={12}>
                    <Typography variant="h5" gutterBottom>
                        Invoices
                    </Typography>
                    {invoices.length > 0 ? (
                        <TableContainer component={Paper}>
                            <Table aria-label="invoices table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Invoice Number</TableCell>
                                        <TableCell>Issue Date</TableCell>
                                        <TableCell>Due Date</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {invoices.map((invoice) => (
                                        <TableRow key={invoice._id}>
                                            <TableCell>{invoice.number}</TableCell>
                                            <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                                            <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                                            <TableCell>{invoice.status}</TableCell>
                                            <TableCell align="right">${invoice.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography variant="body1">No invoices available.</Typography>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default ViewClient;