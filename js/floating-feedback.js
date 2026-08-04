/**
 * Floating Feedback Button Module
 * Dynamically injects a floating feedback button on allowed pages and handles navigation.
 */

/**
 * Loads and renders the floating feedback button if not already present,
 * and skips rendering on the feedback page.
 */
export function loadFloatingFeedbackBtn() {
    // Don't show the button on the feedback page itself
    if (window.location.pathname.includes('feedback.html')) return;

    // Safeguard: Prevent creating duplicate buttons if one already exists
    if (document.querySelector('.floating-feedback-btn')) {
        return;
    }

    const btn = document.createElement('a');
    btn.href = './feedback.html';
    btn.className = 'floating-feedback-btn';
    btn.setAttribute('aria-label', 'Give Feedback');
    btn.setAttribute('title', 'Share your feedback');
    btn.innerHTML = `<i class="fa-regular fa-comment-dots"></i> Feedback`;

    document.body.appendChild(btn);
}

// Auto-initialize on DOM load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', loadFloatingFeedbackBtn);
}

// Global window binding for legacy script compatibility
if (typeof window !== 'undefined') {
    window.loadFloatingFeedbackBtn = loadFloatingFeedbackBtn;
}
