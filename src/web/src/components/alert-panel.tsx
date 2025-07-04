import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface AlertItem {
  id: string
  type: "info" | "warning" | "error"
  message: string
  timestamp: string
}

interface AlertPanelProps {
  alerts: AlertItem[]
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "info":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "error":
        return "destructive"
      case "warning":
        return "default"
      case "info":
        return "default"
      default:
        return "default"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          System Alerts
          <Badge variant="outline">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>All systems normal</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <Alert key={alert.id} variant={getAlertVariant(alert.type) as any}>
              {getAlertIcon(alert.type)}
              <AlertDescription className="flex justify-between items-center">
                <span>{alert.message}</span>
                <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
              </AlertDescription>
            </Alert>
          ))
        )}
      </CardContent>
    </Card>
  )
}
