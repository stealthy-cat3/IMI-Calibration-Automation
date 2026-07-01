// frontend/src/store/calibration/reducer.js
import { createSlice } from '@reduxjs/toolkit';
import { setActiveProfile, profileUpdated } from './actions'; // Assuming actions are defined here or separately

const initialState = {
  // Placeholder for a list of calibration profiles
  profiles: [
    { id: 'cal-001', name: 'Default Profile', offset: 0.0, gain: 1.0, parameters: { min: -10, max: 10 } },
    { id: 'cal-002', name: 'High Sensitivity', offset: 0.1, gain: 1.2, parameters: { min: -5, max: 5 } },
    { id: 'cal-003', name: 'Low Power Sensor', offset: -0.05, gain: 0.9, parameters: { min: 0, max: 20 } },
  ],
  // This will hold the current calibration profile object { id, name, offset, gain, ... }
  activeProfile: null,
  isLoading: false,
  error: null,
  connectedInstruments: [],
  currentSession: null,
  manualActionPrompt: null,
  realtimeDeviation: null,
};

const calibrationSlice = createSlice({
  name: 'calibration',
  initialState,
  reducers: {
    // Reducer to directly set the active profile
    // This is used when a thunk or component dispatches setActiveProfile(profileObject)
    [setActiveProfile]: (state, action) => {
      state.activeProfile = action.payload; // `action.payload` is the full profile object
      state.error = null; // Clear any previous errors
      state.isLoading = false; // Ensure loading is off after setting
    },
    // Reducers to manage loading and error states manually for custom thunks
    setCalibrationLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setCalibrationError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    // Reducer to add a new profile to the list (for demonstration/mocking)
    addProfile: (state, action) => {
      state.profiles.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle cases where an existing profile is updated, and it happens to be the active one
      // This action is typically dispatched by a thunk after a successful update API call
      .addCase(profileUpdated, (state, action) => {
        // Update the list of profiles
        const index = state.profiles.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.profiles[index] = action.payload;
        }

        // If the updated profile is also the currently active one, update it in activeProfile
        if (state.activeProfile && state.activeProfile.id === action.payload.id) {
          state.activeProfile = action.payload; // Update active profile with fresh data
        }
        state.error = null;
        state.isLoading = false;
      })
      .addCase('CALIBRATION_UPDATE_CONNECTED_INSTRUMENTS', (state, action) => {
        state.connectedInstruments = action.payload;
      })
      .addCase('CALIBRATION_ADD_UUT_TO_SESSION', (state, action) => {
        if (!state.currentSession) {
          state.currentSession = { uut: null, testPoints: [], status: 'pending', currentTestPointIndex: -1 };
        }
        state.currentSession.uut = action.payload;
      })
      .addCase('CALIBRATION_SET_UUT_INPUT_METHOD', (state, action) => {
        if (state.currentSession && state.currentSession.uut) {
          state.currentSession.uut.inputMethod = action.payload;
        }
      })
      .addCase('CALIBRATION_START_SESSION', (state, action) => {
        state.currentSession = action.payload;
        if (state.currentSession && state.currentSession.testPoints === undefined) {
          state.currentSession.testPoints = [];
        }
        if (state.currentSession && state.currentSession.currentTestPointIndex === undefined) {
          state.currentSession.currentTestPointIndex = state.currentSession.testPoints.length > 0 ? 0 : -1;
        }
      })
      .addCase('CALIBRATION_ADVANCE_TEST_POINT', (state) => {
        if (state.currentSession && state.currentSession.testPoints) {
          state.currentSession.currentTestPointIndex = Math.min(
            state.currentSession.testPoints.length - 1,
            (state.currentSession.currentTestPointIndex || 0) + 1
          );
        }
      })
      .addCase('CALIBRATION_RETREAT_TEST_POINT', (state) => {
        if (state.currentSession && state.currentSession.testPoints) {
          state.currentSession.currentTestPointIndex = Math.max(
            0,
            (state.currentSession.currentTestPointIndex || 0) - 1
          );
        }
      })
      .addCase('CALIBRATION_UPDATE_TEST_POINT_READING', (state, action) => {
         if (state.currentSession && state.currentSession.testPoints) {
            const { testPointId, reading } = action.payload;
            const pt = state.currentSession.testPoints.find(p => p.id === testPointId);
            if (pt) {
              pt.actualUutReading = reading;
            }
         }
      })
      .addCase('CALIBRATION_DISMISS_MANUAL_ACTION_PROMPT', (state) => {
         state.manualActionPrompt = null;
      })
      .addCase('CALIBRATION_UPDATE_REALTIME_DEVIATION', (state, action) => {
         state.realtimeDeviation = action.payload;
      })
      .addCase('CALIBRATION_SET_SESSION_STATUS', (state, action) => {
         if (state.currentSession) {
           state.currentSession.status = action.payload;
         }
      });
  },
});

export const { setCalibrationLoading, setCalibrationError, addProfile } = calibrationSlice.actions;

export default calibrationSlice.reducer;