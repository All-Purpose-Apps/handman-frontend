import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import PriceComparison from './PriceComparison';

const MaterialsListing = () => {
  const { id: proposalNumber } = useParams(); // Get proposal number from route
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);
  const [materialInput, setMaterialInput] = useState({
    material: '',
    quantity: '',
    price: '',
  });

  // Load materials associated with this proposal number
  useEffect(() => {
    const storedMaterials = JSON.parse(
      localStorage.getItem(`materials_${proposalNumber}`)
    ) || [];
    setMaterials(storedMaterials);
  }, [proposalNumber]);

  // Save materials to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      `materials_${proposalNumber}`,
      JSON.stringify(materials)
    );
  }, [materials, proposalNumber]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(-1); // Go back to the previous page
  };

  const [openModal, setOpenModal] = useState(false);

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleImportProduct = (product) => {
    const quantity = 1;
    const price = parseFloat(product.price);
    const total = quantity * price;

    const updatedMaterials = [
      ...materials,
      {
        material: product.name,
        quantity,
        price,
        total,
      },
    ];

    setMaterials(updatedMaterials);

    setOpenModal(false); // Close the modal after importing
  };

  const grandTotal = materials.reduce((acc, item) => acc + item.total, 0);

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Adding Materials to Proposal {proposalNumber}
      </Typography>
      <form onSubmit={handleAddMaterial} style={{ marginBottom: '1rem' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={7}>
            <TextField
              label="Material"
              name="material"
              value={materialInput.material}
              onChange={handleChange}
              required
              fullWidth
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
            {/* <Button variant="contained" onClick={() => setOpenModal(true)} fullWidth>
              Import Material
            </Button> */}
          </Grid>
        </Grid>
      </form>

      {materials.length > 0 && (
        <> q q
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
                <TableRow key={index}>
                  <TableCell>{item.material}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell>{item.total}</TableCell>
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
                  <strong>{grandTotal.toFixed(2)}</strong>
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
      <PriceComparison
        open={openModal}
        onClose={handleCloseModal}
        onImport={handleImportProduct}
      />
    </div>
  );
};

export default MaterialsListing;