// PriceComparison.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchLowesProducts,
    fetchHomeDepotProducts,
} from '../../store/productSlice';
import {
    Modal,
    Box,
    Grid,
    Typography,
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemAvatar,
    Avatar,
    TextField,
    CircularProgress,
    IconButton,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

export default function PriceComparison({ open, onClose, onImport }) {
    const dispatch = useDispatch();
    const { lowesProducts, homeDepotProducts } = useSelector(
        (state) => state.products
    );
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Pagination states for Lowes and Home Depot
    const [lowesPage, setLowesPage] = useState(0);
    const [homeDepotPage, setHomeDepotPage] = useState(0);
    const itemsPerPage = 3; // Number of items to display per page

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
    };

    const handleImport = () => {
        if (selectedProduct && onImport) {
            onImport(selectedProduct);
        }
    };

    const handleSearch = async () => {
        if (searchQuery) {
            setIsLoading(true);
            await dispatch(fetchLowesProducts(searchQuery));
            await dispatch(fetchHomeDepotProducts(searchQuery));
            setLowesPage(0);
            setHomeDepotPage(0);
            setIsLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Handlers for Lowes pagination
    const handleLowesPrev = () => {
        setLowesPage((prev) => Math.max(prev - 1, 0));
    };

    const handleLowesNext = () => {
        if (lowesProducts?.results) {
            const maxPage = Math.floor(
                (lowesProducts.results.length - 1) / itemsPerPage
            );
            setLowesPage((prev) => Math.min(prev + 1, maxPage));
        }
    };

    // Handlers for Home Depot pagination
    const handleHomeDepotPrev = () => {
        setHomeDepotPage((prev) => Math.max(prev - 1, 0));
    };

    const handleHomeDepotNext = () => {
        if (homeDepotProducts?.results) {
            const maxPage = Math.floor(
                (homeDepotProducts.results.length - 1) / itemsPerPage
            );
            setHomeDepotPage((prev) => Math.min(prev + 1, maxPage));
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 900,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Search for Products
                </Typography>
                <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Enter product name..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <Button
                        variant="contained"
                        onClick={handleSearch}
                        sx={{ ml: 2 }}
                    >
                        Search
                    </Button>
                </Box>

                {isLoading ? (
                    <Box display="flex" justifyContent="center" my={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        {/* Lowes Products */}
                        <Grid item xs={6}>
                            <Box display="flex" alignItems="center">
                                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                    Lowes Products
                                </Typography>
                                <IconButton
                                    onClick={handleLowesPrev}
                                    disabled={lowesPage === 0}
                                >
                                    <ChevronLeft />
                                </IconButton>
                                <IconButton
                                    onClick={handleLowesNext}
                                    disabled={
                                        lowesProducts?.results &&
                                        lowesPage >=
                                        Math.floor(
                                            (lowesProducts.results.length -
                                                1) /
                                            itemsPerPage
                                        )
                                    }
                                >
                                    <ChevronRight />
                                </IconButton>
                            </Box>
                            <List>
                                {lowesProducts?.results
                                    ?.slice(
                                        lowesPage * itemsPerPage,
                                        lowesPage * itemsPerPage + itemsPerPage
                                    )
                                    .map((product) => (
                                        <ListItem
                                            key={product.id}
                                            disablePadding
                                        >
                                            <ListItemButton
                                                selected={
                                                    selectedProduct?.id ===
                                                    product.id
                                                }
                                                onClick={() =>
                                                    handleSelectProduct(product)
                                                }
                                            >
                                                <ListItemAvatar>
                                                    <Avatar
                                                        alt={product.name}
                                                        src={product.images[1]}
                                                    />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={product.name}
                                                    secondary={
                                                        <Typography
                                                            variant="h6"
                                                            fontWeight="bold"
                                                        >
                                                            {`$${product.price.toFixed(
                                                                2
                                                            )}`}
                                                        </Typography>
                                                    }
                                                />
                                            </ListItemButton>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() =>
                                                    window.open(
                                                        product.url,
                                                        '_blank'
                                                    )
                                                }
                                                sx={{ ml: 2 }}
                                            >
                                                View
                                            </Button>
                                        </ListItem>
                                    ))}
                            </List>
                        </Grid>
                        {/* Home Depot Products */}
                        <Grid item xs={6}>
                            <Box display="flex" alignItems="center">
                                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                    Home Depot Products
                                </Typography>
                                <IconButton
                                    onClick={handleHomeDepotPrev}
                                    disabled={homeDepotPage === 0}
                                >
                                    <ChevronLeft />
                                </IconButton>
                                <IconButton
                                    onClick={handleHomeDepotNext}
                                    disabled={
                                        homeDepotProducts?.results &&
                                        homeDepotPage >=
                                        Math.floor(
                                            (homeDepotProducts.results
                                                .length -
                                                1) /
                                            itemsPerPage
                                        )
                                    }
                                >
                                    <ChevronRight />
                                </IconButton>
                            </Box>
                            <List>
                                {homeDepotProducts?.results
                                    ?.slice(
                                        homeDepotPage * itemsPerPage,
                                        homeDepotPage * itemsPerPage +
                                        itemsPerPage
                                    )
                                    .map((product) => (
                                        <ListItem
                                            key={product.id}
                                            disablePadding
                                        >
                                            <ListItemButton
                                                selected={
                                                    selectedProduct?.id ===
                                                    product.id
                                                }
                                                onClick={() =>
                                                    handleSelectProduct(product)
                                                }
                                            >
                                                <ListItemAvatar>
                                                    <Avatar
                                                        alt={product.name}
                                                        src={
                                                            product.thumbnails[0]
                                                        }
                                                    />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={product.name}
                                                    secondary={
                                                        <Typography
                                                            variant="h6"
                                                            fontWeight="bold"
                                                        >
                                                            {`$${product.price.toFixed(
                                                                2
                                                            )}`}
                                                        </Typography>
                                                    }
                                                />
                                            </ListItemButton>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() =>
                                                    window.open(
                                                        product.url,
                                                        '_blank'
                                                    )
                                                }
                                                sx={{ ml: 2 }}
                                            >
                                                View
                                            </Button>
                                        </ListItem>
                                    ))}
                            </List>
                        </Grid>
                    </Grid>
                )}
                <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button
                        variant="contained"
                        onClick={handleImport}
                        disabled={!selectedProduct}
                    >
                        Import
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}