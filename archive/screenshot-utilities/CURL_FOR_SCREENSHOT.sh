#!/bin/bash
# Clean curl command for Discord screenshot
# Replace [YOUR_SESSION_COOKIE] with your actual session cookie

curl "https://stripchat.com/api/front/users/4281" \
  -H "Cookie: [YOUR_SESSION_COOKIE]" \
  -H "HackerOne: deoxyribose404" \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  -H "Accept: application/json" | jq .

