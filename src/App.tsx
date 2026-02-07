import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import SamplePool from "./pages/SamplePool";
import OrderPlacementPage from "./pages/OrderPlacementPage";
import DistributionListPage from "./pages/DistributionListPage";
import ShoppingSampleRegistration from "./pages/ShoppingSampleRegistration";
import RFQSupplierPage from "./pages/RFQSupplierPage";
import { Toaster } from "@/components/ui/sonner";

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
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <div id="page-root">
        {renderPage()}
      </div>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
