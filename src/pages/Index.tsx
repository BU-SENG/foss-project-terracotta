

import { useState, useMemo, useEffect } from "react";
import { Task, SortField, SortOrder } from "@/types/task";
import { TaskItem } from "@/components/TaskItem";
import { TaskDialog } from "@/components/TaskDialog";
import { TaskFilters } from "@/components/TaskFilters";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

const generateId = () => {
  
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("priority");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

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
        
        id: generateId(),
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
    <div className="app-container">
      <div className="app-wrapper">
        <header className="app-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="app-title">Task Manager</h1>
              <p className="app-subtitle">Organize and track your tasks efficiently</p>
            </div>
            <div className="header-actions">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="theme-toggle"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button onClick={handleNewTask} className="new-task-btn">
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </div>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Total Tasks</p>
            <p className="stat-value">{stats.total}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Pending</p>
            <p className="stat-value">{stats.pending}</p>
          </div>
          <div className="stat-card stat-card-primary">
            <p className="stat-label stat-label-primary">In Progress</p>
            <p className="stat-value stat-value-primary">{stats.ongoing}</p>
          </div>
          <div className="stat-card stat-card-accent">
            <p className="stat-label stat-label-accent">Completed</p>
            <p className="stat-value stat-value-accent">{stats.completed}</p>
          </div>
        </div>

        <div className="filters-container">
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

        <div className="tasks-list">
          {filteredAndSortedTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="empty-title">
                {searchQuery ? "No tasks found" : "No tasks yet"}
              </h3>
              <p className="empty-description">
                {searchQuery 
                  ? "Try adjusting your search criteria to find what you're looking for" 
                  : "Get started by creating your first task and stay organized"}
              </p>
              {!searchQuery && (
                <Button onClick={handleNewTask} className="empty-action-btn">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Task
                </Button>
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