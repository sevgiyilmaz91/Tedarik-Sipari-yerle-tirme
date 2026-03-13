import React, { useState } from "react";

interface Props {
  disabled: boolean;
  onSearch: (barcode: string) => void;
  loading?: boolean;
}

const BarcodeSearch: React.FC<Props> = ({ disabled, onSearch, loading }) => {
  const [barcode, setBarcode] = useState("");

  const handleSearch = () => {
    if (barcode.trim()) {
      onSearch(barcode);
      setBarcode("");
    }
  };

  return (
    <div className="flex-1 max-w-lg">
      <input
        type="text"
        placeholder="Barkod okutunuz..."
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
        disabled={disabled}
        className="w-full px-4 py-3 border-2 border-white rounded-lg text-base shadow-md disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
    </div>
  );
};

export default BarcodeSearch;
