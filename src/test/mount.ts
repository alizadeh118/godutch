import { mount, type MountingOptions } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import type { Component } from 'vue'
import i18n from '@/i18n'

/**
 * Mount a component with Vuetify + vue-i18n installed. Pass a Pinia instance
 * (or any extra plugin) via `global.plugins`; it's merged with the defaults.
 * All Vuetify components/directives are registered so nothing depends on the
 * vite auto-import transform inside tests.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mountWith(component: Component, options: MountingOptions<any> = {}) {
  const vuetify = createVuetify({ components, directives })
  const { plugins = [], ...globalRest } = options.global ?? {}
  return mount(component, {
    ...options,
    global: {
      plugins: [vuetify, i18n, ...plugins],
      ...globalRest,
    },
  })
}
