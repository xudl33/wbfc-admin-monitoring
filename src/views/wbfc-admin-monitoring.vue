<template>
	<div>
		<div id="wbfc-admin-monitoring-container"></div>
	</div>
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
import ApplicationContext from '@/services/applicationContext';

global.SBA = {
  uiSettings: {
    "favicon": './static/img/favicon.png',
    "notificationFilterEnabled":false,
    "title":"Spring Boot Admin",
    "brand":"<img src=\"./static/img/icon-spring-boot-admin.svg\"><span>${title}<\/span>",
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
		contextId: { // 上下文ID
			type: String,
			default: 'wbfc-admin-monitoring-id',
			required: true
		},
		userAuth: {
			type: Object, // 接口认证信息 支持basic和oauth
			default: null,
			required: false
		},
		heartInterval: { // 心跳间隔
			type: Number,
			default: 10,
			required: false
		},
		title: {
			type: String,
			default: 'WBFC-Admin-Monitoring',
			required: false
		}
	},
	methods: {
		getContextId(){
	    	return this.contextId;
	    }
	},
	mounted() {
		var _this = this;
		global.SBA.uiSettings.brand = global.SBA.uiSettings.brand.replace('${title}', this.title);
		Vue.use(ApplicationContext, _this.getContextId);
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
		  provide(){
		    return {
		      getContextId: _this.getContextId,
		    };
		  },
		  data: {
		    views: viewRegistry.views,
		    applications: applicationStore.applications,
		    applicationsInitialized: false,
		    error: null,
		    userAuth: _this.userAuth
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
					window.sessionStorage.setItem('user-auth', userAuthStr);
		    	}
		    },
		    deleteUserAuth() {
		    	if(this.userAuth){
		    		window.sessionStorage.removeItem('user-auth');
		    	}
		    }
		  },
		  created() {
		  	this.setUserAuth();
		    applicationStore.addEventListener('connected', this.onConnected);
		    applicationStore.addEventListener('error', this.onError);
		    applicationStore.start();
		  },
		  beforeDestroy() {
		  	this.deleteUserAuth();
		    applicationStore.stop();
		    applicationStore.removeEventListener('connected', this.onConnected);
		    applicationStore.removeEventListener('error', this.onError)
		  }
		});

		Vue.use(ApplicationContext);
	}
}
</script>
<style type="text/css">
	
</style>