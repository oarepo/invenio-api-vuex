<template>
<div class="container" v-if="loaded">

    <slot v-bind:items="items" v-bind:aggregations="aggregations" v-bind:collection="collection">
        <router-view/>
    </slot>

</div>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch, Emit } from 'vue-property-decorator';
import OARepoFacetList from './OARepoFacetList.vue';

export default @Component({
    props: {
        collectionCode: String,
        locale: String,
    },
    components: {
        'oarepo-facet-list': OARepoFacetList,
    },
    name: 'oarepo-collection',
})
class OARepoCollection extends Vue {
    // getters
    get loaded() {
        return this.oarepo$.collectionModule.collectionListModule.loaded && this.collectionCode;
    }

    get collection() {
        console.log('collection returning', this.collectionCode, this.oarepo$.collectionModule.collectionListModule.collections,
            this.oarepo$.collectionModule.collectionListModule.collections.find(
                value => value.code === this.collectionCode,
            ));
        return this.oarepo$.collectionModule.collectionListModule.collections.find(
            value => value.code === this.collectionCode,
        );
    }

    get aggregations() {
        return this.oarepo$.collectionModule.aggregations;
    }

    get items() {
        return this.oarepo$.collectionModule.items;
    }

    @Emit('dataLoaded')
    reloadData() {
        console.log('Loading', this.collectionCode);
        return new Promise((resolve) => {
            this.oarepo$.collectionModule.collectionListModule.loadCollections().then(
                () => {
                    this.oarepo$.collectionModule.search({
                        collectionDefinition: this.collection,
                        params: this.$route.query,
                    }).then(({ append }) => {
                        resolve({
                            append,
                        });
                    });
                },
            );
        });
    }

    mounted() {
        this.reloadData();
    }

    @Watch('locale')
    onLocaleChanged(locale) {
        this.oarepo$.collectionModule.changeLocale(locale);
    }

    @Watch('$route')
    onQueryChanged() {
        this.reloadData();
    }
}
</script>

<style>
</style>
