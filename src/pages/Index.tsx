import { useState, useMemo } from "react";
import { Task, SortField, SortOrder } from "@/types/task";
import { TaskItem } from "@/components/TaskItem";
import { TaskDialog } from "@/components/TaskDialog";
import { TaskFilters } from "@/components/TaskFilters";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("priority");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSaveTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
    const now = new Date();
    
    if (taskData.id) {
      setTasks(tasks.map(task => 
        task.id === taskData.id 
          ? { ...task, ...taskData, updatedAt: now }
          : task
      ));
      toast.success("Task updated successfully");
    } else {
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      setTasks([...tasks, newTask]);
      toast.success("Task created successfully");
    }
    
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast.success("Task deleted");
  };

  const handleStatusChange = (id: string, status: Task["status"]) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, status, updatedAt: new Date() }
        : task
    ));
    toast.success(`Task marked as ${status}`);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case "dueDate":
          const aDate = a.dueDate?.getTime() || Infinity;
          const bDate = b.dueDate?.getTime() || Infinity;
          comparison = aDate - bDate;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [tasks, searchQuery, sortField, sortOrder]);

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.status === "completed").length;
    const ongoing = tasks.filter(t => t.status === "ongoing").length;
    const pending = tasks.filter(t => t.status === "pending").length;
    return { completed, ongoing, pending, total: tasks.length };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">Task Manager</h1>
            <Button onClick={handleNewTask} className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>
          <p className="text-muted-foreground">
            Organize and track your tasks efficiently
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-1">Total</p>
            <p className="text-2xl font-bold text-card-foreground">{stats.total}</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold text-card-foreground">{stats.pending}</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-1">Ongoing</p>
            <p className="text-2xl font-bold text-primary">{stats.ongoing}</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-1">Completed</p>
            <p className="text-2xl font-bold text-accent">{stats.completed}</p>
          </div>
        </div>

        <div className="mb-6">
          <TaskFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortField={sortField}
            sortOrder={sortOrder}
            onSortChange={(field, order) => {
              setSortField(field);
              setSortOrder(order);
            }}
          />
        </div>

        <div className="space-y-3">
          {filteredAndSortedTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? "No tasks found" : "No tasks yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search" : "Create your first task to get started"}
              </p>
              {!searchQuery && (
                <Button onClick={handleNewTask}>Create Task</Button>
              )}
            </div>
          ) : (
            filteredAndSortedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </div>

        <TaskDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          task={editingTask}
          onSave={handleSaveTask}
        />
      </div>
    </div>
  );
};

export default Index;
