import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { store } from './store';
import { router } from './routes';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </Provider>
  </StrictMode>
);
