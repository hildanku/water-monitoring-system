"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, RefreshCw, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import supabase from "@/lib/supabase";
import { format } from "date-fns";
import { useDataTable, type SortOrder } from "@/hooks/use-data-table";

type SortKey =
  | "timestamp"
  | "pump_status"
  | "mode"
  | "isi_ulang_ke"
  | "log_level";

export function EventTable() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["log_event"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("log_event")
        .select("*")
        .order("timestamp", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const { pagedData, totalPages } = useDataTable({
    data,
    search,
    searchFields: ["pump_status", "mode", "log_level", "event_message"],
    sortKey,
    sortOrder,
    currentPage,
    itemsPerPage,
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Log Event</h1>
            <p className="text-gray-600">
              Monitoring event log status pompa dan mode
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari event..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-sm"
          />
        </div>

        {/* Table */}
        <div className="rounded-md border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  onClick={() => handleSort("timestamp")}
                  className="cursor-pointer select-none"
                >
                  Timestamp{" "}
                  {sortKey === "timestamp" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp className="inline h-4 w-4" />
                    ) : (
                      <ArrowDown className="inline h-4 w-4" />
                    ))}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("pump_status")}
                  className="cursor-pointer select-none"
                >
                  Pump Status{" "}
                  {sortKey === "pump_status" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp className="inline h-4 w-4" />
                    ) : (
                      <ArrowDown className="inline h-4 w-4" />
                    ))}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("mode")}
                  className="cursor-pointer select-none"
                >
                  Mode{" "}
                  {sortKey === "mode" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp className="inline h-4 w-4" />
                    ) : (
                      <ArrowDown className="inline h-4 w-4" />
                    ))}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("isi_ulang_ke")}
                  className="cursor-pointer select-none"
                >
                  Isi Ulang Ke{" "}
                  {sortKey === "isi_ulang_ke" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp className="inline h-4 w-4" />
                    ) : (
                      <ArrowDown className="inline h-4 w-4" />
                    ))}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("log_level")}
                  className="cursor-pointer select-none"
                >
                  Log Level{" "}
                  {sortKey === "log_level" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp className="inline h-4 w-4" />
                    ) : (
                      <ArrowDown className="inline h-4 w-4" />
                    ))}
                </TableHead>
                <TableHead>Event Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-destructive py-6"
                  >
                    {(error as Error).message || "Error fetching data"}
                  </TableCell>
                </TableRow>
              ) : pagedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Tidak ada data ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                pagedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {format(
                        new Date(item.timestamp),
                        "yyyy-MM-dd HH:mm:ss"
                      )}
                    </TableCell>
                    <TableCell>{item.pump_status}</TableCell>
                    <TableCell>{item.mode}</TableCell>
                    <TableCell>{item.isi_ulang_ke}</TableCell>
                    <TableCell>{item.log_level}</TableCell>
                    <TableCell>{item.event_message}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagedData.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
