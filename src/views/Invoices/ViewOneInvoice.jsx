
import React, { useEffect, useState } from 'react';
import { fetchOneInvoice, updateInvoice, deleteInvoice } from '../../store/invoiceSlice';
import { fetchClients } from '../../store/clientSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Button,
    TextField,
    Card,
    CardContent,
    CardActions,
    Grid,
    Typography,
    Autocomplete,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    ListItemButton,
    IconButton,
    ListItemAvatar,
    Avatar,
    Modal,
    Box,
    CircularProgress,
    Fade,
    Backdrop,
    ListItemText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import moment from 'moment';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ViewOneInvoice() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { invoice, status, error } = useSelector((state) => state.invoices);
    const { clients } = useSelector((state) => state.clients);
    const [isEditing, setIsEditing] = useState(false);
    const [prevClientId, setPrevClientId] = useState(null);
    const [isCreatingPdf, setIsCreatingPdf] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Modal states for send invoice and missing PDF
    const [missingPdfModalOpen, setMissingPdfModalOpen] = useState(false);
    const [sendSuccessModalOpen, setSendSuccessModalOpen] = useState(false);
    const [sendFailureModalOpen, setSendFailureModalOpen] = useState(false);

    const [editedInvoice, setEditedInvoice] = useState({
        items: [],
        client: null,
    });

    useEffect(() => {
        dispatch(fetchOneInvoice(id));
        dispatch(fetchClients());
    }, [dispatch, id]);

    useEffect(() => {
        if (invoice) {
            setEditedInvoice({
                ...invoice,
                client: invoice.client || null,
                items: invoice.items || [],
            });
            setPrevClientId(invoice.client?._id || null);
        }
    }, [invoice]);

    const handleClientChange = (event, newValue) => {
        setEditedInvoice({
            ...editedInvoice,
            client: newValue,
        });
    };

    const handleBack = () => {
        if (isEditing) {
            setIsEditing(false);
        } else {
            navigate(-1);
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            const newClientId = editedInvoice.client?._id || null;
            dispatch(
                updateInvoice({
                    id,
                    prevClientId,
                    newClientId,
                    invoiceData: {
                        ...editedInvoice,
                        client: newClientId,
                        fileUrl: '',
                        signedPdfUrl: '',
                        status: 'created',
                        updatedAt: new Date().toISOString(),
                    },
                })
            ).then(() => {
                dispatch(fetchOneInvoice(id));
            });
        }
        setIsEditing(!isEditing);
    };

    const handleDeleteInvoice = () => {
        dispatch(deleteInvoice(id));
        navigate(-1);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedInvoice((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = editedInvoice.items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        setEditedInvoice({
            ...editedInvoice,
            items: newItems,
        });
    };

    const handleAddItem = () => {
        if (editedInvoice.items.length < 5) {
            setEditedInvoice({
                ...editedInvoice,
                items: [...editedInvoice.items, { description: '', price: '' }],
            });
        }
    };

    const calculateTotals = () => {
        const subTotal1 = editedInvoice.items.reduce(
            (acc, item) => acc + parseFloat(item.price || 0),
            0
        );
        const subTotal2 = subTotal1 + parseFloat(editedInvoice.extraWorkMaterials || 0);
        const creditCardFee =
            editedInvoice.paymentMethod === 'credit/debit' ? subTotal2 * 0.03 : 0;
        const total =
            subTotal2 +
            creditCardFee -
            parseFloat(editedInvoice.depositAdjustment || 0);
        setEditedInvoice((prevData) => ({
            ...prevData,
            subTotal1,
            subTotal2,
            creditCardFee,
            total,
        }));
    };

    useEffect(() => {
        calculateTotals();
    }, [
        editedInvoice.items,
        editedInvoice.extraWorkMaterials,
        editedInvoice.paymentMethod,
        editedInvoice.depositAdjustment,
    ]);

    const handleCreatePdf = async () => {
        setIsCreatingPdf(true);
        const accessToken = localStorage.getItem('accessToken');

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/invoices/create-pdf`,
                { invoice },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    withCredentials: true,
                }
            );

            await dispatch(
                updateInvoice({
                    invoiceData: {
                        ...editedInvoice,
                        fileUrl: response.data.url,
                        status: 'invoice pdf created',
                        updatedAt: new Date().toISOString(),
                    },
                    id: editedInvoice._id,
                    prevClientId: editedInvoice.client._id,
                    newClientId: editedInvoice.client._id,
                })
            );
            window.open(response.data.url);
        } catch (error) {
            console.error('Error creating PDF:', error);
            if (error.response && error.response.status === 401) {
                alert('Session expired. Please log in again.');
                localStorage.removeItem('accessToken');
                localStorage.setItem('signInInProgress', JSON.stringify(false));
                window.location.href = '/login';
            }
        } finally {
            setIsCreatingPdf(false);
        }
    };

    const handleSendInvoice = async () => {
        const accessToken = localStorage.getItem('accessToken');
        const token = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/invoices/create-token`,
            {
                invoiceId: editedInvoice._id,
                data: { invoiceUrl: editedInvoice.fileUrl },
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    withCredentials: true,
                },
            }
        );

        const tokenUrl = `${import.meta.env.VITE_FRONTEND_URL}/sign/${token.data.token}`;

        if (editedInvoice.fileUrl) {
            try {
                await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/gmail/send`,
                    {
                        to: editedInvoice.client?.email,
                        subject: `Invoice ${editedInvoice.invoiceNumber}`,
                        body: `Hello ${editedInvoice.client?.name},<br><br>

Attached please find the final invoice No. ${editedInvoice.invoiceNumber}. We have three new ways to make payments more secure:<br><br>

Zelle at <strong>813-361-2297</strong><br>
Cash App at <strong>$winrivera</strong><br>
Venmo at <strong>@EdwinA-Rivera-3</strong><br><br>

If you prefer to make the payment through Credit Card with a 3% transaction fee, let me know so I can send you the link.<br><br>
<p>You can sign the invoice <a href="${tokenUrl}">here</a>.</p>
Thank you,<br><br>

Armando Rivera<br>
Han-D-Man Pro<br>
(813) 360-1819`,
                        pdfUrl: editedInvoice.fileUrl,
                        invoice: editedInvoice,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            withCredentials: true,
                        },
                    }
                );
                setSendSuccessModalOpen(true);
                // Update invoice status to 'sent' after successful email
                await dispatch(updateInvoice({
                    id,
                    invoiceData: {
                        ...editedInvoice,
                        status: 'sent',
                        updatedAt: new Date().toISOString(),
                    },
                }));
            } catch (error) {
                console.error('Error sending invoice:', error);
                setSendFailureModalOpen(true);
            } finally {
                dispatch(fetchOneInvoice(id));
            }
        } else {
            setMissingPdfModalOpen(true);
        }
    };

    const handleDeleteItem = (index) => {
        const newItems = editedInvoice.items.filter((_, i) => i !== index);
        setEditedInvoice({
            ...editedInvoice,
            items: newItems,
        });
    };

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (status === 'failed') {
        return <div>Error: {error}</div>;
    }

    const statusColorMap = {
        CREATED: 'black',
        SENT: 'blue',
        PAID: 'yellow',
        CANCELED: 'red',
        'SIGNED AND PAID': 'green',
    };

    const getStatusColor = (status) => statusColorMap[status] || 'black';

    const handleOpenDeleteModal = () => setIsDeleteModalOpen(true);
    const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

    const handleConfirmDelete = () => {
        dispatch(deleteInvoice(id));
        setIsDeleteModalOpen(false);
        navigate(-1);
    };

    const handlePaidInvoice = () => {
        dispatch(updateInvoice({
            id,
            invoiceData: {
                ...editedInvoice,
                status: 'signed and paid',
                updatedAt: new Date().toISOString(),
            },
        })).then(() => {
            dispatch(fetchOneInvoice(id));
        });
    }

    return (
        <>
            <Card elevation={3}>
                <CardContent>
                    <Grid
                        container
                        spacing={2}
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ padding: '10px' }}
                    >
                        <Grid item>
                            <IconButton onClick={handleBack}>
                                <ArrowBackIcon />
                            </IconButton>
                        </Grid>
                        <Grid item>
                            <Box display="flex" gap={2}>
                                {editedInvoice.fileUrl && !isEditing && (
                                    <Button
                                        variant="contained"
                                        href={editedInvoice.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View Invoice
                                    </Button>
                                )}
                                {editedInvoice.signedPdfUrl && !isEditing && (
                                    <Button
                                        variant="contained"
                                        href={editedInvoice.signedPdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View Signed Invoice
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">
                            No. {editedInvoice?.invoiceNumber || 'Loading...'}
                        </Typography>
                        <Box mt={2} mb={2}>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    display: 'inline-block',
                                    px: 2,
                                    py: 1,
                                    borderRadius: 2,
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    backgroundColor:
                                        editedInvoice?.status === 'signed and paid'
                                            ? 'success.main'
                                            : editedInvoice?.status === 'paid'
                                                ? 'success.main'
                                                : editedInvoice?.status === 'sent'
                                                    ? 'info.main'
                                                    : editedInvoice?.status === 'created' || editedInvoice?.status === 'awaiting payment' || editedInvoice?.status === 'awaiting signature' || editedInvoice?.status === 'invoice pdf created'
                                                        ? 'warning.main'
                                                        : editedInvoice?.status === 'canceled'
                                                            ? 'error.main'
                                                            : 'grey.700',
                                    letterSpacing: 1,
                                    fontSize: '1.1rem',
                                }}
                            >
                                Status: {editedInvoice?.status?.toUpperCase() || 'Loading...'}
                            </Typography>
                        </Box>
                    </Box>
                    <Grid container spacing={2} alignItems="flex-start">
                        <Grid item xs={12} md={4}>
                            {isEditing ? (
                                clients && clients.length > 0 ? (
                                    <Autocomplete
                                        options={clients}
                                        getOptionLabel={(client) => (client ? client.name : '')}
                                        value={editedInvoice.client || null}
                                        onChange={handleClientChange}
                                        isOptionEqualToValue={(option, value) => option.id === value?.id}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Select Client" fullWidth />
                                        )}
                                    />
                                ) : (
                                    <Typography>No clients available.</Typography>
                                )
                            ) : (
                                <ListItemButton
                                    onClick={() => navigate(`/clients/${invoice.client._id}`)}
                                    sx={{
                                        borderRadius: 2,
                                        '&:hover': {
                                            backgroundColor: 'primary.light',
                                        },
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar>{invoice?.client?.name?.charAt(0)}</Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={invoice?.client?.name} secondary="Click to view details" />
                                </ListItemButton>
                            )}
                            {isEditing ? (
                                <>
                                    <TextField
                                        label="Invoice Address"
                                        name="address"
                                        fullWidth
                                        value={editedInvoice.address || ''}
                                        onChange={handleInputChange}
                                        sx={{ mt: 2 }}
                                    />
                                    <TextField
                                        label="Project Address"
                                        name="projectFullAddress"
                                        fullWidth
                                        value={editedInvoice.projectFullAddress || ''}
                                        onChange={handleInputChange}
                                        sx={{ mt: 2 }}
                                    />
                                </>
                            ) : (
                                <Box>
                                    <Typography variant="body2" sx={{ mt: 2 }}>
                                        Client Address: {invoice?.client?.address || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Project Address: {invoice?.projectFullAddress}
                                    </Typography>
                                </Box>
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="h6" align="left">
                                        Invoice Number: {editedInvoice?.invoiceNumber}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    {isEditing ? (
                                        <TextField
                                            label="Invoice Date"
                                            type="date"
                                            name="invoiceDate"
                                            value={editedInvoice?.invoiceDate?.split('T')[0] || ''}
                                            onChange={handleInputChange}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            fullWidth
                                        />
                                    ) : (
                                        <Typography align="left">
                                            Invoice Date:{' '}
                                            {moment.utc(editedInvoice?.invoiceDate).format('MM/DD/YY')}
                                        </Typography>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom align="left">
                                Items:
                            </Typography>
                            {editedInvoice.items && editedInvoice.items.length > 0 ? (
                                editedInvoice.items.map((item, index) => (
                                    <Card
                                        key={index}
                                        variant="outlined"
                                        sx={{ marginBottom: '16px', padding: '16px' }}
                                    >
                                        {isEditing ? (
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={12} sm={7}>
                                                    <TextField
                                                        label="Description"
                                                        fullWidth
                                                        value={item.description}
                                                        onChange={(e) =>
                                                            handleItemChange(index, 'description', e.target.value)
                                                        }
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={3}>
                                                    <TextField
                                                        label="Price"
                                                        type="number"
                                                        fullWidth
                                                        value={item.price}
                                                        onChange={(e) =>
                                                            handleItemChange(index, 'price', e.target.value)
                                                        }
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={2}>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleDeleteItem(index)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        ) : (
                                            <Typography align="left">
                                                {item.description} (Price: ${item.price})
                                            </Typography>
                                        )}
                                    </Card>
                                ))
                            ) : (
                                <Typography align="left">No items added yet.</Typography>
                            )}
                            {isEditing && editedInvoice.items.length < 5 && (
                                <Button variant="contained" onClick={handleAddItem}>
                                    Add Item
                                </Button>
                            )}
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography align="left">
                                Subtotal 1: ${editedInvoice?.subTotal1?.toFixed(2)}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {isEditing ? (
                                <TextField
                                    label="Extra Work/Materials"
                                    name="extraWorkMaterials"
                                    type="number"
                                    fullWidth
                                    value={editedInvoice.extraWorkMaterials || ''}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <Typography align="left">
                                    Extra Work/Materials: ${editedInvoice?.extraWorkMaterials || 0}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography align="left">
                                Subtotal 2: ${editedInvoice?.subTotal2?.toFixed(2)}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {isEditing ? (
                                <TextField
                                    label="Deposit/Adjustment"
                                    name="depositAdjustment"
                                    type="number"
                                    fullWidth
                                    value={editedInvoice.depositAdjustment || ''}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <Typography align="left">
                                    Deposit/Adjustment: ${editedInvoice.depositAdjustment || 0}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {isEditing ? (
                                <FormControl fullWidth>
                                    <InputLabel id="payment-method-label">Payment Method</InputLabel>
                                    <Select
                                        labelId="payment-method-label"
                                        name="paymentMethod"
                                        value={editedInvoice.paymentMethod || ''}
                                        label="Payment Method"
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <MenuItem value="awaiting payment">Awaiting Payment</MenuItem>
                                        <MenuItem value="cash">Cash</MenuItem>
                                        <MenuItem value="check">Check</MenuItem>
                                        <MenuItem value="credit/debit">Credit/Debit</MenuItem>
                                        <MenuItem value="online">Online</MenuItem>
                                    </Select>
                                </FormControl>
                            ) : (
                                <Typography align="left">
                                    Payment Method: {editedInvoice.paymentMethod}
                                </Typography>
                            )}
                        </Grid>
                        {editedInvoice.paymentMethod === 'check' && (
                            <Grid item xs={12} md={6}>
                                {isEditing ? (
                                    <TextField
                                        label="Check Number"
                                        name="checkNumber"
                                        fullWidth
                                        value={editedInvoice.checkNumber || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                ) : (
                                    <Typography align="left">
                                        Check Number: {editedInvoice.checkNumber}
                                    </Typography>
                                )}
                            </Grid>
                        )}
                        {editedInvoice.paymentMethod === 'credit/debit' && (
                            <Grid item xs={12}>
                                <Typography align="left">
                                    Credit Card Fee (3%): ${editedInvoice?.creditCardFee?.toFixed(2)}
                                </Typography>
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <Typography variant="h6" align="left">
                                Total: ${editedInvoice?.total?.toFixed(2)}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions>
                    <Grid
                        container
                        spacing={2}
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ padding: '10px' }}
                    >
                        <Grid item>
                            <Box display="flex" gap={2}>
                                <Button variant="contained" onClick={handleEditToggle}>
                                    {isEditing ? 'Save' : 'Edit'}
                                </Button>
                                {!isEditing && (
                                    <>
                                        <Button
                                            variant="contained"
                                            onClick={handleOpenDeleteModal}
                                            color="error"
                                        >
                                            Delete
                                        </Button>
                                        {invoice.status == 'signed' && <Button
                                            variant="contained"
                                            color="success"
                                            onClick={handlePaidInvoice}
                                        >
                                            Mark as Paid
                                        </Button>}
                                    </>
                                )}
                            </Box>
                        </Grid>
                        <Grid item>
                            <Box display="flex" gap={2}>
                                {!isEditing && (
                                    <Button variant="contained" onClick={handleCreatePdf}>
                                        {editedInvoice.fileUrl ? 'Regenerate PDF' : 'Create PDF'}
                                    </Button>
                                )}

                                {editedInvoice.fileUrl && !editedInvoice.signedPdfUrl && !isEditing && (
                                    <Button variant="contained" onClick={handleSendInvoice} color="primary">
                                        Send Invoice
                                    </Button>
                                )}
                                {editedInvoice.signedPdfUrl && !isEditing && (
                                    <Button
                                        variant="contained"
                                        onClick={handleSendInvoice}
                                        color="warning"
                                    >
                                        Resend Invoice
                                    </Button>
                                )}
                                {/* Get Signature Button for Invoice */}
                                {editedInvoice.fileUrl && editedInvoice.status === 'sent' && (
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => navigate(`/signature/invoice/${invoice._id}`)}
                                    >
                                        Get Signature
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </CardActions>
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
                            Are you sure you want to delete this invoice?
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
            </Card >
            {/* Modals for send invoice and missing PDF */}
            < Modal
                open={missingPdfModalOpen}
                onClose={() => setMissingPdfModalOpen(false)
                }
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{ backdrop: { timeout: 300 } }}
            >
                <Fade in={missingPdfModalOpen}>
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        bgcolor="background.paper"
                        p={4}
                        borderRadius={1}
                        boxShadow={3}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: { xs: '80%', md: 400 },
                            textAlign: 'center',
                            margin: 'auto'
                        }}
                    >
                        <Typography variant="h6" mb={2}>
                            Please create the PDF first before sending.
                        </Typography>
                        <Button variant="contained" onClick={() => setMissingPdfModalOpen(false)}>
                            Close
                        </Button>
                    </Box>
                </Fade>
            </Modal>

            <Modal
                open={sendSuccessModalOpen}
                onClose={() => setSendSuccessModalOpen(false)}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{ backdrop: { timeout: 300 } }}
            >
                <Fade in={sendSuccessModalOpen}>
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        bgcolor="background.paper"
                        p={4}
                        borderRadius={1}
                        boxShadow={3}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: { xs: '80%', md: 400 },
                            textAlign: 'center',
                            margin: 'auto'
                        }}
                    >
                        <Typography variant="h6" mb={2}>
                            Invoice sent successfully!
                        </Typography>
                        <Button variant="contained" onClick={() => setSendSuccessModalOpen(false)}>
                            Close
                        </Button>
                    </Box>
                </Fade>
            </Modal>

            <Modal
                open={sendFailureModalOpen}
                onClose={() => setSendFailureModalOpen(false)}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{ backdrop: { timeout: 300 } }}
            >
                <Fade in={sendFailureModalOpen}>
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        bgcolor="background.paper"
                        p={4}
                        borderRadius={1}
                        boxShadow={3}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: { xs: '80%', md: 400 },
                            textAlign: 'center',
                            margin: 'auto'
                        }}
                    >
                        <Typography variant="h6" mb={2}>
                            Failed to send invoice.
                        </Typography>
                        <Button variant="contained" onClick={() => setSendFailureModalOpen(false)}>
                            Close
                        </Button>
                    </Box>
                </Fade>
            </Modal>
        </>
    );
}