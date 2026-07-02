// frontend/src/pages/calibration/LiveCalibrationRun.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  TextField,
  Alert,
  Snackbar,
  Grid,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CableIcon from '@mui/icons-material/Cable';
import ScienceIcon from '@mui/icons-material/Science';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CircularProgress from '@mui/material/CircularProgress';

import { selectUutDetails } from '../../store/calibration/selectors';

const MOCK_CALIBRATION_DATA = [
  {
    name: 'DC Current Zero Offset Test',
    trials: 5,
    connection: { title: 'DC Current Zero Offset Test', text: 'Connect:\n5522A Current Output\n↓\nUUT Current Input\n\nRange: mA' },
    values: [{ applied: '0', unit: 'mA' }, { applied: '0', unit: 'mA' }, { applied: '0', unit: 'A' }, { applied: '0', unit: 'A' }]
  },
  {
    name: 'DC Voltage Zero Offset Test',
    trials: 5,
    connection: { title: 'DC Voltage Zero Offset Test', text: 'Reconnect Leads\n\n5522A Voltage Output\n↓\nUUT Voltage Input' },
    values: [{ applied: '0', unit: 'mV' }, { applied: '0', unit: 'V' }, { applied: '0', unit: 'V' }, { applied: '0', unit: 'V' }, { applied: '0', unit: 'V' }]
  },
  {
    name: '2-Wire Ohms Zero Offset Test',
    trials: 5,
    connection: { title: '2-Wire Ohms Zero Offset Test', text: 'Reconnect Leads\n\n5522A Normal Output\n↓\nUUT Resistance Input (2-Wire)' },
    values: [{ applied: '0', unit: 'Ω' }, { applied: '0', unit: 'kΩ' }, { applied: '0', unit: 'kΩ' }, { applied: '0', unit: 'kΩ' }, { applied: '0', unit: 'MΩ' }, { applied: '0', unit: 'MΩ' }, { applied: '0', unit: 'MΩ' }]
  },
  {
    name: '4-Wire Ohms Zero Offset Test',
    trials: 5,
    connection: { title: '4-Wire Ohms Zero Offset Test', text: 'Reconnect Leads\n\n5522A Normal & Aux Output\n↓\nUUT Resistance Input (4-Wire)' },
    values: [{ applied: '0', unit: 'Ω' }, { applied: '0', unit: 'kΩ' }, { applied: '0', unit: 'kΩ' }, { applied: '0', unit: 'kΩ' }, { applied: '0', unit: 'MΩ' }, { applied: '0', unit: 'MΩ' }, { applied: '0', unit: 'MΩ' }]
  },
  {
    name: 'DC Voltage Gain Test',
    trials: 5,
    connection: { title: 'DC Voltage Gain Test', text: 'Reconnect Leads\n\n5522A Voltage Output\n↓\nUUT Voltage Input' },
    values: [{ applied: '100', unit: 'mV' }, { applied: '1', unit: 'V' }, { applied: '10', unit: 'V' }, { applied: '-10', unit: 'V' }, { applied: '100', unit: 'V' }, { applied: '1000', unit: 'V' }]
  },
  {
    name: '2-Wire Ohms Gain Test',
    trials: 5,
    connection: { title: '2-Wire Ohms Gain Test', text: 'Reconnect Leads\n\n5522A Normal Output\n↓\nUUT Resistance Input (2-Wire)' },
    values: [{ applied: '100', unit: 'Ω' }, { applied: '1', unit: 'kΩ' }, { applied: '10', unit: 'kΩ' }, { applied: '100', unit: 'kΩ' }, { applied: '1', unit: 'MΩ' }, { applied: '10', unit: 'MΩ' }, { applied: '100', unit: 'MΩ' }]
  },
  {
    name: '4-Wire Ohms Gain Test',
    trials: 5,
    connection: { title: '4-Wire Ohms Gain Test', text: 'Reconnect Leads\n\n5522A Normal & Aux Output\n↓\nUUT Resistance Input (4-Wire)' },
    values: [{ applied: '100', unit: 'Ω' }, { applied: '1', unit: 'kΩ' }, { applied: '10', unit: 'kΩ' }, { applied: '100', unit: 'kΩ' }, { applied: '1', unit: 'MΩ' }, { applied: '10', unit: 'MΩ' }, { applied: '100', unit: 'MΩ' }]
  },
  {
    name: 'DC Current Gain Test',
    trials: 5,
    connection: { title: 'DC Current Gain Test', text: 'Reconnect Leads\n\n5522A Current Output\n↓\nUUT Current Input' },
    values: [{ applied: '10', unit: 'mA' }, { applied: '100', unit: 'mA' }, { applied: '1', unit: 'A' }, { applied: '2', unit: 'A' }]
  },
  {
    name: 'AC Voltage Gain Test',
    trials: 5,
    connection: { title: 'AC Voltage Gain Test', text: 'Reconnect Leads\n\n5522A Voltage Output\n↓\nUUT Voltage Input' },
    values: [
      { applied: '10', unit: 'mV', freq: '1 kHz' }, { applied: '100', unit: 'mV', freq: '1 kHz' }, { applied: '100', unit: 'mV', freq: '50 kHz' },
      { applied: '1', unit: 'V', freq: '1 kHz' }, { applied: '1', unit: 'V', freq: '50 kHz' }, { applied: '10', unit: 'V', freq: '1 kHz' },
      { applied: '10', unit: 'V', freq: '50 kHz' }, { applied: '10', unit: 'V', freq: '10 Hz' }, { applied: '100', unit: 'V', freq: '1 kHz' },
      { applied: '100', unit: 'V', freq: '50 kHz' }, { applied: '750', unit: 'V', freq: '1 kHz' }, { applied: '750', unit: 'V', freq: '50 kHz' }
    ]
  },
  {
    name: 'AC Current Gain Test',
    trials: 5,
    connection: { title: 'AC Current Gain Test', text: 'Reconnect Leads\n\n5522A Current Output\n↓\nUUT Current Input' },
    values: [{ applied: '1', unit: 'A', freq: '1 kHz' }, { applied: '2', unit: 'A', freq: '1 kHz' }]
  },
  {
    name: 'Frequency Gain Test',
    trials: 5,
    connection: { title: 'Frequency Gain Test', text: 'Reconnect Leads\n\n5522A Normal Output\n↓\nUUT Frequency Input' },
    values: [{ applied: '0.1', unit: 'Vrms', freq: '100 Hz' }, { applied: '1', unit: 'Vrms', freq: '100 kHz' }]
  }
];


const LiveCalibrationRun = () => {
  const navigate = useNavigate();
  const uutDetails = useSelector(selectUutDetails);
  
  // State Machine: START, CONNECTION, APPLIED_VALUE, STATUS, READING, COMPLETION
  const [workflowStep, setWorkflowStep] = useState('START');
  
  const [unitIndex, setUnitIndex] = useState(0);
  const [valIndex, setValIndex] = useState(0);
  
  const [readings, setReadings] = useState(['', '', '', '', '']);
  
  const [calibratorMode, setCalibratorMode] = useState('STBY'); // STBY or OPR

  
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Stats
  const [startTime] = useState(Date.now());
  const [totalReadingsEntered, setTotalReadingsEntered] = useState(0);

  const currentUnit = MOCK_CALIBRATION_DATA[unitIndex];
  const currentValue = currentUnit ? currentUnit.values[valIndex] : null;

  const totalActions = MOCK_CALIBRATION_DATA.reduce((acc, curr) => acc + curr.values.length, 0);
  const completedActions = MOCK_CALIBRATION_DATA.slice(0, unitIndex).reduce((acc, curr) => acc + curr.values.length, 0) + valIndex;
  const progressPercent = Math.round((completedActions / totalActions) * 100);

  // Transitions
  const handleStart = () => {
    setWorkflowStep('CONNECTION');
  };

  const handleConnectionReady = () => {
    setWorkflowStep('APPLIED_VALUE');
  };

  const handleConnectionBack = () => {
    if (unitIndex === 0 && valIndex === 0) {
      setWorkflowStep('START');
    } else {
      // Revert logic (simplification for mock: just go back to previous step logic or stay)
      setWorkflowStep('READING');
    }
  };

  const handleStartOutput = () => {
    setCalibratorMode('OPR');
    setWorkflowStep('READING');
  };

  const handleReadingChange = (index, val) => {
    const newReadings = [...readings];
    newReadings[index] = val;
    setReadings(newReadings);
  };

  const isSubmitDisabled = () => {
    if (!currentUnit) return true;
    for (let i = 0; i < currentUnit.trials; i++) {
      if (readings[i].trim() === '') return true;
    }
    return false;
  };

  const handleSubmitReadings = () => {
    setTotalReadingsEntered(prev => prev + currentUnit.trials);
    setShowSuccessToast(true);
    
    // Auto advance
    setTimeout(() => {
      setShowSuccessToast(false);
      setCalibratorMode('STBY');
      
      if (valIndex + 1 < currentUnit.values.length) {
        // Next value in same unit
        setValIndex(v => v + 1);
        setReadings(['', '', '', '', '']);
        setWorkflowStep('APPLIED_VALUE');
      } else if (unitIndex + 1 < MOCK_CALIBRATION_DATA.length) {
        // Next Unit entirely
        setUnitIndex(u => u + 1);
        setValIndex(0);
        setReadings(['', '', '', '', '']);
        setWorkflowStep('CONNECTION');
      } else {
        // Done
        setWorkflowStep('COMPLETION');
      }
    }, 1000);
  };

  // --- RENDERING SECTIONS ---
  const renderLeftSidebar = () => (
    <Box sx={{ width: 240, borderRight: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, overflowY: 'auto' }}>
      <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'block', mb: 0.5 }}>Calibration Session</Typography>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2 }}>{uutDetails?.name || 'Generic Device'}</Typography>
        <Typography variant="caption" color="text.secondary">SN: {uutDetails?.serialNumber || 'Mock-SN-123'}</Typography>
      </Box>

      <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: calibratorMode === 'OPR' ? 'success.lightest' : 'grey.50' }}>
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ fontSize: '0.65rem' }}>CONNECTED CALIBRATOR</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                <CableIcon sx={{ fontSize: 14, mr: 0.5 }} />
              </Box>
            </Box>
            <Typography variant="body2" fontWeight="bold">Fluke 5522A</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>SN: 987654321 | GPIB: 0</Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: calibratorMode === 'OPR' ? 1 : 0 }}>
              <Box 
                sx={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  mr: 1,
                  bgcolor: calibratorMode === 'OPR' ? 'success.main' : 'error.main',
                  animation: calibratorMode === 'OPR' ? 'pulse 1.5s infinite' : 'pulse-red 1.5s infinite',
                  '@keyframes pulse': {
                    '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)' },
                    '70%': { boxShadow: '0 0 0 6px rgba(76, 175, 80, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' }
                  },
                  '@keyframes pulse-red': {
                    '0%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.7)' },
                    '70%': { boxShadow: '0 0 0 6px rgba(244, 67, 54, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)' }
                  }
                }} 
              />
              <Typography variant="caption" fontWeight="bold" color={calibratorMode === 'OPR' ? 'success.main' : 'error.main'}>
                {calibratorMode === 'OPR' ? 'OPERATING (OPR)' : 'STANDBY (STBY)'}
              </Typography>
            </Box>

            {calibratorMode === 'OPR' && (
              <Button 
                variant="outlined" 
                color="error" 
                size="small" 
                fullWidth
                sx={{ py: 0.25, fontSize: '0.7rem' }}
                onClick={() => setCalibratorMode('STBY')}
              >
                Set to Standby
              </Button>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ p: 1, flexGrow: 1 }}>
        <Typography variant="caption" fontWeight="bold" gutterBottom sx={{ display: 'block' }}>Overall Progress</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 5, borderRadius: 2 }} />
          </Box>
          <Box sx={{ minWidth: 30 }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">{progressPercent}%</Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{completedActions} of {totalActions} Test Points Completed</Typography>

        {currentUnit && workflowStep !== 'COMPLETION' && (
          <Box sx={{ mt: 1.5, bgcolor: 'white', p: 1, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="primary.main" fontWeight="bold" sx={{ fontSize: '0.65rem' }}>CURRENT UNIT</Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>{currentUnit.name}</Typography>
            {currentValue && (
              <>
                <Typography variant="caption" sx={{ display: 'block' }}>Target: {currentValue.applied} {currentValue.unit}</Typography>
                {currentValue.freq && <Typography variant="caption" sx={{ display: 'block' }}>Freq: {currentValue.freq}</Typography>}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.65rem' }}>Point {valIndex + 1} of {currentUnit.values.length}</Typography>
              </>
            )}
          </Box>
        )}

        {/* Upcoming Units Preview */}
        {currentUnit && workflowStep !== 'COMPLETION' && unitIndex + 1 < MOCK_CALIBRATION_DATA.length && (
          <Box sx={{ mt: 1.5 }}>
            {MOCK_CALIBRATION_DATA.slice(unitIndex + 1, unitIndex + 3).map((nextUnit, idx) => (
              <Box key={idx} sx={{ mb: 1, bgcolor: 'transparent', p: 1, borderRadius: 1.5, border: '2px solid', borderColor: '#4caf50' }}>
                <Typography variant="body2" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5 }}>{nextUnit.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>{nextUnit.values.length} Test Points</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );

  const renderCenterContent = () => {

    switch (workflowStep) {
      case 'START':
        return (
          <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', textAlign: 'center', mt: 2, px: 4 }}>
            <ScienceIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />


            <Typography variant="h5" fontWeight="bold" gutterBottom>Semi-Automated Calibration</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              The system will control the Fluke 5522A Calibrator automatically. You will be prompted to change physical connections and enter the UUT readings manually at each step.
            </Typography>
            <Card sx={{ mt: 1.5, textAlign: 'left', borderRadius: 2, border: '1px solid', borderColor: 'divider' }} elevation={0}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">TARGET INSTRUMENT</Typography>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{uutDetails?.name || 'Generic Calibrator Template'}</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary" fontWeight="bold">CONNECTED REFERENCE</Typography>
                <Typography variant="subtitle1" fontWeight="bold">Fluke 5522A Multi-Product Calibrator</Typography>
              </CardContent>
            </Card>
            <Button variant="contained" size="medium" sx={{ mt: 2, py: 1, px: 4, fontWeight: 'bold', borderRadius: 4 }} onClick={handleStart}>
              Start Calibration
            </Button>
          </Box>
        );

      case 'CONNECTION':
        return (
          <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', textAlign: 'center', mt: 2, px: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>{currentUnit.connection.title}</Typography>

            <Card sx={{ mt: 1.5, bgcolor: 'warning.lightest', border: '1px solid', borderColor: 'warning.main', borderRadius: 2 }} elevation={0}>

              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <CableIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold" color="warning.dark" gutterBottom>Connection Instructions</Typography>
                <Box sx={{ whiteSpace: 'pre-line', typography: 'body2', fontWeight: 'medium', mt: 1.5, bgcolor: 'white', p: 1.5, borderRadius: 1.5, border: '1px dashed', borderColor: 'warning.main' }}>
                  {currentUnit.connection.text}
                </Box>
              </CardContent>
            </Card>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={handleConnectionBack} sx={{ py: 0.75, px: 3 }}>Back</Button>
              <Button variant="contained" color="success" onClick={handleConnectionReady} sx={{ py: 0.75, px: 4, fontWeight: 'bold' }}>Ready</Button>
            </Box>
          </Box>
        );

      case 'APPLIED_VALUE':
        return (
          <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', textAlign: 'center', mt: 2, px: 4 }}>
            <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom>{currentUnit.name}</Typography>

            <Card sx={{ mt: 1.5, py: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'white' }} elevation={2}>

              <Typography variant="caption" color="text.secondary" fontWeight="bold">Current Applied Value</Typography>
              <Typography variant="h3" fontWeight="bold" sx={{ my: 1 }}>{currentValue.applied} <Typography component="span" variant="h5" color="text.secondary">{currentValue.unit}</Typography></Typography>
              {currentValue.freq && (
                <Typography variant="subtitle1" color="text.secondary">@ {currentValue.freq}</Typography>
              )}
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>Trial {valIndex + 1} of {currentUnit.values.length}</Typography>
            </Card>
            <Button variant="contained" onClick={handleStartOutput} sx={{ mt: 2, py: 1, px: 4, fontWeight: 'bold', borderRadius: 4 }}>
              Start Output
            </Button>
          </Box>
        );

      case 'READING':
        return (
          <Box sx={{ width: '100%', mx: 'auto', textAlign: 'center', mt: 2, px: 4, display: 'flex', flexDirection: 'column', flexGrow: 1, pb: 4 }}>
             <Typography variant="h5" fontWeight="bold" color="success.main" gutterBottom>Reading Entry</Typography>

             <Typography variant="body2" color="text.secondary" gutterBottom>Read the value shown on the UUT and enter the displayed reading.</Typography>
             
             <Card sx={{ mt: 1.5, p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'white', display: 'flex', flexDirection: 'column', flexGrow: 1 }} elevation={2}>
                <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 1, justifyContent: 'center', overflowX: 'auto', pb: 1, flexGrow: 1, alignItems: 'center' }}>
                  {Array.from({ length: currentUnit.trials }).map((_, idx) => (
                    <TextField
                      key={idx}
                      label={`Trial ${idx + 1}`}
                      variant="outlined"
                      size="small"
                      type="number"
                      value={readings[idx]}
                      onChange={(e) => handleReadingChange(idx, e.target.value)}
                      InputProps={{
                        endAdornment: <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>{currentValue.unit}</Typography>
                      }}
                      sx={{ minWidth: 120, flex: 1, '& .MuiOutlinedInput-root': { fontSize: '0.9rem' } }}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 2 }}>
                  <Button variant="outlined" size="small" sx={{ px: 2 }}>Prev Applied</Button>
                  <Button variant="contained" color="primary" onClick={handleSubmitReadings} disabled={isSubmitDisabled()} sx={{ px: 3, fontWeight: 'bold' }}>
                    Submit
                  </Button>
                  <Button variant="outlined" size="small" disabled sx={{ px: 2 }}>Next Applied</Button>
               </Box>
             </Card>

          </Box>
        );

      case 'COMPLETION':
        const durationMinutes = Math.round((Date.now() - startTime) / 60000);
        return (
          <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', textAlign: 'center', mt: 2, px: 4 }}>
            <AssignmentTurnedInIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />


            <Typography variant="h5" fontWeight="bold" gutterBottom>Calibration Completed</Typography>
            <Card sx={{ mt: 1.5, textAlign: 'left', borderRadius: 2, border: '1px solid', borderColor: 'divider' }} elevation={0}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}><Typography color="text.secondary">Total Units Completed</Typography></Grid>
                  <Grid item xs={6}><Typography fontWeight="bold">{MOCK_CALIBRATION_DATA.length}</Typography></Grid>
                  
                  <Grid item xs={6}><Typography color="text.secondary">Total Applied Values Executed</Typography></Grid>
                  <Grid item xs={6}><Typography fontWeight="bold">{totalActions}</Typography></Grid>
                  
                  <Grid item xs={6}><Typography color="text.secondary">Total Readings Entered</Typography></Grid>
                  <Grid item xs={6}><Typography fontWeight="bold">{totalReadingsEntered}</Typography></Grid>
                  
                  <Grid item xs={6}><Typography color="text.secondary">Calibration Duration</Typography></Grid>
                  <Grid item xs={6}><Typography fontWeight="bold">{durationMinutes} minutes</Typography></Grid>
                  
                  <Grid item xs={6}><Typography color="text.secondary">Connected Instrument</Typography></Grid>
                  <Grid item xs={6}><Typography fontWeight="bold">Fluke 5522A</Typography></Grid>

                  <Grid item xs={6}><Typography color="text.secondary">Calibration Status</Typography></Grid>
                  <Grid item xs={6}><Typography fontWeight="bold" color="success.main">Completed</Typography></Grid>
                </Grid>
              </CardContent>
            </Card>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
              <Button variant="outlined" size="large">Export Results</Button>
              <Button variant="contained" color="success" size="large">Save Calibration</Button>
              <Button variant="outlined" size="large" onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', bgcolor: 'grey.100' }}>
      {renderLeftSidebar()}
      
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {renderCenterContent()}

        <Snackbar
          open={showSuccessToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={2000}
        >
          <Alert severity="success" variant="filled" sx={{ width: '100%', fontSize: '1.1rem', py: 1.5 }}>
            Readings submitted successfully! Advancing...
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default LiveCalibrationRun;
