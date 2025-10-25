// PostHog Analytics Integration for Speedy AI
import posthog from 'posthog-js';

// Configuration
const POSTHOG_CONFIG = {
  apiKey: 'phc_5Txt2Is8TDKuG9wJ4UithwddgLUgaDhjTplaPmcrMic',
  apiHost: 'https://us.i.posthog.com',
  enabled: true, // Set to false to disable analytics
};

// Initialize PostHog
let initialized = false;

export function initAnalytics() {
  if (initialized || !POSTHOG_CONFIG.enabled || !POSTHOG_CONFIG.apiKey) {
    console.log('📊 Analytics disabled or not configured');
    return;
  }

  try {
    posthog.init(POSTHOG_CONFIG.apiKey, {
      api_host: POSTHOG_CONFIG.apiHost,
      person_profiles: 'identified_only', // Only create profiles for identified users
      autocapture: false, // Disable autocapture for privacy
      capture_pageview: false, // Extensions don't have traditional pageviews
      disable_session_recording: true, // Respect user privacy
      loaded: (posthog) => {
        console.log('📊 PostHog analytics initialized');
      },
    });
    initialized = true;
  } catch (error) {
    console.error('❌ Failed to initialize analytics:', error);
  }
}

// Track events
export function trackEvent(eventName, properties = {}) {
  if (!initialized || !POSTHOG_CONFIG.enabled) return;
  
  try {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Failed to track event:', error);
  }
}

// Identify user (use anonymous ID or user ID if available)
export function identifyUser(userId, properties = {}) {
  if (!initialized || !POSTHOG_CONFIG.enabled) return;
  
  try {
    posthog.identify(userId, properties);
  } catch (error) {
    console.error('❌ Failed to identify user:', error);
  }
}

// Track extension installation
export function trackInstall() {
  trackEvent('extension_installed', {
    version: chrome.runtime.getManifest().version,
    browser: navigator.userAgent.includes('Firefox') ? 'firefox' : 'chrome',
  });
}

// Track chat interactions
export function trackChatMessage(messageData) {
  trackEvent('chat_message_sent', {
    model: messageData.model,
    messageLength: messageData.message?.length || 0,
    hasContext: !!messageData.context,
  });
}

export function trackChatResponse(responseData) {
  trackEvent('chat_response_received', {
    model: responseData.model,
    responseLength: responseData.response?.length || 0,
    responseTime: responseData.responseTime,
  });
}

// Track FAB interactions
export function trackFABClick() {
  trackEvent('fab_clicked');
}

export function trackOverlayOpen() {
  trackEvent('overlay_opened');
}

export function trackOverlayClose() {
  trackEvent('overlay_closed');
}

// Track errors
export function trackError(error, context = {}) {
  trackEvent('error_occurred', {
    error: error.message,
    stack: error.stack,
    ...context,
  });
}

// Track feature usage
export function trackFeatureUsage(featureName, properties = {}) {
  trackEvent('feature_used', {
    feature: featureName,
    ...properties,
  });
}

// Track model selection
export function trackModelChange(model) {
  trackEvent('model_changed', {
    model: model,
  });
}

// Track context capture
export function trackContextCapture(contextType) {
  trackEvent('context_captured', {
    type: contextType,
  });
}

// Reset user (for privacy - call on uninstall or user request)
export function resetUser() {
  if (!initialized || !POSTHOG_CONFIG.enabled) return;
  
  try {
    posthog.reset();
  } catch (error) {
    console.error('❌ Failed to reset user:', error);
  }
}

