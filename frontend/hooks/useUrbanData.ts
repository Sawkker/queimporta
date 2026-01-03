import { useState, useEffect } from 'react';

export interface Metric {
    id: string;
    name: string;
    unit: string | null;
}

export interface UrbanDataPoint {
    id: string;
    metric: Metric;
    value: any;
    timestamp: string;
    createdAt: string;
}

export function useUrbanData(metricName?: string) {
    const [data, setData] = useState<UrbanDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
                const url = metricName
                    ? `${apiUrl}/data?metric=${encodeURIComponent(metricName)}`
                    : `${apiUrl}/data`;

                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch data');

                const jsonData = await res.json();
                setData(jsonData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Poll every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [metricName]);

    return { data, loading, error };
}
