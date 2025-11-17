// Partner With Us form interactivity
// Show golden toast on submit

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.partner-form');
    const toast = document.getElementById('partner-success-toast');
    if (!form || !toast) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        showToast();
        form.reset();
    });
    function showToast() {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2200);
    }
});
