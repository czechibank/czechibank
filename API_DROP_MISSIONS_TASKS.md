# 🎯 API Drop Missions - Implementation Tasks

## 📋 Overview

This document contains all tasks for implementing the API Drop Missions feature - a gamified system where users earn rewards by completing specific API calls with correct payloads, triggering rate limits, or meeting other conditions.

## 🏗️ Architecture

- **Database-driven**: Missions and rewards stored in database
- **Payload validation**: Check API call payloads against conditions
- **Rate limit testing**: Missions that test error scenarios
- **Flexible rewards**: Predefined rewards with tokens + badges
- **Middleware integration**: Automatic mission checking

---

## 📝 Phase 1: Database Schema

### Task 1.1: Create Database Models

**Files:** `prisma/schema.prisma`
**Status:** ✅ COMPLETED
**Priority:** 🔴 High

**Description:** Add new models for missions, rewards, and achievements to the Prisma schema.

**Models to add:**

- `Mission` - Core mission data with conditions
- `Reward` - Predefined rewards (tokens + badges)
- `MissionReward` - Many-to-many relationship
- `UserMissionAchievement` - Track user completions
- `UserReward` - Track awarded rewards
- Update `User` model with new relations

**Acceptance Criteria:**

- [x] All models added to schema
- [x] Proper relationships defined
- [x] Indexes for performance
- [x] Migration file created

---

### Task 1.2: Create Database Migration

**Files:** `prisma/migrations/`
**Status:** ✅ COMPLETED
**Priority:** 🔴 High

**Description:** Generate and run database migration for new models.

**Steps:**

- [x] Run `npx prisma migrate dev --name add_api_drop_missions`
- [x] Verify migration file is created
- [x] Test migration on development database
- [x] Update Prisma client

---

## 📝 Phase 2: Reward Management

### Task 2.1: Create Rewards Constants

**Files:** `src/constants/rewards.ts`
**Status:** ✅ COMPLETED
**Priority:** 🟡 Medium

**Description:** Define predefined rewards that can be assigned to missions.

**Rewards to create:**

- [x] First Transaction (50 tokens + "First Steps" badge)
- [x] Emergency Fund Creator (100 tokens + "Emergency Fund" badge)
- [x] Happy Hour Hero (0 tokens + "Happy Hour Hero" badge)
- [x] Rate Limit Tester (25 tokens + "Rate Limiter" badge)
- [x] API Master (500 tokens + "API Master" badge)
- [x] Transaction Master (200 tokens + "Transaction Master" badge)
- [x] Error Handler (75 tokens + "Error Handler" badge)
- [x] Midnight Madness (20 tokens + "Night Owl" badge)
- [x] Kind Words (0 tokens + "Friendly Financier" badge)
- [x] Christmas Spirit (0 tokens + "Christmas Spirit" badge)
- [x] Squad Goal (100 tokens + "Squad Leader" badge)
- [x] Green Pledge (25 tokens + "Eco Warrior" badge)

**Acceptance Criteria:**

- [x] All reward definitions created
- [x] Proper TypeScript types
- [x] Export for use in seeding

---

### Task 2.2: Create Reward Seeding Script

**Files:** `scripts/seed-rewards.ts`
**Status:** ✅ COMPLETED
**Priority:** 🟡 Medium

**Description:** Script to populate the database with predefined rewards.

**Steps:**

- [x] Create seeding script
- [x] Import rewards from constants
- [x] Add to package.json scripts
- [x] Test seeding process

**Acceptance Criteria:**

- [x] Script runs without errors
- [x] All rewards created in database
- [x] No duplicate rewards
- [x] Can be run multiple times safely

---

## 📝 Phase 3: Mission Condition Engine

### Task 3.1: Create Mission Validator

**Files:** `src/lib/mission-validator.ts`
**Status:** ✅ COMPLETED
**Priority:** 🔴 High

**Description:** Core logic for validating mission conditions against API payloads.

**Functions to implement:**

- [x] `validateMissionPayload()` - Main validation function
- [x] `validatePayloadFields()` - Check required fields
- [x] `validateExactValues()` - Check exact value matches
- [x] `validateRegexPatterns()` - Check regex patterns
- [x] `validateMissingFields()` - Check for missing fields
- [x] `validateRateLimit()` - Check rate limit scenarios

**Acceptance Criteria:**

- [x] All validation functions implemented
- [x] Proper error handling
- [x] TypeScript types defined
- [x] Unit tests created

---

### Task 3.2: Create Mission Types

**Files:** `src/types/mission.ts`
**Status:** ✅ COMPLETED
**Priority:** 🟡 Medium

**Description:** Define TypeScript types for mission data structures.

**Types to create:**

- [x] `Mission` interface
- [x] `MissionCondition` interface
- [x] `PayloadValidationCondition` interface
- [x] `RateLimitCondition` interface
- [x] `Reward` interface

**Acceptance Criteria:**

- [x] All types defined
- [x] Proper type safety
- [x] Exported for use across app

---

## 📝 Phase 4: Mission Service

### Task 4.1: Create Mission Repository

**Files:** `src/domain/mission-domain/mission-repository.ts`
**Status:** ✅ COMPLETED
**Priority:** 🔴 High

**Description:** Database operations for missions.

**Functions to implement:**

- [x] `getMissionsForEndpoint()` - Get missions by endpoint/method
- [x] `getMissionById()` - Get single mission
- [x] `createMission()` - Create new mission
- [x] `updateMission()` - Update existing mission
- [x] `deleteMission()` - Delete mission

**Acceptance Criteria:**

- [x] All CRUD operations implemented
- [x] Proper error handling
- [x] TypeScript types
- [x] Database queries optimized

---

### Task 4.2: Create Mission Service

**Files:** `src/domain/mission-domain/mission-service.ts`
**Status:** ✅ COMPLETED
**Priority:** 🔴 High

**Description:** Business logic for mission operations and reward distribution.

**Functions to implement:**

- [x] `getActiveMissions()` - Get all active missions
- [x] `checkMissionCompletion()` - Check if user completed mission
- [x] `awardMissionRewards()` - Award rewards to user
- [x] `getUserAchievements()` - Get user's completed missions
- [x] `getUserRewards()` - Get user's earned rewards

**Acceptance Criteria:**

- [x] All business logic implemented
- [x] Proper transaction handling
- [x] Error handling
- [x] Integration with validator

---

### Task 4.3: Create Achievement Service

**Files:** `src/domain/achievement-domain/achievement-service.ts`
**Status:** ✅ COMPLETED
**Priority:** 🟡 Medium

**Description:** Track and manage user achievements.

**Functions to implement:**

- [x] `recordAchievement()` - Record mission completion
- [x] `getUserAchievements()` - Get user achievements
- [x] `hasAchievement()` - Check if user has achievement
- [x] `getAchievementStats()` - Get achievement statistics

**Acceptance Criteria:**

- [x] Achievement tracking working
- [x] Duplicate prevention
- [x] Statistics generation
- [x] Performance optimized

---

## 📝 Phase 5: API Integration

### Task 5.1: Create Mission Middleware

**Files:** `src/lib/mission-middleware.ts`
**Status:** ✅ COMPLETED
**Priority:** 🔴 High

**Description:** Middleware to automatically check missions on API calls.

**Functions to implement:**

- [x] `checkMissions()` - Main middleware function
- [x] `extractPayload()` - Extract request payload
- [x] `extractHeaders()` - Extract request headers
- [x] `triggerMissionCheck()` - Trigger mission validation

**Acceptance Criteria:**

- [x] Middleware integrates with existing APIs
- [x] Proper payload extraction
- [x] Error handling
- [x] Performance impact minimal

---

### Task 5.2: Integrate with Transaction API

**Files:** `src/app/api/v1/transactions/create/route.ts`
**Status:** ✅ COMPLETED
**Priority:** 🔴 High

**Description:** Add mission checking to transaction creation endpoint.

**Changes:**

- [x] Import mission middleware
- [x] Add mission check after successful transaction
- [x] Handle mission completion responses
- [x] Update error handling

**Acceptance Criteria:**

- [x] Mission checking works
- [x] No impact on existing functionality
- [x] Proper error handling
- [x] Performance maintained

---

### Task 5.3: Integrate with Bank Account API

**Files:** `src/app/api/v1/bank-account/create/route.ts`
**Status:** ✅ COMPLETED
**Priority:** 🔴 High

**Description:** Add mission checking to bank account creation endpoint.

**Changes:**

- [x] Import mission middleware
- [x] Add mission check after successful creation
- [x] Handle mission completion responses
- [x] Update error handling

**Acceptance Criteria:**

- [x] Mission checking works
- [x] No impact on existing functionality
- [x] Proper error handling
- [x] Performance maintained

---

## 📝 Phase 6: API Routes

### Task 6.1: Create Missions API

**Files:** `src/app/api/v1/missions/route.ts`
**Status:** ⏳ Pending
**Priority:** 🔴 High

**Description:** API endpoints for mission management.

**Endpoints:**

- [ ] `GET /api/v1/missions` - List all missions
- [ ] `GET /api/v1/missions/active` - List active missions
- [ ] `POST /api/v1/missions` - Create mission (admin only)
- [ ] `PUT /api/v1/missions/[id]` - Update mission (admin only)
- [ ] `DELETE /api/v1/missions/[id]` - Delete mission (admin only)

**Acceptance Criteria:**

- [ ] All endpoints implemented
- [ ] Proper authentication
- [ ] Input validation
- [ ] Swagger documentation

---

### Task 6.2: Create User Missions API

**Files:** `src/app/api/v1/user/missions/route.ts`
**Status:** ⏳ Pending
**Priority:** 🟡 Medium

**Description:** API endpoints for user mission data.

**Endpoints:**

- [ ] `GET /api/v1/user/missions` - Get user's missions
- [ ] `GET /api/v1/user/achievements` - Get user's achievements
- [ ] `GET /api/v1/user/rewards` - Get user's rewards

**Acceptance Criteria:**

- [ ] All endpoints implemented
- [ ] User authentication required
- [ ] Proper data filtering
- [ ] Performance optimized

---

### Task 6.3: Create Rewards API

**Files:** `src/app/api/v1/rewards/route.ts`
**Status:** ⏳ Pending
**Priority:** 🟡 Medium

**Description:** API endpoints for reward management.

**Endpoints:**

- [ ] `GET /api/v1/rewards` - List all rewards
- [ ] `GET /api/v1/rewards/[id]` - Get specific reward
- [ ] `POST /api/v1/rewards` - Create reward (admin only)
- [ ] `PUT /api/v1/rewards/[id]` - Update reward (admin only)

**Acceptance Criteria:**

- [ ] All endpoints implemented
- [ ] Admin authentication
- [ ] Input validation
- [ ] Swagger documentation

---

## 📝 Phase 7: Sample Missions

### Task 7.1: Create Mission Constants

**Files:** `src/constants/missions.ts`
**Status:** ⏳ Pending
**Priority:** 🟡 Medium

**Description:** Define sample missions for seeding.

**Missions to create:**

- [ ] Correct Transaction Payload (222 CZT)
- [ ] Missing Required Field (no amount)
- [ ] Rate Limit Tester (hit rate limit)
- [ ] Emergency Fund Vault (regex pattern)
- [ ] First Transaction (count-based)
- [ ] Happy Hour Transfer (time-based)

**Acceptance Criteria:**

- [ ] All missions defined
- [ ] Proper condition structures
- [ ] Reward assignments
- [ ] TypeScript types

---

### Task 7.2: Create Mission Seeding Script

**Files:** `scripts/seed-missions.ts`
**Status:** ⏳ Pending
**Priority:** 🟡 Medium

**Description:** Script to populate database with sample missions.

**Steps:**

- [ ] Create seeding script
- [ ] Import missions from constants
- [ ] Link to existing rewards
- [ ] Add to package.json scripts

**Acceptance Criteria:**

- [ ] Script runs without errors
- [ ] All missions created
- [ ] Proper reward relationships
- [ ] Can be run multiple times safely

---

## 📝 Phase 8: Admin Interface

### Task 8.1: Create Mission Management Page

**Files:** `src/app/administration/missions/page.tsx`
**Status:** ⏳ Pending
**Priority:** 🟢 Low

**Description:** Admin page for managing missions.

**Features:**

- [ ] List all missions
- [ ] Create new mission
- [ ] Edit existing mission
- [ ] Delete mission
- [ ] Mission status management

**Acceptance Criteria:**

- [ ] Page loads correctly
- [ ] All CRUD operations work
- [ ] Proper error handling
- [ ] User-friendly interface

---

### Task 8.2: Create Mission Form Component

**Files:** `src/components/administration/mission-form.tsx`
**Status:** ⏳ Pending
**Priority:** 🟢 Low

**Description:** Form component for creating/editing missions.

**Fields:**

- [ ] Mission name and description
- [ ] Endpoint and method selection
- [ ] Condition type dropdown
- [ ] Condition parameters (JSON editor)
- [ ] Reward selection (multi-select)
- [ ] Status and visibility options

**Acceptance Criteria:**

- [ ] Form validation works
- [ ] JSON editor for conditions
- [ ] Reward selection working
- [ ] Proper error messages

---

### Task 8.3: Create Reward Management Page

**Files:** `src/app/administration/rewards/page.tsx`
**Status:** ⏳ Pending
**Priority:** 🟢 Low

**Description:** Admin page for managing rewards.

**Features:**

- [ ] List all rewards
- [ ] Create new reward
- [ ] Edit existing reward
- [ ] Delete reward
- [ ] Reward statistics

**Acceptance Criteria:**

- [ ] Page loads correctly
- [ ] All CRUD operations work
- [ ] Proper validation
- [ ] User-friendly interface

---

## 📝 Phase 9: User Interface

### Task 9.1: Create Missions Page

**Files:** `src/app/missions/page.tsx`
**Status:** ⏳ Pending
**Priority:** 🟢 Low

**Description:** User page for viewing available missions.

**Features:**

- [ ] List available missions
- [ ] Show mission details
- [ ] Display rewards
- [ ] Show completion status
- [ ] Mission progress indicators

**Acceptance Criteria:**

- [ ] Page loads correctly
- [ ] Mission data displayed
- [ ] Responsive design
- [ ] User-friendly interface

---

### Task 9.2: Create Mission Card Component

**Files:** `src/components/missions/mission-card.tsx`
**Status:** ⏳ Pending
**Priority:** 🟢 Low

**Description:** Component for displaying individual missions.

**Features:**

- [ ] Mission name and description
- [ ] Endpoint and method display
- [ ] Reward preview
- [ ] Completion status
- [ ] Progress indicator

**Acceptance Criteria:**

- [ ] Component renders correctly
- [ ] All data displayed
- [ ] Responsive design
- [ ] Accessible

---

### Task 9.3: Create Achievements Page

**Files:** `src/app/profile/achievements/page.tsx`
**Status:** ⏳ Pending
**Priority:** 🟢 Low

**Description:** User page for viewing achievements and rewards.

**Features:**

- [ ] List earned achievements
- [ ] Display badges
- [ ] Show SUPER_TOKENS balance
- [ ] Achievement history
- [ ] Reward details

**Acceptance Criteria:**

- [ ] Page loads correctly
- [ ] Achievement data displayed
- [ ] Badge rendering
- [ ] User-friendly interface

---

## 📝 Phase 10: Testing

### Task 10.1: Create Unit Tests

**Files:** `tests/unit/mission-validator.test.ts`
**Status:** ✅ COMPLETED
**Priority:** 🟡 Medium

**Description:** Unit tests for mission validation logic.

**Tests to create:**

- [x] Payload validation tests
- [x] Rate limit validation tests
- [x] Regex pattern tests
- [x] Error handling tests

**Acceptance Criteria:**

- [x] All tests pass
- [x] Good test coverage
- [x] Edge cases covered
- [x] Performance tests included

---

### Task 10.2: Create API Tests

**Files:** `tests/api/missions.api.test.ts`
**Status:** ⏳ Pending
**Priority:** 🟡 Medium

**Description:** API tests for mission endpoints.

**Tests to create:**

- [ ] Mission CRUD operations
- [ ] User mission endpoints
- [ ] Reward endpoints
- [ ] Authentication tests

**Acceptance Criteria:**

- [ ] All tests pass
- [ ] API contracts tested
- [ ] Error scenarios covered
- [ ] Performance tests included

---

### Task 10.3: Create E2E Tests

**Files:** `tests/e2e/mission-completion.spec.ts`
**Status:** ⏳ Pending
**Priority:** 🟢 Low

**Description:** End-to-end tests for mission completion flow.

**Tests to create:**

- [ ] Mission completion flow
- [ ] Reward distribution
- [ ] Achievement recording
- [ ] UI interactions

**Acceptance Criteria:**

- [ ] All tests pass
- [ ] Full user journey tested
- [ ] Edge cases covered
- [ ] Performance acceptable

---

## 📝 Phase 11: Documentation

### Task 11.1: Update API Documentation

**Files:** `API.md`, `src/lib/swagger.ts`
**Status:** ⏳ Pending
**Priority:** 🟡 Medium

**Description:** Update API documentation with new mission endpoints.

**Updates:**

- [ ] Add mission endpoints to API.md
- [ ] Add mission schemas to Swagger
- [ ] Update examples
- [ ] Add mission documentation

**Acceptance Criteria:**

- [ ] Documentation complete
- [ ] Examples provided
- [ ] Swagger integration
- [ ] User-friendly format

---

### Task 11.2: Create Mission Documentation

**Files:** `docs/missions.md`
**Status:** ⏳ Pending
**Priority:** 🟢 Low

**Description:** Documentation for mission system.

**Content:**

- [ ] Mission system overview
- [ ] How to create missions
- [ ] Condition types explained
- [ ] Reward system details
- [ ] Best practices

**Acceptance Criteria:**

- [ ] Documentation complete
- [ ] Clear explanations
- [ ] Examples provided
- [ ] User-friendly format

---

## 📝 Phase 12: Performance & Monitoring

### Task 12.1: Add Performance Monitoring

**Files:** `src/lib/plausible.ts`
**Status:** ⏳ Pending
**Priority:** 🟢 Low

**Description:** Add monitoring for mission system performance.

**Metrics:**

- [ ] Mission completion rates
- [ ] Reward distribution metrics
- [ ] API performance impact
- [ ] User engagement metrics

**Acceptance Criteria:**

- [ ] Metrics collected
- [ ] Dashboard available
- [ ] Alerts configured
- [ ] Performance optimized

---

### Task 12.2: Add Caching

**Files:** `src/lib/mission-cache.ts`
**Status:** ⏳ Pending
**Priority:** 🟢 Low

**Description:** Add caching for mission data to improve performance.

**Cache layers:**

- [ ] Active missions cache
- [ ] User achievements cache
- [ ] Reward data cache
- [ ] Cache invalidation

**Acceptance Criteria:**

- [ ] Caching implemented
- [ ] Performance improved
- [ ] Cache invalidation working
- [ ] Memory usage optimized

---

## 🚀 Implementation Priority

### 🔴 High Priority (MVP)

1. Database schema and migrations
2. Mission validator and service
3. API integration (middleware)
4. Basic API routes
5. Sample missions seeding

### 🟡 Medium Priority

1. Admin interface for mission management
2. User interface for viewing missions
3. Unit and API tests
4. Documentation updates

### 🟢 Low Priority

1. Advanced admin features
2. Performance optimizations
3. E2E tests
4. Monitoring and analytics

---

## 📊 Progress Tracking

### Phase 1: Database Schema

- [x] Task 1.1: Create Database Models
- [x] Task 1.2: Create Database Migration

### Phase 2: Reward Management

- [x] Task 2.1: Create Rewards Constants
- [x] Task 2.2: Create Reward Seeding Script

### Phase 3: Mission Condition Engine

- [x] Task 3.1: Create Mission Validator
- [x] Task 3.2: Create Mission Types

### Phase 4: Mission Service

- [x] Task 4.1: Create Mission Repository
- [x] Task 4.2: Create Mission Service
- [x] Task 4.3: Create Achievement Service

### Phase 5: API Integration

- [x] Task 5.1: Create Mission Middleware
- [x] Task 5.2: Integrate with Transaction API
- [x] Task 5.3: Integrate with Bank Account API

### Phase 6: API Routes

- [ ] Task 6.1: Create Missions API
- [ ] Task 6.2: Create User Missions API
- [ ] Task 6.3: Create Rewards API

### Phase 7: Sample Missions

- [ ] Task 7.1: Create Mission Constants
- [ ] Task 7.2: Create Mission Seeding Script

### Phase 8: Admin Interface

- [ ] Task 8.1: Create Mission Management Page
- [ ] Task 8.2: Create Mission Form Component
- [ ] Task 8.3: Create Reward Management Page

### Phase 9: User Interface

- [ ] Task 9.1: Create Missions Page
- [ ] Task 9.2: Create Mission Card Component
- [ ] Task 9.3: Create Achievements Page

### Phase 10: Testing

- [x] Task 10.1: Create Unit Tests
- [ ] Task 10.2: Create API Tests
- [ ] Task 10.3: Create E2E Tests

### Phase 11: Documentation

- [ ] Task 11.1: Update API Documentation
- [ ] Task 11.2: Create Mission Documentation

### Phase 12: Performance & Monitoring

- [ ] Task 12.1: Add Performance Monitoring
- [ ] Task 12.2: Add Caching

---

## 🎯 Success Criteria

### MVP Success Criteria:

- [ ] Users can complete missions by making correct API calls
- [ ] Rewards are automatically distributed
- [ ] Admin can create new missions
- [ ] Basic mission types work (payload validation, rate limit)
- [ ] Sample missions are seeded and functional

### Full Success Criteria:

- [ ] Complete admin interface for mission management
- [ ] User interface for viewing missions and achievements
- [ ] Comprehensive testing coverage
- [ ] Performance optimized
- [ ] Full documentation
- [ ] Monitoring and analytics

---

## 📝 Notes

- Start with Phase 1-5 for MVP
- Focus on core functionality first
- Add UI features after backend is solid
- Test thoroughly before moving to next phase
- Keep it simple but extensible
