import React from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import { useState } from 'react';
import { addMaterial, updateMaterial, deleteMaterial } from '../store/materialsSlice'; // assuming these actions exist
import { useSettings } from '../contexts/SettingsContext';
import {
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Card,
    CardContent,
} from '@mui/material';
import { getAllMaterials } from '../store/materialsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';

const SettingsPage = () => {
    const { urgentDays, setUrgentDays } = useSettings();
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [materialName, setMaterialName] = useState('');
    const [materialPrice, setMaterialPrice] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortAsc, setSortAsc] = useState(true);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [editPrice, setEditPrice] = useState('');
    // Fetch all materials when the component mounts
    useEffect(() => {
        dispatch(getAllMaterials());
    }, [dispatch]);

    const listOfMaterials = useSelector((state) => state.materials.items);

    const filteredMaterials = [...listOfMaterials]
        .filter((mat) =>
            mat.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) =>
            sortAsc
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name)
        );

    const handleUrgentDaysChange = (e) => {
        setUrgentDays(Number(e.target.value)); // Ensure the value is stored as a number
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setMaterialName('');
        setMaterialPrice('');
    };

    const handleAddMaterial = () => {
        if (materialName.trim() && !isNaN(materialPrice)) {
            dispatch(addMaterial({ name: materialName, price: parseFloat(materialPrice) }));
            setMaterialName('');
            setMaterialPrice('');
            dispatch(getAllMaterials()); // Refresh the materials list
            handleClose();
        }
    };

    const handleSelectMaterial = (material) => {
        setSelectedMaterial(material);
        setEditPrice(material.price.toString());
    };

    const handleUpdateMaterial = () => {
        if (selectedMaterial && !isNaN(editPrice)) {
            dispatch(updateMaterial({ ...selectedMaterial, price: parseFloat(editPrice) }));
            setSelectedMaterial(null);
            setEditPrice('');
            dispatch(getAllMaterials());
        }
    };

    const handleDeleteMaterial = () => {
        if (selectedMaterial) {
            dispatch(deleteMaterial(selectedMaterial._id));
            setSelectedMaterial(null);
            setEditPrice('');
            dispatch(getAllMaterials());
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 4,
                backgroundColor: '#f5f5f5',
                padding: 3,
            }}
        >
            <Card sx={{ width: 350 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Urgent Days
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel id="urgent-days-label">Days until urgent</InputLabel>
                        <Select
                            labelId="urgent-days-label"
                            value={urgentDays}
                            onChange={handleUrgentDaysChange}
                            label="Days until urgent"
                        >
                            {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
                                <MenuItem key={day} value={day}>
                                    {day} {day === 1 ? 'day' : 'days'}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Currently set to: {urgentDays} {urgentDays === 1 ? 'day' : 'days'}
                    </Typography>
                </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Materials
                    </Typography>
                    <TextField
                        label="Search Materials"
                        variant="outlined"
                        fullWidth
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button
                        sx={{ mt: 1, mb: 1 }}
                        onClick={() => setSortAsc((prev) => !prev)}
                    >
                        Sort {sortAsc ? 'Descending' : 'Ascending'}
                    </Button>
                    <List dense sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        {filteredMaterials.map((mat) => (
                            <ListItem button onClick={() => handleSelectMaterial(mat)} key={mat._id}>
                                <ListItemText
                                    primary={`${mat.name} - $${mat.price.toFixed(2)}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <Button variant="contained" sx={{ mt: 2 }} onClick={handleOpen}>
                        Add New Material
                    </Button>
                </CardContent>
            </Card>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add Material</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Material Name"
                        type="text"
                        fullWidth
                        value={materialName}
                        onChange={(e) => setMaterialName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Material Price"
                        type="number"
                        fullWidth
                        value={materialPrice}
                        onChange={(e) => setMaterialPrice(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleAddMaterial}>Add</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={!!selectedMaterial} onClose={() => setSelectedMaterial(null)}>
                <DialogTitle>Edit Material</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>{selectedMaterial?.name}</Typography>
                    <TextField
                        margin="dense"
                        label="New Price"
                        type="number"
                        fullWidth
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedMaterial(null)}>Cancel</Button>
                    <Button color="error" onClick={handleDeleteMaterial}>Delete</Button>
                    <Button onClick={handleUpdateMaterial}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SettingsPage;