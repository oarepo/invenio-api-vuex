import { bucketExtractor, facetFlattener, facetTranslator, TranslationOptions } from '../../library/store/facets'
import { expect } from 'chai'
import { CallbackList, FacetOptions, NOT_A_FACET } from '../../library/store/config'


describe('Bucket Selector', () => {

    it('Bucket Selector finds top-level bucket', async () => {
        const el = {
            buckets: [
                {
                    doc_count: 33,
                    key: 1,
                    key_as_string: 'true'
                },
                {
                    doc_count: 161,
                    key: 0,
                    key_as_string: 'false'
                }
            ],
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0
        }
        const facets = [
            {
                count: 33,
                value: 1,
                label: 'true'
            },
            {
                count: 161,
                value: 0,
                label: 'false'
            }
        ]
        expect(bucketExtractor({
            node: el,
            path: [{
                code: 'archaelogic',
                element: 'aa'
            }]
        })).to.eql({
            type: 'buckets',
            code: 'archaelogic',
            facets: facets,
            element: el
        })
    })

    it('Bucket Selector returns undefined on no bucket at all', async () => {
        expect(bucketExtractor({
            node: {
                doc_count_error_upper_bound: 0,
                sum_other_doc_count: 0
            },
            path: [{ code: 'archaelogic', element: null }]
        })).to.equal(undefined)
    })

    it('Bucket Selector returns undefined on nested bucket', async () => {
        expect(bucketExtractor({
                node: {
                    blah: {
                        buckets: [
                            {
                                doc_count: 33,
                                key: 1,
                                key_as_string: 'true'
                            },
                            {
                                doc_count: 161,
                                key: 0,
                                key_as_string: 'false'
                            }
                        ],
                        doc_count_error_upper_bound: 0,
                        sum_other_doc_count: 0
                    }
                },
                path: [{ code: 'archaelogic', element: null }]
            })
        ).to.equal(undefined)
    })
})

describe('facetFlattener', () => {
    const aggs = {
        archeologic: {
            buckets: [
                {
                    doc_count: 33,
                    key: 1,
                    key_as_string: 'true'
                },
                {
                    doc_count: 161,
                    key: 0,
                    key_as_string: 'false'
                }
            ],
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0
        },
        category: {
            buckets: [
                {
                    doc_count: 73,
                    key: 'textil'
                },
                {
                    doc_count: 11,
                    key: 'sklo'
                },
                {
                    doc_count: 92,
                    key: 'kovy'
                },
                {
                    doc_count: 18,
                    key: 'keramika'
                }
            ],
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0
        }
    }

    const itemType = {
        itemType: {
            doc_count: 226,
            'itemType.title.value.keyword': {
                buckets: [
                    {
                        doc_count: 11,
                        key: 'zbraň'
                    }
                ],
                doc_count_error_upper_bound: 0,
                sum_other_doc_count: 0
            }
        }
    }

    const archeologicFacets = [
        {
            count: 33,
            value: 1,
            label: 'true'
        },
        {
            count: 161,
            value: 0,
            label: 'false'
        }
    ]

    const categoryFacets = [
        {
            count: 73,
            label: 'textil',
            value: 'textil'
        },
        {
            count: 11,
            label: 'sklo',
            value: 'sklo'
        },
        {
            count: 92,
            label: 'kovy',
            value: 'kovy'
        },
        {
            count: 18,
            label: 'keramika',
            value: 'keramika'
        }
    ]
    const itemTypeFacets = [
        {
            count: 11,
            label: 'zbraň',
            value: 'zbraň'
        }
    ]


    it('Facet Flattener returns top-level facets in order', async () => {
        const callbacks = new CallbackList(bucketExtractor)
        const ret = facetFlattener(aggs, callbacks)
        expect(ret).to.eql([
            {
                type: 'buckets',
                code: 'archeologic',
                facets: archeologicFacets,
                element: aggs.archeologic
            },
            {
                type: 'buckets',
                code: 'category',
                facets: categoryFacets,
                element: aggs.category
            }

        ])
    })

    it('Facet Flattener ignores unwanted facets', async () => {
        const callbacks = new CallbackList(bucketExtractor, ({ path }) => {
            if (path[0].code === 'archeologic') {
                return NOT_A_FACET
            }
        })
        const ret = facetFlattener(aggs, callbacks)
        expect(ret).to.eql([
            {
                type: 'buckets',
                code: 'category',
                facets: categoryFacets,
                element: aggs.category
            }

        ])
    })

    it('Facet Flattener returns nested facets', async () => {
        const callbacks = new CallbackList(bucketExtractor)
        const ret = facetFlattener({ something: { another: aggs } }, callbacks)
        expect(ret).to.eql([
            {
                type: 'buckets',
                code: 'archeologic',
                facets: archeologicFacets,
                element: aggs.archeologic
            },
            {
                type: 'buckets',
                code: 'category',
                facets: categoryFacets,
                element: aggs.category
            }

        ])
    })


    it('Facet Flattener returns buckets for ES nested objects', async () => {
        const callbacks = new CallbackList(bucketExtractor)
        const ret = facetFlattener({ ...aggs, itemType }, callbacks)
        expect(ret).to.eql([
            {
                type: 'buckets',
                code: 'archeologic',
                facets: archeologicFacets,
                element: aggs.archeologic
            },
            {
                type: 'buckets',
                code: 'category',
                facets: categoryFacets,
                element: aggs.category
            },
            {
                type: 'buckets',
                code: 'itemType.title.value.keyword',
                facets: itemTypeFacets,
                element: itemType.itemType['itemType.title.value.keyword']
            }
        ])
    })
})

describe('facet value translator', () => {
    const facets = [
        {
            type: 'buckets',
            code: 'archeologic',
            facets: [
                {
                    count: 33,
                    value: 1,
                    label: 'true'
                },
                {
                    count: 161,
                    value: 0,
                    label: 'false'
                }
            ]
        },
        {
            type: 'buckets',
            code: 'type',
            facets: [
                {
                    count: 33,
                    value: 1,
                    label: 'true'
                }
            ]
        }
    ]


    const expectedTranslated = [
        {
            type: 'buckets',
            code: 'archeologic',
            label: 'archeologic',
            facets: [
                {
                    count: 33,
                    value: 1,
                    label: 'ano'
                },
                {
                    count: 161,
                    value: 0,
                    label: 'ne'
                }
            ]
        },
        {
            type: 'buckets',
            code: 'type',
            label: 'type',
            facets: [
                {
                    count: 33,
                    value: 1,
                    label: 'true'
                }
            ]
        }
    ]

    const expectedTranslated2 = [
        {
            type: 'buckets',
            code: 'archeologic',
            label: 'archeologicky nalez',
            facets: [
                {
                    count: 33,
                    value: 1,
                    label: 'ano'
                },
                {
                    count: 161,
                    value: 0,
                    label: 'ne'
                }
            ]
        },
        {
            type: 'buckets',
            code: 'type',
            label: 'type',
            facets: [
                {
                    count: 33,
                    value: 1,
                    label: 'true'
                }
            ]
        }
    ]

    it('Value translator translates no prefix', () => {
        const translated = facetTranslator(facets, {
            facetOptions: new FacetOptions({
                defaultTranslateValues: TranslationOptions.NO_TRANSLATION,
                defaultTranslateTitles: TranslationOptions.NO_TRANSLATION,
                translateValues: { 'archeologic': TranslationOptions.NO_PREFIX }
            }),
            i18n (arg) {
                if (arg === 'true') {
                    return 'ano'
                }
                if (arg === 'false') {
                    return 'ne'
                }
                throw new Error(`Bad translation param ${arg}`)
            }
        })
        expect(translated).to.eql(expectedTranslated)
    })

    it('Value translator translates no prefix 2', () => {
        const translated = facetTranslator(facets, {
            facetOptions: new FacetOptions({
                defaultTranslateValues: TranslationOptions.NO_TRANSLATION,
                defaultTranslateTitles: TranslationOptions.NO_TRANSLATION,
                translateValues: { 'archeologic': TranslationOptions.TRANSLATE }
            }),
            i18n (arg) {
                if (arg === 'true') {
                    return 'ano'
                }
                if (arg === 'false') {
                    return 'ne'
                }
                throw new Error(`Bad translation param ${arg}`)
            }
        })
        expect(translated).to.eql(expectedTranslated)
    })

    it('Value translator translates facet prefix', () => {
        const translated = facetTranslator(facets, {
            facetOptions: new FacetOptions({
                defaultTranslateValues: TranslationOptions.NO_TRANSLATION,
                defaultTranslateTitles: TranslationOptions.NO_TRANSLATION,
                translateValues: { 'archeologic': TranslationOptions.FACET_CODE_PREFIX }
            }),
            i18n (arg) {
                if (arg === 'archeologic.true') {
                    return 'ano'
                }
                if (arg === 'archeologic.false') {
                    return 'ne'
                }
                throw new Error(`Bad translation param ${arg}`)
            }
        })
        expect(translated).to.eql(expectedTranslated)
    })


    it('Value translator translates facet code', () => {
        const translated = facetTranslator(facets, {
            facetOptions: new FacetOptions({
                defaultTranslateValues: TranslationOptions.NO_TRANSLATION,
                defaultTranslateTitles: TranslationOptions.TRANSLATE,
                translateValues: { 'archeologic': TranslationOptions.TRANSLATE },
                translateTitles: {
                    'type': TranslationOptions.NO_TRANSLATION
                }
            }),
            i18n (arg) {
                if (arg === 'archeologic') {
                    return 'archeologicky nalez'
                }
                if (arg === 'true') {
                    return 'ano'
                }
                if (arg === 'false') {
                    return 'ne'
                }
                throw new Error(`Bad translation param ${arg}`)
            }
        })
        expect(translated).to.eql(expectedTranslated2)
    })
})
