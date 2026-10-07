import { Suspense } from "react";
import { OfficePage } from "@/components/office/office-page";
export default function Page() {
  return (
    <Suspense fallback={<p>دفترت آماده می‌شود…</p>}>
      <OfficePage />
    </Suspense>
  );
}
