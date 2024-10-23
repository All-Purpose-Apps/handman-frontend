import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
    TextField,
    Typography,
    Box,
    Button,
    Modal,
    Paper,
    Grid,
    Autocomplete,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton, // Added this import
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; // Added this import
import { useDispatch, useSelector } from 'react-redux';
import { fetchInvoices, addInvoice } from '../../store/invoiceSlice';
import { fetchClients } from '../../store/clientSlice';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const columns = [
    { field: 'invoiceNumber', headerName: 'Invoice #', width: 100 },
    {
        field: 'invoiceDate',
        headerName: 'Invoice Date',
        width: 100,
        valueGetter: (params) =>
            moment.utc(params).format('MM/DD/YYYY'),
    },
    {
        field: 'client',
        headerName: 'Client',
        width: 200,
        valueGetter: (params) =>
            `${params.firstName} ${params.lastName}`,
    },
    {
        field: 'paymentMethod',
        headerName: 'Payment Method',
        width: 150,
    },
    {
        field: 'total',
        headerName: 'Total',
        width: 120,
    },
    { field: 'status', headerName: 'Status', width: 120 },
    {
        field: 'createdAt',
        headerName: 'Created At',
        width: 100,
        valueGetter: (params) =>
            moment.utc(params).format('MM/DD/YYYY'),
    },
    {
        field: 'updatedAt',
        headerName: 'Updated At',
        width: 100,
        valueGetter: (params) =>
            moment.utc(params).format('MM/DD/YYYY'),
    },
];

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    maxHeight: '80vh',
    overflowY: 'auto',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const InvoicesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const invoices = useSelector((state) => state.invoices.invoices);
    const clients = useSelector((state) => state.clients.clients);
    const [searchText, setSearchText] = useState('');
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const today = new Date().toISOString().split('T')[0];
    const [newInvoiceData, setNewInvoiceData] = useState({
        invoiceNumber: '',
        invoiceDate: today,
        dueDate: '',
        client: null,
        items: [{ description: '', price: '' }],
        extraWorkMaterials: '',
        paymentMethod: 'awaiting payment',
        checkNumber: '',
        depositAdjustment: '',
        subTotal1: 0,
        subTotal2: 0,
        creditCardFee: 0,
        total: 0,
        status: 'created',
    });

    useEffect(() => {
        dispatch(fetchInvoices());
        dispatch(fetchClients());
    }, [dispatch]);

    useEffect(() => {
        setFilteredInvoices(
            invoices.filter(
                (invoice) =>
                    invoice.invoiceNumber
                        .toLowerCase()
                        .includes(searchText.toLowerCase()) ||
                    `${invoice.client.firstName} ${invoice.client.lastName}`
                        .toLowerCase()
                        .includes(searchText.toLowerCase())
            )
        );
    }, [invoices, searchText]);

    useEffect(() => {
        if (invoices.length > 0) {
            const latestInvoiceNumber = Math.max(
                ...invoices.map((inv) => parseInt(inv.invoiceNumber, 10))
            );
            setNewInvoiceData((prevData) => ({
                ...prevData,
                invoiceNumber: (latestInvoiceNumber + 1).toString(),
            }));
        } else {
            setNewInvoiceData((prevData) => ({
                ...prevData,
                invoiceNumber: '1001',
            }));
        }
    }, [invoices]);

    const handleSearch = (event) => {
        setSearchText(event.target.value);
    };

    const handleGoToInvoice = (id) => {
        navigate(`/invoices/${id}`);
    };

    const calculateTotals = () => {
        const subTotal1 = newInvoiceData.items.reduce(
            (acc, item) => acc + parseFloat(item.price || 0),
            0
        );
        const subTotal2 =
            subTotal1 + parseFloat(newInvoiceData.extraWorkMaterials || 0);
        const creditCardFee =
            newInvoiceData.paymentMethod === 'credit/debit'
                ? subTotal2 * 0.03
                : 0;
        const total =
            subTotal2 +
            creditCardFee -
            parseFloat(newInvoiceData.depositAdjustment || 0);
        setNewInvoiceData((prevData) => ({
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
        newInvoiceData.items,
        newInvoiceData.extraWorkMaterials,
        newInvoiceData.paymentMethod,
        newInvoiceData.depositAdjustment,
    ]);

    const handleAddInvoice = (event) => {
        event.preventDefault();
        dispatch(addInvoice(newInvoiceData));
        setOpenModal(false);
        setNewInvoiceData({
            invoiceNumber: '',
            invoiceDate: today,
            dueDate: '',
            client: null,
            items: [{ description: '', price: '' }],
            extraWorkMaterials: '',
            paymentMethod: 'awaiting payment',
            checkNumber: '',
            depositAdjustment: '',
            subTotal1: 0,
            subTotal2: 0,
            creditCardFee: 0,
            total: 0,
            status: 'created',
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewInvoiceData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleClientChange = (event, newValue) => {
        setNewInvoiceData((prevData) => ({
            ...prevData,
            client: newValue,
        }));
    };

    const handleAddItem = () => {
        if (newInvoiceData.items.length < 5) {
            setNewInvoiceData((prevData) => ({
                ...prevData,
                items: [
                    ...prevData.items,
                    { description: '', price: '' },
                ],
            }));
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...newInvoiceData.items];
        newItems[index][field] = value;
        setNewInvoiceData((prevData) => ({
            ...prevData,
            items: newItems,
        }));
    };

    const handleDeleteItem = (index) => {
        if (newInvoiceData.items.length > 1) {
            const newItems = [...newInvoiceData.items];
            newItems.splice(index, 1);
            setNewInvoiceData((prevData) => ({
                ...prevData,
                items: newItems,
            }));
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                marginBottom={2}
            >
                <Typography variant="h4" gutterBottom>
                    Invoices
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenModal(true)}
                >
                    Add Invoice
                </Button>
            </Box>

            <Box marginBottom={2}>
                <TextField
                    label="Search Invoices"
                    variant="outlined"
                    value={searchText}
                    onChange={handleSearch}
                    fullWidth
                />
            </Box>

            <div style={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={filteredInvoices}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    onRowClick={(params) => handleGoToInvoice(params.row._id)}
                    getRowId={(row) => row._id}
                    sx={{
                        '& .MuiDataGrid-row:hover': {
                            cursor: 'pointer',
                        },
                    }}
                />
            </div>

            {/* Modal for adding new invoice */}
            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Paper sx={modalStyle}>
                    <Typography
                        id="modal-title"
                        variant="h6"
                        component="h2"
                        gutterBottom
                    >
                        Add New Invoice
                    </Typography>
                    <form onSubmit={handleAddInvoice}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="h6">
                                    Invoice Number: {newInvoiceData.invoiceNumber}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Invoice Date"
                                    name="invoiceDate"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={newInvoiceData.invoiceDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Autocomplete
                                    options={clients}
                                    getOptionLabel={(client) =>
                                        `${client.firstName} ${client.lastName}`
                                    }
                                    value={newInvoiceData.client}
                                    onChange={handleClientChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Client"
                                            margin="normal"
                                            required
                                        />
                                    )}
                                />
                            </Grid>
                            {/* Items */}
                            <Grid item xs={12}>
                                <Typography variant="h6">Items</Typography>
                                {newInvoiceData.items.map((item, index) => (
                                    <Grid
                                        container
                                        spacing={2}
                                        key={index}
                                        alignItems="center"
                                    >
                                        <Grid item xs={12} sm={5}>
                                            <TextField
                                                label="Description"
                                                value={item.description}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        'description',
                                                        e.target.value
                                                    )
                                                }
                                                fullWidth
                                                margin="normal"
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={5}>
                                            <TextField
                                                label="Price"
                                                type="number"
                                                value={item.price}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        'price',
                                                        e.target.value
                                                    )
                                                }
                                                fullWidth
                                                margin="normal"
                                                required
                                            />
                                        </Grid>
                                        {newInvoiceData.items.length > 1 && (
                                            <Grid item xs={12} sm={2}>
                                                <IconButton
                                                    aria-label="delete"
                                                    onClick={() =>
                                                        handleDeleteItem(index)
                                                    }
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Grid>
                                        )}
                                    </Grid>
                                ))}
                                {newInvoiceData.items.length < 5 && (
                                    <Button
                                        variant="contained"
                                        onClick={handleAddItem}
                                    >
                                        Add Item
                                    </Button>
                                )}
                            </Grid>
                            {/* Subtotal 1 */}
                            <Grid item xs={12}>
                                <Typography variant="h6">
                                    Subtotal 1: ${newInvoiceData.subTotal1.toFixed(2)}
                                </Typography>
                            </Grid>
                            {/* Extra Work/Materials */}
                            <Grid item xs={12}>
                                <TextField
                                    label="Extra Work/Materials"
                                    name="extraWorkMaterials"
                                    type="number"
                                    fullWidth
                                    value={newInvoiceData.extraWorkMaterials}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            {/* Subtotal 2 */}
                            <Grid item xs={12}>
                                <Typography variant="h6">
                                    Subtotal 2: ${newInvoiceData.subTotal2.toFixed(2)}
                                </Typography>
                            </Grid>
                            {/* Payment Method */}
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="payment-method-label">
                                        Payment Method
                                    </InputLabel>
                                    <Select
                                        labelId="payment-method-label"
                                        name="paymentMethod"
                                        value={newInvoiceData.paymentMethod}
                                        label="Payment Method"
                                        onChange={handleInputChange}
                                    >
                                        <MenuItem value="awaiting payment">
                                            Awaiting Payment
                                        </MenuItem>
                                        <MenuItem value="cash">Cash</MenuItem>
                                        <MenuItem value="check">Check</MenuItem>
                                        <MenuItem value="credit/debit">
                                            Credit/Debit
                                        </MenuItem>
                                        <MenuItem value="online">Online</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* Check Number (if payment method is check) */}
                            {newInvoiceData.paymentMethod === 'check' && (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Check Number"
                                        name="checkNumber"
                                        fullWidth
                                        value={newInvoiceData.checkNumber}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Grid>
                            )}
                            {/* Credit Card Fee */}
                            {newInvoiceData.paymentMethod === 'credit/debit' && (
                                <Grid item xs={12}>
                                    <Typography variant="h6">
                                        Credit Card Fee (3%): $
                                        {newInvoiceData.creditCardFee.toFixed(2)}
                                    </Typography>
                                </Grid>
                            )}
                            {/* Deposit/Adjustment */}
                            <Grid item xs={12}>
                                <TextField
                                    label="Deposit/Adjustment"
                                    name="depositAdjustment"
                                    type="number"
                                    fullWidth
                                    value={newInvoiceData.depositAdjustment}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            {/* Total */}
                            <Grid item xs={12}>
                                <Typography variant="h6">
                                    Total: ${newInvoiceData.total.toFixed(2)}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Box
                            display="flex"
                            justifyContent="flex-end"
                            marginTop={2}
                        >
                            <Button
                                onClick={() => setOpenModal(false)}
                                color="secondary"
                                sx={{ marginRight: 2 }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                            >
                                Submit
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Modal>
        </div>
    );
};

export default InvoicesPage;