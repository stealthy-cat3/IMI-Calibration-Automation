// frontend/src/store/admin/reducer.js
import {
  FETCH_VALIDATION_RULES_REQUEST,
  FETCH_VALIDATION_RULES_SUCCESS,
  FETCH_VALIDATION_RULES_FAILURE,
  SELECT_VALIDATION_RULE,
  CLEAR_SELECTED_VALIDATION_RULE,
} from './actionTypes';

/**
 * @typedef {object} Documentation
 * @property {string} title
 * @property {string} content
 * @property {string} version
 * @property {string} lastUpdated
 * @property {string} author
 * @property {string} status
 */

/**
 * @typedef {object} ValidationRule
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {Documentation} documentation
 * @property {string} category
 * @property {string} severity
 * @property {string} status
 * @property {string[]} applicableModules
 * @property {string} lastReviewed
 * @property {number} reviewFrequencyMonths
 * @property {string} owner
 */

/**
 * @typedef {object} AdminState
 * @property {ValidationRule[]} validationRules - Array of all software validation rules.
 * @property {ValidationRule | null} selectedValidationRule - The currently selected rule object, primarily for documentation.
 * @property {boolean} loading - Indicates if data is currently being fetched.
 * @property {string | null} error - Stores any error messages.
 */

/** @type {AdminState} */
const initialState = {
  validationRules: [],
  selectedValidationRule: null,
  loading: false,
  error: null,
};

const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_VALIDATION_RULES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_VALIDATION_RULES_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        validationRules: action.payload,
      };
    case FETCH_VALIDATION_RULES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        validationRules: [], // Clear rules on failure to avoid stale data
      };
    case SELECT_VALIDATION_RULE:
      // Find the rule by ID from the existing validationRules array
      const selectedRule = state.validationRules.find(
        (rule) => rule.id === action.payload
      );
      return {
        ...state,
        selectedValidationRule: selectedRule || null, // Set to null if not found
      };
    case CLEAR_SELECTED_VALIDATION_RULE:
      return {
        ...state,
        selectedValidationRule: null,
      };
    default:
      return state;
  }
};

export default adminReducer;