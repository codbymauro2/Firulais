#!/bin/bash
# Usage: bash scripts/fetch-stitch.sh "<url>" "<output_path>"
URL="$1"
OUTPUT="$2"

if [ -z "$URL" ] || [ -z "$OUTPUT" ]; then
  echo "Usage: $0 <url> <output_path>"
  exit 1
fi

curl -L --retry 3 --retry-delay 2 \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  -o "$OUTPUT" "$URL"

echo "Saved to $OUTPUT"
