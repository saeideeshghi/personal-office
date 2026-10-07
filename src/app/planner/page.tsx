import { Suspense } from "react";
import { PlannerPage } from "@/components/planner/planner-page";
export default function Page() {
  return (
    <Suspense fallback={<p>پلنر آماده می‌شود…</p>}>
      <PlannerPage />
    </Suspense>
  );
}
