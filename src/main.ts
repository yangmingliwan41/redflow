import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@fontsource/noto-sans-sc/400.css'
import '@fontsource/noto-sans-sc/500.css'
import '@fontsource/noto-sans-sc/700.css'
import './assets/css/base.css'
import './assets/css/variables.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')





