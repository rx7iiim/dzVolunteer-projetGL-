import type React from "react"
import { cn } from "@/lib/utils"
import { Heart, Globe, Target, Zap, Leaf, Users, Book, Apple, Home, Hammer, Landmark, CircleDot } from "lucide-react"

interface MissionCardProps {
  id: string
  title: string
  organization: string
  location: string
  date: string
  hoursRequired: number
  primarySDG: number // 1-17
  skillsRequired: string[]
  description: string
}

// SDG Icon mapping
const sdgIcons: Record<number, React.ReactNode> = {
  1: <Zap className="w-6 h-6" />, // No Poverty - lightning
  2: <Apple className="w-6 h-6" />, // Zero Hunger - apple
  3: <Heart className="w-6 h-6" />, // Good Health - heart
  4: <Book className="w-6 h-6" />, // Quality Education - book
  5: <Users className="w-6 h-6" />, // Gender Equality - users
  6: <Globe className="w-6 h-6" />, // Clean Water - globe
  7: <Zap className="w-6 h-6" />, // Affordable Energy - zap
  8: <Hammer className="w-6 h-6" />, // Decent Work - hammer
  9: <Target className="w-6 h-6" />, // Industry Innovation - target
  10: <Users className="w-6 h-6" />, // Reduced Inequalities - users
  11: <Home className="w-6 h-6" />, // Sustainable Cities - home
  12: <Leaf className="w-6 h-6" />, // Responsible Consumption - leaf
  13: <Leaf className="w-6 h-6" />, // Climate Action - leaf
  14: <Globe className="w-6 h-6" />, // Life Below Water - globe
  15: <Leaf className="w-6 h-6" />, // Life on Land - leaf
  16: <Landmark className="w-6 h-6" />, // Peace Justice - landmark
  17: <CircleDot className="w-6 h-6" />, // Partnerships - circle dot
}

const sdgColors = [
  "", // placeholder for index 0
  "text-red-500", // 1
  "text-yellow-500", // 2
  "text-green-500", // 3
  "text-red-600", // 4
  "text-red-500", // 5
  "text-blue-500", // 6
  "text-yellow-600", // 7
  "text-red-700", // 8
  "text-orange-600", // 9
  "text-red-500", // 10
  "text-orange-500", // 11
  "text-yellow-600", // 12
  "text-green-700", // 13
  "text-blue-600", // 14
  "text-green-600", // 15
  "text-blue-700", // 16
  "text-purple-500", // 17
]

export const MissionCard: React.FC<MissionCardProps> = ({
  title,
  organization,
  location,
  date,
  hoursRequired,
  primarySDG,
  skillsRequired,
  description,
}) => {
  return (
    <div className="rounded-3xl border-2 border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:scale-105">
      {/* Header with SDG Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{organization}</p>
        </div>
        <div className={cn("rounded-full bg-gray-50 p-3", sdgColors[primarySDG])}>{sdgIcons[primarySDG]}</div>
      </div>

      {/* Mission Details */}
      <div className="space-y-2 mb-4 text-sm text-gray-700">
        <p>📍 {location}</p>
        <p>📅 {date}</p>
        <p>⏱️ {hoursRequired} hours</p>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>

      {/* Skills Required */}
      <div className="flex flex-wrap gap-2 mb-4">
        {skillsRequired.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
          >
            {skill}
          </span>
        ))}
        {skillsRequired.length > 3 && (
          <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            +{skillsRequired.length - 3} more
          </span>
        )}
      </div>

      {/* CTA Button */}
      <button className="w-full rounded-2xl bg-[#58CC02] border-b-4 border-[#46A302] py-3 font-semibold text-white transition-all active:border-b-0 active:translate-y-1 hover:brightness-110">
        View Mission
      </button>
    </div>
  )
}
