"use client";

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface HeatmapLayerProps {
    points: [number, number, number?][];
}

export default function HeatmapLayer({ points }: HeatmapLayerProps) {
    const map = useMap();

    useEffect(() => {
        if (!points || points.length === 0) return;

        // @ts-ignore - leaflet.heat adds 'heatLayer' to L
        const heat = L.heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
        });

        heat.addTo(map);

        return () => {
            map.removeLayer(heat);
        };
    }, [points, map]);

    return null;
}
