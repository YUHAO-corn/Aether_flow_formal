// 创建Express应用
const app = express();
app.use(cors({
  origin: '*', // 允许所有来源访问
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '10mb' })); 