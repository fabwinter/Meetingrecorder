
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FolderPlus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoveToFolderDialog } from "./MoveToFolderDialog";

interface MeetingCardProps {
  id: string;
  title: string;
  date: string;
  duration: string;
  keyPoints: string[];
  decisions?: { id: string; text: string }[]; 
  actionItems?: { id: string; text: string; completed: boolean }[];
  tags?: string[];
  onDeleteClick?: () => void;
  onMoveSuccess?: () => void; // Callback when meeting is moved successfully
  folderName?: string; // Added to display current folder name
  folderColor?: string; // Added to display current folder color
}

export const MeetingCard = ({ 
  id, 
  title, 
  date, 
  duration, 
  keyPoints = [], // Provide default empty array
  decisions = [], 
  actionItems = [], 
  tags = [],
  onDeleteClick,
  onMoveSuccess,
  folderName,
  folderColor
}: MeetingCardProps) => {
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);

  // Ensure keyPoints is always an array
  const safeKeyPoints = Array.isArray(keyPoints) ? keyPoints : [];

  return (
    <>
      <Card className="hover:shadow-md transition-shadow bg-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <Link to={`/summary?id=${id}`} className="flex-1">
              <h3 className="font-medium text-lg mb-1">{title}</h3>
              <div className="flex gap-2 text-sm text-muted-foreground mb-3">
                <span>{date}</span>
                <span>•</span>
                <span>{duration}</span>
              </div>
              
              {/* Display the folder if available */}
              {folderName && (
                <div className="flex items-center mb-2">
                  <div 
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: folderColor || '#cccccc' }}
                  ></div>
                  <span className="text-xs text-muted-foreground">{folderName}</span>
                </div>
              )}
              
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{tags.length - 3}</span>
                  )}
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Key points:</p>
                <ul className="text-sm">
                  {safeKeyPoints.slice(0, 2).map((point, index) => (
                    <li key={index} className="truncate">{point}</li>
                  ))}
                  {safeKeyPoints.length > 2 && (
                    <li className="text-primary text-sm mt-1">+ {safeKeyPoints.length - 2} more</li>
                  )}
                </ul>
              </div>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsMoveDialogOpen(true)}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Move to category
                </DropdownMenuItem>
                {onDeleteClick && (
                  <DropdownMenuItem 
                    onClick={onDeleteClick}
                    className="text-red-500 focus:text-red-500"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete meeting
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <MoveToFolderDialog 
        isOpen={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
        meetingId={id}
        onMoveSuccess={onMoveSuccess}
      />
    </>
  );
};
