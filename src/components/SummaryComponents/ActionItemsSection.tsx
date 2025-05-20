
import React from "react";
import { Check, Calendar as CalendarIcon, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface ActionItem {
  text: string;
  completed: boolean;
  responsible?: string;
  dueDate?: string;
}

interface ActionItemsSectionProps {
  actionItems: ActionItem[];
  isEditing: boolean;
  onToggleActionItem: (index: number) => void;
  onUpdateActionItemText: (index: number, text: string) => void;
  onUpdateActionItemResponsible: (index: number, responsible: string) => void;
  onUpdateActionItemDueDate: (index: number, dueDate: string) => void;
  onRemoveActionItem: (index: number) => void;
  onAddActionItem: () => void;
}

export const ActionItemsSection = ({
  actionItems,
  isEditing,
  onToggleActionItem,
  onUpdateActionItemText,
  onUpdateActionItemResponsible,
  onUpdateActionItemDueDate,
  onRemoveActionItem,
  onAddActionItem,
}: ActionItemsSectionProps) => {
  return (
    <section className="mb-8">
      <h3 className="text-lg font-medium mb-3">Action Items</h3>
      <ul className="space-y-4">
        {actionItems.map((item, index) => (
          <li key={index} className="action-item space-y-2">
            <div
              className="flex items-start gap-2 py-1"
              onClick={() => onToggleActionItem(index)}
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center cursor-pointer ${
                  item.completed
                    ? "bg-primary border-primary"
                    : "border-muted-foreground"
                }`}
              >
                {item.completed && <Check size={12} className="text-primary-foreground" />}
              </div>
              {!isEditing ? (
                <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                  {item.text}
                </span>
              ) : (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={item.text}
                    onChange={(e) => onUpdateActionItemText(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveActionItem(index);
                    }}
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
            </div>

            <div className="flex flex-wrap gap-2 ml-7">
              <div className="flex items-center gap-1 bg-muted/40 px-2 py-1 rounded text-sm">
                <User size={14} className="text-muted-foreground" />
                <Input
                  className="h-6 w-32 px-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
                  placeholder="Responsible"
                  value={item.responsible || ""}
                  onChange={(e) => onUpdateActionItemResponsible(index, e.target.value)}
                />
              </div>

              <div className="flex items-center gap-1 bg-muted/40 px-2 py-1 rounded text-sm">
                <CalendarIcon size={14} className="text-muted-foreground" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-32 justify-start p-0 font-normal"
                    >
                      {item.dueDate || "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={item.dueDate ? new Date(item.dueDate) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          onUpdateActionItemDueDate(index, format(date, "PPP"));
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </li>
        ))}
        {isEditing && (
          <li>
            <Button variant="ghost" size="sm" onClick={onAddActionItem} className="mt-2">
              + Add Action Item
            </Button>
          </li>
        )}
      </ul>
    </section>
  );
};
