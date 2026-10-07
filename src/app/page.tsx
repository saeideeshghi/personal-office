"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/office");
  }, [router]);
  return <Link href="/office">بازکردن دفتر کار…</Link>;
}
