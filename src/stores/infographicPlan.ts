import { defineStore } from 'pinia'
import type { PlanRequest, PlanResponse } from '@/services/ai/infographicPlan'
import { generateInfographicPlan } from '@/services/ai/infographicPlan'
import type { InfographicDocument, InfographicLayout } from '@/modules/infographic/schema/types'
import { buildInfographicFromFlow } from '@/modules/infographic/schema/fromFlow'
import { buildDocumentFromLayout } from '@/modules/infographic/schema/fromLayout'

interface InfographicPlanState {
  request: PlanRequest | null
  plan: PlanResponse | null
  doc: InfographicDocument | null
  layout: InfographicLayout | null
  loading: boolean
  error: string | null
}

export const useInfographicPlanStore = defineStore('infographicPlan', {
  state: (): InfographicPlanState => ({
    request: null,
    plan: null,
    doc: null,
    layout: null,
    loading: false,
    error: null
  }),

  actions: {
    async generate(request: PlanRequest) {
      this.loading = true
      this.error = null
      this.request = request
      try {
        const plan = await generateInfographicPlan(request)
        this.plan = plan
        if (plan.layout) {
          this.layout = plan.layout
          this.doc = buildDocumentFromLayout(plan.layout)
        } else {
          this.layout = null
          this.doc = buildInfographicFromFlow(plan.imageFlow)
        }
      } catch (e: any) {
        this.error = e?.message || String(e)
        this.plan = null
        this.doc = null
        this.layout = null
        throw e
      } finally {
        this.loading = false
      }
    },

    setDoc(doc: InfographicDocument) {
      this.doc = doc
    },

    setLayout(layout: InfographicLayout) {
      this.layout = layout
      this.doc = buildDocumentFromLayout(layout)
    },

    clear() {
      this.request = null
      this.plan = null
      this.doc = null
      this.layout = null
      this.loading = false
      this.error = null
    }
  }
})

