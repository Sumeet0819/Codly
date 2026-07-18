// src/services/commonApiService.ts

// Define your backend base URL here (preferably from environment variables)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Define expected headers (e.g., for JSON or Authorization)
const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Example: Add auth token if you have one stored
  // const token = localStorage.getItem('token');
  // if (token) {
  //   headers['Authorization'] = `Bearer ${token}`;
  // }
  
  return headers;
};

// Generic request handler
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 401) {
        console.error("Unauthorized! Redirecting to login...");
        // Additional global logic for 401 could go here
      } else if (response.status === 500) {
        console.error("Internal Server Error");
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response
    if (response.status === 204) {
      return {} as T;
    }
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error("API Request Failed:", error);
    throw error;
  }
}

// Exported methods for all types of requests
export const commonApiService = {
  get: <T>(endpoint: string) => 
    request<T>(endpoint, { method: 'GET' }),
    
  post: <T>(endpoint: string, body: any) => 
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    
  put: <T>(endpoint: string, body: any) => 
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    
  patch: <T>(endpoint: string, body: any) => 
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    
  delete: <T>(endpoint: string) => 
    request<T>(endpoint, { method: 'DELETE' })
};
