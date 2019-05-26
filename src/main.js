import Vue from 'vue'

import App from './App.vue'
import router from './router'
import store from './store'
import Storage from 'vue-ls'
import './registerServiceWorker'

import './assets/fonts.css'

import './plugins/vuetify'


Vue.use(Storage, {
    namespace: 'gd_',
    name: 'storage',
    storage: 'local'
});


Vue.filter('currency', function (value) {
    if (!value) return 0
    if (!/^\d+$/.test(value)) return value
    return value.toString().replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, "$1,")
});


Vue.config.productionTip = false

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
