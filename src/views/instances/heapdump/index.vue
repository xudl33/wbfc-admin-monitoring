<!--
  - Copyright 2014-2018 the original author or authors.
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
  <section class="section heapdump">
    <div v-if="error" class="message is-danger">
      <div class="message-body">
        <strong>
          <font-awesome-icon class="has-text-danger" icon="exclamation-triangle" />
          Download heap dump file failed.
        </strong>
        <p v-text="error.message" />
      </div>
    </div>
    <div>
      <div class="message is-warning">
        <div class="message-body">
          A heap dump may contain <strong>sensitive data</strong>. Please handle with care.
        </div>
      </div>
      <div class="message is-warning">
        <div class="message-body">
          Dumping the heap may be expensive in terms of cpu and disk space.
        </div>
      </div>
      <a class="button is-primary" @click="downloadHeapdump" v-loading="isLoading">
        <font-awesome-icon icon="download" />&nbsp;Download Heap Dump
      </a>
    </div>
  </section>
</template>

<script>
  import Instance from '../../../services/instance';
  import moment from 'moment';
  export default {
    data(){
      return {
        isLoading: false,
        error: null
      }
    },
    props: {
      instance: {
        type: Instance,
        required: true
      }
    },
    methods: {
      async downloadHeapdump(){
        this.isLoading = true
        try {
           //console.log('moment = %o', moment(moment().valueOf()).format('YYYYMMDDHHmmss'));
            var heapdumpStream = await this.instance.downloadHeapdump();
            var blob = new Blob([heapdumpStream.data], {type: 'application/octet-stream'});
            var name = 'heapdump_' + moment(moment().valueOf()).format('YYYYMMDDHHmmss');
            var downloadElement = document.createElement('a');
            downloadElement.download = name;
            
            // ie必须使用msSaveOrOpenBlob
            if('msSaveOrOpenBlob' in navigator){
               window.navigator.msSaveOrOpenBlob(blob, name);
            } else {
              var agent = window.navigator.userAgent;
              // google
              if(agent.indexOf("Chrome")){
                // chrome虽然也能使用FileReader，但大小有限制，经过试验发现createObjectURL才好使
                var csvUrl = URL.createObjectURL(blob);
                downloadElement.href = csvUrl;
                this.triggerDownload(downloadElement);
                window.URL.revokeObjectURL(csvUrl); //释放掉blob对象 
              } else {
                // 火狐和其他
                var reader = new FileReader();
                reader.readAsDataURL(blob);  // 转换为base64，可以直接放入a的href
                reader.onload = function (e) {
                  downloadElement.href = e.target.result;
                  this.triggerDownload(downloadElement);
                }
              }
            }
        } catch(e) {
          // statements
          console.log(e);
          this.error = e;
        }
        this.isLoading = false;
      },
      triggerDownload(downloadElement){
        document.body.appendChild(downloadElement);
    　　downloadElement.click(); //点击下载
    　　document.body.removeChild(downloadElement); //下载完成移除元素
      }
    },
    install({viewRegistry}) {
      viewRegistry.addView({
        name: 'instances/heapdump',
        parent: 'instances',
        path: 'heapdump',
        component: this,
        label: 'Heap Dump',
        group: 'JVM',
        order: 800,
        isEnabled: ({instance}) => instance.hasEndpoint('heapdump')
      });
    }
  }
</script>

<style lang="scss">
  .heapdump {
    display: flex;
    justify-content: space-around;

    & > div {
      display: flex;
      flex-direction: column;
    }
  }
</style>
