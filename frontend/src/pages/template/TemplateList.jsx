// frontend/src/pages/template/TemplateList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, TextField, Button,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel,
  IconButton, Paper, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';

import {
  fetchTemplates,
  setTemplateFilter,
  deleteTemplate,
  __TEMPLATES_FIXTURE__ // Imported to dynamically populate filter options
} from '../../store/template/thunks';
import {
  getFilteredTemplates,
  getLoadingStatus,
  getError,
  getTemplateFilters
} from '../../store/template/selectors';

const TemplateList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const filteredTemplates = useSelector(getFilteredTemplates);
  const loading = useSelector(getLoadingStatus);
  const error = useSelector(getError);
  const filters = useSelector(getTemplateFilters);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [templateToDeleteId, setTemplateToDeleteId] = useState(null);

  // Dynamically derive unique template types from the fixture for filter options
  // In a real app, this might come from a dedicated API endpoint or be configured.
  const allTemplateTypes = [
    'All', // Option to clear type filter
    ...new Set(__TEMPLATES_FIXTURE__.map(template => template.type))
  ];

  // Effect to fetch templates on component mount and when filters change
  useEffect(() => {
    dispatch(fetchTemplates(filters));
  }, [dispatch, filters]); // 'filters' object reference changes when setTemplateFilter is dispatched

  // Debounced search handler to prevent excessive API calls while typing
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      dispatch(setTemplateFilter('search', searchTerm));
    }, 300), // 300ms debounce time
    [dispatch]
  );

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
  };

  const handleTypeFilterChange = (event) => {
    dispatch(setTemplateFilter('type', event.target.value));
  };

  const handleCreateTemplate = () => {
    // Navigate to a template creation route
    navigate('/templates/new'); 
  };

  const handleEditTemplate = (templateId) => {
    // Navigate to a template edit route with the specific template ID
    navigate(`/templates/${templateId}/edit`);
  };

  const handleDeleteClick = (templateId) => {
    setTemplateToDeleteId(templateId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (templateToDeleteId) {
      // Dispatch the delete thunk and then re-fetch the updated list
      await dispatch(deleteTemplate(templateToDeleteId));
      setOpenDeleteDialog(false);
      setTemplateToDeleteId(null);
      dispatch(fetchTemplates(filters)); // Re-fetch to update the UI
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setTemplateToDeleteId(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{ color: 'primary.main', mb: 3, fontWeight: 800, letterSpacing: '-0.5px' }}>
        Calibration Templates
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Search Templates"
          variant="outlined"
          size="small"
          // Using defaultValue as the TextField's internal state is managed by debounce,
          // and Redux state (filters.search) updates after the debounce period.
          defaultValue={filters.search || ''} 
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <SearchIcon color="action" sx={{ mr: 1 }} />
            ),
          }}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />

        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="template-type-filter-label">Filter by Type</InputLabel>
          <Select
            labelId="template-type-filter-label"
            id="template-type-filter"
            value={filters.type || 'All'} // Default to 'All' if no filter is set
            onChange={handleTypeFilterChange}
            label="Filter by Type"
          >
            {allTemplateTypes.map((typeOption) => (
              <MenuItem key={typeOption} value={typeOption}>
                {typeOption}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTemplate}
          sx={{ px: 3, py: 1, whiteSpace: 'nowrap', borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: 4 }}
        >
          Add New Template
        </Button>
      </Box>

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Error: {error}
        </Alert>
      )}

      {/* Empty State Message */}
      {!loading && !error && filteredTemplates.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No calibration templates found matching your criteria. Try adjusting your filters or add a new template.
        </Alert>
      ) : (
        // Template List Table
        !loading && ( // Only render table if not loading
          <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden', borderRadius: 3 }}>
            <TableContainer>
              <Table stickyHeader aria-label="calibration templates table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Last Modified</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id} hover>
                      <TableCell>{template.name}</TableCell>
                      <TableCell>{template.type}</TableCell>
                      <TableCell>{template.description}</TableCell>
                      <TableCell>{new Date(template.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          aria-label={`edit ${template.name}`}
                          onClick={() => handleEditTemplate(template.id)}
                          color="primary"
                          sx={{ mr: 0.5 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          aria-label={`delete ${template.name}`}
                          onClick={() => handleDeleteClick(template.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">{"Confirm Template Deletion"}</DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            Are you sure you want to delete this template? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TemplateList;