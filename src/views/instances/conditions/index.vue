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
  <section class="section" :class="{isLoading: isLoading}">
    <div class="container">
      <div
        v-if="error"
        class="message is-danger"
      >
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
      <template v-for="context in filteredContexts">
        <h3 class="title" v-text="context.name" :key="context.name" />
        <conditions-list :beans="context" :key="`${context.name}-beans`" />
      </template>
    </div>
  </section>
</template>

<script>
  import Instance from '../../../services/instance';
  import {compareBy} from '../../../utils/collections';
  import shortenClassname from '../../../utils/shortenClassname';
  import ConditionsList from './conditions-list';
  import isEmpty from 'lodash/isEmpty';

  class Conditions {
    constructor(name, bean) {
      this.name = name;
      this.value = bean;
    }
  }

  class ClazzArray {
    constructor(str) {
      this.name = str;
      /*this.shortName = shortenClassname(this.name, 80);*/
    }
  }

  const flattenConditions = beans => {
    return Object.keys(beans)
      .map((key) => {
        return new Conditions(key, beans[key]);
      });
  };

  const flattenClazzArray = beans => {
    if(beans && beans.length > 0){
      return beans.map((str) => {
        return new ClazzArray(str);
      });
    }
    return [];
  };

  const flattenContexts = beanData => {
    if (isEmpty(beanData.contexts)) {
      return [];
    }
    /*console.log(beanData.contexts['application-1'].unconditionalClasses.map((str) => {
        return new ClazzArray(str);
      }));*/
    // 转换JSON格式 将参数都转为数组，以便filter搜索和sort排序
    return Object.keys(beanData.contexts)
      .map((key) => ({
        positiveMatches: flattenConditions(beanData.contexts[key].positiveMatches),
        negativeMatches: flattenConditions(beanData.contexts[key].negativeMatches),
        exclusions: flattenClazzArray(beanData.contexts[key].exclusions),
        unconditionalClasses: flattenClazzArray(beanData.contexts[key].unconditionalClasses),
        name: key,
        parent: beanData.contexts[key].parentId
      }));
  };

  export default {
    components: {ConditionsList},
    props: {
      instance: {
        type: Instance,
        required: true
      }
    },
    data: () => ({
      isLoading: false,
      error: null,
      contexts: [],
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
        return Object.keys(this.contexts).map((key) => {
          var ctx = this.contexts[key];
          var pm = ctx.positiveMatches.filter(filterFn).sort(compareBy(bean => bean.name));
          var nm = ctx.negativeMatches.filter(filterFn).sort(compareBy(bean => bean.name));
          var ex = ctx.exclusions.filter(filterFn).sort();
          var nc = ctx.unconditionalClasses.filter(filterFn).sort();
          var res = {};
          return {
            positiveMatches: pm,
            negativeMatches: nm,
            exclusions: ex,
            unconditionalClasses: nc,
            name: ctx.name,
            parent: ctx.parent
          }
        });
      }
    },
    methods: {
      getFilterFn() {
        if (!this.filter) {
          return () => true;
        }
        const regex = new RegExp(this.filter, 'i');
        return bean => (bean.name.match(regex));
      },
      async fetchConditions() {
        this.error = null;
        this.isLoading = true;
        try {
          const res = await this.instance.fetchConditions();
          this.contexts = flattenContexts(res.data);
        } catch (error) {
          console.warn('Fetching beans failed:', error);
          this.error = error;
        }
        this.isLoading = false;
      }
    },
    created() {
      this.fetchConditions();
    },
    install({viewRegistry}) {
      viewRegistry.addView({
        name: 'instances/conditions',
        parent: 'instances',
        path: 'conditions',
        group: 'Insights',
        component: this,
        label: 'Conditions',
        order: 110,
        isEnabled: ({instance}) => instance.hasEndpoint('conditions')
      });
    }
  }
</script>

