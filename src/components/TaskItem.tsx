import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2, Calendar, CheckCircle2, Circle, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task["status"]) => void;
}

const priorityConfig = {
  low: { label: "Low", className: "bg-priority-low text-white" },
  medium: { label: "Medium", className: "bg-priority-medium text-white" },
  high: { label: "High", className: "bg-priority-high text-white" },
};

const statusConfig = {
  pending: { icon: Circle, label: "Pending", color: "text-muted-foreground" },
  ongoing: { icon: Clock, label: "Ongoing", color: "text-primary" },
  completed: { icon: CheckCircle2, label: "Completed", color: "text-accent" },
};

export const TaskItem = ({ task, onEdit, onDelete, onStatusChange }: TaskItemProps) => {
  const StatusIcon = statusConfig[task.status].icon;
  
  return (
    <Card className={cn(
      "p-4 transition-all hover:shadow-md",
      task.status === "completed" && "opacity-60"
    )}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => {
            const nextStatus = task.status === "pending" ? "ongoing" : task.status === "ongoing" ? "completed" : "pending";
            onStatusChange(task.id, nextStatus);
          }}
          className="mt-1 transition-transform hover:scale-110"
        >
          <StatusIcon className={cn("h-5 w-5", statusConfig[task.status].color)} />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={cn(
              "font-semibold text-card-foreground",
              task.status === "completed" && "line-through"
            )}>
              {task.title}
            </h3>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(task)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={priorityConfig[task.priority].className}>
              {priorityConfig[task.priority].label}
            </Badge>
            
            <Badge variant="outline" className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {statusConfig[task.status].label}
            </Badge>
            
            {task.dueDate && (
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                {format(task.dueDate, "MMM dd, yyyy")}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
