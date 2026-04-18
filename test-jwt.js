const jwt = require('jsonwebtoken');
const secret = '58da95d558bab65ec44b1ef6dbd479843d6f9353bd8b67d811bd479843d6f9353bd8b67d8119c7c74921199e383';

try {
  const token = jwt.sign({ id: 1, role: 'seller', username: 'aaa' }, secret, { expiresIn: '72h' });
  console.log('✅ JWT generated successfully');
  console.log('Token length:', token.length);
  
  // 验证生成的 token
  const decoded = jwt.verify(token, secret);
  console.log('✅ Token verified successfully');
  console.log('Decoded payload:', decoded);
} catch (error) {
  console.error('❌ Error:', error.message);
}