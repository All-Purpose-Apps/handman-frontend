//Icons
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DescriptionIcon from '@mui/icons-material/Description';
import FileIcon from '@mui/icons-material/FileCopy';
import SettingsIcon from '@mui/icons-material/Settings';
//Views
import Clients from './views/Clients/Clients';
import ViewOneClient from './views/Clients/ViewOneClient';
import Invoices from './views/Invoices/Invoices';
import Proposals from './views/Proposals/Proposals';
import ViewOneProposal from './views/Proposals/ViewOneProposal';
import Dashboard from './views/Dashboard';
import Settings from './views/Settings';
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
    path: '/proposal/:id/materials-list',
    component: MaterialsListing,
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
