/**
 * 大脑输入：主题或案例标识，用于选择模板并填内容
 */
export type BrainBrief = {
  themeId?: string
  caseId?: 'case1' | 'case2' | 'case3'
  title?: string
}
