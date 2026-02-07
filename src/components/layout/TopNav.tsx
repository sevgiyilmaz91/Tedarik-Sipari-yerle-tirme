import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, Globe } from "lucide-react";
import { toast } from "sonner";

export function TopNav() {
    const menuStructure = [
        {
            title: "Tanımlamalar",
            items: ["Yol Tanımlama", "Yeni Yol Adımı Tanımlama", "Soru Tanımlama", "Yol Adım Ayarlama"],
        },
        {
            title: "Numune Kayıt",
            items: ["Shopping Numune Kayıt"],
        },
        {
            title: "Numune Havuz",
            items: [],
            target: "#sample-pool"
        },
        {
            title: "Generic Süreçleri",
            items: ["Generic Özet", "Generic Takibi", "Üretim Öncesi Hazırlık"],
        },
        {
            title: "Üretim Süreci",
            items: ["Üretim Süreci", "Kalite Süreci", "Inspection Talepleri", "Ticari Karar Takip Ekranı"],
        },
        {
            title: "Sipariş Yerleştirme",
            items: ["Sipariş Yerleştirme", "Tedarikçi Sipariş Dağıtım Listesi", "Tekliflerim / İhaleler"],
            target: "#order-placement"
        },
        {
            title: "Hammade",
            items: [],
        },
        {
            title: "Raporlar",
            items: [],
        },
        {
            title: "Devir Yönetimi",
            items: [],
        },
    ];

    const handleSubMenuClick = (item: string) => {
        if (item === "Sipariş Yerleştirme") {
            navigateTo("#order-placement");
            return;
        }
        if (item === "Shopping Numune Kayıt") {
            navigateTo("#shopping-sample-registration");
            return;
        }
        if (item === "Tedarikçi Sipariş Dağıtım Listesi") {
            navigateTo("#distribution-list");
            return;
        }
        if (item === "Tekliflerim / İhaleler") {
            navigateTo("#rfq-supplier");
            return;
        }

        toast.info(`${item} Sayfası Yakında`, {
            description: "Bu özellik geliştirme aşamasındadır.",
        });
    };

    const navigateTo = (path: string) => {
        window.location.hash = path;
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-[#F7F2FF] border-b border-[#E9E1FF]">
            <div className="container flex h-[72px] items-center justify-between px-6 max-w-full">
                {/* Logo Section */}
                <div className="flex items-center gap-10">
                    <div className="flex flex-col items-center cursor-pointer" onClick={() => navigateTo("#dashboard")}>
                        <div className="flex items-center">
                            <span className="text-2xl font-black tracking-tight text-[#E64A19] scale-y-110">FLO</span>
                            <div className="ml-1 border-2 border-[#E64A19] px-1.5 py-0.5 rounded-[4px]">
                                <span className="text-xl font-black text-[#6D28D9] leading-none">X</span>
                            </div>
                            <div className="ml-1 bg-[#E64A19] px-1.5 py-1 rounded-[4px]">
                                <span className="text-xl font-black text-white leading-none">O</span>
                            </div>
                        </div>
                        <span className="text-[11px] font-black text-[#6D28D9] tracking-[0.4em] mt-0.5 uppercase">
                            TEDARİK
                        </span>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {menuStructure.map((group) => (
                            <div key={group.title} className="relative group/menu">
                                {group.items.length > 0 ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="text-[14px] font-bold text-[#5C5C5C] hover:text-[#6D28D9] hover:bg-white/60 transition-all h-12 px-4 rounded-lg focus-visible:ring-0 gap-2 border border-transparent data-[state=open]:bg-white data-[state=open]:border-[#E9E1FF] data-[state=open]:shadow-sm"
                                            >
                                                {group.title}
                                                <ChevronDown className="h-4 w-4 opacity-40 group-hover:opacity-100" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="min-w-[220px] p-2 rounded-xl shadow-xl border-[#E9E1FF] bg-white animate-in fade-in zoom-in-95 duration-200">
                                            {group.items.map((item) => (
                                                <DropdownMenuItem
                                                    key={item}
                                                    className="text-sm font-semibold py-2.5 px-3 rounded-lg cursor-pointer hover:bg-[#F7F2FF] focus:bg-[#F7F2FF] text-[#5C5C5C] hover:text-[#6D28D9]"
                                                    onClick={() => handleSubMenuClick(item)}
                                                >
                                                    {item}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        className="text-[14px] font-bold text-[#5C5C5C] hover:text-[#6D28D9] hover:bg-white/60 transition-all h-12 px-4 rounded-lg focus-visible:ring-0"
                                        onClick={() => {
                                            if (group.target) navigateTo(group.target);
                                            else handleSubMenuClick(group.title);
                                        }}
                                    >
                                        {group.title}
                                    </Button>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Right Action Area */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-11 min-w-[100px] border-[#E9E1FF] bg-white hover:bg-white transition-all rounded-xl text-[#5C5C5C] font-bold px-5 shadow-sm">
                                    26SS
                                    <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-[#E9E1FF]">
                                <DropdownMenuItem className="font-bold p-2.5 cursor-pointer text-[#5C5C5C]">26SS</DropdownMenuItem>
                                <DropdownMenuItem className="font-bold p-2.5 cursor-pointer text-[#5C5C5C]">25FW</DropdownMenuItem>
                                <DropdownMenuItem className="font-bold p-2.5 cursor-pointer text-[#5C5C5C]">25SS</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-11 border-[#E9E1FF] bg-white hover:bg-white transition-all rounded-xl text-[#5C5C5C] font-bold px-5 shadow-sm">
                                    <Globe className="h-4 w-4 mr-2 text-[#6D28D9]" />
                                    Türkçe
                                    <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-[#E9E1FF]">
                                <DropdownMenuItem className="font-bold p-2.5 cursor-pointer text-[#5C5C5C]">Türkçe</DropdownMenuItem>
                                <DropdownMenuItem className="font-bold p-2.5 cursor-pointer text-[#5C5C5C]">English</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <Avatar className="h-11 w-11 border-2 border-white ring-2 ring-[#E9E1FF] hover:ring-[#6D28D9]/40 transition-all cursor-pointer shadow-md">
                        <AvatarFallback className="bg-[#6D28D9] text-white text-sm font-bold tracking-tight">SY</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
}

