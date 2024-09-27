
import { Link } from 'react-router-dom'; // Assuming you're using react-router for navigation
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Toolbar, Box } from '@mui/material';
import {
    Home as HomeIcon,
    Info as InfoIcon,
    Favorite as FavoriteIcon,
    People as PeopleIcon,
    Receipt as ReceiptIcon,
    Description as DescriptionIcon,
    AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
export default function Sidebar() {
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 240,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: 240,
                    boxSizing: 'border-box',
                },
                display: { xs: 'none', sm: 'block' },
            }}
        >
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    <ListItem>
                        <ListItemText primary="Menu" />
                    </ListItem>
                    <Divider />
                    {/* Home */}
                    <ListItem button="true" component={Link} to="/">
                        <ListItemIcon>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItem>

                    {/* Clients */}
                    <ListItem button="true" component={Link} to="/clients">
                        <ListItemIcon>
                            <PeopleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Clients" />
                    </ListItem>

                    {/* Invoices */}
                    <ListItem button="true" component={Link} to="/invoices">
                        <ListItemIcon>
                            <ReceiptIcon />
                        </ListItemIcon>
                        <ListItemText primary="Invoices" />
                    </ListItem>

                    {/* Proposals */}
                    <ListItem button="true" component={Link} to="/proposals">
                        <ListItemIcon>
                            <DescriptionIcon />
                        </ListItemIcon>
                        <ListItemText primary="Proposals" />
                    </ListItem>

                    {/* Financials */}
                    <ListItem button="true" component={Link} to="/financials">
                        <ListItemIcon>
                            <AttachMoneyIcon />
                        </ListItemIcon>
                        <ListItemText primary="Financials" />
                    </ListItem>
                    {/* About */}
                    <ListItem button="true" component={Link} to="/about">
                        <ListItemIcon>
                            <InfoIcon />
                        </ListItemIcon>
                        <ListItemText primary="About" />
                    </ListItem>

                </List>
                <Divider />
                {/* Add more sidebar items here */}
            </Box>
        </Drawer>
    );
}