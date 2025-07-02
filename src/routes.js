import About from './views/About';
// Clients
import Clients from './views/Clients/Clients';
import ViewOneClient from './views/Clients/ViewOneClient';

import Invoices from './views/Invoices/Invoices';
import Proposals from './views/Proposals/Proposals';
import ViewOneProposal from './views/Proposals/ViewOneProposal';
import Dashboard from './views/Dashboard';
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
  FileCopy as FileIcon,
} from '@mui/icons-material';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewOneInvoice from './views/Invoices/ViewOneInvoice';
import MaterialsListing from './views/Proposals/MaterialsListing';
import AddProposalForm from './views/Proposals/AddProposalForm';
import FilesExplore from './views/FilesExplorer';

export const routes = [
  {
    path: '/',
    component: Dashboard,
    name: 'Dashboard',
    sidebar: true,
    icon: HomeIcon,
  },

  {
    path: '/clients',
    component: Clients,
    name: 'Clients',
    sidebar: true,
    icon: PeopleIcon,
  },
  {
    path: '/clients/:id',
    component: ViewOneClient,
  },
  {
    path: '/proposals',
    component: Proposals,
    name: 'Proposals',
    sidebar: true,
    icon: DescriptionIcon,
  },
  {
    path: '/proposals/new',
    component: AddProposalForm,
  },
  {
    path: '/proposals/:id',
    component: ViewOneProposal,
  },
  {
    path: '/invoices',
    component: Invoices,
    name: 'Invoices',
    sidebar: true,
    icon: ReceiptIcon,
  },
  {
    path: '/invoices/:id',
    component: ViewOneInvoice,
  },
  {
    path: '/proposal/:id/materials-list',
    component: MaterialsListing,
  },
  {
    path: '/files',
    component: FilesExplore,
    name: 'Files',
    sidebar: true,
    icon: FileIcon,
  },
  {
    path: '/settings',
    component: Settings,
    name: 'Settings',
    sidebar: true,
    icon: SettingsIcon,
  },
];
