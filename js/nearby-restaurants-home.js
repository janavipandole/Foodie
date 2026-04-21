(function () {
    const section = document.querySelector('.nearby-live-section');
    if (!section) return;

    const mapElement = document.getElementById('nearbyRestaurantsMap');
    const listElement = document.getElementById('nearbyRestaurantsList');
    const statusElement = document.getElementById('nearbyStatus');
    const retryButton = document.getElementById('retryNearbySearch');

    if (!mapElement || !listElement || !statusElement || !retryButton) return;

    const DEFAULT_LOCATION = { lat: 28.6139, lng: 77.2090 };
    const SEARCH_RADIUS_METERS = 4000;
    const MAX_RESULTS = 8;

    let map = null;
    let placesService = null;
    let infoWindow = null;
    let userMarker = null;
    let placeMarkers = [];
    let mapsScriptPromise = null;

    const setStatus = (message, tone) => {
        statusElement.textContent = message;
        statusElement.classList.remove('status-info', 'status-success', 'status-warning', 'status-error');
        statusElement.classList.add(`status-${tone || 'info'}`);
    };

    const getMapsApiKey = () => {
        const configKey = typeof window.FOODIE_CONFIG?.googleMapsApiKey === 'string'
            ? window.FOODIE_CONFIG.googleMapsApiKey.trim()
            : '';
        const storageKey = (localStorage.getItem('foodie_google_maps_api_key') || '').trim();
        const resolvedKey = configKey || storageKey;

        if (!resolvedKey || resolvedKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
            return '';
        }
        return resolvedKey;
    };

    const loadGoogleMapsSdk = (apiKey) => {
        if (window.google && window.google.maps && window.google.maps.places) {
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
    };

    const requestUserLocation = () => new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
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

    const escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const getLatLng = (location) => ({
        lat: typeof location.lat === 'function' ? location.lat() : location.lat,
        lng: typeof location.lng === 'function' ? location.lng() : location.lng
    });

    const toRadians = (value) => (value * Math.PI) / 180;

    const getDistanceInKm = (origin, destination) => {
        const earthRadiusKm = 6371;
        const dLat = toRadians(destination.lat - origin.lat);
        const dLng = toRadians(destination.lng - origin.lng);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(toRadians(origin.lat)) * Math.cos(toRadians(destination.lat))
            * Math.sin(dLng / 2) * Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusKm * c;
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating - fullStars >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        const full = '<i class="fa-solid fa-star"></i>'.repeat(fullStars);
        const half = hasHalfStar ? '<i class="fa-solid fa-star-half-stroke"></i>' : '';
        const empty = '<i class="fa-regular fa-star is-empty"></i>'.repeat(emptyStars);

        return `${full}${half}${empty}`;
    };

    const clearPlaceMarkers = () => {
        placeMarkers.forEach((marker) => marker.setMap(null));
        placeMarkers = [];
    };

    const renderRestaurantList = (restaurants, userLocation) => {
        if (!restaurants.length) {
            listElement.innerHTML = '<li class="nearby-live-empty">No nearby restaurants with ratings were found in this area.</li>';
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

            let availabilityText = 'Hours unavailable';
            let availabilityClass = 'unknown';

            if (openNow === true) {
                availabilityText = 'Open now';
                availabilityClass = 'open';
            } else if (openNow === false) {
                availabilityText = 'Closed';
                availabilityClass = 'closed';
            }

            const address = place.vicinity || place.formatted_address || 'Address unavailable';

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
    };

    const addRestaurantMarker = (place, index) => {
        const marker = new google.maps.Marker({
            map,
            position: place.geometry.location,
            title: place.name,
            label: `${index + 1}`
        });

        marker.addListener('click', () => {
            const rating = typeof place.rating === 'number' ? place.rating.toFixed(1) : 'N/A';
            const address = place.vicinity || place.formatted_address || 'Address unavailable';

            infoWindow.setContent(`
                <div class="nearby-map-info">
                    <h4>${escapeHtml(place.name || 'Restaurant')}</h4>
                    <p>Rating: ${rating}</p>
                    <p>${escapeHtml(address)}</p>
                </div>
            `);
            infoWindow.open({ map, anchor: marker });
        });

        placeMarkers.push(marker);
    };

    const renderMapView = (restaurants, userLocation) => {
        clearPlaceMarkers();

        if (userMarker) {
            userMarker.setMap(null);
        }

        userMarker = new google.maps.Marker({
            map,
            position: userLocation,
            title: 'You are here',
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
    };

    const pickTopRatedRestaurants = (results) => (results || [])
        .filter((place) => place && place.geometry && place.geometry.location && typeof place.rating === 'number')
        .sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating;
            return (b.user_ratings_total || 0) - (a.user_ratings_total || 0);
        })
        .slice(0, MAX_RESULTS);

    const fetchNearbyRestaurants = (location) => {
        const request = {
            location,
            radius: SEARCH_RADIUS_METERS,
            type: ['restaurant']
        };

        return new Promise((resolve, reject) => {
            placesService.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK
                    || status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    resolve(pickTopRatedRestaurants(results));
                    return;
                }

                reject(new Error(`Places search failed with status: ${status}`));
            });
        });
    };

    const ensureMap = (location) => {
        if (!map) {
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

        map.setCenter(location);
    };

    const runNearbySearch = async () => {
        retryButton.disabled = true;
        retryButton.textContent = 'Loading...';

        try {
            const apiKey = getMapsApiKey();
            if (!apiKey) {
                listElement.innerHTML = '<li class="nearby-live-empty">Google Maps API key is missing. Add your key to load nearby restaurants.</li>';
                setStatus('Add FOODIE_CONFIG.googleMapsApiKey or set localStorage key foodie_google_maps_api_key.', 'error');
                return;
            }

            await loadGoogleMapsSdk(apiKey);

            let activeLocation = DEFAULT_LOCATION;
            try {
                setStatus('Requesting your location permission...', 'info');
                activeLocation = await requestUserLocation();
                setStatus('Location found. Fetching top rated nearby restaurants...', 'info');
            } catch (geoError) {
                setStatus('Location access unavailable. Showing top restaurants near default location.', 'warning');
            }

            ensureMap(activeLocation);
            const restaurants = await fetchNearbyRestaurants(activeLocation);

            renderMapView(restaurants, activeLocation);
            renderRestaurantList(restaurants, activeLocation);

            if (restaurants.length > 0) {
                setStatus(`Showing ${restaurants.length} top rated restaurants near you.`, 'success');
            } else {
                setStatus('No rated restaurants found in this area. Try retrying from a different location.', 'warning');
            }
        } catch (error) {
            console.error('Nearby restaurants load error:', error);
            listElement.innerHTML = '<li class="nearby-live-empty">Unable to load nearby restaurants right now. Please verify API key and internet connection.</li>';
            setStatus('Google Maps request failed. Verify API key permissions for Maps JavaScript API and Places API.', 'error');
        } finally {
            retryButton.disabled = false;
            retryButton.textContent = 'Retry Location';
        }
    };

    retryButton.addEventListener('click', runNearbySearch);
    runNearbySearch();
})();