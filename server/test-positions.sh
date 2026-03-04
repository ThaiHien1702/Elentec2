#!/bin/bash

# Test script for Position Hierarchy Feature
# Tests all position endpoints

BASE_URL="http://localhost:5001/api"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         POSITION HIERARCHY TESTING SCRIPT                     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Create test users with different positions
echo "=== Step 1: Creating test users with different positions ==="
echo ""

POSITIONS=("Manager" "Assistant Manager" "Supervisor" "Staff")
ADMIN_ID=""
MANAGER_ID=""
ASSISTANT_ID=""
SUPERVISOR_ID=""
STAFF_ID=""

for i in {1..5}; do
  POSITION=${POSITIONS[$((i-1))]}
  TEST_ID="pos_test_${POSITION}_$(date +%s)"
  TEST_ID_CLEAN=$(echo "$TEST_ID" | tr ' ' '_')
  
  echo "Creating user with position: $POSITION"
  SIGNUP_RESP=$(curl -s -X POST ${BASE_URL}/auth/signup \
    -H "Content-Type: application/json" \
    -d "{\"idCompanny\":\"${TEST_ID_CLEAN}\",\"password\":\"test123\",\"displayName\":\"User $POSITION\",\"role\":\"user\",\"position\":\"$POSITION\"}")
  
  echo "  Response: ${SIGNUP_RESP:0:100}"
  echo ""
  
  # Store IDs for later use
  if [ $i -eq 1 ]; then
    # First user is admin-level
    TEST_ID_CLEAN="admin_$(date +%s)"
    curl -s -X POST ${BASE_URL}/auth/signup \
      -H "Content-Type: application/json" \
      -d "{\"idCompanny\":\"${TEST_ID_CLEAN}\",\"password\":\"test123\",\"displayName\":\"Admin User\",\"role\":\"admin\",\"position\":\"Manager\"}" > /dev/null
    ADMIN_ID="$TEST_ID_CLEAN"
  elif [ $i -eq 2 ]; then
    MANAGER_ID="$TEST_ID_CLEAN"
  elif [ $i -eq 3 ]; then
    ASSISTANT_ID="$TEST_ID_CLEAN"
  elif [ $i -eq 4 ]; then
    SUPERVISOR_ID="$TEST_ID_CLEAN"
  else
    STAFF_ID="$TEST_ID_CLEAN"
  fi
done

echo "Created test users:"
echo "  Admin: $ADMIN_ID"
echo "  Manager: $MANAGER_ID"
echo "  Assistant Manager: $ASSISTANT_ID"
echo "  Supervisor: $SUPERVISOR_ID"
echo "  Staff: $STAFF_ID"
echo ""

# Step 2: Get token for admin user
echo "=== Step 2: Login as Admin User ==="
LOGIN_RESP=$(curl -s -X POST ${BASE_URL}/auth/signin \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${ADMIN_ID}\",\"password\":\"test123\"}")

ADMIN_TOKEN=$(echo "$LOGIN_RESP" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
echo "Admin token: ${ADMIN_TOKEN:0:50}..."
echo ""

# Step 3: Get position hierarchy
echo "=== Step 3: Get Position Hierarchy ==="
curl -s -X GET "${BASE_URL}/positions/hierarchy" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | python -m json.tool 2>/dev/null | head -n 30

echo ""

# Step 4: Get users by position
echo "=== Step 4: Get Users by Position ==="
curl -s -X GET "${BASE_URL}/positions/users" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | python -m json.tool 2>/dev/null | head -n 40

echo ""

# Step 5: Get position statistics
echo "=== Step 5: Get Position Statistics ==="
curl -s -X GET "${BASE_URL}/positions/statistics" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" | python -m json.tool 2>/dev/null

echo ""
echo "✅ Position Hierarchy Testing Complete!"
