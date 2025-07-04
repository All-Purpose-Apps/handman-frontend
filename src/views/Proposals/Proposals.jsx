// Proposals.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProposals } from '../../store/proposalSlice';
import { fetchClients } from '../../store/clientSlice';
import { DataGrid } from '@mui/x-data-grid';
import {
    Button,
    TextField,
    Typography,
    Box,
    useTheme,
    useMediaQuery,
    Modal,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import moment from 'moment';
import { useAuth } from '../../contexts/AuthContext';
import { deleteMultipleProposals } from '../../store/proposalSlice';

const ProposalsPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('');

    const [rowSelectionModel, setRowSelectionModel] = useState([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const handleDeleteConfirmed = () => {
        dispatch(deleteMultipleProposals(rowSelectionModel)).finally(() => {
            dispatch(fetchProposals());
            setDeleteModalOpen(false);
            setRowSelectionModel([]);
        });
    };



    const proposalsRaw = useSelector((state) => state.proposals.proposals);
    const proposals = Array.isArray(proposalsRaw) ? proposalsRaw : [];
    const loading = useSelector((state) => state.proposals.status === 'loading');
    const error = useSelector((state) => state.proposals.error);
    const { currentUser } = useAuth();

    const filteredProposalsFormatted = useMemo(() => {
        const filtered = proposals.filter((proposal) =>
            ['proposalNumber', 'proposalTitle', 'status'].some((field) =>
                proposal[field]?.toString().toLowerCase().includes(searchText.toLowerCase())
            ) ||
            proposal?.client?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            proposal?.items?.some((item) =>
                item.description.toLowerCase().includes(searchText.toLowerCase())
            )
        );

        const formatted = filtered.map((p) => ({
            ...p,
            formattedDate: p.proposalDate
                ? moment.utc(p.proposalDate).format('MM/DD/YYYY')
                : '',
        }));
        return formatted;
    }, [proposals, searchText]);

    useEffect(() => {
        if (currentUser) {
            dispatch(fetchProposals());
            dispatch(fetchClients());
        }
    }, [dispatch, currentUser]);

    const handleSearch = (event) => {
        setSearchText(event.target.value);
    };

    const handleRowClick = (params) => {
        const proposalId = params.row._id;
        navigate(`/proposals/${proposalId}`);
    };

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
    const handleDeleteSelected = () => {
        if (rowSelectionModel.length === 0) return;
        setDeleteModalOpen(true);
    };

    const columns = useMemo(() => {
        return isMobile
            ? [
                {
                    field: 'proposalNumber',
                    headerName: 'Proposal #',
                    width: 80,
                    sortable: true,
                },
                {
                    field: 'client',
                    headerName: 'Client',
                    width: 150,
                    sortable: true,
                    valueGetter: (params) => params.name || 'N/A',
                },
                {
                    field: 'status',
                    headerName: 'Status',
                    width: 200,
                    sortable: true,
                    renderCell: (params) => {
                        const status = (params.value || '').toLowerCase();
                        let backgroundColor = 'transparent';
                        let textColor = 'white';

                        if (status === 'accepted' || status === 'converted to invoice') {
                            backgroundColor = 'green'; // light green
                        } else if (status === 'sent' || status === 'viewed' || status === 'sent to client') {
                            backgroundColor = 'goldenrod'; // light yellow
                        } else if (status === 'rejected' || status === 'deleted' || status === 'draft' || status === 'proposal pdf created') {
                            backgroundColor = 'gray'; // light gray
                        }

                        return (
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    paddingLeft: 2,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: textColor,
                                        fontWeight: 500,
                                        fontSize: {
                                            xs: '0.75rem',
                                            sm: '0.85rem',
                                            md: '0.95rem',
                                            lg: '1rem',
                                        },
                                    }}
                                >
                                    {(status || '').toUpperCase()}
                                </Typography>
                            </Box>
                        );
                    },
                },
            ]
            : isTablet
                ? [
                    {
                        field: 'proposalNumber',
                        headerName: 'Proposal #',
                        width: 100,
                        sortable: true,
                        align: 'center',
                    },
                    {
                        field: 'client',
                        headerName: 'Client',
                        width: 200,
                        sortable: true,
                        valueGetter: (params) => params.name || 'N/A',
                    },
                    {
                        field: 'formattedDate',
                        headerName: 'Date',
                        width: 150,
                        sortable: false,
                    },

                    {
                        field: 'status',
                        headerName: 'Status',
                        width: 250,
                        sortable: true,
                        renderCell: (params) => {
                            const status = (params.value || '').toLowerCase();
                            let backgroundColor = 'transparent';
                            let textColor = 'white';

                            if (status === 'accepted' || status === 'converted to invoice') {
                                backgroundColor = 'green'; // light green
                            } else if (status === 'sent' || status === 'viewed' || status === 'sent to client') {
                                backgroundColor = 'goldenrod'; // light yellow
                            } else if (status === 'rejected' || status === 'deleted' || status === 'draft' || status === 'proposal pdf created') {
                                backgroundColor = 'gray'; // light gray
                            }

                            return (
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        paddingLeft: 2,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: textColor,
                                            fontWeight: 500,
                                            fontSize: {
                                                xs: '0.75rem',
                                                sm: '0.85rem',
                                                md: '0.95rem',
                                                lg: '1rem',
                                            },
                                        }}
                                    >
                                        {(status || '').toUpperCase()}
                                    </Typography>
                                </Box>
                            );
                        },
                    },
                ]
                : [
                    {
                        field: 'proposalNumber',
                        headerName: 'Proposal #',
                        width: 100,
                        sortable: true,
                        align: 'center',
                    },
                    {
                        field: 'formattedDate',
                        headerName: 'Date',
                        width: 150,
                        sortable: false,
                    },
                    {
                        field: 'client',
                        headerName: 'Client',
                        width: 200,
                        sortable: true,
                        valueGetter: (params) => params.name || 'N/A',
                    },


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
                            const hasMaterials = !!params.row.materialsListId;

                            return (
                                <Box>
                                    <ul style={{ margin: 0, paddingLeft: 20, paddingBottom: 8, paddingTop: 8 }}>
                                        {items.map((item, index) => (
                                            <li key={index} style={{ lineHeight: '24px' }}>
                                                {item.description}
                                            </li>
                                        ))}
                                    </ul>
                                    {hasMaterials && (
                                        <Typography variant="body2" color="text.secondary" style={{ paddingLeft: 20 }}>
                                            Includes materials
                                        </Typography>
                                    )}
                                </Box>
                            );
                        },
                    },
                    {
                        field: 'updatedAt',
                        headerName: 'Last Updated',
                        width: 150,
                        sortable: true,
                        renderCell: (params) => {
                            return moment(params.value).format('MM/DD/YY hh:mm A');
                        },
                    },
                    {
                        field: 'status',
                        headerName: 'Status',
                        width: 300,
                        sortable: true,
                        renderCell: (params) => {
                            const status = (params.value || '').toLowerCase();
                            let backgroundColor = 'transparent';
                            let textColor = 'white';

                            if (status === 'accepted' || status === 'converted to invoice') {
                                backgroundColor = 'green'; // light green
                            } else if (status === 'sent' || status === 'viewed' || status === 'sent to client') {
                                backgroundColor = 'goldenrod'; // light yellow
                            } else if (status === 'rejected' || status === 'deleted' || status === 'draft' || status === 'proposal pdf created') {
                                backgroundColor = 'gray'; // light gray
                            }

                            return (
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        paddingLeft: 2,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: textColor,
                                            fontWeight: 500,
                                            fontSize: {
                                                xs: '0.75rem',
                                                sm: '0.85rem',
                                                md: '0.95rem',
                                                lg: '1rem',
                                            },
                                        }}
                                    >
                                        {(status || '').toUpperCase()}
                                    </Typography>
                                </Box>
                            );
                        },
                    },
                ];
    }, [isMobile, isTablet]);

    if (loading) {
        return (
            <Modal open={true}>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100vh"
                >
                    <Box
                        bgcolor="background.paper"
                        p={3}
                        borderRadius={1}
                        boxShadow={3}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                    >
                        <CircularProgress />
                        <Typography mt={2}>Loading Proposals...</Typography>
                    </Box>
                </Box>
            </Modal>
        );
    }

    if (error) {
        return (
            <Typography variant="h4">
                Error: {typeof error === 'string' ? error : error?.msg || 'Unknown error'}
            </Typography>
        );
    }

    // Determine if there are no proposals to show (after filtering)
    const isEmpty = !loading && filteredProposalsFormatted.length === 0;


    return (
        <>
            <Box style={{ padding: 20, paddingLeft: isMobile ? 10 : 20 }}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    marginBottom={2}
                >
                    <Typography variant="h4" gutterBottom>
                        Proposals
                    </Typography>
                    <Box>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleDeleteSelected()}
                            style={{ marginRight: 10 }}
                            disabled={rowSelectionModel.length === 0}
                            sx={{
                                display: rowSelectionModel.length === 0 ? 'none' : 'inline-flex',
                            }}
                        >
                            Delete Selected
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/proposals/new')}
                        >
                            Add Proposal
                        </Button>

                    </Box>
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
                        rows={filteredProposalsFormatted}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[5, 10, 20, 50, 100]}
                        pageSizeOptions={[5, 10, 20, 50, 100]}
                        onRowClick={handleRowClick}
                        getRowId={(row) => row._id}
                        checkboxSelection
                        onRowSelectionModelChange={(newRowSelectionModel) => {
                            setRowSelectionModel(newRowSelectionModel);
                        }}
                        rowSelectionModel={rowSelectionModel}
                        getRowHeight={(params) => {
                            const minHeight = 60;
                            const items = params.model.items || [];
                            const contentHeight =
                                items.length > 0 ? items.length * 24 + 16 : minHeight;
                            return Math.max(contentHeight, minHeight);
                        }}
                        initialState={{
                            sorting: {
                                sortModel: [{ field: 'updatedAt', sort: 'desc' }],
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
                        localeText={{
                            noRowsLabel: isEmpty ? 'No proposals available.' : 'No matching results.',
                        }}
                    />
                </div>
            </Box>
            {/* Add modal for confirming delete */}
            <Dialog
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    {loading ? <CircularProgress /> :
                        <DialogContentText>
                            Are you sure you want to delete the selected proposals?
                        </DialogContentText>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteModalOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirmed} color="secondary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default React.memo(ProposalsPage);