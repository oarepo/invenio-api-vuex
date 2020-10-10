import deepmerge from 'deepmerge'



function routerCollection (collectionId, pathParams) {
    return deepmerge({
        name: collectionId,
        meta: {
            preloader: {
                key: 'oarepoCollection',
                store: 'oarepoCollection',
                action: 'load',
                expiration: 60,
                query: true
            },
        },
        props: {
            default: true,
            collectionId
        }
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
        props: true
    }, pathParams)
}


export {
    routerCollection,
    routerRecord
}
