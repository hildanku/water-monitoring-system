"use client"

import { useState, useEffect } from "react"
import { SensorCard } from "@/components/sensor-card"
import { PumpControl } from "@/components/pump-control"
import { AlertPanel } from "@/components/alert-panel"
import { WaterLevelChart } from "@/components/water-level-chart"
import { Droplets, Zap, Waves, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WaterMonitoringDashboard() {
  // Simulated sensor data - replace with real sensor readings
  const [sensorData, setSensorData] = useState({
    waterLevel: 45, // cm from HC-SR04
    tdsValue: 320, // ppm
    pumpRunning: false,
    pumpRuntime: "2h 15m",
    flowRate: 12.5,
  })

  const [alerts, setAlerts] = useState([
    {
      id: "1",
      type: "warning" as const,
      message: "TDS level approaching upper limit",
      timestamp: "2 min ago",
    },
    {
      id: "2",
      type: "info" as const,
      message: "Pump maintenance due in 5 days",
      timestamp: "1 hour ago",
    },
  ])

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData((prev) => ({
        ...prev,
        waterLevel: prev.waterLevel + (Math.random() - 0.5) * 2,
        tdsValue: prev.tdsValue + (Math.random() - 0.5) * 10,
        flowRate: prev.pumpRunning ? 12.5 + (Math.random() - 0.5) * 2 : 0,
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handlePumpToggle = () => {
    setSensorData((prev) => ({
      ...prev,
      pumpRunning: !prev.pumpRunning,
    }))
  }

  const handleRefresh = () => {
    // Simulate data refresh
    setSensorData((prev) => ({
      ...prev,
      waterLevel: 45 + (Math.random() - 0.5) * 10,
      tdsValue: 320 + (Math.random() - 0.5) * 50,
    }))
  }

  const getWaterLevelStatus = (level: number) => {
    if (level < 20) return "critical"
    if (level < 35) return "warning"
    return "normal"
  }

  const getTDSStatus = (tds: number) => {
    if (tds > 500 || tds < 50) return "critical"
    if (tds > 400 || tds < 100) return "warning"
    return "normal"
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Water Level Monitoring</h1>
            <p className="text-gray-600">Real-time monitoring of water quality and levels</p>
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
            value={sensorData.waterLevel.toFixed(1)}
            unit="cm"
            status={getWaterLevelStatus(sensorData.waterLevel)}
            progress={Math.max(0, Math.min(100, (sensorData.waterLevel / 60) * 100))}
            icon={<Waves className="h-4 w-4" />}
          />

          <SensorCard
            title="TDS Sensor"
            value={sensorData.tdsValue.toFixed(0)}
            unit="ppm"
            status={getTDSStatus(sensorData.tdsValue)}
            icon={<Droplets className="h-4 w-4" />}
          />

          <SensorCard
            title="System Status"
            value={sensorData.pumpRunning ? "Active" : "Standby"}
            status={sensorData.pumpRunning ? "normal" : "warning"}
            icon={<Zap className="h-4 w-4" />}
          />
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Water Level Visualization */}
          <WaterLevelChart currentLevel={sensorData.waterLevel} maxLevel={60} minLevel={10} />

          {/* Pump Control */}
          <PumpControl
            isRunning={sensorData.pumpRunning}
            onToggle={handlePumpToggle}
            onSettings={() => console.log("Open pump settings")}
            runtime={sensorData.pumpRuntime}
            flowRate={sensorData.flowRate}
          />

          {/* Alerts */}
          <AlertPanel alerts={alerts} />
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Sensor Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">HC-SR04 Ultrasonic</h4>
              <p className="text-blue-700">Measures water level distance</p>
              <p className="text-blue-600">Range: 2-400cm</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900">TDS Sensor</h4>
              <p className="text-green-700">Total Dissolved Solids</p>
              <p className="text-green-600">Optimal: 150-300 ppm</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900">Water Pump</h4>
              <p className="text-purple-700">Automated water circulation</p>
              <p className="text-purple-600">Flow: 10-15 L/min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
