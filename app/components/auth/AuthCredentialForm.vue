<template>
  <section class="panel">
    <div class="panel-header">
      <p class="panel-eyebrow">应用凭据</p>
      <h2 class="panel-title">填写当前要授权的 app 信息</h2>
      <p class="panel-copy">
        `client_secret` 只用于当前浏览器会话内的授权，不会展示到页面地址里。
      </p>
    </div>

    <form class="form" @submit.prevent="emit('submit')">
      <label class="field">
        <span class="field-label">Client ID</span>
        <input
          :value="model.clientId"
          class="field-input"
          autocomplete="off"
          name="clientId"
          placeholder="例如 1234567890abcdef"
          required
          @input="updateField('clientId', $event)"
        />
      </label>

      <label class="field">
        <span class="field-label">Client Secret</span>
        <input
          :value="model.clientSecret"
          class="field-input"
          autocomplete="off"
          name="clientSecret"
          placeholder="例如 shpss_xxxxxxxxxxxxx"
          required
          type="password"
          @input="updateField('clientSecret', $event)"
        />
      </label>

      <label class="field">
        <span class="field-label">Shop Domain</span>
        <input
          :value="model.shop"
          class="field-input"
          inputmode="url"
          name="shop"
          placeholder="your-store.myshopify.com"
          required
          @input="updateField('shop', $event)"
        />
      </label>

      <label class="field">
        <span class="field-label">Scopes</span>
        <textarea
          :value="model.scopes"
          class="field-input field-textarea"
          name="scopes"
          placeholder="read_products,write_products"
          required
          @input="updateField('scopes', $event)"
        />
        <span class="field-hint">
          Shopify OAuth 需要明确传入 scopes。请填入 app 已申请的权限，逗号分隔。
        </span>
      </label>

      <p v-if="validationMessage" class="validation-error">
        {{ validationMessage }}
      </p>

      <div class="actions">
        <button class="primary-button" :disabled="pending" type="submit">
          {{ pending ? "正在跳转授权" : "开始授权" }}
        </button>
        <button
          v-if="showReset"
          class="secondary-button"
          type="button"
          @click="emit('reset')"
        >
          清空结果
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
type FormModel = {
  clientId: string;
  clientSecret: string;
  shop: string;
  scopes: string;
};

const props = defineProps<{
  model: FormModel;
  pending: boolean;
  showReset: boolean;
  validationMessage: string;
}>();

const emit = defineEmits<{
  submit: [];
  reset: [];
  "update:model": [FormModel];
}>();

function updateField(field: keyof FormModel, event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  emit("update:model", {
    ...props.model,
    [field]: target.value,
  });
}
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

.panel-header {
  display: grid;
  gap: 0.35rem;
}

.panel-eyebrow,
.panel-copy,
.field-hint,
.validation-error {
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

.panel-copy {
  color: var(--text-muted);
  line-height: 1.6;
}

.form {
  display: grid;
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.5rem;
}

.field-label {
  color: var(--text-default);
  font-size: 0.95rem;
  font-weight: 600;
}

.field-input {
  width: 100%;
  min-height: 2.9rem;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: var(--surface-default);
  color: var(--text-strong);
  padding: 0.8rem 0.9rem;
  font: inherit;
}

.field-input:focus {
  outline: 2px solid var(--focus-ring);
  outline-offset: 1px;
}

.field-textarea {
  min-height: 6.75rem;
  resize: vertical;
}

.field-hint {
  color: var(--text-muted);
  font-size: 0.88rem;
  line-height: 1.5;
}

.validation-error {
  color: var(--danger-text);
  font-size: 0.92rem;
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

.primary-button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.secondary-button {
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--text-default);
}
</style>
