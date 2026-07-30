/**
 * Ride With Us Module
 * Manages partner registration validation, mock OTP generation and verification, countdown timers, and theme preferences.
 */

/**
 * Validates a 10-digit mobile number format.
 * @param {string} mobile - Mobile number string
 * @returns {boolean} True if exactly 10 digits, false otherwise
 */
export function validateMobileNumber(mobile) {
    if (!mobile || typeof mobile !== 'string') return false;
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile.trim());
}

/**
 * Generates a random 6-digit mock OTP string.
 * @returns {string} 6-digit OTP string
 */
export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Updates theme toggle button icons and labels based on the active theme.
 * @param {string} theme - 'dark' or 'light'
 */
export function updateThemeIcon(theme) {
    if (typeof document === 'undefined') return;
    const themeToggles = document.querySelectorAll('.theme-toggle');
    themeToggles.forEach(toggle => {
        const icon = toggle.querySelector('i');
        const label = toggle.querySelector('span');
        if (!icon) return;
        
        if (theme === 'dark') {
            icon.classList.replace('fa-moon', 'fa-sun');
            toggle.classList.add('dark');
            if (label) label.textContent = typeof t === 'function' ? t('ride.theme.lightMode', 'Light Mode ☀') : 'Light Mode ☀';
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            toggle.classList.remove('dark');
            if (label) label.textContent = typeof t === 'function' ? t('ride.theme.darkMode', 'Dark Mode 🌙') : 'Dark Mode 🌙';
        }
        icon.classList.add('rotate-icon');
        setTimeout(() => icon.classList.remove('rotate-icon'), 600);
    });
}

// ===== DOM INITIALIZATION =====
if (typeof document !== 'undefined') {
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

                const nameInput = document.getElementById('partnerName');
                const cityInput = document.getElementById('partnerCity');
                const mobileInput = document.getElementById('partnerMobile');

                const name = nameInput ? nameInput.value.trim() : '';
                const city = cityInput ? cityInput.value : '';
                const mobile = mobileInput ? mobileInput.value.trim() : '';

                if (!name || !city || !mobile) {
                    alert(typeof t === 'function' ? t('ride.form.requiredFields', 'Please fill in all required fields.') : 'Please fill in all required fields.');
                    return;
                }

                // Basic mobile number validation for 10 digits
                if (!validateMobileNumber(mobile)) {
                    alert(typeof t === 'function' ? t('ride.form.invalidMobile', 'Please enter a valid 10-digit mobile number.') : 'Please enter a valid 10-digit mobile number.');
                    return;
                }

                // Generate mock OTP
                generatedOtp = generateOTP();
                console.log('OTP (dev only):', generatedOtp);

                if (otpPhoneEl) otpPhoneEl.textContent = mobile;
                partnerRegisterForm.style.display = 'none';
                if (otpStep) otpStep.style.display = 'block';
                startCountdown();
                if (otpInputs && otpInputs[0]) otpInputs[0].focus();
            });

            // --- OTP inputs: digit-only, auto-advance, backspace, paste ---
            if (otpInputs && otpInputs.length > 0) {
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
            }

            // --- Step 2: verify OTP ---
            if (verifyOtpBtn) {
                verifyOtpBtn.addEventListener('click', () => {
                    const entered = Array.from(otpInputs).map(i => i.value).join('');
                    if (entered.length < 6) {
                        if (otpError) {
                            otpError.textContent = typeof t === 'function' ? t('ride.otp.required', 'Please enter all 6 digits.') : 'Please enter all 6 digits.';
                            otpError.style.display = 'block';
                        }
                        return;
                    }
                    if (entered === generatedOtp) {
                        clearInterval(countdownInterval);
                        if (otpStep) otpStep.style.display = 'none';
                        if (successStep) successStep.style.display = 'block';
                    } else {
                        if (otpError) {
                            otpError.textContent = typeof t === 'function' ? t('ride.otp.incorrect', 'Incorrect OTP. Please try again.') : 'Incorrect OTP. Please try again.';
                            otpError.style.display = 'block';
                        }
                        otpInputs.forEach(i => i.value = '');
                        if (otpInputs[0]) otpInputs[0].focus();
                    }
                });
            }

            // --- Countdown timer ---
            function startCountdown() {
                let seconds = 30;
                if (countdownEl) countdownEl.textContent = seconds;
                if (resendBtn) resendBtn.style.display = 'none';
                if (resendTimer) resendTimer.style.display = 'inline';
                if (otpError) otpError.style.display = 'none';

                clearInterval(countdownInterval);
                countdownInterval = setInterval(() => {
                    seconds--;
                    if (countdownEl) countdownEl.textContent = seconds;
                    if (seconds <= 0) {
                        clearInterval(countdownInterval);
                        if (resendTimer) resendTimer.style.display = 'none';
                        if (resendBtn) resendBtn.style.display = 'inline';
                    }
                }, 1000);
            }

            // --- Resend OTP ---
            if (resendBtn) {
                resendBtn.addEventListener('click', () => {
                    generatedOtp = generateOTP();
                    console.log('Resent OTP (dev only):', generatedOtp);
                    otpInputs.forEach(i => i.value = '');
                    if (otpInputs[0]) otpInputs[0].focus();
                    startCountdown();
                });
            }
        }

        // Theme Toggle and Mobile Menu
        const themeToggles = document.querySelectorAll('.theme-toggle');
        const html = document.documentElement;

        const toggleTheme = () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.classList.add('theme-transition');
            html.setAttribute('data-theme', newTheme);
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('theme', newTheme);
            }
            updateThemeIcon(newTheme);
            setTimeout(() => html.classList.remove('theme-transition'), 600);
        };

        const initTheme = () => {
            const savedTheme = (typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null) || 'light';
            html.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        };
        initTheme();
        themeToggles.forEach(toggle => toggle.addEventListener('click', toggleTheme));

        const hamburger = document.querySelector('.hamberger');
        const mobileMenu = document.querySelector('.mobile-menu');
        const bars = document.querySelector('.fa-bars');

        hamburger?.addEventListener('click', () => {
            mobileMenu?.classList.toggle("mobile-menu-active");
            bars?.classList.toggle("fa-xmark");
            bars?.classList.toggle("fa-bars");
        });

        document.addEventListener("click", (e) => {
            if (hamburger && mobileMenu && !hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove("mobile-menu-active");
                if (bars && bars.classList.contains("fa-xmark")) {
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
}

// Global window bindings for legacy script execution
if (typeof window !== 'undefined') {
    window.validateMobileNumber = validateMobileNumber;
    window.generateOTP = generateOTP;
    window.updateThemeIcon = updateThemeIcon;
    window.rideWithUsModule = {
        validateMobileNumber,
        generateOTP,
        updateThemeIcon
    };
}
