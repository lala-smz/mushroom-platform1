const bcrypt = require('bcryptjs');

// 从数据库获取的哈希密码
const hash = '$2a$10$t4y0QayLB.swR/o4l6CnJ.3';

console.log('Testing bcrypt password verification:');
console.log('Hash:', hash);
console.log('Hash length:', hash.length);
console.log('Hash starts with $2a:', hash.startsWith('$2a'));

// 测试密码验证
const testPasswords = ['123456', 'password', 'admin', 'test'];
testPasswords.forEach(pwd => {
  const result = bcrypt.compareSync(pwd, hash);
  console.log(`Password '${pwd}' matches:`, result);
});