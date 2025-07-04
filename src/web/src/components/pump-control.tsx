"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Power, Settings } from "lucide-react"

interface PumpControlProps {
  isRunning: boolean
  onToggle: () => void
  onSettings: () => void
  runtime: string
  flowRate: number
}

export function PumpControl({ isRunning, onToggle, onSettings, runtime, flowRate }: PumpControlProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Power className="h-5 w-5" />
          Pump Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Pump Status</span>
          <div className="flex items-center gap-2">
            <Badge variant={isRunning ? "default" : "secondary"}>{isRunning ? "RUNNING" : "STOPPED"}</Badge>
            <Switch checked={isRunning} onCheckedChange={onToggle} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Runtime Today</p>
            <p className="font-semibold">{runtime}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Flow Rate</p>
            <p className="font-semibold">{flowRate} L/min</p>
          </div>
        </div>

        <Button variant="outline" onClick={onSettings} className="w-full bg-transparent">
          <Settings className="h-4 w-4 mr-2" />
          Pump Settings
        </Button>
      </CardContent>
    </Card>
  )
}
