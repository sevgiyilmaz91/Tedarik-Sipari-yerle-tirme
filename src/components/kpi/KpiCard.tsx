import { Card, CardContent } from "@/components/ui/card";
import {
    LayoutList,
    CheckCircle2,
    XCircle,
    Clock,
    Activity,
    ClipboardCheck,
    ShieldCheck
} from "lucide-react";

const icons = {
    LayoutList,
    CheckCircle2,
    XCircle,
    Clock,
    Activity,
    ClipboardCheck,
    ShieldCheck,
};

interface KpiCardProps {
    title: string;
    value: string | number;
    description: string;
    iconName: keyof typeof icons;
}

export function KpiCard({ title, value, description, iconName }: KpiCardProps) {
    const Icon = icons[iconName];

    // Map icon names to specific background colors for a better look
    const iconColors: Record<string, string> = {
        LayoutList: "bg-purple-50 text-purple-600",
        CheckCircle2: "bg-indigo-50 text-indigo-600",
        XCircle: "bg-orange-50 text-orange-600",
        Clock: "bg-amber-50 text-amber-600",
        Activity: "bg-blue-50 text-blue-600",
        ClipboardCheck: "bg-emerald-50 text-emerald-600",
        ShieldCheck: "bg-teal-50 text-teal-600",
    };

    return (
        <Card className="border-none shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 rounded-xl overflow-hidden group">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg transition-colors ${iconColors[iconName] || "bg-slate-50 text-slate-600"}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
                        <div className="flex flex-col">
                            <span className="text-2xl pt-1 font-bold tracking-tight text-slate-900 leading-none">
                                {value}
                            </span>
                            <p className="text-[11px] text-slate-400 font-medium mt-1 uppercase tracking-wide">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
