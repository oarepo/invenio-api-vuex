import Vue from 'vue'
import App from './App.vue'
import store from './store'
import InvenioAPI from '@oarepo/invenio-api-vuex'
import VueRouter from 'vue-router'
import routes from './router'
import VuexPreloader from '@oarepo/vuex-preloader'
import VueQuerySynchronizer from '@oarepo/vue-query-synchronizer'
import { TranslationOptions, FacetOptions } from '@oarepo/invenio-api-vuex'

Vue.config.productionTip = false

Vue.use(InvenioAPI, {
    store: store,
    i18n: x => `Translated '${x}'`,
    defaultFacetOptions: new FacetOptions({
        defaultTranslateValues: TranslationOptions.TRANSLATE
    }),
    listRecordPreprocessors: {
        objects (record, { collection }) {
            record.links.ui = {
                name: 'oarepoRecord',
                params: {
                    collectionId: collection.collectionId,
                    recordId: record.metadata.id
                }
            }
            return record
        }
    }
})

Vue.use(VueRouter)

const router = new VueRouter({
    routes // short for `routes: routes`
})

Vue.use(VuexPreloader, {
    router, store, debug: true
})

Vue.use(VueQuerySynchronizer, {
    debug: true,
    passUnknownProperties: true,
    router
})

new Vue({
    store,
    router,
    render: h => h(App)
}).$mount('#app')
