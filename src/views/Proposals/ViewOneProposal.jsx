import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOneProposal, updateProposal, deleteProposal } from '../../store/proposalSlice';
import { addInvoice, fetchInvoices } from '../../store/invoiceSlice';
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
    Modal,
    ListItemButton,
    ListItemAvatar,
    Avatar,
    ListItemText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ConvertInvoiceModal from './ConverInvoiceModal';
import dayjs from 'dayjs';
import moment from 'moment';
import { getAuth } from 'firebase/auth';
import { handleGoogleSignIn } from '../../utils/handleGoogleSignIn';
import SignaturePad from 'react-signature-pad-wrapper';


const ViewProposal = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const auth = getAuth();
    const { proposal, status, error } = useSelector((state) => state.proposals);
    const { clients } = useSelector((state) => state.clients);
    const { invoices } = useSelector((state) => state.invoices);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingClient, setIsEditingClient] = useState(false);
    const [isInvoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [isCreatingPdf, setIsCreatingPdf] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: '',
        invoiceDate: dayjs().format('YYYY-MM-DD'),
        client: null,
        items: [],
        subTotal1: 0,
        extraWorkMaterials: 0,
        subTotal2: 0,
        paymentMethod: 'awaiting payment',
        checkNumber: '',
        creditCardFee: 0,
        depositAdjustment: 0,
        total: 0,
    });

    const [editedProposal, setEditedProposal] = useState({
        items: [],
        client: null,
        proposalTitle: '',
        proposalDate: '',
        packagePrice: 0,
    });

    useEffect(() => {
        dispatch(fetchOneProposal(id));
        dispatch(fetchInvoices());
        dispatch(fetchClients());
    }, [dispatch, id]);

    useEffect(() => {
        if (invoices.length > 0) {
            const latestInvoiceNumber = Math.max(
                ...invoices.map((inv) => parseInt(inv.invoiceNumber, 10))
            );
            setInvoiceData((prevData) => ({
                ...prevData,
                invoiceNumber: (latestInvoiceNumber + 1).toString(),
            }));
        } else {
            setInvoiceData((prevData) => ({
                ...prevData,
                invoiceNumber: '1001',
            }));
        }
    }, [invoices]);

    useEffect(() => {
        if (proposal) {
            setEditedProposal({
                ...proposal,
                client: proposal.client || null,
                items: proposal.items || [],
                proposalTitle: proposal.proposalTitle || '',
                proposalDate: proposal.proposalDate || '',
                packagePrice: proposal.packagePrice || 0,
            });
        }
    }, [proposal]);

    const calculatePackageTotal = useCallback(() => {
        const total = editedProposal.items.reduce(
            (sum, item) => sum + parseFloat(item.discountPrice || 0),
            0
        );
        setEditedProposal((prevData) => ({
            ...prevData,
            packagePrice: total,
        }));
    }, [editedProposal.items]);

    useEffect(() => {
        calculatePackageTotal();
    }, [calculatePackageTotal]);

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
                items: [
                    ...editedProposal.items,
                    { description: '', regularPrice: '', discountPrice: '' },
                ],
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

    const handleEditToggle = async () => {
        if (isEditing) {
            await dispatch(
                updateProposal({ ...editedProposal, fileUrl: '', updatedAt: new Date().toISOString() })
            );
            dispatch(fetchOneProposal(id));
        }
        setIsEditing(!isEditing);
        setIsEditingClient(false);
    };

    const handleCreatePdf = async () => {
        setIsCreatingPdf(true);
        const accessToken = localStorage.getItem('accessToken');
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/proposals/create-pdf`,
                { proposal: editedProposal },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            await dispatch(
                updateProposal({
                    ...editedProposal,
                    fileUrl: response.data.url,
                    updatedAt: new Date().toISOString(),
                })
            );
            await dispatch(fetchOneProposal(id));
            window.open(response.data.url);
        } catch (error) {
            if (error.response?.status === 401) {
                handleGoogleSignIn(auth);
            }
            console.error('Error creating PDF:', error);
        } finally {
            setIsCreatingPdf(false);
        }
    };

    const toggleClientEdit = (event) => {
        setIsEditingClient(event.target.checked);
    };

    const handleDeleteProposal = async () => {
        await dispatch(deleteProposal(id));
        navigate('/proposals');
    };

    const handleOpenInvoiceModal = () => {
        setInvoiceData({
            ...invoiceData,
            invoiceDate: dayjs().format('YYYY-MM-DD'),
            client: editedProposal.client || null,
            items: editedProposal.items.map((item) => ({
                description: item.description,
                price: item.discountPrice,
            })),
            subTotal1: 0,
            extraWorkMaterials: 0,
            subTotal2: 0,
            paymentMethod: 'awaiting payment',
            checkNumber: '',
            creditCardFee: 0,
            depositAdjustment: 0,
            total: 0,
        });
        setInvoiceModalOpen(true);
    };

    const handleCloseInvoiceModal = () => {
        setInvoiceModalOpen(false);
    };

    const handleAddInvoice = async (event) => {
        event.preventDefault();

        try {
            const response = await dispatch(addInvoice(invoiceData));
            await dispatch(
                updateProposal({
                    ...editedProposal,
                    status: 'converted to invoice',
                    invoiceId: response.payload._id,
                    updatedAt: new Date().toISOString(),
                })
            );
            setInvoiceModalOpen(false);
            navigate(`/invoices/${response.payload._id}`);
        } catch (error) {
            console.error('Error adding invoice:', error);
        }
    };

    const handleGoToInvoice = (invoiceId) => {
        navigate(`/invoices/${invoiceId}`);
    };

    const handleSendProposal = async () => {
        dispatch(updateProposal({ ...editedProposal, status: 'sent to client' }));
        console.log('Sending proposal to client...');
        dispatch(fetchOneProposal(id));
        console.log('Proposal sent');
    }

    // Invoice Modal Handlers
    const handleInvoiceInputChange = (e) => {
        const { name, value } = e.target;
        setInvoiceData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleInvoiceClientChange = (event, newValue) => {
        setInvoiceData((prevData) => ({
            ...prevData,
            client: newValue || null,
        }));
    };

    const handleInvoiceItemChange = (index, field, value) => {
        const newItems = invoiceData.items.map((item, i) => {
            return i === index ? { ...item, [field]: value } : item
        }
        );
        setInvoiceData({
            ...invoiceData,
            items: newItems,
        });
    };

    const handleInvoiceAddItem = () => {
        setInvoiceData({
            ...invoiceData,
            items: [
                ...invoiceData.items,
                { description: '', price: '' },
            ],
        });
    };

    const handleInvoiceDeleteItem = (index) => {
        const newItems = invoiceData.items.filter((_, i) => i !== index);
        setInvoiceData({
            ...invoiceData,
            items: newItems,
        });
    };

    const handleOpenDeleteModal = () => setIsDeleteModalOpen(true);
    const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

    const handleConfirmDelete = async () => {
        await dispatch(deleteProposal(id));
        navigate('/proposals');
        setIsDeleteModalOpen(false);
    };

    const calculateTotals = useCallback(() => {
        let subTotal1 = invoiceData.items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
        let subTotal2 = subTotal1 + parseFloat(invoiceData.extraWorkMaterials || 0);

        // Calculate the credit/debit card fee (3% of subTotal2)
        let creditCardFee = 0;
        if (invoiceData.paymentMethod === 'credit/debit') {
            creditCardFee = subTotal2 * 0.03;
        }

        // Calculate the final total
        let total = subTotal2 + creditCardFee - parseFloat(invoiceData.depositAdjustment || 0);

        setInvoiceData((prevData) => ({
            ...prevData,
            subTotal1,
            subTotal2,
            creditCardFee,
            total,
        }));
    }, [invoiceData.items, invoiceData.extraWorkMaterials, invoiceData.depositAdjustment, invoiceData.paymentMethod]);
    // Call calculateTotals when relevant data changes
    useEffect(() => {
        calculateTotals();
    }, [calculateTotals]);


    if (status === 'loading' || !proposal) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    if (status === 'failed') {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
            >
                <Typography variant="h6" color="error">
                    Error: {error}
                </Typography>
            </Box>
        );
    }

    const renderActions = () => {
        switch (editedProposal?.status) {
            case 'converted to invoice':
                return (
                    <>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => handleGoToInvoice(editedProposal.invoiceId)}
                        >
                            Go to Invoice
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleOpenDeleteModal}
                        >
                            Delete
                        </Button>
                        <Typography variant="body1" color="error">
                            This proposal has been converted to an invoice and can no longer
                            be edited.
                        </Typography>
                    </>
                );
            case 'accepted':
                return (
                    <>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </Button>
                        {!isEditing && <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenInvoiceModal}
                        >
                            Convert to Invoice
                        </Button>}
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
                            onClick={handleOpenDeleteModal}
                        >
                            Delete
                        </Button>
                    </>
                );
            default:
                return (
                    <>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </Button>
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
                        {proposal.fileUrl && proposal.status == "draft" && (
                            <Button
                                variant="contained"
                                onClick={handleSendProposal}
                            >
                                Send To Client
                            </Button>
                        )}
                        {!isEditing && <Button
                            variant="contained"
                            color="error"
                            onClick={handleOpenDeleteModal}
                        >
                            Delete
                        </Button>}
                    </>
                );
        }
    };

    return (
        <Card elevation={3} style={{ padding: '16px' }}>
            <CardContent>

                <Typography variant="h6">
                    No. {proposal?.proposalNumber || 'Loading...'}
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            {isEditing ? (
                                <TextField
                                    name="proposalDate"
                                    label="Proposal Date"
                                    type="date"
                                    fullWidth
                                    value={dayjs(editedProposal.proposalDate).format(
                                        'YYYY-MM-DD'
                                    )}
                                    onChange={handleInputChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            ) : (
                                <Typography variant="body1">
                                    <strong>Proposal Date:</strong>{' '}
                                    {dayjs(proposal?.proposalDate).format('MM/DD/YYYY') ||
                                        'Loading...'}
                                </Typography>
                            )}
                        </Box>

                        {isEditing && (
                            <FormControlLabel
                                control={
                                    <Switch checked={isEditingClient} onChange={toggleClientEdit} />
                                }
                                label="Edit Client"
                            />
                        )}

                        {isEditingClient ? (
                            <Autocomplete
                                options={clients}
                                getOptionLabel={(client) => client.name || ''}
                                value={editedProposal.client || null}
                                onChange={handleClientChange}
                                renderInput={(params) => (
                                    <TextField {...params} label="Select Client" fullWidth />
                                )}
                            />
                        ) : (
                            <>
                                <ListItemButton
                                    onClick={() => navigate(`/clients/${proposal.client._id}`)}
                                    sx={{
                                        borderRadius: 2,
                                        '&:hover': {
                                            backgroundColor: 'primary.light',
                                        },
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar>

                                            {proposal?.client?.name?.charAt(0)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={proposal?.client?.name} secondary="Click to view details" />
                                </ListItemButton>
                                <Typography variant="body1" sx={{ marginTop: '10px' }}>
                                    <strong>Client Name:</strong>{' '}
                                    {proposal?.client?.name || 'Loading...'}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Client Address:</strong>{' '}
                                    {proposal?.client?.address || 'Loading...'}
                                </Typography>
                            </>
                        )}

                        <Typography variant="body1">
                            <strong>Status:</strong> {proposal?.status || 'Loading...'}
                        </Typography>

                        {proposal.fileUrl && (
                            <Typography variant="body2">
                                updated {moment.utc(editedProposal.updatedAt).fromNow()} on {moment.utc(editedProposal.updatedAt).format('MM/DD/YYYY')}
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
                                        {isEditing && <TableCell>Actions</TableCell>}
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
                                                            onChange={(e) =>
                                                                handleItemChange(
                                                                    index,
                                                                    'description',
                                                                    e.target.value
                                                                )
                                                            }
                                                            fullWidth
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            name="regularPrice"
                                                            type="number"
                                                            value={item.regularPrice}
                                                            onChange={(e) =>
                                                                handleItemChange(
                                                                    index,
                                                                    'regularPrice',
                                                                    e.target.value
                                                                )
                                                            }
                                                            fullWidth
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            name="discountPrice"
                                                            type="number"
                                                            value={item.discountPrice}
                                                            onChange={(e) =>
                                                                handleItemChange(
                                                                    index,
                                                                    'discountPrice',
                                                                    e.target.value
                                                                )
                                                            }
                                                            fullWidth
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            onClick={() => handleDeleteItem(index)}
                                                            aria-label="Delete Item"
                                                        >
                                                            <DeleteIcon color="error" />
                                                        </IconButton>
                                                    </TableCell>
                                                </>
                                            ) : (
                                                <>
                                                    <TableCell>{item.description}</TableCell>
                                                    <TableCell>${item.regularPrice}</TableCell>
                                                    <TableCell>
                                                        $
                                                        {item.discountPrice
                                                            ? parseFloat(item.discountPrice).toFixed(2)
                                                            : '0.00'}
                                                    </TableCell>
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
                                <strong>Package Total:</strong>{' '}
                                ${editedProposal?.packagePrice?.toFixed(2) || '0.00'}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
            <CardActions>{renderActions()}</CardActions>

            {/* Render the ConvertInvoiceModal */}
            {isInvoiceModalOpen && (
                <ConvertInvoiceModal
                    openModal={isInvoiceModalOpen}
                    setOpenModal={setInvoiceModalOpen}
                    newInvoiceData={invoiceData}
                    handleInputChange={handleInvoiceInputChange}
                    handleClientChange={handleInvoiceClientChange}
                    handleItemChange={handleInvoiceItemChange}
                    handleDeleteItem={handleInvoiceDeleteItem}
                    handleAddItem={handleInvoiceAddItem}
                    handleAddInvoice={handleAddInvoice}
                    clients={clients}
                />
            )}

            {/* Loading Modal */}
            <Modal
                open={isCreatingPdf}
                aria-labelledby="creating-pdf-modal"
                aria-describedby="creating-pdf-description"
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
                            Creating Pdf...
                        </Typography>
                    </Box>
                </Box>
            </Modal>
            <Modal
                open={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                aria-labelledby="delete-confirmation-modal"
                aria-describedby="delete-confirmation-description"
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    bgcolor="background.paper"
                    p={4}
                    borderRadius={1}
                    boxShadow={3}
                    sx={{ width: { xs: '80%', md: 400 }, margin: 'auto', textAlign: 'center' }}
                >
                    <Typography variant="h6" mb={2} id="delete-confirmation-modal">
                        Are you sure you want to delete this proposal?
                    </Typography>
                    <Box display="flex" justifyContent="space-around" width="100%">
                        <Button variant="contained" onClick={handleCloseDeleteModal}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleConfirmDelete}
                        >
                            Confirm Delete
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Card>
    );
};

export default ViewProposal;