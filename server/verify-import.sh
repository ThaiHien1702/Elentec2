#!/bin/bash

# Get a fresh token for verification
TEST_ID="verify_$(date +%s)"

echo "=== Creating verification user ==="
curl -s -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${TEST_ID}\",\"password\":\"test123\",\"displayName\":\"Verify User\",\"role\":\"admin\"}" > /dev/null

LOGIN_RESP=$(curl -s -X POST http://localhost:5001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${TEST_ID}\",\"password\":\"test123\"}")

TOKEN=$(echo "$LOGIN_RESP" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')

echo "Token: ${TOKEN:0:50}..."
echo ""

echo "=== Getting all imported computers ==="
COMPUTERS=$(curl -s -X GET "http://localhost:5001/api/computers?limit=20" \
  -H "Authorization: Bearer ${TOKEN}")

echo "$COMPUTERS" | python -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'✓ Total computers found: {len(data)}')
    print('\nComputers list:')
    for i, c in enumerate(data, 1):
        print(f'{i:2}. {c.get(\"computerName\", \"N/A\"):15} | {c.get(\"userName\", \"N/A\"):20} | {c.get(\"department\", \"N/A\"):15} | {c.get(\"status\", \"N/A\")}')
except:
    print('Error parsing JSON')
    print(sys.stdin.read())
" 2>/dev/null || echo "$COMPUTERS"

echo ""
echo "=== Sample record details ==="
echo "$COMPUTERS" | python -m json.tool 2>/dev/null | head -n 80 || echo "$COMPUTERS" | head -c 1000
