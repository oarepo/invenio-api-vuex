import { ConfigModule, FacetOptions, CallbackList, convertToCallbackList, convertDictToCallbackList } from './store/config'
import { CollectionListModule } from './store/collections'
import { CollectionModule } from './store/collection'
import { RecordModule } from './store/record'
import { TranslationOptions } from './store/facets'
import { State } from './store/types'
import { routerRecord, routerCollection, routerCollectionList } from './router'

export {
    ConfigModule,
    CollectionListModule,
    CollectionModule,
    TranslationOptions,
    State,

    // router
    routerCollectionList,
    routerCollection,
    routerRecord
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
            collectionListModule: CollectionListModule,
            collectionModule: CollectionModule,
            recordModule: RecordModule
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

        const collections = new options.collectionListModule(
            config,
            {
                store,
                name: 'oarepoCollectionList'
            }
        )
        const collection = new options.collectionModule(
            config,
            {
                store,
                name: 'oarepoCollection'
            }
        )
        const record = new options.recordModule(
            config,
            {
                store,
                name: 'oarepoRecord'
            }
        )
        Vue.prototype.$oarepo = {
            config,
            collections,
            collection,
            record
        }
    }
}

