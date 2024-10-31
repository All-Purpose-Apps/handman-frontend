import React from 'react';
import {
    Modal,
    Paper,
    Typography,
    Grid,
    Button,
    TextField,
    Autocomplete,
    IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

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

const InvoiceModal = ({ open, onClose, invoiceData, setInvoiceData, handleAddInvoice }) => {

    console.log(invoiceData)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInvoiceData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = (invoiceData.items || []).map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        setInvoiceData((prevData) => ({
            ...prevData,
            items: newItems,
        }));
    };

    const handleAddItem = () => {
        if ((invoiceData.items || []).length < 5) {
            setInvoiceData((prevData) => ({
                ...prevData,
                items: [...(prevData.items || []), { description: '', price: '' }],
            }));
        }
    };

    const handleDeleteItem = (index) => {
        const newItems = (invoiceData.items || []).filter((_, i) => i !== index);
        setInvoiceData((prevData) => ({
            ...prevData,
            items: newItems,
        }));
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Paper sx={modalStyle}>
                <Typography variant="h6">Convert to Invoice</Typography>
                <form onSubmit={handleAddInvoice}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Invoice Number"
                                name="invoiceNumber"
                                fullWidth
                                value={invoiceData.invoiceNumber || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Invoice Date"
                                name="invoiceDate"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={invoiceData.invoiceDate || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                options={[] /* Add options here */}
                                getOptionLabel={(client) => client.name || ''}
                                value={invoiceData.client || null}
                                onChange={(e, newValue) => setInvoiceData((prevData) => ({
                                    ...prevData,
                                    client: newValue || null,
                                }))}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Client"
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6">Items</Typography>
                            {(invoiceData.items || []).map((item, index) => (
                                <Grid container spacing={2} key={index} alignItems="center">
                                    <Grid item xs={5}>
                                        <TextField
                                            label="Description"
                                            value={item.description}
                                            onChange={(e) =>
                                                handleItemChange(index, 'description', e.target.value)
                                            }
                                            fullWidth
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={5}>
                                        <TextField
                                            label="Price"
                                            type="number"
                                            value={item.price}
                                            onChange={(e) =>
                                                handleItemChange(index, 'price', e.target.value)
                                            }
                                            fullWidth
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={2}>
                                        <IconButton onClick={() => handleDeleteItem(index)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            ))}
                            {(invoiceData.items || []).length < 5 && (
                                <Button variant="contained" onClick={handleAddItem}>
                                    Add Item
                                </Button>
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6">Total: ${invoiceData.total || 0}</Typography>
                        </Grid>
                    </Grid>
                    <Button onClick={onClose} color="secondary" sx={{ mt: 2, mr: 2 }}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                        Save Invoice
                    </Button>
                </form>
            </Paper>
        </Modal>
    );
};

export default InvoiceModal;