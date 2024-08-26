import React from 'react';
import { BrowserRouter as Router ,Routes, Route } from 'react-router-dom';
import Home from './pages/home';
// import Header from './components/Header';
import Login from './pages/(auth)/login';
import Settings from './pages/settings';
import Users from './pages/users';
import Workspace from './pages/workspace/index';
import CreateDryingPlan from './pages/workspace/create-drying-plan';
import Details from './pages/workspace/details';
import DryingWoodChecking from './pages/workspace/drying-wood-checking';
import Kiln from './pages/workspace/kiln';
import KilnChecking from './pages/workspace/kiln-checking';
import LoadIntoKiln from './pages/workspace/load-into-kiln';
import WoodSorting from './pages/workspace/wood-sorting';
import UserDetails from './pages/users/details';

const routes = [
  {
    path: '/',
    component: <Workspace/>,
    exact: true,
  },
  {
    path: '/login',
    component: <Login />,
    exact: true,
  },
  {
    path: '/workspace',
    component: <Workspace/>,
  },
  {
    path: '/users',
    component: <Users/>,
  },
  {
    path: '/settings',
    component: <Settings/>,
  },
  {
    path: '/workspace/wood-sorting',
    component: <WoodSorting />,
  },
  {
    path: '/workspace/kiln',
    component: <Kiln/>,
  },
  {
    path: '/workspace/load-into-kiln',
    component: <LoadIntoKiln />,
  },
  {
    path: '/workspace/drying-wood-checking',
    component: <DryingWoodChecking />,
  },
  {
    path: '/workspace/create-drying-plan',
    component: <CreateDryingPlan/>,
  },
  {
    path: '/workspace/kiln-checking',
    component: <KilnChecking/>,
  },
  {
    path: '/workspace/details',
    component: <Details/>,
  },
];

function AppRoutes() {
  return (
      <Router>
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={route.component}
              exact={route.exact}
            />
          ))}
        </Routes>     
      </Router>
  );
}

export default AppRoutes;