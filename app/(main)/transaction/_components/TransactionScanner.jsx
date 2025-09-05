"use client";
import { scanTransaction } from "@/actions/transaction";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-fetch";
import { Camera, Loader2 } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { toast } from "sonner";

const TransactionScanner = ({ onScanComplete }) => {
  const fileInputRef = useRef();

  const {
    loading: ScanLoading,
    fn: scanfn,
    data: scannedData,
  } = useFetch(scanTransaction);

  const handleTransactionScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }
    await scanfn(file);
  };

  useEffect(() => {
    if (scannedData && !ScanLoading) {
      onScanComplete(scannedData);
      toast.success("Transaction scanned successfully");
    }
  }, [ScanLoading, scannedData]);

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleTransactionScan(file);
        }}
      />

      <Button
        type="button"
        variant="outline"
        className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-500 to-lime-400 animate-gradient bg-[length:250%_250%] text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
        onClick={() => fileInputRef.current?.click()}
        disabled={ScanLoading}
      >
        {ScanLoading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5" />
            <span>Scanning transaction...</span>
          </>
        ) : (
          <>
            <Camera className="h-5 w-5" />
            <span>Scan with AI</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default TransactionScanner;
