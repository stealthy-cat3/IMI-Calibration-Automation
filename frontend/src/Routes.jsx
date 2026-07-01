// frontend/src/Routes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { RouteNames } from './RouteNames';

// Layouts
import AppLayout from './layouts/AppLayout';

// Calibration Screens
import InstrumentConnection from './pages/calibration/InstrumentConnection.jsx';
import LiveCalibrationRun from './pages/calibration/LiveCalibrationRun.jsx';

// Template Screens
import TemplateList from './pages/template/TemplateList.jsx';
import TemplateForm from './pages/template/TemplateForm.jsx';

// Uncertainty Formula Screens
import MuFormulaList from './pages/uncertainty/MuFormulaList.jsx';
import MuFormulaEditor from './pages/uncertainty/MuFormulaEditor.jsx';

// Report Screens
import ReportConfiguration from './pages/report/ReportConfiguration.jsx';
import CalibrationReportViewer from './pages/report/CalibrationReportViewer.jsx';

// Settings Screens
import ApplicationSettings from './pages/settings/ApplicationSettings.jsx';

// Analytics Screens
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      {/* All routes wrapped by AppLayout */}
      <Route path="/" element={<AppLayout />}>
        {/* Calibration Routes */}
        <Route path={RouteNames.CALIBRATION_INSTRUMENT_CONNECTION} element={<InstrumentConnection />} />
        <Route path={RouteNames.CALIBRATION_LIVE_RUN} element={<LiveCalibrationRun />} />

        {/* Template Routes */}
        <Route path={RouteNames.TEMPLATE_LIST} element={<TemplateList />} />
        <Route path={RouteNames.TEMPLATE_CREATE} element={<TemplateForm />} />
        <Route path={RouteNames.TEMPLATE_EDIT} element={<TemplateForm />} />

        {/* Uncertainty Formula Routes */}
        <Route path={RouteNames.MU_FORMULA_LIST} element={<MuFormulaList />} />
        <Route path={RouteNames.MU_FORMULA_CREATE} element={<MuFormulaEditor />} />
        <Route path={RouteNames.MU_FORMULA_EDIT} element={<MuFormulaEditor />} />

        {/* Report Routes */}
        <Route path={RouteNames.REPORT_SETTINGS} element={<ReportConfiguration />} />
        <Route path={RouteNames.CALIBRATION_REPORT_VIEWER} element={<CalibrationReportViewer />} />

        {/* Settings Routes */}
        <Route path={RouteNames.APP_SETTINGS} element={<ApplicationSettings />} />

        {/* Analytics Routes */}
        <Route path={RouteNames.ANALYTICS_DASHBOARD} element={<AnalyticsDashboard />} />

        {/* You can add an index route or a redirect for the base path if needed */}
        {/* <Route index element={<Navigate to={RouteNames.ANALYTICS_DASHBOARD} replace />} /> */}
        {/* Optional: Add a 404 Not Found page */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;