"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteAccount } from "@/actions/accounts";
import useFetch from "@/hooks/use-fetch";

export default function DeleteAccountButtonWithModal({ accountId }) {
  const router = useRouter();
  const { data, loading, fn, setData, error } = useFetch(deleteAccount);
  const [isOpen, setIsOpen] = useState(false);

  // Trigger delete
  const handleDelete = async () => {
    await fn(accountId);
  };

  // Success toast + redirect
  useEffect(() => {
    if (data?.success) {
      toast.success("Account deleted successfully!");
      setIsOpen(false); // close modal
      router.push("/dashboard"); // navigate
      setData(undefined); // reset data to prevent re-running effect
    }
  }, [data, router, setData]);

  // Error toast
  useEffect(() => {
    if (error) {
      toast.error(error?.message || "Failed to delete account");
    }
  }, [error]);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
      >
        Delete Account
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Delete Account
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this account? <br />
              <span className="font-semibold text-red-500">
                All transactions associated with this account will also be deleted. This action cannot be undone.
              </span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
