// frontend/src/pages/template/TemplateForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Container,
  Stack,
  Grid,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  ListSubheader,
  Paper,
  Divider,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Radio,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Import thunks and selectors from the template module
import {
  createTemplate,
  updateTemplate,
} from '../../store/template/thunks';
import {
  getLoadingStatus,
  getError,
  getSelectedTemplate,
  getTemplatesList, // Needed if getSelectedTemplate doesn't fetch directly
} from '../../store/template/selectors';
import { SET_SELECTED_TEMPLATE_ID } from '../../store/template/actionTypes'; // Import the action type for setting selected ID

const TemplateForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams(); // Get template ID from URL for edit mode

  const isEditMode = !!id;

  // Selectors for Redux state
  const isLoading = useSelector(getLoadingStatus);
  const error = useSelector(getError);
  const templates = useSelector(getTemplatesList); // Fetch all templates to find the selected one if not pre-set
  const selectedTemplateId = useSelector((state) => state.template.selectedTemplateId);

  // Manually find the selected template from the list based on selectedTemplateId or URL id
  const currentTemplate = useSelector((state) =>
    isEditMode ? templates.find((t) => t.id === id) : null
  );

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [marginOfError, setMarginOfError] = useState('');
  const [numberOfTrials, setNumberOfTrials] = useState(3);
  const [testPoints, setTestPoints] = useState([]);
  const [formError, setFormError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeasurementCategory, setSelectedMeasurementCategory] = useState('DC Voltage');
  const [selectedUnit, setSelectedUnit] = useState('V');
  const [isCategoryLocked, setIsCategoryLocked] = useState(false);

  const VALID_UNITS = {
    'DC Voltage': ['V', 'mV', 'µV', 'kV'],
    'DC Current': ['A', 'mA', 'µA'],
    'AC Voltage': ['V', 'mV', 'µV', 'kV'],
    'AC Current': ['A', 'mA', 'µA'],
    '2-Wire Resistance': ['Ω', 'mΩ', 'kΩ', 'MΩ'],
    '4-Wire Resistance': ['Ω', 'mΩ', 'kΩ', 'MΩ']
  };

  const CATEGORY_MAP = {
    'DC Voltage': { parameter: 'Voltage', type: 'DC', unit: 'V' },
    'DC Current': { parameter: 'Ampere', type: 'DC', unit: 'A' },
    'AC Voltage': { parameter: 'Voltage', type: 'AC', unit: 'V' },
    'AC Current': { parameter: 'Ampere', type: 'AC', unit: 'A' },
    '2-Wire Resistance': { parameter: 'Resistance', type: '2-Wire', unit: 'Ω' },
    '4-Wire Resistance': { parameter: 'Resistance', type: '4-Wire', unit: 'Ω' }
  };
  const ORDERED_CATEGORIES = Object.keys(CATEGORY_MAP);
  const FREQUENCY_UNITS = ['Hz', 'kHz', 'MHz', 'GHz'];

  // Effect to load template data for editing
  useEffect(() => {
    if (isEditMode && id) {
      // Dispatch action to set the selected template ID
      dispatch({ type: SET_SELECTED_TEMPLATE_ID, payload: id });
      // Fetch templates if not already loaded or if the specific one is missing
      // The `getSelectedTemplate` selector relies on `selectedTemplateId` being set in the state,
      // and for `templates` list to contain the item. We need to ensure `fetchTemplates` is called.
      // However, the provided thunks don't have a direct `fetchTemplateById` that updates `selectedTemplateId`.
      // The `templateReducer` handles `SET_SELECTED_TEMPLATE_ID`.
      // For edit mode, we implicitly rely on `templates` list being populated.
      // The `getSelectedTemplate` selector would be ideal here if it directly used `templateId` from props,
      // but it uses `selectedTemplateId` from state.
      // So, if currentTemplate is found, populate the form.
      if (currentTemplate) {
        setName(currentTemplate.name || '');
        setType(currentTemplate.type || '');
        setDescription(currentTemplate.description || '');
        setMarginOfError(currentTemplate.marginOfError || '');
        setTestPoints(
          currentTemplate.testPoints?.length > 0
            ? currentTemplate.testPoints.map(tp => ({ 
                ...tp, 
                appliedValueTouched: true,
                appliedValueUnit: tp.appliedValueUnit || tp.unit,
                appliedValueUnitTouched: true,
                frequencyUnit: tp.frequencyUnit || 'Hz'
              }))
            : []
        );
      } else {
        // If in edit mode and template is not found in store, navigate to 404 or show error
        // Or dispatch a fetch if templates are not loaded at all
        // For this example, we assume `templates` list might already be populated
        // or that `fetchTemplates` might have been triggered elsewhere.
        // If not, a `fetchTemplates` dispatch here would be necessary to ensure `currentTemplate` is found.
        // dispatch(fetchTemplates()); // Would need to trigger a full fetch
      }
    } else {
      setMarginOfError('');
      setNumberOfTrials(3);
      setTestPoints([]);
      setFormError('');
      dispatch({ type: SET_SELECTED_TEMPLATE_ID, payload: null }); // Clear selected ID
    }
  }, [id, isEditMode, currentTemplate, dispatch]); // Added currentTemplate as dependency

  // Derivation helper for existing test points without explicit category
  const getCategory = (tp) => {
    if (tp.parameter === 'Voltage' && tp.type === 'DC') return 'DC Voltage';
    if (tp.parameter === 'Ampere' && tp.type === 'DC') return 'DC Current';
    if (tp.parameter === 'Voltage' && tp.type === 'AC') return 'AC Voltage';
    if (tp.parameter === 'Ampere' && tp.type === 'AC') return 'AC Current';
    if (tp.parameter === 'Resistance' && tp.type === '2-Wire') return '2-Wire Resistance';
    if (tp.parameter === 'Resistance' && tp.type === '4-Wire') return '4-Wire Resistance';
    return 'DC Voltage'; // fallback
  };

  // Handlers for dynamic test points fields
  const handleOpenModal = (category = null) => {
    if (category) {
      setSelectedMeasurementCategory(category);
      setSelectedUnit(VALID_UNITS[category][0]);
      setIsCategoryLocked(true);
    } else {
      setSelectedMeasurementCategory('DC Voltage');
      setSelectedUnit('V');
      setIsCategoryLocked(false);
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setSelectedMeasurementCategory(newCat);
    setSelectedUnit(VALID_UNITS[newCat][0]);
  };

  const handleConfirmAddTestPoint = () => {
    const baseTp = CATEGORY_MAP[selectedMeasurementCategory];
    setTestPoints([
      ...testPoints,
      { 
        ...baseTp,
        unit: selectedUnit,
        appliedValueUnit: selectedUnit,
        frequencyUnit: 'Hz',
        frequency: '', 
        range: '', 
        appliedValue: '', 
        resolution: '', 
        appliedValueTouched: false,
        appliedValueUnitTouched: false
      }
    ]);
    handleCloseModal();
  };

  const handleRemoveTestPoint = (index) => {
    const newTestPoints = testPoints.filter((_, i) => i !== index);
    setTestPoints(newTestPoints);
  };

  const handleTestPointChange = (index, field, value) => {
    const newTestPoints = testPoints.map((tp, i) => {
      if (i === index) {
        const updatedTp = { ...tp, [field]: value };
        
        // Auto-sync Range with Applied Value on first creation
        if (field === 'range' && !updatedTp.appliedValueTouched) {
          updatedTp.appliedValue = value;
        }
        
        // Mark as touched if specifically edited
        if (field === 'appliedValue') {
          updatedTp.appliedValueTouched = true;
        }

        // Auto-sync Range Unit with Applied Value Unit on first creation
        if (field === 'unit' && !updatedTp.appliedValueUnitTouched) {
          updatedTp.appliedValueUnit = value;
        }

        // Mark as touched if applied value unit specifically edited
        if (field === 'appliedValueUnit') {
          updatedTp.appliedValueUnitTouched = true;
        }
        
        // Cascade changes if parameter changes (legacy fallback)
        if (field === 'parameter') {
          if (value === 'Resistance') {
            updatedTp.type = '2-Wire';
            updatedTp.unit = 'Ω';
            updatedTp.frequency = '';
          } else if (value === 'Voltage') {
            updatedTp.type = 'DC';
            updatedTp.unit = 'V';
            updatedTp.frequency = '';
          } else if (value === 'Ampere') {
            updatedTp.type = 'DC';
            updatedTp.unit = 'A';
            updatedTp.frequency = '';
          }
        }
        // Cascade changes if type changes to DC or Resistance modes (clear frequency)
        if (field === 'type' && (value === 'DC' || value === '2-Wire' || value === '4-Wire')) {
          updatedTp.frequency = '';
        }
        return updatedTp;
      }
      return tp;
    });
    setTestPoints(newTestPoints);
  };

  const validateForm = () => {
    if (!name.trim()) {
      setFormError('Template Name is required.');
      return false;
    }
    if (!type.trim()) {
      setFormError('DMM Type is required.');
      return false;
    }
    if (testPoints.length === 0) {
      setFormError('At least one Test Point must be added.');
      return false;
    }

    // Basic validation for test points
    const isTestPointsValid = testPoints.every(tp => {
      const baseValid = tp.parameter && tp.type && tp.range && tp.appliedValue && tp.resolution && tp.unit && tp.appliedValueUnit;
      if (!baseValid) return false;
      if (tp.type === 'AC' && (!tp.frequency || !tp.frequencyUnit)) return false;
      return true;
    });
    
    if (!isTestPointsValid) {
        setFormError('All required fields in Test Points must be filled (including Frequency for AC).');
        return false;
    }
    setFormError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const templateData = {
      name,
      type,
      description,
      marginOfError,
      numberOfTrials: parseInt(numberOfTrials, 10), // Ensure it's a number
      testPoints: testPoints.filter(
        (tp) => tp.parameter && tp.type && tp.range && tp.appliedValue && tp.resolution && tp.unit && tp.appliedValueUnit
      ), // Filter out empty test points
      // createdBy and lastModified are handled by thunk
    };

    try {
      if (isEditMode) {
        await dispatch(updateTemplate(id, templateData));
        setSnackbarMessage('Template updated successfully!');
      } else {
        await dispatch(createTemplate(templateData));
        setSnackbarMessage('Template created successfully!');
      }
      setSnackbarOpen(true);
      // Navigate to templates list or detail page after success
      navigate('/templates');
    } catch (err) {
      setFormError(err.message || 'An unexpected error occurred.');
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (isLoading && isEditMode && !currentTemplate) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{ color: 'primary.main', mb: 3, fontWeight: 800 }}>
        {isEditMode ? 'Edit Calibration Template' : 'Create Calibration Template'}
      </Typography>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Stack component="form" onSubmit={handleSubmit} spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <TextField
              label="Template Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              sx={{ '& .MuiInputLabel-root': { color: 'text.secondary' } }}
            />
            <FormControl fullWidth required sx={{ '& .MuiInputLabel-root': { color: 'text.secondary' } }}>
              <InputLabel id="dmm-type-label">DMM Type</InputLabel>
              <Select
                labelId="dmm-type-label"
                id="dmm-type-select"
                value={type}
                label="DMM Type"
                onChange={(e) => setType(e.target.value)}
              >
                <MenuItem value="Bench Type">Bench Type</MenuItem>
                <MenuItem value="Handheld">Handheld</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            fullWidth
            sx={{ '& .MuiInputLabel-root': { color: 'text.secondary' } }}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <TextField
              label="Acceptable Margin of Error (e.g., ±0.5%, ±0.1°C)"
              value={marginOfError}
              onChange={(e) => setMarginOfError(e.target.value)}
              fullWidth
              sx={{ '& .MuiInputLabel-root': { color: 'text.secondary' } }}
            />
            <TextField
              label="Number of Trials per Test Point"
              type="number"
              value={numberOfTrials}
              onChange={(e) => setNumberOfTrials(Math.max(1, parseInt(e.target.value, 10) || 1))}
              inputProps={{ min: 1 }}
              required
              fullWidth
              sx={{ '& .MuiInputLabel-root': { color: 'text.secondary' } }}
            />
          </Stack>

{/* Test Points Section */}
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 4 }} />
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
              Test Points Setup
            </Typography>

            {ORDERED_CATEGORIES.map((category) => {
              const categoryPoints = testPoints
                .map((tp, idx) => ({ tp, index: idx }))
                .filter(({ tp }) => getCategory(tp) === category);

              if (categoryPoints.length === 0) return null;

              return (
                <Accordion defaultExpanded key={category} sx={{ mb: 4, '&:before': { display: 'none' }, boxShadow: 'none', border: '1px solid', borderColor: 'grey.300', borderRadius: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'background.default', borderRadius: 2, borderBottom: '1px solid', borderColor: 'grey.300' }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                      {category}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2, py: 1 }}>
                    {categoryPoints.map(({ tp, index }) => (
                      <Stack
                        key={index}
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        alignItems="center"
                        sx={{ 
                          mb: 0, 
                          py: 1.5,
                          px: 0, 
                          borderBottom: index < categoryPoints.length - 1 ? '1px solid' : 'none', 
                          borderColor: 'divider',
                          position: 'relative',
                        }}
                      >
                        <TextField
                          label="Range"
                          value={tp.range}
                          size="small"
                          onChange={(e) => handleTestPointChange(index, 'range', e.target.value)}
                          fullWidth
                          required
                          sx={{ '& .MuiInputLabel-root': { color: 'text.secondary' } }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Select
                                  value={tp.unit}
                                  onChange={(e) => handleTestPointChange(index, 'unit', e.target.value)}
                                  variant="standard"
                                  disableUnderline
                                  sx={{ minWidth: 40, textAlign: 'right' }}
                                  MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
                                >
                                  {VALID_UNITS[getCategory(tp)]?.map((u) => (
                                    <MenuItem key={u} value={u}>{u}</MenuItem>
                                  ))}
                                </Select>
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          label="Applied Value"
                          value={tp.appliedValue}
                          size="small"
                          onChange={(e) => handleTestPointChange(index, 'appliedValue', e.target.value)}
                          fullWidth
                          required
                          sx={{ '& .MuiInputLabel-root': { color: 'text.secondary' } }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Select
                                  value={tp.appliedValueUnit || tp.unit}
                                  onChange={(e) => handleTestPointChange(index, 'appliedValueUnit', e.target.value)}
                                  variant="standard"
                                  disableUnderline
                                  sx={{ minWidth: 40, textAlign: 'right' }}
                                  MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
                                >
                                  {VALID_UNITS[getCategory(tp)]?.map((u) => (
                                    <MenuItem key={u} value={u}>{u}</MenuItem>
                                  ))}
                                </Select>
                              </InputAdornment>
                            ),
                          }}
                        />
                        {tp.type === 'AC' && (
                          <TextField
                            label="Frequency"
                            value={tp.frequency || ''}
                            size="small"
                            onChange={(e) => handleTestPointChange(index, 'frequency', e.target.value)}
                            fullWidth
                            required
                            placeholder="e.g., 1e3"
                            sx={{ '& .MuiInputLabel-root': { color: 'text.secondary' } }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Select
                                    value={tp.frequencyUnit || 'Hz'}
                                    onChange={(e) => handleTestPointChange(index, 'frequencyUnit', e.target.value)}
                                    variant="standard"
                                    disableUnderline
                                    sx={{ minWidth: 40, textAlign: 'right' }}
                                    MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
                                  >
                                    {FREQUENCY_UNITS.map((u) => (
                                      <MenuItem key={u} value={u}>{u}</MenuItem>
                                    ))}
                                  </Select>
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                        <TextField
                          label="Resolution"
                          value={tp.resolution}
                          size="small"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^[01.]*$/.test(val)) {
                              handleTestPointChange(index, 'resolution', val);
                            }
                          }}
                          fullWidth
                          required
                          sx={{ '& .MuiInputLabel-root': { color: 'text.secondary' } }}
                        />
                        <IconButton
                          onClick={() => handleRemoveTestPoint(index)}
                          color="error"
                          size="small"
                          aria-label="remove test point"
                          sx={{ ml: { sm: 1 } }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    ))}
                    <Box sx={{ px: 0, pt: 1.5, pb: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenModal(category)}
                        startIcon={<AddIcon />}
                        sx={{ textTransform: 'none', fontWeight: 600, borderStyle: 'dashed' }}
                      >
                        Add {category} Test Point
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })}

            <Button
              variant="outlined"
              onClick={() => handleOpenModal()}
              startIcon={<AddIcon />}
              sx={{ mt: 2, py: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600, borderStyle: 'dashed', borderWidth: 2, '&:hover': { borderWidth: 2, bgcolor: 'action.hover' } }}
            >
              {testPoints.length === 0 ? "Add a test point" : "Add another test point"}
            </Button>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ mt: 4, mb: 2, py: 1.5, fontSize: '1.1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none', boxShadow: 4 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : (isEditMode ? 'Update Calibration Template' : 'Create Calibration Template')}
          </Button>
        </Stack>
      </Paper>

      {/* Add Test Point Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Add Test Point
        </DialogTitle>
        <DialogContent dividers>
          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Measurement Type
            </Typography>
            <RadioGroup
              value={selectedMeasurementCategory}
              onChange={handleCategoryChange}
            >
              {ORDERED_CATEGORIES.map((cat) => (
                <FormControlLabel 
                  key={cat} 
                  value={cat} 
                  control={<Radio />} 
                  label={cat}
                  disabled={isCategoryLocked && selectedMeasurementCategory !== cat} 
                  sx={{ mb: 0.5 }}
                />
              ))}
            </RadioGroup>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel id="modal-unit-label">Unit</InputLabel>
            <Select
              labelId="modal-unit-label"
              value={selectedUnit}
              label="Unit"
              onChange={(e) => setSelectedUnit(e.target.value)}
            >
              {VALID_UNITS[selectedMeasurementCategory]?.map((u) => (
                <MenuItem key={u} value={u}>{u}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmAddTestPoint} variant="contained" color="primary">
            Confirm Selection
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <Button color="inherit" size="small" onClick={handleSnackbarClose}>
            Close
          </Button>
        }
      />
    </Container>
  );
};

export default TemplateForm;