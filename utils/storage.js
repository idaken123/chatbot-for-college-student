const STORAGE_KEYS = {
  USER_SETTINGS: 'user_settings',
  MOOD_RECORDS: 'mood_records',
  CHAT_HISTORY: 'chat_history'
};

const DEFAULT_SETTINGS = {
  theme: 'default',
  robotRole: 'counselor',
  robotName: '心理助手',
  chatBgImage: '',
  bgOpacity: 0.7
};

const THEMES = {
  default: {
    name: '默认绿',
    primaryColor: '#4CAF50',
    bgColor: '#f5f5f5',
    bubbleColor: '#4CAF50',
    navColor: '#4CAF50',
    textColor: '#333',
    textSecondary: '#666',
    textLight: '#999',
    cardBg: '#ffffff',
    borderColor: '#eee'
  },
  ocean: {
    name: '海洋蓝',
    primaryColor: '#2196F3',
    bgColor: '#e3f2fd',
    bubbleColor: '#2196F3',
    navColor: '#2196F3',
    textColor: '#333',
    textSecondary: '#666',
    textLight: '#999',
    cardBg: '#ffffff',
    borderColor: '#eee'
  },
  sunset: {
    name: '日落橙',
    primaryColor: '#FF9800',
    bgColor: '#fff3e0',
    bubbleColor: '#FF9800',
    navColor: '#FF9800',
    textColor: '#333',
    textSecondary: '#666',
    textLight: '#999',
    cardBg: '#ffffff',
    borderColor: '#eee'
  },
  lavender: {
    name: '薰衣草',
    primaryColor: '#9C27B0',
    bgColor: '#f3e5f5',
    bubbleColor: '#9C27B0',
    navColor: '#9C27B0',
    textColor: '#333',
    textSecondary: '#666',
    textLight: '#999',
    cardBg: '#ffffff',
    borderColor: '#eee'
  },
  night: {
    name: '夜间模式',
    primaryColor: '#607D8B',
    bgColor: '#121212',
    bubbleColor: '#455A64',
    navColor: '#1F1F1F',
    textColor: '#ffffff',
    textSecondary: '#b0b0b0',
    textLight: '#757575',
    cardBg: '#1E1E1E',
    borderColor: '#333'
  }
};

const ROBOT_ROLES = {
  counselor: {
    name: '心理咨询师',
    avatar: '心',
    prompt: '你是专业的校园心理咨询师，语气温暖共情，擅长倾听和引导，只做心理疏导和建议，不涉及敏感内容，回复简洁易懂。',
    style: '专业温暖',
    tendency: '心理疏导、建议指导'
  },
  friend: {
    name: '知心好友',
    avatar: '友',
    prompt: '你是用户的知心好友，像朋友一样聊天，语气轻松亲切，用"我"和"你"交流，分享生活感悟，给予情感支持，回复自然口语化。',
    style: '轻松亲切',
    tendency: '情感支持、生活分享'
  },
  elder: {
    name: '暖心学长/学姐',
    avatar: '暖',
    prompt: '你是暖心的学长/学姐，理解校园生活的压力，用过来人的经验给予建议，语气鼓励积极，帮助学弟学妹们度过难关，回复温暖有力量。',
    style: '鼓励积极',
    tendency: '经验分享、鼓励支持'
  },
  pet: {
    name: '治愈小动物',
    avatar: '萌',
    prompt: '你是一只可爱的治愈系小动物（小猫咪），用萌萌的语气说话，会在句尾加"喵～"，给人温暖和陪伴，回复可爱治愈。',
    style: '可爱治愈',
    tendency: '温暖陪伴、治愈心灵'
  }
};

function getCustomRoles() {
  try {
    const customRoles = wx.getStorageSync('custom_roles');
    return customRoles || {};
  } catch (e) {
    console.error('获取自定义角色失败:', e);
    return {};
  }
}

function saveCustomRole(roleId, roleData) {
  try {
    const customRoles = getCustomRoles();
    customRoles[roleId] = roleData;
    wx.setStorageSync('custom_roles', customRoles);
    return true;
  } catch (e) {
    console.error('保存自定义角色失败:', e);
    return false;
  }
}

function deleteCustomRole(roleId) {
  try {
    const customRoles = getCustomRoles();
    delete customRoles[roleId];
    wx.setStorageSync('custom_roles', customRoles);
    return true;
  } catch (e) {
    console.error('删除自定义角色失败:', e);
    return false;
  }
}

function getAllRoles() {
  const defaultRoles = ROBOT_ROLES;
  const customRoles = getCustomRoles();
  return { ...defaultRoles, ...customRoles };
}

function getSettings() {
  try {
    const settings = wx.getStorageSync(STORAGE_KEYS.USER_SETTINGS);
    return settings ? { ...DEFAULT_SETTINGS, ...settings } : DEFAULT_SETTINGS;
  } catch (e) {
    console.error('获取设置失败:', e);
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings) {
  try {
    wx.setStorageSync(STORAGE_KEYS.USER_SETTINGS, settings);
    return true;
  } catch (e) {
    console.error('保存设置失败:', e);
    return false;
  }
}

function getMoodRecords() {
  try {
    const records = wx.getStorageSync(STORAGE_KEYS.MOOD_RECORDS);
    return records || [];
  } catch (e) {
    console.error('获取心情记录失败:', e);
    return [];
  }
}

function saveMoodRecord(record) {
  try {
    const records = getMoodRecords();
    const today = new Date().toDateString();
    const existingIndex = records.findIndex(r => new Date(r.date).toDateString() === today);
    
    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], ...record };
    } else {
      records.unshift({
        ...record,
        date: new Date().toISOString()
      });
    }
    
    if (records.length > 30) {
      records.length = 30;
    }
    
    wx.setStorageSync(STORAGE_KEYS.MOOD_RECORDS, records);
    return true;
  } catch (e) {
    console.error('保存心情记录失败:', e);
    return false;
  }
}

function getWeeklySummary() {
  const records = getMoodRecords();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const weeklyRecords = records.filter(r => new Date(r.date) >= oneWeekAgo);
  
  if (weeklyRecords.length === 0) {
    return null;
  }
  
  const avgScore = weeklyRecords.reduce((sum, r) => sum + (r.score || 5), 0) / weeklyRecords.length;
  const emotions = {};
  weeklyRecords.forEach(r => {
    if (r.emotions) {
      r.emotions.forEach(e => {
        emotions[e] = (emotions[e] || 0) + 1;
      });
    }
  });
  
  const topEmotions = Object.entries(emotions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([emotion]) => emotion);
  
  return {
    avgScore: Math.round(avgScore * 10) / 10,
    topEmotions,
    recordCount: weeklyRecords.length,
    trend: avgScore > 5 ? 'positive' : avgScore < 5 ? 'negative' : 'neutral'
  };
}

function getChatHistory() {
  try {
    const history = wx.getStorageSync(STORAGE_KEYS.CHAT_HISTORY);
    return history || [];
  } catch (e) {
    console.error('获取聊天记录失败:', e);
    return [];
  }
}

function saveChatHistory(messages) {
  try {
    wx.setStorageSync(STORAGE_KEYS.CHAT_HISTORY, messages);
    return true;
  } catch (e) {
    console.error('保存聊天记录失败:', e);
    return false;
  }
}

function clearChatHistory() {
  try {
    wx.removeStorageSync(STORAGE_KEYS.CHAT_HISTORY);
    return true;
  } catch (e) {
    console.error('清除聊天记录失败:', e);
    return false;
  }
}

function parseMarkdown(text, theme = 'default') {
  if (!text) return text;
  
  const isDarkTheme = theme === 'night';
  const codeBg = isDarkTheme ? '#333' : '#f0f0f0';
  const codeColor = isDarkTheme ? '#e0e0e0' : '#333';
  
  let result = text;
  
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  result = result.replace(/`(.*?)`/g, `<text style="background-color: ${codeBg}; color: ${codeColor}; padding: 2rpx 8rpx; border-radius: 4rpx; font-family: monospace;">$1</text>`);
  
  result = result.replace(/^### (.*?)$/gm, '<view style="font-size: 32rpx; font-weight: bold; margin: 16rpx 0 8rpx 0;">$1</view>');
  result = result.replace(/^## (.*?)$/gm, '<view style="font-size: 36rpx; font-weight: bold; margin: 20rpx 0 10rpx 0;">$1</view>');
  result = result.replace(/^# (.*?)$/gm, '<view style="font-size: 40rpx; font-weight: bold; margin: 24rpx 0 12rpx 0;">$1</view>');
  
  result = result.replace(/\n\n/g, '</view><view style="height: 8rpx;"></view><view>');
  result = result.replace(/\n/g, '<br/>');
  
  result = result.replace(/^- (.*?)$/gm, '• $1');
  
  return result;
}

function markdownToRichText(text, theme = 'default') {
  if (!text) return text;
  
  const isDarkTheme = theme === 'night';
  const codeBg = isDarkTheme ? '#333' : '#f0f0f0';
  const codeColor = isDarkTheme ? '#e0e0e0' : '#333';
  
  let result = text;
  
  result = result.replace(/&/g, '&amp;');
  result = result.replace(/</g, '&lt;');
  result = result.replace(/>/g, '&gt;');
  
  result = result.replace(/\*\*(.*?)\*\*/g, '<span style="font-weight: bold;">$1</span>');
  
  result = result.replace(/`(.*?)`/g, `<span style="background-color: ${codeBg}; color: ${codeColor}; padding: 2rpx 8rpx; border-radius: 4rpx; font-family: monospace;">$1</span>`);
  
  result = result.replace(/^### (.*?)$/gm, '<div style="font-size: 32rpx; font-weight: bold; margin: 16rpx 0 8rpx 0;">$1</div>');
  result = result.replace(/^## (.*?)$/gm, '<div style="font-size: 36rpx; font-weight: bold; margin: 20rpx 0 10rpx 0;">$1</div>');
  result = result.replace(/^# (.*?)$/gm, '<div style="font-size: 40rpx; font-weight: bold; margin: 24rpx 0 12rpx 0;">$1</div>');
  
  result = result.replace(/\n\n/g, '<div style="height: 8rpx;"></div>');
  result = result.replace(/\n/g, '<br/>');
  
  result = result.replace(/^- (.*?)$/gm, '• $1');
  
  return result;
}

module.exports = {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  THEMES,
  ROBOT_ROLES,
  getSettings,
  saveSettings,
  getMoodRecords,
  saveMoodRecord,
  getWeeklySummary,
  getChatHistory,
  saveChatHistory,
  clearChatHistory,
  parseMarkdown,
  markdownToRichText,
  getCustomRoles,
  saveCustomRole,
  deleteCustomRole,
  getAllRoles
};
