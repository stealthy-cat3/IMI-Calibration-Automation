// frontend/src/pages/uncertainty/MuFormulaList.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';

import {
  fetchUncertaintyFormulas,
  restoreUncertaintyFormula,
  setCurrentEditingFormula,
} from '../../store/uncertainty/thunks';
import {
  getUncertaintyFormulas,
  getIsLoading,
  getError,
} from '../../store/uncertainty/selectors';

const MuFormulaList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formulas = useSelector(getUncertaintyFormulas);
  const isLoading = useSelector(getIsLoading);
  const error = useSelector(getError);

  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [formulaToRestoreId, setFormulaToRestoreId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Can be 'success', 'error', 'info', 'warning'

  useEffect(() => {
    dispatch(fetchUncertaintyFormulas());
  }, [dispatch]);

  const handleCreateNew = () => {
    // Clear any existing editing state before navigating to create a new formula
    dispatch(setCurrentEditingFormula(null, formulas)); 
    navigate('/uncertainty/formulas/new');
  };

  const handleEditFormula = (formulaId) => {
    // Set the formula to be edited in the store before navigating
    dispatch(setCurrentEditingFormula(formulaId, formulas));
    navigate(`/uncertainty/formulas/edit/${formulaId}`);
  };

  const handleRestoreClick = (formulaId) => {
    setFormulaToRestoreId(formulaId);
    setOpenRestoreDialog(true);
  };

  const handleCloseRestoreDialog = () => {
    setOpenRestoreDialog(false);
    setFormulaToRestoreId(null);
  };

  const handleConfirmRestore = async () => {
    if (formulaToRestoreId) {
      await dispatch(restoreUncertaintyFormula(formulaToRestoreId));
      handleCloseRestoreDialog();
      
      // Provide user feedback
      if (!error) { // Check if there was no immediate error from the dispatch
        setSnackbarMessage('Formula restored to default successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Show snackbar for errors from Redux store
  useEffect(() => {
    if (error) {
      setSnackbarMessage(typeof error === 'string' ? error : error.message || 'An unknown error occurred.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [error]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom component="h1" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Measurement Uncertainty Formulas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          sx={{ ml: 2, px: 3, py: 1, whiteSpace: 'nowrap', borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: 4 }}
        >
          Create New Formula
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error display for fetch errors, specific action errors are handled by Snackbar */}
      {!isLoading && formulas.length === 0 && !error && (
        <Alert severity="info">No uncertainty formulas found. Click "Create New Formula" to add one.</Alert>
      )}

      {!isLoading && formulas.length > 0 && (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table aria-label="MU formulas table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Version</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Last Modified By</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Last Modified Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formulas.map((formula) => {
                const isDefault = JSON.stringify(JSON.parse(formula.formulaJson)) === JSON.stringify(JSON.parse(formula.defaultFormulaJson));
                return (
                  <TableRow key={formula.id} hover>
                    <TableCell>{formula.name}</TableCell>
                    <TableCell>{formula.description}</TableCell>
                    <TableCell>{formula.version}</TableCell>
                    <TableCell>{formula.lastModifiedBy}</TableCell>
                    <TableCell>{new Date(formula.lastModifiedDate).toLocaleString()}</TableCell>
                    <TableCell>
                      {formula.isActive ? (
                        <Typography variant="body2" color="success.main">Active</Typography>
                      ) : (
                        <Typography variant="body2" color="error.main">Inactive</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit Formula">
                        <IconButton
                          aria-label={`edit ${formula.name}`}
                          onClick={() => handleEditFormula(formula.id)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={isDefault ? "Formula is already default" : "Restore to Default"}>
                        <IconButton
                          aria-label={`restore ${formula.name}`}
                          onClick={() => handleRestoreClick(formula.id)}
                          color="secondary"
                          disabled={isDefault}
                        >
                          <RestoreIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={openRestoreDialog}
        onClose={handleCloseRestoreDialog}
        aria-labelledby="restore-dialog-title"
        aria-describedby="restore-dialog-description"
      >
        <DialogTitle id="restore-dialog-title">Confirm Restore</DialogTitle>
        <DialogContent>
          <DialogContentText id="restore-dialog-description">
            Are you sure you want to restore this formula to its default version? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRestoreDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmRestore} color="error" autoFocus>
            Restore
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MuFormulaList;