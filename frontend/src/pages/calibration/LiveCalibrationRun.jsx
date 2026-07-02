// frontend/src/pages/calibration/LiveCalibrationRun.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CableIcon from '@mui/icons-material/Cable';
import ScienceIcon from '@mui/icons-material/Science';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CircularProgress from '@mui/material/CircularProgress';

import { selectUutDetails, selectCurrentCalibrationSession } from '../../store/calibration/selectors';

const useSessionState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`calState_${key}`);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn(`Failed to parse session state for ${key}`, e);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(`calState_${key}`, JSON.stringify(state));
    } catch (e) {
      console.warn(`Failed to save session state for ${key}`, e);
    }
  }, [key, state]);

  return [state, setState];
};

const MOCK_CALIBRATION_DATA = [
  {
    name: 'DC Current Zero Offset Test',
    trials: 5,
    connection: { title: 'DC Current Zero Offset Test', text: 'Connect:\n5522A Current Output\n↓\nUUT Current Input\n\nRange: mA' },
    values: [
      { applied: '0', unit: 'mA', tolerance: '-0.0005 to +0.0005' },
      { applied: '0', unit: 'mA', tolerance: '-0.0005 to +0.0005' },
      { applied: '0', unit: 'A', tolerance: '-0.00005 to +0.00005' },
      { applied: '0', unit: 'A', tolerance: '-0.00005 to +0.00005' }
    ]
  },
  {
    name: 'DC Voltage Zero Offset Test',
    trials: 5,
    connection: { title: 'DC Voltage Zero Offset Test', text: 'Reconnect Leads\n\n5522A Voltage Output\n↓\nUUT Voltage Input' },
    values: [
      { applied: '0', unit: 'mV', tolerance: '-0.003 to +0.003' },
      { applied: '0', unit: 'V', tolerance: '-0.00001 to +0.00001' },
      { applied: '0', unit: 'V', tolerance: '-0.00001 to +0.00001' },
      { applied: '0', unit: 'V', tolerance: '-0.00001 to +0.00001' },
      { applied: '0', unit: 'V', tolerance: '-0.00001 to +0.00001' }
    ]
  },
  {
    name: '2-Wire Ohms Zero Offset Test',
    trials: 5,
    connection: { title: '2-Wire Ohms Zero Offset Test', text: 'Reconnect Leads\n\n5522A Normal Output\n↓\nUUT Resistance Input (2-Wire)' },
    values: [
      { applied: '0', unit: 'Ω', tolerance: '-0.005 to +0.005' },
      { applied: '0', unit: 'kΩ', tolerance: '-0.00005 to +0.00005' },
      { applied: '0', unit: 'kΩ', tolerance: '-0.00005 to +0.00005' },
      { applied: '0', unit: 'kΩ', tolerance: '-0.00005 to +0.00005' },
      { applied: '0', unit: 'MΩ', tolerance: '-0.000005 to +0.000005' },
      { applied: '0', unit: 'MΩ', tolerance: '-0.000005 to +0.000005' },
      { applied: '0', unit: 'MΩ', tolerance: '-0.000005 to +0.000005' }
    ]
  },
  {
    name: '4-Wire Ohms Zero Offset Test',
    trials: 5,
    connection: { title: '4-Wire Ohms Zero Offset Test', text: 'Reconnect Leads\n\n5522A Normal & Aux Output\n↓\nUUT Resistance Input (4-Wire)' },
    values: [
      { applied: '0', unit: 'Ω', tolerance: '-0.002 to +0.002' },
      { applied: '0', unit: 'kΩ', tolerance: '-0.00002 to +0.00002' },
      { applied: '0', unit: 'kΩ', tolerance: '-0.00002 to +0.00002' },
      { applied: '0', unit: 'kΩ', tolerance: '-0.00002 to +0.00002' },
      { applied: '0', unit: 'MΩ', tolerance: '-0.000002 to +0.000002' },
      { applied: '0', unit: 'MΩ', tolerance: '-0.000002 to +0.000002' },
      { applied: '0', unit: 'MΩ', tolerance: '-0.000002 to +0.000002' }
    ]
  },
  {
    name: 'DC Voltage Gain Test',
    trials: 5,
    connection: { title: 'DC Voltage Gain Test', text: 'Reconnect Leads\n\n5522A Voltage Output\n↓\nUUT Voltage Input' },
    values: [
      { applied: '100', unit: 'mV', tolerance: '99.995 to 100.005' },
      { applied: '1', unit: 'V', tolerance: '0.99995 to 1.00005' },
      { applied: '10', unit: 'V', tolerance: '9.99985 to 10.00015' },
      { applied: '-10', unit: 'V', tolerance: '-10.00015 to -9.99985' },
      { applied: '100', unit: 'V', tolerance: '99.998 to 100.002' },
      { applied: '1000', unit: 'V', tolerance: '999.98 to 1000.02' }
    ]
  },
  {
    name: '2-Wire Ohms Gain Test',
    trials: 5,
    connection: { title: '2-Wire Ohms Gain Test', text: 'Reconnect Leads\n\n5522A Normal Output\n↓\nUUT Resistance Input (2-Wire)' },
    values: [
      { applied: '100', unit: 'Ω', tolerance: '99.990 to 100.010' },
      { applied: '1', unit: 'kΩ', tolerance: '0.99990 to 1.00010' },
      { applied: '10', unit: 'kΩ', tolerance: '9.9990 to 10.0010' },
      { applied: '100', unit: 'kΩ', tolerance: '99.990 to 100.010' },
      { applied: '1', unit: 'MΩ', tolerance: '0.99990 to 1.00010' },
      { applied: '10', unit: 'MΩ', tolerance: '9.9950 to 10.0050' },
      { applied: '100', unit: 'MΩ', tolerance: '99.900 to 100.100' }
    ]
  },
  {
    name: '4-Wire Ohms Gain Test',
    trials: 5,
    connection: { title: '4-Wire Ohms Gain Test', text: 'Reconnect Leads\n\n5522A Normal & Aux Output\n↓\nUUT Resistance Input (4-Wire)' },
    values: [
      { applied: '100', unit: 'Ω', tolerance: '99.995 to 100.005' },
      { applied: '1', unit: 'kΩ', tolerance: '0.99995 to 1.00005' },
      { applied: '10', unit: 'kΩ', tolerance: '9.9995 to 10.0005' },
      { applied: '100', unit: 'kΩ', tolerance: '99.995 to 100.005' },
      { applied: '1', unit: 'MΩ', tolerance: '0.99995 to 1.00005' },
      { applied: '10', unit: 'MΩ', tolerance: '9.9950 to 10.0050' },
      { applied: '100', unit: 'MΩ', tolerance: '99.900 to 100.100' }
    ]
  },
  {
    name: 'DC Current Gain Test',
    trials: 5,
    connection: { title: 'DC Current Gain Test', text: 'Reconnect Leads\n\n5522A Current Output\n↓\nUUT Current Input' },
    values: [
      { applied: '10', unit: 'mA', tolerance: '9.9990 to 10.0010' },
      { applied: '100', unit: 'mA', tolerance: '99.990 to 100.010' },
      { applied: '1', unit: 'A', tolerance: '0.99980 to 1.00020' },
      { applied: '2', unit: 'A', tolerance: '1.99960 to 2.00040' }
    ]
  },
  {
    name: 'AC Voltage Gain Test',
    trials: 5,
    connection: { title: 'AC Voltage Gain Test', text: 'Reconnect Leads\n\n5522A Voltage Output\n↓\nUUT Voltage Input' },
    values: [
      { applied: '10', unit: 'mV', freq: '1 kHz', tolerance: '9.990 to 10.010' }, 
      { applied: '100', unit: 'mV', freq: '1 kHz', tolerance: '99.90 to 100.10' }, 
      { applied: '100', unit: 'mV', freq: '50 kHz', tolerance: '99.80 to 100.20' },
      { applied: '1', unit: 'V', freq: '1 kHz', tolerance: '0.9990 to 1.0010' }, 
      { applied: '1', unit: 'V', freq: '50 kHz', tolerance: '0.9980 to 1.0020' }, 
      { applied: '10', unit: 'V', freq: '1 kHz', tolerance: '9.990 to 10.010' },
      { applied: '10', unit: 'V', freq: '50 kHz', tolerance: '9.980 to 10.020' }, 
      { applied: '10', unit: 'V', freq: '10 Hz', tolerance: '9.990 to 10.010' }, 
      { applied: '100', unit: 'V', freq: '1 kHz', tolerance: '99.90 to 100.10' },
      { applied: '100', unit: 'V', freq: '50 kHz', tolerance: '99.80 to 100.20' }, 
      { applied: '750', unit: 'V', freq: '1 kHz', tolerance: '749.0 to 751.0' }, 
      { applied: '750', unit: 'V', freq: '50 kHz', tolerance: '748.0 to 752.0' }
    ]
  },
  {
    name: 'AC Current Gain Test',
    trials: 5,
    connection: { title: 'AC Current Gain Test', text: 'Reconnect Leads\n\n5522A Current Output\n↓\nUUT Current Input' },
    values: [
      { applied: '1', unit: 'A', freq: '1 kHz', tolerance: '0.9990 to 1.0010' }, 
      { applied: '2', unit: 'A', freq: '1 kHz', tolerance: '1.9980 to 2.0020' }
    ]
  },
  {
    name: 'Frequency Gain Test',
    trials: 5,
    connection: { title: 'Frequency Gain Test', text: 'Reconnect Leads\n\n5522A Normal Output\n↓\nUUT Frequency Input' },
    values: [
      { applied: '0.1', unit: 'Vrms', freq: '100 Hz', tolerance: '99.990 to 100.010 Hz' }, 
      { applied: '1', unit: 'Vrms', freq: '100 kHz', tolerance: '99.990 to 100.010 kHz' }
    ]
  }
];


const LiveCalibrationRun = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const uutDetails = useSelector(selectUutDetails);
  const currentSession = useSelector(selectCurrentCalibrationSession);
  
  // Use location.state to strictly honor the dialog selection and prevent Redux stale-state bleeding
  const storedModeRaw = sessionStorage.getItem('calState_operationalMode');
  const storedMode = storedModeRaw ? JSON.parse(storedModeRaw) : null;
  const operationalMode = location.state?.operationalMode || storedMode || currentSession?.operationalMode || 'semi-automatic';
  const isFullyAuto = operationalMode === 'fully-automatic';
  
  // State Machine: START, CONNECTION, APPLIED_VALUE, STATUS, READING, COMPLETION, AUTOMATED_SEQUENCE
  const [workflowStep, setWorkflowStep] = useSessionState('workflowStep', 'START');
  
  const [unitIndex, setUnitIndex] = useSessionState('unitIndex', 0);
  
  // Automation Sub-State Machine for Fully-Automated mode
  const [autoPhase, setAutoPhase] = useSessionState('autoPhase', 'IDLE');
  const [autoActivePointIndex, setAutoActivePointIndex] = useSessionState('autoActivePointIndex', 0);
  const [autoTrialIndex, setAutoTrialIndex] = useSessionState('autoTrialIndex', 0);
  const [autoResults, setAutoResults] = useSessionState('autoResults', []);
  const [isAutoPaused, setIsAutoPaused] = useSessionState('isAutoPaused', false);
  const [valIndex, setValIndex] = useSessionState('valIndex', 0);
  
  const storedSpeedRaw = sessionStorage.getItem('calState_readSpeed');
  const storedSpeed = storedSpeedRaw ? JSON.parse(storedSpeedRaw) : null;
  const [readSpeed, setReadSpeed] = useSessionState('readSpeed', location.state?.readSpeed || storedSpeed || currentSession?.readSpeed || 800);
  
  const [readings, setReadings] = useSessionState('readings', ['', '', '', '', '']);
  
  const [calibratorMode, setCalibratorMode] = useSessionState('calibratorMode', 'STBY'); // STBY or OPR

  
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Stats
  const [startTime] = useSessionState('startTime', Date.now());
  const [allReadings, setAllReadings] = useSessionState('allReadings', {});
  const totalReadingsEntered = Object.values(allReadings).reduce((sum, arr) => sum + arr.filter(val => val !== undefined && val.toString().trim() !== '').length, 0);

  const [consoleLogs, setConsoleLogs] = useSessionState('consoleLogs', [
    '> INIT: CALIBRATION_SESSION',
    '> CONNECTING TO GPIB:0',
    '> SYSTEM:READY',
  ]);
  const consoleContainerRef = React.useRef(null);

  const addLog = (msg) => {
    setConsoleLogs(prev => [...prev, `> [${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    if (consoleContainerRef.current) {
      consoleContainerRef.current.scrollTo({
        top: consoleContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [consoleLogs]);

  // Automation Engine for Fully Automated Mode
  useEffect(() => {
    if (workflowStep !== 'AUTOMATED_SEQUENCE' || isAutoPaused) return;

    let timer;
    const currentUnitData = MOCK_CALIBRATION_DATA[unitIndex];
    const currentTarget = currentUnitData?.values[autoActivePointIndex];
    
    // If no target exists, unit is complete. Transition and reset.
    if (!currentTarget) {
      if (autoPhase !== 'IDLE') {
        setAutoPhase('IDLE');
        addLog(`SYS: Unit Completed. Reverting calibrator to STBY.`);
        setCalibratorMode('STBY');
        
        if (unitIndex + 1 < MOCK_CALIBRATION_DATA.length) {
          setUnitIndex(prev => prev + 1);
          setValIndex(0);
          setWorkflowStep('CONNECTION');
        } else {
          setWorkflowStep('COMPLETION');
        }
      }
      return;
    }

    switch (autoPhase) {
      case 'CONFIGURING':
        timer = setTimeout(() => {
          addLog(`SYS: Configuring Calibrator for ${currentTarget.applied} ${currentTarget.unit}`);
          setAutoPhase('APPLYING');
        }, 1000);
        break;
      case 'APPLYING':
        timer = setTimeout(() => {
          const freq = currentTarget.freq ? ` @ ${currentTarget.freq}` : '';
          addLog(`CMD: OUT ${currentTarget.applied} ${currentTarget.unit}${freq}`);
          addLog(`CMD: OPR (Operating Mode)`);
          setCalibratorMode('OPR');
          setAutoPhase('STABILIZING');
        }, 1000);
        break;
      case 'STABILIZING':
        timer = setTimeout(() => {
          addLog(`SYS: Waiting for stabilization...`);
          setAutoPhase('READING');
        }, 1500);
        break;
      case 'READING':
        timer = setTimeout(() => {
          addLog(`CMD: READ UUT (via GPIB) - Trial ${autoTrialIndex + 1}`);
          setAutoPhase('VALIDATING');
        }, readSpeed);
        break;
      case 'VALIDATING':
        timer = setTimeout(() => {
          const base = parseFloat(currentTarget.applied);
          const variance = base === 0 ? 0.0001 : Math.abs(base) * 0.00005;
          const mockRead = (base + (Math.random() * variance * 2 - variance)).toFixed(5);
          addLog(`SYS: Trial ${autoTrialIndex + 1} Reading: ${mockRead} ${currentTarget.unit} - Validating`);
          
          setAutoResults(prev => {
            const newRes = [...prev];
            if (!newRes[autoActivePointIndex]) newRes[autoActivePointIndex] = [];
            newRes[autoActivePointIndex][autoTrialIndex] = mockRead;
            return newRes;
          });
          
          if (autoTrialIndex + 1 < currentUnitData.trials) {
            setAutoTrialIndex(prev => prev + 1);
            setAutoPhase('READING');
          } else {
            setAutoPhase('SAVING');
          }
        }, readSpeed);
        break;
      case 'SAVING':
        timer = setTimeout(() => {
          addLog(`SYS: Saved Result for all ${currentUnitData.trials} trials. Advancing to next point.`);
          const keyToSave = `${unitIndex}-${autoActivePointIndex}`;
          setAllReadings(prev => ({
            ...prev,
            [keyToSave]: autoResults[autoActivePointIndex] // Already an array of trials
          }));
          
          setAutoActivePointIndex(prev => prev + 1);
          setValIndex(prev => prev + 1); // Keep the sidebar and progress bar synced
          setAutoTrialIndex(0); // Reset trial index for next target
          setAutoPhase('CONFIGURING');
        }, 800);
        break;
      default:
        break;
    }

    return () => clearTimeout(timer);
  }, [workflowStep, autoPhase, autoActivePointIndex, autoTrialIndex, isAutoPaused, unitIndex, autoResults, readSpeed]);

  const currentUnit = MOCK_CALIBRATION_DATA[unitIndex];
  const currentValue = currentUnit ? currentUnit.values[valIndex] : null;

  const totalActions = MOCK_CALIBRATION_DATA.reduce((acc, curr) => acc + curr.values.length, 0);
  const completedActions = MOCK_CALIBRATION_DATA.slice(0, unitIndex).reduce((acc, curr) => acc + curr.values.length, 0) + valIndex;
  const progressPercent = Math.round((completedActions / totalActions) * 100);

// Transitions
  const handleCancelCalibration = () => {
    if (window.confirm('Are you sure you want to cancel the calibration process? All unsaved progress will be lost.')) {
      addLog('SYS: Calibration Cancelled by User');
      navigate('/calibration');
    }
  };

  const handleResumeCalibration = () => {
    addLog('CMD: OPR (Resuming Operation)');
    setCalibratorMode('OPR');
  };

  const handleStart = () => {
    addLog(`ACTION: Started ${isFullyAuto ? 'Fully-Automated' : 'Semi-Automated'} Calibration`);
    setWorkflowStep('CONNECTION');
  };

  const handleConnectionReady = () => {
    addLog(`ACTION: Connection Confirmed - ${currentUnit?.connection?.title}`);
    if (isFullyAuto) {
      setAutoActivePointIndex(0);
      setAutoTrialIndex(0);
      setValIndex(0); // Sync global progress pointer
      setAutoResults([]);
      setAutoPhase('CONFIGURING');
      setWorkflowStep('AUTOMATED_SEQUENCE');
    } else {
      setWorkflowStep('APPLIED_VALUE');
    }
  };

  const handleConnectionBack = () => {
    addLog(`ACTION: Reverted to Previous Step`);
    if (unitIndex === 0 && valIndex === 0) {
      setWorkflowStep('START');
    } else {
      // Revert logic (simplification for mock: just go back to previous step logic or stay)
      setWorkflowStep('READING');
    }
  };

  const handleStartOutput = () => {
    const val = currentValue?.applied;
    const unit = currentValue?.unit;
    const freq = currentValue?.freq ? ` @ ${currentValue.freq}` : '';
    addLog(`CMD: OUT ${val} ${unit}${freq}`);
    addLog(`CMD: OPR (Operating Mode)`);
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
      if (readings[i] === undefined || readings[i].toString().trim() === '') return true;
    }
    return false;
  };

  const handlePrevApplied = () => {
    const keyToSave = `${unitIndex}-${valIndex}`;
    setAllReadings(prev => ({
      ...prev,
      [keyToSave]: [...readings]
    }));
    
    addLog(`ACTION: Skipped back to Previous Applied Value`);
    setCalibratorMode('STBY');
    
    let nextU = unitIndex;
    let nextV = valIndex;

    if (valIndex > 0) {
      nextV = valIndex - 1;
    } else if (unitIndex > 0) {
      nextU = unitIndex - 1;
      nextV = MOCK_CALIBRATION_DATA[nextU].values.length - 1;
    } else {
      return;
    }

    setUnitIndex(nextU);
    setValIndex(nextV);
    setWorkflowStep('APPLIED_VALUE');
    
    setAllReadings(latestAllReadings => {
      const nextKey = `${nextU}-${nextV}`;
      const saved = latestAllReadings[nextKey];
      setReadings(saved ? [...saved] : Array(MOCK_CALIBRATION_DATA[nextU].trials).fill(''));
      return latestAllReadings;
    });
  };

  const handleNextApplied = () => {
    const keyToSave = `${unitIndex}-${valIndex}`;
    setAllReadings(prev => ({
      ...prev,
      [keyToSave]: [...readings]
    }));
    
    addLog(`ACTION: Skipped to Next Applied Value`);
    setCalibratorMode('STBY');
    
    let nextU = unitIndex;
    let nextV = valIndex;

    if (valIndex + 1 < currentUnit.values.length) {
      nextV = valIndex + 1;
      setUnitIndex(nextU);
      setValIndex(nextV);
      setWorkflowStep('APPLIED_VALUE');
    } else if (unitIndex + 1 < MOCK_CALIBRATION_DATA.length) {
      nextU = unitIndex + 1;
      nextV = 0;
      setUnitIndex(nextU);
      setValIndex(nextV);
      setWorkflowStep('CONNECTION');
    } else {
      setWorkflowStep('COMPLETION');
      return;
    }

    setAllReadings(latestAllReadings => {
      const nextKey = `${nextU}-${nextV}`;
      const saved = latestAllReadings[nextKey];
      setReadings(saved ? [...saved] : Array(MOCK_CALIBRATION_DATA[nextU].trials).fill(''));
      return latestAllReadings;
    });
  };

  const handleSubmitReadings = () => {
    const keyToSave = `${unitIndex}-${valIndex}`;
    setAllReadings(prev => ({
      ...prev,
      [keyToSave]: [...readings]
    }));
    
    addLog(`ACTION: Submitted Readings [${readings.join(', ')}] ${currentValue?.unit}`);
    addLog(`CMD: STBY (Standby Mode)`);
    setShowSuccessToast(true);
    
    setTimeout(() => {
      setShowSuccessToast(false);
      setCalibratorMode('STBY');
      
      let nextU = unitIndex;
      let nextV = valIndex;

      if (valIndex + 1 < currentUnit.values.length) {
        nextV = valIndex + 1;
        setUnitIndex(nextU);
        setValIndex(nextV);
        setWorkflowStep('APPLIED_VALUE');
        addLog(`SYS: Advancing to next test point`);
      } else if (unitIndex + 1 < MOCK_CALIBRATION_DATA.length) {
        nextU = unitIndex + 1;
        nextV = 0;
        setUnitIndex(nextU);
        setValIndex(nextV);
        setWorkflowStep('CONNECTION');
        addLog(`SYS: Unit Completed. Advancing to ${MOCK_CALIBRATION_DATA[nextU].name}`);
      } else {
        setWorkflowStep('COMPLETION');
        addLog(`SYS: Calibration Complete`);
        return;
      }

      setAllReadings(latestAllReadings => {
        const nextKey = `${nextU}-${nextV}`;
        const saved = latestAllReadings[nextKey];
        setReadings(saved ? [...saved] : Array(MOCK_CALIBRATION_DATA[nextU].trials).fill(''));
        return latestAllReadings;
      });

    }, 1000);
  };

  // --- RENDERING SECTIONS ---
  const renderLeftSidebar = () => (
    <Box sx={{ width: 240, borderRight: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255, 255, 255, 0.02)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, overflowY: 'auto' }}>
      <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'transparent' }}>
        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'block', mb: 0.5 }}>Calibration Session</Typography>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2 }}>{uutDetails?.name || 'Generic Device'}</Typography>
        <Typography variant="caption" color="text.secondary">SN: {uutDetails?.serialNumber || 'Mock-SN-123'}</Typography>
      </Box>

      <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'transparent' }}>
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: calibratorMode === 'OPR' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.02)' }}>
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
                onClick={() => {
                  addLog('CMD: STBY (Manual Override)');
                  setCalibratorMode('STBY');
                }}
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
          <Box sx={{ mt: 1.5, bgcolor: 'rgba(255, 255, 255, 0.02)', p: 1, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="primary.main" fontWeight="bold" sx={{ fontSize: '0.65rem' }}>CURRENT UNIT</Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>{currentUnit.name}</Typography>
            {currentValue && (
              <>
                <Typography variant="caption" sx={{ display: 'block' }}>Target: {currentValue.applied} {currentValue.unit}</Typography>
                {currentValue.freq && <Typography variant="caption" sx={{ display: 'block' }}>Freq: {currentValue.freq}</Typography>}
                {currentValue.tolerance && <Typography variant="caption" sx={{ display: 'block', color: 'success.main' }}>Passing Range: {currentValue.tolerance}</Typography>}
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


            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {isFullyAuto ? 'Fully-Automated Calibration' : 'Semi-Automated Calibration'}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {isFullyAuto 
                ? 'The system will control both the Fluke 5522A Calibrator and the UUT automatically via GPIB. You will only be prompted to change physical connections.'
                : 'The system will control the Fluke 5522A Calibrator automatically. You will be prompted to change physical connections and enter the UUT readings manually at each step.'}
            </Typography>
            <Card sx={{ mt: 1.5, textAlign: 'left', borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255, 255, 255, 0.02)' }} elevation={0}>
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

            <Card sx={{ mt: 1.5, bgcolor: 'rgba(255, 152, 0, 0.05)', border: '1px solid', borderColor: 'warning.main', borderRadius: 2 }} elevation={0}>

              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <CableIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold" color="warning.main" gutterBottom>Connection Instructions</Typography>
                <Box sx={{ whiteSpace: 'pre-line', typography: 'body2', fontWeight: 'medium', mt: 1.5, bgcolor: 'rgba(255, 255, 255, 0.02)', p: 1.5, borderRadius: 1.5, border: '1px dashed', borderColor: 'warning.main' }}>
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

      case 'AUTOMATED_SEQUENCE':
        return (
          <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', textAlign: 'center', mt: 2, px: 4, pb: 4 }}>
            <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom>Automated Test Sequence</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              The system is autonomously controlling the calibrator and UUT. Please do not touch the instruments.
            </Typography>

            <Card sx={{ mt: 1.5, p: 3, borderRadius: 3, border: '1px solid', borderColor: isAutoPaused ? 'warning.main' : 'primary.main', bgcolor: isAutoPaused ? 'rgba(255, 152, 0, 0.05)' : 'rgba(25, 118, 210, 0.05)', position: 'relative', overflow: 'hidden' }} elevation={2}>
              {isAutoPaused && (
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bgcolor: 'warning.main', color: 'warning.contrastText', py: 0.5, fontWeight: 'bold' }}>
                  AUTOMATION PAUSED
                </Box>
              )}
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: isAutoPaused ? 2 : 0 }}>
                {currentUnit.name}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 3, textAlign: 'left', maxWidth: 500, mx: 'auto' }}>
                {['CONFIGURING', 'APPLYING', 'STABILIZING', 'READING', 'VALIDATING', 'SAVING'].map((phase, idx) => {
                  const phaseLabels = {
                    'CONFIGURING': 'Configuring Calibrator',
                    'APPLYING': 'Applying Output',
                    'STABILIZING': 'Waiting for Stabilization',
                    'READING': 'Reading UUT via GPIB',
                    'VALIDATING': 'Validating Measurement',
                    'SAVING': 'Saving Result'
                  };
                  
                  const phaseOrder = ['CONFIGURING', 'APPLYING', 'STABILIZING', 'READING', 'VALIDATING', 'SAVING'];
                  const currentIndex = phaseOrder.indexOf(autoPhase);
                  const isPast = idx < currentIndex;
                  const isActive = idx === currentIndex && !isAutoPaused;
                  
                  return (
                    <Box key={phase} sx={{ display: 'flex', alignItems: 'center', gap: 2, opacity: isPast || isActive ? 1 : 0.4 }}>
                      <Box sx={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                        {isPast ? <CheckCircleOutlineIcon color="success" fontSize="small" /> : 
                         isActive ? <CircularProgress size={16} /> : 
                         <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'text.disabled' }} />}
                      </Box>
                      <Typography variant={isActive ? 'subtitle2' : 'body2'} fontWeight={isActive ? 'bold' : 'normal'} color={isActive ? 'primary.main' : 'text.primary'}>
                        {phaseLabels[phase]}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5, textAlign: 'left' }}>Test Points Progress</Typography>
                <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: 'divider' }}>
                  <Table size="small">
                        <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                          <TableRow>
                            <TableCell><strong>#</strong></TableCell>
                            <TableCell><strong>Target</strong></TableCell>
                            <TableCell><strong>Tolerance</strong></TableCell>
                            {Array.from({ length: currentUnit.trials }).map((_, tIdx) => (
                              <TableCell key={tIdx} align="center"><strong>Trial {tIdx + 1}</strong></TableCell>
                            ))}
                            <TableCell align="center"><strong>Status</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {currentUnit.values.map((val, idx) => {
                            const trials = autoResults[idx] || [];
                            const isActiveRow = idx === autoActivePointIndex && !isAutoPaused;
                            const isPastRow = idx < autoActivePointIndex;
                            
                            return (
                              <TableRow key={idx} sx={{ bgcolor: isActiveRow ? 'rgba(25, 118, 210, 0.1)' : 'transparent' }}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{val.applied} {val.unit} {val.freq && `@ ${val.freq}`}</TableCell>
                                <TableCell>{val.tolerance || 'N/A'}</TableCell>
                                {Array.from({ length: currentUnit.trials }).map((_, tIdx) => {
                                  const reading = trials[tIdx];
                                  const isLiveCell = isActiveRow && tIdx === autoTrialIndex && autoPhase === 'READING';
                                  
                                  return (
                                    <TableCell key={tIdx} align="center" sx={{ fontFamily: 'monospace', color: reading ? 'success.main' : (isLiveCell ? 'primary.main' : 'text.disabled'), fontWeight: reading || isLiveCell ? 'bold' : 'normal' }}>
                                      {reading ? reading : (isLiveCell ? '...' : '---')}
                                    </TableCell>
                                  );
                                })}
                                <TableCell align="center">
                                  {isPastRow ? (
                                    <CheckCircleOutlineIcon color="success" fontSize="small" />
                                  ) : isActiveRow ? (
                                    <CircularProgress size={16} />
                                  ) : (
                                    <Typography variant="caption" color="text.secondary">-</Typography>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Card>
            
            <Box sx={{ mt: 3 }}>
              {isAutoPaused ? (
                <Button variant="contained" color="primary" onClick={() => { setIsAutoPaused(false); addLog('SYS: Automation Resumed'); }} sx={{ px: 4, py: 1, fontWeight: 'bold' }}>Resume Automation</Button>
              ) : (
                <Button variant="outlined" color="error" onClick={() => { setIsAutoPaused(true); setCalibratorMode('STBY'); addLog('SYS: Automation Paused by User (Emergency STBY)'); }} sx={{ px: 4, py: 1 }}>Emergency Pause</Button>
              )}
            </Box>
          </Box>
        );

      case 'APPLIED_VALUE':
        return (
          <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', textAlign: 'center', mt: 2, px: 4 }}>
            <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom>{currentUnit.name}</Typography>

            <Card sx={{ mt: 1.5, py: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255, 255, 255, 0.02)' }} elevation={2}>

              <Typography variant="caption" color="text.secondary" fontWeight="bold">Current Applied Value</Typography>
              <Typography variant="h3" fontWeight="bold" sx={{ my: 1 }}>{currentValue.applied} <Typography component="span" variant="h5" color="text.secondary">{currentValue.unit}</Typography></Typography>
              {currentValue.freq && (
                <Typography variant="subtitle1" color="text.secondary">@ {currentValue.freq}</Typography>
              )}
              {currentValue.tolerance && (
                <Typography variant="subtitle1" sx={{ color: 'success.main', fontWeight: 'bold', mt: 1 }}>
                  Passing Range: {currentValue.tolerance}
                </Typography>
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
          <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', textAlign: 'center', mt: 2, px: 4, display: 'flex', flexDirection: 'column', pb: 4 }}>
             <Typography variant="h5" fontWeight="bold" color="success.main" gutterBottom>Reading Entry</Typography>

             <Typography variant="body2" color="text.secondary" gutterBottom>Read the value shown on the UUT and enter the displayed reading.</Typography>
             {currentValue?.tolerance && (
               <Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: 'bold', mb: 1 }}>
                 Passing Range: {currentValue.tolerance}
               </Typography>
             )}
             {calibratorMode === 'STBY' ? (
               <Card sx={{ mt: 1.5, p: 4, borderRadius: 3, border: '1px solid', borderColor: 'warning.main', bgcolor: 'rgba(255, 152, 0, 0.05)', display: 'flex', flexDirection: 'column', mx: 'auto', width: '100%', alignItems: 'center' }} elevation={2}>
                 <Typography variant="h6" color="warning.main" fontWeight="bold" gutterBottom>Calibration Paused (Standby Mode)</Typography>
                 <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>The calibrator has been placed in Standby mode. Output is disabled.</Typography>
                 <Box sx={{ display: 'flex', gap: 2 }}>
                   <Button variant="outlined" color="error" onClick={handleCancelCalibration}>Cancel Calibration</Button>
                   <Button variant="contained" color="warning" onClick={handleResumeCalibration}>Resume Calibration</Button>
                 </Box>
               </Card>
             ) : (
               <Card sx={{ mt: 1.5, p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255, 255, 255, 0.02)', display: 'flex', flexDirection: 'column', mx: 'auto', width: '100%' }} elevation={2}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', pb: 1, alignItems: 'center' }}>
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
                        sx={{ minWidth: 120, width: '140px', '& .MuiOutlinedInput-root': { fontSize: '0.9rem' } }}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={handlePrevApplied}
                      disabled={unitIndex === 0 && valIndex === 0}
                      sx={{ px: 2 }}
                    >
                      Prev Applied
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleSubmitReadings} disabled={isSubmitDisabled()} sx={{ px: 3, fontWeight: 'bold' }}>
                      Submit
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={handleNextApplied}
                      sx={{ px: 2 }}
                    >
                      Next Applied
                    </Button>
                 </Box>
               </Card>
             )}

          </Box>
        );

      case 'COMPLETION':
        const durationMinutes = Math.round((Date.now() - startTime) / 60000);
        return (
          <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', textAlign: 'center', mt: 2, px: 4 }}>
            <AssignmentTurnedInIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />


            <Typography variant="h5" fontWeight="bold" gutterBottom>Calibration Completed</Typography>
            <Card sx={{ mt: 1.5, textAlign: 'left', borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255, 255, 255, 0.02)' }} elevation={0}>
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

  const renderRightConsole = () => (
    <Box sx={{ 
      width: 320, 
      borderLeft: '1px solid', 
      borderColor: 'divider', 
      bgcolor: '#0B0F19', 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh' 
    }}>
      <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#0B0F19' }}>
        <Typography variant="subtitle2" className="font-display font-bold text-gray-100">Live Console</Typography>
      </Box>
      <Box 
        ref={consoleContainerRef}
        sx={{ 
          flexGrow: 1, 
          p: 2, 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          /* Visible customized scrollbar */
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-track': { background: '#0B0F19' },
          '&::-webkit-scrollbar-thumb': { background: '#1f2937', borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb:hover': { background: '#374151' },
          scrollbarWidth: 'thin', // Firefox
          scrollbarColor: '#1f2937 #0B0F19'
        }}
      >
        {consoleLogs.map((log, index) => (
          <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '11px', color: '#4ade80', mb: 0.5 }}>
            {log}
          </Typography>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', width: '100%', bgcolor: 'transparent' }}>
      {renderLeftSidebar()}
      
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflowY: 'auto' }}>
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

      {renderRightConsole()}
    </Box>
  );
};

export default LiveCalibrationRun;
