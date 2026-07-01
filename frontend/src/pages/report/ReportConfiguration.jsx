// frontend/src/pages/report/ReportConfiguration.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Snackbar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SaveIcon from '@mui/icons-material/Save';

import {
  fetchReportConfig,
  updateReportConfig,
} from '../../store/report/thunks';
import {
  getReportConfig,
  getReportConfigLoading,
  getReportConfigError,
} from '../../store/report/selectors';

// Component Checklist:
// [x] Page Title (Typography)
// [x] Loading Indicator (CircularProgress)
// [x] Error Message (Alert)
// [x] Form Layout (Container, Box, Paper, Stack)
// [x] Front Page Settings Section:
//     [x] Display currently enabledFields.
//     [x] Group fields by category using Accordion.
//     [x] For each field, allow toggling its "enabled" status (Switch). If unchecked, it will be removed from the list when saving.
//     [x] For each field, allow reordering (Up/Down Buttons).
//     [x] Display label and type for each field.
// [x] Data Sheet Settings Section:
//     [x] includeMeasurementUncertaintySummary (Switch) (US-032)
//     [x] groupDataByMeasurementCategory (Switch)
//     [x] autoPaginateLongDataSheets (Switch)
//     [x] includePassFailIndicators (Switch)
// [x] Save Button (Button)
// [x] Snackbar for feedback (Snackbar, Alert)

const ReportConfiguration = () => {
  const dispatch = useDispatch();
  const reportConfig = useSelector(getReportConfig);
  const loading = useSelector(getReportConfigLoading);
  const error = useSelector(getReportConfigError);

  const [formData, setFormData] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    dispatch(fetchReportConfig());
  }, [dispatch]);

  useEffect(() => {
    if (reportConfig) {
      // Deep copy the reportConfig to local formData state
      setFormData(JSON.parse(JSON.stringify(reportConfig)));
    }
  }, [reportConfig]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleChangeDataSheetSetting = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      dataSheetSettings: {
        ...prev.dataSheetSettings,
        [field]: event.target.checked,
      },
    }));
  };

  const handleToggleFrontPageField = (fieldId, isChecked) => {
    setFormData((prev) => {
      const currentEnabledFields = prev.frontPageSettings.enabledFields;
      let newEnabledFields;

      if (isChecked) {
        // Find the original field from reportConfig to add it back,
        // or just re-enable if it was marked as disabled in a local copy.
        // For simplicity, if it's being "re-enabled", it was likely just unticked locally.
        // If we needed to add fields not originally present, we'd need a master list.
        // Given the fixture, we're only enabling/disabling fields that *were* in the fetched config.
        const originalField = reportConfig.frontPageSettings.enabledFields.find(f => f.id === fieldId);
        if (originalField && !currentEnabledFields.find(f => f.id === fieldId)) {
          newEnabledFields = [...currentEnabledFields, originalField];
        } else {
            newEnabledFields = currentEnabledFields; // Field already exists, no change
        }
      } else {
        newEnabledFields = currentEnabledFields.filter(
          (field) => field.id !== fieldId
        );
      }
      return {
        ...prev,
        frontPageSettings: {
          ...prev.frontPageSettings,
          enabledFields: newEnabledFields,
        },
      };
    });
  };

  const handleReorderFrontPageField = (fieldId, direction) => {
    setFormData((prev) => {
      const currentFields = [...prev.frontPageSettings.enabledFields];
      const index = currentFields.findIndex((field) => field.id === fieldId);

      if (index === -1) return prev; // Should not happen
      let newIndex = index;

      if (direction === 'up') {
        newIndex = Math.max(0, index - 1);
      } else if (direction === 'down') {
        newIndex = Math.min(currentFields.length - 1, index + 1);
      }

      if (newIndex === index) return prev; // No change

      const [removed] = currentFields.splice(index, 1);
      currentFields.splice(newIndex, 0, removed);

      // Update the order property to reflect new visual order
      const updatedFieldsWithOrder = currentFields.map((field, idx) => ({ ...field, order: idx + 1 }));

      return {
        ...prev,
        frontPageSettings: {
          ...prev.frontPageSettings,
          enabledFields: updatedFieldsWithOrder,
        },
      };
    });
  };

  const handleSave = async () => {
    if (!formData) return;

    // Ensure the saved config has an 'id' from the original fixture
    const configToSave = { ...formData, id: reportConfig.id };

    const resultAction = await dispatch(updateReportConfig(configToSave));
    if (updateReportConfig.fulfilled.match(resultAction)) {
      setSnackbarMessage('Report configuration updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage(
        `Failed to update configuration: ${resultAction.payload || 'Unknown error'}`
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  if (loading && !formData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Error loading report configuration: {error}</Alert>
      </Container>
    );
  }

  if (!formData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">No report configuration found.</Alert>
      </Container>
    );
  }

  // Group fields by category for display
  const fieldsByCategory = formData.frontPageSettings.enabledFields.reduce((acc, field) => {
    const category = field.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(field);
    return acc;
  }, {});

  // Get available categories for display names
  const availableCategoriesMap = formData.frontPageSettings.availableCategories.reduce((acc, cat) => {
    acc[cat.name] = cat.description;
    return acc;
  }, {});

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{ color: 'primary.main', mb: 3, fontWeight: 800, letterSpacing: '-0.5px' }}>
        Report Configuration
      </Typography>

      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, mt: 1, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Front Page Settings
        </Typography>

        {Object.entries(fieldsByCategory).map(([categoryName, fields]) => (
          <Accordion key={categoryName} defaultExpanded sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="medium">
                {categoryName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                {availableCategoriesMap[categoryName]}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <List dense>
                {fields.map((field, index) => (
                  <ListItem
                    key={field.id}
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          edge="end"
                          aria-label="move up"
                          onClick={() => handleReorderFrontPageField(field.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUpwardIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="move down"
                          onClick={() => handleReorderFrontPageField(field.id, 'down')}
                          disabled={index === fields.length - 1}
                          sx={{ mr: 1 }}
                        >
                          <ArrowDownwardIcon />
                        </IconButton>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={
                                !!formData.frontPageSettings.enabledFields.find(
                                  (f) => f.id === field.id
                                )
                              }
                              onChange={(e) =>
                                handleToggleFrontPageField(
                                  field.id,
                                  e.target.checked
                                )
                              }
                              name={field.id}
                            />
                          }
                          labelPlacement="start"
                          label="Enabled"
                          sx={{ m: 0 }}
                        />
                      </Box>
                    }
                    sx={{
                      backgroundColor: index % 2 === 0 ? 'background.paper' : 'action.hover',
                      borderRadius: 1,
                      mb: 0.5,
                    }}
                  >
                    <ListItemIcon>
                      <Typography variant="caption" color="text.secondary">
                        #{field.order}
                      </Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={field.label}
                      secondary={`Type: ${field.type} | Required: ${field.isRequired ? 'Yes' : 'No'}`}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
        {Object.keys(fieldsByCategory).length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No front page fields configured.
          </Typography>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Data Sheet Settings
        </Typography>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.dataSheetSettings.includeMeasurementUncertaintySummary}
                onChange={handleChangeDataSheetSetting(
                  'includeMeasurementUncertaintySummary'
                )}
                name="includeMeasurementUncertaintySummary"
              />
            }
            label="Include Measurement Uncertainty Summary (US-032)"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.dataSheetSettings.groupDataByMeasurementCategory}
                onChange={handleChangeDataSheetSetting(
                  'groupDataByMeasurementCategory'
                )}
                name="groupDataByMeasurementCategory"
              />
            }
            label="Group Data by Measurement Category"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.dataSheetSettings.autoPaginateLongDataSheets}
                onChange={handleChangeDataSheetSetting(
                  'autoPaginateLongDataSheets'
                )}
                name="autoPaginateLongDataSheets"
              />
            }
            label="Auto Paginate Long Data Sheets"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.dataSheetSettings.includePassFailIndicators}
                onChange={handleChangeDataSheetSetting(
                  'includePassFailIndicators'
                )}
                name="includePassFailIndicators"
              />
            }
            label="Include Pass/Fail Indicators"
          />
        </Stack>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={loading}
          sx={{ minWidth: 120, py: 1.5, px: 4, fontSize: '1.1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none', boxShadow: 4 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Configuration'}
        </Button>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ReportConfiguration;