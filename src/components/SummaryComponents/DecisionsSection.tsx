
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DecisionsSectionProps {
  decisions: string[];
  isEditing: boolean;
  onDecisionChange: (index: number, text: string) => void;
  onRemoveDecision: (index: number) => void;
  onAddDecision: () => void;
}

export const DecisionsSection = ({
  decisions,
  isEditing,
  onDecisionChange,
  onRemoveDecision,
  onAddDecision,
}: DecisionsSectionProps) => {
  return (
    <section className="mb-6">
      <h3 className="text-lg font-medium mb-3">Decisions Made</h3>
      <ul className="space-y-3">
        {decisions.map((decision, index) => (
          <li key={index} className="decision flex items-start gap-2 py-1 bg-muted/50 px-3 rounded-md">
            <span className="text-primary mt-1 flex-shrink-0">•</span>
            {!isEditing ? (
              <span>{decision}</span>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <Input
                  value={decision}
                  onChange={(e) => onDecisionChange(index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveDecision(index)}
                  className="h-8 w-8 p-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-x"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </Button>
              </div>
            )}
          </li>
        ))}
        {isEditing && (
          <li>
            <Button variant="ghost" size="sm" onClick={onAddDecision} className="mt-2">
              + Add Decision
            </Button>
          </li>
        )}
      </ul>
    </section>
  );
};
