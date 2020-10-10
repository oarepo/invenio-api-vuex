<template>
  <div class="collections">
    <h1>Records</h1><br>
    <div class="row">
      <div class="col col-8">
        <button v-if="page>1" @click="$query.page = page - 1">prev</button>
        {{ page }} of {{ pages }}
        <button v-if="page<pages" @click="$query.page = page + 1">next</button>
        <br>Filter in effect: {{ currentFilter }}
        <br>
        <br>
        <div v-for="record of records" :key="record.links.self">
          <h3>{{ record.metadata.title.cs }}</h3>
          <div>Creator:
            {{ record.metadata.works && record.metadata.works.length ? record.metadata.works[0].creator : '' }}
          </div>
          <div>Thumbnail: {{ record.metadata.thumbnail }}</div>
          <div>id: {{ record.metadata.id }}</div>
          <!-- router-link :to="record.links.ui">{{ record.metadata.title[0].value }}</router-link -->
        </div>
      </div>
      <div class="col col-4 facets">
        <input placeholder="Enter search query and press enter" v-model="searchInput" @keyup.enter="search"
               style="width: 100%; display: block; margin-bottom: 15px">
        <select v-model="searchTarget">
          <option value="q">
            in all fields
          </option>
          <option v-for="filter in filters" :key="filter.code" :value='filter.code'>
            {{ filter.filter.label }}
          </option>
        </select>
        <br>
        <div>
          <input type="checkbox" v-model="nonEmpty"> Show non-empty only
        </div>
        <div style="padding-bottom: 10px;">
          <input type="checkbox" v-model="onlyOpened"> Load opened only
        </div>
        <facet v-for="facet in currentFacets" :facet="facet" :key="facet.code"
               @opened="facetOpened(facet, $event)"></facet>
      </div>
    </div>
  </div>
</template>

<script>

import Facet from './Facet.vue'
import { FacetMode } from '@oarepo/invenio-api-vuex'

export default {
  name: 'Collections',
  props: {
    loading: Boolean,
    records: Array,
    facets: Array,
    filters: Array,
    pages: Number
  },
  components: {
    'facet': Facet
  },
  data: function () {
    return {
      nonEmpty: true,
      searchInput: '',
      searchTarget: 'q'
    }
  },
  computed: {
    onlyOpened: {
      get () {
        return this.$oarepo.collection.facetMode === FacetMode.SELECTED_FACETS
      },
      set (value) {
        this.$oarepo.collection.setFacetMode(value ? FacetMode.SELECTED_FACETS : FacetMode.ALL_FACETS)
      }
    },
    page () {
      return this.$query.page
    },
    currentFilter () {
      return Object.entries(this.$rawQuery).map(cur => `${cur[0]} = ${cur[1]}`).join(', ')
    },
    currentFacets () {
      if (this.nonEmpty) {
        return this.facets.filter(facet => facet.buckets && facet.buckets.length)
      }
      return this.facets
    }
  },
  watch: {
    searchTarget (current, prev) {
      this.$query[prev] = null
      if (this.searchInput) {
        this.search()
      }
    }
  },
  methods: {
    facetOpened (facet, opened) {
      if (this.onlyOpened) {
        if (opened) {
          this.$query.addValue('facets', facet.code)
        } else {
          this.$query.removeValue('facets', facet.code)
        }
      }
    },
    search () {
      this.$query[this.searchTarget] = this.searchInput
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
