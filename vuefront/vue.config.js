const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,

  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:9000', // Substitua pela porta do seu backend se for diferente
        changeOrigin: true
      }
    },
    client: {
      overlay: false   // 🚫 desativa o overlay vermelho no navegador
    }
  },

  pluginOptions: {
    vuetify: {
      // vuetify loader config
    }
  }
})
