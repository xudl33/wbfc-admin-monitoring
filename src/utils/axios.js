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

import axios from 'axios';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
if (global.SBA && global.SBA.csrf && global.SBA.csrf.headerName) {
  axios.defaults.xsrfHeaderName = global.SBA.csrf.headerName;
}

export const redirectOn401 = (predicate = () => true) => error => {
  if (error.response && error.response.status === 401 && predicate(error)) {
  	window.sessionStorage.removeItem("user-auth");
  	alert('您的认证信息已过期，请重新登录');
	window.close();
  }
  return Promise.reject(error);

};

const instance = axios.create();
instance.interceptors.request.use(config => {
	// 允许添加JWT Token 或以/i和/w开头的url都必须带有权限
	if(config.url.indexOf('/i/') >= 0 ||  config.url.indexOf('/w/') >= 0){
		//添加公用 Authorization
		if(!window.sessionStorage){
			alert('您的浏览器版本太低，请使用最新版的Chrome');
	        return;
		}
		var userAuth = JSON.parse(window.sessionStorage.getItem("user-auth") || {});
		var authType = '';
		if(userAuth.tokenType && userAuth.accessToken){
			config.headers.Authorization = userAuth.tokenType + userAuth.accessToken;
		}
	}
});
instance.interceptors.response.use(response => response, redirectOn401());
instance.create = axios.create;

export default instance;
