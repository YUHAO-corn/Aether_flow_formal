/**
 * 测试运行器
 * 用于运行测试并生成报告
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { generateReport } = require('./generateReport');

// 运行测试
const runTests = (options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      testPattern = '',
      coverage = true,
      detectOpenHandles = true,
      maxWorkers = '50%',
      outputDir = 'test-results',
      verbose = false
    } = options;

    // 创建输出目录
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 构建Jest命令参数
    const args = ['--json', `--outputFile=${path.join(outputDir, 'test-results.json')}`];

    if (coverage) {
      args.push('--coverage');
      args.push(`--coverageDirectory=${path.join(outputDir, 'coverage')}`);
    }

    if (detectOpenHandles) {
      args.push('--detectOpenHandles');
    }

    if (maxWorkers) {
      args.push(`--maxWorkers=${maxWorkers}`);
    }

    if (testPattern) {
      args.push(testPattern);
    }

    if (verbose) {
      args.push('--verbose');
    }

    // 设置环境变量
    const env = {
      ...process.env,
      NODE_ENV: 'test'
    };

    console.log(`运行测试命令: jest ${args.join(' ')}`);

    // 运行Jest命令
    const jest = spawn('npx', ['jest', ...args], {
      env,
      stdio: 'inherit'
    });

    jest.on('close', (code) => {
      if (code !== 0) {
        console.error(`测试运行失败，退出码: ${code}`);
        reject(new Error(`测试运行失败，退出码: ${code}`));
        return;
      }

      console.log('测试运行完成');

      // 生成测试报告
      try {
        const testResultsPath = path.join(outputDir, 'test-results.json');
        const coverageResultsPath = path.join(outputDir, 'coverage', 'coverage-final.json');
        const reportPath = path.join(outputDir, 'test-report.json');

        if (fs.existsSync(testResultsPath)) {
          if (coverage && fs.existsSync(coverageResultsPath)) {
            const report = generateReport(testResultsPath, coverageResultsPath, reportPath);
            resolve(report);
          } else {
            console.log('未生成覆盖率报告，跳过报告生成');
            const testResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
            resolve(testResults);
          }
        } else {
          console.error('未找到测试结果文件');
          reject(new Error('未找到测试结果文件'));
        }
      } catch (error) {
        console.error('生成测试报告失败:', error);
        reject(error);
      }
    });

    jest.on('error', (error) => {
      console.error('启动测试进程失败:', error);
      reject(error);
    });
  });
};

// 如果直接运行此脚本
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    testPattern: args[0] || '',
    coverage: args.includes('--coverage'),
    detectOpenHandles: args.includes('--detectOpenHandles'),
    maxWorkers: args.find(arg => arg.startsWith('--maxWorkers='))?.split('=')[1] || '50%',
    outputDir: args.find(arg => arg.startsWith('--outputDir='))?.split('=')[1] || 'test-results',
    verbose: args.includes('--verbose')
  };

  runTests(options)
    .then(report => {
      console.log('测试报告生成成功');
      process.exit(0);
    })
    .catch(error => {
      console.error('测试运行失败:', error);
      process.exit(1);
    });
}

module.exports = {
  runTests
}; 