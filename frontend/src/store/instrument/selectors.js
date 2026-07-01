// frontend/src/store/instrument/selectors.js
import { createSelector } from 'reselect';

// Base selectors
const getInstrumentList = (state) => state.instrument.list;
const getCurrentInstrumentId = (state) => state.instrument.currentInstrumentId;
const getInstrumentLoading = (state) => state.instrument.loading;
const getInstrumentError = (state) => state.instrument.error;

/**
 * Selector to return the array of all instruments.
 * @param {object} state - The Redux state.
 * @returns {Array} An array of instrument objects.
 */
export const getAllInstruments = createSelector(
  [getInstrumentList],
  (list) => list
);

/**
 * Selector to return a single instrument object based on its ID.
 * @param {object} state - The Redux state.
 * @param {string} instrumentId - The ID of the instrument to find.
 * @returns {object | undefined} The instrument object, or undefined if not found.
 */
export const getInstrumentById = createSelector(
  [getInstrumentList, (state, instrumentId) => instrumentId],
  (list, instrumentId) => list.find((instrument) => instrument.id === instrumentId)
);

/**
 * Selector to return the instrument object corresponding to `currentInstrumentId`.
 * @param {object} state - The Redux state.
 * @returns {object | null} The currently selected instrument object, or null if none is selected or found.
 */
export const getCurrentInstrument = createSelector(
  [getInstrumentList, getCurrentInstrumentId],
  (list, currentId) => (currentId ? list.find((instrument) => instrument.id === currentId) : null)
);

/**
 * Selector to return a filtered list of instruments with `connectionStatus` indicating 'connected'.
 * @param {object} state - The Redux state.
 * @returns {Array} An array of connected instrument objects.
 */
export const getConnectedInstruments = createSelector(
  [getInstrumentList],
  (list) => list.filter((instrument) => instrument.connectionStatus === 'connected')
);

/**
 * Selector to return the `loading` boolean state for the instrument module.
 * @param {object} state - The Redux state.
 * @returns {boolean} True if an instrument operation is in progress, false otherwise.
 */
export const getInstrumentLoadingState = createSelector(
  [getInstrumentLoading],
  (loading) => loading
);

/**
 * Selector to return the `error` message for the instrument module.
 * @param {object} state - The Redux state.
 * @returns {string | null} The error message, or null if no error.
 */
export const getInstrumentError = createSelector(
  [getInstrumentError],
  (error) => error
);