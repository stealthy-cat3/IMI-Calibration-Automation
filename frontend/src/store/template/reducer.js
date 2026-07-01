// frontend/src/store/template/reducer.js
import * as actionTypes from './actionTypes'; // Assuming action types are defined in actionTypes.js

const initialState = {
    templates: [], // Array for general listing of all templates
    byId: {},      // Object for quick lookup of templates by their ID
    loading: false, // Indicates if an API request is in progress
    error: null,   // Stores any error messages from API requests
    selectedTemplateId: null, // Potentially other template-specific state properties
    filters: { search: '', type: 'All' }, // Stores current filter criteria
};

const templateReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.FETCH_TEMPLATES_REQUEST:
        case actionTypes.FETCH_TEMPLATE_BY_ID_REQUEST:
            return {
                ...state,
                loading: true,
                error: null, // Clear any previous errors on a new request
            };

        case actionTypes.FETCH_TEMPLATES_SUCCESS:
            // Convert the array of templates into an object for byId lookup
            const newTemplatesById = action.payload.reduce((acc, template) => {
                acc[template.id] = template;
                return acc;
            }, {});
            return {
                ...state,
                loading: false,
                templates: action.payload, // Update the array for general listing
                // Merge new templates into byId, preserving any existing ones not in the payload
                byId: { ...state.byId, ...newTemplatesById },
                error: null,
            };

        case actionTypes.FETCH_TEMPLATE_BY_ID_SUCCESS:
            return {
                ...state,
                loading: false,
                // Add or update the specific template in the byId map
                byId: {
                    ...state.byId,
                    [action.payload.id]: action.payload,
                },
                error: null,
            };

        case actionTypes.FETCH_TEMPLATES_FAILURE:
        case actionTypes.FETCH_TEMPLATE_BY_ID_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload, // Store the error message
            };

        case actionTypes.SET_SELECTED_TEMPLATE_ID:
            return {
                ...state,
                selectedTemplateId: action.payload,
            };

        case 'template/SET_FILTER':
            return {
                ...state,
                filters: {
                    ...state.filters,
                    ...action.payload,
                },
            };

        default:
            return state;
    }
};

export default templateReducer;