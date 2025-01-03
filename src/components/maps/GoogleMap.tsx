import React from 'react';
import { GoogleMap as GoogleMapComponent, LoadScript, Marker } from '@react-google-maps/api';

interface GoogleMapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  markerTitle?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  center, 
  zoom = 15, 
  markerTitle = 'HopeCare Tanzania' 
}) => {
  const mapStyles = {
    height: '100%',
    width: '100%',
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Google Maps API key not configured</p>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMapComponent
        mapContainerStyle={mapStyles}
        zoom={zoom}
        center={center}
      >
        <Marker
          position={center}
          title={markerTitle}
        />
      </GoogleMapComponent>
    </LoadScript>
  );
};

export default GoogleMap;
