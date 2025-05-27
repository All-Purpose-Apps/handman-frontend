import About from './views/About';
// Clients
import Clients from './views/Clients/Clients';
import ViewOneClient from './views/Clients/ViewOneClient';

import Invoices from './views/Invoices/Invoices';
import Proposals from './views/Proposals/Proposals';
import ViewOneProposal from './views/Proposals/ViewOneProposal';
import Calendar from './views/Calendar';
import Dashboard from './views/Dashboard';
import SignDocument from './views/User/SignDocument';
import Settings from './views/Settings';

import {
  Home as HomeIcon,
  Info as InfoIcon,
  Favorite as FavoriteIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Description as DescriptionIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarMonth as CalendarMonthIcon,
} from '@mui/icons-material';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewOneInvoice from './views/Invoices/ViewOneInvoice';
import MaterialsListing from './views/Proposals/MaterialsListing';
import AddProposalForm from './views/Proposals/AddProposalForm';

export const routes = [
  {
    path: '/dashboard',
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
    path: '/proposals',
    component: Proposals,
    name: 'Proposals',
    sidebar: true,
    icon: DescriptionIcon,
    protected: true,
  },
  {
    path: '/proposals/new',
    component: AddProposalForm,
    protected: true,
  },
  {
    path: '/proposals/:id',
    component: ViewOneProposal,
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
    path: '/settings',
    component: Settings,
    name: 'Settings',
    sidebar: true,
    icon: SettingsIcon,
    protected: true,
  },
  {
    path: '/proposal/:id/materials-list',
    component: MaterialsListing,
    protected: true,
  },
  // {
  //   path: '/calendar',
  //   component: Calendar,
  //   name: 'Calendar',
  //   sidebar: true,
  //   icon: CalendarMonthIcon,
  //   protected: true,
  // },
  // {
  //   path: '/about',
  //   component: About,
  //   name: 'About',
  //   sidebar: true,
  //   icon: InfoIcon,
  //   protected: true,
  // },
];
