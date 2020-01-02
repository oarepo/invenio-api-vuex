import {
    CallbackList,
    ConfigModule,
    convertDictToCallbackList,
    convertToCallbackList,
    FacetOptions
} from './store/config'
import { CollectionListModule } from './store/collections'
import { CollectionModule } from './store/collection'
import { RecordModule } from './store/record'
import { TranslationOptions } from './store/facets'
import { State } from './store/types'
import { routerCollection, routerCollectionList, routerRecord } from './router'
import { applyMixins } from './store/mixin'
import { facetQuerySynchronization } from './query'

export {
    ConfigModule,
    CollectionListModule,
    CollectionModule,
    RecordModule,
    TranslationOptions,
    FacetOptions,
    State,

    CallbackList,

    // router
    routerCollectionList,
    routerCollection,
    routerRecord,

    // query synchronization
    facetQuerySynchronization
}

export default {
    install (Vue, options = {}) {
        const defaultOptions = {
            apiURL: '/api',
            defaultPageSize: 10,
            i18n (x) {
                return x
            },
            defaultFacetOptions: new FacetOptions({}),
            facetOptions: {},

            defaultRecordPreprocessors: new CallbackList(),
            recordPreprocessors: {},

            defaultListRecordPreprocessors: new CallbackList(),
            listRecordPreprocessors: {},

            configModule: ConfigModule,
            collectionListMixins: [],
            collectionMixins: [],
            recordMixins: []
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
        config.defaultFacetOptions = options.defaultFacetOptions
        config.facetOptions = options.facetOptions
        config.recordPreprocessors = convertDictToCallbackList(options.recordPreprocessors)
        config.defaultRecordPreprocessors = convertToCallbackList(options.defaultRecordPreprocessors)
        config.listRecordPreprocessors = convertDictToCallbackList(options.listRecordPreprocessors)
        config.defaultListRecordPreprocessors = convertToCallbackList(options.defaultListRecordPreprocessors)

        const collections = new applyMixins(CollectionListModule, options.collectionListMixins)(
            config,
            {
                store,
                name: 'oarepoCollectionList'
            }
        )
        const collection = new applyMixins(CollectionModule, options.collectionMixins)(
            config,
            {
                store,
                name: 'oarepoCollection'
            }
        )
        const record = new applyMixins(RecordModule, options.recordMixins)(
            config,
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
            collections,
            collection,
            record
        })
    }
}

