import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";

export default function TaskBoard() {
  const { data: putawayTasks } = trpc.wms.putawayTaskList.useQuery();
  const { data: pickingTasks } = trpc.wms.pickingTaskList.useQuery();
  const columns = [
    { title: "Pending", status: "pending", color: "bg-yellow-50 border-yellow-200" },
    { title: "In Progress", status: "in_progress", color: "bg-blue-50 border-blue-200" },
    { title: "Completed", status: "completed", color: "bg-green-50 border-green-200" },
    { title: "Cancelled", status: "cancelled", color: "bg-red-50 border-red-200" },
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Task Board</h2>
      <div className="grid grid-cols-4 gap-4">
        {columns.map(col => (
          <div key={col.status} className={`rounded-lg border p-4 ${col.color}`}>
            <h3 className="font-semibold mb-3">{col.title}</h3>
            {putawayTasks?.filter((t: any) => t.status === col.status).map((t: any) => (
              <div key={t.id} className="bg-white rounded p-2 mb-2 shadow-sm text-xs"><strong>PA: {t.taskNumber}</strong><br />Product {t.productId}: {t.quantity}</div>
            ))}
            {pickingTasks?.filter((t: any) => t.status === col.status).map((t: any) => (
              <div key={t.id} className="bg-white rounded p-2 mb-2 shadow-sm text-xs border-l-4 border-blue-400"><strong>PK: {t.taskNumber}</strong><br />Product {t.productId}: {t.quantity}</div>
            ))}
            {(!putawayTasks?.filter((t: any) => t.status === col.status).length && !pickingTasks?.filter((t: any) => t.status === col.status).length) && (
              <p className="text-xs text-slate-400 text-center py-4">No tasks</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
