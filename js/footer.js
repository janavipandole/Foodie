function loadFooter() {
    const footerHTML = `
        <div class="footer-container">
            <div class="flex wrapper gap-4">
                <div class="footer-wrapper">
                    <a href="#" class="logo">Foodie.</a>
                    <p class="mt-one" data-i18n="footer.description">We will fill your tummy with delicious <br>food
                        with fast delivery</p>
                    <div class="media flex gap-2 mt-one">
                        <a href="https://github.com/janavipandole" class="social-media">
                            <img src="../imgs/GitHub.webp" alt="GitHub social icon in footer">
                        </a>
                        <a href="https://www.linkedin.com/in/janavi-pandole-80a7b2290" class="social-media linkdin">
                            <img src="../imgs/linkdin.webp" alt="LinkedIn social icon in footer">
                        </a>
                        <a href="https://www.youtube.com/@JanaviPandole" class="social-media">
                            <img src="../imgs/youtube.webp" alt="YouTube social icon in footer">
                        </a>
                        <a href="https://x.com/JanaviPandole" class="social-media">
                            <img src="../imgs/twitter.webp" alt="Twitter social icon in footer">
                        </a>
                    </div>
                </div>

                <ul class="footer-wrapper">
                    <li>
                        <h4 data-i18n="footer.ourMenu">Our Menu</h4>
                    </li>
                    <li class="mt-one"><a href="Special-dishes·.html" class="footer-link"
                            data-i18n="footer.special">Special</a></li>
                    <li class="mt-one"><a href="popular.html" class="footer-link" data-i18n="footer.popular">Popular</a>
                    </li>
                    <li class="mt-one"><a href="../html/index.html" class="footer-link"
                            data-i18n="footer.category">Category</a></li>
                </ul>

                <ul class="footer-wrapper">
                    <li>
                        <h4 data-i18n="footer.company">Company</h4>
                    </li>
                    <li class="mt-one"><a href="#" class="footer-link" data-i18n="footer.whyFoodie"> Why Foodie</a></li>
                    <li class="mt-one"><a href="../html/PartnerWithUs.html" class="footer-link"
                            data-i18n="footer.partnerWithUs"> Partner with us</a>
                    </li>
                    <li class="mt-one"><a href="./rideWithUs.html" class="footer-link" data-i18n="footer.rideWithUs"> Ride With Us</a></li>
                    <li class="mt-one"><a href="../html/aboutUs.html" class="footer-link" data-i18n="footer.aboutUs">
                            About us </a></li>
                    <li class="mt-one"><a href="faq-page.html" class="footer-link" data-i18n="footer.faq"> FAQ's</a>
                    </li>
                </ul>

                <ul class="footer-wrapper">
                    <li>
                        <h4 data-i18n="footer.support">Support</h4>
                    </li>
                    <li class="mt-one"><a href="../html/signup.html" class="footer-link"
                            data-i18n="footer.account">Account</a></li>
                    <li class="mt-one"><a href="../html/supportCenter.html" class="footer-link"
                            data-i18n="footer.supportCenter"> Support center </a>
                    </li>
                    <li class="mt-one"><a href="../html/feedback.html" class="footer-link" data-i18n="footer.feedback">
                            Feedback</a></li>
                    <li class="mt-one"><a href="../html/contactUs.html" class="footer-link"
                            data-i18n="footer.contactUs">Contact Us</a></li>
                    <li class="mt-one"><a href="../html/contributors.html" class="footer-link"
                            data-i18n="Contribution"> Contributors</a></li>
                </ul>
            </div>
        </div>

        document.getElementById('footer-placeholder').innerHTML = footerHTML;
    `;

    const footerElement = document.getElementById('contacts');
    if (footerElement) {
        footerElement.innerHTML = footerHTML;
        
        // 1. Update Translations if available
        if (typeof updateTranslations === 'function') {
            updateTranslations();
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