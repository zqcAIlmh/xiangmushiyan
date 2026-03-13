// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化轮播图
    initCarousel();
    
    // 初始化评分系统
    initRating();
    
    // 初始化筛选功能
    initFilters();
    
    // 初始化搜索功能
    initSearch();
    
    // 加载游戏库数据
    if (document.getElementById('gamesList')) {
        loadGames();
    }
    
    // 加载排行榜数据
    if (document.getElementById('rankingList')) {
        loadRanking();
    }
    
    // 加载游戏详情
    if (document.getElementById('gameHeader')) {
        loadGameDetail();
    }
    
    // 加载评测页面
    if (document.getElementById('reviewForm')) {
        loadGamesForReview();
        initReviewForm();
    }
});

// 加载游戏列表到评测页面
async function loadGamesForReview() {
    try {
        const response = await fetch('/api/games');
        const games = await response.json();
        const gameSelect = document.getElementById('game');
        
        // 清空现有选项（保留第一个请选择选项）
        while (gameSelect.options.length > 1) {
            gameSelect.remove(1);
        }
        
        // 添加游戏选项
        games.forEach(game => {
            const option = document.createElement('option');
            option.value = game._id;
            option.textContent = game.name;
            gameSelect.appendChild(option);
        });
        
        // 从URL参数中获取游戏ID并自动选择
        const params = getUrlParams();
        if (params.game_id) {
            gameSelect.value = params.game_id;
        }
    } catch (error) {
        console.error('加载游戏列表失败:', error);
    }
}

// 初始化评测表单
function initReviewForm() {
    const reviewForm = document.getElementById('reviewForm');
    reviewForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const gameId = document.getElementById('game').value;
        const rating = parseInt(document.getElementById('rating-value').textContent);
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        
        // 模拟用户ID和用户名
        const userId = '60d0fe4f5311236168a109ca';
        const username = '测试用户';
        
        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    game_id: gameId,
                    user_id: userId,
                    username: username,
                    rating: rating,
                    title: title,
                    content: content
                })
            });
            
            if (response.ok) {
                alert('评测提交成功！');
                // 跳转到游戏详情页
                window.location.href = `game-detail.html?id=${gameId}`;
            } else {
                alert('评测提交失败，请稍后重试');
            }
        } catch (error) {
            console.error('提交评测失败:', error);
            alert('评测提交失败，请稍后重试');
        }
    });
}

// 获取URL参数
function getUrlParams() {
    const params = {};
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams.entries()) {
        params[key] = value;
    }
    return params;
}

// 加载游戏详情
async function loadGameDetail() {
    const params = getUrlParams();
    const gameId = params.id;
    
    if (!gameId) {
        document.getElementById('gameHeader').innerHTML = '<div style="padding: 50px; text-align: center;"><h2>未找到游戏</h2><p>请从游戏库中选择一个游戏</p></div>';
        return;
    }
    
    try {
        // 加载游戏详情
        const response = await fetch(`/api/games/${gameId}`);
        const game = await response.json();
        
        // 更新页面标题
        document.title = `游戏测评网 - ${game.name}`;
        
        // 生成游戏头部内容
        const gameHeader = document.getElementById('gameHeader');
        gameHeader.innerHTML = `
            <img src="${game.cover_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=video%20game%20cover&image_size=landscape_16_9'}" alt="${game.name}">
            <div class="game-header-overlay">
                <div class="game-info">
                    <h1>${game.name}</h1>
                    <div class="game-meta">
                        <span>发行商: ${game.publisher}</span>
                        <span>发行日期: ${new Date(game.release_date).toISOString().split('T')[0]}</span>
                        <span>平台: ${game.platforms.join(', ')}</span>
                        <span>类型: ${game.genres.join(', ')}</span>
                    </div>
                    <div class="game-rating">
                        <div class="rating-score">${game.average_rating || 0}</div>
                        <div class="rating-count">基于 0 条评测</div>
                    </div>
                    <a href="review.html?game_id=${gameId}" class="btn btn-primary">撰写评测</a>
                </div>
            </div>
        `;
        
        // 生成游戏描述内容
        const gameDescription = document.getElementById('gameDescription');
        gameDescription.innerHTML = `
            <h2>游戏简介</h2>
            <p>${game.description || '暂无描述'}</p>
        `;
        
        // 加载评测
        loadReviews(gameId);
    } catch (error) {
        console.error('加载游戏详情失败:', error);
        document.getElementById('gameHeader').innerHTML = '<div style="padding: 50px; text-align: center;"><h2>加载游戏失败</h2><p>请稍后重试</p></div>';
    }
}

// 加载游戏评测
async function loadReviews(gameId) {
    try {
        const response = await fetch(`/api/reviews/game/${gameId}`);
        const reviews = await response.json();
        const reviewsList = document.getElementById('reviewsList');
        
        if (reviews.length === 0) {
            reviewsList.innerHTML = '<div style="padding: 30px; text-align: center;"><p>暂无评测，成为第一个评测这款游戏的人吧！</p></div>';
            return;
        }
        
        reviewsList.innerHTML = '';
        reviews.forEach(review => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            reviewItem.innerHTML = `
                <div class="review-header">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar&image_size=square" alt="用户头像" class="reviewer-avatar">
                    <div class="reviewer-info">
                        <h4>${review.username || '匿名用户'}</h4>
                        <p>${new Date(review.created_at).toISOString().split('T')[0]}</p>
                    </div>
                    <div class="review-card-score">${review.rating}</div>
                </div>
                <div class="review-content">
                    <h4>${review.title}</h4>
                    <p>${review.content}</p>
                </div>
                <div class="review-actions">
                    <button>👍 有用 (0)</button>
                    <button>💬 评论</button>
                </div>
            `;
            reviewsList.appendChild(reviewItem);
        });
    } catch (error) {
        console.error('加载评测失败:', error);
        document.getElementById('reviewsList').innerHTML = '<div style="padding: 30px; text-align: center;"><p>加载评测失败，请稍后重试</p></div>';
    }
}

// 加载游戏库数据
async function loadGames() {
    try {
        const response = await fetch('/api/games');
        const games = await response.json();
        const gamesList = document.getElementById('gamesList');
        gamesList.innerHTML = '';
        
        games.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.innerHTML = `
                <a href="game-detail.html?id=${game._id}" style="text-decoration: none; color: inherit;">
                    <img src="${game.cover_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=video%20game%20cover&image_size=square'}" alt="${game.name}">
                    <div class="game-card-content">
                        <h3>${game.name}</h3>
                        <div class="game-card-meta">
                            <span>${new Date(game.release_date).toISOString().split('T')[0]}</span>
                            <span>${game.platforms.join(', ')}</span>
                            <span>${game.genres.join(', ')}</span>
                            <span class="game-card-score">${game.average_rating || 0}</span>
                        </div>
                    </div>
                </a>
            `;
            gamesList.appendChild(gameCard);
        });
    } catch (error) {
        console.error('加载游戏失败:', error);
    }
}

// 加载排行榜数据
async function loadRanking() {
    try {
        const response = await fetch('/api/games');
        const games = await response.json();
        // 按浏览量排序
        games.sort((a, b) => (b.views || 0) - (a.views || 0));
        const rankingList = document.getElementById('rankingList');
        rankingList.innerHTML = '';
        
        games.forEach((game, index) => {
            const rankingItem = document.createElement('div');
            rankingItem.className = 'ranking-item';
            const rankNumberClass = index < 3 ? 'ranking-number top3' : 'ranking-number';
            rankingItem.innerHTML = `
                <div class="${rankNumberClass}">${index + 1}</div>
                <a href="game-detail.html?id=${game._id}" class="ranking-game-info" style="text-decoration: none; color: inherit;">
                    <img src="${game.cover_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=video%20game%20cover&image_size=portrait_4_3'}" alt="${game.name}" class="ranking-game-cover">
                    <div class="ranking-game-details">
                        <h3>${game.name}</h3>
                        <div class="ranking-game-meta">
                            <span>发行商: ${game.publisher}</span>
                            <span>发行日期: ${new Date(game.release_date).toISOString().split('T')[0]}</span>
                            <span>类型: ${game.genres.join(', ')}</span>
                        </div>
                        <div class="ranking-stats">
                            <span class="ranking-views">浏览量: ${game.views || 0}</span>
                            <span class="ranking-score">${game.average_rating || 0}</span>
                        </div>
                    </div>
                </a>
            `;
            rankingList.appendChild(rankingItem);
        });
    } catch (error) {
        console.error('加载排行榜失败:', error);
    }
}

// 轮播图功能
function initCarousel() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;
    
    const items = carousel.querySelectorAll('.carousel-item');
    const prevBtn = carousel.querySelector('.carousel-control.prev');
    const nextBtn = carousel.querySelector('.carousel-control.next');
    let currentIndex = 0;
    const itemCount = items.length;
    
    // 显示当前轮播项
    function showItem(index) {
        items.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // 下一张
    function nextItem() {
        currentIndex = (currentIndex + 1) % itemCount;
        showItem(currentIndex);
    }
    
    // 上一张
    function prevItem() {
        currentIndex = (currentIndex - 1 + itemCount) % itemCount;
        showItem(currentIndex);
    }
    
    // 自动轮播
    let autoSlide = setInterval(nextItem, 5000);
    
    // 点击事件
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            clearInterval(autoSlide);
            nextItem();
            autoSlide = setInterval(nextItem, 5000);
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            clearInterval(autoSlide);
            prevItem();
            autoSlide = setInterval(nextItem, 5000);
        });
    }
    
    // 初始化显示第一张
    showItem(currentIndex);
}

// 评分系统功能
function initRating() {
    const ratingStars = document.querySelectorAll('.rating-stars .star');
    const ratingValue = document.getElementById('rating-value');
    if (!ratingStars.length) return;
    
    ratingStars.forEach((star, index) => {
        star.addEventListener('click', function() {
            // 移除所有星星的active类
            ratingStars.forEach(s => s.classList.remove('active'));
            // 为当前及之前的星星添加active类
            for (let i = 0; i <= index; i++) {
                ratingStars[i].classList.add('active');
            }
            // 更新评分值显示
            if (ratingValue) {
                ratingValue.textContent = (index + 1) + '/5';
            }
        });
    });
}

// 筛选功能
function initFilters() {
    const filterOptions = document.querySelectorAll('.filter-option');
    if (!filterOptions.length) return;
    
    filterOptions.forEach(option => {
        option.addEventListener('click', function() {
            // 切换active类
            this.classList.toggle('active');
            // 执行筛选逻辑
            performFilter();
        });
    });
}

// 执行筛选
function performFilter() {
    // 获取所有选中的筛选选项
    const selectedFilters = document.querySelectorAll('.filter-option.active');
    const selectedFilterTexts = Array.from(selectedFilters).map(option => option.textContent.toLowerCase());
    
    // 获取所有游戏卡片
    const gameCards = document.querySelectorAll('.game-card');
    let visibleCount = 0;
    
    gameCards.forEach(card => {
        // 获取卡片中的文本内容
        const cardText = card.textContent.toLowerCase();
        
        // 检查是否匹配所有选中的筛选条件
        let isMatch = true;
        
        for (const filter of selectedFilterTexts) {
            // 特殊处理"全部"选项
            if (filter === '全部') {
                continue;
            }
            // 检查卡片文本是否包含筛选条件
            if (!cardText.includes(filter)) {
                isMatch = false;
                break;
            }
        }
        
        if (isMatch) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // 显示筛选结果提示
    if (selectedFilterTexts.length > 0) {
        alert(`筛选结果: ${visibleCount} 个游戏`);
    }
}

// 搜索功能
function initSearch() {
    const searchForm = document.querySelector('.search-form');
    if (!searchForm) return;
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchInput = this.querySelector('.search-input');
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm) {
            console.log('搜索:', searchTerm);
            // 执行搜索逻辑
            performSearch(searchTerm);
        }
    });
}

// 执行搜索
function performSearch(searchTerm) {
    // 获取所有游戏卡片或评测卡片
    const gameCards = document.querySelectorAll('.game-card, .review-card, .ranking-item');
    let foundCount = 0;
    
    gameCards.forEach(card => {
        // 获取卡片中的文本内容
        const cardText = card.textContent.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        // 检查是否包含搜索词
        if (cardText.includes(searchLower)) {
            card.style.display = 'block';
            foundCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // 显示搜索结果提示
    if (foundCount > 0) {
        alert(`找到 ${foundCount} 个相关结果`);
    } else {
        alert('未找到相关结果');
    }
}

// 平滑滚动
function smoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 导航栏滚动效果
function navScrollEffect() {
    const header = document.querySelector('header');
    if (!header) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(26, 26, 26, 0.95)';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.backgroundColor = 'rgba(26, 26, 26, 1)';
            header.style.boxShadow = 'none';
        }
    });
}

// 加载更多功能
function initLoadMore() {
    const loadMoreBtn = document.querySelector('.load-more');
    if (!loadMoreBtn) return;
    
    loadMoreBtn.addEventListener('click', function() {
        // 这里可以添加加载更多逻辑
        console.log('加载更多');
        // 模拟加载中
        this.innerHTML = '加载中...';
        
        // 模拟异步加载
        setTimeout(() => {
            this.innerHTML = '加载更多';
            // 这里可以添加新内容
        }, 1000);
    });
}

// 表单验证
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#f44336';
                } else {
                    field.style.borderColor = '#ddd';
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                alert('请填写所有必填字段');
            }
        });
    });
}

// 页面加载时初始化所有功能
window.onload = function() {
    smoothScroll();
    navScrollEffect();
    initLoadMore();
    initFormValidation();
};
