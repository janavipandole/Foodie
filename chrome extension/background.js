/**
 * Background Service Worker for Chrome Extension
 * Handles OAuth2 SSO authentication flow and cross-context cart synchronization.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Background Service Worker] Foodie Extension Installed.');
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'OAUTH_SSO_LOGIN') {
    handleOAuthSSO().then(user => sendResponse({ success: true, user })).catch(err => sendResponse({ success: false, error: err.message }));
    return true; // Keep channel open for async response
  }

  if (request.action === 'SYNC_CART') {
    chrome.storage.local.set({ 'foodie:cart': request.cart }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

async function handleOAuthSSO() {
  const authUrl = 'https://hacktoberfest2025-foodie-rho.vercel.app/html/login.html?sso=ext';

  if (chrome.identity && chrome.identity.launchWebAuthFlow) {
    return new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow(
        { url: authUrl, interactive: true },
        (redirectUrl) => {
          if (chrome.runtime.lastError || !redirectUrl) {
            return reject(new Error(chrome.runtime.lastError?.message || 'OAuth Flow Cancelled'));
          }
          const urlParams = new URLSearchParams(new URL(redirectUrl).search);
          const token = urlParams.get('token');
          resolve({ token, user: 'Authenticated User' });
        }
      );
    });
  }

  // Fallback simulation
  return { user: 'Demo Extension User', email: 'user@foodie.com' };
}
