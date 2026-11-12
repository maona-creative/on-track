
export async function getPlans() {
  const response = await fetch('/api/plans');
  const data = await response.json();
  return data;
}