// frontend/src/pages/calibration/InstrumentConnection.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  fetchConnectedInstruments,
  addUutFromTemplate,
  updateUutInputMethod,
  startCalibrationSession,
} from '../../store/calibration/thunks';
import {
  selectConnectedInstruments,
  selectUutDetails,
  selectUutInputMethod,
  selectCalibrationLoading,
  selectCalibrationError,
  selectCurrentCalibrationSession,
} from '../../store/calibration/selectors';
import { fetchTemplates } from '../../store/template/thunks';
import { getTemplatesList } from '../../store/template/selectors';

// Checklist:
// [x] List of connected instruments
// [x] Add UUT from template functionality (modal with template selection)
// [x] UUT name and type display
// [x] UUT input method toggle (automatic/manual)
// [x] Start calibration for UUT functionality (modal with operational mode selection)

const InstrumentConnection = () => {
  const dispatch = useDispatch();
  const connectedInstruments = useSelector(selectConnectedInstruments);
  const uutDetails = useSelector(selectUutDetails);
  const uutInputMethod = useSelector(selectUutInputMethod);
  const loading = useSelector(selectCalibrationLoading);
  const error = useSelector(selectCalibrationError);
  const currentSession = useSelector(selectCurrentCalibrationSession);
  const storeTemplates = useSelector(getTemplatesList) || [];

  // Injecting a mock template for testing purposes
  const mockTemplate = {
    id: 'mock-template-87v',
    name: 'Fluke 87V Digital Multimeter',
    brand: 'Fluke',
    model: '87V',
    type: 'Handheld DMM',
    description: 'Standard calibration procedure for Fluke 87V.',
    createdAt: new Date().toISOString()
  };
  
  // Ensure we don't duplicate it if the component re-renders
  const templates = storeTemplates.some(t => t.id === mockTemplate.id) 
    ? storeTemplates 
    : [mockTemplate, ...storeTemplates];

  const [openAddUutDialog, setOpenAddUutDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedUutTemplate, setSelectedUutTemplate] = useState(null);
  const [selectedGpib, setSelectedGpib] = useState('');
  const [instrumentInfoModal, setInstrumentInfoModal] = useState(null);

  const [openStartCalibrationDialog, setOpenStartCalibrationDialog] = useState(false);
  const [selectedOperationalMode, setSelectedOperationalMode] = useState('semi-automatic');

  // Fetch connected instruments and templates on component mount
  useEffect(() => {
    dispatch(fetchConnectedInstruments());
    dispatch(fetchTemplates());
  }, [dispatch]);

  const handleToggleUutInputMethod = () => {
    if (uutDetails) {
      const newMethod = uutInputMethod === 'manual' ? 'automatic' : 'manual';
      dispatch(updateUutInputMethod(newMethod));
    }
  };

  const handleOpenAddUutDialog = () => {
    setActiveStep(0);
    setSelectedUutTemplate(null);
    setSelectedGpib('');
    setOpenAddUutDialog(true);
  };

  const handleCloseAddUutDialog = () => {
    setOpenAddUutDialog(false);
  };

  const handleNextStep = () => {
    if (activeStep === 0 && !selectedUutTemplate) {
      alert('Please select a template first.');
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBackStep = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleAddUut = async () => {
    if (!selectedUutTemplate || (!selectedGpib && uutInputMethod !== 'manual')) {
      alert('Please select a GPIB address for the UUT.');
      return;
    }
    try {
      await dispatch(addUutFromTemplate(selectedUutTemplate.id || 'template_dmm_basic_v1')).unwrap();
      setOpenAddUutDialog(false);
    } catch (err) {
      console.error("Failed to add UUT:", err);
    }
  };

  const handleOpenStartCalibrationDialog = () => {
    if (!uutDetails) {
      alert('Please add a UUT before starting calibration.');
      return;
    }
    setOpenStartCalibrationDialog(true);
  };

  const handleCloseStartCalibrationDialog = () => {
    setOpenStartCalibrationDialog(false);
  };

  const handleStartCalibration = async () => {
    if (!uutDetails) {
      alert('No UUT selected for calibration.');
      return;
    }
    try {
      // The startCalibrationSession thunk expects uutDetails.
      // For this example, we'll use the uutDetails from the store,
      // which was implicitly set by addUutFromTemplate using the fixture.
      // If addUutFromTemplate had allowed custom UUT details, we'd use those here.
      await dispatch(startCalibrationSession(uutDetails, selectedOperationalMode)).unwrap();
      handleCloseStartCalibrationDialog();
      // Navigate to calibration workflow page, if applicable
    } catch (err) {
      console.error("Failed to start calibration:", err);
      // Error handling is managed by the global error state
    }
  };

  const isCalibrationActive = currentSession?.status === 'in_progress';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom component="h1" sx={{ color: 'primary.main', mb: 3, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Instrument Connection & UUT Setup
        </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          Error: {error}
        </Alert>
      )}

      {/* Connected Instruments (US-001) */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Connected Instruments
        </Typography>
        <Grid container spacing={2}>
          {/* Reference Calibrator - Always First and Connected */}
          <Grid size={12}>
            <Card 
              elevation={3} 
              sx={{ p: 1, borderRadius: 3, borderLeft: '6px solid', borderColor: 'primary.main', bgcolor: 'primary.lightest', cursor: 'pointer', transition: '0.2s', '&:hover': { boxShadow: 4 } }}
              onClick={() => setInstrumentInfoModal({ name: 'Fluke 5522A', brand: 'Fluke', model: '5522A', type: 'Multi-Product Calibrator', serialNumber: 'System-Queried', address: '0', status: 'Connected', calibrationStatus: 'Reference Standard', templateName: 'N/A' })}
            >
              <CardContent>
                <Typography variant="h6" color="primary.main" fontWeight="bold">Reference Calibrator</Typography>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}><Typography variant="body2" color="text.secondary"><b>Model Name:</b> Fluke 5522A</Typography></Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}><Typography variant="body2" color="text.secondary"><b>Serial Number:</b> Auto-Retrieved</Typography></Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}><Typography variant="body2" color="text.secondary"><b>GPIB Address:</b> 0</Typography></Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}><Typography variant="body2" color="success.main" fontWeight="bold">Status: Connected</Typography></Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* User Under Test (UUT) Devices */}
          {connectedInstruments.length > 0 ? (
            connectedInstruments.map((instrument) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={instrument.id}>
                <Card 
                  elevation={3} 
                  sx={{ p: 2, borderRadius: 3, cursor: 'pointer', transition: '0.2s', '&:hover': { boxShadow: 6 } }}
                  onClick={() => setInstrumentInfoModal({ ...instrument, brand: instrument.brand || 'Unknown', model: instrument.model || instrument.name, calibrationStatus: 'Pending' })}
                >
                  <CardContent>
                    <Typography variant="h6">{instrument.brand || 'Unknown'} {instrument.model || instrument.name}</Typography>
                    <Typography color="text.secondary">Serial Number: {instrument.serialNumber || 'N/A'}</Typography>
                    <Typography color="text.secondary">GPIB Address: {instrument.address}</Typography>
                    <Typography color="text.secondary" sx={{ color: instrument.status === 'connected' ? 'success.main' : 'error.main' }}>
                      Status: {instrument.status}
                    </Typography>
                    <Typography color="text.secondary">Calibration: Pending</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            !loading && (
              <Grid size={12}>
                <Alert severity="info" sx={{ mt: 1 }}>No UUT devices connected. Click "Add Device From Existing Template" to begin.</Alert>
              </Grid>
            )
          )}
        </Grid>
      </Box>

      {/* UUT Details and Actions (US-002, US-003, US-004) */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Unit Under Test (UUT)
        </Typography>

        {!uutDetails ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info">No UUT currently defined for calibration.</Alert>
            <Button
              variant="contained"
              onClick={handleOpenAddUutDialog}
              disabled={loading || isCalibrationActive}
              sx={{ alignSelf: 'flex-start', py: 1.5, px: 3, fontSize: '1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none', boxShadow: 4 }}
            >
              Add Device From Existing Template
            </Button>
          </Box>
        ) : (
          <Card elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6">{uutDetails.name}</Typography>
              <Typography color="text.secondary">Type: {uutDetails.type}</Typography>
              <Typography color="text.secondary">Serial Number: {uutDetails.serialNumber}</Typography>

              {/* UUT Input Method Toggle (US-003) */}
              <FormControlLabel
                control={
                  <Switch
                    checked={uutInputMethod === 'automatic'}
                    onChange={handleToggleUutInputMethod}
                    disabled={loading || isCalibrationActive}
                  />
                }
                label={`Input Method: ${uutInputMethod === 'automatic' ? 'Automatic' : 'Manual'}`}
                sx={{ mt: 2 }}
              />
            </CardContent>
            <CardActions>
              {/* Start Calibration Button (US-004) */}
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenStartCalibrationDialog}
                disabled={loading || !uutDetails || isCalibrationActive}
                sx={{ py: 1.5, px: 3, fontSize: '1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none', boxShadow: 4 }}
              >
                {isCalibrationActive ? 'Calibration In Progress...' : 'Start Calibration'}
              </Button>
            </CardActions>
          </Card>
        )}
      </Box>

      {/* Add UUT Wizard Modal */}
      <Dialog open={openAddUutDialog} onClose={handleCloseAddUutDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Connect Instrument</DialogTitle>
        <DialogContent dividers sx={{ minHeight: 300 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
            <Step><StepLabel>Select Template</StepLabel></Step>
            <Step><StepLabel>Connect UUT (GPIB)</StepLabel></Step>
          </Stepper>

          {activeStep === 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>Select an existing calibration template:</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small" hover>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell><strong>Template Name</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {templates && templates.length > 0 ? templates.map((tpl) => (
                      <TableRow  
                        key={tpl.id} 
                        hover 
                        selected={selectedUutTemplate?.id === tpl.id}
                        onClick={() => setSelectedUutTemplate(tpl)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{tpl.name}</TableCell>
                        <TableCell>{tpl.type}</TableCell>
                        <TableCell>{tpl.description}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">No templates found. Please create one first.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Selected Template: <strong>{selectedUutTemplate?.name}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Brand: {selectedUutTemplate?.brand || 'Unknown'} | Model: {selectedUutTemplate?.model || 'Unknown'} | Type: {selectedUutTemplate?.type}
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                The Fluke 5522A is automatically connected at <strong>GPIB Address 0</strong>.
              </Alert>

              <FormControl fullWidth>
                <InputLabel id="gpib-select-label">Select UUT GPIB Address</InputLabel>
                <Select
                  labelId="gpib-select-label"
                  value={selectedGpib}
                  label="Select UUT GPIB Address"
                  onChange={(e) => setSelectedGpib(e.target.value)}
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(address => (
                    <MenuItem key={address} value={address}>
                      GPIB Address {address}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                *Address 0 is strictly reserved for the Reference Calibrator and cannot be selected.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseAddUutDialog} color="inherit">Cancel</Button>
          {activeStep > 0 && <Button onClick={handleBackStep}>Back</Button>}
          {activeStep === 0 ? (
            <Button onClick={handleNextStep} variant="contained" disabled={!selectedUutTemplate}>Next Step</Button>
          ) : (
            <Button onClick={handleAddUut} variant="contained" color="primary" disabled={loading || !selectedGpib}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Read Info & Connect'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Read-Only Instrument Info Modal */}
      <Dialog open={Boolean(instrumentInfoModal)} onClose={() => setInstrumentInfoModal(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Instrument Details</DialogTitle>
        <DialogContent dividers>
          {instrumentInfoModal && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}><Typography variant="subtitle2" color="text.secondary">Brand</Typography><Typography>{instrumentInfoModal.brand || 'Unknown'}</Typography></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Typography variant="subtitle2" color="text.secondary">Model</Typography><Typography>{instrumentInfoModal.model || instrumentInfoModal.name}</Typography></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Typography variant="subtitle2" color="text.secondary">Instrument Type</Typography><Typography>{instrumentInfoModal.type || 'N/A'}</Typography></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Typography variant="subtitle2" color="text.secondary">Serial Number</Typography><Typography>{instrumentInfoModal.serialNumber || 'N/A'}</Typography></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Typography variant="subtitle2" color="text.secondary">GPIB Address</Typography><Typography>{instrumentInfoModal.address || instrumentInfoModal['GPIB Address']}</Typography></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Typography variant="subtitle2" color="text.secondary">Template Name</Typography><Typography>{instrumentInfoModal.templateName || 'N/A'}</Typography></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Typography variant="subtitle2" color="text.secondary">Connection Status</Typography><Typography color="success.main" fontWeight="bold">{instrumentInfoModal.status || instrumentInfoModal['Connection Status']}</Typography></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Typography variant="subtitle2" color="text.secondary">Calibration Status</Typography><Typography>{instrumentInfoModal.calibrationStatus || 'N/A'}</Typography></Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInstrumentInfoModal(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Start Calibration Dialog (US-004) */}
      <Dialog open={openStartCalibrationDialog} onClose={handleCloseStartCalibrationDialog} fullWidth maxWidth="sm">
        <DialogTitle>Start Calibration Session</DialogTitle>
        <DialogContent>
          {uutDetails && (
            <Typography variant="subtitle1" gutterBottom>
              UUT: <strong>{uutDetails.name}</strong> ({uutDetails.type})
            </Typography>
          )}
          <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
            <InputLabel id="operational-mode-select-label">Operational Mode</InputLabel>
            <Select
              labelId="operational-mode-select-label"
              id="operational-mode-select"
              value={selectedOperationalMode}
              label="Operational Mode"
              onChange={(e) => setSelectedOperationalMode(e.target.value)}
            >
              <MenuItem value="semi-automatic">Semi-Automatic (Guided)</MenuItem>
              <MenuItem value="fully-automatic">Fully-Automatic</MenuItem>
              <MenuItem value="manual-guided">Manual Guided</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Select the mode for the calibration workflow.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStartCalibrationDialog}>Cancel</Button>
          <Button onClick={handleStartCalibration} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Start Calibration'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InstrumentConnection;