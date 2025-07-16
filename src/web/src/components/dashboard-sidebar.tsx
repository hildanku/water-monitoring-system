"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Waves,
  History,
  Zap,
  Menu,
  X,
  Home,
} from "lucide-react"
import { Link } from "@tanstack/react-router"

interface SidebarProps {
  className?: string
}

export function DashboardSidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
      active: true,
    },
    {
      title: "Log Water Level",
      icon: Waves,
      href: "/log/volume",
      badge: "Live",
    },
    {
      title: "Log Event",
      icon: History,
      href: "/log/event",
    },
    {
      title: "Pump Control",
      icon: Zap,
      href: "/pump-control",
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
            <Link
              key={index}
              to={item.href}
              className={cn(
                "flex items-center w-full rounded-md text-sm font-medium",
                "h-10 transition-colors",
                item.active
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-gray-700 hover:bg-gray-100",
                isCollapsed ? "justify-center px-2" : "justify-start px-3"
              )}
            >
              <Icon className={cn("w-4 h-4", !isCollapsed && "mr-3")} />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "px-2 py-1 text-xs rounded-full",
                        item.badge === "Live"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>

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
