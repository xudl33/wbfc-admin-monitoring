<template>
  <section class="section logviewer-section" :class="{ 'is-loading' : !hasLoaded }">
    <template v-if="hasLoaded">
      <div v-if="error" class="message is-danger">
        <div class="message-body">
          <strong>
            <font-awesome-icon class="has-text-danger" icon="exclamation-triangle" />
            Fetching log files failed.
          </strong>
          <p v-text="error.message" />
        </div>
      </div>
      <div class="field-body">
        <div class="field">
          <p class="control is-expanded has-icons-left">
            <input class="input" type="search" v-model="filter" >
            <span class="icon is-small is-left">
              <font-awesome-icon icon="filter" />
            </span>
          </p>
        </div>
        <div class="field is-narrow has-addons">
          <p class="control">
            <span class="button is-static">
              Level
            </span>
          </p>
          <p class="control">
            <select class="input" v-model="logLevel">
              <option value="">ALL</option>
              <option value="5000">TRACE</option>
              <option value="10000">DEBUG</option>
              <option value="20000">INFO</option>
              <option value="30000">WARN</option>
              <option value="40000">ERROR</option>
            </select>
          </p>
        </div>
        <div class="field is-narrow ">
          <p class="control">
            <span @click="logviewerToggleLock">
              <i class="button" :class="{'el-icon-unlock':!logLock, 'el-icon-lock': logLock}" :title="logLock?'滚动锁定':'滚动解锁'"></i>
            </span>
          </p>
        </div>
      </div>
      <div class="field-body">
        <el-table ref="logViewerTable" :data="filteredContexts" :show-header="false" cell-class-name="logviewer-table-cell" style="margin-top: 20px;" :row-class-name="getLogviewerTableRowClass">
          <el-table-column
            type="index" label="行号" align="right" class-name="logviewer-table-headnum">
          </el-table-column>
          <el-table-column class-name="logviewer-item"
            prop="logFullMessage"
            label="日志">
          </el-table-column>
        </el-table>
      </div>
      <div class="field-body toolsTips">
        <div class="field is-narrow has-addons ">
          <p class="control">
            <span @click="logviewerRetrunTop">
              <i class="button el-icon-upload2"></i>
            </span>
          </p>
        </div>
      </div>
    </template>
  </section>
</template>

<script>
  import Instance from '../../../../services/instance';
  import CookieUtil from '../../../../utils/cookie'
  import SockJS from 'sockjs-client';
  import Stomp from 'stompjs';
  import 'element-ui/lib/theme-chalk/index.css'


  export default {
    props: {
      instance: {
        type: Instance,
        required: true
      }
    },
    data: () => ({
      hasLoaded: false,
      error: null,
      loggerConfig: null,
      filter: '',
      stompClient: null,
      socketSubscriber: null,
      toolsTips: {}, // 浮动按钮
      logLock: false, // 日志行锁定
      logLevel: '', // 日志级别
      logList:[], // 日志行数据
    }),
    computed: {
      filteredContexts() {
        const filterFn = this.addToFilter(this.getLevelFilterFn(), this.getFilterFn());
        return this.logList.filter(filterFn);
      }
    },
    methods: {
      logviewerToggleLock(event){
        this.logLock = !this.logLock;
      },
      logviewerRetrunTop(){
        document.body.parentElement.scrollTop = 0;
      },
      getLogviewerTableRowClass(params){
        return params.row.level?'logviewer-table-row-' + params.row.level.levelStr:'';
      },
      addToFilter(oldFilter, addedFilter){
        return !oldFilter? addedFilter: (val, key) => oldFilter(val, key) && addedFilter(val, key);
      },
      getLevelFilterFn(){
        var _this = this;
        if(!_this.logLevel){
           return () => true;
        }
        return bean => (parseInt(_this.logLevel) == parseInt(bean.level.levelInt));
      },
      getFilterFn() {
        var _this = this;
        if (!this.filter) {
          return () => true;
        }
        const regex = new RegExp(this.filter, 'i');
        return bean => {
          if(bean.logFullMessage.match(regex)){
            return true;
          }
          return false;
        };
      },
      async fetchLogviewerUrl() {
        this.hasLoaded = true;
        var _this = this;
        try {
          const res = await this.instance.fetchLogviewer();
          if(res.data){
            // socket地址
            var tarUrl = res.data.webSocketPath;
            // 订阅地址
            var topicUrl = res.data.topicPath;
            // 是否需要权限认证
            var authority = res.data.authority;

            // 如果需要权限认证 就把认证信息写入cookie 因为socket不能像http请求一样携带headers
            if(authority){
              var existsToken = CookieUtil.getCookie("authorization");
              var userAuth = JSON.parse(window.sessionStorage.getItem("user-auth") || {});
              // token不存在或不等于user-auth.accessToken 就需要重新设置cookie
              if(!existsToken || (userAuth.accessToken && existsToken !== userAuth.accessToken)){
                CookieUtil.setCookie('authorization', userAuth.accessToken);
              }
            }

            // 配置一个socket客户端
            var socket = new SockJS(this.instance.bootAdmin.url + tarUrl);
            // 配置Stomp客户端
            _this.stompClient = Stomp.over(socket);
            // 关闭debug信息
            _this.stompClient.debug = false;
            
            // 开启socket连接
            _this.stompClient.connect({}, function (frame) {
                _this.hasLoaded = true;
                // 开启消息订阅
                _this.socketSubscriber = _this.stompClient.subscribe(topicUrl, function (event) {
                    // 将返回的日志消息转成JSON并放入列表
                    _this.logList.push(JSON.parse(event.body));
                    // 不是锁定状态就滚动
                    if(!_this.logLock){
                      // 滚动到页面底部
                      document.body.parentElement.scrollTop = document.body.parentElement.scrollHeight;
                    }
                });
            });
          }
        } catch (error) {
          console.error('Fetching logviewer failed:', error);
          this.error = error;
        }
        _this.hasLoaded = false;
      },
    },
    created() {
      
    },
    mounted() {
      this.fetchLogviewerUrl();
    },
    beforeDestroy() {
      // 取消socket订阅
      if(this.socketSubscriber){
        this.socketSubscriber.unsubscribe();
        this.socketSubscriber = null;
      }
      // 关闭stomp连接
      if(this.stompClient){
        this.stompClient.disconnect();
        this.stompClient = null;
      }
    },
    install({viewRegistry}) {
      viewRegistry.addView({
        name: 'instances/logViewer',
        parent: 'instances',
        path: 'logViewer',
        component: this,
        label: 'LogViewer',
        group: 'Logging',
        order: 300,
        isEnabled: ({instance}) => instance.hasEndpoint('logviewer')
      });
    }
  }
</script>

<style lang="scss">
  .logviewer-section {
    .toolsTips{
      float:right;
      margin-top: 20px;
      margin-bottom: 20px;
    }

    .el-icon-lock{
      background-color: whitesmoke
    }

    .el-table .logviewer-table-headnum{
      color: #90908A;
      border-right: 1px solid #90908A;
    }
    .el-table tbody td{
      color: #fff;
    }

    .el-table th, .el-table tr{
      background-color: #272822;
    }

    .el-table td, .el-table th{
      padding: 0;
    }

    .el-table--enable-row-hover .el-table__body tr:hover>td{
      background-color: #62625F;
    }

    .el-table td, .el-table th.is-leaf{
      border-bottom: none;
    }
    .logviewer-item{
      word-break: break-all;
    }
    .el-table tbody .logviewer-table-row {
      &-TRCE .logviewer-item{
        color: #ddd;
      }

      &-DEBUG .logviewer-item{
        color: #fff;
      }

      &-INFO .logviewer-item{
        color: #00c7ee;
      }

      &-WARN .logviewer-item{
        color: #fff300;
      }

      &-ERROR .logviewer-item{
        color: #fd1616;
      }
    }
  }
</style>
