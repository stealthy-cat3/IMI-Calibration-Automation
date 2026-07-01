// frontend/src/store/calibration/actions.js
import { createAction } from '@reduxjs/toolkit';

/**
 * Action to set the currently active calibration profile.
 * Payload should be the complete calibration profile object { id, name, offset, gain, ... }.
 */
export const setActiveProfile = createAction('calibration/setActiveProfile');

/**
 * Action to signify that a specific calibration profile has been updated (e.g., via API).
 * Payload should be the updated profile object.
 */
export const profileUpdated = createAction('calibration/profileUpdated');

// Example: other calibration-related actions could be defined here
// export const addProfile = createAction('calibration/addProfile');
// export const removeProfile = createAction('calibration/removeProfile');
// export const setProfilesLoading = createAction('calibration/setProfilesLoading');
// export const setProfilesError = createAction('calibration/setProfilesError');

// Actions for recalibration workflow
export const calibrationInitiate = (sensorId, suggestedParams) => ({
    type: 'CALIBRATION_INITIATE',
    payload: { sensorId, suggestedParams }
});

export const calibrationStart = (sensorId) => ({
    type: 'CALIBRATION_START',
    payload: { sensorId }
});

export const calibrationSuccess = (sensorId, newSettings) => ({
    type: 'CALIBRATION_SUCCESS',
    payload: { sensorId, newSettings }
});

export const calibrationFailure = (sensorId, error) => ({
    type: 'CALIBRATION_FAILURE',
    payload: { sensorId, error }
});

export const calibrationUpdateSettings = (sensorId, newSettings) => ({
    type: 'CALIBRATION_UPDATE_SETTINGS',
    payload: { sensorId, newSettings }
});