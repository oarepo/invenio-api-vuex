import { ArrayDatatype } from '@oarepo/vue-query-synchronizer'

const FacetMixin = {
    props: {
        facet: Object
    },
    data: function () {
        return {
            'open': this.facet.filtered
        }
    },
    computed: {
        model: {
            get () {
                this.checkDatatype()
                return this.$query[this.facet.code]
            },
            set (value) {
                this.checkDatatype()
                this.$query[this.facet.code] = value || []
            }
        }
    },
    methods: {
        checkDatatype () {
            const datatype = this.$query.__self.params[this.facet.code]
            if (datatype !== ArrayDatatype) {
                this.$query.define(this.facet.code, ArrayDatatype, [])
            }
        }
    }
}

export default FacetMixin
