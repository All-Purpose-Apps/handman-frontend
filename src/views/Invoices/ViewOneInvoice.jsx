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
    CardActionArea,
    ListItem,
    ListItemText,
    List,
    ListItemButton,
    IconButton,
    ListItemIcon,
    ListItemAvatar,
    Avatar,
    Modal,
    Box,
    CircularProgress,
} from '@mui/material';
import moment from 'moment';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete'; // Import delete icon


export default function ViewOneInvoice() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { invoice, status, error } = useSelector((state) => state.invoices);
    const { clients } = useSelector((state) => state.clients);
    const [isEditing, setIsEditing] = useState(false);
    const [prevClientId, setPrevClientId] = useState(null);
    const [isCreatingPdf, setIsCreatingPdf] = useState(false); // New state for loading modal


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
                items: [
                    ...editedInvoice.items,
                    { description: '', price: '' },
                ],
            });
        }
    };

    const calculateTotals = () => {
        const subTotal1 = editedInvoice.items.reduce(
            (acc, item) => acc + parseFloat(item.price || 0),
            0
        );
        const subTotal2 =
            subTotal1 + parseFloat(editedInvoice.extraWorkMaterials || 0);
        const creditCardFee =
            editedInvoice.paymentMethod === 'credit/debit'
                ? subTotal2 * 0.03
                : 0;
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

            await dispatch(updateInvoice({ invoiceData: { ...editedInvoice, fileUrl: response.data.url, updatedAt: new Date().toISOString() }, id: editedInvoice._id, prevClientId: editedInvoice.client._id, newClientId: editedInvoice.client._id }));
            window.open(response.data.url);
        } catch (error) {
            console.error('Error creating PDF:', error);
        } finally {
            setIsCreatingPdf(false);
        }
    };

    const handleSendInvoice = async () => {
        const accessToken = localStorage.getItem('accessToken');
        const token = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/invoices/create-token`, { invoiceId: editedInvoice._id, data: { invoiceUrl: editedInvoice.fileUrl } }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                withCredentials: true,
            },
        });

        const tokenUrl = `${import.meta.env.VITE_FRONTEND_URL}/sign/${token.data.token}`;

        if (editedInvoice.fileUrl) {
            try {
                await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/gmail/send`,
                    {
                        to: 'joshuapleduc@gmail.com',
                        subject: `Invoice ${editedInvoice.invoiceNumber}`,
                        body: `Dear ${editedInvoice.client?.name},<br><br>Please find your invoice attached. You can also access it <a href="${tokenUrl}">here</a>.<br><br>Thank you,<br>Han-D-Man Pro`,
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
                alert('Invoice sent successfully!');
            } catch (error) {
                console.error('Error sending invoice:', error);
                alert('Failed to send invoice.');
            } finally {
                dispatch(fetchOneInvoice(id));
            }
        } else {
            alert('Please create the PDF first before sending.');
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
        'CREATED': 'black',
        'SENT': 'blue',
        'PAID': 'yellow',
        'CANCELED': 'red',
        'SIGNED AND PAID': 'green',
    };

    const getStatusColor = (status) => statusColorMap[status] || 'black';


    return (
        <Card elevation={3} style={{ padding: '16px' }}>
            <CardContent>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                        <Typography variant="h4" gutterBottom align="left">
                            Invoice Details
                        </Typography>
                    </Grid>
                    {editedInvoice.fileUrl && (
                        <Grid item>
                            updated {moment.utc(editedInvoice.updatedAt).fromNow()} on {moment.utc(editedInvoice.updatedAt).format('MM/DD/YYYY')}
                        </Grid>
                    )}
                </Grid>
                <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={4}>
                        {isEditing ? (
                            clients && clients.length > 0 ? (
                                <Autocomplete
                                    options={clients}
                                    getOptionLabel={(client) =>
                                        client
                                            ? client.name
                                            : ''
                                    }
                                    value={editedInvoice.client || null}
                                    onChange={handleClientChange}
                                    isOptionEqualToValue={(option, value) =>
                                        option.id === value?.id
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Client"
                                            fullWidth
                                        />
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
                                    <Avatar>
                                        {invoice?.client?.name?.charAt(0)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={invoice?.client?.name} secondary="Click to view details" />
                            </ListItemButton>
                        )}
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={12} alignItems="center">
                            <Grid item>
                                <Typography variant="h6" align="left">
                                    Invoice Number: {editedInvoice?.invoiceNumber}
                                </Typography>
                            </Grid>
                            <Grid item>
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
                                    />
                                ) : (
                                    <Typography align="left">
                                        Invoice Date:{' '}
                                        {moment.utc(editedInvoice?.invoiceDate).format('MM-DD-YYYY')}
                                    </Typography>
                                )}
                            </Grid>
                            <Grid item>
                                <Typography align="left"
                                    sx={{ color: getStatusColor(editedInvoice?.status?.toUpperCase()) }}>
                                    Status: <strong>
                                        {editedInvoice?.status?.toUpperCase()}
                                    </strong>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    {/* Items */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom align="left">
                            Items:
                        </Typography>
                        {editedInvoice.items && editedInvoice.items.length > 0 ? (
                            editedInvoice.items.map((item, index) => (
                                <Card
                                    key={index}
                                    variant="outlined"
                                    style={{
                                        marginBottom: '16px',
                                        padding: '16px',
                                    }}
                                >
                                    {isEditing ? (
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12} sm={7}>
                                                <TextField
                                                    label="Description"
                                                    fullWidth
                                                    value={item.description}
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            index,
                                                            'description',
                                                            e.target.value
                                                        )
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
                                                        handleItemChange(
                                                            index,
                                                            'price',
                                                            e.target.value
                                                        )
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
                            <Button
                                variant="contained"
                                onClick={handleAddItem}
                            >
                                Add Item
                            </Button>
                        )}
                    </Grid>
                    {/* Subtotal 1 */}
                    <Grid item xs={2}>
                        <Typography align="left">
                            Subtotal 1: ${editedInvoice?.subTotal1?.toFixed(2)}
                        </Typography>
                    </Grid>
                    {/* Extra Work/Materials */}
                    <Grid item xs={2}>
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
                                Extra Work/Materials: $
                                {editedInvoice?.extraWorkMaterials || 0}
                            </Typography>
                        )}
                    </Grid>
                    {/* Subtotal 2 */}
                    <Grid item xs={2}>
                        <Typography >
                            Subtotal 2: ${editedInvoice?.subTotal2?.toFixed(2)}
                        </Typography>
                    </Grid>
                    <Grid item xs={2}>
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
                                Deposit/Adjustment: $
                                {editedInvoice.depositAdjustment || 0}
                            </Typography>
                        )}
                    </Grid>
                    {/* Payment Method */}
                    <Grid item xs={12} sm={4}>
                        {isEditing ? (
                            <FormControl fullWidth>
                                <InputLabel id="payment-method-label">
                                    Payment Method
                                </InputLabel>
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
                                    <MenuItem value="credit/debit">
                                        Credit/Debit
                                    </MenuItem>
                                    <MenuItem value="online">Online</MenuItem>
                                </Select>
                            </FormControl>
                        ) : (
                            <Typography align="left">
                                Payment Method: {editedInvoice.paymentMethod}
                            </Typography>
                        )}
                    </Grid>
                    {/* Check Number */}
                    {editedInvoice.paymentMethod === 'check' && (
                        <Grid item xs={12} sm={6}>
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
                    {/* Credit Card Fee */}

                    {editedInvoice.paymentMethod === 'credit/debit' && (
                        <Grid item xs={12}>
                            <Typography align="left">
                                Credit Card Fee (3%): $
                                {editedInvoice?.creditCardFee?.toFixed(2)}
                            </Typography>
                        </Grid>
                    )}

                    {/* Total */}
                    <Grid item xs={12}>
                        <Typography variant="h6" align="left">
                            Total: ${editedInvoice?.total?.toFixed(2)}
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
            <CardActions>
                <Button variant="contained" onClick={handleBack}>
                    Back
                </Button>
                <Button variant="contained" onClick={handleEditToggle}>
                    {isEditing ? 'Save' : 'Edit'}
                </Button>
                {!isEditing && <Button variant="contained" onClick={handleDeleteInvoice} color="error">
                    Delete
                </Button>}
                {/* {!isEditing && !editedInvoice.fileUrl && */}
                {!isEditing && <Button variant="contained" onClick={handleCreatePdf}>
                    Create PDF
                </Button>}
                {editedInvoice.fileUrl && !isEditing && <Button
                    variant="contained"
                    href={editedInvoice.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View Invoice
                </Button>}
                {editedInvoice.fileUrl && !isEditing && <Button
                    variant="contained"
                    onClick={handleSendInvoice}
                    color="primary"
                >
                    Send Invoice
                </Button>}
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
        </Card >
    );
}