#!/bin/bash

BASE_URL="http://localhost:5001/api"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         POSITION HIERARCHY TEST                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Create admin user
ADMIN_ID="admin_position_$(date +%s)"
echo "=== Creating Admin User ==="
curl -s -X POST ${BASE_URL}/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${ADMIN_ID}\",\"password\":\"test123\",\"displayName\":\"Position Admin\",\"role\":\"admin\",\"position\":\"Manager\"}" > /dev/null

# Login to get token
echo "=== Logging in ==="
LOGIN=$(curl -s -X POST ${BASE_URL}/auth/signin \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${ADMIN_ID}\",\"password\":\"test123\"}")

TOKEN=$(echo "$LOGIN" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
echo "Token: ${TOKEN:0:50}..."
echo ""

if [ -z "$TOKEN" ] || [ ${#TOKEN} -lt 100 ]; then
  echo "ERROR: Failed to get token"
  exit 1
fi

# Test 1: Get position hierarchy
echo "=== Test 1: Get Position Hierarchy ==="
echo ""
curl -s -X GET "${BASE_URL}/positions/hierarchy" \
  -H "Authorization: Bearer ${TOKEN}" | python -m json.tool 2>/dev/null || echo "Error getting hierarchy"

echo ""
echo ""

# Test 2: Create users with different positions
echo "=== Test 2: Creating Users with Different Positions ==="
echo ""

# Manager
MGR_ID="mgr_$(date +%s)"
curl -s -X POST ${BASE_URL}/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${MGR_ID}\",\"password\":\"test123\",\"displayName\":\"John Manager\",\"position\":\"Manager\"}" > /dev/null
echo "✓ Created Manager"

# Assistant Manager
ASST_ID="asst_$(date +%s)"
curl -s -X POST ${BASE_URL}/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${ASST_ID}\",\"password\":\"test123\",\"displayName\":\"Jane Assistant\",\"position\":\"Assistant Manager\"}" > /dev/null
echo "✓ Created Assistant Manager"

# Supervisor
SUP_ID="sup_$(date +%s)"
curl -s -X POST ${BASE_URL}/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${SUP_ID}\",\"password\":\"test123\",\"displayName\":\"Bob Supervisor\",\"position\":\"Supervisor\"}" > /dev/null
echo "✓ Created Supervisor"

# Staff
STAFF_ID="staff_$(date +%s)"
curl -s -X POST ${BASE_URL}/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${STAFF_ID}\",\"password\":\"test123\",\"displayName\":\"Alice Staff\",\"position\":\"Staff\"}" > /dev/null
echo "✓ Created Staff"

echo ""
echo ""

# Test 3: Get users by position
echo "=== Test 3: Get Users (Query by Position) ==="
echo ""
curl -s -X GET "${BASE_URL}/positions/users?position=Manager" \
  -H "Authorization: Bearer ${TOKEN}" | python -m json.tool 2>/dev/null | head -n 30

echo ""
echo ""

# Test 4: Get position statistics
echo "=== Test 4: Get Position Statistics ==="
echo ""
curl -s -X GET "${BASE_URL}/positions/statistics" \
  -H "Authorization: Bearer ${TOKEN}" | python -m json.tool 2>/dev/null

echo ""
echo "✅ Position Hierarchy Tests Complete!"
