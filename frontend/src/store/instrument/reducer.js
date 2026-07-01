// frontend/src/store/instrument/reducer.js
const initialState = {
    activePresetId: 'default',
    volume: 0.7,
    // ... other instrument-specific state
};

// Define the action type constant (or use string directly if no actions.js)
const SET_RECOMMENDED_PRESET = 'instrument/SET_RECOMMENDED_PRESET';

const instrumentReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_RECOMMENDED_PRESET: // Handle the action dispatched from analytics
            console.log(`Instrument reducer received recommendation: ${action.payload}`);
            return {
                ...state,
                activePresetId: action.payload, // Update the active preset based on analytics recommendation
                // Optionally, you might want to add a flag:
                // isRecommendedPresetActive: true,
            };
        case 'instrument/SET_VOLUME': // Example of another existing action
            return {
                ...state,
                volume: action.payload,
            };
        // ... other cases for instrument state modifications
        default:
            return state;
    }
};

export default instrumentReducer;