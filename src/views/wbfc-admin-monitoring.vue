<template>
	<div class="wbfc-admin-monitoring-html">
		<div class="wbfc-admin-monitoring-body">
			<div id="wbfc-admin-monitoring-container"></div>
		</div>
	</div>
</template>
<script type="text/javascript">

import moment from 'moment';
import Vue from 'vue';
import VueRouter from 'vue-router';
import components from '../components';
import Notifications from '../notifications';
import sbaShell from '../shell';
import Store from '../store';
import ViewRegistry from '../viewRegistry';
import views from '../views';
import ApplicationContext from '../services/applicationContext';
import favicon from '../assets/img/favicon.png';
import brandImg from '../assets/img/icon-spring-boot-admin.svg';
import faviconDanger from '../assets/img/favicon-danger.png';
import ElementUI from 'element-ui'
Vue.use(ElementUI);

global.SBA = {
  uiSettings: {
    "favicon": favicon,
    "notificationFilterEnabled":false,
    "title":"Spring Boot Admin",
    "brand":"<img src=\"" + brandImg + "\"><span>${title}<\/span>",
    "faviconDanger": faviconDanger
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
Vue.$applicationStore = applicationStore;

// 初始化所有显示页面
installViews();

function installViews(){
	const viewRegistry  = new ViewRegistry();
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
	Vue.$viewRegistry = viewRegistry;
}


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
		title: {
			type: String,
			default: 'WBFC-Admin-Monitoring',
			required: false
		},
		defaultApplications:{
			type: Array, // 默认的appcation列表
			default: () => [],
			required: false,
			validator: function(val){
				for(var i in val){
					var tempApp = val[i];
					if(!tempApp.name || !tempApp.url || !tempApp.actuatorPath){
						return false;
					}
				}
				return true;
			}
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
		var containVue = new Vue({
		  router: new VueRouter({
		    linkActiveClass: 'is-active',
		    routes: Vue.$viewRegistry.routes
		  }),
		  el: '#wbfc-admin-monitoring-container',
		  render(h) {
		    //console.log(h);
		    return h(sbaShell, {
		   	  ref: 'sbaShell',
		      props: {
		        views: this.views,
		        applications: this.applications,
		        applicationsInitialized: this.applicationsInitialized,
		        error: this.error
		      }
		    });
		  },
		  /*provide(){
		    return {
		      getContextId: _this.getContextId,
		      getApplications: this.getApplications
		    };
		  },*/
		  data: {
		    views: Vue.$viewRegistry.views,
		    applications: applicationStore.applications,
		    applicationsInitialized: false,
		    error: null,
		    userAuth: _this.userAuth
		  },
		  methods: {
		  	/*reViews(){
		  		this.views = Vue.$viewRegistry.views;
		  		//console.log("set views =%o", this.views);
		  	},*/
		    onError(error) {
		      //console.warn('Connection to server failed:', error);
		      this.applicationsInitialized = true;
		      this.error = error;
		    },
		    onConnected() {
		      this.applicationsInitialized = true;
		      this.error = null;
		    },
		    onUpdate(updated){
		    	/*installViews();
		    	this.reViews();
				this.$refs.sbaShell.updateNavbar(applicationStore.applications, this.views);
		    	*/
		    	if(Vue.$instanceShell){
		    		//console.log("need update apps = %o", needUpdApps);
		    		this.applications = applicationStore.applications;
		    	}
		    	if(Vue.$instanceSidebar){
		    		Vue.$instanceSidebar.refresh();
		    	}
		    	
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
		    },
		    getApplications(){
			  	this.applicationsInitialized = false;
			  	applicationStore.start();
			},
			addDefaultApplications(){
			  	if(_this.defaultApplications.length > 0){
					Vue.$applicationContext.importApplications(_this.defaultApplications, false);
				}
			},
			checkFavicon(){
				var favicon = document.querySelector('link[rel*="icon"]');
				if(!favicon){
					var node = document.createElement('link');
			        node.rel = "shortcut icon";
			        node.href ="favicon.png";
			        document.head.appendChild(node);
				}
			}
		  },
		  created() {
		  	this.checkFavicon();
		  	this.setUserAuth();
		    applicationStore.addEventListener('connected', this.onConnected);
		    applicationStore.addEventListener('error', this.onError);
		    applicationStore.addEventListener('applicationsUpdated', this.onUpdate);
		    this.addDefaultApplications();
		    this.getApplications();
		  },
		  beforeDestroy() {
		  	this.deleteUserAuth();
		    applicationStore.stop();
		    applicationStore.removeEventListener('connected', this.onConnected);
		    applicationStore.removeEventListener('error', this.onError);
		    applicationStore.removeEventListener('applicationsUpdated', this.onUpdate);
		  }
		});
		//console.log(Vue.$applicationContext)
		Vue.$applicationContext.setContainerVue(containVue);
	}
}
</script>
<style lang="scss">
@import '../assets/css/base.scss';
.wbfc-admin-monitoring-html div.message {
	word-break: break-all;
}
</style>