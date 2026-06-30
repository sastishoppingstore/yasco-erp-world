# 🚀 YASCO ERP - 5-MINUTE INTEGRATION GUIDE

## Step 1: Install Dependencies

```bash
npm install framer-motion three @react-three/fiber @react-three/drei recharts
npm install --save-dev @types/three
```

## Step 2: Configure Environment

Add to `.env.local`:
```env
# AI Integration
ANTHROPIC_API_KEY=your_anthropic_key_here

# Existing variables (already set)
QIWA_CLIENT_ID=...
ZATCA_API_KEY=...
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
```

## Step 3: Update tRPC Router

In `/src/server/routers/_app.ts`:

```typescript
import { aiConstructionRouter } from '@/api/aiConstructionRouter';
import { completeAuthInvoiceRouter } from '@/api/completeAuthInvoiceRouter';
import { phase2Router } from '@/api/phase2Router';
import { phase3Router } from '@/api/phase3Router';
import { constructionPaymentRouter } from '@/api/constructionPaymentRouter';
import { jobCostingRouter } from '@/api/jobCostingRouter';
import { hseSafetyRouter } from '@/api/hseSafetyRouter';
import { qiwaRouter } from '@/api/qiwaRouter';
import { zatcaConstructionRouter } from '@/api/zatcaConstructionRouter';

export const appRouter = createRouter()
  // ⭐ NEW AI Router
  .merge('ai.', aiConstructionRouter)
  
  // Auth, Invoice, Analytics
  .merge('auth.', completeAuthInvoiceRouter)
  .merge('invoice.', completeAuthInvoiceRouter)
  .merge('analytics.', completeAuthInvoiceRouter)
  
  // Phase Routers
  .merge('phase2.', phase2Router)
  .merge('phase3.', phase3Router)
  
  // Construction Routers
  .merge('payment.', constructionPaymentRouter)
  .merge('costing.', jobCostingRouter)
  .merge('hse.', hseSafetyRouter)
  .merge('qiwa.', qiwaRouter)
  .merge('zatca.', zatcaConstructionRouter)
  
  // ... existing routers
```

## Step 4: Add Routes

In your route configuration file:

```typescript
import { EnhancedDashboard3D } from '@/pages/construction/EnhancedDashboard3D';
import { AIConstructionAssistant } from '@/pages/construction/AIChatComponent';
import { LoginPage } from '@/pages/construction/CompleteComponents';
import { InvoiceGenerator } from '@/pages/construction/CompleteComponents';

const routes = [
  // ⭐ NEW Routes
  {
    path: '/dashboard-3d',
    element: <EnhancedDashboard3D />,
    protected: true,
  },
  {
    path: '/ai-assistant',
    element: <AIConstructionAssistant />,
    protected: true,
  },
  {
    path: '/ai-insights',
    element: <AIInsightsPanel />,
    protected: true,
  },
  
  // Existing routes
  {
    path: '/login',
    element: <LoginPage />,
    protected: false,
  },
  {
    path: '/invoice',
    element: <InvoiceGenerator />,
    protected: true,
  },
  // ... other routes
];
```

## Step 5: Run Database Migrations

```bash
# Connect to your database
sqlite3 your_database.db

# Run Phase 1 migration
.read db/migrations/0008_construction_phase1.sql

# Run Phase 2-3 migration
.read db/migrations/0009_phase2_phase3_complete.sql

# Verify tables
.tables

# Verify construction tables created
SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%construction%' OR name LIKE '%payment%' OR name LIKE '%costing%' OR name LIKE '%safety%' OR name LIKE '%qiwa%' OR name LIKE '%zatca%' OR name LIKE '%nitaqat%' OR name LIKE '%phase2%' OR name LIKE '%phase3%';
```

## Step 6: Build & Test

```bash
# Build project
npm run build

# Start development server
npm run dev

# Test AI endpoints
curl -X POST http://localhost:3000/api/trpc/ai.generateConstructionInsights \
  -H "Content-Type: application/json" \
  -d '{
    "metrics": {
      "budget": 48,
      "schedule": 45,
      "quality": 94.5,
      "safety": 98.2
    }
  }'

# Visit dashboard
# - Dashboard: http://localhost:3000/dashboard-3d
# - AI Chat: http://localhost:3000/ai-assistant
# - Insights: http://localhost:3000/ai-insights
```

## Step 7: Deploy to Production

```bash
# Build production bundle
npm run build

# Start production server
npm start

# Monitor logs
pm2 logs

# Or using Docker
docker build -t yasco-erp .
docker run -p 3000:3000 \
  -e ANTHROPIC_API_KEY=your_key \
  -e DATABASE_URL=your_db \
  yasco-erp
```

---

## 🎯 Key Features Now Available

✅ **3D Animated Dashboard**
- Interactive 3D cubes
- Real-time KPI metrics
- Animated charts
- Project timeline

✅ **AI Construction Assistant**
- Budget analysis & forecasting
- Schedule optimization
- Risk analysis & mitigation
- Document review
- Quality recommendations
- Saudi compliance checking

✅ **Authentication System**
- Password login
- Email OTP
- 2FA support
- Session management

✅ **Payment Certificates**
- Generate & approve certificates
- Export to PDF
- Email delivery
- Payment tracking

✅ **Job Costing**
- Budget tracking
- Cost variance alerts
- Forecasting
- Dashboards

✅ **Saudi Compliance**
- Qiwa integration
- Nitaqat tracking
- ZATCA e-invoicing
- HSE KPIs
- Municipality permits

---

## 🧪 Testing the System

### Test AI Features
```bash
# Generate insights
curl -X GET "http://localhost:3000/api/trpc/ai.generateConstructionInsights?input={\"metrics\":{\"budget\":48,\"schedule\":45,\"quality\":94.5,\"safety\":98.2}}"

# Analyze risks
curl -X GET "http://localhost:3000/api/trpc/ai.analyzeProjectRisks?input={\"projectId\":1,\"factors\":[\"Weather\",\"Materials\",\"Labor\"]}"

# Check compliance
curl -X GET "http://localhost:3000/api/trpc/ai.checkSaudiCompliance?input={\"complianceType\":\"all\"}"
```

### Test Payment Endpoints
```bash
# Generate certificate
curl -X POST http://localhost:3000/api/trpc/payment.generateCertificate \
  -H "Content-Type: application/json" \
  -d '{"projectId":1,"amount":100000,"stage":"Foundation","...": "..."}'

# List certificates
curl -X GET "http://localhost:3000/api/trpc/payment.listCertificates?input={\"projectId\":1}"
```

### Test Costing Endpoints
```bash
# Initialize project costing
curl -X POST http://localhost:3000/api/trpc/costing.initializeProjectCosting \
  -H "Content-Type: application/json" \
  -d '{"projectId":1,"totalBudget":5000000,"currency":"SAR"}'

# Get costing dashboard
curl -X GET "http://localhost:3000/api/trpc/costing.getJobCostingDashboard?input={\"projectId\":1}"
```

---

## ⚙️ Configuration Options

### AI Model Selection
```typescript
// In aiConstructionRouter.ts - Change model
const response = await client.messages.create({
  model: "claude-3-5-sonnet-20241022", // Or "claude-3-opus-20240229"
  max_tokens: 1024,
  messages: [...],
});
```

### Animation Speed
```typescript
// In EnhancedDashboard3D.tsx
<motion.div
  animate={{ width: `${project.progress}%` }}
  transition={{ duration: 1 }} // Change duration here
/>
```

### Chart Data Refresh
```typescript
// In AIChatComponent.tsx
useQuery({
  queryKey: ["aiInsights", metrics],
  queryFn: ...,
  refetchInterval: 60000, // Refresh every minute
});
```

---

## 📊 Database Schema Quick Reference

### Key Tables
- `payment_certificates` - Payment certificate records
- `certificate_approvals` - Approval workflow
- `job_costing_categories` - Cost breakdown structure
- `job_costing_details` - Actual costs
- `cost_variance_alerts` - Budget warnings
- `hse_safety_incidents` - Safety records
- `hse_kpi_metrics` - Safety metrics (TRIFR, LTIFR)
- `qiwa_integration` - Qiwa API settings
- `visa_quota_tracking` - Visa quotas
- `worker_visa_status` - Individual visa status
- `nitaqat_tracking` - Saudization percentage
- `construction_analytics` - Analytics data
- `cpm_tasks` - CPM schedule tasks
- `wip_calculation` - Work in progress

**All tables include:**
- `id` (primary key)
- `tenant_id` (multi-tenant isolation)
- `created_at` (timestamp)
- Foreign keys with constraints
- Indexes for performance

---

## 🔒 Security Checklist

- [x] All endpoints require authentication
- [x] Multi-tenant isolation on all queries
- [x] Input validation with Zod
- [x] Type-safe queries (no SQL injection)
- [x] Error messages don't leak stack traces
- [x] 2FA support for sensitive operations
- [x] RBAC framework ready
- [x] Session token management
- [x] Audit trails included
- [x] CORS configured

---

## 📞 Troubleshooting

### AI endpoints return errors
**Solution:** Check `ANTHROPIC_API_KEY` is set correctly
```bash
echo $ANTHROPIC_API_KEY  # Should show your key
```

### 3D dashboard doesn't load
**Solution:** Ensure Three.js dependencies are installed
```bash
npm list three @react-three/fiber @react-three/drei
```

### Animations are choppy
**Solution:** Reduce animation complexity or increase refresh rate
```typescript
// Reduce max tokens for faster responses
max_tokens: 512 // Instead of 1024
```

### Database migrations fail
**Solution:** Check database connection and permissions
```bash
sqlite3 your_database.db ".tables"  # List tables
sqlite3 your_database.db "PRAGMA integrity_check;"  # Check integrity
```

---

## 📈 Performance Tips

1. **Enable Query Caching**
   ```typescript
   useQuery({
     queryKey: [...],
     queryFn: ...,
     staleTime: 5 * 60 * 1000, // Cache for 5 minutes
   });
   ```

2. **Pagination for Large Lists**
   - All list endpoints support limit/offset
   - Use pagination to reduce data transfer

3. **Index Database Queries**
   - All migration files include indexes
   - Query plan: `EXPLAIN QUERY PLAN SELECT ...`

4. **Lazy Load 3D Visualization**
   ```typescript
   const Dashboard3D = lazy(() => import('./EnhancedDashboard3D'));
   ```

---

## 🎓 Learning Resources

- **Framer Motion**: https://www.framer.com/motion/
- **Three.js**: https://threejs.org/docs/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber/
- **Claude API**: https://www.anthropic.com/docs/
- **Recharts**: https://recharts.org/
- **tRPC**: https://trpc.io/

---

## ✅ Final Checklist

- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Routers integrated into tRPC
- [ ] Routes added to application
- [ ] Build succeeds without errors
- [ ] Development server starts
- [ ] Dashboard loads at /dashboard-3d
- [ ] AI chat works at /ai-assistant
- [ ] API endpoints respond correctly
- [ ] Authentication works
- [ ] Payment features functional
- [ ] Compliance checks pass
- [ ] Ready for production deployment

---

## 🚀 You're Ready!

Your YASCO ERP masterpiece is now ready to transform construction management in Saudi Arabia.

**Next Step:** Deploy to production and start managing construction projects with world-class intelligence! 🏆

