import { routerCollectionList, routerCollection, routerRecord } from '@oarepo/invenio-api'
import Collections from './components/Collections'
import Record from './components/Record'
import Collection from './components/Collection'
import { query } from '@oarepo/vue-query-synchronizer'

export default [
    {
        path: '/',
        redirect: '/collections'
    },
    routerCollectionList({
        path: '/collections',
        component: Collections
    }),
    routerRecord({
        path: '/:collectionId/:recordId',
        component: Record
    }),
    routerCollection({
        path: '/:collectionId',
        component: Collection,
        props: query()
    })
]
