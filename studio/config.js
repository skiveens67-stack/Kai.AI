// Public browser configuration only. Never put Supabase service-role or Stripe/Resend secret keys here.
window.KAI_CONFIG = Object.freeze({
  supabaseUrl: "https://ovmyfxcdgjrciarzmvjn.supabase.co",
  supabasePublishableKey: "sb_publishable_mCN64Fk1lVp0XKzg8BjmXQ_HH1VUW5h",
  brainFunction: "kai-brain",
  checkoutFunction: "create-checkout",
  sellerOnboardingFunction: "seller-onboarding",
  cancelAutoPostFunction: "cancel-auto-post",
  refundFunction: "request-refund"
});
