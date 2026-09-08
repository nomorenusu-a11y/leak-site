#!/bin/zsh
# Resume-safe local media analysis runner.
# Reads local originals, sends resized copies only to Ollama on this Mac,
# and records tags through the protected site endpoint.

set -u

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="$PROJECT_DIR/.local-media-analysis.log"
PAUSE_FILE="$PROJECT_DIR/.local-media-analysis.paused"

cd "$PROJECT_DIR" || exit 1
set -a
source ./.env.local
set +a

while true; do
  if [[ -f "$PAUSE_FILE" ]]; then
    print -r -- "[$(date '+%Y-%m-%d %H:%M:%S')] 사용자가 분석을 일시정지함" >> "$LOG_FILE"
    exit 0
  fi
  timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
  output="$(nice -n 10 env MEDIA_ANALYSIS_MODEL=moondream MEDIA_ANALYSIS_BATCH_SIZE=10 npx tsx scripts/analyze-local-media.ts 2>&1)"
  exit_code=$?
  print -r -- "[$timestamp] $output" >> "$LOG_FILE"

  if [[ "$output" == *"분석할 사진이 없습니다."* ]]; then
    print -r -- "[$timestamp] 모든 사진 분석 완료" >> "$LOG_FILE"
    exit 0
  fi

  if [[ $exit_code -ne 0 ]]; then
    print -r -- "[$timestamp] 일시 오류 — 60초 후 재시도" >> "$LOG_FILE"
    sleep 60
  else
    sleep 2
  fi
done
