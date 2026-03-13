const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Game = require('./models/Game');
const multer = require('multer');
const path = require('path');

// 配置multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../images');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 加载环境变量
dotenv.config();

// 启动服务器
const startServer = async () => {
  try {
    await connectDB();
    
    // 初始化管理员用户
    await initAdmin();
    
    // 初始化游戏数据
    await initGames();
    
    const app = express();

    // 中间件
    app.use(cors());
    app.use(express.json());

    // 文件上传路由
    app.post('/api/upload', upload.single('image'), (req, res) => {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      res.json({ 
        message: 'File uploaded successfully', 
        filename: req.file.filename,
        path: `/images/${req.file.filename}` 
      });
    });

    // 路由
    app.use('/api/games', require('./routes/games'));
    app.use('/api/reviews', require('./routes/reviews'));
    app.use('/api/auth', require('./routes/auth'));

    // 详细路径调试
    console.log('Current directory:', __dirname);
    console.log('Parent directory:', path.resolve(__dirname, '..'));
    console.log('Current working directory:', process.cwd());

    // 添加文件系统模块
    const fs = require('fs');

    // 检查当前目录结构
    console.log('Checking current directory structure:');
    try {
      const files = fs.readdirSync(__dirname);
      console.log('Files in current directory:', files);
      
      // 检查是否有html目录
      if (fs.existsSync(path.join(__dirname, 'html'))) {
        const htmlFiles = fs.readdirSync(path.join(__dirname, 'html'));
        console.log('Files in html directory:', htmlFiles);
      } else {
        console.log('html directory does not exist');
      }
    } catch (error) {
      console.error('Error reading directory:', error);
    }

    // 静态文件服务 - 使用相对路径
    app.use(express.static('html'));
    app.use('/css', express.static('css'));
    app.use('/js', express.static('js'));
    app.use('/images', express.static('images'));
    app.use('/fonts', express.static('fonts'));

    // 默认路由
    app.get('/', (req, res) => {
      console.log('Request received for /');
      try {
        res.sendFile('index.html', { root: 'html' });
      } catch (error) {
        console.error('Error sending file:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

// 初始化管理员用户
const initAdmin = async () => {
  const User = require('./models/User');
  const count = await User.countDocuments({ role: 'admin' });
  if (count === 0) {
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });
    await adminUser.save();
    console.log('Admin user initialized');
  }
};

// 初始化游戏数据
const initGames = async () => {
  const count = await Game.countDocuments();
  if (count === 0) {
    const games = [
      {
        name: '塞尔达传说：王国之泪',
        publisher: 'Nintendo',
        release_date: '2023-05-12',
        platforms: ['Switch'],
        genres: ['动作冒险'],
        description: '《塞尔达传说：王国之泪》是任天堂开发的开放世界动作冒险游戏，是《塞尔达传说：旷野之息》的续作。游戏中玩家将继续扮演林克，在海拉鲁大陆上冒险，探索天空、陆地和地下世界，使用各种能力解决谜题和战斗。',
        cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=the%20legend%20of%20zelda%20tears%20of%20the%20kingdom%20game%20cover&image_size=square'
      },
      {
        name: '赛博朋克2077',
        publisher: 'CD Projekt Red',
        release_date: '2020-12-10',
        platforms: ['PC', 'PlayStation', 'Xbox'],
        genres: ['RPG', '开放世界'],
        description: '《赛博朋克2077》是由CD Projekt Red开发的开放世界角色扮演游戏，背景设定在2077年的夜之城，一个充满霓虹灯和高科技的未来都市。玩家扮演V，一个雇佣兵，在这个充满危险和机遇的城市中寻找生存之道。',
        cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cyberpunk%202077%20game%20cover%20art&image_size=square'
      },
      {
        name: '艾尔登法环',
        publisher: 'FromSoftware',
        release_date: '2022-02-25',
        platforms: ['PC', 'PlayStation', 'Xbox'],
        genres: ['RPG', '开放世界'],
        description: '《艾尔登法环》是FromSoftware开发的开放世界角色扮演游戏，由宫崎英高和乔治·R·R·马丁合作创作。游戏设定在一个名为"交界地"的奇幻世界中，玩家将扮演"褪色者"，踏上寻找艾尔登法环碎片的旅程。',
        cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elden%20ring%20game%20cover%20art&image_size=square'
      },
      {
        name: '星空',
        publisher: 'Bethesda',
        release_date: '2023-09-06',
        platforms: ['PC', 'Xbox'],
        genres: ['RPG', '开放世界'],
        description: '《星空》是Bethesda开发的太空题材开放世界角色扮演游戏，设定在遥远的未来，人类已经离开地球，在银河系中建立了多个殖民地。玩家将扮演一名星际矿工，意外获得了一件神秘的 artifacts，从而卷入了一场宇宙规模的冒险。',
        cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=starfield%20game%20cover%20art&image_size=square'
      },
      {
        name: '博德之门3',
        publisher: 'Larian Studios',
        release_date: '2023-08-03',
        platforms: ['PC', 'PlayStation'],
        genres: ['CRPG'],
        description: '《博德之门3》是Larian Studios开发的CRPG游戏，基于龙与地下城5版规则。游戏设定在被遗忘的国度中，玩家将扮演一名被神秘寄生虫感染的冒险者，踏上寻找治愈方法的旅程，同时揭露一个更大的阴谋。',
        cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=baldur%27s%20gate%203%20game%20cover%20art&image_size=square'
      }
    ];
    await Game.insertMany(games);
    console.log('Games initialized');
  }
};

// 启动服务器
startServer();
