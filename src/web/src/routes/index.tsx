import WaterMonitoringDashboard from '@/components/dashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: WaterMonitoringDashboard,
})