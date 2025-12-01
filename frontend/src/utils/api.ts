import axios from "axios";

export const API_BASE = "https://kingdomfoods.onrender.com";

export const testConnection = async () => {
  try {
    const response = await axios.get(`${API_BASE}/`);
    return response.data; // Should return "API is running..."
  } catch (error: any) {
    console.error("API Error:", error.message);
    throw error;
  }
};

export const getDish = async (id: string) => {
  try {
    const res = await axios.get(`${API_BASE}/menu/${id}`);
    return res.data;
  } catch (error: any) {
    console.error("Error fetching dish:", error.message);
    throw error;
  }
};
