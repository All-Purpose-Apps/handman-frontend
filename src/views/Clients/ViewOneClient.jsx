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
    clearClientHistory
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
import axios from 'axios';

const ViewClient = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isStatusHistoryOpen, setIsStatusHistoryOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const isMobile = window.innerWidth <= 600;

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
    }, [dispatch, id, navigate]);

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
        // General Statuses
        'ACTIVE': '#388e3c', // green
        'INACTIVE': '#757575', // gray
        'ARCHIVED': '#616161', // dark gray
        'WORK IN PROGRESS': '#1976d2', // blue
        'COMPLETED': '#388e3c', // green
        'CANCELED': '#b71c1c', // dark red
        'FOLLOW-UP': '#fbc02d', // yellow

        // Creation/Import
        'CREATED BY USER': '#0288d1', // light blue
        'IMPORTED FROM GOOGLE': '#7b1fa2', // purple
        'INQUIRY RECEIVED': '#fbc02d', // yellow

        // Proposal Statuses
        'PROPOSAL CREATED': '#0288d1', // light blue
        'PROPOSAL SENT': '#fbc02d', // yellow
        'PROPOSAL UPDATED': '#0288d1', // light blue
        'PROPOSAL ACCEPTED': '#388e3c', // green
        'PROPOSAL SIGNED': '#388e3c', // green
        'PROPOSAL REJECTED': '#b71c1c', // dark red
        'PROPOSAL DELETED': '#757575', // gray

        // Invoice Statuses
        'INVOICE CREATED': '#0288d1', // light blue
        'INVOICE SENT': '#fbc02d', // yellow
        'INVOICE UPDATED': '#0288d1', // light blue
        'INVOICE APPROVED': '#388e3c', // green
        'INVOICE REJECTED': '#b71c1c', // dark red
        'INVOICE PAID': '#ffd600', // gold
        'INVOICE PAID AND SIGNED': '#ffd600', // gold
        'INVOICE DELETED': '#757575', // gray

        // Appointment/Task
        'APPOINTMENT SCHEDULED': '#1976d2', // blue
        'TASK ASSIGNED': '#1976d2', // blue

        // Review Statuses
        'REVIEW REQUESTED': '#388e3c', // green
    };

    const getStatusColor = (status) => statusColorMap[status] || 'black';

    const handleOpenStatusHistory = () => setIsStatusHistoryOpen(true);
    const handleCloseStatusHistory = () => setIsStatusHistoryOpen(false);

    const handleOpenDeleteDialog = () => setIsDeleteDialogOpen(true);
    const handleCloseDeleteDialog = () => setIsDeleteDialogOpen(false);

    const handleNavigate = (path) => () => {
        if (path === '/invoices') {
            navigate(path, { state: { openAddInvoiceModal: true, clientId: client._id } });
        }
        if (path === '/proposals/new') {
            navigate(path, { state: { openAddProposalModal: true, clientId: client._id } });
        }
    };

    const createLabels = (label) => {
        if (label == 'givenName') {
            return 'First Name';
        }
        if (label == 'familyName') {
            return 'Last Name';
        }
        return label.charAt(0).toUpperCase() + label.slice(1)
    }
    const handleSendReview = async () => {
        const accessToken = localStorage.getItem('accessToken');
        try {
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/gmail/send-review-request`,
                {
                    to: client.email,
                    subject: 'Please Review Us',
                    clientId: client._id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        withCredentials: true,
                    },
                }
            );
            // Optionally show success feedback here
        } catch (error) {
            console.error('Error sending review request:', error);
            // Optionally show error feedback here
        }
    };



    return (
        <Box
            sx={{
                px: { xs: 1, sm: 3 },
                py: { xs: 2, sm: 3 }
            }}
        >
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
                    <Card
                        variant="outlined"
                        sx={{
                            p: 2,
                            position: 'relative',
                            px: { xs: 1, sm: 3 },
                            py: { xs: 2, sm: 3 }
                        }}
                    >
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
                                    <Box mb={1}>
                                        <Typography variant="body1">
                                            <strong>Email:</strong> {client.email || 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Box mb={1}>
                                        <Typography variant="body1">
                                            <strong>Phone:</strong> {formatPhoneNumber(client.phone) || 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Box mb={1}>
                                        <Typography variant="body1">
                                            <strong>Address:</strong> {client.address || 'N/A'}
                                        </Typography>
                                    </Box>
                                    {/* Status Circles Block */}
                                    {(() => {
                                        // Enhanced status logic for proposal, invoice, review chain
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

                                        return (
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                                {['proposal', 'invoice', 'review'].map((category) => {
                                                    let color = 'gray';
                                                    let tooltipText = 'No activity';
                                                    let date = '';

                                                    if (category === 'proposal' && proposalStatus) {
                                                        const pStatus = proposalStatus.status.toLowerCase();
                                                        const validProposal = ['accepted', 'signed', 'approved', 'converted to invoice'].some(k => pStatus.includes(k));
                                                        const sentProposal = ['sent'].some(k => pStatus.includes(k));
                                                        const proposalCreated = ['created'].some(k => pStatus.includes(k));

                                                        switch (true) {
                                                            case validProposal:
                                                                color = 'green';
                                                                tooltipText = `Proposal: ${proposalStatus.status}`;
                                                                date = proposalStatus.date;
                                                                break;
                                                            case proposalCreated:
                                                                color = 'red';
                                                                tooltipText = `Proposal: ${proposalStatus.status}`;
                                                                date = proposalStatus.date;
                                                                break;
                                                            case sentProposal:
                                                                color = 'gold';
                                                                tooltipText = `Proposal: ${proposalStatus.status}`;
                                                                date = proposalStatus.date;
                                                                break;
                                                            default:
                                                                color = 'gray';
                                                                tooltipText = 'No proposal activity';
                                                                date = '';
                                                                break;
                                                        }
                                                    }

                                                    if (category === 'invoice' && invoiceStatus) {
                                                        const iStatus = invoiceStatus.status.toLowerCase();
                                                        const validInvoice = ['signed and paid',].some(k => iStatus.includes(k));
                                                        const sentInvoice = ['sent', 'signed', 'paid'].some(k => iStatus.includes(k));
                                                        const invoiceCreated = ['created'].some(k => iStatus.includes(k));

                                                        switch (true) {
                                                            case validInvoice:
                                                                color = 'green';
                                                                tooltipText = `Invoice: ${invoiceStatus.status}`;
                                                                date = invoiceStatus.date;
                                                                break;
                                                            case invoiceCreated:
                                                                color = 'red';
                                                                tooltipText = `Invoice: ${invoiceStatus.status}`;
                                                                date = invoiceStatus.date;
                                                                break;
                                                            case sentInvoice:
                                                                color = 'gold';
                                                                tooltipText = `Invoice: ${invoiceStatus.status}`;
                                                                date = invoiceStatus.date;
                                                                break;
                                                            default:
                                                                color = 'gray';
                                                                tooltipText = 'No invoice activity';
                                                                date = '';
                                                                break;
                                                        }
                                                    }

                                                    if (category === 'review' && reviewStatus) {
                                                        const iStatus = invoiceStatus?.status?.toLowerCase() || '';
                                                        if (iStatus.includes('paid')) {
                                                            color = 'green';
                                                            tooltipText = `Review: ${reviewStatus.status}`;
                                                            date = reviewStatus.date;
                                                        } else {
                                                            color = 'gray';
                                                            tooltipText = 'Review inactive (invoice unpaid)';
                                                            date = '';
                                                        }
                                                    }

                                                    return (
                                                        <Tooltip title={`${tooltipText}${date ? ` on ${moment(date).format('MM/DD/YYYY')}` : ''}`} key={category}>
                                                            <Box display="flex" flexDirection="column" alignItems="center">
                                                                <Box
                                                                    sx={{
                                                                        width: 64,
                                                                        height: 64,
                                                                        borderRadius: '50%',
                                                                        backgroundColor: color,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        color: 'white',
                                                                        fontWeight: 'bold',
                                                                        mb: 1,
                                                                    }}
                                                                >
                                                                    {category.charAt(0).toUpperCase()}
                                                                </Box>
                                                                <Typography variant="caption" fontWeight="bold">
                                                                    {category.toUpperCase()}
                                                                </Typography>
                                                            </Box>
                                                        </Tooltip>
                                                    );
                                                })}
                                            </Box>
                                        );
                                    })()}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            width: '100%',
                                            marginBottom: 1,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                padding: 1,
                                                borderRadius: 1,
                                                display: 'inline-block',
                                                fontWeight: 'bold',
                                                fontSize: '1.1rem',
                                                color: 'white',
                                                backgroundColor: getStatusColor(getRecentStatus(client.statusHistory)),
                                            }}
                                        >
                                            Status: {getRecentStatus(client.statusHistory)}
                                        </Box>
                                    </Box>
                                </>
                            )}
                            <Divider sx={{ marginY: 1 }} />
                            {/* Action Buttons Row */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    justifyContent: { xs: 'center', sm: 'space-between' },
                                    alignItems: 'center',
                                    gap: 1,
                                    width: '100%',
                                }}
                            >
                                {isEditing ? (
                                    <>
                                        <Box sx={{ flex: 1, width: '100%', textAlign: { xs: 'center', sm: 'start' } }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleSave}
                                                startIcon={<SaveIcon />}
                                                disabled={isSaving}
                                                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                                            >
                                                Save
                                            </Button>
                                        </Box>
                                        <Box sx={{ flex: 1, width: '100%', textAlign: { xs: 'center', sm: 'end' } }}>
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                onClick={handleCancel}
                                                startIcon={<CancelIcon />}
                                                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                                            >
                                                Cancel
                                            </Button>
                                        </Box>
                                    </>
                                ) : (
                                    <>
                                        <Box sx={{ flex: 1, width: '100%', textAlign: { xs: 'center', sm: 'start' } }}>
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                onClick={handleOpenStatusHistory}
                                                startIcon={<HistoryIcon />}
                                                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                                            >
                                                Status History
                                            </Button>
                                        </Box>
                                        <Box sx={{ flex: 1, width: '100%', textAlign: { xs: 'center', sm: 'end' } }}>
                                            <Button
                                                variant="outlined"
                                                href={`https://contacts.google.com/person/${client.resourceName?.replace(
                                                    /^people\//,
                                                    ''
                                                )}`}
                                                target="_blank"
                                                startIcon={<ContactsIcon />}
                                                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                                            >
                                                Google Contacts
                                            </Button>
                                        </Box>
                                    </>
                                )}
                            </Box>
                            {(() => {
                                const statusHistory = client.statusHistory || [];

                                const proposalStatus = [...statusHistory]
                                    .filter(s => s.status?.toLowerCase().includes('proposal'))
                                    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

                                const invoiceStatus = [...statusHistory]
                                    .filter(s => s.status?.toLowerCase().includes('invoice'))
                                    .filter(s => !s.status.toLowerCase().includes('deleted'))
                                    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

                                const pStatus = proposalStatus?.status?.toLowerCase() || '';
                                const iStatus = invoiceStatus?.status?.toLowerCase() || '';

                                const validProposal = ['accepted', 'signed', 'approved', 'converted to invoice'].some(k => pStatus.includes(k));
                                const validInvoice = ['paid', 'approved'].some(k => iStatus.includes(k)) && new Date(invoiceStatus?.date) > new Date(proposalStatus?.date);

                                if ((validProposal && validInvoice)) {
                                    return (
                                        <Box sx={{ width: '100%', mt: 1, textAlign: { xs: 'center', sm: 'center' } }}>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                sx={{
                                                    minWidth: { xs: '100%', sm: 'auto' },
                                                    minHeight: '48px',
                                                }}
                                                onClick={handleSendReview} // Replace with real function
                                            >
                                                Send Review Request
                                            </Button>
                                        </Box>
                                    );
                                }

                                return null;
                            })()}
                            <Box
                                sx={{
                                    display: isMobile ? 'flex-row' : 'flex',
                                    justifyContent: 'center',
                                    gap: 1,
                                    width: '100%',
                                    mb: 2,
                                    paddingTop: 2,
                                }}
                            >
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleNavigate('/invoices')}
                                    fullWidth={isMobile}
                                    sx={{ marginBottom: { xs: 1, sm: 0 }, height: { xs: '48px' } }}
                                >
                                    Add Invoice
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleNavigate('/proposals/new')}
                                    fullWidth={isMobile}
                                    sx={{ marginBottom: { xs: 1, sm: 0 }, height: { xs: '48px' } }}
                                >
                                    Add Proposal
                                </Button>
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
                                <TableContainer component={Paper} sx={{ maxHeight: 200, overflow: 'auto', overflowX: 'auto' }}>
                                    <Table stickyHeader aria-label="invoices table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>Invoice #</TableCell>
                                                <TableCell sx={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>Issue Date</TableCell>
                                                <TableCell sx={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>Status</TableCell>
                                                <TableCell align="right" sx={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>Amount</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {invoices.map((invoice) => (
                                                <TableRow
                                                    key={invoice._id}
                                                    onClick={() => handleInvoiceClick(invoice._id)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <TableCell sx={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>{invoice.invoiceNumber}</TableCell>
                                                    <TableCell sx={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                                                        {moment(invoice.invoiceDate).format('MM/DD/YYYY')}
                                                    </TableCell>
                                                    <TableCell sx={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>{invoice.status}</TableCell>
                                                    <TableCell align="right" sx={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
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
                                <TableContainer component={Paper} sx={{ maxHeight: 200, overflow: 'auto', overflowX: 'auto' }}>
                                    <Table stickyHeader aria-label="proposals table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>Proposal #</TableCell>
                                                <TableCell sx={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>Issue Date</TableCell>
                                                <TableCell sx={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>Status</TableCell>
                                                <TableCell align="right" sx={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>Amount</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {proposals.map((proposal) => (
                                                <TableRow
                                                    key={proposal._id}
                                                    onClick={() => handleProposalClick(proposal._id)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <TableCell sx={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>{proposal.proposalNumber}</TableCell>
                                                    <TableCell sx={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                                                        {moment(proposal.proposalDate).format('MM/DD/YYYY')}
                                                    </TableCell>
                                                    <TableCell sx={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>{proposal.status}</TableCell>
                                                    <TableCell align="right" sx={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
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
                                        <TableCell>Time</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {client.statusHistory.map((statusItem, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{moment(statusItem.date).format('MM/DD/YYYY')}</TableCell>
                                            <TableCell>{moment(statusItem.date).format('HH:mm A')}</TableCell>
                                            <TableCell style={{ color: getStatusColor(statusItem.status) }}>
                                                {statusItem.status?.toUpperCase() || 'N/A'}
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
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                            dispatch(clearClientHistory(id)).then(() => {
                                handleCloseStatusHistory();
                                dispatch(fetchOneClient(id));
                            })
                        }}
                    >
                        Clear History
                    </Button>
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