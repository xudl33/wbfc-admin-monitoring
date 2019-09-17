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
    </template>
    <div class="field-body">
      <div class="field">
        <p class="control is-expanded has-icons-left">
          <input class="input" type="search" v-model="filter" >
          <span class="icon is-small is-left">
            <font-awesome-icon icon="filter" />
          </span>
        </p>
      </div>
      <div class="field is-narrow has-addons " title="默认使用代理服务器，如果需要直连，可以关闭该开关">
        <p class="control">
          <span class="button is-static">
            使用代理
          </span>
        </p>
        <p class="control logviewer-is-proxy">
          <el-switch v-model="isProxy" :disabled="isProxyDisabled"/>
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
      <div class="field is-narrow has-addons">
        <p class="control">
          <span @click="logviewerToggleConnect">
            <i class="button" :class="{'el-icon-magic-stick':!logConnect, 'el-icon-link': logConnect}" :title="logConnect?'状态:已连接 点击断开':'状态:断开 点击连接'"></i>
          </span>
        </p>
      </div>
      <div class="field is-narrow has-addons">
        <p class="control">
          <span @click="logviewerToggleLock">
            <i class="button" :class="{'el-icon-unlock':!logLock, 'el-icon-lock': logLock}" :title="logLock?'滚动锁定':'滚动解锁'"></i>
          </span>
        </p>
      </div>
      <div class="field is-narrow">
        <p class="control">
          <span @click="logviewerClear">
            <i class="button el-icon-refresh" title="清屏"></i>
          </span>
        </p>
      </div>
    </div>
    <div class="field-body">
      <!-- <el-table ref="logViewerTable" :data="filteredContexts" :show-header="false" cell-class-name="logviewer-table-cell" style="margin-top: 20px;" :row-class-name="getLogviewerTableRowClass">
        <el-table-column
          type="index" label="行号" align="right" class-name="logviewer-table-headnum" :width="logViewerHeadnum">
        </el-table-column>
        <el-table-column class-name="logviewer-item"
          prop="logFullMessage"
          label="日志">
        </el-table-column>
      </el-table> -->
      <ul class="logviewer-table">
        <div class="logviewer-table-row" :class="['tb-ml-index-' + fc.id]" v-for="(fc, index) in filteredContexts" @click="toggleTableMark(fc, (index + 1))">
          <li class="logviewer-table-cell logviewer-table-headnum" :style="{'width': headNumMaxWidth + 'px'}">{{fc.id}}</li>
          <li class="logviewer-table-cell" :class="[fc.level?'logviewer-table-context ' + fc.level.levelStr:'']" >
            <span class="logviewer-table-cell logviewer-item">{{fc.logFullMessage}}</span>
          </li>
          <li class="logviewer-table-cell logviewer-table-markline" v-if="fc.mark"><i class="el-icon-warning" :title="fc.mark.msg"></i></li>
        </div>
      </ul>
      <div class="block logviewer-markline">
        <el-slider v-model="marklineVal" :marks="marks" vertical height="0px" :min="1" :max="marklineMax" :format-tooltip="formatMarkline" @change="marklineChange">
        </el-slider>
      </div>
    </div>
    <div class="field-body toolsTips">
      <div class="field is-narrow logviewer-compact">
        <p class="control">
          <span @click="logviewerRetrunTop">
            <i class="button el-icon-upload2" title="返回顶部"></i>
          </span>
        </p>
      </div>
      <div class="field is-narrow logviewer-compact">
        <p class="control">
          <span @click="logviewerToggleLock">
            <i class="button" :class="{'el-icon-unlock':!logLock, 'el-icon-lock': logLock}" :title="logLock?'滚动锁定':'滚动解锁'"></i>
          </span>
        </p>
      </div>
      <div class="field is-narrow has-addons ">
        <p class="control">
          <span @click="logviewerClear">
            <i class="button el-icon-refresh" title="清屏"></i>
          </span>
        </p>
      </div>
    </div>
  </section>
</template>

<script>
  import Application from '../../../../services/application';
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
      },
      application:{
        type: Application,
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
      isProxyDisabled:false, // 使用代理是否可用
      isProxy: true, // 使用代理
      toolsTips: {}, // 浮动按钮
      logConnect: true, // 连接服务器
      logLock: false, // 日志行锁定
      logLevel: '', // 日志级别
      logList:[], // 日志行数据
      lineMarkIndex: {}, // 标记行
      headNumMaxWidth: 0, // 行号最大宽度
      marklineVal: 0, // 标记值
      marklineHeight: 0, // 标记线高度
      marks: {}, // 标记项
    }),
    computed: {
      filteredContexts() {
        const filterFn = this.addToFilter(this.getLevelFilterFn(), this.getFilterFn());
        var filtedList = this.logList.filter(filterFn);
        return filtedList;
      },
      marklineMax(){
        return this.logList.length > 0?this.logList.length:1;
      }
    },
    watch:{
      headNumMaxWidth(val){
        this.$nextTick(() => {
          // 行号的最大值改变 就获取全部的行号元素设置宽度
          var headnums = this.$el.querySelectorAll(".logviewer-table-headnum");
          if(headnums){
            //console.log(headnums)
            headnums.forEach((item, index) => {
              item.style.width = val + "px";
            });
          }
        });
      },
      isProxy(val, oal) {
        this.error = null;
        this.disSocketConnection();
        this.logList = [];
        this.marks = {};
        this.fetchLogviewerUrl();
      },
      filteredContexts(val){
        // 如果列表数据改变 就计算最大行宽度
        var maxWidth = this.logViewerHeadnum(val.length);
        // 如果大于当前的最大值 就设置成最大的
        if(maxWidth > this.headNumMaxWidth){
          this.headNumMaxWidth = maxWidth;
        }

        // 更新标记线的高度
        this.$nextTick(() => {
          // 日志表格高度
          var ulTableHeight = this.$el.querySelector('.logviewer-table').offsetHeight;
          // 可见最大高度 - 230(头部导航和页面元素)
          var viewMaxHeight = document.documentElement.clientHeight - 230;
          //console.log(ulTableHeight, viewMaxHeight)
          // 如果大于最大显示高度了 就不再增加 保证全部显示
          if(ulTableHeight > viewMaxHeight){
            ulTableHeight = viewMaxHeight;
          } else {
            ulTableHeight = ulTableHeight;
          }
          // 设置具体元素的高度
          this.$el.querySelector('.logviewer-markline .el-slider__runway').style.height = ulTableHeight + 'px';
          // 重新绘制间断点
          this.resetlineMarkPoint();
        });
      }
    },
    methods: {
      resetlineMarkPoint(){
        // 重新绘制间断点
        for(var i in this.marks){
          var markIndex = this.lineIndexToMarkLine(this.marks[i].id);
          var tempMark = Object.assign({}, this.marks[i]);
          this.$delete(this.marks, i);
          this.$set(this.marks, markIndex, tempMark);
        }
      },
      generateId() {
        // id和全日志行号相同
        return this.logList.length + 1;
      },
      findLogById(id){ // 通过id查找
        if(id){
          return this.logList[id - 1];
        }
        return null;
      },
      toggleTableMark(log, lineNum){
        // 行号
        /*var tpLi = document.createElement('li');
        tpLi.className = 'logviewer-table-cell logviewer-table-markline';
        var tpIco = document.createElement('i');
        tpIco.className = 'el-icon-warning';
        tpLi.append(tpIco);
        this.$el.querySelector('.tb-ml-index-' + index).append(tpLi);*/

        /*var markIndex = this.lineIndexToMarkLine(lineNum);
        console.log('lineNum = '+ lineNum + ' markIndex = ' + markIndex);
        if(!this.lineMarkIndex[lineNum]){
          //this.lineMarkIndex[index] = true;
          this.$set(this.lineMarkIndex, lineNum, true);
          this.$set(this.marks, markIndex, '');
        } else {
          this.$delete(this.lineMarkIndex, lineNum);
          this.$delete(this.marks, markIndex);
        }*/
        // 通过id获取日志
        var logItem = this.findLogById(log.id);
        if(logItem){
          var markIndex = this.lineIndexToMarkLine(lineNum);
          if(!logItem.mark){
            // 设置mark
            this.$set(logItem, 'mark', {msg: 'Mark Line at: ' + log.id});
            // 设置标记线
            this.$set(this.marks, markIndex, {id: log.id});
          } else {
            // 删除标记线
            this.$delete(this.marks, markIndex);
            // 删除mark
            this.$delete(logItem, 'mark');
          }
        }
      },
      lineIndexToMarkLine(lineNum){
        // 行号转标记线值
        return Math.abs(lineNum - this.logList.length - 1);
      },
      marklineChange(val){
        // 标记线改变就触发滚动
        var tp = this.formatMarkline(val);
        //console.log(tp);
        // 获取对应的日志行
        var lineElem = this.$el.querySelector('.tb-ml-index-' + tp);
        // 可能被过滤了 没有显示
        if(lineElem){
          document.body.parentElement.scrollTop = lineElem.offsetTop;  
        }
      },
      formatMarkline(val){ // 下标转标记线值(标记线上下是倒置的 默认下方为0 转换后下方为最大值)
        // -1 是为了对应行号 下标从0开始 行号从1开始
        var tp = val - this.logList.length - 1;
        //console.log('val = ' + val + ' tp = ' + tp);
        return Math.abs(tp) + '';
      },
      logViewerHeadnum(index){
        // 字符长度*10
        var headNumWidth = parseInt(String(index).length) * 10;
        var res = headNumWidth < 50?50:headNumWidth;
        return res;
      },
      logviewerToggleConnect(){
        this.logConnect = !this.logConnect;
        if(this.logConnect){
          this.fetchLogviewerUrl();
        } else {
          this.disSocketConnection();
        }
      },
      logviewerToggleLock(event){
        this.logLock = !this.logLock;
      },
      logviewerClear(){
        this.logList = [];
        this.marks = {};
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
      setContextLocalApplication(){
        this.currentLocalApplication = Vue.$applicationContext.getApplication(this.instance.id);
      },
      getLogLevel(level){
        var res = null;
        switch(level){
          case 5000:
          case "TRACE":
            res = {"levelInt":5000,"levelStr":"TRACE"};
            break;
          case 10000:
          case "DEBUG":
            res = {"levelInt":10000,"levelStr":"DEBUG"};
            break;
          case 20000:
          case "INFO":
            res = {"levelInt":20000,"levelStr":"INFO"};
            break;
          case 30000:
          case "WARN":
            res = {"levelInt":30000,"levelStr":"WARN"};
            break;
          case 40000:
          case "ERROR":
            res = {"levelInt":40000,"levelStr":"ERROR"};
            break;
        }
        return res;
      },
      addLocalLog(level, fullMessage){
        if(level && fullMessage){
          var logLevel = this.getLogLevel(level);
          this.logList.push({"id": this.generateId(), "level": logLevel,"logFullMessage": fullMessage});
        }
      },
      async fetchLogviewerUrl() {
        this.hasLoaded = false;
        this.isProxyDisabled = true;
        var _this = this;
        _this.addLocalLog('DEBUG', '正在连接应用服务器...');
        try {
          const res = await this.instance.fetchLogviewer();
          if(res.data){
            _this.addLocalLog('DEBUG', '应用服务器已连接!');
            // socket地址
            var tarUrl = res.data.webSocketPath;
            // 是否直连服务器
            if(this.isProxy){
              // 配置的通常会有nginx或spring cloud gateway  (socket协议因为无法穿透zuul，所以不能使用)
              var realServerUrl = this.instance.bootAdmin.url;
            } else {
              // 真实服务器地址 通过actuator获取的基本都会是内网地址
              var realServerUrl = this.application.realServerUrl.replace(this.instance.bootAdmin.actuatorPath, '');
            }
            
            // console.log('Application = %o, instance = %o, res.data = %o', this.application, this.instance, res.data);
            // 订阅地址
            var topicUrl = res.data.topicPath;
            // 是否需要权限认证
            var authority = res.data.authority;

            var connectHeaders = {};
            // 如果需要权限认证 就把认证信息写入cookie 因为socket不能像http请求一样携带headers
            if(authority){
              var existsToken = CookieUtil.getCookie('authorization');
              var userAuth = JSON.parse(window.sessionStorage.getItem('user-auth') || {});
              // token不存在或不等于user-auth.accessToken 就需要重新设置cookie
              if(!existsToken || (userAuth.accessToken && existsToken !== userAuth.accessToken)){
                CookieUtil.setCookie('authorization', userAuth.accessToken);
              }
              connectHeaders.token = userAuth.accessToken;
              /*connectHeaders.token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInVzZXJfbmFtZSI6ImFkbWluIiwib3BlbklkIjoiMSIsInVzZXJJZCI6MSwiYXV0aG9yaXRpZXMiOlsiUk9MRV91c2VyIiwiUk9MRV9hY2NvdW50IiwiUk9MRV9hZG1pbiIsInN5czpiYWNrdXAiLCJhdXRoZWQiLCJzeXM6Y3VzdG9tZXIiLCJhY3RpdmVkIiwic3lzOnNjaGVkdWxlIl0sImV4cCI6MTU1ODEyOTMwM30.BEVEA5wMuSnZ5f-aNBtDy1OWRLMpBt2VNuJQtObLwGI6235iX4XiM-2rr3W_07414hDpFpkh0vvfa2tF0JvJYtciOyqOeOZ1rEJOaW27BnlRUWFLU3R4ms-UfNEIb3YkMG8_y9YtIJdPQ1YTM-_n9BPk1VCMpTirX__gvdQI8lo'*/
            }

            _this.addLocalLog("DEBUG", '正在连接Socket服务器... ' + realServerUrl + tarUrl);
            // 配置一个socket客户端
            var socket = new SockJS(realServerUrl + tarUrl);
            // 配置Stomp客户端
            _this.stompClient = Stomp.over(socket);
            // 关闭debug信息
            _this.stompClient.debug = false;
            
            // 开启socket连接
            _this.stompClient.connect(connectHeaders, function (frame) {
                _this.hasLoaded = true;
                _this.isProxyDisabled = false;
                _this.addLocalLog("DEBUG", 'Socket服务器已连接!');
                // 开启消息订阅
                _this.socketSubscriber = _this.stompClient.subscribe(topicUrl, function (event) {
                    // 将返回的日志消息转成JSON并放入列表
                    var logJson = Object.assign({id: _this.generateId()}, JSON.parse(event.body));
                    _this.logList.push(logJson);
                    // 不是锁定状态就滚动
                    if(!_this.logLock){
                      // 滚动到页面底部
                      document.body.parentElement.scrollTop = document.body.parentElement.scrollHeight;
                    }
                });
                _this.error = null;
            }, function(err) {
              _this.hasLoaded = true;
              _this.isProxyDisabled = false;
              _this.addLocalLog("DEBUG", 'Socket服务器连接失败!');
              console.log('Fetching logviewer failed:', err);
              // 如果是token过期
              if(err.headers && err.headers.message && err.headers.message.indexOf('invalid_token') >= 0 && err.headers.message.indexOf('Access token expired') >= 0){
                  if(window.sessionStorage){
                    window.sessionStorage.removeItem('user-auth');
                  }
                  alert('您的认证信息已过期，请重新登录');
                  window.close();
              }
              _this.error = new Error(err);
            });
          }
        } catch (error) {
          this.error = error;
          _this.hasLoaded = true;
          _this.isProxyDisabled = false;
          _this.logConnect = false;
          console.log('Fetching logviewer failed:', error);
        }
      },
      disSocketConnection(){
        this.addLocalLog("DEBUG", '正在关闭Socket连接...');
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
        this.addLocalLog("DEBUG", 'Socket连接已关闭');
      },
      testLog(){
        this.hasLoaded = true;
        var logList = this.logList;
        for(var i = 0; i<20; i++){
          setTimeout((i) => {
            var lineNum = "1";
            for(var j = 0 ; j<i; j++){
              lineNum += "0";
            }
            logList.push({"id": this.generateId(),"timestamp":1562234554111,"threadName":"Timer-1","loggerName":"org.apache.http.wire","level":{"levelInt":10000,"levelStr":"DEBUG"},"formattedMessage":"http-outgoing-181 >> \"Connection: Keep-Alive[\\r][\\n]\"","logFullMessage": i + "_text", "lineNum": lineNum});
          }, i * 100, i);
          
        }
      }
    },
    created() {
      
    },
    mounted() {
      this.fetchLogviewerUrl();
      //this.testLog();
    },
    beforeDestroy() {
      this.disSocketConnection();
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

    .logviewer-item{
      word-break: break-all;
    }
    .field-body > .field.logviewer-compact:not(:last-child){
      margin-right:0px;
    }
    .logviewer-is-proxy{
      border: 1px solid transparent;
      border-color: #dbdbdb;
      border-radius: 4px;
      border-bottom-left-radius: 0;
      border-top-left-radius: 0;
      padding-bottom: calc(0.375em - 1px);
      padding-left: 0.75em;
      padding-right: 0.75em;
      padding-top: calc(0.375em - 1px);
      font-size: 1rem;
      height: 2.25em;
    }
    .logviewer-table{
      background-color: #272822;
      width: 99%;
      margin-top: 15px;
      display: table;
      min-height: 20px;
    }
    .logviewer-table-row {
      display: table-row;
      &:hover{
        background-color: #62625F;
      }

      .logviewer-table-cell{
        display: table-cell;

        &.logviewer-table-headnum{
          color: #90908A;
          padding-right: 5px;
          text-align: right;
        }

        &.logviewer-table-context{
          padding-left: 5px;
          padding-right: 5px;
          border-left: 1px solid #90908A;
          border-right: 1px solid #90908A;

          &.TRCE .logviewer-item{
            color: #ddd;
          }

          &.DEBUG .logviewer-item{
            color: #00ff4a;
          }

          &.INFO .logviewer-item{
            color: #00c7ee;
          }

          &.WARN .logviewer-item{
            color: #fff300;
          }

          &.ERROR .logviewer-item{
            color: #fd1616;
          }
        }

        &.logviewer-table-markline{
          color: #ff3860;
          width: 25px;
          text-align: center;
        }
      }
    }
    .logviewer-markline{
      width: 1%;
      top: 9.4rem;
      right: 1.9rem;
      position: fixed;

      .el-slider__bar{
        background-color: #E4E7ED;
      }
      .el-slider__runway{
        background-color: #409EFF;
      }
      .el-slider__stop{
        background-color: #ff3860;
      }
    }

  }
</style>
