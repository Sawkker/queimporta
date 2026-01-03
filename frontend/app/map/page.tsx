"use client";

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUrbanData } from '@/hooks/useUrbanData';
import type { GeoJSON } from 'geojson';

// Dynamically import Map to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function MapPage() {
    // Fetch real crime stats from backend
    const [zoneCrimeCounts, setZoneStats] = useState<Record<string, number>>({});
    const [geoJsonData, setGeoJsonData] = useState<GeoJSON | undefined>(undefined);

    // URL Params for linking
    const searchParams = useSearchParams();
    const [mapCenter, setMapCenter] = useState<[number, number]>([-34.6037, -58.3816]);
    const [mapZoom, setMapZoom] = useState(12);
    const [linkedMarker, setLinkedMarker] = useState<{ position: [number, number]; popup: string; } | null>(null);

    useEffect(() => {
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        const zoom = searchParams.get('zoom');
        const popup = searchParams.get('popup');

        if (lat && lng) {
            const center: [number, number] = [parseFloat(lat), parseFloat(lng)];
            setMapCenter(center);
            if (zoom) setMapZoom(parseInt(zoom));
            if (popup) {
                setLinkedMarker({ position: center, popup: decodeURIComponent(popup) });
            }
        }
    }, [searchParams]);

    useEffect(() => {
        // Fetch Comunas GeoJSON
        fetch('/comunas.geojson')
            .then(res => res.json())
            .then(data => setGeoJsonData(data))
            .catch(err => console.error("Failed to load GeoJSON", err));
    }, []);

    // Filter states
    const [selectedYear, setSelectedYear] = useState<string>('All');
    const [selectedZone, setSelectedZone] = useState<string>('All');

    // Visualization Mode
    const [visualizationMode, setVisualizationMode] = useState<'zones' | 'heatmap'>('zones');
    const [heatmapPoints, setHeatmapPoints] = useState<[number, number][]>([]);

    // Live Camera Marker (UADE)
    const uadeCamera = {
        position: [-34.6175, -58.3806] as [number, number],
        popup: `
            <div class="w-[320px]">
                <h3 class="font-bold text-sm mb-2">UADE - Av. 9 de Julio</h3>
                <div class="aspect-video w-full">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src="https://www.youtube.com/embed/rqBfiegG5qU?autoplay=1" 
                        title="UADE Live Cam" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowfullscreen
                    ></iframe>
                </div>
                <p class="text-xs text-slate-500 mt-2">Live stream from UADE Campus.</p>
            </div>
        `
    };

    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedYear !== 'All') params.append('year', selectedYear);
        if (selectedZone !== 'All') params.append('zone', selectedZone);

        // Fetch Crime Stats (for Zones)
        fetch(`http://localhost:8080/incidents/stats?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                const normalized: Record<string, number> = {};
                Object.entries(data).forEach(([key, value]) => {
                    const num = key.replace(/[^0-9]/g, '');
                    if (num) normalized[num] = Number(value);
                });
                setZoneStats(normalized);
            })
            .catch(err => console.error("Failed to fetch crime stats", err));

        // Fetch Incident Locations (for Heatmap)
        fetch(`http://localhost:8080/incidents/locations?${params.toString()}`)
            .then(res => res.json())
            .then(data => setHeatmapPoints(data))
            .catch(err => console.error("Failed to fetch locations", err));

    }, [selectedYear, selectedZone]);

    const maxCrime = Math.max(...Object.values(zoneCrimeCounts), 1);

    const getZoneStyle = (feature: any) => {
        const comuna = feature.properties.COMUNAS;
        const count = zoneCrimeCounts[String(comuna)] || 0;
        const intensity = count / maxCrime;

        let color = '#4ade80'; // green
        if (intensity > 0.6) color = '#f87171'; // red
        else if (intensity > 0.3) color = '#facc15'; // yellow

        // If in heatmap mode, make zones transparent or hidden?
        // Usually good to keep boundaries but remove fill color to see heatmap clearly
        if (visualizationMode === 'heatmap') {
            return {
                color: 'gray',
                weight: 1,
                opacity: 0.5,
                fillOpacity: 0,
            };
        }

        // Zone Mode
        return {
            color: 'white',
            weight: 2,
            opacity: 1,
            fillColor: color,
            fillOpacity: 0.4 + (intensity * 0.4),
        };
    };

    const markersToShow = linkedMarker ? [linkedMarker, uadeCamera] : [uadeCamera];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-6rem)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Geospatial View</h1>
                    <p className="text-sm text-slate-500">Historical crime density heat map (2018-2024).</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Mode Toggles */}
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex text-sm">
                        <button
                            onClick={() => setVisualizationMode('zones')}
                            className={`px-3 py-1.5 rounded-md transition-all ${visualizationMode === 'zones'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm font-medium'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            Zones
                        </button>
                        <button
                            onClick={() => setVisualizationMode('heatmap')}
                            className={`px-3 py-1.5 rounded-md transition-all ${visualizationMode === 'heatmap'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm font-medium'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            Heatmap
                        </button>
                    </div>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden md:block"></div>

                    <div className="flex gap-2">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                        >
                            <option value="All">All Years</option>
                            {[2018, 2019, 2020, 2021, 2022, 2023, 2024].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>

                        <select
                            value={selectedZone}
                            onChange={(e) => setSelectedZone(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 max-w-[150px]"
                        >
                            <option value="All">All Zones</option>
                            {Array.from({ length: 15 }, (_, i) => i + 1).map(num => (
                                <option key={num} value={`Comuna ${num}`}>Comuna {num}</option>
                            ))}
                        </select>
                    </div>

                    {visualizationMode === 'zones' && (
                        <div className="flex gap-2 animate-in fade-in slide-in-from-right-5 duration-300">
                            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400">
                                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                                High
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400">
                                <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                                Med
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400">
                                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                Low
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-full w-full rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative z-0">
                <Map
                    center={mapCenter}
                    zoom={mapZoom}
                    markers={markersToShow}
                    geoJsonData={geoJsonData}
                    onGeoJsonStyle={getZoneStyle}
                    heatmapPoints={visualizationMode === 'heatmap' ? heatmapPoints : undefined}
                />
            </div>
        </div>
    );
}
