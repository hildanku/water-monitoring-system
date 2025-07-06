import { EventTable } from '@/components/table/event'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/log/event')({
  component: EventTable,
})