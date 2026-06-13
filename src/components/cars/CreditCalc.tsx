"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { useLocale } from "@/hooks/use-locale";
import { Calculator } from "lucide-react";

interface CreditCalcProps {
  price: number;
}

export function CreditCalc({ price }: CreditCalcProps) {
  const { t } = useLocale();
  const [term, setTerm] = useState(48);
  const [downPercent, setDownPercent] = useState(30);

  const downPayment = Math.round(price * downPercent / 100);
  const loanAmount = price - downPayment;
  const rate = 0.019;
  const monthly = Math.round(loanAmount * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1));

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 font-semibold">
        <Calculator className="h-4 w-4" />
        {t("car.credit_calc")}
      </h3>

      <div className="space-y-5">
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span>{t("car.credit_down")}</span>
            <span className="font-semibold">${downPayment.toLocaleString()} ({downPercent}%)</span>
          </div>
          <Slider
            min={10}
            max={80}
            step={5}
            value={[downPercent]}
            onValueChange={(val) => setDownPercent((val as number[])[0])}
          />
        </div>

        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span>{t("car.credit_term")}</span>
            <span className="font-semibold">{term}</span>
          </div>
          <Slider
            min={12}
            max={84}
            step={6}
            value={[term]}
            onValueChange={(val) => setTerm((val as number[])[0])}
          />
        </div>

        <div className="rounded-lg bg-brand-600 p-4 text-center text-white">
          <div className="text-sm opacity-80">{t("car.credit_monthly")}</div>
          <div className="text-3xl font-bold">${monthly.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
