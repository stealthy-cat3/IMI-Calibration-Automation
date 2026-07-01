// frontend/src/store/uncertaintyFormula/reducer.js
// Action Types for Uncertainty Formulas
// These would typically be defined in a separate 'actions.js' or 'constants.js' file
// but are defined here for self-containment given the task scope.
export const FETCH_UNCERTAINTY_FORMULAS_REQUEST = 'uncertaintyFormula/fetchFormulasRequest';
export const FETCH_UNCERTAINTY_FORMULAS_SUCCESS = 'uncertaintyFormula/fetchFormulasSuccess';
export const FETCH_UNCERTAINTY_FORMULAS_FAILURE = 'uncertaintyFormula/fetchFormulasFailure';

export const FETCH_UNCERTAINTY_FORMULA_BY_ID_REQUEST = 'uncertaintyFormula/fetchFormulaByIdRequest';
export const FETCH_UNCERTAINTY_FORMULA_BY_ID_SUCCESS = 'uncertaintyFormula/fetchFormulaByIdSuccess';
export const FETCH_UNCERTAINTY_FORMULA_BY_ID_FAILURE = 'uncertaintyFormula/fetchFormulaByIdFailure';

// Initial State for the Uncertainty Formula slice
const initialState = {
  byId: {}, // Normalized storage for uncertainty formula objects by their ID
  allIds: [], // Array of all uncertainty formula IDs, maintains order or just a list
  loading: false, // Indicates if data is currently being fetched
  error: null, // Stores any error encountered during fetching
};

/**
 * Utility function to normalize an array of entities.
 * @param {Array<Object>} entities - An array of entity objects, each with an 'id' property.
 * @returns {{byId: Object, allIds: Array<string>}} An object containing normalized data.
 */
const normalizeEntities = (entities) => {
  const byId = {};
  const allIds = [];
  entities.forEach(entity => {
    byId[entity.id] = entity;
    allIds.push(entity.id);
  });
  return { byId, allIds };
};

/**
 * Reducer for managing the state of Uncertainty Formulas.
 * Handles actions related to fetching uncertainty formulas, storing them in a normalized structure.
 */
const uncertaintyFormulaReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_UNCERTAINTY_FORMULAS_REQUEST:
    case FETCH_UNCERTAINTY_FORMULA_BY_ID_REQUEST:
      return {
        ...state,
        loading: true,
        error: null, // Clear any previous errors on new request
      };

    case FETCH_UNCERTAINTY_FORMULAS_SUCCESS: {
      const { byId, allIds } = normalizeEntities(action.payload);
      return {
        ...state,
        loading: false,
        error: null,
        // Replace existing data with new fetched list
        byId: byId,
        allIds: allIds,
      };
    }

    case FETCH_UNCERTAINTY_FORMULA_BY_ID_SUCCESS: {
      const formula = action.payload;
      return {
        ...state,
        loading: false,
        error: null,
        byId: {
          ...state.byId,
          [formula.id]: formula, // Add or update the single formula
        },
        allIds: state.allIds.includes(formula.id)
          ? state.allIds
          : [...state.allIds, formula.id], // Add ID if not already present
      };
    }

    case FETCH_UNCERTAINTY_FORMULAS_FAILURE:
    case FETCH_UNCERTAINTY_FORMULA_BY_ID_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload, // Store the error message
      };

    default:
      return state;
  }
};

export default uncertaintyFormulaReducer;