"use client"

import { useQuery } from "@tanstack/react-query"
import { SensorCard } from "@/components/sensor-card"
import { PumpControl } from "@/components/pump-control"
import { AlertPanel } from "@/components/alert-panel"
import { WaterLevelChart } from "@/components/water-level-chart"
import { Droplets, Zap, Waves, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import supabase from "@/lib/supabase";
import { useState } from "react";

export default function WaterMonitoringDashboard() {
  const {
    data: latestVolume,
    isLoading: isLoadingVolume,
    isError: isErrorVolume,
    refetch: refetchVolume,
  } = useQuery({
    queryKey: ["latest_volume"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("log_level_air")
        .select("volume_liter")
        .order("timestamp", { ascending: false })
        .limit(1)
        .single()
      if (error) throw new Error(error.message)
      return data.volume_liter
    },
    refetchInterval: 5000,
  })

  // Query TDS
  const {
    data: latestTDS,
    isLoading: isLoadingTDS,
    isError: isErrorTDS,
    refetch: refetchTDS,
  } = useQuery({
    queryKey: ["latest_tds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("log_level_air")
        .select("tds_ppm")
        .order("timestamp", { ascending: false })
        .limit(1)
        .single()
      if (error) throw new Error(error.message)
      return data.tds_ppm
    },
    refetchInterval: 5000,
  })

  // Query Pump Status
  const {
    data: latestPump,
    isLoading: isLoadingPump,
    isError: isErrorPump,
    refetch: refetchPump,
  } = useQuery({
    queryKey: ["latest_pump"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("log_event")
        .select("pump_status")
        .order("timestamp", { ascending: false })
        .limit(1)
        .single()
      if (error) throw new Error(error.message)
      return data.pump_status
    },
    refetchInterval: 5000,
  })

  const [alerts] = useState([
    {
      id: "1",
      type: "warning" as const,
      message: "TDS level approaching upper limit",
      timestamp: "2 min ago",
    },
  ])

  const handleRefresh = () => {
    refetchVolume()
    refetchTDS()
    refetchPump()
  }

  const getWaterLevelStatus = (volume: number) => {
    if (volume < 0.3) return "critical"
    if (volume < 0.6) return "warning"
    return "normal"
  }

  const getTDSStatus = (tds: number) => {
    if (tds > 500 || tds < 50) return "critical"
    if (tds > 400 || tds < 100) return "warning"
    return "normal"
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Water Level Monitoring
              </h1>
              <p className="text-gray-600">
                Real-time monitoring of water quality and levels
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>

          {/* Sensor Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SensorCard
              title="Water Level (HC-SR04)"
              value={
                isLoadingVolume
                  ? "Loading..."
                  : isErrorVolume
                  ? "Error"
                  : latestVolume?.toFixed(2)
              }
              unit="L"
              status={
                latestVolume
                  ? getWaterLevelStatus(latestVolume)
                  : "warning"
              }
              progress={
                latestVolume
                  ? Math.max(0, Math.min(100, (latestVolume / 1.3) * 100))
                  : undefined
              }
              icon={<Waves className="h-4 w-4" />}
            />

            <SensorCard
              title="TDS Sensor"
              value={
                isLoadingTDS
                  ? "Loading..."
                  : isErrorTDS
                  ? "Error"
                  : latestTDS
              }
              unit="ppm"
              status={
                latestTDS
                  ? getTDSStatus(latestTDS)
                  : "warning"
              }
              icon={<Droplets className="h-4 w-4" />}
            />

            {/* Pump Status */}
            <SensorCard
              title="System Status"
              value={
                isLoadingPump
                  ? "Loading..."
                  : isErrorPump
                  ? "Error"
                  : latestPump === "active"
                  ? "Active"
                  : "Standby"
              }
              status={
                latestPump === "active" ? "normal" : "warning"
              }
              icon={<Zap className="h-4 w-4" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <WaterLevelChart
              currentLevel={latestVolume ?? 0}
              maxLevel={1.3}
              minLevel={0}
            />

            <PumpControl
              isRunning={latestPump === "active"}
              onToggle={() => console.log("Toggle pump")}
              onSettings={() => console.log("Open pump settings")}
              runtime="2h 15m"
              flowRate={latestPump === "active" ? 12.5 : 0}
            />

            <AlertPanel alerts={alerts} />
          </div>
        </div>
      </div>
    </div>
  )
}
