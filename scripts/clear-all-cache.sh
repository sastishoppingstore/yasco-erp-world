#!/usr/bin/env bash
set -euo pipefail

CLEAR_ALL=${1:-false}  # pass "true" to also clear npm/node_modules/.cache

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "============================================"
echo "  YASCO ERP — Full Cache Cleanup"
echo "============================================"

# ── 1. Redis Cache ──────────────────────────────────────────────────
echo ""
echo "[1/5] Redis caches..."

if command -v redis-cli &>/dev/null; then
  if redis-cli ping &>/dev/null; then
    echo "  → Flushing cache:* keys"
    redis-cli --raw keys "cache:*" | while read -r k; do
      redis-cli del "$k" >/dev/null
    done
    echo "  → Flushing session:* keys"
    redis-cli --raw keys "session:*" 2>/dev/null | while read -r k; do
      redis-cli del "$k" >/dev/null
    done
    echo "  → Flushing ratelimit:* keys"
    redis-cli --raw keys "ratelimit:*" 2>/dev/null | while read -r k; do
      redis-cli del "$k" >/dev/null
    done
    echo "  → Removing BullMQ queue data..."
    for q in email tax-compliance report export backup maintenance cleanup; do
      redis-cli --raw keys "bull:$q:*" 2>/dev/null | while read -r k; do
        redis-cli del "$k" >/dev/null
      done
    done
    echo "  ✓ Redis cache cleared"
  else
    echo "  ! Redis server not running — skipping"
  fi
else
  echo "  ! redis-cli not found — skipping Redis cache"
fi

# ── 2. Build Artifacts ─────────────────────────────────────────────
echo ""
echo "[2/5] Build artifacts..."
rm -rf "$ROOT/dist"
rm -rf "$ROOT/dist-ssr"
rm -rf "$ROOT/.vite"
rm -rf "$ROOT/node_modules/.vite"
echo "  ✓ dist/, dist-ssr/, .vite/ removed"

# ── 3. Tauri / Rust Build Cache ────────────────────────────────────
echo ""
echo "[3/5] Tauri/Rust build artifacts..."
rm -rf "$ROOT/src-tauri/target"
echo "  ✓ src-tauri/target/ removed"

# ── 4. Dependency Caches ────────────────────────────────────────────
echo ""
echo "[4/5] Dependency caches..."
if [ "$CLEAR_ALL" = "true" ]; then
  rm -rf "$ROOT/node_modules/.cache"
  echo "  ✓ node_modules/.cache/ removed"
else
  echo "  ! Skipped (pass 'true' as arg to clear npm cache)"
fi

# ── 5. Docker / Volume Caches (if applicable) ─────────────────────
echo ""
echo "[5/5] Checking Docker volumes..."
if command -v docker &>/dev/null; then
  if docker info &>/dev/null; then
    echo "  → You may run: docker volume prune -f"
    echo "  → To clear Redis data in Docker: docker-compose down -v"
  else
    echo "  ! Docker not running — skipping"
  fi
else
  echo "  ! Docker not found — skipping"
fi

echo ""
echo "============================================"
echo "  Cache cleanup complete!"
echo "============================================"
echo ""
echo "Next steps to rebuild:"
echo "  npm install        # Reinstall deps (if node_modules was cleared)"
echo "  npm run build      # Rebuild the project"
echo "  npm run start      # Start the server"
echo ""
