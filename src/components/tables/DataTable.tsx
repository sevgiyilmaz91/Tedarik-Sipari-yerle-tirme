import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Filter, MoreVertical } from "lucide-react";
import { toast } from "sonner";

interface DataTableProps {
    title: string;
    columns: { key: string; label: string }[];
    data: any[];
}

export function DataTable({ title, columns, data }: DataTableProps) {
    const handleDownload = () => {
        toast.success("Excel dosyası hazırlanıyor", {
            description: "Dosya indirme işlemi kısa süre içinde başlayacaktır.",
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] border-none overflow-hidden h-full">
            <div className="flex items-center justify-between p-5 border-b border-slate-50">
                <h3 className="font-semibold text-slate-800">{title}</h3>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary hover:bg-primary/5 font-medium gap-1.5 h-8 px-2.5"
                        onClick={handleDownload}
                    >
                        <Download className="h-3.5 w-3.5" />
                        <span className="text-xs">Excel İndir</span>
                    </Button>
                </div>
            </div>
            <div className="overflow-auto max-h-[400px]">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-50">
                            {columns.map((col) => (
                                <TableHead key={col.key} className="text-[11px] font-bold text-slate-400 uppercase tracking-widest h-10 py-0">
                                    <div className="flex items-center gap-1.5">
                                        {col.label}
                                        <Filter className="h-2.5 w-2.5 opacity-30" />
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead className="w-[40px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, i) => (
                            <TableRow key={i} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                                {columns.map((col) => (
                                    <TableCell key={col.key} className="py-3 text-sm text-slate-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px]">
                                        {row[col.key]}
                                    </TableCell>
                                ))}
                                <TableCell className="p-0">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
