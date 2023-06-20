import App from '../App.vue'

export const routes = [
  {
    name: 'All',
    path: '/:username(.*)',
    component: App,
  },
]
