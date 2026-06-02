const STORAGE_KEY = "shopify-auth-form";

type AuthFormModel = {
  clientId: string;
  clientSecret: string;
  shop: string;
  scopes: string;
};

type SuccessResult = {
  status: "success";
  shop: string;
  accessToken: string;
  scopes: string[];
  issuedAt: string;
};

type ErrorResult = {
  status: "error";
  message: string;
  issuedAt: string;
};

type AuthResult = SuccessResult | ErrorResult | null;

type CallbackInfo = {
  callbackOrigin: string;
  callbackUrl: string;
};

function normalizeShopValue(shop: string) {
  return shop.trim().toLowerCase();
}

function normalizeScopesValue(scopes: string) {
  return scopes
    .split(/[\n,]+/)
    .map((scope) => scope.trim())
    .filter(Boolean)
    .join(",");
}

function validateForm(model: AuthFormModel) {
  if (!model.clientId.trim() || !model.clientSecret.trim()) {
    return "Please fill in all app credentials.";
  }

  if (
    !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(
      normalizeShopValue(model.shop),
    )
  ) {
    return "Shop domain must be xxx.myshopify.com.";
  }

  if (!normalizeScopesValue(model.scopes)) {
    return "Please provide at least one scope.";
  }

  return "";
}

export function useAuthTool() {
  const form = reactive<AuthFormModel>({
    clientId: "",
    clientSecret: "",
    shop: "",
    scopes: "",
  });

  // Restore form data from localStorage (client only)
  if (import.meta.client) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<AuthFormModel>;
        if (parsed) {
          form.clientId = parsed.clientId ?? "";
          form.clientSecret = parsed.clientSecret ?? "";
          form.shop = parsed.shop ?? "";
          form.scopes = parsed.scopes ?? "";
        }
      }
    } catch {
      // Ignore corrupted data
    }

    // Auto-persist on form changes
    watch(
      () => ({ ...form }),
      (next) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      },
      { deep: true },
    );
  }

  const pending = shallowRef(false);
  const copied = shallowRef(false);
  const hasAttemptedSubmit = shallowRef(false);
  const result = shallowRef<AuthResult>(null);
  const callbackInfo = shallowRef<CallbackInfo>({
    callbackOrigin: "",
    callbackUrl: "",
  });

  const validationMessage = computed(() =>
    hasAttemptedSubmit.value ? validateForm(form) : "",
  );
  const hasResult = computed(() => result.value !== null);

  function updateForm(nextModel: AuthFormModel) {
    form.clientId = nextModel.clientId;
    form.clientSecret = nextModel.clientSecret;
    form.shop = nextModel.shop;
    form.scopes = nextModel.scopes;
    copied.value = false;
  }

  function setCallbackInfo(origin: string) {
    callbackInfo.value = {
      callbackOrigin: origin,
      callbackUrl: `${origin}/api/auth/callback`,
    };
  }

  async function loadResult() {
    const data = await $fetch<{
      result: AuthResult;
    }>("/api/auth/result");

    result.value = data.result;
    return data.result;
  }

  async function clearResult() {
    await $fetch("/api/auth/result", { method: "DELETE" });
    result.value = null;
    copied.value = false;
  }

  async function startAuth() {
    hasAttemptedSubmit.value = true;
    const error = validateForm(form);
    if (error) {
      return;
    }

    pending.value = true;
    copied.value = false;

    const formElement = document.createElement("form");
    formElement.method = "post";
    formElement.action = "/api/auth/start";
    formElement.style.display = "none";

    const fields = {
      clientId: form.clientId.trim(),
      clientSecret: form.clientSecret.trim(),
      shop: normalizeShopValue(form.shop),
      scopes: normalizeScopesValue(form.scopes),
    };

    for (const [name, value] of Object.entries(fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      formElement.append(input);
    }

    document.body.append(formElement);
    formElement.submit();
  }

  async function copyToken() {
    if (result.value?.status !== "success") {
      return;
    }

    await navigator.clipboard.writeText(result.value.accessToken);
    copied.value = true;
  }

  return {
    callbackInfo: readonly(callbackInfo),
    copied,
    form,
    hasResult,
    hasAttemptedSubmit,
    loadResult,
    pending,
    result,
    setCallbackInfo,
    startAuth,
    updateForm,
    validationMessage,
    clearResult,
    copyToken,
  };
}
