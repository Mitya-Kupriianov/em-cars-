"use client";

import { useEffect, useState } from "react";
import { Car as CarType } from "@/types/car";
import { Car, DollarSign, MessageSquare, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [cars, setCars] = useState<CarType[]>([]);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    fetch("/api/cars").then((r) => r.json()).then(setCars).catch(() => {});
    fetch("/api/contact").then((r) => r.json()).then((d) => {
      setRequestCount(Array.isArray(d) ? d.length : 0);
    }).catch(() => {});
  }, []);

  const totalCars = cars.length;
  const inStock = cars.filter((c) => c.status === "in_stock").length;
  const avgPrice = totalCars ? Math.round(cars.reduce((s, c) => s + c.price_usd, 0) / totalCars) : 0;

  const stats = [
    { label: "Всього авто", value: totalCars, icon: Car, color: "bg-blue-100 text-blue-600" },
    { label: "В наявності", value: inStock, icon: TrendingUp, color: "bg-brand-100 text-brand-600" },
    { label: "Середня ціна", value: `$${avgPrice.toLocaleString()}`, icon: DollarSign, color: "bg-amber-100 text-amber-600" },
    { label: "Заявки", value: requestCount, icon: MessageSquare, color: "bg-purple-100 text-purple-600" },
  ];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
