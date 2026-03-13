const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Game = require('../models/Game');

// 获取所有评论（管理员用）
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().populate('game_id', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取游戏评测
router.get('/game/:game_id', async (req, res) => {
  try {
    const reviews = await Review.find({ game_id: req.params.game_id }).populate('user_id', 'username avatar');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取单个评论
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('game_id', 'name');
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 创建评测
router.post('/', async (req, res) => {
  const review = new Review({
    game_id: req.body.game_id,
    user_id: req.body.user_id || '60d0fe4f5311236168a109ca', // 默认为测试用户
    username: req.body.username,
    rating: req.body.rating,
    title: req.body.title,
    content: req.body.content
  });

  try {
    const newReview = await review.save();
    // 更新游戏平均评分
    const reviews = await Review.find({ game_id: req.body.game_id });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Game.findByIdAndUpdate(req.body.game_id, { average_rating: averageRating });
    // 返回复测数据，包含用户信息
    const populatedReview = await Review.findById(newReview._id).populate('user_id', 'username avatar').populate('game_id', 'name');
    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 更新评论
router.put('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    Object.assign(review, req.body);
    const updatedReview = await review.save();
    
    // 更新游戏平均评分
    const reviews = await Review.find({ game_id: review.game_id });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Game.findByIdAndUpdate(review.game_id, { average_rating: averageRating });
    
    res.json(updatedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除评论
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const gameId = review.game_id;
    await review.remove();
    
    // 更新游戏平均评分
    const reviews = await Review.find({ game_id: gameId });
    let averageRating = 0;
    if (reviews.length > 0) {
      averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    }
    await Game.findByIdAndUpdate(gameId, { average_rating: averageRating });
    
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
