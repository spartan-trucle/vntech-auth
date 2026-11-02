# Authentication & Authorization
### Ai đang gõ cửa — và họ được phép làm gì?

> **Đối tượng:** Intern Backend + Frontend (đã biết HTTP, REST, viết được API CRUD; chưa từng tự làm login)
> **Presenter:** Truc Le — toàn bộ
> **Thời lượng:** ~59 phút + ~10 phút Q&A/Kahoot · 61 slide (gồm 11 slide câu hỏi "Your turn", mỗi slide ~1 phút)

File này là nguồn nội dung cho slide. Slide là bản tiếng Anh của outline này, không viết lại tự do.
Nội dung rút gọn từ [spartan-khanhdo/auth-security-lecture](https://github.com/spartan-khanhdo/auth-security-lecture) cho mức Intern.

**Nguyên tắc cho mức Intern**
- Mỗi khái niệm đi kèm **một thứ intern sẽ gặp ngay tuần đầu**: response 401/403, cookie trong DevTools, chuỗi `eyJ…` trong header, nút "Login with Google", nút "Connect" của một connector trong Claude, một GitHub Action deploy lên AWS.
- Ví dụ thật thay cho app bịa: section 3 dùng **Claude** (connector Google Workspace, Notion, Slack…), section 4 dùng **Orders → Payments** và **GitHub Actions → AWS**.
- Vấn đề trước, định nghĩa sau. Không có RFC number, không có tên attack hiếm.
- Mỗi section kết thúc bằng **1 slide "Làm / Đừng làm"** — thứ intern mang về dùng được.
- Trước vài khái niệm chính có **1 slide "Your turn"**: hỏi khán phòng, 30 s bàn với người bên cạnh, có câu 2–3 lựa chọn A/B/C, câu dễ thì để hỏi mở (không lựa chọn), bấm → mới lật đáp án. Không đánh số outline (để giữ nguyên 1.2, 2.4…).
- **Service-to-service có section riêng (04)**: Client Credentials, nội dung token M2M, validate rồi authorize, GitHub → AWS bằng OIDC. mTLS và service mesh chỉ ở mức **khái niệm** (một card mỗi thứ), không demo handshake.
- **Attack (SQLi, XSS, CSRF, brute force) là phần tự học**: một slide card, mỗi attack 1 dòng "là gì" + 1 dòng fix + link PortSwigger/OWASP có lab miễn phí. Không mổ từng attack trên sân khấu.
- **Cắt khỏi bản gốc:** OAuth 1.0, PKCE chi tiết (chỉ 1 dòng), các grant type ngoài định nghĩa 1 dòng, chi tiết refresh token reuse detection (chỉ nhắc hậu quả ở 2.8), key rotation / JWKS, mTLS handshake / cấu hình service mesh, ABAC, SAML, Micronaut config, timing attack chi tiết, slide riêng cho từng attack.

---

## MỤC LỤC

0. Giới thiệu — AuthN vs AuthZ, 401 vs 403
1. Mật khẩu — lưu sao cho DB bị lộ cũng không sao
2. Giữ trạng thái đăng nhập — session cookie vs JWT, refresh token, thu hồi token, token để ở đâu
3. "Login with Google" — OAuth 2.0 qua ví dụ Claude, connector/MCP, grant types, OIDC, MFA
4. Service-to-service — Client Credentials, token M2M, GitHub Actions → AWS bằng OIDC
5. Phân quyền & attack — RBAC, ẩn nút ≠ phân quyền, IDOR, 4 attack để tự học
99. Cảm ơn + Kahoot

---

## 0. Giới thiệu

- **0.1 Vấn đề:** API `DELETE /users/42` không có kiểm tra gì → ai biết URL cũng xoá được. Mỗi request phải trả lời 2 câu hỏi.
- **Your turn (trước 0.2, hỏi mở):** "AuthN và AuthZ khác nhau chỗ nào? Cái nào chạy trước?" → AuthN = bạn là ai (password, OTP, Google); AuthZ = bạn được làm gì (viewer không được xoá user); AuthN luôn chạy trước.
- **0.2 AuthN vs AuthZ:** AuthN = *bạn là ai?* (password, OTP, Google). AuthZ = *bạn được làm gì?* (viewer không được xoá user). Ví von thẻ khách sạn: lễ tân kiểm CCCD (AuthN), thẻ phòng chỉ mở phòng 702 (AuthZ). AuthN luôn chạy trước.
- **0.3 401 vs 403:** `401 Unauthorized` = chưa biết bạn là ai (thực chất là "unauthenticated") → đi login. `403 Forbidden` = biết bạn là ai nhưng không cho → login lại cũng vô ích. Intern hay trả nhầm.
- **0.4 Auth nằm ở đâu trong một request:** browser → (cookie / `Authorization: Bearer …`) → middleware xác thực → handler kiểm quyền → DB. Map của cả bài: section 1–3 là AuthN của người dùng, section 4 là AuthN giữa các service, section 5 là AuthZ + attack.

## 1. Mật khẩu

- **1.1 Lưu plaintext:** bảng `users(email, password)` → một lần dump DB = lộ mọi password; người dùng xài lại password ở Gmail, ngân hàng. Không bao giờ lưu plaintext, kể cả "chỉ là môi trường dev".
- **Your turn (trước 1.2):** "Encryption vs hashing: khác nhau chỗ nào, password dùng cái nào?" → hash (nhưng không phải SHA-256).
- **1.2 Encryption ≠ hashing:** encryption 2 chiều (có key là giải được — key nằm cùng server với DB). Hashing 1 chiều: `hash("hunter2")` → không đảo ngược được. Login = hash lại input rồi so sánh. Password → **hash**, không encrypt.
- **1.3 Hash nhanh vẫn hỏng:** SHA-256/MD5 được thiết kế để *nhanh* → GPU thử ~10 tỷ lần/giây. Rainbow table: bảng tra sẵn `hash → password` cho password phổ biến. `123456` bị crack tức thì.
- **Your turn (trước 1.4):** "An và Bình cùng gõ `123456`, làm sao để 2 hash lưu trong DB khác nhau?" → thêm giá trị random cho mỗi user = salt.
- **1.4 Salt:** random string riêng cho từng user, lưu cạnh hash. Cùng password `123456` → 2 hash khác nhau → rainbow table vô dụng, crack 1 user không lộ user khác.
- **1.5 Hash chậm có chủ đích:** bcrypt / Argon2 có cost factor. bcrypt cost 12 ≈ 250 ms/lần — user không thấy, attacker thử 1 tỷ lần thì mất hàng trăm năm. bcrypt tự sinh salt, salt nằm sẵn trong chuỗi `$2b$12$…`.
- **1.6 Làm / Đừng làm:** dùng `bcrypt`/`argon2` của thư viện, không tự viết · so sánh bằng hàm `compare` của thư viện, không dùng `==` · không log password, không trả hash ra API · thông báo lỗi chung "Email hoặc mật khẩu không đúng" (không nói email có tồn tại hay không).

## 2. Giữ trạng thái đăng nhập

- **Your turn (trước 2.1):** "Login xong, request sau server biết vẫn là bạn bằng cách nào?" A nhớ IP · B gửi lại password · C gửi lại thứ server đưa lúc login → C: một "vé" (session cookie hoặc JWT). Câu hỏi này thay luôn slide "HTTP không nhớ gì".
- **2.1 Session cookie (stateful):** server tạo `session_id` random, lưu `{session_id → user_id}` trong DB/Redis, gửi `Set-Cookie: sid=…; HttpOnly; Secure; SameSite=Lax`. Browser tự gửi cookie lại. Logout = xoá dòng session → có hiệu lực ngay. Mở DevTools → Application → Cookies để thấy.
- **2.2 JWT (stateless, có decoder chạy trong browser):** 3 phần `header.payload.signature`, mỗi phần là base64url. Payload chứa `sub`, `role`, `exp`. Server ký bằng secret; request sau chỉ cần **kiểm chữ ký**, không cần tra DB. Dòng nhắc ngay trên slide: **không bao giờ** để password, số thẻ, CCCD, API key trong payload — ai cầm token cũng đọc được.
- **Your turn (trước 2.3):** "Không có secret, đọc được payload JWT không? Bằng cách nào?" → được: `atob()` phần giữa hoặc dán vào jwt.io. Secret chỉ chống *sửa*.
- **2.3 Sửa payload thì sao:** đổi `"role":"viewer"` → `"admin"` → chữ ký không khớp → `401`. Chữ ký chống *sửa*, không chống *đọc*. Bẫy đã từng xảy ra: server chấp nhận `alg: none` hoặc gọi `decode()` thay vì `verify()` → luôn verify bằng thư viện, chỉ định rõ thuật toán.
- **2.4 Session vs JWT:** bảng — lưu ở đâu · tra DB mỗi request · logout ngay lập tức · kích thước · phù hợp. Session: web app 1 backend, cần logout tức thì. JWT: nhiều service cần tự kiểm tra, mobile app. Nhược điểm lớn của JWT: **không thu hồi được trước `exp`** → cách thường làm: `exp` ngắn (15 phút) + refresh token mà server xoá được (dòng chuyển sang 2.5).
- **2.5 Access token + refresh token — ai lưu cái gì:** 2 card + bảng thời hạn + timeline. **Access token**: JWT, thường 5–15 phút, gửi mọi API call qua `Authorization: Bearer …`; server **không lưu gì**, chỉ kiểm signature + `exp` — đó là "stateless". **Refresh token**: chuỗi random (opaque), thường 7–30 ngày; server lưu **hash** trong bảng `refresh_tokens(user_id, token_hash, expires_at, revoked_at)` → có dòng nên xoá được; chỉ gửi tới `POST /auth/refresh`. Bảng (ghi "typical", là mặc định thường gặp, không phải chuẩn): access 5–15 phút, không lưu · refresh idle timeout ~7–14 ngày · refresh tối đa ~30–90 ngày rồi login lại · rotation: mỗi lần refresh trả refresh token mới, dòng cũ đánh dấu đã dùng · logout: xoá dòng refresh. Timeline `#s2-tl`: access token gia hạn mỗi 15 phút, logout cắt chuỗi (access đã phát vẫn chạy tới `exp`).
- **2.6 Bài toán thu hồi (có animation, 5 bước):** 1 · vấn đề: admin ban user hoặc user bấm "log out of all devices" → dòng refresh bị xoá, nhưng access JWT đang cầm vẫn chạy tới `exp` (tối đa 15 phút nữa); server không lưu gì về nó nên không có gì để xoá → 2 · A, chờ: giữ `exp` ngắn, chấp nhận khoảng hở; đủ cho đa số app → 3 · B, token version: bảng `users` thêm cột `token_version`, access token mang claim `"tv": 3`; "log out everywhere", đổi password, đổi role → tăng lên 4; mỗi request so `tv` với giá trị hiện tại, khác → `401` → 4 · C, denylist: mỗi token có `jti` (ID riêng của token); server giữ các `jti` đã thu hồi trong Redis tới `exp` → giết một token thay vì tất cả → 5 · đánh đổi: B và C thêm một lần tra mỗi request, JWT không còn stateless hoàn toàn → cache (Redis hoặc in-memory TTL ngắn). Claim tên `tv`, không dùng `tid` (Microsoft Entra ID dùng `tid` cho tenant ID).
- **Your turn (trước 2.7, hỏi mở):** "Access token hết hạn đúng lúc bạn đang gõ một tin nhắn dài. App phải làm gì để bạn không mất nó?" → refresh ngầm, hoặc gặp `401` thì refresh rồi gửi lại request; bản nháp vẫn nằm trên trang.
- **2.7 Hai cách refresh (2 làn song song, có step):** **Silent refresh** (chủ động): timer chạy ~1 phút trước `exp`, gọi `POST /auth/refresh` ngầm, user không thấy gì. **Refresh on 401** (bị động): API trả `401` → gọi `/auth/refresh` → gửi lại request gốc **một lần**; refresh cũng fail → về trang login. Chốt: đa số app làm cả hai — timer lo trường hợp bình thường, handler `401` lo laptop ngủ hay tab bị bỏ ở nền.
- **2.8 Cái bẫy: 5 request, 1 lần refresh (có animation):** trang gọi 5 API cùng lúc, cả 5 nhận `401`. Làm ngây thơ: 5 lần refresh; có rotation thì call 2–5 gửi refresh token đã dùng → server tưởng bị đánh cắp → logout user. Fix: **single-flight** — `401` đầu tiên bắt đầu refresh, các request khác chờ cùng một promise rồi retry. Slide có wrapper `fetch` ~11 dòng.
- **Your turn (trước 2.9):** "Token để ở đâu trên browser?" A `localStorage` · B cookie `HttpOnly` · C biến JavaScript → B, mặc định.
- **2.9 Lưu token ở đâu trên browser:** `localStorage` → bất kỳ script nào (kể cả script XSS) đọc được. Cookie `HttpOnly` → JavaScript không đọc được. Mặc định: cookie `HttpOnly; Secure; SameSite=Lax`. Đánh đổi: cookie tự gửi → CSRF, `SameSite` đóng phần lớn. XSS và CSRF có link tự học ở 5.4. Thêm một dòng phía browser: access token trong memory hoặc cookie `HttpOnly`; refresh token trong cookie `HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh` nên chỉ đi tới endpoint refresh. (Phía server đã nói ở 2.5, không lặp lại.)
- **2.10 Làm / Đừng làm:** verify (`jwt.verify` + `algorithms`) · payload (chỉ `sub`, `role`, `exp`) · storage (cookie `HttpOnly`) · lifetime (access 5–15 phút + refresh lưu dạng hash trên server, logout xoá dòng) · refresh (đừng để mỗi request tự refresh và retry mãi → một lần refresh dùng chung, retry một lần, rồi về login) · revoke (đừng lưu mọi access token vào DB → `exp` ngắn + `token_version` cho log out everywhere) · secret (`process.env.JWT_SECRET`, không commit).

## 3. "Login with Google"

Ví dụ xuyên suốt: **Claude**. Divider: "OAuth cho một app làm việc thay bạn; OIDC thêm *bạn là ai* lên trên."

- **3.1 Vấn đề — Claude không bao giờ hỏi password Google:** cách tệ: một ô chat "nhập password Gmail để mình đọc lịch". Có password là app đọc Gmail, xoá Drive, đổi số khôi phục; không thu hồi riêng một app được (đổi password = đăng xuất mọi nơi); database app bị lộ = Gmail bị lộ. Cách thật: nút **Connect** của connector Google Workspace trong Claude mở `accounts.google.com`, bạn login ở đó. Thứ mình muốn: chỉ đọc lịch · thu hồi theo từng app · password không bao giờ rời Google.
- **3.2 OAuth 2.0 — 4 vai:** You (resource owner) · Claude (client, có `client_id` + `client_secret`) · `accounts.google.com` (authorization server) · Gmail / Calendar / Drive API (resource server). Ví von chìa khoá valet: password là chìa chính, `access_token` với `scope=calendar.readonly` là chìa valet — chỉ nổ máy, hết hạn, thu hồi được.
- **3.3 Authorization Code flow · "Connect" (có animation, 5 bước):** Claude redirect sang Google kèm `state` → bạn login trên trang Google + đọc consent screen (liệt kê `calendar.readonly`) → bấm Allow → về claude.ai với `code` (dùng một lần, vài phút) → backend Claude đổi `code` + `client_secret` lấy `access_token` → gọi Calendar API. Password chỉ đi tới Google; `client_secret` chỉ ở backend. "Claude chỉ thấy những gì tài khoản Google của bạn thấy, và chỉ phần bạn cho phép." SPA / mobile / MCP client không giấu được secret → thêm **PKCE** (1 dòng; mọi MCP client bắt buộc dùng).
- **3.4 Cùng một flow cho mọi connector:** Notion, Slack, GitHub, Atlassian và mọi remote MCP server chạy đúng 5 bước của 3.3, mỗi cái có token riêng. Slide cho xem request `GET /authorize?…&code_challenge=…&resource=https://mcp.notion.com/mcp`. Theo MCP authorization spec (2025-06-18): **OAuth 2.1** (code flow, bỏ các grant cũ rủi ro) · **PKCE bắt buộc** (code bị đánh cắp cũng vô dụng) · token xin cho **đúng một server** (`resource=…`) · server đó **phải từ chối token làm cho ai khác** → tiền đề cho `aud` ở section 4 · thu hồi theo từng app: Google Account → third-party connections, Notion → Settings → Connections, hoặc Disconnect trong Claude. Không khẳng định Claude gửi được email hay không.
- **3.5 OAuth có vài grant type — chọn theo ai đang xin (chỉ định nghĩa, không đi vào flow):** bảng 1 dòng mỗi loại + ví dụ thật: **Authorization Code** (Claude connector Google, 3.3) · **Authorization Code + PKCE** (SPA, mobile, mọi MCP client, 3.4) · **Client Credentials** (service tự login, không có user: Orders → Payments, section 4) · **Device Authorization** (thiết bị không bàn phím hiện mã, duyệt trên điện thoại: YouTube trên smart TV, `gh auth login`) · **Refresh Token** (đổi lấy access token mới, khỏi login lại). Hàng mờ "legacy, avoid": **Implicit** (token về trong URL, deprecated) · **Resource Owner Password** (app tự thu password — đúng anti-pattern của 3.1, bị bỏ trong OAuth 2.1). Link: auth0.com/intro-to-iam/what-is-oauth-2.
- **3.6 "Login with Google" = OIDC + OAuth — cùng Claude, hai nút:** *Connect Google Calendar* trong Claude = **chỉ OAuth** → `access_token`: Claude được đọc lịch, không nói gì về bạn là ai. *Continue with Google* trên trang login claude.ai = **OIDC trên nền OAuth** → cùng code flow + `scope=openid email profile` → Google trả thêm **`id_token`** (JWT: `iss`, `sub`, `email`, `aud` = `client_id` của Claude, `exp`) — đó mới là thứ login bạn. Đừng login user bằng `access_token` · verify signature + `iss` + `aud` + `exp` (thư viện làm cả 4) · lưu user theo `sub`, không theo email. Một dòng: OIDC cũng chạy được không cần người — GitHub → AWS ở section 4.
- **3.7 MFA:** 3 loại yếu tố — biết (password) · có (điện thoại, security key) · là (vân tay). 2 yếu tố *khác loại*. TOTP (Google Authenticator, mã 6 số đổi mỗi 30 s, mặc định tốt) · SMS OTP (tiện nhưng yếu nhất: SIM swap) · Passkey (không có gì để phishing, mạnh nhất). MFA là chuyện của AuthN: với "Continue with Google" trên claude.ai, Google hỏi yếu tố thứ hai, Claude chỉ nhận `id_token`.
- **3.8 Làm / Đừng làm:** provider (redirect sang Google + SDK như Claude làm; Auth0 / Keycloak / Cognito, không tự build OAuth server) · secret (`client_secret` chỉ ở backend, đọc từ env) · scope (`calendar.readonly`, nhỏ nhất mà đủ) · callback (kiểm `state` khớp) · identity (verify `id_token`, lưu theo `sub`).

## 4. Service-to-service

Ví dụ xuyên suốt: **Orders service gọi Payments service** — không có user, không có browser. Divider: "Không user, không browser, không form login. Service vẫn phải chứng minh mình là ai."

- **4.1 Ai đang gọi? — trong cluster, pod nào cũng gọi được Payments:** sơ đồ Frontend → Orders → Inventory / Payments; một pod bị chiếm gọi `POST /charges` → `201`, không ai kiểm danh tính. Vì sao section 2–3 không áp dụng: không browser nên không cookie, không người nên không ai gõ password, Orders chạy lúc 3 giờ sáng, không ai bấm Allow. Thứ mình muốn: mỗi service có danh tính riêng, Payments kiểm trên mọi call.
- **Your turn (trước 4.2, hỏi mở):** "Orders gọi Payments, không có user. Làm sao Payments biết người gọi đúng là Orders?" → cho Orders danh tính riêng, đổi nó lấy một token ngắn hạn mà Payments kiểm được.
- **4.2 API key dùng chung chạy được cho tới khi bị lộ:** bảng static API key (`X-Api-Key: sk_live_8f2a…` — không bao giờ hết hạn, cùng một key dán khắp service, mở được mọi thứ, lộ là dùng mãi) vs **Client Credentials** (`Authorization: Bearer` JWT, hết hạn sau 5 phút, `sub: orders-service`, `scope: payments.charge`, lộ thì 5 phút là vô dụng). Ý tưởng: Orders giữ `client_id` + `client_secret`, chỉ đưa cho auth server, nhận lại token ngắn hạn có scope.
- **4.3 Client Credentials flow — Orders tự login và nhận token 5 phút (có animation):** 0 · đăng ký một lần → 1 · `POST /oauth/token` (`grant_type=client_credentials`, `client_id=orders-service`, `client_secret` lấy từ secret manager, `scope=payments.charge`) → 2 · `{access_token, token_type: Bearer, expires_in: 300}` → 3 · `POST /charges` với `Authorization: Bearer …`, cache token tới khi hết hạn. Payments tự kiểm token, không gọi lại auth server. "Cùng OAuth của section 3, bớt đi user" — chính là grant Client Credentials ở 3.5.
- **4.4 Trong token có gì:** payload decode — `iss` (auth server, Payments chỉ tin auth server của mình) · `sub: orders-service` (ai gọi, tên service không phải user) · `aud: payments-service` (gửi cho ai) · `scope: payments.charge` (được làm gì) · `exp` (300 s sau `iat`). Cùng JWT của section 2: ai cũng đọc được, không để bí mật bên trong.
- **Your turn (trước 4.5, A/B):** "Payments nhận token ký đúng, nhưng `aud` là `inventory-service`. Nhận không?" A có, chữ ký hợp lệ · **B không**, token làm cho người khác → token đánh cắp từ Inventory không được chạy trên Payments; kiểm `aud` mọi request.
- **4.5 Validate rồi mới authorize:** bước 1 **validate** — signature khớp public key của auth server, `iss`, `aud = payments-service`, `exp` → sai bất kỳ cái nào → `401`. Bước 2 **authorize** — scope → endpoint: `payments.charge` → `POST /charges`, `payments.read` → `GET /charges/*`; token hợp lệ nhưng sai scope → `403`. Gọi lại 0.3: 401 = chưa biết bạn là ai, 403 = biết rồi, vẫn không.
- **Your turn (trước 4.6, hỏi mở):** "GitHub Action của bạn deploy lên AWS. AWS key cất ở đâu?" → **không ở đâu cả**: GitHub chứng minh repo + branch đang chạy bằng OIDC token, AWS đổi nó lấy credentials hết hạn sau ~1 giờ.
- **4.6 GitHub Actions → AWS bằng OIDC — deploy không cần key lưu sẵn (có animation):** 0 · push lên `main` → 1 · workflow xin GitHub một **OIDC token** (`permissions: id-token: write`; issuer `token.actions.githubusercontent.com`, `aud: sts.amazonaws.com`, `sub: repo:spartan/shop:ref:refs/heads/main`) → 2 · `aws-actions/configure-aws-credentials` gửi token tới AWS STS, xin role `deploy` (`role-to-assume`) → 3 · STS kiểm trust policy (issuer + `aud` + `sub` = đúng repo, đúng branch; fork hay branch khác → bị từ chối) → credentials tạm ~1 giờ → 4 · deploy (`aws s3 sync`). Slide có workflow YAML và 2 điều kiện của trust policy. Kết quả: không có `AWS_ACCESS_KEY_ID` trong GitHub secrets — không có gì để lộ, không có gì để rotate. Link: GitHub docs "Configuring OpenID Connect in Amazon Web Services".
- **4.7 Các cách khác (chỉ khái niệm, 3 card):** **mTLS** (cả hai bên trình certificate; danh tính được kiểm lúc mở kết nối; giá: phải cấp và gia hạn cert cho mọi service) · **service mesh** — Istio, Linkerd (sidecar làm mTLS hộ, code vẫn gọi HTTP thường; hợp khi nhiều service + có platform team; thêm một hệ thống phải vận hành) · **API key** (ổn cho API bên thứ ba như Stripe, SendGrid, Google Maps; cất trong secret manager, mỗi env một key; không dùng cho service của mình). Câu mental model: OAuth = cách lấy token · JWT = token trông thế nào · policy của Payments = bạn được làm gì. Không demo handshake.
- **4.8 Làm / Đừng làm:** secret (không hardcode `client_secret` → secret manager, rotate) · lifetime (API key vĩnh viễn → `expires_in: 300`, cache tới khi hết hạn) · audience (nhận mọi token ký đúng → `aud === "payments-service"`, không thì 401) · scope (`scope: admin` → `payments.charge`, `payments.read`, không thì 403) · identity (mọi service chung một client → mỗi service một `client_id`, log `sub`) · keys in CI (`AWS_ACCESS_KEY_ID` trong repo secrets → OIDC role theo repo + branch, credentials 1 giờ).

## 5. Phân quyền & attack

Divider: "Ai được làm gì, và bốn attack kinh điển để tự học."

- **5.1 RBAC:** user → role → permission. `viewer: orders:read` · `editor: + orders:write` · `admin: + orders:delete`. Bảng nằm ở một chỗ (config hoặc bảng DB). Code kiểm *permission*, không kiểm tên role (`can(user, "orders:delete")`, không `if role == "admin"`) — thêm role `support` là sửa một dòng, không phải 40 câu `if`.
- **Your turn (trước 5.2, hỏi mở):** "Nút Delete đã ẩn với viewer, API có an toàn không? Kiểm tra bằng cách nào?" → không: tự gửi `DELETE` bằng curl với cookie của viewer; curl không thấy UI.
- **5.2 Ẩn nút ≠ phân quyền:** frontend ẩn nút Delete (`{user.role === "admin" && <DeleteButton />}`) nhưng API vẫn nhận → `curl -X DELETE …/orders/1024` với cookie viewer → `204`. Fix ở server: `requirePermission("orders:delete")` → `403`. Mọi kiểm tra quyền phải ở backend, mọi request.
- **5.3 Broken Access Control (OWASP #1):** `GET /orders/1024` → đổi thành `/orders/1025` thấy đơn của người khác (IDOR). Fix: `WHERE id = ? AND user_id = ?` với `req.user.id`, không có dòng → `404`. Lấy user từ session, không từ body. UUID khó đoán hơn nhưng không phải fix.
- **5.4 Bốn attack để tự học (2×2 card, không có step):** mỗi card 1 dòng "là gì" + 1 dòng fix + 2 link (PortSwigger Web Security Academy + OWASP Cheat Sheet):
  - **SQL injection:** input nối vào SQL bằng `+` thành một phần của query (`' OR '1'='1` login vào bằng ai cũng được) → `db.query("… WHERE email = ?", [email])`.
  - **XSS:** trang render text của user thành HTML → `<script>` của attacker chạy trên browser mọi người đọc → để framework escape (`{comment.text}`), không `innerHTML` với text của user.
  - **CSRF:** site khác submit form tới API, browser tự gắn cookie → `SameSite=Lax` + CSRF token trong mọi form.
  - **Brute force & credential stuffing:** bot thử hàng triệu password, hoặc cặp email + password lộ từ site khác → rate-limit login (vd. 5 lần / phút theo account và IP) + MFA.
  - Dòng cuối: bắt đầu từ OWASP Top 10 · PortSwigger Web Security Academy (lab miễn phí).
- **5.5 Checklist mang về:** 10 dòng gộp các slide "Làm / Đừng làm" — password ×2 · token ×3 · oauth · authz ×2 · attack ("SQLi, XSS, CSRF, brute force: làm theo link ở 5.4") · service ("mỗi service một `client_id`, kiểm `aud` và `scope` mọi call").

## 99. Cảm ơn + Kahoot

- QR Kahoot + PIN gõ trên sân khấu (giống repo load-balancer).
- Bộ 12 câu mức Intern trong `presentation/notes/kahoot-questions.md` (lấy và đơn giản hoá từ `checkpoint-quiz.md` của repo gốc), có 2 câu service-to-service.

> **Không có demo live** ở bản Intern; các flow (2.6, 2.8, 3.3, 4.3, 4.6) là animation ngay trong slide.
