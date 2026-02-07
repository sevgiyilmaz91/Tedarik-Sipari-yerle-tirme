import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PieChartCardProps {
    title: string;
    data: any[];
}

export function PieChartCard({ title, data }: PieChartCardProps) {
    return (
        <Card className="border-none shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] rounded-xl overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 border-b border-slate-50">
                <CardTitle className="text-sm font-semibold text-slate-800 uppercase tracking-tight">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="h-[280px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="35%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="amount"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                            />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                iconType="circle"
                                wrapperStyle={{ fontSize: '11px', paddingLeft: '20px', maxWidth: '180px' }}
                                formatter={(value: string) => <span className="text-slate-600 font-medium truncate inline-block max-w-[150px]">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
