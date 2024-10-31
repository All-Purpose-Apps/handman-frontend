import React from 'react'
import { TextField, Typography, Box, Button, Modal, Paper, Grid, Autocomplete, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material'

export default function AddInvoiceModal({
    openModal,
    setOpenModal,
    newInvoiceData,
    handleInputChange,
    handleClientChange,
    handleItemChange,
    handleDeleteItem,
    handleAddItem,
    handleAddInvoice,
    clients }) {
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        maxHeight: '80vh',
        overflowY: 'auto',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
    };
    return (
        <Modal
            open={openModal}
            onClose={() => setOpenModal(false)}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Paper sx={modalStyle}>
                <Typography
                    id="modal-title"
                    variant="h6"
                    component="h2"
                    gutterBottom
                >
                    Add New Invoice
                </Typography>
                <form onSubmit={handleAddInvoice}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="h6">
                                Invoice Number: {newInvoiceData.invoiceNumber}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Invoice Date"
                                name="invoiceDate"
                                type="date"
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                value={newInvoiceData.invoiceDate}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                options={clients}
                                getOptionLabel={(client) =>
                                    `${client.name}`
                                }
                                value={newInvoiceData.client}
                                onChange={handleClientChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Client"
                                        margin="normal"
                                        required
                                    />
                                )}
                            />
                        </Grid>
                        {/* Items */}
                        <Grid item xs={12}>
                            <Typography variant="h6">Items</Typography>
                            {newInvoiceData.items.map((item, index) => (
                                <Grid
                                    container
                                    spacing={2}
                                    key={index}
                                    alignItems="center"
                                >
                                    <Grid item xs={12} sm={5}>
                                        <TextField
                                            label="Description"
                                            value={item.description}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    'description',
                                                    e.target.value
                                                )
                                            }
                                            fullWidth
                                            margin="normal"
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={5}>
                                        <TextField
                                            label="Price"
                                            type="number"
                                            value={item.price}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    'price',
                                                    e.target.value
                                                )
                                            }
                                            fullWidth
                                            margin="normal"
                                            required
                                        />
                                    </Grid>
                                    {newInvoiceData.items.length > 1 && (
                                        <Grid item xs={12} sm={2}>
                                            <IconButton
                                                aria-label="delete"
                                                onClick={() =>
                                                    handleDeleteItem(index)
                                                }
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Grid>
                                    )}
                                </Grid>
                            ))}
                            {newInvoiceData.items.length < 5 && (
                                <Button
                                    variant="contained"
                                    onClick={handleAddItem}
                                >
                                    Add Item
                                </Button>
                            )}
                        </Grid>
                        {/* Subtotal 1 */}
                        <Grid item xs={12}>
                            <Typography variant="h6">
                                Subtotal 1: ${newInvoiceData.subTotal1.toFixed(2)}
                            </Typography>
                        </Grid>
                        {/* Extra Work/Materials */}
                        <Grid item xs={12}>
                            <TextField
                                label="Extra Work/Materials"
                                name="extraWorkMaterials"
                                type="number"
                                fullWidth
                                value={newInvoiceData.extraWorkMaterials}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        {/* Subtotal 2 */}
                        <Grid item xs={12}>
                            <Typography variant="h6">
                                Subtotal 2: ${newInvoiceData.subTotal2.toFixed(2)}
                            </Typography>
                        </Grid>
                        {/* Payment Method */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="payment-method-label">
                                    Payment Method
                                </InputLabel>
                                <Select
                                    labelId="payment-method-label"
                                    name="paymentMethod"
                                    value={newInvoiceData.paymentMethod}
                                    label="Payment Method"
                                    onChange={handleInputChange}
                                >
                                    <MenuItem value="awaiting payment">
                                        Awaiting Payment
                                    </MenuItem>
                                    <MenuItem value="cash">Cash</MenuItem>
                                    <MenuItem value="check">Check</MenuItem>
                                    <MenuItem value="credit/debit">
                                        Credit/Debit
                                    </MenuItem>
                                    <MenuItem value="online">Online</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        {/* Check Number (if payment method is check) */}
                        {newInvoiceData.paymentMethod === 'check' && (
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Check Number"
                                    name="checkNumber"
                                    fullWidth
                                    value={newInvoiceData.checkNumber}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                        )}
                        {/* Credit Card Fee */}
                        {newInvoiceData.paymentMethod === 'credit/debit' && (
                            <Grid item xs={12}>
                                <Typography variant="h6">
                                    Credit Card Fee (3%): $
                                    {newInvoiceData.creditCardFee.toFixed(2)}
                                </Typography>
                            </Grid>
                        )}
                        {/* Deposit/Adjustment */}
                        <Grid item xs={12}>
                            <TextField
                                label="Deposit/Adjustment"
                                name="depositAdjustment"
                                type="number"
                                fullWidth
                                value={newInvoiceData.depositAdjustment}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        {/* Total */}
                        <Grid item xs={12}>
                            <Typography variant="h6">
                                Total: ${newInvoiceData.total.toFixed(2)}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Box
                        display="flex"
                        justifyContent="flex-end"
                        marginTop={2}
                    >
                        <Button
                            onClick={() => setOpenModal(false)}
                            color="secondary"
                            sx={{ marginRight: 2 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            Submit
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Modal>
    )
}
