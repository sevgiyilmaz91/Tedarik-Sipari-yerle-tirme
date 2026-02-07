import { useState } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ChevronRight,
    Home,
    Search,
    ScanLine,
    Filter,
    Download,
    Info
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { samplePoolData } from "@/lib/mockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SamplePool() {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [searched, setSearched] = useState(false);

    const handleSearch = () => {
        if (searchQuery === "123") {
            setResults(samplePoolData);
        } else if (searchQuery.trim() !== "") {
            const filtered = samplePoolData.filter(item =>
                item.generic.includes(searchQuery) ||
                item.numuneNo.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setResults(filtered);
        } else {
            setResults([]);
        }
        setSearched(true);
    };

    const handleDownload = () => {
        toast.success("Excel dosyası hazırlanıyor", {
            description: "Dosya indirme işlemi kısa süre içinde başlayacaktır.",
        });
    };

    return (
        <div className="min-h-screen bg-[#F9F7FD] pb-20">
            <TopNav />

            <main className="container px-6 py-4 max-w-full space-y-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                    <div className="flex items-center gap-1 hover:text-[#6D28D9] cursor-pointer" onClick={() => window.location.hash = "#dashboard"}>
                        <Home className="h-4 w-4" />
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                    <span className="text-slate-400">Numune Havuzu</span>
                </nav>

                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-800">Numune Havuzu</h1>
                    <p className="text-sm text-slate-500 font-medium">
                        Numune havuzundaki kayıtlar bu alandan görüntülenebilir.
                    </p>
                </div>

                {/* Search Area */}
                <div className="w-full bg-[#8b5cf6] rounded-xl p-10 text-white shadow-xl flex flex-col items-center justify-center space-y-6">
                    <h2 className="text-3xl font-bold tracking-tight">Numune Ara</h2>

                    <div className="flex flex-col items-center space-y-6 w-full max-w-2xl">
                        <div className="flex items-center gap-3 text-white/80 font-medium">
                            <ScanLine className="h-8 w-8" />
                            <span className="text-lg">Barkod okutarak ya da numarayla numune ara</span>
                        </div>

                        <div className="flex items-center w-full gap-2 transition-all">
                            <div className="relative flex-1">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <Filter className="h-5 w-5 text-white/40" />
                                </div>
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="w-full h-14 pl-12 bg-white text-slate-800 text-lg font-bold rounded-lg border-none shadow-inner focus-visible:ring-2 focus-visible:ring-orange-400"
                                    placeholder=""
                                />
                            </div>
                            <Button
                                onClick={handleSearch}
                                className="h-14 px-10 bg-[#FFB300] hover:bg-[#FFA000] text-white font-black text-lg rounded-lg shadow-lg uppercase transition-all active:scale-95"
                            >
                                ARA
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                {searched && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Sas Arama</h3>
                                <span className="px-2 py-0.5 bg-[#EEE7FF] text-[#6D28D9] text-[11px] font-bold rounded-full">
                                    {results.length}/3849 Kayıt
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDownload}
                                className="text-[#6D28D9] font-bold hover:bg-purple-50 gap-2 h-9"
                            >
                                <Download className="h-4 w-4" />
                                Excel İndir
                            </Button>
                        </div>

                        <div className="bg-white rounded-xl shadow-md border border-[#E9E1FF] overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-[#F9F7FD]">
                                        <TableRow className="hover:bg-transparent border-slate-100">
                                            {[
                                                "Sezon", "Yıl", "Numune No", "Statü", "Fiziki",
                                                "Tedarikçiye Gönder...", "Üretici", "Ürün Grubu",
                                                "Kategori", "Ziylan Renk", "Generic", "Mal Kodu"
                                            ].map((header) => (
                                                <TableHead key={header} className="text-[11px] font-black text-slate-400 uppercase tracking-widest h-12">
                                                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                        {header}
                                                        {header === "Numune No" ? <Info className="h-3.5 w-3.5 opacity-30" /> : <Filter className="h-2.5 w-2.5 opacity-30" />}
                                                    </div>
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.length > 0 ? (
                                            results.map((row, i) => (
                                                <TableRow key={i} className="hover:bg-slate-50 border-slate-50 transition-colors">
                                                    <TableCell className="text-sm font-medium text-slate-600">{row.sezon}</TableCell>
                                                    <TableCell className="text-sm font-medium text-slate-600">{row.yil}</TableCell>
                                                    <TableCell className="text-sm font-bold text-slate-800">{row.numuneNo}</TableCell>
                                                    <TableCell>
                                                        <span className={cn(
                                                            "px-3 py-1 rounded-full text-[11px] font-bold",
                                                            row.statu === "İşlemde" ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"
                                                        )}>
                                                            {row.statu}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-sm font-medium text-slate-600">{row.fiziki}</TableCell>
                                                    <TableCell className="text-sm font-medium text-slate-600">{row.tedarikciGonderim}</TableCell>
                                                    <TableCell className="text-sm font-medium text-slate-600 truncate max-w-[150px]">{row.uretici}</TableCell>
                                                    <TableCell className="text-sm font-medium text-slate-600">{row.urunGrubu}</TableCell>
                                                    <TableCell className="text-sm font-medium text-slate-600">{row.kategori}</TableCell>
                                                    <TableCell className="text-sm font-medium text-slate-600">{row.ziylanRenk}</TableCell>
                                                    <TableCell className="text-sm font-medium text-slate-800">{row.generic}</TableCell>
                                                    <TableCell className="text-sm font-medium text-slate-600">{row.malKodu || "-"}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={12} className="h-32 text-center text-slate-400 font-medium">
                                                    Arama sonucu bulunamadı.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
