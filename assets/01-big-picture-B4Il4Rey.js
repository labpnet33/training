var e={id:`big-picture`,h:{en:`Why Vault: from sticky notes to a safe with a front desk`,hi:`Vault kyun: sticky notes se front desk wali tijori tak`},body:{en:`
<p>In <code>py-secrets</code> you took passwords out of scripts and put them into environment variables and a <code>.env</code> file that stays out of Git. That was the right first step. Now look at the whole estate. The same <code>NK@2026</code> sits in <code>.env</code> files on three laptops, a backup server and a CI runner. When a colleague leaves, nobody can say who copied what. When the password changes, someone edits every copy by hand and forgets one. This module moves the secret to <b>one place that checks who is asking</b>: HashiCorp Vault, used from Python with the <code>hvac</code> library.</p>

<h3>An analogy: the safe-deposit room with a front desk</h3>
<p>Think of a bank. Customers do not get a copy of the master key. At the front desk a clerk checks your ID (<b>authentication</b>), hands you a card that opens only your own boxes (<b>policy</b>) and works for a few hours only (a <b>lease</b>). Every visit goes into a visitor book (<b>audit</b>). A <code>.env</code> file is the opposite: a sticky note with the key, copied to every desk. Vault is the front desk.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="A script logs in to Vault, receives a token, reads a secret and connects to the devices">
<rect x="20" y="70" width="140" height="90" rx="10" fill="#bae6fd"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="14">AUTO01</text><text x="90" y="122" text-anchor="middle" class="svg-muted" font-size="12">collect.py</text><text x="90" y="142" text-anchor="middle" class="svg-muted" font-size="12">hvac + netmiko</text>
<rect x="250" y="20" width="170" height="210" rx="10" fill="#ddd6fe"/><text x="335" y="46" text-anchor="middle" class="svg-ink" font-size="14">Vault</text>
<rect x="266" y="60" width="138" height="34" rx="6" fill="#fde68a"/><text x="335" y="82" text-anchor="middle" class="svg-ink" font-size="12">login (AppRole)</text>
<rect x="266" y="104" width="138" height="34" rx="6" fill="#fed7aa"/><text x="335" y="126" text-anchor="middle" class="svg-ink" font-size="12">policy check</text>
<rect x="266" y="148" width="138" height="34" rx="6" fill="#bbf7d0"/><text x="335" y="170" text-anchor="middle" class="svg-ink" font-size="12">KV secrets</text>
<text x="335" y="210" text-anchor="middle" class="svg-muted" font-size="12">every call is logged</text>
<rect x="510" y="70" width="110" height="90" rx="10" fill="#e2e8f0"/><text x="565" y="104" text-anchor="middle" class="svg-ink" font-size="14">Devices</text><text x="565" y="126" text-anchor="middle" class="svg-muted" font-size="12">R1 J1 N1</text>
<line x1="160" y1="90" x2="250" y2="90" stroke="#64748b" stroke-width="2"/><text x="205" y="82" text-anchor="middle" class="svg-accent" font-size="12">1</text>
<line x1="250" y1="120" x2="160" y2="120" stroke="#64748b" stroke-width="2"/><text x="205" y="114" text-anchor="middle" class="svg-accent" font-size="12">2</text>
<line x1="160" y1="150" x2="250" y2="150" stroke="#64748b" stroke-width="2"/><text x="205" y="166" text-anchor="middle" class="svg-accent" font-size="12">3</text>
<line x1="160" y1="115" x2="510" y2="115" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 4"/><text x="470" y="108" text-anchor="middle" class="svg-accent" font-size="12">4 SSH</text>
</svg><p class="cap">Four steps. 1 login with role_id and secret_id. 2 a short-lived token comes back. 3 the script reads the secret with that token. 4 the script opens SSH to the device.</p></div>

<h3>What you will learn</h3>
<ul><li>Start with the <code>vault</code> command line and the KV version 2 secrets engine, then do the same from Python with <code>hvac</code>.</li><li>Use versions, soft delete, undelete and destroy, and know which of them can be undone.</li><li>Read tokens as short leases and write policies with least privilege.</li><li>Give a script its own login with AppRole and keep the two halves of that login safe.</li><li>Feed the secrets to <code>netmiko</code> at run time, so the passwords leave <code>.env</code> for good.</li><li>Troubleshoot the four failures every rollout meets: sealed, token rejected, wrong mount point and a deleted secret.</li></ul>

<h3>Prerequisites</h3>
<ul><li><code>py-secrets</code>: environment variables, <code>getpass</code>, <code>.env</code> files, file permissions, hashing. We build directly on it.</li><li><code>py-safepush</code>: the habit of checking before you change anything.</li><li><code>adv-nkmiko</code>: the multivendor collector. Our configure lab feeds Vault secrets into it. (<code>adv-napalm</code>, built next to this module, can use the same helper; here we only point to it.)</li></ul>

<h3>What a .env file cannot do</h3>
<table class="cmp"><tr><th>Question</th><th>.env or environment variable</th><th>Vault</th></tr><tr><td>How many copies exist?</td><td>One per laptop, server and runner</td><td>One. Scripts fetch it when they run</td></tr><tr><td>Who read it, and when?</td><td>Nobody knows</td><td>Every request is logged (real servers; the lab has no audit log)</td></tr><tr><td>A script is compromised</td><td>Change the password everywhere</td><td>Revoke that one token or role</td></tr><tr><td>Rotate the password</td><td>Edit every copy</td><td>Write a new version; scripts pick it up on their next run</td></tr><tr><td>Give one script less than another</td><td>Not possible: a file is a file</td><td>One policy per job</td></tr></table>

<h3>Words you will meet</h3>
<dl class="terms"><dt>Secrets engine</dt><dd>A plug-in mounted at a path that stores or makes secrets. We use <b>KV</b> (key/value) version 2 at <code>secret/</code>.</dd><dt>Token</dt><dd>The badge Vault hands out after a login. Every request carries it. It expires.</dd><dt>Policy</dt><dd>A list of paths and what may be done on each: read, list, create, update, delete.</dd><dt>AppRole</dt><dd>A login method made for programs: a <code>role_id</code> plus a <code>secret_id</code>.</dd><dt>Seal</dt><dd>Vault encrypts its data. When sealed, it cannot read its own storage and refuses every request.</dd></dl>

<h3>The lab network</h3>
<p>AUTO01 (<code>netadmin</code> / <code>Deccan@123</code>) is the Linux host where you write scripts. <code>VAULT</code> is the Vault server at 10.99.0.70, port 8200. R1 is IOS XE, J1 is Junos and N1 is NX-OS, the same devices as <code>adv-nkmiko</code>. Here is the problem we start with: three device passwords in plain text.</p>
<pre class="out">AUTO01$ cat .env
VAULT_ADDR=h&#116;tp://10.99.0.70:8200
NET_USER=netops
<span class="hl">NET_PASS=NK@2026</span>
<span class="hl">NXOS_PASS=NKlab@123</span></pre>
<p>These are lab values. By the end of the configure lab this file holds one line, the address of the server, and nothing secret.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab server speaks plain H&#84;TP on port 8200; a real one uses TLS and your scripts use an H&#84;TPS address. The lab server starts unsealed with one key share and keeps data in memory; a real one uses five shares with a threshold of three and a storage backend. There is no audit log in the lab. Python in the lab cannot open files inside hidden folders (names that start with a dot), so credential files live in <code>~/vault-creds</code>; on a real host you would pick <code>/etc</code> or <code>~/.config</code>. The <code>hvac</code> library and the <code>vault</code> command behave like the real ones; where they do not, the chapter says so.</p></div>

<div class="scn"><h4>The key that was copied to a laptop</h4><p>A contractor left after a project. The NOC lead asked: which passwords did that laptop hold? The team did not know. Every device password had been in a <code>.env</code> on that laptop, and rotating them meant touching 40 devices in one night. With Vault the contractor would have had a role that could read only the project's paths for a few hours at a time, and revoking that role would have taken one command.</p><p><b>Lesson:</b> A secret you cannot trace or revoke is a secret you must treat as public after anyone leaves.</p></div>

<div class="iv"><p class="q">"Why use Vault if environment variables already keep passwords out of the code?"</p><p>Environment variables fix the code, not the estate. The value is still copied to every host, never expires, cannot be revoked per script and leaves no trail. Vault keeps one copy, issues short-lived tokens through a login, limits each script by policy and records access. I would still use environment variables for the Vault address and, in a pipeline, for the secret_id that starts the login.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Vault is a front desk: it checks identity, hands out a short-lived token and applies a policy.</li><li>Moving a password from code to <code>.env</code> removes it from Git, not from the estate.</li><li>Scripts fetch secrets at run time and keep them only in variables.</li><li>The lab is plain H&#84;TP and unsealed on purpose; production uses TLS, several key shares and audit.</li><li>This module builds on <code>py-secrets</code>, <code>py-safepush</code> and <code>adv-nkmiko</code>.</li></ul></div>
`,hi:`
<p><code>py-secrets</code> mein tumne passwords scripts se nikal kar environment variables aur ek <code>.env</code> file mein rakhe the, jo Git se bahar rehti hai. Woh sahi pehla kadam tha. Ab poora estate dekho. Wahi <code>NK@2026</code> teen laptops, ek backup server aur ek CI runner ki <code>.env</code> files mein pada hai. Jab koi colleague jaata hai, koi nahi bata sakta ki kisne kya copy kiya. Jab password badalta hai, koi har copy haath se edit karta hai aur ek bhool jaata hai. Yeh module secret ko <b>ek aisi jagah le jaata hai jo poochhti hai ki maang kaun raha hai</b>: HashiCorp Vault, jise Python se <code>hvac</code> library ke saath use karte hain.</p>

<h3>Ek analogy: front desk wala safe-deposit room</h3>
<p>Bank socho. Customers ko master key ki copy nahi milti. Front desk par clerk tumhari ID check karta hai (<b>authentication</b>), ek card deta hai jo sirf tumhare apne boxes kholta hai (<b>policy</b>) aur sirf kuch ghante chalta hai (ek <b>lease</b>). Har visit visitor book mein likhi jaati hai (<b>audit</b>). <code>.env</code> file ulta hai: key wali sticky note, jo har desk par copy hoti hai. Vault front desk hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Script Vault mein login karti hai, token paati hai, secret padhti hai aur devices se connect karti hai">
<rect x="20" y="70" width="140" height="90" rx="10" fill="#bae6fd"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="14">AUTO01</text><text x="90" y="122" text-anchor="middle" class="svg-muted" font-size="12">collect.py</text><text x="90" y="142" text-anchor="middle" class="svg-muted" font-size="12">hvac + netmiko</text>
<rect x="250" y="20" width="170" height="210" rx="10" fill="#ddd6fe"/><text x="335" y="46" text-anchor="middle" class="svg-ink" font-size="14">Vault</text>
<rect x="266" y="60" width="138" height="34" rx="6" fill="#fde68a"/><text x="335" y="82" text-anchor="middle" class="svg-ink" font-size="12">login (AppRole)</text>
<rect x="266" y="104" width="138" height="34" rx="6" fill="#fed7aa"/><text x="335" y="126" text-anchor="middle" class="svg-ink" font-size="12">policy check</text>
<rect x="266" y="148" width="138" height="34" rx="6" fill="#bbf7d0"/><text x="335" y="170" text-anchor="middle" class="svg-ink" font-size="12">KV secrets</text>
<text x="335" y="210" text-anchor="middle" class="svg-muted" font-size="12">har call logged</text>
<rect x="510" y="70" width="110" height="90" rx="10" fill="#e2e8f0"/><text x="565" y="104" text-anchor="middle" class="svg-ink" font-size="14">Devices</text><text x="565" y="126" text-anchor="middle" class="svg-muted" font-size="12">R1 J1 N1</text>
<line x1="160" y1="90" x2="250" y2="90" stroke="#64748b" stroke-width="2"/><text x="205" y="82" text-anchor="middle" class="svg-accent" font-size="12">1</text>
<line x1="250" y1="120" x2="160" y2="120" stroke="#64748b" stroke-width="2"/><text x="205" y="114" text-anchor="middle" class="svg-accent" font-size="12">2</text>
<line x1="160" y1="150" x2="250" y2="150" stroke="#64748b" stroke-width="2"/><text x="205" y="166" text-anchor="middle" class="svg-accent" font-size="12">3</text>
<line x1="160" y1="115" x2="510" y2="115" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 4"/><text x="470" y="108" text-anchor="middle" class="svg-accent" font-size="12">4 SSH</text>
</svg><p class="cap">Chaar steps. 1 role_id aur secret_id se login. 2 chhota token wapas aata hai. 3 script us token se secret padhti hai. 4 script device par SSH kholti hai.</p></div>

<h3>Tum kya seekhoge</h3>
<ul><li><code>vault</code> command line aur KV version 2 secrets engine se shuru karo, phir wahi kaam Python mein <code>hvac</code> se karo.</li><li>Versions, soft delete, undelete aur destroy use karo, aur jaano ki inmein se kya undo ho sakta hai.</li><li>Tokens ko chhote leases ki tarah padho aur least privilege wali policies likho.</li><li>Script ko AppRole se uska apna login do aur us login ke dono hisson ko surakshit rakho.</li><li>Secrets ko run time par <code>netmiko</code> ko do, taaki passwords hamesha ke liye <code>.env</code> se nikal jaayein.</li><li>Woh chaar failures troubleshoot karo jo har rollout mein aate hain: sealed, token rejected, galat mount point aur deleted secret.</li></ul>

<h3>Prerequisites</h3>
<ul><li><code>py-secrets</code>: environment variables, <code>getpass</code>, <code>.env</code> files, file permissions, hashing. Hum seedhe isi par build karte hain.</li><li><code>py-safepush</code>: kuch badalne se pehle check karne ki aadat.</li><li><code>adv-nkmiko</code>: multivendor collector. Hamari configure lab Vault ke secrets ko isi mein deti hai. (<code>adv-napalm</code>, jo is module ke saath bana hai, wahi helper use kar sakta hai; yahan hum sirf us taraf ishaara karte hain.)</li></ul>

<h3>.env file kya nahi kar sakti</h3>
<table class="cmp"><tr><th>Sawaal</th><th>.env ya environment variable</th><th>Vault</th></tr><tr><td>Kitni copies hain?</td><td>Har laptop, server aur runner par ek</td><td>Ek. Scripts chalte waqt fetch karti hain</td></tr><tr><td>Kisne kab padha?</td><td>Kisi ko pata nahi</td><td>Har request logged hai (asli servers par; lab mein audit log nahi hai)</td></tr><tr><td>Ek script compromise ho gayi</td><td>Password har jagah badlo</td><td>Sirf woh ek token ya role revoke karo</td></tr><tr><td>Password rotate karna</td><td>Har copy edit karo</td><td>Naya version likho; scripts agle run par utha leti hain</td></tr><tr><td>Ek script ko dusri se kam access dena</td><td>Mumkin nahi: file to file hai</td><td>Har kaam ke liye ek policy</td></tr></table>

<h3>Woh words jo milenge</h3>
<dl class="terms"><dt>Secrets engine</dt><dd>Ek path par mount hua plug-in jo secrets store ya banata hai. Hum <code>secret/</code> par <b>KV</b> (key/value) version 2 use karte hain.</dd><dt>Token</dt><dd>Login ke baad Vault jo badge deta hai. Har request ise saath le jaati hai. Yeh expire hota hai.</dd><dt>Policy</dt><dd>Paths ki list aur har path par kya kar sakte ho: read, list, create, update, delete.</dd><dt>AppRole</dt><dd>Programs ke liye bana login method: ek <code>role_id</code> aur ek <code>secret_id</code>.</dd><dt>Seal</dt><dd>Vault apna data encrypt karta hai. Sealed ho to woh apni storage padh nahi sakta aur har request mana kar deta hai.</dd></dl>

<h3>Lab network</h3>
<p>AUTO01 (<code>netadmin</code> / <code>Deccan@123</code>) woh Linux host hai jahan tum scripts likhte ho. <code>VAULT</code> 10.99.0.70, port 8200 par Vault server hai. R1 IOS XE hai, J1 Junos hai aur N1 NX-OS hai, wahi devices jo <code>adv-nkmiko</code> mein the. Hamari shuruaat ki problem yeh hai: teen device passwords plain text mein.</p>
<pre class="out">AUTO01$ cat .env
VAULT_ADDR=h&#116;tp://10.99.0.70:8200
NET_USER=netops
<span class="hl">NET_PASS=NK@2026</span>
<span class="hl">NXOS_PASS=NKlab@123</span></pre>
<p>Yeh lab values hain. Configure lab ke end tak is file mein ek hi line hogi, server ka address, aur kuch secret nahi.</p>

<div class="note"><p><b>Lab mein aur asli gear par.</b> Lab server port 8200 par plain H&#84;TP bolta hai; asli server TLS use karta hai aur tumhari scripts H&#84;TPS address use karti hain. Lab server unsealed shuru hota hai, ek key share ke saath, aur data memory mein rakhta hai; asli server paanch shares aur teen ke threshold ke saath storage backend use karta hai. Lab mein audit log nahi hai. Lab ka Python hidden folders (jinke naam dot se shuru hote hain) ke andar files nahi khol sakta, isliye credential files <code>~/vault-creds</code> mein rehti hain; asli host par tum <code>/etc</code> ya <code>~/.config</code> chunoge. <code>hvac</code> library aur <code>vault</code> command asli jaisi chalti hain; jahan nahi chalti, chapter bata deta hai.</p></div>

<div class="scn"><h4>Laptop par copy hui key</h4><p>Ek contractor project ke baad chala gaya. NOC lead ne poochha: us laptop mein kaun se passwords the? Team ko pata nahi tha. Har device password us laptop ki <code>.env</code> mein tha, aur unhe rotate karna matlab ek raat mein 40 devices chhoona. Vault hota to contractor ke paas aisa role hota jo kuch ghanton ke liye sirf project ke paths padh sakta, aur us role ko revoke karna ek command hota.</p><p><b>Seekh:</b> Jis secret ko tum trace ya revoke nahi kar sakte, use kisi ke jaane ke baad public maanna padta hai.</p></div>

<div class="iv"><p class="q">"Agar environment variables pehle se passwords code se bahar rakhte hain, to Vault kyun?"</p><p>Environment variables code ko theek karte hain, estate ko nahi. Value phir bhi har host par copy hoti hai, kabhi expire nahi hoti, script ke hisaab se revoke nahi hoti aur koi trail nahi chhodti. Vault ek copy rakhta hai, login ke zariye chhote tokens deta hai, policy se har script ko limit karta hai aur access record karta hai. Vault ka address, aur pipeline mein login shuru karne wala secret_id, main phir bhi environment variables mein rakhunga.</p></div>

<div class="kt"><p><b>Mukhya baatein</b></p><ul><li>Vault ek front desk hai: identity check karta hai, chhota token deta hai aur policy lagata hai.</li><li>Password ko code se <code>.env</code> mein le jaana use Git se hatata hai, estate se nahi.</li><li>Scripts secrets run time par fetch karti hain aur sirf variables mein rakhti hain.</li><li>Lab jaan-boojh kar plain H&#84;TP aur unsealed hai; production mein TLS, kai key shares aur audit hota hai.</li><li>Yeh module <code>py-secrets</code>, <code>py-safepush</code> aur <code>adv-nkmiko</code> par bana hai.</li></ul></div>
`}};export{e as default};