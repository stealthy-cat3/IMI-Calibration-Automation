// frontend/src/api/calibration.js

/**
 * Mock API for calibration operations.
 * Simulates network latency and returns mock responses.
 */

export const performCalibration = async (sensorId, suggestedParams) => {
  console.log(`Mock API: Performing calibration for sensor ${sensorId}`, suggestedParams);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        newSettings: {
          ...suggestedParams,
          lastCalibrated: new Date().toISOString(),
          calibrationStatus: 'Success'
        }
      });
    }, 800); // Simulate network latency
  });
};

// You can add other calibration API methods here as needed
export const getCalibrationHistory = async (sensorId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: [] });
    }, 500);
  });
};