<template>
<div>
    <slot v-bind:collections="collections">
        <router-view/>
    </slot>
</div>
</template>

<script>

import Vue from 'vue';
import Component from 'vue-class-component';

export default @Component({
})
class OARepoCollectionList extends Vue {
    // getters
    get collections() {
        return this.oarepo$.collectionListModule.collections;
    }

    mounted() {
        this.oarepo$.collectionListModule.loadCollections();
    }
}
</script>
