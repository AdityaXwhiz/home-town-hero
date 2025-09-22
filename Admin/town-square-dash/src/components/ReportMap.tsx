import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export const ReportMap = ({ data: locations }) => {
  const mapCenter: [number, number] = [28.6139, 77.2090]; // Centered on Delhi

  if (!locations) {
    return <div className="flex items-center justify-center h-full">Loading map data...</div>;
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={10}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc, idx) => (
        (loc.latitude && loc.longitude) && (
          <CircleMarker
            key={idx}
            center={[loc.latitude, loc.longitude]}
            radius={8}
            pathOptions={{ color: '#F44336', fillColor: '#F44336', fillOpacity: 0.7 }}
          >
            <Tooltip>{loc.category}</Tooltip>
          </CircleMarker>
        )
      ))}
    </MapContainer>
  );
};
