// frontend/src/store/analytics/selectors.js
import { createSelector } from 'reselect';

// Base selector to get the entire analytics state
const getAnalyticsState = (state) => state.analytics;

// Basic selectors for direct state properties
export const getAnalyticsData = createSelector(
  getAnalyticsState,
  (analyticsState) => analyticsState.data
);

export const getAnalyticsLoading = createSelector(
  getAnalyticsState,
  (analyticsState) => analyticsState.loading
);

export const getAnalyticsError = createSelector(
  getAnalyticsState,
  (analyticsState) => analyticsState.error
);

export const getAnalyticsFilters = createSelector(
  getAnalyticsState,
  (analyticsState) => analyticsState.filters
);

export const getSelectedAnalyticsReportType = createSelector(
  getAnalyticsState,
  (analyticsState) => analyticsState.selectedReportType
);

/**
 * Memoized selector to get analytics data that matches the currently selected report type.
 * This is useful even if the thunk already filters, as the `selectedReportType` might
 * change locally without a full data re-fetch, or for client-side display consistency.
 */
export const getFilteredAnalyticsData = createSelector(
  getAnalyticsData,
  getSelectedAnalyticsReportType,
  (data, selectedReportType) => {
    if (!data || data.length === 0) {
      return [];
    }
    return data.filter(item => item.type === selectedReportType);
  }
);

/**
 * Memoized selector to prepare calibration trend data for charting (US-040).
 * Extracts relevant fields and sorts them by date.
 */
export const getCalibrationTrendChartData = createSelector(
  getFilteredAnalyticsData,
  (filteredData) => {
    if (!filteredData || filteredData.length === 0) {
      return [];
    }

    // Filter explicitly for 'calibration_trend' in case getFilteredAnalyticsData
    // was used with a broader context or for safety.
    const calibrationTrends = filteredData.filter(item => item.type === 'calibration_trend');

    return calibrationTrends
      .map(item => ({
        date: item.calibrationDate, // Use calibrationDate for trend plotting
        deviation: item.deviation,
        uncertainty: item.uncertainty,
        instrumentId: item.instrumentId,
        instrumentType: item.instrumentType,
        unit: item.unit,
        measuredValue: item.measuredValue,
        referenceValue: item.referenceValue,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
);

/**
 * Memoized selector to prepare uncertainty contribution data for charting (US-040).
 * Useful for pie charts or bar charts showing the breakdown of uncertainty.
 */
export const getUncertaintyContributionChartData = createSelector(
  getFilteredAnalyticsData,
  (filteredData) => {
    if (!filteredData || filteredData.length === 0) {
      return [];
    }

    const uncertaintyContributions = filteredData.filter(item => item.type === 'uncertainty_contribution');

    // Aggregate contributions for a given calibration/instrument if desired,
    // or return individual contributions as provided.
    // For now, return as-is, assuming each item is a distinct contribution.
    return uncertaintyContributions.map(item => ({
      contributionName: item.contributionName,
      value: item.value,
      unit: item.unit,
      instrumentId: item.instrumentId,
      calibrationId: item.calibrationId,
    }));
  }
);

/**
 * Memoized selector to prepare instrument performance history data for display (US-040, US-042).
 * This data could be used for timelines, event lists, or specific metric trends (e.g., usage hours).
 */
export const getInstrumentPerformanceHistoryData = createSelector(
  getFilteredAnalyticsData,
  (filteredData) => {
    if (!filteredData || filteredData.length === 0) {
      return [];
    }

    const performanceHistory = filteredData.filter(item => item.type === 'instrument_performance_history');

    return performanceHistory
      .map(item => ({
        date: item.date,
        instrumentId: item.instrumentId,
        instrumentType: item.instrumentType,
        metric: item.metric,
        value: item.value,
        unit: item.unit,
        description: item.description, // Can be null
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
);

/**
 * Memoized selector to extract all unique instrument types present in the data (US-041).
 * Useful for populating filter dropdowns.
 */
export const getAllAvailableInstrumentTypes = createSelector(
  getAnalyticsData,
  (data) => {
    if (!data || data.length === 0) {
      return [];
    }
    const types = new Set();
    data.forEach(item => {
      if (item.instrumentType) {
        types.add(item.instrumentType);
      }
    });
    return Array.from(types).sort();
  }
);

/**
 * Memoized selector to extract all unique instrument IDs present in the data (US-041).
 * Useful for populating filter dropdowns.
 */
export const getAllAvailableInstrumentIds = createSelector(
  getAnalyticsData,
  (data) => {
    if (!data || data.length === 0) {
      return [];
    }
    const ids = new Set();
    data.forEach(item => {
      if (item.instrumentId) {
        ids.add(item.instrumentId);
      }
    });
    return Array.from(ids).sort();
  }
);

/**
 * Memoized selector to get a list of all possible report types.
 * This can be derived from the fixture or predefined based on UI options.
 */
export const getAllAvailableReportTypes = createSelector(
  getAnalyticsData,
  (data) => {
    if (!data || data.length === 0) {
      // Fallback to a hardcoded list if no data is loaded yet
      return ['calibration_trend', 'uncertainty_contribution', 'instrument_performance_history'];
    }
    const types = new Set();
    data.forEach(item => types.add(item.type));
    return Array.from(types).sort();
  }
);