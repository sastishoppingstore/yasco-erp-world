import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/providers/language";
import { useCountryDetection } from "@/providers/country-detection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import {
  Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext,
} from "@/components/ui/carousel";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CountryDetectionBanner } from "@/components/CountryDetectionBanner";
import { ModuleCard3D } from "@/components/ModuleCard3D";
import ThreeBackground from "@/components/ThreeBackground";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import { trpc } from "@/providers/trpc";
import {
  ArrowRight, ChevronDown, X, Menu, Languages, Store, ShoppingCart,
  ShoppingBag, Package, Search, Target, Users, Wallet, FileText, BarChart3,
  Briefcase, CreditCard, CheckCircle2, FolderKanban, Factory, Warehouse,
  Monitor, Image, HeadphonesIcon, Mail, MessageSquare, Award, CalendarCheck,
  ShieldCheck, Sigma, Layers, Globe2, Building2, Network, Cpu, PieChart,
  TrendingUp, Lock, Sliders, BookOpen, Sparkles, Zap, HelpCircle, Star,
  Phone, Mail as MailIcon, MapPin, Clock, Linkedin, Twitter, Github,
  Youtube, ChevronLeft, ChevronRight, Play, Check, Plus, Minus,
  LayoutDashboard, Settings, Truck, Scan, Printer, QrCode, Gift,
  RefreshCw, Map, Sun, Moon, Calendar, Timer, Send, Quote,
  ArrowUpRight, Wrench, Share2, Ticket, Bell, Smartphone, Palette,
  DollarSign, Cloud, Download,
} from "lucide-react";

const BANNER_DISMISS_KEY = "yasco-announcement-dismissed";

const modules: Array<{
  key: string; iconName: string; name: string; nameAr: string;
  description: string; descriptionAr: string; featureCount: number;
  gradientFrom: string; gradientTo: string;
}> = [
  { key: "pos", iconName: "Store", name: "Point of Sale", nameAr: "\u0646\u0642\u0637\u0629 \u0627\u0644\u0628\u064a\u0639", description: "Fast POS with barcode, invoice, payments, and touchscreen support", descriptionAr: "\u0646\u0642\u0637\u0629 \u0628\u064a\u0639 \u0633\u0631\u064a\u0639\u0629 \u0645\u0639 \u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062f \u0648\u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631 \u0648\u0627\u0644\u0645\u062f\u0641\u0648\u0639\u0627\u062a \u0648\u062f\u0639\u0645 \u0634\u0627\u0634\u0629 \u0627\u0644\u0644\u0645\u0633", featureCount: 24, gradientFrom: "from-emerald-500", gradientTo: "to-green-700" },
  { key: "sales", iconName: "ShoppingCart", name: "Sales", nameAr: "\u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a", description: "Customers, quotations, orders, invoices, credit notes, payments", descriptionAr: "\u0627\u0644\u0639\u0645\u0644\u0627\u0621\u060c \u0639\u0631\u0648\u0636 \u0627\u0644\u0623\u0633\u0639\u0627\u0631\u060c \u0627\u0644\u0637\u0644\u0628\u0627\u062a\u060c \u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631\u060c \u0625\u0634\u0639\u0627\u0631\u0627\u062a \u0627\u0644\u062f\u0627\u0626\u0646\u060c \u0627\u0644\u0645\u062f\u0641\u0648\u0639\u0627\u062a", featureCount: 18, gradientFrom: "from-blue-500", gradientTo: "to-blue-700" },
  { key: "purchase", iconName: "ShoppingBag", name: "Purchase", nameAr: "\u0627\u0644\u0645\u0634\u062a\u0631\u064a\u0627\u062a", description: "Suppliers, POs, GRN, supplier payments, purchase analytics", descriptionAr: "\u0627\u0644\u0645\u0648\u0631\u062f\u064a\u0646\u060c \u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0634\u0631\u0627\u0621\u060c \u0625\u064a\u0635\u0627\u0644\u0627\u062a \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645\u060c \u0645\u062f\u0641\u0648\u0639\u0627\u062a \u0627\u0644\u0645\u0648\u0631\u062f\u064a\u0646", featureCount: 14, gradientFrom: "from-purple-500", gradientTo: "to-purple-700" },
  { key: "inventory", iconName: "Package", name: "Inventory", nameAr: "\u0627\u0644\u0645\u062e\u0632\u0648\u0646", description: "Stock tracking, warehouses, movements, transfers, adjustments", descriptionAr: "\u062a\u062a\u0628\u0639 \u0627\u0644\u0645\u062e\u0632\u0648\u0646\u060c \u0627\u0644\u0645\u0633\u062a\u0648\u062f\u0639\u0627\u062a\u060c \u0627\u0644\u062d\u0631\u0643\u0627\u062a\u060c \u0627\u0644\u062a\u062d\u0648\u064a\u0644\u0627\u062a\u060c \u0627\u0644\u062a\u0633\u0648\u064a\u0627\u062a", featureCount: 20, gradientFrom: "from-cyan-500", gradientTo: "to-cyan-700" },
  { key: "items", iconName: "Search", name: "Items", nameAr: "\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a", description: "Product catalog, variants, pricing, barcodes, categories", descriptionAr: "\u0643\u062a\u0627\u0644\u0648\u062c \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a\u060c \u0627\u0644\u0645\u062a\u063a\u064a\u0631\u0627\u062a\u060c \u0627\u0644\u062a\u0633\u0639\u064a\u0631\u060c \u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062f\u060c \u0627\u0644\u0641\u0626\u0627\u062a", featureCount: 12, gradientFrom: "from-teal-500", gradientTo: "to-teal-700" },
  { key: "barcode", iconName: "Target", name: "Barcode", nameAr: "\u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062f", description: "Barcode generation, scanning, labels, print templates", descriptionAr: "\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062f\u060c \u0627\u0644\u0645\u0633\u062d \u0627\u0644\u0636\u0648\u0626\u064a\u060c \u0627\u0644\u0645\u0644\u0635\u0642\u0627\u062a\u060c \u0642\u0648\u0627\u0644\u0628 \u0627\u0644\u0637\u0628\u0627\u0639\u0629", featureCount: 8, gradientFrom: "from-sky-500", gradientTo: "to-sky-700" },
  { key: "accounts", iconName: "BookOpen", name: "Accounts", nameAr: "\u0627\u0644\u062d\u0633\u0627\u0628\u0627\u062a", description: "Chart of accounts, journal entries, general ledger, trial balance", descriptionAr: "\u062f\u0644\u064a\u0644 \u0627\u0644\u062d\u0633\u0627\u0628\u0627\u062a\u060c \u0627\u0644\u0642\u064a\u0648\u062f \u0627\u0644\u064a\u0648\u0645\u064a\u0629\u060c \u0627\u0644\u0623\u0633\u062a\u0627\u0630 \u0627\u0644\u0639\u0627\u0645\u060c \u0645\u064a\u0632\u0627\u0646 \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629", featureCount: 22, gradientFrom: "from-indigo-500", gradientTo: "to-indigo-700" },
  { key: "cashbox", iconName: "Wallet", name: "Cashbox", nameAr: "\u0627\u0644\u0635\u0646\u062f\u0648\u0642", description: "Cash in/out, expenses, balance tracking, daily closure", descriptionAr: "\u0627\u0644\u0625\u064a\u062f\u0627\u0639 \u0648\u0627\u0644\u0633\u062d\u0628 \u0648\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062a \u0648\u062a\u062a\u0628\u0639 \u0627\u0644\u0631\u0635\u064a\u062f \u0648\u0627\u0644\u0625\u063a\u0644\u0627\u0642 \u0627\u0644\u064a\u0648\u0645\u064a", featureCount: 10, gradientFrom: "from-blue-600", gradientTo: "to-blue-800" },
  { key: "invoices", iconName: "FileText", name: "Invoices", nameAr: "\u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631", description: "Invoice creation, templates, QR codes, tax invoices, credit notes", descriptionAr: "\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631\u060c \u0627\u0644\u0642\u0648\u0627\u0644\u0628\u060c \u0631\u0645\u0648\u0632 QR\u060c \u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631 \u0627\u0644\u0636\u0631\u064a\u0628\u064a\u0629\u060c \u0625\u0634\u0639\u0627\u0631\u0627\u062a \u0627\u0644\u062f\u0627\u0626\u0646", featureCount: 16, gradientFrom: "from-orange-500", gradientTo: "to-orange-700" },
  { key: "reports", iconName: "BarChart3", name: "Reports", nameAr: "\u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631", description: "Financial reports, sales reports, inventory reports, custom reports", descriptionAr: "\u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631 \u0627\u0644\u0645\u0627\u0644\u064a\u0629\u060c \u062a\u0642\u0627\u0631\u064a\u0631 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a\u060c \u062a\u0642\u0627\u0631\u064a\u0631 \u0627\u0644\u0645\u062e\u0632\u0648\u0646\u060c \u062a\u0642\u0627\u0631\u064a\u0631 \u0645\u062e\u0635\u0635\u0629", featureCount: 15, gradientFrom: "from-rose-500", gradientTo: "to-rose-700" },
  { key: "crm", iconName: "Users", name: "CRM", nameAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621", description: "Lead management, pipeline, activities, opportunities, forecasting", descriptionAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062d\u062a\u0645\u0644\u064a\u0646\u060c \u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a\u060c \u0627\u0644\u0623\u0646\u0634\u0637\u0629\u060c \u0627\u0644\u0641\u0631\u0635\u060c \u0627\u0644\u062a\u0646\u0628\u0624", featureCount: 20, gradientFrom: "from-pink-500", gradientTo: "to-pink-700" },
  { key: "leads", iconName: "Target", name: "Leads", nameAr: "\u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062d\u062a\u0645\u0644\u064a\u0646", description: "Lead capture, scoring, assignment, conversion tracking", descriptionAr: "\u0627\u0644\u062a\u0642\u0627\u0637 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062d\u062a\u0645\u0644\u064a\u0646\u060c \u0627\u0644\u062a\u0633\u062c\u064a\u0644\u060c \u0627\u0644\u062a\u0639\u064a\u064a\u0646\u060c \u062a\u062a\u0628\u0639 \u0627\u0644\u062a\u062d\u0648\u064a\u0644", featureCount: 10, gradientFrom: "from-red-400", gradientTo: "to-red-600" },
  { key: "deals", iconName: "TrendingUp", name: "Deals", nameAr: "\u0627\u0644\u0635\u0641\u0642\u0627\u062a", description: "Deal tracking, stages, probabilities, pipeline management", descriptionAr: "\u062a\u062a\u0628\u0639 \u0627\u0644\u0635\u0641\u0642\u0627\u062a\u060c \u0627\u0644\u0645\u0631\u0627\u062d\u0644\u060c \u0627\u0644\u0627\u062d\u062a\u0645\u0627\u0644\u0627\u062a\u060c \u0625\u062f\u0627\u0631\u0629 \u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a", featureCount: 8, gradientFrom: "from-orange-400", gradientTo: "to-orange-600" },
  { key: "customers", iconName: "Users", name: "Customers", nameAr: "\u0627\u0644\u0639\u0645\u0644\u0627\u0621", description: "Customer database, history, loyalty, communication logs", descriptionAr: "\u0642\u0627\u0639\u062f\u0629 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u0627\u0621\u060c \u0627\u0644\u0633\u062c\u0644\u060c \u0627\u0644\u0648\u0644\u0627\u0621\u060c \u0633\u062c\u0644\u0627\u062a \u0627\u0644\u062a\u0648\u0627\u0635\u0644", featureCount: 12, gradientFrom: "from-green-400", gradientTo: "to-green-600" },
  { key: "suppliers", iconName: "Briefcase", name: "Suppliers", nameAr: "\u0627\u0644\u0645\u0648\u0631\u062f\u064a\u0646", description: "Supplier management, ratings, contracts, purchase history", descriptionAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0648\u0631\u062f\u064a\u0646\u060c \u0627\u0644\u062a\u0642\u064a\u064a\u0645\u0627\u062a\u060c \u0627\u0644\u0639\u0642\u0648\u062f\u060c \u0633\u062c\u0644 \u0627\u0644\u0634\u0631\u0627\u0621", featureCount: 10, gradientFrom: "from-yellow-500", gradientTo: "to-yellow-700" },
  { key: "hr", iconName: "Briefcase", name: "HR", nameAr: "\u0627\u0644\u0645\u0648\u0627\u0631\u062f \u0627\u0644\u0628\u0634\u0631\u064a\u0629", description: "Employee management, attendance, leaves, payroll, performance", descriptionAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646\u060c \u0627\u0644\u062d\u0636\u0648\u0631\u060c \u0627\u0644\u0625\u062c\u0627\u0632\u0627\u062a\u060c \u0627\u0644\u0631\u0648\u0627\u062a\u0628\u060c \u0627\u0644\u0623\u062f\u0627\u0621", featureCount: 20, gradientFrom: "from-violet-500", gradientTo: "to-violet-700" },
  { key: "employees", iconName: "Users", name: "Employees", nameAr: "\u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646", description: "Employee profiles, documents, contracts, qualifications", descriptionAr: "\u0645\u0644\u0641\u0627\u062a \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646\u060c \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a\u060c \u0627\u0644\u0639\u0642\u0648\u062f\u060c \u0627\u0644\u0645\u0624\u0647\u0644\u0627\u062a", featureCount: 10, gradientFrom: "from-fuchsia-500", gradientTo: "to-fuchsia-700" },
  { key: "payroll", iconName: "CreditCard", name: "Payroll", nameAr: "\u0627\u0644\u0631\u0648\u0627\u062a\u0628", description: "Salary processing, deductions, bonuses, tax calculations", descriptionAr: "\u0645\u0639\u0627\u0644\u062c\u0629 \u0627\u0644\u0631\u0648\u0627\u062a\u0628\u060c \u0627\u0644\u062e\u0635\u0648\u0645\u0627\u062a\u060c \u0627\u0644\u0645\u0643\u0627\u0641\u0622\u062a\u060c \u062d\u0633\u0627\u0628\u0627\u062a \u0627\u0644\u0636\u0631\u0627\u0626\u0628", featureCount: 14, gradientFrom: "from-fuchsia-500", gradientTo: "to-fuchsia-700" },
  { key: "attendance", iconName: "CheckCircle2", name: "Attendance", nameAr: "\u0627\u0644\u062d\u0636\u0648\u0631", description: "Check-in/out, timesheets, overtime, absence tracking", descriptionAr: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644/\u0627\u0644\u062e\u0631\u0648\u062c\u060c \u0633\u0627\u0639\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u060c \u0627\u0644\u0625\u0636\u0627\u0641\u064a\u060c \u062a\u062a\u0628\u0639 \u0627\u0644\u063a\u064a\u0627\u0628", featureCount: 10, gradientFrom: "from-lime-500", gradientTo: "to-lime-700" },
  { key: "leave", iconName: "CalendarCheck", name: "Leave", nameAr: "\u0627\u0644\u0625\u062c\u0627\u0632\u0627\u062a", description: "Leave requests, approvals, balances, policies, calendar", descriptionAr: "\u0637\u0644\u0628\u0627\u062a \u0627\u0644\u0625\u062c\u0627\u0632\u0629\u060c \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062a\u060c \u0627\u0644\u0623\u0631\u0635\u062f\u0629\u060c \u0627\u0644\u0633\u064a\u0627\u0633\u0627\u062a\u060c \u0627\u0644\u062a\u0642\u0648\u064a\u0645", featureCount: 8, gradientFrom: "from-teal-500", gradientTo: "to-teal-700" },
  { key: "recruitment", iconName: "Search", name: "Recruitment", nameAr: "\u0627\u0644\u062a\u0648\u0638\u064a\u0641", description: "Job postings, applications, interviews, offers, onboarding", descriptionAr: "\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0627\u0644\u0648\u0638\u0627\u0626\u0641\u060c \u0627\u0644\u0637\u0644\u0628\u0627\u062a\u060c \u0627\u0644\u0645\u0642\u0627\u0628\u0644\u0627\u062a\u060c \u0627\u0644\u0639\u0631\u0648\u0636\u060c \u0627\u0644\u062a\u0639\u064a\u064a\u0646", featureCount: 10, gradientFrom: "from-cyan-500", gradientTo: "to-cyan-700" },
  { key: "projects", iconName: "FolderKanban", name: "Projects", nameAr: "\u0627\u0644\u0645\u0634\u0627\u0631\u064a\u0639", description: "Project planning, tasks, milestones, Gantt charts, budgets", descriptionAr: "\u062a\u062e\u0637\u064a\u0637 \u0627\u0644\u0645\u0634\u0627\u0631\u064a\u0639\u060c \u0627\u0644\u0645\u0647\u0627\u0645\u060c \u0627\u0644\u0645\u0639\u0627\u0644\u0645\u060c \u0645\u062e\u0637\u0637\u0627\u062a \u062c\u0627\u0646\u062a\u060c \u0627\u0644\u0645\u064a\u0632\u0627\u0646\u064a\u0627\u062a", featureCount: 16, gradientFrom: "from-amber-500", gradientTo: "to-amber-700" },
  { key: "tasks", iconName: "CheckCircle2", name: "Tasks", nameAr: "\u0627\u0644\u0645\u0647\u0627\u0645", description: "Task assignment, priorities, deadlines, dependencies, Kanban", descriptionAr: "\u062a\u0639\u064a\u064a\u0646 \u0627\u0644\u0645\u0647\u0627\u0645\u060c \u0627\u0644\u0623\u0648\u0644\u0648\u064a\u0627\u062a\u060c \u0627\u0644\u0645\u0648\u0627\u0639\u064a\u062f \u0627\u0644\u0646\u0647\u0627\u0626\u064a\u0629\u060c \u0627\u0644\u062a\u0628\u0639\u064a\u0627\u062a\u060c \u0643\u0627\u0646\u0628\u0627\u0646", featureCount: 12, gradientFrom: "from-yellow-500", gradientTo: "to-yellow-700" },
  { key: "timesheets", iconName: "Timer", name: "Timesheets", nameAr: "\u0633\u0627\u0639\u0627\u062a \u0627\u0644\u0639\u0645\u0644", description: "Time tracking, approvals, billing rates, project costing", descriptionAr: "\u062a\u062a\u0628\u0639 \u0627\u0644\u0648\u0642\u062a\u060c \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062a\u060c \u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0641\u0648\u062a\u0631\u0629\u060c \u062a\u0643\u0627\u0644\u064a\u0641 \u0627\u0644\u0645\u0634\u0631\u0648\u0639", featureCount: 8, gradientFrom: "from-orange-500", gradientTo: "to-orange-700" },
  { key: "manufacturing", iconName: "Factory", name: "Manufacturing", nameAr: "\u0627\u0644\u062a\u0635\u0646\u064a\u0639", description: "Production planning, work orders, BOM, quality control", descriptionAr: "\u062a\u062e\u0637\u064a\u0637 \u0627\u0644\u0625\u0646\u062a\u0627\u062c\u060c \u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0639\u0645\u0644\u060c \u0641\u0648\u0627\u062a\u064a\u0631 \u0627\u0644\u0645\u0648\u0627\u062f\u060c \u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u062c\u0648\u062f\u0629", featureCount: 18, gradientFrom: "from-red-500", gradientTo: "to-red-700" },
  { key: "billOfMaterials", iconName: "Layers", name: "Bill of Materials", nameAr: "\u0641\u0648\u0627\u062a\u064a\u0631 \u0627\u0644\u0645\u0648\u0627\u062f", description: "BOM creation, routing, cost calculation, version management", descriptionAr: "\u0625\u0646\u0634\u0627\u0621 \u0641\u0648\u0627\u062a\u064a\u0631 \u0627\u0644\u0645\u0648\u0627\u062f\u060c \u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062a\u060c \u062d\u0633\u0627\u0628 \u0627\u0644\u062a\u0643\u0644\u0641\u0629\u060c \u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0625\u0635\u062f\u0627\u0631\u0627\u062a", featureCount: 10, gradientFrom: "from-rose-500", gradientTo: "to-rose-700" },
  { key: "workOrders", iconName: "FolderKanban", name: "Work Orders", nameAr: "\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0639\u0645\u0644", description: "Work order creation, scheduling, tracking, completion", descriptionAr: "\u0625\u0646\u0634\u0627\u0621 \u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0639\u0645\u0644\u060c \u0627\u0644\u062c\u062f\u0648\u0644\u0629\u060c \u0627\u0644\u062a\u062a\u0628\u0639\u060c \u0627\u0644\u0625\u0643\u0645\u0627\u0644", featureCount: 10, gradientFrom: "from-pink-500", gradientTo: "to-pink-700" },
  { key: "quality", iconName: "ShieldCheck", name: "Quality", nameAr: "\u0627\u0644\u062c\u0648\u062f\u0629", description: "Quality inspections, checklists, non-conformance, corrective actions", descriptionAr: "\u0641\u062d\u0648\u0635\u0627\u062a \u0627\u0644\u062c\u0648\u062f\u0629\u060c \u0642\u0648\u0627\u0626\u0645 \u0627\u0644\u0641\u062d\u0635\u060c \u0639\u062f\u0645 \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629\u060c \u0627\u0644\u0625\u062c\u0631\u0627\u0621\u0627\u062a \u0627\u0644\u062a\u0635\u062d\u064a\u062d\u064a\u0629", featureCount: 10, gradientFrom: "from-emerald-500", gradientTo: "to-emerald-700" },
  { key: "maintenance", iconName: "Wrench", name: "Maintenance", nameAr: "\u0627\u0644\u0635\u064a\u0627\u0646\u0629", description: "Equipment management, maintenance schedules, work requests", descriptionAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0639\u062f\u0627\u062a\u060c \u062c\u062f\u0627\u0648\u0644 \u0627\u0644\u0635\u064a\u0627\u0646\u0629\u060c \u0637\u0644\u0628\u0627\u062a \u0627\u0644\u0639\u0645\u0644", featureCount: 10, gradientFrom: "from-slate-500", gradientTo: "to-slate-700" },
  { key: "warehouse", iconName: "Warehouse", name: "Warehouse", nameAr: "\u0627\u0644\u0645\u0633\u062a\u0648\u062f\u0639", description: "Warehouse management, zones, bins, picking, packing, shipping", descriptionAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062a\u0648\u062f\u0639\u0627\u062a\u060c \u0627\u0644\u0645\u0646\u0627\u0637\u0642\u060c \u0627\u0644\u0623\u0631\u0641\u0641\u060c \u0627\u0644\u0627\u0646\u062a\u0642\u0627\u0621\u060c \u0627\u0644\u062a\u0639\u0628\u0626\u0629\u060c \u0627\u0644\u0634\u062d\u0646", featureCount: 16, gradientFrom: "from-stone-500", gradientTo: "to-stone-700" },
  { key: "stockTransfer", iconName: "ArrowRight", name: "Stock Transfer", nameAr: "\u062a\u062d\u0648\u064a\u0644 \u0627\u0644\u0645\u062e\u0632\u0648\u0646", description: "Inter-warehouse transfers, transfer orders, tracking", descriptionAr: "\u0627\u0644\u062a\u062d\u0648\u064a\u0644\u0627\u062a \u0628\u064a\u0646 \u0627\u0644\u0645\u0633\u062a\u0648\u062f\u0639\u0627\u062a\u060c \u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0646\u0642\u0644\u060c \u0627\u0644\u062a\u062a\u0628\u0639", featureCount: 8, gradientFrom: "from-gray-500", gradientTo: "to-gray-700" },
  { key: "stockAdjustment", iconName: "Sliders", name: "Stock Adjustment", nameAr: "\u062a\u0633\u0648\u064a\u0629 \u0627\u0644\u0645\u062e\u0632\u0648\u0646", description: "Stock counts, adjustments, write-offs, inventory valuation", descriptionAr: "\u062c\u0631\u062f \u0627\u0644\u0645\u062e\u0632\u0648\u0646\u060c \u0627\u0644\u062a\u0633\u0648\u064a\u0627\u062a\u060c \u0627\u0644\u0625\u062a\u0644\u0627\u0641\u060c \u062a\u0642\u064a\u064a\u0645 \u0627\u0644\u0645\u062e\u0632\u0648\u0646", featureCount: 8, gradientFrom: "from-neutral-500", gradientTo: "to-neutral-700" },
  { key: "ecommerce", iconName: "Monitor", name: "Ecommerce", nameAr: "\u0627\u0644\u062a\u062c\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629", description: "Online store, product listing, cart, checkout, orders, payments", descriptionAr: "\u0645\u062a\u062c\u0631 \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u060c \u0639\u0631\u0636 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a\u060c \u0633\u0644\u0629 \u0627\u0644\u062a\u0633\u0648\u0642\u060c \u0627\u0644\u062f\u0641\u0639\u060c \u0627\u0644\u0637\u0644\u0628\u0627\u062a", featureCount: 20, gradientFrom: "from-emerald-600", gradientTo: "to-green-800" },
  { key: "websiteBuilder", iconName: "Image", name: "Website Builder", nameAr: "\u0628\u0646\u0627\u0621 \u0627\u0644\u0645\u0648\u0627\u0642\u0639", description: "Drag-and-drop builder, themes, pages, SEO, custom domains", descriptionAr: "\u0645\u0646\u0634\u0626 \u0633\u062d\u0628 \u0648\u0625\u0641\u0644\u0627\u062a\u060c \u0633\u0645\u0627\u062a\u060c \u0635\u0641\u062d\u0627\u062a\u060c SEO\u060c \u0646\u0637\u0627\u0642\u0627\u062a \u0645\u062e\u0635\u0635\u0629", featureCount: 14, gradientFrom: "from-blue-500", gradientTo: "to-indigo-700" },
  { key: "blog", iconName: "FileText", name: "Blog", nameAr: "\u0627\u0644\u0645\u062f\u0648\u0646\u0629", description: "Blog posts, categories, tags, comments, SEO optimization", descriptionAr: "\u0645\u0642\u0627\u0644\u0627\u062a \u0627\u0644\u0645\u062f\u0648\u0646\u0629\u060c \u0627\u0644\u0641\u0626\u0627\u062a\u060c \u0627\u0644\u0648\u0633\u0648\u0645\u060c \u0627\u0644\u062a\u0639\u0644\u064a\u0642\u0627\u062a\u060c \u062a\u062d\u0633\u064a\u0646 SEO", featureCount: 8, gradientFrom: "from-orange-500", gradientTo: "to-orange-700" },
  { key: "landingPages", iconName: "LayoutDashboard", name: "Landing Pages", nameAr: "\u0635\u0641\u062d\u0627\u062a \u0627\u0644\u0647\u0628\u0648\u0637", description: "Landing page builder, templates, forms, analytics, A/B testing", descriptionAr: "\u0645\u0646\u0634\u0626 \u0635\u0641\u062d\u0627\u062a \u0627\u0644\u0647\u0628\u0648\u0637\u060c \u0627\u0644\u0642\u0648\u0627\u0644\u0628\u060c \u0627\u0644\u0646\u0645\u0627\u0630\u062c\u060c \u0627\u0644\u062a\u062d\u0644\u064a\u0644\u0627\u062a\u060c \u0627\u062e\u062a\u0628\u0627\u0631 A/B", featureCount: 8, gradientFrom: "from-violet-500", gradientTo: "to-violet-700" },
  { key: "forms", iconName: "FileText", name: "Forms", nameAr: "\u0627\u0644\u0646\u0645\u0627\u0630\u062c", description: "Form builder, submissions, validation, conditional logic", descriptionAr: "\u0645\u0646\u0634\u0626 \u0627\u0644\u0646\u0645\u0627\u0630\u062c\u060c \u0627\u0644\u0625\u0631\u0633\u0627\u0644\u0627\u062a\u060c \u0627\u0644\u062a\u062d\u0642\u0642\u060c \u0627\u0644\u0645\u0646\u0637\u0642 \u0627\u0644\u0634\u0631\u0637\u064a", featureCount: 8, gradientFrom: "from-teal-500", gradientTo: "to-teal-700" },
  { key: "survey", iconName: "BarChart3", name: "Survey", nameAr: "\u0627\u0644\u0627\u0633\u062a\u0628\u064a\u0627\u0646\u0627\u062a", description: "Survey creation, distribution, responses, analytics, reports", descriptionAr: "\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0627\u0633\u062a\u0628\u064a\u0627\u0646\u0627\u062a\u060c \u0627\u0644\u062a\u0648\u0632\u064a\u0639\u060c \u0627\u0644\u0631\u062f\u0648\u062f\u060c \u0627\u0644\u062a\u062d\u0644\u064a\u0644\u0627\u062a\u060c \u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631", featureCount: 8, gradientFrom: "from-cyan-500", gradientTo: "to-cyan-700" },
  { key: "emailMarketing", iconName: "Mail", name: "Email Marketing", nameAr: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0627\u0644\u062a\u0633\u0648\u064a\u0642\u064a", description: "Campaigns, templates, lists, automation, tracking, analytics", descriptionAr: "\u0627\u0644\u062d\u0645\u0644\u0627\u062a\u060c \u0627\u0644\u0642\u0648\u0627\u0644\u0628\u060c \u0627\u0644\u0642\u0648\u0627\u0626\u0645\u060c \u0627\u0644\u0623\u062a\u0645\u062a\u0629\u060c \u0627\u0644\u062a\u062a\u0628\u0639\u060c \u0627\u0644\u062a\u062d\u0644\u064a\u0644\u0627\u062a", featureCount: 14, gradientFrom: "from-sky-600", gradientTo: "to-sky-800" },
  { key: "smsMarketing", iconName: "MessageSquare", name: "SMS Marketing", nameAr: "\u0627\u0644\u062a\u0633\u0648\u064a\u0642 \u0639\u0628\u0631 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0646\u0635\u064a\u0629", description: "SMS campaigns, templates, scheduling, delivery reports", descriptionAr: "\u062d\u0645\u0644\u0627\u062a \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0646\u0635\u064a\u0629\u060c \u0627\u0644\u0642\u0648\u0627\u0644\u0628\u060c \u0627\u0644\u062c\u062f\u0648\u0644\u0629\u060c \u062a\u0642\u0627\u0631\u064a\u0631 \u0627\u0644\u062a\u0633\u0644\u064a\u0645", featureCount: 8, gradientFrom: "from-green-600", gradientTo: "to-green-800" },
  { key: "whatsappMarketing", iconName: "MessageSquare", name: "WhatsApp Marketing", nameAr: "\u0627\u0644\u062a\u0633\u0648\u064a\u0642 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628", description: "WhatsApp campaigns, templates, automation, chat, broadcasts", descriptionAr: "\u062d\u0645\u0644\u0627\u062a \u0648\u0627\u062a\u0633\u0627\u0628\u060c \u0627\u0644\u0642\u0648\u0627\u0644\u0628\u060c \u0627\u0644\u0623\u062a\u0645\u062a\u0629\u060c \u0627\u0644\u062f\u0631\u062f\u0634\u0629\u060c \u0627\u0644\u0628\u062b", featureCount: 10, gradientFrom: "from-emerald-600", gradientTo: "to-emerald-800" },
  { key: "socialMarketing", iconName: "Share2", name: "Social Marketing", nameAr: "\u0627\u0644\u062a\u0633\u0648\u064a\u0642 \u0639\u0628\u0631 \u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062a\u0648\u0627\u0635\u0644", description: "Social media management, scheduling, analytics, engagement", descriptionAr: "\u0625\u062f\u0627\u0631\u0629 \u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u060c \u0627\u0644\u062c\u062f\u0648\u0644\u0629\u060c \u0627\u0644\u062a\u062d\u0644\u064a\u0644\u0627\u062a\u060c \u0627\u0644\u062a\u0641\u0627\u0639\u0644", featureCount: 10, gradientFrom: "from-blue-600", gradientTo: "to-blue-800" },
  { key: "helpdesk", iconName: "HeadphonesIcon", name: "Help Desk", nameAr: "\u062e\u062f\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621", description: "Ticket management, SLA, knowledge base, customer portal", descriptionAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u062a\u0630\u0627\u0643\u0631\u060c \u0627\u062a\u0641\u0627\u0642\u064a\u0627\u062a \u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u062e\u062f\u0645\u0629\u060c \u0642\u0627\u0639\u062f\u0629 \u0627\u0644\u0645\u0639\u0631\u0641\u0629\u060c \u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0639\u0645\u064a\u0644", featureCount: 14, gradientFrom: "from-teal-600", gradientTo: "to-teal-800" },
  { key: "tickets", iconName: "Ticket", name: "Tickets", nameAr: "\u0627\u0644\u062a\u0630\u0627\u0643\u0631", description: "Ticket creation, assignment, prioritization, resolution tracking", descriptionAr: "\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062a\u0630\u0627\u0643\u0631\u060c \u0627\u0644\u062a\u0639\u064a\u064a\u0646\u060c \u062a\u062d\u062f\u064a\u062f \u0627\u0644\u0623\u0648\u0644\u0648\u064a\u0627\u062a\u060c \u062a\u062a\u0628\u0639 \u0627\u0644\u062d\u0644", featureCount: 10, gradientFrom: "from-amber-500", gradientTo: "to-amber-700" },
  { key: "liveChat", iconName: "MessageSquare", name: "Live Chat", nameAr: "\u0627\u0644\u062f\u0631\u062f\u0634\u0629 \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629", description: "Real-time chat, bots, file sharing, chat history, transcripts", descriptionAr: "\u062f\u0631\u062f\u0634\u0629 \u0641\u0648\u0631\u064a\u0629\u060c \u0628\u0648\u062a\u0627\u062a\u060c \u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u0645\u0644\u0641\u0627\u062a\u060c \u0633\u062c\u0644 \u0627\u0644\u062f\u0631\u062f\u0634\u0629\u060c \u0627\u0644\u0646\u0635\u0648\u0635", featureCount: 8, gradientFrom: "from-green-500", gradientTo: "to-green-700" },
  { key: "knowledgeBase", iconName: "BookOpen", name: "Knowledge Base", nameAr: "\u0642\u0627\u0639\u062f\u0629 \u0627\u0644\u0645\u0639\u0631\u0641\u0629", description: "Articles, categories, search, ratings, feedback, versioning", descriptionAr: "\u0627\u0644\u0645\u0642\u0627\u0644\u0627\u062a\u060c \u0627\u0644\u0641\u0626\u0627\u062a\u060c \u0627\u0644\u0628\u062d\u062b\u060c \u0627\u0644\u062a\u0642\u064a\u064a\u0645\u0627\u062a\u060c \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a\u060c \u0627\u0644\u0625\u0635\u062f\u0627\u0631\u0627\u062a", featureCount: 8, gradientFrom: "from-indigo-500", gradientTo: "to-indigo-700" },
  { key: "documents", iconName: "FileText", name: "Documents", nameAr: "\u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a", description: "Document management, folders, sharing, version control, search", descriptionAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a\u060c \u0627\u0644\u0645\u062c\u0644\u062f\u0627\u062a\u060c \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629\u060c \u0627\u0644\u062a\u062d\u0643\u0645 \u0628\u0627\u0644\u0625\u0635\u062f\u0627\u0631\u0627\u062a\u060c \u0627\u0644\u0628\u062d\u062b", featureCount: 10, gradientFrom: "from-amber-500", gradientTo: "to-amber-700" },
  { key: "digitalSignature", iconName: "Lock", name: "Digital Signature", nameAr: "\u0627\u0644\u062a\u0648\u0642\u064a\u0639 \u0627\u0644\u0631\u0642\u0645\u064a", description: "E-signatures, certificates, audit trail, compliance, verification", descriptionAr: "\u0627\u0644\u062a\u0648\u0642\u064a\u0639\u0627\u062a \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629\u060c \u0627\u0644\u0634\u0647\u0627\u062f\u0627\u062a\u060c \u0633\u062c\u0644 \u0627\u0644\u062a\u062f\u0642\u064a\u0642\u060c \u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644\u060c \u0627\u0644\u062a\u062d\u0642\u0642", featureCount: 8, gradientFrom: "from-gray-600", gradientTo: "to-gray-800" },
  { key: "contracts", iconName: "FileText", name: "Contracts", nameAr: "\u0627\u0644\u0639\u0642\u0648\u062f", description: "Contract management, templates, renewals, approvals, storage", descriptionAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0639\u0642\u0648\u062f\u060c \u0627\u0644\u0642\u0648\u0627\u0644\u0628\u060c \u0627\u0644\u062a\u062c\u062f\u064a\u062f\u0627\u062a\u060c \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062a\u060c \u0627\u0644\u062a\u062e\u0632\u064a\u0646", featureCount: 10, gradientFrom: "from-slate-500", gradientTo: "to-slate-700" },
  { key: "subscriptions", iconName: "Award", name: "Subscriptions", nameAr: "\u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643\u0627\u062a", description: "Subscription plans, recurring billing, invoicing, management", descriptionAr: "\u062e\u0637\u0637 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643\u060c \u0627\u0644\u0641\u0648\u062a\u0631\u0629 \u0627\u0644\u0645\u062a\u0643\u0631\u0631\u0629\u060c \u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631\u060c \u0627\u0644\u0625\u062f\u0627\u0631\u0629", featureCount: 12, gradientFrom: "from-purple-600", gradientTo: "to-purple-800" },
  { key: "installments", iconName: "CalendarCheck", name: "Installments", nameAr: "\u0627\u0644\u062a\u0642\u0633\u064a\u0637", description: "Installment plans, payment scheduling, tracking, reminders", descriptionAr: "\u062e\u0637\u0637 \u0627\u0644\u062a\u0642\u0633\u064a\u0637\u060c \u062c\u062f\u0648\u0644\u0629 \u0627\u0644\u062f\u0641\u0639\u060c \u0627\u0644\u062a\u062a\u0628\u0639\u060c \u0627\u0644\u062a\u0630\u0643\u064a\u0631\u0627\u062a", featureCount: 10, gradientFrom: "from-violet-600", gradientTo: "to-violet-800" },
  { key: "rental", iconName: "CalendarCheck", name: "Rental", nameAr: "\u0627\u0644\u0625\u064a\u062c\u0627\u0631", description: "Rental management, bookings, contracts, payments, maintenance", descriptionAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0625\u064a\u062c\u0627\u0631\u060c \u0627\u0644\u062d\u062c\u0648\u0632\u0627\u062a\u060c \u0627\u0644\u0639\u0642\u0648\u062f\u060c \u0627\u0644\u0645\u062f\u0641\u0648\u0639\u0627\u062a\u060c \u0627\u0644\u0635\u064a\u0627\u0646\u0629", featureCount: 10, gradientFrom: "from-indigo-500", gradientTo: "to-indigo-700" },
  { key: "fleet", iconName: "Truck", name: "Fleet", nameAr: "\u0623\u0633\u0637\u0648\u0644 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062a", description: "Fleet management, vehicles, drivers, trips, fuel, maintenance", descriptionAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0623\u0633\u0637\u0648\u0644\u060c \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062a\u060c \u0627\u0644\u0633\u0627\u0626\u0642\u064a\u0646\u060c \u0627\u0644\u0631\u062d\u0644\u0627\u062a\u060c \u0627\u0644\u0648\u0642\u0648\u062f\u060c \u0627\u0644\u0635\u064a\u0627\u0646\u0629", featureCount: 12, gradientFrom: "from-blue-500", gradientTo: "to-blue-700" },
  { key: "fieldService", iconName: "MapPin", name: "Field Service", nameAr: "\u0627\u0644\u062e\u062f\u0645\u0629 \u0627\u0644\u0645\u064a\u062f\u0627\u0646\u064a\u0629", description: "Field service, scheduling, dispatch, mobile app, inventory", descriptionAr: "\u0627\u0644\u062e\u062f\u0645\u0629 \u0627\u0644\u0645\u064a\u062f\u0627\u0646\u064a\u0629\u060c \u0627\u0644\u062c\u062f\u0648\u0644\u0629\u060c \u0627\u0644\u0625\u0631\u0633\u0627\u0644\u060c \u062a\u0637\u0628\u064a\u0642 \u0627\u0644\u062c\u0648\u0627\u0644\u060c \u0627\u0644\u0645\u062e\u0632\u0648\u0646", featureCount: 10, gradientFrom: "from-cyan-500", gradientTo: "to-cyan-700" },
  { key: "expenses", iconName: "Wallet", name: "Expenses", nameAr: "\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062a", description: "Expense tracking, categories, approval, reimbursement, reports", descriptionAr: "\u062a\u062a\u0628\u0639 \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062a\u060c \u0627\u0644\u0641\u0626\u0627\u062a\u060c \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629\u060c \u0627\u0644\u062a\u0639\u0648\u064a\u0636\u060c \u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631", featureCount: 10, gradientFrom: "from-orange-500", gradientTo: "to-orange-700" },
  { key: "budgeting", iconName: "PieChart", name: "Budgeting", nameAr: "\u0627\u0644\u0645\u064a\u0632\u0627\u0646\u064a\u0627\u062a", description: "Budget creation, allocation, tracking, variance analysis", descriptionAr: "\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u064a\u0632\u0627\u0646\u064a\u0629\u060c \u0627\u0644\u062a\u062e\u0635\u064a\u0635\u060c \u0627\u0644\u062a\u062a\u0628\u0639\u060c \u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u062a\u0628\u0627\u064a\u0646", featureCount: 10, gradientFrom: "from-teal-500", gradientTo: "to-teal-700" },
  { key: "fixedAssets", iconName: "Building2", name: "Fixed Assets", nameAr: "\u0627\u0644\u0623\u0635\u0648\u0644 \u0627\u0644\u062b\u0627\u0628\u062a\u0629", description: "Asset registry, depreciation, disposal, tracking, valuation", descriptionAr: "\u0633\u062c\u0644 \u0627\u0644\u0623\u0635\u0648\u0644\u060c \u0627\u0644\u0625\u0647\u0644\u0627\u0643\u060c \u0627\u0644\u062a\u0635\u0631\u0641\u060c \u0627\u0644\u062a\u062a\u0628\u0639\u060c \u0627\u0644\u062a\u0642\u064a\u064a\u0645", featureCount: 10, gradientFrom: "from-green-500", gradientTo: "to-green-700" },
  { key: "bankReconciliation", iconName: "CreditCard", name: "Bank Reconciliation", nameAr: "\u0627\u0644\u062a\u0633\u0648\u064a\u0629 \u0627\u0644\u0628\u0646\u0643\u064a\u0629", description: "Bank statement import, matching, reconciliation, reporting", descriptionAr: "\u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0643\u0634\u0641 \u0627\u0644\u062d\u0633\u0627\u0628 \u0627\u0644\u0628\u0646\u0643\u064a\u060c \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629\u060c \u0627\u0644\u062a\u0633\u0648\u064a\u0629\u060c \u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631", featureCount: 8, gradientFrom: "from-blue-500", gradientTo: "to-blue-700" },
  { key: "taxCompliance", iconName: "ShieldCheck", name: "Tax Compliance", nameAr: "\u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644 \u0627\u0644\u0636\u0631\u064a\u0628\u064a", description: "Multi-country tax engine, automated calculations, reporting", descriptionAr: "\u0645\u062d\u0631\u0643 \u0636\u0631\u0627\u0626\u0628 \u0645\u062a\u0639\u062f\u062f \u0627\u0644\u0628\u0644\u062f\u0627\u0646\u060c \u062d\u0633\u0627\u0628\u0627\u062a \u0622\u0644\u064a\u0629\u060c \u062a\u0642\u0627\u0631\u064a\u0631", featureCount: 16, gradientFrom: "from-red-600", gradientTo: "to-red-800" },
  { key: "zatca", iconName: "Sigma", name: "ZATCA Saudi", nameAr: "\u0632\u0627\u062a\u0643\u0627 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629", description: "Saudi e-invoicing Phase 1 & 2, QR codes, clearance", descriptionAr: "\u0627\u0644\u0641\u0648\u062a\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629 \u0627\u0644\u0645\u0631\u062d\u0644\u062a\u0627\u0646 1 \u06482\u060c \u0631\u0645\u0648\u0632 QR", featureCount: 12, gradientFrom: "from-green-700", gradientTo: "to-emerald-900" },
  { key: "fbr", iconName: "Layers", name: "FBR Pakistan", nameAr: "FBR \u0628\u0627\u0643\u0633\u062a\u0627\u0646", description: "FBR digital invoicing API, NTN, STRN, sales tax, withholding", descriptionAr: "API \u0627\u0644\u0641\u0648\u062a\u0631\u0629 \u0627\u0644\u0631\u0642\u0645\u064a\u0629 FBR\u060c NTN\u060c STRN\u060c \u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a\u060c \u0627\u0644\u062e\u0635\u0645", featureCount: 10, gradientFrom: "from-blue-700", gradientTo: "to-blue-900" },
  { key: "uaeVat", iconName: "Globe2", name: "UAE VAT", nameAr: "\u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629", description: "UAE VAT compliance, TRN, tax invoices, VAT return reports", descriptionAr: "\u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644 \u0644\u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629 \u0641\u064a \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a\u060c TRN\u060c \u062a\u0642\u0627\u0631\u064a\u0631 \u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629", featureCount: 10, gradientFrom: "from-amber-600", gradientTo: "to-amber-800" },
  { key: "indiaGst", iconName: "Globe2", name: "India GST", nameAr: "\u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0633\u0644\u0639 \u0627\u0644\u0647\u0646\u062f\u064a\u0629", description: "India GST compliance, HSN codes, GST returns, e-way bills", descriptionAr: "\u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644 \u0644\u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0633\u0644\u0639 \u0641\u064a \u0627\u0644\u0647\u0646\u062f\u060c \u0623\u0643\u0648\u0627\u062f HSN\u060c \u0625\u0642\u0631\u0627\u0631\u0627\u062a GST", featureCount: 10, gradientFrom: "from-orange-600", gradientTo: "to-orange-800" },
  { key: "euVat", iconName: "Globe2", name: "EU VAT", nameAr: "\u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629", description: "EU VAT compliance, OSS, IOSS, VAT numbers, cross-border", descriptionAr: "\u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644 \u0644\u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629 \u0641\u064a \u0627\u0644\u0627\u062a\u062d\u0627\u062f \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064a", featureCount: 10, gradientFrom: "from-blue-600", gradientTo: "to-blue-800" },
  { key: "usaSalesTax", iconName: "DollarSign", name: "USA Sales Tax", nameAr: "\u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u0627\u0644\u0623\u0645\u0631\u064a\u0643\u064a\u0629", description: "US sales tax, state rates, nexus, filing, reports", descriptionAr: "\u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u0627\u0644\u0623\u0645\u0631\u064a\u0643\u064a\u0629\u060c \u0645\u0639\u062f\u0644\u0627\u062a \u0627\u0644\u0648\u0644\u0627\u064a\u0627\u062a", featureCount: 10, gradientFrom: "from-indigo-600", gradientTo: "to-indigo-800" },
  { key: "multiCompany", iconName: "Building2", name: "Multi-company", nameAr: "\u0634\u0631\u0643\u0627\u062a \u0645\u062a\u0639\u062f\u062f\u0629", description: "Multi-company management, consolidation, inter-company transactions", descriptionAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0634\u0631\u0643\u0627\u062a \u0627\u0644\u0645\u062a\u0639\u062f\u062f\u0629\u060c \u0627\u0644\u062f\u0645\u062c\u060c \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062a \u0628\u064a\u0646 \u0627\u0644\u0634\u0631\u0643\u0627\u062a", featureCount: 12, gradientFrom: "from-indigo-600", gradientTo: "to-indigo-800" },
  { key: "multiBranch", iconName: "Network", name: "Multi-branch", nameAr: "\u0641\u0631\u0648\u0639 \u0645\u062a\u0639\u062f\u062f\u0629", description: "Multi-branch management, hierarchy, reporting, permissions", descriptionAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0641\u0631\u0648\u0639 \u0627\u0644\u0645\u062a\u0639\u062f\u062f\u0629\u060c \u0627\u0644\u062a\u0633\u0644\u0633\u0644 \u0627\u0644\u0647\u0631\u0645\u064a\u060c \u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631\u060c \u0627\u0644\u0635\u0644\u0627\u062d\u064a\u0627\u062a", featureCount: 10, gradientFrom: "from-cyan-600", gradientTo: "to-cyan-800" },
  { key: "multiWarehouse", iconName: "Warehouse", name: "Multi-warehouse", nameAr: "\u0645\u0633\u062a\u0648\u062f\u0639\u0627\u062a \u0645\u062a\u0639\u062f\u062f\u0629", description: "Multi-warehouse, transfers, consolidated inventory, reporting", descriptionAr: "\u0645\u0633\u062a\u0648\u062f\u0639\u0627\u062a \u0645\u062a\u0639\u062f\u062f\u0629\u060c \u0627\u0644\u062a\u062d\u0648\u064a\u0644\u0627\u062a\u060c \u0627\u0644\u0645\u062e\u0632\u0648\u0646 \u0627\u0644\u0645\u0648\u062d\u062f\u060c \u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631", featureCount: 10, gradientFrom: "from-stone-600", gradientTo: "to-stone-800" },
  { key: "multiCurrency", iconName: "CreditCard", name: "Multi-currency", nameAr: "\u0639\u0645\u0644\u0627\u062a \u0645\u062a\u0639\u062f\u062f\u0629", description: "Multi-currency support, exchange rates, revaluation, reporting", descriptionAr: "\u062f\u0639\u0645 \u0627\u0644\u0639\u0645\u0644\u0627\u062a \u0627\u0644\u0645\u062a\u0639\u062f\u062f\u0629\u060c \u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0635\u0631\u0641\u060c \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0642\u064a\u064a\u0645\u060c \u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631", featureCount: 10, gradientFrom: "from-emerald-500", gradientTo: "to-emerald-700" },
  { key: "multiLanguage", iconName: "Languages", name: "Multi-language", nameAr: "\u0644\u063a\u0627\u062a \u0645\u062a\u0639\u062f\u062f\u0629", description: "Full bilingual support (EN/AR), RTL, more languages coming", descriptionAr: "\u062f\u0639\u0645 \u0643\u0627\u0645\u0644 \u0644\u0644\u063a\u062a\u064a\u0646 (\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629/\u0627\u0644\u0639\u0631\u0628\u064a\u0629)\u060c RTL\u060c \u0627\u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u0644\u063a\u0627\u062a \u0642\u0631\u064a\u0628\u0627\u064b", featureCount: 8, gradientFrom: "from-sky-500", gradientTo: "to-sky-700" },
  { key: "multiTimezone", iconName: "Globe2", name: "Multi-timezone", nameAr: "\u0645\u0646\u0627\u0637\u0642 \u0632\u0645\u0646\u064a\u0629 \u0645\u062a\u0639\u062f\u062f\u0629", description: "Timezone-aware system, automatic detection, conversion", descriptionAr: "\u0646\u0638\u0627\u0645 \u064a\u062f\u0631\u0643 \u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u0632\u0645\u0646\u064a\u0629\u060c \u0627\u0644\u0643\u0634\u0641 \u0627\u0644\u062a\u0644\u0642\u0627\u0626\u064a\u060c \u0627\u0644\u062a\u062d\u0648\u064a\u0644", featureCount: 6, gradientFrom: "from-violet-500", gradientTo: "to-violet-700" },
  { key: "aiAssistant", iconName: "Cpu", name: "AI Assistant", nameAr: "\u0627\u0644\u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0630\u0643\u064a", description: "AI-powered recommendations, predictions, automation, chatbot", descriptionAr: "\u062a\u0648\u0635\u064a\u0627\u062a \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a\u060c \u062a\u0646\u0628\u0624\u0627\u062a\u060c \u0623\u062a\u0645\u062a\u0629\u060c \u0631\u0648\u0628\u0648\u062a \u0645\u062d\u0627\u062f\u062b\u0629", featureCount: 14, gradientFrom: "from-violet-500", gradientTo: "to-violet-700" },
  { key: "analytics", iconName: "TrendingUp", name: "Analytics", nameAr: "\u0627\u0644\u062a\u062d\u0644\u064a\u0644\u0627\u062a", description: "Business intelligence, dashboards, KPIs, data visualization", descriptionAr: "\u0630\u0643\u0627\u0621 \u0627\u0644\u0623\u0639\u0645\u0627\u0644\u060c \u0644\u0648\u062d\u0627\u062a \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a\u060c \u0645\u0624\u0634\u0631\u0627\u062a \u0627\u0644\u0623\u062f\u0627\u0621\u060c \u062a\u0635\u0648\u0631 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a", featureCount: 14, gradientFrom: "from-rose-500", gradientTo: "to-rose-700" },
  { key: "kpiDashboard", iconName: "LayoutDashboard", name: "KPI Dashboard", nameAr: "\u0644\u0648\u062d\u0629 \u0645\u0624\u0634\u0631\u0627\u062a \u0627\u0644\u0623\u062f\u0627\u0621", description: "Real-time KPI monitoring, customizable widgets, drill-down", descriptionAr: "\u0645\u0631\u0627\u0642\u0628\u0629 \u0645\u0624\u0634\u0631\u0627\u062a \u0627\u0644\u0623\u062f\u0627\u0621 \u0627\u0644\u0641\u0648\u0631\u064a\u0629\u060c \u0623\u062f\u0648\u0627\u062a \u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u062a\u062e\u0635\u064a\u0635", featureCount: 10, gradientFrom: "from-blue-500", gradientTo: "to-blue-700" },
  { key: "reportBuilder", iconName: "BarChart3", name: "Report Builder", nameAr: "\u0645\u0646\u0634\u0626 \u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631", description: "Custom report builder, drag-and-drop, export, scheduling", descriptionAr: "\u0645\u0646\u0634\u0626 \u062a\u0642\u0627\u0631\u064a\u0631 \u0645\u062e\u0635\u0635\u060c \u0633\u062d\u0628 \u0648\u0625\u0641\u0644\u0627\u062a\u060c \u062a\u0635\u062f\u064a\u0631\u060c \u062c\u062f\u0648\u0644\u0629", featureCount: 10, gradientFrom: "from-purple-500", gradientTo: "to-purple-700" },
  { key: "workflowAutomation", iconName: "Zap", name: "Workflow Automation", nameAr: "\u0623\u062a\u0645\u062a\u0629 \u0633\u064a\u0631 \u0627\u0644\u0639\u0645\u0644", description: "Automated workflows, triggers, actions, approvals, notifications", descriptionAr: "\u0633\u064a\u0631 \u0639\u0645\u0644 \u0622\u0644\u064a\u060c \u0627\u0644\u0645\u0634\u063a\u0644\u0627\u062a\u060c \u0627\u0644\u0625\u062c\u0631\u0627\u0621\u0627\u062a\u060c \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062a\u060c \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a", featureCount: 12, gradientFrom: "from-yellow-500", gradientTo: "to-yellow-700" },
  { key: "approvals", iconName: "CheckCircle2", name: "Approvals", nameAr: "\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062a", description: "Approval workflows, multi-level, delegation, audit trail", descriptionAr: "\u0633\u064a\u0631 \u0639\u0645\u0644 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062a\u060c \u0645\u062a\u0639\u062f\u062f \u0627\u0644\u0645\u0633\u062a\u0648\u064a\u0627\u062a\u060c \u0627\u0644\u062a\u0641\u0648\u064a\u0636\u060c \u0633\u062c\u0644 \u0627\u0644\u062a\u062f\u0642\u064a\u0642", featureCount: 8, gradientFrom: "from-green-500", gradientTo: "to-green-700" },
  { key: "rolePermissions", iconName: "ShieldCheck", name: "Role Permissions", nameAr: "\u0635\u0644\u0627\u062d\u064a\u0627\u062a \u0627\u0644\u0623\u062f\u0648\u0627\u0631", description: "Role-based access control, granular permissions, security", descriptionAr: "\u0627\u0644\u062a\u062d\u0643\u0645 \u0641\u064a \u0627\u0644\u0648\u0635\u0648\u0644 \u062d\u0633\u0628 \u0627\u0644\u062f\u0648\u0631\u060c \u0635\u0644\u0627\u062d\u064a\u0627\u062a \u062f\u0642\u064a\u0642\u0629\u060c \u0627\u0644\u0623\u0645\u0627\u0646", featureCount: 8, gradientFrom: "from-gray-500", gradientTo: "to-gray-700" },
  { key: "auditLogs", iconName: "FileText", name: "Audit Logs", nameAr: "\u0633\u062c\u0644\u0627\u062a \u0627\u0644\u062a\u062f\u0642\u064a\u0642", description: "Complete audit trail, user activity, changes, compliance", descriptionAr: "\u0633\u062c\u0644 \u062a\u062f\u0642\u064a\u0642 \u0643\u0627\u0645\u0644\u060c \u0646\u0634\u0627\u0637 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u060c \u0627\u0644\u062a\u063a\u064a\u064a\u0631\u0627\u062a\u060c \u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644", featureCount: 8, gradientFrom: "from-slate-500", gradientTo: "to-slate-700" },
  { key: "security", iconName: "Lock", name: "Security", nameAr: "\u0627\u0644\u0623\u0645\u0627\u0646", description: "Enterprise security, encryption, 2FA, IP whitelisting, SSO", descriptionAr: "\u0623\u0645\u0627\u0646 \u0627\u0644\u0645\u0624\u0633\u0633\u0627\u062a\u060c \u0627\u0644\u062a\u0634\u0641\u064a\u0631\u060c \u0627\u0644\u0645\u0635\u0627\u062f\u0642\u0629 \u0627\u0644\u062b\u0646\u0627\u0626\u064a\u0629", featureCount: 12, gradientFrom: "from-red-500", gradientTo: "to-red-700" },
  { key: "api", iconName: "Network", name: "API", nameAr: "API", description: "REST & GraphQL APIs, documentation, keys, rate limiting", descriptionAr: "\u0648\u0627\u062c\u0647\u0627\u062a REST \u0648 GraphQL\u060c \u0627\u0644\u062a\u0648\u062b\u064a\u0642\u060c \u0627\u0644\u0645\u0641\u0627\u062a\u064a\u062d", featureCount: 8, gradientFrom: "from-blue-500", gradientTo: "to-blue-700" },
  { key: "webhooks", iconName: "Zap", name: "Webhooks", nameAr: "Webhooks", description: "Webhook events, delivery, retry, logging, management", descriptionAr: "\u0623\u062d\u062f\u0627\u062b Webhooks\u060c \u0627\u0644\u062a\u0633\u0644\u064a\u0645\u060c \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629\u060c \u0627\u0644\u062a\u0633\u062c\u064a\u0644", featureCount: 6, gradientFrom: "from-purple-500", gradientTo: "to-purple-700" },
  { key: "marketplace", iconName: "Store", name: "Marketplace", nameAr: "\u0627\u0644\u0645\u062a\u062c\u0631", description: "App marketplace, extensions, integrations, plugins, themes", descriptionAr: "\u0645\u062a\u062c\u0631 \u0627\u0644\u062a\u0637\u0628\u064a\u0642\u0627\u062a\u060c \u0627\u0644\u0625\u0636\u0627\u0641\u0627\u062a\u060c \u0627\u0644\u062a\u0643\u0627\u0645\u0644\u0627\u062a\u060c \u0627\u0644\u0625\u0636\u0627\u0641\u0627\u062a\u060c \u0627\u0644\u0633\u0645\u0627\u062a", featureCount: 10, gradientFrom: "from-emerald-500", gradientTo: "to-emerald-700" },
  { key: "mobileApp", iconName: "Smartphone", name: "Mobile App", nameAr: "\u062a\u0637\u0628\u064a\u0642 \u0627\u0644\u062c\u0648\u0627\u0644", description: "Mobile app for iOS & Android, offline support, push notifications", descriptionAr: "\u062a\u0637\u0628\u064a\u0642 \u062c\u0648\u0627\u0644 \u0644\u0646\u0638\u0645\u064a iOS \u0648 Android\u060c \u062f\u0639\u0645 \u0628\u062f\u0648\u0646 \u0627\u062a\u0635\u0627\u0644", featureCount: 14, gradientFrom: "from-blue-500", gradientTo: "to-blue-700" },
  { key: "offlinePos", iconName: "Store", name: "Offline POS", nameAr: "\u0646\u0642\u0637\u0629 \u0628\u064a\u0639 \u0628\u062f\u0648\u0646 \u0625\u0646\u062a\u0631\u0646\u062a", description: "Offline-capable POS, sync when online, local storage", descriptionAr: "\u0646\u0642\u0637\u0629 \u0628\u064a\u0639 \u062a\u0639\u0645\u0644 \u0628\u062f\u0648\u0646 \u0625\u0646\u062a\u0631\u0646\u062a\u060c \u0645\u0632\u0627\u0645\u0646\u0629 \u0639\u0646\u062f \u0627\u0644\u0627\u062a\u0635\u0627\u0644", featureCount: 8, gradientFrom: "from-green-600", gradientTo: "to-green-800" },
  { key: "backup", iconName: "FolderKanban", name: "Backup", nameAr: "\u0627\u0644\u0646\u0633\u062e \u0627\u0644\u0627\u062d\u062a\u064a\u0627\u0637\u064a", description: "Automated backups, cloud storage, scheduling, restore", descriptionAr: "\u0646\u0633\u062e \u0627\u062d\u062a\u064a\u0627\u0637\u064a \u062a\u0644\u0642\u0627\u0626\u064a\u060c \u062a\u062e\u0632\u064a\u0646 \u0633\u062d\u0627\u0628\u064a\u060c \u062c\u062f\u0648\u0644\u0629\u060c \u0627\u0633\u062a\u0639\u0627\u062f\u0629", featureCount: 8, gradientFrom: "from-indigo-500", gradientTo: "to-indigo-700" },
  { key: "restore", iconName: "RefreshCw", name: "Restore", nameAr: "\u0627\u0644\u0627\u0633\u062a\u0639\u0627\u062f\u0629", description: "Point-in-time recovery, backup management, verification", descriptionAr: "\u0627\u0633\u062a\u0639\u0627\u062f\u0629 \u0641\u064a \u0646\u0642\u0637\u0629 \u0632\u0645\u0646\u064a\u0629\u060c \u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0646\u0633\u062e \u0627\u0644\u0627\u062d\u062a\u064a\u0627\u0637\u064a\u060c \u0627\u0644\u062a\u062d\u0642\u0642", featureCount: 6, gradientFrom: "from-teal-500", gradientTo: "to-teal-700" },
  { key: "whiteLabel", iconName: "Palette", name: "White Label", nameAr: "\u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u0628\u064a\u0636\u0627\u0621", description: "White-label solution, custom branding, domains, themes", descriptionAr: "\u062d\u0644 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u0628\u064a\u0636\u0627\u0621\u060c \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0627\u0644\u0645\u062e\u0635\u0635\u0629\u060c \u0627\u0644\u0646\u0637\u0627\u0642\u0627\u062a", featureCount: 10, gradientFrom: "from-pink-500", gradientTo: "to-pink-700" },
  { key: "saasPlans", iconName: "Award", name: "SaaS Plans", nameAr: "\u062e\u0637\u0637 SaaS", description: "Multi-tenant SaaS, plan management, metering, billing", descriptionAr: "SaaS \u0645\u062a\u0639\u062f\u062f \u0627\u0644\u0645\u0633\u062a\u0623\u062c\u0631\u064a\u0646\u060c \u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u062e\u0637\u0637\u060c \u0627\u0644\u0642\u064a\u0627\u0633\u060c \u0627\u0644\u0641\u0648\u062a\u0631\u0629", featureCount: 10, gradientFrom: "from-purple-500", gradientTo: "to-purple-700" },
  { key: "subscriptionBilling", iconName: "CreditCard", name: "Subscription Billing", nameAr: "\u0641\u0648\u062a\u0631\u0629 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643\u0627\u062a", description: "Recurring billing, dunning, invoicing, revenue recognition", descriptionAr: "\u0627\u0644\u0641\u0648\u062a\u0631\u0629 \u0627\u0644\u0645\u062a\u0643\u0631\u0631\u0629\u060c \u0627\u0644\u062a\u062d\u0635\u064a\u0644\u060c \u0625\u0635\u062f\u0627\u0631 \u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631", featureCount: 10, gradientFrom: "from-violet-500", gradientTo: "to-violet-700" },
  { key: "partnerPortal", iconName: "Users", name: "Partner Portal", nameAr: "\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0634\u0631\u064a\u0643", description: "Partner management, commissions, referrals, support, resources", descriptionAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0634\u0631\u0643\u0627\u0621\u060c \u0627\u0644\u0639\u0645\u0648\u0644\u0627\u062a\u060c \u0627\u0644\u0625\u062d\u0627\u0644\u0627\u062a\u060c \u0627\u0644\u062f\u0639\u0645\u060c \u0627\u0644\u0645\u0648\u0627\u0631\u062f", featureCount: 10, gradientFrom: "from-cyan-500", gradientTo: "to-cyan-700" },
  { key: "customerPortal", iconName: "Users", name: "Customer Portal", nameAr: "\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0639\u0645\u064a\u0644", description: "Self-service portal, tickets, invoices, payments, knowledge base", descriptionAr: "\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u062e\u062f\u0645\u0629 \u0627\u0644\u0630\u0627\u062a\u064a\u0629\u060c \u0627\u0644\u062a\u0630\u0627\u0643\u0631\u060c \u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631\u060c \u0627\u0644\u0645\u062f\u0641\u0648\u0639\u0627\u062a", featureCount: 10, gradientFrom: "from-green-500", gradientTo: "to-green-700" },
  { key: "vendorPortal", iconName: "Briefcase", name: "Vendor Portal", nameAr: "\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0645\u0648\u0631\u062f", description: "Vendor self-service, POs, invoices, payments, communication", descriptionAr: "\u0627\u0644\u062e\u062f\u0645\u0629 \u0627\u0644\u0630\u0627\u062a\u064a\u0629 \u0644\u0644\u0645\u0648\u0631\u062f\u060c \u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0634\u0631\u0627\u0621\u060c \u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631", featureCount: 8, gradientFrom: "from-orange-500", gradientTo: "to-orange-700" },
  { key: "employeePortal", iconName: "Users", name: "Employee Portal", nameAr: "\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0645\u0648\u0638\u0641", description: "Employee self-service, leave, attendance, payslips, tasks", descriptionAr: "\u0627\u0644\u062e\u062f\u0645\u0629 \u0627\u0644\u0630\u0627\u062a\u064a\u0629 \u0644\u0644\u0645\u0648\u0638\u0641\u060c \u0627\u0644\u0625\u062c\u0627\u0632\u0629\u060c \u0627\u0644\u062d\u0636\u0648\u0631\u060c \u0642\u0633\u0627\u0626\u0645 \u0627\u0644\u0631\u0627\u062a\u0628", featureCount: 10, gradientFrom: "from-blue-500", gradientTo: "to-blue-700" },
  { key: "adminPanel", iconName: "Settings", name: "Admin Panel", nameAr: "\u0644\u0648\u062d\u0629 \u0627\u0644\u0625\u062f\u0627\u0631\u0629", description: "Full admin control, system configuration, user management", descriptionAr: "\u062a\u062d\u0643\u0645 \u0643\u0627\u0645\u0644 \u0644\u0644\u0645\u0634\u0631\u0641\u060c \u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0646\u0638\u0627\u0645\u060c \u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646", featureCount: 14, gradientFrom: "from-slate-600", gradientTo: "to-slate-800" },
  { key: "settings", iconName: "Sliders", name: "Settings", nameAr: "\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a", description: "System settings, preferences, configuration, customization", descriptionAr: "\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0646\u0638\u0627\u0645\u060c \u0627\u0644\u062a\u0641\u0636\u064a\u0644\u0627\u062a\u060c \u0627\u0644\u062a\u0647\u064a\u0626\u0629\u060c \u0627\u0644\u062a\u062e\u0635\u064a\u0635", featureCount: 12, gradientFrom: "from-slate-600", gradientTo: "to-slate-800" },
  { key: "notifications", iconName: "Bell", name: "Notifications", nameAr: "\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a", description: "In-app, email, SMS, push notifications, preferences, channels", descriptionAr: "\u0625\u0634\u0639\u0627\u0631\u0627\u062a \u062f\u0627\u062e\u0644 \u0627\u0644\u062a\u0637\u0628\u064a\u0642\u060c \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u060c \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0646\u0635\u064a\u0629", featureCount: 8, gradientFrom: "from-amber-500", gradientTo: "to-amber-700" },
  { key: "emailTemplates", iconName: "Mail", name: "Email Templates", nameAr: "\u0642\u0648\u0627\u0644\u0628 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a", description: "Email template editor, variables, preview, testing, scheduling", descriptionAr: "\u0645\u062d\u0631\u0631 \u0642\u0648\u0627\u0644\u0628 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u060c \u0627\u0644\u0645\u062a\u063a\u064a\u0631\u0627\u062a\u060c \u0627\u0644\u0645\u0639\u0627\u064a\u0646\u0629", featureCount: 8, gradientFrom: "from-blue-500", gradientTo: "to-blue-700" },
  { key: "smsTemplates", iconName: "MessageSquare", name: "SMS Templates", nameAr: "\u0642\u0648\u0627\u0644\u0628 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0646\u0635\u064a\u0629", description: "SMS template editor, variables, preview, testing, scheduling", descriptionAr: "\u0645\u062d\u0631\u0631 \u0642\u0648\u0627\u0644\u0628 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0646\u0635\u064a\u0629\u060c \u0627\u0644\u0645\u062a\u063a\u064a\u0631\u0627\u062a\u060c \u0627\u0644\u0645\u0639\u0627\u064a\u0646\u0629", featureCount: 6, gradientFrom: "from-green-500", gradientTo: "to-green-700" },
  { key: "whatsappTemplates", iconName: "MessageSquare", name: "WhatsApp Templates", nameAr: "\u0642\u0648\u0627\u0644\u0628 \u0648\u0627\u062a\u0633\u0627\u0628", description: "WhatsApp template editor, approval, variables, analytics", descriptionAr: "\u0645\u062d\u0631\u0631 \u0642\u0648\u0627\u0644\u0628 \u0648\u0627\u062a\u0633\u0627\u0628\u060c \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629\u060c \u0627\u0644\u0645\u062a\u063a\u064a\u0631\u0627\u062a\u060c \u0627\u0644\u062a\u062d\u0644\u064a\u0644\u0627\u062a", featureCount: 6, gradientFrom: "from-emerald-500", gradientTo: "to-emerald-700" },
];
const features = [
  { key: "accounting", icon: BookOpen, color: "text-blue-600 bg-blue-100" },
  { key: "inventory", icon: Package, color: "text-emerald-600 bg-emerald-100" },
  { key: "sales", icon: ShoppingCart, color: "text-violet-600 bg-violet-100" },
  { key: "purchase", icon: ShoppingBag, color: "text-orange-600 bg-orange-100" },
  { key: "crm", icon: Users, color: "text-rose-600 bg-rose-100" },
  { key: "hrm", icon: Briefcase, color: "text-cyan-600 bg-cyan-100" },
  { key: "manufacturing", icon: Factory, color: "text-amber-600 bg-amber-100" },
  { key: "projects", icon: FolderKanban, color: "text-indigo-600 bg-indigo-100" },
];

const featureContent: Record<string, { title: string; titleAr: string; desc: string; descAr: string }> = {
  accounting: {
    title: "Accounting & Finance", titleAr: "\u0627\u0644\u0645\u062d\u0627\u0633\u0628\u0629 \u0648\u0627\u0644\u0645\u0627\u0644\u064a\u0629",
    desc: "Full double-entry accounting, chart of accounts, journal entries, general ledger, trial balance, and cost centers with multi-currency support.",
    descAr: "\u0645\u062d\u0627\u0633\u0628\u0629 \u0643\u0627\u0645\u0644\u0629 \u0628\u0627\u0644\u0642\u064a\u062f \u0627\u0644\u0645\u0632\u062f\u0648\u062c\u060c \u062f\u0644\u064a\u0644 \u062d\u0633\u0627\u0628\u0627\u062a\u060c \u0642\u064a\u0648\u062f \u064a\u0648\u0645\u064a\u0629\u060c \u0623\u0633\u062a\u0627\u0630 \u0639\u0627\u0645\u060c \u0645\u064a\u0632\u0627\u0646 \u0645\u0631\u0627\u062c\u0639\u0629\u060c \u0648\u0645\u0631\u0627\u0643\u0632 \u062a\u0643\u0644\u0641\u0629 \u0645\u0639 \u062f\u0639\u0645 \u0627\u0644\u0639\u0645\u0644\u0627\u062a \u0627\u0644\u0645\u062a\u0639\u062f\u062f\u0629.",
  },
  inventory: {
    title: "Inventory Management", titleAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u062e\u0632\u0648\u0646",
    desc: "Track products, manage warehouses, monitor stock levels, movements, and transfers across locations with real-time valuation.",
    descAr: "\u062a\u062a\u0628\u0639 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a\u060c \u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062a\u0648\u062f\u0639\u0627\u062a\u060c \u0645\u0631\u0627\u0642\u0628\u0629 \u0645\u0633\u062a\u0648\u064a\u0627\u062a \u0627\u0644\u0645\u062e\u0632\u0648\u0646\u060c \u0627\u0644\u062d\u0631\u0643\u0627\u062a\u060c \u0648\u0627\u0644\u062a\u062d\u0648\u064a\u0644\u0627\u062a \u0628\u064a\u0646 \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0645\u0639 \u062a\u0642\u064a\u064a\u0645 \u0641\u0648\u0631\u064a.",
  },
  sales: {
    title: "Sales & Invoicing", titleAr: "\u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u0648\u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631",
    desc: "Manage customers, quotations, sales orders, invoices, credit notes, and customer payments with tax-compliant invoicing.",
    descAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621\u060c \u0639\u0631\u0648\u0636 \u0627\u0644\u0623\u0633\u0639\u0627\u0631\u060c \u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0628\u064a\u0639\u060c \u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631\u060c \u0625\u0634\u0639\u0627\u0631\u0627\u062a \u0627\u0644\u062f\u0627\u0626\u0646\u060c \u0648\u0645\u062f\u0641\u0648\u0639\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0645\u0639 \u0641\u0648\u0627\u062a\u064a\u0631 \u0645\u062a\u0648\u0627\u0641\u0642\u0629 \u0636\u0631\u064a\u0628\u064a\u0627\u064b.",
  },
  purchase: {
    title: "Purchase & Procurement", titleAr: "\u0627\u0644\u0645\u0634\u062a\u0631\u064a\u0627\u062a \u0648\u0627\u0644\u062a\u0648\u0631\u064a\u062f",
    desc: "Handle suppliers, purchase orders, goods receipt notes, and supplier payments with automated procurement workflows.",
    descAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0648\u0631\u062f\u064a\u0646\u060c \u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0634\u0631\u0627\u0621\u060c \u0625\u064a\u0635\u0627\u0644\u0627\u062a \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645\u060c \u0648\u0645\u062f\u0641\u0648\u0639\u0627\u062a \u0627\u0644\u0645\u0648\u0631\u062f\u064a\u0646 \u0645\u0639 \u0633\u064a\u0631 \u0639\u0645\u0644 \u0634\u0631\u0627\u0621 \u0622\u0644\u064a.",
  },
  crm: {
    title: "CRM & Sales Pipeline", titleAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a",
    desc: "Track leads, manage opportunities, log activities, and close deals faster with AI-powered lead scoring and forecasting.",
    descAr: "\u062a\u062a\u0628\u0639 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062d\u062a\u0645\u0644\u064a\u0646\u060c \u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0641\u0631\u0635\u060c \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0623\u0646\u0634\u0637\u0629\u060c \u0648\u0625\u063a\u0644\u0627\u0642 \u0627\u0644\u0635\u0641\u0642\u0627\u062a \u0628\u0634\u0643\u0644 \u0623\u0633\u0631\u0639 \u0645\u0639 \u062a\u0633\u062c\u064a\u0644 \u0648\u062a\u0646\u0628\u0624 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a.",
  },
  hrm: {
    title: "HR & Payroll", titleAr: "\u0627\u0644\u0645\u0648\u0627\u0631\u062f \u0627\u0644\u0628\u0634\u0631\u064a\u0629 \u0648\u0627\u0644\u0631\u0648\u0627\u062a\u0628",
    desc: "Manage employees, attendance, leaves, payroll, and performance reviews with multi-country compliance.",
    descAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646\u060c \u0627\u0644\u062d\u0636\u0648\u0631\u060c \u0627\u0644\u0625\u062c\u0627\u0632\u0627\u062a\u060c \u0627\u0644\u0631\u0648\u0627\u062a\u0628\u060c \u0648\u062a\u0642\u064a\u064a\u0645 \u0627\u0644\u0623\u062f\u0627\u0621 \u0645\u0639 \u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644 \u0645\u062a\u0639\u062f\u062f \u0627\u0644\u0628\u0644\u062f\u0627\u0646.",
  },
  manufacturing: {
    title: "Manufacturing", titleAr: "\u0627\u0644\u062a\u0635\u0646\u064a\u0639",
    desc: "Create bills of materials, manage work orders, track production, and control quality across the entire manufacturing process.",
    descAr: "\u0625\u0646\u0634\u0627\u0621 \u0641\u0648\u0627\u062a\u064a\u0631 \u0627\u0644\u0645\u0648\u0627\u062f\u060c \u0625\u062f\u0627\u0631\u0629 \u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0639\u0645\u0644\u060c \u062a\u062a\u0628\u0639 \u0627\u0644\u0625\u0646\u062a\u0627\u062c\u060c \u0648\u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u062c\u0648\u062f\u0629 \u0639\u0628\u0631 \u0639\u0645\u0644\u064a\u0629 \u0627\u0644\u062a\u0635\u0646\u064a\u0639 \u0628\u0623\u0643\u0645\u0644\u0647\u0627.",
  },
  projects: {
    title: "Projects & Tasks", titleAr: "\u0627\u0644\u0645\u0634\u0627\u0631\u064a\u0639 \u0648\u0627\u0644\u0645\u0647\u0627\u0645",
    desc: "Plan projects, assign tasks, track timesheets, manage budgets, and deliver on time with Gantt charts and Kanban boards.",
    descAr: "\u062a\u062e\u0637\u064a\u0637 \u0627\u0644\u0645\u0634\u0627\u0631\u064a\u0639\u060c \u062a\u0639\u064a\u064a\u0646 \u0627\u0644\u0645\u0647\u0627\u0645\u060c \u062a\u062a\u0628\u0639 \u0633\u0627\u0639\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u060c \u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u064a\u0632\u0627\u0646\u064a\u0627\u062a\u060c \u0648\u0627\u0644\u062a\u0633\u0644\u064a\u0645 \u0641\u064a \u0627\u0644\u0648\u0642\u062a \u0627\u0644\u0645\u062d\u062f\u062f \u0645\u0639 \u0645\u062e\u0637\u0637\u0627\u062a \u062c\u0627\u0646\u062a \u0648\u0644\u0648\u062d\u0627\u062a \u0643\u0627\u0646\u0628\u0627\u0646.",
  },
};

const faqItems: { q: Record<string, string>; a: Record<string, string> }[] = [
  { q: { en: "What is YASCO ERP?", ar: "\u0645\u0627 \u0647\u0648 \u064a\u0627\u0633\u0643\u0648 ERP?" }, a: { en: "YASCO is a complete business management platform with POS, accounting, inventory, CRM, HR, manufacturing, and tax compliance modules all in one integrated system.", ar: "\u064a\u0627\u0633\u0643\u0648 \u0647\u064a \u0645\u0646\u0635\u0629 \u0645\u062a\u0643\u0627\u0645\u0644\u0629 \u0644\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u062a\u0634\u0645\u0644 \u0646\u0642\u0627\u0637 \u0627\u0644\u0628\u064a\u0639 \u0648\u0627\u0644\u0645\u062d\u0627\u0633\u0628\u0629 \u0648\u0627\u0644\u0645\u062e\u0632\u0648\u0646 \u0648\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0627\u0644\u0645\u0648\u0627\u0631\u062f \u0627\u0644\u0628\u0634\u0631\u064a\u0629 \u0648\u0627\u0644\u062a\u0635\u0646\u064a\u0639 \u0648\u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644 \u0627\u0644\u0636\u0631\u064a\u0628\u064a \u0643\u0644 \u0630\u0644\u0643 \u0641\u064a \u0646\u0638\u0627\u0645 \u0648\u0627\u062d\u062f \u0645\u062a\u0643\u0627\u0645\u0644." } },
  { q: { en: "Is YASCO free to use?", ar: "\u0647\u0644 \u064a\u0627\u0633\u0643\u0648 \u0645\u062c\u0627\u0646\u064a?" }, a: { en: "YASCO offers a generous free tier with core features including POS, basic accounting, and inventory. Professional and Enterprise plans are available for advanced needs with additional modules, users, and support.", ar: "\u064a\u0627\u0633\u0643\u0648 \u064a\u0648\u0641\u0631 \u062e\u0637\u0629 \u0645\u062c\u0627\u0646\u064a\u0629 \u0633\u062e\u064a\u0629 \u0645\u0639 \u0627\u0644\u0645\u064a\u0632\u0627\u062a \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629 \u0628\u0645\u0627 \u0641\u064a \u0630\u0644\u0643 \u0646\u0642\u0627\u0637 \u0627\u0644\u0628\u064a\u0639 \u0648\u0627\u0644\u0645\u062d\u0627\u0633\u0628\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629 \u0648\u0627\u0644\u0645\u062e\u0632\u0648\u0646. \u062a\u062a\u0648\u0641\u0631 \u062e\u0637\u0637 \u0627\u062d\u062a\u0631\u0627\u0641\u064a\u0629 \u0648\u0645\u0624\u0633\u0633\u0627\u062a \u0644\u0644\u0627\u062d\u062a\u064a\u0627\u062c\u0627\u062a \u0627\u0644\u0645\u062a\u0642\u062f\u0645\u0629." } },
  { q: { en: "Does YASCO support ZATCA e-invoicing?", ar: "\u0647\u0644 \u064a\u062f\u0639\u0645 \u064a\u0627\u0633\u0643\u0648 \u0627\u0644\u0641\u0648\u062a\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629 \u0632\u0627\u062a\u0643\u0627?" }, a: { en: "Yes, YASCO is fully integrated with ZATCA for Saudi e-invoicing compliance including Phase 1 & 2, QR code generation, simplified and standard tax invoices, and ZATCA clearance/reporting.", ar: "\u0646\u0639\u0645\u060c \u064a\u0627\u0633\u0643\u0648 \u0645\u062a\u0643\u0627\u0645\u0644 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0645\u0639 \u0632\u0627\u062a\u0643\u0627 \u0644\u0644\u0641\u0648\u062a\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629 \u0628\u0645\u0627 \u0641\u064a \u0630\u0644\u0643 \u0627\u0644\u0645\u0631\u062d\u0644\u062a\u064a\u0646 1 \u06482\u060c \u0625\u0646\u0634\u0627\u0621 \u0631\u0645\u0632 QR\u060c \u0648\u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631 \u0627\u0644\u0636\u0631\u064a\u0628\u064a\u0629 \u0627\u0644\u0645\u0628\u0633\u0637\u0629 \u0648\u0627\u0644\u0642\u064a\u0627\u0633\u064a\u0629." } },
  { q: { en: "How does FBR Pakistan integration work?", ar: "\u0643\u064a\u0641 \u064a\u0639\u0645\u0644 \u0627\u0644\u062a\u0643\u0627\u0645\u0644 \u0645\u0639 FBR \u0628\u0627\u0643\u0633\u062a\u0627\u0646?" }, a: { en: "YASCO integrates with Pakistan FBR digital invoicing system via API. It supports NTN, STRN, and CNIC fields, province-wise sales tax calculation, withholding tax, and generates FBR-compliant invoices.", ar: "\u064a\u062a\u0643\u0627\u0645\u0644 \u064a\u0627\u0633\u0643\u0648 \u0645\u0639 \u0646\u0638\u0627\u0645 \u0627\u0644\u0641\u0648\u062a\u0631\u0629 \u0627\u0644\u0631\u0642\u0645\u064a\u0629 \u0644\u0647\u064a\u0626\u0629 \u0627\u0644\u0625\u064a\u0631\u0627\u062f\u0627\u062a \u0627\u0644\u0628\u0627\u0643\u0633\u062a\u0627\u0646\u064a\u0629 \u0639\u0628\u0631 API. \u064a\u062f\u0639\u0645 \u062d\u0642\u0648\u0644 NTN \u0648STRN \u0648CNIC \u0648\u062d\u0633\u0627\u0628 \u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u062d\u0633\u0628 \u0627\u0644\u0645\u0642\u0627\u0637\u0639\u0629." } },
  { q: { en: "Can I use YASCO in multiple languages?", ar: "\u0647\u0644 \u064a\u0645\u0643\u0646 \u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u064a\u0627\u0633\u0643\u0648 \u0628\u0644\u063a\u0627\u062a \u0645\u062a\u0639\u062f\u062f\u0629?" }, a: { en: "YASCO fully supports English and Arabic with RTL layout. The interface, reports, invoices, and dashboards automatically switch based on your language preference. More languages are coming soon.", ar: "\u064a\u062f\u0639\u0645 \u064a\u0627\u0633\u0643\u0648 \u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 \u0648\u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0645\u0639 \u062a\u062e\u0637\u064a\u0637 RTL. \u0627\u0644\u0648\u0627\u062c\u0647\u0629 \u0648\u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631 \u0648\u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631 \u0648\u0644\u0648\u062d\u0627\u062a \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u062a\u062a\u062d\u0648\u0644 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b \u062d\u0633\u0628 \u062a\u0641\u0636\u064a\u0644 \u0627\u0644\u0644\u063a\u0629." } },
  { q: { en: "Can I migrate from Odoo, SAP, or Zoho?", ar: "\u0647\u0644 \u064a\u0645\u0643\u0646\u0646\u064a \u0627\u0644\u062a\u0631\u062d\u064a\u0644 \u0645\u0646 Odoo \u0623\u0648 SAP \u0623\u0648 Zoho?" }, a: { en: "Yes, YASCO provides migration tools and support for importing data from Odoo, SAP, Zoho, ERPNext, and other major ERP platforms. Our team can assist with data mapping and migration planning.", ar: "\u0646\u0639\u0645\u060c \u064a\u0648\u0641\u0631 \u064a\u0627\u0633\u0643\u0648 \u0623\u062f\u0648\u0627\u062a \u062a\u0631\u062d\u064a\u0644 \u0648\u062f\u0639\u0645 \u0644\u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0645\u0646 Odoo \u0648SAP \u0648Zoho \u0648ERPNext \u0648\u0645\u0646\u0635\u0627\u062a ERP \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629 \u0627\u0644\u0623\u062e\u0631\u0649." } },
  { q: { en: "Is my data secure?", ar: "\u0647\u0644 \u0628\u064a\u0627\u0646\u0627\u062a\u064a \u0622\u0645\u0646\u0629?" }, a: { en: "Absolutely. YASCO uses enterprise-grade encryption (AES-256), role-based access control, two-factor authentication, IP whitelisting, complete audit trails, and regular security audits.", ar: "\u0628\u0627\u0644\u062a\u0623\u0643\u064a\u062f. \u064a\u0633\u062a\u062e\u062f\u0645 \u064a\u0627\u0633\u0643\u0648 \u062a\u0634\u0641\u064a\u0631 \u0639\u0644\u0649 \u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0645\u0624\u0633\u0633\u0627\u062a (AES-256)\u060c \u0648\u0627\u0644\u062a\u062d\u0643\u0645 \u0641\u064a \u0627\u0644\u0648\u0635\u0648\u0644 \u062d\u0633\u0628 \u0627\u0644\u062f\u0648\u0631\u060c \u0648\u0627\u0644\u0645\u0635\u0627\u062f\u0642\u0629 \u0627\u0644\u062b\u0646\u0627\u0626\u064a\u0629\u060c \u0648\u0633\u062c\u0644\u0627\u062a \u0627\u0644\u062a\u062f\u0642\u064a\u0642 \u0627\u0644\u0643\u0627\u0645\u0644\u0629." } },
  { q: { en: "Do you offer training and support?", ar: "\u0647\u0644 \u062a\u0642\u062f\u0645\u0648\u0646 \u0627\u0644\u062a\u062f\u0631\u064a\u0628 \u0648\u0627\u0644\u062f\u0639\u0645?" }, a: { en: "Yes, YASCO offers comprehensive training including video tutorials, documentation, live webinars, and dedicated onboarding for enterprise plans. Support is available via email, live chat, WhatsApp, and phone during business hours.", ar: "\u0646\u0639\u0645\u060c \u064a\u0642\u062f\u0645 \u064a\u0627\u0633\u0643\u0648 \u062a\u062f\u0631\u064a\u0628\u0627\u064b \u0634\u0627\u0645\u0644\u0627\u064b \u064a\u0634\u0645\u0644 \u062f\u0631\u0648\u0633 \u0641\u064a\u062f\u064a\u0648 \u0648\u0648\u062b\u0627\u0626\u0642 \u0648\u0646\u062f\u0648\u0627\u062a \u0645\u0628\u0627\u0634\u0631\u0629 \u0639\u0628\u0631 \u0627\u0644\u0625\u0646\u062a\u0631\u0646\u062a \u0648\u062a\u0623\u0647\u064a\u0644 \u0645\u062e\u0635\u0635 \u0644\u062e\u0637\u0637 \u0627\u0644\u0645\u0624\u0633\u0633\u0627\u062a." } },
  { q: { en: "What is the pricing model?", ar: "\u0645\u0627 \u0647\u0648 \u0646\u0645\u0648\u0630\u062c \u0627\u0644\u062a\u0633\u0639\u064a\u0631?" }, a: { en: "YASCO offers flexible pricing: Starter ($29/mo for 1 company, 3 users), Growing ($79/mo for 3 companies, 10 users), and Enterprise ($199/mo unlimited). Self-hosted option is available with a one-time license fee.", ar: "\u064a\u0642\u062f\u0645 \u064a\u0627\u0633\u0643\u0648 \u062a\u0633\u0639\u064a\u0631\u0627\u064b \u0645\u0631\u0646\u0627\u064b: Starter (29 \u062f\u0648\u0644\u0627\u0631\u0627\u064b \u0634\u0647\u0631\u064a\u0627\u064b \u0644\u0634\u0631\u0643\u0629 \u0648\u0627\u062d\u062f\u0629 \u06483 \u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646)\u060c Growing (79 \u062f\u0648\u0644\u0627\u0631\u0627\u064b \u0644\u06403 \u0634\u0631\u0643\u0627\u062a \u064810 \u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646)\u060c \u0648Enterprise (199 \u062f\u0648\u0644\u0627\u0631\u0627\u064b \u063a\u064a\u0631 \u0645\u062d\u062f\u0648\u062f)." } },
  { q: { en: "Does YASCO work offline?", ar: "\u0647\u0644 \u064a\u0639\u0645\u0644 \u064a\u0627\u0633\u0643\u0648 \u0628\u062f\u0648\u0646 \u0625\u0646\u062a\u0631\u0646\u062a?" }, a: { en: "Yes, the POS module supports offline mode with automatic sync when connectivity is restored. Your sales data, payments, and transactions are stored locally and synced seamlessly.", ar: "\u0646\u0639\u0645\u060c \u0648\u062d\u062f\u0629 \u0646\u0642\u0627\u0637 \u0627\u0644\u0628\u064a\u0639 \u062a\u062f\u0639\u0645 \u0648\u0636\u0639 \u0639\u062f\u0645 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0645\u0639 \u0645\u0632\u0627\u0645\u0646\u0629 \u062a\u0644\u0642\u0627\u0626\u064a\u0629 \u0639\u0646\u062f \u0627\u0633\u062a\u0639\u0627\u062f\u0629 \u0627\u0644\u0627\u062a\u0635\u0627\u0644." } },
];
const testimonials = [
  { name: "Ahmed Al-Qahtani", title: "CEO", company: "Al-Qahtani Group", avatar: "AQ", rating: 5, text: { en: "YASCO transformed our retail operations across 15 branches in Saudi Arabia. The ZATCA compliance alone saved us months of development work.", ar: "\u064a\u0627\u0633\u0643\u0648 \u063a\u064a\u0631 \u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u0628\u064a\u0639 \u0628\u0627\u0644\u062a\u062c\u0632\u0626\u0629 \u0644\u062f\u064a\u0646\u0627 \u0639\u0628\u0631 15 \u0641\u0631\u0639\u0627\u064b \u0641\u064a \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629. \u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644 \u0644\u0632\u0627\u062a\u0643\u0627 \u0648\u062d\u062f\u0647 \u0648\u0641\u0631 \u0644\u0646\u0627 \u0623\u0634\u0647\u0631\u0627\u064b \u0645\u0646 \u0627\u0644\u0639\u0645\u0644." } },
  { name: "Fatima Khan", title: "Finance Director", company: "PakTech Solutions", avatar: "FK", rating: 5, text: { en: "The FBR integration is flawless. We generate compliant tax invoices automatically and filing has never been easier. A must-have for Pakistani businesses.", ar: "\u062a\u0643\u0627\u0645\u0644 FBR \u0644\u0627 \u064a\u0634\u0648\u0628\u0647 \u0634\u0627\u0626\u0628\u0629. \u0646\u0646\u0634\u0626 \u0641\u0648\u0627\u062a\u064a\u0631 \u0636\u0631\u064a\u0628\u064a\u0629 \u0645\u062a\u0648\u0627\u0641\u0642\u0629 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b \u0648\u0644\u0645 \u064a\u0643\u0646 \u0627\u0644\u062a\u0642\u062f\u064a\u0645 \u0623\u0633\u0647\u0644 \u0645\u0646 \u0623\u064a \u0648\u0642\u062a \u0645\u0636\u0649." } },
  { name: "Omar Al-Mansouri", title: "Operations Manager", company: "Dubai Retail LLC", avatar: "OM", rating: 5, text: { en: "Having an ERP that handles UAE VAT, supports both Arabic and English, and adapts to our timezone automatically is incredible. YASCO is our backbone.", ar: "\u0648\u062c\u0648\u062f \u0646\u0638\u0627\u0645 ERP \u064a\u062a\u0639\u0627\u0645\u0644 \u0645\u0639 \u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629 \u0641\u064a \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a \u0648\u064a\u062f\u0639\u0645 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0648\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 \u0648\u064a\u062a\u0643\u064a\u0641 \u0645\u0639 \u0645\u0646\u0637\u0642\u062a\u0646\u0627 \u0627\u0644\u0632\u0645\u0646\u064a\u0629 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b \u0623\u0645\u0631 \u0644\u0627 \u064a\u0635\u062f\u0642." } },
  { name: "Sarah Chen", title: "CTO", company: "GlobalMart", avatar: "SC", rating: 4, text: { en: "We evaluated Odoo, Zoho, and SAP. YASCO gave us the best balance of features, ease of use, and value. The multi-currency support is excellent.", ar: "\u0642\u0645\u0646\u0627 \u0628\u062a\u0642\u064a\u064a\u0645 Odoo \u0648Zoho \u0648SAP. \u0623\u0639\u0637\u0627\u0646\u0627 \u064a\u0627\u0633\u0643\u0648 \u0623\u0641\u0636\u0644 \u062a\u0648\u0627\u0632\u0646 \u0628\u064a\u0646 \u0627\u0644\u0645\u064a\u0632\u0627\u062a \u0648\u0633\u0647\u0648\u0644\u0629 \u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0648\u0627\u0644\u0642\u064a\u0645\u0629." } },
  { name: "Mohammed Iqbal", title: "Business Owner", company: "Iqbal Enterprises", avatar: "MI", rating: 5, text: { en: "Started with the free tier, upgraded to Growing within a month. The POS system alone replaced three different tools we were using. Highly recommended.", ar: "\u0628\u062f\u0623\u062a \u0628\u0627\u0644\u062e\u0637\u0629 \u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629\u060c \u062b\u0645 \u0642\u0645\u062a \u0628\u0627\u0644\u062a\u0631\u0642\u064a\u0629 \u0625\u0644\u0649 Growing \u0641\u064a \u063a\u0636\u0648\u0646 \u0634\u0647\u0631. \u0646\u0638\u0627\u0645 \u0646\u0642\u0627\u0637 \u0627\u0644\u0628\u064a\u0639 \u0648\u062d\u062f\u0647 \u0627\u0633\u062a\u0628\u062f\u0644 \u062b\u0644\u0627\u062b \u0623\u062f\u0648\u0627\u062a \u0645\u062e\u062a\u0644\u0641\u0629 \u0643\u0646\u0627 \u0646\u0633\u062a\u062e\u062f\u0645\u0647\u0627." } },
];

const comparisonRows: Array<{
  feature: string; featureAr: string;
  yasco: string; zoho: string; odoo: string;
  sap: string; netsuite: string; dynamics: string; erpnext: string;
}> = [
  { feature: "POS", featureAr: "\u0646\u0642\u0627\u0637 \u0627\u0644\u0628\u064a\u0639", yasco: "\u2713", zoho: "\u2713", odoo: "\u2713", sap: "\u2713", netsuite: "\u2713", dynamics: "\u2713", erpnext: "\u2713" },
  { feature: "Full Accounting", featureAr: "\u0645\u062d\u0627\u0633\u0628\u0629 \u0645\u062a\u0643\u0627\u0645\u0644\u0629", yasco: "\u2713", zoho: "\u2713", odoo: "\u2713", sap: "\u2713", netsuite: "\u2713", dynamics: "\u2713", erpnext: "\u2713" },
  { feature: "Inventory Mgmt", featureAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u062e\u0632\u0648\u0646", yasco: "\u2713", zoho: "\u2713", odoo: "\u2713", sap: "\u2713", netsuite: "\u2713", dynamics: "\u2713", erpnext: "\u2713" },
  { feature: "CRM", featureAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621", yasco: "\u2713", zoho: "\u2713", odoo: "\u2713", sap: "\u2713", netsuite: "\u2713", dynamics: "\u2713", erpnext: "\u2713" },
  { feature: "HR & Payroll", featureAr: "\u0627\u0644\u0645\u0648\u0627\u0631\u062f \u0627\u0644\u0628\u0634\u0631\u064a\u0629 \u0648\u0627\u0644\u0631\u0648\u0627\u062a\u0628", yasco: "\u2713", zoho: "\u2713", odoo: "\u2713", sap: "\u2713", netsuite: "\u2717", dynamics: "\u2713", erpnext: "\u2713" },
  { feature: "Manufacturing", featureAr: "\u0627\u0644\u062a\u0635\u0646\u064a\u0639", yasco: "\u2713", zoho: "Partial", odoo: "\u2713", sap: "\u2713", netsuite: "\u2713", dynamics: "\u2713", erpnext: "\u2713" },
  { feature: "Project Mgmt", featureAr: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0634\u0627\u0631\u064a\u0639", yasco: "\u2713", zoho: "\u2713", odoo: "\u2713", sap: "\u2713", netsuite: "\u2713", dynamics: "\u2713", erpnext: "\u2713" },
  { feature: "Help Desk", featureAr: "\u062e\u062f\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621", yasco: "\u2713", zoho: "\u2713", odoo: "\u2713", sap: "\u2713", netsuite: "\u2717", dynamics: "\u2713", erpnext: "\u2713" },
  { feature: "Ecommerce", featureAr: "\u0627\u0644\u062a\u062c\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629", yasco: "\u2713", zoho: "\u2713", odoo: "\u2713", sap: "\u2713", netsuite: "\u2713", dynamics: "\u2713", erpnext: "\u2713" },
  { feature: "Multi-Company", featureAr: "\u0634\u0631\u0643\u0627\u062a \u0645\u062a\u0639\u062f\u062f\u0629", yasco: "\u2713", zoho: "\u2713", odoo: "Via addon", sap: "\u2713", netsuite: "\u2713", dynamics: "\u2713", erpnext: "\u2713" },
  { feature: "Multi-Currency", featureAr: "\u0639\u0645\u0644\u0627\u062a \u0645\u062a\u0639\u062f\u062f\u0629", yasco: "\u2713", zoho: "\u2713", odoo: "\u2713", sap: "\u2713", netsuite: "\u2713", dynamics: "\u2713", erpnext: "\u2713" },
  { feature: "Multi-Language", featureAr: "\u0644\u063a\u0627\u062a \u0645\u062a\u0639\u062f\u062f\u0629", yasco: "\u2713", zoho: "\u2713", odoo: "\u2713", sap: "\u2713", netsuite: "\u2713", dynamics: "\u2713", erpnext: "\u2713" },
  { feature: "ZATCA Saudi", featureAr: "\u0632\u0627\u062a\u0643\u0627 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629", yasco: "\u2713", zoho: "\u2717", odoo: "Via addon", sap: "Via addon", netsuite: "Via addon", dynamics: "Via addon", erpnext: "\u2717" },
  { feature: "FBR Pakistan", featureAr: "FBR \u0628\u0627\u0643\u0633\u062a\u0627\u0646", yasco: "\u2713", zoho: "\u2717", odoo: "\u2717", sap: "\u2717", netsuite: "\u2717", dynamics: "\u2717", erpnext: "\u2717" },
  { feature: "UAE VAT", featureAr: "\u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a", yasco: "\u2713", zoho: "\u2713", odoo: "\u2713", sap: "\u2713", netsuite: "\u2713", dynamics: "\u2713", erpnext: "Partial" },
  { feature: "India GST", featureAr: "\u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0647\u0646\u062f", yasco: "\u2713", zoho: "\u2713", odoo: "\u2713", sap: "\u2713", netsuite: "\u2713", dynamics: "\u2713", erpnext: "Partial" },
  { feature: "EU VAT", featureAr: "\u0636\u0631\u064a\u0628\u0629 EU", yasco: "\u2713", zoho: "\u2713", odoo: "\u2713", sap: "\u2713", netsuite: "\u2713", dynamics: "\u2713", erpnext: "Partial" },
  { feature: "USA Sales Tax", featureAr: "\u0636\u0631\u064a\u0628\u0629 \u0623\u0645\u0631\u064a\u0643\u0627", yasco: "\u2713", zoho: "\u2713", odoo: "Via addon", sap: "\u2713", netsuite: "\u2713", dynamics: "\u2713", erpnext: "\u2717" },
  { feature: "Installments", featureAr: "\u0627\u0644\u062a\u0642\u0633\u064a\u0637", yasco: "\u2713", zoho: "\u2717", odoo: "\u2717", sap: "\u2717", netsuite: "\u2717", dynamics: "\u2717", erpnext: "\u2717" },
  { feature: "Cashbox", featureAr: "\u0627\u0644\u0635\u0646\u062f\u0648\u0642", yasco: "\u2713", zoho: "\u2717", odoo: "Via addon", sap: "\u2717", netsuite: "\u2717", dynamics: "\u2717", erpnext: "\u2713" },
  { feature: "Bilingual", featureAr: "\u062b\u0646\u0627\u0626\u064a \u0627\u0644\u0644\u063a\u0629", yasco: "\u2713", zoho: "\u2713", odoo: "\u2713", sap: "\u2713", netsuite: "\u2713", dynamics: "\u2713", erpnext: "\u2713" },
  { feature: "Open Source", featureAr: "\u0645\u0641\u062a\u0648\u062d \u0627\u0644\u0645\u0635\u062f\u0631", yasco: "\u2713", zoho: "\u2717", odoo: "\u2713", sap: "\u2717", netsuite: "\u2717", dynamics: "\u2717", erpnext: "\u2713" },
  { feature: "Self-hosted", featureAr: "\u0627\u0633\u062a\u0636\u0627\u0641\u0629 \u0630\u0627\u062a\u064a\u0629", yasco: "\u2713", zoho: "\u2717", odoo: "\u2713", sap: "\u2717", netsuite: "\u2717", dynamics: "\u2717", erpnext: "\u2713" },
  { feature: "AI Assistant", featureAr: "\u0627\u0644\u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0630\u0643\u064a", yasco: "\u2713", zoho: "Partial", odoo: "Via addon", sap: "\u2713", netsuite: "\u2713", dynamics: "\u2713", erpnext: "\u2717" },
  { feature: "Mobile App", featureAr: "\u062a\u0637\u0628\u064a\u0642 \u062c\u0648\u0627\u0644", yasco: "\u2713", zoho: "\u2713", odoo: "\u2713", sap: "\u2713", netsuite: "\u2713", dynamics: "\u2713", erpnext: "Partial" },
  { feature: "Offline POS", featureAr: "\u0646\u0642\u0637\u0629 \u0628\u064a\u0639 \u0628\u062f\u0648\u0646 \u0625\u0646\u062a\u0631\u0646\u062a", yasco: "\u2713", zoho: "\u2717", odoo: "\u2717", sap: "\u2717", netsuite: "\u2717", dynamics: "\u2717", erpnext: "\u2717" },
  { feature: "API & Webhooks", featureAr: "API \u0648 Webhooks", yasco: "\u2713", zoho: "\u2713", odoo: "\u2713", sap: "\u2713", netsuite: "\u2713", dynamics: "\u2713", erpnext: "\u2713" },
  { feature: "Marketplace", featureAr: "\u0645\u062a\u062c\u0631 \u0627\u0644\u062a\u0637\u0628\u064a\u0642\u0627\u062a", yasco: "\u2713", zoho: "\u2713", odoo: "\u2713", sap: "\u2713", netsuite: "\u2713", dynamics: "\u2713", erpnext: "\u2713" },
  { feature: "White Label", featureAr: "\u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u0628\u064a\u0636\u0627\u0621", yasco: "\u2713", zoho: "\u2717", odoo: "Via addon", sap: "\u2717", netsuite: "\u2717", dynamics: "\u2717", erpnext: "\u2713" },
  { feature: "Gov API Integration", featureAr: "\u062a\u0643\u0627\u0645\u0644 \u0627\u0644\u062d\u0643\u0648\u0645\u0627\u062a", yasco: "\u2713", zoho: "\u2717", odoo: "Partial", sap: "Partial", netsuite: "Partial", dynamics: "Partial", erpnext: "\u2717" },
  { feature: "Country Auto-Detection", featureAr: "\u0627\u0644\u0643\u0634\u0641 \u0627\u0644\u062a\u0644\u0642\u0627\u0626\u064a", yasco: "\u2713", zoho: "\u2717", odoo: "\u2717", sap: "\u2717", netsuite: "\u2717", dynamics: "\u2717", erpnext: "\u2717" },
];

const competitors = [
  { key: "zoho", name: "Zoho", color: "text-blue-400" },
  { key: "odoo", name: "Odoo", color: "text-purple-400" },
  { key: "sap", name: "SAP S/4HANA", color: "text-orange-400" },
  { key: "netsuite", name: "NetSuite", color: "text-cyan-400" },
  { key: "dynamics", name: "MS Dynamics 365", color: "text-sky-400" },
  { key: "erpnext", name: "ERPNext", color: "text-green-400" },
];

const WHY_CHOOSE = [
  { icon: Store, title: { en: "SAHL-style Easy POS", ar: "\u0646\u0642\u0637\u0629 \u0628\u064a\u0639 \u0633\u0647\u0644\u0629 \u0639\u0644\u0649 \u0646\u0645\u0637 SAHL" }, desc: { en: "Intuitive, fast, and feature-rich point of sale with offline mode, barcode scanning, and touchscreen support.", ar: "\u0646\u0642\u0637\u0629 \u0628\u064a\u0639 \u0628\u062f\u064a\u0647\u064a\u0629 \u0648\u0633\u0631\u064a\u0639\u0629 \u0648\u063a\u0646\u064a\u0629 \u0628\u0627\u0644\u0645\u064a\u0632\u0627\u062a \u0645\u0639 \u0648\u0636\u0639 \u0639\u062f\u0645 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0648\u0645\u0633\u062d \u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062f." } },
  { icon: LayoutDashboard, title: { en: "Zoho-style App Suite", ar: "\u0645\u062c\u0645\u0648\u0639\u0629 \u062a\u0637\u0628\u064a\u0642\u0627\u062a \u0639\u0644\u0649 \u0646\u0645\u0637 Zoho" }, desc: { en: "Comprehensive suite of integrated business applications working seamlessly together.", ar: "\u0645\u062c\u0645\u0648\u0639\u0629 \u0634\u0627\u0645\u0644\u0629 \u0645\u0646 \u062a\u0637\u0628\u064a\u0642\u0627\u062a \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u0645\u062a\u0643\u0627\u0645\u0644\u0629 \u062a\u0639\u0645\u0644 \u0645\u0639\u0627\u064b \u0628\u0633\u0644\u0627\u0633\u0629." } },
  { icon: Layers, title: { en: "Odoo-style Modular Apps", ar: "\u062a\u0637\u0628\u064a\u0642\u0627\u062a \u0645\u0639\u064a\u0627\u0631\u064a\u0629 \u0639\u0644\u0649 \u0646\u0645\u0637 Odoo" }, desc: { en: "Start with what you need, add modules as you grow. 100+ modules available.", ar: "\u0627\u0628\u062f\u0623 \u0628\u0645\u0627 \u062a\u062d\u062a\u0627\u062c\u0647\u060c \u0623\u0636\u0641 \u0648\u062d\u062f\u0627\u062a \u0645\u0639 \u0646\u0645\u0648\u0643. \u0623\u0643\u062b\u0631 \u0645\u0646 100 \u0648\u062d\u062f\u0629 \u0645\u062a\u0627\u062d\u0629." } },
  { icon: Building2, title: { en: "SAP-style Enterprise Finance", ar: "\u0645\u0627\u0644\u064a\u0629 \u0645\u0624\u0633\u0633\u0627\u062a \u0639\u0644\u0649 \u0646\u0645\u0637 SAP" }, desc: { en: "Enterprise-grade financial management with multi-company, multi-currency, and global tax compliance.", ar: "\u0625\u062f\u0627\u0631\u0629 \u0645\u0627\u0644\u064a\u0629 \u0639\u0644\u0649 \u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0645\u0624\u0633\u0633\u0627\u062a \u0645\u0639 \u0634\u0631\u0643\u0627\u062a \u0645\u062a\u0639\u062f\u062f\u0629 \u0648\u0639\u0645\u0644\u0627\u062a \u0645\u062a\u0639\u062f\u062f\u0629." } },
  { icon: Cloud, title: { en: "NetSuite-style Cloud ERP", ar: "ERP \u0633\u062d\u0627\u0628\u064a \u0639\u0644\u0649 \u0646\u0645\u0637 NetSuite" }, desc: { en: "Full cloud ERP with real-time inventory, order management, and financial consolidation.", ar: "ERP \u0633\u062d\u0627\u0628\u064a \u0643\u0627\u0645\u0644 \u0645\u0639 \u0645\u062e\u0632\u0648\u0646 \u0641\u0648\u0631\u064a \u0648\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062a \u0648\u0627\u0644\u062a\u0648\u062d\u064a\u062f \u0627\u0644\u0645\u0627\u0644\u064a." } },
  { icon: ShieldCheck, title: { en: "ERPNext-style Flexible Open Modules", ar: "\u0648\u062d\u062f\u0627\u062a \u0645\u0631\u0646\u0629 \u0645\u0641\u062a\u0648\u062d\u0629 \u0639\u0644\u0649 \u0646\u0645\u0637 ERPNext" }, desc: { en: "Open, flexible, and customizable modules that you can tailor to your business needs.", ar: "\u0648\u062d\u062f\u0627\u062a \u0645\u0641\u062a\u0648\u062d\u0629 \u0648\u0645\u0631\u0646\u0629 \u0648\u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u062a\u062e\u0635\u064a\u0635 \u064a\u0645\u0643\u0646\u0643 \u062a\u0643\u064a\u064a\u0641\u0647\u0627 \u062d\u0633\u0628 \u0627\u062d\u062a\u064a\u0627\u062c\u0627\u062a \u0639\u0645\u0644\u0643." } },
];

const UNIQUE_ADVANTAGES = [
  { icon: Layers, title: { en: "Pakistan FBR Readiness", ar: "\u062c\u0627\u0647\u0632\u064a\u0629 FBR \u0628\u0627\u0643\u0633\u062a\u0627\u0646" }, desc: { en: "Full integration with FBR digital invoicing, sales tax, and withholding tax.", ar: "\u062a\u0643\u0627\u0645\u0644 \u0643\u0627\u0645\u0644 \u0645\u0639 \u0627\u0644\u0641\u0648\u062a\u0631\u0629 \u0627\u0644\u0631\u0642\u0645\u064a\u0629 FBR \u0648\u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a." } },
  { icon: Sigma, title: { en: "Saudi ZATCA Readiness", ar: "\u062c\u0627\u0647\u0632\u064a\u0629 \u0632\u0627\u062a\u0643\u0627 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629" }, desc: { en: "Phase 1 & 2 compliant with QR codes, simplified and standard tax invoices.", ar: "\u0645\u062a\u0648\u0627\u0641\u0642 \u0645\u0639 \u0627\u0644\u0645\u0631\u062d\u0644\u062a\u064a\u0646 1 \u06482 \u0645\u0639 \u0631\u0645\u0648\u0632 QR \u0648\u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631 \u0627\u0644\u0636\u0631\u064a\u0628\u064a\u0629." } },
  { icon: Globe2, title: { en: "UAE VAT Readiness", ar: "\u062c\u0627\u0647\u0632\u064a\u0629 \u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629" }, desc: { en: "UAE VAT compliant with TRN, tax invoices, and VAT return reports.", ar: "\u0645\u062a\u0648\u0627\u0641\u0642 \u0645\u0639 \u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629 \u0641\u064a \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a \u0645\u0639 TRN \u0648\u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631 \u0627\u0644\u0636\u0631\u064a\u0628\u064a\u0629." } },
  { icon: MapPin, title: { en: "Auto Country/Language/Tax/Timezone", ar: "\u0627\u0644\u0643\u0634\u0641 \u0627\u0644\u062a\u0644\u0642\u0627\u0626\u064a" }, desc: { en: "Automatically detects and configures your country, language, currency, and timezone.", ar: "\u064a\u0643\u062a\u0634\u0641 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b \u0648\u064a\u0643\u0648\u0646 \u062f\u0648\u0644\u062a\u0643 \u0648\u0644\u063a\u062a\u0643 \u0648\u0639\u0645\u0644\u062a\u0643 \u0648\u0645\u0646\u0637\u0642\u062a\u0643 \u0627\u0644\u0632\u0645\u0646\u064a\u0629." } },
  { icon: Sparkles, title: { en: "Animated 3D Module Boxes", ar: "\u0635\u0646\u0627\u062f\u064a\u0642 \u0648\u062d\u062f\u0627\u062a 3D" }, desc: { en: "Explore all 100+ modules in an interactive 3D grid with real-time previews.", ar: "\u0627\u0633\u062a\u0639\u0631\u0636 \u062c\u0645\u064a\u0639 \u0627\u0644\u0648\u062d\u062f\u0627\u062a \u0627\u0644\u0640 100+ \u0641\u064a \u0634\u0628\u0643\u0629 \u062b\u0644\u0627\u062b\u064a\u0629 \u0627\u0644\u0623\u0628\u0639\u0627\u062f \u062a\u0641\u0627\u0639\u0644\u064a\u0629." } },
];

const MULTI_COUNTRY_FEATURES = [
  { icon: Languages, title: { en: "Auto Language Detection", ar: "\u0627\u0644\u0643\u0634\u0641 \u0627\u0644\u062a\u0644\u0642\u0627\u0626\u064a \u0644\u0644\u0644\u063a\u0629" }, desc: { en: "Automatically detect and switch between English, Arabic, and more languages.", ar: "\u064a\u0643\u062a\u0634\u0641 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b \u0648\u064a\u0628\u062f\u0644 \u0628\u064a\u0646 \u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 \u0648\u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0648\u0627\u0644\u0645\u0632\u064a\u062f." } },
  { icon: Globe2, title: { en: "Auto Timezone Detection", ar: "\u0627\u0644\u0643\u0634\u0641 \u0627\u0644\u062a\u0644\u0642\u0627\u0626\u064a \u0644\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0632\u0645\u0646\u064a\u0629" }, desc: { en: "Automatically detect and set the correct timezone for your region.", ar: "\u064a\u0643\u062a\u0634\u0641 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b \u0648\u064a\u0636\u0628\u0637 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0632\u0645\u0646\u064a\u0629 \u0627\u0644\u0635\u062d\u064a\u062d\u0629 \u0644\u0645\u0646\u0637\u0642\u062a\u0643." } },
  { icon: Wallet, title: { en: "Auto Currency Detection", ar: "\u0627\u0644\u0643\u0634\u0641 \u0627\u0644\u062a\u0644\u0642\u0627\u0626\u064a \u0644\u0644\u0639\u0645\u0644\u0629" }, desc: { en: "Automatically detect and configure the correct currency.", ar: "\u064a\u0643\u062a\u0634\u0641 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b \u0648\u064a\u0643\u0648\u0646 \u0627\u0644\u0639\u0645\u0644\u0629 \u0627\u0644\u0635\u062d\u064a\u062d\u0629." } },
  { icon: ShieldCheck, title: { en: "Auto Tax Profile", ar: "\u0627\u0644\u0643\u0634\u0641 \u0627\u0644\u062a\u0644\u0642\u0627\u0626\u064a \u0644\u0644\u0645\u0644\u0641 \u0627\u0644\u0636\u0631\u064a\u0628\u064a" }, desc: { en: "Automatically detect and apply the correct tax rules.", ar: "\u064a\u0643\u062a\u0634\u0641 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b \u0648\u064a\u0637\u0628\u0642 \u0627\u0644\u0642\u0648\u0627\u0639\u062f \u0627\u0644\u0636\u0631\u064a\u0628\u064a\u0629 \u0627\u0644\u0635\u062d\u064a\u062d\u0629." } },
  { icon: BookOpen, title: { en: "RTL / LTR Support", ar: "\u062f\u0639\u0645 RTL / LTR" }, desc: { en: "Full right-to-left support for Arabic and other RTL languages.", ar: "\u062f\u0639\u0645 \u0643\u0627\u0645\u0644 \u0645\u0646 \u0627\u0644\u064a\u0645\u064a\u0646 \u0625\u0644\u0649 \u0627\u0644\u064a\u0633\u0627\u0631 \u0644\u0644\u0639\u0631\u0628\u064a\u0629." } },
  { icon: Building2, title: { en: "Branch/Company Selector", ar: "\u0645\u062d\u062f\u062f \u0627\u0644\u0641\u0631\u0639/\u0627\u0644\u0634\u0631\u0643\u0629" }, desc: { en: "Easily switch between branches, companies, and legal entities.", ar: "\u062a\u0628\u062f\u064a\u0644 \u0633\u0647\u0644 \u0628\u064a\u0646 \u0627\u0644\u0641\u0631\u0648\u0639 \u0648\u0627\u0644\u0634\u0631\u0643\u0627\u062a." } },
];

const PLANS = [
  {
    name: { en: "Starter", ar: "\u0645\u0628\u062a\u062f\u0626" }, price: "$29", period: { en: "/month", ar: "/\u0634\u0647\u0631" }, popular: false,
    features: [
      { en: "1 Company", ar: "\u0634\u0631\u0643\u0629 \u0648\u0627\u062d\u062f\u0629" },
      { en: "3 Users", ar: "3 \u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646" },
      { en: "Core Modules", ar: "\u0627\u0644\u0648\u062d\u062f\u0627\u062a \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629" },
      { en: "POS System", ar: "\u0646\u0638\u0627\u0645 \u0646\u0642\u0627\u0637 \u0627\u0644\u0628\u064a\u0639" },
      { en: "Basic Accounting", ar: "\u0645\u062d\u0627\u0633\u0628\u0629 \u0623\u0633\u0627\u0633\u064a\u0629" },
      { en: "Inventory Management", ar: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u062e\u0632\u0648\u0646" },
      { en: "Email Support", ar: "\u062f\u0639\u0645 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a" },
      { en: "Community Access", ar: "\u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0644\u0645\u062c\u062a\u0645\u0639" },
    ],
  },
  {
    name: { en: "Growing", ar: "\u0645\u062a\u0646\u0627\u0645\u064a" }, price: "$79", period: { en: "/month", ar: "/\u0634\u0647\u0631" }, popular: true,
    features: [
      { en: "3 Companies", ar: "3 \u0634\u0631\u0643\u0627\u062a" },
      { en: "10 Users", ar: "10 \u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646" },
      { en: "All Modules", ar: "\u062c\u0645\u064a\u0639 \u0627\u0644\u0648\u062d\u062f\u0627\u062a" },
      { en: "POS + Offline Mode", ar: "\u0646\u0642\u0627\u0637 \u0627\u0644\u0628\u064a\u0639 + \u0648\u0636\u0639 \u0639\u062f\u0645 \u0627\u0644\u0627\u062a\u0635\u0627\u0644" },
      { en: "Full Accounting", ar: "\u0645\u062d\u0627\u0633\u0628\u0629 \u0643\u0627\u0645\u0644\u0629" },
      { en: "CRM & Sales Pipeline", ar: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a" },
      { en: "HR & Payroll", ar: "\u0627\u0644\u0645\u0648\u0627\u0631\u062f \u0627\u0644\u0628\u0634\u0631\u064a\u0629 \u0648\u0627\u0644\u0631\u0648\u0627\u062a\u0628" },
      { en: "Manufacturing", ar: "\u0627\u0644\u062a\u0635\u0646\u064a\u0639" },
      { en: "Tax Compliance", ar: "\u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644 \u0627\u0644\u0636\u0631\u064a\u0628\u064a" },
      { en: "Priority Support", ar: "\u062f\u0639\u0645 \u0630\u0648 \u0623\u0648\u0644\u0648\u064a\u0629" },
    ],
  },
  {
    name: { en: "Enterprise", ar: "\u0645\u0624\u0633\u0633\u0627\u062a" }, price: "$199", period: { en: "/month", ar: "/\u0634\u0647\u0631" }, popular: false,
    features: [
      { en: "Unlimited Companies", ar: "\u0634\u0631\u0643\u0627\u062a \u063a\u064a\u0631 \u0645\u062d\u062f\u0648\u062f\u0629" },
      { en: "Unlimited Users", ar: "\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646 \u063a\u064a\u0631 \u0645\u062d\u062f\u0648\u062f\u064a\u0646" },
      { en: "All Modules + Custom", ar: "\u062c\u0645\u064a\u0639 \u0627\u0644\u0648\u062d\u062f\u0627\u062a + \u062a\u062e\u0635\u064a\u0635" },
      { en: "White Label", ar: "\u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u0628\u064a\u0636\u0627\u0621" },
      { en: "Self-hosted Option", ar: "\u062e\u064a\u0627\u0631 \u0627\u0644\u0627\u0633\u062a\u0636\u0627\u0641\u0629 \u0627\u0644\u0630\u0627\u062a\u064a\u0629" },
      { en: "Dedicated Server", ar: "\u062e\u0627\u062f\u0645 \u0645\u062e\u0635\u0635" },
      { en: "API & Webhooks", ar: "API \u0648 Webhooks" },
      { en: "SLA Guarantee", ar: "\u0636\u0645\u0627\u0646 \u0627\u062a\u0641\u0627\u0642\u064a\u0629 \u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u062e\u062f\u0645\u0629" },
      { en: "Dedicated Support", ar: "\u062f\u0639\u0645 \u0645\u062e\u0635\u0635" },
      { en: "Onboarding & Training", ar: "\u0627\u0644\u062a\u0623\u0647\u064a\u0644 \u0648\u0627\u0644\u062a\u062f\u0631\u064a\u0628" },
    ],
  },
];

function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StatsCounter({ value, suffix = "", label, labelAr }: { value: number; suffix?: string; label: string; labelAr: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  const { language } = useLanguage();

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
        {count}{suffix}
      </div>
      <div className="text-sm text-gray-400 mt-1">{language === "ar" ? labelAr : label}</div>
    </div>
  );
}

const stats = [
  { value: 100, suffix: "+", label: "ERP Modules", labelAr: "وحدة ERP" },
  { value: 50, suffix: "+", label: "Countries Supported", labelAr: "دولة مدعومة" },
  { value: 99.9, suffix: "%", label: "Uptime", labelAr: "وقت التشغيل" },
  { value: 24, suffix: "/7", label: "Support", labelAr: "دعم فني" },
];

function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-xl opacity-10 bg-emerald-400/20 border border-emerald-400/10"
          style={{
            width: `${60 + i * 30}px`,
            height: `${60 + i * 30}px`,
            left: `${10 + (i * 12) % 80}%`,
            top: `${10 + (i * 15) % 70}%`,
            animation: `float${i % 4} ${6 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`,
            transform: `rotate(${i * 25}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes float0 { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-30px) rotate(10deg); } }
        @keyframes float1 { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(-8deg); } }
        @keyframes float2 { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-40px) rotate(12deg); } }
        @keyframes float3 { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-25px) rotate(-5deg); } }
      `}</style>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto animate-[fadeInUp_1s_ease-out]">
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-700 hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
            <div className="w-3 h-3 rounded-full bg-green-400/60" />
          </div>
          <div className="text-white/50 text-[10px] font-mono">ERP Dashboard</div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { value: "$284K", color: "from-emerald-400 to-green-500", labelEn: "Revenue" },
            { value: "1,247", color: "from-blue-400 to-blue-500", labelEn: "Orders" },
            { value: "$62K", color: "from-amber-400 to-amber-500", labelEn: "Profit" },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className={`h-1.5 w-8 rounded-full bg-gradient-to-r ${item.color} mb-2`} />
              <div className="text-[10px] text-white/50">{item.labelEn}</div>
              <div className="text-lg font-bold text-white">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/5 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60">Sales</span>
            <span className="text-[10px] text-white/30">This Week</span>
          </div>
          <div className="flex items-end gap-1 h-12">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-emerald-500/40 to-emerald-400/20 rounded-t-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/5 rounded-lg p-2 border border-white/5">
            <div className="text-[10px] text-white/30">Tax</div>
            <div className="text-sm font-bold text-emerald-300">ZATCA ✓</div>
          </div>
          <div className="flex-1 bg-white/5 rounded-lg p-2 border border-white/5">
            <div className="text-[10px] text-white/30">Lang</div>
            <div className="text-sm font-bold text-white">EN/AR</div>
          </div>
          <div className="flex-1 bg-white/5 rounded-lg p-2 border border-white/5">
            <div className="text-[10px] text-white/30">Curr.</div>
            <div className="text-sm font-bold text-white">SAR</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PosMockup() {
  return (
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="text-white text-xs font-medium">POS Terminal</span>
        </div>
        <div className="flex gap-2 items-center text-white/40">
          <Printer className="size-3.5" />
          <QrCode className="size-3.5" />
          <Scan className="size-3.5" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {["Item A", "Item B", "Item C", "Item D", "Item E", "Item F"].map((item, i) => (
          <div key={i} className="bg-white/5 rounded-lg p-2 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="h-6 w-full rounded bg-white/10 mb-1" />
            <div className="text-[10px] text-white/70 truncate">{item}</div>
            <div className="text-[10px] text-emerald-300">$12.99</div>
          </div>
        ))}
      </div>
      <div className="bg-white/5 rounded-xl p-3 border border-white/5 mb-3">
        <div className="flex justify-between text-xs text-white/60 mb-1">
          <span>Items (3)</span>
          <span>$38.97</span>
        </div>
        <div className="flex justify-between text-xs text-white/60 mb-1">
          <span>Tax (15%)</span>
          <span>$5.85</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-white border-t border-white/10 pt-1 mt-1">
          <span>Total</span>
          <span className="text-emerald-300">$44.82</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-emerald-500/30 rounded-lg py-2 text-center text-sm font-medium text-white cursor-pointer hover:bg-emerald-500/40 transition-colors">Cash</div>
        <div className="bg-blue-500/30 rounded-lg py-2 text-center text-sm font-medium text-white cursor-pointer hover:bg-blue-500/40 transition-colors">Card</div>
      </div>
    </div>
  );
}

function LaunchCounter({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calc() {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    }
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { labelEn: "Days", labelAr: "\u0623\u064a\u0627\u0645", value: timeLeft.days },
    { labelEn: "Hours", labelAr: "\u0633\u0627\u0639\u0627\u062a", value: timeLeft.hours },
    { labelEn: "Minutes", labelAr: "\u062f\u0642\u0627\u0626\u0642", value: timeLeft.minutes },
    { labelEn: "Seconds", labelAr: "\u062b\u0648\u0627\u0646\u064d", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6">
      {units.map((unit, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 sm:px-6 sm:py-4 min-w-[70px] sm:min-w-[90px]">
            <span className="text-2xl sm:text-4xl font-bold text-white tabular-nums block text-center">
              {String(unit.value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-white/60 mt-1.5">{unit.labelEn}</span>
        </div>
      ))}
    </div>
  );
}
export default function Landing() {
  const { language, setLang, dir } = useLanguage();
  const rtl = language === "ar";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(true);
  const [email, setEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("SA");
  const contactMutation = trpc.website.submitContact.useMutation();

  useEffect(() => {
    const dismissed = sessionStorage.getItem(BANNER_DISMISS_KEY);
    if (dismissed !== "true") setAnnouncementDismissed(false);
  }, []);

  const dismissAnnouncement = () => {
    setAnnouncementDismissed(true);
    sessionStorage.setItem(BANNER_DISMISS_KEY, "true");
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const t = (en: string, ar: string) => rtl ? ar : en;

  const navLinks = [
    { id: "modules", label: { en: "Modules", ar: "\u0627\u0644\u0648\u062d\u062f\u0627\u062a" } },
    { id: "tax", label: { en: "Tax Compliance", ar: "\u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644 \u0627\u0644\u0636\u0631\u064a\u0628\u064a" } },
    { id: "pricing", label: { en: "Pricing", ar: "\u0627\u0644\u0623\u0633\u0639\u0627\u0631" } },
    { id: "comparison", label: { en: "Comparisons", ar: "\u0627\u0644\u0645\u0642\u0627\u0631\u0646\u0627\u062a" } },
    { id: "faq", label: { en: "FAQ", ar: "\u0627\u0644\u0623\u0633\u0626\u0644\u0629" } },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950/30 to-slate-950 relative" dir={dir}>
      <ThreeBackground />
      {/* Announcement Bar */}
      {!announcementDismissed && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 text-white text-xs sm:text-sm">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
            <p className="flex-1 text-center truncate">
              <Sparkles className="h-3.5 w-3.5 inline mr-1" /> YASCO Global Smart ERP — POS, Accounting, Inventory, CRM, HR, Manufacturing, Ecommerce, AI & Tax Compliance
            </p>
            <button onClick={dismissAnnouncement} className="shrink-0 text-white/70 hover:text-white transition-colors">
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Fixed Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        "bg-slate-950/80 backdrop-blur-xl border-b border-white/5",
        announcementDismissed ? "top-0" : "top-[38px] sm:top-[42px]",
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <img src="/logo-40.png" alt="YASCO" className="w-9 h-9 rounded-lg object-contain" />
              <div className="hidden sm:block">
                <span className="font-bold text-lg text-white">YASCO</span>
                <span className="block text-[10px] text-blue-400/70 -mt-0.5">{t("Global Smart ERP", "\u0646\u0638\u0627\u0645 ERP \u0639\u0627\u0644\u0645\u064a \u0630\u0643\u064a")}</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  {link.label[language]}
                </button>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-1.5">
              <Button variant="ghost" size="sm" onClick={() => setLang(language === "en" ? "ar" : "en")} className="gap-2 text-slate-300 hover:text-white">
                <Languages className="h-4 w-4" />
                {language === "en" ? "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" : "English"}
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                <Link to="/login">{t("Login", "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644")}</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10 hover:text-white">
                <Link to="/login">{t("Free Demo", "\u062a\u062c\u0631\u0628\u0629 \u0645\u062c\u0627\u0646\u064a\u0629")}</Link>
              </Button>
            </div>

            <div className="flex lg:hidden items-center gap-2">
              <Button variant="ghost" size="icon-sm" onClick={() => setLang(language === "en" ? "ar" : "en")} className="text-slate-300">
                <Languages className="h-4 w-4" />
              </Button>
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="text-slate-300">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-slate-950 border-white/5 w-[300px]">
                  <SheetHeader>
                    <SheetTitle className="text-white flex items-center gap-2">
                      <img src="/logo-32.png" alt="YASCO" className="w-7 h-7 rounded object-contain" />
                      <span>YASCO</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-1 mt-4">
                    {navLinks.map((link) => (
                      <button
                        key={link.id}
                        onClick={() => scrollTo(link.id)}
                        className="text-left px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm"
                      >
                        {link.label[language]}
                      </button>
                    ))}
                    <div className="border-t border-white/5 my-2" />
                    <Link to="/login" className="px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm" onClick={() => setMobileMenuOpen(false)}>
                      {t("Login", "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644")}
                    </Link>
                    <Link to="/login" className="px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm" onClick={() => setMobileMenuOpen(false)}>
                      {t("Free Demo", "\u062a\u062c\u0631\u0628\u0629 \u0645\u062c\u0627\u0646\u064a\u0629")}
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Country Detection Banner */}
      <div className={cn(
        "relative z-40",
        announcementDismissed ? "pt-16" : "pt-[calc(4rem+38px)] sm:pt-[calc(4rem+42px)]",
      )}>
        <CountryDetectionBanner />
      </div>
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400/5 rounded-full blur-3xl" />
        <FloatingShapes />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn("text-center lg:text-left", rtl && "lg:text-right")}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Badge className="mb-6 bg-blue-500/10 text-blue-300 border-blue-500/20 px-4 py-1.5 text-sm gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("Global Smart ERP for Every Business", "\u0646\u0638\u0627\u0645 ERP \u0639\u0627\u0644\u0645\u064a \u0630\u0643\u064a \u0644\u0643\u0644 \u0634\u0631\u0643\u0629")}
                </Badge>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight"
              >
                {t("Global Smart ERP for", "\u0646\u0638\u0627\u0645 ERP \u0639\u0627\u0644\u0645\u064a \u0630\u0643\u064a")}
                <br />
                <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-indigo-400 bg-clip-text text-transparent animate-gradient">
                  {t("Every Country, Every Tax System, Every Business.", "\u0644\u0643\u0644 \u0628\u0644\u062f\u060c \u0644\u0643\u0644 \u0646\u0638\u0627\u0645 \u0636\u0631\u064a\u0628\u064a\u060c \u0644\u0643\u0644 \u0634\u0631\u0643\u0629.")}
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed"
              >
                {t(
                  "POS, Accounting, Inventory, CRM, HR, Manufacturing, Ecommerce, AI and Government Tax Compliance in one platform.",
                  "\u0646\u0642\u0627\u0637 \u0627\u0644\u0628\u064a\u0639\u060c \u0627\u0644\u0645\u062d\u0627\u0633\u0628\u0629\u060c \u0627\u0644\u0645\u062e\u0632\u0648\u0646\u060c \u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621\u060c \u0627\u0644\u0645\u0648\u0627\u0631\u062f \u0627\u0644\u0628\u0634\u0631\u064a\u0629\u060c \u0627\u0644\u062a\u0635\u0646\u064a\u0639\u060c \u0627\u0644\u062a\u062c\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629\u060c \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0648\u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644 \u0627\u0644\u0636\u0631\u064a\u0628\u064a \u0627\u0644\u062d\u0643\u0648\u0645\u064a \u0641\u064a \u0645\u0646\u0635\u0629 \u0648\u0627\u062d\u062f\u0629."
                )}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start"
              >
                <Button asChild variant="default" size="lg" className="gap-2 text-base px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-blue-500/25">
                  <a href="/downloads/yasco-erp-setup.exe" target="_blank">
                    <Download className="h-5 w-5" />{t("Download for Windows", "\u062a\u062d\u0645\u064a\u0644 \u0644\u0648\u0646\u062f\u0648\u0632")}
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="gap-2 text-base px-8 py-6 border-blue-400/30 text-blue-200 hover:bg-blue-500/10 hover:text-blue-100 hover:border-blue-400/50 transition-all duration-300">
                  <Play className="h-5 w-5" />{t("Watch Demo", "\u0634\u0627\u0647\u062f \u0639\u0631\u0636")}
                </Button>
                <Button variant="ghost" size="lg" onClick={() => scrollTo("modules")} className="gap-2 text-base px-6 py-6 text-slate-300 hover:text-white group">
                  {t("Explore Modules", "\u0627\u0633\u0639\u0631\u0636 \u0627\u0644\u0648\u062d\u062f\u0627\u062a")}<ChevronDown className="h-4 w-4 group-hover:translate-y-1 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="hidden lg:block"
            >
              <DashboardMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="relative py-16 border-y border-white/5 bg-gradient-to-r from-blue-950/30 via-indigo-950/20 to-blue-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <StatsCounter key={i} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative py-8 border-y border-white/5 bg-gradient-to-r from-blue-950/20 via-transparent to-indigo-950/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-slate-500 mb-4 tracking-widest uppercase">
            {t("Trusted by businesses in 20+ countries", "\u0645\u0648\u062b\u0648\u0642 \u0645\u0646 \u0642\u0628\u0644 \u0634\u0631\u0643\u0627\u062a \u0641\u064a \u0623\u0643\u062b\u0631 \u0645\u0646 20 \u062f\u0648\u0644\u0629")}
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.05 }}
            className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap"
          >
            {["\uD83C\uDDF8\uD83C\uDDE6", "\uD83C\uDDF5\uD83C\uDDF0", "\uD83C\uDDE6\uD83C\uDDEA", "\uD83C\uDDF6\uD83C\uDDE6", "\uD83C\uDDF4\uD83C\uDDF2", "\uD83C\uDDE7\uD83C\uDDED", "\uD83C\uDDF0\uD83C\uDDFC", "\uD83C\uDDEE\uD83C\uDDF3", "\uD83C\uDDEC\uD83C\uDDE7", "\uD83C\uDDFA\uD83C\uDDF8", "\uD83C\uDDE9\uD83C\uDDEA", "\uD83C\uDDEA\uD83C\uDDEC", "\uD83C\uDDF9\uD83C\uDDF7", "\uD83C\uDDF2\uD83C\uDDFE"].map((flag, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 0.5, scale: 1 }}
                whileHover={{ opacity: 1, scale: 1.2 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="text-2xl cursor-default"
              >{flag}</motion.span>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 via-transparent to-indigo-950/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection>
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-300 border-blue-500/20 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 mr-1" />{t("Core Features", "\u0627\u0644\u0645\u064a\u0632\u0627\u062a \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629")}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t("Everything your business needs", "\u0643\u0644 \u0645\u0627 \u062a\u062d\u062a\u0627\u062c\u0647 \u0623\u0639\u0645\u0627\u0644\u0643")}</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              {t("From accounting to manufacturing — manage all operations in one place.", "\u0645\u0646 \u0627\u0644\u0645\u062d\u0627\u0633\u0628\u0629 \u0625\u0644\u0649 \u0627\u0644\u062a\u0635\u0646\u064a\u0639 — \u0623\u062f\u0631 \u062c\u0645\u064a\u0639 \u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a \u0641\u064a \u0645\u0643\u0627\u0646 \u0648\u0627\u062d\u062f.")}
            </p>
          </div>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, idx) => {
              const content = featureContent[f.key];
              return (
                <motion.div
                  key={f.key}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group h-full">
                    <CardHeader>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${f.color} bg-opacity-20`}
                      >
                        <f.icon className="h-6 w-6" />
                      </motion.div>
                      <CardTitle className="text-lg text-white group-hover:text-blue-300 transition-colors">
                        {content ? content[language === "ar" ? "titleAr" : "title"] : f.key}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm text-slate-400 leading-relaxed">
                        {content ? content[language === "ar" ? "descAr" : "desc"] : ""}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* POS SECTION */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-20 sm:py-28 bg-gradient-to-br from-blue-950/30 to-indigo-950/30 border-y border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={cn(rtl && "lg:order-2")}
            >
              <Badge className="mb-4 bg-blue-500/10 text-blue-300 border-blue-500/20 px-3 py-1">
                <Store className="h-3.5 w-3.5 mr-1" />{t("POS System", "\u0646\u0638\u0627\u0645 \u0646\u0642\u0627\u0637 \u0627\u0644\u0628\u064a\u0639")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {t("SAHL-Style Point of Sale", "\u0646\u0642\u0637\u0629 \u0628\u064a\u0639 \u0639\u0644\u0649 \u0646\u0645\u0637 SAHL")}
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                {t("Lightning-fast POS with offline mode, barcode scanning, touchscreen support, and tax-compliant invoicing.", "\u0646\u0642\u0637\u0629 \u0628\u064a\u0639 \u0641\u0627\u0626\u0642\u0629 \u0627\u0644\u0633\u0631\u0639\u0629 \u0645\u0639 \u0648\u0636\u0639 \u0639\u062f\u0645 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0648\u0645\u0633\u062d \u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062f \u0648\u062f\u0639\u0645 \u0634\u0627\u0634\u0629 \u0627\u0644\u0644\u0645\u0633 \u0648\u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631 \u0627\u0644\u0645\u062a\u0648\u0627\u0641\u0642\u0629 \u0636\u0631\u064a\u0628\u064a\u0627\u064b.")}
              </p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ staggerChildren: 0.05, delayChildren: 0.2 }}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { en: "Fast Billing", ar: "\u0641\u0648\u062a\u0631\u0629 \u0633\u0631\u064a\u0639\u0629" },
                  { en: "Barcode Scanning", ar: "\u0645\u0633\u062d \u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062f" },
                  { en: "Touchscreen Support", ar: "\u062f\u0639\u0645 \u0634\u0627\u0634\u0629 \u0627\u0644\u0644\u0645\u0633" },
                  { en: "Offline Mode", ar: "\u0648\u0636\u0639 \u0639\u062f\u0645 \u0627\u0644\u0627\u062a\u0635\u0627\u0644" },
                  { en: "Hold / Resume", ar: "\u062a\u0639\u0644\u064a\u0642 / \u0627\u0633\u062a\u0626\u0646\u0627\u0641" },
                  { en: "Split Payment", ar: "\u062a\u0642\u0633\u064a\u0645 \u0627\u0644\u062f\u0641\u0639" },
                  { en: "Return / Exchange", ar: "\u0645\u0631\u062a\u062c\u0639\u0627\u062a / \u0627\u0633\u062a\u0628\u062f\u0627\u0644" },
                  { en: "Loyalty Points", ar: "\u0646\u0642\u0627\u0637 \u0627\u0644\u0648\u0644\u0627\u0621" },
                  { en: "QR Tax Invoice", ar: "\u0641\u0627\u062a\u0648\u0631\u0629 \u0636\u0631\u064a\u0628\u064a\u0629 QR" },
                  { en: "Thermal & A4 Print", ar: "\u0637\u0628\u0627\u0639\u0629 \u062d\u0631\u0627\u0631\u064a\u0629 \u0648 A4" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 text-sm text-slate-300"
                  >
                    <Check className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>{item[language]}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={cn(rtl && "lg:order-1")}
            >
              <PosMockup />
            </motion.div>
          </div>
        </div>
      </motion.section>
      {/* 3D MODULE GRID */}
      <section id="modules" className="py-20 sm:py-28 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 via-transparent to-indigo-950/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection>
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-300 border-blue-500/20 px-3 py-1">
              <Layers className="h-3.5 w-3.5 mr-1" />{t("100+ Modules", "100+ \u0648\u062d\u062f\u0629")}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t("100+ Integrated Business Modules", "100+ \u0648\u062d\u062f\u0629 \u0623\u0639\u0645\u0627\u0644 \u0645\u062a\u0643\u0627\u0645\u0644\u0629")}
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              {t("Everything you need to run your business in one platform", "\u0643\u0644 \u0645\u0627 \u062a\u062d\u062a\u0627\u062c\u0647 \u0644\u0625\u062f\u0627\u0631\u0629 \u0623\u0639\u0645\u0627\u0644\u0643 \u0641\u064a \u0645\u0646\u0635\u0629 \u0648\u0627\u062d\u062f\u0629")}
            </p>
          </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {modules.map((mod) => (
              <ModuleCard3D
                key={mod.key}
                moduleKey={mod.key}
                icon={mod.iconName}
                name={mod.name}
                nameAr={mod.nameAr}
                description={mod.description}
                descriptionAr={mod.descriptionAr}
                featureCount={mod.featureCount}
                gradientFrom={mod.gradientFrom}
                gradientTo={mod.gradientTo}
                language={language}
              />
            ))}
          </div>
        </div>
      </section>

      {/* COMPETITOR COMPARISON */}
      <section id="comparison" className="py-20 sm:py-28 bg-gradient-to-b from-blue-950/20 to-indigo-950/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-300 border-blue-500/20 px-3 py-1">
              <BarChart3 className="h-3.5 w-3.5 mr-1" />{t("Comparison", "\u0627\u0644\u0645\u0642\u0627\u0631\u0646\u0629")}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t("Why YASCO?", "\u0644\u0645\u0627\u0630\u0627 \u064a\u0627\u0633\u0643\u0648\u061f")}</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              {t("Comprehensive comparison with leading ERP platforms", "\u0645\u0642\u0627\u0631\u0646\u0629 \u0634\u0627\u0645\u0644\u0629 \u0645\u0639 \u0645\u0646\u0635\u0627\u062a ERP \u0627\u0644\u0631\u0627\u0626\u062f\u0629")}
            </p>
          </div>
          </AnimatedSection>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-2 mb-8"
          >
            {competitors.map((comp) => (
              <button
                key={comp.key}
                onClick={() => document.getElementById(`table-${comp.key}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
                className="px-4 py-2 rounded-full text-sm font-medium border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white hover:border-blue-400/30 transition-all"
              >
                {comp.name}
              </button>
            ))}
          </motion.div>

          <div className="space-y-8">
            {competitors.map((comp) => {
              const dataKey = comp.key as keyof typeof comparisonRows[0];
              return (
                <motion.div
                  key={comp.key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  id={`table-${comp.key}`}
                  className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] hover:border-blue-400/20 transition-colors"
                >
                  <div className="p-4 border-b border-white/5">
                    <h3 className="text-xl font-bold text-white">YASCO vs {comp.name}</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="text-left py-3 px-4 font-semibold text-slate-300">{t("Feature", "\u0627\u0644\u0645\u064a\u0632\u0629")}</th>
                        <th className="text-center py-3 px-4 font-semibold text-blue-400">YASCO</th>
                        <th className={cn("text-center py-3 px-4 font-semibold", comp.color)}>{comp.name}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-2.5 px-4 font-medium text-white/80">{rtl ? row.featureAr : row.feature}</td>
                          <td className="text-center py-2.5 px-4">
                            <span className={cn("text-sm font-bold", row.yasco === "\u2713" ? "text-blue-400" : "text-slate-400")}>
                              {row.yasco}
                            </span>
                          </td>
                          <td className="text-center py-2.5 px-4">
                            <span className={cn("text-sm", row[dataKey] === "\u2713" ? "text-green-400" : row[dataKey] === "\u2717" ? "text-red-400" : row[dataKey] === "Partial" ? "text-yellow-400" : "text-slate-400")}>
                              {row[dataKey]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE SECTION */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/10 via-transparent to-blue-950/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection>
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-300 border-blue-500/20 px-3 py-1">
              <Award className="h-3.5 w-3.5 mr-1" />{t("Why Us", "\u0644\u0645\u0627\u0630\u0627 \u0646\u062d\u0646")}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t("Why Choose Our ERP", "\u0644\u0645\u0627\u0630\u0627 \u062a\u062e\u062a\u0627\u0631 \u0646\u0638\u0627\u0645 ERP \u0627\u0644\u062e\u0627\u0635 \u0628\u0646\u0627")}</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              {t("The best of all worlds, plus unique advantages", "\u0623\u0641\u0636\u0644 \u0645\u0627 \u0641\u064a \u0627\u0644\u062c\u0645\u064a\u0639\u060c \u0628\u0627\u0644\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0645\u0632\u0627\u064a\u0627 \u0641\u0631\u064a\u062f\u0629")}
            </p>
          </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {WHY_CHOOSE.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group h-full">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <item.icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <CardTitle className="text-lg text-white">{item.title[language]}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-slate-400 leading-relaxed">{item.desc[language]}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <AnimatedSection delay={0.2}>
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            {t("Unique YASCO Advantages", "\u0645\u0632\u0627\u064a\u0627 \u064a\u0627\u0633\u0643\u0648 \u0627\u0644\u0641\u0631\u064a\u062f\u0629")}
          </h3>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {UNIQUE_ADVANTAGES.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="bg-gradient-to-br from-blue-500/5 to-indigo-600/5 border-blue-500/10 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <item.icon className="h-5 w-5 text-blue-400" />
                    </div>
                    <CardTitle className="text-sm font-semibold text-white">{item.title[language]}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc[language]}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* GLOBAL TAX COMPLIANCE */}
      <section id="tax" className="py-20 sm:py-28 bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 border border-blue-400/20 rounded-full" />
          <div className="absolute bottom-10 right-10 w-60 h-60 border border-indigo-400/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-300 border-blue-500/20 px-3 py-1">
              <Globe2 className="h-3.5 w-3.5 mr-1" />{t("Global Tax Compliance", "\u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644 \u0627\u0644\u0636\u0631\u064a\u0628\u064a \u0627\u0644\u0639\u0627\u0644\u0645\u064a")}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t("Multi-Country Tax Engine", "\u0645\u062d\u0631\u0643 \u0636\u0631\u0627\u0626\u0628 \u0645\u062a\u0639\u062f\u062f \u0627\u0644\u0628\u0644\u062f\u0627\u0646")}
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              {t("Compliant with ZATCA, FBR, UAE VAT, India GST, EU VAT, USA Sales Tax, and more", "\u0645\u062a\u0648\u0627\u0641\u0642 \u0645\u0639 \u0632\u0627\u062a\u0643\u0627\u060c FBR\u060c \u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629\u060c \u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0633\u0644\u0639 \u0627\u0644\u0647\u0646\u062f\u064a\u0629\u060c \u0636\u0631\u064a\u0628\u0629 EU\u060c \u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u0627\u0644\u0623\u0645\u0631\u064a\u0643\u064a\u0629")}
            </p>
          </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
          <div className="flex items-center justify-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
              <Globe2 className="h-4 w-4 text-blue-400" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-transparent text-white text-sm outline-none cursor-pointer"
              >
                <option value="SA">\uD83C\uDDF8\uD83C\uDDE6 Saudi Arabia - ZATCA</option>
                <option value="PK">\uD83C\uDDF5\uD83C\uDDF0 Pakistan - FBR</option>
                <option value="AE">\uD83C\uDDE6\uD83C\uDDEA UAE - VAT</option>
                <option value="IN">\uD83C\uDDEE\uD83C\uDDF3 India - GST</option>
                <option value="DE">\uD83C\uDDEA\uD83C\uDDFA EU - VAT</option>
                <option value="US">\uD83C\uDDFA\uD83C\uDDF8 USA - Sales Tax</option>
                <option value="EG">\uD83C\uDDEA\uD83C\uDDEC Egypt - VAT</option>
                <option value="TR">\uD83C\uDDF9\uD83C\uDDF7 Turkey - VAT</option>
              </select>
            </div>
          </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/5 backdrop-blur-sm border-green-500/20 hover:border-green-500/40 transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-2">
                  <Sigma className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle>ZATCA &mdash; {t("Saudi Arabia", "\u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />{t("ZATCA E-Invoicing Phase 1 & 2", "\u0627\u0644\u0641\u0648\u062a\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629 \u0632\u0627\u062a\u0643\u0627 \u0627\u0644\u0645\u0631\u062d\u0644\u062a\u0627\u0646 1 \u0648 2")}</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />{t("QR Code Generation", "\u0625\u0646\u0634\u0627\u0621 \u0631\u0645\u0632 QR")}</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />{t("Simplified & Standard Tax Invoices", "\u0641\u0648\u0627\u062a\u064a\u0631 \u0636\u0631\u064a\u0628\u064a\u0629 \u0645\u0628\u0633\u0637\u0629 \u0648\u0642\u064a\u0627\u0633\u064a\u0629")}</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />{t("ZATCA Clearance/Reporting", "\u0627\u0644\u062a\u062e\u0644\u064a\u0635/\u0627\u0644\u0625\u0628\u0644\u0627\u063a \u0632\u0627\u062a\u0643\u0627")}</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-sm border-blue-500/20 hover:border-blue-500/40 transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2">
                  <Layers className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle>FBR &mdash; {t("Pakistan", "\u0628\u0627\u0643\u0633\u062a\u0627\u0646")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />{t("FBR Digital Invoicing API", "API \u0627\u0644\u0641\u0648\u062a\u0631\u0629 \u0627\u0644\u0631\u0642\u0645\u064a\u0629 FBR")}</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />{t("NTN, STRN & CNIC Fields", "\u062d\u0642\u0648\u0644 NTN \u0648 STRN \u0648 CNIC")}</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />{t("Province-wise Sales Tax", "\u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u062d\u0633\u0628 \u0627\u0644\u0645\u0642\u0627\u0637\u0639\u0629")}</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />{t("Withholding Tax Support", "\u062f\u0639\u0645 \u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u062e\u0635\u0645")}</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-sm border-amber-500/20 hover:border-amber-500/40 transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2">
                  <Globe2 className="h-6 w-6 text-amber-400" />
                </div>
                <CardTitle>VAT &mdash; {t("UAE", "\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />{t("UAE VAT Compliance", "\u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644 \u0644\u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629")}</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />{t("TRN Field", "\u062d\u0642\u0644 TRN")}</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />{t("Arabic/English Invoices", "\u0641\u0648\u0627\u062a\u064a\u0631 \u0628\u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0648\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629")}</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />{t("VAT Return Report", "\u062a\u0642\u0631\u064a\u0631 \u0625\u0642\u0631\u0627\u0631 \u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629")}</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { code: "IN", name: "India GST", color: "from-orange-500 to-orange-600" },
              { code: "DE", name: "EU VAT", color: "from-blue-500 to-blue-600" },
              { code: "US", name: "USA Sales Tax", color: "from-indigo-500 to-indigo-600" },
              { code: "EG", name: "Egypt VAT", color: "from-red-500 to-red-600" },
            ].map((item) => (
              <Card key={item.code} className={`bg-gradient-to-br ${item.color}/10 border-white/5`}>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm text-white">{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs text-slate-400">{t("Full compliance", "\u0627\u0645\u062a\u062b\u0627\u0644 \u0643\u0627\u0645\u0644")}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500 mt-8">
            {t("Tax compliance in 20+ countries", "\u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644 \u0627\u0644\u0636\u0631\u064a\u0628\u064a \u0641\u064a \u0623\u0643\u062b\u0631 \u0645\u0646 20 \u062f\u0648\u0644\u0629")}
          </p>
        </div>
      </section>

      {/* MULTI-COUNTRY FEATURES */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-300 border-emerald-500/20 px-3 py-1">
              <Globe2 className="h-3.5 w-3.5 mr-1" />{t("Multi-Country", "\u0645\u062a\u0639\u062f\u062f \u0627\u0644\u0628\u0644\u062f\u0627\u0646")}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t("Built for Global Operations", "\u0645\u0628\u0646\u064a \u0644\u0644\u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u0639\u0627\u0644\u0645\u064a\u0629")}
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              {t("Auto-detect and adapt to any country language, currency, timezone, and tax rules", "\u064a\u0643\u062a\u0634\u0641 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b \u0648\u064a\u062a\u0643\u064a\u0641 \u0645\u0639 \u0644\u063a\u0629 \u0623\u064a \u0628\u0644\u062f \u0648\u0639\u0645\u0644\u062a\u0647 \u0648\u0645\u0646\u0637\u0642\u062a\u0647 \u0627\u0644\u0632\u0645\u0646\u064a\u0629 \u0648\u0642\u0648\u0627\u0639\u062f\u0647 \u0627\u0644\u0636\u0631\u064a\u0628\u064a\u0629")}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MULTI_COUNTRY_FEATURES.map((item, i) => (
              <Card key={i} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <item.icon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <CardTitle className="text-lg text-white">{item.title[language]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-slate-400 leading-relaxed">{item.desc[language]}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* PRICING */}
      <ScrollReveal direction="none">
      <section id="pricing" className="py-20 sm:py-28 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-300 border-emerald-500/20 px-3 py-1">
              <CreditCard className="h-3.5 w-3.5 mr-1" />{t("Pricing", "\u0627\u0644\u0623\u0633\u0639\u0627\u0631")}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t("Simple, Transparent Pricing", "\u0623\u0633\u0639\u0627\u0631 \u0628\u0633\u064a\u0637\u0629 \u0648\u0634\u0641\u0627\u0641\u0629")}
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              {t("Start free, upgrade as you grow. No hidden fees.", "\u0627\u0628\u062f\u0623 \u0645\u062c\u0627\u0646\u0627\u064b\u060c \u0648\u0627\u0631\u0641\u0639 \u062e\u0637\u062a\u0643 \u0645\u0639 \u0646\u0645\u0648\u0643. \u0644\u0627 \u0631\u0633\u0648\u0645 \u062e\u0641\u064a\u0629.")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => (
              <div key={i} className={cn(
                "relative rounded-2xl border p-8 transition-all duration-300",
                plan.popular
                  ? "bg-gradient-to-b from-emerald-500/10 to-green-600/5 border-emerald-500/40 shadow-xl shadow-emerald-500/10 scale-105"
                  : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10",
              )}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 px-4 py-1">
                      {t("Most Popular", "\u0627\u0644\u0623\u0643\u062b\u0631 \u0634\u064a\u0648\u0639\u0627\u064b")}
                    </Badge>
                  </div>
                )}
                <CardTitle className={cn("text-xl font-bold mb-4", plan.popular ? "text-emerald-300" : "text-white")}>
                  {plan.name[language]}
                </CardTitle>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400 ml-1">{plan.period[language]}</span>
                  <p className="text-xs text-slate-500 mt-1">{t("Billed monthly", "\u0641\u0648\u062a\u0631\u0629 \u0634\u0647\u0631\u064a\u0629")}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{feat[language]}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={cn(
                    "w-full",
                    plan.popular
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white border-0"
                      : "bg-white/10 hover:bg-white/20 text-white border-white/10",
                  )}
                >
                  <Link to="/login">{t("Get Started", "\u0627\u0628\u062f\u0623 \u0627\u0644\u0622\u0646")}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* LAUNCH COUNTER */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-emerald-900/30 to-green-950/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-amber-500/10 text-amber-300 border-amber-500/20 px-3 py-1">
            <Timer className="h-3.5 w-3.5 mr-1" />{t("Platform Launch", "\u0625\u0637\u0644\u0627\u0642 \u0627\u0644\u0645\u0646\u0635\u0629")}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t("Platform Launch Countdown", "\u0627\u0644\u0639\u062f \u0627\u0644\u062a\u0646\u0627\u0632\u0644\u064a \u0644\u0625\u0637\u0644\u0627\u0642 \u0627\u0644\u0645\u0646\u0635\u0629")}
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
            {t("Be among the first to experience the next generation of ERP.", "\u0643\u0646 \u0645\u0646 \u0623\u0648\u0627\u0626\u0644 \u0645\u0646 \u064a\u062e\u062a\u0628\u0631 \u0627\u0644\u062c\u064a\u0644 \u0627\u0644\u062a\u0627\u0644\u064a \u0645\u0646 ERP.")}
          </p>

          <div className="mb-10">
            <LaunchCounter targetDate={new Date("2026-09-01T00:00:00")} />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder={t("Enter your email", "\u0623\u062f\u062e\u0644 \u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 flex-1"
            />
            <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white border-0 shrink-0 gap-2">
              <Send className="h-4 w-4" />{t("Join Waitlist", "\u0627\u0646\u0636\u0645 \u0644\u0644\u0642\u0627\u0626\u0645\u0629")}
            </Button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <ScrollReveal direction="none">
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-300 border-emerald-500/20 px-3 py-1">
              <Star className="h-3.5 w-3.5 mr-1" />{t("Testimonials", "\u0627\u0644\u0634\u0647\u0627\u062f\u0627\u062a")}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t("What Our Customers Say", "\u0645\u0627\u0630\u0627 \u064a\u0642\u0648\u0644 \u0639\u0645\u0644\u0627\u0624\u0646\u0627")}
            </h2>
          </div>

          <Carousel className="max-w-4xl mx-auto">
            <CarouselContent>
              {testimonials.map((tItem, i) => (
                <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/2">
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10 h-full">
                    <CardHeader>
                      <div className="flex items-center gap-4 mb-2">
                        <Avatar className="h-12 w-12 border-2 border-emerald-500/20">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white text-sm font-bold">
                            {tItem.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-sm text-white">{tItem.name}</CardTitle>
                          <CardDescription className="text-xs text-slate-400">
                            {tItem.title} &middot; {tItem.company}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className={cn("h-3.5 w-3.5", j < tItem.rating ? "text-amber-400 fill-amber-400" : "text-slate-600")} />
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-300 leading-relaxed italic">
                        &ldquo;{tItem.text[language]}&rdquo;
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="text-white border-white/10 hidden sm:flex" />
            <CarouselNext className="text-white border-white/10 hidden sm:flex" />
          </Carousel>
        </div>
      </section>
      </ScrollReveal>
      {/* FAQ */}
      <ScrollReveal direction="none">
      <section id="faq" className="py-20 sm:py-28 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-300 border-emerald-500/20 px-3 py-1">
              <HelpCircle className="h-3.5 w-3.5 mr-1" />FAQ
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t("Frequently Asked Questions", "\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629")}</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-white/10">
                <AccordionTrigger className="text-white hover:text-emerald-300 hover:no-underline text-left">
                  {item.q[language]}
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 leading-relaxed">
                  {item.a[language]}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      </ScrollReveal>

      {/* CONTACT / SUPPORT */}
      <section id="contact" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-300 border-emerald-500/20 px-3 py-1">
              <HeadphonesIcon className="h-3.5 w-3.5 mr-1" />{t("Contact & Support", "\u0627\u062a\u0635\u0644 \u0628\u0646\u0627 \u0648\u0627\u0644\u062f\u0639\u0645")}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t("We are Here to Help", "\u0646\u062d\u0646 \u0647\u0646\u0627 \u0644\u0644\u0645\u0633\u0627\u0639\u062f\u0629")}
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              {t("Get in touch with our team for any questions or support", "\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0641\u0631\u064a\u0642\u0646\u0627 \u0644\u0623\u064a \u0623\u0633\u0626\u0644\u0629 \u0623\u0648 \u062f\u0639\u0645")}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{t("Send us a message", "\u0623\u0631\u0633\u0644 \u0644\u0646\u0627 \u0631\u0633\u0627\u0644\u0629")}</h3>
                <div className="space-y-4">
                  <Input
                    placeholder={t("Your Name", "\u0627\u0633\u0645\u0643")}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  />
                  <Input
                    type="email"
                    placeholder={t("Your Email", "\u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a")}
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  />
                  <Textarea
                    placeholder={t("Your Message", "\u0631\u0633\u0627\u0644\u062a\u0643")}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[120px]"
                  />
                <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white border-0"
                    onClick={async () => {
                      if (!contactName || !contactEmail || !contactMessage) return;
                      try {
                        await contactMutation.mutateAsync({ name: contactName, email: contactEmail, message: contactMessage });
                        alert(t("Message sent successfully!", "تم إرسال الرسالة بنجاح!"));
                        setContactName(""); setContactEmail(""); setContactMessage("");
                      } catch (e: any) {
                        alert(e.message || t("Failed to send message", "فشل إرسال الرسالة"));
                      }
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" />{t("Send Message", "أرسل الرسالة")}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { icon: MailIcon, title: { en: "Email", ar: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a" }, value: "info@yascoerp.com" },
                { icon: Phone, title: { en: "Phone", ar: "\u0627\u0644\u0647\u0627\u062a\u0641" }, value: "+966 55 123 4567" },
                { icon: MapPin, title: { en: "Address", ar: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646" }, value: "Riyadh, Saudi Arabia / Dubai, UAE / Karachi, Pakistan" },
                { icon: Clock, title: { en: "Support Hours", ar: "\u0633\u0627\u0639\u0627\u062a \u0627\u0644\u062f\u0639\u0645" }, value: "Sun-Thu, 9:00 AM - 6:00 PM (GMT+3)" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.title[language]}</p>
                    <p className="text-sm text-slate-400">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo-40.png" alt="YASCO" className="w-9 h-9 rounded-lg object-contain" />
                <div>
                  <span className="font-bold text-lg text-white">YASCO</span>
                  <span className="block text-[10px] text-blue-400/70">{t("Enterprise Operating System", "\u0646\u0638\u0627\u0645 \u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u0624\u0633\u0633\u0627\u0627\u062a")}</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                {t("The complete ERP platform for businesses worldwide. POS, Accounting, Inventory, CRM, HR, Manufacturing, and Tax Compliance.", "\u0645\u0646\u0635\u0629 ERP \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0644\u0644\u0634\u0631\u0643\u0627\u062a \u0641\u064a \u062c\u0645\u064a\u0639 \u0623\u0646\u062d\u0627\u0621 \u0627\u0644\u0639\u0627\u0644\u0645.")}
              </p>
              <div className="flex items-center gap-2">
                {[
                  { icon: Linkedin, href: "#" },
                  { icon: Twitter, href: "#" },
                  { icon: Youtube, href: "#" },
                  { icon: Github, href: "#" },
                ].map((social, i) => (
                  <a key={i} href={social.href} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {[
              {
                title: { en: "Product", ar: "\u0627\u0644\u0645\u0646\u062a\u062c" },
                links: [
                  { en: "Features", ar: "\u0627\u0644\u0645\u064a\u0632\u0627\u062a" },
                  { en: "Modules", ar: "\u0627\u0644\u0648\u062d\u062f\u0627\u062a" },
                  { en: "Pricing", ar: "\u0627\u0644\u0623\u0633\u0639\u0627\u0631" },
                  { en: "Tax Compliance", ar: "\u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644 \u0627\u0644\u0636\u0631\u064a\u0628\u064a" },
                  { en: "API", ar: "API" },
                ],
              },
              {
                title: { en: "Resources", ar: "\u0627\u0644\u0645\u0648\u0627\u0631\u062f" },
                links: [
                  { en: "Documentation", ar: "\u0627\u0644\u0648\u062b\u0627\u0626\u0642" },
                  { en: "Help Center", ar: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629" },
                  { en: "Blog", ar: "\u0627\u0644\u0645\u062f\u0648\u0646\u0629" },
                  { en: "Community", ar: "\u0627\u0644\u0645\u062c\u062a\u0645\u0639" },
                  { en: "Support", ar: "\u0627\u0644\u062f\u0639\u0645" },
                ],
              },
              {
                title: { en: "Company", ar: "\u0627\u0644\u0634\u0631\u0643\u0629" },
                links: [
                  { en: "About", ar: "\u0639\u0646 \u0627\u0644\u0634\u0631\u0643\u0629" },
                  { en: "Careers", ar: "\u0627\u0644\u0648\u0638\u0627\u0626\u0641" },
                  { en: "Contact", ar: "\u0627\u062a\u0635\u0644 \u0628\u0646\u0627" },
                  { en: "Privacy", ar: "\u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629" },
                  { en: "Terms", ar: "\u0627\u0644\u0634\u0631\u0648\u0637" },
                ],
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold text-white mb-4">{col.title[language]}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <button onClick={() => scrollTo(link.en.toLowerCase().replace(" ", "-"))} className="text-sm text-slate-400 hover:text-white transition-colors">
                        {link[language]}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              {t("\u00a9 2026 YASCO. All rights reserved.", "\u00a9 2026 \u064a\u0627\u0633\u0643\u0648. \u062c\u0645\u064a\u0639 \u0627\u0644\u062d\u0642\u0648\u0642 \u0645\u062d\u0641\u0648\u0638\u0629.")}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <Button variant="ghost" size="sm" onClick={() => setLang(language === "en" ? "ar" : "en")} className="gap-1 text-slate-400 hover:text-white">
                <Languages className="h-3.5 w-3.5" />{language === "en" ? "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" : "English"}
              </Button>
              <span>{t("Enterprise Operating System", "\u0646\u0638\u0627\u0645 \u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u0624\u0633\u0633\u0627\u062a")}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/966551234567"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-110 transition-all duration-300"
      >
        <MessageSquare className="h-6 w-6 text-white" />
      </a>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
