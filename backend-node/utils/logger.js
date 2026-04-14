const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SUCCESS: 4
};

const currentLogLevel = LOG_LEVELS.INFO;

const timestamp = () => {
  const now = new Date();
  return now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

const logger = {
  debug: (module, message, data = null) => {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.log(`${colors.gray}[${timestamp()}] [DEBUG] [${module}]${colors.reset}`, colors.white + message + colors.reset);
      if (data !== null) {
        console.log(`${colors.gray}  ↳${colors.reset}`, data);
      }
    }
  },

  info: (module, message, data = null) => {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.log(`${colors.blue}[${timestamp()}] [INFO] [${module}]${colors.reset}`, colors.white + message + colors.reset);
      if (data !== null) {
        console.log(`${colors.gray}  ↳${colors.reset}`, data);
      }
    }
  },

  warn: (module, message, data = null) => {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      console.log(`${colors.yellow}[${timestamp()}] [WARN] [${module}]${colors.reset}`, colors.yellow + message + colors.reset);
      if (data !== null) {
        console.log(`${colors.yellow}  ↳${colors.reset}`, data);
      }
    }
  },

  error: (module, message, error = null) => {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      console.log(`${colors.red}${colors.bright}[${timestamp()}] [ERROR] [${module}]${colors.reset}`, colors.red + message + colors.reset);
      if (error) {
        if (error.message) {
          console.log(`${colors.red}  错误消息:${colors.reset}`, error.message);
        }
        if (error.stack) {
          console.log(`${colors.red}  堆栈跟踪:${colors.reset}\n`, error.stack);
        }
        if (error.sql) {
          console.log(`${colors.red}  SQL语句:${colors.reset}`, error.sql);
        }
      }
    }
  },

  success: (module, message, data = null) => {
    if (currentLogLevel <= LOG_LEVELS.SUCCESS) {
      console.log(`${colors.green}${colors.bright}[${timestamp()}] [SUCCESS] [${module}]${colors.reset}`, colors.green + message + colors.reset);
      if (data !== null) {
        console.log(`${colors.green}  ↳${colors.reset}`, data);
      }
    }
  },

  request: (method, url, user = null) => {
    const userInfo = user ? ` (用户: ${user.username || user.id})` : '';
    console.log(`${colors.cyan}[${timestamp()}] [REQUEST]${colors.reset}`, colors.cyan + colors.bright + `${method} ${url}${userInfo}` + colors.reset);
  },

  response: (method, url, status, duration = null) => {
    const durationStr = duration ? ` (${duration}ms)` : '';
    const statusColor = status >= 200 && status < 300 ? colors.green : colors.red;
    console.log(`${colors.cyan}[${timestamp()}] [RESPONSE]${colors.reset}`, 
      colors.cyan + `${method} ${url}` + colors.reset, 
      statusColor + colors.bright + `${status}${durationStr}` + colors.reset);
  },

  separator: () => {
    console.log(colors.gray + '─'.repeat(80) + colors.reset);
  },

  section: (title) => {
    console.log(colors.gray + '═'.repeat(80) + colors.reset);
    console.log(colors.white + colors.bright + `  ${title}` + colors.reset);
    console.log(colors.gray + '═'.repeat(80) + colors.reset);
  }
};

module.exports = logger;
