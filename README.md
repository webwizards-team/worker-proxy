# Reverse Proxy (Cloudflare Worker)

این پروژه یک **Reverse Proxy** ساده بر پایه **Cloudflare Workers** است که دارای یک **پنل مدیریت تحت وب** برای تغییر آدرس مقصد (Upstream URL) می‌باشد.  
تنظیمات در **Cloudflare KV Namespace** ذخیره می‌شوند و با رمز عبور محافظت می‌شوند.

---

## ✨ ویژگی‌ها
- پروکسی درخواست‌ها به آدرس مقصد مشخص شده (Upstream)
- پنل ادمین تحت وب برای تغییر تنظیمات بدون نیاز به تغییر کد
- ذخیره تنظیمات در Cloudflare KV برای ماندگاری
- محافظت از پنل با رمز عبور
- پشتیبانی از HTTPS

---

## 📂 آموزش

### 1. ایجاد KV Namespace
از داشبورد Cloudflare وارد بخش:

Workers & Pages → KV → Create namespace

نام را `REVERSE_PROXY_KV` قرار دهید.  
سپس وارد Worker خود شوید و از بخش **Settings → Bindings → KV Namespace Bindings**، این KV را با **Variable name** برابر `REVERSE_PROXY_KV` اضافه کنید.

### 2. تنظیم رمز عبور پنل ادمین
از مسیر:

Settings → Variables and Secrets → Add a secret

یک Secret جدید با نام `ADMIN_PASSWORD` ایجاد کنید و مقدار آن را رمز ورود به پنل قرار دهید.

### 3. دیپلوی کد
کد پروژه را در بخش **Quick Edit** یا از طریق **Upload script** در Worker خود قرار دهید و ذخیره کنید.

### 4. ورود به پنل
برای ورود به پنل، آدرس زیر را در مرورگر باز کنید:

https://your-domain.workers.dev/_admin?password=YourPassword

به جای `YourPassword` همان مقداری که در `ADMIN_PASSWORD` گذاشتید را وارد کنید.

### 5. تنظیم آدرس مقصد (Upstream URL)
بعد از ورود به پنل، آدرس مقصد خود را وارد کرده و روی **Save Settings** کلیک کنید:

مثال: :https://example.com:port

پس از ذخیره، تمام درخواست‌ها از طریق این Worker به آدرس مقصد ارسال می‌شوند.

---

## 👨🏻‍💻 سازنده
By **Web Wizards** → [Telegram](https://t.me/WebWizardsTeam)

