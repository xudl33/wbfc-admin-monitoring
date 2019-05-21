/*
 * Copyright 2014-2019 the original author or authors.
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

import myAxios from '../utils/axios';
import waitForPolyfill from '../utils/eventsource-polyfill';
import logtail from '../utils/logtail';
import {concat, from, ignoreElements, Observable} from '../utils/rxjs';
import uri from '../utils/uri';
import transform from 'lodash/transform';

const actuatorMimeTypes = [
  'application/vnd.spring-boot.actuator.v2+json',
  'application/vnd.spring-boot.actuator.v1+json',
  'application/json'
];

const isInstanceActuatorRequest = url => url.match(/^instances[/][^/]+[/]actuator([/].*)?$/);

class Instance {
  constructor({id, ...instance}) {
    Object.assign(this, instance);
    this.id = id;
    //instance.bootAdmin.url
    this.baseUrl = uri([instance.bootAdmin.url + instance.bootAdmin.actuatorPath]);
    //var baseUrl = uri([instance.bootAdmin.url + instance.bootAdmin.actuatorPath]);
    //console.log('myAxios = %o', myAxios.default)
    this.axios = myAxios;
  }

  hasEndpoint(endpointId) {
    return this.endpoints.findIndex(endpoint => endpoint.id === endpointId) >= 0;
  }

  get isUnregisterable() {
    return this.registration.source === 'http-api';
  }

  async unregister() {
    return this.axios.delete('');
  }

  async fetchInfo() {
    return this.axios.get(this.baseUrl + `/info`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async fetchMetrics() {
    return this.axios.get(this.baseUrl + `/metrics`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async fetchMetric(metric, tags) {
    const params = tags ? {
      tag: Object.entries(tags)
        .filter(([, value]) => typeof value !== 'undefined' && value !== null)
        .map(([name, value]) => `${name}:${value}`)
        .join(',')
    } : {};
    return this.axios.get(this.baseUrl + `/metrics/${metric}`, {
      headers: {'Accept': actuatorMimeTypes},
      params
    });
  }

  async fetchHealth() {
    var aa = this.baseUrl + `/health`;
    return await this.axios.get(aa, {
      headers: {'Accept': actuatorMimeTypes},
      validateStatus: null
    });
  }

  async fetchEnv(name) {
    return this.axios.get(this.baseUrl + `/env/${name || ''}`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async fetchConfigprops() {
    return this.axios.get(this.baseUrl + `/configprops`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async hasEnvManagerSupport() {
    const response = await this.axios.options(this.baseUrl + `/env`);
    return response.headers['allow'] && response.headers['allow'].includes('POST');
  }

  async resetEnv() {
    return this.axios.delete(this.baseUrl + `/env`);
  }

  async setEnv(name, value) {
    return this.axios.post(this.baseUrl + `/env`, {name, value}, {
      headers: {'Content-Type': 'application/json'}
    });
  }

  async refreshContext() {
    return this.axios.post(this.baseUrl + `/refresh`);
  }

  async fetchLiquibase() {
    return this.axios.get(this.baseUrl + `/liquibase`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async fetchScheduledTasks() {
    return this.axios.get(this.baseUrl + `/scheduledtasks`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async fetchGatewayGlobalFilters() {
    return this.axios.get(this.baseUrl + `/gateway/globalfilters`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async addGatewayRoute(route) {
    return this.axios.post(this.baseUrl + `/gateway/routes/${route.id}`, route, {
      headers: {'Content-Type': 'application/json'}
    });
  }

  async fetchGatewayRoutes() {
    return this.axios.get(this.baseUrl + `/gateway/routes`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async deleteGatewayRoute(routeId) {
    return this.axios.delete(this.baseUrl + `/gateway/routes/${routeId}`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async refreshGatewayRoutesCache() {
    return this.axios.post(this.baseUrl + `/gateway/refresh`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async fetchCaches() {
    return this.axios.get(this.baseUrl + `/caches`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async clearCaches() {
    return this.axios.delete(this.baseUrl + `/caches`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async clearCache(name, cacheManager) {
    return this.axios.delete(this.baseUrl + `/caches/${name}`, {
      params: {'cacheManager': cacheManager},
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async fetchFlyway() {
    return this.axios.get(this.baseUrl + `/flyway`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async fetchLoggers() {
    return this.axios.get(this.baseUrl + `/loggers`, {
      headers: {'Accept': actuatorMimeTypes},
      transformResponse: Instance._toLoggers
    });
  }

  async configureLogger(name, level) {
    return this.axios.post(this.baseUrl + `/loggers/${name}`, {configuredLevel: level}, {
      headers: {'Content-Type': 'application/json'}
    });
  }

  async fetchHttptrace() {
    return this.axios.get(this.baseUrl + `/httptrace`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async fetchBeans() {
    return this.axios.get(this.baseUrl + `/beans`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async fetchConditions() {
    return this.axios.get(this.baseUrl + `/conditions`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async fetchFeatures() {
    return this.axios.get(this.baseUrl + `/features`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async fetchDatabaseInformationSchemaTables() {
    return this.axios.get(this.baseUrl + `/database/informationSchemaTables`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async fetchDatabaseInformationSchemaColumns(tableName) {
    return this.axios.get(this.baseUrl + `/database/informationSchemaColumns`, {
      headers: {'Accept': actuatorMimeTypes},
      params:{'tableName': tableName}
    });
  }

  async fetchDatabaseInformationSchemaProcesslist() {
    return this.axios.get(this.baseUrl + `/database/informationSchemaProcesslist`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async fetchLogviewer() {
    return this.axios.get(this.baseUrl + `/logviewer`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async fetchThreaddump() {
    return this.axios.get(this.baseUrl + `/threaddump`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async downloadHeapdump(){
    return this.axios.get(this.baseUrl + `/heapdump`, {
      responseType: 'blob'
    });
  }

  async fetchAuditevents({after, type, principal}) {
    return this.axios.get(this.baseUrl + `/auditevents`, {
      headers: {'Accept': actuatorMimeTypes},
      params: {
        after: after.toISOString(),
        type: type || undefined,
        principal: principal || undefined
      }
    });
  }

  async fetchSessionsByUsername(username) {
    return this.axios.get(this.baseUrl + `/sessions`, {
      headers: {'Accept': actuatorMimeTypes},
      params: {
        username: username || undefined
      }
    });
  }

  async fetchSession(sessionId) {
    return this.axios.get(this.baseUrl + `/sessions/${sessionId}`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  async deleteSession(sessionId) {
    return this.axios.delete(this.baseUrl + `/sessions/${sessionId}`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

  streamLogfile(interval) {
    return logtail(opt => this.axios.get(this.baseUrl + `/logfile`, opt), interval);
  }

  async listMBeans() {
    return this.axios.get(this.baseUrl + `/jolokia/list`, {
      headers: {'Accept': 'application/json'},
      params: {canonicalNaming: false},
      transformResponse: Instance._toMBeans
    });
  }

  async readMBeanAttributes(domain, mBean) {
    const body = {
      type: 'read',
      mbean: `${domain}:${mBean}`,
      config: {ignoreErrors: true}
    };
    return this.axios.post(this.baseUrl + `/jolokia`, body, {
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
    });
  }

  async writeMBeanAttribute(domain, mBean, attribute, value) {
    const body = {
      type: 'write',
      mbean: `${domain}:${mBean}`,
      attribute,
      value
    };
    return this.axios.post(this.baseUrl + `/jolokia`, body, {
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
    });
  }

  async invokeMBeanOperation(domain, mBean, operation, args) {
    const body = {
      type: 'exec',
      mbean: `${domain}:${mBean}`,
      operation,
      'arguments': args
    };
    return this.axios.post(this.baseUrl + `/jolokia`, body, {
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
    });
  }

  async fetchMappings() {
    return this.axios.get(this.baseUrl + `/mappings`, {
      headers: {'Accept': actuatorMimeTypes}
    });
  }

/*  static async fetchEvents() {
    return axios.get('instances/events');
  }*/

/*  static getEventStream() {
    return concat(
      from(waitForPolyfill()).pipe(ignoreElements()),
      Observable.create(observer => {
        const eventSource = new EventSource('instances/events');
        eventSource.onmessage = message => observer.next({
          ...message,
          data: JSON.parse(message.data)
        });
        eventSource.onerror = err => observer.error(err);
        return () => {
          eventSource.close();
        };
      })
    );
  }*/

/*  static async get(id) {
    return axios.get(uri`instances/${id}`, {
      transformResponse(data) {
        if (!data) {
          return data;
        }
        const instance = JSON.parse(data);
        return new Instance(instance);
      }
    });
  }*/

  static _toLoggers(data) {
    if (!data) {
      return data;
    }
    const raw = JSON.parse(data);
    const loggers = transform(raw.loggers, (result, value, key) => {
      return result.push({name: key, ...value});
    }, []);
    return {levels: raw.levels, loggers};
  }

  static _toMBeans(data) {
    if (!data) {
      return data;
    }
    const raw = JSON.parse(data);
    return Object.entries(raw.value).map(([domain, mBeans]) => ({
      domain,
      mBeans: Object.entries(mBeans).map(([descriptor, mBean]) => ({
        descriptor: descriptor,
        ...mBean
      }))
    }))
  }
}

export default Instance;
