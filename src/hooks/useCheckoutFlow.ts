"use client";

import { useState } from "react";
import { readJsonResponse } from "@/lib/http";

type CheckoutItem = {
  id: string;
  quantity: number;
};

export function useCheckoutFlow(items: CheckoutItem[]) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  async function checkout() {
    setCheckoutError("");
    setIsCheckingOut(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(String(data.message || "Não foi possível continuar com a solicitação."));
      }

      if (typeof data.checkoutUrl === "string" && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (typeof data.whatsappUrl === "string" && data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
        return;
      }

      throw new Error("Não foi possível iniciar o próximo passo da solicitação.");
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Não foi possível continuar com a solicitação."
      );
    } finally {
      setIsCheckingOut(false);
    }
  }

  return {
    checkout,
    checkoutError,
    isCheckingOut,
    resetCheckoutError: () => setCheckoutError("")
  };
}
