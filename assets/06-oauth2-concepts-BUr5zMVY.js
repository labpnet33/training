var e={id:`oauth2`,h:{en:`OAuth 2.0 at concept level: roles, grants, scopes and tokens`,hi:`OAuth 2.0 concept level par: roles, grants, scopes aur tokens`},body:{en:`
<p>When you park at a hotel, you do not give the valet your house keys. You give a <b>valet key</b>: it starts the car and opens the door, but not the boot or the glove box, and it can be cancelled. <b>OAuth 2.0</b> is the valet-key system for the web. It lets an application act on your behalf, with limited rights and for a limited time, without ever seeing your password. It is the second half of exam topic 2.3, and the exam asks for the <b>roles, the flow and the tokens</b>, not for you to implement a server.</p>

<h3>Why OAuth exists</h3>
<p>Imagine a Python tool, "Room Reporter", that wants to read your Webex spaces. Without OAuth you would hand it your username and password: it could do everything, you could not take its access away without changing your password, and one leak of the tool leaks your account. With OAuth you sign in at the <b>provider's own login page</b>, tick "allow Room Reporter to read my spaces", and the tool receives a token that allows only that.</p>

<h3>The four roles</h3>
<dl class="terms">
<dt>Resource owner</dt><dd>The user who owns the data and gives permission (you).</dd>
<dt>Client</dt><dd>The application that wants access (Room Reporter, or your automation script). It is registered with the provider and has a <b>client ID</b> and, if it can keep a secret, a <b>client secret</b>.</dd>
<dt>Authorization server</dt><dd>Signs the user in, asks for consent, and issues tokens (the "token endpoint").</dd>
<dt>Resource server</dt><dd>The API that holds the data and accepts the access token (the Webex messaging API).</dd>
</dl>

<h3>The tokens and scopes</h3>
<ul>
<li><b>Access token</b>: short-lived (often 1 hour); sent as <code>Authorization: Bearer ...</code> to the resource server.</li>
<li><b>Refresh token</b>: long-lived; sent only to the authorization server to get a new access token without asking the user again.</li>
<li><b>Scope</b>: the list of permissions requested, such as <code>spark:rooms_read</code> or <code>devices.read</code>. A token with too small a scope gives <b>403</b>.</li>
</ul>

<h3>Authorization code flow (the common one for apps with users)</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="OAuth authorization code flow">
<rect x="10" y="20" width="110" height="46" rx="8" fill="#fde68a"/><text x="65" y="48" text-anchor="middle" class="svg-ink" font-size="13">User</text>
<rect x="190" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="245" y="48" text-anchor="middle" class="svg-ink" font-size="13">Client app</text>
<rect x="360" y="20" width="130" height="46" rx="8" fill="#ddd6fe"/><text x="425" y="48" text-anchor="middle" class="svg-ink" font-size="13">Auth server</text>
<rect x="520" y="20" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="575" y="48" text-anchor="middle" class="svg-ink" font-size="13">API server</text>
<text x="20" y="110" class="svg-ink" font-size="12">1  User clicks "Connect" in the client app</text>
<text x="20" y="136" class="svg-ink" font-size="12">2  Client redirects the browser to the auth server (client_id, scope, redirect_uri, state)</text>
<text x="20" y="162" class="svg-ink" font-size="12">3  User signs in at the auth server and approves the scopes</text>
<text x="20" y="188" class="svg-ink" font-size="12">4  Auth server redirects back with a one-time authorization code</text>
<text x="20" y="214" class="svg-ink" font-size="12">5  Client posts the code + client secret to the token endpoint (server to server)</text>
<text x="20" y="240" class="svg-ink" font-size="12">6  Auth server returns access token (+ refresh token)</text>
<text x="20" y="266" class="svg-ink" font-size="12">7  Client calls the API with Authorization: Bearer access-token</text>
<text x="20" y="288" class="svg-muted" font-size="12">The password is typed only at the auth server. The client never sees it.</text>
</svg><p class="cap">The one-time code travels through the browser; the token itself is fetched directly between servers.</p></div>
<p>Two safety details: the <code>state</code> value is a random string the client checks on return, to stop forged redirects; and public clients such as mobile apps add <b>PKCE</b>, a one-time proof so a stolen code is useless.</p>

<h3>Other grants you should recognise</h3>
<div class="tbl"><table class="cmp"><tr><th>Grant</th><th>Used when</th><th>Network automation example</th></tr>
<tr><td>Authorization code</td><td>A user must approve access</td><td>A web dashboard reading a user's Webex data</td></tr>
<tr><td>Client credentials</td><td>No user: one service talks to another</td><td>A nightly script calling a cloud controller with its own client ID and secret</td></tr>
<tr><td>Device code</td><td>Device without a good browser</td><td>CLI tool prints a code; you approve on your laptop</td></tr>
<tr><td>Refresh token</td><td>Access token expired</td><td>Long-running integration keeps itself logged in</td></tr></table></div>
<p>The old <i>implicit</i> and <i>password</i> grants are discouraged and appear on the exam only as "not recommended".</p>

<h3>The token request (reference snippet)</h3>
<p>A script using client credentials: it sends form-encoded data (not JSON) to the token endpoint. <code>auth=</code> sends the client ID and secret as basic authentication.</p>
<pre class="code">import os, requests
TOKEN_URL = "h&#116;tps://auth.example/oauth2/token"
r = requests.post(TOKEN_URL,
                  auth=(os.environ["CLIENT_ID"], os.environ["CLIENT_SECRET"]),
                  data={"grant_type": "client_credentials", "scope": "devices.read"},
                  timeout=10)
r.raise_for_status()
tok = r.json()
print(tok["token_type"], tok["expires_in"])      # Bearer 3600
api = requests.get("h&#116;tps://api.example/v2/devices",
                   headers={"Authorization": "Bearer " + tok["access_token"]}, timeout=10)</pre>
<pre class="out">{
  "access_token": "eyJhbGciOi...redacted",
  "token_type": "<span class="hl">Bearer</span>",
  "expires_in": 3600,
  "scope": "devices.read"
}</pre>

<div class="warn"><p><b>Common mistakes.</b> Saying OAuth is an authentication protocol (it is an <i>authorization</i> framework; OpenID Connect adds sign-in identity on top); putting the client secret in a mobile app or a public repository; asking for more scopes than needed; sending the refresh token to the resource server; not handling expiry.</p></div>
<div class="exam"><p><b>Exam trap.</b> The user's password is never given to the client. The access token goes to the <b>resource server</b>; the refresh token goes only to the <b>authorization server</b>. A valid token with the wrong scope gives 403, an expired or invalid token gives 401.</p></div>

<div class="scn"><h4>Read-only token, write attempt</h4><p>A team built a bot that created Webex spaces for each new project. In testing it worked with an admin's token. In production it ran with a token granted only a read scope and every create returned 403 with a message about insufficient scope. The team added the needed scope in the integration settings, had the user approve again, and the bot worked.</p><p><b>Lesson:</b> 403 with a valid token usually means "scope or role too small". Fix the grant, not the code.</p></div>

<div class="iv"><p class="q">"Walk me through OAuth 2.0 in two minutes."</p><p>Name the four roles: resource owner, client, authorization server, resource server. Then the flow: the user is sent to the authorization server, signs in and approves scopes, the client receives a one-time code and exchanges it for an access token (and refresh token), then calls the API with the bearer token. Say the client never sees the password, tokens are short-lived and scoped, and for service-to-service automation you use client credentials.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OAuth 2.0 is an authorization framework: limited, revocable access without sharing the password.</li>
<li>Roles: resource owner, client, authorization server, resource server.</li>
<li>Access token (short) goes to the API; refresh token (long) goes only to the authorization server.</li>
<li>Scopes limit what a token can do; too small gives 403, expired gives 401.</li>
<li>Authorization code for apps with users; client credentials for service-to-service automation.</li>
</ul></div>
`,hi:`
<p>Hotel mein car park karte waqt aap valet ko ghar ki chaabiyan nahi dete. Aap <b>valet key</b> dete ho: woh car start karti hai aur darwaza kholti hai, par boot ya glove box nahi, aur use cancel kiya ja sakta hai. <b>OAuth 2.0</b> web ka valet-key system hai. Yeh kisi application ko aapki taraf se, limited rights ke saath aur limited time ke liye, kaam karne deta hai, bina uske aapka password dekhe. Yeh exam topic 2.3 ka doosra hissa hai, aur exam <b>roles, flow aur tokens</b> poochta hai, server implement karna nahi.</p>

<h3>OAuth kyun hai</h3>
<p>Maan lo ek Python tool "Room Reporter" aapke Webex spaces padhna chahta hai. OAuth ke bina aap use apna username aur password de dete: woh sab kuch kar sakta, aap uski access hataye bina password badle nahi hata sakte, aur tool ka ek leak aapka account leak kar deta. OAuth ke saath aap <b>provider ke apne login page</b> par sign in karte ho, "Room Reporter ko mere spaces padhne do" tick karte ho, aur tool ko aisa token milta hai jo sirf wahi allow karta hai.</p>

<h3>Chaar roles</h3>
<dl class="terms">
<dt>Resource owner</dt><dd>Woh user jiska data hai aur jo permission deta hai (aap).</dd>
<dt>Client</dt><dd>Woh application jo access chahti hai (Room Reporter, ya aapki automation script). Yeh provider ke paas registered hoti hai aur iske paas <b>client ID</b> hota hai, aur agar secret rakh sakti hai to <b>client secret</b>.</dd>
<dt>Authorization server</dt><dd>User ko sign in karwata hai, consent maangta hai, aur tokens issue karta hai ("token endpoint").</dd>
<dt>Resource server</dt><dd>Woh API jisme data hai aur jo access token accept karti hai (Webex messaging API).</dd>
</dl>

<h3>Tokens aur scopes</h3>
<ul>
<li><b>Access token</b>: chhoti umar (aksar 1 ghanta); resource server ko <code>Authorization: Bearer ...</code> ke roop mein bheja jaata hai.</li>
<li><b>Refresh token</b>: lambi umar; sirf authorization server ko bheja jaata hai taaki user se dobara poochhe bina naya access token mile.</li>
<li><b>Scope</b>: maangi gayi permissions ki list, jaise <code>spark:rooms_read</code> ya <code>devices.read</code>. Bahut chhote scope wala token <b>403</b> deta hai.</li>
</ul>

<h3>Authorization code flow (users wali apps ke liye common)</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="OAuth authorization code flow">
<rect x="10" y="20" width="110" height="46" rx="8" fill="#fde68a"/><text x="65" y="48" text-anchor="middle" class="svg-ink" font-size="13">User</text>
<rect x="190" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="245" y="48" text-anchor="middle" class="svg-ink" font-size="13">Client app</text>
<rect x="360" y="20" width="130" height="46" rx="8" fill="#ddd6fe"/><text x="425" y="48" text-anchor="middle" class="svg-ink" font-size="13">Auth server</text>
<rect x="520" y="20" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="575" y="48" text-anchor="middle" class="svg-ink" font-size="13">API server</text>
<text x="20" y="110" class="svg-ink" font-size="12">1  User client app mein "Connect" click karta hai</text>
<text x="20" y="136" class="svg-ink" font-size="12">2  Client browser ko auth server par redirect karta hai (client_id, scope, redirect_uri, state)</text>
<text x="20" y="162" class="svg-ink" font-size="12">3  User auth server par sign in karke scopes approve karta hai</text>
<text x="20" y="188" class="svg-ink" font-size="12">4  Auth server one-time authorization code ke saath wapas redirect karta hai</text>
<text x="20" y="214" class="svg-ink" font-size="12">5  Client code + client secret token endpoint ko post karta hai (server to server)</text>
<text x="20" y="240" class="svg-ink" font-size="12">6  Auth server access token (+ refresh token) lautata hai</text>
<text x="20" y="266" class="svg-ink" font-size="12">7  Client API ko Authorization: Bearer access-token ke saath call karta hai</text>
<text x="20" y="288" class="svg-muted" font-size="12">Password sirf auth server par type hota hai. Client use kabhi nahi dekhta.</text>
</svg><p class="cap">One-time code browser se hokar jaata hai; token khud servers ke beech seedha fetch hota hai.</p></div>
<p>Do safety details: <code>state</code> value ek random string hai jo client wapas aane par check karta hai, forged redirects rokne ke liye; aur mobile apps jaise public clients <b>PKCE</b> jodte hain, ek one-time proof taaki chori hua code bekaar ho.</p>

<h3>Doosre grants jo pehchanne chahiye</h3>
<div class="tbl"><table class="cmp"><tr><th>Grant</th><th>Kab use hota hai</th><th>Network automation example</th></tr>
<tr><td>Authorization code</td><td>User ko access approve karni hai</td><td>Web dashboard jo user ka Webex data padhta hai</td></tr>
<tr><td>Client credentials</td><td>User nahi: ek service doosri se baat karti hai</td><td>Nightly script jo cloud controller ko apne client ID aur secret se call karti hai</td></tr>
<tr><td>Device code</td><td>Aisa device jisme achha browser nahi</td><td>CLI tool code print karta hai; aap laptop par approve karte ho</td></tr>
<tr><td>Refresh token</td><td>Access token expire ho gaya</td><td>Long-running integration khud ko logged in rakhti hai</td></tr></table></div>
<p>Purane <i>implicit</i> aur <i>password</i> grants discourage kiye jaate hain aur exam mein sirf "not recommended" ke roop mein aate hain.</p>

<h3>Token request (reference snippet)</h3>
<p>Client credentials use karti script: woh token endpoint ko form-encoded data (JSON nahi) bhejti hai. <code>auth=</code> client ID aur secret ko basic authentication ke roop mein bhejta hai.</p>
<pre class="code">import os, requests
TOKEN_URL = "h&#116;tps://auth.example/oauth2/token"
r = requests.post(TOKEN_URL,
                  auth=(os.environ["CLIENT_ID"], os.environ["CLIENT_SECRET"]),
                  data={"grant_type": "client_credentials", "scope": "devices.read"},
                  timeout=10)
r.raise_for_status()
tok = r.json()
print(tok["token_type"], tok["expires_in"])      # Bearer 3600
api = requests.get("h&#116;tps://api.example/v2/devices",
                   headers={"Authorization": "Bearer " + tok["access_token"]}, timeout=10)</pre>
<pre class="out">{
  "access_token": "eyJhbGciOi...redacted",
  "token_type": "<span class="hl">Bearer</span>",
  "expires_in": 3600,
  "scope": "devices.read"
}</pre>

<div class="warn"><p><b>Common mistakes.</b> OAuth ko authentication protocol kehna (yeh <i>authorization</i> framework hai; OpenID Connect uske upar sign-in identity jodta hai); client secret ko mobile app ya public repository mein daalna; zaroorat se zyada scopes maangna; refresh token ko resource server ko bhejna; expiry handle na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> User ka password client ko kabhi nahi diya jaata. Access token <b>resource server</b> ko jaata hai; refresh token sirf <b>authorization server</b> ko. Galat scope wala valid token 403 deta hai, expired ya invalid token 401.</p></div>

<div class="scn"><h4>Read-only token, write ki koshish</h4><p>Ek team ne bot banaya jo har naye project ke liye Webex spaces banata tha. Testing mein woh admin ke token se chala. Production mein woh aise token se chala jise sirf read scope mila tha, aur har create ne insufficient scope ke message ke saath 403 diya. Team ne integration settings mein zaroori scope jodi, user se dobara approve karwaya, aur bot chal gaya.</p><p><b>Lesson:</b> Valid token ke saath 403 ka aam matlab "scope ya role chhota hai". Grant theek karo, code nahi.</p></div>

<div class="iv"><p class="q">"OAuth 2.0 do minute mein samjhao."</p><p>Chaar roles batao: resource owner, client, authorization server, resource server. Phir flow: user ko authorization server par bheja jaata hai, woh sign in karke scopes approve karta hai, client ko one-time code milta hai jise woh access token (aur refresh token) mein badalta hai, phir bearer token ke saath API call karta hai. Bolo ki client password kabhi nahi dekhta, tokens chhoti umar ke aur scoped hote hain, aur service-to-service automation ke liye client credentials use hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OAuth 2.0 authorization framework hai: password share kiye bina limited, revocable access.</li>
<li>Roles: resource owner, client, authorization server, resource server.</li>
<li>Access token (chhota) API ko jaata hai; refresh token (lamba) sirf authorization server ko.</li>
<li>Scopes token ki taakat limit karte hain; bahut chhota to 403, expired to 401.</li>
<li>Users wali apps ke liye authorization code; service-to-service automation ke liye client credentials.</li>
</ul></div>
`}};export{e as default};