// eslint-disable-next-line no-unused-vars

const NOT_A_FACET = 'not-a-facet'

const TranslationOptions = Object.freeze({
    FACET_CODE_PREFIX: 'prefix-name',
    NO_PREFIX: 'no-prefix',
    NO_TRANSLATION: 'no-translation',
    TRANSLATE: 'no-prefix'
})

function bucketExtractor ({ node, path }) {
    if (node.buckets !== undefined) {
        return {
            type: 'buckets',
            code: path[0].code,
            facets: node.buckets.map(x => ({
                label: x.key_as_string !== undefined ? x.key_as_string : x.key,
                value: x.key,
                count: x.doc_count
            })),
            element: node
        }
    }
    return undefined
}

function facetFlattener (aggregations, callbacks, collection) {

    function* inner (node, path) {
        for (const k of Object.keys(node)) {
            const value = node[k]
            if (value === Object(value)) {
                let valuePath = [{ code: k, element: value }, ...path]
                const ret = callbacks.call({ node: value, path: valuePath, store: collection })
                    .filter(x => x !== undefined)
                if (ret.find(x => x === NOT_A_FACET)) {
                    // someone says it is not a facet
                    continue
                }
                if (ret.length > 0) {
                    yield ret[0]
                }
                yield* inner(value, valuePath)
            }
        }
    }

    return Array.from(inner(aggregations, []))
}

function useDefault(defaultTranslate, translate) {
    if (translate !== undefined) {
        return translate
    }
    return defaultTranslate
}

function facetTranslator (facets, { facetOptions, i18n }) {
    const translation = facetOptions.translation
    return facets.map(facet => {
        facet = { ...facet }

        const translationFacetLabelType = useDefault(
            translation.defaultTranslateTitles, (translation.translateTitles || {})[facet.code])

        if (translationFacetLabelType !== TranslationOptions.NO_TRANSLATION) {
            let prefix = ''
            if (translationFacetLabelType !== TranslationOptions.NO_PREFIX) {
                prefix = translationFacetLabelType
            }
            facet.label = i18n(`${prefix}${facet.code}`)
        } else {
            facet.label = facet.code
        }

        const translationFacetValueType = useDefault(
            translation.defaultTranslateValues, (translation.translateValues || {})[facet.code])
        if (translationFacetValueType ===  TranslationOptions.NO_TRANSLATION) {
            return facet
        }

        facet.facets = facet.facets.map(value => {
            let prefix = ''
            if (translationFacetValueType === TranslationOptions.FACET_CODE_PREFIX) {
                prefix = `${facet.code}.`
            } else if (translationFacetValueType !== TranslationOptions.NO_PREFIX) {
                prefix = translationFacetValueType
            }
            return {
                ...value,
                label: i18n(`${prefix}${value.label}`)
            }
        })

        return facet
    })
}

export {
    bucketExtractor,
    facetFlattener,
    facetTranslator,
    NOT_A_FACET,
    TranslationOptions
}
