import React from 'react';
import { Grid, TextField, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const ProposalItem = ({ item, index, onChange, onDelete, canDelete }) => (
    <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={5}>
            <TextField
                label="Description"
                value={item.description}
                onChange={(e) => onChange(index, 'description', e.target.value)}
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
                onChange={(e) => onChange(index, 'regularPrice', e.target.value)}
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
                onChange={(e) => onChange(index, 'discountPrice', e.target.value)}
                fullWidth
                margin="normal"
                required
            />
        </Grid>
        {canDelete && (
            <Grid item xs={12} sm={1}>
                <IconButton aria-label="delete" onClick={() => onDelete(index)}>
                    <DeleteIcon />
                </IconButton>
            </Grid>
        )}
    </Grid>
);

export default ProposalItem;