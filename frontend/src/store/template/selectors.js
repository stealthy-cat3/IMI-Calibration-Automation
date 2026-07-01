// frontend/src/store/template/selectors.js
import { createSelector } from 'reselect';

// Base selectors for the template state slice
const getTemplatesState = (state) => state.template;

export const getTemplatesList = createSelector(
  getTemplatesState,
  (templateState) => templateState.templates
);

export const getLoadingStatus = createSelector(
  getTemplatesState,
  (templateState) => templateState.loading
);

export const getError = createSelector(
  getTemplatesState,
  (templateState) => templateState.error
);

export const getTemplateFilters = createSelector(
  getTemplatesState,
  (templateState) => templateState.filters || { search: '', type: 'All' }
);

export const getSelectedTemplateId = createSelector(
  getTemplatesState,
  (templateState) => templateState.selectedTemplateId
);

// Memoized selector to get templates after applying filters
export const getFilteredTemplates = createSelector(
  [getTemplatesList, getTemplateFilters],
  (templates, filters) => {
    let filtered = templates;

    // Filter by type (US-016)
    if (filters.type && filters.type !== 'All') {
      const lowerCaseType = filters.type.toLowerCase();
      filtered = filtered.filter(
        (template) => template.type && template.type.toLowerCase() === lowerCaseType
      );
    }

    // Filter by search text (US-016)
    if (filters.search) {
      const lowerCaseSearch = filters.search.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(lowerCaseSearch) ||
          (template.description && template.description.toLowerCase().includes(lowerCaseSearch)) ||
          (template.type && template.type.toLowerCase().includes(lowerCaseSearch)) // Also search by type if applicable
      );
    }

    return filtered;
  }
);

// Memoized selector to get a specific template by its ID
// This selector can be used in components like: useSelector(state => getTemplateById(state, 'tpl-101'))
export const getTemplateById = createSelector(
  [getTemplatesList, (state, templateId) => templateId],
  (templates, templateId) => templates.find((template) => template.id === templateId)
);

// Memoized selector to get the currently selected template object
export const getSelectedTemplate = createSelector(
  [getTemplatesList, getSelectedTemplateId],
  (templates, selectedId) => {
    if (!selectedId) return null;
    return templates.find((template) => template.id === selectedId);
  }
);