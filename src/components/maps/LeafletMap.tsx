import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

interface LeafletMapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  markerTitle?: string;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ 
  center, 
  zoom = 15, 
  markerTitle = 'HopeCare Tanzania' 
}) => {
  useEffect(() => {
    // Fix for default marker icon in Leaflet
    const DefaultIcon = L.icon({
      iconUrl: icon,
      shadowUrl: iconShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
    
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={zoom} 
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', zIndex: 1 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[center.lat, center.lng]}>
        <Popup>
          <div className="text-center">
            <strong>{markerTitle}</strong>
            <p>New Safari Hotel, 402</p>
            <p>Boma Road, Arusha</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default LeafletMap;
