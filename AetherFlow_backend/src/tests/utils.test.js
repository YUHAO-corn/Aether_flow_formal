const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const { catchAsync } = require('../utils/catchAsync');
const { validateEmail, validatePassword } = require('../utils/validators');

describe('工具类单元测试', () => {
  describe('AppError', () => {
    it('应正确创建应用错误', () => {
      const message = '测试错误';
      const statusCode = 400;
      const error = new AppError(message, statusCode);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
      expect(error.status).toBe('error');
      expect(error.isOperational).toBe(true);
    });

    it('应包含错误堆栈', () => {
      const error = new AppError('测试错误', 400);
      expect(error.stack).toBeDefined();
    });
  });

  describe('catchAsync', () => {
    it('应正确处理异步函数', async () => {
      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();

      const mockFunction = jest.fn().mockResolvedValue('success');
      const wrappedFunction = catchAsync(mockFunction);

      await wrappedFunction(mockReq, mockRes, mockNext);

      expect(mockFunction).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应将错误传递给next', async () => {
      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();
      const mockError = new Error('测试错误');

      const mockFunction = jest.fn().mockRejectedValue(mockError);
      const wrappedFunction = catchAsync(mockFunction);

      await wrappedFunction(mockReq, mockRes, mockNext);

      expect(mockFunction).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('validators', () => {
    describe('validateEmail', () => {
      it('应验证有效的邮箱地址', () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.com',
          'user+label@domain.com'
        ];

        validEmails.forEach(email => {
          expect(validateEmail(email)).toBe(true);
        });
      });

      it('应拒绝无效的邮箱地址', () => {
        const invalidEmails = [
          'invalid-email',
          'user@',
          '@domain.com',
          'user@.com',
          'user@domain.'
        ];

        invalidEmails.forEach(email => {
          expect(validateEmail(email)).toBe(false);
        });
      });
    });

    describe('validatePassword', () => {
      it('应验证有效的密码', () => {
        const validPasswords = [
          'Password123!',
          'Complex@Pass1',
          'Secure123Password!'
        ];

        validPasswords.forEach(password => {
          expect(validatePassword(password)).toBe(true);
        });
      });

      it('应拒绝无效的密码', () => {
        const invalidPasswords = [
          'short',           // 太短
          'onlylowercase',   // 没有大写字母
          'ONLYUPPERCASE',   // 没有小写字母
          'NoNumbers',       // 没有数字
          'no-special1'      // 没有特殊字符
        ];

        invalidPasswords.forEach(password => {
          expect(validatePassword(password)).toBe(false);
        });
      });
    });
  });

  describe('logger', () => {
    beforeEach(() => {
      // 保存原始的console方法
      this.originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info,
        debug: console.debug
      };

      // 模拟console方法
      console.log = jest.fn();
      console.error = jest.fn();
      console.warn = jest.fn();
      console.info = jest.fn();
      console.debug = jest.fn();
    });

    afterEach(() => {
      // 恢复原始的console方法
      console.log = this.originalConsole.log;
      console.error = this.originalConsole.error;
      console.warn = this.originalConsole.warn;
      console.info = this.originalConsole.info;
      console.debug = this.originalConsole.debug;
    });

    it('应正确记录错误日志', () => {
      const error = new Error('测试错误');
      logger.error('错误消息', error);

      expect(console.error).toHaveBeenCalled();
      const logArgs = console.error.mock.calls[0];
      expect(logArgs[0]).toContain('错误消息');
      expect(logArgs[1]).toBe(error);
    });

    it('应正确记录警告日志', () => {
      logger.warn('警告消息');

      expect(console.warn).toHaveBeenCalled();
      const logArgs = console.warn.mock.calls[0];
      expect(logArgs[0]).toContain('警告消息');
    });

    it('应正确记录信息日志', () => {
      logger.info('信息消息');

      expect(console.info).toHaveBeenCalled();
      const logArgs = console.info.mock.calls[0];
      expect(logArgs[0]).toContain('信息消息');
    });

    it('应正确记录调试日志', () => {
      logger.debug('调试消息');

      expect(console.debug).toHaveBeenCalled();
      const logArgs = console.debug.mock.calls[0];
      expect(logArgs[0]).toContain('调试消息');
    });

    it('应包含时间戳和日志级别', () => {
      logger.info('测试消息');

      const logArgs = console.info.mock.calls[0][0];
      expect(logArgs).toMatch(/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]/); // 时间戳
      expect(logArgs).toContain('[INFO]'); // 日志级别
    });
  });
}); 