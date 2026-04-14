<template>
  <div class="rating-trend-chart">
    <h3 class="chart-title">
      评分历史趋势
    </h3>
    
    <!-- 图表容器 -->
    <div class="chart-container">
      <!-- 加载状态 -->
      <div
        v-if="isLoading"
        class="chart-loading"
      >
        <el-skeleton
          :rows="3"
          animated
        />
      </div>
      
      <!-- 无数据状态 -->
      <div
        v-else-if="!hasData"
        class="chart-empty"
      >
        <el-empty description="暂无评分历史数据" />
      </div>
      
      <!-- 图表 -->
      <div
        v-else
        ref="chartRef"
        class="chart-wrapper"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

// Props
const props = defineProps({
  workId: {
    type: String || Number,
    required: true
  },
  data: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

// 响应式数据
const chartRef = ref(null)
const chartInstance = ref(null)

// 计算是否有数据
const hasData = computed(() => {
  return props.data && props.data.length > 0
})

// 初始化图表
const initChart = async () => {
  await nextTick()
  
  if (!chartRef.value) return
  
  // 销毁旧图表实例
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
  
  // 检查数据是否有效
  if (!props.data || props.data.length === 0) {
    console.warn('图表数据为空，跳过初始化')
    return
  }
  
  // 检查数据格式是否正确
  const isValidData = props.data.every(item => {
    return item && typeof item.date === 'string' && typeof item.rating === 'number'
  })
  
  if (!isValidData) {
    console.warn('图表数据格式不正确，跳过初始化')
    return
  }
  
  try {
    // 创建新图表实例
    chartInstance.value = echarts.init(chartRef.value)
    
    // 配置图表
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          if (!params || params.length === 0) return ''
          const data = params[0]
          return `${data.name}<br/>评分: ${data.value}分`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: props.data.map(item => item.date),
        axisLabel: {
          rotate: 45,
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 5,
        interval: 1,
        axisLabel: {
          formatter: '{value}分'
        }
      },
      series: [
        {
          name: '评分',
          type: 'line',
          coordinateSystem: 'cartesian2d',
          smooth: true,
          data: props.data.map(item => item.rating),
          itemStyle: {
            color: '#4CAF50'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(76, 175, 80, 0.3)'
              }, {
                offset: 1, color: 'rgba(76, 175, 80, 0.1)'
              }]
            }
          },
          symbol: 'circle',
          symbolSize: 6,
          emphasis: {
            focus: 'series',
            itemStyle: {
              symbolSize: 8
            }
          }
        }
      ]
    }
    
    // 设置图表选项
    chartInstance.value.setOption(option)
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)
  } catch (error) {
    console.error('初始化图表失败:', error)
    // 清理图表实例
    if (chartInstance.value) {
      chartInstance.value.dispose()
      chartInstance.value = null
    }
  }
}

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
}

// 监听数据变化
watch(() => props.data, () => {
  initChart()
}, { deep: true })

// 监听加载状态变化
watch(() => props.isLoading, () => {
  if (!props.isLoading && hasData.value) {
    initChart()
  }
})

// 组件挂载时
onMounted(() => {
  if (hasData.value && !props.isLoading) {
    initChart()
  }
})

// 组件卸载时
onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.rating-trend-chart {
  margin: 30px 0;
}

.chart-title {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 600;
}

.chart-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  min-height: 300px;
}

.chart-wrapper {
  width: 100%;
  height: 300px;
}

.chart-loading {
  padding: 40px 0;
}

.chart-empty {
  padding: 40px 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chart-container {
    padding: 15px;
    min-height: 250px;
  }
  
  .chart-wrapper {
    height: 250px;
  }
  
  .chart-title {
    font-size: 1rem;
    margin-bottom: 15px;
  }
}
</style>