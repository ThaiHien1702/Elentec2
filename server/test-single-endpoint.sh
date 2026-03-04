#!/bin/bash

# Test single endpoint with debug output

BASE_URL="http://localhost:5001/api"

# Create test user
TEST_ID="test_$(date +%s)"
echo "Creating test user..."
curl -s -X POST ${BASE_URL}/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${TEST_ID}\",\"password\":\"test123\",\"displayName\":\"Test\",\"role\":\"admin\",\"position\":\"Manager\"}" > /dev/null

# Login
echo "Logging in..."
LOGIN=$(curl -s -X POST ${BASE_URL}/auth/signin \
  -H "Content-Type: application/json" \
  -d "{\"idCompanny\":\"${TEST_ID}\",\"password\":\"test123\"}")

TOKEN=$(echo "$LOGIN" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
echo "Token: ${TOKEN:0:50}..."
echo ""

# Test endpoint
echo "Testing /api/positions/hierarchy:"
echo ""
curl -s -X GET "${BASE_URL}/positions/hierarchy" \
  -H "Authorization: Bearer ${TOKEN}" | python -m json.tool

echo ""
echo "Testing /api/positions/users:"
echo ""
curl -s -X GET "${BASE_URL}/positions/users" \
  -H "Authorization: Bearer ${TOKEN}" | python -m json.tool | head -n 50
