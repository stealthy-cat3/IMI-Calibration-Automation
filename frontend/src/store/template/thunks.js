// frontend/src/store/template/thunks.js
// Mock Action Types (normally these would be in actions.js)
const TEMPLATES_LOADING = 'template/TEMPLATES_LOADING';
const TEMPLATES_LOADED = 'template/TEMPLATES_LOADED';
const TEMPLATES_ERROR = 'template/TEMPLATES_ERROR';
const TEMPLATE_RENDERED = 'template/TEMPLATE_RENDERED';

// Mock Action Creators (normally these would be in actions.js)
const templatesLoading = () => ({ type: TEMPLATES_LOADING });
const templatesLoaded = (data) => ({ type: TEMPLATES_LOADED, payload: data });
const templatesError = (error) => ({ type: TEMPLATES_ERROR, payload: error });
const templateRendered = (content) => ({ type: TEMPLATE_RENDERED, payload: content });


// Mock API utility for templates
const mockTemplates = [
  { id: 't1', name: 'Welcome Email', content: 'Welcome {user}', type: 'email' },
  { id: 't2', name: 'Order Confirmation', content: 'Order {orderId} confirmed', type: 'email' },
  { id: 't3', name: 'Invoice Template', content: 'Invoice for {amount}', type: 'document' },
];

const templateApi = {
  /**
   * Simulates fetching templates from a backend.
   * Filters or adapts based on provided settings.
   * @param {{ theme?: string, language?: string }} filters - Settings from the user preferences.
   * @returns {Promise<{ data: Array<Object> }>} - A promise resolving to mock template data.
   */
  getTemplates: async (filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[Mock API] templateApi.getTemplates called with filters:`, filters);
        const { theme = 'light', language = 'en' } = filters;

        // Simulate adapting templates based on settings
        const adaptedTemplates = mockTemplates.map(template => ({
          ...template,
          // Example: appending a note based on theme/language
          adaptedContent: `${template.content} (Rendered for theme: ${theme}, language: ${language})`,
        }));
        resolve({ data: adaptedTemplates });
      }, 600); // Simulate network delay
    });
  },
};

const templateRenderer = {
  /**
   * Simulates rendering a template with specific data and user settings.
   * @param {string} templateId - The ID of the template to render.
   * @param {Object} data - Data to inject into the template.
   * @param {{ theme?: string }} options - Rendering options, including theme from user settings.
   * @returns {Promise<string>} - A promise resolving to the rendered HTML content.
   */
  render: async (templateId, data, options = {}) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(`[Mock Renderer] templateRenderer.render called for template '${templateId}' with options:`, options);
        const { theme = 'light' } = options;
        const template = mockTemplates.find(t => t.id === templateId);

        if (!template) {
          return reject(new Error(`Template with ID '${templateId}' not found.`));
        }

        let content = template.content;
        for (const key in data) {
          // Basic string replacement for placeholders
          content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), data[key]);
        }

        // Simulate applying theme to the rendered output
        const renderedOutput = `
          <div style="
            font-family: Arial, sans-serif;
            background-color: ${theme === 'dark' ? '#2c3e50' : '#f8f9fa'};
            color: ${theme === 'dark' ? '#ecf0f1' : '#34495e'};
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          ">
            <h2>${template.name}</h2>
            <p>${content}</p>
            <small>Rendered with '${theme}' theme.</small>
          </div>
        `;
        resolve(renderedOutput);
      }, 400); // Simulate rendering time
    });
  },
};


/**
 * Thunk to fetch templates, considering user settings from the Redux store.
 * Dispatches actions for loading, success, or error.
 * @returns {Function} An async thunk function.
 */
export const fetchTemplates = () => async (dispatch, getState) => {
  dispatch(templatesLoading()); // Indicate that templates are being loaded

  try {
    const state = getState();
    // Access template-related settings from the global state
    const { defaultTemplateTheme, preferredTemplateLanguage } = state.settings;

    console.log(`[Thunk] fetchTemplates: Using settings - Theme: ${defaultTemplateTheme}, Language: ${preferredTemplateLanguage}`);

    // Use these settings when making an API call
    const response = await templateApi.getTemplates({
      theme: defaultTemplateTheme,
      language: preferredTemplateLanguage,
    });

    dispatch(templatesLoaded(response.data)); // Dispatch loaded data
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    dispatch(templatesError(error.message)); // Dispatch error
  }
};

/**
 * Thunk to render a specific template, utilizing user settings.
 * Dispatches an action with the rendered content or logs an error.
 * @param {string} templateId - The ID of the template to render.
 * @param {Object} data - The data to pass to the template for rendering.
 * @returns {Function} An async thunk function.
 */
export const renderTemplate = (templateId, data) => async (dispatch, getState) => {
  try {
    const state = getState();
    // Access the default template theme setting
    const { defaultTemplateTheme } = state.settings;

    console.log(`[Thunk] renderTemplate: Using theme setting - Theme: ${defaultTemplateTheme}`);

    // Use the theme setting when rendering the template
    const renderedContent = await templateRenderer.render(templateId, data, {
      theme: defaultTemplateTheme,
    });

    // Optionally dispatch the rendered content
    dispatch(templateRendered(renderedContent));
    console.log(`[Thunk] Template '${templateId}' rendered successfully.`);
  } catch (error) {
    console.error(`Failed to render template '${templateId}':`, error);
    // Optionally dispatch an error action if rendering can fail silently
  }
};

// You might have other template-related thunks here as well.

export const __TEMPLATES_FIXTURE__ = [
  {
    id: 'template_dmm_basic_v1',
    name: 'Digital Multimeter Basic (v1)',
    type: 'Digital Multimeter',
    description: 'Basic calibration template for standard DMMs.',
    marginOfError: '±0.5%',
    numberOfTrials: 3,
    predefinedRanges: [{ min: '0', max: '10', unit: 'V' }],
    resolutions: ['0.001'],
    updatedAt: '2023-10-25T10:00:00Z'
  },
  {
    id: 'template_scope_advanced_v2',
    name: 'Oscilloscope Advanced (v2)',
    type: 'Oscilloscope',
    description: 'Advanced calibration template for oscilloscopes.',
    marginOfError: '±1%',
    numberOfTrials: 5,
    predefinedRanges: [{ min: '0', max: '100', unit: 'MHz' }],
    resolutions: ['0.1'],
    updatedAt: '2023-10-26T12:00:00Z'
  }
];

export const setTemplateFilter = (filterName, filterValue) => (dispatch) => {
  dispatch({ type: 'template/SET_FILTER', payload: { [filterName]: filterValue } });
};

export const deleteTemplate = (templateId) => async (dispatch) => {
  dispatch({ type: 'template/DELETE_TEMPLATE', payload: templateId });
};

export const createTemplate = (templateData) => async (dispatch) => {
  dispatch({ type: 'template/CREATE_TEMPLATE', payload: templateData });
  return { id: 'template_new_123' }; 
};

export const updateTemplate = (id, templateData) => async (dispatch) => {
  dispatch({ type: 'template/UPDATE_TEMPLATE', payload: { id, ...templateData } });
};