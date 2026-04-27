import api from './api';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

const chatService = {
    /**
     * Send a message to the AI recruiter assistant
     */
    sendMessage: async (jobId: string, message: string, history: ChatMessage[]) => {
        const response = await api.post(`/chat/${jobId}`, {
            message,
            history
        });
        return response.data;
    }
};

export default chatService;
