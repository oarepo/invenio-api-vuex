import deepmerge from 'deepmerge'

function routerCollectionList (pathParams) {
    return deepmerge({
        name: 'oarepoCollectionList',
        meta: {
            preloader: {
                store: 'oarepoCollectionList',
                action: 'load',
                expiration: 3600
            }
        }
    }, pathParams)
}

function routerCollection (pathParams) {
    return deepmerge({
        name: 'oarepoCollection',
        meta: {
            preloader: {
                store: 'oarepoCollection',
                action: 'load',
                params: {
                    collectionId: 'collectionId'
                },
                expiration: 60,
                query: true
            }
        }
    }, pathParams)
}

function routerRecord (pathParams) {
    return deepmerge({
        name: 'oarepoRecord',
        meta: {
            preloader: {
                store: 'oarepoRecord',
                action: 'load',
                params: {
                    collectionId: 'collectionId',
                    recordId: 'recordId'
                },
                expiration: 10
            }
        }
    }, pathParams)
}


export {
    routerCollectionList,
    routerCollection,
    routerRecord
}
