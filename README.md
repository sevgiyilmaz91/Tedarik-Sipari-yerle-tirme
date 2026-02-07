# FloXO Tedarik Dashboard Prototipi

Bu proje, FloXO Tedarik için kurumsal bir web dashboard prototipidir.

## Kullanılan Teknolojiler
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **UI Components:** shadcn/ui
- **Charts:** Recharts
- **Icons:** Lucide React

## Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin:

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

3. Tarayıcınızda `http://localhost:5173` adresine giderek Dashboard'u görebilirsiniz.

## Proje Yapısı
- `src/pages/Dashboard.tsx`: Ana Dashboard sayfası.
- `src/components/layout/TopNav.tsx`: Üst menü ve aksiyon alanı.
- `src/components/kpi/KpiCard.tsx`: KPI özet kartları.
- `src/components/tables/DataTable.tsx`: Veri tabloları.
- `src/components/charts/`: Grafik bileşenleri (Line ve Pie).
- `src/lib/mockData.ts`: Prototip için kullanılan mock veriler.
