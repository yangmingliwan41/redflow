/**
 * 问题流程管理器
 * 管理需求分析向导的问题流程状态
 */

import { QuestionDefinition, QuestionFlowRecord } from '../../types/requirement'

export interface AnswerResult {
  success: boolean
  error?: string
}

export class QuestionFlowManager {
  private questions: QuestionDefinition[]
  private answers: Record<string, any> = {}
  private flowHistory: QuestionFlowRecord[] = []
  private currentQuestionIndex: number = 0
  private followUpQuestions: QuestionDefinition[] = []

  constructor(questions: QuestionDefinition[]) {
    this.questions = [...questions]
  }

  /**
   * 获取当前问题
   */
  getCurrentQuestion(): QuestionDefinition | null {
    const allQuestions = [...this.questions, ...this.followUpQuestions]
    if (this.currentQuestionIndex >= allQuestions.length) {
      return null
    }
    return allQuestions[this.currentQuestionIndex]
  }

  /**
   * 获取问题总数
   */
  getTotalQuestions(): number {
    return this.questions.length + this.followUpQuestions.length
  }

  /**
   * 获取进度（0-1）
   */
  getProgress(): number {
    const total = this.getTotalQuestions()
    if (total === 0) return 0
    return this.currentQuestionIndex / total
  }

  /**
   * 回答问题
   */
  answerQuestion(questionId: string, answer: any): AnswerResult {
    const question = this.getQuestionById(questionId)
    if (!question) {
      return { success: false, error: '问题不存在' }
    }

    // 验证答案
    if (question.validation) {
      const validationResult = question.validation(answer)
      if (validationResult !== true) {
        return { 
          success: false, 
          error: typeof validationResult === 'string' ? validationResult : '答案验证失败' 
        }
      }
    }

    // 保存答案
    this.answers[questionId] = answer

    // 记录流程
    this.flowHistory.push({
      questionId,
      questionType: question.type,
      questionText: question.text,
      answer,
      answeredAt: Date.now()
    })

    // 移动到下一个问题
    this.currentQuestionIndex++

    return { success: true }
  }

  /**
   * 跳过问题
   */
  skipQuestion(questionId: string): AnswerResult {
    const question = this.getQuestionById(questionId)
    if (!question) {
      return { success: false, error: '问题不存在' }
    }

    if (question.required) {
      return { success: false, error: '此问题是必需的，不能跳过' }
    }

    // 记录跳过
    this.flowHistory.push({
      questionId,
      questionType: question.type,
      questionText: question.text,
      answer: null,
      answeredAt: Date.now(),
      skipped: true
    })

    // 移动到下一个问题
    this.currentQuestionIndex++

    return { success: true }
  }

  /**
   * 返回上一步
   */
  goToPrevious(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--
      // 移除最后一条历史记录
      if (this.flowHistory.length > 0) {
        const lastRecord = this.flowHistory[this.flowHistory.length - 1]
        delete this.answers[lastRecord.questionId]
        this.flowHistory.pop()
      }
    }
  }

  /**
   * 跳转到指定问题
   */
  goToQuestion(questionId: string): boolean {
    const allQuestions = [...this.questions, ...this.followUpQuestions]
    const index = allQuestions.findIndex(q => q.id === questionId)
    if (index === -1) {
      return false
    }
    this.currentQuestionIndex = index
    return true
  }

  /**
   * 获取指定问题的答案
   */
  getAnswer(questionId: string): any {
    return this.answers[questionId]
  }

  /**
   * 获取所有答案
   */
  getAllAnswers(): Record<string, any> {
    return { ...this.answers }
  }

  /**
   * 获取流程历史
   */
  getFlowHistory(): QuestionFlowRecord[] {
    return [...this.flowHistory]
  }

  /**
   * 检查是否完成所有必需问题
   */
  isComplete(): boolean {
    const allQuestions = [...this.questions, ...this.followUpQuestions]
    return allQuestions.every(q => {
      if (!q.required) return true
      return this.answers[q.id] !== undefined && this.answers[q.id] !== null
    })
  }

  /**
   * 添加追问问题
   */
  addFollowUpQuestion(question: QuestionDefinition): void {
    // 检查是否已存在
    if (this.followUpQuestions.find(q => q.id === question.id)) {
      return
    }
    this.followUpQuestions.push(question)
  }

  /**
   * 添加问题（用于动态添加）
   */
  addQuestion(question: QuestionDefinition): void {
    if (this.questions.find(q => q.id === question.id)) {
      return
    }
    this.questions.push(question)
  }

  /**
   * 根据ID获取问题
   */
  private getQuestionById(questionId: string): QuestionDefinition | undefined {
    const allQuestions = [...this.questions, ...this.followUpQuestions]
    return allQuestions.find(q => q.id === questionId)
  }

  /**
   * 重置流程
   */
  reset(): void {
    this.answers = {}
    this.flowHistory = []
    this.currentQuestionIndex = 0
    this.followUpQuestions = []
  }

  /**
   * 从状态恢复
   */
  restoreState(state: {
    answers: Record<string, any>
    flowHistory: QuestionFlowRecord[]
    currentQuestionIndex: number
    followUpQuestions: QuestionDefinition[]
  }): void {
    this.answers = { ...state.answers }
    this.flowHistory = [...state.flowHistory]
    this.currentQuestionIndex = state.currentQuestionIndex
    this.followUpQuestions = [...state.followUpQuestions]
  }

  /**
   * 获取状态（用于保存）
   */
  getState(): {
    answers: Record<string, any>
    flowHistory: QuestionFlowRecord[]
    currentQuestionIndex: number
    followUpQuestions: QuestionDefinition[]
  } {
    return {
      answers: { ...this.answers },
      flowHistory: [...this.flowHistory],
      currentQuestionIndex: this.currentQuestionIndex,
      followUpQuestions: [...this.followUpQuestions]
    }
  }
}

