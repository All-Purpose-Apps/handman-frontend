import React, { useState } from "react";
import {
    isRouteErrorResponse,
    useRouteError,
    Link
} from "react-router";
import {
    Box,
    Button,
    Typography,
    Collapse,
    Paper,
    Stack,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';


export default function NotFoundPage() {
    const error = useRouteError();
    const [showDetails, setShowDetails] = useState(false);

    let title = "404 - Page Not Found";
    let message = "";
    let stack = "";

    if (isRouteErrorResponse(error)) {
        message = error.data;
    } else if (error instanceof Error) {
        message = error.message;
        stack = error.stack;
    }

    return (
        <Box
            minHeight="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="background.default"
            padding={4}
        >
            <Paper elevation={3} sx={{ padding: 4, maxWidth: 600, width: "100%" }}>
                <Typography variant="h4" gutterBottom color="text.primary">
                    {title}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Sorry, the page you’re looking for doesn’t exist or has been moved.
                </Typography>

                {(message || stack) && (
                    <>
                        <Button
                            onClick={() => setShowDetails(!showDetails)}
                            startIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            sx={{ mt: 2 }}
                        >
                            {showDetails ? "Hide Technical Details" : "Show Technical Details"}
                        </Button>
                        <Collapse in={showDetails}>
                            <Box mt={2}>
                                {message && (
                                    <>
                                        <Typography variant="subtitle2">Message:</Typography>
                                        <Typography variant="body2">{message}</Typography>
                                    </>
                                )}
                                {stack && (
                                    <>
                                        <Typography variant="subtitle2" mt={2}>Stack Trace:</Typography>
                                        <Box
                                            component="pre"
                                            sx={{
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word",
                                                bgcolor: "#f5f5f5",
                                                padding: 2,
                                                borderRadius: 1,
                                                maxHeight: 300,
                                                overflow: "auto",
                                            }}
                                        >
                                            {stack}
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </Collapse>
                    </>
                )}

                <Stack direction="row" spacing={2} mt={4}>
                    <Button
                        variant="outlined"
                        startIcon={<HomeIcon />}
                        component={Link}
                        to="/dashboard"
                    >
                        Go Home
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}