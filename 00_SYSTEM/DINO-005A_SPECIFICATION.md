# DINO-005A — EXERCISE & PROGRAM SYSTEM

**Change Set:** DINO-005A
**Status:** DRAFT FOR DINO APPROVAL
**Product:** Dino Hybrid Tracking
**Baseline:** DINO-004 LOCKED
**Implementation:** Not started

---

# 1. PURPOSE

DINO-005A xây dựng và chuẩn hóa hệ thống:

```text
EXERCISE LIBRARY
        ↓
EXERCISE DETAIL
        ↓
PROGRAM
        ↓
PROGRAM VERSION
        ↓
WEEK
        ↓
DAY
        ↓
EXERCISE PRESCRIPTION
        ↓
WORKOUT SESSION
        ↓
ACTUAL PERFORMANCE
        ↓
HISTORY
```

Mục tiêu là biến Exercise và Program thành nền tảng dữ liệu ổn định cho toàn bộ Dino Hybrid Tracking.

DINO-005A không phải là một redesign UI đơn thuần.

Nó phải bảo đảm:

* Exercise có identity ổn định.
* Program có cấu trúc rõ ràng.
* Prescription tách biệt Actual.
* Historical session không bị thay đổi bởi future program.
* Exercise Library có thể mở rộng.
* Program Builder có thể chỉnh sửa mà không phá history.
* DINO-005B có thể sử dụng Exercise metadata sau này.
* DINO-005C có thể đọc Program / Exercise / Performance data sau này.

---

# 2. EXISTING FOUNDATION

DINO-001 đã thiết lập foundation:

```text
PROGRAM
→ PROGRAM VERSION
→ WORKOUT PRESCRIPTION
→ EXERCISE PRESCRIPTION
→ SET PRESCRIPTION

WORKOUT SESSION
→ EXERCISE PERFORMANCE
→ ACTUAL SET

COMPLETED SESSION
=
PRESCRIPTION SNAPSHOT
+
ACTUAL PERFORMANCE
+
DERIVED SUMMARY
```

và invariant:

```text
PRESCRIPTION ≠ ACTUAL
```

Historical session phải giữ nguyên ngay cả khi program thay đổi về sau.

DINO-005A phải **mở rộng trên foundation này**, không phá hoặc thay thế nó.

---

# 3. EXISTING APPLICATION ARCHITECTURE

Ứng dụng hiện là static Vanilla JavaScript SPA.

Các module hiện có gồm:

```text
index.html
js/app.js
js/storage.js
js/data.js
js/charts.js
js/audio.js
js/timer.js
js/ai_coach.js
js/supabase_sync.js
sw.js
css/style.css
```

`app.js` là controller, `storage.js` là state engine, `data.js` cung cấp catalogs/program data và localStorage là persistence layer.

DINO-005A phải tôn trọng architecture hiện tại.

Không được tự ý chuyển framework hoặc xây lại app.

---

# 4. SCOPE

DINO-005A gồm:

### A. Exercise Identity & Metadata

### B. Exercise Library

### C. Exercise Detail

### D. Program Structure

### E. Program Builder

### F. Program Versioning

### G. Prescription Safety

### H. Custom Exercise

### I. Exercise / Program Search & Filtering

### J. Historical Safety

### K. Future Integration Hooks

---

# 5. NON-GOALS

DINO-005A KHÔNG triển khai:

* DINO-005B Prehab / Corrective Engine.
* Advanced corrective recommendation logic.
* Postural deviation compatibility engine.
* AI Coach.
* Gemini API integration.
* Gemini model migration.
* Cloud synchronization.
* GPS.
* Strava/Garmin integration.
* New analytics engine.
* New authentication system.
* New framework.
* Production cache redesign.

DINO-004 cache architecture đang LOCKED và không được thay đổi trong DINO-005A.

---

# 6. EXERCISE IDENTITY

Mỗi exercise phải có một identity ổn định:

```text
exerciseId
```

Exercise name không được sử dụng làm primary identity.

Ví dụ:

```text
exerciseId: "barbell_back_squat"
name: "Barbell Back Squat"
```

Nếu display name thay đổi:

```text
"Barbell Back Squat"
→
"Back Squat"
```

`exerciseId` vẫn phải giữ nguyên.

---

# 7. EXERCISE ENTITY

Exercise entity phải hỗ trợ tối thiểu:

```text
{
  exerciseId,
  name,
  status,
  category,
  movementPattern,
  trainingType,
  equipment,
  primaryMuscles,
  secondaryMuscles,
  instructions,
  coachingCues,
  commonErrors,
  cautions,
  version,
  createdAt,
  updatedAt
}
```

Không bắt buộc mọi field phải có dữ liệu ngay nếu source catalog hiện tại chưa cung cấp.

**Không được bịa dữ liệu để lấp field.**

Nếu chưa có:

```text
null
```

hoặc field không tồn tại là chấp nhận được.

---

# 8. EXERCISE STATUS

Exercise phải phân biệt:

```text
ACTIVE
ARCHIVED
CUSTOM
```

### ACTIVE

Được sử dụng trong prescription mới.

### ARCHIVED

Không dùng cho prescription mới nhưng vẫn phải tồn tại để history đọc được.

### CUSTOM

Exercise do người dùng tạo.

Không được hard-delete một exercise nếu historical sessions đang tham chiếu tới nó.

---

# 9. EXERCISE CATEGORY

Exercise phải hỗ trợ taxonomy có thể mở rộng.

Minimum conceptual categories:

```text
STRENGTH
CARDIO
HYBRID
PREHAB
MOBILITY
```

Nếu catalog hiện tại có taxonomy khác, AG phải giữ compatibility thay vì tự ý migrate phá dữ liệu.

---

# 10. MOVEMENT PATTERN

Exercise metadata phải có khả năng mô tả movement pattern.

Ví dụ:

```text
SQUAT
HINGE
LUNGE
PUSH
PULL
CARRY
ROTATION
LOCOMOTION
CORE
CARDIO
```

Danh sách này là extensible.

Không được hard-code hệ thống chỉ có các pattern trên.

---

# 11. TRAINING TYPE

Exercise phải có khả năng mô tả training use:

```text
STRENGTH
HYPERTROPHY
POWER
CONDITIONING
CARDIO
MOBILITY
CORRECTIVE
HYBRID
```

Một exercise có thể có nhiều training contexts nếu data model hiện tại cần.

---

# 12. EQUIPMENT

Exercise có thể lưu equipment:

```text
BARBELL
DUMBBELL
CABLE
MACHINE
BODYWEIGHT
KETTLEBELL
BAND
SLED
CARDIO_MACHINE
NONE
```

Không được giới hạn hệ thống vào danh sách cố định nếu exercise catalog cần mở rộng.

---

# 13. MUSCLE MAPPING

Exercise phải hỗ trợ:

```text
primaryMuscles[]
secondaryMuscles[]
```

Hai nhóm phải được giữ riêng.

Không được gộp thành một danh sách duy nhất.

Lý do:

* Exercise Detail.
* Muscle visualization.
* Future Prehab Engine.
* Future AI Coach.

---

# 14. EXERCISE INSTRUCTIONS

Exercise Detail có thể hiển thị:

```text
Instructions
Coaching Cues
Common Errors
Cautions
```

Chỉ hiển thị thông tin thực sự tồn tại trong source/catalog.

Không được tự động tạo “scientific facts” không có source chỉ để làm UI đầy đủ.

---

# 15. EXERCISE LIBRARY

Builder/Library phải có một Exercise Library dùng chung.

Library phải hỗ trợ:

```text
Search
Filter
Open Detail
Select Exercise
```

Search tối thiểu theo exercise name.

---

# 16. EXERCISE FILTERS

Nếu metadata có dữ liệu, Library có thể filter theo:

```text
Category
Movement Pattern
Training Type
Equipment
Primary Muscle
```

Filter không được hiển thị option mà không có data tương ứng.

---

# 17. EXERCISE DETAIL

Khi mở Exercise Detail:

```text
Exercise Name

Category
Movement Pattern
Training Type
Equipment

Primary Muscles
Secondary Muscles

Instructions
Coaching Cues
Common Errors
Cautions
```

Sau đó:

```text
Performance History
```

---

# 18. PERFORMANCE HISTORY

Exercise Detail phải có khả năng hiển thị performance thực tế của exercise.

Ví dụ:

```text
Previous Session

100 kg × 5
RIR 1
```

Dữ liệu này phải đến từ completed session.

Không được dùng prescription làm previous performance.

Nếu không có history:

```text
No performance history yet.
```

---

# 19. PROGRAM ENTITY

Program phải có identity riêng:

```text
programId
programName
description
status
currentVersionId
versions[]
```

Program không được bị đồng nhất với một workout session.

---

# 20. PROGRAM VERSION

Program phải hỗ trợ versioning.

Ví dụ:

```text
Dino Hybrid 1.0

Version 1
Version 2
Version 3
```

Khi prescription thay đổi đáng kể, hệ thống phải có cơ chế tạo version mới hoặc snapshot tương đương.

---

# 21. VERSION SAFETY

Ví dụ:

```text
Version 1
Back Squat
3 × 5
```

Athlete hoàn thành session.

Sau đó:

```text
Version 2
Back Squat
4 × 5
```

History của Version 1 vẫn phải hiển thị:

```text
3 × 5
```

Không được biến thành:

```text
4 × 5
```

---

# 22. PROGRAM HIERARCHY

Builder phải duy trì:

```text
PROGRAM
├── WEEK
│   ├── DAY
│   │   ├── EXERCISE
│   │   ├── CARDIO
│   │   └── OPTIONS
│   └── ...
└── ...
```

Builder hiện tại đã có hierarchy Program → Weeks → Days → Exercises và exercise reorder. DINO-005A phải mở rộng trên cấu trúc đó.

---

# 23. WEEK ENTITY

Week cần có identity ổn định:

```text
weekId
weekNumber
label
days[]
```

Không dùng array index làm identity duy nhất.

---

# 24. DAY ENTITY

Day cần hỗ trợ:

```text
dayId
dayNumber
dayLabel
dayName
sessionType
exercises[]
cardioPrescription
options[]
```

`sessionType` phải extensible.

Ví dụ:

```text
strength
upper
lower
push
pull
run
hybrid
circuit
recovery
off
sport
```

Danh sách không phải fixed enum cuối cùng.

---

# 25. EXERCISE PRESCRIPTION

Exercise trong Program không chỉ là reference tới Exercise Library.

Nó là prescription instance.

Conceptual:

```text
{
  prescriptionId,
  exerciseId,
  order,
  sets,
  reps,
  repRange,
  load,
  rir,
  rpe,
  tempo,
  rest,
  notes
}
```

Exercise Library trả lời:

> Đây là exercise gì?

Prescription trả lời:

> Hôm nay athlete phải thực hiện exercise đó như thế nào?

Hai tầng phải tách biệt.

---

# 26. PRESCRIPTION SNAPSHOT

Khi workout bắt đầu:

```text
PROGRAM
↓
PRESCRIPTION
↓
PRESCRIPTION SNAPSHOT
↓
ACTIVE SESSION
```

Snapshot phải được freeze.

DINO-001 đã yêu cầu session initiation capture immutable prescriptionSnapshot.

DINO-005A không được phá cơ chế này.

---

# 27. ACTUAL PERFORMANCE

Actual phải tiếp tục độc lập:

```text
actual.load
actual.reps
actual.rir
actual.rpe
actual.completed
actual.timestamp
```

Nếu user không nhập:

```text
actual = null / unrecorded
```

Không được lấy prescribed value làm actual fallback.

---

# 28. EXERCISE ORDER

Builder phải cho phép reorder:

```text
Move Up
Move Down
```

hoặc drag-and-drop tương đương.

Order phải được persist.

---

# 29. ADD EXERCISE

Builder phải cho phép:

```text
Add Exercise
```

từ Exercise Library.

Exercise được add phải tạo một prescription instance riêng.

---

# 30. REMOVE EXERCISE

Remove exercise khỏi Program:

```text
REMOVE FROM FUTURE PROGRAM
```

không được:

```text
DELETE EXERCISE ENTITY
DELETE HISTORY
```

---

# 31. EDIT PRESCRIPTION

User phải có thể edit prescription của exercise:

```text
Sets
Reps
Load
RIR
RPE
Tempo
Rest
Notes
```

Những field thực tế đang được schema hỗ trợ mới được expose.

Không được tạo UI cho field mà storage không persist được.

---

# 32. DUPLICATION

Nên hỗ trợ:

```text
Duplicate Day
Duplicate Exercise Prescription
Duplicate Week
```

Nếu feature được implement, duplicate phải tạo entity/prescription độc lập.

Ví dụ:

```text
Prescription A
↓ duplicate
Prescription B
```

Edit B không được thay đổi A.

---

# 33. CUSTOM EXERCISE

Custom Exercise phải có:

```text
unique exerciseId
status = CUSTOM
```

Custom exercise có thể:

```text
Create
Edit
Archive
Use in Program
```

Không hard-delete nếu đã xuất hiện trong history.

---

# 34. OPTIONS

DINO-004 đã xác nhận prescribed option selection và persistence hoạt động.

DINO-005A phải bảo vệ compatibility:

```text
OPTION
≠
ACTUAL PERFORMANCE
```

Option selection là prescription choice.

Không được coi việc chọn option là đã hoàn thành exercise.

---

# 35. PROGRAM CREATION

Program creation tối thiểu phải hỗ trợ:

```text
Program Name
Description
```

sau đó:

```text
Create Week
Create Day
Add Exercise
Edit Prescription
Reorder
```

Không tạo fake completed data.

---

# 36. PROGRAM LIBRARY

Nếu hệ thống có nhiều programs, user phải phân biệt được:

```text
Active
Draft
Archived
```

Program archive không được xóa completed history.

---

# 37. HISTORICAL SAFETY

Đây là acceptance requirement bắt buộc.

Test:

```text
Create Version 1
↓
Start Workout
↓
Complete Workout
↓
Create/Edit Version 2
↓
Read History
```

Expected:

```text
Historical Prescription = Version 1 snapshot
Historical Actual = Actual user performance
```

Không được thay đổi.

---

# 38. DATA MIGRATION

Nếu DINO-005A thay đổi schema:

```text
OLD DATA
↓
SAFE MIGRATION
↓
NEW DATA
```

Không được reset localStorage để “fix” schema.

Không được xóa:

* completed sessions
* cardio history
* existing programs
* custom exercises
* actual performance
* settings

---

# 39. BACKWARD COMPATIBILITY

Legacy data có thể thiếu metadata mới.

Ví dụ:

```text
movementPattern === undefined
```

không được crash app.

UI có thể:

```text
Not specified
```

hoặc ẩn field.

---

# 40. DINO-005B HOOKS

DINO-005A phải để Exercise data có thể được DINO-005B query:

```text
exerciseId
primaryMuscles
secondaryMuscles
movementPattern
trainingType
equipment
cautions
```

Có thể reserve fields cho:

```text
correctiveRole
targetDeviation
CEXStage
```

nhưng:

**KHÔNG IMPLEMENT corrective recommendation trong 005A.**

Đặc biệt không được tự tạo logic kiểu:

```text
Anterior Pelvic Tilt
→ Exercise X
```

Đó là DINO-005B.

---

# 41. DINO-005C HOOKS

DINO-005C sau này cần đọc:

```text
Exercise
Program
Program Version
Day
Prescription
Actual Performance
Performance History
```

DINO-005A phải giữ các entity này machine-readable.

Không sửa:

```text
js/ai_coach.js
Gemini API
Gemini model
API key logic
```

trong 005A.

---

# 42. FILE SCOPE

Các file có khả năng cần sửa:

```text
js/data.js
js/storage.js
js/app.js
css/style.css
```

và:

```text
00_SYSTEM/DINO_SESSION_STATE.md
```

theo governance.

Automated test có thể nằm trong:

```text
scratch/
```

Không được tự ý sửa:

```text
js/ai_coach.js
js/charts.js
js/audio.js
js/timer.js
js/supabase_sync.js
sw.js
vercel.json
manifest.json
package.json
server.js
index.html
```

trừ khi AG chứng minh dependency bắt buộc.

Nếu bắt buộc phải sửa protected file:

```text
STOP → REPORT → ASK DINO
```

---

# 43. NO CACHE CHANGES

DINO-004 đã thiết lập production cache architecture và runtime identity. Production đang sử dụng versioned assets và cache bucket mới.

DINO-005A:

**KHÔNG thay đổi Service Worker / Vercel caching architecture.**

Nếu deployment cần asset version bump, AG phải report trước thay vì tự ý mở rộng scope.

---

# 44. NO FAKE DATA

Không được dùng:

```text
Math.random()
synthetic history
fake PR
fake previous performance
fake volume
fake mileage
fake completed workout
```

để làm Exercise Library hoặc Builder trông đầy đủ.

---

# 45. UI REQUIREMENTS

Mọi interactive control phải thực sự hoạt động.

Đặc biệt:

```text
Add
Edit
Delete/Archive
Move Up
Move Down
Duplicate
Select
Save
Cancel
Search
Filter
```

Không được tạo UI button chỉ có visual state nhưng không persist action.

---

# 46. MOBILE SAFETY

Ứng dụng hiện là mobile-first SPA.

DINO-005A không được làm:

* modal vượt viewport không thể thao tác;
* button quá nhỏ;
* Builder mất context;
* input không usable trên mobile;
* thao tác CRUD gây full page reload không cần thiết.

---

# 47. ERROR HANDLING

CRUD phải có feedback cho:

```text
Success
Validation Error
Persistence Error
```

Không silently fail.

Nếu save thất bại:

```text
User must know it failed.
```

---

# 48. ACCEPTANCE CRITERIA

### AC-01

Exercise có stable ID.

### AC-02

Exercise Library search hoạt động.

### AC-03

Exercise Library filter không tạo fake data.

### AC-04

Exercise Detail mở được.

### AC-05

Exercise Detail hiển thị actual history.

### AC-06

Program hierarchy:

```text
Program → Week → Day → Exercise
```

hoạt động.

### AC-07

Exercise prescription có thể Add/Edit/Reorder/Remove.

### AC-08

Custom Exercise có unique identity.

### AC-09

Duplicate không tạo shared mutable prescription.

### AC-10

Program versioning không phá history.

### AC-11

Prescription snapshot không thay đổi sau completion.

### AC-12

Actual performance không fallback thành prescription.

### AC-13

Existing history vẫn đọc được.

### AC-14

Existing DINO-004 option behavior không bị phá.

### AC-15

DINO-005B có thể query Exercise metadata.

### AC-16

DINO-005C có thể query Program/Exercise/Performance data.

### AC-17

Không có fake analytics/history data được tạo bởi Builder.

### AC-18

Không có unauthorized file changes.

---

# 49. AUTOMATED TEST MATRIX

AG phải tạo hoặc mở rộng tests cho:

## TEST 01 — Exercise Identity

```text
Create Exercise
Rename Exercise
Verify exerciseId unchanged
```

## TEST 02 — Exercise Library Search

```text
Search existing exercise
Verify correct result
```

## TEST 03 — Exercise Metadata

```text
Open exercise
Verify metadata
```

## TEST 04 — Custom Exercise

```text
Create custom exercise
Verify unique ID
Persist
Reload
Verify exists
```

## TEST 05 — Prescription Add

```text
Add exercise to Day
Save
Reload
Verify prescription
```

## TEST 06 — Reorder

```text
A B C
→
C A B
```

Verify persistence.

## TEST 07 — Duplicate Safety

```text
Duplicate prescription
Edit duplicate
Verify original unchanged
```

## TEST 08 — Version Safety

```text
Version 1
3 × 5
↓
Complete session
↓
Version 2
4 × 5
↓
Read history
```

Expected:

```text
History = 3 × 5
```

## TEST 09 — Actual Integrity

No user input:

```text
actual.load === null
actual.reps === null
```

No fake fallback.

## TEST 10 — Option Persistence

```text
Select option
Complete session
Reload history
```

Verify selected option persists.

## TEST 11 — Legacy Data

Load old session lacking new metadata.

Expected:

```text
No crash
```

## TEST 12 — No History Pollution

Open Builder.

Create/edit program.

Verify:

```text
completed sessions unchanged
PR unchanged
mileage unchanged
```

---

# 50. MANUAL UAT

DINO AUT will test:

### UAT-01

Open Exercise Library.

### UAT-02

Search exercise.

### UAT-03

Open Exercise Detail.

### UAT-04

Review previous performance.

### UAT-05

Create custom exercise.

### UAT-06

Create/edit Program.

### UAT-07

Add Exercise.

### UAT-08

Edit prescription.

### UAT-09

Reorder exercises.

### UAT-10

Duplicate prescription/day where available.

### UAT-11

Start workout from program.

### UAT-12

Complete workout.

### UAT-13

Modify future program.

### UAT-14

Open completed history.

Expected:

```text
Historical Prescription unchanged.
Historical Actual unchanged.
```

---

# 51. REGRESSION REQUIREMENTS

DINO-005A must not regress DINO-003/004 functionality:

### Tracking

```text
Resistance actual logging
Cardio actual logging
Hybrid logging
```

### Historical Safety

```text
PRESCRIPTION ≠ ACTUAL
```

### Options

```text
Prescribed option selection
Persistence
History display
```

### Production

```text
No cache architecture regression.
```

---

# 52. AI / PREHAB BOUNDARY

DINO-005A is the foundation.

```text
                 EXERCISE LIBRARY
                        │
                        ▼
                 PROGRAM SYSTEM
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
     DINO-005B                    DINO-005C
   PREHAB ENGINE                  AI COACH
```

005B and 005C consume the foundation.

They are not implemented here.

---

# 53. DATA INTEGRITY RULES

### Rule 1

Exercise definition ≠ Exercise prescription.

### Rule 2

Exercise prescription ≠ Actual performance.

### Rule 3

Future program ≠ Historical program.

### Rule 4

Option selection ≠ Completed performance.

### Rule 5

Archive ≠ Delete history.

### Rule 6

Display name ≠ Exercise identity.

---

# 54. IMPLEMENTATION ORDER

AG should implement in this order:

```text
1. Audit existing schema
        ↓
2. Identify existing Exercise entities
        ↓
3. Identify existing Program entities
        ↓
4. Identify existing Builder functions
        ↓
5. Implement/normalize Exercise identity
        ↓
6. Implement/normalize metadata
        ↓
7. Exercise Library
        ↓
8. Exercise Detail
        ↓
9. Program structure
        ↓
10. Builder improvements
        ↓
11. Version safety
        ↓
12. Custom Exercise safety
        ↓
13. Historical regression tests
        ↓
14. UI/UAT verification
```

AG must not blindly replace existing working code.

---

# 55. MIGRATION RULE

Before changing storage:

```text
READ EXISTING DATA
```

Then determine:

```text
legacy schema
current schema
new schema
```

Migration must be additive where possible.

No:

```text
localStorage.clear()
```

as a migration strategy.

---

# 56. FAILURE RULE

If AG encounters:

* ambiguous schema,
* missing source data,
* conflict with DINO-001,
* conflict with DINO-004,
* need to modify protected files,
* need to change production cache,
* need to modify AI Coach,
* need to modify Prehab Engine,

then:

```text
STOP
→ REPORT
→ ASK DINO
```

Do not silently infer authorization.

---

# 57. IMPLEMENTATION REPORT

After implementation AG must report:

1. Baseline SHA.
2. Authorized scope.
3. Files changed.
4. Data model changes.
5. Migration changes.
6. UI changes.
7. Automated tests.
8. Regression tests.
9. Historical safety verification.
10. Fake-data audit.
11. Unauthorized change audit.
12. `git diff --check`.
13. Commit SHA.
14. Push status.
15. Deployment status.
16. Remaining limitations.

---

# 58. AI AUDIT GATE

After implementation:

```text
IMPLEMENTED
↓
AUTO VERIFIED
↓
CHATGPT AI AUDIT
↓
CORRECTIONS IF NEEDED
↓
GITHUB AUDIT
↓
DINO AUT
↓
LOCKED
```

DINO-005A is not considered complete merely because Git commit succeeds.

---

# 59. DEFINITION OF DONE

DINO-005A is DONE only when:

```text
Exercise system works
+
Program system works
+
Prescription remains separate from Actual
+
History remains immutable
+
Existing DINO-003/004 behavior passes regression
+
No fake data introduced
+
Automated tests pass
+
AI audit passes
+
DINO AUT approves
+
Change Set LOCKED
```

---

# 60. FINAL ARCHITECTURAL INTENT

The intended long-term architecture is:

```text
                  EXERCISE LIBRARY
                         │
                         ▼
                  EXERCISE DETAIL
                         │
                         ▼
                  PROGRAM SYSTEM
                         │
                         ▼
                  PROGRAM VERSION
                         │
                         ▼
                  PRESCRIPTION
                         │
                         ▼
                  WORKOUT SESSION
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
          ACTUAL                  PREHAB
       PERFORMANCE                ENGINE
              │                     │
              └──────────┬──────────┘
                         ▼
                    ATHLETE DATA
                         │
                         ▼
                      AI COACH
```

DINO-005A is therefore the **Exercise & Program foundation layer**.

It must be robust enough that DINO-005B and DINO-005C can consume it without redesigning the core data model.

---

# 61. APPROVAL STATE

This document is:

**DRAFT FOR DINO APPROVAL**

It becomes the authoritative DINO-005A specification only when DINO explicitly confirms:

```text
DINO-005A SPEC APPROVED
```

After approval, this specification must be persisted verbatim into:

```text
00_SYSTEM/DINO-005A_SPECIFICATION.md
```

before implementation begins.
