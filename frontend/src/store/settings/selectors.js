// frontend/src/store/settings/selectors.js
import { createSelector } from 'reselect';

// Base selector to get the settings slice from the Redux state
const selectSettingsState = (state) => state.settings;

/**
 * Selects the entire settings data object.
 * @param {object} state - The Redux state.
 * @returns {object} The settings data object.
 */
export const selectSettings = createSelector(
  [selectSettingsState],
  (settingsState) => settingsState
);

/**
 * Selects the boolean value of `isDemoModeEnabled`.
 * @param {object} state - The Redux state.
 * @returns {boolean} True if Demo Mode is enabled, false otherwise.
 */
export const selectIsDemoModeEnabled = createSelector(
  [selectSettings],
  (settings) => settings.isDemoModeEnabled
);

/**
 * Selects the numerical value of `demoModeGeneralMarginError`.
 * @param {object} state - The Redux state.
 * @returns {number} The general margin of error for Demo Mode.
 */
export const selectDemoModeGeneralMarginError = createSelector(
  [selectSettings],
  (settings) => settings.demoModeGeneralMarginError
);

/**
 * Selects the boolean value of `isDarkModeEnabled`.
 * @param {object} state - The Redux state.
 * @returns {boolean} True if Dark Mode is enabled, false otherwise.
 */
export const selectIsDarkModeEnabled = createSelector(
  [selectSettings],
  (settings) => settings.isDarkModeEnabled
);

/**
 * Selects the string value of `themeMode`.
 * @param {object} state - The Redux state.
 * @returns {string} The current theme mode ('light', 'dark', 'dark-red').
 */
export const selectThemeMode = createSelector(
  [selectSettings],
  (settings) => settings.themeMode || 'light'
);

/**
 * Selects the numerical value of `nearMarginThreshold`.
 * @param {object} state - The Redux state.
 * @returns {number} The threshold for the 'near margin' indication.
 */
export const selectNearMarginThreshold = createSelector(
  [selectSettings],
  (settings) => settings.nearMarginThreshold
);

/**
 * Selects the loading status for settings operations.
 * @param {object} state - The Redux state.
 * @returns {boolean} True if settings are currently loading, false otherwise.
 */
export const selectSettingsLoading = createSelector(
  [selectSettingsState],
  (settingsState) => settingsState.isLoading
);

/**
 * Selects any error message associated with settings operations.
 * @param {object} state - The Redux state.
 * @returns {string|null} The error message, or null if no error.
 */
export const selectSettingsError = createSelector(
  [selectSettingsState],
  (settingsState) => settingsState.error
);