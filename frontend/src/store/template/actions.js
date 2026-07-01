// frontend/src/store/template/actions.js
// Action Types
export const FETCH_TEMPLATES_REQUEST = 'template/FETCH_TEMPLATES_REQUEST';
export const FETCH_TEMPLATES_SUCCESS = 'template/FETCH_TEMPLATES_SUCCESS';
export const FETCH_TEMPLATES_FAILURE = 'template/FETCH_TEMPLATES_FAILURE';

export const FETCH_TEMPLATE_BY_ID_REQUEST = 'template/FETCH_TEMPLATE_BY_ID_REQUEST';
export const FETCH_TEMPLATE_BY_ID_SUCCESS = 'template/FETCH_TEMPLATE_BY_ID_SUCCESS';
export const FETCH_TEMPLATE_BY_ID_FAILURE = 'template/FETCH_TEMPLATE_BY_ID_FAILURE';

// Action Creators
export const fetchTemplatesRequest = () => ({
    type: FETCH_TEMPLATES_REQUEST,
});

export const fetchTemplatesSuccess = (templates) => ({
    type: FETCH_TEMPLATES_SUCCESS,
    payload: templates,
});

export const fetchTemplatesFailure = (error) => ({
    type: FETCH_TEMPLATES_FAILURE,
    payload: error,
});

export const fetchTemplateByIdRequest = () => ({
    type: FETCH_TEMPLATE_BY_ID_REQUEST,
});

export const fetchTemplateByIdSuccess = (template) => ({
    type: FETCH_TEMPLATE_BY_ID_SUCCESS,
    payload: template,
});

export const fetchTemplateByIdFailure = (error) => ({
    type: FETCH_TEMPLATE_BY_ID_FAILURE,
    payload: error,
});

// Assuming there might be other existing actions in this file,
// if so, they would be listed below. For this task, we only add the new ones.