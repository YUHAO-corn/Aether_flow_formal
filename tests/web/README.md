# AetherFlow 网页测试文档

## 测试前置条件

在开始测试前，请确保满足以下条件：

1. MongoDB服务已启动
2. 后端服务已启动并正常运行
3. 前端环境变量已正确配置
4. 测试用户已创建
5. 测试数据已准备就绪

## 测试工具

我们提供了以下测试工具：

1. **环境检查脚本**：检查测试环境是否正确配置
2. **前端测试启动脚本**：启动前端服务并准备测试环境
3. **自动化测试脚本**：使用Puppeteer自动测试网页功能

## 测试步骤

### 1. 检查测试环境

```bash
npm run check:web-env
```

此命令将检查：
- MongoDB服务是否运行
- 后端服务是否运行
- 前端环境变量是否正确配置
- 测试用户是否存在
- 测试数据是否准备就绪

如果环境检查通过，将显示"测试环境已准备就绪"。

### 2. 启动前端测试

```bash
npm run start:web-test
```

此命令将：
- 检查测试环境
- 安装前端依赖（如果需要）
- 准备浏览器控制台命令
- 启动前端服务

### 3. 手动测试

启动前端服务后，您可以在浏览器中访问前端应用（通常是http://localhost:5173）。

为了解决前后端数据格式不匹配的问题，请在浏览器控制台中执行以下命令：

```javascript
// 修改apiClient.get方法来适配后端响应格式
const originalGet = apiClient.get.bind(apiClient);
apiClient.get = async function(url, config, useCache) {
  try {
    const response = await originalGet(url, config, useCache);
    console.log('API响应:', response);
    // 转换响应格式以匹配前端期望的格式
    if (response && response.data && Array.isArray(response.data)) {
      // 转换_id为id
      const transformedData = response.data.map(item => ({
        ...item,
        id: item._id,
      }));
      return { data: { prompts: transformedData } };
    }
    return response;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
};

console.log('API客户端已修复，前后端数据格式已适配');
```

然后，您可以测试以下功能：

1. **登录功能**：
   - 点击右上角的"Account"按钮
   - 点击"Sign In"
   - 输入测试用户的邮箱和密码
   - 点击"Login"按钮
   - 验证登录是否成功

2. **提示词列表**：
   - 验证提示词列表是否显示
   - 验证提示词卡片是否包含正确的信息

3. **搜索功能**：
   - 在搜索框中输入关键词
   - 验证搜索结果是否正确

4. **标签筛选**：
   - 点击左侧的标签
   - 验证筛选结果是否正确

5. **登出功能**：
   - 点击右上角的用户名
   - 点击"Sign Out"
   - 验证登出是否成功

### 4. 自动化测试

```bash
npm run test:web
```

此命令将使用Puppeteer自动测试以下功能：

1. 登录流程
2. 提示词列表
3. 搜索提示词
4. 标签筛选
5. 登出功能

测试完成后，将显示测试结果。

## 测试注意事项

1. **前后端数据格式不匹配**：
   - 前端期望的格式：`{ data: { prompts: [...] } }`
   - 后端返回的格式：`{ success: true, status: "success", data: [...] }`
   - 需要在浏览器控制台中执行修复代码

2. **ID字段不匹配**：
   - 前端期望的字段：`id`
   - 后端返回的字段：`_id`
   - 修复代码会将`_id`映射为`id`

3. **测试用户**：
   - 邮箱：`test@example.com`
   - 密码：`password123`

4. **测试数据**：
   - 环境检查脚本会自动创建测试标签和测试提示词
   - 如果需要更多测试数据，可以手动创建

## 故障排除

1. **MongoDB服务未运行**：
   - 使用`mongod --dbpath=/data/db`启动MongoDB服务

2. **后端服务未运行**：
   - 使用`npm run start:backend`启动后端服务

3. **前端环境变量配置错误**：
   - 检查`AetherFlow_web_front/.env`文件
   - 确保`VITE_API_BASE_URL`设置为`http://localhost:3001/api/v1`

4. **测试用户创建失败**：
   - 检查后端服务是否正常运行
   - 检查MongoDB连接是否正常
   - 检查用户是否已存在

5. **自动化测试失败**：
   - 检查Puppeteer是否正确安装
   - 检查前端服务是否正常运行
   - 检查测试用户是否存在
   - 检查测试数据是否准备就绪 