
// src/components/itinerary-map.tsx
'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { ItineraryDayWithImage } from '@/ai/flows/itinerary-schemas';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface ItineraryMapProps {
    day: ItineraryDayWithImage;
}

const ItineraryMap: React.FC<ItineraryMapProps> = ({ day }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    const allActivities = [...day.morning.activities, ...day.afternoon.activities, ...day.evening.activities];
    
    const validActivities = allActivities.filter(activity => 
        activity.location && 
        typeof activity.location.lat === 'number' && 
        typeof activity.location.lon === 'number'
    );

    // Effect for initializing and cleaning up the map
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current, {
                center: [51.505, -0.09], // Default center
                zoom: 1,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapRef.current);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Effect for updating markers and view
    useEffect(() => {
        if (!mapRef.current) return;

        // Clear existing markers from the map and the ref
        markersRef.current.forEach(marker => marker.removeFrom(mapRef.current!));
        markersRef.current = [];

        if (validActivities.length > 0) {
            // Add new markers
            const newMarkers = validActivities.map(activity => {
                const marker = L.marker([activity.location.lat, activity.location.lon]);
                marker.bindPopup(`<b>${activity.activity}</b><br />${activity.description}`);
                return marker;
            });
            
            markersRef.current = newMarkers;
            const featureGroup = L.featureGroup(newMarkers).addTo(mapRef.current);
            mapRef.current.fitBounds(featureGroup.getBounds().pad(0.1));
        }
    }, [day, validActivities]); // Rerun when day data changes

    if (validActivities.length === 0) {
        return <div className="h-[400px] w-full rounded-lg bg-muted flex items-center justify-center"><p>No locations to display on map.</p></div>;
    }

    return (
        <div ref={mapContainerRef} style={{ height: '400px', width: '100%' }} className="rounded-lg" />
    );
}

export default ItineraryMap;
