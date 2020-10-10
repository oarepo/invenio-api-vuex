<template>
  <div class="facet">
    <div class="facet-header row">
      <div class="facet-title col">{{ facet.label }}</div>
      <button class="facet-opener" @click="toggleOpen">
        <span v-if="open" title="close">
          <i class="fas fa-angle-up"></i>
        </span>
        <span v-else title="open">
          <i class="fas fa-angle-down"></i>
        </span>
      </button>
    </div>
    <div class="facet-body" v-if="open">
      <div v-for="bucket in facet.buckets" :key="bucket.key" class="facet-bucket">
        <input type="checkbox" class="facet-bucket-checkbox" v-model="model" :value="bucket.key">
        <span class="facet-bucket-label">{{ bucket.label || bucket.key_as_string || bucket.key }}</span>
        <span class="facet-bucket-count">{{ bucket.doc_count }}</span>
      </div>
    </div>
  </div>
</template>

<script>

import { FacetMixin } from '@oarepo/invenio-api-vuex'

export default {
  name: 'Facet',
  mixins: [
    FacetMixin
  ],
  emits: [
      'opened'
  ],
  methods: {
    toggleOpen () {
      this.open = !this.open
      this.$emit('opened', this.open)
    }
  }
}
</script>

<style>
</style>
