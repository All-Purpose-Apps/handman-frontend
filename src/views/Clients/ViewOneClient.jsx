// src/views/Clients/ViewOneClient.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    CircularProgress,
    Typography,
    Box,
    Button,
    Grid,
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
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip,
} from '@mui/material';
import { formatPhoneNumber } from '../../utils/formatPhoneNumber';
import moment from 'moment';
import {
    fetchOneClient,
    deleteClient,
    fetchClients,
    updateClient,
} from '../../store/clientSlice';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    History as HistoryIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Contacts as ContactsIcon,
} from '@mui/icons-material';

const ViewClient = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isStatusHistoryOpen, setIsStatusHistoryOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { client, status, error } = useSelector((state) => state.clients);

    // State variables for edit mode and form data
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        givenName: '',
        familyName: '',
        email: '',
        phone: '',
        address: '',
    });



    useEffect(() => {
        dispatch(fetchOneClient(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (client) {
            setFormData({
                givenName: client.givenName || '',
                familyName: client.familyName || '',
                email: client.email || '',
                phone: client.phone || '',
                address: client.address || '',
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

    const handleDelete = () => {
        dispatch(deleteClient({ resourceName: client.resourceName, id }));
        dispatch(fetchClients());
        navigate('/clients');
    };

    const getRecentStatus = (statusHistory) => {
        const status =
            statusHistory && statusHistory.length > 0
                ? [...statusHistory].sort((a, b) => new Date(b.date) - new Date(a.date))[0].status
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
            givenName: client.givenName || '',
            familyName: client.familyName || '',
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || '',
        });
    };


    const handleSave = async () => {
        setIsSaving(true);
        try {
            await dispatch(updateClient({ ...formData, updatedAt: new Date(), id }));
            await dispatch(fetchOneClient(id));
            setIsEditing(false);
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setIsSaving(false);
        }
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
        'FOLLOW-UP': 'lightcoral',
    };

    const getStatusColor = (status) => statusColorMap[status] || 'black';

    const handleOpenStatusHistory = () => setIsStatusHistoryOpen(true);
    const handleCloseStatusHistory = () => setIsStatusHistoryOpen(false);

    const handleOpenDeleteDialog = () => setIsDeleteDialogOpen(true);
    const handleCloseDeleteDialog = () => setIsDeleteDialogOpen(false);

    const createLabels = (label) => {
        if (label == 'givenName') {
            return 'First Name';
        }
        if (label == 'familyName') {
            return 'Last Name';
        }
        return label.charAt(0).toUpperCase() + label.slice(1)
    }

    return (
        <Box padding={3}>
            <Button
                variant="contained"
                color="primary"
                onClick={handleBack}
                sx={{ marginBottom: 2 }}
                startIcon={<ArrowBackIcon />}
            >
                Back
            </Button>

            <Grid container spacing={2}>
                {/* Client Details */}
                <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ padding: 2, position: 'relative' }}>
                        {/* Icon Buttons at the Top Right */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                display: 'flex',
                                gap: 1,
                            }}
                        >
                            {isEditing ? null : (
                                <>
                                    <Tooltip title="Edit Client">
                                        <IconButton
                                            color="primary"
                                            onClick={handleEdit}
                                            aria-label="Edit Client"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Client">
                                        <IconButton
                                            color="error"
                                            onClick={handleOpenDeleteDialog}
                                            aria-label="Delete Client"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )}
                        </Box>

                        <CardContent>
                            <Typography
                                variant="h5"
                                gutterBottom
                                sx={{
                                    fontSize: { xs: '1.2rem', sm: '1.5rem' },
                                    textAlign: { xs: 'center', md: 'left' },
                                }}
                            >
                                {isEditing ? 'Edit Client' : client.givenName + ' ' + client.familyName}
                            </Typography>
                            <Divider sx={{ marginY: 1 }} />
                            {isEditing ? (
                                <>
                                    {['givenName', 'familyName', 'email', 'phone', 'address'].map((field) => (
                                        <Box sx={{ marginBottom: 1 }} key={field}>
                                            <TextField
                                                label={createLabels(field)}
                                                value={formData[field]}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        [field]: e.target.value,
                                                    })
                                                }
                                                fullWidth
                                            />
                                        </Box>
                                    ))}
                                </>
                            ) : (
                                <>
                                    <Typography variant="body1">
                                        <strong>Email:</strong> {client.email || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Phone:</strong> {formatPhoneNumber(client.phone) || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Address:</strong> {client.address || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Status:</strong>{' '}
                                        <span style={{ color: getStatusColor(getRecentStatus(client.statusHistory)) }}>
                                            {getRecentStatus(client.statusHistory)}
                                        </span>
                                    </Typography>
                                </>
                            )}
                            <Divider sx={{ marginY: 1 }} />
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: { xs: 'center', md: 'flex-start' },
                                    flexWrap: 'wrap',
                                    gap: 1,
                                }}
                            >
                                {isEditing ? (
                                    <>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleSave}
                                            startIcon={<SaveIcon />}
                                            disabled={isSaving}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={handleCancel}
                                            startIcon={<CancelIcon />}
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={handleOpenStatusHistory}
                                            startIcon={<HistoryIcon />}
                                        >
                                            Status History
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            href={`https://contacts.google.com/person/${client.resourceName?.replace(
                                                /^people\//,
                                                ''
                                            )}`}
                                            target="_blank"
                                            startIcon={<ContactsIcon />}
                                        >
                                            Google Contacts
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Invoices and Proposals */}
                <Grid item xs={12} md={6}>
                    <Grid container spacing={2}>
                        {/* Invoices */}
                        <Grid item xs={12}>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontSize: { xs: '1.2rem', sm: '1.5rem' },
                                    textAlign: { xs: 'center', md: 'left' },
                                }}
                            >
                                Invoices
                            </Typography>
                            {invoices.length > 0 ? (
                                <TableContainer component={Paper} sx={{ maxHeight: 200, overflow: 'auto' }}>
                                    <Table stickyHeader aria-label="invoices table">
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
                                                    <TableCell>
                                                        {moment(invoice.invoiceDate).format('MM/DD/YYYY')}
                                                    </TableCell>
                                                    <TableCell>{invoice.status}</TableCell>
                                                    <TableCell align="right">
                                                        ${invoice.total.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography variant="body1">No invoices available.</Typography>
                            )}
                        </Grid>

                        {/* Proposals */}
                        <Grid item xs={12}>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontSize: { xs: '1.2rem', sm: '1.5rem' },
                                    textAlign: { xs: 'center', md: 'left' },
                                }}
                            >
                                Proposals
                            </Typography>
                            {proposals.length > 0 ? (
                                <TableContainer component={Paper} sx={{ maxHeight: 200, overflow: 'auto' }}>
                                    <Table stickyHeader aria-label="proposals table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Proposal #</TableCell>
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
                                                    <TableCell>
                                                        {moment(proposal.proposalDate).format('MM/DD/YYYY')}
                                                    </TableCell>
                                                    <TableCell>{proposal.status}</TableCell>
                                                    <TableCell align="right">
                                                        ${proposal.packagePrice?.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography variant="body1">No proposals available.</Typography>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            {/* Status History Dialog */}
            <Dialog
                open={isStatusHistoryOpen}
                onClose={handleCloseStatusHistory}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Status History</DialogTitle>
                <DialogContent dividers>
                    {client.statusHistory && client.statusHistory.length > 0 ? (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {client.statusHistory.map((statusItem, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{moment(statusItem.date).format('MM/DD/YYYY')}</TableCell>
                                            <TableCell style={{ color: getStatusColor(statusItem.status) }}>
                                                {statusItem.status}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography variant="body1">No status history available.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseStatusHistory} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">Delete Client</DialogTitle>
                <DialogContent>
                    <Typography id="delete-dialog-description">
                        Are you sure you want to delete this client? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseDeleteDialog}
                        color="primary"
                        startIcon={<CancelIcon />}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        startIcon={<DeleteIcon />}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ViewClient;