// frontend/src/store/calibration/selectors.js
import { createSelector } from 'reselect';

// Base selector to get the entire calibration state slice
const selectCalibrationState = (state) => state.calibration || {};

/**
 * Selector for the entire current calibration session object.
 * @param {object} state - The Redux state.
 * @returns {object|null} The current calibration session or null if none.
 */
export const selectCurrentCalibrationSession = createSelector(
  [selectCalibrationState],
  (calibration) => calibration.currentSession
);

/**
 * Selector for the list of connected instruments.
 * @param {object} state - The Redux state.
 * @returns {Array} An array of connected instrument objects.
 */
export const selectConnectedInstruments = createSelector(
  [selectCalibrationState],
  (calibration) => calibration.connectedInstruments || []
);

/**
 * Selector for UUT (Unit Under Test) details within the current session.
 * @param {object} state - The Redux state.
 * @returns {object|null} The UUT object or null if no session/UUT.
 */
export const selectUutDetails = createSelector(
  [selectCurrentCalibrationSession],
  (currentSession) => currentSession?.uut
);

/**
 * Selector for the currently active test point.
 * @param {object} state - The Redux state.
 * @returns {object|null} The current test point object or null if no session/active test point.
 */
export const selectCurrentTestPoint = createSelector(
  [selectCurrentCalibrationSession],
  (currentSession) => {
    if (!currentSession || currentSession.currentTestPointIndex === -1 || !currentSession.testPoints) {
      return null;
    }
    return currentSession.testPoints[currentSession.currentTestPointIndex];
  }
);

/**
 * Selector for the entire list of test points, reflecting their progress (status, readings).
 * @param {object} state - The Redux state.
 * @returns {Array} An array of test point objects or an empty array.
 */
export const selectTestPointsProgress = createSelector(
  [selectCurrentCalibrationSession],
  (currentSession) => currentSession?.testPoints || []
);

/**
 * Selector for the global calibration loading state.
 * @param {object} state - The Redux state.
 * @returns {boolean} True if a calibration operation is in progress, false otherwise.
 */
export const selectCalibrationLoading = createSelector(
  [selectCalibrationState],
  (calibration) => calibration.loading
);

/**
 * Selector for any global calibration error message.
 * @param {object} state - The Redux state.
 * @returns {string|null} The error message string or null if no error.
 */
export const selectCalibrationError = createSelector(
  [selectCalibrationState],
  (calibration) => calibration.error
);

/**
 * Selector for details of an active manual action prompt.
 * @param {object} state - The Redux state.
 * @returns {object|null} The manual action prompt object or null if none is active.
 */
export const selectManualActionPrompt = createSelector(
  [selectCalibrationState],
  (calibration) => calibration.manualActionPrompt
);

/**
 * Selector for real-time deviation data used in visualizations (e.g., 'moving loading box').
 * @param {object} state - The Redux state.
 * @returns {object|null} The real-time deviation data object or null.
 */
export const selectRealtimeDeviationData = createSelector(
  [selectCalibrationState],
  (calibration) => calibration.realtimeDeviation
);

/**
 * Selector for the overall status of the current calibration session.
 * @param {object} state - The Redux state.
 * @returns {string|null} The session status (e.g., 'in_progress', 'completed') or null.
 */
export const selectSessionStatus = createSelector(
  [selectCurrentCalibrationSession],
  (currentSession) => currentSession?.status
);

/**
 * Selector for the UUT's current input method (automatic/manual).
 * @param {object} state - The Redux state.
 * @returns {string|null} The UUT input method or null.
 */
export const selectUutInputMethod = createSelector(
  [selectUutDetails],
  (uutDetails) => uutDetails?.inputMethod
);