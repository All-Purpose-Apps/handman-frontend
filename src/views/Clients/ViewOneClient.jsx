import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOneClient, deleteClient, fetchClients, updateClient } from '../../store/clientSlice';
import {
    CircularProgress,
    Typography,
    Box,
    Button,
    Grid as MuiGrid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Card,
    CardContent,
    Divider,
    TextField
} from '@mui/material';
import { formatPhoneNumber } from '../../utils/formatPhoneNumber';
import moment from 'moment';

const ViewClient = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { client, status, error } = useSelector((state) => state.clients);

    // State variables for edit mode and form data
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        dispatch(fetchOneClient(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name || '',
                email: client.email || '',
                phone: client.phone || '',
                address: client.address || ''
            });
        }
    }, [client]);

    if (status === 'loading') {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (status === 'failed') {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography variant="h6" color="error">
                    Error: {error}
                </Typography>
            </Box>
        );
    }

    const handleBack = () => {
        navigate(-1);
    };

    const invoices = client.invoices || [];
    const proposals = client.proposals || [];

    const handleInvoiceClick = (invoiceId) => {
        navigate(`/invoices/${invoiceId}`);
    };

    const handleProposalClick = (proposalId) => {
        navigate(`/proposals/${proposalId}`);
    };

    const handleDelete = (resourceName) => {
        dispatch(deleteClient({ resourceName, id }));
        dispatch(fetchClients());
        navigate('/clients');
    };

    const getRecentStatus = (statusHistory) => {
        const status =
            statusHistory && statusHistory.length > 0
                ? statusHistory.sort((a, b) => new Date(b.date) - new Date(a.date))[0].status
                : 'N/A';

        return status.toUpperCase();
    };

    // Functions to handle edit mode
    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: client.name || '',
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || ''
        });
    };

    const handleSave = () => {
        dispatch(updateClient({ ...formData, updatedAt: new Date(), id }));
        setIsEditing(false);
    };

    // Status color mapping
    const statusColorMap = {
        'ACTIVE': 'green',
        'CREATED BY USER': 'blue',
        'INQUIRY RECEIVED': 'orange',
        'IMPORTED FROM GOOGLE': 'purple',
        'INACTIVE': 'gray',
        'WORK IN PROGRESS': 'teal',
        'COMPLETED': 'green',
        'ARCHIVED': 'darkgray',
        'INVOICE SENT': 'lightblue',
        'PROPOSAL SENT': 'lightgreen',
        'INVOICE PAID': 'gold',
        'PROPOSAL ACCEPTED': 'limegreen',
        'PROPOSAL REJECTED': 'red',
        'APPOINTMENT SCHEDULED': 'cornflowerblue',
        'TASK ASSIGNED': 'slateblue',
        'PAID': 'forestgreen',
        'CANCELED': 'maroon',
        'FOLLOW-UP': 'lightcoral'
    };

    const getStatusColor = (status) => statusColorMap[status] || 'black';

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

            <MuiGrid container spacing={4}>
                {/* Client Details */}
                <MuiGrid container spacing={2} justifyContent="center" alignItems="center">
                    <MuiGrid item xs={12} md={5}>
                        <Card variant="outlined" sx={{ marginBottom: 2, padding: 2 }}>
                            <CardContent>
                                {isEditing ? (
                                    <>
                                        <Typography variant="h4" gutterBottom>
                                            Edit Client
                                        </Typography>
                                        <Divider sx={{ marginY: 1 }} />
                                        <Box sx={{ marginBottom: 1 }}>
                                            <TextField
                                                label="Name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                fullWidth
                                            />
                                        </Box>
                                        <Box sx={{ marginBottom: 1 }}>
                                            <TextField
                                                label="Email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                fullWidth
                                            />
                                        </Box>
                                        <Box sx={{ marginBottom: 1 }}>
                                            <TextField
                                                label="Phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                fullWidth
                                            />
                                        </Box>
                                        <Box sx={{ marginBottom: 1 }}>
                                            <TextField
                                                label="Address"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                fullWidth
                                            />
                                        </Box>
                                    </>
                                ) : (
                                    <>
                                        <Typography variant="h4" gutterBottom>
                                            {client.name}
                                        </Typography>
                                        <Divider sx={{ marginY: 1 }} />
                                        <Box sx={{ marginBottom: 1 }}>
                                            <Typography variant="body1">
                                                <strong>Email:</strong> {client.email || 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ marginBottom: 1 }}>
                                            <Typography variant="body1">
                                                <strong>Phone:</strong> {formatPhoneNumber(client.phone) || 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ marginBottom: 1 }}>
                                            <Typography variant="body1">
                                                <strong>Address:</strong> {client.address || 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ marginBottom: 1 }}>
                                            <strong>STATUS:</strong>
                                            <Typography
                                                variant="body1"
                                                sx={{ color: getStatusColor(getRecentStatus(client.statusHistory)) }}
                                            >
                                                <strong>{getRecentStatus(client.statusHistory)}</strong>
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                                <Divider sx={{ marginY: 1 }} />
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    {isEditing ? (
                                        <>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleSave}
                                                sx={{ marginRight: 1 }}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                onClick={handleCancel}
                                                sx={{ marginRight: 1 }}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outlined"
                                                href={`https://contacts.google.com/person/${client.resourceName?.replace(
                                                    /^people\//,
                                                    ''
                                                )}`}
                                                target="_blank"
                                                sx={{ marginRight: 1 }}
                                            >
                                                Go to Google Contacts
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleEdit}
                                                sx={{ marginRight: 1 }}
                                            >
                                                Edit Client
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                onClick={() => handleDelete(client.resourceName)}
                                            >
                                                Delete Client
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </MuiGrid>
                </MuiGrid>

                {/* Invoices and Proposals Side by Side */}
                <MuiGrid container spacing={4}>
                    {/* Invoices */}
                    <MuiGrid item xs={12} md={6}>
                        <Typography variant="h5" gutterBottom>
                            Invoices
                        </Typography>
                        {invoices.length > 0 ? (
                            <TableContainer component={Paper}>
                                <Table aria-label="invoices table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Invoice #</TableCell>
                                            <TableCell>Issue Date</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {invoices.map((invoice) => (
                                            <TableRow
                                                key={invoice._id}
                                                onClick={() => handleInvoiceClick(invoice._id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <TableCell>{invoice.invoiceNumber}</TableCell>
                                                <TableCell>{moment(invoice.invoiceDate).format('MM/DD/YYYY')}</TableCell>
                                                <TableCell>{invoice.status}</TableCell>
                                                <TableCell align="right">${invoice.total}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography variant="body1">No invoices available.</Typography>
                        )}
                    </MuiGrid>

                    {/* Proposals */}
                    <MuiGrid item xs={12} md={6}>
                        <Typography variant="h5" gutterBottom>
                            Proposals
                        </Typography>
                        {proposals.length > 0 ? (
                            <TableContainer component={Paper}>
                                <Table aria-label="proposals table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Proposal Number</TableCell>
                                            <TableCell>Issue Date</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {proposals.map((proposal) => (
                                            <TableRow
                                                key={proposal._id}
                                                onClick={() => handleProposalClick(proposal._id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <TableCell>{proposal.proposalNumber}</TableCell>
                                                <TableCell>{moment(proposal.proposalDate).format('MM/DD/YYYY')}</TableCell>
                                                <TableCell>{proposal.status}</TableCell>
                                                <TableCell align="right">
                                                    ${proposal.packagePrice && proposal.packagePrice.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography variant="body1">No proposals available.</Typography>
                        )}
                    </MuiGrid>
                </MuiGrid>
            </MuiGrid>
        </Box>
    );
};

export default ViewClient;