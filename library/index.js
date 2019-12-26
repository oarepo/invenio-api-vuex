import { ConfigModule, FacetOptions, CallbackList } from './store/config'
import { CollectionListModule } from './store/collections'
import { CollectionModule } from './store/collection'
import { RecordModule } from './store/record'
import { TranslationOptions } from './store/facets'
import { State } from './store/types'

export {
    ConfigModule,
    CollectionListModule,
    CollectionModule,
    TranslationOptions,
    State
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
        delete options.store
        const config = new options.configModule({
            store,
            name: 'oarepoConfig'
        })
        config.apiURL = options.apiURL
        config.defaultPageSize = options.defaultPageSize
        config.i18n = options.i18n
        config.defaultFacetOptions = options.defaultFacetOptions
        config.facetOptions = options.facetOptions
        config.recordPreprocessors = options.recordPreprocessors
        config.defaultRecordPreprocessors = options.defaultRecordPreprocessors

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

