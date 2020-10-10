// import { routerCollection, routerRecord } from '@oarepo/invenio-api-vuex'
import Collections from './components/Collections'
// import Record from './components/Record'
import Collection from './components/Collection'
import InvenioCollection from '../library/components/InvenioCollection'

export default [
    {
        path: '/',
        redirect: '/collections'
    },
    {
        path: '/collections',
        component: Collections
    },
    {
        name: 'restorations/all-objects',
        path: '/objects',
        component: InvenioCollection,
        props: {
            collectionId: 'restorations/all-objects',
            loadedComponent: Collection
        },
        meta: {
            query: {
                page: 'int:1',
                size: 'int:10',
                facets: 'commaarray:',
                q: 'string:'
            }
        }
    },
    // {
    //     name: 'restorations/all-objects',
    //     path: '/objects/:pid',
    //     component: InvenioRecord,
    //     props: {
    //         collectionId: 'restorations/all-objects',
    //         loadedComponent: Record
    //     }
    // },
]
