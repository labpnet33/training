var e={id:`auth-basic-token`,h:{en:`Authentication: basic, API keys and bearer tokens`,hi:`Authentication: basic, API keys aur bearer tokens`},body:{en:`
<p>At an office gate the guard asks two different questions. First: "Who are you?" You show your ID card. Second: "Are you allowed into the server room?" The guard checks a list. The first is <b>authentication</b> (prove your identity). The second is <b>authorization</b> (what you may do). APIs ask both, and they answer with two different status codes: <b>401 Unauthorized</b> really means "I do not know who you are" (authentication failed), and <b>403 Forbidden</b> means "I know who you are, but you may not do this" (authorization failed). This chapter covers the first half of exam topic 2.3: API types and authentication.</p>

<h3>Method 1: Basic authentication</h3>
<p>The client sends <code>Authorization: Basic &lt;base64 of user:password&gt;</code> on <b>every</b> request. Base64 is only a way of writing bytes as text. It is <b>not encryption</b>: anyone can decode it in a second.</p>
<pre class="code">$ printf 'netops:NK@2026' | base64
bmV0b3BzOk5LQDIwMjY=
Authorization: Basic bmV0b3BzOk5LQDIwMjY=</pre>
<p>Basic authentication is simple and is what RESTCONF on IOS XE uses, but it is safe only over HTTPS, and it sends the real password with every call. In the lab you write it as <code>-u netops:NK@2026</code>; in Python as <code>auth=("netops", "NK@2026")</code>. When credentials are missing the server answers 401 and a header <code>WWW-Authenticate: Basic realm="restconf"</code> that tells the client which scheme to use.</p>
<pre class="out">HTTP/1.1 <span class="hl">401 Unauthorized</span>
WWW-Authenticate: Basic realm="restconf"
"error-message": "authentication required (no credentials supplied)"</pre>

<h3>Method 2: API key</h3>
<p>An <b>API key</b> is a long random string issued to <i>an application or a person</i> from the provider's dashboard. It is sent in a header, for example <code>X-Api-Key: 9c1f...</code> (Meraki accepts its key in a header too). It identifies the caller and usually carries fixed permissions. Problems: it does not expire unless you rotate it, and if it is copied into a URL as a query parameter (<code>?api_key=...</code>) it ends up in server logs and browser history. <b>Prefer a header.</b></p>

<h3>Method 3: Token (bearer) authentication</h3>
<p>The client logs in <b>once</b> with a username and password and receives a short-lived <b>token</b>. It then sends the token instead of the password: <code>Authorization: Bearer &lt;token&gt;</code> ("bearer" = whoever bears this token is let in, so guard it like a password). Tokens expire, can be revoked, and can be limited to certain actions. Catalyst Center works this way: you POST to its authentication endpoint with basic auth and get a token back, which you send in a header (<code>X-Auth-Token</code>) on later calls. Cisco ACI hands out a session cookie after a login call in the same idea.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Token authentication flow">
<rect x="20" y="30" width="130" height="60" rx="8" fill="#bae6fd"/><text x="85" y="66" text-anchor="middle" class="svg-ink" font-size="14">Client</text>
<rect x="490" y="30" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="555" y="66" text-anchor="middle" class="svg-ink" font-size="14">API server</text>
<line x1="150" y1="48" x2="490" y2="48" stroke="#64748b" stroke-width="2"/><text x="320" y="42" text-anchor="middle" class="svg-accent" font-size="12">1  POST /login (user + password)</text>
<line x1="490" y1="72" x2="150" y2="72" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="88" text-anchor="middle" class="svg-accent" font-size="12">2  200 {"token": "abc...", "expires_in": 3600}</text>
<line x1="150" y1="125" x2="490" y2="125" stroke="#64748b" stroke-width="2"/><text x="320" y="119" text-anchor="middle" class="svg-accent" font-size="12">3  GET /devices  Authorization: Bearer abc...</text>
<line x1="490" y1="150" x2="150" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="166" text-anchor="middle" class="svg-accent" font-size="12">4  200 + data</text>
<text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="12">After expiry: 401 again. Log in again (or use the refresh token).</text>
</svg><p class="cap">The password travels once. Every later call carries only the token.</p></div>
<p>Reference snippet (not a lab device) of the whole flow in Python, with the token kept in an environment variable and never in the script:</p>
<pre class="code">import os, requests
BASE = "h&#116;tps://api.example/v2"

# 1. log in once (basic auth), receive a token
r = requests.post(BASE + "/login", auth=(os.environ["API_USER"], os.environ["API_PASS"]), timeout=10)
r.raise_for_status()
token = r.json()["token"]

# 2. use the token on every later call
headers = {"Authorization": "Bearer " + token, "Accept": "application/json"}
r = requests.get(BASE + "/devices", headers=headers, timeout=10)
if r.status_code == 401:
    print("token expired: log in again")</pre>

<div class="tbl"><table class="cmp"><tr><th></th><th>Basic</th><th>API key</th><th>Bearer token</th></tr>
<tr><td>Sent as</td><td>Authorization: Basic ...</td><td>Header such as X-Api-Key</td><td>Authorization: Bearer ...</td></tr>
<tr><td>Lifetime</td><td>As long as the password</td><td>Until rotated</td><td>Short (minutes to hours)</td></tr>
<tr><td>Password sent each call</td><td>Yes</td><td>No</td><td>No (only at login)</td></tr>
<tr><td>Typical network use</td><td>RESTCONF on a router</td><td>Meraki-style cloud dashboards</td><td>Catalyst Center, cloud services, OAuth 2.0</td></tr></table></div>

<h3>Rules for keeping secrets</h3>
<ul>
<li>Always use HTTPS. Basic auth and tokens over plain HTTP are readable by anyone on the path.</li>
<li>Never hard-code passwords, keys or tokens in scripts or Git. Read them from environment variables or a secrets store.</li>
<li>Give each script its own account or key with the least privilege it needs, so you can revoke one without breaking the rest.</li>
<li>Never print tokens in logs. Print the first four characters at most.</li>
<li>Rotate keys regularly, and immediately if one may have leaked.</li>
</ul>
<p>The lab scripts set <code>verify=False</code> because the lab routers use self-signed certificates. In production you keep verification on and trust your company's certificate authority instead.</p>

<div class="warn"><p><b>Common mistakes.</b> Calling base64 "encrypted"; pasting a real token into a chat or ticket; treating every 401 as "wrong password" when the token simply expired; putting the key in the URL; using an admin-level account for a read-only report.</p></div>
<div class="exam"><p><b>Exam trap.</b> 401 = authentication failed or missing (who are you?). 403 = authenticated but not authorized (you may not). In Lab 1 the account <code>viewer</code> logs in correctly but has privilege 5, and the router answers 403 because API users need privilege 15.</p></div>

<div class="scn"><h4>Token expired at 02:00</h4><p>A nightly backup job logged in at 01:30 and saved the token in a variable. At 02:00 the token (30-minute life) expired, and the remaining 60 devices all returned 401. The log looked like a mass credential failure, and the on-call engineer wasted time resetting passwords. The fix: on a 401, log in again once and retry the request; and log "token expired" separately from "bad password".</p><p><b>Lesson:</b> 401 has more than one cause. Read the error message and think about token lifetime.</p></div>

<div class="iv"><p class="q">"What is the difference between 401 and 403?"</p><p>401 means the server could not authenticate the caller: credentials are missing, wrong or expired. 403 means the caller is known but not permitted to perform this action. The fix for 401 is to correct or refresh the credentials; the fix for 403 is to use an account with the right permissions (or change the policy). Mention the router example: a privilege 5 user gets 403, a wrong password gets 401.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Authentication = who are you (401). Authorization = what may you do (403).</li>
<li>Basic auth is base64, not encryption: use HTTPS only. API keys go in a header, not the URL.</li>
<li>Bearer tokens are obtained once, expire, and are sent as Authorization: Bearer.</li>
<li>Keep secrets in environment variables, never in code or Git; use least privilege.</li>
<li>On 401 with a token, suspect expiry: log in again and retry once.</li>
</ul></div>
`,hi:`
<p>Office ke gate par guard do alag sawaal poochta hai. Pehla: "Aap kaun ho?" Aap ID card dikhate ho. Doosra: "Kya aapko server room mein jaane ki ijazat hai?" Guard list check karta hai. Pehla hai <b>authentication</b> (apni pehchaan saabit karo). Doosra hai <b>authorization</b> (aap kya kar sakte ho). APIs dono poochti hain, aur do alag status codes se jawab deti hain: <b>401 Unauthorized</b> ka asli matlab "main nahi jaanta aap kaun ho" (authentication fail), aur <b>403 Forbidden</b> ka matlab "main jaanta hoon aap kaun ho, par aap yeh nahi kar sakte" (authorization fail). Yeh chapter exam topic 2.3: API types aur authentication ka pehla hissa cover karta hai.</p>

<h3>Method 1: Basic authentication</h3>
<p>Client <b>har</b> request par <code>Authorization: Basic &lt;base64 of user:password&gt;</code> bhejta hai. Base64 sirf bytes ko text mein likhne ka tareeka hai. Yeh <b>encryption nahi</b> hai: koi bhi ek second mein decode kar sakta hai.</p>
<pre class="code">$ printf 'netops:NK@2026' | base64
bmV0b3BzOk5LQDIwMjY=
Authorization: Basic bmV0b3BzOk5LQDIwMjY=</pre>
<p>Basic authentication simple hai aur IOS XE par RESTCONF yahi use karta hai, par yeh sirf HTTPS par safe hai, aur har call ke saath asli password bhejta hai. Lab mein aap ise <code>-u netops:NK@2026</code> likhte ho; Python mein <code>auth=("netops", "NK@2026")</code>. Credentials missing hon to server 401 aur <code>WWW-Authenticate: Basic realm="restconf"</code> header deta hai jo client ko batata hai ki kaunsi scheme use karni hai.</p>
<pre class="out">HTTP/1.1 <span class="hl">401 Unauthorized</span>
WWW-Authenticate: Basic realm="restconf"
"error-message": "authentication required (no credentials supplied)"</pre>

<h3>Method 2: API key</h3>
<p><b>API key</b> ek lambi random string hai jo provider ke dashboard se <i>kisi application ya insaan</i> ko di jaati hai. Yeh header mein bheji jaati hai, jaise <code>X-Api-Key: 9c1f...</code> (Meraki bhi apni key header mein leta hai). Yeh caller ko identify karti hai aur aam taur par fixed permissions rakhti hai. Problems: rotate na karo to expire nahi hoti, aur agar URL mein query parameter (<code>?api_key=...</code>) ke roop mein copy ho jaaye to server logs aur browser history mein pahunch jaati hai. <b>Header ko prefer karo.</b></p>

<h3>Method 3: Token (bearer) authentication</h3>
<p>Client <b>ek baar</b> username aur password se login karta hai aur chhoti umar ka <b>token</b> paata hai. Phir password ki jagah token bhejta hai: <code>Authorization: Bearer &lt;token&gt;</code> ("bearer" = jo bhi yeh token rakhta hai use andar aane diya jaata hai, isliye ise password ki tarah sambhalo). Tokens expire hote hain, revoke ho sakte hain, aur kuch actions tak limit kiye ja sakte hain. Catalyst Center aise kaam karta hai: aap basic auth ke saath uske authentication endpoint par POST karte ho aur token milta hai, jo aap baad ki calls mein header (<code>X-Auth-Token</code>) mein bhejte ho. Cisco ACI isi idea mein login call ke baad session cookie deta hai.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Token authentication flow">
<rect x="20" y="30" width="130" height="60" rx="8" fill="#bae6fd"/><text x="85" y="66" text-anchor="middle" class="svg-ink" font-size="14">Client</text>
<rect x="490" y="30" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="555" y="66" text-anchor="middle" class="svg-ink" font-size="14">API server</text>
<line x1="150" y1="48" x2="490" y2="48" stroke="#64748b" stroke-width="2"/><text x="320" y="42" text-anchor="middle" class="svg-accent" font-size="12">1  POST /login (user + password)</text>
<line x1="490" y1="72" x2="150" y2="72" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="88" text-anchor="middle" class="svg-accent" font-size="12">2  200 {"token": "abc...", "expires_in": 3600}</text>
<line x1="150" y1="125" x2="490" y2="125" stroke="#64748b" stroke-width="2"/><text x="320" y="119" text-anchor="middle" class="svg-accent" font-size="12">3  GET /devices  Authorization: Bearer abc...</text>
<line x1="490" y1="150" x2="150" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="166" text-anchor="middle" class="svg-accent" font-size="12">4  200 + data</text>
<text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="12">Expiry ke baad: phir 401. Dobara login karo (ya refresh token).</text>
</svg><p class="cap">Password sirf ek baar jaata hai. Baad ki har call mein sirf token hota hai.</p></div>
<p>Poore flow ka reference snippet (lab device nahi) Python mein, token environment variable mein, script mein kabhi nahi:</p>
<pre class="code">import os, requests
BASE = "h&#116;tps://api.example/v2"

# 1. ek baar login (basic auth), token milega
r = requests.post(BASE + "/login", auth=(os.environ["API_USER"], os.environ["API_PASS"]), timeout=10)
r.raise_for_status()
token = r.json()["token"]

# 2. baad ki har call par token use karo
headers = {"Authorization": "Bearer " + token, "Accept": "application/json"}
r = requests.get(BASE + "/devices", headers=headers, timeout=10)
if r.status_code == 401:
    print("token expired: log in again")</pre>

<div class="tbl"><table class="cmp"><tr><th></th><th>Basic</th><th>API key</th><th>Bearer token</th></tr>
<tr><td>Kaise bhejte hain</td><td>Authorization: Basic ...</td><td>Header jaise X-Api-Key</td><td>Authorization: Bearer ...</td></tr>
<tr><td>Umar</td><td>Jab tak password</td><td>Rotate hone tak</td><td>Chhoti (minutes se hours)</td></tr>
<tr><td>Har call par password</td><td>Haan</td><td>Nahi</td><td>Nahi (sirf login par)</td></tr>
<tr><td>Typical network use</td><td>Router par RESTCONF</td><td>Meraki-style cloud dashboards</td><td>Catalyst Center, cloud services, OAuth 2.0</td></tr></table></div>

<h3>Secrets sambhalne ke rules</h3>
<ul>
<li>Hamesha HTTPS use karo. Plain HTTP par basic auth aur tokens raaste mein kisi ko bhi padhne ko mil jaate hain.</li>
<li>Passwords, keys ya tokens ko scripts ya Git mein hard-code mat karo. Environment variables ya secrets store se padho.</li>
<li>Har script ko apna alag account ya key do, jitni zaroorat utni hi privilege, taaki ek ko revoke karo to baaki na tootein.</li>
<li>Tokens ko logs mein kabhi print mat karo. Zyada se zyada pehle chaar characters.</li>
<li>Keys ko regularly rotate karo, aur leak ka shak ho to turant.</li>
</ul>
<p>Lab scripts <code>verify=False</code> isliye use karte hain kyunki lab routers self-signed certificates use karte hain. Production mein verification on rakhte ho aur company ki certificate authority par trust karte ho.</p>

<div class="warn"><p><b>Common mistakes.</b> Base64 ko "encrypted" kehna; asli token chat ya ticket mein paste karna; har 401 ko "galat password" samajhna jabki token bas expire hua; key ko URL mein daalna; read-only report ke liye admin-level account use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> 401 = authentication fail ya missing (aap kaun ho?). 403 = authenticated par authorized nahi (aap yeh nahi kar sakte). Lab 1 mein account <code>viewer</code> sahi login karta hai par uska privilege 5 hai, aur router 403 deta hai kyunki API users ko privilege 15 chahiye.</p></div>

<div class="scn"><h4>Token 02:00 baje expire ho gaya</h4><p>Ek nightly backup job ne 01:30 par login kiya aur token variable mein rakh liya. 02:00 par token (30 minute ki umar) expire ho gaya, aur baaki 60 devices ne 401 diya. Log mass credential failure jaisa dikha, aur on-call engineer ne passwords reset karne mein waqt barbaad kiya. Fix: 401 par ek baar dobara login karo aur request retry karo; aur "token expired" ko "bad password" se alag log karo.</p><p><b>Lesson:</b> 401 ki ek se zyada wajah hoti hain. Error message padho aur token lifetime ke baare mein socho.</p></div>

<div class="iv"><p class="q">"401 aur 403 mein kya farak hai?"</p><p>401 ka matlab server caller ko authenticate nahi kar paya: credentials missing, galat ya expired. 403 ka matlab caller pehchana gaya par is action ki ijazat nahi. 401 ka fix credentials sahi ya refresh karna hai; 403 ka fix sahi permissions wala account use karna (ya policy badalna). Router ka example do: privilege 5 user ko 403 milta hai, galat password par 401.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Authentication = aap kaun ho (401). Authorization = aap kya kar sakte ho (403).</li>
<li>Basic auth base64 hai, encryption nahi: sirf HTTPS par. API keys header mein, URL mein nahi.</li>
<li>Bearer tokens ek baar milte hain, expire hote hain, aur Authorization: Bearer ke roop mein jaate hain.</li>
<li>Secrets environment variables mein rakho, code ya Git mein nahi; least privilege do.</li>
<li>Token ke saath 401 par expiry ka shak karo: dobara login karo aur ek baar retry karo.</li>
</ul></div>
`}};export{e as default};