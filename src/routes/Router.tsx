import { Navigate } from 'react-router-dom';

const Router = [
  {
    path: '/',
    children: [
      { path: '/', element: <Navigate to="/home" /> },
      { path: '/home', element: <div>Welcome to Universal Profile App</div> },
      { path: '*', element: <Navigate to="/home" /> },
    ],
  },
];

export default Router;
