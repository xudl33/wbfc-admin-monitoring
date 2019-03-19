<template>
	<div id="wbfc-admin-monitoring-container"></div>
</template>
<script type="text/javascript">
import '@/assets/css/base.scss';
import moment from 'moment';
import Vue from 'vue';
import VueRouter from 'vue-router';
import components from '@/components';
import Notifications from '@/notifications';
import sbaShell from '@/shell';
import Store from '@/store';
import ViewRegistry from '@/viewRegistry';
import views from '@/views';

global.SBA = {
  uiSettings: {
    "favicon": './static/img/favicon.png',
    "notificationFilterEnabled":false,
    "title":"Spring Boot Admin",
    "brand":"<img src=\"./static/img/icon-spring-boot-admin.svg\"><span>Spring Boot Admin<\/span>",
    "faviconDanger":"./static/img/favicon-danger.png"
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

export default {
	name: 'wbfc-admin-monitoring',
	props:{
		userAuth: {
			type: Object,
			default: null,
			required: false
		}
	},
	mounted() {
		new Vue({
		  router: new VueRouter({
		    linkActiveClass: 'is-active',
		    routes: viewRegistry.routes
		  }),
		  el: '#wbfc-admin-monitoring-container',
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
		    },
		    setUserAuth(){
		    	if(this.userAuth){
		    		//添加公用 Authorization
					if(!window.sessionStorage){
						this.$alert('您的浏览器版本太低，请使用最新版的Chrome', '提示', {
				            confirmButtonText: '确定'
				        });
				        return;
					}
					// 将认证信息添加到sessionStorage
					var userAuthStr = JSON.stringify(this.userAuth);
					window.sessionStorage.setItem('user-auth', userAuthStr)
		    	}
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
	}
}
</script>
<style type="text/css">
	
</style>