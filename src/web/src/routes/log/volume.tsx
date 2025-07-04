import { WaterVolumeTable } from '@/components/table/water-volume'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/log/volume')({
  component: WaterVolumeTable,
})
