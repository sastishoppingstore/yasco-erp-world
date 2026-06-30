import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * PAYMENT CERTIFICATE FORM - Quick Win #1
 * Generates, approves, and tracks payment certificates for construction projects
 */

const generateCertificateSchema = z.object({
  progressBillingId: z.number().min(1, "Select a progress billing"),
  projectId: z.number().min(1, "Select a project"),
  retentionPercent: z.coerce
    .number()
    .min(0)
    .max(100)
    .default(5),
});

const approveCertificateSchema = z.object({
  certificateId: z.number().min(1),
  approverRole: z.enum(["pm", "finance", "principal", "client"]),
  comments: z.string().optional(),
  signature: z.string().optional(),
});

type GenerateCertificateInput = z.infer<typeof generateCertificateSchema>;
type ApproveCertificateInput = z.infer<typeof approveCertificateSchema>;

export function PaymentCertificateManager() {
  const [activeTab, setActiveTab] = useState<"generate" | "approve" | "list">(
    "list"
  );
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );

  // Queries
  const { data: certificates, isLoading: certificatesLoading } = useQuery({
    queryKey: ["paymentCertificates", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const result = await trpc.constructionPayment.listCertificates.query({
        projectId: selectedProjectId,
      });
      return result.data;
    },
    enabled: !!selectedProjectId,
  });

  const { data: summary } = useQuery({
    queryKey: ["paymentSummary", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return null;
      const result = await trpc.constructionPayment.getPaymentSummary.query({
        projectId: selectedProjectId,
      });
      return result.summary;
    },
    enabled: !!selectedProjectId,
  });

  // Mutations
  const { mutate: generateCert, isPending: isGenerating } = useMutation({
    mutationFn: async (data: GenerateCertificateInput) => {
      const result = await trpc.constructionPayment.generateCertificate.mutate(
        data
      );
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setActiveTab("list");
      // Refetch
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const { mutate: approveCert, isPending: isApproving } = useMutation({
    mutationFn: async (data: ApproveCertificateInput) => {
      const result = await trpc.constructionPayment.approveCertificate.mutate(
        data
      );
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setActiveTab("list");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const generateForm = useForm<GenerateCertificateInput>({
    resolver: zodResolver(generateCertificateSchema),
    defaultValues: {
      retentionPercent: 5,
    },
  });

  const approveForm = useForm<ApproveCertificateInput>({
    resolver: zodResolver(approveCertificateSchema),
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "default",
      pending_approval: "outline",
      approved: "secondary",
      signed: "secondary",
      paid: "default",
      disputed: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Certificate Manager</CardTitle>
          <CardDescription>
            Generate, approve, and track payment certificates with ZATCA compliance
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Summary Dashboard */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{summary.totalCertificates}</div>
              <p className="text-sm text-muted-foreground">Total Certificates</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {summary.paidCertificates}
              </div>
              <p className="text-sm text-muted-foreground">Paid</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">
                {summary.pendingCertificates}
              </div>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {summary.totalAmount.toFixed(2)} SAR
              </div>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("generate")}
          className={`px-4 py-2 font-medium ${
            activeTab === "generate"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          Generate Certificate
        </button>
        <button
          onClick={() => setActiveTab("approve")}
          className={`px-4 py-2 font-medium ${
            activeTab === "approve"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          Approve
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 font-medium ${
            activeTab === "list"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          View Certificates
        </button>
      </div>

      {/* Generate Certificate Tab */}
      {activeTab === "generate" && (
        <Card>
          <CardHeader>
            <CardTitle>Generate New Certificate</CardTitle>
            <CardDescription>
              Auto-generates payment certificate from progress billing with retention
              calculation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...generateForm}>
              <form
                onSubmit={generateForm.handleSubmit((data) => generateCert(data))}
                className="space-y-4"
              >
                <FormField
                  control={generateForm.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Project ID"
                          type="number"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseInt(e.target.value));
                            setSelectedProjectId(parseInt(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={generateForm.control}
                  name="progressBillingId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Progress Billing</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Billing ID"
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={generateForm.control}
                  name="retentionPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retention %</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="5"
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Generate Certificate"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Approve Certificate Tab */}
      {activeTab === "approve" && (
        <Card>
          <CardHeader>
            <CardTitle>Approve Certificate</CardTitle>
            <CardDescription>
              Review and approve payment certificates with role-based workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...approveForm}>
              <form
                onSubmit={approveForm.handleSubmit((data) => approveCert(data))}
                className="space-y-4"
              >
                <FormField
                  control={approveForm.control}
                  name="certificateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificate ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Certificate ID"
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={approveForm.control}
                  name="approverRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pm">Project Manager</SelectItem>
                          <SelectItem value="finance">Finance Manager</SelectItem>
                          <SelectItem value="principal">Principal</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={approveForm.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Add approval comments..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isApproving}>
                  {isApproving ? "Approving..." : "Approve Certificate"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* List Certificates Tab */}
      {activeTab === "list" && (
        <Card>
          <CardHeader>
            <CardTitle>Certificates</CardTitle>
            <CardDescription>
              View all payment certificates for the selected project
            </CardDescription>
          </CardHeader>
          <CardContent>
            {certificatesLoading ? (
              <div>Loading...</div>
            ) : certificates && certificates.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate #</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Retention</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((cert: any) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">
                        {cert.certificateNumber}
                      </TableCell>
                      <TableCell>{cert.certificateAmount} SAR</TableCell>
                      <TableCell>{cert.retentionAmount} SAR</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {cert.paymentAmount} SAR
                      </TableCell>
                      <TableCell>{getStatusBadge(cert.status)}</TableCell>
                      <TableCell>
                        {new Date(cert.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No certificates found. Generate one to get started.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PaymentCertificateManager;
