import { api } from "@/services/api";

export async function getMentors() {
    try {
        const response = await api.get("/staff/mentors");
        return response;
    } catch (error) {
        console.log(error);
    }
}
