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
} from '@mui/material';
import moment from 'moment';
import { useAuth } from '../../contexts/AuthContext';

const ProposalsPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('');

    const proposalsRaw = useSelector((state) => state.proposals.proposals);
    const proposals = Array.isArray(proposalsRaw) ? proposalsRaw : [];
    const loading = useSelector((state) => state.proposals.status === 'loading');
    const error = useSelector((state) => state.proposals.error);
    const { currentUser } = useAuth();

    const filteredProposalsFormatted = useMemo(() => {
        const filtered = proposals.filter((proposal) =>
            ['proposalNumber', 'proposalTitle', 'clientName', 'status'].some((field) =>
                proposal[field]?.toString().toLowerCase().includes(searchText.toLowerCase())
            ) ||
            proposal?.items?.some((item) =>
                item.description.toLowerCase().includes(searchText.toLowerCase())
            )
        );

        const formatted = filtered.map((p) => ({
            ...p,
            formattedDate: p.proposalDate
                ? moment(p.proposalDate).format('MMM DD, YYYY')
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
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const columns = useMemo(() => {
        return isMobile
            ? [
                {
                    field: 'proposalNumber',
                    headerName: 'Proposal #',
                    width: 120,
                    sortable: true,
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
                        } else if (status === 'rejected' || status === 'deleted' || status === 'draft') {
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
                            } else if (status === 'rejected' || status === 'deleted' || status === 'draft') {
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

    if (!loading && proposals.length === 0) {
        return (
            <Typography variant="h5" sx={{ mt: 4, textAlign: 'center' }}>
                No proposals available.
            </Typography>
        );
    }

    return (
        <Box padding={3}>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                marginBottom={2}
            >
                <Typography variant="h4" gutterBottom>
                    Proposals
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/proposals/new')}
                >
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
                    rows={filteredProposalsFormatted}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 20]}
                    pageSizeOptions={[5, 10, 20]}
                    onRowClick={handleRowClick}
                    getRowId={(row) => row._id}
                    getRowHeight={(params) => {
                        const minHeight = 60;
                        const items = params.model.items || [];
                        const contentHeight =
                            items.length > 0 ? items.length * 24 + 16 : minHeight;
                        return Math.max(contentHeight, minHeight);
                    }}
                    initialState={{
                        sorting: {
                            sortModel: [{ field: 'proposalNumber', sort: 'asc' }],
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
        </Box>
    );
};

export default React.memo(ProposalsPage);