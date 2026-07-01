// frontend/src/store/instrument/thunks.js
import {
  INSTRUMENT_FETCH_ALL_REQUEST,
  INSTRUMENT_FETCH_ALL_SUCCESS,
  INSTRUMENT_FETCH_ALL_FAILURE,
  INSTRUMENT_FETCH_ONE_REQUEST,
  INSTRUMENT_FETCH_ONE_SUCCESS,
  INSTRUMENT_FETCH_ONE_FAILURE,
  INSTRUMENT_ADD_REQUEST,
  INSTRUMENT_ADD_SUCCESS,
  INSTRUMENT_ADD_FAILURE,
  INSTRUMENT_UPDATE_REQUEST,
  INSTRUMENT_UPDATE_SUCCESS,
  INSTRUMENT_UPDATE_FAILURE,
  INSTRUMENT_SET_CURRENT_ID,
} from './actionTypes';

// MANDATORY FIXTURE
export const __INSTRUMENTS_FIXTURE__ = [
  {
    id: 'INST-001',
    name: 'Fluke 87V Multimeter',
    model: '87V',
    type: 'Digital Multimeter',
    manufacturer: 'Fluke',
    serialNumber: 'SN-87V-12345',
    connectionStatus: 'connected', // 'connected' | 'disconnected' | 'unknown'
    inputMethod: 'automatic', // 'automatic' | 'manual'
    lastCalibrationDate: '2023-01-15',
    location: 'Lab Bench 1',
    notes: 'Primary multimeter for general electrical measurements.',
  },
  {
    id: 'INST-002',
    name: 'Tektronix MDO3000 Oscilloscope',
    model: 'MDO3000',
    type: 'Mixed Domain Oscilloscope',
    manufacturer: 'Tektronix',
    serialNumber: 'SN-MDO3K-67890',
    connectionStatus: 'connected',
    inputMethod: 'automatic',
    lastCalibrationDate: '2023-03-20',
    location: 'Lab Bench 2',
    notes: 'Used for waveform analysis and mixed signal debugging.',
  },
  {
    id: 'INST-003',
    name: 'Keithley 2400 SourceMeter',
    model: '2400',
    type: 'SourceMeter',
    manufacturer: 'Keithley',
    serialNumber: 'SN-2400-11223',
    connectionStatus: 'disconnected',
    inputMethod: 'manual',
    lastCalibrationDate: '2022-11-01',
    location: 'Calibration Room',
    notes: 'High precision source and measure unit. Currently undergoing repair.',
  },
  {
    id: 'INST-004',
    name: 'Agilent 34401A DMM',
    model: '34401A',
    type: 'Digital Multimeter',
    manufacturer: 'Agilent',
    serialNumber: 'SN-34401A-44556',
    connectionStatus: 'connected',
    inputMethod: 'automatic',
    lastCalibrationDate: '2023-02-10',
    location: 'Lab Bench 1',
    notes: 'Secondary DMM, often used for continuity checks.',
  },
  {
    id: 'INST-005',
    name: 'Chroma 61700 AC Source',
    model: '61700',
    type: 'AC Power Source',
    manufacturer: 'Chroma',
    serialNumber: 'SN-61700-99887',
    connectionStatus: 'unknown',
    inputMethod: 'manual',
    lastCalibrationDate: '2023-04-05',
    location: 'Power Testing Area',
    notes: 'Programmable AC power source for power supply testing.',
  },
];

// Simulate API delay
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Thunk to fetch all instruments.
 */
export const fetchAllInstruments = () => async (dispatch) => {
  dispatch({ type: INSTRUMENT_FETCH_ALL_REQUEST });
  try {
    await delay(500); // Simulate API call
    dispatch({
      type: INSTRUMENT_FETCH_ALL_SUCCESS,
      payload: __INSTRUMENTS_FIXTURE__,
    });
  } catch (error) {
    dispatch({
      type: INSTRUMENT_FETCH_ALL_FAILURE,
      payload: 'Failed to fetch instruments: ' + error.message,
    });
  }
};

/**
 * Thunk to fetch a single instrument by its ID.
 * @param {string} id - The ID of the instrument to fetch.
 */
export const fetchInstrumentById = (id) => async (dispatch) => {
  dispatch({ type: INSTRUMENT_FETCH_ONE_REQUEST });
  try {
    await delay(500); // Simulate API call
    const instrument = __INSTRUMENTS_FIXTURE__.find((inst) => inst.id === id);
    if (instrument) {
      dispatch({
        type: INSTRUMENT_FETCH_ONE_SUCCESS,
        payload: instrument,
      });
    } else {
      dispatch({
        type: INSTRUMENT_FETCH_ONE_FAILURE,
        payload: `Instrument with ID ${id} not found.`,
      });
    }
  } catch (error) {
    dispatch({
      type: INSTRUMENT_FETCH_ONE_FAILURE,
      payload: `Failed to fetch instrument with ID ${id}: ` + error.message,
    });
  }
};

/**
 * Thunk to add a new instrument.
 * @param {object} instrumentData - The data for the new instrument.
 */
export const addInstrument = (instrumentData) => async (dispatch) => {
  dispatch({ type: INSTRUMENT_ADD_REQUEST });
  try {
    await delay(500); // Simulate API call
    // Simulate generating a new ID
    const newId = `INST-${String(__INSTRUMENTS_FIXTURE__.length + 1).padStart(
      3,
      '0',
    )}`;
    const newInstrument = {
      id: newId,
      ...instrumentData,
      connectionStatus: instrumentData.connectionStatus || 'unknown',
      inputMethod: instrumentData.inputMethod || 'manual',
      lastCalibrationDate:
        instrumentData.lastCalibrationDate || new Date().toISOString().slice(0, 10),
    };
    // In a real app, this would be an API call to save and get the actual new instrument.
    // For fixture, we simulate adding it.
    // __INSTRUMENTS_FIXTURE__.push(newInstrument); // Not actually modifying the constant fixture
    dispatch({
      type: INSTRUMENT_ADD_SUCCESS,
      payload: newInstrument,
    });
  } catch (error) {
    dispatch({
      type: INSTRUMENT_ADD_FAILURE,
      payload: 'Failed to add instrument: ' + error.message,
    });
  }
};

/**
 * Thunk to update an existing instrument (e.g., input method).
 * @param {string} id - The ID of the instrument to update.
 * @param {object} updates - An object containing the fields to update.
 */
export const updateInstrument = (id, updates) => async (dispatch) => {
  dispatch({ type: INSTRUMENT_UPDATE_REQUEST });
  try {
    await delay(500); // Simulate API call
    const instrumentIndex = __INSTRUMENTS_FIXTURE__.findIndex(
      (inst) => inst.id === id,
    );
    if (instrumentIndex > -1) {
      // Simulate updating the instrument
      const updatedInstrument = {
        ...__INSTRUMENTS_FIXTURE__[instrumentIndex],
        ...updates,
      };
      // In a real app, this would be an API call to update.
      // __INSTRUMENTS_FIXTURE__[instrumentIndex] = updatedInstrument; // Not actually modifying the constant fixture
      dispatch({
        type: INSTRUMENT_UPDATE_SUCCESS,
        payload: updatedInstrument,
      });
    } else {
      dispatch({
        type: INSTRUMENT_UPDATE_FAILURE,
        payload: `Instrument with ID ${id} not found for update.`,
      });
    }
  } catch (error) {
    dispatch({
      type: INSTRUMENT_UPDATE_FAILURE,
      payload: `Failed to update instrument with ID ${id}: ` + error.message,
    });
  }
};

/**
 * Thunk to set the ID of the currently active/selected instrument.
 * @param {string | null} id - The ID of the instrument or null to clear selection.
 */
export const setCurrentInstrumentId = (id) => (dispatch) => {
  dispatch({
    type: INSTRUMENT_SET_CURRENT_ID,
    payload: id,
  });
};