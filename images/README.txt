TabBar 图标说明
================

如果你想要在底部导航栏显示图标，请准备以下6个图标文件（建议尺寸：81x81像素）：

1. chat.png - 聊天图标（未选中状态）
2. chat-active.png - 聊天图标（选中状态）
3. record.png - 记录图标（未选中状态）
4. record-active.png - 记录图标（选中状态）
5. settings.png - 设置图标（未选中状态）
6. settings-settings.png - 设置图标（选中状态）

将图标文件放入 images 文件夹后，修改 app.json 中的 tabBar 配置：

"tabBar": {
  "list": [
    {
      "pagePath": "pages/index/index",
      "text": "聊天",
      "iconPath": "images/chat.png",
      "selectedIconPath": "images/chat-active.png"
    },
    {
      "pagePath": "pages/records/records",
      "text": "记录",
      "iconPath": "images/record.png",
      "selectedIconPath": "images/record-active.png"
    },
    {
      "pagePath": "pages/settings/settings",
      "text": "设置",
      "iconPath": "images/settings.png",
      "selectedIconPath": "images/settings-active.png"
    }
  ]
}

目前配置使用纯文字导航，可以直接运行。
