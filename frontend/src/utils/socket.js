import { reactive } from 'vue';
import eventHandler from '@/utils/eventHandler.js';
import { useLoginStore } from '@/stores/login.js';

export const state = reactive({
    connected: false,
    reconnectAttempts: 0,
});

const URL = import.meta.env.VITE_APP_WEBSOCKET_URL;
const MAX_RECONNECT_ATTEMPTS = 30;
const RECONNECT_INTERVAL = 3000;

let socket;

const initializeWebSocket = () => {
    socket = new WebSocket(URL);

    socket.onopen = (event) => {
        state.connected = true;
        state.reconnectAttempts = 0;
        console.log('WebSocket connected');

        const loginStore = useLoginStore();
        if (loginStore.token) {
            sendToSocket('ping');
        }
    };

    socket.onclose = (event) => {
        state.connected = false;
        console.log('WebSocket disconnected');

        if (state.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            attemptReconnect();
        }
    };

    socket.onmessage = (event) => eventHandler(JSON.parse(event.data));

    socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
        if (!state.connected && state.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            attemptReconnect();
        }
    };
};

const attemptReconnect = () => {
    state.reconnectAttempts++;
    console.log(`Reconnection attempt ${state.reconnectAttempts}`);
    setTimeout(() => {
        initializeWebSocket();
    }, RECONNECT_INTERVAL);
};

export const sendToSocket = (eventType, payload) => {
    const loginStore = useLoginStore();
    if (socket.readyState === WebSocket.OPEN) {
        const data = {
            token: loginStore.token,
            command: eventType,
            ...payload,
        };
        socket.send(JSON.stringify(data));
        console.info('Message sent:', data);
    } else {
        console.warn('WebSocket is not open. Message not sent.');
    }
};

initializeWebSocket();

export default socket;
