"use client";

import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import type { GeoJSON as GeoJSONType } from 'geojson';

// Fix for default Leaflet icons in Next.js
import HeatmapLayer from './HeatmapLayer';

// Fix for default Leaflet icons in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    center?: [number, number];
    zoom?: number;
    markers?: { position: [number, number]; popup: string; }[];
    geoJsonData?: GeoJSONType;
    onGeoJsonStyle?: (feature: any) => L.PathOptions;
    heatmapPoints?: [number, number, number?][];
}

const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom);
    }, [center, zoom, map]);
    return null;
};

const Map = ({ center = [-34.6037, -58.3816], zoom = 13, markers = [], geoJsonData, onGeoJsonStyle, heatmapPoints }: MapProps) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="h-full w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />;
    }

    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: "100%", width: "100%", borderRadius: "0.75rem", zIndex: 0 }}>
            <MapController center={center} zoom={zoom} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {geoJsonData && !heatmapPoints && (
                <GeoJSON
                    data={geoJsonData}
                    style={onGeoJsonStyle || (() => ({ color: 'blue', weight: 1, fillOpacity: 0.1 }))}
                    onEachFeature={(feature, layer) => {
                        if (feature.properties && feature.properties.BARRIOS) {
                            layer.bindPopup(`<strong>${feature.properties.BARRIOS}</strong><br/>Comuna ${feature.properties.COMUNAS}`);
                        }
                    }}
                />
            )}
            {heatmapPoints && <HeatmapLayer points={heatmapPoints} />}
            {markers.map((marker, idx) => (
                <Marker key={idx} position={marker.position}>
                    <Popup>
                        <div dangerouslySetInnerHTML={{ __html: marker.popup }} />
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default Map;
