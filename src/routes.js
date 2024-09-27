import About from './views/About';
import Clients from './views/Clients';
import Financials from './views/Financials';
import Invoices from './views/Invoices';
import Proposals from './views/Proposals';

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
