import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

// San Francisco coordinates for demo
const RESTAURANT = [37.7749, -122.4194];
const CUSTOMER = [37.7612, -122.3978];

// Intermediate driver position (arriving)
const DRIVER_START = [37.7690, -122.4050];

export default function MapView({ driverPos }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  
  const currentDriverPos = driverPos || DRIVER_START;

  useEffect(() => {
    if (mapInstanceRef.current) return;

    // Dynamically import leaflet to avoid SSR issues
    import('leaflet').then(L => {
      // Fix default icon
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center: [37.765, -122.41],
        zoom: 13,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Dashed red route
      L.polyline([RESTAURANT, currentDriverPos, CUSTOMER], {
        color: '#C0392B',
        weight: 3,
        dashArray: '10, 8',
        opacity: 0.85,
      }).addTo(map);

      // Restaurant marker
      const restIcon = L.divIcon({
        className: '',
        html: `<div style="background:#1A6B4A;color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 3px 10px rgba(0,0,0,0.3);border:3px solid #fff">🍔</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      L.marker(RESTAURANT, { icon: restIcon }).addTo(map)
        .bindPopup('<b>Burger Palace</b><br>Your order is here');

      // Customer marker
      const custIcon = L.divIcon({
        className: '',
        html: `<div style="background:#3B82F6;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 3px 10px rgba(0,0,0,0.3);border:3px solid #fff">📍</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker(CUSTOMER, { icon: custIcon }).addTo(map)
        .bindPopup('<b>Your Location</b>');

      // Driver marker
      const driverIcon = L.divIcon({
        className: '',
        html: `<div id="driver-marker" style="background:#C0392B;color:#fff;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 3px 14px rgba(192,57,43,0.5);border:3px solid #fff;animation:none">🛵</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
      driverMarkerRef.current = L.marker(currentDriverPos, { icon: driverIcon })
        .addTo(map)
        .bindPopup('<b>Michael J.</b><br>Top Rated Driver<br>1.2 miles away');

      // Add label
      L.tooltip({ permanent: true, direction: 'right', className: 'driver-label' })
        .setContent('<span style="font-size:12px;font-weight:600;color:#C0392B;">Michael is here</span>')
        .setLatLng(currentDriverPos)
        .addTo(map);

      // Animate driver movement toward customer
      let progress = 0;
      let animationFrame;
      const animate = () => {
        progress += 0.002;
        if (progress > 1) progress = 1;
        const lat = currentDriverPos[0] + (CUSTOMER[0] - currentDriverPos[0]) * progress;
        const lng = currentDriverPos[1] + (CUSTOMER[1] - currentDriverPos[1]) * progress;
        if (driverMarkerRef.current) {
          driverMarkerRef.current.setLatLng([lat, lng]);
        }
        if (progress < 1) animationFrame = requestAnimationFrame(animate);
      };
      setTimeout(animate, 2000);
      
      mapInstanceRef.current._animationFrame = animationFrame;
    });

    return () => {
      if (mapInstanceRef.current) {
        if (mapInstanceRef.current._animationFrame) {
          cancelAnimationFrame(mapInstanceRef.current._animationFrame);
        }
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [driverPos]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
      id="tracking-map"
    />
  );
}
