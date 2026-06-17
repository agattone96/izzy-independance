import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { BoardProvider } from '../store';
import { ScrollToTop } from '../components/utils/ScrollToTop';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <BoardProvider>
        {children}
      </BoardProvider>
    </BrowserRouter>
  );
};
