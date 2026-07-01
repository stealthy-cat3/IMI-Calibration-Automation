// frontend/src/store/settings/reducer.js
import * as settingsActions from './actions';
import * as actionTypes from './actionTypes';

const initialState = {
  theme: 'light',
  themeMode: 'light',
  notificationsEnabled: true,
  language: 'en',
  defaultCalibrationParams: {
    tempOffset: 0,
    pressureMultiplier: 1.0,
    calibrationIntervalDays: 30,
  },
  isDemoModeEnabled: false,
  demoModeGeneralMarginError: 0.05,
  isDarkModeEnabled: false,
  nearMarginThreshold: 0.10,
  isLoading: false,
  error: null,
};

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case settingsActions.SET_SETTINGS_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case settingsActions.SET_SETTINGS_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    case settingsActions.UPDATE_THEME:
      return {
        ...state,
        theme: action.payload,
      };
    case settingsActions.TOGGLE_NOTIFICATIONS:
      return {
        ...state,
        notificationsEnabled: action.payload,
      };
    case settingsActions.UPDATE_LANGUAGE:
      return {
        ...state,
        language: action.payload,
      };
    case settingsActions.UPDATE_DEFAULT_CALIBRATION_PARAMS:
      return {
        ...state,
        defaultCalibrationParams: {
          ...state.defaultCalibrationParams,
          ...action.payload,
        },
      };
    case actionTypes.FETCH_SETTINGS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case actionTypes.FETCH_SETTINGS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        ...action.payload,
      };
    case actionTypes.FETCH_SETTINGS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case actionTypes.SET_DEMO_MODE_ENABLED:
      return {
        ...state,
        isDemoModeEnabled: action.payload,
      };
    case actionTypes.SET_DEMO_MODE_GENERAL_MARGIN_ERROR:
      return {
        ...state,
        demoModeGeneralMarginError: action.payload,
      };
    case actionTypes.SET_DARK_MODE_ENABLED:
      return {
        ...state,
        isDarkModeEnabled: action.payload,
      };
    case actionTypes.SET_THEME_MODE:
      return {
        ...state,
        themeMode: action.payload,
        isDarkModeEnabled: action.payload === 'dark' || action.payload === 'dark-red',
      };
    case actionTypes.SET_NEAR_MARGIN_THRESHOLD:
      return {
        ...state,
        nearMarginThreshold: action.payload,
      };
    default:
      return state;
  }
};

export default settingsReducer;