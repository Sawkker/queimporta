"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

interface SecurityIncident {
    id: string;
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    zone: string | null;
    timestamp: string;
}

export default function HistoryPage() {
    const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8080/incidents')
            .then(res => res.json())
            .then(data => setIncidents(data))
            .catch(err => console.error("Failed to fetch incidents", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Security History</h1>
                    <p className="text-sm text-slate-500">Log of recent security incidents and their details.</p>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-medium">Timestamp</th>
                                <th scope="col" className="px-6 py-3 font-medium">Type</th>
                                <th scope="col" className="px-6 py-3 font-medium">Zone</th>
                                <th scope="col" className="px-6 py-3 font-medium">Description</th>
                                <th scope="col" className="px-6 py-3 font-medium">Location</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center">Loading history...</td>
                                </tr>
                            ) : incidents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center">No incidents recorded yet.</td>
                                </tr>
                            ) : (
                                incidents.map((incident) => (
                                    <tr key={incident.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(incident.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${incident.type === 'Theft' ? 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20' :
                                                incident.type === 'Assault' ? 'bg-orange-50 text-orange-700 ring-orange-600/10 dark:bg-orange-400/10 dark:text-orange-400 dark:ring-orange-400/20' :
                                                    'bg-yellow-50 text-yellow-700 ring-yellow-600/10 dark:bg-yellow-400/10 dark:text-yellow-400 dark:ring-yellow-400/20'
                                                }`}>
                                                {incident.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {incident.zone || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {incident.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                                            <Link
                                                href={`/map?lat=${incident.latitude}&lng=${incident.longitude}&zoom=15&popup=${encodeURIComponent(incident.description)}`}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                                                title="View on Map"
                                            >
                                                <MapPin className="h-3.5 w-3.5" />
                                                View Map
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
