import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button, Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
    sigCanvas: {
        border: '1px solid #000',
        width: '100%',
        height: 200,
    },
});

const Signature = () => {
    const classes = useStyles();
    const sigCanvas = useRef({});

    const handleClearSignature = () => {
        sigCanvas.current.clear();
    };

    return (
        <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 2 }}>

            <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                minWidth={4}
                maxWidth={4}
                canvasProps={{ className: classes.sigCanvas }}
            />
            <Button
                variant="outlined"
                color="secondary"
                onClick={handleClearSignature}
                sx={{ mt: 1 }}
            >
                Clear Signature
            </Button>
            <Button
                variant="contained"
                color="primary"
                onClick={() => {
                    const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
                    console.log(dataURL); // You can handle the data URL as needed
                }}
                sx={{ mt: 1, ml: 1 }}
            >
                Save Signature
            </Button>
        </Box>
    );
};

export default Signature;   