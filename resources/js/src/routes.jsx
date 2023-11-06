import React from 'react';
import { BrowserRouter as Router ,Routes, Route } from 'react-router-dom';
import Home from './pages/home';
// import Header from './components/Header';
import Login from './pages/(auth)/login';
import Settings from './pages/settings';
import Users from './pages/users';
import Workspace from './pages/workspace/index';

const routes = [
  {
    path: '/',
    component: <Home/>,
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
    path: '/workspace/word-sorting',
    component: <Settings/>,
  },
  {
    path: '/workspace/kiln',
    component: <Settings/>,
  },
  {
    path: '/workspace/load-into-kiln',
    component: <Settings/>,
  },
  {
    path: '/workspace/drying-wood-checking',
    component: <Settings/>,
  },
  {
    path: '/workspace/create',
    component: <Settings/>,
  },
  {
    path: '/workspace/kiln-checking',
    component: <Settings/>,
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