<!--
  - Copyright 2014-2019 the original author or authors.
  -
  - Licensed under the Apache License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License.
  - You may obtain a copy of the License at
  -
  -     http://www.apache.org/licenses/LICENSE-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -->

<template>
  <div :class="{ 'is-loading' : isLoading }">
    <div v-if="error" class="message is-danger">
      <div class="message-body">
        <strong>
          <font-awesome-icon class="has-text-danger" icon="exclamation-triangle" />
          Fetching Global Filters failed.
        </strong>
        <p v-text="error.message" />
      </div>
    </div>

    <sba-panel :header-sticks-below="['#navigation']" title="Global Filters">
      <div class="field" v-if="globalFilters.length > 0">
        <p class="control is-expanded has-icons-left">
          <input
            class="input"
            type="search"
            v-model="filterCriteria"
          >
          <span class="icon is-small is-left">
            <font-awesome-icon icon="filter" />
          </span>
        </p>
      </div>

      <table class="table is-fullwidth">
        <thead>
          <tr>
            <th>Filter name</th>
            <th>Order</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="filter in globalFilters" :key="filter.name">
            <td>
              <span
                v-text="filter.name"
                class="is-breakable"
              />
              <span
                class="is-muted"
                v-text="`@${filter.objectId}`"
              />
            </td>
            <td v-text="filter.order" />
          </tr>
          <tr v-if="globalFilters.length === 0">
            <td class="is-muted" colspan="7 ">
              <p v-if="isLoading" class="is-loading">
                Loading Global Filters...
              </p>
              <p v-else>
                No Global Filters found.
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </sba-panel>
  </div>
</template>

<script>
  import Instance from '../../../services/instance';
  import {compareBy} from '../../../utils/collections';

  const globalFilterHasKeyword = (globalFilter, keyword) => {
    return globalFilter.name.toString().toLowerCase().includes(keyword);
  };

  const sortGlobalFilter = globalFilters => {
    return [...globalFilters].sort(compareBy(f => f.order))
  };

  export default {
    props: {
      instance: {
        type: Instance,
        required: true
      }
    },
    data: () => ({
      isLoading: false,
      error: null,
      _globalFilters: [],
      filterCriteria: null,
    }),
    computed: {
      globalFilters() {
        if (!this.filterCriteria) {
          return sortGlobalFilter(this.$data._globalFilters);
        }
        const filtered = this.$data._globalFilters.filter(globalFilter => globalFilterHasKeyword(globalFilter, this.filterCriteria.toLowerCase()));
        return sortGlobalFilter(filtered);
      }
    },
    created() {
      this.fetchGlobalFilters();
    },
    methods: {
      async fetchGlobalFilters() {
        this.error = null;
        this.isLoading = true;
        try {
          const response = await this.instance.fetchGatewayGlobalFilters();
          this.$data._globalFilters =  Object.entries(response.data).map (([name, order]) => {
            const [className, objectId] = name.split('@');
            return {
              name: className,
              objectId,
              order
            }
          });
        } catch (error) {
          console.warn('Fetching global filters failed:', error);
          this.error = error;
        }
        this.isLoading = false;
      }
    }
  }
</script>
