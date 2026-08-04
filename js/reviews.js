/**
 * Reviews Module
 * Manages sample review datasets, star rating generation, and dynamic Swiper review slide rendering.
 */

export const reviewsData = [
    {
        name: "Deepak Kumar",
        image: "../imgs/profile1.jpeg",
        rating: 4,
        review: "Foodie is the best! Besides the many delicious meals, the service is excellent—especially the fast delivery. I highly recommend Foodie to you."
    },
    {
        name: "Priya Roy",
        image: "../imgs/profile2.jpeg",
        rating: 5,
        review: "Fresh ingredients, a creative menu, and warm service make this spot a hidden gem. Perfect from casual dinners or special nights out. Truly a foodie's paradise!"
    },
    {
        name: "Anjali Joshi",
        image: "../imgs/profile3.jpeg",
        rating: 5,
        review: "Had an amazing time here! The food was bursting with flavor, the ambiance was warm and inviting, and the staff made us feel truly welcome. Every dish was a delight—definitely a spot I'll be coming back to."
    }
];

/**
 * Generates HTML string representing star ratings.
 * @param {number} rating - Rating count (0-5)
 * @returns {string} HTML string of star icons
 */
export function generateStars(rating) {
    let stars = '';
    const validRating = Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : 0;
    for (let i = 0; i < 5; i++) {
        if (i < validRating) {
            stars += '<i class="fa-solid fa-star highlighted-star"></i>';
        } else {
            stars += '<i class="fa-solid fa-star"></i>';
        }
    }
    return stars;
}

/**
 * Loads reviews dynamically into the Swiper container.
 */
export function loadReviews() {
    if (typeof document === 'undefined') return;
    const reviewsContainer = document.getElementById('dynamic-reviews');
    if (!reviewsContainer) return;

    reviewsContainer.innerHTML = '';
    reviewsData.forEach(review => {
        const reviewSlide = document.createElement('div');
        reviewSlide.className = 'swiper-slide';
        reviewSlide.innerHTML = `
            <div class="flex gap-3 mt-4">
                <div class="profile">
                    <img src="${review.image || ''}" alt="${review.name || 'User'}">
                </div>
                <div class="">
                    <h4>${review.name || 'Anonymous'}</h4>
                    <div class="star mt-half">
                        ${generateStars(review.rating)}
                    </div>
                </div>
            </div>
            <p class="para">${review.review || ''}</p>
        `;
        reviewsContainer.appendChild(reviewSlide);
    });
}

// ===== DOM INITIALIZATION =====
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', loadReviews);
}

// Global window bindings for legacy script execution
if (typeof window !== 'undefined') {
    window.reviewsData = reviewsData;
    window.generateStars = generateStars;
    window.loadReviews = loadReviews;
    window.reviewsModule = {
        reviewsData,
        generateStars,
        loadReviews
    };
}
