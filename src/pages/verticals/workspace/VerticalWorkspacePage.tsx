import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  Search, Plus, Filter, Download, Upload, 
  MoreVertical, Eye, Edit, Trash2, Calendar,
  Phone, Mail, DollarSign, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VERTICAL_WORKSPACES, type VerticalWorkspace, type WorkspaceRecord } from "@/config/verticalWorkspaces";
import { t, isRTL } from "@/lib/i18n";

/**
 * RAWAFED UNIVERSAL SAAS - Generic Vertical Workspace
 * 
 * This component renders operational workspaces for all Saudi business categories:
 * - Facility Management (AMC contracts, work orders)
 * - Events (bookings, packages, deposits)
 * - Marketing Agency (campaigns, retainers, ad spend)
 * - Professional Services (matters, engagements, timesheets)
 * - Agriculture (farm operations, harvests)
 * - Energy (solar projects, generator rentals)
 * - Mining (weighbridge, dispatch)
 * - Marine (shipment files, container tracking)
 * - Veterinary (pet profiles, appointments)
 * - Nonprofit (donor CRM, cases)
 * - Tailoring (measurements, orders)
 * - Jewelry (gold desk, weight/carat)
 * - Repair (tickets, IMEI tracking)
 * - Furniture (custom orders, installations)
 * - Printing (print jobs, proofs)
 * - Water Services (routes, subscriptions)
 * - Financial Services (policies, commissions)
 * - Import/Export (import files, customs)
 */

export default function VerticalWorkspacePage() {
  const { verticalId } = useParams<{ verticalId: string }>();
  const navigate = useNavigate();
  const rtl = isRTL();

  // Find workspace config
  const workspace = useMemo(() => {
    return VERTICAL_WORKSPACES.find(w => w.id === verticalId);
  }, [verticalId]);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WorkspaceRecord | null>(null);
  const [records, setRecords] = useState<WorkspaceRecord[]>(workspace?.seeds || []);

  // Filter records
  const filteredRecords = useMemo(() => {
    let filtered = records;

    if (selectedStage !== "all") {
      filtered = filtered.filter(r => r.stage === selectedStage);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.customer.toLowerCase().includes(query) ||
        r.phone.includes(query)
      );
    }

    return filtered;
  }, [records, selectedStage, searchQuery]);

  // Group by stage
  const recordsByStage = useMemo(() => {
    const groups: Record<string, WorkspaceRecord[]> = {};
    workspace?.stages.forEach(stage => {
      groups[stage.id] = filteredRecords.filter(r => r.stage === stage.id);
    });
    return groups;
  }, [filteredRecords, workspace]);

  if (!workspace) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Workspace Not Found</h2>
        <p className="text-gray-600 mb-4">The requested vertical workspace does not exist.</p>
        <Button onClick={() => navigate("/app")}>Return to Dashboard</Button>
      </div>
    );
  }

  const handleCreate = () => {
    setSelectedRecord(null);
    setIsFormOpen(true);
  };

  const handleEdit = (record: WorkspaceRecord) => {
    setSelectedRecord(record);
    setIsFormOpen(true);
  };

  const handleDelete = (recordId: string) => {
    if (confirm(rtl ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      setRecords(records.filter(r => r.id !== recordId));
    }
  };

  const getStageInfo = (stageId: string) => {
    return workspace.stages.find(s => s.id === stageId);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${rtl ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${workspace.gradient} text-white`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-3xl">🔧</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {rtl ? workspace.nameAr : workspace.nameEn}
                </h1>
                <p className="text-white/90 mt-1">
                  {rtl ? workspace.taglineAr : workspace.taglineEn}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate} className="bg-white text-gray-900 hover:bg-gray-100">
                <Plus className="w-4 h-4 mr-2" />
                {rtl ? `${workspace.recordNounAr} جديد` : `New ${workspace.recordNounEn}`}
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Download className="w-4 h-4 mr-2" />
                {t("export")}
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4">
                <div className="text-sm opacity-90">{t("total")}</div>
                <div className="text-2xl font-bold">{records.length}</div>
              </CardContent>
            </Card>
            {workspace.stages.slice(0, 3).map(stage => {
              const count = records.filter(r => r.stage === stage.id).length;
              return (
                <Card key={stage.id} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardContent className="p-4">
                    <div className="text-sm opacity-90">{rtl ? stage.labelAr : stage.label}</div>
                    <div className="text-2xl font-bold">{count}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="search"
                  placeholder={rtl ? "بحث..." : "Search..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all")}</SelectItem>
                  {workspace.stages.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {rtl ? stage.labelAr : stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-600">
              {filteredRecords.length} {rtl ? "نتيجة" : "results"}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      {workspace.quickLinks.length > 0 && (
        <div className="bg-blue-50 border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {rtl ? "روابط سريعة:" : "Quick Links:"}
              </span>
              {workspace.quickLinks.map((link, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(link.path)}
                  className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                >
                  {rtl ? link.labelAr : link.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4">
          {workspace.stages.map(stage => {
            const stageRecords = recordsByStage[stage.id] || [];
            return (
              <div key={stage.id} className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    {rtl ? stage.labelAr : stage.label}
                  </h3>
                  <Badge variant="secondary" className={stage.color}>
                    {stageRecords.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {stageRecords.map(record => (
                    <Card key={record.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">{record.title}</div>
                            <div className="text-xs text-gray-600">{record.id}</div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(record)}>
                                <Eye className="w-4 h-4 mr-2" />
                                {t("view")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(record)}>
                                <Edit className="w-4 h-4 mr-2" />
                                {t("edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(record.id)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t("delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <User className="w-4 h-4 mr-2" />
                            {record.customer}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            {record.phone}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-green-600 font-medium">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {record.amount.toLocaleString()} {rtl ? "ريال" : "SAR"}
                            </div>
                            <div className="flex items-center text-gray-500 text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(record.date).toLocaleDateString(rtl ? "ar-SA" : "en-US")}
                            </div>
                          </div>
                        </div>

                        {/* Custom Fields Preview */}
                        {Object.keys(record.data).length > 0 && (
                          <div className="mt-3 pt-3 border-t space-y-1">
                            {Object.entries(record.data).slice(0, 2).map(([key, value]) => {
                              const field = workspace.fields.find(f => f.key === key);
                              if (!field) return null;
                              return (
                                <div key={key} className="text-xs text-gray-600 flex justify-between">
                                  <span>{rtl ? field.labelAr : field.label}:</span>
                                  <span className="font-medium text-gray-900">{value}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {stageRecords.length === 0 && (
                    <div className="text-center text-gray-400 py-8 text-sm">
                      {rtl ? "لا توجد سجلات" : "No records"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRecord
                ? rtl ? `تعديل ${workspace.recordNounAr}` : `Edit ${workspace.recordNounEn}`
                : rtl ? `${workspace.recordNounAr} جديد` : `New ${workspace.recordNounEn}`
              }
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4">
            <div>
              <Label>{rtl ? "العنوان" : "Title"}</Label>
              <Input placeholder={rtl ? "عنوان السجل" : "Record title"} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{rtl ? "العميل" : "Customer"}</Label>
                <Input placeholder={rtl ? "اسم العميل" : "Customer name"} />
              </div>
              <div>
                <Label>{rtl ? "الهاتف" : "Phone"}</Label>
                <Input type="tel" placeholder="+966 5X XXX XXXX" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{rtl ? "المبلغ" : "Amount"}</Label>
                <Input type="number" placeholder="0.00" />
              </div>
              <div>
                <Label>{rtl ? "المرحلة" : "Stage"}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workspace.stages.map(stage => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {rtl ? stage.labelAr : stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Fields */}
            {workspace.fields.map(field => (
              <div key={field.key}>
                <Label>{rtl ? field.labelAr : field.label}</Label>
                {field.type === "select" ? (
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "date" ? (
                  <Input type="date" />
                ) : field.type === "number" ? (
                  <Input type="number" placeholder={field.placeholder} />
                ) : (
                  <Input placeholder={field.placeholder} />
                )}
              </div>
            ))}

            <div>
              <Label>{rtl ? "ملاحظات" : "Notes"}</Label>
              <Textarea rows={3} placeholder={rtl ? "ملاحظات إضافية..." : "Additional notes..."} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit" className={workspace.accent}>
                {t("save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
