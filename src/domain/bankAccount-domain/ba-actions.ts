export async function createBankAccountAction(data: { name: string; currency: string }) {
  try {
    const res = await fetch("/api/v1/bank-account/create-auth-cookie-only", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      return { success: false, error };
    }

    const result = await res.json();
    return { success: true, data: result.data.bankAccount };
  } catch (err) {
    return { success: false, error: err };
  }
}
