// frontend/src/store/uncertainty/thunks.js
import { v4 as uuidv4 } from 'uuid';
import {
  FETCH_UNCERTAINTY_FORMULAS_REQUEST,
  FETCH_UNCERTAINTY_FORMULAS_SUCCESS,
  FETCH_UNCERTAINTY_FORMULAS_FAILURE,
  SAVE_UNCERTAINTY_FORMULA_REQUEST,
  SAVE_UNCERTAINTY_FORMULA_SUCCESS,
  SAVE_UNCERTAINTY_FORMULA_FAILURE,
  TEST_UNCERTAINTY_FORMULA_REQUEST,
  TEST_UNCERTAINTY_FORMULA_SUCCESS,
  TEST_UNCERTAINTY_FORMULA_FAILURE,
  RESTORE_UNCERTAINTY_FORMULA_REQUEST,
  RESTORE_UNCERTAINTY_FORMULA_SUCCESS,
  RESTORE_UNCERTAINTY_FORMULA_FAILURE,
  SET_CURRENT_EDITING_FORMULA,
  UPDATE_CURRENT_EDITING_FORMULA,
  CLEAR_CURRENT_EDITING_FORMULA,
} from './actionTypes';

// Simulate API delay
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// --- FIXTURE DATA ---
export const __UNCERTAINTY_FIXTURE__ = [
  {
    id: 'uf-001',
    name: 'Default GUM Formula',
    description: 'General Uncertainty Measurement formula based on JCGM 100:2008.',
    formulaJson: JSON.stringify({
      nodes: [
        { id: 'start', type: 'input', position: { x: 50, y: 50 }, data: { label: 'Start' } },
        { id: 'param_A', type: 'variable', position: { x: 200, y: 50 }, data: { name: 'Input A', value: 'x' } },
        { id: 'param_B', type: 'variable', position: { x: 200, y: 150 }, data: { name: 'Input B', value: 'y' } },
        { id: 'op_add', type: 'operator', position: { x: 400, y: 100 }, data: { operator: '+' } },
        { id: 'end', type: 'output', position: { x: 600, y: 100 }, data: { label: 'Result' } },
      ],
      edges: [
        { id: 'e1', source: 'param_A', target: 'op_add', sourceHandle: 'output' },
        { id: 'e2', source: 'param_B', target: 'op_add', sourceHandle: 'output' },
        { id: 'e3', source: 'op_add', target: 'end', sourceHandle: 'output' },
      ],
    }),
    defaultFormulaJson: JSON.stringify({
      nodes: [
        { id: 'start', type: 'input', position: { x: 50, y: 50 }, data: { label: 'Start' } },
        { id: 'param_A', type: 'variable', position: { x: 200, y: 50 }, data: { name: 'Input A', value: 'x' } },
        { id: 'param_B', type: 'variable', position: { x: 200, y: 150 }, data: { name: 'Input B', value: 'y' } },
        { id: 'op_add', type: 'operator', position: { x: 400, y: 100 }, data: { operator: '+' } },
        { id: 'end', type: 'output', position: { x: 600, y: 100 }, data: { label: 'Result' } },
      ],
      edges: [
        { id: 'e1', source: 'param_A', target: 'op_add', sourceHandle: 'output' },
        { id: 'e2', source: 'param_B', target: 'op_add', sourceHandle: 'output' },
        { id: 'e3', source: 'op_add', target: 'end', sourceHandle: 'output' },
      ],
    }),
    version: '1.0.0',
    lastModifiedBy: 'admin@example.com',
    lastModifiedDate: '2023-10-26T10:00:00Z',
    isActive: true,
    parameters: [
      { name: 'Input A', type: 'number', unit: 'mm' },
      { name: 'Input B', type: 'number', unit: 'mm' },
    ],
    outputUnit: 'mm',
  },
  {
    id: 'uf-002',
    name: 'Custom Calibration Formula',
    description: 'Formula for specific calibration procedure.',
    formulaJson: JSON.stringify({
      nodes: [
        { id: 'start', type: 'input', position: { x: 50, y: 50 }, data: { label: 'Start' } },
        { id: 'meas', type: 'variable', position: { x: 200, y: 50 }, data: { name: 'Measurement', value: 'M' } },
        { id: 'corr', type: 'variable', position: { x: 200, y: 150 }, data: { name: 'Correction Factor', value: 'C' } },
        { id: 'op_mul', type: 'operator', position: { x: 400, y: 100 }, data: { operator: '*' } },
        { id: 'end', type: 'output', position: { x: 600, y: 100 }, data: { label: 'Result' } },
      ],
      edges: [
        { id: 'e1', source: 'meas', target: 'op_mul', sourceHandle: 'output' },
        { id: 'e2', source: 'corr', target: 'op_mul', sourceHandle: 'output' },
        { id: 'e3', source: 'op_mul', target: 'end', sourceHandle: 'output' },
      ],
    }),
    defaultFormulaJson: JSON.stringify({
      nodes: [
        { id: 'start', type: 'input', position: { x: 50, y: 50 }, data: { label: 'Start' } },
        { id: 'meas', type: 'variable', position: { x: 200, y: 50 }, data: { name: 'Measurement', value: 'M' } },
        { id: 'corr', type: 'variable', position: { x: 200, y: 150 }, data: { name: 'Correction Factor', value: 'C' } },
        { id: 'op_mul', type: 'operator', position: { x: 400, y: 100 }, data: { operator: '*' } },
        { id: 'end', type: 'output', position: { x: 600, y: 100 }, data: { label: 'Result' } },
      ],
      edges: [
        { id: 'e1', source: 'meas', target: 'op_mul', sourceHandle: 'output' },
        { id: 'e2', source: 'corr', target: 'op_mul', sourceHandle: 'output' },
        { id: 'e3', source: 'op_mul', target: 'end', sourceHandle: 'output' },
      ],
    }),
    version: '1.2.0',
    lastModifiedBy: 'engineer@example.com',
    lastModifiedDate: '2023-11-15T14:30:00Z',
    isActive: true,
    parameters: [
      { name: 'Measurement', type: 'number', unit: 'mm' },
      { name: 'Correction Factor', type: 'number', unit: '' },
    ],
    outputUnit: 'mm',
  },
  {
    id: 'uf-003',
    name: 'Temperature Compensation',
    description: 'Formula for adjusting measurements based on temperature variations.',
    formulaJson: JSON.stringify({
      nodes: [
        { id: 'start', type: 'input', position: { x: 50, y: 50 }, data: { label: 'Start' } },
        { id: 'raw_temp', type: 'variable', position: { x: 200, y: 50 }, data: { name: 'Raw Temperature', value: 'Tr' } },
        { id: 'ref_temp', type: 'variable', position: { x: 200, y: 150 }, data: { name: 'Reference Temperature', value: 'T0' } },
        { id: 'coeff', type: 'variable', position: { x: 200, y: 250 }, data: { name: 'Coefficient', value: 'alpha' } },
        { id: 'op_sub', type: 'operator', position: { x: 400, y: 100 }, data: { operator: '-' } },
        { id: 'op_mul_1', type: 'operator', position: { x: 550, y: 175 }, data: { operator: '*' } },
        { id: 'op_mul_2', type: 'operator', position: { x: 700, y: 175 }, data: { operator: '*' } },
        { id: 'meas_val', type: 'variable', position: { x: 550, y: 50 }, data: { name: 'Measured Value', value: 'Vm' } },
        { id: 'op_add', type: 'operator', position: { x: 850, y: 175 }, data: { operator: '+' } },
        { id: 'end', type: 'output', position: { x: 1000, y: 175 }, data: { label: 'Result' } },
      ],
      edges: [
        { id: 'e1', source: 'raw_temp', target: 'op_sub', sourceHandle: 'output' },
        { id: 'e2', source: 'ref_temp', target: 'op_sub', sourceHandle: 'output' },
        { id: 'e3', source: 'op_sub', target: 'op_mul_1', sourceHandle: 'output' },
        { id: 'e4', source: 'coeff', target: 'op_mul_1', sourceHandle: 'output' },
        { id: 'e5', source: 'op_mul_1', target: 'op_mul_2', sourceHandle: 'output' },
        { id: 'e6', source: 'meas_val', target: 'op_mul_2', sourceHandle: 'output' },
        { id: 'e7', source: 'op_mul_2', target: 'op_add', sourceHandle: 'output' },
        { id: 'e8', source: 'meas_val', target: 'op_add', sourceHandle: 'output' },
        { id: 'e9', source: 'op_add', target: 'end', sourceHandle: 'output' },
      ],
    }),
    defaultFormulaJson: JSON.stringify({
      nodes: [
        { id: 'start', type: 'input', position: { x: 50, y: 50 }, data: { label: 'Start' } },
        { id: 'raw_temp', type: 'variable', position: { x: 200, y: 50 }, data: { name: 'Raw Temperature', value: 'Tr' } },
        { id: 'ref_temp', type: 'variable', position: { x: 200, y: 150 }, data: { name: 'Reference Temperature', value: 'T0' } },
        { id: 'coeff', type: 'variable', position: { x: 200, y: 250 }, data: { name: 'Coefficient', value: 'alpha' } },
        { id: 'op_sub', type: 'operator', position: { x: 400, y: 100 }, data: { operator: '-' } },
        { id: 'op_mul_1', type: 'operator', position: { x: 550, y: 175 }, data: { operator: '*' } },
        { id: 'op_mul_2', type: 'operator', position: { x: 700, y: 175 }, data: { operator: '*' } },
        { id: 'meas_val', type: 'variable', position: { x: 550, y: 50 }, data: { name: 'Measured Value', value: 'Vm' } },
        { id: 'op_add', type: 'operator', position: { x: 850, y: 175 }, data: { operator: '+' } },
        { id: 'end', type: 'output', position: { x: 1000, y: 175 }, data: { label: 'Result' } },
      ],
      edges: [
        { id: 'e1', source: 'raw_temp', target: 'op_sub', sourceHandle: 'output' },
        { id: 'e2', source: 'ref_temp', target: 'op_sub', sourceHandle: 'output' },
        { id: 'e3', source: 'op_sub', target: 'op_mul_1', sourceHandle: 'output' },
        { id: 'e4', source: 'coeff', target: 'op_mul_1', sourceHandle: 'output' },
        { id: 'e5', source: 'op_mul_1', target: 'op_mul_2', sourceHandle: 'output' },
        { id: 'e6', source: 'meas_val', target: 'op_mul_2', sourceHandle: 'output' },
        { id: 'e7', source: 'op_mul_2', target: 'op_add', sourceHandle: 'output' },
        { id: 'e8', source: 'meas_val', target: 'op_add', sourceHandle: 'output' },
        { id: 'e9', source: 'op_add', target: 'end', sourceHandle: 'output' },
      ],
    }),
    version: '1.0.0',
    lastModifiedBy: 'admin@example.com',
    lastModifiedDate: '2023-09-01T08:00:00Z',
    isActive: true,
    parameters: [
      { name: 'Raw Temperature', type: 'number', unit: '°C' },
      { name: 'Reference Temperature', type: 'number', unit: '°C' },
      { name: 'Coefficient', type: 'number', unit: '1/°C' },
      { name: 'Measured Value', type: 'number', unit: 'mm' },
    ],
    outputUnit: 'mm',
  },
];

let uncertaintyFormulasDb = [...__UNCERTAINTY_FIXTURE__]; // In-memory database

// --- THUNKS ---

/**
 * Fetches all uncertainty formulas from the backend.
 */
export const fetchUncertaintyFormulas = () => async (dispatch) => {
  dispatch({ type: FETCH_UNCERTAINTY_FORMULAS_REQUEST });
  try {
    await delay(500); // Simulate API call
    // In a real app, you would make an actual API request here
    // const response = await api.get('/uncertainty-formulas');
    dispatch({
      type: FETCH_UNCERTAINTY_FORMULAS_SUCCESS,
      payload: uncertaintyFormulasDb,
    });
  } catch (error) {
    dispatch({
      type: FETCH_UNCERTAINTY_FORMULAS_FAILURE,
      payload: error.message || 'Failed to fetch uncertainty formulas.',
    });
  }
};

/**
 * Saves a new or updates an existing uncertainty formula.
 * @param {object} formulaData - The formula data to save/update.
 */
export const saveUncertaintyFormula = (formulaData) => async (dispatch) => {
  dispatch({ type: SAVE_UNCERTAINTY_FORMULA_REQUEST });
  try {
    await delay(700); // Simulate API call

    let savedFormula;
    const now = new Date().toISOString();

    if (formulaData.id) {
      // Update existing formula
      uncertaintyFormulasDb = uncertaintyFormulasDb.map((formula) =>
        formula.id === formulaData.id
          ? {
              ...formula,
              ...formulaData,
              lastModifiedDate: now,
              // Optionally update version
              version: (parseFloat(formula.version || '1.0.0') + 0.1).toFixed(1),
            }
          : formula
      );
      savedFormula = uncertaintyFormulasDb.find((f) => f.id === formulaData.id);
    } else {
      // Create new formula
      savedFormula = {
        id: `uf-${uuidv4()}`, // Generate a unique ID
        name: formulaData.name || 'New Uncertainty Formula',
        description: formulaData.description || 'Custom formula.',
        formulaJson: formulaData.formulaJson || JSON.stringify({ nodes: [], edges: [] }),
        defaultFormulaJson: formulaData.formulaJson || JSON.stringify({ nodes: [], edges: [] }), // Default is same as initial
        version: '1.0',
        lastModifiedBy: formulaData.lastModifiedBy || 'system',
        lastModifiedDate: now,
        isActive: formulaData.isActive !== undefined ? formulaData.isActive : true,
        parameters: formulaData.parameters || [],
        outputUnit: formulaData.outputUnit || '',
      };
      uncertaintyFormulasDb.push(savedFormula);
    }

    dispatch({
      type: SAVE_UNCERTAINTY_FORMULA_SUCCESS,
      payload: savedFormula,
    });
  } catch (error) {
    dispatch({
      type: SAVE_UNCERTAINTY_FORMULA_FAILURE,
      payload: error.message || 'Failed to save uncertainty formula.',
    });
  }
};

/**
 * Sends an uncertainty formula and sample data to the backend for real-time testing.
 * @param {string} formulaId - The ID of the formula to test.
 * @param {object} sampleData - Key-value pairs of input parameters for the formula (e.g., { 'Input A': 10, 'Input B': 5 }).
 */
export const testUncertaintyFormula = (formulaId, sampleData) => async (dispatch) => {
  dispatch({ type: TEST_UNCERTAINTY_FORMULA_REQUEST });
  try {
    await delay(1000); // Simulate API call for testing

    const formula = uncertaintyFormulasDb.find((f) => f.id === formulaId);

    if (!formula) {
      throw new Error('Formula not found.');
    }

    // Simulate formula evaluation based on formulaJson and sampleData
    let result;
    let validationErrors = [];

    // Simple mock evaluation logic
    const formulaNodes = JSON.parse(formula.formulaJson).nodes;
    const requiredParams = formulaNodes
      .filter((node) => node.type === 'variable')
      .map((node) => node.data.name);

    const missingParams = requiredParams.filter((param) => sampleData[param] === undefined);
    if (missingParams.length > 0) {
      validationErrors.push(
        `Missing required parameters: ${missingParams.join(', ')}. Please provide values for all formula inputs.`
      );
    }

    if (validationErrors.length > 0) {
      // If there are validation errors, simulate a failure response for testing, but still provide errors.
      dispatch({
        type: TEST_UNCERTAINTY_FORMULA_FAILURE,
        payload: {
          message: 'Formula test failed due to input validation errors.',
          errors: validationErrors,
        },
      });
      return;
    }

    // A very basic simulation: if the formula contains '+', add. If '*', multiply.
    // This would be replaced by a robust formula evaluation engine.
    if (formula.formulaJson.includes('operator": "+"')) {
      const paramValues = requiredParams.map((p) => sampleData[p] || 0);
      result = paramValues.reduce((sum, val) => sum + val, 0);
    } else if (formula.formulaJson.includes('operator": "*"')) {
      const paramValues = requiredParams.map((p) => sampleData[p] || 1);
      result = paramValues.reduce((prod, val) => prod * val, 1);
    } else {
      result = 'Mock Result: ' + JSON.stringify(sampleData); // Generic mock result
    }

    dispatch({
      type: TEST_UNCERTAINTY_FORMULA_SUCCESS,
      payload: {
        formulaId,
        input: sampleData,
        output: result,
        unit: formula.outputUnit,
        timestamp: new Date().toISOString(),
        validationErrors: [],
      },
    });
  } catch (error) {
    dispatch({
      type: TEST_UNCERTAINTY_FORMULA_FAILURE,
      payload: error.response?.data?.message || error.message || 'Failed to test uncertainty formula.',
    });
  }
};

/**
 * Reverts an uncertainty formula to its `defaultFormulaJson`.
 * @param {string} formulaId - The ID of the formula to restore.
 */
export const restoreUncertaintyFormula = (formulaId) => async (dispatch) => {
  dispatch({ type: RESTORE_UNCERTAINTY_FORMULA_REQUEST });
  try {
    await delay(700); // Simulate API call

    let restoredFormula;
    let found = false;

    uncertaintyFormulasDb = uncertaintyFormulasDb.map((formula) => {
      if (formula.id === formulaId) {
        found = true;
        restoredFormula = {
          ...formula,
          formulaJson: formula.defaultFormulaJson, // Revert to default
          version: (parseFloat(formula.version || '1.0.0') + 0.1).toFixed(1), // Increment version after restore
          lastModifiedBy: 'system (restore)',
          lastModifiedDate: new Date().toISOString(),
        };
        return restoredFormula;
      }
      return formula;
    });

    if (!found) {
      throw new Error('Formula not found for restoration.');
    }

    dispatch({
      type: RESTORE_UNCERTAINTY_FORMULA_SUCCESS,
      payload: restoredFormula,
    });
  } catch (error) {
    dispatch({
      type: RESTORE_UNCERTAINTY_FORMULA_FAILURE,
      payload: error.message || 'Failed to restore uncertainty formula.',
    });
  }
};

// --- SYNCHRONOUS ACTION CREATORS ---

/**
 * Sets the formula currently being edited in the visual editor.
 * @param {string} formulaId - The ID of the formula to set as current, or null to clear.
 * @param {object[]} allFormulas - All available formulas to find the one by ID.
 */
export const setCurrentEditingFormula = (formulaId, allFormulas) => (dispatch) => {
  const formulaToEdit = allFormulas.find((f) => f.id === formulaId);
  dispatch({
    type: SET_CURRENT_EDITING_FORMULA,
    payload: formulaToEdit || null,
  });
};

/**
 * Updates properties of the formula currently being edited.
 * @param {object} updates - Partial updates for the current formula.
 */
export const updateCurrentEditingFormula = (updates) => (dispatch) => {
  dispatch({
    type: UPDATE_CURRENT_EDITING_FORMULA,
    payload: updates,
  });
};

/**
 * Clears the currently editing formula state.
 */
export const clearCurrentEditingFormula = () => (dispatch) => {
  dispatch({
    type: CLEAR_CURRENT_EDITING_FORMULA,
  });
};