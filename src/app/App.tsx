import React from 'react';
import { AppProviders } from './AppProviders';
import { AppRoutes } from './routes';

const App = () => {
    return (
        <AppProviders>
            <AppRoutes />
        </AppProviders>
    );
};
export default App;
