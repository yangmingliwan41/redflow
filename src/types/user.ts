/**
 * 用户相关类型定义
 */

import { UserRole, TokenUsage } from './common'

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  totalTokenUsage?: number;
}





