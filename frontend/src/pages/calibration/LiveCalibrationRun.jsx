// frontend/src/pages/calibration/LiveCalibrationRun.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  startCalibrationSession,
  advanceToNextTestPoint,
  retreatToPreviousTestPoint,
  submitManualUutReading,
  triggerAutomatedMeasurement,
  dismissManualActionPrompt,
  confirmManualStepCompletion,
  updateRealtimeDeviation,
  completeCalibrationSession,
  updateUutInputMethod,
} from '../../store/calibration/thunks';
import {
  selectCurrentCalibrationSession,
  selectCurrentTestPoint,
  selectTestPointsProgress,
  selectCalibrationLoading,
  selectCalibrationError,
  selectManualActionPrompt,
  selectRealtimeDeviationData,
  selectSessionStatus,
  selectUutInputMethod,
  selectUutDetails,
} from '../../store/calibration/selectors';

import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  LinearProgress,
  CardMedia,
} from '@mui/material';
import { green, orange, red } from '@mui/material/colors';

const RealtimeDeviationBox = ({ data, testPoint }) => {
  if (!data || !testPoint) return null;

  const { value, relativeError, colorStatus, magnitude, direction } = data;
  const { expectedUutReading, tolerance, toleranceUnit } = testPoint;

  const colorMap = {
    green: green[500],
    orange: orange[500],
    red: red[500],
  };

  const backgroundColor = colorMap[colorStatus] || 'grey.500';

  // Calculate position within a conceptual bar
  // Max deviation shown, e.g., 2x tolerance for visual range
  const maxVisualDeviation = Math.abs(tolerance * 2);
  const normalizedDeviation = Math.max(-maxVisualDeviation, Math.min(maxVisualDeviation, value));
  // Convert to a percentage of the visual bar width (0 to 100)
  // Center is 50%, low values shift left, high values shift right
  const positionPercentage = ((normalizedDeviation / maxVisualDeviation) * 50) + 50;
  const clampedPosition = Math.max(0, Math.min(100, positionPercentage));

  return (
    <Box sx={{
      width: '100%',
      height: '80px',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      mt: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      bgcolor: 'background.paper',
    }}>
      <Typography variant="caption" sx={{ position: 'absolute', top: 5, left: 10, color: 'text.secondary' }}>
        Expected: {expectedUutReading} {toleranceUnit}
      </Typography>
      <Typography variant="caption" sx={{ position: 'absolute', top: 5, right: 10, color: 'text.secondary' }}>
        Tolerance: &plusmn;{tolerance} {toleranceUnit}
      </Typography>
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '20px',
          bgcolor: 'grey.300',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            height: '100%',
            width: '2px', // Center line
            bgcolor: 'text.secondary',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            width: `${Math.abs(clampedPosition - 50) * 2}%`, // Width from center to current position
            height: '100%',
            transform: `translateX(${clampedPosition > 50 ? '0%' : '-100%'})`, // Adjust origin for expansion
            bgcolor: backgroundColor,
            transition: 'width 0.3s ease-out, left 0.3s ease-out',
            ...(clampedPosition < 50 && { left: `${clampedPosition}%` }), // Adjust position if value is lower than expected
            ...(clampedPosition >= 50 && { left: '50%' }), // Adjust position if value is higher or equal to expected
          }}
        />
      </Box>
      <Box sx={{
        position: 'absolute',
        bottom: 25,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        px: 1,
      }}>
        <Typography variant="caption" color={red[500]}>-{maxVisualDeviation.toFixed(testPoint.tolerance.toString().split('.')[1]?.length || 2)}</Typography>
        <Typography variant="caption">0</Typography>
        <Typography variant="caption" color={red[500]}>+{maxVisualDeviation.toFixed(testPoint.tolerance.toString().split('.')[1]?.length || 2)}</Typography>
      </Box>
      <Typography variant="h6" sx={{ mt: 1, color: 'text.primary', position: 'absolute', bottom: '30px' }}>
        {value !== null ? `${value.toFixed(6)} ${testPoint.appliedUnit}` : 'N/A'}
      </Typography>
      <Typography variant="subtitle2" sx={{
        color: backgroundColor,
        position: 'absolute',
        top: '30px',
        fontWeight: 'bold'
      }}>
        {direction ? `(${direction.toUpperCase()})` : ''} {relativeError !== null ? `(${Math.abs(relativeError * 100).toFixed(2)}%)` : ''}
      </Typography>
    </Box>
  );
};


const LiveCalibrationRun = () => {
  const { sessionId: uutIdParam } = useParams(); // Using sessionId from route as UUT ID to start session
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentSession = useSelector(selectCurrentCalibrationSession);
  const currentTestPoint = useSelector(selectCurrentTestPoint);
  const testPointsProgress = useSelector(selectTestPointsProgress);
  const loading = useSelector(selectCalibrationLoading);
  const error = useSelector(selectCalibrationError);
  const manualActionPrompt = useSelector(selectManualActionPrompt);
  const realtimeDeviation = useSelector(selectRealtimeDeviationData);
  const sessionStatus = useSelector(selectSessionStatus);
  const uutInputMethod = useSelector(selectUutInputMethod);
  const uutDetails = useSelector(selectUutDetails);

  const [manualReading, setManualReading] = useState('');
  const [isAutomatedMode, setIsAutomatedMode] = useState(uutInputMethod === 'automatic');

  // Effect to start calibration session if not already started
  useEffect(() => {
    if (!currentSession && uutIdParam) {
      // Simulate starting a new calibration session with some UUT details
      // In a real app, uutIdParam would be used to fetch actual UUT details
      dispatch(startCalibrationSession(
        {
          id: uutIdParam,
          name: `UUT-${uutIdParam}`,
          type: 'Generic Device',
          serialNumber: `SN-${uutIdParam}-001`,
          inputMethod: 'manual', // Default to manual initially, can be toggled
          templateId: 'template_basic_v1',
        },
        'semi-automatic' // Default operational mode
      )).then((session) => {
        // After session starts, update input method state
        setIsAutomatedMode(session?.uut?.inputMethod === 'automatic');
      });
    }
  }, [dispatch, currentSession, uutIdParam]);

  // Effect to synchronize isAutomatedMode with Redux store's uutInputMethod
  useEffect(() => {
    setIsAutomatedMode(uutInputMethod === 'automatic');
  }, [uutInputMethod]);


  // Simulate realtime deviation updates if session is active and no manual prompt
  useEffect(() => {
    let interval;
    if (currentSession && sessionStatus === 'in_progress' && currentTestPoint && !manualActionPrompt) {
      interval = setInterval(() => {
        // Simulate a slight variation around the expected value
        const randomDeviation = (Math.random() * currentTestPoint.tolerance * 0.5) - (currentTestPoint.tolerance * 0.25); // +/- 25% of tolerance
        const simulatedValue = currentTestPoint.expectedUutReading + randomDeviation;
        const relativeError = (randomDeviation / currentTestPoint.expectedUutReading);

        let colorStatus = 'green';
        if (Math.abs(randomDeviation) > currentTestPoint.tolerance * 0.8) {
          colorStatus = 'red';
        } else if (Math.abs(randomDeviation) > currentTestPoint.tolerance * 0.4) {
          colorStatus = 'orange';
        }

        dispatch(updateRealtimeDeviation({
          value: randomDeviation,
          relativeError: relativeError,
          colorStatus: colorStatus,
          magnitude: 'small', // Simplified
          direction: randomDeviation > 0 ? 'high' : 'low',
        }));
      }, 500); // Update every 500ms
    } else {
      dispatch(updateRealtimeDeviation(null)); // Clear deviation when not actively running
    }

    return () => clearInterval(interval);
  }, [dispatch, currentSession, currentTestPoint, sessionStatus, manualActionPrompt]);

  const handleNextTestPoint = useCallback(() => {
    dispatch(advanceToNextTestPoint());
    setManualReading(''); // Clear manual input field
  }, [dispatch]);

  const handlePreviousTestPoint = useCallback(() => {
    dispatch(retreatToPreviousTestPoint());
    setManualReading(''); // Clear manual input field
  }, [dispatch]);

  const handleSubmitManualReading = useCallback(() => {
    if (currentTestPoint && manualReading !== '') {
      dispatch(submitManualUutReading(currentTestPoint.id, parseFloat(manualReading)));
      // No need to clear reading immediately, it will update once next test point is loaded or compliance is checked.
      // Or you might want to immediately move to next test point here if design dictates.
    }
  }, [dispatch, currentTestPoint, manualReading]);

  const handleTriggerAutomatedMeasurement = useCallback(() => {
    if (currentTestPoint) {
      dispatch(triggerAutomatedMeasurement(currentTestPoint.id));
    }
  }, [dispatch, currentTestPoint]);

  const handleConfirmManualAction = useCallback(() => {
    if (manualActionPrompt && currentTestPoint) {
      // If the prompt is linked to a manual step, confirm that step
      const stepToConfirm = currentTestPoint.manualSteps.find(step => !step.completed && step.type === manualActionPrompt.type);
      if (stepToConfirm) {
        dispatch(confirmManualStepCompletion(currentTestPoint.id, stepToConfirm.id));
      } else {
        dispatch(dismissManualActionPrompt());
      }
    } else {
      dispatch(dismissManualActionPrompt());
    }
  }, [dispatch, manualActionPrompt, currentTestPoint]);

  const handleToggleInputMethod = useCallback((event) => {
    const newMethod = event.target.checked ? 'automatic' : 'manual';
    dispatch(updateUutInputMethod(newMethod));
  }, [dispatch]);

  const handleCompleteCalibration = useCallback(() => {
    dispatch(completeCalibrationSession()).then(() => {
      navigate('/calibration/summary'); // Redirect to a summary page after completion
    });
  }, [dispatch, navigate]);

  if (loading && !currentSession) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Starting calibration session...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error: {error}</Alert>
        <Button variant="contained" onClick={() => navigate('/calibration/start')} sx={{ mt: 2 }}>
          Back to Start
        </Button>
      </Box>
    );
  }

  if (!currentSession) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">No active calibration session found.</Typography>
        <Button variant="contained" onClick={() => navigate('/calibration/start')} sx={{ mt: 2 }}>
          Start New Calibration
        </Button>
      </Box>
    );
  }

  const currentTestPointIndex = currentSession.currentTestPointIndex;
  const totalTestPoints = testPointsProgress.length;
  const isFirstTestPoint = currentTestPointIndex === 0;
  const isLastTestPoint = currentTestPointIndex >= totalTestPoints - 1;
  const canAdvance = currentTestPoint && currentTestPoint.actualUutReading !== null && !isLastTestPoint;
  const isSessionCompleted = sessionStatus === 'completed';

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{ color: 'primary.main', mb: 3, fontWeight: 800, letterSpacing: '-0.5px' }}>
        Live Calibration Run: {uutDetails?.name || 'Unknown UUT'}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {isSessionCompleted ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          Calibration session completed!
          <Button onClick={() => navigate('/calibration/summary')} sx={{ ml: 2 }}>View Summary</Button>
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          Status: {sessionStatus?.replace(/_/g, ' ') || 'N/A'} - Mode: {currentSession.mode?.replace(/_/g, ' ') || 'N/A'}
        </Alert>
      )}

      {loading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress />
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>Processing...</Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Test Point {currentTestPointIndex + 1} of {totalTestPoints}
            </Typography>
            {currentTestPoint ? (
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">{currentTestPoint.parameter} - {currentTestPoint.range}</Typography>
                <Typography>Applied Value: {currentTestPoint.appliedValue} {currentTestPoint.appliedUnit}</Typography>
                <Typography>Expected UUT Reading: {currentTestPoint.expectedUutReading} {currentTestPoint.toleranceUnit}</Typography>
                <Typography>Tolerance: &plusmn;{currentTestPoint.tolerance} {currentTestPoint.toleranceUnit}</Typography>
                <Typography sx={{ mt: 2 }}>Actual UUT Reading:
                  {currentTestPoint.actualUutReading !== null
                    ? ` ${currentTestPoint.actualUutReading.toFixed(6)} ${currentTestPoint.toleranceUnit}`
                    : ' N/A'}
                </Typography>
                {currentTestPoint.deviation !== null && (
                  <Typography color={Math.abs(currentTestPoint.deviation) > currentTestPoint.tolerance ? 'error' : 'success'}>
                    Deviation: {currentTestPoint.deviation.toFixed(6)} {currentTestPoint.toleranceUnit}
                  </Typography>
                )}
                <Typography>Status: {currentTestPoint.status}</Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>Connection Instructions</Typography>
                <Typography>{currentTestPoint.connectionInstructions?.text || 'No specific connection instructions.'}</Typography>
                {currentTestPoint.connectionInstructions?.diagramUrl && (
                  <CardMedia
                    component="img"
                    image={currentTestPoint.connectionInstructions.diagramUrl}
                    alt="Connection Diagram"
                    sx={{
                      width: '100%',
                      maxHeight: 200,
                      objectFit: 'contain',
                      mt: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  />
                )}

                {currentTestPoint.manualSteps && currentTestPoint.manualSteps.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>Manual Steps</Typography>
                    {currentTestPoint.manualSteps.map((step, index) => (
                      <Typography key={step.id} sx={{ textDecoration: step.completed ? 'line-through' : 'none' }}>
                        - {step.instruction} ({step.type}) {step.completed && '(Completed)'}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              <Typography>Loading test point details...</Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>UUT Reading</Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={isAutomatedMode}
                  onChange={handleToggleInputMethod}
                  name="inputMethod"
                  color="primary"
                  disabled={loading || isSessionCompleted || !!manualActionPrompt}
                />
              }
              label={isAutomatedMode ? 'Automated Reading' : 'Manual Input'}
              sx={{ mb: 2 }}
            />

            {isAutomatedMode ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleTriggerAutomatedMeasurement}
                disabled={loading || isSessionCompleted || !!manualActionPrompt}
                sx={{ mb: 2 }}
              >
                Trigger Automated Measurement
              </Button>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TextField
                  label="Enter UUT Reading"
                  variant="outlined"
                  type="number"
                  value={manualReading}
                  onChange={(e) => setManualReading(e.target.value)}
                  fullWidth
                  disabled={loading || isSessionCompleted || !!manualActionPrompt}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleSubmitManualReading}
                  disabled={!manualReading || loading || isSessionCompleted || !!manualActionPrompt}
                  sx={{ whiteSpace: 'nowrap', py: 1.5 }}
                >
                  Submit
                </Button>
              </Box>
            )}

            <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>Real-time Deviation</Typography>
            {currentTestPoint && realtimeDeviation ? (
              <RealtimeDeviationBox data={realtimeDeviation} testPoint={currentTestPoint} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {currentTestPoint ? 'No real-time deviation data available.' : 'Select a test point to view real-time data.'}
              </Typography>
            )}

            <Box sx={{ mt: 'auto', pt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handlePreviousTestPoint}
                    disabled={isFirstTestPoint || loading || isSessionCompleted || !!manualActionPrompt}
                    sx={{ py: 1.5, fontSize: '1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                  >
                    Previous Test Point
                  </Button>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  {isLastTestPoint ? (
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      onClick={handleCompleteCalibration}
                      disabled={loading || isSessionCompleted || !!manualActionPrompt || currentTestPoint.actualUutReading === null}
                      sx={{ py: 1.5, fontSize: '1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none', boxShadow: 4 }}
                    >
                      Complete Calibration
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleNextTestPoint}
                      disabled={!canAdvance || loading || isSessionCompleted || !!manualActionPrompt}
                      sx={{ py: 1.5, fontSize: '1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none', boxShadow: 4 }}
                    >
                      Next Test Point
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Manual Action Prompt Dialog */}
      <Dialog open={!!manualActionPrompt && !isSessionCompleted} onClose={handleConfirmManualAction} fullWidth maxWidth="sm">
        <DialogTitle>{manualActionPrompt?.type === 'LEAD_SWAP' ? 'Physical Connection Required' : 'Manual Configuration Step'}</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>{manualActionPrompt?.message}</Typography>
          {manualActionPrompt?.instructions && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Instructions: {manualActionPrompt.instructions}
            </Typography>
          )}
          {manualActionPrompt?.diagramUrl && (
            <CardMedia
              component="img"
              image={manualActionPrompt.diagramUrl}
              alt="Manual Action Diagram"
              sx={{ width: '100%', maxHeight: 300, objectFit: 'contain', mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmManualAction} color="primary" variant="contained">
            I have completed this step
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LiveCalibrationRun;