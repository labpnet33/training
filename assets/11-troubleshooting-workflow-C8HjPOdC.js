var e={id:`troubleshooting-workflow`,h:{en:`Troubleshooting workflow: walking through both labs`,hi:`Troubleshooting workflow: dono labs ka walkthrough`},body:{en:`
<p>Security problems and availability problems look alike to a user: "it does not work". A calm, repeatable workflow separates them quickly and keeps you from the two classic errors: opening everything up "to see if it helps", and blaming the application when the fault is a name or a port. This chapter gives you the workflow and then walks through both labs with it.</p>

<h3>Analogy: a doctor's triage</h3>
<p>A doctor does not operate first. She asks what hurts, measures, narrows down the system involved, treats the cause (not just the symptom), and checks that the patient is better and that the treatment did no harm. We do the same: <b>describe, locate the layer, find the cause, fix narrowly, prove, document</b>.</p>

<h3>The six-step workflow</h3>
<ol>
<li><b>Describe the symptom exactly.</b> Who, what, from where, since when, what changed recently (a migration, a hardening, a certificate renewal)? Reproduce it yourself.</li>
<li><b>Locate the layer.</b> Name? Network path? Port and firewall? Service? Application logic or credentials? Test one layer at a time, from the bottom up or the top down, but never skip.</li>
<li><b>Gather evidence.</b> Commands and logs, not guesses: <code>dig</code>, <code>curl</code>, <code>nc</code>, firewall log, application log, <code>grep</code> for secrets.</li>
<li><b>Fix narrowly.</b> Change the one thing that is wrong. No "any any" rules, no disabled TLS checks, no admin tokens "for now".</li>
<li><b>Prove.</b> Re-run the failing test from the user's point of view, and test that what must stay blocked is still blocked.</li>
<li><b>Document and prevent.</b> Record cause, fix and a guard (a checklist item, an alert, a pipeline gate).</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Layer-by-layer diagnosis">
<rect x="20" y="20" width="170" height="40" rx="8" fill="#fed7aa"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="12">1 Name resolves? dig</text>
<rect x="20" y="85" width="170" height="40" rx="8" fill="#fde68a"/><text x="105" y="110" text-anchor="middle" class="svg-ink" font-size="12">2 Right address? compare</text>
<rect x="20" y="150" width="170" height="40" rx="8" fill="#bae6fd"/><text x="105" y="175" text-anchor="middle" class="svg-ink" font-size="12">3 Port reachable? nc</text>
<rect x="20" y="215" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="105" y="240" text-anchor="middle" class="svg-ink" font-size="12">4 Service answers? curl</text>
<text x="330" y="40" class="svg-ink" font-size="12">No answer or NXDOMAIN: resolver, record, DNS server</text>
<text x="330" y="105" class="svg-ink" font-size="12">Wrong address: stale or wrong A record, cache, split view</text>
<text x="330" y="170" class="svg-ink" font-size="12">Timeout: firewall drop. Refused: no listener</text>
<text x="330" y="235" class="svg-ink" font-size="12">Error page or 401/403: application, auth, config</text>
<line x1="105" y1="60" x2="105" y2="83" stroke="#64748b" stroke-width="2"/><line x1="105" y1="125" x2="105" y2="148" stroke="#64748b" stroke-width="2"/><line x1="105" y1="190" x2="105" y2="213" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Each test removes one layer from suspicion. Stop at the first layer that fails.</p></div>

<h3>Lab 1 walk-through: the shop name opens the wrong server</h3>
<p>The ticket says <code>shop.nwk.example</code> shows an old page for some users and the new server must answer only on its web port. The devices: workstation WS01, edge router R1 acting as DNS server (10.30.0.1), the live server APP01 (10.30.0.20) with a host firewall, and the retired OLD01 (10.30.0.99).</p>
<p><b>Step 1, reproduce by name.</b></p>
<pre class="out">WS01$ curl shop.nwk.example
&lt;html&gt;&lt;body&gt;&lt;h1&gt;NWK Shop - <span class="hl">RETIRED server (old01), do not use</span>&lt;/h1&gt;&lt;/body&gt;&lt;/html&gt;</pre>
<p>A page arrived, so the network and a web server work. It is the wrong server: suspect the name.</p>
<p><b>Step 2, ask DNS directly.</b></p>
<pre class="out">WS01$ dig +short shop.nwk.example
<span class="hl">10.30.0.99</span>
WS01$ dig +short app01.nwk.example
10.30.0.20</pre>
<p>The name points to .99, the retired server; the live server is .20. The cause is a stale A record on R1.</p>
<p><b>Step 3, fix the record narrowly.</b></p>
<pre class="code">R1(config)# no ip host shop.nwk.example
R1(config)# ip host shop.nwk.example 10.30.0.20
R1# show hosts</pre>
<p><b>Step 4, retest. The page still fails, differently.</b></p>
<pre class="out">WS01$ dig +short shop.nwk.example
10.30.0.20
WS01$ curl shop.nwk.example
curl: (28) Failed to connect to shop.nwk.example port 80 after 2001 ms: <span class="hl">Timeout was reached</span></pre>
<p>The name is now right, so the fault moved one layer down. A timeout (not "refused") points to a firewall drop. This is the second fault of the ticket: two independent problems behind one symptom.</p>
<p><b>Step 5, read the firewall evidence on APP01.</b></p>
<pre class="out">APP01$ sudo grep "UFW BLOCK" /var/log/ufw.log | tail -1
... [UFW BLOCK] IN=eth0 SRC=10.30.0.50 DST=10.30.0.20 PROTO=TCP <span class="hl">DPT=80</span>
APP01$ sudo ufw status numbered
[ 1] 22/tcp     ALLOW IN    10.30.0.0/24
[ 2] <span class="hl">8080/tcp</span>   ALLOW IN    Anywhere</pre>
<p>The client asked for port 80; the host allows 8080, a leftover from the old setup. <b>Step 6, fix narrowly</b>: delete the stale rule, allow the real one, nothing else.</p>
<pre class="code">APP01$ sudo ufw delete allow 8080/tcp
APP01$ sudo ufw allow 80/tcp</pre>
<p><b>Step 7, prove both ways.</b> The shop name must return the live page, and a port that should stay closed must still time out:</p>
<pre class="out">WS01$ curl shop.nwk.example
&lt;html&gt;&lt;body&gt;&lt;h1&gt;NWK Shop - <span class="hl">live storefront (app01)</span>&lt;/h1&gt;&lt;/body&gt;&lt;/html&gt;
WS01$ nc -zv 10.30.0.20 3306
nc: connect to 10.30.0.20 port 3306 (tcp) timed out: Operation now in progress</pre>

<h3>Lab 2 walk-through: leaked secrets in a script folder</h3>
<p>The review finding says backup.py and deploy.sh contain hard-coded credentials and disable TLS checks. The workflow is the same: find, fix narrowly, prove, and handle the leaked values.</p>
<p><b>Find</b> with a recursive, case-insensitive search that prints file names and line numbers:</p>
<pre class="out">BUILD01$ grep -rniE "password|token|secret|Sup3r" .
backup.py:7:API_TOKEN = "nk-sim-7f3a91c2d4e85b60"
deploy.sh:4:curl -k -u admin:<span class="hl">Sup3rS3cret</span> -X PUT "$DEVICE/api/banner" -d @banner.json
BUILD01$ grep -rnE "verify=False|curl -k" .
backup.py:10: ... verify=False)
deploy.sh:4:curl -k -u admin:Sup3rS3cret ...</pre>
<p>Two files hold secrets, and both disable TLS verification. <b>Fix</b> in four moves: (1) write the values into <code>.env</code> with <code>export NAME=value</code> lines and <code>chmod 600</code>; (2) add <code>.env</code> to <code>.gitignore</code>; (3) replace the literals with <code>os.environ["NK_API_TOKEN"]</code> and <code>"admin:$DEVICE_PASS"</code> using <code>sed -i</code>; (4) remove <code>verify=False</code> and <code>curl -k</code>. <b>Prove</b> without printing the secrets: <code>source .env</code> then count the variables with <code>env | grep -c</code>, and grep the folder again for the old values (they may remain only in the protected .env). <b>Handle the leak</b>: the old token and password were in files and possibly in Git history, so they must be <b>rotated</b>, not just moved.</p>

<h3>Common fault patterns, one table</h3>
<table class="cmp"><tr><th>What you observe</th><th>Meaning</th><th>Look at</th></tr>
<tr><td>Wrong page, but a page</td><td>DNS or LB sends users to a different (maybe old) server</td><td>dig, A record, split views, LB pool</td></tr>
<tr><td>Timeout</td><td>Packets dropped</td><td>Firewall rules and log, security groups, routing</td></tr>
<tr><td>Connection refused</td><td>Host reached, nothing listens</td><td>Service status, port, bind address</td></tr>
<tr><td>Certificate error</td><td>Name mismatch, expired, untrusted issuer</td><td>Certificate dates and names, CA bundle</td></tr>
<tr><td>401</td><td>Not authenticated</td><td>Token or password, expiry, header</td></tr>
<tr><td>403</td><td>Authenticated but not allowed</td><td>Role, scope, policy</td></tr>
<tr><td>Works from one subnet only</td><td>Source-specific rule or split-horizon</td><td>Rule source field, DNS view</td></tr>
</table>
<div class="warn"><p><b>Common mistakes.</b> Fixing the first fault and declaring victory (the ticket had two); testing only by IP; changing several things at once so you cannot tell what worked; skipping the "what must stay blocked" check; moving a secret out of a file but not rotating it.</p></div>
<div class="exam"><p><b>Exam trap.</b> When a question gives you a symptom plus a tool output, answer by layer: timeout means firewall, refused means service, NXDOMAIN means DNS, 401 means authentication, 403 means authorization.</p></div>

<div class="scn"><h4>Two faults, one ticket</h4><p>A hospital's booking portal "went down" after a hardening weekend. The first engineer found that the DNS record still pointed to the old address, fixed it, and closed the ticket. Twenty minutes later the same users called again: the page now timed out. The hardening had replaced the host firewall rules and allowed port 8443 instead of 443. The second engineer followed the layer order, read the block log, saw DPT=443 and corrected the rule. The post-incident note asked for a post-change test by name from a user subnet.</p><p><b>Lesson:</b> after each fix, repeat the user's test; the next fault is hiding behind the first.</p></div>

<div class="iv"><p class="q">"Walk me through how you would troubleshoot 'the application is unreachable'."</p><p>Reproduce, then go layer by layer: resolve the name and compare with the expected address, test the path and the port (timeout points to a firewall, refused to a missing listener), call the service with curl and read the status code (401 or 403 point to credentials or permissions), and check logs at each hop. Fix only what is proven wrong, re-test from the user's side, confirm that blocked things are still blocked, and write down the cause and a preventive guard.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Describe, locate the layer, gather evidence, fix narrowly, prove, document.</li>
<li>Name first (dig), then port (nc: timeout or refused), then service (curl, status code).</li>
<li>One ticket can hide two faults; repeat the user's test after every fix.</li>
<li>Prove that what must remain blocked is still blocked.</li>
<li>A secret that was in a file is rotated, not only moved.</li>
</ul></div>
`,hi:`
<p>Security problems aur availability problems user ko ek jaisi dikhti hain: "kaam nahi karta". Shaant, repeatable workflow unhe jaldi alag karta hai aur aapko do classic galtiyon se bachata hai: "dekhte hain madad karta hai ya nahi" ke liye sab kuch khol dena, aur application ko dosh dena jabki fault naam ya port ka hai. Yeh chapter workflow deta hai aur phir use ke saath dono labs walk-through karta hai.</p>

<h3>Analogy: doctor ki triage</h3>
<p>Doctor pehle operation nahi karti. Woh poochti hai kya dard hai, naapti hai, involved system tak narrow karti hai, cause ka ilaaj karti hai (sirf symptom ka nahi), aur check karti hai ki patient behtar hai aur ilaaj se nuksaan nahi hua. Hum bhi yahi karte hain: <b>describe, layer locate, cause dhoondho, narrowly fix, prove, document</b>.</p>

<h3>Chhe-step workflow</h3>
<ol>
<li><b>Symptom ko exactly describe karo.</b> Kaun, kya, kahan se, kab se, haal mein kya badla (migration, hardening, certificate renewal)? Khud reproduce karo.</li>
<li><b>Layer locate karo.</b> Naam? Network path? Port aur firewall? Service? Application logic ya credentials? Ek baar mein ek layer test karo, neeche se upar ya upar se neeche, par kabhi skip nahi.</li>
<li><b>Evidence jama karo.</b> Commands aur logs, andaze nahi: <code>dig</code>, <code>curl</code>, <code>nc</code>, firewall log, application log, secrets ke liye <code>grep</code>.</li>
<li><b>Narrowly fix karo.</b> Sirf woh ek cheez badlo jo galat hai. "any any" rules nahi, disabled TLS checks nahi, "abhi ke liye" admin tokens nahi.</li>
<li><b>Prove karo.</b> Failing test ko user ki nazar se dobara chalao, aur test karo ki jo blocked rehna chahiye woh ab bhi blocked hai.</li>
<li><b>Document aur prevent karo.</b> Cause, fix aur ek guard record karo (checklist item, alert, pipeline gate).</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Layer-by-layer diagnosis">
<rect x="20" y="20" width="170" height="40" rx="8" fill="#fed7aa"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="12">1 Naam resolve? dig</text>
<rect x="20" y="85" width="170" height="40" rx="8" fill="#fde68a"/><text x="105" y="110" text-anchor="middle" class="svg-ink" font-size="12">2 Sahi address? compare</text>
<rect x="20" y="150" width="170" height="40" rx="8" fill="#bae6fd"/><text x="105" y="175" text-anchor="middle" class="svg-ink" font-size="12">3 Port reachable? nc</text>
<rect x="20" y="215" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="105" y="240" text-anchor="middle" class="svg-ink" font-size="12">4 Service jawab? curl</text>
<text x="330" y="40" class="svg-ink" font-size="12">Jawab nahi ya NXDOMAIN: resolver, record, DNS server</text>
<text x="330" y="105" class="svg-ink" font-size="12">Galat address: stale A record, cache, split view</text>
<text x="330" y="170" class="svg-ink" font-size="12">Timeout: firewall drop. Refused: listener nahi</text>
<text x="330" y="235" class="svg-ink" font-size="12">Error page ya 401/403: application, auth, config</text>
<line x1="105" y1="60" x2="105" y2="83" stroke="#64748b" stroke-width="2"/><line x1="105" y1="125" x2="105" y2="148" stroke="#64748b" stroke-width="2"/><line x1="105" y1="190" x2="105" y2="213" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har test ek layer ko shak se hata deta hai. Pehli failing layer par ruko.</p></div>

<h3>Lab 1 walk-through: shop ka naam galat server kholta hai</h3>
<p>Ticket kehta hai <code>shop.nwk.example</code> kuch users ko purana page dikhata hai aur naya server sirf apne web port par jawab de. Devices: workstation WS01, edge router R1 jo DNS server hai (10.30.0.1), live server APP01 (10.30.0.20) host firewall ke saath, aur retired OLD01 (10.30.0.99).</p>
<p><b>Step 1, naam se reproduce.</b></p>
<pre class="out">WS01$ curl shop.nwk.example
&lt;html&gt;&lt;body&gt;&lt;h1&gt;NWK Shop - <span class="hl">RETIRED server (old01), do not use</span>&lt;/h1&gt;&lt;/body&gt;&lt;/html&gt;</pre>
<p>Page aaya, matlab network aur ek web server chal rahe hain. Server galat hai: naam par shak karo.</p>
<p><b>Step 2, DNS se seedha poocho.</b></p>
<pre class="out">WS01$ dig +short shop.nwk.example
<span class="hl">10.30.0.99</span>
WS01$ dig +short app01.nwk.example
10.30.0.20</pre>
<p>Naam .99 par point karta hai, jo retired server hai; live server .20 hai. Cause R1 par stale A record hai.</p>
<p><b>Step 3, record narrowly fix karo.</b></p>
<pre class="code">R1(config)# no ip host shop.nwk.example
R1(config)# ip host shop.nwk.example 10.30.0.20
R1# show hosts</pre>
<p><b>Step 4, retest. Page ab bhi fail, par alag tarah se.</b></p>
<pre class="out">WS01$ dig +short shop.nwk.example
10.30.0.20
WS01$ curl shop.nwk.example
curl: (28) Failed to connect to shop.nwk.example port 80 after 2001 ms: <span class="hl">Timeout was reached</span></pre>
<p>Naam ab sahi hai, isliye fault ek layer neeche chala gaya. Timeout ("refused" nahi) firewall drop ki taraf ishara karta hai. Yeh ticket ka doosra fault hai: ek symptom ke peeche do independent problems.</p>
<p><b>Step 5, APP01 par firewall evidence padho.</b></p>
<pre class="out">APP01$ sudo grep "UFW BLOCK" /var/log/ufw.log | tail -1
... [UFW BLOCK] IN=eth0 SRC=10.30.0.50 DST=10.30.0.20 PROTO=TCP <span class="hl">DPT=80</span>
APP01$ sudo ufw status numbered
[ 1] 22/tcp     ALLOW IN    10.30.0.0/24
[ 2] <span class="hl">8080/tcp</span>   ALLOW IN    Anywhere</pre>
<p>Client ne port 80 maanga; host 8080 allow karta hai, jo purane setup ka bacha hua hai. <b>Step 6, narrowly fix</b>: stale rule delete karo, asli rule allow karo, aur kuch nahi.</p>
<pre class="code">APP01$ sudo ufw delete allow 8080/tcp
APP01$ sudo ufw allow 80/tcp</pre>
<p><b>Step 7, dono taraf prove karo.</b> Shop naam live page return kare, aur jo port band rehna chahiye woh ab bhi time out kare:</p>
<pre class="out">WS01$ curl shop.nwk.example
&lt;html&gt;&lt;body&gt;&lt;h1&gt;NWK Shop - <span class="hl">live storefront (app01)</span>&lt;/h1&gt;&lt;/body&gt;&lt;/html&gt;
WS01$ nc -zv 10.30.0.20 3306
nc: connect to 10.30.0.20 port 3306 (tcp) timed out: Operation now in progress</pre>

<h3>Lab 2 walk-through: script folder mein leaked secrets</h3>
<p>Review finding kehti hai backup.py aur deploy.sh mein hard-coded credentials hain aur TLS checks band hain. Workflow wahi: dhoondho, narrowly fix karo, prove karo, aur leaked values handle karo.</p>
<p>File names aur line numbers print karne wali recursive, case-insensitive search se <b>dhoondho</b>:</p>
<pre class="out">BUILD01$ grep -rniE "password|token|secret|Sup3r" .
backup.py:7:API_TOKEN = "nk-sim-7f3a91c2d4e85b60"
deploy.sh:4:curl -k -u admin:<span class="hl">Sup3rS3cret</span> -X PUT "$DEVICE/api/banner" -d @banner.json
BUILD01$ grep -rnE "verify=False|curl -k" .
backup.py:10: ... verify=False)
deploy.sh:4:curl -k -u admin:Sup3rS3cret ...</pre>
<p>Do files mein secrets hain, aur dono TLS verification band karti hain. Chaar moves mein <b>fix</b>: (1) values ko <code>export NAME=value</code> lines ke saath <code>.env</code> mein likho aur <code>chmod 600</code>; (2) <code>.env</code> ko <code>.gitignore</code> mein daalo; (3) <code>sed -i</code> se literals ko <code>os.environ["NK_API_TOKEN"]</code> aur <code>"admin:$DEVICE_PASS"</code> se badlo; (4) <code>verify=False</code> aur <code>curl -k</code> hatao. Secrets print kiye bina <b>prove</b> karo: <code>source .env</code> phir <code>env | grep -c</code> se variables gino, aur folder mein purani values dobara grep karo (woh sirf protected .env mein bachi reh sakti hain). <b>Leak handle karo</b>: purana token aur password files mein the aur shayad Git history mein, isliye unhe sirf move nahi, <b>rotate</b> karna hai.</p>

<h3>Common fault patterns, ek table</h3>
<table class="cmp"><tr><th>Aap kya observe karte ho</th><th>Matlab</th><th>Kahan dekho</th></tr>
<tr><td>Galat page, par page</td><td>DNS ya LB users ko doosre (shayad purane) server par bhejta hai</td><td>dig, A record, split views, LB pool</td></tr>
<tr><td>Timeout</td><td>Packets drop ho rahe hain</td><td>Firewall rules aur log, security groups, routing</td></tr>
<tr><td>Connection refused</td><td>Host pahunch gaya, kuch sun nahi raha</td><td>Service status, port, bind address</td></tr>
<tr><td>Certificate error</td><td>Name mismatch, expired, untrusted issuer</td><td>Certificate dates aur names, CA bundle</td></tr>
<tr><td>401</td><td>Authenticated nahi</td><td>Token ya password, expiry, header</td></tr>
<tr><td>403</td><td>Authenticated par allowed nahi</td><td>Role, scope, policy</td></tr>
<tr><td>Sirf ek subnet se chalta hai</td><td>Source-specific rule ya split-horizon</td><td>Rule ka source field, DNS view</td></tr>
</table>
<div class="warn"><p><b>Common mistakes.</b> Pehla fault theek karke jeet ka elaan karna (ticket mein do the); sirf IP se test karna; ek saath kai cheezein badalna taaki pata na chale kya kaam kiya; "jo blocked rehna chahiye" check skip karna; secret ko file se nikalna par rotate na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jab question symptom plus tool output deta hai, layer se jawab do: timeout matlab firewall, refused matlab service, NXDOMAIN matlab DNS, 401 matlab authentication, 403 matlab authorization.</p></div>

<div class="scn"><h4>Do faults, ek ticket</h4><p>Ek hospital ka booking portal hardening weekend ke baad "down" ho gaya. Pehle engineer ne dekha ki DNS record ab bhi purane address par hai, theek kiya aur ticket close kar diya. Bees minute baad wahi users dobara bole: page ab time out ho raha hai. Hardening ne host firewall rules replace kiye the aur 443 ki jagah 8443 allow kiya tha. Doosre engineer ne layer order follow kiya, block log padha, DPT=443 dekha aur rule sahi kiya. Post-incident note ne user subnet se naam se post-change test maanga.</p><p><b>Lesson:</b> har fix ke baad user ka test dohrao; agla fault pehle ke peeche chhupa hai.</p></div>

<div class="iv"><p class="q">"Mujhe batao 'application unreachable hai' ko kaise troubleshoot karoge."</p><p>Reproduce karo, phir layer by layer jao: naam resolve karke expected address se compare, path aur port test (timeout firewall ki taraf, refused missing listener ki taraf), curl se service call karke status code padhna (401 ya 403 credentials ya permissions ki taraf), aur har hop par logs dekhna. Sirf jo galat sabit hua use fix karo, user ki taraf se re-test karo, confirm karo ki blocked cheezein ab bhi blocked hain, aur cause aur ek preventive guard likho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Describe, layer locate, evidence, narrowly fix, prove, document.</li>
<li>Pehle naam (dig), phir port (nc: timeout ya refused), phir service (curl, status code).</li>
<li>Ek ticket mein do faults chhupe ho sakte hain; har fix ke baad user ka test dohrao.</li>
<li>Prove karo ki jo blocked rehna chahiye woh ab bhi blocked hai.</li>
<li>File mein tha to secret rotate hota hai, sirf move nahi.</li>
</ul></div>
`}};export{e as default};