import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore({
    id: 'Auth',
    state: () => {
        return {
            isAuth: false,
        };
    },
    actions: {
        setAuth(flag) {
            this.isAuth = flag;
        },
        getAuth() {
            return this.isAuth;
        }
    }
});