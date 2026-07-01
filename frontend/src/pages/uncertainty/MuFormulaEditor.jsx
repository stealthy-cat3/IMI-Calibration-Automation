// frontend/src/pages/uncertainty/MuFormulaEditor.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  Divider,
  Stack,
  Grid,
  Chip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ReplayIcon from '@mui/icons-material/Replay';
import ScienceIcon from '@mui/icons-material/Science';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import {
  fetchUncertaintyFormulas,
  saveUncertaintyFormula,
  testUncertaintyFormula,
  restoreUncertaintyFormula,
  setCurrentEditingFormula,
  updateCurrentEditingFormula,
  clearCurrentEditingFormula,
} from '../../store/uncertainty/thunks';
import {
  getUncertaintyFormulas,
  getCurrentEditingFormula,
  getTestResults,
  getIsLoading,
  getError,
} from '../../store/uncertainty/selectors';

const MuFormulaEditor = () => {
  const { id } = useParams(); // 'id' for edit, undefined for new
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const allFormulas = useSelector(getUncertaintyFormulas);
  const currentFormula = useSelector(getCurrentEditingFormula);
  const testResults = useSelector(getTestResults);
  const isLoading = useSelector(getIsLoading);
  const error = useSelector(getError);

  const [localFormulaName, setLocalFormulaName] = useState('');
  const [localFormulaDescription, setLocalFormulaDescription] = useState('');
  const [localFormulaOutputUnit, setLocalFormulaOutputUnit] = useState('');
  const [localFormulaJson, setLocalFormulaJson] = useState('');
  const [localParametersJson, setLocalParametersJson] = useState(''); // For formula definition parameters
  const [testSampleData, setTestSampleData] = useState({}); // For testing input values

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const isNewFormula = !id;

  // Effect to load/set formula on route change or initial load
  useEffect(() => {
    dispatch(fetchUncertaintyFormulas()); // Ensure all formulas are fetched for setCurrentEditingFormula

    return () => {
      dispatch(clearCurrentEditingFormula());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isNewFormula) {
      dispatch(clearCurrentEditingFormula());
      // Initialize local state for a new formula
      setLocalFormulaName('');
      setLocalFormulaDescription('');
      setLocalFormulaOutputUnit('');
      setLocalFormulaJson(JSON.stringify({ nodes: [], edges: [] }, null, 2));
      setLocalParametersJson(JSON.stringify([], null, 2));
      setTestSampleData({});
    } else if (allFormulas.length > 0) {
      // Find and set the current formula for editing
      const formulaToEdit = allFormulas.find((f) => f.id === id);
      if (formulaToEdit) {
        dispatch(setCurrentEditingFormula(id, allFormulas));
      } else if (!isLoading && !error) {
        // If formula not found after loading, redirect or show error
        console.warn(`Formula with ID ${id} not found.`);
        navigate('/uncertainty/formulas'); // Redirect to formula list if not found
      }
    }
  }, [id, isNewFormula, allFormulas, dispatch, isLoading, error, navigate]);

  // Effect to update local state when currentFormula changes from Redux
  useEffect(() => {
    if (currentFormula) {
      setLocalFormulaName(currentFormula.name || '');
      setLocalFormulaDescription(currentFormula.description || '');
      setLocalFormulaOutputUnit(currentFormula.outputUnit || '');
      setLocalFormulaJson(currentFormula.formulaJson ? JSON.stringify(JSON.parse(currentFormula.formulaJson), null, 2) : JSON.stringify({ nodes: [], edges: [] }, null, 2));
      setLocalParametersJson(currentFormula.parameters ? JSON.stringify(currentFormula.parameters, null, 2) : JSON.stringify([], null, 2));

      // Re-initialize test sample data based on formula's parameters
      const initialSampleData = {};
      try {
        const params = currentFormula.parameters || [];
        params.forEach(p => {
          if (p.name && typeof testSampleData[p.name] === 'undefined') {
            initialSampleData[p.name] = p.type === 'number' ? 0 : '';
          } else if (p.name) {
             initialSampleData[p.name] = testSampleData[p.name]; // Keep existing if present
          }
        });
      } catch (e) {
        console.error("Error parsing formula parameters for test inputs:", e);
      }
      setTestSampleData(initialSampleData);

    } else if (!isNewFormula) {
      // If we are in edit mode but currentFormula is null (e.g., formula not found), clear local state
      setLocalFormulaName('');
      setLocalFormulaDescription('');
      setLocalFormulaOutputUnit('');
      setLocalFormulaJson(JSON.stringify({ nodes: [], edges: [] }, null, 2));
      setLocalParametersJson(JSON.stringify([], null, 2));
      setTestSampleData({});
    }
  }, [currentFormula, isNewFormula]);


  // Handlers for input changes
  const handleFieldChange = useCallback((field, value) => {
    if (isNewFormula) {
      // For new formula, update local state directly
      if (field === 'name') setLocalFormulaName(value);
      else if (field === 'description') setLocalFormulaDescription(value);
      else if (field === 'outputUnit') setLocalFormulaOutputUnit(value);
      else if (field === 'formulaJson') setLocalFormulaJson(value);
      else if (field === 'parameters') setLocalParametersJson(value);
    } else {
      // For existing formula, dispatch update to Redux
      dispatch(updateCurrentEditingFormula({ [field]: field === 'formulaJson' || field === 'parameters' ? JSON.parse(value) : value }));
    }
  }, [isNewFormula, dispatch]);

  const handleTestSampleDataChange = useCallback((paramName, value) => {
    setTestSampleData((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  }, []);

  const parseJsonSafely = (jsonString, defaultValue) => {
    try {
      const parsed = JSON.parse(jsonString);
      return typeof parsed === 'object' && parsed !== null ? parsed : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };

  const handleSave = async () => {
    const formulaToSave = {
      ...currentFormula, // Use existing formula data for updates
      id: isNewFormula ? undefined : currentFormula?.id,
      name: localFormulaName,
      description: localFormulaDescription,
      outputUnit: localFormulaOutputUnit,
      formulaJson: localFormulaJson,
      parameters: localParametersJson,
    };

    // Ensure formulaJson and parameters are valid JSON strings before saving
    try {
      formulaToSave.formulaJson = JSON.stringify(parseJsonSafely(localFormulaJson, { nodes: [], edges: [] }));
      formulaToSave.parameters = parseJsonSafely(localParametersJson, []);
    } catch (e) {
      setSnackbarMessage('Invalid JSON format for formula or parameters.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const resultAction = await dispatch(saveUncertaintyFormula(formulaToSave));
      if (saveUncertaintyFormula.fulfilled.match(resultAction)) {
        setSnackbarMessage('Formula saved successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        if (isNewFormula && resultAction.payload?.id) {
          navigate(`/uncertainty/formulas/${resultAction.payload.id}/edit`);
        }
      } else {
        throw new Error(resultAction.payload || 'Failed to save formula.');
      }
    } catch (e) {
      setSnackbarMessage(e.message || 'Error saving formula.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleRestore = async () => {
    if (!currentFormula?.id) return;
    try {
      const resultAction = await dispatch(restoreUncertaintyFormula(currentFormula.id));
      if (restoreUncertaintyFormula.fulfilled.match(resultAction)) {
        setSnackbarMessage('Formula restored to default version!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        throw new Error(resultAction.payload || 'Failed to restore formula.');
      }
    } catch (e) {
      setSnackbarMessage(e.message || 'Error restoring formula.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleTest = async () => {
    if (!currentFormula?.id) {
      setSnackbarMessage('Please save the formula before testing.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    // Convert sample data values to numbers if the parameter type is 'number'
    const paramsDefinition = parseJsonSafely(localParametersJson, []);
    const processedSampleData = {};
    Object.entries(testSampleData).forEach(([key, value]) => {
      const paramDef = paramsDefinition.find(p => p.name === key);
      if (paramDef && paramDef.type === 'number' && !isNaN(Number(value))) {
        processedSampleData[key] = Number(value);
      } else {
        processedSampleData[key] = value;
      }
    });

    try {
      const resultAction = await dispatch(testUncertaintyFormula(currentFormula.id, processedSampleData));
      if (testUncertaintyFormula.fulfilled.match(resultAction)) {
        setSnackbarMessage('Formula tested successfully!');
        setSnackbarSeverity('success');
      } else if (testUncertaintyFormula.rejected.match(resultAction)) {
        setSnackbarMessage(resultAction.payload?.message || 'Formula test failed.');
        setSnackbarSeverity('error');
      }
      setSnackbarOpen(true);
    } catch (e) {
      setSnackbarMessage(e.message || 'Error testing formula.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Render loading state
  if (isLoading && (!currentFormula && !isNewFormula && allFormulas.length === 0)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading formula...</Typography>
      </Box>
    );
  }

  // Render error state for initial fetch
  if (error && !currentFormula && !isNewFormula) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load formula: {typeof error === 'string' ? error : error.message || 'Unknown error'}
        </Alert>
        <Button onClick={() => dispatch(fetchUncertaintyFormulas())} sx={{ mt: 2 }}>Retry</Button>
      </Box>
    );
  }

  // If we are editing and no formula is found (after loading), display appropriate message
  if (!isNewFormula && !currentFormula && !isLoading && allFormulas.length > 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Formula with ID "{id}" not found.
        </Alert>
        <Button onClick={() => navigate('/uncertainty/formulas')} sx={{ mt: 2 }}>Back to Formulas</Button>
      </Box>
    );
  }

  const formulaDataForDisplay = currentFormula || {
    name: localFormulaName,
    description: localFormulaDescription,
    outputUnit: localFormulaOutputUnit,
    formulaJson: localFormulaJson,
    parameters: parseJsonSafely(localParametersJson, []),
  };

  const formulaTitle = isNewFormula ? 'Create New MU Formula' : `Edit MU Formula: ${formulaDataForDisplay.name || id}`;
  const allowRestore = !isNewFormula && currentFormula?.formulaJson !== currentFormula?.defaultFormulaJson;

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{ color: 'primary.main', mb: 3, fontWeight: 800, letterSpacing: '-0.5px' }}>
        {formulaTitle}
      </Typography>

      {error && typeof error === 'string' && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      {error && typeof error === 'object' && error.message && (
        <Alert severity="error" sx={{ mb: 3 }}>{error.message}</Alert>
      )}

      <Grid container spacing={3}>
        {/* Formula Details */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Formula Details</Typography>
            <TextField
              label="Formula Name"
              value={localFormulaName}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Description"
              value={localFormulaDescription}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              label="Output Unit"
              value={localFormulaOutputUnit}
              onChange={(e) => handleFieldChange('outputUnit', e.target.value)}
              fullWidth
              margin="normal"
            />
            {!isNewFormula && currentFormula && (
                <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
                    <Chip label={`Version: ${currentFormula.version}`} />
                    <Chip label={`Last Modified: ${new Date(currentFormula.lastModifiedDate).toLocaleString()}`} />
                    <Chip label={`Modified By: ${currentFormula.lastModifiedBy}`} />
                </Stack>
            )}
          </Paper>
        </Grid>

        {/* Visual Editor Placeholder and Parameters Definition */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Visual Formula Editor (Placeholder)</Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              A full visual editor (e.g., based on React Flow or similar library) would be integrated here.
              For now, you can directly edit the formula's JSON structure.
            </Alert>
            <TextField
              label="Formula JSON Structure"
              value={localFormulaJson}
              onChange={(e) => setLocalFormulaJson(e.target.value)}
              onBlur={() => handleFieldChange('formulaJson', localFormulaJson)}
              fullWidth
              margin="normal"
              multiline
              rows={8}
              helperText="Edit the JSON representation of nodes and edges."
              sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace' } }}
            />
            <TextField
              label="Formula Parameters (JSON Array)"
              value={localParametersJson}
              onChange={(e) => setLocalParametersJson(e.target.value)}
              onBlur={() => handleFieldChange('parameters', localParametersJson)}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              helperText="Define input parameters as a JSON array: [{ name: 'Param1', type: 'number', unit: 'm' }]"
              sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace' } }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={isLoading}
              sx={{ py: 1.5, px: 3, fontSize: '1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none', boxShadow: 4 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Save Formula'}
            </Button>
            {!isNewFormula && (
              <Button
                variant="outlined"
                startIcon={<ReplayIcon />}
                onClick={handleRestore}
                disabled={isLoading || !allowRestore}
                color="warning"
                sx={{ py: 1.5, px: 3, fontSize: '1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
              >
                Restore to Default
              </Button>
            )}
            <Button
              variant="text"
              onClick={() => navigate('/uncertainty/formulas')}
              disabled={isLoading}
              sx={{ py: 1.5, px: 3, fontSize: '1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
            >
              Cancel
            </Button>
          </Stack>
        </Grid>

        {/* Test Formula Section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>Test Formula</Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle1" gutterBottom>Input Sample Data:</Typography>
            <Grid container spacing={2}>
              {formulaDataForDisplay.parameters && formulaDataForDisplay.parameters.length > 0 ? (
                parseJsonSafely(localParametersJson, []).map((param, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <TextField
                      label={`${param.name} (${param.unit || param.type})`}
                      value={testSampleData[param.name] || ''}
                      onChange={(e) => handleTestSampleDataChange(param.name, e.target.value)}
                      type={param.type === 'number' ? 'number' : 'text'}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Alert severity="info">No parameters defined for this formula. Add parameters in the section above to enable testing.</Alert>
                </Grid>
              )}
            </Grid>
            <Button
              variant="contained"
              startIcon={<ScienceIcon />}
              onClick={handleTest}
              disabled={isLoading || !currentFormula?.id || !formulaDataForDisplay.parameters?.length}
              sx={{ mt: 3, py: 1.5, px: 3, fontSize: '1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none', boxShadow: 4 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Run Test'}
            </Button>

            {testResults && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>Test Results:</Typography>
                {testResults.validationErrors && testResults.validationErrors.length > 0 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Validation Errors:</Typography>
                    <ul>
                      {testResults.validationErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </Alert>
                )}
                {testResults.output !== undefined && (
                  <Alert severity="success">
                    <Typography variant="body1">
                      <strong>Result:</strong> {testResults.output} {testResults.unit}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                      Input: {JSON.stringify(testResults.input)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Tested At: {new Date(testResults.timestamp).toLocaleString()}
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MuFormulaEditor;