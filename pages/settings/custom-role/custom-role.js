const storage = require('../../../utils/storage.js');

Page({
  data: {
    roleId: '',
    roleData: {
      name: '',
      avatar: '',
      style: '',
      tendency: '',
      prompt: ''
    },
    themeConfig: null
  },

  onLoad(options) {
    this.loadTheme();
    if (options.roleId) {
      this.setData({ roleId: options.roleId });
      this.loadRoleData(options.roleId);
    }
  },

  loadTheme() {
    const settings = storage.getSettings();
    const themes = storage.THEMES;
    const themeConfig = themes[settings.theme] || themes.default;
    this.setData({ themeConfig });
  },

  loadRoleData(roleId) {
    const allRoles = storage.getAllRoles();
    if (allRoles[roleId]) {
      this.setData({ roleData: allRoles[roleId] });
    }
  },

  onNameChange(e) {
    this.setData({ 'roleData.name': e.detail.value });
  },

  onAvatarChange(e) {
    this.setData({ 'roleData.avatar': e.detail.value });
  },

  onStyleChange(e) {
    this.setData({ 'roleData.style': e.detail.value });
  },

  onTendencyChange(e) {
    this.setData({ 'roleData.tendency': e.detail.value });
  },

  onPromptChange(e) {
    this.setData({ 'roleData.prompt': e.detail.value });
  },

  onSave() {
    const { roleId, roleData } = this.data;
    
    if (!roleData.name) {
      wx.showToast({ title: '请输入角色名称', icon: 'none' });
      return;
    }
    
    if (!roleData.avatar) {
      wx.showToast({ title: '请输入角色头像', icon: 'none' });
      return;
    }
    
    if (!roleData.prompt) {
      wx.showToast({ title: '请输入角色描述', icon: 'none' });
      return;
    }
    
    const newRoleId = roleId || 'custom_' + Date.now();
    const success = storage.saveCustomRole(newRoleId, roleData);
    
    if (success) {
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } else {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  onCancel() {
    wx.navigateBack();
  }
});