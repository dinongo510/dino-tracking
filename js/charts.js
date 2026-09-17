/**
 * Dino Tracking - High-Performance Canvas Chart Engine
 */

class DinoCharts {
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
      ctx.font = "13px 'Plus Jakarta Sans', sans-serif";
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
      ctx.arc(c.x, c.y, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(c.x, c.y, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${c.point.weightKg}k`, c.x, c.y - 11);

      const dateParts = c.point.date.split("-");
      const shortDate = `${dateParts[1]}/${dateParts[2]}`;
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "10px monospace";
      ctx.fillText(shortDate, c.x, padding.top + chartH + 18);
    });
  }
}

if (typeof window !== "undefined") {
  window.DinoCharts = DinoCharts;
}
