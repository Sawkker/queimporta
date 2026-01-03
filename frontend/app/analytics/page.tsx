"use client";


import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { useState, useEffect } from "react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsPage() {
    const [statsByZone, setStatsByZone] = useState<any[]>([]);
    const [statsByType, setStatsByType] = useState<any[]>([]);

    useEffect(() => {
        // Fetch Zone Stats
        fetch('http://localhost:8080/incidents/stats')
            .then(res => res.json())
            .then(data => {
                // Transform { "Comuna 1": 100 } -> [{ name: "Comuna 1", count: 100 }]
                const formatted = Object.entries(data).map(([zone, count]) => ({
                    name: zone,
                    count: Number(count)
                })).sort((a, b) => b.count - a.count);
                setStatsByZone(formatted);
            })
            .catch(err => console.error("Failed to fetch zone stats", err));

        // Fetch Type Stats
        fetch('http://localhost:8080/incidents/stats/type')
            .then(res => res.json())
            .then(data => {
                // Transform { "Theft": 100 } -> [{ name: "Theft", value: 100 }]
                const formatted = Object.entries(data).map(([type, count]) => ({
                    name: type,
                    value: Number(count)
                }));
                setStatsByType(formatted);
            })
            .catch(err => console.error("Failed to fetch type stats", err));
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Security Analytics</h1>
                    <p className="text-sm text-slate-500">Historical analysis of crime data by zone and type (2018-2024).</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-slate-50">Crimes by Zone (Heatmap)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statsByZone} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" stroke="#888888" fontSize={12} />
                                <YAxis dataKey="name" type="category" width={100} stroke="#888888" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '8px' }} itemStyle={{ color: 'var(--foreground)' }} />
                                <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-slate-50">Distribution by Crime Type</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statsByType}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statsByType.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '8px' }} itemStyle={{ color: 'var(--foreground)' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">Risk Assessment</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Based on historical data for 2018-2024, <strong>{statsByZone[0]?.name || 'N/A'}</strong> appears to be the zone with the highest incident rate.
                    The most common incident type is <strong>{statsByType[0]?.name || 'N/A'}</strong>.
                    Correlation with subway status and traffic density suggests increased activity during congestion hours.
                </p>
            </div>
        </div>
    );
}
