import { api } from "@/services/api";

export async function getMentees() {
    try {
        const response = await api.get("/staff/mentees");
        return response;
    } catch (error) {
        console.log(error);
    }
}

export async function getMentors() {
    try {
        const response = await api.get("/staff/mentors");
        return response;
    } catch (error) {
        console.log(error);
    }
}
