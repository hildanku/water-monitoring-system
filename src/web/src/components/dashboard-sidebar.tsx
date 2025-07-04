"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Waves,
  Droplets,
  Settings,
  BarChart3,
  Bell,
  History,
  Zap,
  Menu,
  X,
  Home,
  Database,
  AlertTriangle,
} from "lucide-react"

interface SidebarProps {
  className?: string
}

export function DashboardSidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
      active: true,
    },
    {
      title: "Water Level",
      icon: Waves,
      href: "/water-level",
      badge: "Live",
    },
    {
      title: "TDS Monitoring",
      icon: Droplets,
      href: "/tds-monitoring",
    },
    {
      title: "Pump Control",
      icon: Zap,
      href: "/pump-control",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/analytics",
    },
    {
      title: "Alerts",
      icon: Bell,
      href: "/alerts",
      badge: "2",
    },
    {
      title: "History",
      icon: History,
      href: "/history",
    },
    {
      title: "Data Logs",
      icon: Database,
      href: "/data-logs",
    },
    {
      title: "Maintenance",
      icon: AlertTriangle,
      href: "/maintenance",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ]

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Kelompok 8</h2>
              <p className="text-xs text-gray-500">Monitoring Tandon Air</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="p-2">
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          return (
            <Button
              key={index}
              variant={item.active ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-10",
                isCollapsed ? "px-2" : "px-3",
                item.active && "bg-blue-600 text-white hover:bg-blue-700",
              )}
            >
              <Icon className={cn("w-4 h-4", !isCollapsed && "mr-3")} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "px-2 py-1 text-xs rounded-full",
                        item.badge === "Live" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Button>
          )
        })}
      </nav>

      {/* Quick Stats */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="text-sm font-medium text-gray-900">Quick Stats</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Water Level</span>
              <span className="font-medium text-blue-600">45.2 cm</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">TDS Level</span>
              <span className="font-medium text-green-600">320 ppm</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pump Status</span>
              <span className="font-medium text-orange-600">Standby</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
