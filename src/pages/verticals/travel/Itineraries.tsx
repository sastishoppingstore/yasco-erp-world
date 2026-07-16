import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar } from "lucide-react";

export default function ItinerariesPage() {
  const [bookingId, setBookingId] = useState<number>(0);
  const { data: itineraries } = trpc.travel.itineraryList.useQuery({ bookingId }, { enabled: bookingId > 0 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Itineraries</h2><p className="text-slate-500">Trip itineraries and day-by-day plans</p></div>
        <div className="flex gap-2"><Input type="number" placeholder="Booking ID" className="w-40" value={bookingId || ""} onChange={e => setBookingId(Number(e.target.value))} /><Button variant="outline" onClick={() => setBookingId(bookingId)}>Load</Button></div>
      </div>

      {!bookingId ? (
        <Card><CardContent className="p-12 text-center text-slate-500"><MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Enter a Booking ID to view its itinerary</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {itineraries?.map(item => (
            <Card key={item.id}>
              <CardContent className="p-4 flex gap-4">
                <div className="flex flex-col items-center min-w-16">
                  <span className="text-lg font-bold text-blue-600">Day {item.day}</span>
                  {item.date && <span className="text-xs text-slate-500">{item.date}</span>}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{item.activity}</h4>
                      <p className="text-sm text-slate-600">{item.description || "—"}</p>
                    </div>
                    <Badge variant="outline">{item.cost ? `${Number(item.cost).toLocaleString()} ${item.currency}` : "—"}</Badge>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    {item.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>}
                    {item.startTime && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.startTime} - {item.endTime}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
