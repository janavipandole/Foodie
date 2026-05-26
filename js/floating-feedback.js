function loadFloatingFeedbackBtn() {
    // Don't show the button on the feedback page itself
    if (window.location.pathname.includes('feedback.html')) return;

    const btn = document.createElement('a');
    btn.href = './feedback.html';
    btn.className = 'floating-feedback-btn';
    btn.setAttribute('aria-label', 'Give Feedback');
    btn.setAttribute('title', 'Share your feedback');
    btn.innerHTML = `<i class="fa-regular fa-comment-dots"></i> Feedback`;

    document.body.appendChild(btn);
}

document.addEventListener('DOMContentLoaded', loadFloatingFeedbackBtn);