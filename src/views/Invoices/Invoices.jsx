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
import { useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';
import AddInvoiceModal from './AddInvoiceModal';

const columns = [
    { field: 'invoiceNumber', headerName: 'Invoice #', width: 100, align: 'center' },
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
            `${params.name}`,
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



const InvoicesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
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
        if (location.state?.openAddInvoiceModal) {
            setOpenModal(true);

            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]);

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


    const handleAddInvoice = async (event) => {
        event.preventDefault();
        await dispatch(addInvoice(newInvoiceData));
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
        await dispatch(fetchInvoices());
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
                    style={{ cursor: 'pointer' }}
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
            <AddInvoiceModal
                openModal={openModal}
                setOpenModal={setOpenModal}
                handleInputChange={handleInputChange}
                handleClientChange={handleClientChange}
                handleAddItem={handleAddItem}
                handleItemChange={handleItemChange}
                handleDeleteItem={handleDeleteItem}
                handleAddInvoice={handleAddInvoice}
                newInvoiceData={newInvoiceData}
                clients={clients}
            />
        </div>
    );
};

export default InvoicesPage;