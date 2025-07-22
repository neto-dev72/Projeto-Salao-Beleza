// src/auth.ts (ou ajuste o caminho conforme sua estrutura)
import { ref } from 'vue'

export const usuario = ref<any>(JSON.parse(localStorage.getItem('usuario') || 'null'))
export const usuarioLogado = ref(!!localStorage.getItem('token') && !!usuario.value)

export const login = (token: string, usuarioData: any) => {
  localStorage.setItem('token', token)
  localStorage.setItem('usuario', JSON.stringify(usuarioData))
  usuario.value = usuarioData
  usuarioLogado.value = true
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  usuario.value = null
  usuarioLogado.value = false
}
