// frontend/src/store/report/selectors.js
import { createSelector } from 'reselect';

// Base selectors for the report state slice
const getReportState = (state) => state.report;

// --- Report Configuration Selectors (reportConfig) ---

export const getReportConfigState = createSelector(
    getReportState,
    (report) => report.reportConfig
);

export const getReportConfig = createSelector(
    getReportConfigState,
    (reportConfig) => reportConfig.data
);

export const getReportConfigLoading = createSelector(
    getReportConfigState,
    (reportConfig) => reportConfig.loading
);

export const getReportConfigError = createSelector(
    getReportConfigState,
    (reportConfig) => reportConfig.error
);

// Derived selectors for specific report config fields
export const getFrontPageSettings = createSelector(
    getReportConfig,
    (config) => config?.frontPageSettings
);

export const getFrontPageEnabledFields = createSelector(
    getFrontPageSettings,
    (frontPageSettings) => frontPageSettings?.enabledFields || []
);

export const getFrontPageAvailableCategories = createSelector(
    getFrontPageSettings,
    (frontPageSettings) => frontPageSettings?.availableCategories || []
);

export const getDataSheetSettings = createSelector(
    getReportConfig,
    (config) => config?.dataSheetSettings
);

export const getIncludeMeasurementUncertaintySummary = createSelector(
    getDataSheetSettings,
    (dataSheetSettings) => dataSheetSettings?.includeMeasurementUncertaintySummary
);

export const getGroupDataByMeasurementCategory = createSelector(
    getDataSheetSettings,
    (dataSheetSettings) => dataSheetSettings?.groupDataByMeasurementCategory
);

export const getAutoPaginateLongDataSheets = createSelector(
    getDataSheetSettings,
    (dataSheetSettings) => dataSheetSettings?.autoPaginateLongDataSheets
);

export const getIncludePassFailIndicators = createSelector(
    getDataSheetSettings,
    (dataSheetSettings) => dataSheetSettings?.includePassFailIndicators
);

export const getReportConfigTemplateId = createSelector(
    getReportConfig,
    (config) => config?.templateId
);

export const getReportConfigFooterText = createSelector(
    getReportConfig,
    (config) => config?.footerText
);

export const getReportConfigLastModified = createSelector(
    getReportConfig,
    (config) => config?.lastModified
);

export const getReportConfigModifiedBy = createSelector(
    getReportConfig,
    (config) => config?.modifiedBy
);

// --- Report Templates Selectors (reportTemplates) ---

export const getReportTemplatesState = createSelector(
    getReportState,
    (report) => report.reportTemplates
);

export const getAllReportTemplates = createSelector(
    getReportTemplatesState,
    (reportTemplates) => reportTemplates.list
);

export const getReportTemplatesLoading = createSelector(
    getReportTemplatesState,
    (reportTemplates) => reportTemplates.loading
);

export const getReportTemplatesError = createSelector(
    getReportTemplatesState,
    (reportTemplates) => reportTemplates.error
);

export const getIsCreatingReportTemplate = createSelector(
    getReportTemplatesState,
    (reportTemplates) => reportTemplates.creating
);

export const getCreateReportTemplateError = createSelector(
    getReportTemplatesState,
    (reportTemplates) => reportTemplates.createError
);

export const getIsUpdatingReportTemplate = createSelector(
    getReportTemplatesState,
    (reportTemplates) => reportTemplates.updating
);

export const getUpdateReportTemplateError = createSelector(
    getReportTemplatesState,
    (reportTemplates) => reportTemplates.updateError
);

export const getIsDeletingReportTemplate = createSelector(
    getReportTemplatesState,
    (reportTemplates) => reportTemplates.deleting
);

export const getDeleteReportTemplateError = createSelector(
    getReportTemplatesState,
    (reportTemplates) => reportTemplates.deleteError
);

export const getReportTemplateById = createSelector(
    [getAllReportTemplates, (state, templateId) => templateId],
    (templates, templateId) => templates.find(template => template.id === templateId)
);

// --- Report Generation Selectors (reportGeneration) ---

export const getReportGenerationState = createSelector(
    getReportState,
    (report) => report.reportGeneration
);

export const getReportGenerationData = createSelector(
    getReportGenerationState,
    (reportGeneration) => reportGeneration.data
);

export const getReportGenerationLoading = createSelector(
    getReportGenerationState,
    (reportGeneration) => reportGeneration.loading
);

export const getReportGenerationError = createSelector(
    getReportGenerationState,
    (reportGeneration) => reportGeneration.error
);