import { AppBar, IconButton, Toolbar, Typography } from '@mui/material'
import {
    Menu as MenuIcon,
} from '@mui/icons-material';

export default function Topbar() {
    return (
        <AppBar
            position="fixed"
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    edge="start"
                    sx={{ mr: 2, display: { sm: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div">
                    Han-D-Man Pro
                </Typography>
            </Toolbar>
        </AppBar>
    )
}
