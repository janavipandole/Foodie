/**
 * Nearby Restaurants Home Module
 * Handles geolocation requests, distance calculations, top-rated sorting, and restaurant card rendering.
 */

const DEFAULT_LOCATION = { lat: 28.6139, lng: 77.2090 };
const SEARCH_RADIUS_METERS = 4000;
const MAX_RESULTS = 8;

let map = null;
let placesService = null;
let infoWindow = null;
let userMarker = null;
let placeMarkers = [];
let mapsScriptPromise = null;

export function setStatus(message, tone) {
    if (typeof document === 'undefined') return;
    const statusElement = document.getElementById('nearbyStatus');
    if (!statusElement) return;
    statusElement.textContent = message;
    statusElement.classList.remove('status-info', 'status-success', 'status-warning', 'status-error');
    statusElement.classList.add(`status-${tone || 'info'}`);
}

export function getMapsApiKey() {
    const configKey = typeof window !== 'undefined' && typeof window.FOODIE_CONFIG?.googleMapsApiKey === 'string'
        ? window.FOODIE_CONFIG.googleMapsApiKey.trim()
        : '';
    const storageKey = typeof localStorage !== 'undefined' ? (localStorage.getItem('foodie_google_maps_api_key') || '').trim() : '';
    const resolvedKey = configKey || storageKey;

    if (!resolvedKey || resolvedKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
        return '';
    }
    return resolvedKey;
}

export function loadGoogleMapsSdk(apiKey) {
    if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
        return Promise.resolve();
    }

    if (mapsScriptPromise) {
        return mapsScriptPromise;
    }

    mapsScriptPromise = new Promise((resolve, reject) => {
        const callbackName = 'foodieGoogleMapsLoaded';
        window[callbackName] = () => {
            delete window[callbackName];
            resolve();
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&callback=${callbackName}`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
            delete window[callbackName];
            mapsScriptPromise = null;
            reject(new Error('Failed to load Google Maps JavaScript API.'));
        };

        document.head.appendChild(script);
    });

    return mapsScriptPromise;
}

export function requestUserLocation() {
    return new Promise((resolve, reject) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => reject(error),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

export function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function getLatLng(location) {
    return {
        lat: typeof location.lat === 'function' ? location.lat() : location.lat,
        lng: typeof location.lng === 'function' ? location.lng() : location.lng
    };
}

export function toRadians(value) {
    return (value * Math.PI) / 180;
}

/**
 * Calculates the distance in kilometers between two geographic coordinates using the Haversine formula.
 * @param {Object} origin - Origin coordinates {lat, lng}
 * @param {Object} destination - Destination coordinates {lat, lng}
 * @returns {number} Distance in kilometers
 */
export function getDistanceInKm(origin, destination) {
    const earthRadiusKm = 6371;
    const dLat = toRadians(destination.lat - origin.lat);
    const dLng = toRadians(destination.lng - origin.lng);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
        + Math.cos(toRadians(origin.lat)) * Math.cos(toRadians(destination.lat))
        * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
}

/**
 * Renders HTML star rating representations based on a numeric rating value.
 * @param {number} rating - Numeric rating
 * @returns {string} HTML string representing stars
 */
export function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const full = '<i class="fa-solid fa-star"></i>'.repeat(fullStars);
    const half = hasHalfStar ? '<i class="fa-solid fa-star-half-stroke"></i>' : '';
    const empty = '<i class="fa-regular fa-star is-empty"></i>'.repeat(emptyStars);

    return `${full}${half}${empty}`;
}

export function clearPlaceMarkers() {
    placeMarkers.forEach((marker) => marker.setMap(null));
    placeMarkers = [];
}

export function renderRestaurantList(restaurants, userLocation) {
    if (typeof document === 'undefined') return;
    const listElement = document.getElementById('nearbyRestaurantsList');
    if (!listElement) return;

    if (!restaurants.length) {
        listElement.innerHTML = `<li class="nearby-live-empty">${typeof t === 'function' ? t('nearby.noRatings', 'No nearby restaurants with ratings were found in this area.') : 'No nearby restaurants with ratings were found in this area.'}</li>`;
        return;
    }

    listElement.innerHTML = restaurants.map((place, index) => {
        const rating = typeof place.rating === 'number' ? place.rating.toFixed(1) : 'N/A';
        const totalReviews = Number.isFinite(place.user_ratings_total) ? place.user_ratings_total : 0;
        const placeLocation = getLatLng(place.geometry.location);
        const distanceKm = getDistanceInKm(userLocation, placeLocation).toFixed(1);

        const openNow = place.opening_hours && typeof place.opening_hours.open_now === 'boolean'
            ? place.opening_hours.open_now
            : null;

        let availabilityText = typeof t === 'function' ? t('nearby.hoursUnavailable', 'Hours unavailable') : 'Hours unavailable';
        let availabilityClass = 'unknown';

        if (openNow === true) {
            availabilityText = typeof t === 'function' ? t('nearby.openNow', 'Open now') : 'Open now';
            availabilityClass = 'open';
        } else if (openNow === false) {
            availabilityText = typeof t === 'function' ? t('nearby.closed', 'Closed') : 'Closed';
            availabilityClass = 'closed';
        }

        const address = place.vicinity || place.formatted_address || (typeof t === 'function' ? t('nearby.addressUnavailable', 'Address unavailable') : 'Address unavailable');

        return `
            <li class="nearby-live-item">
                <div class="nearby-live-item-head">
                    <h4>${index + 1}. ${escapeHtml(place.name || 'Restaurant')}</h4>
                    <div class="nearby-live-rating">
                        <span class="nearby-live-stars" aria-hidden="true">${renderStars(Number(rating) || 0)}</span>
                        <span>${rating}</span>
                    </div>
                </div>

                <p class="nearby-live-address"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(address)}</p>

                <div class="nearby-live-meta">
                    <span><i class="fa-solid fa-route"></i> ${distanceKm} km</span>
                    <span class="nearby-live-${availabilityClass}">${availabilityText}</span>
                    <span><i class="fa-solid fa-users"></i> ${totalReviews} reviews</span>
                </div>
            </li>
        `;
    }).join('');
}

export function addRestaurantMarker(place, index) {
    if (typeof google === 'undefined' || !google.maps) return;
    const marker = new google.maps.Marker({
        map,
        position: place.geometry.location,
        title: place.name || (typeof t === 'function' ? t('nearby.restaurant', 'Restaurant') : 'Restaurant'),
    });
    marker.addListener('click', () => {
        const rating = typeof place.rating === 'number' ? place.rating.toFixed(1) : 'N/A';
        const address = place.vicinity || place.formatted_address || 'Address unavailable';

        infoWindow.setContent(`
            <div class="nearby-map-info">
                <h4>${escapeHtml(place.name || (typeof t === 'function' ? t('nearby.restaurant', 'Restaurant') : 'Restaurant'))}</h4>
                <p>${typeof t === 'function' ? t('nearby.ratingLabel', 'Rating') : 'Rating'}: ${rating}</p>
                <p>${escapeHtml(address)}</p>
            </div>
        `);
        infoWindow.open({ map, anchor: marker });
    });

    placeMarkers.push(marker);
}

export function renderMapView(restaurants, userLocation) {
    if (typeof google === 'undefined' || !google.maps) return;
    clearPlaceMarkers();

    if (userMarker) {
        userMarker.setMap(null);
    }

    userMarker = new google.maps.Marker({
        map,
        position: userLocation,
        title: typeof t === 'function' ? t('nearby.youAreHere', 'You are here') : 'You are here',
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#1f6feb',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
        }
    });

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(userLocation);

    restaurants.forEach((place, index) => {
        addRestaurantMarker(place, index);
        bounds.extend(place.geometry.location);
    });

    if (restaurants.length > 0) {
        map.fitBounds(bounds, 80);
    } else {
        map.setCenter(userLocation);
        map.setZoom(14);
    }
}

/**
 * Selects and sorts the top-rated restaurants from a given results array.
 * @param {Array} results - Array of place results
 * @returns {Array} Sorted top-rated restaurants
 */
export function pickTopRatedRestaurants(results) {
    return (results || [])
        .filter((place) => place && place.geometry && place.geometry.location && typeof place.rating === 'number')
        .sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating;
            return (b.user_ratings_total || 0) - (a.user_ratings_total || 0);
        })
        .slice(0, MAX_RESULTS);
}

export function fetchNearbyRestaurants(location) {
    const request = {
        location,
        radius: SEARCH_RADIUS_METERS,
        type: ['restaurant']
    };

    return new Promise((resolve, reject) => {
        if (!placesService) {
            reject(new Error('PlacesService not initialized.'));
            return;
        }
        placesService.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK
                || status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                resolve(pickTopRatedRestaurants(results));
                return;
            }

            reject(new Error(`Places search failed with status: ${status}`));
        });
    });
}

export function ensureMap(location, mapElement) {
    if (typeof google === 'undefined' || !google.maps) return;
    if (!map && mapElement) {
        map = new google.maps.Map(mapElement, {
            center: location,
            zoom: 14,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        });

        infoWindow = new google.maps.InfoWindow();
        placesService = new google.maps.places.PlacesService(map);
        return;
    }

    if (map) {
        map.setCenter(location);
    }
}

export async function runNearbySearch() {
    if (typeof document === 'undefined') return;
    const retryButton = document.getElementById('retryNearbySearch');
    const mapElement = document.getElementById('nearbyRestaurantsMap');
    const listElement = document.getElementById('nearbyRestaurantsList');

    if (!retryButton || !mapElement || !listElement) return;

    retryButton.disabled = true;
    retryButton.textContent = typeof t === 'function' ? t('nearby.loading', 'Loading...') : 'Loading...';

    try {
        const apiKey = getMapsApiKey();
        if (!apiKey) {
            mapElement.innerHTML = `
                <div class="nearby-fallback-ui">
                    <i class="fa-solid fa-map-location-dot"></i>
                    <p>${typeof t === 'function' ? t('nearby.locationUnavailable', 'Location services are unavailable.') : 'Location services are unavailable.'}</p>
                    <p class="nearby-fallback-hint">${typeof t === 'function' ? t('nearby.locationUnavailableHint', 'Please enable location or try again.') : 'Please enable location or try again.'}</p>
                </div>`;
            listElement.innerHTML = `<li class="nearby-live-empty">${typeof t === 'function' ? t('nearby.noLocation', 'No nearby restaurants found. Try enabling location.') : 'No nearby restaurants found. Try enabling location.'}</li>`;
            setStatus(typeof t === 'function' ? t('nearby.locationUnavailable', 'Location services are unavailable.') : 'Location services are unavailable.', 'warning');
            retryButton.disabled = false;
            retryButton.textContent = typeof t === 'function' ? t('nearby.retryLocation', 'Retry Location') : 'Retry Location';
            return;
        }
        await loadGoogleMapsSdk(apiKey);

        let activeLocation = DEFAULT_LOCATION;
        try {
            setStatus(typeof t === 'function' ? t('nearby.requestingLocation', 'Requesting your location permission...') : 'Requesting your location permission...', 'info');
            activeLocation = await requestUserLocation();
            setStatus(typeof t === 'function' ? t('nearby.locationFound', 'Location found. Fetching top rated nearby restaurants...') : 'Location found. Fetching top rated nearby restaurants...', 'info');
        } catch (geoError) {
            setStatus(typeof t === 'function' ? t('nearby.defaultLocationWarning', 'Location access unavailable. Showing top restaurants near default location.') : 'Location access unavailable. Showing top restaurants near default location.', 'warning');
        }

        ensureMap(activeLocation, mapElement);
        const restaurants = await fetchNearbyRestaurants(activeLocation);

        renderMapView(restaurants, activeLocation);
        renderRestaurantList(restaurants, activeLocation);

        if (restaurants.length > 0) {
            const countMsg = typeof t === 'function' ? t('nearby.showingTop', 'Showing {count} top rated restaurants near you.') : 'Showing {count} top rated restaurants near you.';
            setStatus(countMsg.replace('{count}', restaurants.length), 'success');
        } else {
            setStatus(typeof t === 'function' ? t('nearby.noRated', 'No rated restaurants found in this area. Try retrying from a different location.') : 'No rated restaurants found in this area. Try retrying from a different location.', 'warning');
        }
    } catch (error) {
        console.error('Nearby restaurants load error:', error);
        listElement.innerHTML = `<li class="nearby-live-empty">${typeof t === 'function' ? t('nearby.loadFailed', 'Unable to load nearby restaurants right now. Please verify API key and internet connection.') : 'Unable to load nearby restaurants right now. Please verify API key and internet connection.'}</li>`;
        setStatus(typeof t === 'function' ? t('nearby.apiFailed', 'Google Maps request failed. Verify API key permissions for Maps JavaScript API and Places API.') : 'Google Maps request failed. Verify API key permissions for Maps JavaScript API and Places API.', 'error');
    } finally {
        retryButton.disabled = false;
        retryButton.textContent = typeof t === 'function' ? t('nearby.retryLocation', 'Retry Location') : 'Retry Location';
    }
}

// ===== DOM INITIALIZATION =====
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const section = document.querySelector('.nearby-live-section');
        if (!section) return;

        const mapElement = document.getElementById('nearbyRestaurantsMap');
        const listElement = document.getElementById('nearbyRestaurantsList');
        const statusElement = document.getElementById('nearbyStatus');
        const retryButton = document.getElementById('retryNearbySearch');

        if (!mapElement || !listElement || !statusElement || !retryButton) return;

        retryButton.addEventListener('click', runNearbySearch);
        runNearbySearch();
    });
}

// Global window bindings for legacy script execution
if (typeof window !== 'undefined') {
    window.runNearbySearch = runNearbySearch;
    window.nearbyRestaurantsModule = {
        getDistanceInKm,
        pickTopRatedRestaurants,
        renderStars,
        runNearbySearch,
        fetchNearbyRestaurants
    };
}
