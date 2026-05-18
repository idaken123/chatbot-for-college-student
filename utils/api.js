const storage = require('./storage.js');

const API_KEY = 'fef0cd83-6522-450f-8e7e-35431abebd23';
const MODEL_ID = 'doubao-seed-1-8-251228';
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

const EMOTION_KEYWORDS = {
  positive: ['开心', '高兴', '快乐', '幸福', '满足', '兴奋', '激动', '愉快', '轻松', '放松', '感谢', '感恩', '希望', '期待', '喜欢', '爱', '棒', '好', '太好了', '哈哈'],
  negative: ['难过', '伤心', '悲伤', '痛苦', '焦虑', '紧张', '害怕', '恐惧', '愤怒', '生气', '烦躁', '沮丧', '失望', '绝望', '孤独', '寂寞', '压力', '累', '疲惫', '崩溃', '想哭', '哭'],
  neutral: ['一般', '还行', '普通', '正常', '平静', '无聊', '迷茫', '困惑', '犹豫', '思考']
};

function analyzeEmotion(text) {
  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;
  const detectedEmotions = [];
  
  EMOTION_KEYWORDS.positive.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      positiveCount++;
      if (!detectedEmotions.includes(keyword)) detectedEmotions.push(keyword);
    }
  });
  
  EMOTION_KEYWORDS.negative.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      negativeCount++;
      if (!detectedEmotions.includes(keyword)) detectedEmotions.push(keyword);
    }
  });
  
  EMOTION_KEYWORDS.neutral.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      neutralCount++;
      if (!detectedEmotions.includes(keyword)) detectedEmotions.push(keyword);
    }
  });
  
  let score = 5;
  if (positiveCount > negativeCount) {
    score = Math.min(5 + positiveCount, 10);
  } else if (negativeCount > positiveCount) {
    score = Math.max(5 - negativeCount, 1);
  }
  
  return {
    score,
    emotions: detectedEmotions.slice(0, 5),
    sentiment: positiveCount > negativeCount ? 'positive' : negativeCount > positiveCount ? 'negative' : 'neutral'
  };
}

function chat(messages, roleKey = 'counselor') {
  const allRoles = storage.getAllRoles();
  const rolePrompt = allRoles[roleKey]?.prompt || allRoles.counselor.prompt;
  
  const systemPrompt = {
    role: 'system',
    content: rolePrompt + '\n\n在对话中，请注意：\n1. 关注用户的情绪变化\n2. 给予适当的心理支持和建议\n3. 如果用户表达负面情绪，要给予共情和疏导\n4. 回复要简洁易懂，不要过于冗长'
  };
  
  const requestMessages = [systemPrompt, ...(messages || [])];
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_URL,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      data: {
        model: MODEL_ID,
        messages: requestMessages,
        temperature: 0.8,
        max_tokens: 500
      },
      success: (res) => {
        if (res.statusCode !== 200 || !res.data.choices) {
          reject(new Error('AI接口返回异常：' + (res.data.error?.message || '未知错误')));
          return;
        }
        resolve(res);
      },
      fail: (err) => {
        reject(new Error('网络请求失败：' + err.errMsg));
      }
    });
  });
}

function analyzeMood(messages) {
  const userMessages = messages.filter(m => m.role === 'user');
  if (userMessages.length === 0) return null;
  
  const recentMessages = userMessages.slice(-5);
  let totalScore = 0;
  const allEmotions = [];
  
  recentMessages.forEach(msg => {
    const analysis = analyzeEmotion(msg.content);
    totalScore += analysis.score;
    allEmotions.push(...analysis.emotions);
  });
  
  const avgScore = Math.round(totalScore / recentMessages.length);
  const uniqueEmotions = [...new Set(allEmotions)].slice(0, 5);
  
  return {
    score: avgScore,
    emotions: uniqueEmotions,
    date: new Date().toISOString()
  };
}

function getMoodSuggestion(moodData) {
  const suggestions = {
    low: [
      '今天心情有些低落呢，记得对自己温柔一点。可以试试听听音乐、散散步，或者和朋友聊聊天。',
      '感受到你的情绪有些波动，这是很正常的。建议做些让自己开心的小事，比如看一部喜欢的电影。',
      '低落的时候，不妨试着写写日记，把心里的想法记录下来，也许会感觉好一些。'
    ],
    medium: [
      '今天状态还不错，继续保持！可以做一些自己喜欢的事情来奖励自己。',
      '心情平稳也是一种很好的状态，享受这份宁静吧。',
      '可以尝试一些新的事物，给生活增添一些小惊喜。'
    ],
    high: [
      '今天心情很棒呢！这种积极的状态很珍贵，记得多和身边的人分享快乐。',
      '很高兴看到你状态这么好！继续保持这份好心情，做自己喜欢的事情吧。',
      '正能量满满的一天！建议把这份快乐记录下来，不开心的时候可以翻翻看。'
    ]
  };
  
  const category = moodData.score <= 4 ? 'low' : moodData.score >= 7 ? 'high' : 'medium';
  const categorySuggestions = suggestions[category];
  return categorySuggestions[Math.floor(Math.random() * categorySuggestions.length)];
}

module.exports = {
  chat,
  analyzeMood,
  analyzeEmotion,
  getMoodSuggestion
};
