import React, { useEffect, useState } from 'react';

interface OpenStreetMapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  markerTitle?: string;
}

const OpenStreetMap: React.FC<OpenStreetMapProps> = ({ 
  center, 
  zoom = 15, 
  markerTitle = 'HopeCare Tanzania' 
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // Only import Leaflet on the client side
    if (typeof window !== 'undefined') {
      // Use relative path for dynamic import
      import('./LeafletMap.tsx').then(module => {
        setMapComponent(() => module.default);
        setMapLoaded(true);
      }).catch(error => {
        console.error('Failed to load map component:', error);
      });
    }
  }, []);

  if (!mapLoaded || !MapComponent) {
    // Show a placeholder while the map is loading
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return <MapComponent center={center} zoom={zoom} markerTitle={markerTitle} />;
};

export default OpenStreetMap;
