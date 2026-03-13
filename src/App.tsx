import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import SamplePool from "./pages/SamplePool";
import OrderPlacementPage from "./pages/OrderPlacementPage";
import DistributionListPage from "./pages/DistributionListPage";
import ShoppingSampleRegistration from "./pages/ShoppingSampleRegistration";
import RFQSupplierPage from "./pages/RFQSupplierPage";
import InspectionRequestsPage from "./pages/InspectionRequestsPage";
import StoreQualityControlPage from "./pages/StoreQualityControlPage";
import StoreGeneralControlPage from "./pages/StoreGeneralControlPage";
import { Toaster } from "@/components/ui/sonner";
import { InspectionProvider } from "./features/inspector/store/useInspectionStore";

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    return hash || "dashboard";
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      setCurrentPage(hash || "dashboard");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const renderPage = () => {
    const basePage = currentPage.split('?')[0];
    switch (basePage) {
      case "dashboard":
        return <Dashboard />;
      case "sample-pool":
        return <SamplePool />;
      case "order-placement":
        return <OrderPlacementPage />;
      case "distribution-list":
        return <DistributionListPage />;
      case "shopping-sample-registration":
        return <ShoppingSampleRegistration />;
      case "rfq-supplier":
        return <RFQSupplierPage />;
      case "inspection-requests":
        return <InspectionRequestsPage />;
      case "store-quality-control":
        return <StoreQualityControlPage />;
      case "store-general-control":
        return <StoreGeneralControlPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <InspectionProvider>
      <>
        <div id="page-root">
          {renderPage()}
        </div>
        <Toaster position="top-right" />
      </>
    </InspectionProvider>
  );
}

export default App;
