// frontend/src/api/index.js

export const settingsApi = {
  updateSettings: async (settings) => {
    console.log("Mock API: Updating settings:", settings);
    return new Promise(resolve => setTimeout(() => {
      // Simulate success or failure
      if (settings && settings.simulateError) { // Add a flag to test error case
        throw new Error("Mock API Error: Failed to save settings.");
      }
      resolve({ data: { ...settings, lastUpdated: new Date().toISOString() } });
    }, 500)); // Simulate network latency
  },
  // Add other API methods if needed, e.g., getSettings
};