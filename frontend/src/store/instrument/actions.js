// frontend/src/store/instrument/actions.js
export const FETCH_INSTRUMENTS_REQUEST = 'FETCH_INSTRUMENTS_REQUEST';
export const FETCH_INSTRUMENTS_SUCCESS = 'FETCH_INSTRUMENTS_SUCCESS';
export const FETCH_INSTRUMENTS_FAILURE = 'FETCH_INSTRUMENTS_FAILURE';

export const ADD_INSTRUMENT_REQUEST = 'ADD_INSTRUMENT_REQUEST';
export const ADD_INSTRUMENT_SUCCESS = 'ADD_INSTRUMENT_SUCCESS';
export const ADD_INSTRUMENT_FAILURE = 'ADD_INSTRUMENT_FAILURE';

export const UPDATE_INSTRUMENT_REQUEST = 'UPDATE_INSTRUMENT_REQUEST';
export const UPDATE_INSTRUMENT_SUCCESS = 'UPDATE_INSTRUMENT_SUCCESS';
export const UPDATE_INSTRUMENT_FAILURE = 'UPDATE_INSTRUMENT_FAILURE';

export const DELETE_INSTRUMENT_REQUEST = 'DELETE_INSTRUMENT_REQUEST';
export const DELETE_INSTRUMENT_SUCCESS = 'DELETE_INSTRUMENT_SUCCESS';
export const DELETE_INSTRUMENT_FAILURE = 'DELETE_INSTRUMENT_FAILURE';

// New action type constant for updating instrument calibration status
export const UPDATE_INSTRUMENT_CALIBRATION_STATUS = 'UPDATE_INSTRUMENT_CALIBRATION_STATUS';


export const fetchInstrumentsRequest = () => ({
  type: FETCH_INSTRUMENTS_REQUEST,
});

export const fetchInstrumentsSuccess = (instruments) => ({
  type: FETCH_INSTRUMENTS_SUCCESS,
  payload: instruments,
});

export const fetchInstrumentsFailure = (error) => ({
  type: FETCH_INSTRUMENTS_FAILURE,
  payload: error,
});

export const addInstrumentRequest = () => ({
  type: ADD_INSTRUMENT_REQUEST,
});

export const addInstrumentSuccess = (instrument) => ({
  type: ADD_INSTRUMENT_SUCCESS,
  payload: instrument,
});

export const addInstrumentFailure = (error) => ({
  type: ADD_INSTRUMENT_FAILURE,
  payload: error,
});

export const updateInstrumentRequest = () => ({
  type: UPDATE_INSTRUMENT_REQUEST,
});

export const updateInstrumentSuccess = (instrument) => ({
  type: UPDATE_INSTRUMENT_SUCCESS,
  payload: instrument,
});

export const updateInstrumentFailure = (error) => ({
  type: UPDATE_INSTRUMENT_FAILURE,
  payload: error,
});

export const deleteInstrumentRequest = () => ({
  type: DELETE_INSTRUMENT_REQUEST,
});

export const deleteInstrumentSuccess = (instrumentId) => ({
  type: DELETE_INSTRUMENT_SUCCESS,
  payload: instrumentId,
});

export const deleteInstrumentFailure = (error) => ({
  type: DELETE_INSTRUMENT_FAILURE,
  payload: error,
});

// New action creator function for updating instrument calibration status
export const updateInstrumentCalibrationStatus = (
    instrumentId,
    lastCalibrationDate,
    nextCalibrationDate,
    status // Optional: e.g., 'calibrated', 'needs_calibration', 'out_of_service'
) => ({
    type: UPDATE_INSTRUMENT_CALIBRATION_STATUS,
    payload: {
        instrumentId,
        lastCalibrationDate,
        nextCalibrationDate,
        status
    }
});