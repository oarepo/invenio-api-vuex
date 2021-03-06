import { CallbackList, ConfigModule, convertDictToCallbackList, convertToCallbackList } from './store/config'
import { CollectionModule } from './store/collection'
import { IndicesModule } from './store/indices'
import { RecordModule } from './store/record'
import { FacetMode, State } from './store/types'
import { collection, record } from './router'
import { applyMixins } from './store/mixin'
import FacetMixin from './components/FacetMixin'
import InvenioCollection from './components/InvenioCollection.vue'
import InvenioRecord from './components/InvenioRecord.vue'

export {
    ConfigModule,
    CollectionModule,
    IndicesModule,
    RecordModule,
    State,
    FacetMode,

    CallbackList,

    // router
    collection,
    record,

    FacetMixin,
    InvenioCollection,
    InvenioRecord
}

function detectBrowserLanguage () {
    return navigator.languages
        ? navigator.languages[0]
        : (navigator.language || navigator.userLanguage)
}

export default {
    install (Vue, options = {}) {
        const defaultOptions = {
            apiURL: '/api',
            defaultPageSize: 10,
            i18n (x) {
                return x
            },
            defaultFacetPreprocessors: new CallbackList(),
            facetPreprocessors: {},

            defaultRecordPreprocessors: new CallbackList(),
            recordPreprocessors: {},

            defaultListRecordPreprocessors: new CallbackList(),
            listRecordPreprocessors: {},

            configModule: ConfigModule,
            indicesMixins: [],
            collectionMixins: [],
            recordMixins: [],
            queryMixins: [],
            language: null,
            loadIndices: true,

            facetMode: FacetMode.ALL_FACETS
        }
        options = {
            ...defaultOptions,
            ...options
        }
        const store = options.store
        if (store === undefined) {
            throw new Error('Pass store into the options')
        }
        const config = new options.configModule()
        config.apiURL = options.apiURL
        config.defaultPageSize = options.defaultPageSize
        config.i18n = options.i18n
        config.defaultFacetPreprocessors = options.defaultFacetPreprocessors
        config.facetPreprocessors = options.facetPreprocessors
        config.recordPreprocessors = convertDictToCallbackList(options.recordPreprocessors)
        config.defaultRecordPreprocessors = convertToCallbackList(options.defaultRecordPreprocessors)
        config.listRecordPreprocessors = convertDictToCallbackList(options.listRecordPreprocessors)
        config.defaultListRecordPreprocessors = convertToCallbackList(options.defaultListRecordPreprocessors)
        config.usePost = options.usePost
        config.language = options.language || detectBrowserLanguage()
        config.facetMode = options.facetMode

        const indices = new applyMixins(IndicesModule, options.indicesMixins)(
            config,
            {
                store,
                name: 'oarepoIndices'
            }
        )
        const collection = new applyMixins(CollectionModule, options.collectionMixins)(
            config,
            indices,
            {
                store,
                name: 'oarepoCollection'
            }
        )
        const record = new applyMixins(RecordModule, options.recordMixins)(
            config,
            indices,
            {
                store,
                name: 'oarepoRecord'
            }
        )
        if (Vue.prototype.$oarepo === undefined) {
            Vue.prototype.$oarepo = {}
        }

        Object.assign(Vue.prototype.$oarepo, {
            config,
            indices,
            collection,
            record
        })
        if (options.loadIndices) {
            indices.load()
        }
    }
}

