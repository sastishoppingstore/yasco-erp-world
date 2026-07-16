import React, { useMemo } from "react";
import { format, addDays, differenceInDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import styles from "./GanttChart.module.css";

export interface GanttTask {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  percentComplete: number;
  isCritical: boolean;
  slack?: number;
  resource?: string;
  predecessors?: number[];
  variance?: number;
}

interface GanttChartProps {
  tasks: GanttTask[];
  startDate?: Date;
  endDate?: Date;
  onTaskClick?: (task: GanttTask) => void;
  readOnly?: boolean;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  startDate,
  endDate,
  onTaskClick,
  readOnly = true,
}) => {
  const { gridDates, pixelsPerDay, timelineStart } = useMemo(() => {
    const start = startDate || (tasks.length > 0 ? new Date(Math.min(...tasks.map(t => t.startDate.getTime()))) : new Date());
    const end = endDate || (tasks.length > 0 ? new Date(Math.max(...tasks.map(t => t.endDate.getTime()))) : addDays(new Date(), 30));
    
    const days = differenceInDays(end, start) + 1;
    const width = Math.max(800, days * 30);
    const pixelsPerDay = width / days;
    const dates: Date[] = [];
    
    for (let i = 0; i < days; i++) {
      dates.push(addDays(start, i));
    }

    return {
      gridDates: dates,
      pixelsPerDay,
      timelineStart: start,
    };
  }, [tasks, startDate, endDate]);

  const getTaskPosition = (task: GanttTask) => {
    const startOffset = differenceInDays(task.startDate, timelineStart) * pixelsPerDay;
    const width = task.duration * pixelsPerDay;
    return { left: startOffset, width };
  };

  const getCriticalPathColor = (task: GanttTask) => {
    if (task.isCritical) {
      return "bg-red-500"; // Critical path in red
    }
    if ((task.slack || 0) < 3) {
      return "bg-yellow-500"; // Near-critical in yellow
    }
    return "bg-blue-500"; // Normal task in blue
  };

  const getVarianceIndicator = (task: GanttTask) => {
    if (!task.variance) return null;
    if (task.variance > 0) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (task.variance < -2) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    return null;
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Project Gantt Chart</span>
          <div className="flex gap-3 text-sm">
            <Badge variant="outline" className="bg-red-50">
              <span className="w-3 h-3 bg-red-500 rounded-sm mr-2"></span>Critical Path
            </Badge>
            <Badge variant="outline" className="bg-yellow-50">
              <span className="w-3 h-3 bg-yellow-500 rounded-sm mr-2"></span>Near-Critical
            </Badge>
            <Badge variant="outline" className="bg-blue-50">
              <span className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></span>Normal
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="overflow-x-auto">
        <div className="relative" style={{ minWidth: Math.max(800, gridDates.length * 30) }}>
          {/* Timeline Header */}
          <div className="sticky top-0 z-10 bg-slate-50 border-b">
            <div className="flex h-16">
              <div className="w-32 border-r flex items-center px-3 font-semibold text-sm">
                Task Name
              </div>
              <div className="flex-1 relative">
                <div className="flex h-8 border-b">
                  {gridDates.map((date, idx) => (
                    (idx % 7 === 0) && (
                      <div
                        key={idx}
                        style={{ width: pixelsPerDay * 7 }}
                        className="border-r text-xs text-slate-600 px-1 flex items-center"
                      >
                        {format(date, "MMM d")}
                      </div>
                    )
                  ))}
                </div>
                <div className="flex h-8 border-b text-xs text-slate-400">
                  {gridDates.map((_, idx) => (
                    <div
                      key={idx}
                      style={{ width: pixelsPerDay }}
                      className="border-r text-center"
                    >
                      {(idx + 1) % 7 === 0 ? "•" : ""}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="relative">
            {tasks.map((task, idx) => {
              const { left, width } = getTaskPosition(task);

              return (
                <div
                  key={task.id}
                  className="flex h-12 border-b hover:bg-slate-50 transition-colors"
                >
                  {/* Task Name */}
                  <div className="w-32 border-r px-3 flex items-center text-sm font-medium truncate">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="truncate">
                          {task.name}
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs space-y-1">
                            <p><strong>Duration:</strong> {task.duration} days</p>
                            {task.slack !== undefined && <p><strong>Slack:</strong> {task.slack} days</p>}
                            <p><strong>Complete:</strong> {task.percentComplete}%</p>
                            {task.resource && <p><strong>Resource:</strong> {task.resource}</p>}
                            {task.variance && <p><strong>Variance:</strong> {task.variance > 0 ? "+" : ""}{task.variance} days</p>}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Timeline Bar */}
                  <div
                    className="flex-1 relative cursor-pointer"
                    onClick={() => onTaskClick?.(task)}
                  >
                    {/* Background grid */}
                    <div className="absolute inset-0 flex">
                      {gridDates.map((_, idx) => (
                        <div
                          key={idx}
                          style={{ width: pixelsPerDay }}
                          className="border-r border-slate-100"
                        />
                      ))}
                    </div>

                    {/* Task Bar */}
                    <div
                      className={`absolute top-2 bottom-2 rounded shadow-sm transition-shadow hover:shadow-md ${getCriticalPathColor(task)}`}
                      style={{ left, width: Math.max(width, 20) }}
                    >
                      {/* Progress Bar */}
                      <div
                        className="absolute inset-0 bg-opacity-40 bg-black rounded"
                        style={{ width: `${task.percentComplete}%` }}
                      />

                      {/* Task Label */}
                      {width > 100 && (
                        <div className="absolute inset-0 flex items-center px-2 text-xs font-semibold text-white truncate">
                          {task.percentComplete}%
                        </div>
                      )}

                      {/* Variance Indicator */}
                      {getVarianceIndicator(task) && (
                        <div className="absolute -right-5 top-1/2 transform -translate-y-1/2">
                          {getVarianceIndicator(task)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      {/* Summary Stats */}
      <div className="border-t bg-slate-50 px-6 py-4 grid grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-slate-600">Total Tasks</p>
          <p className="text-2xl font-bold">{tasks.length}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600">Critical Path</p>
          <p className="text-2xl font-bold text-red-500">
            {tasks.filter(t => t.isCritical).length}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-600">Avg. Completion</p>
          <p className="text-2xl font-bold">
            {Math.round(tasks.reduce((a, t) => a + t.percentComplete, 0) / tasks.length)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-600">Total Duration</p>
          <p className="text-2xl font-bold">
            {differenceInDays(
              Math.max(...tasks.map(t => t.endDate.getTime())),
              Math.min(...tasks.map(t => t.startDate.getTime()))
            )} days
          </p>
        </div>
      </div>
    </Card>
  );
};

export default GanttChart;
