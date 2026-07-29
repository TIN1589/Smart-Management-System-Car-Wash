import React from "react";
import { cn } from "@/shared/lib/utils";

export interface BadgeProps {
    children: React.ReactNode;
    variant?: 'member' | 'silver' | 'gold' | 'platinum' | 'pending' | 'confirmed' | 'in_progress' | 'done' | 'cancelled' | 'default';
    className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
    const baseStyles = "inline-flex items-center px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase rounded-md border-[0.5px] transition-colors";

    const variantStyles = {
        member: "bg-slate-50 text-slate-600 border-slate-200",
        silver: "bg-slate-100 text-slate-700 border-slate-350",
        gold: "bg-amber-50 text-amber-800 border-amber-200/60",
        platinum: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
        pending: "bg-slate-100 text-slate-600 border-slate-200/80",
        confirmed: "bg-blue-50 text-blue-700 border-blue-200/60",
        in_progress: "bg-amber-50 text-amber-800 border-amber-200/60",
        done: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
        cancelled: "bg-rose-50 text-rose-700 border-rose-200/60",
        default: "bg-slate-50 text-slate-600 border-slate-200/80"
    };

    return (
        <span className={cn(baseStyles, variantStyles[variant], className)}>
            {children}
        </span>
    );
}
