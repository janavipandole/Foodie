document.addEventListener('DOMContentLoaded', () => {
    const partnerRegisterForm = document.getElementById('partnerRegisterForm');

    if (partnerRegisterForm) {
        partnerRegisterForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('partnerName').value;
            const city = document.getElementById('partnerCity').value;
            const mobile = document.getElementById('partnerMobile').value;

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

            alert(`Thank you, ${name}! Your registration for ${city} with mobile ${mobile} has been received. An OTP will be sent shortly.`);
            
            // In a real application, you would send this data to a backend
            // fetch('/api/register-partner', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ name, city, mobile })
            // })
            // .then(response => response.json())
            // .then(data => {
            //     if (data.success) {
            //         alert('Registration successful! OTP sent.');
            //     } else {
            //         alert('Registration failed: ' + data.message);
            //     }
            // })
            // .catch(error => {
            //     console.error('Error:', error);
            //     alert('An error occurred during registration.');
            // });

            partnerRegisterForm.reset();
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