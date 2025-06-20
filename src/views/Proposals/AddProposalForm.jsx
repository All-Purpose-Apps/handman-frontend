import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Grid,
    IconButton,
    Paper,
    TextField,
    Typography,
    Checkbox,
    FormControlLabel,
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
import CircularProgress from '@mui/material/CircularProgress';
import AddressAutocomplete from '../../components/AddressAutocomplete';


export default function AddProposalForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { clientId } = location.state || {};

    // Submission state to prevent double submission
    const [isSubmitting, setIsSubmitting] = useState(false);


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
        projectFullAddress: '',
        projectAddress: '',
        projectCity: '',
        projectState: '',
        projectZip: '',
    });

    const [materials, setMaterials] = useState([]);
    const [materialsTotal, setMaterialsTotal] = useState(0);
    const [materialsDiscountPrice, setMaterialsDiscountPrice] = useState(0);
    const clients = useSelector((state) => state.clients.clients);
    const proposals = useSelector((state) => state.proposals.proposals);
    const materialsList = useSelector((state) => state.materials.materialsList);

    // Project address state
    const [projectAddress, setProjectAddress] = useState('');
    const [sameAsClientAddress, setSameAsClientAddress] = useState(false);


    // Initial setup: fetch clients/proposals, load localStorage, set client if navigated from clientId
    useEffect(() => {
        // Fetch clients and proposals on mount
        dispatch(fetchClients());
        dispatch(fetchProposals());

        // Load stored values from localStorage
        const storedClient = localStorage.getItem('proposalClient');
        const storedItems = localStorage.getItem('proposalItems');
        const storedProjectAddress = localStorage.getItem('projectAddress');
        const storedSameAsClientAddress = localStorage.getItem('sameAsClientAddress');

        if (storedSameAsClientAddress) {
            setSameAsClientAddress(JSON.parse(storedSameAsClientAddress));
        }

        // Set client and items from storage if present
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

        // Set project address from storage only if not same as client address
        if (storedProjectAddress && !(storedSameAsClientAddress && JSON.parse(storedSameAsClientAddress))) {
            const projectAddressFromStorage = JSON.parse(storedProjectAddress);

            setProjectAddress(projectAddressFromStorage.address || '');
            setNewProposalData((prev) => ({
                ...prev,
                projectFullAddress: projectAddressFromStorage.address || '',
                projectAddress: projectAddressFromStorage.streetAddress || '',
                projectCity: projectAddressFromStorage.city || '',
                projectState: projectAddressFromStorage.state || '',
                projectZip: projectAddressFromStorage.zip || '',
            }));
        }

        // If navigating from a client, set that client
        if (clientId) {
            const selectedClient = clients.find((client) => client._id === clientId);
            if (selectedClient) {
                setNewProposalData((prev) => ({
                    ...prev,
                    client: selectedClient,
                }));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Set proposal number from localStorage or calculate new one when proposals are loaded
    useEffect(() => {
        if (!newProposalData.proposalNumber) {
            const storedProposalNumber = localStorage.getItem('proposalNumber');
            if (storedProposalNumber) {
                setNewProposalData((prev) => ({
                    ...prev,
                    proposalNumber: storedProposalNumber,
                }));
            } else if (proposals.length > 0) {
                const numbers = proposals
                    .map((p) => parseInt(p.proposalNumber.replace(/\D/g, ''), 10))
                    .filter((n) => !isNaN(n))
                    .sort((a, b) => a - b);
                let nextNumber = 9001;
                for (let i = 0; i < numbers.length; i++) {
                    if (numbers[i] !== nextNumber) {
                        break;
                    }
                    nextNumber++;
                }
                nextNumber = `${nextNumber}`;
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [proposals]);

    // When sameAsClientAddress or client changes, update projectAddress in proposal data directly
    useEffect(() => {
        setNewProposalData((prev) => {
            // If same as client address, set projectAddress to client address
            if (sameAsClientAddress && prev.client?.address) {
                return { ...prev, projectAddress: prev.client.address };
            }
            // If not same as client address, retain prev.projectAddress (which user can edit)
            return {
                ...prev,
                projectFullAddress: projectAddress
            };
        });
        // If not same as client address, projectAddress remains as is (user can edit)
        // projectAddress state is still used for the AddressAutocomplete input
        // (the value is synced on change)
        // But the source of truth for submit is newProposalData.projectAddress
        // To avoid double render, do not setProjectAddress here
        // Only update newProposalData
    }, [sameAsClientAddress, newProposalData.client]);

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
        localStorage.removeItem('projectAddress');
        localStorage.removeItem('proposalNumber');
        localStorage.removeItem('sameAsClientAddress');
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
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            // Use projectAddress from newProposalData (source of truth)
            const proposalData = await dispatch(addProposal({
                ...newProposalData,
            }));
            await dispatch(updateMaterialsList({
                id: newProposalData.materialsListId,
                materials,
                total: materialsTotal,
                discountTotal: materialsDiscountPrice,
            }));
            localStorage.removeItem('proposalClient');
            localStorage.removeItem('proposalItems');
            localStorage.removeItem('proposalNumber');
            localStorage.removeItem('projectAddress');
            localStorage.removeItem('sameAsClientAddress');

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
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddMaterials = () => {
        localStorage.setItem('proposalClient', JSON.stringify(newProposalData.client));
        localStorage.setItem('proposalItems', JSON.stringify(newProposalData.items));
        localStorage.setItem('projectAddress', JSON.stringify(projectAddress));
        localStorage.setItem('sameAsClientAddress', JSON.stringify(sameAsClientAddress));

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
                            {newProposalData.client?.address && (
                                <TextField
                                    label="Client Address"
                                    value={newProposalData.client.address}
                                    fullWidth
                                    margin="normal"
                                    disabled
                                />
                            )}
                            {newProposalData.client?.address && (
                                <>
                                    <Typography sx={{ mt: 2 }}>Project Address</Typography>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={sameAsClientAddress}
                                                onChange={(e) =>
                                                    setSameAsClientAddress(e.target.checked)
                                                }
                                            />
                                        }
                                        label="Same as client address"
                                    />
                                    {!sameAsClientAddress && <AddressAutocomplete
                                        value={projectAddress}
                                        label="Project Address"
                                        onChange={(val, isAutoComplete) => {
                                            setProjectAddress(val);
                                            setNewProposalData((prev) => ({
                                                ...prev,
                                                projectAddress: val.streetAddress || '',
                                                projectFullAddress: val.address || '',
                                                projectCity: val.city || '',
                                                projectState: val.state || '',
                                                projectZip: val.zip || '',
                                            }));
                                        }}
                                    />}
                                </>
                            )}
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

                            {newProposalData.client
                                && !newProposalData.materials
                                && !newProposalData.materialsListId && (
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
                            disabled={!newProposalData.client || isSubmitting}
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                            sx={{
                                opacity: isSubmitting ? 0.7 : 1,
                                pointerEvents: isSubmitting ? 'none' : 'auto',
                            }}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    </Box>
                </form>
            </Paper >
            <Snackbar
                open={snackbar.open}
                autoHideDuration={2000}
                onClose={handleCloseSnackbar}
            >
                <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} elevation={6} variant="filled">
                    {snackbar.message}
                </MuiAlert>
            </Snackbar>
        </>
    );
}
