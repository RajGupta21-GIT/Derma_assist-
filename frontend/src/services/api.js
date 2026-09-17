/**
 * Derma Assist Multimodal API Service
 */

const API_BASE = '/api';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch (err) {
    console.error('Health check failed', err);
    return { status: 'offline' };
  }
}

export async function synthesizeMultimodal({ file, base64, questionnaire }) {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  } else if (base64) {
    formData.append('image_base64', base64);
  } else {
    throw new Error('No image provided for multimodal evaluation.');
  }

  if (questionnaire) {
    formData.append('questionnaire_json', JSON.stringify(questionnaire));
  }

  const res = await fetch(`${API_BASE}/synthesize`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Multimodal synthesis failed');
  }

  return await res.json();
}

export async function sendChatMessage({ message, history, visionContext, questionnaireContext, apiKey }) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history,
      vision_context: visionContext,
      questionnaire_context: questionnaireContext,
      api_key: apiKey || null,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Chat consultation request failed');
  }

  return await res.json();
}

export async function updateApiKey(apiKey) {
  const res = await fetch(`${API_BASE}/update-api-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey }),
  });
  return await res.json();
}

export async function downloadReport({ patientName, patientAge, patientGender, questionnaireData, classificationResult, originalImgBase64 }) {
  const res = await fetch(`${API_BASE}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patient_name: patientName || 'Anonymous Patient',
      patient_age: patientAge || 'N/A',
      patient_gender: patientGender || 'N/A',
      questionnaire_data: questionnaireData || {},
      classification_result: classificationResult,
      original_img_base64: originalImgBase64,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to generate PDF report');
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Derma_Assist_Consultation_Report_${new Date().toISOString().slice(0,10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
