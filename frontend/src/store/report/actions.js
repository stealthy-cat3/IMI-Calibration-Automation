// This is a new file
export const FETCH_REPORTS_REQUEST = 'report/fetchReportsRequest';
export const FETCH_REPORTS_SUCCESS = 'report/fetchReportsSuccess';
export const FETCH_REPORTS_FAILURE = 'report/fetchReportsFailure';

export const fetchReportsRequest = () => ({
  type: FETCH_REPORTS_REQUEST
});

export const fetchReportsSuccess = (reports) => ({
  type: FETCH_REPORTS_SUCCESS,
  payload: reports,
});

export const fetchReportsFailure = (error) => ({
  type: FETCH_REPORTS_FAILURE,
  payload: error,
});