// Google Maps Places API Integration for Top-Rated Restaurants

const SEARCH_RADIUS = 5000; // 5km in meters
const MIN_RATING = 4.0; // Minimum rating to display

// DOM Elements
const loadingContainer = document.getElementById('loadingContainer');
const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');
const viewToggleContainer = document.getElementById('viewToggleContainer');
const mapContainer = document.getElementById('mapContainer');
const listContainer = document.getElementById('listContainer');
const restaurantsList = document.getElementById('restaurantsList');

const mapViewBtn = document.getElementById('mapViewBtn');
const listViewBtn = document.getElementById('listViewBtn');

// State
let map = null;
let service = null;
let userLocation = null;
let restaurants = [];
let markers = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
});

function initializeApp() {
  // Show loading state
  loadingContainer.style.display = 'flex';
  errorContainer.style.display = 'none';
  viewToggleContainer.style.display = 'none';
  mapContainer.style.display = 'none';
  listContainer.style.display = 'none';

  // Get user geolocation
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        initializeMap();
        fetchNearbyRestaurants();
      },
      (error) => {
        handleGeolocationError(error);
      }
    );
  } else {
    showError('Geolocation is not supported by your browser.');
  }
}

function initializeMap() {
  // Initialize the map
  map = new google.maps.Map(mapContainer, {
    center: userLocation,
    zoom: 15,
    mapTypeControl: true,
    fullscreenControl: true,
    zoomControl: true,
  });

  // Add user location marker
  new google.maps.Marker({
    position: userLocation,
    map: map,
    title: 'Your Location',
    icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
  });

  // Initialize Places Service
  service = new google.maps.places.PlacesService(map);
}

function fetchNearbyRestaurants() {
  const request = {
    location: new google.maps.LatLng(userLocation.lat, userLocation.lng),
    radius: SEARCH_RADIUS,
    type: 'restaurant',
    rankBy: google.maps.places.RankBy.PROMINENCE
  };

  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // Filter results by rating
      restaurants = results
        .filter(place => place.rating && place.rating >= MIN_RATING)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 20); // Get top 20 restaurants

      if (restaurants.length > 0) {
        displayRestaurants();
      } else {
        showError('No highly-rated restaurants found in your area.');
      }
    } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
      showError('No restaurants found in your area.');
    } else {
      showError('Error fetching restaurants. Please try again.');
      console.error('Places Service error:', status);
    }
  });
}

function displayRestaurants() {
  loadingContainer.style.display = 'none';
  viewToggleContainer.style.display = 'flex';
  mapContainer.style.display = 'block';
  listContainer.style.display = 'block';
  listContainer.classList.add('active-view');
  errorContainer.style.display = 'none';

  // Display on map
  displayOnMap();

  // Display as list
  displayAsList();
}

function displayOnMap() {
  // Clear existing markers
  markers.forEach(marker => marker.setMap(null));
  markers = [];

  const bounds = new google.maps.LatLngBounds();

  restaurants.forEach((place, index) => {
    const marker = new google.maps.Marker({
      position: place.geometry.location,
      map: map,
      title: place.name,
      label: {
        text: (index + 1).toString(),
        color: '#fff',
        fontSize: '12px'
      },
      icon: createCustomIcon(place.rating)
    });

    // Add info window
    const infoWindow = new google.maps.InfoWindow({
      content: createInfoWindowContent(place)
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    markers.push(marker);
    bounds.extend(place.geometry.location);
  });

  // Fit map to all markers
  map.fitBounds(bounds);
  map.setCenter(userLocation); // Center on user location
}

function displayAsList() {
  restaurantsList.innerHTML = '';

  restaurants.forEach((place, index) => {
    const card = createRestaurantCard(place, index + 1);
    restaurantsList.appendChild(card);
  });
}

function createRestaurantCard(place, index) {
  const card = document.createElement('div');
  card.className = 'restaurant-card';
  card.title = 'Click to view on map';

  const rating = place.rating ? place.rating.toFixed(1) : 'N/A';
  const ratingCount = place.user_ratings_total || 0;
  const ratingStars = place.rating ? generateStars(place.rating) : 'N/A';

  card.innerHTML = `
    <div class="restaurant-header">
      <div class="restaurant-name">#${index} ${place.name}</div>
      <div class="restaurant-address">${place.vicinity || 'Address not available'}</div>
      <div class="restaurant-rating">
        <span class="rating-stars">${ratingStars}</span>
        <span class="rating-value">${rating}</span>
        <span class="rating-count">(${ratingCount} reviews)</span>
      </div>
    </div>
    <div class="restaurant-body">
      <div class="restaurant-details">
        <div class="detail-item">
          <i class="fa-solid fa-check"></i>
          <span><span class="detail-label">Status:</span> ${place.opening_hours?.open_now ? '✓ Open Now' : '✗ Closed'}</span>
        </div>
        <div class="detail-item">
          <i class="fa-solid fa-location-dot"></i>
          <span><span class="detail-label">Distance:</span> ${calculateDistance(userLocation, place.geometry.location).toFixed(1)} km</span>
        </div>
      </div>
    </div>
  `;

  // Click to show on map
  card.addEventListener('click', () => {
    // Find and click the corresponding marker
    const markerIndex = restaurants.indexOf(place);
    if (markerIndex >= 0 && markers[markerIndex]) {
      map.panTo(markers[markerIndex].getPosition());
      map.setZoom(17);
      markers[markerIndex].click();
    }

    // Switch to map view
    switchView('map');
  });

  return card;
}

function createInfoWindowContent(place) {
  const rating = place.rating ? place.rating.toFixed(1) : 'N/A';
  const ratingStars = place.rating ? generateStars(place.rating) : 'N/A';

  return `
    <div style="
      max-width: 250px;
      padding: 10px;
      font-family: 'Roboto Condensed', sans-serif;
    ">
      <h3 style="
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 700;
        color: #212121;
      ">${place.name}</h3>
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 14px;
      ">
        <span style="color: #F2BD12;">${ratingStars}</span>
        <span style="font-weight: 600;">${rating}</span>
        <span style="color: #666666;">(${place.user_ratings_total || 0})</span>
      </div>
      <p style="
        margin: 0 0 8px 0;
        font-size: 13px;
        color: #666666;
        line-height: 1.4;
      ">${place.vicinity || 'Address not available'}</p>
      <div style="
        display: flex;
        gap: 8px;
        margin-top: 8px;
      ">
        <span style="
          display: inline-block;
          padding: 4px 8px;
          background-color: #FCF1CC;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          color: #212121;
        ">
          ${place.opening_hours?.open_now ? '✓ Open' : '✗ Closed'}
        </span>
      </div>
    </div>
  `;
}

function createCustomIcon(rating) {
  let color = '#666'; // Default gray

  if (rating >= 4.8) {
    color = '#FFD700'; // Gold for excellent
  } else if (rating >= 4.5) {
    color = '#F2BD12'; // Golden for very good
  } else if (rating >= 4.0) {
    color = '#FF9800'; // Orange for good
  }

  return `
    http://maps.google.com/mapfiles/ms/icons/${color}-dot.png
  `;
}

function generateStars(rating) {
  const stars = Math.round(rating);
  return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}

function calculateDistance(location1, location2) {
  // Haversine formula for distance between two coordinates
  const R = 6371; // Earth's radius in km
  const dLat = (location2.lat() - location1.lat) * Math.PI / 180;
  const dLng = (location2.lng() - location1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(location1.lat * Math.PI / 180) * Math.cos(location2.lat() * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function setupEventListeners() {
  retryBtn.addEventListener('click', initializeApp);

  mapViewBtn.addEventListener('click', () => switchView('map'));
  listViewBtn.addEventListener('click', () => switchView('list'));
}

function switchView(view) {
  if (view === 'map') {
    mapContainer.classList.add('active-view');
    listContainer.classList.remove('active-view');
    mapViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
  } else {
    mapContainer.classList.remove('active-view');
    listContainer.classList.add('active-view');
    mapViewBtn.classList.remove('active');
    listViewBtn.classList.add('active');
  }
}

function showError(message) {
  loadingContainer.style.display = 'none';
  errorContainer.style.display = 'flex';
  viewToggleContainer.style.display = 'none';
  mapContainer.style.display = 'none';
  listContainer.style.display = 'none';
  errorMessage.textContent = message;
}

function handleGeolocationError(error) {
  let message = 'Unable to get your location. ';

  switch (error.code) {
    case error.PERMISSION_DENIED:
      message += 'Permission denied. Please enable geolocation in your browser settings.';
      break;
    case error.POSITION_UNAVAILABLE:
      message += 'Location information is unavailable.';
      break;
    case error.TIMEOUT:
      message += 'The request to get user location timed out.';
      break;
    default:
      message += 'An unknown error occurred.';
  }

  showError(message);
}
