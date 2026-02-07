import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LineChartCardProps {
    title: string;
    data: any[];
}

export function LineChartCard({ title, data }: LineChartCardProps) {
    return (
        <Card className="border-none shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] rounded-xl overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 border-b border-slate-50">
                <CardTitle className="text-sm font-semibold text-slate-800 uppercase tracking-tight">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="h-[280px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: "#94a3b8" }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: "#94a3b8" }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                            />
                            <Legend
                                verticalAlign="top"
                                align="center"
                                iconType="circle"
                                wrapperStyle={{ fontSize: '10px', paddingBottom: '20px', fontWeight: 'bold', textTransform: 'none' }}
                            />
                            <Line
                                name="Numune Gelen"
                                type="monotone"
                                dataKey="incoming"
                                stroke="#311B92"
                                strokeWidth={2.5}
                                dot={{ fill: "#311B92", r: 4, strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                            <Line
                                name="Numune Sonuçlanan"
                                type="monotone"
                                dataKey="completed"
                                stroke="#FB8C00"
                                strokeWidth={2.5}
                                dot={{ fill: "#FB8C00", r: 4, strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
