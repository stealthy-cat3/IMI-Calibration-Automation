// frontend/src/store/uncertainty/reducer.js
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

const initialState = {
  allFormulas: [],          // Array of all fetched uncertainty formulas
  currentFormula: null,     // The formula currently being viewed/edited
  testResults: null,        // Results from the formula testing feature
  isLoading: false,         // Flag for loading states
  error: null,              // Stores any error messages
};

const uncertaintyReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_UNCERTAINTY_FORMULAS_REQUEST:
    case SAVE_UNCERTAINTY_FORMULA_REQUEST:
    case TEST_UNCERTAINTY_FORMULA_REQUEST:
    case RESTORE_UNCERTAINTY_FORMULA_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case FETCH_UNCERTAINTY_FORMULAS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        allFormulas: action.payload,
      };

    case SAVE_UNCERTAINTY_FORMULA_SUCCESS: {
      const savedFormula = action.payload;
      const updatedFormulas = state.allFormulas.map((formula) =>
        formula.id === savedFormula.id ? savedFormula : formula
      );

      // If the formula was new, add it to the list
      if (!updatedFormulas.some(formula => formula.id === savedFormula.id)) {
        updatedFormulas.push(savedFormula);
      }

      return {
        ...state,
        isLoading: false,
        error: null,
        allFormulas: updatedFormulas,
        currentFormula: state.currentFormula?.id === savedFormula.id ? savedFormula : state.currentFormula,
      };
    }

    case RESTORE_UNCERTAINTY_FORMULA_SUCCESS: {
      const restoredFormula = action.payload;
      const updatedFormulas = state.allFormulas.map((formula) =>
        formula.id === restoredFormula.id ? restoredFormula : formula
      );
      return {
        ...state,
        isLoading: false,
        error: null,
        allFormulas: updatedFormulas,
        currentFormula: state.currentFormula?.id === restoredFormula.id ? restoredFormula : state.currentFormula,
      };
    }

    case TEST_UNCERTAINTY_FORMULA_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        testResults: action.payload,
      };

    case FETCH_UNCERTAINTY_FORMULAS_FAILURE:
    case SAVE_UNCERTAINTY_FORMULA_FAILURE:
    case TEST_UNCERTAINTY_FORMULA_FAILURE:
    case RESTORE_UNCERTAINTY_FORMULA_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case SET_CURRENT_EDITING_FORMULA:
      return {
        ...state,
        currentFormula: action.payload,
        testResults: null, // Clear test results when a new formula is set for editing
        error: null,
      };

    case UPDATE_CURRENT_EDITING_FORMULA:
      return {
        ...state,
        currentFormula: state.currentFormula
          ? { ...state.currentFormula, ...action.payload }
          : null,
        testResults: null, // Clear test results if the formula definition is changed
      };

    case CLEAR_CURRENT_EDITING_FORMULA:
      return {
        ...state,
        currentFormula: null,
        testResults: null,
        error: null,
      };

    default:
      return state;
  }
};

export default uncertaintyReducer;