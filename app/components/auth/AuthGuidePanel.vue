<template>
  <section class="panel">
    <div class="panel-header">
      <p class="panel-eyebrow">Setup Guide</p>
      <h2 class="panel-title">Complete the Shopify admin setup first</h2>
    </div>
    <ol class="guide-list">
      <li class="guide-item">
        Open your app in the Shopify Partner Dashboard.
      </li>
      <li class="guide-item">
        Set <span class="guide-code">{{ callbackOrigin }}</span> as the App URL.
      </li>
      <li class="guide-item">
        Add
        <span class="guide-code">{{ callbackUrl }}</span>
        to Allowed redirection URL(s).
      </li>
      <li class="guide-item">
        Make sure your app has the required Admin API scopes configured before
        you authorize.
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  callbackOrigin: string;
  callbackUrl: string;
}>();
</script>

<style scoped>
.panel {
  display: grid;
  gap: 1rem;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  background: var(--surface-elevated);
  padding: 1.5rem;
}

.panel-header {
  display: grid;
  gap: 0.35rem;
}

.panel-eyebrow {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.84rem;
}

.panel-title {
  margin: 0;
  color: var(--text-strong);
  font-size: 1.125rem;
  line-height: 1.4;
}

.guide-list {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding-left: 1.25rem;
  color: var(--text-default);
}

.guide-item {
  line-height: 1.6;
}

.guide-code {
  display: inline-block;
  margin-top: 0.15rem;
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
  background: var(--surface-code);
  color: var(--text-strong);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  word-break: break-all;
}
</style>
