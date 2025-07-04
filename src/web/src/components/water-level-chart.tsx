import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface WaterLevelChartProps {
  currentLevel: number
  maxLevel: number
  minLevel: number
}

export function WaterLevelChart({ currentLevel, maxLevel, minLevel }: WaterLevelChartProps) {
  const percentage = ((currentLevel - minLevel) / (maxLevel - minLevel)) * 100
  const safePercentage = Math.max(0, Math.min(100, percentage))

  const getStatusColor = () => {
    if (safePercentage < 20) return "bg-red-500"
    if (safePercentage < 40) return "bg-yellow-500"
    return "bg-blue-500"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Water Level Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tank visualization */}
          <div className="relative mx-auto w-32 h-48 border-2 border-gray-300 rounded-b-lg bg-gray-50">
            <div
              className={`absolute bottom-0 left-0 right-0 rounded-b-lg transition-all duration-500 ${getStatusColor()}`}
              style={{ height: `${safePercentage}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-700">{currentLevel}cm</span>
            </div>
          </div>

          {/* Level indicators */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Maximum Level:</span>
              <span className="font-semibold">{maxLevel}cm</span>
            </div>
            <div className="flex justify-between">
              <span>Current Level:</span>
              <span className="font-semibold">{currentLevel}cm</span>
            </div>
            <div className="flex justify-between">
              <span>Minimum Level:</span>
              <span className="font-semibold">{minLevel}cm</span>
            </div>
          </div>

          <Progress value={safePercentage} className="h-3" />
          <p className="text-center text-sm text-muted-foreground">{safePercentage.toFixed(1)}% Full</p>
        </div>
      </CardContent>
    </Card>
  )
}