import { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import {
  LayoutDashboard, Store, ShoppingCart, ShoppingBag, Package, Search, Target,
  BookOpen, Wallet, FileText, BarChart3, Users, Briefcase, CreditCard,
  CheckCircle2, FolderKanban, Factory, Warehouse, Monitor, Image,
  HeadphonesIcon, Mail, MessageSquare, Award, CalendarCheck, ShieldCheck,
  Layers, Globe2, Building2, Network, Cpu, PieChart, TrendingUp, Lock,
  Sliders, Sparkles, Zap, HelpCircle, Star, Phone, MapPin, Clock, Linkedin,
  Github, Youtube, ChevronLeft, ChevronRight, Play, Plus, Minus, Settings,
  Truck, Scan, Printer, QrCode, Gift, RefreshCw, Map, Sun, Moon, Timer,
  Send, Quote, ArrowUpRight, Wrench, Share2, Ticket, Bell, Smartphone,
  Palette, DollarSign, ArrowRight, Globe, Eye, EyeOff, Pencil, Trash2,
  PlusCircle, GripVertical, Rocket, Sigma, Timer as TimerIcon,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Store, ShoppingCart, ShoppingBag, Package, Search, Target,
  BookOpen, Wallet, FileText, BarChart3, Users, Briefcase, CreditCard,
  CheckCircle2, FolderKanban, Factory, Warehouse, Monitor, Image,
  HeadphonesIcon, Mail, MessageSquare, Award, CalendarCheck, ShieldCheck,
  Layers, Globe2, Building2, Network, Cpu, PieChart, TrendingUp, Lock,
  Sliders, Sparkles, Zap, HelpCircle, Star, Phone, MapPin, Clock, Linkedin,
  Github, Youtube, Truck, Scan, Printer, QrCode, Gift, RefreshCw, Map,
  Sun, Moon, Timer, Send, Quote, ArrowUpRight, Wrench, Share2, Ticket,
  Bell, Smartphone, Palette, DollarSign, ArrowRight, Globe, Eye, EyeOff,
  Pencil, Trash2, PlusCircle, GripVertical, Rocket, Sigma,
};

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] || HelpCircle;
  return <Icon className={className || "h-5 w-5"} />;
}

interface ModuleCard {
  id: number;
  key: string;
  iconName: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  featureCount: number;
  gradientFrom: string;
  gradientTo: string;
  visible: boolean;
}

interface HeroSlide {
  id: number;
  headline: string;
  headlineAr: string;
  subheadline: string;
  subheadlineAr: string;
  ctaText: string;
  ctaTextAr: string;
  ctaUrl: string;
  imageUrl: string;
  active: boolean;
}

interface WebsiteSection {
  id: number;
  sectionKey: string;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  visible: boolean;
}

interface PricingPlan {
  id: number;
  planName: string;
  price: number;
  currency: string;
  features: string[];
  ctaText: string;
  mostPopular: boolean;
  active: boolean;
}

interface SeoSettings {
  metaTitle: string;
  metaTitleAr: string;
  metaDescription: string;
  metaDescriptionAr: string;
  keywords: string;
  ogImageUrl: string;
  schemaJson: string;
}

function ModuleCardsTab() {
  const { data: cards, refetch } = trpc.website.getModuleCards.useQuery();
  const updateCard = trpc.website.updateModuleCard.useMutation({ onSuccess: () => refetch() });
  const toggleVisibility = trpc.website.toggleModuleVisibility.useMutation({ onSuccess: () => refetch() });

  const [search, setSearch] = useState("");
  const [editingCard, setEditingCard] = useState<ModuleCard | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "", nameAr: "", description: "", descriptionAr: "",
    gradientFrom: "", gradientTo: "", featureCount: 0, visible: false,
  });

  useEffect(() => {
    if (editingCard) {
      setEditForm({
        name: editingCard.name,
        nameAr: editingCard.nameAr,
        description: editingCard.description,
        descriptionAr: editingCard.descriptionAr,
        gradientFrom: editingCard.gradientFrom,
        gradientTo: editingCard.gradientTo,
        featureCount: editingCard.featureCount,
        visible: editingCard.visible,
      });
    }
  }, [editingCard]);

  const filtered = cards?.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameAr.includes(search) ||
      c.key.includes(search.toLowerCase())
  ) || [];

  const handleEdit = (card: ModuleCard) => {
    setEditingCard(card);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingCard) return;
    updateCard.mutate({ id: editingCard.id, ...editForm });
    setDialogOpen(false);
    setEditingCard(null);
  };

  const handleToggleVisibility = (card: ModuleCard) => {
    toggleVisibility.mutate({ id: card.id, visible: !card.visible });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search module cards..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Badge variant="secondary" className="text-xs">
          {filtered.length} of {cards?.length || 0} cards
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((card) => (
          <Card key={card.id} className="group relative overflow-hidden">
            <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo}`} />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className={`flex size-10 items-center justify-center rounded-lg bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} text-white`}>
                  <DynamicIcon name={card.iconName} className="size-5" />
                </div>
                <div className="flex items-center gap-1">
                  <Switch
                    checked={card.visible}
                    onCheckedChange={() => handleToggleVisibility(card)}
                  />
                </div>
              </div>
              <CardTitle className="text-base mt-2">{card.name}</CardTitle>
              <CardDescription className="text-xs line-clamp-2">{card.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{card.featureCount} features</span>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={() => handleEdit(card)}>
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Search className="size-12 mb-3" />
          <p className="text-sm font-medium">No module cards found</p>
          <p className="text-xs">Try adjusting your search</p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Module Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title (EN)</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <Label>Title (AR)</Label>
                <Input value={editForm.nameAr} onChange={(e) => setEditForm({ ...editForm, nameAr: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Description (EN)</Label>
                <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </div>
              <div>
                <Label>Description (AR)</Label>
                <Textarea value={editForm.descriptionAr} onChange={(e) => setEditForm({ ...editForm, descriptionAr: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Gradient From</Label>
                <Input value={editForm.gradientFrom} onChange={(e) => setEditForm({ ...editForm, gradientFrom: e.target.value })} placeholder="from-blue-500" />
              </div>
              <div>
                <Label>Gradient To</Label>
                <Input value={editForm.gradientTo} onChange={(e) => setEditForm({ ...editForm, gradientTo: e.target.value })} placeholder="to-blue-700" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Feature Count</Label>
                <Input type="number" value={editForm.featureCount} onChange={(e) => setEditForm({ ...editForm, featureCount: Number(e.target.value) })} />
              </div>
              <div className="flex items-end pb-1">
                <div className="flex items-center gap-3">
                  <Label>Visible</Label>
                  <Switch checked={editForm.visible} onCheckedChange={(v) => setEditForm({ ...editForm, visible: v })} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HeroSlidesTab() {
  const { data: slides, refetch } = trpc.website.getHeroSlides.useQuery();
  const updateSlide = trpc.website.updateHeroSlide.useMutation({ onSuccess: () => refetch() });

  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const emptySlide: HeroSlide = {
    id: 0, headline: "", headlineAr: "", subheadline: "", subheadlineAr: "",
    ctaText: "", ctaTextAr: "", ctaUrl: "", imageUrl: "", active: true,
  };

  const [editForm, setEditForm] = useState<HeroSlide>(emptySlide);

  useEffect(() => {
    if (editingSlide) {
      setEditForm({ ...editingSlide });
    }
  }, [editingSlide]);

  const handleAdd = () => {
    setEditingSlide({ ...emptySlide, id: Date.now() });
    setDialogOpen(true);
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide({ ...slide });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingSlide) return;
    updateSlide.mutate({ id: editingSlide.id, ...editForm });
    setDialogOpen(false);
    setEditingSlide(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{slides?.length || 0} hero slides</p>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="size-4 mr-1.5" />
          Add Slide
        </Button>
      </div>

      <div className="space-y-3">
        {slides?.map((slide) => (
          <Card key={slide.id} className={!slide.active ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{slide.headline}</h4>
                    <Badge variant="secondary" className="text-[10px] px-1.5">
                      {slide.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{slide.subheadline}</p>
                  {slide.ctaText && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-blue-600 font-medium">{slide.ctaText}</span>
                      <span className="text-[10px] text-slate-400">{slide.ctaUrl}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Switch
                    checked={slide.active}
                    onCheckedChange={(v) => updateSlide.mutate({ id: slide.id, active: v })}
                  />
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => handleEdit(slide)}>
                    <Pencil className="size-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingSlide?.id && editingSlide.id > 0 ? "Edit Hero Slide" : "Add Hero Slide"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Headline (EN)</Label>
                <Input value={editForm.headline} onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })} />
              </div>
              <div>
                <Label>Headline (AR)</Label>
                <Input value={editForm.headlineAr} onChange={(e) => setEditForm({ ...editForm, headlineAr: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Subheadline (EN)</Label>
                <Textarea value={editForm.subheadline} onChange={(e) => setEditForm({ ...editForm, subheadline: e.target.value })} />
              </div>
              <div>
                <Label>Subheadline (AR)</Label>
                <Textarea value={editForm.subheadlineAr} onChange={(e) => setEditForm({ ...editForm, subheadlineAr: e.target.value })} />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CTA Text (EN)</Label>
                <Input value={editForm.ctaText} onChange={(e) => setEditForm({ ...editForm, ctaText: e.target.value })} />
              </div>
              <div>
                <Label>CTA Text (AR)</Label>
                <Input value={editForm.ctaTextAr} onChange={(e) => setEditForm({ ...editForm, ctaTextAr: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CTA URL</Label>
                <Input value={editForm.ctaUrl} onChange={(e) => setEditForm({ ...editForm, ctaUrl: e.target.value })} placeholder="/contact" />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={editForm.imageUrl} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label>Active</Label>
              <Switch checked={editForm.active} onCheckedChange={(v) => setEditForm({ ...editForm, active: v })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>
              {editingSlide?.id && editingSlide.id > 0 ? "Save Changes" : "Add Slide"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SectionsTab() {
  const { data: sections, refetch } = trpc.website.getWebsiteSections.useQuery();
  const updateSection = trpc.website.updateWebsiteSection.useMutation({ onSuccess: () => refetch() });

  const [editingSection, setEditingSection] = useState<WebsiteSection | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "", titleAr: "", subtitle: "", subtitleAr: "", visible: false,
  });

  useEffect(() => {
    if (editingSection) {
      setEditForm({
        title: editingSection.title,
        titleAr: editingSection.titleAr,
        subtitle: editingSection.subtitle,
        subtitleAr: editingSection.subtitleAr,
        visible: editingSection.visible,
      });
    }
  }, [editingSection]);

  const handleToggle = (section: WebsiteSection) => {
    updateSection.mutate({ id: section.id, visible: !section.visible });
  };

  const handleEdit = (section: WebsiteSection) => {
    setEditingSection(section);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingSection) return;
    updateSection.mutate({ id: editingSection.id, ...editForm });
    setDialogOpen(false);
    setEditingSection(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500 mb-2">{sections?.length || 0} sections</p>
      {sections?.map((section) => (
        <Card key={section.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Globe className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm capitalize">{section.sectionKey.replace(/-/g, " ")}</h4>
                    <Badge variant="outline" className="text-[10px] font-mono">{section.sectionKey}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{section.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={section.visible} onCheckedChange={() => handleToggle(section)} />
                <Button variant="ghost" size="icon" className="size-8" onClick={() => handleEdit(section)}>
                  <Pencil className="size-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title (EN)</Label>
                <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
              </div>
              <div>
                <Label>Title (AR)</Label>
                <Input value={editForm.titleAr} onChange={(e) => setEditForm({ ...editForm, titleAr: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Subtitle (EN)</Label>
                <Input value={editForm.subtitle} onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })} />
              </div>
              <div>
                <Label>Subtitle (AR)</Label>
                <Input value={editForm.subtitleAr} onChange={(e) => setEditForm({ ...editForm, subtitleAr: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label>Visible</Label>
              <Switch checked={editForm.visible} onCheckedChange={(v) => setEditForm({ ...editForm, visible: v })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PricingTab() {
  const { data: plans, refetch } = trpc.website.getPricingPlans.useQuery();
  const updatePlan = trpc.website.updatePricingPlan.useMutation({ onSuccess: () => refetch() });

  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    planName: "", price: 0, currency: "SAR", features: [] as string[],
    ctaText: "", mostPopular: false, active: true,
  });

  useEffect(() => {
    if (editingPlan) {
      setEditForm({
        planName: editingPlan.planName,
        price: editingPlan.price,
        currency: editingPlan.currency,
        features: [...editingPlan.features],
        ctaText: editingPlan.ctaText,
        mostPopular: editingPlan.mostPopular,
        active: editingPlan.active,
      });
    }
  }, [editingPlan]);

  const handleEdit = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingPlan) return;
    updatePlan.mutate({ id: editingPlan.id, ...editForm });
    setDialogOpen(false);
    setEditingPlan(null);
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...editForm.features];
    updated[index] = value;
    setEditForm({ ...editForm, features: updated });
  };

  const addFeature = () => {
    setEditForm({ ...editForm, features: [...editForm.features, ""] });
  };

  const removeFeature = (index: number) => {
    setEditForm({ ...editForm, features: editForm.features.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">{plans?.length || 0} pricing plans</p>
      <div className="grid gap-4 md:grid-cols-3">
        {plans?.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${plan.mostPopular ? "border-blue-400 shadow-md" : ""} ${!plan.active ? "opacity-60" : ""}`}
          >
            {plan.mostPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-600 hover:bg-blue-600 text-white text-[10px] px-3 py-0.5">
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{plan.planName}</CardTitle>
                <Button variant="ghost" size="icon" className="size-8" onClick={() => handleEdit(plan)}>
                  <Pencil className="size-3.5" />
                </Button>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold">{plan.price.toLocaleString()}</span>
                <span className="text-sm text-slate-500">{plan.currency}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-xs text-slate-500">{plan.ctaText}</span>
                <Switch
                  checked={plan.active}
                  onCheckedChange={(v) => updatePlan.mutate({ id: plan.id, active: v })}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Pricing Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label>Plan Name</Label>
                <Input value={editForm.planName} onChange={(e) => setEditForm({ ...editForm, planName: e.target.value })} />
              </div>
              <div>
                <Label>Currency</Label>
                <Input value={editForm.currency} onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Price</Label>
              <Input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })} />
            </div>
            <div>
              <Label>CTA Text</Label>
              <Input value={editForm.ctaText} onChange={(e) => setEditForm({ ...editForm, ctaText: e.target.value })} placeholder="Get Started" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Features</Label>
                <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={addFeature}>
                  <Plus className="size-3.5" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {editForm.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={feature} onChange={(e) => handleFeatureChange(i, e.target.value)} placeholder={`Feature ${i + 1}`} />
                    <Button variant="ghost" size="icon" className="size-8 shrink-0 text-red-500 hover:text-red-600" onClick={() => removeFeature(i)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Label>Most Popular</Label>
                <Switch checked={editForm.mostPopular} onCheckedChange={(v) => setEditForm({ ...editForm, mostPopular: v })} />
              </div>
              <div className="flex items-center gap-3">
                <Label>Active</Label>
                <Switch checked={editForm.active} onCheckedChange={(v) => setEditForm({ ...editForm, active: v })} />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SeoTab() {
  const { data: seo, refetch } = trpc.website.getSeoSettings.useQuery();
  const updateSeo = trpc.website.updateSeoSettings.useMutation({ onSuccess: () => refetch() });

  const [form, setForm] = useState<SeoSettings>({
    metaTitle: "", metaTitleAr: "", metaDescription: "", metaDescriptionAr: "",
    keywords: "", ogImageUrl: "", schemaJson: "",
  });

  useEffect(() => {
    if (seo) {
      setForm({
        metaTitle: seo.metaTitle ?? "",
        metaTitleAr: seo.metaTitleAr ?? "",
        metaDescription: seo.metaDescription ?? "",
        metaDescriptionAr: seo.metaDescriptionAr ?? "",
        keywords: seo.keywords ?? "",
        ogImageUrl: seo.ogImageUrl ?? "",
        schemaJson: seo.schemaJson ?? "",
      });
    }
  }, [seo]);

  const handleSave = () => {
    updateSeo.mutate(form);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meta Tags</CardTitle>
          <CardDescription>Search engine optimization settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Meta Title (EN)</Label>
              <Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder="YASCO ERP - Enterprise OS" />
              <p className="text-[10px] text-slate-400 mt-1">{form.metaTitle.length} characters</p>
            </div>
            <div>
              <Label>Meta Title (AR)</Label>
              <Input value={form.metaTitleAr} onChange={(e) => setForm({ ...form, metaTitleAr: e.target.value })} placeholder="ياسكو - نظام تشغيل المؤسسات" />
              <p className="text-[10px] text-slate-400 mt-1">{form.metaTitleAr.length} characters</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Meta Description (EN)</Label>
              <Textarea value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} placeholder="Enterprise OS for finance, operations, HR, and CRM" />
              <p className="text-[10px] text-slate-400 mt-1">{form.metaDescription.length} characters</p>
            </div>
            <div>
              <Label>Meta Description (AR)</Label>
              <Textarea value={form.metaDescriptionAr} onChange={(e) => setForm({ ...form, metaDescriptionAr: e.target.value })} placeholder="نظام تشغيل المؤسسات للمالية والعمليات والموارد البشرية وعلاقات العملاء" />
              <p className="text-[10px] text-slate-400 mt-1">{form.metaDescriptionAr.length} characters</p>
            </div>
          </div>
          <div>
            <Label>Keywords</Label>
            <Input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="ERP, enterprise, finance, HR, CRM, Saudi Arabia" />
            <p className="text-[10px] text-slate-400 mt-1">Comma-separated keywords</p>
          </div>
          <Separator />
          <div>
            <Label>OG Image URL</Label>
            <Input value={form.ogImageUrl} onChange={(e) => setForm({ ...form, ogImageUrl: e.target.value })} placeholder="https://example.com/og-image.jpg" />
          </div>
          {form.ogImageUrl && (
            <div className="rounded-lg overflow-hidden border bg-slate-50 p-2">
              <img src={form.ogImageUrl} alt="OG preview" className="max-w-full h-auto rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}
          <Separator />
          <div>
            <Label>Schema JSON-LD</Label>
            <Textarea
              value={form.schemaJson}
              onChange={(e) => setForm({ ...form, schemaJson: e.target.value })}
              rows={10}
              className="font-mono text-xs"
              placeholder="{ &quot;@context&quot;: &quot;https://schema.org&quot;, ... }"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-1.5">
          <Globe className="size-4" />
          Save SEO Settings
        </Button>
      </div>
    </div>
  );
}

export default function WebsiteAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Website Management</h2>
        <p className="text-slate-500">Manage public website content, sections, and SEO</p>
      </div>

      <Tabs defaultValue="module-cards" className="w-full">
        <TabsList className="w-full flex-wrap h-auto gap-1 bg-transparent p-0">
          <TabsTrigger value="module-cards" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200 rounded-lg px-4 py-2">
            <LayoutDashboard className="size-4 mr-2" />
            Module Cards
          </TabsTrigger>
          <TabsTrigger value="hero-slides" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200 rounded-lg px-4 py-2">
            <Image className="size-4 mr-2" />
            Hero Slides
          </TabsTrigger>
          <TabsTrigger value="sections" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200 rounded-lg px-4 py-2">
            <Layers className="size-4 mr-2" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="pricing" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200 rounded-lg px-4 py-2">
            <DollarSign className="size-4 mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200 rounded-lg px-4 py-2">
            <Globe className="size-4 mr-2" />
            SEO
          </TabsTrigger>
        </TabsList>

        <Separator className="my-4" />

        <TabsContent value="module-cards" className="mt-0">
          <ModuleCardsTab />
        </TabsContent>

        <TabsContent value="hero-slides" className="mt-0">
          <HeroSlidesTab />
        </TabsContent>

        <TabsContent value="sections" className="mt-0">
          <SectionsTab />
        </TabsContent>

        <TabsContent value="pricing" className="mt-0">
          <PricingTab />
        </TabsContent>

        <TabsContent value="seo" className="mt-0">
          <SeoTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
