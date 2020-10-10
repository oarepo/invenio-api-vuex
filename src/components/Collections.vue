<template>
  <div class="collections">
    <h1>Indices</h1>
    <div v-for="(index, indexName) in indices" :key="indexName">
      <h2>{{ indexName }}</h2>
      <div v-for="(endpoint, endpointName) in index.endpoints" :key="endpointName" class="endpoint">
        <h3>Running at endpoint {{ endpointName }}</h3>
        <div class="links">
          <router-link :to="{'name': endpointName}">User interface</router-link>
          <br>
          <a :href="endpoint.url" target="_blank">Link to API</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.collections {
  line-height: 150%;
}

.endpoint {
  margin-left: 3em;
}

.links {
  margin-left: 3em;
}
</style>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Collections',
  props: {},
  computed: {
    ...mapState({
      indices: state => state.oarepoIndices.indices
    })
  }
}
</script>
