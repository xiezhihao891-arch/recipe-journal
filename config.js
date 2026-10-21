/**
 * 本草膳录 · 后端配置
 *
 * type: 'supabase' + 非空 url/anonKey → RemoteStore（联网共享）
 * type: 'local' 或留空 → LocalStore（浏览器本地稿）
 *
 * 此处 anon key 为公开可写 wiki 设计，故意暴露；切勿写入 service_role。
 */
window.RECIPE_BACKEND = {
  type: "supabase",
  url: "https://vwsjfnizgzrfszgnitrx.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3c2pmbml6Z3pyZnN6Z25pdHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1ODA4NzgsImV4cCI6MjEwODE1Njg3OH0.VC_0BMuhlRW4ipoOnFTDIYZMAq0QPxhZt7UeiL4Ooj0",
};
