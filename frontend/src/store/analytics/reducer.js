// frontend/src/store/analytics/reducer.js
import * as actionTypes from './actionTypes';

/**
 * @typedef {Object} AnalyticsFilterState
 * @property {string | null} startDate
 * @property {string | null} endDate
 * @property {string | null} instrumentType - e.g., 'Pressure Gauge', 'Thermometer'
 * @property {string | null} instrumentId - specific instrument serial or ID
 * @property {string} reportType - e.g., 'calibration_trend', 'uncertainty_contribution', 'instrument_performance_history'
 */

/**
 * @typedef {Object} AnalyticsState
 * @property {Array<Object>} data - The fetched analytics data points/reports.
 * @property {AnalyticsFilterState} filters - Current filters applied to the analytics data.
 * @property {string} selectedReportType - The type of report/chart currently selected for viewing.
 * @property {boolean} loading - Indicates if analytics data is currently being fetched.
 * @property {string | null} error - Stores any error message if data fetching fails.
 */

/**
 * Initial state for the analytics module.
 * @type {AnalyticsState}
 */
const initialState = {
  data: [], // Array to hold the fetched analytics data points/reports
  filters: {
    startDate: null,
    endDate: null,
    instrumentType: null,
    instrumentId: null, // Added for more granular filtering, as seen in thunks
    reportType: 'calibration_trend', // Default report type based on US-040 and fixture
  },
  selectedReportType: 'calibration_trend', // Current report/chart being viewed
  loading: false,
  error: null,
};

/**
 * Reducer for the analytics module.
 * Manages the state related to analytics data, filters, and loading status.
 * @param {AnalyticsState} state - The current analytics state.
 * @param {Object} action - The dispatched action.
 * @returns {AnalyticsState} The new analytics state.
 */
const analyticsReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_ANALYTICS_DATA_REQUEST:
      return {
        ...state,
        loading: true,
        error: null, // Clear any previous errors on new request
      };
    case actionTypes.FETCH_ANALYTICS_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null, // Clear error on success
      };
    case actionTypes.FETCH_ANALYTICS_DATA_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        data: [], // Clear data on failure to indicate no data could be loaded
      };
    case actionTypes.SET_ANALYTICS_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };
    case actionTypes.CLEAR_ANALYTICS_FILTERS:
      // When clearing filters, we want to reset them to initial defaults,
      // but ensure the selectedReportType (which also drives a filter) remains consistent.
      return {
        ...state,
        filters: {
          ...initialState.filters, // Reset to default filter values
          reportType: state.selectedReportType, // Keep the current report type selected as a filter
        },
      };
    case actionTypes.SELECT_ANALYTICS_REPORT:
      return {
        ...state,
        selectedReportType: action.payload,
        // When a report type is selected, update the filters to match this selection
        // This ensures subsequent data fetches (e.g., if filters are applied) respect the chosen report type.
        filters: {
          ...state.filters, // Keep other filters (startDate, endDate, etc.)
          reportType: action.payload, // Update reportType in filters
        },
        // Optionally, one might clear `data` here if switching report types
        // necessitates a fresh fetch or incompatible data structure.
        // For now, we rely on the thunk to re-fetch with updated filters.
      };
    default:
      return state;
  }
};

export default analyticsReducer;