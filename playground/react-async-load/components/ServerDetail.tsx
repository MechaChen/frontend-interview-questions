// Server Component - 模擬異步數據載入
export default async function ServerDetail() {
  // 模擬 API 請求或數據庫查詢的延遲
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return <h2 className="text-2xl font-bold underline">ServerDetail</h2>;
}
