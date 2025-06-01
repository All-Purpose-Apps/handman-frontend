import { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Typography,
  Grid,
  Autocomplete,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAllMaterials, createMaterialsList, getMaterialList, updateMaterialsList } from '../../store/materialsSlice';

const MaterialsListing = () => {
  const { id: proposalNumber } = useParams();
  const location = useLocation();
  const isEditing = location.state?.isEditing;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const listOfMaterials = useSelector((state) => state.materials.items);

  const [materials, setMaterials] = useState([]);
  const [materialsList, setMaterialsList] = useState({});
  const [materialInput, setMaterialInput] = useState({
    material: '',
    quantity: '',
    price: '',
  });


  useEffect(() => {
    dispatch(getAllMaterials());
    dispatch(getMaterialList(proposalNumber)).then((response) => {
      if (response.meta.requestStatus === 'fulfilled') {
        setMaterialsList(response.payload);
        const existingMaterials = response.payload.materials || [];
        setMaterials(existingMaterials);
      } else {
        console.error('Failed to fetch materials list');
      }
    });

  }, [dispatch]);


  const handleChange = (e) => {
    setMaterialInput({
      ...materialInput,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();
    const quantity = parseFloat(materialInput.quantity);
    const price = parseFloat(materialInput.price);
    const total = quantity * price;

    const updatedMaterials = [
      ...materials,
      {
        material: materialInput.material,
        quantity,
        price,
        total,
      },
    ];

    setMaterials(updatedMaterials);

    setMaterialInput({
      material: '',
      quantity: '',
      price: '',
    });
  };

  const handleDeleteMaterial = (index) => {
    const updatedMaterials = materials.filter((_, i) => i !== index);
    setMaterials(updatedMaterials);
  };

  const grandTotal = materials.reduce((acc, item) => acc + item.total, 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditing) {
      dispatch(
        updateMaterialsList({
          id: materialsList._id,
          materials,
          total: grandTotal
        })
      ).then((response) => {
        if (response.meta.requestStatus === 'fulfilled') {
          alert('Materials updated successfully!');
        } else {
          alert('Failed to update materials. Please try again.');
        }
      }
      );
    } else {
      // If not editing, create a new materials list
      if (materials.length === 0) {
        alert('Please add at least one material before submitting.');
        return;
      }
      if (grandTotal <= 0) {
        alert('Total must be greater than zero.');
        return;
      }
      // Dispatch the action to create materials list
      if (!proposalNumber) {
        alert('Proposal number is required to submit materials.');
        return;
      }
      if (materials.some(item => !item.material || item.quantity <= 0 || item.price <= 0)) {
        alert('Please ensure all fields are filled correctly.');
        return;
      }
      console.log('Creating new materials list');
      dispatch(
        createMaterialsList({
          proposal: proposalNumber,
          materials,
          total: grandTotal
        })
      ).then((response) => {

        if (response.meta.requestStatus === 'fulfilled') {
          alert('Materials submitted successfully!');
        } else {
          alert('Failed to submit materials. Please try again.');
        }
      });
    }
    navigate(-1); // Go back to the previous page
  };




  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Adding Materials to Proposal {proposalNumber}
      </Typography>
      <form onSubmit={handleAddMaterial} style={{ marginBottom: '1rem' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={7}>
            <Autocomplete
              freeSolo
              options={[...new Set(listOfMaterials.map((m) => m.name))]}
              value={materialInput.material}
              onChange={(event, newValue) => {
                const selectedMaterial = listOfMaterials.find(m => m.name === newValue);
                setMaterialInput({
                  ...materialInput,
                  material: newValue || '',
                  price: selectedMaterial ? selectedMaterial.price : '',
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Material"
                  name="material"
                  onChange={(e) => {
                    setMaterialInput({
                      ...materialInput,
                      material: e.target.value,

                    });
                  }}
                  required
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid item xs={6} md={1}>
            <TextField
              label="Quantity"
              name="quantity"
              type="number"
              value={materialInput.quantity}
              onChange={handleChange}
              required
              fullWidth
              inputProps={{ min: 0, step: 'any' }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              label="Price"
              name="price"
              type="number"
              value={materialInput.price}
              onChange={handleChange}
              required
              fullWidth
              inputProps={{ min: 0, step: 'any' }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button variant="contained" type="submit" fullWidth sx={{ marginBottom: '2px' }}>
              Add Material
            </Button>
          </Grid>
        </Grid>
      </form>

      {materials.length > 0 && (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Material</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map((item, index) => (
                <TableRow key={`${item.material}-${index}`}>
                  <TableCell>{item.material}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${parseFloat(item.price).toFixed(2)}</TableCell>
                  <TableCell>${parseFloat(item.total).toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDeleteMaterial(index)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right">
                  <strong>Grand Total:</strong>
                </TableCell>
                <TableCell>
                  <strong>${grandTotal.toFixed(2)}</strong>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            style={{ marginTop: '1rem', width: '100%' }}
          >
            Submit Materials
          </Button>
        </>
      )}
    </div>
  );
};

export default MaterialsListing;