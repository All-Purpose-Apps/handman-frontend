import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOneProposal, updateProposal, deleteProposal } from '../../store/proposalSlice';
import { fetchClients } from '../../store/clientSlice';
import axios from 'axios';
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
    TextField,
    Card,
    CardContent,
    CardActions,
    Autocomplete,
    Switch,
    FormControlLabel,
    IconButton,
} from '@mui/material';
import moment from 'moment';
import DeleteIcon from '@mui/icons-material/Delete';
import InvoiceModal from '../../components/InvoiceModal'; // Import InvoiceModal component

const ViewProposal = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { proposal, status, error } = useSelector((state) => state.proposals);
    const { clients } = useSelector((state) => state.clients);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingClient, setIsEditingClient] = useState(false);
    const [isInvoiceModalOpen, setInvoiceModalOpen] = useState(false); // State for invoice modal
    const [invoiceData, setInvoiceData] = useState({}); // State to populate invoice data

    const [editedProposal, setEditedProposal] = useState({
        items: [],
        client: null,
        proposalTitle: '',
        proposalDate: '',
    });

    useEffect(() => {
        dispatch(fetchOneProposal(id));
        dispatch(fetchClients());
    }, [dispatch, id]);

    useEffect(() => {
        if (proposal) {
            setEditedProposal({
                ...proposal,
                client: proposal.client || null,
                items: proposal.items || [],
                proposalTitle: proposal.proposalTitle || '',
                proposalDate: proposal.proposalDate || '',
            });
        }
    }, [proposal]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedProposal((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleClientChange = (event, newValue) => {
        setEditedProposal((prevData) => ({
            ...prevData,
            client: newValue || null,
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = editedProposal.items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        setEditedProposal({
            ...editedProposal,
            items: newItems,
        });
    };

    const handleAddItem = () => {
        if (editedProposal.items.length < 5) {
            setEditedProposal({
                ...editedProposal,
                items: [...editedProposal.items, { description: '', regularPrice: '', discountPrice: '' }]
            });
        }
    };

    const handleDeleteItem = (index) => {
        const newItems = editedProposal.items.filter((_, i) => i !== index);
        setEditedProposal({
            ...editedProposal,
            items: newItems,
        });
    };

    const handleEditToggle = () => {
        if (isEditing) {
            dispatch(updateProposal({ ...editedProposal, updatedAt: new Date().toISOString() }));
            dispatch(fetchOneProposal(id));
        }
        setIsEditing(!isEditing);
        setIsEditingClient(false);
    };

    const handleCreatePdf = async () => {
        const accessToken = localStorage.getItem('accessToken');

        try {
            const response = await axios.post(
                'http://localhost:3000/api/proposals/create-pdf',
                { proposal: editedProposal },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    withCredentials: true,
                }
            );

            await dispatch(updateProposal({ ...editedProposal, fileUrl: response.data.url, updatedAt: new Date().toISOString() }));
            await dispatch(fetchOneProposal(id));
            window.open(response.data.url);

        } catch (error) {
            console.error('Error creating PDF:', error);
        }
    };

    const toggleClientEdit = (event) => {
        setIsEditingClient(event.target.checked);
    };

    const handleDeleteProposal = async () => {
        dispatch(deleteProposal(id));
        navigate('/proposals');
    };

    // Handle opening the Invoice Modal and setting initial data
    const handleOpenInvoiceModal = () => {
        setInvoiceData({
            ...proposal,
            invoiceDate: new Date().toISOString().split('T')[0],
            dueDate: '',
            items: proposal.items || [],
            status: 'created',
        });
        setInvoiceModalOpen(true);
    };

    const handleCloseInvoiceModal = () => {
        setInvoiceModalOpen(false);
    };

    const handleAddInvoice = (event) => {
        event.preventDefault();
        console.log('Saving invoice:', invoiceData);
        setInvoiceModalOpen(false);
    };

    // Loading state
    if (status === 'loading' || !proposal) {
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

    return (
        <Card elevation={3} style={{ padding: '16px' }}>
            <CardContent>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(-1)}
                    style={{ marginBottom: 16 }}
                >
                    Back
                </Button>
                <Typography variant="h6">
                    No. {proposal?.proposalNumber || 'Loading...'}
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            {isEditing ? (
                                <TextField
                                    name="proposalTitle"
                                    label="Proposal Title"
                                    fullWidth
                                    value={editedProposal.proposalTitle}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <Typography variant="h4">
                                    {proposal?.proposalTitle || 'Loading...'}
                                </Typography>
                            )}

                            {isEditing ? (
                                <TextField
                                    name="proposalDate"
                                    label="Proposal Date"
                                    type="date"
                                    fullWidth
                                    value={moment(editedProposal.proposalDate).format('YYYY-MM-DD')}
                                    onChange={handleInputChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            ) : (
                                <Typography variant="body1">
                                    <strong>Proposal Date:</strong> {moment(proposal?.proposalDate).format('MM/DD/YYYY') || 'Loading...'}
                                </Typography>
                            )}
                        </Box>

                        {isEditing && <FormControlLabel
                            control={<Switch checked={isEditingClient} onChange={toggleClientEdit} />}
                            label="Edit Client"
                        />}

                        {isEditingClient ? (
                            <Autocomplete
                                options={clients}
                                getOptionLabel={(client) => client.name || ''}
                                value={editedProposal.client || null}
                                onChange={handleClientChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Client"
                                        fullWidth
                                    />
                                )}
                            />
                        ) : (
                            <>
                                <Typography variant="body1" sx={{ marginTop: '10px' }}>
                                    <strong>Client Name:</strong> {proposal?.client?.name || 'Loading...'}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Client Address:</strong> {proposal?.client?.address || 'Loading...'}
                                </Typography>
                            </>
                        )}

                        <Typography variant="body1">
                            <strong>Status:</strong> {proposal?.status || 'Loading...'}
                        </Typography>

                        {proposal.fileUrl && (
                            <Typography variant="body2">
                                updated {moment.utc(proposal.updatedAt).fromNow()} on {moment.utc(proposal.updatedAt).format('MM/DD/YYYY')}
                            </Typography>
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>
                            Items
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table aria-label="items table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Regular Price</TableCell>
                                        <TableCell>Discount Price</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {editedProposal.items.map((item, index) => (
                                        <TableRow key={index}>
                                            {isEditing ? (
                                                <>
                                                    <TableCell>
                                                        <TextField
                                                            name="description"
                                                            value={item.description}
                                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                            fullWidth
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            name="regularPrice"
                                                            type="number"
                                                            value={item.regularPrice}
                                                            onChange={(e) => handleItemChange(index, 'regularPrice', e.target.value)}
                                                            fullWidth
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            name="discountPrice"
                                                            type="number"
                                                            value={item.discountPrice}
                                                            onChange={(e) => handleItemChange(index, 'discountPrice', e.target.value)}
                                                            fullWidth
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton onClick={() => handleDeleteItem(index)}>
                                                            <DeleteIcon color="error" />
                                                        </IconButton>
                                                    </TableCell>
                                                </>
                                            ) : (
                                                <>
                                                    <TableCell>{item.description}</TableCell>
                                                    <TableCell>{item.regularPrice}</TableCell>
                                                    <TableCell>${item.discountPrice.toFixed(2)}</TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {isEditing && editedProposal.items.length < 5 && (
                            <Box sx={{ marginTop: '10px', textAlign: 'left' }}>
                                <Button variant="contained" onClick={handleAddItem}>
                                    Add Item
                                </Button>
                            </Box>
                        )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box mt={2}>
                            <Typography variant="h6">
                                <strong>Package Total:</strong> ${editedProposal?.packagePrice?.toFixed(2) || 'Loading...'}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
            <CardActions>
                <Button variant="contained" onClick={handleEditToggle}>
                    {isEditing ? 'Save' : 'Edit'}
                </Button>
                {!isEditing && (
                    <Button variant="contained" onClick={handleCreatePdf}>
                        Create PDF
                    </Button>
                )}
                {proposal.fileUrl && (
                    <Button
                        variant="contained"
                        href={proposal.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View Proposal
                    </Button>
                )}
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteProposal}
                >
                    Delete
                </Button>
                {proposal?.status === 'accepted' && (
                    <Button variant="contained" color="primary" onClick={handleOpenInvoiceModal}>
                        Convert to Invoice
                    </Button>
                )}
            </CardActions>

            <InvoiceModal
                open={isInvoiceModalOpen}
                onClose={handleCloseInvoiceModal}
                invoiceData={invoiceData}
                setInvoiceData={setInvoiceData}
                handleAddInvoice={handleAddInvoice}
            />
        </Card>
    );
};

export default ViewProposal;