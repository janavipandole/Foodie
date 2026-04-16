// Feedback interactivity script
// Handles opening/closing the feedback form and submitting feedback

document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.feedback-card');
    const modal = document.getElementById('feedback-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const closeBtn = document.getElementById('close-modal');
    const form = document.getElementById('feedback-form');
    const overlay = document.getElementById('modal-overlay');
    const toast = document.getElementById('success-toast');

    cards.forEach(card => {
        card.addEventListener('click', function () {
            const category = card.querySelector('h2').textContent;
            modalTitle.textContent = category;
            modalCategory.value = category;
            modal.classList.add('open');
            overlay.classList.add('open');
            form.reset();
            form.querySelector('textarea').focus();
        });
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });

    function closeModal() {
        modal.classList.remove('open');
        overlay.classList.remove('open');
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        // Show animated toast instead of alert
        showToast();
        closeModal();
    });

    function showToast() {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2200);
    }
});
