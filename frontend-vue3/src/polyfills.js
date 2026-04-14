// util._extend polyfill
// 解决 util._extend 弃用警告，替换为 Object.assign
try {
  // 尝试访问 require 变量
  require;
  
  // 如果没有抛出错误，说明 require 是定义的，执行 require 相关逻辑
  try {
    const util = require('util');
    if (util && typeof util._extend === 'function') {
      // 替换 util._extend 为 Object.assign
      util._extend = Object.assign;
      console.log('已替换 util._extend 为 Object.assign');
    }
  } catch (e) {
    // 忽略错误
  }
} catch (e) {
  // require 未定义，忽略
}
