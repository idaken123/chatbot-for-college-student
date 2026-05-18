App({
  onLaunch() {
    const settings = require('./utils/storage.js').getSettings();
    const themes = require('./utils/storage.js').THEMES;
    const currentTheme = themes[settings.theme] || themes.default;
    
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: currentTheme.navColor
    });
  },

  globalData: {
    userInfo: null,
    theme: 'default'
  }
});
