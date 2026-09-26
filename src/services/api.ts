const API_BASE_URL = 'http://127.0.0.1:8000';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `API error: ${response.status}`;

    try {
      const errorData = await response.json();
      errorMessage =
        errorData.detail ||
        errorData.message ||
        JSON.stringify(errorData);
    } catch {
      // Keep default error message
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

export interface CreateCaseResponse {
  case_id: string;
}

export const kuberaApi = {
  health: () =>
    apiRequest<{ status: string }>('/api/health'),

  createCase: (loanType: string) =>
    apiRequest<CreateCaseResponse>('/api/cases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        loan_type: loanType,
      }),
    }),

  getCase: (caseId: string) =>
    apiRequest<any>(`/api/cases/${caseId}`),

  uploadDocument: async (
    caseId: string,
    file: File,
    docType: string
  ) => {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('doc_type', docType);

    return apiRequest<any>(
      `/api/cases/${caseId}/documents`,
      {
        method: 'POST',
        body: formData,
      }
    );
  },

  extract: (caseId: string) =>
    apiRequest<any>(
      `/api/cases/${caseId}/extract`,
      {
        method: 'POST',
      }
    ),

  analyze: (caseId: string) =>
    apiRequest<any>(
      `/api/cases/${caseId}/analyze`,
      {
        method: 'POST',
      }
    ),

  getDecision: (caseId: string) =>
    apiRequest<any>(
      `/api/cases/${caseId}/decision`
    ),
};