<template>
  <section class="section" :class="{isLoading: isLoading}">
      <div v-if="error" class="message is-danger" >
        <div class="message-body">
          <strong>
            <font-awesome-icon
              class="has-text-danger"
              icon="exclamation-triangle"
            />
            Fetching conditions failed.
          </strong>
          <p v-text="error.message" />
        </div>
      </div>
      <div class="field">
        <p class="control is-expanded has-icons-left">
          <input
            class="input"
            type="search"
            v-model="filter"
          >
          <span class="icon is-small is-left">
            <font-awesome-icon icon="filter" />
          </span>
        </p>
      </div>
	  <features-list :beans="filteredContexts" />
  </section>
</template>

<script>
  import Instance from '../../../services/instance';
  import {compareBy} from '../../../utils/collections';
  import shortenClassname from '../../../utils/shortenClassname';
  import FeaturesList from './features-list';
  import isEmpty from 'lodash/isEmpty';

  export default {
    components: {FeaturesList},
    props: {
      instance: {
        type: Instance,
        required: true
      }
    },
    data: () => ({
      isLoading: false,
      error: null,
      contexts: {},
      filter: '',
    }),
    computed: {
      filteredContexts() {
        const filterFn = this.getFilterFn();
/*
        return this.contexts.map(ctx => ({
          ...ctx,
          conditions: ctx.filter(filterFn).sort(compareBy(bean => bean.name))
        }));*/
        /*var res = Object.keys(this.contexts).map((key) => {
          var ctx = this.contexts[key];
          //console.log("ctx = %o", ctx);
          return ctx.filter(filterFn).sort(compareBy(bean => bean.name));
        });*/

        var res = {
        	enabled: this.contexts.enabled?this.contexts.enabled.filter(filterFn).sort(compareBy(bean => bean.name)):[],
        	disabled: this.contexts.disabled?this.contexts.disabled.filter(filterFn).sort(compareBy(bean => bean.name)):[]
        };
        //console.log("context = %o , res = %o", this.contexts, res);
        return res;
      }
    },
    methods: {
      getFilterFn() {
        if (!this.filter) {
          return () => true;
        }
        const regex = new RegExp(this.filter, 'i');
        return bean => (bean.name.match(regex) || bean.type.match(regex));
      },
      async fetchFeatures() {
        this.error = null;
        this.isLoading = true;
        try {
          const res = await this.instance.fetchFeatures();
          this.contexts = res.data;
        } catch (error) {
          console.warn('Fetching features failed:', error);
          this.error = error;
        }
        this.isLoading = false;
      }
    },
    created() {
      this.fetchFeatures();
    },
    install({viewRegistry}) {
      viewRegistry.addView({
        name: 'instances/features',
        parent: 'instances',
        path: 'features',
        group: 'Insights',
        component: this,
        label: 'Features',
        order: 105,
        isEnabled: ({instance}) => instance.hasEndpoint('features')
      });
    }
  }
</script>

