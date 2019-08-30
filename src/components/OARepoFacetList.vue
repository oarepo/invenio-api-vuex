<template>
<div>
    <slot v-bind:facets="facets">
    </slot>
</div>
</template>

<script>
import Vue from 'vue'
import Component from 'vue-class-component'

export default @Component({
    name: 'oarepo-facet-list',
    props: {
        facets: Object
    }
})
class OARepoFacetList extends Vue {
    facetSelected (bucketP, selected) {
        const bucket = bucketP
        if (selected) {
            this.oarepo$.collectionModule.facetSelected(
                {
                    facet: bucket.facet,
                    key: bucket.key,
                    bucket: bucket
                }
            )
        } else {
            this.oarepo$.collectionModule.facetDeselected(
                {
                    facet: bucket.facet,
                    key: bucket.key,
                    bucket: bucket
                }
            )
        }
    }
}
</script>

<style>

</style>
