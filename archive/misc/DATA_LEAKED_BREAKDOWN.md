# Data Leaked via IDOR Vulnerability

## Endpoint
`GET /api/front/users/{user_id}`

## Complete List of Exposed Data Fields

### 🔴 Identity & Personal Information
- **`username`** - User's username (e.g., "sampoass")
- **`login`** - Login identifier
- **`id`** - User ID (sequential, enables enumeration)
- **`previousUsername`** - Previous usernames (if changed)
- **`name`** - Display name
- **`birthDate`** - Birth date (null in examples, but field exists)
- **`age`** - User's age

### 🔴 Location & Geographic Data
- **`country`** - Country code (e.g., "fi", "za")
- **`region`** - Geographic region
- **`city`** - City name
- **`cityId`** - City identifier
- **`availableDisplayedCountries`** - Array of countries where user is available

### 🔴 Physical Characteristics (Sensitive for adult platform)
- **`gender`** - Gender identity
- **`genderDoc`** - Gender documentation
- **`bodyType`** - Body type (e.g., "bodyTypeAverage")
- **`ethnicity`** - Ethnicity (e.g., "ethnicityWhite")
- **`hairColor`** - Hair color (e.g., "hairColorBlack")
- **`eyeColor`** - Eye color
- **`subculture`** - Subculture identifier

### 🔴 Preferences & Interests
- **`languages`** - Array of languages spoken (e.g., ["en", "nl"])
- **`interestedIn`** - Dating/preference interest (e.g., "interestedInEverybody")
- **`interests`** - Array of user interests
- **`specifics`** - Specific preferences/tags
- **`description`** - Profile description
- **`tags`** - User tags
- **`tagGroups`** - Tag groups including:
  - `specifics`
  - `publicActivities`
  - `privateActivities`
  - `mixedTags`

### 🔴 Account Status & Privileges
- **`isModel`** - Whether user is a model (boolean)
- **`isApprovedModel`** - Model approval status
- **`isDisplayedModel`** - Display status
- **`isRegular`** - Regular user status
- **`isGold`** - Gold membership status
- **`isUltimate`** - Ultimate membership status
- **`isGreen`** - Green membership status
- **`isExGreen`** - Ex-Green status
- **`isAdmin`** - Admin status ⚠️
- **`isSupport`** - Support staff status ⚠️
- **`hasAdminBadge`** - Admin badge indicator ⚠️
- **`isStudio`** - Studio account status
- **`isStudioModerator`** - Studio moderator status
- **`isStudioAdmin`** - Studio admin status
- **`isPromo`** - Promotional account status
- **`isUnThrottled`** - Rate limit exemption status

### 🔴 Privacy & Security Settings
- **`showProfileTo`** - Profile visibility setting (e.g., "all")
- **`showTokensTo`** - Token visibility setting
- **`isProfileAvailable`** - Profile availability
- **`hasNonNudeProfileAccess`** - Access level indicator
- **`isOnline`** - Current online status
- **`isOfflinePrivateAvailable`** - Offline private availability

### 🔴 Account Security Status
- **`isBlocked`** - Block status
- **`isPermanentlyBlocked`** - Permanent block status
- **`isBanned`** - Ban status
- **`isBannedByKnight`** - Specific ban type
- **`isMuted`** - Mute status
- **`isGeoBanned`** - Geographic ban status
- **`banExpiresAt`** - Ban expiration timestamp
- **`banType`** - Type of ban
- **`banReason`** - Reason for ban
- **`blockedAt`** - Block timestamp
- **`isDeleted`** - Account deletion status

### 🔴 Social Media & External Links
- **`socialLinks`** - Object containing:
  - `twitter`
  - `instagram`
  - `snapchat`
  - `facebook`
  - `faphouse`
  - `xhamster`
  - `fancentro`
  - `xhamsterPornstar`
  - `myClub`
- **`socialLinksData`** - Additional social link data
- **`amazonWishlist`** - Amazon wishlist URL

### 🔴 Profile Media & Content
- **`avatarUrl`** - Avatar image URL
- **`avatarUrlThumb`** - Thumbnail avatar URL
- **`avatarUrlOriginal`** - Original avatar URL
- **`avatarStatus`** - Avatar approval status (e.g., "rejected")
- **`photosCount`** - Number of photos
- **`videosCount`** - Number of videos
- **`teaser`** - Teaser content

### 🔴 User Statistics & Rankings
- **`userRanking`** - Object containing:
  - `league` - User league (e.g., "grey")
  - `level` - User level
  - `isEx` - Ex status
- **`modelTopPosition`** - Model ranking:
  - `points`
  - `position`
  - `gender`
  - `continent`
- **`currPosition`** - Current position
- **`currPoints`** - Current points
- **`snapshotTimestamp`** - Last snapshot timestamp

### 🔴 Relationship & Subscription Data
- **`canAddFriends`** - Friend request capability
- **`isInFavorites`** - Favorite status
- **`isPmSubscribed`** - PM subscription status
- **`isSubscribed`** - Subscription status
- **`subscriptionModel`** - Subscription model details
- **`friendship`** - Friendship status
- **`shouldShowOtherModels`** - Model visibility preference

### 🔴 Technical & System Data
- **`hasVrDevice`** - VR device ownership
- **`offlineStatus`** - Offline status message
- **`offlineStatusUpdatedAt`** - Offline status timestamp
- **`previewReviewStatus`** - Preview review status
- **`studioBlockTime`** - Studio block time
- **`lastTagsAliases`** - Tag aliases
- **`isActive`** - Account active status
- **`domain`** - User domain

## Summary by Severity

### 🔴 CRITICAL (High Privacy Impact)
- Username/login identifiers
- Country/location data
- Gender/sexual preferences
- Model status (can identify adult workers)
- Admin/support status (security risk)
- Account security status (banned/blocked)
- Online status (real-time tracking)

### 🟠 HIGH (Privacy Impact)
- Physical characteristics
- Languages spoken
- Interests and preferences
- Social media links
- Profile statistics
- Relationship data

### 🟡 MEDIUM (Moderate Impact)
- Avatar URLs
- Content counts
- User rankings
- Subscription status

## Attack Scenarios Enabled

1. **Targeted Harassment**: Identify and track specific users by location, preferences, or model status
2. **Admin Enumeration**: Find all admin/support accounts (`isAdmin: true`, `isSupport: true`)
3. **Model Database**: Extract complete list of all models (`isModel: true`)
4. **Geographic Targeting**: Identify users by country for targeted attacks
5. **Social Engineering**: Use social media links and personal data for phishing
6. **Real-time Tracking**: Monitor `isOnline` status to track user activity
7. **Privacy Violation**: Access private profile data regardless of `showProfileTo` settings

## Data Volume
- **230+ million users** can be enumerated
- **All fields above** exposed for each user
- **Complete database extraction** possible via sequential ID iteration

