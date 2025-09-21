// In src/components/ReportMap.tsx
import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Make sure to import Leaflet's CSS

// ✅ FIX: Component now accepts a 'data' prop.
// 'useState' and 'useEffect' for fetching have been removed.
export const ReportMap = ({ data: locations }) => {
  // Center of Greater Noida
  const mapCenter: [number, number] = [28.6692, 77.4538];

  // ✅ FIX: Handle the loading state based on the presence of the 'data' prop.
  if (!locations) {
    return <div className="flex items-center justify-center h-full">Loading map data...</div>;
  }

  if (locations.length === 0) {
    return <div className="flex items-center justify-center h-full">No open reports with locations</div>;
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc, idx) => (
        // Ensure the location has valid coordinates before rendering
        (loc.latitude && loc.longitude) && (
          <CircleMarker
            key={idx}
            center={[loc.latitude, loc.longitude]}
            radius={6}
            pathOptions={{ color: 'red', fillColor: '#f03', fillOpacity: 0.7 }}
          >
            <Tooltip>{loc.category || 'Report Location'}</Tooltip>
          </CircleMarker>
        )
      ))}
    </MapContainer>
  );
};