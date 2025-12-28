"use client"

import type React from "react"
import { useState } from "react"
import { DuolingoButton } from "./ui/duolingo-button"
import { Check, Clock, AlertCircle } from "lucide-react"

interface Skill {
  name: string
  verified: boolean
}

interface ApplicationLogicDemoProps {
  requiredSkills: Skill[]
  userSkills: Skill[]
}

export const ApplicationLogic: React.FC<ApplicationLogicDemoProps> = ({ requiredSkills, userSkills }) => {
  const [applied, setApplied] = useState(false)

  // Check if user has all required verified skills
  const hasAllVerifiedSkills = requiredSkills.every((required) => {
    return userSkills.some((user) => user.name === required.name && user.verified)
  })

  const missingSkills = requiredSkills.filter(
    (required) => !userSkills.some((user) => user.name === required.name && user.verified),
  )

  const handleApply = () => {
    if (hasAllVerifiedSkills) {
      setApplied(true)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl border-2 border-gray-200">
      {/* Mission Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Community Outreach Coordinator</h2>
        <p className="text-gray-600">NGO X | Algiers</p>
      </div>

      {/* Required Skills Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Required Skills</h3>
        <div className="space-y-3">
          {requiredSkills.map((skill) => (
            <div key={skill.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="font-medium text-slate-900">{skill.name}</span>
              <span className="ml-auto text-sm font-medium text-gray-600">(Verification Required)</span>
            </div>
          ))}
        </div>
      </div>

      {/* User Skills Status */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Skills</h3>
        <div className="space-y-3">
          {userSkills.map((skill) => {
            const isRequired = requiredSkills.some((req) => req.name === skill.name)
            return (
              <div
                key={skill.name}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl",
                  isRequired ? "bg-blue-50 border border-blue-200" : "bg-gray-50",
                )}
              >
                {skill.verified ? (
                  <>
                    <Check className="w-5 h-5 text-[#58CC02]" />
                    <span className="font-medium text-slate-900">{skill.name}</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#58CC02]">
                      <Check className="w-4 h-4" /> Verified
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-[#FFC800]" />
                    <span className="font-medium text-slate-900">{skill.name}</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#FFC800]">
                      <Clock className="w-4 h-4" /> Pending
                    </span>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Alert / Status Message */}
      {!hasAllVerifiedSkills && (
        <div className="mb-6 rounded-2xl bg-[#FFE4E4] border-2 border-[#FF4B4B] p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#FF4B4B] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#D33131]">Missing Verified Skills</p>
            <p className="text-sm text-[#D33131]">
              {missingSkills.map((s) => s.name).join(", ")} must be verified before you can apply.
            </p>
          </div>
        </div>
      )}

      {/* Apply Button with Conditional Logic */}
      <div className="flex gap-4">
        <DuolingoButton
          variant={hasAllVerifiedSkills ? "primary" : "danger"}
          size="lg"
          onClick={handleApply}
          disabled={!hasAllVerifiedSkills}
          className="flex-1"
        >
          {applied ? "✓ Applied!" : "Apply for Mission"}
        </DuolingoButton>
      </div>

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-100 rounded-xl text-xs text-gray-600">
        <p>
          <strong>Has all verified skills:</strong> {hasAllVerifiedSkills ? "Yes" : "No"}
        </p>
        <p>
          <strong>Button State:</strong>{" "}
          {applied ? "Applied" : hasAllVerifiedSkills ? "Enabled (Primary)" : "Disabled (Danger)"}
        </p>
      </div>
    </div>
  )
}

import { cn } from "@/lib/utils"
