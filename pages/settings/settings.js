const storage = require('../../utils/storage.js');

Page({
  data: {
    themes: [],
    themeKeys: [],
    currentTheme: 'default',
    themeConfig: null,
    roles: [],
    roleKeys: [],
    currentRole: 'counselor',
    robotName: '心理助手'
  },

  onLoad() {
    this.loadSettings();
  },

  onShow() {
    this.loadSettings();
  },

  loadSettings() {
    const settings = storage.getSettings();
    const themes = storage.THEMES;
    const allRoles = storage.getAllRoles();
    const themeConfig = themes[settings.theme] || themes.default;
    
    this.setData({
      themes: themes,
      themeKeys: Object.keys(themes),
      currentTheme: settings.theme,
      themeConfig: themeConfig,
      chatBgImage: settings.chatBgImage,
      bgOpacity: settings.bgOpacity || 0.3,
      roles: allRoles,
      roleKeys: Object.keys(allRoles),
      currentRole: settings.robotRole,
      robotName: settings.robotName || allRoles[settings.robotRole].name
    });
    
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: themeConfig.navColor
    });
  },

  onThemeChange(e) {
    const themeKey = e.currentTarget.dataset.theme;
    const settings = storage.getSettings();
    settings.theme = themeKey;
    storage.saveSettings(settings);
    
    this.loadSettings();
    
    wx.showToast({
      title: '主题已更换',
      icon: 'success'
    });
  },

  onRoleChange(e) {
    const roleKey = e.currentTarget.dataset.role;
    const settings = storage.getSettings();
    settings.robotRole = roleKey;
    settings.robotName = storage.ROBOT_ROLES[roleKey].name;
    storage.saveSettings(settings);
    
    this.setData({
      currentRole: roleKey,
      robotName: settings.robotName
    });
    
    wx.showToast({
      title: '角色已更换',
      icon: 'success'
    });
  },

  onClearHistory() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有聊天记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          storage.clearChatHistory();
          wx.showToast({
            title: '已清除聊天记录',
            icon: 'success'
          });
        }
      }
    });
  },

  onClearRecords() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有心情记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync(storage.STORAGE_KEYS.MOOD_RECORDS);
          wx.showToast({
            title: '已清除心情记录',
            icon: 'success'
          });
        }
      }
    });
  },

  onSelectBgImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        const settings = storage.getSettings();
        settings.chatBgImage = tempFilePaths[0];
        storage.saveSettings(settings);
        
        wx.showToast({
          title: '背景图片设置成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  onRemoveBgImage() {
    wx.showModal({
      title: '确认移除',
      content: '确定要移除聊天背景图片吗？',
      success: (res) => {
        if (res.confirm) {
          const settings = storage.getSettings();
          settings.chatBgImage = '';
          storage.saveSettings(settings);
          
          wx.showToast({
            title: '背景图片已移除',
            icon: 'success'
          });
        }
      }
    });
  },

  onOpacityChange(e) {
    const opacity = e.detail.value;
    const settings = storage.getSettings();
    settings.bgOpacity = opacity;
    storage.saveSettings(settings);
    
    this.setData({
      bgOpacity: opacity
    });
  },

  onAddCustomRole() {
    wx.navigateTo({
      url: '/pages/settings/custom-role/custom-role'
    });
  },

  onEditRole(e) {
    const roleKey = e.currentTarget.dataset.role;
    if (['counselor', 'friend', 'elder', 'pet'].includes(roleKey)) {
      wx.showToast({
        title: '默认角色不可编辑',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/settings/custom-role/custom-role?roleId=${roleKey}`
    });
  },

  onDeleteRole(e) {
    const roleKey = e.currentTarget.dataset.role;
    if (['counselor', 'friend', 'elder', 'pet'].includes(roleKey)) {
      wx.showToast({
        title: '默认角色不可删除',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个自定义角色吗？',
      success: (res) => {
        if (res.confirm) {
          storage.deleteCustomRole(roleKey);
          this.loadSettings();
          wx.showToast({
            title: '角色已删除',
            icon: 'success'
          });
        }
      }
    });
  }
});
