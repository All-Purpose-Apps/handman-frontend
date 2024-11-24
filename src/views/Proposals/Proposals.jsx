import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProposals, addProposal } from '../../store/proposalSlice';
import { fetchClients } from '../../store/clientSlice';
import { DataGrid } from '@mui/x-data-grid';
import {
    Button,
    TextField,
    Typography,
    Box,
    Modal,
    Paper,
    Grid,
    Autocomplete,
    IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';

const columns = [
    { field: 'proposalNumber', headerName: 'Proposal #', width: 100, sortable: true, align: 'center' },
    { field: 'client', headerName: 'Client', width: 200, sortable: true, valueGetter: (params) => params.name },
    {
        field: 'proposalDate',
        headerName: 'Date',
        width: 150,
        sortable: true,
        valueFormatter: (params) => moment(params.value).format('MMM DD, YYYY'),
    },
    { field: 'status', headerName: 'Status', width: 200, sortable: true },
    {
        field: 'packagePrice',
        headerName: 'Total',
        width: 120,
        sortable: true,
        valueFormatter: (params) => {
            const value = params || 0;
            return `$${value.toFixed(2)}`;
        },
    },
    {
        field: 'items',
        headerName: 'Items',
        width: 300,
        sortable: false,
        renderCell: (params) => {
            const items = params.value || [];
            return (
                <ul style={{ margin: 0, paddingLeft: 20, paddingBottom: 8, paddingTop: 8 }}>
                    {items.map((item, index) => (
                        <li key={index} style={{ lineHeight: '24px' }}>
                            {item.description}
                        </li>
                    ))}
                </ul>
            );
        },
    },
];

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    maxHeight: '80vh',
    overflowY: 'auto',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const ProposalsPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const [searchText, setSearchText] = useState('');
    const [filteredProposals, setFilteredProposals] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [newProposalData, setNewProposalData] = useState({
        proposalNumber: '',
        proposalDate: new Date().toISOString().split('T')[0],
        proposalTitle: '',
        client: null,
        items: [{ description: '', regularPrice: '', discountPrice: '' }],
        packagePrice: 0,
        fileUrl: '',
    });

    const proposals = useSelector((state) => state.proposals.proposals);
    const loading = useSelector((state) => state.proposals.status === 'loading');
    const error = useSelector((state) => state.proposals.error);
    const clients = useSelector((state) => state.clients.clients);

    useEffect(() => {
        if (location.state?.openAddProposalModal) {
            setOpenModal(true);

            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]);



    useEffect(() => {
        dispatch(fetchProposals());
        dispatch(fetchClients());
    }, [dispatch]);

    useEffect(() => {
        setFilteredProposals(
            proposals.filter((proposal) =>
                ['proposalNumber', 'proposalTitle', 'clientName', 'status'].some((field) =>
                    proposal[field]?.toLowerCase().includes(searchText.toLowerCase())
                ) ||
                proposal?.items?.some((item) =>
                    item.description.toLowerCase().includes(searchText.toLowerCase())
                )
            )
        );
    }, [proposals, searchText]);

    useEffect(() => {
        if (proposals.length > 0) {
            const latestProposalNumber = Math.max(
                ...proposals.map((proposal) => parseInt(proposal?.proposalNumber?.replace(/\D/g, ''), 10))
            );
            setNewProposalData((prevData) => ({
                ...prevData,
                proposalNumber: `${latestProposalNumber + 1}`,
            }));
        } else {
            setNewProposalData((prevData) => ({
                ...prevData,
                proposalNumber: '9001',
            }));
        }
    }, [proposals]);

    const handleSearch = (event) => {
        setSearchText(event.target.value);
    };

    const handleRowClick = (params) => {
        const proposalId = params.row._id;
        navigate(`/proposals/${proposalId}`);
    };

    const handleAddProposal = async (event) => {
        event.preventDefault();
        await dispatch(addProposal(newProposalData));
        await dispatch(fetchProposals());
        setOpenModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProposalData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleClientChange = (event, newValue) => {
        setNewProposalData((prevData) => ({
            ...prevData,
            client: newValue,
        }));
    };

    const handleAddItem = () => {
        setNewProposalData((prevData) => ({
            ...prevData,
            items: [...prevData.items, { description: '', regularPrice: '', discountPrice: '' }],
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...newProposalData.items];
        newItems[index][field] = value;
        setNewProposalData((prevData) => ({
            ...prevData,
            items: newItems,
        }));
    };

    const handleDeleteItem = (index) => {
        const newItems = [...newProposalData.items];
        newItems.splice(index, 1);
        setNewProposalData((prevData) => ({
            ...prevData,
            items: newItems,
        }));
    };

    const calculateTotals = () => {
        const total = newProposalData.items.reduce(
            (acc, item) => acc + parseFloat(item.discountPrice || 0),
            0
        );
        setNewProposalData((prevData) => ({
            ...prevData,
            packagePrice: total,
        }));
    };

    useEffect(() => {
        calculateTotals();
    }, [newProposalData.items]);

    if (loading) {
        return <Typography variant="h4">Loading...</Typography>;
    }

    if (error) {
        return <Typography variant="h4">Error: {error}</Typography>;
    }

    return (
        <Box padding={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
                <Typography variant="h4" gutterBottom>
                    Proposals
                </Typography>
                <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
                    Add Proposal
                </Button>
            </Box>

            <Box marginBottom={2}>
                <TextField
                    label="Search Proposals"
                    variant="outlined"
                    value={searchText}
                    onChange={handleSearch}
                    style={{ width: '100%' }}
                />
            </Box>

            <div style={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={filteredProposals}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 20]}
                    onRowClick={handleRowClick}
                    getRowId={(row) => row._id}
                    getRowHeight={(params) => {
                        const minHeight = 60; // Set your desired minimum row height here
                        const items = params.model.items || [];
                        // Calculate content height based on the number of items
                        const contentHeight = items.length > 0 ? items.length * 24 + 16 : minHeight;
                        return Math.max(contentHeight, minHeight);
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    initialState={{
                        sorting: {
                            sortModel: [{ field: 'name', sort: 'asc' }],
                        },
                        pagination: {
                            paginationModel: { pageSize: 10, page: 0 },
                        },
                    }}
                    sx={{
                        '& .MuiDataGrid-row': {
                            cursor: 'pointer',
                        },
                    }}
                />
            </div>

            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Paper sx={modalStyle}>
                    <Typography id="modal-title" variant="h6" component="h2" gutterBottom>
                        Add New Proposal
                    </Typography>
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
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Autocomplete
                                    options={clients}
                                    getOptionLabel={(client) => `${client.name}`}
                                    value={newProposalData.client}
                                    onChange={handleClientChange}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Select Client" margin="normal" required />
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
                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
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
                                                onChange={(e) => handleItemChange(index, 'regularPrice', e.target.value)}
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
                                                onChange={(e) => handleItemChange(index, 'discountPrice', e.target.value)}
                                                fullWidth
                                                margin="normal"
                                                required
                                            />
                                        </Grid>
                                        {newProposalData.items.length > 1 && (
                                            <Grid item xs={12} sm={1}>
                                                <IconButton aria-label="delete" onClick={() => handleDeleteItem(index)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Grid>
                                        )}
                                    </Grid>
                                ))}
                                {newProposalData.items.length < 5 && (
                                    <Button variant="contained" onClick={handleAddItem} sx={{ float: 'right' }}>
                                        Add Item
                                    </Button>
                                )}
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h6">
                                    Total Package Price: ${newProposalData.packagePrice.toFixed(2)}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Box display="flex" justifyContent="flex-end" marginTop={2}>
                            <Button onClick={() => setOpenModal(false)} color="secondary" sx={{ marginRight: 2 }}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" color="primary">
                                Submit
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Modal>
        </Box>
    );
};

export default ProposalsPage;