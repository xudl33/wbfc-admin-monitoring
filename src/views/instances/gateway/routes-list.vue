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
  <table class="table routes is-fullwidth is-hoverable">
    <thead>
      <tr>
        <th>Id</th>
        <th>Order</th>
        <th />
      </tr>
    </thead>
    <tbody>
      <template v-for="route in routes">
        <tr class="is-selectable"
            :key="route.route_id"
            @click="showDetails[route.route_id] ? $delete(showDetails, route.route_id) : $set(showDetails, route.route_id, true)"
        >
          <td class="is-breakable" v-text="route.route_id" />
          <td v-text="route.order" />
          <td class="routes__delete-action">
            <sba-confirm-button class="button refresh-button is-light"
                                :class="{'is-loading' : deleting[route.route_id] === 'executing', 'is-danger' : deleting[route.route_id] === 'failed', 'is-info' : deleting[route.route_id] === 'completed'}"
                                :disabled="deleting[route.route_id] === 'executing'"
                                @click.stop="deleteRoute(route.route_id)"
            >
              <span v-if="deleting[route.route_id] === 'completed'">
                Deleted
              </span>
              <span v-else-if="deleting[route.route_id] === 'failed'">
                Failed
              </span>
              <span v-else>
                <font-awesome-icon icon="trash" />&nbsp;Delete
              </span>
            </sba-confirm-button>
          </td>
        </tr>
        <tr v-if="showDetails[route.route_id]" :key="`${route.route_id}-detail`">
          <td colspan="3" class="has-background-white-bis">
            <route-definition
              v-if="route.route_definition"
              :route-definition="route.route_definition"
            />
            <pre
              v-else-if="route.route_object"
              v-text="toJson(route.route_object)"
              class="is-breakable"
            />
            <span
              v-else
              class="is-muted"
            >
              No Route Definition provided.
            </span>
          </td>
        </tr>
      </template>
      <tr v-if="routes.length === 0">
        <td class="is-muted" colspan="3">
          <p v-if="isLoading" class="is-loading">
            Loading Routes...
          </p>
          <p v-else>
            No Routes found.
          </p>
        </td>
      </tr>
    </tbody>
  </table>
</template>
<script>
  import Instance from '../../../services/instance';
  import {from, listen} from '../../../utils/rxjs';
  import RouteDefinition from './route-definition'

  export default {
    components: {RouteDefinition},
    props: {
      instance: {
        type: Instance,
        required: true
      },
      routes: {
        type: Array,
        required: true
      },
      isLoading: {
        type: Boolean,
        default: false
      }
    },
    data: () => ({
      showDetails: {},
      deleting: {}
    }),
    methods: {
      toJson(obj) {
        return JSON.stringify(obj, null, 4);
      },
      deleteRoute(routeId) {
        const vm = this;
        from(vm.instance.deleteGatewayRoute(routeId))
          .pipe(listen(status => vm.$set(vm.deleting, routeId, status)))
          .subscribe({
            complete: () => vm.$emit('route-deleted')
          });
      },
    }
  }
</script>
<style lang="scss">
  .routes {
    td, th {
      vertical-align: middle;
    }

    &__delete-action {
      text-align: right;
    }
  }
</style>
