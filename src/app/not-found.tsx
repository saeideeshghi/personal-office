import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state">
      <h1>این فضا پیدا نشد</h1>
      <p>ممکن است پروژه حذف شده باشد یا آدرس درست نباشد.</p>
      <Link className="button button-primary" href="/office">
        بازگشت به دفتر
      </Link>
    </div>
  );
}
