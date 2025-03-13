/**
 * 测试报告生成器
 * 用于分析测试结果并生成报告
 */

const fs = require('fs');
const path = require('path');

// 分析测试覆盖率报告
const analyzeCoverage = (coverageData) => {
  if (!coverageData) {
    return {
      summary: '无覆盖率数据',
      details: {}
    };
  }

  const summary = {
    statements: {
      covered: 0,
      total: 0,
      percentage: 0
    },
    branches: {
      covered: 0,
      total: 0,
      percentage: 0
    },
    functions: {
      covered: 0,
      total: 0,
      percentage: 0
    },
    lines: {
      covered: 0,
      total: 0,
      percentage: 0
    }
  };

  const details = {};

  // 遍历所有文件的覆盖率数据
  Object.keys(coverageData).forEach(filePath => {
    const fileData = coverageData[filePath];
    const fileName = path.basename(filePath);
    
    // 计算文件的覆盖率
    const fileSummary = {
      statements: {
        covered: fileData.s.covered || 0,
        total: fileData.s.total || 0,
        percentage: fileData.s.pct || 0
      },
      branches: {
        covered: fileData.b.covered || 0,
        total: fileData.b.total || 0,
        percentage: fileData.b.pct || 0
      },
      functions: {
        covered: fileData.f.covered || 0,
        total: fileData.f.total || 0,
        percentage: fileData.f.pct || 0
      },
      lines: {
        covered: fileData.l.covered || 0,
        total: fileData.l.total || 0,
        percentage: fileData.l.pct || 0
      }
    };
    
    // 更新总体覆盖率
    summary.statements.covered += fileSummary.statements.covered;
    summary.statements.total += fileSummary.statements.total;
    summary.branches.covered += fileSummary.branches.covered;
    summary.branches.total += fileSummary.branches.total;
    summary.functions.covered += fileSummary.functions.covered;
    summary.functions.total += fileSummary.functions.total;
    summary.lines.covered += fileSummary.lines.covered;
    summary.lines.total += fileSummary.lines.total;
    
    details[fileName] = fileSummary;
  });
  
  // 计算总体覆盖率百分比
  if (summary.statements.total > 0) {
    summary.statements.percentage = (summary.statements.covered / summary.statements.total) * 100;
  }
  if (summary.branches.total > 0) {
    summary.branches.percentage = (summary.branches.covered / summary.branches.total) * 100;
  }
  if (summary.functions.total > 0) {
    summary.functions.percentage = (summary.functions.covered / summary.functions.total) * 100;
  }
  if (summary.lines.total > 0) {
    summary.lines.percentage = (summary.lines.covered / summary.lines.total) * 100;
  }
  
  return {
    summary,
    details
  };
};

// 分析测试结果
const analyzeTestResults = (testResults) => {
  if (!testResults) {
    return {
      summary: '无测试结果数据',
      details: {}
    };
  }
  
  const summary = {
    passed: 0,
    failed: 0,
    pending: 0,
    total: 0,
    duration: 0
  };
  
  const details = {};
  
  // 遍历所有测试套件的结果
  testResults.testResults.forEach(testSuite => {
    const suiteName = path.basename(testSuite.testFilePath);
    const suiteResults = {
      passed: 0,
      failed: 0,
      pending: 0,
      total: testSuite.numPassingTests + testSuite.numFailingTests + testSuite.numPendingTests,
      duration: testSuite.perfStats.end - testSuite.perfStats.start,
      tests: []
    };
    
    // 遍历测试套件中的所有测试用例
    testSuite.testResults.forEach(test => {
      const testResult = {
        name: test.title,
        status: test.status,
        duration: test.duration
      };
      
      // 更新测试套件的统计数据
      if (test.status === 'passed') {
        suiteResults.passed++;
      } else if (test.status === 'failed') {
        suiteResults.failed++;
      } else if (test.status === 'pending') {
        suiteResults.pending++;
      }
      
      suiteResults.tests.push(testResult);
    });
    
    // 更新总体统计数据
    summary.passed += suiteResults.passed;
    summary.failed += suiteResults.failed;
    summary.pending += suiteResults.pending;
    summary.total += suiteResults.total;
    summary.duration += suiteResults.duration;
    
    details[suiteName] = suiteResults;
  });
  
  return {
    summary,
    details
  };
};

// 生成测试报告
const generateReport = (testResultsPath, coverageResultsPath, outputPath) => {
  try {
    // 读取测试结果和覆盖率数据
    const testResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
    const coverageResults = JSON.parse(fs.readFileSync(coverageResultsPath, 'utf8'));
    
    // 分析测试结果和覆盖率数据
    const testAnalysis = analyzeTestResults(testResults);
    const coverageAnalysis = analyzeCoverage(coverageResults);
    
    // 生成报告
    const report = {
      timestamp: new Date().toISOString(),
      testResults: testAnalysis,
      coverageResults: coverageAnalysis
    };
    
    // 写入报告文件
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    
    console.log(`测试报告已生成: ${outputPath}`);
    
    return report;
  } catch (error) {
    console.error('生成测试报告失败:', error);
    throw error;
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  const args = process.argv.slice(2);
  const testResultsPath = args[0] || 'test-results.json';
  const coverageResultsPath = args[1] || 'coverage/coverage-final.json';
  const outputPath = args[2] || 'test-report.json';
  
  generateReport(testResultsPath, coverageResultsPath, outputPath);
}

module.exports = {
  analyzeCoverage,
  analyzeTestResults,
  generateReport
}; 