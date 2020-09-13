import { createRouter, createWebHistory } from 'vue-router'

import App from '../App.vue'

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            name: 'All',
            path: '/:username(.*)',
            component: App,
        },
    ],
})
