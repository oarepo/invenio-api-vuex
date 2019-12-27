<template>
<div class="collections">
    Collections
    <ul>
        <li v-for="collection of collections" :key="collection.code">
            <router-link :to="{'name': 'oarepoCollection', params: {collectionId: collection.code}}">{{ collection.title['en-us'] }}</router-link><br>
            <p>{{collection.description['en-us']}}</p>
        </li>
    </ul>
</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'Collections',
    props: {},
    computed: {
        ...mapState({
            collections: state => state.oarepoCollectionList.collections
        })
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
