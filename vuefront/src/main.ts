import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'

// ✅ 1. Carrega as fontes
loadFonts()

// ✅ 2. Configura o Axios antes de montar a aplicação
import axios from 'axios'

axios.defaults.baseURL = 'http://31.97.115.4:9000/'


// ✅ Intercepta todas as requisições para enviar o token JWT
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`  // ✅ Formato correto
  }
  return config
}, error => {
  return Promise.reject(error)
})

// ✅ 3. Cria e monta o app Vue com router e Vuetify
createApp(App)
  .use(router)
  .use(vuetify)
  .mount('#app')
