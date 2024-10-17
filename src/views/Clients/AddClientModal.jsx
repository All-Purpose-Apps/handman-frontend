import { Box, Button, Modal, TextField, Typography } from '@mui/material';

export default function AddClientModal({
    handleAddClient,
    openModal,
    handleCloseModal,
    newClientData,
    handleInputChange }) {
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
    return (<Modal open={openModal} onClose={handleCloseModal}>
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
                <TextField
                    label="Address"
                    name="address"
                    value={newClientData.address}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="City"
                    name="city"
                    value={newClientData.city}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="State"
                    name="state"
                    value={newClientData.state}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Zip"
                    name="zip"
                    value={newClientData.zip}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Status"
                    name="status"
                    value={newClientData.status}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    style={{ marginTop: 16 }}
                >
                    Save
                </Button>
            </form>
        </Box>
    </Modal>)
}