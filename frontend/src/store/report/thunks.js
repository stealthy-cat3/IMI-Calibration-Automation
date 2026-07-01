// frontend/src/store/report/thunks.js
import {
  FETCH_REPORT_CONFIG_REQUEST,
  FETCH_REPORT_CONFIG_SUCCESS,
  FETCH_REPORT_CONFIG_FAILURE,
  UPDATE_REPORT_CONFIG_REQUEST,
  UPDATE_REPORT_CONFIG_SUCCESS,
  UPDATE_REPORT_CONFIG_FAILURE,
  SET_REPORT_CONFIG_FIELD
} from './actionTypes';

import {
  fetchReportsRequest,
  fetchReportsSuccess,
  fetchReportsFailure
} from './actions';

const __REPORT_FIXTURE__ = {
  id: 'rc-001',
  name: 'Standard Calibration Report',
  description: 'Default configuration for general calibration certificates.',
  templateId: 'template_basic_v1',
  frontPageSettings: {
    enabledFields: [
      { id: 'fp-1', label: 'UUT Name', type: 'text', category: 'UUT Details', isRequired: true, order: 1 },
      { id: 'fp-2', label: 'Serial Number', type: 'text', category: 'UUT Details', isRequired: true, order: 2 },
    ],
    availableCategories: [
      { name: 'UUT Details', description: 'Information about the Unit Under Test' },
      { name: 'Environmental', description: 'Environmental conditions during test' },
    ],
  },
  dataSheetSettings: {
    includeMeasurementUncertaintySummary: true,
    groupDataByMeasurementCategory: true,
    autoPaginateLongDataSheets: true,
    includePassFailIndicators: true,
  }
};

export const fetchReportConfig = () => async (dispatch) => {
  dispatch({ type: FETCH_REPORT_CONFIG_REQUEST });
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    dispatch({ type: FETCH_REPORT_CONFIG_SUCCESS, payload: __REPORT_FIXTURE__ });
  } catch (error) {
    dispatch({ type: FETCH_REPORT_CONFIG_FAILURE, payload: error.message });
  }
};

export const updateReportConfig = (config) => async (dispatch) => {
  dispatch({ type: UPDATE_REPORT_CONFIG_REQUEST });
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    const successAction = { type: UPDATE_REPORT_CONFIG_SUCCESS, payload: config };
    dispatch(successAction);
    return successAction;
  } catch (error) {
    const errorAction = { type: UPDATE_REPORT_CONFIG_FAILURE, payload: error.message };
    dispatch(errorAction);
    return errorAction;
  }
};
// Expose .fulfilled.match so ReportConfiguration.jsx promise checks don't crash
updateReportConfig.fulfilled = { match: (action) => action?.type === UPDATE_REPORT_CONFIG_SUCCESS };

export const setReportConfigField = (fieldPath, value) => (dispatch) => {
  dispatch({ type: SET_REPORT_CONFIG_FIELD, payload: { fieldPath, value } });
};

export const generateReport = (templateId, calibrationJobData) => async (dispatch) => {
  dispatch({ type: 'report/GENERATE_REPORT_REQUEST' });
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    dispatch({ type: 'report/GENERATE_REPORT_SUCCESS', payload: { url: 'https://example.com/mock-report.pdf' } });
  } catch (error) {
    dispatch({ type: 'report/GENERATE_REPORT_FAILURE', payload: error.message });
  }
};

// Mock action types and creators removed - exported and imported from './actions' instead.

// Mock API service for reports
// In a real application, this would typically come from '../../api'
const reportApi = {
  getReports: async ({
    dateRange,
    filters
  }) => {
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulate API call delay and data fetching
        const mockReports = [{
          id: 1,
          title: `Sales Report for ${dateRange.startDate} to ${dateRange.endDate}`,
          data: `Generated with filters: ${JSON.stringify(filters)}`,
          date: new Date().toISOString()
        }, {
          id: 2,
          title: `Inventory Report for ${dateRange.startDate} to ${dateRange.endDate}`,
          data: `Generated with filters: ${JSON.stringify(filters)}`,
          date: new Date().toISOString()
        }, ];
        resolve({
          data: mockReports
        });
      }, 500);
    });
  },
};

// Mock selectors from the settings module
// In a real application, these would typically come from '../settings/selectors'
export const selectDefaultDateRange = (state) => state.settings?.defaultDateRange || {
  startDate: '2023-01-01',
  endDate: '2023-01-31'
};
export const selectReportFilters = (state) => state.settings?.reportFilters || {
  status: 'all',
  category: 'all'
};


// --- INTER-MODULE CONNECTION ---
// Modify the existing fetchReports thunk to access settings state
export const fetchReports = () => async (dispatch, getState) => {
  dispatch(fetchReportsRequest()); // Set loading state

  try {
    const state = getState();

    // Access relevant settings from the 'settings' module's state using selectors
    const defaultDateRange = selectDefaultDateRange(state);
    const reportFilters = selectReportFilters(state);

    // Use these settings as parameters for the API call
    const response = await reportApi.getReports({
      dateRange: defaultDateRange,
      filters: reportFilters,
      // ... other report parameters influenced by settings
    });

    dispatch(fetchReportsSuccess(response.data)); // Update reports data
  } catch (error) {
    dispatch(fetchReportsFailure(error.message)); // Handle error
  }
};