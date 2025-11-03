// FAQ Accordion Functionality
// Handles accordion open/close interactions

(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFAQ);
    } else {
        initFAQ();
    }

    function initFAQ() {
        const accordionHeaders = document.querySelectorAll('.accordion-header');
        
        if (accordionHeaders.length === 0) return;

        // Initialize all accordions as closed
        accordionHeaders.forEach(header => {
            header.setAttribute('aria-expanded', 'false');
            
            // Add click event listener
            header.addEventListener('click', function() {
                toggleAccordion(this);
            });

            // Add keyboard support
            header.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleAccordion(this);
                }
            });
        });
    }

    function toggleAccordion(header) {
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        const accordionItem = header.closest('.accordion-item');
        const accordionContent = header.nextElementSibling;

        if (!accordionContent || !accordionItem) return;

        // Close all other accordions in the same category (optional - remove if you want multiple open)
        // const parentCategory = header.closest('.faq-category');
        // if (parentCategory) {
        //     const otherHeaders = parentCategory.querySelectorAll('.accordion-header');
        //     otherHeaders.forEach(otherHeader => {
        //         if (otherHeader !== header && otherHeader.getAttribute('aria-expanded') === 'true') {
        //             closeAccordion(otherHeader);
        //         }
        //     });
        // }

        if (isExpanded) {
            closeAccordion(header);
        } else {
            openAccordion(header);
        }
    }

    function openAccordion(header) {
        const accordionItem = header.closest('.accordion-item');
        const accordionContent = header.nextElementSibling;
        
        if (!accordionContent || !accordionItem) return;

        // Set aria-expanded
        header.setAttribute('aria-expanded', 'true');
        
        // Add active class for animations
        accordionItem.classList.add('active');
        
        // Calculate content height
        const body = accordionContent.querySelector('.accordion-body');
        if (body) {
            const height = body.scrollHeight;
            accordionContent.style.maxHeight = height + 'px';
        } else {
            accordionContent.style.maxHeight = '500px';
        }
    }

    function closeAccordion(header) {
        const accordionItem = header.closest('.accordion-item');
        const accordionContent = header.nextElementSibling;
        
        if (!accordionContent || !accordionItem) return;

        // Set aria-expanded
        header.setAttribute('aria-expanded', 'false');
        
        // Remove active class
        accordionItem.classList.remove('active');
        
        // Close content
        accordionContent.style.maxHeight = '0';
    }

})();

