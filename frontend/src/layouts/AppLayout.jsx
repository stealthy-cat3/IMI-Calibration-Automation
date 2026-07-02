// frontend/src/layouts/AppLayout.jsx
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Box, Typography, Tabs, Tab } from '@mui/material';

const AppLayout = () => {
  const location = useLocation();

  const navLinks = [
    { path: '/analytics', label: 'Analytics Dashboard' },
    { path: '/calibration/instruments', label: 'Calibration' },
    { path: '/templates', label: 'Templates' },
    { path: '/uncertainty/formulas', label: 'MU Formulas' },
    { path: '/reports/settings', label: 'Report Settings' },
    { path: '/settings', label: 'Application Settings' }
  ];

  // Determine active tab by matching the current URL path
  const matchedIndex = navLinks.findIndex(link => location.pathname.startsWith(link.path));

  return (
    <div className="min-h-screen bg-brand-bg text-gray-100 font-sans flex flex-col pb-10">
      <header className="sticky top-0 z-50 bg-brand-panel/80 backdrop-blur-md border-b border-brand-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <Typography variant="h5" component="h1" className="font-display font-bold tracking-tight text-white m-0">
            CMIS UIUX
          </Typography>
        </div>
      </header>

      <div className="flex flex-col flex-grow max-w-7xl mx-auto w-full">
        <nav className="w-full flex-shrink-0 border-b border-brand-border bg-brand-panel flex flex-col px-4 pt-2">
          <Tabs
            variant="scrollable"
            scrollButtons="auto"
            value={matchedIndex !== -1 ? matchedIndex : false}
            className="w-full"
            TabIndicatorProps={{ style: { backgroundColor: '#f59e0b' } }}
          >
            {navLinks.map((link) => (
              <Tab
                key={link.path}
                label={link.label}
                component={Link}
                to={link.path}
                className="text-xs font-medium text-gray-400 min-w-0 px-4 py-3"
                sx={{
                  color: 'text.secondary',
                  '&.Mui-selected': { color: '#f59e0b', fontWeight: 'bold' }
                }}
              />
            ))}
          </Tabs>
        </nav>

        <main className="flex-grow p-4 lg:p-8 overflow-y-auto">
          <Outlet /> 
        </main>
      </div>

<Box
        component="footer"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          borderTop: '1px solid #1E2943',
          backgroundColor: '#131A2D',
          py: 1,
          textAlign: 'center',
          fontSize: '10px',
          color: '#6b7280',
          fontFamily: 'monospace',
          zIndex: 50,
        }}
      >
        &copy; {new Date().getFullYear()} Cognitive Metrology Intelligence Service
      </Box>
    </div>
  );
};

export default AppLayout;