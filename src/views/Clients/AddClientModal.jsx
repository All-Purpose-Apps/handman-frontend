import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import AddressAutocomplete from '../../components/AddressAutocomplete';

export default function AddClientModal({
    handleAddClient,
    openModal,
    handleCloseModal,
    newClientData = {
        givenName: '',
        middleName: '',
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
            address: address.address,
            streetAddress: address.streetAddress,
            city: address.city,
            state: address.state,
            zip: address.zip
        }).forEach(([name, value]) => {
            handleInputChange({ target: { name, value } });
        });
    };

    const isFormValid = () => {
        const { givenName = '', middleName = '', familyName = '', email = '', phone = '', address = '', streetAddress = '', city = '', state = '', zip = '' } = newClientData;

        return (
            selectedFromAutocomplete &&
            givenName.replace(/\s+/g, '') &&
            familyName.replace(/\s+/g, '') &&
            email.trim() &&
            phone.replace(/[\s().]/g, '') &&
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
                        padding: '10px 20px',
                        fontSize: '2rem',
                        lineHeight: 1,
                    }}
                    aria-label="Close"
                >
                    ×
                </Button>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                        Add New Client
                    </Typography>
                </Box>
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
                        label="Middle Name"
                        name="middleName"
                        value={newClientData.middleName}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
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
                        onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                            let formatted = raw;
                            if (raw.length > 6) {
                                formatted = `(${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6)}`;
                            } else if (raw.length > 3) {
                                formatted = `(${raw.slice(0, 3)}) ${raw.slice(3)}`;
                            } else if (raw.length > 0) {
                                formatted = `(${raw}`;
                            }
                            handleInputChange({ target: { name: 'phone', value: formatted } });
                        }}
                        inputProps={{ maxLength: 14 }}
                        fullWidth
                        margin="normal"
                        required
                    />

                    <AddressAutocomplete
                        value={newClientData.address}
                        onChange={handleAddressChange}
                        label="Address"
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