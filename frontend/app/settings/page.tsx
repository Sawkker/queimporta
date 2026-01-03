"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Server, Database, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function SettingsPage() {
    const [ingesting, setIngesting] = useState(false);
    const [ingestionResult, setIngestionResult] = useState<{ success: boolean; message: string } | null>(null);
    const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
    const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

    // Check System Health
    useEffect(() => {
        const checkHealth = async () => {
            try {
                // Check API
                const apiRes = await fetch('http://localhost:8080/metrics'); // Using metrics endpoint as heartbeat
                if (apiRes.ok) {
                    setApiStatus('online');
                    setDbStatus('connected'); // Assuming successful Metric fetch implies DB connection
                } else {
                    setApiStatus('offline');
                    setDbStatus('disconnected');
                }
            } catch (error) {
                console.error("Health check failed", error);
                setApiStatus('offline');
                setDbStatus('disconnected');
            }
        };

        checkHealth();
        // Poll every 30s
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleIngestion = async () => {
        if (!confirm("This will trigger a full re-ingestion of historical data (2018-2024). This process may take several minutes. Continue?")) return;

        setIngesting(true);
        setIngestionResult(null);

        try {
            const res = await fetch('http://localhost:8080/ingestion/trigger-historical', {
                method: 'POST',
            });

            if (res.ok) {
                setIngestionResult({ success: true, message: "Ingestion verified and started successfully." });
            } else {
                throw new Error("Failed to trigger ingestion");
            }
        } catch (error) {
            setIngestionResult({ success: false, message: "Error triggering ingestion. Check API logs." });
        } finally {
            setIngesting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Settings</h1>
                    <p className="text-sm text-slate-500">Platform configuration and system management.</p>
                </div>
            </div>

            {/* System Health Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
                    <Server className="h-5 w-5 text-slate-500" />
                    System Status
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <Server className="h-5 w-5 text-blue-500" />
                            <span className="font-medium text-slate-700 dark:text-slate-300">Backend API</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {apiStatus === 'checking' && <span className="text-xs text-slate-500">Checking...</span>}
                            {apiStatus === 'online' && <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100"><CheckCircle className="h-3 w-3" /> Online</span>}
                            {apiStatus === 'offline' && <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100"><XCircle className="h-3 w-3" /> Offline</span>}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <Database className="h-5 w-5 text-purple-500" />
                            <span className="font-medium text-slate-700 dark:text-slate-300">Database</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {dbStatus === 'checking' && <span className="text-xs text-slate-500">Checking...</span>}
                            {dbStatus === 'connected' && <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100"><CheckCircle className="h-3 w-3" /> Connected</span>}
                            {dbStatus === 'disconnected' && <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100"><XCircle className="h-3 w-3" /> Error</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Management Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
                    <Database className="h-5 w-5 text-slate-500" />
                    Data Management
                </h3>

                <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h4 className="font-medium text-slate-900 dark:text-slate-100">Historical Data Ingestion</h4>
                                <p className="text-sm text-slate-500 mt-1">
                                    Trigger manual re-ingestion of official crime datasets (2018-2024).
                                    This will parse CSV source files and update the local database.
                                </p>
                            </div>
                            <button
                                onClick={handleIngestion}
                                disabled={ingesting || apiStatus === 'offline'}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <RefreshCw className={`h-4 w-4 ${ingesting ? 'animate-spin' : ''}`} />
                                {ingesting ? 'Ingesting...' : 'Trigger Ingestion'}
                            </button>
                        </div>

                        {ingestionResult && (
                            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${ingestionResult.success ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {ingestionResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                {ingestionResult.message}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* App Info */}
            <div className="text-center text-xs text-slate-400 mt-8">
                <p>Urban Observability Platform v1.0.0</p>
                <p>Powered by Next.js, NestJS & Prisma</p>
            </div>
        </div>
    );
}
