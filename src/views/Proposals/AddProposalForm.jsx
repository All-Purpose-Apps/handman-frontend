import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Grid,
    IconButton,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import { Autocomplete } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useDispatch, useSelector } from 'react-redux';
import { addProposal, fetchProposals } from '../../store/proposalSlice';
import { getMaterialList, updateMaterialsList, deleteMaterialsList } from '../../store/materialsSlice';
import { fetchClients } from '../../store/clientSlice';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

export default function AddProposalForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { clientId } = location.state || {};


    const { proposalNumber: routeProposalNumber } = useParams();
    const [newProposalData, setNewProposalData] = useState({
        proposalNumber: routeProposalNumber || '',
        proposalDate: new Date().toISOString().split('T')[0],
        proposalTitle: '',
        items: [
            { description: '', regularPrice: '', discountPrice: '' },
        ],
        client: null,
        packagePrice: 0,
        fileUrl: '',
        materialsListId: null,
    });

    const [materials, setMaterials] = useState([]);
    const [materialsTotal, setMaterialsTotal] = useState(0);
    const [materialsDiscountPrice, setMaterialsDiscountPrice] = useState(0);
    const clients = useSelector((state) => state.clients.clients);
    const proposals = useSelector((state) => state.proposals.proposals);
    const materialsList = useSelector((state) => state.materials.materialsList);

    useEffect(() => {
        if (!newProposalData.proposalNumber) {
            const storedProposalNumber = localStorage.getItem('proposalNumber');
            if (storedProposalNumber) {
                setNewProposalData((prev) => ({
                    ...prev,
                    proposalNumber: storedProposalNumber,
                }));
            } else {
                if (proposals.length > 0) {
                    const latestNumber = Math.max(
                        ...proposals.map((p) =>
                            parseInt(p.proposalNumber.replace(/\D/g, ''), 10)
                        )
                    );
                    const nextNumber = `${latestNumber + 1}`;
                    localStorage.setItem('proposalNumber', nextNumber);
                    setNewProposalData((prev) => ({
                        ...prev,
                        proposalNumber: nextNumber,
                    }));
                } else {
                    localStorage.setItem('proposalNumber', '9001');
                    setNewProposalData((prev) => ({ ...prev, proposalNumber: '9001' }));
                }
            }
        }
    }, [proposals, newProposalData.proposalNumber]);

    useEffect(() => {
        dispatch(fetchClients());
        dispatch(fetchProposals());
        if (clientId) {
            const selectedClient = clients.find((client) => client._id === clientId);
            if (selectedClient) {
                setNewProposalData((prev) => ({
                    ...prev,
                    client: selectedClient,
                }));
            }
        }
        const storedClient = localStorage.getItem('proposalClient');
        const storedItems = localStorage.getItem('proposalItems');
        if (storedClient) {
            setNewProposalData((prev) => ({
                ...prev,
                client: JSON.parse(storedClient),
            }));
        }
        if (storedItems) {
            setNewProposalData((prev) => ({
                ...prev,
                items: JSON.parse(storedItems),
            }));
        }
    }, [dispatch]);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    useEffect(() => {
        const fetchMaterials = async () => {
            const response = await dispatch(getMaterialList(newProposalData.proposalNumber));
            if (response.meta.requestStatus === 'fulfilled' && response.payload) {
                const existingMaterials = response.payload.materials || [];
                setMaterials(existingMaterials);
                const total = existingMaterials.reduce(
                    (acc, material) => acc + (material.price * material.quantity || 0),
                    0
                );
                setMaterialsTotal(total);
                setMaterialsDiscountPrice(total);
                setNewProposalData((prev) => ({
                    ...prev,
                    materialsListId: response.payload._id
                }));
                // Snackbar logic: show after fetching or creating materials list
                if (existingMaterials.length === 0) {
                    setSnackbar({ open: true, message: 'Materials submitted successfully!', severity: 'success' });
                } else {
                    setSnackbar({ open: true, message: 'Materials updated successfully!', severity: 'success' });
                }
            }
        };
        if (newProposalData.proposalNumber) {
            fetchMaterials();
        }
    }, [dispatch, newProposalData.proposalNumber]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProposalData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleClientChange = (event, newValue) => {
        setNewProposalData((prev) => ({
            ...prev,
            client: newValue,
        }));
    };

    const handleAddItem = () => {
        const newItems = [
            ...newProposalData.items,
            { description: '', regularPrice: '', discountPrice: '' },
        ];
        setNewProposalData((prev) => ({
            ...prev,
            items: newItems,
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...newProposalData.items];
        newItems[index][field] = value;
        setNewProposalData((prev) => ({
            ...prev,
            items: newItems,
        }));
    };

    const handleDeleteItem = (index) => {
        const newItems = [...newProposalData.items];
        newItems.splice(index, 1);
        setNewProposalData((prev) => ({
            ...prev,
            items: newItems,
        }));
    };

    const handleClose = () => {
        localStorage.removeItem('proposalClient');
        localStorage.removeItem('proposalItems');
        dispatch(deleteMaterialsList(newProposalData.materialsListId));
        setNewProposalData({
            proposalNumber: '',
            proposalDate: new Date().toISOString().split('T')[0],
            proposalTitle: '',
            items: [{ description: '', regularPrice: '', discountPrice: '' }],
            client: null,
            packagePrice: 0,
            fileUrl: '',
            materialsListId: null,
        });
        navigate('/proposals');
    };

    const handleAddProposal = async (event) => {
        event.preventDefault();
        try {
            const proposalData = await dispatch(addProposal(newProposalData));
            await dispatch(updateMaterialsList({
                id: newProposalData.materialsListId,
                materials,
                total: materialsTotal,
                discountTotal: materialsDiscountPrice,
            }));
            localStorage.removeItem('proposalClient');
            localStorage.removeItem('proposalItems');
            localStorage.removeItem('proposalNumber');

            navigate(`/proposals/${proposalData.payload._id}`, {
                state: {
                    location: { from: '/proposals/new' },
                }
            });
        } catch (error) {
            console.error('Failed to add proposal:', error);
            setSnackbar({
                open: true,
                message: 'Failed to add proposal. Please try again.',
                severity: 'error',
            });
        }
    };

    const handleAddMaterials = () => {
        localStorage.setItem('proposalClient', JSON.stringify(newProposalData.client));
        localStorage.setItem('proposalItems', JSON.stringify(newProposalData.items));
        navigate(`/proposal/${newProposalData.proposalNumber}/materials-list`,
            {
                state: {
                    isEditing: false,
                },
            }
        );
    };

    const handleMaterialsDiscountPriceChange = async (e) => {
        const value = parseFloat(e.target.value);
        setMaterialsDiscountPrice(value);
    };

    const calculateTotals = () => {
        const itemsTotal = newProposalData.items.reduce(
            (acc, item) => acc + parseFloat(item.discountPrice || 0),
            0
        );
        const total = itemsTotal + parseFloat(materialsDiscountPrice || 0);

        setNewProposalData((prev) => ({
            ...prev,
            packagePrice: total,
        }));
    };

    useEffect(() => {
        calculateTotals();
    }, [newProposalData.items, materialsDiscountPrice]);


    const handleEditMaterialsList = () => {
        navigate(`/proposal/${newProposalData.proposalNumber}/materials-list`, {
            state: {
                isEditing: true,
                existingMaterials: materialsList,
            },
        });;
    }

    return (
        <>
            <Paper sx={{ p: 4, maxWidth: 800, margin: '0 auto' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="h2" gutterBottom>
                        Add New Proposal
                    </Typography>
                    <IconButton aria-label="close" onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <form onSubmit={handleAddProposal}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="h6">
                                Proposal Number: {newProposalData.proposalNumber}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Proposal Date"
                                name="proposalDate"
                                type="date"
                                fullWidth
                                value={newProposalData.proposalDate}
                                onChange={handleInputChange}
                                required
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                options={[...clients].sort((a, b) => a.name.localeCompare(b.name))}
                                getOptionLabel={(client) => `${client.name}`}
                                value={newProposalData.client}
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
                            {newProposalData.items.map((item, index) => (
                                <Grid container spacing={2} key={index} alignItems="center">
                                    <Grid item xs={12} sm={5}>
                                        <TextField
                                            label="Description"
                                            value={item.description}
                                            onChange={(e) =>
                                                handleItemChange(index, 'description', e.target.value)
                                            }
                                            fullWidth
                                            margin="normal"
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            label="Regular Price"
                                            type="number"
                                            value={item.regularPrice}
                                            onChange={(e) =>
                                                handleItemChange(index, 'regularPrice', e.target.value)
                                            }
                                            fullWidth
                                            margin="normal"
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            label="Discount Price"
                                            type="number"
                                            value={item.discountPrice}
                                            onChange={(e) =>
                                                handleItemChange(index, 'discountPrice', e.target.value)
                                            }
                                            fullWidth
                                            margin="normal"
                                            required
                                        />
                                    </Grid>
                                    {newProposalData.items.length > 1 && (
                                        <Grid item xs={12} sm={1}>
                                            <IconButton
                                                aria-label="delete"
                                                onClick={() => handleDeleteItem(index)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Grid>
                                    )}
                                </Grid>
                            ))}
                            {/* Materials Line Item */}
                            {materials.length > 0 && (
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={5}>
                                        <TextField
                                            label="Description"
                                            value="Materials"
                                            disabled
                                            fullWidth
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            label="Regular Price"
                                            value={materialsTotal.toFixed(2)}
                                            disabled
                                            fullWidth
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            label="Discount Price"
                                            type="number"
                                            value={materialsDiscountPrice}
                                            onChange={handleMaterialsDiscountPriceChange}
                                            fullWidth
                                            margin="normal"
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={1}>
                                        <IconButton
                                            aria-label="edit"
                                            onClick={() => handleEditMaterialsList()}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            )}
                            {newProposalData.items.length < 5 && (
                                <Button
                                    variant="contained"
                                    onClick={handleAddItem}
                                    sx={{ float: 'right', mt: 2 }}
                                >
                                    Add Item
                                </Button>
                            )}
                            {newProposalData.client && !newProposalData.materials && (
                                <Button
                                    variant="contained"
                                    onClick={handleAddMaterials}
                                    sx={{ mt: 2, ml: 2 }}
                                >
                                    Add Materials
                                </Button>
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6">
                                Total Package Price: ${newProposalData.packagePrice.toFixed(2)}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Box display="flex" justifyContent="flex-end" mt={2}>
                        <Button
                            color="secondary"
                            sx={{ marginRight: 2 }}
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={!newProposalData.client}
                        >
                            Submit
                        </Button>
                    </Box>
                </form>
            </Paper >
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
            >
                <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} elevation={6} variant="filled">
                    {snackbar.message}
                </MuiAlert>
            </Snackbar>
        </>
    );
}
