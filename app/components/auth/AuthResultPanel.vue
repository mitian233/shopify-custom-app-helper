<template>
  <section class="panel">
    <div class="panel-header">
      <p class="panel-eyebrow">Authorization Result</p>
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
        <textarea :value="result.accessToken" class="token-textarea" readonly />
      </label>
      <div class="actions">
        <button class="primary-button" type="button" @click="emit('copy')">
          {{ copied ? "Copied!" : "Copy Token" }}
        </button>
        <button class="secondary-button" type="button" @click="emit('reset')">
          Get New Token
        </button>
      </div>
    </div>

    <div v-else-if="result?.status === 'error'" class="error-box">
      <p class="error-message">{{ result.message }}</p>
      <button class="secondary-button" type="button" @click="emit('reset')">
        Retry
      </button>
    </div>

    <div v-else class="empty-state">
      <p class="empty-copy">
        After authorization completes, the access token for your current browser
        session will appear here.
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
    return "Store access token acquired";
  }

  if (props.result?.status === "error") {
    return "Authorization failed";
  }

  return "Waiting for authorization\u2026";
});

const description = computed(() => {
  if (props.result?.status === "success") {
    return "This token is scoped to the app and store you entered. Copy it and use it right away.";
  }

  if (props.result?.status === "error") {
    return "Please verify your app settings, redirect URL, scopes, and shop domain are consistent.";
  }

  return "This page does not share authorization state with others.";
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
