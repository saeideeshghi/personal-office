# GitHub و نسخه‌بندی

نسخهٔ اولین انتشار Git این پروژه **v0.2.0** است. نسخهٔ سورس در `package.json`، نقطهٔ ثابت آن در Git Tag و تاریخچهٔ تغییرها در `CHANGELOG.md` ثبت می‌شود.

## اولین آپلود

۱. در GitHub یک repository خالی و Public به نام `personal-office` بساز. هنگام ساخت، README، License یا .gitignore جدید انتخاب نکن تا تاریخچهٔ اولیه با سورس تداخل نداشته باشد.

قبل از اولین Push، در **Settings → Pages → Build and deployment → Source** گزینهٔ **GitHub Actions** را انتخاب کن. Workflowهای لازم از قبل داخل پروژه هستند.

۲. ZIP را استخراج کن. Terminal را دقیقاً در پوشه‌ای باز کن که `package.json` و `.github` داخل آن هستند. خود ZIP یا پوشهٔ بیرونی را به‌جای محتوای پروژه آپلود نکن.

۳. در PowerShell یا Terminal اجرا کن:

```powershell
git init
git add .
git commit -m "feat: personal office v0.2.0"
git branch -M main
git remote add origin https://github.com/saeideeshghi/personal-office.git
git tag -a v0.2.0 -m "Personal Office v0.2.0"
git push -u origin main --follow-tags
```

URL بالا برای حساب `saeideeshghi` و نام `personal-office` است. اگر حساب یا repository دیگری ساختی، فقط URL remote را تغییر بده. نام repository هنگام deploy خودکار تشخیص داده می‌شود.

اگر Git نام و ایمیل نخواست، تنظیم اضافی لازم نیست. در صورت پیام «Author identity unknown»، نام و ایمیل خودت را در تنظیمات Git ثبت کن و دوباره commit بزن.

اگر همین پوشه از قبل Git دارد، `git init` لازم نیست؛ قبل از ادامه `git remote -v` و `git status` را بررسی کن. اگر `origin` از قبل وجود دارد، به‌جای `remote add` از `git remote set-url origin URL` استفاده کن. repository دارای commit قبلی را بدون بررسی با force push جایگزین نکن.

## فعال‌کردن نسخهٔ وب

در repository برو به:

```text
Settings → Pages → Build and deployment → Source → GitHub Actions
```

Workflow از قبل در `.github/workflows/pages.yml` آماده است. Template دوم برای Next.js نساز.

بعد از این تنظیم، در تب Actions، workflow **Deploy GitHub Pages** را باز کن و **Run workflow → main** را بزن. این اجرای دستی برای اولین بار کافی است؛ pushهای بعدی روی `main` خودکار build و deploy می‌شوند.

اگر اولین push پیش از فعال‌کردن Pages انجام شده و workflow خطا داده، بعد از تنظیم Source، همان اجرا را Re-run کن یا Run workflow بزن.

لینک وب در Environment با نام `github-pages` و صفحهٔ Settings → Pages نمایش داده می‌شود. برای نام پیش‌فرض:

```text
https://saeideeshghi.github.io/personal-office/
```

این workflow اول format، lint، TypeScript، تست‌ها و static build را بررسی می‌کند. تنها خروجی `out/` منتشر می‌شود. هر Pull Request به `main` هم بررسی می‌شود، ولی نسخهٔ وب را تغییر نمی‌دهد. نیازی به PAT، secret شخصی یا branch جداگانهٔ `gh-pages` ندارد؛ از `GITHUB_TOKEN` خود GitHub استفاده می‌کند.

## انتشار نسخهٔ بعدی

برای تغییرهای معمول اول کد و توضیح تغییر را در `CHANGELOG.md` اصلاح کن. تغییرها باید commit شده باشند؛ `npm version` روی working tree کثیف اجرا نمی‌شود.

تغییرهای `Unreleased` را هنگام انتشار زیر شمارهٔ جدید و تاریخ همان روز منتقل کن. این دستورات را روی `main` اجرا کن؛ نسخه‌ها با Tag ثبت می‌شوند. برای کارهای در حال انجام از Branchهایی مثل `feat/agent-events` استفاده کن و برای هر نسخه Branch جداگانهٔ `v2` و `v3` نساز.

```powershell
git switch main
git add .
git commit -m "fix: describe the change"
npx pnpm@11.25.0 format:check
npx pnpm@11.25.0 lint
npx pnpm@11.25.0 typecheck
npx pnpm@11.25.0 test
npm run build:pages
npm run version:patch
npm run publish:github
```

فرمان version شماره را در `package.json` افزایش می‌دهد و یک commit و Tag دارای توضیح مثل `v0.2.1` می‌سازد. فرمان publish، `main` و Tagها را push می‌کند. Workflow دوم از Tag یک **GitHub Release** با یادداشت‌های خودکار می‌سازد؛ قبل از ساخت Release، Tag و شمارهٔ package را تطبیق می‌دهد و static build را بررسی می‌کند.

| نوع تغییر                                 | فرمان                   | نمونه           |
| ----------------------------------------- | ----------------------- | --------------- |
| رفع باگ و اصلاح کوچک                      | `npm run version:patch` | `0.2.0 → 0.2.1` |
| قابلیت تازه                               | `npm run version:minor` | `0.2.1 → 0.3.0` |
| اولین نسخهٔ پایدار یا تغییر بزرگ ناسازگار | `npm run version:major` | `0.3.0 → 1.0.0` |

در دورهٔ `0.x` محصول هنوز در حال تغییر است؛ تغییر ناسازگار را در نسخهٔ minor و CHANGELOG صریح ثبت کن. برای یک اصلاح کوچک به‌صورت خودکار نسخهٔ major نساز.

Tag منتشرشده را جابه‌جا یا دوباره استفاده نکن. هر اصلاح بعد از انتشار یک شمارهٔ جدید می‌گیرد. برای دیدن نسخهٔ فعلی: `npm run version:current`.

`main` همیشه جدیدترین نسخهٔ تست را نشان می‌دهد؛ هر Tag یک checkpoint ثابت برای برگشت یا مقایسه است. ساخت Tag به‌تنهایی Pages را deploy نمی‌کند؛ در روند بالا commit نسخه همراه با Tag روی main push می‌شود.

## تست Pages روی سیستم خودت

```powershell
npx pnpm@11.25.0 install --frozen-lockfile
npm run build:pages
npm run preview:pages
```

آدرس پیش‌فرض:

```text
http://localhost:4173/personal-office/
```

این preview فایل‌های واقعی `out/` را سرو می‌کند؛ مسیر ناموجود را با status 404 برمی‌گرداند و fallback مصنوعی SPA ندارد. با بازکردن مستقیم `index.html` تست نگیر.

برای آزمایش نام repository دیگر:

```powershell
npm run build:pages -- --base-path /my-office
npm run preview:pages
```

برای سایتی که در ریشهٔ دامنه منتشر می‌شود:

```powershell
npm run build:pages -- --base-path /
npm run preview:pages
```

در GitHub، `configure-pages` مسیر واقعی Pages را تعیین می‌کند. در build محلی یا Pull Request، `GITHUB_REPOSITORY` در صورت موجود بودن استفاده می‌شود؛ repository کاربری مانند `saeideeshghi.github.io` در ریشه منتشر می‌شود. می‌توان `PAGES_BASE_PATH` را هم تنظیم کرد.

فرمان‌های معمول `npm run dev`، `npm run build` و `npm run start` برای توسعه و Production Server محلی حفظ شده‌اند. پس از `build:pages` برای اجرای `next start` باید دوباره `npm run build` بزنی، چون خروجی static سرور Next نیست.

## نکته‌های مهم این نسخه

- prefix نام repository برای CSS، JavaScript، فونت و SVGها هنگام build اعمال می‌شود؛ لینک‌های داخلی با Next Link/router ساخته می‌شوند.
- چهار مسیر اتاق از قبل تولید می‌شوند و تب ظاهر/تمرکز از query در مرورگر خوانده می‌شود.
- جزئیات پروژهٔ تازه از مسیر ثابت `/projects/detail/?projectId=UUID` باز می‌شود. در نتیجه پروژهٔ ساخته‌شده بعد از deploy، بدون build دوباره و بعد از Refresh قابل استفاده است.
- لینک‌های قبلی چهار پروژهٔ نمونه هم حفظ شده‌اند. مسیر دلخواه `/projects/UUID` برای پروژهٔ تازه روی static host وجود ندارد؛ از لینک‌هایی که خود برنامه تولید می‌کند استفاده کن.
- وضعیت ظاهری و داده‌های محلی قبلی حفظ می‌شوند؛ کلیدهای storage و schema version عوض نشده‌اند.
- اطلاعات localhost خودکار به Pages منتقل نمی‌شود. داده‌ها همچنان در مرورگر هر کاربر هستند، نه روی GitHub.
- خروجی `version.json` شمارهٔ نسخه، commit و زمان build را دارد؛ برای اطمینان از نسخهٔ منتشرشده آن را زیر آدرس اصلی سایت باز کن.
- نسخهٔ فوتر هم از `package.json` می‌آید و با هر افزایش نسخه خودکار تغییر می‌کند.
- شمارهٔ نسخهٔ برنامه با نسخهٔ schema ذخیره‌سازی یکی نیست؛ تغییر ناسازگار داده‌ها نیاز به migration و افزایش نسخهٔ Persist دارد.
- `node_modules`، `.next`، `out` و فایل‌های env در Git ثبت نمی‌شوند. `pnpm-lock.yaml` حتماً همراه سورس commit شود.
- فعلاً این خروجی frontend است. برای API، Auth و AI Agent واقعی در فاز بعدی باید سرویس Backend جدا اضافه شود.

## منابع تنظیمات

- [GitHub: Publishing with GitHub Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Next.js: Static Exports](https://nextjs.org/docs/app/guides/static-exports)
- [Next.js: basePath](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath)
