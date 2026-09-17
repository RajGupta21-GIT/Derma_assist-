const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error(`Health check returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend health check warning:", err);
    return { status: "offline", error: err.message };
  }
}

export async function getDemoSamples() {
  const res = await fetch(`${API_BASE}/api/demo-samples`);
  if (!res.ok) throw new Error("Failed to fetch demo samples");
  return await res.json();
}

export async function classifyImage(file, imageBase64) {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  } else if (imageBase64) {
    formData.append('image_base64', imageBase64);
  } else {
    throw new Error("No image provided");
  }

  const res = await fetch(`${API_BASE}/api/classify`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Classification failed: ${res.statusText}`);
  }

  return await res.json();
}

export async function sendChatMessage(messages, analysisContext = null, apiKey = null) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      analysis_context: analysisContext,
      api_key: apiKey || undefined,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Chat request failed: ${res.statusText}`);
  }

  return await res.json();
}

export async function exportReportPdf({
  analysisData,
  originalImageB64,
  gradcamImageB64,
  chatSummary,
  patientInfo,
}) {
  const res = await fetch(`${API_BASE}/api/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      analysis_data: analysisData,
      original_image_b64: originalImageB64,
      gradcam_image_b64: gradcamImageB64,
      chat_summary: chatSummary,
      patient_info: patientInfo,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to generate PDF report.");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `DermaAssist_Clinical_Report_${Date.now()}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
