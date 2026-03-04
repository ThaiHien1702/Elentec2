#!/bin/bash

TIMESTAMP=$(date +%s)
TEST_ID="import_test_${TIMESTAMP}"
BASE_URL="http://localhost:5001/api"

echo "=== CREATING TEST ADMIN USER ==="
SIGNUP_RESP=$(curl -s -X POST ${BASE_URL}/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${TEST_ID}\",\"password\":\"test123\",\"displayName\":\"Import Test User\",\"role\":\"admin\",\"position\":\"IT Admin\"}")

echo "Signup response: ${SIGNUP_RESP:0:150}"

echo ""
echo "=== LOGGING IN TO GET TOKEN ==="
LOGIN_RESP=$(curl -s -X POST ${BASE_URL}/auth/signin \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${TEST_ID}\",\"password\":\"test123\"}")

TOKEN=$(echo "$LOGIN_RESP" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
echo "Token extracted: ${#TOKEN} characters"

if [ -z "$TOKEN" ] || [ ${#TOKEN} -lt 100 ]; then
  echo "ERROR: Failed to get token"
  echo "Login response: $LOGIN_RESP"
  exit 1
fi

echo ""
echo "=== IMPORTING EXCEL FILE WITH 10 RECORDS ==="
IMPORT_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}\n" \
  -X POST ${BASE_URL}/computers/import \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "file=@sample-computers-import.xlsx")

echo "$IMPORT_RESP"

echo ""
echo "=== CHECKING TOTAL COUNT ==="
COUNT_RESP=$(curl -s -X GET "${BASE_URL}/computers/stats" \
  -H "Authorization: Bearer ${TOKEN}")

echo "Stats response: $COUNT_RESP"

echo ""
echo "=== LISTING FIRST 5 IMPORTED COMPUTERS ==="
LIST_RESP=$(curl -s -X GET "${BASE_URL}/computers?limit=5" \
  -H "Authorization: Bearer ${TOKEN}")

# Pretty print first computer
echo "$LIST_RESP" | python -m json.tool 2>/dev/null | head -n 50 || echo "$LIST_RESP" | head -c 800

echo ""
echo "=== TEST COMPLETED ==="
