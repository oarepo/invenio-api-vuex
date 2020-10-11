import deepmerge from 'deepmerge'
import InvenioCollection from './components/InvenioCollection.vue'
import InvenioRecord from './components/InvenioRecord.vue'


function collection (path, collectionId, component, extra = {}) {
    return deepmerge({
        name: collectionId,
        path: path,
        component: InvenioCollection,
        props: {
            collectionId,
            loadedComponent: component
        },
        meta: {
            query: {
                page: 'int:1',
                size: 'int:10',
                facets: 'commaarray:',
                q: 'string:'
            }
        }
    }, extra)
}

function record (path, collectionId, component, extra = {}) {
    return deepmerge({
        name: `${collectionId}/record`,
        path: `${path}/:recordId`,
        component: InvenioRecord,
        props: {
            collectionId,
            loadedComponent: component
        }
    }, extra)
}


export {
    collection,
    record
}
