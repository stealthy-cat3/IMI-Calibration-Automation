// frontend/src/pages/settings/ApplicationSettings.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Container,
  FormControlLabel,
  Switch,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  fetchSettings,
  updateDemoMode,
  updateDemoModeGeneralMarginError,
  updateThemeMode,
  updateNearMarginThreshold,
} from '../../store/settings/thunks';
import {
  selectIsDemoModeEnabled,
  selectDemoModeGeneralMarginError,
  selectThemeMode,
  selectNearMarginThreshold,
  selectSettingsLoading,
  selectSettingsError,
} from '../../store/settings/selectors';

// Styled Paper for consistent section styling
const SettingsSectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(5),
  },
  marginBottom: theme.spacing(4),
  borderRadius: 12,
  boxShadow: theme.shadows[3],
  backgroundColor: theme.palette.background.paper,
}));

const ApplicationSettings = () => {
  const dispatch = useDispatch();

  // Selectors for settings data and state
  const isDemoModeEnabled = useSelector(selectIsDemoModeEnabled);
  const demoModeGeneralMarginError = useSelector(selectDemoModeGeneralMarginError);
  const themeMode = useSelector(selectThemeMode);
  const nearMarginThreshold = useSelector(selectNearMarginThreshold);
  const isLoading = useSelector(selectSettingsLoading);
  const error = useSelector(selectSettingsError);

  // Fetch settings on component mount
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Handlers for updating settings
  const handleToggleDemoMode = (event) => {
    dispatch(updateDemoMode(event.target.checked));
  };

  const handleUpdateDemoModeGeneralMarginError = (event) => {
    const value = parseFloat(event.target.value);
    // Only dispatch if it's a valid number, otherwise keep current value
    if (!isNaN(value)) {
      dispatch(updateDemoModeGeneralMarginError(value));
    }
  };

  const handleThemeModeChange = (event) => {
    dispatch(updateThemeMode(event.target.value));
  };

  const handleUpdateNearMarginThreshold = (event) => {
    const value = parseFloat(event.target.value);
    // Only dispatch if it's a valid number
    if (!isNaN(value)) {
      dispatch(updateNearMarginThreshold(value));
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Error loading settings: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{ color: 'primary.main', mb: 3, fontWeight: 800, letterSpacing: '-0.5px' }}>
        Application Settings
      </Typography>

      <SettingsSectionPaper elevation={3}>
        <Typography variant="h6" component="h2" gutterBottom>
          Theme Settings
        </Typography>
        <FormControl fullWidth margin="normal" disabled={isLoading} sx={{ maxWidth: '300px' }}>
          <InputLabel id="theme-mode-label">Theme Mode</InputLabel>
          <Select
            labelId="theme-mode-label"
            value={themeMode || 'light'}
            onChange={handleThemeModeChange}
            label="Theme Mode"
          >
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
            <MenuItem value="dark-red">Dark Red</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Select the visual theme for the application.
        </Typography>
      </SettingsSectionPaper>

      <SettingsSectionPaper elevation={3}>
        <Typography variant="h6" component="h2" gutterBottom>
          Demo Mode Settings
        </Typography>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={isDemoModeEnabled}
                onChange={handleToggleDemoMode}
                name="demoModeToggle"
                color="secondary"
                disabled={isLoading}
              />
            }
            label="Enable Demo Mode"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {isDemoModeEnabled
              ? 'Demo Mode is active. Simulations will use configured error margins.'
              : 'Demo Mode is inactive. Live operations are reflected.'}
          </Typography>

          <TextField
            label="General Margin of Error for Demo Mode"
            type="number"
            value={demoModeGeneralMarginError}
            onChange={handleUpdateDemoModeGeneralMarginError}
            fullWidth
            margin="normal"
            variant="outlined"
            size="small"
            disabled={isLoading || !isDemoModeEnabled} // Disabled if loading or demo mode is off
            inputProps={{ step: "0.01", min: "0", max: "1" }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            helperText="Applies when specific template margins are not defined. Enter as a decimal (e.g., 0.05 for 5%)."
            sx={{ maxWidth: '300px' }}
          />
        </Stack>
      </SettingsSectionPaper>

      <SettingsSectionPaper elevation={3}>
        <Typography variant="h6" component="h2" gutterBottom>
          Visual Feedback Thresholds
        </Typography>
        <TextField
          label="'Near Margin' Indication Threshold"
          type="number"
          value={nearMarginThreshold}
          onChange={handleUpdateNearMarginThreshold}
          fullWidth
          margin="normal"
          variant="outlined"
          size="small"
          disabled={isLoading}
          inputProps={{ step: "0.01", min: "0", max: "1" }}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
          helperText="Threshold (as a decimal, e.g., 0.10 for 10%) at which a measurement is considered 'near margin' and typically indicated by an orange color."
          sx={{ maxWidth: '300px' }}
        />
      </SettingsSectionPaper>
    </Container>
  );
};

export default ApplicationSettings;