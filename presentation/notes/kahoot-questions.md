# Kahoot — Authentication & Authorization (Intern)

12 câu, mức easy → medium, bám theo `presentation/auth-outline.md` (section 0–5). Không có câu nào hỏi về các chủ đề đã cắt (OAuth 1.0, PKCE chi tiết, refresh token rotation, JWKS, mTLS/mesh chi tiết, ABAC, SAML…), và không hỏi SQLi / XSS / CSRF vì 5.4 để chúng làm phần tự học.

## Cách đưa vào Kahoot

**Cách 1: nhập tay.** kahoot.com → **Create** → **Kahoot** → với mỗi câu bên dưới: **Add question → Quiz**, dán câu hỏi, điền 4 đáp án theo đúng thứ tự A–D, tick đáp án ✅, chọn time limit.

**Cách 2: import spreadsheet.** Trong trình soạn kahoot → **Add question → Import spreadsheet** → tải template `.xlsx` của Kahoot. Template có các cột: `Question` · `Answer 1` · `Answer 2` · `Answer 3` · `Answer 4` · `Time limit (sec)` · `Correct answer(s)` (số 1–4). Dán khối CSV ở cuối file vào template (Excel/Google Sheets: Data → Split text to columns, dấu phẩy), lưu lại `.xlsx` rồi upload.

Giới hạn Kahoot đã kiểm: câu hỏi ≤ 120 ký tự, mỗi đáp án ≤ 75 ký tự, 4 đáp án, 20 s (30 s cho câu có đoạn code). Vị trí đáp án đúng được trộn, không dồn vào một ô.

---

## 0. Giới thiệu

### Q1 · 20 s

**Hotel: the front desk checks your ID card. Your key card opens only room 702. The key card is…**

- A. Authentication: proving who you are
- B. Authorization: what you are allowed to do ✅
- C. Both at the same time
- D. Neither, it's just a door lock

> **Giải thích:** Lễ tân kiểm CCCD là AuthN (bạn là ai); thẻ phòng chỉ mở phòng 702 là AuthZ (bạn được làm gì). AuthN luôn chạy trước.

### Q2 · 20 s

**You're logged in as a viewer and call DELETE /users/42. Viewers can't delete users. Right status code?**

- A. 401 Unauthorized
- B. 400 Bad Request
- C. 403 Forbidden ✅
- D. 200 OK

> **Giải thích:** Server đã biết bạn là ai nhưng không cho phép → 403. 401 là khi chưa biết bạn là ai; login lại cũng không đổi được 403.

## 1. Mật khẩu

### Q3 · 20 s

**Your users table has a column password = 'hunter2'. How should passwords be stored instead?**

- A. Encrypted with AES, key kept on the same server
- B. Hashed with bcrypt or Argon2 ✅
- C. Hashed with SHA-256, it's one-way
- D. Base64-encoded

> **Giải thích:** Password phải hash bằng hàm chậm có chủ đích như bcrypt/Argon2. AES giải được nếu có key; SHA-256 quá nhanh, GPU thử hàng tỷ lần/giây; Base64 ai cũng decode được.

### Q4 · 20 s

**Two users both pick the password 123456. With bcrypt, their stored hashes are…**

- A. Identical, same password gives same hash
- B. Different, each user gets a random salt ✅
- C. Identical, unless the cost factor differs
- D. Empty, bcrypt doesn't store anything

> **Giải thích:** bcrypt tự sinh salt ngẫu nhiên cho từng user (nằm sẵn trong chuỗi $2b$12$…), nên cùng password vẫn ra hash khác → rainbow table vô dụng.

## 2. Session & JWT

### Q5 · 20 s

**Set-Cookie: sid=abc; ___ ; Secure; SameSite=Lax. Which flag stops JavaScript from reading the cookie?**

- A. HttpOnly ✅
- B. Path=/
- C. Max-Age=3600
- D. Domain=example.com

> **Giải thích:** HttpOnly làm cho JavaScript (kể cả script XSS) không đọc được cookie. Đây là lý do mặc định lưu token trong cookie HttpOnly thay vì localStorage (2.5).

### Q6 · 30 s

**You edit the JWT payload "role":"viewer" to "admin" and keep the old signature. Server replies?**

- A. 200 OK, you're admin now
- B. 401, the signature no longer matches ✅
- C. 403, viewers can't edit tokens
- D. 500, the token can't be parsed

> **Giải thích:** Server tính lại HMAC từ header + payload mới bằng secret → khác chữ ký cũ → 401 (2.3). Muốn giả được phải có secret, nên secret lộ = mọi thứ lộ.

## 3. Login with Google

### Q7 · 20 s

**Claude wants to read your Google Calendar. What's the right way to give it access?**

- A. Type your Google password into the Claude chat
- B. Email Claude an export of your calendar
- C. Share your Google session cookie with Claude
- D. Get redirected to Google, log in there, click Allow ✅

> **Giải thích:** Đó là OAuth 2.0, nút "Connect" của connector (3.1–3.3): password chỉ đi tới Google, Claude chỉ nhận quyền một phần (scope=calendar.readonly) và bạn thu hồi riêng được, như chìa khoá valet.

### Q8 · 20 s

**In "Login with Google" (OIDC), which token tells your app WHO the user is?**

- A. access_token
- B. id_token ✅
- C. client_secret
- D. The authorization code

> **Giải thích:** OAuth là authorization: access_token chỉ nói "app được đọc lịch". OIDC thêm id_token, một JWT có sub, email, aud → đó mới là login (3.6).

## 4. Service-to-service

### Q9 · 20 s

**Orders calls Payments at 3 a.m. No user, no browser. Which OAuth grant type fits?**

- A. Client Credentials ✅
- B. Authorization Code + PKCE
- C. Device Authorization
- D. Implicit

> **Giải thích:** Không có user thì service tự login bằng client_id + client_secret và nhận token ngắn hạn: Client Credentials (3.5, 4.3). Authorization Code / Device cần một người bấm Allow; Implicit là legacy.

### Q10 · 20 s

**Payments gets a validly signed token, but its aud is inventory-service. What should Payments do?**

- A. Accept it, the signature is valid
- B. Accept it if the scope is payments.charge
- C. Reject it with 401, it was made for another service ✅
- D. Forward it to Inventory

> **Giải thích:** Signature đúng chỉ nói "auth server làm ra nó", không nói "nó dành cho mình". aud phải là payments-service, nếu không → 401; token đánh cắp từ Inventory không được chạy trên Payments (4.4–4.5).

### Q11 · 20 s

**Your GitHub Action deploys to AWS. Where should the AWS access keys be stored?**

- A. In the repo's GitHub secrets
- B. Hardcoded in the workflow YAML
- C. In a .env file committed to the repo
- D. Nowhere: GitHub's OIDC token is traded for 1-hour AWS credentials ✅

> **Giải thích:** GitHub ký một OIDC token nói repo + branch nào đang chạy; AWS STS kiểm trust policy rồi trả credentials ~1 giờ. Không có AWS_ACCESS_KEY_ID nào để lộ hay rotate (4.6).

## 5. Phân quyền

### Q12 · 20 s

**GET /orders/1024 shows your order. Changing it to /orders/1025 shows a stranger's order. What's the fix?**

- A. Hide the order ID in the frontend
- B. Check that the user is logged in
- C. Query WHERE id = ? AND user_id = ? ✅
- D. Return 500 when the ID is wrong

> **Giải thích:** Đây là Broken Access Control (IDOR), OWASP #1 (5.3). Đã login chưa đủ: phải kiểm quyền sở hữu ngay trong query, ở backend.

---

## CSV cho template import của Kahoot

```csv
Question,Answer 1,Answer 2,Answer 3,Answer 4,Time limit (sec),Correct answer(s)
Hotel: the front desk checks your ID card. Your key card opens only room 702. The key card is…,Authentication: proving who you are,Authorization: what you are allowed to do,Both at the same time,"Neither, it's just a door lock",20,2
You're logged in as a viewer and call DELETE /users/42. Viewers can't delete users. Right status code?,401 Unauthorized,400 Bad Request,403 Forbidden,200 OK,20,3
Your users table has a column password = 'hunter2'. How should passwords be stored instead?,"Encrypted with AES, key kept on the same server",Hashed with bcrypt or Argon2,"Hashed with SHA-256, it's one-way",Base64-encoded,20,2
"Two users both pick the password 123456. With bcrypt, their stored hashes are…","Identical, same password gives same hash","Different, each user gets a random salt","Identical, unless the cost factor differs","Empty, bcrypt doesn't store anything",20,2
Set-Cookie: sid=abc; ___ ; Secure; SameSite=Lax. Which flag stops JavaScript from reading the cookie?,HttpOnly,Path=/,Max-Age=3600,Domain=example.com,20,1
"You edit the JWT payload ""role"":""viewer"" to ""admin"" and keep the old signature. Server replies?","200 OK, you're admin now","401, the signature no longer matches","403, viewers can't edit tokens","500, the token can't be parsed",30,2
Claude wants to read your Google Calendar. What's the right way to give it access?,Type your Google password into the Claude chat,Email Claude an export of your calendar,Share your Google session cookie with Claude,"Get redirected to Google, log in there, click Allow",20,4
"In ""Login with Google"" (OIDC), which token tells your app WHO the user is?",access_token,id_token,client_secret,The authorization code,20,2
"Orders calls Payments at 3 a.m. No user, no browser. Which OAuth grant type fits?",Client Credentials,Authorization Code + PKCE,Device Authorization,Implicit,20,1
"Payments gets a validly signed token, but its aud is inventory-service. What should Payments do?","Accept it, the signature is valid",Accept it if the scope is payments.charge,"Reject it with 401, it was made for another service",Forward it to Inventory,20,3
Your GitHub Action deploys to AWS. Where should the AWS access keys be stored?,In the repo's GitHub secrets,Hardcoded in the workflow YAML,In a .env file committed to the repo,Nowhere: GitHub's OIDC token is traded for 1-hour AWS credentials,20,4
GET /orders/1024 shows your order. Changing it to /orders/1025 shows a stranger's order. What's the fix?,Hide the order ID in the frontend,Check that the user is logged in,Query WHERE id = ? AND user_id = ?,Return 500 when the ID is wrong,20,3
```
