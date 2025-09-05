"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  MoreHorizontal,
  RefreshCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { categoryColors } from "@/data/categories";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/use-fetch";
import { bulkDeleteTransactions } from "@/actions/accounts";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";

const RECURRING_TIME = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const TransactionTable = ({ transactions }) => {
  const [tableTransactions, setTableTransactions] = useState(transactions); // <-- local state
  const [selected, setSelected] = useState([]);
  const [sorter, setSorter] = useState({ field: "date", direction: "desc" });
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  // 🔹 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { loading: deleteLoading, fn: deletefn, data: deleteResult } =
    useFetch(bulkDeleteTransactions);

  // Handle deletion result
  useEffect(() => {
    if (deleteResult && deleteResult.success && selected.length > 0) {
      toast.success("Transaction(s) deleted successfully.");

      // Remove deleted transactions locally
      setTableTransactions((prev) =>
        prev.filter((t) => !selected.includes(t.id))
      );

      setSelected([]); // Clear selection
    }
  }, [deleteResult, selected]);

  const filteredAndSortedTransaction = useMemo(() => {
    let result = [...tableTransactions]; // <-- use local state

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((t) =>
        t.description?.toLowerCase().includes(searchLower)
      );
    }

    if (recurringFilter) {
      result = result.filter((t) =>
        recurringFilter === "recurring" ? t.isRecurring : !t.isRecurring
      );
    }

    if (typeFilter) {
      result = result.filter((t) => t.type === typeFilter);
    }

    return [...result].sort((a, b) => {
      let comparison = 0;
      switch (sorter.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          const aAmount =
            a.type === "DEBIT" ? -Number(a.amount) : Number(a.amount);
          const bAmount =
            b.type === "DEBIT" ? -Number(b.amount) : Number(b.amount);
          comparison = aAmount - bAmount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
      }
      return sorter.direction === "asc" ? comparison : -comparison;
    });
  }, [tableTransactions, searchTerm, typeFilter, recurringFilter, sorter]);

  // 🔹 Pagination logic
  const totalPages = Math.ceil(filteredAndSortedTransaction.length / rowsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedTransaction.slice(start, start + rowsPerPage);
  }, [filteredAndSortedTransaction, currentPage, rowsPerPage]);

  const handleSort = (field) => {
    setSorter((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handleSelect = (id) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const handleSelectAll = () => {
    setSelected((current) =>
      current.length === paginatedTransactions.length
        ? []
        : paginatedTransactions.map((t) => t.id)
    );
  };

  const handleBulkDelete = () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} transaction(s)?`
      )
    )
      return;
    deletefn([...selected]);
  };

  const handleSingleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;
    deletefn([id]);
    // Optionally remove immediately locally
    setTableTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelected([]);
  };

  return (
    <div className="space-y-4">
      {deleteLoading && (
        <BarLoader width={"100%"} className="mt-4" color="#06b6d4"></BarLoader>
      )}

      {/* filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search Transactions"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={typeFilter}
            onValueChange={(val) => {
              setTypeFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[130px] cursor-pointer">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CREDIT">Credit</SelectItem>
              <SelectItem value="DEBIT">Debit</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={recurringFilter}
            onValueChange={(val) => {
              setRecurringFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[160px] cursor-pointer">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring</SelectItem>
              <SelectItem value="non-recurring">Non-recurring</SelectItem>
            </SelectContent>
          </Select>

          {selected.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selected.length})
              </Button>
            </div>
          )}

          {(searchTerm ||
            typeFilter ||
            recurringFilter ||
            selected.length > 0) && (
            <Button
              size="icon"
              title="Clear Filters"
              onClick={handleClearFilters}
            >
              <X className="h-4 w-5 " />
            </Button>
          )}
        </div>
      </div>

      {/* transactions */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selected.length === paginatedTransactions.length &&
                    paginatedTransactions.length > 0
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelected(paginatedTransactions.map((t) => t.id));
                    } else {
                      setSelected([]);
                    }
                  }}
                  className="cursor-pointer"
                />
              </TableHead>

              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center justify-start text-muted-foreground">
                  Date
                  {sorter.field === "date" &&
                    (sorter.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-start text-muted-foreground">
                  Description
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center justify-start text-muted-foreground">
                  Category
                  {sorter.field === "category" &&
                    (sorter.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>

              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end text-muted-foreground">
                  Amount
                  {sorter.field === "amount" &&
                    (sorter.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>

              <TableHead>
                <div className="flex items-center justify-start text-muted-foreground">
                  Recurring
                </div>
              </TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No Transactions to Show
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(transaction.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelected((prev) => [...prev, transaction.id]);
                        } else {
                          setSelected((prev) =>
                            prev.filter((id) => id !== transaction.id)
                          );
                        }
                      }}
                      className="cursor-pointer"
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.date), "PP")}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="capitalize">
                    <span
                      style={{
                        background: categoryColors[transaction.category],
                      }}
                      className="px-2 py-1 rounded text-white text-sm"
                    >
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell
                    className="text-right"
                    style={{
                      color: transaction.type === "DEBIT" ? "red" : "green",
                    }}
                  >
                    {transaction.type === "DEBIT" ? "-" : "+"}₹
                    {transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {transaction.isRecurring ? (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant="outline"
                            className="bg-[#e0f7fa] text-[#06b6d4] hover:bg-[#b2ebf2] border border-[#06b6d4]/30"
                          >
                            <RefreshCcw className="h-3 w-3 mr-1" />
                            {RECURRING_TIME[transaction.recurringInterval]}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <div className="font-medium">Next Date:</div>
                            <div>
                              {format(
                                new Date(transaction.nextRecurringDate),
                                "PP"
                              )}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        One-Time
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/transaction/create?edit=${transaction.id}`
                            )
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleSingleDelete(transaction.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 🔹 Pagination Controls */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={(val) => {
              setRowsPerPage(Number(val));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
export default TransactionTable;
