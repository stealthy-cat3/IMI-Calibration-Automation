// frontend/src/pages/analytics/AnalyticsDashboard.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Alert,
  Grid,
  Button,
  Paper,
  Tabs,
  Tab,
  TextField,
  Autocomplete,
  LinearProgress,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, isValid, parseISO } from 'date-fns';

import {
  fetchAnalyticsData,
  applyAnalyticsFilters,
  // Note: clearAnalyticsFilters and selectAnalyticsReport thunks are not available in the authoritative thunks.js
  // as per the resolution of conflicting context, so we'll manage these aspects locally or via applyAnalyticsFilters.
} from '../../store/analytics/thunks'; // Assumed to be the first thunks.js from 'Available Store Module Codes'
import {
  getAnalyticsLoading as getAnalyticsLoadingStatus,
  getAnalyticsError,
  getAnalyticsFilters,
  getCalibrationTrendChartData as getFilteredTrendData,
  getUncertaintyContributionChartData as getFilteredUncertaintyContributions,
  getInstrumentPerformanceHistoryData as getFilteredPerformanceHistory,
  getAllAvailableInstrumentTypes,
  getAllAvailableInstrumentIds,
} from '../../store/analytics/selectors';

const getSelectedAnalyticsDataPoint = (state) => state.analytics?.selectedDataPoint || null;

// --- Placeholder Components for Charts (Actual charts would use a charting library like Chart.js or Recharts) ---
const ChartContainer = ({ title, data, children }) => (
  <div className="bg-brand-panel border border-brand-border rounded-xl p-5 h-96 flex flex-col items-center justify-center shadow-md shadow-amber-500/10">
    <Typography variant="h6" className="font-display font-bold text-gray-100 mb-2">{title}</Typography>
    {data && data.length === 0 ? (
      <Typography variant="body2" className="text-[11px] text-gray-500 font-mono">No data available for selected filters.</Typography>
    ) : (
      children
    )}
  </div>
);

const CalibrationTrendChart = ({ data }) => (
  <ChartContainer title="Calibration Trend Chart" data={data}>
    {data && data.length > 0 && (
      <Typography variant="caption" className="text-[10px] text-gray-400 mt-2 font-mono">
        Displaying {data.length} trend points. (e.g., Line chart of deviation vs. date)
      </Typography>
    )}
  </ChartContainer>
);

const UncertaintyContributionChart = ({ data }) => (
  <ChartContainer title="Uncertainty Contribution Chart" data={data}>
    {data && data.length > 0 && (
      <Typography variant="caption" className="text-[10px] text-gray-400 mt-2 font-mono">
        Displaying {data.length} contributions. (e.g., Pie chart or Bar chart of contributions)
      </Typography>
    )}
  </ChartContainer>
);

const InstrumentPerformanceHistoryTable = ({ data }) => (
  <ChartContainer title="Instrument Performance History" data={data}>
    {data && data.length > 0 ? (
      <Box className="w-full overflow-y-auto max-h-[calc(100%-60px)] pr-2">
        <Typography variant="body2" className="font-display font-bold text-gray-300 mb-3 text-xs uppercase tracking-wider">Recent Events:</Typography>
        {data.slice(0, 5).map((item, index) => (
          <Typography key={index} variant="body2" className="text-[11px] font-mono text-gray-400 mb-2 border-b border-brand-border pb-2">
            <span className="text-amber-400 font-medium">
              {item.date ? format(parseISO(item.date), 'yyyy-MM-dd HH:mm') : 'N/A'} - {item.instrumentId || 'N/A'}:
            </span>
            &nbsp;<span className="text-blue-400">{item.metric || 'N/A'}</span> = <span className="text-gray-100">{item.value || 'N/A'} {item.unit || ''}</span> {item.description ? `(${item.description})` : ''}
          </Typography>
        ))}
        {data.length > 5 && <Typography variant="caption" className="text-[9px] text-gray-500 mt-2 block font-mono">... {data.length - 5} more items. Scroll for full list.</Typography>}
      </Box>
    ) : null}
  </ChartContainer>
);
// --- End Placeholder Components ---

const AnalyticsDashboard = () => {
  const dispatch = useDispatch();

  const isLoading = useSelector(getAnalyticsLoadingStatus);
  const error = useSelector(getAnalyticsError);
  const currentFilters = useSelector(getAnalyticsFilters);
  const selectedDataPoint = useSelector(getSelectedAnalyticsDataPoint); // For potential drill-down

  const trendData = useSelector(getFilteredTrendData);
  const uncertaintyData = useSelector(getFilteredUncertaintyContributions);
  const performanceHistoryData = useSelector(getFilteredPerformanceHistory);

  const instrumentTypes = useSelector(getAllAvailableInstrumentTypes);
  const uutSerialNumbers = useSelector(getAllAvailableInstrumentIds); // Mapping instrumentId to uutSerialNumber filter field

  // Local state for filter inputs, initialized from Redux store filters
  const [localStartDate, setLocalStartDate] = useState(
    currentFilters.dateRange?.start ? parseISO(currentFilters.dateRange.start) : null
  );
  const [localEndDate, setLocalEndDate] = useState(
    currentFilters.dateRange?.end ? parseISO(currentFilters.dateRange.end) : null
  );
  const [localInstrumentType, setLocalInstrumentType] = useState(currentFilters.instrumentType || null);
  const [localUutSerialNumber, setLocalUutSerialNumber] = useState(currentFilters.uutSerialNumber || null);

  // Local state to manage which report/chart is currently selected for display via tabs
  const [selectedReportTab, setSelectedReportTab] = useState(0); // 0: Trends, 1: Uncertainty, 2: Performance

  const reportTabs = useMemo(() => [
    { label: 'Calibration Trends', component: <CalibrationTrendChart data={trendData} /> },
    { label: 'Uncertainty Contributions', component: <UncertaintyContributionChart data={uncertaintyData} /> },
    { label: 'Performance History', component: <InstrumentPerformanceHistoryTable data={performanceHistoryData} /> },
  ], [trendData, uncertaintyData, performanceHistoryData]);


  // Effect to load initial data and update local filter states when Redux filters change
  useEffect(() => {
    // Initial fetch or re-fetch when Redux store's filters change (e.g., from an external action)
    dispatch(fetchAnalyticsData(currentFilters));
  }, [dispatch, currentFilters]);

  // Sync local filter state with Redux currentFilters when they change
  useEffect(() => {
    setLocalStartDate(currentFilters.dateRange?.start ? parseISO(currentFilters.dateRange.start) : null);
    setLocalEndDate(currentFilters.dateRange?.end ? parseISO(currentFilters.dateRange.end) : null);
    setLocalInstrumentType(currentFilters.instrumentType || null);
    setLocalUutSerialNumber(currentFilters.uutSerialNumber || null);
  }, [currentFilters]);

  const handleApplyFilters = () => {
    const newFilters = {
      dateRange: {
        start: localStartDate && isValid(localStartDate) ? format(localStartDate, 'yyyy-MM-dd') : null,
        end: localEndDate && isValid(localEndDate) ? format(localEndDate, 'yyyy-MM-dd') : null,
      },
      instrumentType: localInstrumentType,
      uutSerialNumber: localUutSerialNumber,
    };
    dispatch(applyAnalyticsFilters(newFilters)); // This thunk dispatches SET_ANALYTICS_FILTERS and then fetches data
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      dateRange: { start: null, end: null },
      instrumentType: null,
      uutSerialNumber: null,
    };
    dispatch(applyAnalyticsFilters(clearedFilters)); // Use applyAnalyticsFilters to clear and re-fetch
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom component="h1" sx={{ color: 'primary.main', mb: 3, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Analytics Dashboard
        </Typography>

        {/* Filters Section */}
        <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6} lg={6} xl={3}>
              <DatePicker
                label="Start Date"
                value={localStartDate}
                onChange={(newValue) => setLocalStartDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth sx={{ minWidth: 240 }} />}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={6} xl={3}>
              <DatePicker
                label="End Date"
                value={localEndDate}
                onChange={(newValue) => setLocalEndDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth sx={{ minWidth: 240 }} />}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={6} xl={3}>
              <Autocomplete
                options={uutSerialNumbers} // Populating UUT Serial Number dropdown with Instrument IDs
                getOptionLabel={(option) => option || ''}
                value={localUutSerialNumber}
                onChange={(event, newValue) => setLocalUutSerialNumber(newValue)}
                renderInput={(params) => <TextField {...params} label="UUT Serial Number" fullWidth sx={{ minWidth: 240 }} />}
                clearOnEscape
                componentsProps={{ paper: { sx: { width: 'max-content', minWidth: '100%' } } }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={6} xl={3}>
              <Autocomplete
                options={instrumentTypes}
                getOptionLabel={(option) => option || ''}
                value={localInstrumentType}
                onChange={(event, newValue) => setLocalInstrumentType(newValue)}
                renderInput={(params) => <TextField {...params} label="Instrument Type" fullWidth sx={{ minWidth: 240 }} />}
                clearOnEscape
                componentsProps={{ paper: { sx: { width: 'max-content', minWidth: '100%' } } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', lg: 'flex-end' }, mt: { xs: 2, lg: 1 } }}>
                <Button
                  variant="contained"
                  onClick={handleApplyFilters}
                  disabled={isLoading}
                  sx={{ py: 1.5, px: 4, fontSize: '1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none', boxShadow: 4, flexGrow: { xs: 1, sm: 0 } }}
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  disabled={isLoading}
                  sx={{ py: 1.5, px: 4, fontSize: '1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none', flexGrow: { xs: 1, sm: 0 } }}
                >
                  Clear Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {isLoading && <LinearProgress sx={{ mb: 2 }} />}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error: {error}
          </Alert>
        )}

        {/* Report/Chart Display Section */}
        <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, mt: 1 }}>
          <Tabs
            value={selectedReportTab}
            onChange={(event, newValue) => setSelectedReportTab(newValue)}
            aria-label="Analytics Report Tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2 }}
          >
            {reportTabs.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
          <Box sx={{ mt: 2 }}>
            {reportTabs[selectedReportTab].component}
          </Box>

          {/* Drill Down Section - Conceptual Placeholder */}
          {/* US-041 mentions drilling down into specific data points.
              With a real charting library, clicking a data point would dispatch `drillIntoDataPoint`.
              The `getSelectedAnalyticsDataPoint` selector would then provide details for a modal or detail view. */}
          {selectedDataPoint && (
            <Paper sx={{ p: 2, mt: 4, bgcolor: 'primary.lightest' }}>
              <Typography variant="h6" gutterBottom>Selected Data Point Details</Typography>
              <Typography variant="body2" component="pre">
                {JSON.stringify(selectedDataPoint, null, 2)}
              </Typography>
              <Button sx={{mt:2}} onClick={() => dispatch({type: 'ANALYTICS/SELECT_ANALYTICS_DATA_POINT', payload: null})}>Clear Selected Data</Button>
            </Paper>
          )}
          {!selectedDataPoint && (
            <Typography variant="body2" color="text.secondary" sx={{mt: 4, fontStyle: 'italic'}}>
              Click on a chart data point to drill down for more details (requires interactive charts).
            </Typography>
          )}

        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default AnalyticsDashboard;