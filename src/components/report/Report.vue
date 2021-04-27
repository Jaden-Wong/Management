<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <div id="main" style="width: 900px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import _ from 'lodash'
export default {
  data () {
    return {
      option: {
        title: {
          text: '数据统计'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '销量',
          type: 'bar',
          data: [5, 20, 36, 10, 10, 20],
          emphasis: {
            focus: 'series'
          }
        }]
      }
    }
  },
  // 此时页面上的元素已经渲染完毕
  async mounted () {
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))
    // 绘制图表
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取统计数据失败！')
    }
    // console.log(res.data)
    // const result = Object.assign(this.option, res.data)
    const result = _.merge(res.data, this.option)
    myChart.setOption(result)
  }
}
</script>

<style lang="scss" scoped>
#main{
  margin: auto;
}
</style>
