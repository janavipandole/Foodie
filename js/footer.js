function loadFooter() {
    const footerHTML = `
        <div class="footer-container">
            <div class="flex wrapper gap-4">
                <div class="footer-wrapper">
                    <a href="./index.html" class="logo">Foodie.</a>
                    <p class="mt-one" data-i18n="footer.description">We will fill your tummy with delicious food with fast delivery</p>
                    <div class="media flex gap-2 mt-one">
                        <a href="https://github.com/janavipandole" class="social-media">
                            <i class="fa-brands fa-github"></i>
                        </a>
                        <a href="https://www.linkedin.com/in/janavi-pandole-80a7b2290" class="social-media">
                            <i class="fa-brands fa-linkedin"></i>
                        </a>
                        <a href="https://www.youtube.com/@JanaviPandole" class="social-media">
                            <i class="fa-brands fa-youtube"></i>
                        </a>
                        <a href="https://x.com/JanaviPandole" class="social-media">
                            <i class="fa-brands fa-x-twitter"></i>
                        </a>
                    </div>
                </div>

                <ul class="footer-wrapper">
                    <li>
                        <h4 data-i18n="footer.ourMenu">Our Menu</h4>
                    </li>
                    <li class="mt-one"><a href="./Special-dishes·.html" class="footer-link"
                            data-i18n="footer.special">Special</a></li>
                    <li class="mt-one"><a href="./popular.html" class="footer-link" data-i18n="footer.popular">Popular</a>
                    </li>
                    <li class="mt-one"><a href="./category.html" class="footer-link"
                            data-i18n="footer.category">Category</a></li>
                </ul>

                <ul class="footer-wrapper">
                    <li>
                        <h4 data-i18n="footer.company">Company</h4>
                    </li>
                    <li class="mt-one"><a href="#" class="footer-link" data-i18n="footer.whyFoodie"> Why Foodie</a></li>
                    <li class="mt-one"><a href="./PartnerWithUs.html" class="footer-link"
                            data-i18n="footer.partnerWithUs"> Partner with us</a>
                    </li>
                    <li class="mt-one"><a href="./rideWithUs.html" class="footer-link" data-i18n="footer.rideWithUs"> Ride With Us</a></li>
                    <li class="mt-one"><a href="/html/aboutUs.html" class="footer-link" data-i18n="footer.aboutUs">
                            About us </a></li>
                    <li class="mt-one"><a href="./faq-page.html" class="footer-link" data-i18n="footer.faq"> FAQ's</a>
                    </li>
                </ul>

                <ul class="footer-wrapper">
    <li>
        <h4 data-i18n="footer.support">Support</h4>
    </li>

    <li class="mt-one">
        <a href="/html/signup.html" class="footer-link" data-i18n="footer.account">
            Account
        </a>
    </li>

    <li class="mt-one">
        <a href="./supportCenter.html" class="footer-link" data-i18n="footer.supportCenter">
            Support center
        </a>
    </li>

    <li class="mt-one">
        <a href="./privacy-policy.html" class="footer-link">
            Privacy Policy
        </a>
    </li>

    <li class="mt-one">
        <a href="./terms-of-service.html" class="footer-link">
            Terms of Service
        </a>
    </li>

    <li class="mt-one">
        <a href="./feedback.html" class="footer-link" data-i18n="footer.feedback">
            Feedback
        </a>
    </li>

    <li class="mt-one">
        <a href="/html/contactUs.html" class="footer-link" data-i18n="footer.contactUs">
            Contact Us
        </a>
    </li>

    <li class="mt-one">
        <a href="./contributors.html" class="footer-link" data-i18n="Contribution">
            Contributors
        </a>
    </li>
</ul>
</div>
</div>
    `;

    const footerElement = document.getElementById('contacts');
    if (footerElement) {
        footerElement.innerHTML = footerHTML;
        
        // 1. Update Translations if available
        if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
            window.i18n.applyTranslations();
        }

        // 2. REFRESH AOS (Fix for invisible footer)
        if (typeof AOS !== 'undefined') {
            setTimeout(() => {
                AOS.refresh();
            }, 100);
        }
    }
}

document.addEventListener('DOMContentLoaded', loadFooter);