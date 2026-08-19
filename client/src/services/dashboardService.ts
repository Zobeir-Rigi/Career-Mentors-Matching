import { isAxiosError } from 'axios';
import { api } from '../api';

export async function getMenteeDashboardInfo() {
    try {
        const response = await api.get('/dashboard/mentee_dashboard_info');
        return response.data;
    } catch (error: unknown) {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        const message = error instanceof Error ? error.message : 'Unknown error';

        if (status === 401) {
            throw new Error('Unauthorized', { cause: error });
        }

        throw new Error(`Failed to fetch dashboard info: ${status || message}`, {
            cause: error,
        });
    }
}

export async function setMenteeGoals(selectedDiscipline: string[] | Set<string>) {
    const selectedDisciplineArray = Array.isArray(selectedDiscipline)
        ? selectedDiscipline
        : Array.from(selectedDiscipline);

    const response = await api.put('/mentee-profile', {
        disciplineGoals: selectedDisciplineArray,
    });
    return response.data;
}

export async function askForMatch() {
    try {
        const response = await api.get('/dashboard/mentee_dashboard_match');
        return response.data;
    } catch (error: unknown) {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        const message = error instanceof Error ? error.message : 'Unknown error';

        if (status === 401) {
            throw new Error('Unauthorized', { cause: error });
        }

        throw new Error(`Failed to fetch matches: ${status || message}`, {
            cause: error,
        });
    }
}