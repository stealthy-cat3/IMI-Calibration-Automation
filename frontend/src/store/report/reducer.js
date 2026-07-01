// frontend/src/store/report/reducer.js
import {
  FETCH_REPORTS_REQUEST,
  FETCH_REPORTS_SUCCESS,
  FETCH_REPORTS_FAILURE
} from './actions'; // Assuming actions are defined

import {
  FETCH_REPORT_CONFIG_REQUEST,
  FETCH_REPORT_CONFIG_SUCCESS,
  FETCH_REPORT_CONFIG_FAILURE,
  UPDATE_REPORT_CONFIG_REQUEST,
  UPDATE_REPORT_CONFIG_SUCCESS,
  UPDATE_REPORT_CONFIG_FAILURE,
  SET_REPORT_CONFIG_FIELD
} from './actionTypes';

const initialState = {
  data: null,
  loading: false,
  error: null,
  reportConfig: {
    data: null,
    loading: false,
    error: null,
  },
  reportTemplates: {
    list: [],
    loading: false,
    error: null,
  },
  reportGeneration: {
    data: null,
    loading: false,
    error: null,
  }
};

const reportReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_REPORTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null, // Clear any previous errors when a new request starts
      };
    case FETCH_REPORTS_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
      };
    case FETCH_REPORTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        data: null, // Optionally clear data on failure to indicate no valid data
      };

    // Report Config Cases
    case FETCH_REPORT_CONFIG_REQUEST:
    case UPDATE_REPORT_CONFIG_REQUEST:
      return {
        ...state,
        reportConfig: {
          ...state.reportConfig,
          loading: true,
          error: null,
        }
      };
    case FETCH_REPORT_CONFIG_SUCCESS:
    case UPDATE_REPORT_CONFIG_SUCCESS:
      return {
        ...state,
        reportConfig: {
          ...state.reportConfig,
          loading: false,
          data: action.payload,
          error: null,
        }
      };
    case FETCH_REPORT_CONFIG_FAILURE:
    case UPDATE_REPORT_CONFIG_FAILURE:
      return {
        ...state,
        reportConfig: {
          ...state.reportConfig,
          loading: false,
          error: action.payload,
        }
      };
    case SET_REPORT_CONFIG_FIELD: {
      const { fieldPath, value } = action.payload;
      if (fieldPath.includes('.')) {
        const [section, field] = fieldPath.split('.');
        return {
          ...state,
          reportConfig: {
            ...state.reportConfig,
            data: {
              ...state.reportConfig.data,
              [section]: {
                ...(state.reportConfig.data?.[section] || {}),
                [field]: value
              }
            }
          }
        };
      }
      return {
        ...state,
        reportConfig: {
          ...state.reportConfig,
          data: {
            ...state.reportConfig.data,
            [fieldPath]: value
          }
        }
      };
    }

    // Report Generation Cases
    case 'report/GENERATE_REPORT_REQUEST':
      return {
        ...state,
        reportGeneration: {
          ...state.reportGeneration,
          loading: true,
          error: null,
        }
      };
    case 'report/GENERATE_REPORT_SUCCESS':
      return {
        ...state,
        reportGeneration: {
          ...state.reportGeneration,
          loading: false,
          data: action.payload,
          error: null,
        }
      };
    case 'report/GENERATE_REPORT_FAILURE':
      return {
        ...state,
        reportGeneration: {
          ...state.reportGeneration,
          loading: false,
          error: action.payload,
        }
      };

    default:
      return state;
  }
};

export default reportReducer;