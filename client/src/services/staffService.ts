import { api } from "@/services/api";

export async function getStaffData(endpoint: string) {
    try {
        const response = await api.get("/staff/" + endpoint);
        return response;
    } catch (error) {
        console.error(`Error fetching staff data [${endpoint}]:`, error);
        throw error;
    }
}
