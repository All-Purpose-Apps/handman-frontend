import React, { useEffect, useState } from 'react';
import { fetchOneInvoice, updateInvoice } from '../../store/invoiceSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Button,
    TextField,
    Card,
    CardContent,
    CardActions,
    Grid,
    IconButton,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { createProposal } from '../../utils/createPdfs';

export default function ViewOneInvoice() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { invoice, status, error } = useSelector((state) => state.invoices);

    const [isEditing, setIsEditing] = useState(false);
    const [editedInvoice, setEditedInvoice] = useState({
        items: [], // Initialize items as an empty array
    });

    useEffect(() => {
        dispatch(fetchOneInvoice(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (invoice) {
            setEditedInvoice({
                ...invoice,
                items: invoice.items ? invoice.items : [], // Ensure items is an array
            });
        }
    }, [invoice]);

    useEffect(() => {
        if (editedInvoice && isEditing) {
            const subTotal = editedInvoice.items.reduce((acc, item) => {
                return acc + item.quantity * item.rate;
            }, 0);
            const total = subTotal; // Adjust if you have taxes or discounts
            setEditedInvoice((prevState) => ({
                ...prevState,
                subTotal,
                total,
            }));
        }
    }, [editedInvoice.items, isEditing]);

    if (status === 'loading' || !editedInvoice) {
        return <div>Loading...</div>;
    }

    if (status === 'failed') {
        return <div>Error: {error}</div>;
    }

    const formatDate = (date) => new Date(date).toLocaleDateString();

    const handleBack = () => {
        if (isEditing) {
            setIsEditing(false);
        } else {
            navigate(-1);
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Save changes
            dispatch(updateInvoice(id, editedInvoice));
        }
        setIsEditing(!isEditing);
    };

    const handleAddItem = () => {
        if (editedInvoice.items.length < 5) {
            setEditedInvoice({
                ...editedInvoice,
                items: [
                    ...editedInvoice.items,
                    { description: '', quantity: 1, rate: 0 },
                ],
            });
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = editedInvoice.items.map((item, idx) => {
            if (idx === index) {
                return { ...item, [field]: value };
            }
            return item;
        });
        setEditedInvoice({ ...editedInvoice, items: newItems });
    };

    const handleRemoveItem = (index) => {
        const newItems = editedInvoice.items.filter((_, idx) => idx !== index);
        setEditedInvoice({ ...editedInvoice, items: newItems });
    };

    return (
        <Card elevation={3} style={{ padding: '16px' }}>
            <CardContent>
                <Typography variant="h4" gutterBottom align="left">
                    Invoice Details
                </Typography>
                <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} sm={6}>
                        <Typography variant="h6" align="left">
                            Invoice Number: {editedInvoice?.invoiceNumber}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography align="left">
                            Created At: {formatDate(editedInvoice?.createdAt)}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        {isEditing ? (
                            <TextField
                                label="Invoice Date"
                                type="date"
                                fullWidth
                                value={editedInvoice?.invoiceDate?.split('T')[0]}
                                onChange={(e) =>
                                    setEditedInvoice({
                                        ...editedInvoice,
                                        invoiceDate: e.target.value,
                                    })
                                }
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        ) : (
                            <Typography align="left">
                                Invoice Date: {formatDate(editedInvoice?.invoiceDate)}
                            </Typography>
                        )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        {isEditing ? (
                            <TextField
                                label="Due Date"
                                type="date"
                                fullWidth
                                value={editedInvoice?.dueDate?.split('T')[0]}
                                onChange={(e) =>
                                    setEditedInvoice({
                                        ...editedInvoice,
                                        dueDate: e.target.value,
                                    })
                                }
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        ) : (
                            <Typography align="left">
                                Due Date: {formatDate(editedInvoice?.dueDate)}
                            </Typography>
                        )}
                    </Grid>
                    <Grid item xs={12} sm={12}>
                        {isEditing ? (
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Client First Name"
                                        fullWidth
                                        value={editedInvoice?.client?.firstName || ''}
                                        onChange={(e) =>
                                            setEditedInvoice({
                                                ...editedInvoice,
                                                client: {
                                                    ...editedInvoice.client,
                                                    firstName: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Client Last Name"
                                        fullWidth
                                        value={editedInvoice?.client?.lastName || ''}
                                        onChange={(e) =>
                                            setEditedInvoice({
                                                ...editedInvoice,
                                                client: {
                                                    ...editedInvoice.client,
                                                    lastName: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </Grid>
                            </Grid>
                        ) : (
                            <Typography align="left">
                                Client: {editedInvoice?.client?.firstName}{' '}
                                {editedInvoice?.client?.lastName}
                            </Typography>
                        )}
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
                                    style={{
                                        marginBottom: '16px',
                                        padding: '16px',
                                    }}
                                >
                                    {isEditing ? (
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12} sm={4}>
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
                                            <Grid item xs={12} sm={2}>
                                                <TextField
                                                    label="Quantity"
                                                    type="number"
                                                    fullWidth
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            index,
                                                            'quantity',
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={2}>
                                                <TextField
                                                    label="Rate"
                                                    type="number"
                                                    fullWidth
                                                    value={item.rate}
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            index,
                                                            'rate',
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={2}>
                                                <Typography align="left">
                                                    Amount: $
                                                    {item.quantity * item.rate}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={2}>
                                                {editedInvoice.items.length > 1 && (
                                                    <IconButton
                                                        onClick={() =>
                                                            handleRemoveItem(index)
                                                        }
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                )}
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <Typography align="left">
                                            {item.description} (Qty: {item.quantity}, Rate: $
                                            {item.rate})
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
                                startIcon={<AddIcon />}
                            >
                                Add Item
                            </Button>
                        )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography align="left">
                            Sub Total: ${editedInvoice?.subTotal || 0}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography align="left">
                            Total: ${editedInvoice?.total || 0}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        {isEditing ? (
                            <TextField
                                label="Notes"
                                multiline
                                rows={4}
                                fullWidth
                                value={editedInvoice?.notes || ''}
                                onChange={(e) =>
                                    setEditedInvoice({
                                        ...editedInvoice,
                                        notes: e.target.value,
                                    })
                                }
                            />
                        ) : (
                            <Typography align="left">
                                Notes: {editedInvoice?.notes}
                            </Typography>
                        )}
                    </Grid>
                </Grid>
            </CardContent>
            <CardActions style={{ justifyContent: 'flex-start' }}>
                <Button variant="contained" onClick={handleBack}>
                    Back
                </Button>
                <Button variant="contained" onClick={handleEditToggle}>
                    {isEditing ? 'Save' : 'Edit'}
                </Button>
                {!isEditing && (
                    <>
                        <Button
                            variant="contained"
                            onClick={() => navigate(`/invoices/delete/${id}`)}
                        >
                            Delete
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => createProposal(invoice)}
                        >
                            Create Proposal
                        </Button>
                    </>
                )}
            </CardActions>
        </Card>
    );
}