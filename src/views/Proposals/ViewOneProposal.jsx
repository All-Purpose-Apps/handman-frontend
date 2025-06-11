import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    CircularProgress,
    Typography,
    Box,
    Button,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Card,
    CardContent,
    CardActions,
    Autocomplete,
    Switch,
    FormControlLabel,
    IconButton,
    Modal,
    ListItemButton,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Fade,
    Backdrop,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import moment from 'moment';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import ConvertInvoiceModal from './ConverInvoiceModal';
import {
    fetchOneProposal,
    updateProposal,
    deleteProposal
} from '../../store/proposalSlice';
import { addInvoice, fetchInvoices } from '../../store/invoiceSlice';
import { fetchClients } from '../../store/clientSlice';
import { getMaterialListById, updateMaterialsList } from '../../store/materialsSlice';
import { fetchProposals } from '../../store/proposalSlice';
import { handleGoogleSignIn } from '../../utils/handleGoogleSignIn';


const ViewProposal = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const auth = getAuth();
    const navigate = useNavigate();
    const location = useLocation();


    const { proposal, status, error } = useSelector((state) => state.proposals);
    const { materialsList } = useSelector((state) => state.materials);
    const { clients } = useSelector((state) => state.clients);
    const { invoices } = useSelector((state) => state.invoices);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingClient, setIsEditingClient] = useState(false);
    const [isInvoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [isCreatingPdf, setIsCreatingPdf] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [materialsListDiscount, setMaterialsListDiscount] = useState(0);
    // Modal states for alerts
    const [missingPdfModalOpen, setMissingPdfModalOpen] = useState(false);
    const [sendSuccessModalOpen, setSendSuccessModalOpen] = useState(false);
    const [sendFailureModalOpen, setSendFailureModalOpen] = useState(false);
    // State-driven modal for sending proposal
    const [isSendingProposal, setIsSendingProposal] = useState(false);


    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: '',
        invoiceDate: moment().format('YYYY-MM-DD'),
        client: null,
        items: [],
        subTotal1: 0,
        extraWorkMaterials: 0,
        subTotal2: 0,
        paymentMethod: 'awaiting payment',
        checkNumber: '',
        creditCardFee: 0,
        depositAdjustment: 0,
        total: 0,
    });

    const [editedProposal, setEditedProposal] = useState({
        items: [],
        client: null,
        proposalTitle: '',
        proposalDate: '',
        packagePrice: 0,
        materialsIncludedPrice: 0,
    });

    // Responsive design
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));



    useEffect(() => {
        dispatch(fetchOneProposal(id)).then((response) => {
            if (response.meta.requestStatus === 'fulfilled') {
                dispatch(getMaterialListById(response.payload.materialsListId)).then((materialsResponse) => {
                    if (materialsResponse.meta.requestStatus === 'fulfilled') {
                        if (materialsResponse.payload) {
                            setMaterialsListDiscount(materialsResponse.payload.discountTotal);
                        }
                    }
                });
            } else {
                console.error('Failed to fetch proposal:', response.error);
            }
        });
        dispatch(fetchInvoices());
        dispatch(fetchClients());
        // Fetch the proposal data when the component mounts        
    }, [dispatch, id]);

    useEffect(() => {
        const latestNumber = invoices.length > 0
            ? Math.max(...invoices.map((inv) => parseInt(inv.invoiceNumber || 0, 10)))
            : 1000;
        setInvoiceData((prevData) => ({
            ...prevData,
            invoiceNumber: (latestNumber + 1).toString(),
        }));
    }, [invoices]);

    useEffect(() => {
        if (proposal) {
            setEditedProposal({
                ...proposal,
                client: proposal.client || null,
                items: proposal.items || [],
                proposalTitle: proposal.proposalTitle || '',
                proposalDate: proposal.proposalDate || '',
                packagePrice: proposal.packagePrice || 0,
            });
        }
    }, [proposal]);

    const calculatePackageTotal = useCallback(() => {
        materialsListDiscount
        const total = editedProposal.items.reduce(
            (sum, item) => sum + parseFloat(item.discountPrice || 0),
            0
        ) + parseFloat(materialsListDiscount || 0);
        setEditedProposal((prevData) => ({
            ...prevData,
            packagePrice: total,
        }));
    }, [editedProposal.items, editedProposal.materialsIncludedPrice, materialsListDiscount]);

    useEffect(() => {
        calculatePackageTotal();
    }, [calculatePackageTotal]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedProposal((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleClientChange = (event, newValue) => {
        setEditedProposal((prevData) => ({
            ...prevData,
            client: newValue || null,
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = editedProposal.items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        setEditedProposal({
            ...editedProposal,
            items: newItems,
        });
    };

    const handleMaterialsDiscountChange = (value) => {
        setMaterialsListDiscount(value);
    }

    const handleAddItem = () => {
        if (editedProposal.items.length < 5) {
            setEditedProposal({
                ...editedProposal,
                items: [
                    ...editedProposal.items,
                    { description: '', regularPrice: '', discountPrice: '' },
                ],
            });
        }
    };

    const handleDeleteItem = (index) => {
        const newItems = editedProposal.items.filter((_, i) => i !== index);
        setEditedProposal({
            ...editedProposal,
            items: newItems,
        });
    };

    const handleEditToggle = async () => {

        if (isEditing) {
            await dispatch(
                updateProposal({
                    ...editedProposal,
                    fileUrl: '', updatedAt: moment().toISOString(), status: 'draft', signedPdfUrl: '',
                })
            );
            if (materialsList && materialsList._id) {
                await dispatch(
                    updateMaterialsList({
                        id: materialsList._id,
                        discountTotal: materialsListDiscount,
                    })
                )
            }
            dispatch(fetchOneProposal(id));
        }
        setIsEditing(!isEditing);
        setIsEditingClient(false);
    };

    const handleCreatePdf = async () => {
        setIsCreatingPdf(true);
        setSendSuccessModalOpen(false);
        setSendFailureModalOpen(false);
        const accessToken = localStorage.getItem('accessToken');
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/proposals/create-pdf`,
                { proposal: editedProposal },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            await dispatch(
                updateProposal({
                    ...editedProposal,
                    fileUrl: response.data.url,
                    updatedAt: moment().toISOString(),
                    status: 'proposal pdf created',
                })
            );
            await dispatch(fetchOneProposal(id));
            window.open(response.data.url);
        } catch (error) {
            if (error.response?.status === 401) {
                handleGoogleSignIn(auth);
            }
            console.error('Error creating PDF:', error);
        } finally {
            setIsCreatingPdf(false);
        }
    };

    const toggleClientEdit = (event) => {
        setIsEditingClient(event.target.checked);
    };

    const handleOpenInvoiceModal = () => {
        setInvoiceData({
            ...invoiceData,
            invoiceDate: moment().format('YYYY-MM-DD'),
            client: editedProposal.client || null,
            items: editedProposal.items.map((item) => ({
                description: item.description,
                price: item.discountPrice,
            })),
            subTotal1: 0,
            extraWorkMaterials: materialsListDiscount,
            subTotal2: 0,
            paymentMethod: 'awaiting payment',
            checkNumber: '',
            creditCardFee: 0,
            depositAdjustment: 0,
            total: 0,
        });
        setInvoiceModalOpen(true);
    };

    const handleCloseInvoiceModal = () => {
        setInvoiceModalOpen(false);
    };

    const handleAddInvoice = async (event) => {
        event.preventDefault();
        try {
            const response = await dispatch(addInvoice(invoiceData));
            await dispatch(
                updateProposal({
                    ...editedProposal,
                    status: 'converted to invoice',
                    invoiceId: response.payload._id,
                    updatedAt: moment().toISOString(),
                })
            );
            setInvoiceModalOpen(false);
            navigate(`/invoices/${response.payload._id}`);
        } catch (error) {
            console.error('Error adding invoice:', error);
        }
    };

    const handleGoToInvoice = (invoiceId) => {
        navigate(`/invoices/${invoiceId}`);
    };

    const handleSendProposal = async () => {
        const accessToken = localStorage.getItem('accessToken');

        if (!editedProposal.fileUrl) {
            setMissingPdfModalOpen(true);
            return;
        }

        setIsSendingProposal(true);
        setSendSuccessModalOpen(false);
        setSendFailureModalOpen(false);
        try {
            const token = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/proposals/create-token`,
                {
                    proposalId: editedProposal._id,
                    data: { proposalUrl: editedProposal.fileUrl },
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        withCredentials: true,
                    },
                }
            );

            const tokenUrl = `${import.meta.env.VITE_FRONTEND_URL}/sign/${token.data.token}`;

            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/gmail/send-proposal`,
                {
                    to: editedProposal.client?.email,
                    subject: `Proposal ${editedProposal.proposalNumber}`,
                    body: `
                        <p>Hello ${editedProposal.client?.name},</p>
                        <p>Please find the attached estimate for the job that we talked about recently.</p>
                        <p>You can sign and accept the proposal <a href="${tokenUrl}">here</a>.</p>
                        <p>
                          Here is the link to our Blinq page. This will give you access to our website, and all of our social media:
                          <br />
                          <a href="https://blinq.me/hdwTW00U0I7wvwwm79oV?bs=db" target="_blank">
                            Social Media Links
                          </a>
                        </p>
                        <p><strong>NOTE:</strong> We also offer the service of picking up the materials for the job, with a minimum charge of $75.00, depending on the quantity of materials and the distance from the store.</p>
                        <br />
                        <p>Thank you,</p>
                        <p>
                          Armando Rivera<br />
                          <strong>Han-D-Man Pro</strong><br />
                          (813) 360-1819
                        </p>
                    `,
                    pdfUrl: editedProposal.fileUrl,
                    proposal: editedProposal,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        withCredentials: true,
                    },
                }
            );

            setSendSuccessModalOpen(true);
        } catch (error) {
            console.error('Error sending proposal:', error);
            setSendFailureModalOpen(true);
        } finally {
            setIsSendingProposal(false);
            dispatch(fetchOneProposal(id));
        }
    };

    // Invoice Modal Handlers
    const handleInvoiceInputChange = (e) => {
        const { name, value } = e.target;
        setInvoiceData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleInvoiceClientChange = (event, newValue) => {
        setInvoiceData((prevData) => ({
            ...prevData,
            client: newValue || null,
        }));
    };

    const handleInvoiceItemChange = (index, field, value) => {
        const newItems = invoiceData.items.map((item, i) => {
            return i === index ? { ...item, [field]: value } : item
        }
        );
        setInvoiceData({
            ...invoiceData,
            items: newItems,
        });
    };

    const handleInvoiceAddItem = () => {
        setInvoiceData({
            ...invoiceData,
            items: [
                ...invoiceData.items,
                { description: '', price: '' },
            ],
        });
    };

    const handleInvoiceDeleteItem = (index) => {
        const newItems = invoiceData.items.filter((_, i) => i !== index);
        setInvoiceData({
            ...invoiceData,
            items: newItems,
        });
    };

    const handleOpenDeleteModal = () => setIsDeleteModalOpen(true);
    const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

    const handleConfirmDelete = async () => {
        await dispatch(deleteProposal(id));
        navigate('/proposals');
        setIsDeleteModalOpen(false);
    };

    const calculateTotals = useCallback(() => {
        let subTotal1 = invoiceData.items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
        let subTotal2 = subTotal1 + parseFloat(invoiceData.extraWorkMaterials || 0);

        // Calculate the credit/debit card fee (3% of subTotal2)
        let creditCardFee = 0;
        if (invoiceData.paymentMethod === 'credit/debit') {
            creditCardFee = subTotal2 * 0.03;
        }

        // Calculate the final total
        let total = subTotal2 + creditCardFee - parseFloat(invoiceData.depositAdjustment || 0);

        setInvoiceData((prevData) => ({
            ...prevData,
            subTotal1,
            subTotal2,
            creditCardFee,
            total,
        }));
    }, [invoiceData.items, invoiceData.extraWorkMaterials, invoiceData.depositAdjustment, invoiceData.paymentMethod]);
    // Call calculateTotals when relevant data changes
    useEffect(() => {
        calculateTotals();
    }, [calculateTotals]);



    const handleEditMaterialsList = () => {

        if (!materialsList || !materialsList.proposal) {
            console.error('No materials list found for this proposal.');
            return;
        }

        navigate(`/proposal/${materialsList.proposal}/materials-list`, {
            state: {
                isEditing: true,
                existingMaterials: materialsList,
            },
        });;
    }


    const handleCancelBackButton = async () => {
        if (isEditing) {
            setIsEditing(false);
            setIsEditingClient(false);
            setEditedProposal({
                ...proposal,
                client: proposal.client || null,
                items: proposal.items || [],
                proposalTitle: proposal.proposalTitle || '',
                proposalDate: proposal.proposalDate || '',
                packagePrice: proposal.packagePrice || 0,
            });
            if (materialsList?._id) {
                setMaterialsListDiscount(materialsList.discountTotal || 0);
            }
        } else {
            if (location?.state?.location?.from && location?.state?.location?.from === '/proposals/new') {
                await dispatch(fetchProposals());
                navigate('/proposals');
            } else if (!location?.state?.location?.from) {
                navigate(-1);
            }
        }
    }




    if (status === 'loading' || !proposal) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    if (status === 'failed') {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
            >
                <Typography variant="h6" color="error">
                    Error: {error}
                </Typography>
            </Box>
        );
    }

    // Deconstruct actions into leftActions and rightActions for layout
    let leftActions = [];
    let rightActions = [];
    // Helper for the Back/Cancel button
    const backOrCancelButton = (
        <Button
            key="back"
            variant="contained"
            color="primary"
            onClick={() => handleCancelBackButton()}
        >
            {isEditing ? 'Cancel' : 'Back'}
        </Button>
    );
    if (editedProposal?.status === 'converted to invoice') {
        leftActions = [
            backOrCancelButton,
            <Button
                key="goto-invoice"
                variant="contained"
                onClick={() => handleGoToInvoice(editedProposal.invoiceId)}
            >
                Go to Invoice
            </Button>,

            <Button
                key="delete"
                variant="contained"
                color="error"
                onClick={handleOpenDeleteModal}
            >
                Delete
            </Button>

        ];
        rightActions = [
            <Typography key="converted-msg" variant="body1" color="error">
                This proposal has been converted to an invoice and can no longer be edited.
            </Typography>
        ];
    } else if (editedProposal?.status === 'accepted') {
        leftActions = [
            backOrCancelButton,

            <Button
                key="edit"
                variant="contained"
                onClick={handleEditToggle}
            >
                {isEditing ? 'Save' : 'Edit'}
            </Button>,
            isEditing && (
                <Button
                    key="delete"
                    variant="contained"
                    color="error"
                    onClick={handleOpenDeleteModal}
                >
                    Delete
                </Button>
            ),
            !isEditing && (
                <Button
                    key="convert-invoice"
                    variant="contained"
                    color="primary"
                    onClick={handleOpenInvoiceModal}
                >
                    Convert to Invoice
                </Button>
            ),
        ].filter(Boolean);
        rightActions = [
            !isEditing && (
                <Button
                    key="create-pdf"
                    variant="contained"
                    onClick={handleCreatePdf}
                >
                    Create PDF
                </Button>
            ),
            proposal.signedPdfUrl && (
                <Button
                    key="view-proposal"
                    variant="contained"
                    href={proposal.signedPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View Signed Proposal
                </Button>
            ),
            // "Send to Client" not shown in accepted status in original code
        ].filter(Boolean);
    } else {
        leftActions = [
            backOrCancelButton,
            <Button
                key="edit"
                variant="contained"
                onClick={handleEditToggle}
            >
                {isEditing ? 'Save' : 'Edit'}
            </Button>,
            // !isEditing && (
            //     <Button
            //         key="convert-invoice"
            //         variant="contained"
            //         color="primary"
            //         onClick={handleOpenInvoiceModal}
            //     >
            //         Convert to Invoice
            //     </Button>
            // ),
            isEditing && (
                <Button
                    key="delete"
                    variant="contained"
                    color="error"
                    onClick={handleOpenDeleteModal}
                >
                    Delete
                </Button>
            ),
        ].filter(Boolean);
        rightActions = [
            !isEditing && (
                <Button
                    key="create-pdf"
                    variant="contained"
                    onClick={handleCreatePdf}
                >
                    Create PDF
                </Button>
            ),
            proposal.fileUrl && (
                <Button
                    key="view-proposal"
                    variant="contained"
                    href={proposal.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View Proposal
                </Button>
            ),
            proposal.fileUrl && (
                <Button
                    key="send-client"
                    variant="contained"
                    onClick={handleSendProposal}
                >
                    Send To Client
                </Button>
            ),
            // Add "Get Signature" button at the end (always shown in default proposal status)
            proposal.fileUrl && editedProposal?.status === 'sent to client' && (
                <Button
                    key="get-signature"
                    variant="contained"
                    color="secondary"
                    onClick={() => navigate(`/signature/proposal/${proposal._id}`)}
                >
                    Get Signature
                </Button>
            ),
        ].filter(Boolean);
    }

    return (
        <>
            <Card elevation={3} sx={{ p: 2 }}>
                <CardContent>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">
                            No. {proposal?.proposalNumber || 'Loading...'}
                        </Typography>
                        <Box mt={2} mb={2}>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    display: 'inline-block',
                                    px: 2,
                                    py: 1,
                                    borderRadius: 2,
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    backgroundColor:
                                        proposal?.status === 'accepted'
                                            ? 'success.main'
                                            : proposal?.status === 'converted to invoice'
                                                ? 'info.main'
                                                : proposal?.status === 'draft'
                                                    ? 'warning.main'
                                                    : proposal?.status === 'rejected'
                                                        ? 'error.main'
                                                        : 'grey.700',
                                    letterSpacing: 1,
                                    fontSize: '1.1rem',
                                }}
                            >
                                Status: {proposal?.status?.toUpperCase() || 'Loading...'}
                            </Typography>
                        </Box>
                    </Box>
                    <Grid container spacing={isMobile ? 2 : 4} direction={isMobile ? 'column' : 'row'}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ mb: isMobile ? 2 : 0 }}>
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    {isEditing ? (
                                        <TextField
                                            name="proposalDate"
                                            label="Proposal Date"
                                            type="date"
                                            fullWidth
                                            value={moment(editedProposal.proposalDate).format(
                                                'YYYY-MM-DD'
                                            )}
                                            onChange={handleInputChange}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    ) : (
                                        <Typography variant="body1">
                                            <strong>Proposal Date:</strong>{' '}
                                            {moment(proposal?.proposalDate).format('MM/DD/YYYY') ||
                                                'Loading...'}
                                        </Typography>
                                    )}
                                </Box>

                                {isEditing && (
                                    <FormControlLabel
                                        control={
                                            <Switch checked={isEditingClient} onChange={toggleClientEdit} />
                                        }
                                        label="Edit Client"
                                    />
                                )}

                                {isEditingClient ? (
                                    <Autocomplete
                                        options={clients}
                                        getOptionLabel={(client) => client.name || ''}
                                        value={editedProposal.client || null}
                                        onChange={handleClientChange}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Select Client" fullWidth />
                                        )}
                                    />
                                ) : (
                                    <>
                                        <ListItemButton
                                            onClick={() => navigate(`/clients/${proposal.client._id}`)}
                                            sx={{
                                                borderRadius: 2,
                                                '&:hover': {
                                                    backgroundColor: 'primary.light',
                                                },
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar>

                                                    {proposal?.client?.name?.charAt(0)}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText primary={proposal?.client?.name} secondary="Click to view details" />
                                        </ListItemButton>
                                        <Typography variant="body1" sx={{ marginTop: '10px' }}>
                                            <strong>Client Name:</strong>{' '}
                                            {proposal?.client?.name || 'Loading...'}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Client Address:</strong>{' '}
                                            {proposal?.client?.address || 'Loading...'}
                                        </Typography>
                                    </>
                                )}


                                {proposal.fileUrl && (
                                    <Typography variant="body2">
                                        updated {moment(editedProposal.updatedAt).fromNow()} on {moment(editedProposal.updatedAt).format('MM/DD/YYYY')}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h5" gutterBottom>
                                Items
                            </Typography>
                            <TableContainer component={Paper} sx={{ overflowX: isMobile ? 'auto' : 'unset' }}>
                                <Table aria-label="items table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Regular Price</TableCell>
                                            <TableCell>Discount Price</TableCell>
                                            {isEditing && <TableCell>Actions</TableCell>}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {materialsList?._id && !isEditing && (
                                            <TableRow>
                                                <TableCell><strong>Materials Included</strong></TableCell>
                                                <TableCell>
                                                    ${materialsList?.materials?.reduce((sum, mat) => sum + (mat.total || 0), 0).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    ${materialsList?.discountTotal}
                                                </TableCell>
                                            </TableRow>)}
                                        {isEditing && materialsList?._id && (
                                            <TableRow>
                                                <TableCell><strong>Materials Included</strong></TableCell>
                                                <TableCell>
                                                    ${materialsList?.materials?.reduce((sum, mat) => sum + (mat.total || 0), 0).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        name="discountPrice"
                                                        type="number"
                                                        value={materialsListDiscount}
                                                        onChange={(e) =>
                                                            handleMaterialsDiscountChange(
                                                                e.target.value
                                                            )
                                                        }
                                                        fullWidth
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        aria-label="edit"
                                                        onClick={() => handleEditMaterialsList()}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {editedProposal.items.map((item, index) => (
                                            <TableRow key={index}>
                                                {isEditing ? (
                                                    <>
                                                        <TableCell>
                                                            <TextField
                                                                name="description"
                                                                value={item.description}
                                                                onChange={(e) =>
                                                                    handleItemChange(
                                                                        index,
                                                                        'description',
                                                                        e.target.value
                                                                    )
                                                                }
                                                                fullWidth
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <TextField
                                                                name="regularPrice"
                                                                type="number"
                                                                value={item.regularPrice}
                                                                onChange={(e) =>
                                                                    handleItemChange(
                                                                        index,
                                                                        'regularPrice',
                                                                        e.target.value
                                                                    )
                                                                }
                                                                fullWidth
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <TextField
                                                                name="discountPrice"
                                                                type="number"
                                                                value={item.discountPrice}
                                                                onChange={(e) =>
                                                                    handleItemChange(
                                                                        index,
                                                                        'discountPrice',
                                                                        e.target.value
                                                                    )
                                                                }
                                                                fullWidth
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                onClick={() => handleDeleteItem(index)}
                                                                aria-label="Delete Item"
                                                            >
                                                                <DeleteIcon color="error" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell>{item.description}</TableCell>
                                                        <TableCell>${item.regularPrice ?
                                                            parseFloat(item.regularPrice).toFixed(2) : '0.00'
                                                        }</TableCell>
                                                        <TableCell>
                                                            $
                                                            {item.discountPrice
                                                                ? parseFloat(item.discountPrice).toFixed(2)
                                                                : '0.00'}
                                                        </TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {isEditing && editedProposal.items.length < 5 && (
                                <Box sx={{ marginTop: '10px', textAlign: 'left' }}>
                                    <Button variant="contained" onClick={handleAddItem}>
                                        Add Item
                                    </Button>
                                </Box>
                            )}
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box mt={2}>
                                <Typography variant="h6">
                                    <strong>Package Total:</strong>{' '}
                                    ${editedProposal?.packagePrice?.toFixed(2) || '0.00'}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions>
                    <Grid
                        container
                        spacing={2}
                        direction={isMobile ? 'column' : 'row'}
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ padding: isMobile ? 2 : '10px' }}
                    >
                        <Grid item>
                            <Box
                                display="flex"
                                flexDirection={isMobile ? 'column' : 'row'}
                                gap={2}
                                sx={{
                                    '& button': {
                                        fontSize: isMobile ? '1rem' : '0.875rem',
                                        padding: isMobile ? '12px 16px' : undefined,
                                    },
                                }}
                            >
                                {leftActions}
                            </Box>
                        </Grid>
                        <Grid item>
                            <Box
                                display="flex"
                                flexDirection={isMobile ? 'column' : 'row'}
                                gap={2}
                                sx={{
                                    '& button': {
                                        fontSize: isMobile ? '1rem' : '0.875rem',
                                        padding: isMobile ? '12px 16px' : undefined,
                                    },
                                }}
                            >
                                {rightActions}
                            </Box>
                        </Grid>
                    </Grid>
                </CardActions>

                {/* Render the ConvertInvoiceModal */}
                {isInvoiceModalOpen && (
                    <ConvertInvoiceModal
                        openModal={isInvoiceModalOpen}
                        setOpenModal={setInvoiceModalOpen}
                        newInvoiceData={invoiceData}
                        handleInputChange={handleInvoiceInputChange}
                        handleClientChange={handleInvoiceClientChange}
                        handleItemChange={handleInvoiceItemChange}
                        handleDeleteItem={handleInvoiceDeleteItem}
                        handleAddItem={handleInvoiceAddItem}
                        handleAddInvoice={handleAddInvoice}
                        clients={clients}
                    />
                )}

                {/* Loading Modal */}
                {/* Enhanced Loading/Status Modal for Sending Proposal, Creating PDF, and Status */}
                <Modal open={isSendingProposal || isCreatingPdf || sendSuccessModalOpen || sendFailureModalOpen}>
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="20vh"
                        bgcolor="background.paper"
                        p={3}
                        borderRadius={1}
                        boxShadow={3}
                    >
                        <Box textAlign="center">
                            {isSendingProposal && (
                                <>
                                    <CircularProgress />
                                    <Typography variant="h6" mt={2}>
                                        Sending Proposal...
                                    </Typography>
                                </>
                            )}
                            {isCreatingPdf && (
                                <>
                                    <CircularProgress />
                                    <Typography variant="h6" mt={2}>
                                        Creating PDF...
                                    </Typography>
                                </>
                            )}
                            {sendSuccessModalOpen && (
                                <>
                                    <Typography variant="h6" color="success.main">
                                        Proposal Sent Successfully!
                                    </Typography>
                                    <Button onClick={() => setSendSuccessModalOpen(false)} sx={{ mt: 2 }} variant="contained">
                                        Close
                                    </Button>
                                </>
                            )}
                            {sendFailureModalOpen && (
                                <>
                                    <Typography variant="h6" color="error">
                                        Failed to Send Proposal
                                    </Typography>
                                    <Button onClick={() => setSendFailureModalOpen(false)} sx={{ mt: 2 }} variant="contained">
                                        Close
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>
                </Modal>
                <Modal
                    open={isDeleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    aria-labelledby="delete-confirmation-modal"
                    aria-describedby="delete-confirmation-description"
                >
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        bgcolor="background.paper"
                        p={4}
                        borderRadius={1}
                        boxShadow={3}
                        sx={{ width: { xs: '80%', md: 400 }, margin: 'auto', textAlign: 'center' }}
                    >
                        <Typography variant="h6" mb={2} id="delete-confirmation-modal">
                            Are you sure you want to delete this proposal?
                        </Typography>
                        <Box display="flex" justifyContent="space-around" width="100%">
                            <Button variant="contained" onClick={handleCloseDeleteModal}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleConfirmDelete}
                            >
                                Confirm Delete
                            </Button>
                        </Box>
                    </Box>
                </Modal>
            </Card>

            <Modal
                open={missingPdfModalOpen}
                onClose={() => setMissingPdfModalOpen(false)}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{ backdrop: { timeout: 300 } }}
            >
                <Fade in={missingPdfModalOpen}>
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        bgcolor="background.paper"
                        p={4}
                        borderRadius={1}
                        boxShadow={3}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: { xs: '80%', md: 400 },
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="h6" mb={2}>
                            Please create the PDF first before sending.
                        </Typography>
                        <Button variant="contained" onClick={() => setMissingPdfModalOpen(false)}>
                            Close
                        </Button>
                    </Box>
                </Fade>
            </Modal>
            {/* Removed old sendSuccessModalOpen and sendFailureModalOpen modals, now handled by enhanced modal above */}
        </>
    );
};

export default ViewProposal;    