#!/usr/bin/env bash
set -euo pipefail

cd /home/ubuntu/erp

if pgrep -f "/usr/bin/node dist/boot.js" >/dev/null; then
  exit 0
fi

export NODE_ENV=production
export PORT=3000

nohup /usr/bin/node dist/boot.js >> /home/ubuntu/erp/server.log 2>&1 &
