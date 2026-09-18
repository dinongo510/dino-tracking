/**
 * Dino Tracking - True AI Coach & Sports Science Copilot
 * Features:
 * 1. Direct integration with Google Gemini REST API using exact model "gemini-2.5-flash".
 * 2. Deep Context Injection (Active Program, Workout Logs, Volume, Km, Prehab Deviations, Muscle Strain).
 * 3. Robust Error Handling: Detailed console logs and distinct user-facing UI toasts for API key vs network errors.
 * 4. Graceful Offline Sports Science Rule Fallback when API key is not yet set.
 */

class DinoAICoachEngine {
  constructor() {
    this.storage = window.dinoStorage || (typeof dinoStorage !== "undefined" ? dinoStorage : null);
  }

  async generateResponse(userMessage) {
    const rawQuery = (userMessage || "").trim();
    if (!rawQuery) return "Xin chào! Bạn có câu hỏi gì về giáo án, bài tập hay phục hồi không?";

    const apiKey = this.storage ? this.storage.getGeminiApiKey() : "";
    const athlete = this.getAthleteContext();

    // 1. If User has entered a Google Gemini API Key, call the Real Google Gemini API!
    if (apiKey) {
      try {
        const geminiResult = await this.callGeminiAPI(apiKey, rawQuery, athlete);
        if (geminiResult) return geminiResult;
      } catch (err) {
        console.error("Gemini API Error:", err);
        
        // Notify UI with a clear Toast explaining the exact failure reason
        if (window.dinoApp && typeof window.dinoApp.showToast === "function") {
          window.dinoApp.showToast(`⚠️ Lỗi Gemini API: ${err.message}`);
        }

        // Fallback to local heuristic engine on API error with error notice
        const localAns = this.generateLocalFallbackResponse(rawQuery, athlete);
        return `> ⚠️ **Lỗi kết nối Gemini API:** ${err.message}\n> *Đang tự động chuyển sang Chế độ Huấn luyện viên thể thao Offline:*\n\n${localAns}`;
      }
    }

    // 2. Offline / No API Key Mode: Smart Local Sports Science Knowledge Engine
    const localResponse = this.generateLocalFallbackResponse(rawQuery, athlete);
    return `${localResponse}\n\n---\n*💡 **Mẹo:** Bạn có thể nhập **Google Gemini API Key** trong Cài đặt (⚙️) để kích hoạt mô hình AI thế hệ mới nhất phân tích chuyên sâu.*`;
  }

  // Real Google Gemini API Call strictly targeting "gemini-2.5-flash"
  async callGeminiAPI(apiKey, userQuery, athlete) {
    const systemPrompt = `Bạn là Dino AI Coach — Huấn luyện viên Thể thao & Khoa học Vận động cao cấp cho Vận động viên Hybrid (Hybrid Athlete: tập gym tăng cơ, cử tạ sức mạnh, chạy bền Zone 2/Threshold/Half-Marathon và Hyrox/CrossFit).

DƯỚI ĐÂY LÀ DỮ LIỆU TẬP LUYỆN THỰC TẾ CỦA VẬN ĐỘNG VIÊN:
- Giáo án hiện tại: ${athlete.programName}
- Triết lý giáo án: ${athlete.philosophy}
- Tuần hiện tại: ${athlete.activeWeek}, Buổi: ${athlete.activeDay}
- Thống kê tổng: ${athlete.stats.totalWorkouts} buổi tập, ${athlete.stats.totalVolumeKg.toLocaleString()} kg tải tạ, ${athlete.stats.totalDistanceKm} km chạy bộ, ${athlete.stats.totalSets} sets.
- 7 buổi tập gần nhất:
${JSON.stringify(athlete.recentWorkouts, null, 2)}

NGUYÊN TẮC TRẢ LỜI CỦA BẠN:
1. Trả lời bằng tiếng Việt chuyên nghiệp, sắc bén, mang tính khoa học thể thao (dẫn chứng RIR, RPE, Progressive Overload, BFS periodization, NASM Corrective Exercise, năng lượng Glycogen, HRV, Recovery).
2. Luôn liên hệ trực tiếp với dữ liệu buổi tập, mức tạ và km chạy thực tế của VĐV để đưa ra lời khuyên cá nhân hóa, không trả lời chung chung sáo rỗng.
3. Trình bày rõ ràng với Markdown: dùng in đậm, gạch đầu dòng, bảng biểu hoặc checklist khi phù hợp.`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${systemPrompt}\n\nCÂU HỎI CỦA VẬN ĐỘNG VIÊN: "${userQuery}"` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1200
      }
    };

    console.log(`[Gemini API] Đang gửi yêu cầu tới: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || `HTTP ${response.status} (${response.statusText})`;
      const errStatus = response.status;
      
      console.error(`[Gemini API] Lỗi từ máy chủ Google: Status ${errStatus} - ${errMsg}`, errData);

      if (errStatus === 400 && (errMsg.includes("API key not valid") || errMsg.includes("API_KEY_INVALID"))) {
        throw new Error(`API Key không hợp lệ hoặc đã hết hạn (${errMsg})`);
      }
      if (errStatus === 403) {
        throw new Error(`API Key bị từ chối quyền truy cập (403 Forbidden - ${errMsg})`);
      }
      if (errStatus === 404) {
        throw new Error(`Mô hình gemini-2.5-flash không tìm thấy (404 - ${errMsg})`);
      }
      if (errStatus === 429) {
        throw new Error(`Đã vượt quá giới hạn lượt gọi API Key (429 Rate Limit - ${errMsg})`);
      }

      throw new Error(`Lỗi kết nối Gemini API (${errMsg})`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (candidate && candidate.content?.parts?.[0]?.text) {
      console.log(`[Gemini API] Phản hồi thành công từ mô hình gemini-2.5-flash`);
      return candidate.content.parts[0].text;
    }

    throw new Error("Mô hình gemini-2.5-flash không trả về phản hồi văn bản hợp lệ.");
  }

  // Offline Sports Science Rule Engine
  generateLocalFallbackResponse(rawQuery, athlete) {
    const q = rawQuery.toLowerCase();

    // 1. Audit / Progress Check
    if (this.matchesAny(q, ["tiến độ", "audit", "tổng kết", "thống kê", "dữ liệu", "tập thế nào", "tổng volume", "km"])) {
      return `### 📊 Tổng Kết & Đánh Giá Dữ Liệu Tập Luyện (Athlete Audit)
- **Giáo án hiện tại:** ${athlete.programName}
- **Tổng số buổi hoàn thành:** **${athlete.stats.totalWorkouts} buổi**
- **Tổng khối lượng tạ (Volume):** **${athlete.stats.totalVolumeKg.toLocaleString()} kg**
- **Tổng cự ly chạy:** **${athlete.stats.totalDistanceKm} km**

**Đánh giá của Coach:**
1. Khối lượng tập luyện được phân bổ cân bằng giữa phát triển cơ bắp và sức bền tim mạch.
2. Hãy chú ý giữ vững nguyên tắc **RIR 1-2** ở các set chính để kích thích phì đại tối đa mà không làm quá tải hệ thần kinh trung ương (CNS).`;
    }

    // 2. Progressive Overload / Increasing Weights
    if (this.matchesAny(q, ["tăng tạ", "overload", "progressive", "mức tạ", "1rm", "thêm tạ"])) {
      return `### ⚡ Chiến Thuật Tăng Tạ (Progressive Overload) Chuẩn BFS
1. **Quy tắc Double Progression:**
   - Đặt mục tiêu biên độ reps (Ví dụ: 6–8 reps @ RIR 1).
   - Khi bạn hoàn thành đủ **8 reps ở cả 2 sets** với form chuẩn tuyệt đối $\\to$ Tăng ngay **+2.5kg (Thanh đòn)** hoặc **+2kg (Tạ đơn)** ở buổi kế tiếp.
2. **Kỹ thuật Rest-Pause (RP):**
   - Áp dụng cho các bài Isolation/Machine (như Lateral Raise, Machine Shoulder Press, Leg Curl).
   - Set 1 tập tới RIR 1, nghỉ 15 giây, tiếp tục đẩy thêm 3–5 reps tới ngưỡng failure để kích hoạt tối đa các sợi cơ co rút nhanh (Type IIx).`;
    }

    // 3. Prehab & Posture & Pain Management
    if (this.matchesAny(q, ["prehab", "đau", "gù lưng", "mỏi gáy", "võng lưng", "apt", "khớp", "gối", "vai"])) {
      return `### 🩺 Hướng Dẫn Phục Hồi & Prehab Theo Chuẩn NASM CEX
1. **Bước 1: Ức chế (Inhibit / SMR):** Dùng bóng cao su hoặc foam roll lăn 45-60s tại các điểm căng cứng (Ngực bé, cơ thang trên, dải chậu chày ITB).
2. **Bước 2: Kéo giãn (Lengthen):** Giãn tĩnh 30s với Couch Stretch (gập hông) và Doorway Pec Stretch (ngực).
3. **Bước 3: Kích hoạt (Activate):** Tập 2 sets x 12-15 reps Banded Clamshells (cơ mông nhỡ) và Wall Angels (cơ thang dưới).
4. **Bước 4: Tích hợp (Integrate):** Thực hiện Overhead Squat to Stand hoặc Single-Leg RDL để đồng bộ hóa chuỗi vận động.`;
    }

    // 4. Running & Half-Marathon
    if (this.matchesAny(q, ["chạy", "run", "half-marathon", "hm", "21km", "pace", "zone 2", "threshold"])) {
      return `### 🏃 Chiến Lược Pacing & Đồng Bộ Chạy Bộ Cho Hybrid Athlete
1. **Phân bố cự ly 80/20:**
   - 80% cự ly tuần chạy ở **Zone 2 Easy Pace (6:00 - 6:30/km)** để xây dựng mật độ ty thể và mao mạch cơ bắp.
   - 20% cự ly tập trung vào **Threshold (5:40 - 5:50/km)** hoặc Interval 1km để nâng cao ngưỡng thanh thải axit lactic.
2. **Nạp năng lượng Long Run (> 10km):**
   - Nạp 1 gói Energy Gel sau mỗi 45 phút chạy + bù 150-200ml nước điện giải để duy trì hiệu suất cơ học.`;
    }

    // Default Fallback
    return `### 🤖 Dino AI Coach Copilot
Chào bạn! Tôi đã nắm thông tin giáo án **${athlete.programName}** của bạn (${athlete.stats.totalWorkouts} buổi tập, ${athlete.stats.totalVolumeKg.toLocaleString()}kg tạ, ${athlete.stats.totalDistanceKm}km chạy).

**Gợi ý cốt lõi:**
- Luôn ưu tiên **chất lượng reps và kiểm soát chuyển động 2 giây eccentric** hơn là đẩy tạ quá nặng phá vỡ form.
- Đảm bảo giấc ngủ $\\ge$ 7 tiếng và nạp đủ 1.6 - 2.0g Protein/kg trọng lượng cơ thể mỗi ngày.
- Bạn có thể chạm vào các chủ đề gợi ý phía dưới hoặc hỏi chi tiết về bất kỳ bài tập nào!`;
  }

  getAthleteContext() {
    if (this.storage && this.storage.getAthleteContextSummary) {
      return this.storage.getAthleteContextSummary();
    }
    return {
      programName: "Dino Hybrid 2.0",
      philosophy: "Hybrid Periodization",
      activeWeek: "wA",
      activeDay: "wA_d2",
      stats: { totalWorkouts: 0, totalVolumeKg: 0, totalDistanceKm: "0.0", totalSets: 0 },
      recentWorkouts: []
    };
  }

  matchesAny(text, keywords) {
    return keywords.some(k => text.includes(k));
  }
}

if (typeof window !== "undefined") {
  window.DinoAICoachEngine = DinoAICoachEngine;
  window.dinoAICoach = new DinoAICoachEngine();
}
