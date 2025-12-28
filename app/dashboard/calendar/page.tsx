"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface VolunteerEvent {
  date: number
  month: number
  title: string
  type: "mission" | "deadline" | "milestone"
  color: string
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1))

  const [events] = useState<VolunteerEvent[]>([
    { date: 15, month: 0, title: "Youth Mentorship Start", type: "mission", color: "bg-primary" },
    { date: 28, month: 0, title: "Mentorship Ends", type: "deadline", color: "bg-accent" },
    { date: 1, month: 1, title: "Environment Clean-up", type: "mission", color: "bg-secondary" },
    { date: 15, month: 1, title: "Clean-up Ends", type: "deadline", color: "bg-accent" },
    { date: 20, month: 0, title: "Digital Workshop Start", type: "mission", color: "bg-primary" },
    { date: 10, month: 1, title: "50 Hours Milestone", type: "milestone", color: "bg-orange-500" },
  ])

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getEventsForDate = (day: number) => {
    return events.filter((e) => e.date === day && e.month === currentDate.getMonth())
  }

  const calendarDays = []
  const daysToShow = firstDayOfMonth(currentDate) + daysInMonth(currentDate)

  for (let i = 0; i < daysToShow; i++) {
    if (i < firstDayOfMonth(currentDate)) {
      calendarDays.push(null)
    } else {
      calendarDays.push(i - firstDayOfMonth(currentDate) + 1)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Volunteer Calendar</h1>
        <p className="text-lg text-muted-foreground">Track your missions and deadlines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={handleNextMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-2">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    const dayEvents = day ? getEventsForDate(day) : []
                    return (
                      <div
                        key={index}
                        className={`aspect-square p-2 rounded-lg border transition-colors ${
                          day ? "border-border hover:border-primary/20 hover:bg-muted/50" : "border-transparent"
                        }`}
                      >
                        {day && (
                          <div className="h-full flex flex-col">
                            <span className="text-sm font-semibold text-foreground">{day}</span>
                            <div className="flex-1 flex flex-col gap-1 mt-1 overflow-hidden">
                              {dayEvents.map((event, i) => (
                                <div
                                  key={i}
                                  className={`text-xs px-1 py-0.5 rounded text-white truncate font-medium ${event.color}`}
                                  title={event.title}
                                >
                                  {event.title}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {events
                .filter((e) => e.month === currentDate.getMonth())
                .sort((a, b) => a.date - b.date)
                .map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/20 transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${event.color}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {monthNames[event.month]} {event.date}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {event.type}
                    </Badge>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
