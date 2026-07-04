<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts';
import { studentDegreeData, studentCountData } from '@/api/report'

//Dom数据绑定
const stuDegree = ref(null);
const stuCount = ref(null);

//保存实例以便后续 resize 和 dispose
let stuChartDegree = null;
let stuChartCount = null;


//调用API获取Degree
const loadstuDegree = async () =>{
  const result = await studentDegreeData();
  if(result.code){
    initstuDegree(result.data);
  }
}

function initstuDegree(DegreeList){
  stuChartDegree = echarts.init(stuDegree.value)
  stuChartDegree.setOption({
    title: { text: '员工性别统计', left: 'center', textStyle: { fontSize: 20 } },
    tooltip: { trigger: 'item' },
    legend: { top: '10%', left: 'center' },
    series: [{
      name: '性别',
      type: 'pie',
      radius: ['40%', '70%'],
      top: '5%',
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
      data: DegreeList
    }]
  })
}

//调用API获取Count
const loadstuConut = async() =>{
  const result = await studentCountData();
  if(result.code){
    initstuCount(result.data.clazzList, result.data.dataList)
  }
}

function initstuCount(nameList,dataList){
  stuChartCount = echarts.init(stuCount.value)
  stuChartCount.setOption({
    title: { text: '员工职位统计', left: 'center', textStyle: { fontSize: 20 } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: { data: nameList },
    yAxis: {},
    series: [{
      name: '人数',
      type: 'bar',
      data: dataList,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
          { offset: 0, color: '#ffbf61' },
          { offset: 1, color: '#dd5f85' }
        ])
      }
    }]
  })
}

// 窗口缩放自适应处理
const handleResize = () =>{
  stuChartCount?.resize()
  stuChartDegree?.resize()
  //resize() : 通知 ECharts 重新计算容器宽高并重绘图表
}

onMounted(() => {
  loadstuConut()
  loadstuDegree()
  window.addEventListener('resize',handleResize)
  //resize : 这是浏览器内置的窗口大小改变事件的标准名称。当用户拖拽浏览器边缘、最大化/最小化窗口时，浏览器会自动触发这个事件
})

// 组件卸载时必须销毁实例，防止内存泄漏
onUnmounted(() => {
  window,removeEventListener('resize', handleResize)
  stuChartCount?.dispose()
  stuChartDegree?.dispose()
  stuChartCount = null
  stuChartDegree = null
})


</script>

<template>
  <!-- 4. 使用 Flex 布局替代 float -->
  <div class="report-container">
    <div ref="stuDegree" class="chart-box chart-left"></div>
    <div ref="stuCount" class="chart-box"></div>
  </div>
</template>

<style scoped>
  .report-container {
    display: flex;
    width: 100%;
    height: 500px; /* ECharts 容器必须有明确的高度 */
    gap: 10px;
  }

  .chart-box {
    flex: 1;
    min-width: 0; /* 防止 flex 子项内容溢出撑破布局 */
    height: 100%;
  }

  .chart-left {
    border-right: 1px dashed #ccc;
  }
</style>