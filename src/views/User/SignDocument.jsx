import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useParams } from 'react-router-dom';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import {
    Button,
    Box,
    Typography,
    CircularProgress,
    Alert,
    AlertTitle,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import SignatureCanvas from 'react-signature-canvas';
import { makeStyles } from '@mui/styles';
import axios from 'axios';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const useStyles = makeStyles({
    sigCanvas: {
        border: '1px solid #000',
        width: '100%',
        height: 200,
    },
});

const SignDocument = () => {
    const { token } = useParams();
    const classes = useStyles();
    const sigCanvas = useRef({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [tokenInfo, setTokenInfo] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [signedPdfUrl, setSignedPdfUrl] = useState('');

    // Add theme and media query hooks
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/invoices/verify-token`,
                    { token }
                );
                setTokenInfo(response.data);
            } catch (err) {
                try {
                    const response = await axios.post(
                        `${import.meta.env.VITE_BACKEND_URL}/api/proposals/verify-token`,
                        { token }
                    );
                    setTokenInfo(response.data);
                } catch (error) {
                    console.error(error);
                    setError('Invalid or expired token.');
                }
            }
        };
        fetchToken();
    }, [token]);

    const handleClearSignature = () => {
        sigCanvas.current.clear();
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        const signatureData = sigCanvas.current.toDataURL('image/png');

        const isInvoice = !!tokenInfo.invoiceId;
        const pdfUrl = isInvoice
            ? `${import.meta.env.VITE_BACKEND_URL}/api/invoices/download-pdf/url?${tokenInfo.invoiceUrl}`
            : `${import.meta.env.VITE_BACKEND_URL}/api/proposals/download-pdf/url?${tokenInfo.proposalUrl}`;

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/${isInvoice ? 'invoices' : 'proposals'}/upload-pdf-with-signature`,
                {
                    pdfUrl,
                    signatureImage: signatureData,
                    invoiceNumber: isInvoice ? tokenInfo.invoiceNumber : undefined,
                    invoiceId: isInvoice ? tokenInfo.invoiceId : undefined,
                    proposalNumber: !isInvoice ? tokenInfo.proposalNumber : undefined,
                    proposalId: !isInvoice ? tokenInfo.proposalId : undefined,
                }
            );

            const { url } = response.data;

            setSignedPdfUrl(url);
            setShowAlert(true);
        } catch (err) {
            setError('Failed to upload signed PDF.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (error) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!tokenInfo) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (tokenInfo.revoked) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <Alert severity="error">This token has been revoked.</Alert>
            </Box>
        );
    }

    const isInvoice = !!tokenInfo.invoiceId;
    const pdfFileUrl = isInvoice
        ? `${import.meta.env.VITE_BACKEND_URL}/api/invoices/download-pdf/url?${tokenInfo.invoiceUrl}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/proposals/download-pdf/url?${tokenInfo.proposalUrl}`;

    return (
        <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 2 }}>
            {showAlert ? (
                // Success message with link to signed document
                <Alert severity="success" sx={{ mb: 2 }}>
                    <AlertTitle>Document Signed Successfully</AlertTitle>
                    Your document has been signed. You can open it{' '}
                    <a href={signedPdfUrl} target="_blank" rel="noopener noreferrer">
                        here
                    </a>
                    .
                </Alert>
            ) : (
                // Signing interface
                <>
                    <Typography variant="h4" gutterBottom>
                        Sign Document
                    </Typography>

                    {error && (
                        <Alert
                            severity="error"
                            onClose={() => setError(null)}
                            sx={{ mb: 2 }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* PDF Viewer */}
                    <Box
                        sx={{
                            border: '1px solid #ccc',
                            marginBottom: 2,
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <Document
                            file={pdfFileUrl}
                            error={<div>Failed to load PDF</div>}
                            loading={<div>Loading PDF...</div>}
                        >
                            <Page
                                pageNumber={1}
                                renderTextLayer={false}
                                width={isSmallScreen ? 300 : 600}
                            />
                        </Document>
                    </Box>

                    {/* Signature Canvas */}
                    <Box sx={{ marginBottom: 2 }}>
                        <Typography variant="h6">Provide Signature</Typography>
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
                    </Box>

                    {/* Submit Button */}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
                    </Button>
                </>
            )}
        </Box>
    );
};

export default SignDocument;