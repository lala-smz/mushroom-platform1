import { ElMessage } from 'element-plus'

/**
 * 统一的消息提示工具
 */
export const message = {
  /**
   * 成功提示
   * @param {string} msg 提示内容
   */
  success(msg) {
    ElMessage.success({
      message: msg,
      duration: 2000
    })
  },
  
  /**
   * 错误提示
   * @param {string} msg 提示内容
   */
  error(msg) {
    ElMessage.error({
      message: msg,
      duration: 3000
    })
  },
  
  /**
   * 警告提示
   * @param {string} msg 提示内容
   */
  warning(msg) {
    ElMessage.warning({
      message: msg,
      duration: 2500
    })
  },
  
  /**
   * 信息提示
   * @param {string} msg 提示内容
   */
  info(msg) {
    ElMessage.info({
      message: msg,
      duration: 2000
    })
  }
}
