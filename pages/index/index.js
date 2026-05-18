const api = require('../../utils/api.js');
const storage = require('../../utils/storage.js');

Page({
  data: {
    messages: [],
    inputText: '',
    toView: '',
    theme: null,
    robotRole: 'counselor',
    robotAvatar: '心',
    robotName: '心理助手',
    messageCount: 0
  },

  onLoad() {
    this.loadSettings();
    this.loadChatHistory();
  },

  onShow() {
    this.loadSettings();
  },

  loadSettings() {
    const settings = storage.getSettings();
    const themes = storage.THEMES;
    const allRoles = storage.getAllRoles();
    const currentTheme = themes[settings.theme] || themes.default;
    const currentRole = allRoles[settings.robotRole] || allRoles.counselor;
    
    this.setData({
      theme: currentTheme,
      themeName: settings.theme,
      chatBgImage: settings.chatBgImage,
      bgOpacity: settings.bgOpacity || 0.3,
      robotRole: settings.robotRole,
      robotAvatar: currentRole.avatar,
      robotName: currentRole.name
    });
    
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: currentTheme.navColor
    });
  },

  loadChatHistory() {
    const history = storage.getChatHistory();
    if (history && history.length > 0) {
      const formattedHistory = history.map(msg => {
        if (msg.role === 'assistant' && !msg.formattedContent) {
          return {
            ...msg,
            formattedContent: storage.markdownToRichText(msg.content, this.data.themeName || 'default')
          };
        }
        return msg;
      });
      this.setData({
        messages: formattedHistory,
        toView: `msg-${formattedHistory.length - 1}`
      });
    } else {
      this.setData({
        messages: [
          { role: 'assistant', content: `你好呀～我是${this.data.robotName}，有什么想和我说的吗？` }
        ]
      });
    }
  },

  onInput(e) {
    this.setData({
      inputText: e.detail.value || ''
    });
  },

  onSend() {
    const input = this.data.inputText.trim();
    if (!input) {
      wx.showToast({ title: '请输入想聊的内容', icon: 'none', duration: 1000 });
      return;
    }

    const userMsg = { role: 'user', content: input };
    const newMessages = [...this.data.messages, userMsg];
    
    this.setData({
      messages: newMessages,
      inputText: '',
      toView: `msg-${newMessages.length - 1}`,
      messageCount: this.data.messageCount + 1
    });

    this.callAIAssistant(newMessages);
  },

  callAIAssistant(history) {
    wx.showLoading({ title: '正在思考...', mask: true });

    api.chat(history, this.data.robotRole)
      .then((res) => {
        const aiContent = res.data.choices[0].message.content;
        const aiMsg = {
          role: 'assistant',
          content: aiContent,
          formattedContent: storage.markdownToRichText(aiContent, this.data.themeName || 'default')
        };
        const updatedMessages = [...this.data.messages, aiMsg];
        
        this.setData({
          messages: updatedMessages,
          toView: `msg-${updatedMessages.length - 1}`
        });
        
        storage.saveChatHistory(updatedMessages);
        
        if (this.data.messageCount > 0 && this.data.messageCount % 5 === 0) {
          this.saveMoodRecord(updatedMessages);
        }
      })
      .catch((err) => {
        console.error('AI调用失败：', err.message);
        wx.showToast({
          title: err.message.includes('网络') ? '网络不佳，请重试' : '回复失败，请稍后再试',
          icon: 'none',
          duration: 2000
        });
        const errorMsg = {
          role: 'assistant',
          content: '抱歉，我现在有点"掉线"了，你可以再和我说一次吗？'
        };
        this.setData({
          messages: [...this.data.messages, errorMsg]
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  saveMoodRecord(messages) {
    const moodData = api.analyzeMood(messages);
    if (moodData) {
      moodData.suggestion = api.getMoodSuggestion(moodData);
      storage.saveMoodRecord(moodData);
      
      if (moodData.score <= 4) {
        wx.showModal({
          title: '温馨提示',
          content: '检测到你最近心情有些低落，建议多关注自己的情绪状态。可以在"记录"页面查看详细的心情分析。',
          showCancel: true,
          cancelText: '知道了',
          confirmText: '查看记录',
          success: (res) => {
            if (res.confirm) {
              wx.switchTab({
                url: '/pages/records/records'
              });
            }
          }
        });
      }
    }
  },

  onClearChat() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除当前聊天记录吗？',
      success: (res) => {
        if (res.confirm) {
          storage.clearChatHistory();
          this.setData({
            messages: [
              { role: 'assistant', content: `聊天记录已清除～我是${this.data.robotName}，有什么想和我说的吗？` }
            ],
            messageCount: 0
          });
          wx.showToast({
            title: '已清除',
            icon: 'success'
          });
        }
      }
    });
  }
});
