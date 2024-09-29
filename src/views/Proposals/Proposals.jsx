import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import {
    Button,
    TextField,
    Typography,
    Box,
} from '@mui/material';
import axios from 'axios';

const columns = [
    { field: 'proposalNumber', headerName: 'Proposal Number', width: 200, sortable: true },
    { field: 'proposalTitle', headerName: 'Title', width: 250, sortable: true },
    { field: 'clientName', headerName: 'Client', width: 200, sortable: true },
    {
        field: 'proposalDate',
        headerName: 'Date',
        width: 150,
        sortable: true,
        valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    { field: 'status', headerName: 'Status', width: 120, sortable: true },
    {
        field: 'total',
        headerName: 'Total',
        width: 120,
        sortable: true,
        valueFormatter: (params) => {
            const value = params.value || 0;
            return `$${value.toFixed(2)}`;
        },
    },
];

const ProposalsPage = () => {
    const navigate = useNavigate();
    const [proposals, setProposals] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredProposals, setFilteredProposals] = useState([]);

    // Sample data (provided object)
    const sampleProposals = [
        {
            "_id": "66f9912aa0ada2510d36e5c4",
            "client": "64d9b0c53980b4b76fef9abc",
            "clientName": "John Doe",
            "proposalNumber": "PROP-2024-001",
            "proposalDate": "2024-10-01T00:00:00.000Z",
            "proposalTitle": "Website Development Proposal",
            "proposalDescription": "Proposal for developing a corporate website with 10 pages, CMS integration, and responsive design.",
            "items": [
                {
                    "description": "Homepage design",
                    "quantity": 1,
                    "rate": 1000,
                    "_id": "66f9912aa0ada2510d36e5c5"
                },
                {
                    "description": "CMS Integration",
                    "quantity": 1,
                    "rate": 1500,
                    "_id": "66f9912aa0ada2510d36e5c6"
                },
                {
                    "description": "Responsive Design",
                    "quantity": 1,
                    "rate": 800,
                    "_id": "66f9912aa0ada2510d36e5c7"
                }
            ],
            "subTotal": 3300,
            "total": 3300,
            "status": "Pending",
            "notes": "Client requested completion by end of Q4.",
            "createdAt": "2024-09-29T17:40:58.032Z",
            "__v": 0
        }
        // Add more proposals as needed
    ];

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                // Uncomment the following lines to fetch from an actual API
                // const response = await axios.get('/api/proposals');
                // const data = response.data;

                // Using sample data for demonstration
                const data = sampleProposals;

                // Process proposals to include 'id' and 'clientName' fields
                const proposalsWithId = data.map((proposal) => ({
                    ...proposal,
                    id: proposal._id, // DataGrid expects an 'id' field
                    clientName: proposal.clientName || 'Unknown Client', // Assuming you have client names
                    total: proposal.total || 0, // Ensure total is defined
                }));

                setProposals(proposalsWithId);
            } catch (error) {
                console.error('Failed to fetch proposals:', error);
            }
        };

        fetchProposals();
    }, []);

    useEffect(() => {
        // Fields to search
        const searchableFields = ['proposalNumber', 'proposalTitle', 'clientName', 'status'];

        // Filter proposals based on searchText
        const filtered = proposals.filter((proposal) =>
            searchableFields.some((field) => {
                const value = proposal[field];
                if (value) {
                    return value.toString().toLowerCase().includes(searchText.toLowerCase());
                }
                return false;
            })
        );
        setFilteredProposals(filtered);
    }, [proposals, searchText]);

    const handleSearch = (event) => {
        setSearchText(event.target.value);
    };

    // Handle row click
    const handleRowClick = (params) => {
        const proposalId = params.row.id; // Get the proposal id from the clicked row
        navigate(`/proposals/${proposalId}`); // Navigate to the proposal detail page
    };

    return (
        <Box padding={3}>
            <Typography variant="h4" gutterBottom>
                Proposals
            </Typography>

            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
                <TextField
                    label="Search Proposals"
                    variant="outlined"
                    value={searchText}
                    onChange={handleSearch}
                    style={{ width: '100%', marginRight: 16 }}
                />
                <Button variant="contained" color="primary">
                    Add Proposal
                </Button>
            </Box>

            <div style={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={filteredProposals}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 20]}
                    onRowClick={handleRowClick}
                />
            </div>
        </Box>
    );
};

export default ProposalsPage;