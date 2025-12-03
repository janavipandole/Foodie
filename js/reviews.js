// Sample reviews data
const reviewsData = [
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

// Function to generate star rating HTML
function generateStars(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < rating) {
            stars += '<i class="fa-solid fa-star highlighted-star"></i>';
        } else {
            stars += '<i class="fa-solid fa-star"></i>';
        }
    }
    return stars;
}

// Function to load reviews dynamically
function loadReviews() {
    const reviewsContainer = document.getElementById('dynamic-reviews');
    if (!reviewsContainer) return;

    reviewsData.forEach(review => {
        const reviewSlide = document.createElement('div');
        reviewSlide.className = 'swiper-slide';
        reviewSlide.innerHTML = `
            <div class="flex gap-3 mt-4">
                <div class="profile">
                    <img src="${review.image}" alt="${review.name}">
                </div>
                <div class="">
                    <h4>${review.name}</h4>
                    <div class="star mt-half">
                        ${generateStars(review.rating)}
                    </div>
                </div>
            </div>
            <p class="para">${review.review}</p>
        `;
        reviewsContainer.appendChild(reviewSlide);
    });
}

// Initialize reviews when DOM is loaded
document.addEventListener('DOMContentLoaded', loadReviews);
