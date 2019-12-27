import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import moxios from 'moxios'
import { ConfigModule } from '@oarepo/invenio-api-vuex'
import { expect } from 'chai'
import { RecordModule } from '../../library/store/record'

describe('RecordModule', () => {

    beforeEach(function () {
        // import and pass your custom axios instance to this method
        moxios.install()
    })

    afterEach(function () {
        // import and pass your custom axios instance to this method
        moxios.uninstall()
    })

    function makeStore () {
        const localVue = createLocalVue()
        localVue.use(Vuex)
        const store = new Vuex.Store({})
        const api = new ConfigModule({
            store,
            name: 'oarepo-api'
        })

        const record = new RecordModule(
            api,
            {
                store,
                name: 'oarepo-record'
            }
        )
        api.apiURL = '/api'
        return {
            localVue,
            store,
            api,
            record
        }
    }

    it('Record store exists', async () => {
        const { record } = makeStore()
        expect(record.loaded).to.equal(false)
        expect(record.metadata).to.eql({})
        expect(record.links).to.eql({})
        expect(record.created).to.eql(null)
        expect(record.updated).to.eql(null)
        expect(record.record).to.eql({})
    })

    it('Record store loads', async () => {
        const { record } = makeStore()
        const expectedResponse = {
            created: 'cr',
            updated: 'up',
            metadata: {
                title: 'aaa',
                id: 1
            },
            links: {
                self: 'slf'
            }
        }
        moxios.stubOnce('GET', '/api/records/1', {
            status: 200,
            responseText: JSON.stringify(
                expectedResponse
            ),
            contentType: 'application/json'
        })

        const resp = await record.load({ collectionId: 'records', recordId: 1 })

        // noinspection DuplicatedCode
        expect(resp).to.eql(expectedResponse)
        expect(record.metadata).to.eql(expectedResponse.metadata)
        // expect(record.created).to.eql(expectedResponse.created)
        // expect(record.updated).to.eql(expectedResponse.updated)
        expect(record.links).to.eql(expectedResponse.links)
    })

    it('Record store patches', async () => {
        const { record } = makeStore()
        const expectedResponse = {
            created: 'cr',
            updated: 'up',
            metadata: {
                title: 'aaa',
                id: 1
            },
            links: {
                self: 'slf'
            }
        }
        moxios.stubOnce('PATCH', '/api/records/1', {
            status: 200,
            responseText: JSON.stringify(
                expectedResponse
            ),
            contentType: 'application/json'
        })

        record.collectionId = 'records'
        record.recordId = 1
        const resp = await record.patch([{ op: 'replace', path: '/title', value: 'aaa' }])

        // noinspection DuplicatedCode
        expect(resp).to.eql(expectedResponse)
        expect(record.metadata).to.eql(expectedResponse.metadata)
        // expect(record.created).to.eql(expectedResponse.created)
        // expect(record.updated).to.eql(expectedResponse.updated)
        expect(record.links).to.eql(expectedResponse.links)

        const request = moxios.requests.mostRecent()
        expect(request.config.data).to.eql(JSON.stringify([{ op: 'replace', path: '/title', value: 'aaa' }]))
        expect(request.config.headers['Content-Type']).to.eql('application/json-patch+json')
    })


    it('Record store saves', async () => {
        const { record } = makeStore()
        const expectedResponse = {
            created: 'cr',
            updated: 'up',
            metadata: {
                title: 'aaa',
                id: 1
            },
            links: {
                self: 'slf'
            }
        }
        moxios.stubOnce('POST', '/api/records/1', {
            status: 200,
            responseText: JSON.stringify(
                {
                    ...expectedResponse,
                    metadata: {
                        title: 'bbb',
                        id: 1
                    }
                }
            ),
            contentType: 'application/json'
        })

        record.collectionId = 'records'
        record.recordId = 1
        record.setResponse({data: expectedResponse})

        const resp = await record.save()

        // noinspection DuplicatedCode
        expect(resp).to.eql({
            ...expectedResponse,
            metadata: {
                title: 'bbb',
                id: 1
            }
        })
        expect(record.metadata).to.eql({
            title: 'bbb',
            id: 1
        })
        // expect(record.created).to.eql(expectedResponse.created)
        // expect(record.updated).to.eql(expectedResponse.updated)
        expect(record.links).to.eql(expectedResponse.links)

        const request = moxios.requests.mostRecent()
        expect(request.config.data).to.eql(JSON.stringify(expectedResponse.metadata))
        expect(request.config.headers['Content-Type']).to.eql('application/json')
    })
})
