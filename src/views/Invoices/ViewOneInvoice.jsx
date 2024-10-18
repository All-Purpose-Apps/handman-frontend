import React, { useEffect, useState } from 'react';
import { fetchOneInvoice, updateInvoice } from '../../store/invoiceSlice';
import { fetchClients } from '../../store/clientSlice'; // Action to fetch clients
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
} from '@mui/material';
import moment from 'moment';

export default function ViewOneInvoice() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { invoice, status, error } = useSelector((state) => state.invoices);
    const { clients } = useSelector((state) => state.clients); // Get the list of clients
    const [isEditing, setIsEditing] = useState(false);
    const [editedInvoice, setEditedInvoice] = useState({
        items: [],
        client: null, // For client selection
    });

    useEffect(() => {
        dispatch(fetchOneInvoice(id));
        dispatch(fetchClients()); // Fetch clients when component mounts
    }, [dispatch, id]);

    useEffect(() => {
        if (invoice) {
            setEditedInvoice((prev) => ({
                ...prev,
                ...invoice,
                items: invoice.items || [],
                client: invoice.client || prev.client, // Keep the existing client if already set
            }));
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
            dispatch(updateInvoice(editedInvoice));
            dispatch(fetchOneInvoice(id));
        }
        setIsEditing(!isEditing);
    };

    const getInvoice = async () => {
        console.log('Invoice:', editedInvoice);
    };

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (status === 'failed') {
        return <div>Error: {error}</div>;
    }

    return (
        <Card elevation={3} style={{ padding: '16px' }}>
            <CardContent>
                <Typography variant="h4" gutterBottom align="left">
                    Invoice Details
                </Typography>
                <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12}>
                        {isEditing ? (
                            clients && clients.length > 0 ? (
                                <Autocomplete
                                    options={clients}
                                    getOptionLabel={(client) =>
                                        client ? `${client.firstName} ${client.lastName}` : ''
                                    }
                                    value={editedInvoice.client || null}
                                    onChange={handleClientChange}
                                    isOptionEqualToValue={(option, value) =>
                                        option.id === value?.id
                                    } // Ensure proper value matching
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
                            <Typography align="left">
                                Client: {invoice?.client?.firstName}{' '}
                                {invoice?.client?.lastName}
                            </Typography>
                        )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="h6" align="left">
                            Invoice Number: {editedInvoice?.invoiceNumber}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography align="left">
                            Created At: {moment.utc(editedInvoice?.createdAt).format('MM-DD-YYYY')}
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
                                        invoiceDate: moment.utc(e.target.value).format(), // Ensure date is stored in UTC
                                    })
                                }
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        ) : (
                            <Typography align="left">
                                Invoice Date: {moment.utc(editedInvoice?.invoiceDate).format('MM-DD-YYYY')}
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
                                        dueDate: moment.utc(e.target.value).format(), // Ensure date is stored in UTC
                                    })
                                }
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        ) : (
                            <Typography align="left">
                                Due Date: {moment.utc(editedInvoice?.dueDate).format('MM-DD-YYYY')}
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
                                                        setEditedInvoice({
                                                            ...editedInvoice,
                                                            items: editedInvoice.items.map((item, idx) =>
                                                                idx === index
                                                                    ? {
                                                                        ...item,
                                                                        description: e.target.value,
                                                                    }
                                                                    : item
                                                            ),
                                                        })
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
                                                        setEditedInvoice({
                                                            ...editedInvoice,
                                                            items: editedInvoice.items.map((item, idx) =>
                                                                idx === index
                                                                    ? {
                                                                        ...item,
                                                                        quantity: Number(e.target.value),
                                                                    }
                                                                    : item
                                                            ),
                                                        })
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
                                                        setEditedInvoice({
                                                            ...editedInvoice,
                                                            items: editedInvoice.items.map((item, idx) =>
                                                                idx === index
                                                                    ? {
                                                                        ...item,
                                                                        rate: Number(e.target.value),
                                                                    }
                                                                    : item
                                                            ),
                                                        })
                                                    }
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={2}>
                                                <Typography align="left">
                                                    Amount: ${item.quantity * item.rate}
                                                </Typography>
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
                                onClick={() =>
                                    setEditedInvoice({
                                        ...editedInvoice,
                                        items: [
                                            ...editedInvoice.items,
                                            { description: '', quantity: 1, rate: 0 },
                                        ],
                                    })
                                }
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
            <CardActions>
                <Button variant="contained" onClick={handleBack}>
                    Back
                </Button>
                <Button variant="contained" onClick={handleEditToggle}>
                    {isEditing ? 'Save' : 'Edit'}
                </Button>
                <Button variant="contained" onClick={getInvoice}>
                    Get Invoice
                </Button>
            </CardActions>
        </Card>
    );
}