"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactRequest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  type: string;
  status: string;
  car_id?: string;
  cars?: { brand: string; model: string } | null;
  created_at: string;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);
    try {
      const res = await fetch("/api/contact");
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    setLoading(false);
  }

  const typeLabel: Record<string, string> = {
    callback: "Зворотній дзвінок",
    test_drive: "Тест-драйв",
    credit: "Кредит",
    general: "Загальне",
  };

  const statusColor: Record<string, string> = {
    new: "bg-blue-500",
    in_progress: "bg-amber-500",
    done: "bg-brand-500",
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Заявки ({requests.length})</h2>
        <Button variant="outline" size="sm" onClick={loadRequests}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Оновити
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-20">
          <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Заявок поки немає</p>
          <p className="text-sm text-muted-foreground">
            Нові заявки з форми на сайті з&apos;являться тут
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="p-4">Ім&apos;я</th>
                  <th className="p-4">Телефон</th>
                  <th className="p-4">Авто</th>
                  <th className="p-4">Тип</th>
                  <th className="p-4">Повідомлення</th>
                  <th className="p-4">Статус</th>
                  <th className="p-4">Дата</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b last:border-0 hover:bg-zinc-50">
                    <td className="p-4">
                      <div className="font-medium">{req.name}</div>
                      {req.email && <div className="text-xs text-muted-foreground">{req.email}</div>}
                    </td>
                    <td className="p-4">
                      <a href={`tel:${req.phone}`} className="font-medium text-brand-600">
                        {req.phone}
                      </a>
                    </td>
                    <td className="p-4 text-sm">
                      {req.cars ? `${req.cars.brand} ${req.cars.model}` : "—"}
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="text-xs">
                        {typeLabel[req.type] || req.type}
                      </Badge>
                    </td>
                    <td className="max-w-[200px] truncate p-4 text-sm text-muted-foreground">
                      {req.message || "—"}
                    </td>
                    <td className="p-4">
                      <Badge className={`${statusColor[req.status] || "bg-zinc-500"} text-white border-0`}>
                        {req.status}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap p-4 text-sm text-muted-foreground">
                      {new Date(req.created_at).toLocaleString("uk-UA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
