// frontend/src/store/rootReducer.js
import { combineReducers } from 'redux';
import adminReducer from './admin/reducer';
import analyticsReducer from './analytics/reducer';
import calibrationReducer from './Calibration/reducer';
import instrumentReducer from './instrument/reducer';
import reportReducer from './report/reducer';
import settingsReducer from './settings/reducer';
import templateReducer from './template/reducer';
import uncertaintyReducer from './uncertainty/reducer';
import uncertaintyFormulaReducer from './UncertaintyFormula/reducer';

// A placeholder reducer for demonstration.
// In a real application, you would have multiple reducers
// for different parts of your state.
const initialExampleState = {
  appName: 'Calibration System',
  version: '1.0.0',
};

const exampleReducer = (state = initialExampleState, action) => {
  switch (action.type) {
    // Define actions and state changes here
    // case 'UPDATE_APP_NAME':
    //   return { ...state, appName: action.payload };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  admin: adminReducer,
  analytics: analyticsReducer,
  calibration: calibrationReducer,
  instrument: instrumentReducer,
  report: reportReducer,
  settings: settingsReducer,
  template: templateReducer,
  uncertainty: uncertaintyReducer,
  uncertaintyFormula: uncertaintyFormulaReducer,
  example: exampleReducer, // Placeholder reducer
});

export default rootReducer;