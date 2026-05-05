document.addEventListener('DOMContentLoaded', () => {
    const partnerRegisterForm = document.getElementById('partnerRegisterForm');

    if (partnerRegisterForm) {

         // --- Element references ---
        const otpStep       = document.getElementById('otpStep');
        const successStep   = document.getElementById('successStep');
        const otpPhoneEl    = document.getElementById('otpPhone');
        const otpInputs     = document.querySelectorAll('.otp-input');
        const verifyOtpBtn  = document.getElementById('verifyOtpBtn');
        const otpError      = document.getElementById('otpError');
        const resendBtn     = document.getElementById('resendBtn');
        const resendTimer   = document.getElementById('resendTimer');
        const countdownEl   = document.getElementById('countdown');

        let countdownInterval = null;
        let generatedOtp = '';
        // --- Step 1: submit → show OTP step ---
        partnerRegisterForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('partnerName').value.trim();
            const city = document.getElementById('partnerCity').value;
            const mobile = document.getElementById('partnerMobile').value.trim();

            if (!name || !city || !mobile) {
                alert('Please fill in all required fields.');
                return;
            }

            // Basic mobile number validation for 10 digits
            const mobileRegex = /^[0-9]{10}$/;
            if (!mobileRegex.test(mobile)) {
                alert('Please enter a valid 10-digit mobile number.');
                return;
            }

            // Generate mock OTP (replace with real API call)
            generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            console.log('OTP (dev only):', generatedOtp); // remove before production

            otpPhoneEl.textContent = mobile;
            partnerRegisterForm.style.display = 'none';
            otpStep.style.display = 'block';
            startCountdown();
            otpInputs[0].focus();
        });

        // --- OTP inputs: digit-only, auto-advance, backspace, paste ---
        otpInputs.forEach((input, index) => {
            input.addEventListener('input', () => {
                input.value = input.value.replace(/\D/g, '');
                if (input.value && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !input.value && index > 0) {
                    otpInputs[index - 1].focus();
                }
            });

            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                pasted.split('').forEach((char, i) => {
                    if (otpInputs[i]) otpInputs[i].value = char;
                });
                const lastFilled = Math.min(pasted.length, otpInputs.length - 1);
                otpInputs[lastFilled].focus();
            });
        });

        // --- Step 2: verify OTP ---
        verifyOtpBtn.addEventListener('click', () => {
            const entered = Array.from(otpInputs).map(i => i.value).join('');
            if (entered.length < 6) {
                otpError.textContent = 'Please enter all 6 digits.';
                otpError.style.display = 'block';
                return;
            }
            if (entered === generatedOtp) {
                clearInterval(countdownInterval);
                otpStep.style.display = 'none';
                successStep.style.display = 'block';
            } else {
                otpError.textContent = 'Incorrect OTP. Please try again.';
                otpError.style.display = 'block';
                otpInputs.forEach(i => i.value = '');
                otpInputs[0].focus();
            }
        });

        // --- Countdown timer ---
        function startCountdown() {
            let seconds = 30;
            countdownEl.textContent = seconds;
            resendBtn.style.display = 'none';
            resendTimer.style.display = 'inline';
            otpError.style.display = 'none';

            clearInterval(countdownInterval);
            countdownInterval = setInterval(() => {
                seconds--;
                countdownEl.textContent = seconds;
                if (seconds <= 0) {
                    clearInterval(countdownInterval);
                    resendTimer.style.display = 'none';
                    resendBtn.style.display = 'inline';
                }
            }, 1000);
        }

        // --- Resend OTP ---
        resendBtn.addEventListener('click', () => {
            generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            console.log('Resent OTP (dev only):', generatedOtp); // remove before production
            otpInputs.forEach(i => i.value = '');
            otpInputs[0].focus();
            startCountdown();
        });
    }

    // Theme Toggle and Mobile Menu (re-using logic from app.js/global scripts)
    // Ensure these are initialized if not already handled by a global script
    const themeToggles = document.querySelectorAll('.theme-toggle');
    const html = document.documentElement;

    const updateThemeIcon = theme => {
        themeToggles.forEach(toggle => {
            const icon = toggle.querySelector('i');
            const label = toggle.querySelector('span');
            if (theme === 'dark') {
                icon.classList.replace('fa-moon', 'fa-sun');
                toggle.classList.add('dark');
                if (label) label.textContent = 'Light Mode ☀';
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
                toggle.classList.remove('dark');
                if (label) label.textContent = 'Dark Mode 🌙';
            }
            icon.classList.add('rotate-icon');
            setTimeout(() => icon.classList.remove('rotate-icon'), 600);
        });
    };

    const toggleTheme = () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.classList.add('theme-transition');
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        setTimeout(() => html.classList.remove('theme-transition'), 600);
    };

    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    };
    initTheme();
    themeToggles.forEach(toggle => toggle.addEventListener('click', toggleTheme));

    const hamburger = document.querySelector('.hamberger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const bars = document.querySelector('.fa-bars');

    hamburger?.addEventListener('click', () => {
        mobileMenu.classList.toggle("mobile-menu-active");
        bars.classList.toggle("fa-xmark");
        bars.classList.toggle("fa-bars");
    });

    document.addEventListener("click", (e) => {
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileMenu.classList.remove("mobile-menu-active");
            if (bars.classList.contains("fa-xmark")) {
                bars.classList.remove("fa-xmark");
                bars.classList.add("fa-bars");
            }
        }
    });

    // Back to top button
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});