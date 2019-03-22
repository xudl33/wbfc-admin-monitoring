/*
 * Copyright 2014-2018 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Vue from 'vue';
import App from './App'
/*import router from './router'*/
import VueRouter from 'vue-router';

Vue.config.productionTip = false

/*Vue.use(router);*/

/* eslint-disable no-new */
new Vue({
  el: '#app',
/*  router,*/
  components: { App },
  template: '<App/>'
})

/*import components from './components';
import Notifications from './notifications';
import sbaShell from './shell';
import Store from './store';
import ViewRegistry from './viewRegistry';
import views from './views';

global.SBA = {
  uiSettings: {
    "favicon": 'static/img/favicon.png',
    "notificationFilterEnabled":false,
    "title":"Spring Boot Admin",
    "brand":"<img src=\"static/img/icon-spring-boot-admin.svg\"><span>Spring Boot Admin<\/span>",
    "faviconDanger":"static/img/favicon-danger.png"
  },
  user: {"name":"admin"},
  extensions: [],
  csrf: {
      parameterName: "_csrf",
      headerName: "X-XSRF-TOKEN"
  },
  use: function (ext) {
      this.extensions.push(ext);
    }
};

global.__PROJECT_VERSION__ = '2.1.3';

moment.locale(window.navigator.language);
Vue.use(VueRouter);
Vue.use(components);

const applicationStore = new Store();
const viewRegistry = new ViewRegistry();

const installables = [
  Notifications,
  ...views,
  ...global.SBA.extensions
];

installables.forEach(view => view.install({
  viewRegistry,
  applicationStore,
  vue: Vue
}));

new Vue({
  router: new VueRouter({
    linkActiveClass: 'is-active',
    routes: viewRegistry.routes
  }),
  el: '#app',
  render(h) {
    //console.log(h);
    return h(sbaShell, {
      props: {
        views: this.views,
        applications: this.applications,
        applicationsInitialized: this.applicationsInitialized,
        error: this.error
      }
    });
  },
  data: {
    views: viewRegistry.views,
    applications: applicationStore.applications,
    applicationsInitialized: false,
    error: null
  },
  methods: {
    onError(error) {
      //console.warn('Connection to server failed:', error);
      this.applicationsInitialized = true;
      this.error = error;
    },
    onConnected() {
      this.applicationsInitialized = true;
      this.error = null;
    }
  },
  created() {
    applicationStore.addEventListener('connected', this.onConnected);
    applicationStore.addEventListener('error', this.onError);
    applicationStore.start();
  },
  beforeDestroy() {
    applicationStore.stop();
    applicationStore.removeEventListener('connected', this.onConnected);
    applicationStore.removeEventListener('error', this.onError)
  }
});
*/