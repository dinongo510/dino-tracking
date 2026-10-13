/**
 * DINO-005C Phase 1 — Dino AI Coach
 * General-purpose conversational AI + current-user training context.
 *
 * Authority boundary:
 * - 005B remains deterministic ground truth.
 * - AI may explain, summarize, interpret and coach.
 * - AI never mutates prescriptions, actual performance, history or corrective authority.
 * - Personal context is user-scoped and is never global model memory.
 */
class DinoAICoachEngine {
  constructor() {
    this.storage = window.dinoStorage || null;
    this.registry = new (window.DinoAIModelRegistry || class { resolve(){ return {alias:"dino-default",provider:"gemini",model:"gemini-2.5-flash"}; }})();
    this.taskRouter = new (window.DinoAITaskRouter || class { classify(){ return "GENERAL"; }})();
    this.contextEngine = new (window.DinoAIContextEngine || class {
      constructor(storage){this.storage=storage;}
      build(query,task){return {schemaVersion:"005C-1.0",userQuery:query,task};}
    })(this.storage);
    this.safetyGate = new (window.DinoAISafetyGate || class { before(){return {allowed:true};} })();
    this.validator = new (window.DinoAIResponseValidator || class { validate(text){return {valid:!!text,text};} })();
    this.gateway = new (window.DinoAIGateway || class {
      constructor(){this.status="AI_OFFLINE";}
      getStatus(){return this.status;}
    })({
      registry: this.registry,
      adapters: { gemini: new (window.DinoGeminiAdapter || class {})(this.registry) }
    });
    this.status = "AI_OFFLINE";
  }

  getStatus() {
    return this.gateway.getStatus ? this.gateway.getStatus() : this.status;
  }

  async generateResponse(userMessage) {
    const rawQuery = String(userMessage || "").trim();
    if (!rawQuery) return "Xin chào! Bạn có thể hỏi tôi bất kỳ điều gì như một AI bình thường. Khi cần, tôi có thể dùng dữ liệu tập luyện của chính bạn để trả lời.";

    const task = this.taskRouter.classify(rawQuery);
    const context = this.contextEngine.build(rawQuery, task);
    const gate = this.safetyGate.before(context);
    if (!gate.allowed) {
      this.status = "AI_BLOCKED";
      return "AI Coach không thể xử lý yêu cầu này vì vượt qua ranh giới an toàn của hệ thống.";
    }

    const apiKey = this.storage?.getGeminiApiKey?.() || "";
    if (!apiKey) {
      this.status = "AI_OFFLINE";
      return this.offlineResponse(rawQuery, context);
    }

    try {
      const result = await this.gateway.generate({
        apiKey,
        modelAlias: "dino-default",
        task,
        userQuery: rawQuery,
        context,
        systemInstruction: this.getSystemInstruction(task)
      });
      this.status = result.status;
      const safetyChecked = this.safetyGate.after ? this.safetyGate.after(result.text, context) : { valid: true };
      if (!safetyChecked.valid) {
        this.status = "AI_BLOCKED";
        return "AI Coach đã chặn phản hồi vì phát hiện nội dung có thể vượt quyền của AI đối với dữ liệu/giáo án.";
      }
      const checked = this.validator.validate(result.text, context);
      if (!checked.valid) {
        this.status = "AI_BLOCKED";
        return "AI Coach đã chặn phản hồi vì phát hiện nội dung có thể vượt quyền của AI đối với dữ liệu/giáo án.";
      }
      return checked.text;
    } catch (err) {
      this.status = "AI_ERROR";
      const message = err?.message || "Lỗi không xác định";
      if (window.dinoApp?.showToast) window.dinoApp.showToast("⚠️ AI Coach: " + message);
      return "⚠️ **AI_ERROR — Không thể kết nối AI lúc này.**\n\n" +
        "Tôi không trình bày chế độ Offline như phản hồi của Gemini. " +
        "Bạn có thể thử lại hoặc tiếp tục với dữ liệu cục bộ hiện có.";
    }
  }

  getSystemInstruction(task) {
    return [
      "Bạn là Dino AI Coach — một AI hội thoại đa dụng có năng lực trả lời câu hỏi tự do như một AI thông thường.",
      "Bạn có thể nói về tập luyện, chạy bộ, thể thao, phục hồi, dinh dưỡng, học tập và các chủ đề khác phù hợp với câu hỏi.",
      "Điểm khác biệt của DINO là bạn được cung cấp context riêng của người dùng hiện tại để cá nhân hóa khi câu hỏi liên quan.",
      "PHÂN BIỆT 3 LỚP: kiến thức chung của mô hình; kiến thức/quy tắc của sản phẩm DINO; dữ liệu cá nhân của CURRENT USER.",
      "Không được coi dữ liệu của current user là trí nhớ chung của mô hình. Không suy diễn hoặc nhắc dữ liệu của người dùng khác.",
      "DINO-005B là nguồn chân lý xác định cho Corrective Exercise. Không tự tạo, sửa, thay dosage, laterality, NEEDS_LATERALITY hoặc SAFETY_BLOCKED.",
      "Không sửa prescription, actual performance, workout history hoặc ghi dữ liệu vào hệ thống.",
      "Nếu context không có dữ liệu cần thiết, nói rõ thiếu dữ liệu thay vì bịa.",
      "Task hiện tại: " + task,
      "Trả lời bằng tiếng Việt trừ khi người dùng yêu cầu ngôn ngữ khác. Markdown được phép."
    ].join("\n");
  }

  offlineResponse(query, context) {
    return "ℹ️ **AI_OFFLINE** — Gemini chưa được kết nối, nên tôi không giả làm AI đang hoạt động.\n\n" +
      "Bạn vẫn có thể xem và sử dụng dữ liệu tập luyện cục bộ trong DINO. " +
      "Khi kết nối Gemini, tôi sẽ có thể trả lời câu hỏi tự do và dùng **dữ liệu của chính người dùng hiện tại** để cá nhân hóa.";
  }

  // Backward-compatible API used by Settings → Test API.
  async callGeminiAPI(apiKey, userQuery, athlete) {
    const task = this.taskRouter.classify(userQuery);
    const context = athlete || this.contextEngine.build(userQuery, task);
    return new DinoGeminiAdapter(this.registry).generate({
      apiKey, modelAlias: "dino-default", task, userQuery,
      context, systemInstruction: this.getSystemInstruction(task)
    });
  }

  getAthleteContext() {
    return this.storage?.getAthleteContextSummary?.() || {
      programName: "Dino Hybrid 2.0",
      philosophy: "",
      activeWeek: "",
      activeDay: "",
      stats: { totalWorkouts: 0, totalVolumeKg: 0, totalDistanceKm: "0.0", totalSets: 0 },
      recentWorkouts: []
    };
  }

  getCurrentAIStatus() { return this.status; }
}

if (typeof window !== "undefined") {
  window.DinoAICoachEngine = DinoAICoachEngine;
  window.dinoAICoach = new DinoAICoachEngine();
}
