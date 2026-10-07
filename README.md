# Personal Office

**GitHub Pages و نسخه‌بندی:** راهنمای کامل اولین push، فعال‌کردن نسخهٔ وب و انتشار نسخه‌های بعدی در [GITHUB.md](GITHUB.md) است. نسخهٔ اولیهٔ Git این پروژه `v0.2.0` و تاریخچهٔ تغییرها در [CHANGELOG.md](CHANGELOG.md) ثبت شده‌اند.

یک دفتر مجازی فارسی برای دیدن وضعیت کار، برنامه‌ریزی، تمرکز و مرور پیشرفت. دفتر تجربه اصلی است؛ پلنر، پروژه‌ها و تحلیل ابزارهای آن هستند.

نسخه `0.2` یک prototype فرانت‌اند است. اتاق‌ها وضعیت داده‌های محلی را نشان می‌دهند؛ هیچ AI Agent واقعی، API، حساب کاربری یا سرویس ابری به آن متصل نیست.

## اجرا

نیازمندی: Node.js **22.13 یا جدیدتر**؛ Node 24 LTS پیشنهاد می‌شود. نسخه‌های dependency در `package.json` و `pnpm-lock.yaml` پین شده‌اند.

```bash
npx pnpm@11.25.0 install
npx pnpm@11.25.0 dev
```

برنامه در `http://localhost:4173` اجرا می‌شود. این روش به `corepack enable` یا نصب سراسری pnpm نیاز ندارد.

اگر از npm استفاده می‌کنی، `npm install` و سپس `npm run dev` هم قابل استفاده‌اند؛ مسیر تست‌شده و دارای lockfile همین pnpm است.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm format:check
pnpm build
pnpm start
```

`pnpm build` یک Production Build استاندارد Next.js می‌سازد؛ `pnpm start` آن را اجرا می‌کند. هیچ environment variable یا دیتابیس لازم نیست. برای پورت دیگر: `pnpm dev --port 3000`.

در Windows دستورات در Terminal یا PowerShell قابل اجرا هستند. `node_modules` و `.next` عمداً در ZIP سورس نیستند.

## مسیرها

| مسیر                            | کاربرد                                                         |
| ------------------------------- | -------------------------------------------------------------- |
| `/`                             | انتقال به دفتر                                                 |
| `/office`                       | دفتر ایزومتریک تیره، چهار گروه میز و مسیرهای اتصال، مرکز تمرکز |
| `/office/[roomId]`              | فضای مستقل اتاق: تسک، پروژه، تمرکز و کاستومایزر                |
| `/planner`                      | Kanban، جابه‌جایی با ماوس/کیبورد، تقویم شمسی و تایم‌لاین       |
| `/projects`                     | ساخت، ویرایش، حذف و فیلتر پروژه‌ها                             |
| `/projects/[projectId]`         | لینک‌های قبلی چهار پروژهٔ نمونه                                |
| `/projects/detail?projectId=ID` | جزئیات همهٔ پروژه‌ها؛ مسیر سازگار با GitHub Pages و Refresh    |
| `/analytics`                    | زمان تمرکز، نمودار هفتگی، سهم اتاق‌ها و مرور قطعی داده‌ها      |
| `/customize`                    | تم، چیدمان، اتاق، مبلمان، دکور و ویجت‌ها                       |
| `/settings`                     | پروفایل، شروع هفته، فرمت ساعت، اهداف تایمر و بازنشانی نمونه    |

## Stack و بررسی نسخه‌ها

نسخه‌های registry رسمی و مستندات رسمی پیش از نصب در ۲۰۲۶/۱۰/۰۴ بررسی شدند:

- Next.js 16.3.8 / React 19.3.0 / TypeScript 6.0.3.
- Tailwind CSS 4.3.3، اجزای محلی به سبک shadcn/ui روی Radix UI، CVA و `components.json`.
- Zustand 5.0.15 با persist middleware.
- Motion for React 14، dnd-kit core 6.3.1 و sortable 10.
- Recharts 3.10.1، Lucide، date-fns، Zod 4.
- فونت Vazirmatn محلی، بدون اتصال runtime به سرویس فونت.
- ESLint 9.39.5 و Prettier؛ Vitest برای منطق.

ESLint 10 با نسخه‌های stable پلاگین‌های import/react/jsx-a11y همراه Next peer conflict داشت. آخرین نسخه سازگار شاخه 9 انتخاب شده است. TypeScript 7 نیز با peer range `typescript-eslint` سازگار نبود؛ نسخه 6.0.3 انتخاب شد. بررسی `pnpm peers check` بدون conflict است. این انتخاب‌ها عمدی هستند و هنگام ارتقا باید همراه ecosystem دوباره بررسی شوند.

منابع رسمی:

- https://nextjs.org/docs/app/getting-started/installation
- https://tailwindcss.com/docs/installation/framework-guides/nextjs
- https://ui.shadcn.com/docs/installation/next
- https://motion.dev/docs/react-installation
- https://registry.npmjs.org/

## ساختار

```text
src/
  app/                    App Router، layout و توکن‌های CSS
  components/
    app-shell/            Sidebar، Header، Provider، Search و Settings
    office/               Scene، artwork ایزومتریک، فضای مستقل اتاق، کاستومایزر و Activity
    tasks/                فرم Zod، کارت و CRUD
    planner/              Kanban، تقویم و Timeline
    projects/             فرم، کارت، جزئیات و اتاق پروژه
    focus/                تایمر، Pause، Resume و Finish
    analytics/            محاسبات و نمودارهای lazy-loaded
    customize/            کنترل‌های config-driven
    ui/                   Button، Dialog و اجزای مشترک
  domain/                 مدل‌ها، schema، محاسبات خالص و قرارداد repository
  data/                   کاتالوگ asset، theme، layout و seed
  stores/                 شش Store مستقل و hydration مرکزی
  lib/                    Commands، persistence adapter و utilities
  hooks/                  clock مبتنی بر timestamp
public/office/            SVGهای محلی و ماژولار
scripts/dev.mjs           لانچر Next و سازگاری با preview supervisor
```

## تصمیم‌های معماری

### داده و ماندگاری

UI از selectorهای Zustand می‌خواند. تمام تغییرهای business-level از `src/lib/commands.ts` عبور می‌کنند: اعتبارسنجی، یکسان نگه‌داشتن حوزه پروژه و کار، جابه‌جایی وضعیت، ثبت Activity و هماهنگی تایمر.

شش Store مستقل: tasks، projects، focus، office، activity و settings. persist keyها با `personal-office:` شروع می‌شوند، `version: 1` دارند و از یک adapter در `src/lib/persistence.ts` استفاده می‌کنند. هیچ component مستقیماً `localStorage` را نمی‌خواند یا نمی‌نویسد.

`skipHydration` فعال است. Provider پیش از نمایش UI همه Storeها را hydrate می‌کند و seed اولین اجرا را فوراً ذخیره می‌کند. آرایه خالی ذخیره‌شده معتبر است و باعث seed دوباره نمی‌شود. Refresh داده‌ها را بازتولید نمی‌کند. اطلاعات به origin و مرورگر وابسته‌اند؛ `localhost` و یک دامنه دیگر دفترهای جدا دارند.

### تایمر

یک جلسه فعال مجاز است. `startedAt`، `pausedAt`، `pausedDurationMs`، `runningSince` و segments ذخیره می‌شوند. elapsed از ساعت واقعی محاسبه می‌شود، نه شمارش interval. interval فقط نمایش را به‌روز می‌کند.

Pause بازه کار جاری را می‌بندد؛ Resume یک segment جدید باز می‌کند. Finish مدت خالص را ثبت می‌کند و در صورت انتخاب کار را کامل می‌کند. Cancel زمان را وارد Analytics نمی‌کند. تغییر ساعت سیستم می‌تواند روی یک تایمر wall-clock اثر بگذارد؛ زمان منفی clamp می‌شود.

هدف تایمر یک یادآور است؛ در پایان مدت هدف خودکار متوقف نمی‌شود. استراحت پیشنهادی قابل تنظیم است، اما تایمر مستقل استراحت در این milestone نیست.

### دفتر و سفارشی‌سازی

`OfficeConfig → OfficeRoomConfig → assets/widgets` منبع حقیقت است. صحنه aspect ratio ثابت دارد؛ مختصات و اندازه اتاق‌ها درصدی هستند. دکورهای اتاق scale و rotation مستقل دارند. میزها در `stations` به‌صورت گروه میز/مانیتور/صندلی/کاراکتر ذخیره می‌شوند و با `taskId` به کار وصل می‌شوند. رندر بر اساس عمق عمودی مرتب می‌شود تا هنگام جابه‌جایی، اشیا به‌ترتیب مناسب روی هم قرار بگیرند.

پس‌زمینه و مبلمان SVG هستند. اسم اتاق، زمان، کار فعلی و شمارنده‌ها React واقعی‌اند. هیچ متن پویایی در artwork ذخیره نشده. نمای اصلی جدید در `components/office/isometric-artwork.tsx` با SVG کدنویسی شده است؛ assetهای قبلی در `public/office` برای thumbnailها باقی مانده‌اند. برای تغییر هندسه میز و مانیتور باید همین component و برای افزودن گزینه‌های مبلمان، کاتالوگ را تغییر بدهی.

چهار تم، دو چیدمان کلی، سه مدل میز، دو مدل مانیتور، سه نوع کف و دو حالت نور وجود دارد. هر اتاق سه میز اولیه دارد؛ میزها تا پنج عدد قابل افزودن و تا یک میز قابل حذف‌اند. گیاه، چراغ، کتابخانه و نئون را می‌توان به اتاق اضافه یا از آن حذف کرد. Drag میز و دکور، مختصات عددی، Scale و Rotation همگی ذخیره می‌شوند.

روی اتاق کلیک کن تا وارد `/office/room-ai`، `/office/room-coding`، `/office/room-marketing` یا `/office/room-personal` شوی. کار جدید در حوزه همین اتاق ساخته می‌شود و انتخاب پروژه به پروژه‌های همان حوزه محدود است. پنل کارها جست‌وجو، فیلتر، جزئیات، ویرایش، تغییر وضعیت و حذف دارد. کلیک روی میز یا برچسب آن، جزئیات کار متصل را باز می‌کند. تمرکز از داخل همان محیط شروع، مکث، ادامه و تمام می‌شود.

اتصال میز به کار می‌تواند صریح باشد یا خودکار از صف کارهای باز اتاق. کار متصل صریح پس از تکمیل همچنان روی میز نمایش داده می‌شود؛ کارهای تکمیل‌شده وارد صف خودکار نمی‌شوند. وضعیت و animation فعال فقط به جلسه تمرکز واقعی وابسته‌اند. برای اجرای Agent واقعی هنوز adapter رویداد لازم است.

ویجت‌های کار فعلی، لیست کار، آمار تمرکز و پیشرفت از تنظیمات ظاهر هر اتاق کنترل می‌شوند. مسیر `/customize` برای تم و چیدمان کلی حفظ شده و لینک کاستومایزر کامل اتاق دارد. بازنشانی یک اتاق فقط ظاهر همان فضا را برمی‌گرداند. هر پروژه نیز قالب، تم، دکور و ویجت مستقل قبلی را دارد.

در موبایل نمای کلی دفتر داخل canvas افقی قابل اسکرول است تا میزها و عنوان‌ها خوانا بمانند. فضای مستقل اتاق به یک صحنه متناسب با عرض صفحه و پنل ابزار زیر آن تبدیل می‌شود. اسکرول افقی فقط داخل canvas یا کنترل‌های مجاز است. منوی اصلی Drawer است و فرم‌ها اسکرول داخلی دارند.

### پروژه و وضعیت کار

پیشرفت همیشه از `done / total tasks` محاسبه می‌شود. مراحل پروژه جدا و دستی قابل تکمیل هستند؛ هیچ مرحله‌ای اجرای Agent یا Test واقعی را جعل نمی‌کند. حذف پروژه، کارها را مستقل می‌کند و تاریخچه تمرکز را حفظ می‌کند. حذف کار، جلسه فعالش را ثبت می‌کند و تاریخچه گذشته را نگه می‌دارد.

یادداشت پروژه با دکمه ذخیره ثبت می‌شود؛ بقیه تغییرها فوری هستند. نشان «تغییرها هنوز ذخیره نشده‌اند» برای یادداشت وجود دارد.

### تقویم و تحلیل

نمای تقویم از تقویم فارسی `Intl` استفاده می‌کند، اما storage و ورودی‌های native تاریخ ISO/Gregorian هستند. گروه‌بندی روزها با timezone محلی مرورگر انجام می‌شود. شروع هفته قابل انتخاب است. کارهای روزانه از `plannedDate` خوانده می‌شوند؛ نمای تمام کارها کارهای بدون تاریخ را هم نشان می‌دهد.

زمان تمرکز با تقاطع segmentهای کاری و مرز هر روز محاسبه می‌شود، پس عبور از نیمه‌شب و Pause درست گزارش می‌شوند. نمودارها و review از داده‌های محلی محاسبه می‌شوند؛ آمار رشد یا insight ساختگی وجود ندارد.

Timeline بازه ۸ تا ۱۸ را نشان می‌دهد؛ کارهای خارج این بازه در Kanban باقی می‌مانند و در timeline توضیح داده می‌شود. هم‌پوشانی کارها در یک ساعت کنار هم نمایش داده می‌شود؛ این نسخه scheduler خودکار نیست.

## انتقال بعدی به Backend

1. UUIDهای string و تاریخ‌های ISO حفظ شوند.
2. adapter/قرارداد `domain/repository.ts` پیاده‌سازی شود.
3. bootstrap اولیه به دریافت workspace تبدیل شود؛ Storeها cache قابل subscribe باقی بمانند.
4. `commands.ts` تغییرهای optimistic را با requestهای repository و rollback/error handling هماهنگ کند.
5. تغییر schema با افزایش persist version و migration صریح انجام شود.
6. قرارداد User/Workspace/Office و ownership اضافه شود. `Project.visibility` فعلاً private است و UI مجوزها ندارد.
7. UI اتاق‌ها، assetها و کارها به Backend وابسته نشود.

صرفاً تعویض localStorage با یک endpoint برای سیستم چندکاربره کافی نیست؛ conflict resolution، transactionهای مرتبط و clock authority نیازمند طراحی milestone بعدی هستند.

## Accessibility و کیفیت

- RTL بومی، `lang=fa`، focus واضح و skip link.
- Dialogهای Radix با focus trap، Escape و بازگرداندن focus.
- دکمه‌های iconدار با label، نمودار پیشرفت با ARIA، کنترل‌های native قابل استفاده با کیبورد.
- Kanban با Pointer/Keyboard sensors؛ وضعیت با select نیز قابل تغییر است.
- Motion و CSS به `prefers-reduced-motion` احترام می‌گذارند.
- اجزای heavy نمودار با dynamic import لود می‌شوند.
- تمام assetها و فونت‌ها محلی‌اند و لینک تصویر خارجی وجود ندارد.

## تست

`pnpm test` شامل تست‌های معنی‌دار تایمر و Pause/Resume، جابه‌جایی/بازکردن کار، محاسبه progress، split در نیمه‌شب، شروع هفته، حذف پروژه بدون حذف کار، hydration تایمر و UUID در HTTP است. تست‌های نگاشت میزها، جلوگیری از تکرار تسک در صف خودکار، سازگاری اتاق قدیمی و محدود شدن Drag به کف نیز اضافه شده‌اند. تست Snapshot عمومی اضافه نشده است.

نتیجه QA نهایی و محدودیت‌های تأییدشده در `VERIFICATION.md` ثبت می‌شوند.

## محدودیت‌ها و milestone بعدی

- ذخیره‌سازی محلی؛ بدون sync بین دستگاه‌ها یا تضمین backup.
- بدون Agent، integration، auth یا Backend؛ artwork اولیه SVG است.
- بدون تقویم چندماهه پیچیده، مدیریت تیم یا اتصال Agent. Drag و کاستومایز اتاق در نسخه 0.2 فعال است.
- داده‌های جاری browser-specific هستند؛ سورس ZIP داده مرورگر را منتقل نمی‌کند.

Milestone پیشنهادی: **Agent Run Visualization**. یک adapter رویداد برای `RunStarted / StepStarted / ToolCalled / ArtifactCreated / StepCompleted / RunFailed`، انتقال وضعیت مراحل به فضاهای تصویری پروژه و نمایش خروجی قابل بازکردن. ابتدا یک Agent برنامه‌نویسی و یک جریان کار واقعی؛ سپس توسعه به چند Agent و اتاق‌های تخصصی. این مرحله هسته ایده دفتر مجازی برای نمایش کار Agentها را عملی می‌کند.

## سازگاری نسخه 0.2

کلید و نسخه persist قبلی حفظ شده‌اند. فیلدهای جدید `stations`، `floorStyle` و `lighting` اختیاری‌اند و برای داده قدیمی fallback دارند؛ ارتقا پروژه‌ها و کارهای مرورگر را پاک نمی‌کند. در همان hostname و پورت قبلی اجرا کن تا داده محلی قبلی دیده شود. برای دیدن ظاهر اولیه جدید، بازنشانی ظاهر دفتر کافی است؛ Reset Demo Data همه داده‌های نمونه را بازنشانی می‌کند.

محدودیت بصری: صحنه 2.5D ایزومتریک است؛ چرخش آزاد دوربین یا مدل سه‌بعدی WebGL ندارد. Zoom داخل canvas است و هر دو نما با scrollbar جابه‌جا می‌شوند. روی کیبورد، شیء انتخاب‌شده با کلیدهای جهت حرکت می‌کند؛ مختصات عددی هم در Inspector موجود است.
