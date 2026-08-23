/**
 * Real-Time HTML5 Geolocation Engine & Interactive Distance Calculation
 * Uses Haversine Formula for distance calculation & OpenStreetMap integration.
 */

class FoodieGeolocationEngine {
  constructor() {
    this.userCoords = null;
    this.defaultStoreCoords = { lat: 19.0760, lng: 72.8777 }; // Mumbai default
  }

  /**
   * Request user GPS position
   */
  async getUserPosition() {
    if (!('geolocation' in navigator)) {
      throw new Error('Geolocation is not supported by your browser.');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          resolve(this.userCoords);
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    });
  }

  /**
   * Haversine Formula: Calculates distance in kilometers between two GPS points
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Estimates delivery time in minutes based on distance
   */
  estimateDeliveryTime(distanceKm) {
    const basePrepTime = 15; // 15 mins prep
    const speedKmPerHour = 25; // Average delivery bike speed
    const travelTime = (distanceKm / speedKmPerHour) * 60;
    return Math.ceil(basePrepTime + travelTime);
  }

  /**
   * Embed OpenStreetMap preview container
   */
  renderMapEmbed(containerId, targetLat, targetLng) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${targetLng - 0.01}%2C${targetLat - 0.01}%2C${targetLng + 0.01}%2C${targetLat + 0.01}&amp;layer=mapnik&amp;marker=${targetLat}%2C${targetLng}`;

    container.innerHTML = `
      <iframe 
        width="100%" 
        height="250" 
        frameborder="0" 
        scrolling="no" 
        marginheight="0" 
        marginwidth="0" 
        src="${mapUrl}" 
        style="border: 1px solid #ccc; border-radius: 12px;">
      </iframe>
    `;
  }
}

// Global Geolocation Engine Instance
window.foodieGeo = new FoodieGeolocationEngine();
