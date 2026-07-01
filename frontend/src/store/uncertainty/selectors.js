// frontend/src/store/uncertainty/selectors.js
import { createSelector } from 'reselect';

// Base selector for the uncertainty state slice
const selectUncertaintyState = (state) => state.uncertainty;

/**
 * Selector to get all uncertainty formulas.
 * @param {object} state The Redux state.
 * @returns {Array} An array of all uncertainty formulas.
 */
export const getUncertaintyFormulas = createSelector(
  selectUncertaintyState,
  (uncertaintyState) => uncertaintyState.allFormulas
);

/**
 * Selector to get a specific uncertainty formula by its ID.
 * @param {object} state The Redux state.
 * @param {string} id The ID of the formula to retrieve.
 * @returns {object|undefined} The uncertainty formula object or undefined if not found.
 */
export const getUncertaintyFormulaById = createSelector(
  [getUncertaintyFormulas, (state, id) => id],
  (allFormulas, id) => allFormulas.find((formula) => formula.id === id)
);

/**
 * Selector to get the formula currently being edited.
 * @param {object} state The Redux state.
 * @returns {object|null} The current formula object or null.
 */
export const getCurrentEditingFormula = createSelector(
  selectUncertaintyState,
  (uncertaintyState) => uncertaintyState.currentFormula
);

/**
 * Selector to get the results from the last formula test.
 * @param {object} state The Redux state.
 * @returns {object|null} The test results object or null.
 */
export const getTestResults = createSelector(
  selectUncertaintyState,
  (uncertaintyState) => uncertaintyState.testResults
);

/**
 * Selector to get the loading status.
 * @param {object} state The Redux state.
 * @returns {boolean} True if an async operation is in progress, false otherwise.
 */
export const getIsLoading = createSelector(
  selectUncertaintyState,
  (uncertaintyState) => uncertaintyState.isLoading
);

/**
 * Selector to get any error messages.
 * @param {object} state The Redux state.
 * @returns {string|object|null} The error message or object, or null if no error.
 */
export const getError = createSelector(
  selectUncertaintyState,
  (uncertaintyState) => uncertaintyState.error
);