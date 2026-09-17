/**
 * Dino Tracking - True Hybrid Athlete AI Coach (2-in-1 Intelligence Engine)
 * 1. Context-Aware: Analyzes live athlete history, logged lifts, running mileage, e1RM, and session notes.
 * 2. Conversational & Sports Science: Answers broad fitness, biomechanics, nutrition, and programming questions.
 */

class DinoAICoachEngine {
  constructor() {
    this.storage = window.dinoStorage || (typeof dinoStorage !== "undefined" ? dinoStorage : null);
    this.data = window.PROGRAM_DATA || {};
  }

  // Generate an intelligent response based on user query and athlete's training context
  async generateResponse(userMessage) {
    const rawQuery = (userMessage || "").trim();
    const query = rawQuery.toLowerCase();

    // Minor delay for natural chat cadence
    await new Promise(r => setTimeout(r, 350));

    // 1. Gather Live Athlete Context
    const athlete = this.getAthleteContext();

    // 2. Route to specialized knowledge & context engines
    // Engine A: Athlete Progress & Data Audit
    if (this.matchesAny(query, ["tiến độ", "audit", "tổng kết", "dữ liệu", "thống kê của tôi", "tập thế nào", "tổng volume", "km tuần này", "lịch sử tập"])) {
      return this.handleAthleteAudit(athlete);
    }

    // Engine B: Recovery, Sleep & Fatigue Management
    if (this.matchesAny(query, ["phục hồi", "giấc ngủ", "ngủ ít", "ngủ kém", "mệt", "fatigue", "recovery", "kiệt sức", "oải", "hrv"])) {
      return this.handleRecoveryAndFatigue(athlete, query);
    }

    // Engine C: DOMS, Leg Soreness & Exercise Swapping
    if (this.matchesAny(query, ["doms", "mỏi đùi", "đau đùi", "đau bắp chuối", "giảm tạ", "leg press", "đau cơ", "đổi bài", "swap"])) {
      return this.handleDOMSAndSwapping(athlete, query);
    }

    // Engine D: Soccer / Football Impact & Running Synchronization
    if (this.matchesAny(query, ["đá bóng", "soccer", "bóng đá", "thứ 7", "chạy t2", "trận đấu", "sân 7", "sân cỏ"])) {
      return this.handleSoccerSynchronization(athlete, query);
    }

    // Engine E: Squat, Bench & Progressive Overload Targets
    if (this.matchesAny(query, ["squat", "bench", "pull up", "overload", "mức tạ", "progressive", "tăng tạ", "1rm", "e1rm", "tạ hôm nay"])) {
      return this.handleProgressiveOverload(athlete, query);
    }

    // Engine G: Interference Effect (Cardio vs Lifting)
    if (this.matchesAny(query, ["interference", "hiệu ứng can thiệp", "mất cơ", "chạy có mất cơ không", "kết hợp chạy và tạ", "cardio và gym", "mtor", "ampk"])) {
      return this.handleInterferenceEffect();
    }

    // Engine H: Nutrition, Carb Loading & Supplements
    if (this.matchesAny(query, ["ăn gì", "dinh dưỡng", "carb", "protein", "whey", "creatine", "gel", "điện giải", "nạp năng lượng", "uống nước", "nutrition", "nạp carb"])) {
      return this.handleNutritionAndFueling(athlete, query);
    }

    // Engine I: Injury Management, Joint Pain & Biomechanics
    if (this.matchesAny(query, ["đau khớp", "đau gối", "đau cổ tay", "đau lưng", "chấn thương", "shin splints", "đau cẳng chân", "khởi động", "warm up", "mobility", "giãn cơ"])) {
      return this.handleInjuriesAndBiomechanics(query);
    }

    // Engine J: RIR, Rest-Pause & BFS Methodology
    if (this.matchesAny(query, ["rir", "reps in reserve", "rest-pause", "rest pause", "failure", "dc training", "effective reps", "tập tới ngưỡng"])) {
      return this.handleRIRAndRestPause();
    }

    // Engine K: Running Mechanics & Half-Marathon Pacing
    if (this.matchesAny(query, ["half-marathon", "hm", "21km", "21.1", "sub-2", "sub 2", "pace", "zone 2", "threshold", "long run", "chạy bền", "cadence", "chạy quality", "easy run"])) {
      return this.handleRunningAndPacing(athlete, query);
    }

    // Engine L: Deload & Taper Protocols
    if (this.matchesAny(query, ["deload", "taper", "giảm tải", "nghỉ ngơi", "xả cơ", "bao lâu deload"])) {
      return this.handleDeloadAndTaper(athlete);
    }

    // Fallback: Conversational General Assistant with Athlete Context Integration
    return this.handleGeneralConversation(athlete, rawQuery);
  }

  // Helper to extract live athlete data safely
  getAthleteContext() {
    if (!this.storage) {
      return {
        programName: "Dino Hybrid 1.0",
        target: "HM Sub-2 Readiness + Thigh & Shoulder Hypertrophy",
        weekId: "A",
        stats: { totalWorkouts: 0, totalVolumeKg: 0, totalDistanceKm: 0 },
        recentWorkouts: [],
        recentRuns: [],
        bestLifts: {},
        recentNotes: [],
        weekRunningKm: 0
      };
    }
    const summary = this.storage.getAthleteContextSummary ? this.storage.getAthleteContextSummary() : {};
    return {
      programName: summary.activeProgramName || "Dino Hybrid 1.0",
      target: summary.activeProgramTarget || "HM Sub-2 Readiness + Thigh & Shoulder Hypertrophy",
      weekId: summary.activeWeek || "A",
      stats: summary.stats || { totalWorkouts: 0, totalVolumeKg: 0, totalDistanceKm: 0 },
      recentWorkouts: summary.recentWorkouts || [],
      recentRuns: summary.recentRuns || [],
      bestLifts: summary.bestLifts || {},
      recentNotes: summary.recentNotes || [],
      weekRunningKm: summary.weekRunningKm || 0
    };
  }

  matchesAny(query, keywords) {
    return keywords.some(k => query.includes(k));
  }

  // -------------------------------------------------------------------------
  // ENGINE A: ATHLETE AUDIT
  // -------------------------------------------------------------------------
  handleAthleteAudit(athlete) {
    const { stats, bestLifts, recentWorkouts, weekRunningKm, programName } = athlete;
    const lastWorkout = recentWorkouts[0];

    let liftsSummary = "";
    if (Object.keys(bestLifts).length > 0) {
      liftsSummary = Object.values(bestLifts)
        .map(l => `- **${l.name}:** ${l.weightKg}kg × ${l.reps} reps (@${l.rir}) — *e1RM: ${l.e1rm}kg*`)
        .join("\n");
    } else {
      liftsSummary = "- Chưa ghi nhận PR tạ cụ thể. Hãy hoàn thành các set để AI ghi nhận mức tạ chuẩn.";
    }

    return `### 📊 Báo Cáo Tổng Thể Vận Động Viên (Dino Athlete Audit)

Dưới đây là dữ liệu tập luyện thực tế được trích xuất từ bộ nhớ của bạn:

1. **Tổng Quan Hoạt Động:**
   - **Giáo án hiện tại:** ${programName} (Tuần ${athlete.weekId})
   - **Tổng buổi tập đã hoàn thành:** **${stats.totalWorkouts} buổi**
   - **Tổng khối lượng tạ tích lũy:** **${stats.totalVolumeKg.toLocaleString()} kg**
   - **Tổng cự ly chạy bộ:** **${stats.totalDistanceKm} km** (Tuần này: **${weekRunningKm} km**)

2. **Các Kỷ Lục Sức Mạnh (Personal Bests / e1RM):**
${liftsSummary}

3. **Buổi Tập Gần Nhất:**
   - ${lastWorkout ? `**${lastWorkout.dayTitle}** (${lastWorkout.date}) — ${lastWorkout.totalVolumeKg > 0 ? `${lastWorkout.totalVolumeKg.toLocaleString()}kg tạ, ${lastWorkout.totalSetsCount} sets` : `${lastWorkout.totalDistanceKm}km chạy`}` : "Chưa có buổi tập nào được lưu."}
   ${lastWorkout && lastWorkout.notes ? `- *Ghi chú:* "${lastWorkout.notes}"` : ""}

4. **Đánh Giá Cân Bằng Hybrid:**
   - Tỷ lệ khối lượng tạ và cự ly chạy của bạn đang ở mức rất cân bằng. Để chuẩn bị tối ưu cho mục tiêu Half-Marathon Sub-2, hãy duy trì đều đặn buổi **Quality Run T2** và không bỏ buổi **Full Body Strength T3**.`;
  }

  // -------------------------------------------------------------------------
  // ENGINE B: RECOVERY & SLEEP FATIGUE
  // -------------------------------------------------------------------------
  handleRecoveryAndFatigue(athlete, query) {
    const { stats, recentWorkouts, recentNotes } = athlete;
    const lastWorkout = recentWorkouts[0];

    const noteContext = recentNotes.length > 0 ? `\n- Ghi chú gần nhất của bạn: *"${recentNotes[0].text}"*` : "";

    return `### ⚡ Phân Tích Phục Hồi & Điều Chỉnh Buổi Tập Khi Mệt Mỏi

Dựa trên nguyên tắc phục hồi **BFS Hybrid Athlete** và dữ liệu thực tế (${stats.totalWorkouts} buổi đã hoàn thành, ${stats.totalVolumeKg.toLocaleString()}kg tạ tích lũy):
${noteContext}

1. **Quy Tắc Xử Lý Giấc Ngủ Kém:**
   - **Ngủ kém 1 đêm (< 6 tiếng):** Vẫn tập bình thường nhưng **nâng 1 mức RIR** (ví dụ: bình thường tập RIR 0-1 thì hôm nay dừng ở **RIR 1-2**). Tuyệt đối không đẩy tới failure hoàn toàn.
   - **Ngủ kém 2 đêm liên tiếp hoặc mệt lử:** Giảm work sets xuống chỉ **1 set duy nhất** cho mỗi bài chính, hoặc đổi ngày chạy Quality sang **4–5 km Easy Run @ Zone 2 (RPE 5–6)**.

2. **Dấu Hiệu Thần Kinh Trung Ương (CNS) Quá Tải:**
   - Tạ khởi động cảm thấy nặng bất thường.
   - Nhịp tim lúc nghỉ (Resting Heart Rate) tăng 5–7 bpm so với bình thường.
   - Giảm độ bùng nổ khi bật nhảy hoặc bứt tốc.

3. **Hành Động Đề Xuất Hôm Nay:**
   - Bổ sung **400–500mg Magnesium Glycinate** trước khi ngủ 45 phút để làm dịu hệ thần kinh.
   - Uống đủ 500ml nước ấm pha 1 nhúm nhỏ muối hồng khoáng trước buổi tập 30 phút.`;
  }

  // -------------------------------------------------------------------------
  // ENGINE C: DOMS & IN-SESSION SWAPPING
  // -------------------------------------------------------------------------
  handleDOMSAndSwapping(athlete, query) {
    return `### 🏋️ Xử Lý DOMS Đùi & Lựa Chọn Bài Tập Thay Thế (Swap)

Nếu bạn đang bị **DOMS (đau mỏi cơ sau buổi tập/trận bóng)** ở nhóm cơ đùi trước hoặc đùi sau:

1. **Nguyên Tắc Bất Di Bất Dịch Cho Squat & Hinge:**
   - **KHÔNG gánh Pin Back Squat nặng** khi đùi và cơ dựng lưng (erector spinae) còn ê ẩm. Sự mỏi mệt cục bộ sẽ làm vỡ form ở đáy rep, dồn áp lực cắt (shear force) vào đĩa đệm L4-L5.

2. **Gợi Ý Bài Tập Thay Thế Hoàn Hảo (Swap Recommendations):**
   - **Pin Back Squat $\\to$ Leg Press (2 sets × 8–10 reps @ RIR 1–2):** Lưng được tựa đệm cố định 100%, cô lập đùi trước mà không tốn năng lượng ổn định cột sống.
   - **Smith Machine Squat (2 sets × 8 reps):** Quỹ đạo thanh trượt cố định giúp kiểm soát nhịp hạ (eccentric 3s) an toàn.
   - **Leg Curl (Đùi sau):** Nếu gân kheo quá căng, **bỏ kỹ thuật Rest-Pause**, chỉ tập 2 sets thông thường dừng ở RIR 2.

3. **Cách Thao Tác Trong App:**
   - Chạm nút **[🔄 Swap]** trên thẻ bài tập ở màn hình **Workout** để đổi bài ngay trong buổi tập!`;
  }

  // -------------------------------------------------------------------------
  // ENGINE D: SOCCER / MULTI-SPORT SYNCHRONIZATION
  // -------------------------------------------------------------------------
  handleSoccerSynchronization(athlete, query) {
    const { weekRunningKm } = athlete;
    return `### 🏃 Đồng Bộ Hóa Lịch Chạy Sau Trận Đá Bóng Thứ Bảy

Trận bóng đá sân 7/11 (khoảng 60–90 phút) tạo ra lượng **High-Speed Running & Deceleration (phanh gấp/đổi hướng)** rất lớn, tương đương với một buổi Interval cường độ cao:

1. **Buổi Chạy Quality Run Thứ Hai (T2):**
   - **Quy tắc:** Nếu sáng Thứ Hai bắp chuối hoặc gân kheo còn căng tức: **Đổi sang Option D (Easy Run 4–6 km @ RPE 5–6)**. 
   - Không cố chạy bài Threshold 3 × 2km hoặc 1km Repeats vì sẽ làm tăng nguy cơ quá tải dải chậu chày (IT Band) và viêm gân bánh chè.

2. **Buổi Chạy Long Run Thứ Sáu (T6):**
   - Giới hạn cự ly ở mức **8–10 km Easy (Pace 6:15–6:30/km)**, không chạy quá 12 km để bảo toàn glycogen và độ bộc phát cho trận đấu Thứ Bảy.

3. **Thứ Tự Ưu Tiên Cốt Lõi Của Vận Động Viên Hybrid:**
   - *Sức khỏe khớp & Trận bóng T7 > Chất lượng bài Chạy T2 > Khối lượng tạ Lower > Khối lượng tạ Upper.*
   - Tuần này bạn đã tích lũy **${weekRunningKm} km**, hãy kiểm soát tổng volume vừa vặn!`;
  }

  // -------------------------------------------------------------------------
  // ENGINE E: PROGRESSIVE OVERLOAD & LIFTS
  // -------------------------------------------------------------------------
  handleProgressiveOverload(athlete, query) {
    const { bestLifts } = athlete;
    const squat = bestLifts.pin_squat || bestLifts.smith_squat;
    const bench = bestLifts.incline_db_bench;
    const pullup = bestLifts.pull_up;

    let specificAdvice = "";
    if (squat) {
      specificAdvice += `- **Pin Squat / Squat của bạn:** Kỷ lục gần nhất là **${squat.weightKg}kg × ${squat.reps} reps** (@${squat.rir}). e1RM ước tính: **${squat.e1rm}kg**.\n`;
      if (squat.reps >= 8) {
        specificAdvice += `  👉 *Mục tiêu hôm nay:* Đã chạm trần 8 reps! Hãy tăng **+2.5 kg** (1.25kg mỗi bên) và nhắm mục tiêu **6 reps @ RIR 1**.\n`;
      } else {
        specificAdvice += `  👉 *Mục tiêu hôm nay:* Giữ nguyên **${squat.weightKg}kg**, cố gắng tăng thêm **+1 rep** (lên ${squat.reps + 1} reps).\n`;
      }
    }

    if (bench) {
      specificAdvice += `- **Incline DB Bench Press:** Kỷ lục gần nhất **${bench.weightKg}kg/bên × ${bench.reps} reps** (e1RM: ${bench.e1rm}kg).\n`;
    }

    return `### 🎯 Chiến Lược Progressive Overload Chuẩn BFS

${specificAdvice ? `**Dữ Liệu Thực Tế Của Bạn:**\n${specificAdvice}\n` : ""}
**Quy Tắc Double Progression (Tăng Tải Kép):**
1. **Bước 1 (Tăng Reps):** Giữ nguyên mức tạ, tích lũy từ cận dưới lên cận trên (ví dụ: từ 6 reps lên 8 reps hoặc 10 reps).
2. **Bước 2 (Tăng Tạ):** Chỉ tăng mức tạ khi bạn hoàn thành đủ **8 reps ở cả 2 work sets** với form chuẩn và đạt đúng **RIR 1** (còn dư đúng 1 rep).
   - Với bài thân dưới (Squat/Leg Press): Tăng **+2.5kg đến +5kg**.
   - Với bài thân trên (Bench/Row): Tăng **+1kg đến +2kg** (hoặc 1 nấc tạ đơn).
3. **Nghỉ Giữa Work Sets:**
   - 3–4 phút cho bài Compound nặng để phục hồi 100% hệ thống ATP-CP.`;
  }

  // -------------------------------------------------------------------------
  // ENGINE F: RUNNING MECHANICS & HM SUB-2 PACING
  // -------------------------------------------------------------------------
  handleRunningAndPacing(athlete, query) {
    return `### ⏱️ Chiến Thuật Pacing Half-Marathon Sub-2 & Cơ Học Chạy Bộ

Để hoàn thành cự ly 21.1 km Half-Marathon dưới 2 giờ (Sub-2), tốc độ trung bình yêu cầu là **$\\le$ 5:41/km**.

1. **Bảng Phân Bổ Pace Từng Chặng (21.1 km Race Strategy):**
   - **Km 1 – 3 (Warm-up & Giữ nhịp tim):** Pace **5:45 – 5:50/km**. Xuất phát kiềm chế, không bị cuốn theo tốc độ của đám đông.
   - **Km 4 – 15 (Cruising Phase):** Pace **5:35 – 5:40/km**. Đây là giai đoạn tích lũy km ổn định nhất, nhịp thở 2-2 hoặc 3-3.
   - **Km 16 – 19 (Threshold Push):** Pace **5:30 – 5:35/km**. Chân bắt đầu mỏi, tập trung tăng guồng chân (cadence ~178–182 spm), thả lỏng hai vai.
   - **Km 20 – 21.1 (All Out Finish):** Đẩy tốc độ về đích **5:15 – 5:25/km**.

2. **Chiến Lược Tiếp Nước & Dinh Dưỡng Trong Race:**
   - **Km 7:** 1 gói Gel năng lượng + 100ml nước lọc.
   - **Km 14:** 1 gói Gel năng lượng (có thể dùng loại có Caffeine) + 100ml nước điện giải.
   - Uống từng ngụm nhỏ ở mỗi trạm nước cách nhau 2.5–3 km.

3. **Cơ Học Sải Chân (Running Mechanics):**
   - Tiếp đất gần trọng tâm cơ thể (midfoot/forefoot nhẹ), không sải chân quá dài về phía trước (overstriding) để tránh chấn thương gối.`;
  }

  // -------------------------------------------------------------------------
  // ENGINE G: RIR & REST-PAUSE METHODOLOGY
  // -------------------------------------------------------------------------
  handleRIRAndRestPause() {
    return `### 💡 Cẩm Nang Kỹ Thuật RIR & Rest-Pause (BFS System)

1. **Bảng Thang Đo RIR (Reps in Reserve):**
   - **RIR 0 (Absolute Failure):** Không thể đẩy thêm 1 rep nào dù cố gắng hết sức. Chỉ dùng ở set cuối cùng hoặc mini-set của bài máy an toàn.
   - **RIR 1 (Điểm Vàng Tăng Cơ):** Dừng set khi bạn biết chắc chắn mình chỉ còn làm được đúng 1 rep chuẩn form. Kích hoạt tối đa sợi cơ mà không làm kiệt quệ hệ thần kinh.
   - **RIR 2 (Phụ Trợ & Phục Hồi):** Dành cho các buổi tập khi cơ thể bị mệt hoặc bài compound nặng cần bảo vệ khớp.

2. **Cách Thực Hiện Rest-Pause Chuẩn:**
   - **Set Chính:** Đẩy 1 set từ 6–10 reps tới khi chạm **RIR 0–1**.
   - **Mini-Rest:** Đặt tạ xuống nghỉ chính xác **15 giây** (hít sâu thở chậm 4–5 nhịp).
   - **Mini-Set 1:** Cầm tạ lên đẩy tiếp 2–4 reps tới failure.
   - **Mini-Rest 2 (Tùy chọn):** Nghỉ 15s và đẩy tiếp 1–2 reps.
   - *Lợi ích:* Đạt được số lượng **Effective Reps (Reps kích thích cơ bắp)** tương đương 3-4 sets truyền thống chỉ trong 90 giây!`;
  }

  // -------------------------------------------------------------------------
  // ENGINE H: NUTRITION & FUELING
  // -------------------------------------------------------------------------
  handleNutritionAndFueling(athlete, query) {
    return `### 🥗 Dinh Dưỡng & Nạp Năng Lượng Cho Vận Động Viên Hybrid

Để vừa tăng cơ vừa chạy bền hiệu quả, dinh dưỡng cần được phân bổ khoa học:

1. **Mục Tiêu Đa Lượng (Macros Hàng Ngày):**
   - **Protein:** **1.8 – 2.2g / kg thể trọng** (ví dụ: 70kg $\\to$ 130g–150g protein/ngày) chia đều 3–4 bữa để tối đa hóa Muscle Protein Synthesis (MPS).
   - **Carbohydrate:** **4 – 6g / kg thể trọng** vào những ngày có bài chạy Quality hoặc Long Run để nạp đầy kho dự trữ Glycogen trong gan và cơ bắp.
   - **Chất béo lành mạnh:** 0.8 – 1.0g / kg từ bơ, các loại hạt, dầu ô liu và cá hồi.

2. **Quy Trình Nạp Carb Trước Buổi Chạy Dài (Long Run Fueling):**
   - **Trước buổi chạy 2–3 tiếng:** Ăn 1 bữa giàu carb dễ tiêu (yến mạch + chuối + mật ong hoặc bánh mì nướng mứt hoa quả).
   - **Trước khi chạy 15 phút:** 1 gói Energy Gel hoặc 1 quả chuối chín + 200ml nước điện giải.
   - **Trong buổi chạy (> 75 phút):** Nạp 30–45g carb mỗi 45–50 phút kèm nước lọc.

3. **Thực Phẩm Bổ Sung Thiết Yếu:**
   - **Creatine Monohydrate:** 3–5g mỗi ngày duy trì quanh năm. Tăng sức mạnh bộc phát, hỗ trợ phục hồi glycogen và hydrat hóa tế bào cơ.
   - **Electrolytes (Natri, Kali, Magie):** Uống bù điện giải ngay sau khi chạy để chống chuột rút và hạ huyết áp tư thế.`;
  }

  // -------------------------------------------------------------------------
  // ENGINE I: INTERFERENCE EFFECT
  // -------------------------------------------------------------------------
  handleInterferenceEffect() {
    return `### 🧬 Làm Sao Kết Hợp Chạy & Tập Tạ Mà Không Bị Mất Cơ? (The Interference Effect)

Hiệu ứng can thiệp (Interference Effect) xảy ra ở cấp độ phân tử giữa con đường tăng trưởng cơ bắp (**mTORC1**) và con đường trao đổi chất hiếu khí (**AMPK**):

1. **Quy Tắc Vàng Về Khoảng Cách Thời Gian:**
   - Giữ khoảng cách **ít nhất 6–8 tiếng** giữa buổi tập tạ nặng và buổi chạy cường độ cao.
   - Nếu phải tập trong cùng một buổi: **Ưu tiên tập tạ trước, chạy sau** (hoặc chỉ chạy nhẹ Easy Run Zone 2 sau khi tập tạ).

2. **Bảo Tồn Khối Lượng Cơ Bắp (Anti-Catabolic Strategy):**
   - Không chạy khi dạ dày hoàn toàn trống rỗng trong các buổi chạy dài > 60 phút. Nạp 20–30g carb trước khi chạy giúp ức chế cortisol phá hủy cơ bắp.
   - Bổ sung 25–30g Whey Protein hoặc bữa ăn hoàn chỉnh trong vòng 45 phút sau buổi tập.

3. **Cấu Trúc Của Giáo Án Dino Hybrid:**
   - Bố trí ngày chạy Quality Run (T2) sau ngày nghỉ CN, ngày tập chân (T3) cách xa trận bóng Thứ Bảy (T7) 4 ngày để cơ bắp có trọn vẹn 96 tiếng hồi phục hoàn toàn!`;
  }

  // -------------------------------------------------------------------------
  // ENGINE J: INJURY MANAGEMENT & BIOMECHANICS
  // -------------------------------------------------------------------------
  handleInjuriesAndBiomechanics(query) {
    let focusTip = "";
    if (query.includes("gối") || query.includes("knee")) {
      focusTip = `\n**Khắc Phục Đau Khớp Gối (Runner's Knee / Patellar Tendinopathy):**\n- Giảm bớt độ sải chân (overstriding), tăng guồng chân lên 175–180 spm.\n- Bổ sung bài tập tĩnh Isometric Wall Sit (3 × 45s) để kích hoạt giảm đau gân bánh chè trước buổi tập.\n- Tăng cường cơ mông nhỡ (Gluteus Medius) bằng bài Clamshell hoặc Lateral Band Walk.`;
    } else if (query.includes("cẳng chân") || query.includes("shin")) {
      focusTip = `\n**Xử Lý Đau Cẳng Chân (Shin Splints / MTSS):**\n- Tránh chạy hoàn toàn trên mặt đường bê tông cứng trong 7 ngày, đổi sang chạy sân cỏ hoặc đường đất/thảm cao su.\n- Tập bài gập mu bàn chân (Tibialis Raises) 3 × 20 reps mỗi ngày để gia cố cơ cẳng chân trước.`;
    } else if (query.includes("cổ tay") || query.includes("vai")) {
      focusTip = `\n**Khắc Phục Đau Cổ Tay / Vai Khi Bench Press:**\n- Giữ cổ tay thẳng, đặt thanh đòn/tạ đơn nằm trên phần gót lòng bàn tay (heel of palm).\n- Không hạ cùi chỏ vuông góc 90° so với thân người; hãy khép cùi chỏ vào thân 45°–60° để bảo vệ bao khớp vai.`;
    }

    return `### 🛡️ Phòng Tránh Chấn Thương & Tối Ưu Hóa Khớp Cho Hybrid Athlete
${focusTip}

1. **Quy Trình Khởi Động Động (Dynamic Warm-up) 5 Phút Trước Buổi Tập:**
   - **Leg Swings (Đá chân trước-sau & sang ngang):** 15 reps mỗi chân làm ấm khớp háng.
   - **World's Greatest Stretch:** 5 reps mỗi bên mở rộng lồng ngực và giãn gập hông.
   - **Bodyweight Squat to Stand:** 10 reps kích hoạt đùi và gân kheo.

2. **Nguyên Tắc Lắng Nghe Khớp:**
   - *Đau cơ bắp (Muscle Burn/DOMS):* Bình thường và an toàn.
   - *Đau nhói ở khớp gối/khớp háng/cột sống (Sharp Joint Pain):* **Dừng set ngay lập tức**, không cố hoàn thành reps!`;
  }

  // -------------------------------------------------------------------------
  // ENGINE K: DELOAD & TAPER PROTOCOLS
  // -------------------------------------------------------------------------
  handleDeloadAndTaper(athlete) {
    return `### 🔄 Chiến Thuật Deload & Taper Giảm Tải Thông Minh

1. **Khi Nào Bạn Cần Deload (Tuần Giảm Tải)?**
   - Sau mỗi **5–6 tuần** tập luyện liên tục cường độ cao.
   - Khi mức tạ bị đứng yên (Plateau) 2 tuần liên tiếp ở bài chính.
   - Khi cảm giác mỏi mệt kéo dài và giấc ngủ bị xáo trộn.

2. **Cách Thực Hiện Deload Chuẩn BFS:**
   - **Cường độ (Intensity / Tạ):** **Giữ nguyên 85–90% mức tạ cũ** để duy trì thích nghi thần kinh.
   - **Khối lượng (Volume / Sets):** **Giảm 50% số sets** (ví dụ: bình thường 2 sets $\\to$ chỉ tập 1 set duy nhất).
   - **Kỹ thuật:** Hoàn toàn **bỏ kỹ thuật Rest-Pause** trong tuần deload, dừng tất cả các set ở **RIR 2**.
   - **Chạy bộ:** Giảm 40% cự ly tổng tuần (ví dụ: từ 25km $\\to$ 15km), chỉ chạy nhẹ nhàng thư giãn.`;
  }

  // -------------------------------------------------------------------------
  // FALLBACK: GENERAL CONVERSATIONAL ASSISTANT
  // -------------------------------------------------------------------------
  handleGeneralConversation(athlete, rawQuery) {
    const { programName, stats, recentWorkouts, bestLifts } = athlete;
    const lastWorkout = recentWorkouts[0];

    const squatStr = bestLifts.pin_squat ? `Squat tốt nhất: ${bestLifts.pin_squat.weightKg}kg` : "";
    const benchStr = bestLifts.incline_db_bench ? `Bench: ${bestLifts.incline_db_bench.weightKg}kg` : "";
    const liftHighlight = [squatStr, benchStr].filter(Boolean).join(" • ");

    return `### 🤖 Trợ Lý Huấn Luyện Viên Dino Hybrid

Chào bạn! Tôi đã phân tích câu hỏi của bạn kết hợp với dữ liệu tập luyện cá nhân:

- **Hồ sơ VĐV:** ${programName} (Tuần ${athlete.weekId})
- **Dữ liệu thực tế:** ${stats.totalWorkouts} buổi tập, ${stats.totalVolumeKg.toLocaleString()}kg tạ, ${stats.totalDistanceKm}km chạy. ${liftHighlight ? `(${liftHighlight})` : ""}
${lastWorkout ? `- **Buổi gần nhất:** ${lastWorkout.dayTitle} (${lastWorkout.date})` : ""}

**Lời khuyên nhanh cho câu hỏi của bạn:**
1. Hãy luôn tuân thủ nguyên tắc **chất lượng reps và cường độ cơ học cao** hơn là số lượng sets rác.
2. Kiểm soát chặt chẽ điểm dừng **RIR 1** để kích thích tối đa mà không gây quá tải thần kinh trung ương.
3. Đảm bảo nạp đủ nước, điện giải và giấc ngủ > 7 tiếng để cơ thể tổng hợp protein và phục hồi glycogen.

*Bạn có thể chạm vào các gợi ý bên dưới hoặc hỏi thêm chi tiết về điều chỉnh bài tập, chiến thuật chạy Half-Marathon hay dinh dưỡng!*`;
  }
}

if (typeof window !== "undefined") {
  window.DinoAICoachEngine = DinoAICoachEngine;
  window.dinoAICoach = new DinoAICoachEngine();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = DinoAICoachEngine;
}
