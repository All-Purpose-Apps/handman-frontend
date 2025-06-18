import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import AddressAutocomplete from '../../components/AddressAutocomplete';

export default function AddClientModal({
    handleAddClient,
    openModal,
    handleCloseModal,
    newClientData = {
        givenName: '',
        familyName: '',
        email: '',
        phone: '',
        address: '',
        streetAddress: '',
        city: '',
        state: '',
        zip: ''
    },
    handleInputChange
}) {
    const [selectedFromAutocomplete, setSelectedFromAutocomplete] = useState(false);

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

    const handleAddressChange = (address, isValidSelection) => {
        setSelectedFromAutocomplete(isValidSelection);
        Object.entries({
            address: address.fullAddress,
            streetAddress: address.streetAddress,
            city: address.city,
            state: address.state,
            zip: address.zip
        }).forEach(([name, value]) => {
            handleInputChange({ target: { name, value } });
        });
    };

    const isFormValid = () => {
        const { givenName = '', familyName = '', email = '', phone = '', address = '', streetAddress = '', city = '', state = '', zip = '' } = newClientData;

        return (
            selectedFromAutocomplete &&
            givenName.trim() &&
            familyName.trim() &&
            email.trim() &&
            phone.trim() &&
            address.trim() &&
            streetAddress.trim() &&
            city.trim() &&
            state.trim() &&
            zip.trim()
        );
    };

    return (
        <Modal
            open={openModal}
            onClose={handleCloseModal}
        >
            <Box sx={modalStyle}>
                <Button
                    onClick={handleCloseModal}
                    style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        minWidth: 'auto',
                        padding: '6px 10px',
                        fontSize: '2rem',
                        lineHeight: 1,
                    }}
                >
                    ×
                </Button>
                <Typography variant="h6" component="h2" gutterBottom>
                    Add New Client
                </Typography>
                <form
                    onSubmit={handleAddClient}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                        }
                    }}
                >
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