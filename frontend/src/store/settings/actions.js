// frontend/src/store/settings/actions.js
export const SET_LOADING = 'settings/SET_LOADING';
export const SET_ERROR = 'settings/SET_ERROR';
export const SET_THEME = 'settings/SET_THEME';
export const SET_LANGUAGE = 'settings/SET_LANGUAGE';
export const SET_NOTIFICATION_PREFERENCES = 'settings/SET_NOTIFICATION_PREFERENCES';
export const SET_ALL_SETTINGS = 'settings/SET_ALL_SETTINGS';
export const UPDATE_DEFAULT_CALIBRATION_PARAMS = 'settings/UPDATE_DEFAULT_CALIBRATION_PARAMS'; // Added

export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading,
});

export const setError = (error) => ({
  type: SET_ERROR,
  payload: error,
});

export const setTheme = (theme) => ({
  type: SET_THEME,
  payload: theme,
});

export const setLanguage = (language) => ({
  type: SET_LANGUAGE,
  payload: language,
});

export const setNotificationPreferences = (preferences) => ({
  type: SET_NOTIFICATION_PREFERENCES,
  payload: preferences,
});

export const setAllSettings = (settings) => ({
  type: SET_ALL_SETTINGS,
  payload: settings,
});

// Action creator for updating default calibration parameters
export const updateDefaultCalibrationParams = (params) => ({
  type: UPDATE_DEFAULT_CALIBRATION_PARAMS,
  payload: params,
});

export const SAVE_SETTINGS_REQUEST = 'settings/SAVE_SETTINGS_REQUEST';
export const SAVE_SETTINGS_SUCCESS = 'settings/SAVE_SETTINGS_SUCCESS';
export const SAVE_SETTINGS_FAILURE = 'settings/SAVE_SETTINGS_FAILURE';

export const saveSettingsRequest = () => ({ type: SAVE_SETTINGS_REQUEST });
export const saveSettingsSuccess = (settings) => ({ type: SAVE_SETTINGS_SUCCESS, payload: settings });
export const saveSettingsFailure = (error) => ({ type: SAVE_SETTINGS_FAILURE, payload: error });