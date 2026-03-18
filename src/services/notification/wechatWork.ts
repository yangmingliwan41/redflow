/**
 * 企业微信通知服务
 * 通过Webhook发送企业微信通知
 */

import { loadEnvConfig } from '../../config/env'
import { logger } from '../../composables/useLogger'

export interface WeChatWorkMessage {
  msgtype: 'text' | 'markdown'
  text?: {
    content: string
    mentioned_list?: string[]
    mentioned_mobile_list?: string[]
  }
  markdown?: {
    content: string
  }
}

/**
 * 发送企业微信通知
 */
export async function sendWeChatWorkNotification(
  message: string,
  messageType: 'text' | 'markdown' = 'text'
): Promise<boolean> {
  const config = loadEnvConfig()
  
  if (!config.wechatWorkWebhookUrl) {
    logger.warn('企业微信Webhook URL未配置，跳过通知')
    return false
  }

  try {
    const msg: WeChatWorkMessage = {
      msgtype: messageType
    }

    if (messageType === 'text') {
      msg.text = {
        content: message
      }
    } else {
      msg.markdown = {
        content: message
      }
    }

    const response = await fetch(config.wechatWorkWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(msg)
    })

    if (!response.ok) {
      throw new Error(`企业微信通知发送失败: ${response.statusText}`)
    }

    const result = await response.json()
    
    if (result.errcode !== 0) {
      throw new Error(`企业微信通知发送失败: ${result.errmsg}`)
    }

    logger.info('企业微信通知发送成功')
    return true
  } catch (error) {
    logger.error('企业微信通知发送失败:', error)
    return false
  }
}

/**
 * 发送发布提醒通知
 */
export async function sendPublishReminder(
  contentTitle: string,
  scheduledTime: number,
  platform: string = '小红书'
): Promise<boolean> {
  const scheduledDate = new Date(scheduledTime).toLocaleString('zh-CN')
  const message = `📢 发布提醒\n\n内容：${contentTitle}\n平台：${platform}\n时间：${scheduledDate}\n\n请及时发布内容！`
  
  return await sendWeChatWorkNotification(message, 'text')
}

/**
 * 发送内容生成完成通知
 */
export async function sendContentGeneratedNotification(
  totalCount: number,
  successCount: number
): Promise<boolean> {
  const message = `✅ 内容生成完成\n\n总计：${totalCount} 篇\n成功：${successCount} 篇\n失败：${totalCount - successCount} 篇`
  
  return await sendWeChatWorkNotification(message, 'markdown')
}

