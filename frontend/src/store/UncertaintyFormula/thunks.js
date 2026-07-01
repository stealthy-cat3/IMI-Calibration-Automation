// frontend/src/store/uncertaintyFormula/thunks.js
// Mock data for uncertainty formulas
const mockUncertaintyFormulas = [
    {
        id: 'uf101',
        name: 'Standard Deviation Formula',
        formula: 'sqrt(sum((x_i - mean(x))^2) / (n - 1))',
        description: 'Calculates the standard deviation of a sample.',
        variables: ['x', 'n'],
        category: 'Statistical',
        lastUpdated: '2023-10-26T10:00:00Z',
    },
    {
        id: 'uf102',
        name: 'Combined Standard Uncertainty',
        formula: 'sqrt(sum( (c_i * u(x_i))^2 ) )',
        description: 'Calculates the combined standard uncertainty for uncorrelated input quantities.',
        variables: ['c_i', 'u(x_i)'],
        category: 'Metrology',
        lastUpdated: '2023-10-25T14:30:00Z',
    },
    {
        id: 'uf103',
        name: 'Type A Uncertainty',
        formula: 's / sqrt(n)',
        description: 'Evaluates uncertainty by statistical analysis of a series of observations.',
        variables: ['s', 'n'],
        category: 'Metrology',
        lastUpdated: '2023-10-24T09:15:00Z',
    },
    {
        id: 'uf104',
        name: 'Type B Uncertainty',
        formula: 'a / sqrt(3)',
        description: 'Evaluates uncertainty by means other than statistical analysis of a series of observations (e.g., from calibration certificates or manufacturer specifications). Assumes rectangular distribution for `a`.',
        variables: ['a'],
        category: 'Metrology',
        lastUpdated: '2023-10-26T11:00:00Z',
    },
];

// Action Types for Uncertainty Formulas
export const FETCH_UNCERTAINTY_FORMULAS_REQUEST = 'uncertaintyFormula/fetchUncertaintyFormulasRequest';
export const FETCH_UNCERTAINTY_FORMULAS_SUCCESS = 'uncertaintyFormula/fetchUncertaintyFormulasSuccess';
export const FETCH_UNCERTAINTY_FORMULAS_FAILURE = 'uncertaintyFormula/fetchUncertaintyFormulasFailure';

export const FETCH_UNCERTAINTY_FORMULA_BY_ID_REQUEST = 'uncertaintyFormula/fetchUncertaintyFormulaByIdRequest';
export const FETCH_UNCERTAINTY_FORMULA_BY_ID_SUCCESS = 'uncertaintyFormula/fetchUncertaintyFormulaByIdSuccess';
export const FETCH_UNCERTAINTY_FORMULA_BY_ID_FAILURE = 'uncertaintyFormula/fetchUncertaintyFormulaByIdFailure';

/**
 * Thunk to fetch all uncertainty formulas.
 * Simulates an API call to retrieve a list of formulas.
 * @param {object} filters - Optional filters for the API call (not used in mock).
 */
export const fetchUncertaintyFormulas = (filters = {}) => async (dispatch) => {
    dispatch({ type: FETCH_UNCERTAINTY_FORMULAS_REQUEST });
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

        // In a real application, you would make an actual API call here:
        // const response = await api.get('/uncertaintyFormulas', { params: filters });
        // const data = response.data;

        // Using mock data
        const data = mockUncertaintyFormulas;

        dispatch({
            type: FETCH_UNCERTAINTY_FORMULAS_SUCCESS,
            payload: data,
        });
    } catch (error) {
        dispatch({
            type: FETCH_UNCERTAINTY_FORMULAS_FAILURE,
            payload: error.message || 'Failed to fetch uncertainty formulas.',
        });
    }
};

/**
 * Thunk to fetch a single uncertainty formula by its ID.
 * Simulates an API call to retrieve specific formula details.
 * @param {string} formulaId - The ID of the uncertainty formula to fetch.
 */
export const fetchUncertaintyFormulaById = (formulaId) => async (dispatch) => {
    dispatch({ type: FETCH_UNCERTAINTY_FORMULA_BY_ID_REQUEST });
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

        // In a real application, you would make an actual API call here:
        // const response = await api.get(`/uncertaintyFormulas/${formulaId}`);
        // const data = response.data;

        // Using mock data
        const formula = mockUncertaintyFormulas.find(uf => uf.id === formulaId);

        if (formula) {
            dispatch({
                type: FETCH_UNCERTAINTY_FORMULA_BY_ID_SUCCESS,
                payload: formula,
            });
            return formula; // Return the fetched formula for potential chaining
        } else {
            throw new Error(`Uncertainty formula with ID ${formulaId} not found.`);
        }
    } catch (error) {
        dispatch({
            type: FETCH_UNCERTAINTY_FORMULA_BY_ID_FAILURE,
            payload: error.message || `Failed to fetch uncertainty formula ${formulaId}.`,
        });
        throw error; // Re-throw to allow component to catch if needed
    }
};