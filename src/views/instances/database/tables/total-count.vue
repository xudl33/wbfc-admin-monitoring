<template>
  <div class="total-count-chart">
  	<div class="field is-narrow has-addons">
      <p class="control">
        <span class="button is-static">
          刷新频率(秒)
        </span>
      </p>
      <p class="control">
        <input class="input total-count__Interval" :min="fetchIntervalMin" type="number" placeholder="fetch Interval" v-model="fetchInterval">
      </p>
    </div>
  	
    <div class="total-count-chart__svg" />
    <div class="total-count-chart__detail" />
  </div>
</template>

<script>
import subscribing from '../../../../mixins/subscribing';
import Instance from '../../../../services/instance';
import d3 from '../../../../utils/d3';
import {concatMap, timer} from '../../../../utils/rxjs';
import moment from 'moment';
import echarts from 'echarts';
import {compareBy} from '../../../../utils/collections';
import prettyBytes from 'pretty-bytes';

export default {
    props: {
      instance: {
        type: Instance,
        required: true
      },
    },
    mixins: [subscribing],
    data: () => ({
    	hasLoaded: false,
    	fetchInterval: 30,
    	fetchIntervalMin: 10,
    	yAxisMax: 0,
    	charter: null, // 总数统计
    	charterDetail: null, // 详情统计
    	schemaTables:{}, // 返回数据
    	chartData: [], // 总数-数据总条数数组
    	chartIndexData:[], // 总数-索引大小数组
    	chartDataLength:[],  // 总数-表空间大小数组
    	chartDataFree:[], // 总数-空间碎片大小数组
    }),
    methods: {
    	prettyBytes,
    	generateId(len) {
			if (!len) {
				// 默认12位
				len = 24;
			} else if (typeof(Number(len)) != 'number') {
				return null;
			}
		    var ar = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
		    var hs = [];
		    var hl = Number(len);
		    var al = ar.length;
		    for (var i = 0; i < hl; i ++) {
		        hs.push(ar[Math.floor(Math.random() * al)]);
		    }
		     
		    return hs.join('');
		},
    	async fetchMetrics() {
	        const responseSchemaTables = await this.instance.fetchDatabaseInformationSchemaTables();
	        var resId = this.generateId();
	        this.schemaTables[resId] = responseSchemaTables.data;
	        return {
	        	id: resId,
	        	value: responseSchemaTables.data.reduce((accumulator, currentValue, currentIndex, array, initialValue) => {
	        		return accumulator + new Number(currentValue.tableRows);
	            }, 0),
	            indexLength: responseSchemaTables.data.reduce((accumulator, currentValue, currentIndex, array, initialValue) => {
	          	     return accumulator + new Number(parseInt(currentValue.indexLength));
	            }, 0),
	            dataLength: responseSchemaTables.data.reduce((accumulator, currentValue, currentIndex, array, initialValue) => {
	          	     return accumulator + new Number(parseInt(currentValue.dataLength));
	            }, 0),
	            dataFree: responseSchemaTables.data.reduce((accumulator, currentValue, currentIndex, array, initialValue) => {
	          	     return accumulator + new Number(parseInt(currentValue.dataFree));
	            }, 0),
	        };
    	},
    	createSubscription() {
	        const vm = this;
	        /*var aa = concatMap(this.fetchMetrics);*/
	        //console.log("fetchInterval = %o", this.fetchInterval);
	        return timer(0, this.fetchInterval * 1000)
	          .pipe(concatMap(this.fetchMetrics))
	          .subscribe({
	            next: data => {
	              // 计算最大值
	              if(vm.yAxisMax < data.value){
	              	vm.yAxisMax = data.value;
	              }
	              vm.hasLoaded = true;
	              /*if(vm.chartData.length >= 5){
	              	vm.chartData.shift();
	              }*/
	              var now = moment().valueOf();
	              vm.chartData.push({value: data.value, name: now, id: data.id});
	              vm.chartIndexData.push({value: data.indexLength, name: now, id: data.id});
	              vm.chartDataLength.push({value: data.dataLength, name: now, id: data.id});
	              vm.chartDataFree.push({value: data.dataFree, name: now, id: data.id});
	            },
	            error: error => {
	              vm.hasLoaded = true;
	              console.warn('Fetching memory metrics failed:', error);
	              vm.error = error;
	            }
	        });
	    },
    	drawChart() {
	        var axisLabelIndex = parseInt(this.chartData.length / this.fetchInterval);
	        //console.log("axisLabelIndex = %o", axisLabelIndex);
	        this.charter.setOption({
	        	xAxis:{
	        		data: this.chartData.map(r => moment(r.name).format('HH:mm:ss')),
	        		splitLine:{
			        	interval : axisLabelIndex
			        },
	        		axisLabel:{
			        	interval : axisLabelIndex
			        }
	        	},
		        series: [{
		            data: this.chartData,
		            //areaStyle: {}
		        },{
		        	data: this.chartIndexData,
		        	//areaStyle: {}
		        },{
		        	data: this.chartDataLength,
		        	//areaStyle: {}
		        },{
		        	data: this.chartDataFree,
		        	//areaStyle: {}
		        }]
	        });
	    },
    },
    mounted() {
      this.charter = echarts.init(this.$el.querySelector('.total-count-chart__svg'));
      this.charterDetail = echarts.init(this.$el.querySelector('.total-count-chart__detail'));
      var _this = this;
      this.charter.setOption({
        	title: {
            	text: 'Tables元数据统计'
	        },
	        color: [ '#c23531', '#209cee', '#42d3a5', '#ffdd57'],
	        tooltip: {
	        	trigger: 'axis',
	        	formatter: function(params){
    				var format = moment(params[0].name).format('HH:mm:ss') + ' <br/>';

    				for (var i in params) {
    					if(params[i].seriesIndex == 0){
    						format += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:' + params[i].color + '"></span>' + params[i].seriesName + " : " + params[i].value + '<br/>';
    					} else {
    						format += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:' + params[i].color + '"></span>' + params[i].seriesName + " : " + prettyBytes(parseInt(params[i].value)) + '<br/>';
    					}
    				}
    				format += '<a style="display:block;text-align:center;">单击折线点展示详情</a>';
    				return format;
    			}
	        },
	        legend: {
	            data:['数据总条数', '索引', '表空间', '空间碎片'],
	            /*selected:{
	            	'数据总条数': true,
	            	'索引总长度': false,
	            	'表空间': false
	            }*/
	        },
	        xAxis: {
	        	type: 'category',
	            splitLine: {
		            show: false,
		        },
		        axisPointer: {
					show: true,
					triggerTooltip: false,
					label: {
						show: true,
					}
				}
	        },
	        yAxis: [
		        {
		            type: 'value',
		            name: '条数',
		            position: 'left',
		            axisLine: {
		                lineStyle: {
		                    color: '#c23531'
		                }
		            },
		            axisPointer: {
						show: true,
						triggerTooltip: false,
						label:{
							precision: 0
						},
					}
		        },
		        {
		            type: 'value',
		            name: '数据大小',
		            position: 'right',
		            axisLabel: {
		                formatter:  function (value, index) {
						    return prettyBytes(parseInt(value));
						}
		            },
		            splitLine: {
			            show: false,
			        },
			        axisPointer: {
						show: true,
						triggerTooltip: false,
						label: {
							formatter: function (params) {
								return prettyBytes(parseInt(params.value));
							}
						}
					}
		        }
	        ],
	        dataZoom:[{
	        	show: true
	        },{
				type:"inside",
			}],
	        series: [{
	            name: '数据总条数', // 总条数
	            type: 'line',
        		//itemStyle : { normal: {label : {show: true}}},// 显示数值
	            data: this.chartData,
	            yAxisIndex: 0,
	            symbolSize: 10,
	        },{
	            name: '索引', // 索引总长度
	            type: 'bar',
        		//itemStyle : { normal: {label : {show: true}}},// 显示数值
	            data: this.chartIndexData,
	            yAxisIndex: 1,
	        },{
	            name: '表空间', // 索引总长度
	            type: 'bar',
        		//itemStyle : { normal: {label : {show: true}}},// 显示数值
	            data: this.chartDataLength,
	            yAxisIndex: 1,
	        },{
	            name: '空间碎片', // 索引总长度
	            type: 'bar',
        		//itemStyle : { normal: {label : {show: true}}},// 显示数值
	            data: this.chartDataFree,
	            yAxisIndex: 1,
	        }]
        });
        
        // 点击显示右侧详情饼图
      	this.charter.on('click', 'series.line', function (params) {
		    var targetDetail = _this.schemaTables[params.data.id];
		    //console.log('params = %o', params);
		    var selectPieData = {};
		    // 抽取详情数据
		    var drawPieData = targetDetail.map(r => {
        		var tempName = '';
        		if(r.tableComment){
        			tempName = r.tableName + '[' + r.tableComment + ']';
        		} else {
        			tempName = r.tableName;
        		}
        		return {
        			name: tempName,
        			value: r.tableRows
        		};
        	}).sort((k1, k2) => {
        		// 升序
        		return k2.value - k1.value;
        	});
        	// 默认选中前10个表
		    drawPieData.forEach((k, i) => {
		    	if(i < 10){
		    		selectPieData[k.name] = true;
		    	} else {
		    		selectPieData[k.name] = false;
		    	}
		    });
		    // 设置饼图
		    _this.charterDetail.setOption({
	        	title: {
	            	text: '详情统计-' + moment(params.data.name).format('HH:mm:ss'),
	            	subtext: '默认显示前10条',
	            	x: 'center'
		        },
		        tooltip: {
		        	trigger: 'item',
        			formatter: function(params){
        				//console.log(params);
        				var format = params.seriesName + " <br/><span style=\"display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:"+ params.color+"\"></span> " + params.name + " : " + params.value + " (" + params.percent + "%)";
        				return format;
        			}
		        },
		        legend: {
			        type: 'scroll',
			        orient: 'vertical',
			        right: 10,
			        top: 20,
			        bottom: 20,
			        selected: selectPieData
			    },
		        series: [{
		        	name: '数据条数',
		        	type: 'pie',
		        	radius : '55%',
		        	center : ['40%', '50%'],
					clockwise : false,
		        	startAngle : 180,
		        	data: drawPieData
		        }]
	        });
		});
    },
    watch: {
      chartData: 'drawChart',
      chartIndexData: 'drawChart',
      chartDataLength: 'drawChart',
      fetchInterval: function(val){
      	if(val >= this.fetchIntervalMin){
      		this.unsubscribe();
      		this.subscribe();
      		//console.log("reflush fetchInterval = %o", val);
      	}
      }
    }
  }
</script>
<style lang="scss">
  @import "../../../../assets/css/utilities";

  .total-count-chart {
    &__svg {
      height: 300px;
      width: 100%;
    }

    &__detail {
      height: 500px;
      width: 100%;
    }
  }
  .total-count__Interval{
  	width: 10em;
  }
</style>
