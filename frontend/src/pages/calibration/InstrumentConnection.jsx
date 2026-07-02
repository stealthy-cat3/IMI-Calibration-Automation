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
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
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
  const [readSpeed, setReadSpeed] = useState(800);

  const [localUut, setLocalUut] = useState(null);

  // Mock data and state for finished calibrations log
  const [finishedCalibrations, setFinishedCalibrations] = useState([
    {
      id: 'cal-log-001',
      instrumentName: 'Fluke 87V Digital Multimeter',
      serialNumber: 'SN-998877',
      completionDate: new Date(Date.now() - 86400000).toLocaleString(), // 1 day ago
      status: 'Passed',
      testPoints: [
        // DC Voltage
        { name: 'DC Voltage Zero Offset', applied: '0.000 mV', reading: '0.001 mV', deviation: '0.001 mV', result: 'Pass' },
        { name: 'DC Voltage Gain', applied: '100.00 mV', reading: '100.01 mV', deviation: '0.01 mV', result: 'Pass' },
        { name: 'DC Voltage Gain', applied: '1.0000 V', reading: '0.9998 V', deviation: '-0.0002 V', result: 'Pass' },
        { name: 'DC Voltage Gain', applied: '10.000 V', reading: '10.001 V', deviation: '0.001 V', result: 'Pass' },
        { name: 'DC Voltage Gain', applied: '100.00 V', reading: '99.98 V', deviation: '-0.02 V', result: 'Pass' },
        { name: 'DC Voltage Gain', applied: '1000.0 V', reading: '999.9 V', deviation: '-0.1 V', result: 'Pass' },
        
        // DC Current
        { name: 'DC Current Zero Offset', applied: '0.000 mA', reading: '0.001 mA', deviation: '0.001 mA', result: 'Pass' },
        { name: 'DC Current Gain', applied: '10.000 mA', reading: '9.998 mA', deviation: '-0.002 mA', result: 'Pass' },
        { name: 'DC Current Gain', applied: '100.00 mA', reading: '100.02 mA', deviation: '0.02 mA', result: 'Pass' },
        { name: 'DC Current Gain', applied: '1.0000 A', reading: '0.9999 A', deviation: '-0.0001 A', result: 'Pass' },
        { name: 'DC Current Gain', applied: '2.0000 A', reading: '2.0002 A', deviation: '0.0002 A', result: 'Pass' },
        
        // Resistance (2-Wire)
        { name: 'Ohms Zero Offset', applied: '0.00 Ω', reading: '0.02 Ω', deviation: '0.02 Ω', result: 'Pass' },
        { name: 'Ohms Gain', applied: '100.00 Ω', reading: '99.98 Ω', deviation: '-0.02 Ω', result: 'Pass' },
        { name: 'Ohms Gain', applied: '1.0000 kΩ', reading: '1.0001 kΩ', deviation: '0.0001 kΩ', result: 'Pass' },
        { name: 'Ohms Gain', applied: '10.000 kΩ', reading: '9.999 kΩ', deviation: '-0.001 kΩ', result: 'Pass' },
        { name: 'Ohms Gain', applied: '100.00 kΩ', reading: '100.01 kΩ', deviation: '0.01 kΩ', result: 'Pass' },
        { name: 'Ohms Gain', applied: '1.0000 MΩ', reading: '1.0002 MΩ', deviation: '0.0002 MΩ', result: 'Pass' },
        { name: 'Ohms Gain', applied: '10.000 MΩ', reading: '9.995 MΩ', deviation: '-0.005 MΩ', result: 'Pass' },
        { name: 'Ohms Gain', applied: '100.00 MΩ', reading: '99.90 MΩ', deviation: '-0.10 MΩ', result: 'Pass' },
        
        // AC Voltage
        { name: 'AC Voltage Gain (1 kHz)', applied: '10.00 mV', reading: '9.98 mV', deviation: '-0.02 mV', result: 'Pass' },
        { name: 'AC Voltage Gain (1 kHz)', applied: '100.00 mV', reading: '100.05 mV', deviation: '0.05 mV', result: 'Pass' },
        { name: 'AC Voltage Gain (1 kHz)', applied: '1.0000 V', reading: '0.9995 V', deviation: '-0.0005 V', result: 'Pass' },
        { name: 'AC Voltage Gain (1 kHz)', applied: '10.000 V', reading: '10.002 V', deviation: '0.002 V', result: 'Pass' },
        { name: 'AC Voltage Gain (1 kHz)', applied: '100.00 V', reading: '99.95 V', deviation: '-0.05 V', result: 'Pass' },
        { name: 'AC Voltage Gain (1 kHz)', applied: '750.0 V', reading: '749.8 V', deviation: '-0.2 V', result: 'Pass' },
        
        // AC Current
        { name: 'AC Current Gain (1 kHz)', applied: '1.0000 A', reading: '0.9995 A', deviation: '-0.0005 A', result: 'Pass' },
        { name: 'AC Current Gain (1 kHz)', applied: '2.0000 A', reading: '2.0008 A', deviation: '0.0008 A', result: 'Pass' },
        
        // Frequency
        { name: 'Frequency Gain (0.1 Vrms)', applied: '100.00 Hz', reading: '100.00 Hz', deviation: '0.00 Hz', result: 'Pass' },
        { name: 'Frequency Gain (1 Vrms)', applied: '100.00 kHz', reading: '100.01 kHz', deviation: '0.01 kHz', result: 'Pass' }
      ]
    },
    {
      id: 'cal-log-002',
      instrumentName: 'Agilent 34401A Digital Multimeter',
      serialNumber: 'GPIB-22',
      completionDate: new Date(Date.now() - 172800000).toLocaleString(), // 2 days ago
      status: 'Passed',
      testPoints: [
        // DC Voltage
        { name: 'DC Voltage Zero Offset', applied: '0.00000 mV', reading: '0.00001 mV', deviation: '0.00001 mV', result: 'Pass' },
        { name: 'DC Voltage Gain', applied: '100.000 mV', reading: '100.001 mV', deviation: '0.001 mV', result: 'Pass' },
        { name: 'DC Voltage Gain', applied: '1.00000 V', reading: '0.99998 V', deviation: '-0.00002 V', result: 'Pass' },
        { name: 'DC Voltage Gain', applied: '10.0000 V', reading: '10.0001 V', deviation: '0.0001 V', result: 'Pass' },
        { name: 'DC Voltage Gain', applied: '100.000 V', reading: '99.998 V', deviation: '-0.002 V', result: 'Pass' },
        { name: 'DC Voltage Gain', applied: '1000.00 V', reading: '999.99 V', deviation: '-0.01 V', result: 'Pass' },
        
        // DC Current
        { name: 'DC Current Zero Offset', applied: '0.00000 mA', reading: '0.00002 mA', deviation: '0.00002 mA', result: 'Pass' },
        { name: 'DC Current Gain', applied: '10.0000 mA', reading: '9.9998 mA', deviation: '-0.0002 mA', result: 'Pass' },
        { name: 'DC Current Gain', applied: '100.000 mA', reading: '100.002 mA', deviation: '0.002 mA', result: 'Pass' },
        { name: 'DC Current Gain', applied: '1.00000 A', reading: '0.99999 A', deviation: '-0.00001 A', result: 'Pass' },
        { name: 'DC Current Gain', applied: '3.00000 A', reading: '3.00005 A', deviation: '0.00005 A', result: 'Pass' },
        
        // Resistance (4-Wire & 2-Wire)
        { name: 'Ohms Zero Offset (4W)', applied: '0.0000 Ω', reading: '0.0002 Ω', deviation: '0.0002 Ω', result: 'Pass' },
        { name: 'Ohms Gain (4W)', applied: '100.000 Ω', reading: '99.998 Ω', deviation: '-0.002 Ω', result: 'Pass' },
        { name: 'Ohms Gain (4W)', applied: '1.00000 kΩ', reading: '1.00001 kΩ', deviation: '0.00001 kΩ', result: 'Pass' },
        { name: 'Ohms Gain (4W)', applied: '10.0000 kΩ', reading: '9.9999 kΩ', deviation: '-0.0001 kΩ', result: 'Pass' },
        { name: 'Ohms Gain (4W)', applied: '100.000 kΩ', reading: '100.001 kΩ', deviation: '0.001 kΩ', result: 'Pass' },
        { name: 'Ohms Gain (4W)', applied: '1.00000 MΩ', reading: '1.00002 MΩ', deviation: '0.00002 MΩ', result: 'Pass' },
        { name: 'Ohms Gain (2W)', applied: '10.0000 MΩ', reading: '9.9995 MΩ', deviation: '-0.0005 MΩ', result: 'Pass' },
        { name: 'Ohms Gain (2W)', applied: '100.000 MΩ', reading: '99.990 MΩ', deviation: '-0.010 MΩ', result: 'Pass' },
        
        // AC Voltage
        { name: 'AC Voltage Gain (1 kHz)', applied: '100.000 mV', reading: '100.005 mV', deviation: '0.005 mV', result: 'Pass' },
        { name: 'AC Voltage Gain (1 kHz)', applied: '1.00000 V', reading: '0.99995 V', deviation: '-0.00005 V', result: 'Pass' },
        { name: 'AC Voltage Gain (1 kHz)', applied: '10.0000 V', reading: '10.0002 V', deviation: '0.0002 V', result: 'Pass' },
        { name: 'AC Voltage Gain (1 kHz)', applied: '100.000 V', reading: '99.995 V', deviation: '-0.005 V', result: 'Pass' },
        { name: 'AC Voltage Gain (1 kHz)', applied: '750.00 V', reading: '749.98 V', deviation: '-0.02 V', result: 'Pass' },
        
        // AC Current
        { name: 'AC Current Gain (1 kHz)', applied: '1.00000 A', reading: '0.99995 A', deviation: '-0.00005 A', result: 'Pass' },
        { name: 'AC Current Gain (1 kHz)', applied: '3.00000 A', reading: '3.00008 A', deviation: '0.00008 A', result: 'Pass' },
        
        // Frequency
        { name: 'Frequency Gain (0.1 Vrms)', applied: '100.000 Hz', reading: '100.000 Hz', deviation: '0.000 Hz', result: 'Pass' },
        { name: 'Frequency Gain (1 Vrms)', applied: '100.000 kHz', reading: '100.001 kHz', deviation: '0.001 kHz', result: 'Pass' }
      ]
    }
  ]);
  const [viewResultsModal, setViewResultsModal] = useState(null);

  const handleViewResults = (record) => setViewResultsModal(record);
  const handleDownloadExcel = (record) => alert(`Downloading Excel report for ${record.instrumentName} (${record.serialNumber})...`);
  const handleDeleteRecord = (id) => {
    if (window.confirm('Are you sure you want to delete this calibration record?')) {
      setFinishedCalibrations(prev => prev.filter(item => item.id !== id));
    }
  };
  const [isForceDisconnected, setIsForceDisconnected] = useState(false);

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
    
    // Auto-select Fully-Automatic if the device supports it
    if (!effectiveUut.type?.toLowerCase().includes('handheld') && effectiveUut.HasGPIB !== false && effectiveUut.commInterface !== 'none') {
      setSelectedOperationalMode('fully-automatic');
    } else {
      setSelectedOperationalMode('semi-automatic');
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
      // Clear previous session states so we start fresh
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('calState_')) {
          sessionStorage.removeItem(key);
        }
      });
      sessionStorage.setItem('calState_operationalMode', JSON.stringify(selectedOperationalMode));
      sessionStorage.setItem('calState_readSpeed', JSON.stringify(readSpeed));

      await dispatch(startCalibrationSession(effectiveUut, selectedOperationalMode));
      handleCloseStartCalibrationDialog();
      navigate(`/calibration/run/${effectiveUut.id}`, { state: { operationalMode: selectedOperationalMode, readSpeed: readSpeed } });
    } catch (err) {
      console.error("Failed to start calibration:", err);
      // Error handling is managed by the global error state
    }
  };

  const isCalibrationActive = currentSession?.status === 'in_progress';

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
              elevation={0} 
              className="relative bg-brand-panel border border-brand-border rounded-xl cursor-pointer hover:border-amber-500/50 shadow-md shadow-amber-500/5 transition-colors overflow-hidden p-2"
              onClick={() => setInstrumentInfoModal({ name: 'Fluke 5522A', brand: 'Fluke', model: '5522A', type: 'Multi-Product Calibrator', serialNumber: 'System-Queried', address: '0', status: 'Connected', calibrationStatus: 'Reference Standard', templateName: 'N/A' })}
            >
              <div className="absolute left-0 top-0 w-1.5 h-full bg-amber-500"></div>
              <CardContent>
                <Typography variant="h6" className="font-display font-bold text-amber-500 tracking-tight">Reference Calibrator</Typography>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}><Typography variant="body2" className="text-[11px] font-mono text-gray-400"><b className="text-gray-300 font-sans">Model Name:</b> Fluke 5522A</Typography></Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}><Typography variant="body2" className="text-[11px] font-mono text-gray-400"><b className="text-gray-300 font-sans">Serial Number:</b> Auto-Retrieved</Typography></Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}><Typography variant="body2" className="text-[11px] font-mono text-gray-400"><b className="text-gray-300 font-sans">GPIB Address:</b> 0</Typography></Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}><Typography variant="body2" className="text-[11px] text-emerald-400 font-bold font-mono">Status: Connected</Typography></Grid>
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
                      setInstrumentInfoModal({ 
                        ...instrument, 
                        brand: instrument.brand || 'Unknown', 
                        model: instrument.model || instrument.name, 
                        calibrationStatus: isThisDeviceCalibrating ? 'In Progress' : 'Pending' 
                      });
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
            onClick={() => { 
              if (isCalibrationActive) {
                setInstrumentInfoModal({ 
                  ...effectiveUut, 
                  brand: effectiveUut.brand || 'Unknown', 
                  model: effectiveUut.model || effectiveUut.name, 
                  calibrationStatus: 'In Progress' 
                });
              } 
            }}
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

      {/* Finished Calibrated Instruments Log */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 0.5, fontWeight: 'bold' }}>
          Finished Calibrations Log
        </Typography>
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
              <TableRow>
                <TableCell><strong>Instrument Name</strong></TableCell>
                <TableCell><strong>Serial Number</strong></TableCell>
                <TableCell><strong>Completion Date</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {finishedCalibrations.length > 0 ? finishedCalibrations.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>{record.instrumentName}</TableCell>
                  <TableCell>{record.serialNumber}</TableCell>
                  <TableCell>{record.completionDate}</TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ bgcolor: 'success.dark', color: 'white', px: 1, py: 0.5, borderRadius: 1, fontWeight: 'bold' }}>
                      {record.status}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Test Points">
                      <IconButton size="small" onClick={() => handleViewResults(record)} color="primary">
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Excel">
                      <IconButton size="small" onClick={() => handleDownloadExcel(record)} color="success">
                        <FileDownloadOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Record">
                      <IconButton size="small" onClick={() => handleDeleteRecord(record.id)} color="error">
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No completed calibrations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
              <TableContainer component={Paper} variant="outlined" sx={{ bgcolor: 'transparent' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
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
{instrumentInfoModal?.calibrationStatus === 'In Progress' && (
            <Button 
              variant="contained" 
              onClick={() => {
                const storedModeRaw = sessionStorage.getItem('calState_operationalMode');
                const storedSpeedRaw = sessionStorage.getItem('calState_readSpeed');
                const storedMode = storedModeRaw ? JSON.parse(storedModeRaw) : (currentSession?.operationalMode || 'semi-automatic');
                const storedSpeed = storedSpeedRaw ? JSON.parse(storedSpeedRaw) : (currentSession?.readSpeed || 800);
                
                navigate(`/calibration/run/${instrumentInfoModal.id || effectiveUut?.id}`, { 
                  state: { operationalMode: storedMode, readSpeed: storedSpeed } 
                });
              }} 
              sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' }, color: 'white', fontWeight: 'bold' }}
            >
              Go to Calibration Run
            </Button>
          )}
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
          {selectedOperationalMode === 'fully-automatic' && (
            <TextField
              margin="dense"
              label="Time between trials (ms)"
              type="number"
              fullWidth
              value={readSpeed}
              onChange={(e) => setReadSpeed(parseInt(e.target.value, 10) || 800)}
              sx={{ mt: 2 }}
            />
          )}
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

      {/* View Results Modal */}
      <Dialog open={Boolean(viewResultsModal)} onClose={() => setViewResultsModal(null)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Calibration Results</DialogTitle>
        <DialogContent dividers>
          {viewResultsModal && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Instrument Name</Typography>
                  <Typography fontWeight="bold">{viewResultsModal.instrumentName}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Serial Number</Typography>
                  <Typography fontWeight="bold">{viewResultsModal.serialNumber}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Completion Date</Typography>
                  <Typography>{viewResultsModal.completionDate}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Typography color="success.main" fontWeight="bold">{viewResultsModal.status}</Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>Executed Test Points</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ bgcolor: 'transparent' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                    <TableRow>
                      <TableCell><strong>Test Point</strong></TableCell>
                      <TableCell><strong>Applied Value</strong></TableCell>
                      <TableCell><strong>Reading</strong></TableCell>
                      <TableCell><strong>Deviation</strong></TableCell>
                      <TableCell><strong>Result</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewResultsModal.testPoints.map((tp, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>{tp.name}</TableCell>
                        <TableCell>{tp.applied}</TableCell>
                        <TableCell>{tp.reading}</TableCell>
                        <TableCell>{tp.deviation}</TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ color: tp.result === 'Pass' ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                            {tp.result}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained" 
            color="success"
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={() => handleDownloadExcel(viewResultsModal)}
          >
            Export Excel
          </Button>
          <Button onClick={() => setViewResultsModal(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InstrumentConnection;