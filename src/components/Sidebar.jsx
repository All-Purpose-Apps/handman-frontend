
import { Link } from 'react-router-dom'; // Assuming you're using react-router for navigation
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Toolbar, Box } from '@mui/material';


import { routes } from '../routes'; // Import your routes

export default function Sidebar() {


    const listItem = (routes) => {
        return routes.map((route) => {
            if (route.sidebar == true) {
                return (
                    <ListItem button="true" component={Link} to={route.path} key={route.name}>
                        <ListItemIcon>
                            <route.icon />
                        </ListItemIcon>
                        <ListItemText primary={route.name} />
                    </ListItem>
                )
            }
        })
        if (route.sidebar == true) {
            return (
                <ListItem button="true" component={Link} to={route.path}>
                    <ListItemIcon>
                        <route.icon />
                    </ListItemIcon>
                    <ListItemText primary={route.name} />
                </ListItem>
            )
        }
    }

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

                    {listItem(routes)}

                </List>
                <Divider />
            </Box>
        </Drawer>
    );
}