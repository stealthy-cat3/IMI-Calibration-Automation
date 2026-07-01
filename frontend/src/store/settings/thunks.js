// frontend/src/store/settings/thunks.js
// This file orchestrates asynchronous operations related to user settings.

// Importing action creators specific to the settings module.
// These actions are dispatched to update the settings state based on async operation outcomes.
import {
  saveSettingsRequest,
  saveSettingsSuccess,
  saveSettingsFailure
} from './actions'; // Ensure 'frontend/src/store/settings/actions.js' defines these.

// Importing the API service responsible for interacting with the settings backend.
import { settingsApi } from '../../api'; // Ensure 'frontend/src/api/index.js' exports a 'settingsApi' object.

// --- INTER-MODULE CONNECTION ---
// Importing the `fetchReports` thunk from the 'Report' module.
// This allows the 'Settings' module to trigger a report refresh after settings changes.
import { fetchReports } from '../report/thunks'; // Ensure 'frontend/src/store/report/thunks.js' exports 'fetchReports'.


/**
 * Thunk to handle saving user settings to the backend.
 * After a successful save operation, it triggers a refresh of the reports
 * to ensure they reflect the newly saved settings.
 *
 * @param {object} settingsData - An object containing the user settings to be saved.
 * @returns {Function} A Redux thunk function that dispatches actions.
 */
export const saveUserSettings = (settingsData) => async (dispatch) => {
  // Dispatch an action to indicate that a settings save operation has started.
  // This typically updates a 'loading' state in the settings reducer.
  dispatch(saveSettingsRequest());

  try {
    // Simulate an API call to update user settings.
    // In a real application, 'settingsApi.updateSettings' would make a network request.
    // For demonstration, it's mocked to return a successful response after a delay.
    const response = await settingsApi.updateSettings(settingsData);

    // Dispatch an action to indicate that settings were successfully saved.
    // This updates the settings state with the newly saved data.
    dispatch(saveSettingsSuccess(response.data));

    // --- INTER-MODULE CONNECTION ---
    // After successfully saving settings, trigger a refresh of reports.
    // This call to `fetchReports` will cause the Report module to re-fetch its data,
    // using the latest settings (which it would typically access via `getState()`).
    console.log("Settings saved successfully. Initiating report data refresh based on new settings.");
    dispatch(fetchReports()); // Call the thunk from the Report module.

  } catch (error) {
    // Dispatch an action to indicate that the settings save operation failed.
    // This typically updates an 'error' state in the settings reducer.
    console.error("Failed to save user settings:", error);
    dispatch(saveSettingsFailure(error.message || 'Failed to save settings'));
  }
};

export const fetchSettings = () => async (dispatch) => {
  dispatch({ type: 'settings/FETCH_SETTINGS_REQUEST' });
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    dispatch({
      type: 'settings/FETCH_SETTINGS_SUCCESS',
      payload: {
        themeMode: 'light',
        isDemoModeEnabled: false,
        demoModeGeneralMarginError: 0.05,
        isDarkModeEnabled: false,
        nearMarginThreshold: 0.10
      }
    });
  } catch (error) {
    dispatch({ type: 'settings/FETCH_SETTINGS_FAILURE', payload: error.message });
  }
};

export const updateDemoMode = (enabled) => (dispatch) => {
  dispatch({ type: 'settings/SET_DEMO_MODE_ENABLED', payload: enabled });
};

export const updateDemoModeGeneralMarginError = (errorMargin) => (dispatch) => {
  dispatch({ type: 'settings/SET_DEMO_MODE_GENERAL_MARGIN_ERROR', payload: errorMargin });
};

export const updateDarkMode = (enabled) => (dispatch) => {
  dispatch({ type: 'settings/SET_DARK_MODE_ENABLED', payload: enabled });
};

export const updateThemeMode = (mode) => (dispatch) => {
  dispatch({ type: 'settings/SET_THEME_MODE', payload: mode });
};

export const updateNearMarginThreshold = (threshold) => (dispatch) => {
  dispatch({ type: 'settings/SET_NEAR_MARGIN_THRESHOLD', payload: threshold });
};

// Mock dependencies for local development/testing:

// --- Mock for frontend/src/store/settings/actions.js ---
/*
export const SAVE_SETTINGS_REQUEST = 'settings/SAVE_SETTINGS_REQUEST';
export const SAVE_SETTINGS_SUCCESS = 'settings/SAVE_SETTINGS_SUCCESS';
export const SAVE_SETTINGS_FAILURE = 'settings/SAVE_SETTINGS_FAILURE';

export const saveSettingsRequest = () => ({ type: SAVE_SETTINGS_REQUEST });
export const saveSettingsSuccess = (settings) => ({ type: SAVE_SETTINGS_SUCCESS, payload: settings });
export const saveSettingsFailure = (error) => ({ type: SAVE_SETTINGS_FAILURE, payload: error });
*/

// --- Mock for frontend/src/api/index.js ---
/*
export const settingsApi = {
  updateSettings: async (settings) => {
    console.log("Mock API: Updating settings:", settings);
    return new Promise(resolve => setTimeout(() => {
      // Simulate success or failure
      if (settings && settings.simulateError) { // Add a flag to test error case
        throw new Error("Mock API Error: Failed to save settings.");
      }
      resolve({ data: { ...settings, lastUpdated: new Date().toISOString() } });
    }, 500)); // Simulate network latency
  },
  // Add other API methods if needed, e.g., getSettings
};
*/

// --- Mock for frontend/src/store/report/thunks.js ---
/*
// This mock demonstrates how fetchReports would look,
// adhering to the specified thunk signature: `export const funcName = (filters = {}) => async (dispatch, getState) => {`
// In a real scenario, this would interact with the Report API and dispatch its own actions.
import {
  fetchReportsRequest,
  fetchReportsSuccess,
  fetchReportsFailure
} from './actions'; // Assuming report actions exist
import { reportApi } from '../../api'; // Assuming report API exists
// Assuming selectors for settings exist
// import { selectDefaultDateRange, selectReportFilters } from '../settings/selectors';

export const fetchReports = (reportParams = {}) => async (dispatch, getState) => {
  dispatch(fetchReportsRequest());
  try {
    const state = getState();
    // In a real scenario, you'd extract relevant settings from the state
    // const defaultDateRange = selectDefaultDateRange(state);
    // const reportFilters = selectReportFilters(state);

    // Combine any passed parameters with settings from state
    // const params = {
    //   dateRange: defaultDateRange,
    //   filters: reportFilters,
    //   ...reportParams, // Allow overriding or adding specific report parameters
    // };

    console.log("Mock: fetchReports called. Assuming it's using latest settings from state.");
    // const response = await reportApi.getReports(params);
    const mockReports = [{ id: 1, name: 'Report A (updated)', date: new Date().toLocaleDateString() }];
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
    dispatch(fetchReportsSuccess(mockReports));
  } catch (error) {
    console.error("Mock: Failed to fetch reports:", error);
    dispatch(fetchReportsFailure(error.message || 'Failed to fetch reports'));
  }
};
*/