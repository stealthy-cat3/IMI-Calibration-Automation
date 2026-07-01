// frontend/src/store/uncertaintyFormula/selectors.js
// Base selector to get the uncertaintyFormula slice of the state
export const selectUncertaintyFormulaState = (state) => state.uncertaintyFormula;

/**
 * Selector to retrieve an array of all defined uncertainty formulas.
 * @param {object} state - The Redux root state.
 * @returns {Array<object>} An array of uncertainty formula objects.
 */
export const selectAllUncertaintyFormulas = (state) =>
  selectUncertaintyFormulaState(state).formulas;

/**
 * Selector to retrieve a specific uncertainty formula by its ID.
 * @param {object} state - The Redux root state.
 * @param {string} formulaId - The ID of the uncertainty formula to retrieve.
 * @returns {object | undefined} The uncertainty formula object, or undefined if not found.
 */
export const selectUncertaintyFormulaById = (state, formulaId) =>
  selectAllUncertaintyFormulas(state).find((formula) => formula.id === formulaId);

// You might also have existing selectors here, for example:
/**
 * Selector to get the loading status of the uncertainty formulas.
 * @param {object} state - The Redux root state.
 * @returns {boolean} True if formulas are being loaded, false otherwise.
 */
export const selectUncertaintyFormulasLoading = (state) =>
  selectUncertaintyFormulaState(state).loading;

/**
 * Selector to get any error related to uncertainty formulas.
 * @param {object} state - The Redux root state.
 * @returns {string | null} The error message, or null if no error.
 */
export const selectUncertaintyFormulasError = (state) =>
  selectUncertaintyFormulaState(state).error;