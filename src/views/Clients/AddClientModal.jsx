import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import AddressAutocomplete from '../../components/AddressAutocomplete';

export default function AddClientModal({
    handleAddClient,
    openModal,
    handleCloseModal,
    newClientData = { givenName: '', familyName: '', email: '', phone: '', address: '' },
    handleInputChange
}) {
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
    };

    const handleAddressChange = (address) => {
        handleInputChange({
            target: {
                name: 'address',
                value: address,
            },
        });
    };

    const isFormValid = () => {
        const { givenName = '', familyName = '', email = '', phone = '', address = '' } = newClientData;

        return (
            givenName.trim() &&
            familyName.trim() &&
            email.trim() &&
            phone.trim() &&
            address.trim()
        );
    };

    return (
        <Modal open={openModal} onClose={handleCloseModal}>
            <Box sx={modalStyle}>
                <Typography variant="h6" component="h2" gutterBottom>
                    Add New Client
                </Typography>
                <form onSubmit={handleAddClient}>
                    <TextField
                        label="First Name"
                        name="givenName"
                        value={newClientData.givenName}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Last Name"
                        name="familyName"
                        value={newClientData.familyName}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={newClientData.email}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Phone"
                        name="phone"
                        value={newClientData.phone}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                    />

                    <AddressAutocomplete
                        value={newClientData.address}
                        onChange={handleAddressChange}
                    />

                    {isFormValid() && (
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            style={{ marginTop: 16 }}
                        >
                            Save
                        </Button>
                    )}
                </form>
            </Box>
        </Modal>
    );
}