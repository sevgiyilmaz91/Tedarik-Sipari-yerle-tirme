import React, { createContext, useContext, useState } from "react";

export type InspectionType = "INLINE" | "KALITE" | "MAGAZA";
export type RequestStatus = "Taslak" | "Planlandı" | "Atandı";

export interface InspectionRequest {
  id: string;
  sezon: string;
  modelAdi: string;
  generic: string;
  renk?: string;
  kontrolTarihi: string;
  kontrolSaati?: string;
  kontrolTuru: InspectionType;
  siparisAdedi?: number;
  kaliteKontrolPartiAdedi?: number;
  ureticiAdi?: string;
  altTedarikci?: string;
  magazalar?: string[];
  inspector?: string;
  aciklama?: string;
  islemTarihi?: string;
  statu: RequestStatus;
}

interface InspectionContextValue {
  requests: InspectionRequest[];
  suppliers: string[];
  subSuppliers: string[];
  stores: string[];
  inspectors: string[];
  createRequest: (payload: Omit<InspectionRequest, "id" | "statu" | "islemTarihi" | "inspector">) => InspectionRequest;
  updateRequest: (id: string, patch: Partial<InspectionRequest>) => InspectionRequest | undefined;
  getById: (id: string) => InspectionRequest | undefined;
}

const InspectionContext = createContext<InspectionContextValue | undefined>(undefined);

const sampleSuppliers = [
  "Klotho Tekstil San.ve Tic.Ltd.Şti.",
  "İstikbal Ayakkabı San.Ve Tic.",
  "Örnek Tedarikçi A",
];

const sampleSubSuppliers = ["Alt Tedarikçi A", "Alt Tedarikçi B", "Alt Tedarikçi C"];

const sampleStores = [
  "İstanbul - Forum",
  "İstanbul - İstinye",
  "Ankara - Armada",
  "İzmir - Optimum",
];

const sampleInspectors = [
  "Kader Kesgin",
  "Harun Atay",
  "Erhat Kutlu",
  "Mert Osman Kaya",
  "Zekeriya Gezici",
  "Gaffar Ünsal",
];

const initialRequests: InspectionRequest[] = [
  {
    id: "REQ-1",
    sezon: "26SS",
    modelAdi: "ML M039 3LU 34US4 5PR",
    generic: "101944209",
    renk: "Siyah",
    kontrolTarihi: "2025-12-03",
    kontrolSaati: "09:00",
    kontrolTuru: "INLINE",
    siparisAdedi: 539,
    kaliteKontrolPartiAdedi: 60,
    ureticiAdi: sampleSuppliers[0],
    altTedarikci: sampleSubSuppliers[0],
    inspector: undefined,
    aciklama: "testt",
    islemTarihi: "2025-12-03",
    statu: "Planlandı",
  },
  {
    id: "REQ-2",
    sezon: "26SS",
    modelAdi: "ML M039 2LU 34US",
    generic: "102037120",
    renk: "Beyaz",
    kontrolTarihi: "2026-02-11",
    kontrolSaati: "10:00",
    kontrolTuru: "KALITE",
    siparisAdedi: 1550,
    kaliteKontrolPartiAdedi: 100,
    ureticiAdi: sampleSuppliers[1],
    altTedarikci: sampleSubSuppliers[1],
    inspector: undefined,
    aciklama: "",
    islemTarihi: "2026-02-11",
    statu: "Planlandı",
  },
  {
    id: "REQ-3",
    sezon: "26SS",
    modelAdi: "OL M024",
    generic: "101570604",
    renk: "Kahve",
    kontrolTarihi: "2026-01-28",
    kontrolSaati: "08:30",
    kontrolTuru: "MAGAZA",
    magazalar: [sampleStores[0], sampleStores[2]],
    kaliteKontrolPartiAdedi: 497,
    ureticiAdi: sampleSuppliers[0],
    inspector: undefined,
    aciklama: "bbb",
    islemTarihi: "2026-01-28",
    statu: "Planlandı",
  },
  {
    id: "REQ-4",
    sezon: "26SS",
    modelAdi: "KL M2025",
    generic: "102037088",
    renk: "Gri",
    kontrolTarihi: "2026-01-29",
    kontrolSaati: "11:00",
    kontrolTuru: "INLINE",
    siparisAdedi: 1800,
    kaliteKontrolPartiAdedi: 200,
    ureticiAdi: sampleSuppliers[1],
    altTedarikci: sampleSubSuppliers[2],
    inspector: undefined,
    aciklama: "Hhh",
    islemTarihi: "2026-01-29",
    statu: "Planlandı",
  },
];

let idCounter = 5;

export const InspectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<InspectionRequest[]>(initialRequests);

  const createRequest = (payload: Omit<InspectionRequest, "id" | "statu" | "islemTarihi" | "inspector">) => {
    const newReq: InspectionRequest = {
      ...payload,
      id: `REQ-${idCounter++}`,
      statu: "Planlandı",
      islemTarihi: payload.kontrolTarihi,
      inspector: undefined,
    };
    setRequests((r) => [newReq, ...r]);
    return newReq;
  };

  const updateRequest = (id: string, patch: Partial<InspectionRequest>) => {
    let updated: InspectionRequest | undefined;
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          updated = { ...r, ...patch };
          return updated;
        }
        return r;
      }),
    );
    return updated;
  };

  const getById = (id: string) => requests.find((r) => r.id === id);

  return React.createElement(
    InspectionContext.Provider,
    {
      value: {
        requests,
        suppliers: sampleSuppliers,
        subSuppliers: sampleSubSuppliers,
        stores: sampleStores,
        inspectors: sampleInspectors,
        createRequest,
        updateRequest,
        getById,
      },
    },
    children,
  );
};

export const useInspectionStore = () => {
  const ctx = useContext(InspectionContext);
  if (!ctx) throw new Error("useInspectionStore must be used within InspectionProvider");
  return ctx;
};
