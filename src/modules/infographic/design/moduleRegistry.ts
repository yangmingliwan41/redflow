import type { Component } from 'vue'
import type { ModuleId, ModuleMeta } from './moduleTypes'
import { MODULE_METAS } from './moduleTypes'
import ModuleHeader from '../semantic/modules/ModuleHeader.vue'
import ModuleHeroDual from '../semantic/modules/ModuleHeroDual.vue'
import ModuleAdvantageGrid from '../semantic/modules/ModuleAdvantageGrid.vue'
import ModulePlanCards from '../semantic/modules/ModulePlanCards.vue'
import ModuleQuoteCta from '../semantic/modules/ModuleQuoteCta.vue'
import FallbackModule from '../semantic/modules/FallbackModule.vue'

/**
 * 模块注册表：id -> meta，id -> 组件
 */
const registry = new Map<ModuleId, ModuleMeta>(Object.entries(MODULE_METAS) as [ModuleId, ModuleMeta][])

export const MODULE_COMPONENTS: Record<ModuleId, Component> = {
  header: ModuleHeader,
  'hero-dual': ModuleHeroDual,
  'metrics-block': FallbackModule,
  'advantage-grid': ModuleAdvantageGrid,
  'plan-cards': ModulePlanCards,
  'quote-cta': ModuleQuoteCta,
  'strategy-effect': FallbackModule
}

export function getModuleMeta(id: ModuleId): ModuleMeta | undefined {
  return registry.get(id)
}

export function getModuleComponent(id: ModuleId): Component | undefined {
  return MODULE_COMPONENTS[id]
}

export function getAllModuleIds(): ModuleId[] {
  return Array.from(registry.keys())
}
