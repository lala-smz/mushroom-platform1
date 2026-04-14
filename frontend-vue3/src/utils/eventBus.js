import mitt from 'mitt'

// 创建事件总线实例
const eventBus = mitt()

// 定义事件类型常量
export const EventTypes = {
  // 消息相关事件
  MESSAGE_SENT: 'message:sent',
  MESSAGE_RECEIVED: 'message:received',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_READ: 'message:read',
  MESSAGE_SEND_CONFIRMED: 'message:send:confirmed',
  NEW_MESSAGE_RECEIVED: 'new:message:received',
  
  // 对话相关事件
  CONVERSATION_CREATED: 'conversation:created',
  CONVERSATION_UPDATED: 'conversation:updated',
  CONVERSATION_DELETED: 'conversation:deleted',
  
  // 未读消息相关事件
  UNREAD_COUNT_UPDATED: 'unreadCount:updated',
  
  // 用户状态相关事件
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  
  // 盲盒相关事件
  BOX_DRAW_COMPLETED: 'box:draw:completed',
  BOX_DRAW_RESULT_UPDATED: 'box:draw:result:updated',
  
  // 收藏相关事件
  WORK_FAVORITED: 'work:favorited',
  WORK_UNFAVORITED: 'work:unfavorited',
  
  // 作品上传相关事件
  WORK_UPLOADED: 'work:uploaded'
}

export default eventBus
