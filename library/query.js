function facetQuerySynchronization (facets, query) {
    return facets.map(f => {
        query._prop(`array:${f.code}`)
        return {
            ...f,
            facets: f.facets.map(facet => {
                const ret = {
                    ...facet
                }
                Object.defineProperty(ret, 'model', {
                    get: function () {
                        return query[f.code].includes(facet.value.toString())
                    },
                    set: function (value) {
                        if (value) {
                            query._insert(f.code, facet.value)
                        } else {
                            query._remove(f.code, facet.value)
                        }
                    }
                })
                return ret
            })
        }
    })
}

export {
    facetQuerySynchronization
}
