import deepmerge from 'deepmerge'

function routerCollectionList (pathParams) {
    return deepmerge({
        name: 'oarepoCollectionList',
        meta: {
            preloader: {
                key: 'oarepoCollectionList',
                store: 'oarepoCollectionList',
                action: 'load',
                expiration: 3600
            }
        },
        props: true,
    }, pathParams)
}

function routerCollection (pathParams) {
    return deepmerge({
        name: 'oarepoCollection',
        meta: {
            preloader: {
                key: 'oarepoCollection',
                store: 'oarepoCollection',
                action: 'load',
                params: {
                    collectionId: 'collectionId'
                },
                expiration: 60,
                query: true
            }
        },
        props: true,
    }, pathParams)
}

function routerRecord (pathParams) {
    return deepmerge({
        name: 'oarepoRecord',
        meta: {
            preloader: {
                key: 'oarepoRecord',
                store: 'oarepoRecord',
                action: 'load',
                params: {
                    collectionId: 'collectionId',
                    recordId: 'recordId'
                },
                expiration: 10
            }
        },
        props: true,
    }, pathParams)
}


export {
    routerCollectionList,
    routerCollection,
    routerRecord
}
