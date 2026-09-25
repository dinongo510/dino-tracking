/**
 * Dino Tracking - High-Performance Canvas Chart Engine
 * Renders Progressive Overload curves, Running Mileage charts, and Volume Load progression.
 */

class DinoCharts {
  // 1. PROGRESSIVE OVERLOAD / 1RM EXERCISE CHART
  static renderOverloadChart(canvasId, setsData, liftName) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) return;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    if (!setsData || setsData.length === 0) {
      ctx.fillStyle = "#71717a";
      ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Chưa có lịch sử tập cho bài này. Hãy log set đầu tiên!", width / 2, height / 2);
      return;
    }

    const points = [...setsData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const padding = { top: 25, right: 25, bottom: 35, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const weights = points.map(p => p.weightKg);
    const minW = Math.max(0, Math.floor(Math.min(...weights) * 0.85));
    const maxW = Math.ceil(Math.max(...weights) * 1.15) || 100;

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    ctx.lineWidth = 1;
    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const yVal = minW + ((maxW - minW) / ySteps) * i;
      const yPos = padding.top + chartH - (i / ySteps) * chartH;

      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(width - padding.right, yPos);
      ctx.stroke();

      ctx.fillStyle = "#71717a";
      ctx.font = "10px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${Math.round(yVal)} kg`, padding.left - 8, yPos + 3);
    }

    // Coordinates
    const coords = points.map((p, idx) => {
      const x = points.length === 1
        ? padding.left + chartW / 2
        : padding.left + (idx / (points.length - 1)) * chartW;
      const normalizedY = (p.weightKg - minW) / (maxW - minW || 1);
      const y = padding.top + chartH - (normalizedY * chartH);
      return { x, y, point: p };
    });

    // Gradient Fill
    if (coords.length > 1) {
      const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      grad.addColorStop(0, "rgba(255, 42, 42, 0.35)");
      grad.addColorStop(1, "rgba(255, 42, 42, 0.0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(coords[0].x, padding.top + chartH);
      coords.forEach(c => ctx.lineTo(c.x, c.y));
      ctx.lineTo(coords[coords.length - 1].x, padding.top + chartH);
      ctx.closePath();
      ctx.fill();
    }

    // Red Line
    ctx.strokeStyle = "#ff2a2a";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    coords.forEach((c, i) => {
      if (i === 0) ctx.moveTo(c.x, c.y);
      else ctx.lineTo(c.x, c.y);
    });
    ctx.stroke();

    // Data Points
    coords.forEach((c) => {
      ctx.fillStyle = "rgba(255, 42, 42, 0.4)";
      ctx.beginPath();
      ctx.arc(c.x, c.y, 6.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(c.x, c.y, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${c.point.weightKg}k`, c.x, c.y - 10);

      const dateParts = c.point.date.split("-");
      const shortDate = `${dateParts[1]}/${dateParts[2]}`;
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "9.5px monospace";
      ctx.fillText(shortDate, c.x, padding.top + chartH + 16);
    });
  }

  // 2. RUNNING MILEAGE CHART (Bars)
  static renderMileageChart(canvasId, runLogs, timeframe = "all") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) return;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    if (!runLogs || runLogs.length === 0) {
      ctx.fillStyle = "#71717a";
      ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Chưa có dữ liệu chạy bộ. Hãy hoàn thành buổi chạy đầu tiên!", width / 2, height / 2);
      return;
    }

    const points = [...runLogs].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-10);
    const padding = { top: 25, right: 20, bottom: 30, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxKm = Math.max(15, Math.ceil(Math.max(...points.map(p => parseFloat(p.distanceKm) || 0)) * 1.2));

    // Y Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    ctx.lineWidth = 1;
    const ySteps = 3;
    for (let i = 0; i <= ySteps; i++) {
      const yVal = (maxKm / ySteps) * i;
      const yPos = padding.top + chartH - (i / ySteps) * chartH;

      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(width - padding.right, yPos);
      ctx.stroke();

      ctx.fillStyle = "#71717a";
      ctx.font = "10px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${Math.round(yVal)} km`, padding.left - 6, yPos + 3);
    }

    const barWidth = Math.min(28, (chartW / points.length) * 0.55);
    const stepX = chartW / points.length;

    points.forEach((p, idx) => {
      const km = parseFloat(p.distanceKm) || 0;
      const barH = (km / maxKm) * chartH;
      const x = padding.left + (idx * stepX) + (stepX - barWidth) / 2;
      const y = padding.top + chartH - barH;

      // Bar gradient
      const grad = ctx.createLinearGradient(0, y, 0, padding.top + chartH);
      grad.addColorStop(0, "#3b82f6");
      grad.addColorStop(1, "rgba(59, 130, 246, 0.2)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
      ctx.fill();

      // Value label on top
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${km}k`, x + barWidth / 2, y - 6);

      // Date label on bottom
      const shortDate = (p.date && p.date.includes("-") && p.date.split("-").length >= 3)
        ? `${p.date.split("-")[1]}/${p.date.split("-")[2]}`
        : (p.date || "");
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "9px monospace";
      ctx.fillText(shortDate, x + barWidth / 2, padding.top + chartH + 16);
    });
  }

  // 3. VOLUME LOAD PROGRESSION CHART (Line & Area)
  static renderVolumeChart(canvasId, workoutHistory, timeframe = "all") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) return;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    const strengthSessions = (workoutHistory || []).filter(h => (parseFloat(h.totalVolumeKg) || 0) > 0);

    if (strengthSessions.length === 0) {
      ctx.fillStyle = "#71717a";
      ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Chưa có dữ liệu khối lượng nâng tạ (Volume).", width / 2, height / 2);
      return;
    }

    const points = [...strengthSessions].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-10);
    const padding = { top: 25, right: 25, bottom: 30, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const volumes = points.map(p => parseFloat(p.totalVolumeKg) || 0);
    const minVol = 0;
    const maxVol = Math.ceil(Math.max(...volumes) * 1.2) || 5000;

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    ctx.lineWidth = 1;
    const ySteps = 3;
    for (let i = 0; i <= ySteps; i++) {
      const yVal = (maxVol / ySteps) * i;
      const yPos = padding.top + chartH - (i / ySteps) * chartH;

      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(width - padding.right, yPos);
      ctx.stroke();

      ctx.fillStyle = "#71717a";
      ctx.font = "10px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${Math.round(yVal / 100) / 10}t`, padding.left - 6, yPos + 3);
    }

    const coords = points.map((p, idx) => {
      const x = points.length === 1
        ? padding.left + chartW / 2
        : padding.left + (idx / (points.length - 1)) * chartW;
      const normalizedY = ((parseFloat(p.totalVolumeKg) || 0) - minVol) / (maxVol - minVol || 1);
      const y = padding.top + chartH - (normalizedY * chartH);
      return { x, y, point: p };
    });

    // Area Fill
    if (coords.length > 1) {
      const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      grad.addColorStop(0, "rgba(16, 185, 129, 0.35)");
      grad.addColorStop(1, "rgba(16, 185, 129, 0.0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(coords[0].x, padding.top + chartH);
      coords.forEach(c => ctx.lineTo(c.x, c.y));
      ctx.lineTo(coords[coords.length - 1].x, padding.top + chartH);
      ctx.closePath();
      ctx.fill();
    }

    // Emerald Green Line
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    coords.forEach((c, i) => {
      if (i === 0) ctx.moveTo(c.x, c.y);
      else ctx.lineTo(c.x, c.y);
    });
    ctx.stroke();

    coords.forEach((c) => {
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${Math.round((c.point.totalVolumeKg || 0) / 100) / 10}t`, c.x, c.y - 9);

      const dateParts = c.point.date.split("-");
      const shortDate = `${dateParts[1]}/${dateParts[2]}`;
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "9.5px monospace";
      ctx.fillText(shortDate, c.x, padding.top + chartH + 16);
    });
  }
}

if (typeof window !== "undefined") {
  window.DinoCharts = DinoCharts;
}
