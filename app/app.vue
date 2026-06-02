<script setup lang="ts">
import AuthCredentialForm from "~/components/auth/AuthCredentialForm.vue";
import AuthGuidePanel from "~/components/auth/AuthGuidePanel.vue";
import AuthResultPanel from "~/components/auth/AuthResultPanel.vue";

const {
  callbackInfo,
  clearResult,
  copied,
  form,
  hasResult,
  loadResult,
  pending,
  result,
  setCallbackInfo,
  startAuth,
  updateForm,
  validationMessage,
  copyToken,
} = useAuthTool();

const requestUrl = useRequestURL();
setCallbackInfo(requestUrl.origin);
await loadResult();

useHead({
  title: "Shopify Access Token Helper",
});
</script>

<template>
  <main class="page-shell">
    <section class="hero">
      <div class="hero-copy">
        <p class="hero-eyebrow">Shopify OAuth Helper</p>
        <h1 class="hero-title">
          Get the access token for a custom app installed on a store
        </h1>
        <p class="hero-description">
          Enter your app credentials, store domain, and scopes. After completing
          the OAuth flow, you'll be able to view the access token in this
          browser session.
        </p>
      </div>
    </section>

    <section class="workspace-grid">
      <AuthGuidePanel
        :callback-origin="callbackInfo.callbackOrigin"
        :callback-url="callbackInfo.callbackUrl"
      />
      <AuthCredentialForm
        :model="form"
        :pending="pending"
        :show-reset="hasResult"
        :validation-message="validationMessage"
        @submit="startAuth"
        @reset="clearResult"
        @update:model="updateForm"
      />
      <AuthResultPanel
        :copied="copied"
        :result="result"
        @copy="copyToken"
        @reset="clearResult"
      />
    </section>
  </main>
</template>
