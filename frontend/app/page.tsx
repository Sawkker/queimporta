"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Activity, Droplets, ThermometerSun, Wind, Car, TrainFront, AlertTriangle } from "lucide-react";
import { useUrbanData } from "@/hooks/useUrbanData";

function StatCard({ title, value, subtext, icon: Icon, trendUp, alert }: any) {
  return (
    <div className={`rounded-xl border p-6 shadow-sm transition-all hover:shadow-md ${alert ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
      <div className="flex items-center justify-between">
        <p className={`text-sm font-medium ${alert ? 'text-amber-700 dark:text-amber-500' : 'text-slate-500 dark:text-slate-400'}`}>{title}</p>
        <div className={`rounded-full p-2 ${alert ? 'bg-amber-100 dark:bg-amber-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
          <Icon className={`h-5 w-5 ${alert ? 'text-amber-700 dark:text-amber-500' : 'text-slate-700 dark:text-slate-300'}`} />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</h3>
        <span className={`text-xs font-medium flex items-center gap-1 ${trendUp === true ? 'text-emerald-600' : trendUp === false ? 'text-rose-600' : 'text-slate-500'}`}>
          {trendUp === true && <ArrowUpRight className="h-3 w-3" />}
          {trendUp === false && <ArrowDownRight className="h-3 w-3" />}
          {subtext}
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  // Fetching all metrics
  const { data: weatherRaw } = useUrbanData("Temperature 2m");
  const { data: airRaw } = useUrbanData("PM2.5");
  const { data: trafficRaw } = useUrbanData("Traffic Density");
  const { data: subwayRaw } = useUrbanData("Subway Status");

  // Process Weather Data
  const weatherData = useMemo(() => {
    if (!weatherRaw || weatherRaw.length === 0) return [];
    return weatherRaw.slice().reverse().map(item => ({
      name: new Date(item.timestamp).getHours() + ':00',
      temp: item.value.temp,
    }));
  }, [weatherRaw]);

  // Process Air Quality Data
  const airData = useMemo(() => {
    if (!airRaw || airRaw.length === 0) return [];
    return airRaw.slice().reverse().map(item => ({
      name: new Date(item.timestamp).getHours() + ':00',
      pm25: item.value.pm25,
    }));
  }, [airRaw]);

  // Process Traffic Data (Bar Chart)
  const trafficChartData = useMemo(() => {
    if (!trafficRaw || trafficRaw.length === 0) return [];
    return trafficRaw.slice(0, 10).reverse().map((item, index) => ({
      name: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      density: item.value.density
    }));
  }, [trafficRaw]);

  // Current values
  const currentTemp = weatherData.length > 0 ? weatherData[weatherData.length - 1].temp + "°C" : "--";
  const currentAir = airData.length > 0 ? airData[airData.length - 1].pm25 + " µg/m³" : "--";
  const currentTraffic = trafficRaw && trafficRaw.length > 0 ? trafficRaw[0].value.density : 0;
  const currentSubway = subwayRaw && subwayRaw.length > 0 ? subwayRaw[0].value.status : "Unknown";

  const isSubwayDelayed = currentSubway !== "Normal";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Urban Overview</h1>
          <p className="text-sm text-slate-500">Real-time monitoring of Buenos Aires city metrics.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Avg Temperature" value={currentTemp} subtext="Updated 1h ago" icon={ThermometerSun} trendUp={true} />
        <StatCard title="Air Quality (PM2.5)" value={currentAir} subtext="Moderate Quality" icon={Wind} trendUp={false} />
        <StatCard title="Traffic Density" value={currentTraffic + "/100"} subtext="High Congestion" icon={Car} trendUp={false} />
        <StatCard
          title="Subway Status"
          value={currentSubway}
          subtext={isSubwayDelayed ? "Delays reported" : "Service Normal"}
          icon={isSubwayDelayed ? AlertTriangle : TrainFront}
          alert={isSubwayDelayed}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Weather Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-slate-50">Weather Trends (Temperature)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weatherData}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '8px' }} itemStyle={{ color: 'var(--foreground)' }} />
                <Area type="monotone" dataKey="temp" stroke="var(--color-accent)" fillOpacity={1} fill="url(#colorTemp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Air Quality Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-slate-50">Air Quality (PM2.5)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={airData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '8px' }} itemStyle={{ color: 'var(--foreground)' }} />
                <Line type="monotone" dataKey="pm25" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Density Chart */}
        <div className="col-span-1 md:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-slate-50">Real-time Traffic Density</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '8px' }} itemStyle={{ color: 'var(--foreground)' }} />
                <Bar dataKey="density" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
