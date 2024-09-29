import About from './views/About';
// Clients
import Clients from './views/Clients/Clients';
import ViewOneClient from './views/Clients/ViewOneClient';
import Financials from './views/Financials';
import Invoices from './views/Invoices';
import Proposals from './views/Proposals/Proposals';

export const routes = [
  {
    path: '/about',
    component: About,
  },
  {
    path: '/clients',
    component: Clients,
  },
  {
    path: '/clients/:id',
    component: ViewOneClient,
  },
  {
    path: '/financials',
    component: Financials,
  },
  {
    path: '/invoices',
    component: Invoices,
  },
  {
    path: '/proposals',
    component: Proposals,
  },
];
