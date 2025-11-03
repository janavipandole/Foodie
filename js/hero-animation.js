
// This file handles dynamic animations for the "Foodie" hero section

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroAnimations);
  } else {
    initHeroAnimations();
  }

  function initHeroAnimations() {
    const heroSection = document.querySelector('.hero-section');
    const foodIcon = document.getElementById('foodIcon');
    
    if (!heroSection || !foodIcon) return;

    // Array of food emojis to cycle through
    const foodEmojis = ['🍕', '🍔', '🍟', '🌮', '🍜', '🍣', '🥗', '🍰', '🍩', '🍪'];
    let currentEmojiIndex = 0;

    // Array of background gradient colors
    const backgroundGradients = [
      'linear-gradient(135deg, #f2bd12 0%, #e89800 100%)', // Original yellow-orange
      'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)', // Red-pink
      'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)', // Teal-green
      'linear-gradient(135deg, #a8e6cf 0%, #88d8a3 100%)', // Light green
      'linear-gradient(135deg, #ffd93d 0%, #f6c23e 100%)', // Golden yellow
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Pink
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', // Purple-pink
    ];

    let currentBgIndex = 0;
    let isTransitioning = false;

    // Change food icon every 3 seconds
    function changeFoodIcon() {
      currentEmojiIndex = (currentEmojiIndex + 1) % foodEmojis.length;
      
      // Add fade-out effect
      foodIcon.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      foodIcon.style.opacity = '0';
      foodIcon.style.transform = 'scale(0.8) rotate(-10deg)';
      
      setTimeout(() => {
        foodIcon.textContent = foodEmojis[currentEmojiIndex];
        foodIcon.style.opacity = '1';
        foodIcon.style.transform = 'scale(1) rotate(0deg)';
        
        // Add a bounce effect
        setTimeout(() => {
          foodIcon.style.transform = 'scale(1.1)';
          setTimeout(() => {
            foodIcon.style.transform = 'scale(1)';
          }, 150);
        }, 50);
      }, 300);
    }

    // Change background gradient smoothly every 8 seconds
    function changeBackgroundGradient() {
      if (isTransitioning) return;
      
      isTransitioning = true;
      currentBgIndex = (currentBgIndex + 1) % backgroundGradients.length;
      
      heroSection.style.background = backgroundGradients[currentBgIndex];
      
      // Reset transition flag after animation completes
      setTimeout(() => {
        isTransitioning = false;
      }, 8000);
    }

    // Update floating food icons dynamically
    function updateFloatingIcons() {
      const floatingIcons = document.querySelectorAll('.floating-food-icon');
      const iconOptions = ['🍕', '🍔', '🍟', '🌮', '🍜', '🍣', '🥗', '🍰', '🍩', '🍪', '🥤', '🍦'];
      
      floatingIcons.forEach((icon, index) => {
        // Change icon every 5-7 seconds with slight randomization
        setTimeout(() => {
          const randomIcon = iconOptions[Math.floor(Math.random() * iconOptions.length)];
          
          // Fade transition
          icon.style.transition = 'opacity 0.5s ease';
          icon.style.opacity = '0';
          
          setTimeout(() => {
            icon.textContent = randomIcon;
            icon.style.opacity = '0.6';
          }, 500);
          
          // Repeat for each icon at different intervals
          setInterval(() => {
            const newIcon = iconOptions[Math.floor(Math.random() * iconOptions.length)];
            icon.style.transition = 'opacity 0.5s ease';
            icon.style.opacity = '0';
            
            setTimeout(() => {
              icon.textContent = newIcon;
              icon.style.opacity = '0.6';
            }, 500);
          }, 6000 + (index * 1000)); // Stagger the intervals
        }, index * 500);
      });
    }

    // Add interactive hover effects
    function addInteractiveEffects() {
      // Logo hover effect - add sparkle
      const logo = document.querySelector('.logo');
      if (logo) {
        logo.addEventListener('mouseenter', () => {
          logo.style.filter = 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))';
        });
        
        logo.addEventListener('mouseleave', () => {
          logo.style.filter = 'none';
        });
      }

      // Food icon click effect - change immediately
      foodIcon.addEventListener('click', () => {
        changeFoodIcon();
      });

      // Add subtle mouse parallax effect
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
        
        foodIcon.style.transform = `translate(${x}px, ${y}px) rotate(${x * 0.5}deg)`;
      });

      heroSection.addEventListener('mouseleave', () => {
        foodIcon.style.transform = '';
      });
    }

    // Initialize all animations
    function startAnimations() {
      // Start food icon rotation
      setInterval(changeFoodIcon, 3000);
      
      // Start background gradient rotation
      setInterval(changeBackgroundGradient, 8000);
      
      // Update floating icons
      updateFloatingIcons();
      
      // Add interactive effects
      addInteractiveEffects();
    }

    // Performance optimization: Use requestAnimationFrame for smooth transitions
    function optimizePerformance() {
      // Use CSS will-change hint (already in CSS)
      // Throttle animations if needed
      let lastTime = 0;
      const throttle = (func, limit) => {
        return function() {
          const now = Date.now();
          if (now - lastTime >= limit) {
            lastTime = now;
            func.apply(this, arguments);
          }
        };
      };

      // Apply throttling to mousemove events
      const originalMouseMove = heroSection.onmousemove;
      if (originalMouseMove) {
        heroSection.addEventListener('mousemove', throttle(addInteractiveEffects, 16));
      }
    }

    // Start animations after a small delay to ensure DOM is ready
    setTimeout(() => {
      startAnimations();
      optimizePerformance();
    }, 500);

    // Handle visibility change (pause animations when tab is not visible)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pause heavy animations
        heroSection.style.animationPlayState = 'paused';
      } else {
        // Resume animations
        heroSection.style.animationPlayState = 'running';
      }
    });
  }
})();

