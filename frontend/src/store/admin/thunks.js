// frontend/src/store/admin/thunks.js
import {
  FETCH_VALIDATION_RULES_REQUEST,
  FETCH_VALIDATION_RULES_SUCCESS,
  FETCH_VALIDATION_RULES_FAILURE,
  SELECT_VALIDATION_RULE,
} from './actionTypes';

// MANDATORY FIXTURE for backend model generation and mock API calls
export const __ADMIN_FIXTURE__ = {
    validationRules: [
        {
            id: 'vr-001',
            name: 'Data Integrity Check for Critical Inputs',
            description: 'Ensures that all mandatory data fields receive valid inputs according to predefined constraints (e.g., non-null, correct format, within range).',
            documentation: {
                title: 'Data Integrity Check Specification v1.2',
                content: 'This rule, VR-001, is designed to prevent data corruption and ensure the reliability of information processed by the system. It applies to critical input fields across all modules, including user authentication, project creation, and measurement data entry. Validation includes checks for data type, length, format (e.g., date, email), and range constraints. Non-compliance triggers an error message and prevents submission.',
                version: '1.2',
                lastUpdated: '2023-10-26T14:30:00Z',
                author: 'System Admin',
                status: 'Approved'
            },
            category: 'System Data Integrity',
            severity: 'High',
            status: 'Active',
            applicableModules: ['Auth', 'Projects', 'Measurements'],
            lastReviewed: '2023-10-20T09:00:00Z',
            reviewFrequencyMonths: 6,
            owner: 'Quality Assurance Department'
        },
        {
            id: 'vr-002',
            name: 'User Role-Based Access Control Enforcement',
            description: 'Validates that user actions and access to features are strictly enforced based on their assigned roles and permissions.',
            documentation: {
                title: 'RBAC Policy Document v2.0',
                content: 'Rule VR-002 ensures that unauthorized access to sensitive functionalities or data is prevented. Upon login, the system retrieves the user\'s assigned roles (e.g., Metrology Engineer, Administrator, Viewer). Every attempt to access a module, perform an action (e.g., create, edit, delete), or view specific data is checked against the permissions granted to their role. Any mismatch results in an "Access Denied" notification. This rule is fundamental to system security.',
                version: '2.0',
                lastUpdated: '2023-11-01T10:00:00Z',
                author: 'Security Lead',
                status: 'Approved'
            },
            category: 'Security & Access Control',
            severity: 'Critical',
            status: 'Active',
            applicableModules: ['All'],
            lastReviewed: '2023-10-25T11:00:00Z',
            reviewFrequencyMonths: 3,
            owner: 'Information Security Team'
        },
        {
            id: 'vr-003',
            name: 'Audit Trail Logging for Critical Operations',
            description: 'Ensures all critical user actions and system events are logged with sufficient detail for auditing purposes.',
            documentation: {
                title: 'Audit Trail Specification v1.0',
                content: 'VR-003 mandates the logging of specific events, including but not limited to user login/logout, data modification (create, update, delete), configuration changes, and system errors. Each log entry must include timestamp, user ID, action performed, affected entity, and outcome. This rule supports traceability and non-repudiation.',
                version: '1.0',
                lastUpdated: '2023-09-15T16:00:00Z',
                author: 'Compliance Officer',
                status: 'Approved'
            },
            category: 'Compliance & Audit',
            severity: 'High',
            status: 'Active',
            applicableModules: ['All'],
            lastReviewed: '2023-09-10T10:00:00Z',
            reviewFrequencyMonths: 12,
            owner: 'Compliance Department'
        },
        {
            id: 'vr-004',
            name: 'Measurement Data Uniqueness Validation',
            description: 'Verifies that each measurement entry in the system has a unique identifier and prevents duplicate data submissions.',
            documentation: {
                title: 'Measurement ID Uniqueness Policy v1.1',
                content: 'This rule, VR-004, is applied when new measurement data is submitted. It checks against existing records to ensure that the primary identifier for each measurement (e.g., sensor_id + timestamp, or a generated UUID) is unique. Duplicate submissions are rejected, and an appropriate error message is returned to the user, preventing data redundancy and ensuring data integrity for metrology purposes.',
                version: '1.1',
                lastUpdated: '2023-11-05T08:30:00Z',
                author: 'Metrology Engineer Lead',
                status: 'Approved'
            },
            category: 'Metrology Data Integrity',
            severity: 'Medium',
            status: 'Active',
            applicableModules: ['Measurements'],
            lastReviewed: '2023-10-30T14:00:00Z',
            reviewFrequencyMonths: 6,
            owner: 'Metrology Department'
        }
    ],
    // Other admin-specific data can be added here if it forms part of the single primary entity.
};

/**
 * Simulates an API call delay.
 * @param {number} ms - The delay in milliseconds.
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * A thunk to fetch all software validation rules.
 * Dispatches FETCH_VALIDATION_RULES_REQUEST, then (after a delay) either
 * FETCH_VALIDATION_RULES_SUCCESS with the rules or FETCH_VALIDATION_RULES_FAILURE with an error.
 */
export const fetchValidationRules = () => async (dispatch) => {
  dispatch({ type: FETCH_VALIDATION_RULES_REQUEST });
  try {
    // Simulate API call
    await delay(500); // Simulate network delay

    // In a real application, you would make an actual API call here:
    // const response = await api.get('/admin/validation-rules');
    // const data = await response.json();

    // For now, use the fixture data
    const data = __ADMIN_FIXTURE__.validationRules;

    // Simulate potential API error (e.g., if data is empty or malformed)
    if (!data || !Array.isArray(data)) {
        throw new Error("Invalid data format received from API.");
    }

    dispatch({
      type: FETCH_VALIDATION_RULES_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_VALIDATION_RULES_FAILURE,
      payload: error.message || 'Failed to fetch validation rules.',
    });
  }
};

/**
 * A thunk to select a specific validation rule by its ID.
 * Dispatches SELECT_VALIDATION_RULE with the rule ID.
 * @param {string} ruleId - The ID of the validation rule to select.
 */
export const selectValidationRule = (ruleId) => (dispatch) => {
  // In a real scenario, you might fetch details of this specific rule if not already loaded,
  // or perform additional logic. For this module, we assume the rule object
  // will be pulled from the 'validationRules' array in the reducer based on this ID.
  dispatch({
    type: SELECT_VALIDATION_RULE,
    payload: ruleId,
  });
};