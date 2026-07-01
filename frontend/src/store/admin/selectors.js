// frontend/src/store/admin/selectors.js
import { createSelector } from 'reselect';

// Base selector for the admin state slice
const getAdminState = (state) => state.admin;

/**
 * Selector to get the array of all software validation rules.
 * @param {object} state The Redux state.
 * @returns {Array} An array of validation rule objects.
 */
export const getValidationRules = createSelector(
  [getAdminState],
  (adminState) => adminState.validationRules
);

/**
 * Selector to get the currently selected validation rule object.
 * @param {object} state The Redux state.
 * @returns {object | null} The selected validation rule object, or null if none is selected.
 */
export const getSelectedValidationRule = createSelector(
  [getAdminState],
  (adminState) => adminState.selectedValidationRule
);

/**
 * Selector to get the loading status of the admin module.
 * @param {object} state The Redux state.
 * @returns {boolean} True if data is currently being fetched, false otherwise.
 */
export const getIsAdminLoading = createSelector(
  [getAdminState],
  (adminState) => adminState.loading
);

/**
 * Selector to get any error message from the admin module.
 * @param {object} state The Redux state.
 * @returns {string | null} The error message, or null if there's no error.
 */
export const getAdminError = createSelector(
  [getAdminState],
  (adminState) => adminState.error
);

/**
 * Selector to get a specific validation rule object by its ID.
 * This selector is not memoized based on `ruleId` directly by `createSelector`
 * because `ruleId` is an argument. Its result will be recomputed if `validationRules` changes.
 * For true per-ID memoization, a selector factory approach would be needed,
 * but for typical usage, this is sufficient.
 * @param {object} state The Redux state.
 * @param {string} ruleId The ID of the validation rule to find.
 * @returns {object | undefined} The validation rule object, or undefined if not found.
 */
export const getValidationRuleById = createSelector(
  [getValidationRules, (state, ruleId) => ruleId],
  (validationRules, ruleId) =>
    validationRules.find((rule) => rule.id === ruleId)
);