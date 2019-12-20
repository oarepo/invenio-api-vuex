import OARepoCollectionList from './components/OARepoCollectionList.vue'
import OARepoCollection from './components/OARepoCollection.vue'
import OARepoItem from './components/OARepoItem.vue'
import OARepoFacetList from './components/OARepoFacetList.vue'

import Query from './services/query'
import { CollectionItemModule, CollectionListModule, CollectionModule } from './store/collections_export'
import { InvalidDataException } from './exceptions'
import { loaderAfterEach } from './services/loader'

const OARepo = {
    install (
        Vue,
        {
            store,
            router,
            valueTranslator,
            apiURL,
            facetHandler,
            itemPreprocessors
        }
    ) {
        Vue.component('oarepo-collection-list', OARepoCollectionList)
        Vue.component('oarepo-collection', OARepoCollection)
        Vue.component('oarepo-item', OARepoItem)
        Vue.component('oarepo-facet-list', OARepoFacetList)


        const oarepo$ = {
            collectionListModule: new CollectionListModule({
                store,
                name: 'collections'
            }),
            collectionModule: new CollectionModule({
                store,
                name: 'collection'
            }),
            collectionItemModule: new CollectionItemModule({
                store,
                name: 'collectionItem'
            })
        }

        oarepo$.collectionListModule.setApiURL(apiURL)

        oarepo$.collectionModule.setCollectionListModule(oarepo$.collectionListModule)
        oarepo$.collectionItemModule.setCollectionListModule(oarepo$.collectionListModule)
        oarepo$.collectionItemModule.setCollectionModule(oarepo$.collectionModule)

        oarepo$.collectionModule.setValueTranslator(valueTranslator)

        oarepo$.collectionModule.setFacetHandler(facetHandler)

        // setTimeout(() => { oarepo$.collectionModule.setRouter(router); }, 1000);

        if (itemPreprocessors !== undefined) {
            itemPreprocessors.forEach(x => {
                oarepo$.collectionItemModule.registerItemPreprocessor(x)
            })
        }

        Vue.prototype.oarepo$ = oarepo$
        router.afterEach(loaderAfterEach)
    }
}

// Export components individually
export {
    OARepoCollection,
    OARepoItem,
    OARepoCollectionList,
    OARepoFacetList,
    Query,
    CollectionListModule,
    CollectionModule,
    CollectionItemModule,
    InvalidDataException,
    loaderAfterEach,
    OARepo
}
