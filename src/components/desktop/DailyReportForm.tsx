import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { db, OfflineDailyReport } from '@/lib/desktop/dexie-schema';
import { syncQueueService } from '@/lib/desktop/sync-queue-service';
import PhotoCapture from './PhotoCapture';
import VideoCapture from './VideoCapture';
import VoiceToText from './VoiceToText';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Validation schema for daily report form
 */
const dailyReportFormSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  reportDate: z.string().min(1, 'Report date is required'),
  weather: z.enum(['sunny', 'cloudy', 'rainy', 'foggy', 'windy']),
  temperature: z.coerce.number().min(-50).max(60),
  humidity: z.coerce.number().min(0).max(100),
  workProgress: z.string().min(10, 'Work progress description required'),
  laborForceCount: z.coerce.number().int().min(0),
  tasksCompleted: z.string(),
  tasksRemaining: z.string(),
  safetyIncidents: z.coerce.number().int().min(0),
  safetyChecksPassed: z.coerce.number().int().min(0),
  safetyChecksFailed: z.coerce.number().int().min(0),
  ppeUsageCompliance: z.coerce.number().min(0).max(100),
  qualityScore: z.coerce.number().min(0).max(100),
  qualityIssues: z.string(),
  incidentDetails: z.string().optional(),
  measurementsVerified: z.boolean().default(false),
});

type DailyReportFormData = z.infer<typeof dailyReportFormSchema>;

interface DailyReportFormProps {
  siteId: string;
  siteName: string;
  userId: string;
  userEmail: string;
  onSubmit?: (report: OfflineDailyReport) => Promise<void>;
  initialData?: OfflineDailyReport;
}

/**
 * Daily Report Form Component
 * 
 * Features:
 * - Multi-step form with tabs
 * - Real-time validation
 * - Photo/video capture
 * - Voice-to-text transcription
 * - Offline storage with Dexie
 * - Auto-save drafts
 * - Sync status indicators
 */
export const DailyReportForm: React.FC<DailyReportFormProps> = ({
  siteId,
  siteName,
  userId,
  userEmail,
  onSubmit,
  initialData,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>(initialData?.photoIds || []);
  const [videos, setVideos] = useState<string[]>(initialData?.videoIds || []);
  const [voiceNotes, setVoiceNotes] = useState<string[]>(initialData?.voiceNoteIds || []);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'synced' | 'error'>('idle');
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);

  const form = useForm<DailyReportFormData>({
    resolver: zodResolver(dailyReportFormSchema),
    defaultValues: initialData ? {
      siteName: initialData.siteName,
      reportDate: initialData.reportDate.toISOString().split('T')[0],
      weather: initialData.weather,
      temperature: initialData.temperature,
      humidity: initialData.humidity,
      workProgress: initialData.workProgress,
      laborForceCount: initialData.laborForceCount,
      tasksCompleted: initialData.tasksCompleted.join(', '),
      tasksRemaining: initialData.tasksRemaining.join(', '),
      safetyIncidents: initialData.safetyIncidents,
      safetyChecksPassed: initialData.safetyChecksPassed,
      safetyChecksFailed: initialData.safetyChecksFailed,
      ppeUsageCompliance: initialData.ppeUsageCompliance,
      qualityScore: initialData.qualityScore,
      qualityIssues: initialData.qualityIssues.join(', '),
      incidentDetails: initialData.incidentDetails,
      measurementsVerified: initialData.measurementsVerified,
    } : {
      siteName,
      reportDate: new Date().toISOString().split('T')[0],
      weather: 'sunny',
      temperature: 25,
      humidity: 50,
      workProgress: '',
      laborForceCount: 0,
      tasksCompleted: '',
      tasksRemaining: '',
      safetyIncidents: 0,
      safetyChecksPassed: 0,
      safetyChecksFailed: 0,
      ppeUsageCompliance: 100,
      qualityScore: 85,
      qualityIssues: '',
      incidentDetails: '',
      measurementsVerified: false,
    },
  });

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const formData = form.getValues();
      saveDraft(formData);
    }, 30000);

    setAutoSaveInterval(interval);
    return () => clearInterval(interval);
  }, [form]);

  /**
   * Save form as draft
   */
  const saveDraft = async (formData: DailyReportFormData) => {
    try {
      const report: OfflineDailyReport = {
        id: initialData?.id || uuidv4(),
        siteId,
        siteName: formData.siteName,
        reportDate: new Date(formData.reportDate),
        reportedBy: userId,
        reporterEmail: userEmail,
        weather: formData.weather,
        temperature: formData.temperature,
        humidity: formData.humidity,
        workProgress: formData.workProgress,
        laborForceCount: formData.laborForceCount,
        equipmentUsed: [],
        tasksCompleted: formData.tasksCompleted.split(',').map(t => t.trim()),
        tasksRemaining: formData.tasksRemaining.split(',').map(t => t.trim()),
        safetyIncidents: formData.safetyIncidents,
        incidentDetails: formData.incidentDetails,
        nearMissEvents: 0,
        safetyChecksPassed: formData.safetyChecksPassed,
        safetyChecksFailed: formData.safetyChecksFailed,
        ppeUsageCompliance: formData.ppeUsageCompliance,
        qualityIssues: formData.qualityIssues.split(',').map(i => i.trim()),
        qualityScore: formData.qualityScore,
        measurementsVerified: formData.measurementsVerified,
        photoIds: photos,
        videoIds: videos,
        voiceNoteIds: voiceNotes,
        status: 'draft',
        createdAt: initialData?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (initialData) {
        await db.dailyReports.update(initialData.id, report);
      } else {
        await db.dailyReports.add(report);
      }

      setSyncStatus('idle');
    } catch (error) {
      console.error('Failed to save draft:', error);
      setSyncStatus('error');
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (formData: DailyReportFormData) => {
    setIsSubmitting(true);
    try {
      const report: OfflineDailyReport = {
        id: initialData?.id || uuidv4(),
        siteId,
        siteName: formData.siteName,
        reportDate: new Date(formData.reportDate),
        reportedBy: userId,
        reporterEmail: userEmail,
        weather: formData.weather,
        temperature: formData.temperature,
        humidity: formData.humidity,
        workProgress: formData.workProgress,
        laborForceCount: formData.laborForceCount,
        equipmentUsed: [],
        tasksCompleted: formData.tasksCompleted.split(',').map(t => t.trim()),
        tasksRemaining: formData.tasksRemaining.split(',').map(t => t.trim()),
        safetyIncidents: formData.safetyIncidents,
        incidentDetails: formData.incidentDetails,
        nearMissEvents: 0,
        safetyChecksPassed: formData.safetyChecksPassed,
        safetyChecksFailed: formData.safetyChecksFailed,
        ppeUsageCompliance: formData.ppeUsageCompliance,
        qualityIssues: formData.qualityIssues.split(',').map(i => i.trim()),
        qualityScore: formData.qualityScore,
        measurementsVerified: formData.measurementsVerified,
        photoIds: photos,
        videoIds: videos,
        voiceNoteIds: voiceNotes,
        status: 'submitted',
        createdAt: initialData?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      // Save to database
      if (initialData) {
        await db.dailyReports.update(initialData.id, report);
      } else {
        await db.dailyReports.add(report);
      }

      // Enqueue for sync
      await syncQueueService.enqueueItem(
        'dailyReport',
        report.id,
        initialData ? 'update' : 'create',
        report
      );

      setSyncStatus('synced');
      toast.success('Report submitted successfully');

      if (onSubmit) {
        await onSubmit(report);
      }

      // Reset form
      form.reset();
      setPhotos([]);
      setVideos([]);
      setVoiceNotes([]);
    } catch (error) {
      console.error('Failed to submit report:', error);
      setSyncStatus('error');
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Daily Site Report</CardTitle>
          <CardDescription>
            {siteName} • {new Date().toLocaleDateString()}
          </CardDescription>
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              {syncStatus === 'synced' && (
                <Badge variant="default" className="gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Synced
                </Badge>
              )}
              {syncStatus === 'error' && (
                <Badge variant="destructive" className="gap-2">
                  <AlertCircle className="w-4 h-4" /> Sync Error
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <Tabs defaultValue="weather" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="weather">Weather</TabsTrigger>
                  <TabsTrigger value="work">Work Progress</TabsTrigger>
                  <TabsTrigger value="safety">Safety</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                </TabsList>

                {/* Weather Tab */}
                <TabsContent value="weather" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="reportDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weather"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weather Condition</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sunny">Sunny</SelectItem>
                            <SelectItem value="cloudy">Cloudy</SelectItem>
                            <SelectItem value="rainy">Rainy</SelectItem>
                            <SelectItem value="foggy">Foggy</SelectItem>
                            <SelectItem value="windy">Windy</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature (°C)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="humidity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Humidity (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Work Progress Tab */}
                <TabsContent value="work" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="workProgress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Progress Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the day's work progress, challenges, and achievements..."
                            {...field}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="laborForceCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Labor Force Count</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tasksCompleted"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tasks Completed (comma-separated)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Task 1, Task 2, Task 3..."
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tasksRemaining"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tasks Remaining (comma-separated)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Task 1, Task 2, Task 3..."
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* Safety Tab */}
                <TabsContent value="safety" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="safetyIncidents"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Safety Incidents</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="safetyChecksPassed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Safety Checks Passed</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="safetyChecksFailed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Safety Checks Failed</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ppeUsageCompliance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PPE Compliance (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="incidentDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Incident Details (if any)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe any incidents..."
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide details of any safety incidents or near-misses
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="qualityScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quality Score (0-100)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="qualityIssues"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quality Issues (comma-separated)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Issue 1, Issue 2, Issue 3..."
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="measurementsVerified"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0 cursor-pointer">
                          Measurements Verified
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* Media Tab */}
                <TabsContent value="media" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Photos</h3>
                      <PhotoCapture
                        reportId={initialData?.id || 'new'}
                        onPhotoCaptured={(photoId) => {
                          setPhotos([...photos, photoId]);
                          toast.success('Photo captured and saved');
                        }}
                      />
                      {photos.length > 0 && (
                        <div className="mt-2">
                          <Badge variant="secondary">{photos.length} photos</Badge>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-2">Videos</h3>
                      <VideoCapture
                        reportId={initialData?.id || 'new'}
                        onVideoCaptured={(videoId) => {
                          setVideos([...videos, videoId]);
                          toast.success('Video captured and saved');
                        }}
                      />
                      {videos.length > 0 && (
                        <div className="mt-2">
                          <Badge variant="secondary">{videos.length} videos</Badge>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-2">Voice Notes</h3>
                      <VoiceToText
                        reportId={initialData?.id || 'new'}
                        onVoiceNoteCaptured={(voiceNoteId) => {
                          setVoiceNotes([...voiceNotes, voiceNoteId]);
                          toast.success('Voice note captured and saved');
                        }}
                      />
                      {voiceNotes.length > 0 && (
                        <div className="mt-2">
                          <Badge variant="secondary">{voiceNotes.length} voice notes</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Form Actions */}
              <div className="flex gap-3 justify-end mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const formData = form.getValues();
                    saveDraft(formData);
                    toast.success('Draft saved');
                  }}
                  disabled={isSubmitting}
                >
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Report
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyReportForm;
