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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <Box component="header" sx={{ bgcolor: 'background.paper', p: 2, borderBottom: 1, borderColor: 'divider', boxShadow: 1, zIndex: 1 }}>
        <Typography variant="h5" component="h1" sx={{ m: 0 }}>Application Header</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Box component="nav" sx={{ bgcolor: 'background.paper', width: 250, borderRight: 1, borderColor: 'divider', boxShadow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" component="h2" sx={{ p: 2, pb: 1, mt: 0, mb: 0, color: 'text.secondary' }}>Navigation</Typography>
          <Tabs
            orientation="vertical"
            variant="standard"
            value={matchedIndex !== -1 ? matchedIndex : false}
            sx={{ width: '100%', mt: 1, borderRight: 1, borderColor: 'divider', flexGrow: 1 }}
          >
            {navLinks.map((link) => (
              <Tab
                key={link.path}
                label={link.label}
                component={Link}
                to={link.path}
                sx={{ alignItems: 'flex-start', textAlign: 'left', pl: 3 }}
              />
            ))}
          </Tabs>
        </Box>
        <Box component="main" sx={{ flexGrow: 1, p: 4, overflowY: 'auto' }}>
          <Outlet /> {/* This is where nested routes will render */}
        </Box>
      </Box>
      <Box component="footer" sx={{ bgcolor: 'background.paper', p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">&copy; 2023 Calibration Management System</Typography>
      </Box>
    </Box>
  );
};

export default AppLayout;