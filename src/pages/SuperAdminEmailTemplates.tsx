import { useState } from "react";
import { Edit3, Save, Eye, Mail, Loader2, Search } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

interface Template {
  key: string;
  nameEn: string;
  nameAr: string;
  subjectEn: string;
  subjectAr: string;
  bodyEn: string;
  bodyAr: string;
  variables: string[];
}

const initialTemplates: Template[] = [
  {
    key: "welcome_email", nameEn: "Welcome Email", nameAr: "بريد الترحيب",
    subjectEn: "Welcome to YASCO, {{company_name}}!",
    subjectAr: "مرحبًا بك في ياسكو، {{company_name}}!",
    bodyEn: "Dear {{owner_name}},\n\nWelcome to YASCO! Your account has been created successfully.\n\nYour company: {{company_name}}\nYour plan: {{plan_name}}\n\nBest regards,\nYASCO Team",
    bodyAr: "عزيزي {{owner_name}}،\n\nمرحبًا بك في ياسكو! تم إنشاء حسابك بنجاح.\n\nشركتك: {{company_name}}\nخطتك: {{plan_name}}\n\nمع تحيات،\nفريق ياسكو",
    variables: ["company_name", "owner_name", "plan_name"],
  },
  {
    key: "otp_email", nameEn: "OTP Email", nameAr: "بريد رمز التحقق",
    subjectEn: "Your OTP Code: {{otp}}",
    subjectAr: "رمز التحقق الخاص بك: {{otp}}",
    bodyEn: "Your OTP code is: {{otp}}\nThis code expires in {{expiry_minutes}} minutes.",
    bodyAr: "رمز التحقق الخاص بك هو: {{otp}}\nتنتهي صلاحية هذا الرمز بعد {{expiry_minutes}} دقيقة.",
    variables: ["otp", "expiry_minutes"],
  },
  {
    key: "invoice_email", nameEn: "Invoice Email", nameAr: "بريد الفاتورة",
    subjectEn: "Invoice {{invoice_number}} from {{company_name}}",
    subjectAr: "الفاتورة {{invoice_number}} من {{company_name}}",
    bodyEn: "Dear customer,\n\nPlease find attached invoice {{invoice_number}} for {{amount}} {{currency}}.\nDue date: {{due_date}}",
    bodyAr: "عزيزي العميل،\n\nيرجى الاطلاع على الفاتورة {{invoice_number}} بقيمة {{amount}} {{currency}}.\nتاريخ الاستحقاق: {{due_date}}",
    variables: ["invoice_number", "company_name", "amount", "currency", "due_date"],
  },
  {
    key: "trial_expiring", nameEn: "Trial Expiring Soon", nameAr: "انتهاء الفترة التجريبية",
    subjectEn: "Your YASCO trial expires in {{days_left}} days",
    subjectAr: "تتبقى {{days_left}} أيام على انتهاء فترتك التجريبية في ياسكو",
    bodyEn: "Your trial period will expire in {{days_left}} days. Upgrade now to continue using YASCO.",
    bodyAr: "ستنتهي الفترة التجريبية بعد {{days_left}} أيام. قم بالترقية الآن لمواصلة استخدام ياسكو.",
    variables: ["days_left", "company_name"],
  },
  {
    key: "password_reset", nameEn: "Password Reset", nameAr: "إعادة تعيين كلمة المرور",
    subjectEn: "Reset Your YASCO Password",
    subjectAr: "إعادة تعيين كلمة المرور في ياسكو",
    bodyEn: "Click the link below to reset your password:\n{{reset_link}}\n\nThis link expires in {{expiry_minutes}} minutes.",
    bodyAr: "انقر على الرابط أدناه لإعادة تعيين كلمة المرور:\n{{reset_link}}\n\nتنتهي صلاحية هذا الرابط بعد {{expiry_minutes}} دقيقة.",
    variables: ["reset_link", "expiry_minutes"],
  },
];

const allVariables = [
  "company_name", "owner_name", "plan_name", "otp", "expiry_minutes",
  "invoice_number", "amount", "currency", "due_date", "days_left",
  "reset_link", "user_name", "user_email", "support_email",
];

export default function SuperAdminEmailTemplates() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [templates] = useState<Template[]>(initialTemplates);
  const [search, setSearch] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [subjectEn, setSubjectEn] = useState("");
  const [subjectAr, setSubjectAr] = useState("");
  const [bodyEn, setBodyEn] = useState("");
  const [bodyAr, setBodyAr] = useState("");

  const saveMutation = trpc.superAdmin.emailTemplates.save.useMutation();

  const filtered = templates.filter((t) =>
    t.nameEn.toLowerCase().includes(search.toLowerCase()) ||
    t.nameAr.includes(search)
  );

  const openEdit = (template: Template) => {
    setEditingTemplate(template);
    setSubjectEn(template.subjectEn);
    setSubjectAr(template.subjectAr);
    setBodyEn(template.bodyEn);
    setBodyAr(template.bodyAr);
  };

  const handleSave = () => {
    if (!editingTemplate) return;
    saveMutation.mutate({
      key: editingTemplate.key,
      subjectEn, subjectAr, bodyEn, bodyAr,
    } as any);
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isAr ? "قوالب البريد الإلكتروني" : "Email Templates"}</h1>
        <p className="text-sm text-muted-foreground">
          {isAr ? "تخصيص قوالب البريد الإلكتروني" : "Customize email templates"}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <Input className="pl-10" placeholder={isAr ? "بحث..." : "Search templates..."} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((template) => (
          <Card key={template.key} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openEdit(template)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Mail className="size-5" />
                </div>
                <Button variant="ghost" size="sm">
                  <Edit3 className="size-4" />
                </Button>
              </div>
              <CardTitle className="text-base mt-2">
                {isAr ? template.nameAr : template.nameEn}
              </CardTitle>
              <CardDescription className="text-xs">
                {template.variables.length} {isAr ? "متغير" : "variables"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground truncate">
                {template.subjectEn}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingTemplate} onOpenChange={(v) => { if (!v) setEditingTemplate(null); }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {editingTemplate && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {isAr ? editingTemplate.nameAr : editingTemplate.nameEn}
                </DialogTitle>
                <DialogDescription>
                  {isAr ? "تعديل قالب البريد الإلكتروني" : "Edit email template"}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="en">
                <TabsList>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ar">العربية</TabsTrigger>
                  <TabsTrigger value="variables">{isAr ? "المتغيرات" : "Variables"}</TabsTrigger>
                </TabsList>

                <TabsContent value="en" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>{isAr ? "الموضوع (إنجليزي)" : "Subject (English)"}</Label>
                    <Input value={subjectEn} onChange={(e) => setSubjectEn(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? "المحتوى (إنجليزي)" : "Body (English)"}</Label>
                    <Textarea value={bodyEn} onChange={(e) => setBodyEn(e.target.value)} rows={10} className="font-mono text-sm" />
                  </div>
                </TabsContent>

                <TabsContent value="ar" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>{isAr ? "الموضوع (عربي)" : "Subject (Arabic)"}</Label>
                    <Input value={subjectAr} onChange={(e) => setSubjectAr(e.target.value)} className="rtl" />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? "المحتوى (عربي)" : "Body (Arabic)"}</Label>
                    <Textarea value={bodyAr} onChange={(e) => setBodyAr(e.target.value)} rows={10} className="font-mono text-sm rtl" />
                  </div>
                </TabsContent>

                <TabsContent value="variables" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        {isAr ? "هذا القالب" : "This template"}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {editingTemplate.variables.map((v) => (
                          <Badge key={v} variant="secondary" className="font-mono text-xs">{`{{${v}}}`}</Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        {isAr ? "جميع المتغيرات المتاحة" : "All available variables"}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {allVariables.map((v) => (
                          <Badge key={v} variant="outline" className="font-mono text-xs">{`{{${v}}}`}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button onClick={handleSave} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
                  {isAr ? "حفظ" : "Save"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
