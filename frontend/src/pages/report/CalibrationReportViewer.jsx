// frontend/src/pages/report/CalibrationReportViewer.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import DescriptionIcon from '@mui/icons-material/Description';
import SendIcon from '@mui/icons-material/Send';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Import thunks and selectors from the report module
import {
  fetchReportConfig,
  updateReportConfig,
  setReportConfigField,
  generateReport, // Assuming this is the generation thunk to use, from the first thunks.js block
} from '../../store/report/thunks'; // Adjust path as necessary
import {
  getReportConfig,
  getReportConfigLoading,
  getReportConfigError,
  getFrontPageEnabledFields,
  getIncludeMeasurementUncertaintySummary,
  getGroupDataByMeasurementCategory,
  getAutoPaginateLongDataSheets,
  getIncludePassFailIndicators,
  getReportConfigTemplateId,
  getReportGenerationData, // From the generation-specific selectors
  getReportGenerationLoading,
  getReportGenerationError,
} from '../../store/report/selectors'; // Adjust path as necessary

// Screen Components Checklist (Pre-Code):
// [x] Display Report Name/Description
// [x] List of Front Page Enabled Fields (US-028)
// [x] Toggle for Include Measurement Uncertainty Summary (US-032)
// [x] Toggle for Group Data By Measurement Category (US-029)
// [x] Toggle for Auto Paginate Long Data Sheets (US-030)
// [x] Toggle for Include Pass/Fail Indicators (US-031)
// [x] Save Configuration Button (`updateReportConfig`)
// [x] Generate Report Button (`generateReport`)
// [x] Loading Indicator
// [x] Error Message Display
// [x] Generated Report Output (e.g., URL)

const CalibrationReportViewer = () => {
  const dispatch = useDispatch();
  const { reportId } = useParams(); // reportId from route params, though fetchReportConfig doesn't use it directly

  // Select report configuration state
  const reportConfig = useSelector(getReportConfig);
  const loadingConfig = useSelector(getReportConfigLoading);
  const configError = useSelector(getReportConfigError);

  // Select data sheet settings directly
  const includeUncertaintySummary = useSelector(getIncludeMeasurementUncertaintySummary);
  const groupDataByCategory = useSelector(getGroupDataByMeasurementCategory);
  const autoPaginate = useSelector(getAutoPaginateLongDataSheets);
  const includePassFail = useSelector(getIncludePassFailIndicators);
  const frontPageFields = useSelector(getFrontPageEnabledFields);
  const templateId = useSelector(getReportConfigTemplateId);

  // Select report generation state
  const generatedReportData = useSelector(getReportGenerationData);
  const generatingReport = useSelector(getReportGenerationLoading);
  const generationError = useSelector(getReportGenerationError);

  useEffect(() => {
    // Fetch the default report configuration on component mount
    // Note: The provided fetchReportConfig thunk doesn't use reportId.
    // It fetches the global __REPORT_FIXTURE__ regardless of route param.
    dispatch(fetchReportConfig());
  }, [dispatch, reportId]); // Added reportId in dependency for completeness, though functionally not used by thunk

  const handleToggleChange = (fieldPath, value) => {
    dispatch(setReportConfigField(fieldPath, value));
  };

  const handleSaveConfiguration = () => {
    if (reportConfig) {
      dispatch(updateReportConfig(reportConfig));
    }
  };

  const handleGenerateReport = () => {
    if (templateId) {
      // US-028, US-029, US-030, US-031, US-032 are about configuring the report behavior,
      // not providing actual calibration data for a specific generation run.
      // For demonstration, we'll use mock calibrationJobData.
      const mockCalibrationJobData = {
        jobId: "CAL-2023-001",
        uut: {
          id: "UUT-XYZ",
          serialNumber: "SN12345",
          model: "Model-A",
          manufacturer: "Mfg-B"
        },
        calibrationPoints: [
          { value: 10, unit: "V", measured: 9.9, uncertainty: 0.1, pass: true },
          { value: 20, unit: "V", measured: 20.1, uncertainty: 0.1, pass: true },
          { value: 50, unit: "V", measured: 50.5, uncertainty: 0.2, pass: false },
        ]
      };
      dispatch(generateReport(templateId, mockCalibrationJobData));
    } else {
      alert("No template ID available to generate report.");
    }
  };

  if (loadingConfig) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Report Configuration...</Typography>
      </Container>
    );
  }

  if (configError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          <Typography variant="h6">Error Loading Configuration</Typography>
          <Typography>{configError}</Typography>
        </Alert>
      </Container>
    );
  }

  if (!reportConfig) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">No report configuration found. Please check settings.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{ color: 'primary.main', mb: 3, fontWeight: 800, letterSpacing: '-0.5px' }}>
        Calibration Report Viewer
      </Typography>
      <Typography variant="h6" component="h2" gutterBottom sx={{ color: 'text.secondary' }}>
        {reportConfig.name} - Configuration Settings {reportId && `(ID: ${reportId})`}
      </Typography>
      <Typography variant="body1" paragraph sx={{ color: 'text.secondary' }}>
        {reportConfig.description}
      </Typography>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'secondary.main' }}>
              Front Page Fields (US-028)
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              The selected fields below will be automatically populated with calibration data on the certificate's front page.
            </Typography>
            <List dense>
              {frontPageFields.length > 0 ? (
                frontPageFields.map((field) => (
                  <ListItem key={field.id}>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={field.label}
                      secondary={`Category: ${field.category || 'N/A'} - Type: ${field.type}`}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No front page fields configured." secondary="Please define them in report settings." />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'secondary.main' }}>
              Data Sheet Settings
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={includeUncertaintySummary || false}
                  onChange={(e) => handleToggleChange('dataSheetSettings.includeMeasurementUncertaintySummary', e.target.checked)}
                  name="includeUncertaintySummary"
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle1">Include Measurement Uncertainty Summary (US-032)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Provide a dedicated sheet for detailed uncertainty calculations.
                  </Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={groupDataByCategory || false}
                  onChange={(e) => handleToggleChange('dataSheetSettings.groupDataByMeasurementCategory', e.target.checked)}
                  name="groupDataByCategory"
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle1">Group Data by Measurement Category (US-029)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Organize calibration data sheets by measurement type (e.g., DCV, DCA).
                  </Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={autoPaginate || false}
                  onChange={(e) => handleToggleChange('dataSheetSettings.autoPaginateLongDataSheets', e.target.checked)}
                  name="autoPaginate"
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle1">Auto Paginate Long Data Sheets (US-030)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Automatically paginate data sheets to include all test points in the report.
                  </Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={includePassFail || false}
                  onChange={(e) => handleToggleChange('dataSheetSettings.includePassFailIndicators', e.target.checked)}
                  name="includePassFail"
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle1">Include Pass/Fail Indicators (US-031)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Automatically indicate "PASS" or "FAIL" for each test point.
                  </Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveConfiguration}
              disabled={loadingConfig}
              sx={{ mt: 3, width: '100%', py: 1.5, fontSize: '1.1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none', boxShadow: 4 }}
            >
              {loadingConfig ? <CircularProgress size={24} /> : 'Save Configuration'}
            </Button>
            {configError && <Alert severity="error" sx={{ mt: 2 }}>Save Error: {configError}</Alert>}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'secondary.main' }}>
              Generate Report
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Generate a calibration report based on the current configuration settings.
            </Typography>
            <Button
              variant="contained"
              color="success"
              startIcon={<DescriptionIcon />}
              onClick={handleGenerateReport}
              disabled={generatingReport || !templateId}
              sx={{ mt: 2, py: 1.5, px: 3, fontSize: '1.1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none', boxShadow: 4 }}
            >
              {generatingReport ? <CircularProgress size={24} sx={{ mr: 1 }} /> : 'Generate Calibration Report'}
            </Button>
            {generatingReport && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <CircularProgress size={24} />
                <Typography sx={{ ml: 2 }}>Generating report...</Typography>
              </Box>
            )}
            {generationError && (
              <Alert severity="error" sx={{ mt: 2 }} icon={<ErrorOutlineIcon fontSize="inherit" />}>
                Report Generation Failed: {generationError}
              </Alert>
            )}
            {generatedReportData && generatedReportData.url && (
              <Alert
                severity="success"
                sx={{ mt: 2 }}
                action={
                  <Button color="inherit" size="small" href={generatedReportData.url} target="_blank" rel="noopener noreferrer" startIcon={<SendIcon />}>
                    View Report
                  </Button>
                }
              >
                Report Generated Successfully!
              </Alert>
            )}
             {generatedReportData && !generatedReportData.url && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Report generation initiated. No direct URL provided by mock.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CalibrationReportViewer;

// Screen Components Checklist (Post-Code):
// [x] Display Report Name/Description
// [x] List of Front Page Enabled Fields (US-028)
// [x] Toggle for Include Measurement Uncertainty Summary (US-032)
// [x] Toggle for Group Data By Measurement Category (US-029)
// [x] Toggle for Auto Paginate Long Data Sheets (US-030)
// [x] Toggle for Include Pass/Fail Indicators (US-031)
// [x] Save Configuration Button (`updateReportConfig`)
// [x] Generate Report Button (`generateReport`)
// [x] Loading Indicator
// [x] Error Message Display
// [x] Generated Report Output (e.g., URL)