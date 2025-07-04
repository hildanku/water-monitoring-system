"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import supabase from "@/lib/supabase"
import { format } from "date-fns"

export function WaterVolumeTable() {
  const [search, setSearch] = useState("")

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["log_level_air"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("log_level_air")
        .select("*")
        .order("timestamp", { ascending: false })
      if (error) throw new Error(error.message)
      return data
    },
  })

  const filteredData = (data ?? []).filter(
    (item) =>
      item.tds_ppm?.toString().includes(search) ||
      item.volume_liter?.toString().includes(search)
  )

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Log Level Air
            </h1>
            <p className="text-gray-600">
              Monitoring volume air dan TDS secara historis
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Search Input */}
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari volume atau TDS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Table */}
        <div className="rounded-md border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Volume (Liter)</TableHead>
                <TableHead>TDS (ppm)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(3)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-destructive py-6"
                  >
                    {(error as Error).message || "Error fetching data"}
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Tidak ada data ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {format(new Date(item.timestamp), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell>{item.volume_liter?.toFixed(2)}</TableCell>
                    <TableCell>{item.tds_ppm}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
