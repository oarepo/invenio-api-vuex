import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

import QuerySupport from '@oarepo/vue-query-synchronizer'
import InvenioAPI from '@oarepo/invenio-api-vuex'

import App from './App.vue'
import routes from './router'

Vue.config.productionTip = false

Vue.use(Vuex)
const store = new Vuex.Store({})

Vue.use(InvenioAPI, {
    store
})

Vue.use(VueRouter)

const router = new VueRouter({
    routes
})

Vue.use(QuerySupport, { router, debug: false })

new Vue({
    store,
    router,
    render: h => h(App)
}).$mount('#app')
