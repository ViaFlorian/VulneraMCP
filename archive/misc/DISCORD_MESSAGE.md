# Discord Message Options

## Option 1: Short & Punchy
```
🔥 Found a CRITICAL IDOR on Stripchat

The `/api/front/users/{user_id}` endpoint doesn't check authorization - any authenticated user can access ANY other user's profile just by changing the ID parameter.

Impact:
• Access to usernames, countries, languages, model status, etc.
• User IDs are sequential (1, 2, 3...)
• Can enumerate ALL 230+ million users 🚨

Found it while testing authenticated endpoints - noticed I could access other users' profiles with my session cookie. Simple curl request confirms it (screenshot below).

Reported to HackerOne ✅
```

## Option 2: More Technical
```
Just submitted a CRITICAL IDOR vulnerability to Stripchat via HackerOne 🎯

**The Bug:**
`GET /api/front/users/{user_id}` - No authorization check. Any authenticated user can access any other user's profile by changing the user ID.

**How I Found It:**
1. Logged in with test account (User ID: 230247549)
2. Tested the profile endpoint with my own ID - worked ✅
3. Changed ID to another user (4281) - still worked ⚠️
4. Confirmed unauthorized access to other users' data

**Impact:**
- Privacy violation: Access to usernames, countries, languages, model status
- Complete enumeration: User IDs are sequential, can iterate through all 230M+ users
- Mass data mining possible

Proof of concept screenshot below 👇
```

## Option 3: Story Format
```
Story time: Found an IDOR on Stripchat today 🐛

Was testing authenticated endpoints and noticed something weird - I could access other users' profiles just by changing the user ID in the request. No authorization check at all.

Turns out:
• Any logged-in user can access ANY user's profile
• User IDs are sequential (1, 2, 3... up to 230M+)
• Full enumeration of the entire userbase is possible

The endpoint just trusts whatever ID you pass it. Classic IDOR.

Screenshot of the curl request below - shows unauthorized access to user 4281's data using my session cookie.

Reported to HackerOne as CRITICAL severity 🔴
```

## Option 4: Minimalist
```
IDOR on Stripchat: `/api/front/users/{user_id}` has no auth check

Any authenticated user → access any user's profile
User IDs sequential → enumerate all 230M+ users

Found during authenticated endpoint testing. Screenshot below.

Reported ✅
```

