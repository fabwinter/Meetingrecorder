
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface KeyPointsSectionProps {
  points: string[];
  isEditing: boolean;
  onPointChange: (index: number, text: string) => void;
  onRemovePoint: (index: number) => void;
  onAddPoint: () => void;
}

export const KeyPointsSection = ({
  points,
  isEditing,
  onPointChange,
  onRemovePoint,
  onAddPoint,
}: KeyPointsSectionProps) => {
  return (
    <section className="mb-6">
      <h3 className="text-lg font-medium mb-3">Key Discussion Points</h3>
      <ul className="space-y-2">
        {points.map((point, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            {!isEditing ? (
              <span>{point}</span>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <Input
                  value={point}
                  onChange={(e) => onPointChange(index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemovePoint(index)}
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
            <Button variant="ghost" size="sm" onClick={onAddPoint} className="mt-2">
              + Add Discussion Point
            </Button>
          </li>
        )}
      </ul>
    </section>
  );
};
