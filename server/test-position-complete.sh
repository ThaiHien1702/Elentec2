#!/bin/bash

# Complete Position Hierarchy API Test
# Tests all position endpoints with real data

BASE_URL="http://localhost:5001/api"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         POSITION HIERARCHY - COMPLETE API TEST                ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================
# STEP 1: Setup Users with Different Positions
# ============================================================

echo "STEP 1: Creating test users with different positions"
echo "=========================================================="
echo ""

ADMIN_ID="admin_test_$(date +%s)"
MGR_ID="manager_test_$(date +%s)"
ASST_ID="asst_mgr_test_$(date +%s)"
SUP_ID="supervisor_test_$(date +%s)"
STAFF1_ID="staff1_test_$(date +%s)"
STAFF2_ID="staff2_test_$(date +%s)"

# Create Admin User
echo "Creating admin user..."
curl -s -X POST ${BASE_URL}/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${ADMIN_ID}\",\"password\":\"test123\",\"displayName\":\"Admin User\",\"role\":\"admin\",\"position\":\"Manager\",\"department\":\"IT\"}" > /dev/null
echo "✓ Admin: ${ADMIN_ID}"

# Create Manager
echo "Creating manager user..."
curl -s -X POST ${BASE_URL}/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${MGR_ID}\",\"password\":\"test123\",\"displayName\":\"John Manager\",\"role\":\"user\",\"position\":\"Manager\",\"department\":\"IT\"}" > /dev/null
echo "✓ Manager: ${MGR_ID}"

# Create Assistant Manager
echo "Creating assistant manager user..."
curl -s -X POST ${BASE_URL}/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${ASST_ID}\",\"password\":\"test123\",\"displayName\":\"Jane Assistant Manager\",\"role\":\"user\",\"position\":\"Assistant Manager\",\"department\":\"Finance\"}" > /dev/null
echo "✓ Assistant Manager: ${ASST_ID}"

# Create Supervisor
echo "Creating supervisor user..."
curl -s -X POST ${BASE_URL}/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${SUP_ID}\",\"password\":\"test123\",\"displayName\":\"Bob Supervisor\",\"role\":\"user\",\"position\":\"Supervisor\",\"department\":\"HR\"}" > /dev/null
echo "✓ Supervisor: ${SUP_ID}"

# Create Staff
echo "Creating staff users..."
curl -s -X POST ${BASE_URL}/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${STAFF1_ID}\",\"password\":\"test123\",\"displayName\":\"Alice Staff\",\"role\":\"user\",\"position\":\"Staff\",\"department\":\"IT\"}" > /dev/null
echo "✓ Staff 1: ${STAFF1_ID}"

curl -s -X POST ${BASE_URL}/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${STAFF2_ID}\",\"password\":\"test123\",\"displayName\":\"Charlie Staff\",\"role\":\"user\",\"position\":\"Staff\",\"department\":\"Marketing\"}" > /dev/null
echo "✓ Staff 2: ${STAFF2_ID}"

echo ""

# ============================================================
# STEP 2: Get Admin Token
# ============================================================

echo "STEP 2: Authenticating admin user"
echo "=========================================================="
echo ""

LOGIN=$(curl -s -X POST ${BASE_URL}/auth/signin \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${ADMIN_ID}\",\"password\":\"test123\"}")

ADMIN_TOKEN=$(echo "$LOGIN" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
echo "✓ Admin token obtained (${#ADMIN_TOKEN} chars)"
echo ""

if [ -z "$ADMIN_TOKEN" ] || [ ${#ADMIN_TOKEN} -lt 100 ]; then
  echo "ERROR: Failed to get token"
  echo "Response: $LOGIN"
  exit 1
fi

# ============================================================
# STEP 3: Test Position Hierarchy Endpoint
# ============================================================

echo "STEP 3: Get Position Hierarchy"
echo "=========================================================="
echo ""

curl -s -X GET "${BASE_URL}/positions/hierarchy" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | python -m json.tool 2>/dev/null || echo "Parse error"

echo ""

# ============================================================
# STEP 4: Test Get Users by Position
# ============================================================

echo "STEP 4: Get Users by Position"
echo "=========================================================="
echo ""

echo "All users:"
curl -s -X GET "${BASE_URL}/positions/users" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | python -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'Total: {data.get(\"total\", 0)} users\n')
    for user in data.get('data', [])[:10]:
        print(f'  • {user[\"displayName\"]:25} | {user[\"position\"]:18} | {user[\"department\"]}')
except:
    pass
" 2>/dev/null

echo ""
echo "Managers only:"
curl -s -X GET "${BASE_URL}/positions/users?position=Manager" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | python -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'Total: {data.get(\"total\", 0)} managers\n')
    for user in data.get('data', []):
        print(f'  • {user[\"displayName\"]:25} | {user[\"idCompanny\"]}')
except:
    pass
" 2>/dev/null

echo ""

# ============================================================
# STEP 5: Test Get Position Statistics
# ============================================================

echo "STEP 5: Get Position Statistics"
echo "=========================================================="
echo ""

curl -s -X GET "${BASE_URL}/positions/statistics" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | python -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'Total users: {data.get(\"total\", 0)}\n')
    print('Distribution:')
    for stat in data.get('statistics', []):
        bar = '█' * stat['count']
        print(f'  {stat[\"position\"]:20} : {bar} ({stat[\"count\"]})')
except:
    pass
" 2>/dev/null

echo ""

# ============================================================
# STEP 6: Test Get My Position Info
# ============================================================

echo "STEP 6: Get Current User Position Info"
echo "=========================================================="
echo ""

curl -s -X GET "${BASE_URL}/positions/my-info" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | python -m json.tool 2>/dev/null | head -n 40

echo ""

# ============================================================
# STEP 7: Test Get Subordinates
# ============================================================

echo "STEP 7: Get Subordinates of Manager"
echo "=========================================================="
echo ""

curl -s -X GET "${BASE_URL}/positions/subordinates?position=Manager" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | python -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'Subordinates of Manager: {data.get(\"total\", 0)}\n')
    for user in data.get('data', [])[:5]:
        print(f'  • {user[\"displayName\"]:25} | {user[\"position\"]}')
except:
    pass
" 2>/dev/null

echo ""

# ============================================================
# STEP 8: Test Get Subordinates of Supervisor
# ============================================================

echo "STEP 8: Get Subordinates of Supervisor"
echo "=========================================================="
echo ""

curl -s -X GET "${BASE_URL}/positions/subordinates?position=Supervisor" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | python -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'Subordinates of Supervisor: {data.get(\"total\", 0)}\n')
    for user in data.get('data', []):
        print(f'  • {user[\"displayName\"]:25} | {user[\"position\"]}')
except:
    pass
" 2>/dev/null

echo ""

# ============================================================
# STEP 9: Manager Authorization Test
# ============================================================

echo "STEP 9: Manager-Level Operations Test"
echo "=========================================================="
echo ""

# Get Manager Token
MGR_LOGIN=$(curl -s -X POST ${BASE_URL}/auth/signin \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${MGR_ID}\",\"password\":\"test123\"}")

MGR_TOKEN=$(echo "$MGR_LOGIN" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')

echo "Manager can update other user's position:"
echo "Getting staff user ID..."

STAFF_DATA=$(curl -s -X GET "${BASE_URL}/positions/users?position=Staff" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")

STAFF_ID_OBJ=$(echo "$STAFF_DATA" | python -c "
import sys, json
data = json.load(sys.stdin)
if data.get('data'):
    print(data['data'][0]['_id'])
" 2>/dev/null)

if [ ! -z "$STAFF_ID_OBJ" ]; then
  echo "Updating staff to Supervisor position..."
  UPDATE_RESP=$(curl -s -X PUT "${BASE_URL}/positions/${STAFF_ID_OBJ}" \
    -H "Authorization: Bearer ${MGR_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"position":"Supervisor"}')
  
  echo "$UPDATE_RESP" | python -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'message' in data:
        print(f'Result: {data[\"message\"]}')
        if 'data' in data:
            print(f'New position: {data[\"data\"].get(\"position\")}')
except:
    pass
" 2>/dev/null
fi

echo ""

# ============================================================
# STEP 10: Permission Level Summary
# ============================================================

echo "STEP 10: Permission Summary"
echo "=========================================================="
echo ""

curl -s -X GET "${BASE_URL}/positions/hierarchy" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | python -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for item in data.get('hierarchy', []):
        print(f\"{item['position']} (Level {item['level']}):\")
        perms = item.get('permissions', {})
        for key, val in perms.items():
            status = '✓' if val else '✗'
            print(f'  {status} {key}')
        print()
except:
    pass
" 2>/dev/null

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ API TEST COMPLETE                       ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
