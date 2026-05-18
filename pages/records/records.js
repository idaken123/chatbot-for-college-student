const storage = require('../../utils/storage.js');

Page({
  data: {
    records: [],
    weeklySummary: null,
    hasRecords: false,
    moodEmojis: ['😢', '😕', '😐', '🙂', '😊'],
    moodLabels: ['很差', '较差', '一般', '良好', '很好'],
    themeConfig: null
  },

  onLoad() {
    this.loadSettings();
    this.loadRecords();
  },

  onShow() {
    this.loadSettings();
    this.loadRecords();
  },

  onPullDownRefresh() {
    this.loadRecords();
    wx.stopPullDownRefresh();
  },

  loadSettings() {
    const settings = storage.getSettings();
    const themes = storage.THEMES;
    const themeConfig = themes[settings.theme] || themes.default;
    
    this.setData({
      themeConfig: themeConfig
    });
    
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: themeConfig.navColor
    });
  },

  loadRecords() {
    const records = storage.getMoodRecords();
    const weeklySummary = storage.getWeeklySummary();
    
    const processedRecords = records.map(record => ({
      ...record,
      displayDate: this.formatDate(record.date),
      emoji: this.data.moodEmojis[Math.min(Math.max(Math.round((record.score - 1) / 2), 0), 4)]
    }));
    
    this.setData({
      records: processedRecords,
      weeklySummary,
      hasRecords: records.length > 0
    });
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}月${day}日`;
    }
  },

  getTrendText(trend) {
    if (trend === 'positive') return '整体状态良好，继续保持！';
    if (trend === 'negative') return '最近状态有些低落，多关注自己';
    return '状态平稳，继续保持';
  },

  getTrendIcon(trend) {
    if (trend === 'positive') return '📈';
    if (trend === 'negative') return '📉';
    return '➡️';
  },

  onViewDetail(e) {
    const record = e.currentTarget.dataset.record;
    const emotions = record.emotions ? record.emotions.join('、') : '无';
    const content = `心情指数: ${record.score}/10\n\n主要情绪: ${emotions}\n\nAI建议: ${record.suggestion || '暂无'}`;
    
    wx.showModal({
      title: record.displayDate + '的心情',
      content: content,
      showCancel: false,
      confirmText: '知道了'
    });
  }
});
