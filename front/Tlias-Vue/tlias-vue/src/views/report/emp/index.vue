<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts';
import { empJobData, empGenderData } from '@/api/report'

// 1. 使用模板引用替代 getElementById
const jobChartRef = ref(null)
const genderChartRef = ref(null)

// 保存实例以便后续 resize 和 dispose
let jobChartInstance = null
let genderChartInstance = null

// 窗口缩放自适应处理
const handleResize = () => {
  jobChartInstance?.resize()
  genderChartInstance?.resize()
}

onMounted(() => {
  loadJobChart()
  loadGenderChart()
  window.addEventListener('resize', handleResize)
})

// 2. 组件卸载时必须销毁实例，防止内存泄漏
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  jobChartInstance?.dispose()
  genderChartInstance?.dispose()
  jobChartInstance = null
  genderChartInstance = null
})

const loadJobChart = async () => {
  try {
    const result = await empJobData()
    // 3. 增加数据容错校验
    if (result.code && result.data) {
      initJobChart(result.data.jobList || [], result.data.dataList || [])
    }
  } catch (error) {
    console.error('加载职位统计报表失败:', error)
  }
}

const loadGenderChart = async () => {
  try {
    const result = await empGenderData()
    if (result.code && result.data) {
      initGenderChart(result.data)
    }
  } catch (error) {
    console.error('加载性别统计报表失败:', error)
  }
}

function initJobChart(jobList, dataList) {
  // 使用 ref.value 获取 DOM
  jobChartInstance = echarts.init(jobChartRef.value)
  jobChartInstance.setOption({
    title: { text: '员工职位统计', left: 'center', textStyle: { fontSize: 20 } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: { data: jobList },
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

function initGenderChart(genderDataList) {
  genderChartInstance = echarts.init(genderChartRef.value)
  genderChartInstance.setOption({
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
      data: genderDataList
    }]
  })
}
</script>

<template>
  <!-- 4. 使用 Flex 布局替代 float -->
  <div class="report-container">
    <div ref="jobChartRef" class="chart-box chart-left"></div>
    <div ref="genderChartRef" class="chart-box"></div>
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