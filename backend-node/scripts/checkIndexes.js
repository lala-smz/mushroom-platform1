const fs = require('fs');
const path = require('path');

const modelsDir = './models';
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js') && f !== 'index.js');

let totalIndexes = {};

files.forEach(file => {
  const content = fs.readFileSync(path.join(modelsDir, file), 'utf8');
  const indexMatch = content.match(/indexes:\s*\[([\s\S]*?)\]/);
  if (indexMatch) {
    const indexContent = indexMatch[1];
    const count = (indexContent.match(/fields:/g) || []).length;
    totalIndexes[file] = count;
  }
});

console.log('各模型索引数量统计：');
console.log('---------------------');
Object.entries(totalIndexes).forEach(([file, count]) => {
  console.log(file + ': ' + count + ' 个索引');
});
console.log('---------------------');
let maxCount = 0;
let maxFile = '';
Object.entries(totalIndexes).forEach(([file, count]) => {
  if (count > maxCount) {
    maxCount = count;
    maxFile = file;
  }
});
console.log('索引最多的模型: ' + maxFile + ' (' + maxCount + ' 个索引)');