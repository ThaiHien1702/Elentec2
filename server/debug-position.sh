#!/bin/bash
TEST_ID="debug_$(date +%s)"
curl -s -X POST http://localhost:5001/api/auth/signup -H "Content-Type: application/json" -d "{\"idCompanny\":\"${TEST_ID}\",\"password\":\"test123\",\"displayName\":\"Debug User\",\"role\":\"admin\",\"position\":\"Manager\"}" > /dev/null
LOGIN=$(curl -s -X POST http://localhost:5001/api/auth/signin -H "Content-Type: application/json" -d "{\"idCompanny\":\"${TEST_ID}\",\"password\":\"test123\"}")
TOKEN=$(echo "$LOGIN" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
echo "Token obtained: ${#TOKEN} chars"
echo ""
echo "Testing /api/positions/hierarchy:"
curl -s -X GET "http://localhost:5001/api/positions/hierarchy" -H "Authorization: Bearer ${TOKEN}"
echo ""
echo ""
echo "Testing /api/positions/statistics:"
curl -s -X GET "http://localhost:5001/api/positions/statistics" -H "Authorization: Bearer ${TOKEN}"
