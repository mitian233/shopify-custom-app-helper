<template>
  <section class="panel">
    <div class="panel-header">
      <p class="panel-eyebrow">授权结果</p>
      <h2 class="panel-title">{{ title }}</h2>
      <p class="panel-copy">{{ description }}</p>
    </div>

    <div v-if="result?.status === 'success'" class="result-grid">
      <div class="result-meta">
        <span class="result-label">Shop</span>
        <strong class="result-value">{{ result.shop }}</strong>
      </div>
      <div class="result-meta">
        <span class="result-label">Scopes</span>
        <strong class="result-value">{{ result.scopes.join(", ") }}</strong>
      </div>
      <label class="token-field">
        <span class="result-label">Access Token</span>
        <textarea
          :value="result.accessToken"
          class="token-textarea"
          readonly
        />
      </label>
      <div class="actions">
        <button class="primary-button" type="button" @click="emit('copy')">
          {{ copied ? "已复制" : "复制 Token" }}
        </button>
        <button class="secondary-button" type="button" @click="emit('reset')">
          重新获取
        </button>
      </div>
    </div>

    <div v-else-if="result?.status === 'error'" class="error-box">
      <p class="error-message">{{ result.message }}</p>
      <button class="secondary-button" type="button" @click="emit('reset')">
        重试
      </button>
    </div>

    <div v-else class="empty-state">
      <p class="empty-copy">
        授权完成后，当前浏览器会话对应的 access token 会显示在这里。
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
type AuthResult =
  | {
      status: "success";
      shop: string;
      accessToken: string;
      scopes: string[];
      issuedAt: string;
    }
  | {
      status: "error";
      message: string;
      issuedAt: string;
    }
  | null;

const props = defineProps<{
  result: AuthResult;
  copied: boolean;
}>();

const emit = defineEmits<{
  copy: [];
  reset: [];
}>();

const title = computed(() => {
  if (props.result?.status === "success") {
    return "已成功获取商店 access token";
  }

  if (props.result?.status === "error") {
    return "这次授权没有成功";
  }

  return "等待授权完成";
});

const description = computed(() => {
  if (props.result?.status === "success") {
    return "这个 token 只对应当前填写的 app 与商店。复制后即可使用。";
  }

  if (props.result?.status === "error") {
    return "请检查 app 配置、redirect URL、scopes 和商店地址是否一致。";
  }

  return "页面不会共享其他人的授权状态。";
});
</script>

<style scoped>
.panel {
  display: grid;
  gap: 1.25rem;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  background: var(--surface-elevated);
  padding: 1.5rem;
}

.panel-header,
.result-grid,
.empty-state {
  display: grid;
  gap: 0.75rem;
}

.panel-eyebrow,
.panel-copy,
.empty-copy,
.error-message {
  margin: 0;
}

.panel-eyebrow {
  color: var(--text-muted);
  font-size: 0.84rem;
}

.panel-title {
  margin: 0;
  color: var(--text-strong);
  font-size: 1.125rem;
}

.panel-copy,
.empty-copy {
  color: var(--text-muted);
  line-height: 1.6;
}

.result-meta,
.token-field {
  display: grid;
  gap: 0.45rem;
}

.result-label {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.result-value {
  color: var(--text-strong);
  line-height: 1.6;
  word-break: break-word;
}

.token-textarea {
  min-height: 8.5rem;
  width: 100%;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: var(--surface-code);
  color: var(--text-strong);
  padding: 0.85rem;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  resize: vertical;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.primary-button,
.secondary-button {
  min-height: 2.9rem;
  border-radius: 8px;
  padding: 0.75rem 1.1rem;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.primary-button {
  border: 1px solid var(--accent-border);
  background: var(--accent-fill);
  color: var(--accent-text);
}

.secondary-button {
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--text-default);
}

.error-box {
  display: grid;
  gap: 1rem;
  border-radius: 8px;
  background: var(--danger-surface);
  padding: 1rem;
}

.error-message {
  color: var(--danger-text);
  line-height: 1.6;
}
</style>
