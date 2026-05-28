<template>
  <section class="dashboard-page">
    <div class="overview-grid">
      <article v-for="card in cards" :key="card.label" class="overview-card">
        <span>{{ card.value }}</span>
        <p>{{ card.label }}</p>
      </article>
    </div>

    <section class="work-panel">
      <div class="section-title">
        <h2>功能进度</h2>
        <p>按照管理端使用手册和当前后端接口整理，已有管理端业务接口已接入通用页面。</p>
      </div>

      <div class="module-grid">
        <RouterLink
          v-for="item in menuItems"
          :key="item.route"
          class="module-card"
          :to="item.route"
        >
          <strong>{{ item.title }}</strong>
          <span>{{ item.group }}</span>
        </RouterLink>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { menuGroups } from '../config/resources'

const menuItems = computed(() =>
  menuGroups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.title }))),
)

const cards = computed(() => [
  { label: '管理模块', value: menuGroups.length },
  { label: '功能页面', value: menuItems.value.length },
  { label: '当前状态', value: '联调中' },
])
</script>
