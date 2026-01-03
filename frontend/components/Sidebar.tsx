"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, BarChart3, Settings, ShieldCheck } from "lucide-react";
import clsx from "clsx";

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Map View", href: "/map", icon: Map },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "History", href: "/history", icon: ShieldCheck },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col justify-between border-r border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
            <div className="px-4 py-6">
                <div className="flex items-center gap-2 px-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                    <ShieldCheck className="h-8 w-8 text-teal-600" />
                    <span className="tracking-tight">UrbanObs</span>
                </div>
                <nav className="mt-8 flex flex-col gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-slate-100 text-teal-700 dark:bg-slate-800 dark:text-teal-400"
                                        : "text-gray-600 hover:bg-slate-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-50"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                    <div className="h-10 w-10 text-xs rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                        BA
                    </div>
                    <div className="text-sm">
                        <p className="font-medium text-gray-900 dark:text-gray-100">Buenos Aires</p>
                        <p className="text-xs text-gray-500">Government Node</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
