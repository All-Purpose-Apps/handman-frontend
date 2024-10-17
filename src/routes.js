import About from './views/About';
// Clients
import Clients from './views/Clients/Clients';
import ViewOneClient from './views/Clients/ViewOneClient';
import Financials from './views/Financials';
import Invoices from './views/Invoices/Invoices';
import Proposals from './views/Proposals/Proposals';
import Calendar from './views/Calendar';
import Dashboard from './views/Dashboard';

import {
  Home as HomeIcon,
  Info as InfoIcon,
  Favorite as FavoriteIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Description as DescriptionIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import ViewOneInvoice from './views/Invoices/ViewOneInvoice';

export const routes = [
  {
    path: '/',
    component: Dashboard,
    name: 'Dashboard',
    sidebar: true,
    icon: HomeIcon,
    protected: true,
  },
  {
    path: '/clients',
    component: Clients,
    name: 'Clients',
    sidebar: true,
    icon: PeopleIcon,
    protected: true,
  },
  {
    path: '/clients/:id',
    component: ViewOneClient,
    protected: true,
  },
  {
    path: '/financials',
    component: Financials,
    name: 'Financials',
    sidebar: true,
    icon: AttachMoneyIcon,
    protected: true,
  },
  {
    path: '/invoices',
    component: Invoices,
    name: 'Invoices',
    sidebar: true,
    icon: ReceiptIcon,
    protected: true,
  },
  {
    path: '/invoices/:id',
    component: ViewOneInvoice,
    protected: true,
  },
  {
    path: '/proposals',
    component: Proposals,
    name: 'Proposals',
    sidebar: true,
    icon: DescriptionIcon,
    protected: true,
  },
  {
    path: '/calendar',
    component: Calendar,
    name: 'Calendar',
    sidebar: true,
    icon: FavoriteIcon,
    protected: true,
  },
  {
    path: '/about',
    component: About,
    name: 'About',
    sidebar: true,
    icon: InfoIcon,
    protected: true,
  },
];
