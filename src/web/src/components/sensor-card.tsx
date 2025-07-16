import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface SensorCardProps {
  title: string
  value: string | number
  unit?: string
  status: "normal" | "warning" | "critical"
  progress?: number
  icon: React.ReactNode
}

export function SensorCard({ title, value, unit, status, progress, icon }: SensorCardProps) {

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "normal":
        return "default"
      case "warning":
        return "secondary"
      case "critical":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {value} {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          <Badge variant={getStatusVariant(status) as any}>{status.toUpperCase()}</Badge>
        </div>
        {progress !== undefined && (
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{progress}% capacity</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
