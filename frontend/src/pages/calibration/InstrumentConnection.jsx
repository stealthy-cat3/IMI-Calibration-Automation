// frontend/src/pages/calibration/InstrumentConnection.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tooltip,
  IconButton,
  RadioGroup,
  Radio,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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
  const navigate = useNavigate();
  const connectedInstruments = useSelector(selectConnectedInstruments);
  const uutDetails = useSelector(selectUutDetails);
  const uutInputMethod = useSelector(selectUutInputMethod);
  const loading = useSelector(selectCalibrationLoading);
  const error = useSelector(selectCalibrationError);
  const currentSession = useSelector(selectCurrentCalibrationSession);
  const storeTemplates = useSelector(getTemplatesList) || [];

  // Injecting mock templates for testing purposes
  const mockTemplates = [
    {
      id: 'mock-template-87v',
      name: 'Fluke 87V Digital Multimeter',
      brand: 'Fluke',
      model: '87V',
      type: 'Handheld DMM',
      description: 'Standard calibration procedure for Fluke 87V.',
      createdAt: new Date().toISOString(),
      HasGPIB: false
    },
    {
      id: 'mock-template-34401a',
      name: 'Agilent 34401A Digital Multimeter',
      brand: 'Agilent',
      model: '34401A',
      type: 'Bench DMM',
      description: 'Standard calibration procedure for Agilent 34401A.',
      createdAt: new Date().toISOString(),
      HasGPIB: true
    },
    {
      id: 'mock-template-generic-bench',
      name: 'Generic Basic Bench DMM',
      brand: 'Generic',
      model: 'Basic-100',
      type: 'Bench DMM',
      description: 'Basic bench DMM without communication interfaces.',
      createdAt: new Date().toISOString(),
      HasGPIB: false
    }
  ];
  
  // Ensure we don't duplicate mock templates if the component re-renders
  const templates = [...storeTemplates];
  mockTemplates.forEach(mockTpl => {
    if (!templates.some(t => t.id === mockTpl.id)) {
      templates.unshift(mockTpl);
    }
  });

  const [openAddUutDialog, setOpenAddUutDialog] = useState(false);
  const [selectedCommInterface, setSelectedCommInterface] = useState('none');
  const [activeStep, setActiveStep] = useState(0);
  const [selectedUutTemplate, setSelectedUutTemplate] = useState(null);
  const [selectedGpib, setSelectedGpib] = useState('');
  const [instrumentInfoModal, setInstrumentInfoModal] = useState(null);

  const [openStartCalibrationDialog, setOpenStartCalibrationDialog] = useState(false);
  const [selectedOperationalMode, setSelectedOperationalMode] = useState('semi-automatic');

  const [localUut, setLocalUut] = useState(null);
  const [isForceDisconnected, setIsForceDisconnected] = useState(false);
  const [consoleModalOpen, setConsoleModalOpen] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([
    '> INIT: CALIBRATION_SESSION',
    '> CONNECTING TO GPIB:0',
    '> SYSTEM:READY',
  ]);

  const effectiveUut = isForceDisconnected ? null : (localUut || uutDetails);

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

  const handleDisconnect = () => {
    setIsForceDisconnected(true);
    setLocalUut(null);
    dispatch({ type: 'calibration/setUutDetails', payload: null });
  };

  const handleOpenAddUutDialog = () => {
    setActiveStep(0);
    setSelectedUutTemplate(null);
    setSelectedCommInterface('none');
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
    if (!selectedUutTemplate) {
      alert('Please select a template.');
      return;
    }
    
    const isBench = selectedUutTemplate.type?.includes('Bench');
    if (isBench && selectedUutTemplate.HasGPIB && selectedCommInterface === 'gpib' && !selectedGpib) {
      alert('Please select a GPIB address for the UUT.');
      return;
    }

    try {
      dispatch(addUutFromTemplate(selectedUutTemplate.id || 'template_dmm_basic_v1'));
      
      const newUut = {
        id: selectedUutTemplate.id,
        name: selectedUutTemplate.name,
        type: selectedUutTemplate.type,
        serialNumber: selectedCommInterface === 'gpib' && selectedGpib ? `GPIB-${selectedGpib}` : `SN-12345`,
        HasGPIB: selectedUutTemplate.HasGPIB,
        commInterface: selectedCommInterface
      };

      // Force correct details into Redux directly to override generic Mock data
      dispatch({ 
        type: 'calibration/setUutDetails', 
        payload: newUut
      });
      
      setLocalUut(newUut);
      setIsForceDisconnected(false);
      setOpenAddUutDialog(false);
    } catch (err) {
      console.error("Failed to add UUT:", err);
    }
  };

  const handleOpenStartCalibrationDialog = () => {
    if (!effectiveUut) {
      alert('Please add a UUT before starting calibration.');
      return;
    }
    setOpenStartCalibrationDialog(true);
  };

  const handleCloseStartCalibrationDialog = () => {
    setOpenStartCalibrationDialog(false);
  };

  const handleStartCalibration = async () => {
    if (!effectiveUut) {
      alert('No UUT selected for calibration.');
      return;
    }
    try {
      await dispatch(startCalibrationSession(effectiveUut, selectedOperationalMode));
      handleCloseStartCalibrationDialog();
      navigate(`/calibration/run/${effectiveUut.id}`);
    } catch (err) {
      console.error("Failed to start calibration:", err);
      // Error handling is managed by the global error state
    }
  };

  const isCalibrationActive = currentSession?.status === 'in_progress';

  useEffect(() => {
    let interval;
    if (consoleModalOpen && isCalibrationActive) {
      interval = setInterval(() => {
        setConsoleLogs(prev => {
          const newLog = `> [${new Date().toLocaleTimeString()}] SCPI: MEAS:VOLT:DC? -> ${Math.random().toFixed(4)}`;
          return [...prev, newLog];
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [consoleModalOpen, isCalibrationActive]);

  return (
    <Container maxWidth="lg" sx={{ py: 1 }}>
        <Typography variant="h5" gutterBottom component="h1" sx={{ color: 'primary.main', mb: 1.5, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Instrument Connection & UUT Setup
        </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ my: 1, py: 0 }}>
          Error: {error}
        </Alert>
      )}

      {/* Connected Instruments (US-001) */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 0.5, fontWeight: 'bold' }}>
          Connected Instruments
        </Typography>
        <Grid container spacing={1}>
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
            connectedInstruments.map((instrument) => {
              const isThisDeviceCalibrating = isCalibrationActive && effectiveUut && (instrument.id === effectiveUut.id || instrument.serialNumber === effectiveUut.serialNumber);
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={instrument.id}>
                  <Card 
                    elevation={3} 
                    sx={{ 
                      p: 1, 
                      borderRadius: 3,  
                      cursor: 'pointer',  
                      transition: '0.2s', 
                      '&:hover': { boxShadow: 6 },
                      ...(isThisDeviceCalibrating ? { border: '2px solid', borderColor: 'primary.main', bgcolor: 'primary.lightest' } : {})
                    }}
                    onClick={() => {
                      if (isThisDeviceCalibrating) {
                        setConsoleModalOpen(true);
                      } else {
                        setInstrumentInfoModal({ ...instrument, brand: instrument.brand || 'Unknown', model: instrument.model || instrument.name, calibrationStatus: 'Pending' });
                      }
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6">{instrument.brand || 'Unknown'} {instrument.model || instrument.name}</Typography>
                      <Typography color="text.secondary">Serial Number: {instrument.serialNumber || 'N/A'}</Typography>
                      <Typography color="text.secondary">GPIB Address: {instrument.address}</Typography>
                      <Typography color="text.secondary" sx={{ color: instrument.status === 'connected' ? 'success.main' : 'error.main' }}>
                        Status: {instrument.status}
                      </Typography>
                      <Typography color="text.secondary" sx={{ color: isThisDeviceCalibrating ? 'primary.main' : 'text.secondary', fontWeight: isThisDeviceCalibrating ? 'bold' : 'normal' }}>
                        Calibration: {isThisDeviceCalibrating ? 'In Progress' : 'Pending'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })
          ) : null}
        </Grid>
      </Box>

      {/* UUT Details and Actions (US-002, US-003, US-004) */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 0.5, fontWeight: 'bold' }}>
          Unit Under Test (UUT)
        </Typography>

        {!effectiveUut ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Alert severity="info" sx={{ py: 0 }}>No UUT currently defined for calibration.</Alert>
            <Button
              variant="contained"
              size="small"
              onClick={handleOpenAddUutDialog}
              disabled={loading || isCalibrationActive}
              sx={{ alignSelf: 'flex-start', py: 0.5, px: 1.5, fontSize: '0.85rem', fontWeight: 700, borderRadius: 1.5, textTransform: 'none', boxShadow: 3 }}
            >
              Add Device From Existing Template
            </Button>
          </Box>
        ) : (
          <Card 
            elevation={3} 
            sx={{ 
              p: { xs: 1, md: 1.5 }, 
              borderRadius: 2, 
              cursor: isCalibrationActive ? 'pointer' : 'default', 
              '&:hover': isCalibrationActive ? { boxShadow: 6 } : {} 
            }}
            onClick={() => { if (isCalibrationActive) setConsoleModalOpen(true); }}
          >
            <CardContent sx={{ pb: 0.5, pt: 0.5 }}>
              <Typography variant="subtitle1" fontWeight="bold">{effectiveUut.name}</Typography>
              <Typography variant="body2" color="text.secondary">Type: {effectiveUut.type} | SN: {effectiveUut.serialNumber}</Typography>
            </CardContent>
            <CardActions sx={{ px: 1.5, pb: 1, pt: 0.5, display: 'flex', gap: 1 }}>
              {/* Start Calibration Button (US-004) */}
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleOpenStartCalibrationDialog}
                disabled={loading || !effectiveUut || isCalibrationActive}
                sx={{ py: 0.5, px: 1.5, fontSize: '0.85rem', fontWeight: 700, borderRadius: 1.5, textTransform: 'none', boxShadow: 3 }}
              >
                {isCalibrationActive ? 'Calibration In Progress...' : 'Start Calibration'}
              </Button>
              {/* Disconnect Button */}
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleDisconnect}
                disabled={loading || isCalibrationActive}
                sx={{ py: 0.5, px: 1.5, fontSize: '0.85rem', fontWeight: 700, borderRadius: 1.5, textTransform: 'none' }}
              >
                Disconnect
              </Button>
            </CardActions>
          </Card>
        )}
      </Box>

        {/* Add UUT Wizard Modal */}
      <Dialog open={openAddUutDialog} onClose={handleCloseAddUutDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 'bold', py: 1.5, fontSize: '1.1rem' }}>Connect Instrument</DialogTitle>
        <DialogContent dividers sx={{ minHeight: 250, p: 2 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 1.5, mt: 0 }}>
            <Step><StepLabel>Select Template</StepLabel></Step>
            <Step><StepLabel>Connect UUT (GPIB)</StepLabel></Step>
          </Stepper>

          {activeStep === 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>Select an existing calibration template:</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
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

              {/* Conditional Communication Interface UI */}
              {selectedUutTemplate?.type?.toLowerCase().includes('handheld') ? (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Handheld devices do not require a communication interface. Proceeding in Semi-Automated mode.
                </Alert>
              ) : selectedUutTemplate?.type?.toLowerCase().includes('bench') && !selectedUutTemplate?.HasGPIB ? (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  This bench instrument model does not support communication interfaces (No GPIB). Proceeding in Semi-Automated mode.
                </Alert>
              ) : (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>Communication Interface</Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      value={selectedCommInterface}
                      onChange={(e) => setSelectedCommInterface(e.target.value)}
                    >
                      <FormControlLabel value="none" control={<Radio />} label="No Communication Interface" />
                      <FormControlLabel value="gpib" control={<Radio />} label="GPIB" />
                    </RadioGroup>
                  </FormControl>

                  {selectedCommInterface === 'gpib' && (
                    <Box sx={{ mt: 2 }}>
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
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseAddUutDialog} color="inherit">Cancel</Button>
          {activeStep > 0 && <Button onClick={handleBackStep}>Back</Button>}
          {activeStep === 0 ? (
            <Button onClick={handleNextStep} variant="contained" disabled={!selectedUutTemplate}>Next Step</Button>
          ) : (
            <Button 
              onClick={handleAddUut} 
              variant="contained" 
              color="primary" 
              disabled={
                loading || 
                (selectedUutTemplate?.type?.includes('Bench') && selectedUutTemplate?.HasGPIB && selectedCommInterface === 'gpib' && !selectedGpib)
              }
            >
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
          {effectiveUut && (
            <Typography variant="subtitle1" gutterBottom>
              UUT: <strong>{effectiveUut.name}</strong> ({effectiveUut.type})
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
              {/* Only allow Fully-Automatic for Bench instruments with GPIB support and an active communication interface */}
              {effectiveUut && !effectiveUut.type?.toLowerCase().includes('handheld') && effectiveUut.HasGPIB !== false && effectiveUut.commInterface !== 'none' && (
                <MenuItem value="fully-automatic">Fully-Automatic</MenuItem>
              )}
              <MenuItem value="manual-guided">Manual Guided</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Select the mode for the calibration workflow.
            </Typography>
            <Tooltip
              title={
                <Box sx={{ p: 0.5, maxWidth: 350 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Manual</Typography>
                  <Typography variant="body2" sx={{ mb: 1, fontSize: '0.75rem' }}>The operator manually sets the calibrator output and manually enters the UUT readings. No communication with the calibrator or UUT.</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Semi-Automated</Typography>
                  <Typography variant="body2" sx={{ mb: 1, fontSize: '0.75rem' }}>The calibrator is controlled automatically. The operator manually enters the UUT readings after each test point. Intended for handheld instruments.</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Fully Automated</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Both the calibrator and the UUT communicate with the software. Test points are executed automatically. Available for supported bench instruments.</Typography>
                </Box>
              }
              placement="right"
              arrow
            >
              <IconButton size="small" sx={{ ml: 0.5, p: 0.5 }}>
                <InfoOutlinedIcon fontSize="small" color="action" />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStartCalibrationDialog}>Cancel</Button>
          <Button onClick={handleStartCalibration} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Start Calibration'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Calibration Console Modal */}
      <Dialog open={consoleModalOpen} onClose={() => setConsoleModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#1e1e1e', color: '#4caf50' }}>
          Live Calibration Console - {effectiveUut?.name || 'UUT'}
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#1e1e1e', color: '#4caf50', minHeight: 300, fontFamily: 'monospace' }}>
          {consoleLogs.map((log, index) => (
            <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
              {log}
            </Typography>
          ))}
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1e1e1e' }}>
          <Button onClick={() => navigate(`/calibration/run/${effectiveUut?.id}`)} color="primary" variant="contained">
            Go to Calibration Run
          </Button>
          <Button onClick={() => setConsoleModalOpen(false)} sx={{ color: '#fff' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InstrumentConnection;