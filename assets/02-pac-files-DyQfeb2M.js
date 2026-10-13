var e={id:`pac-files`,h:{en:`PAC files: explicit proxy for the browser`,hi:`PAC files: browser ke liye explicit proxy`},body:{en:`
<h3>What a PAC file is</h3>
<p>A <b>PAC</b> (proxy auto-config) file is a small <b>JavaScript</b> program that the browser downloads and runs for every web address it is about to open. The program answers one question: "send this request through a proxy, or go direct?" The answer is a text string, either <code>DIRECT</code> or a proxy address such as <code>PROXY gateway.cloud.example:PORT</code>. The exact proxy host and port come from the vendor documentation; treat them as values to look up, not to memorise.</p>
<p>Jaipur Branch uses a PAC file. Its browsers are told to fetch the file from <code>h&#116;tp://pac.sahyadri.example/proxy.pac</code>, and the same address is saved in the portal as the PAC URL.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="PAC flow">
<rect x="10" y="20" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="42" text-anchor="middle" class="svg-ink" font-size="12">Browser on</text><text x="65" y="58" text-anchor="middle" class="svg-ink" font-size="12">PC-JPR</text>
<rect x="175" y="20" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="240" y="42" text-anchor="middle" class="svg-ink" font-size="12">PAC file rules</text><text x="240" y="58" text-anchor="middle" class="svg-muted" font-size="12">first match wins</text>
<rect x="360" y="20" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="420" y="42" text-anchor="middle" class="svg-ink" font-size="12">PROXY: cloud</text><text x="420" y="58" text-anchor="middle" class="svg-muted" font-size="12">policy and logs</text>
<rect x="360" y="100" width="120" height="50" rx="8" fill="#fed7aa"/><text x="420" y="122" text-anchor="middle" class="svg-ink" font-size="12">DIRECT</text><text x="420" y="138" text-anchor="middle" class="svg-muted" font-size="12">edge FW decides</text>
<rect x="530" y="100" width="100" height="50" rx="8" fill="#fde68a"/><text x="580" y="122" text-anchor="middle" class="svg-ink" font-size="12">Edge FW:</text><text x="580" y="138" text-anchor="middle" class="svg-ink" font-size="12">block direct</text>
<line x1="120" y1="45" x2="175" y2="45" stroke="#64748b" stroke-width="2"/><line x1="305" y1="45" x2="360" y2="45" stroke="#64748b" stroke-width="2"/><line x1="270" y1="70" x2="370" y2="110" stroke="#64748b" stroke-width="2"/><line x1="480" y1="125" x2="530" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">no rule matched means DIRECT</text>
</svg><p class="cap">A PAC only steers. At Jaipur, a DIRECT answer dies at the edge firewall.</p></div>

<h3>The rule model used in the portal</h3>
<p>The portal shows the PAC as an ordered list of <b>rules</b>. Each rule has a <b>pattern</b> (a host or domain) and a <b>via</b> (DIRECT or PROXY). The browser checks them from the top, the <b>first match wins</b>, and if none matches the answer is <b>DIRECT</b>. Under the hood this is the same as the JavaScript below.</p>
<pre class="code"><span class="c">// Generated from the ordered rules</span>
function FindProxyForURL(url, host) {
  if (shExpMatch(host, "*.sahyadri.example")) return "DIRECT";
  if (shExpMatch(host, "*.corp.example"))     return "DIRECT";
  return "PROXY gateway.cloud.example:PORT";   <span class="c">// everything else to the cloud</span>
}</pre>
<table class="cmp"><tr><th>#</th><th>Pattern</th><th>Via</th><th>Meaning</th></tr>
<tr><td>1</td><td>*.sahyadri.example</td><td>DIRECT</td><td>our own sites stay local</td></tr>
<tr><td>2</td><td>*.corp.example</td><td>DIRECT</td><td>internal names stay local</td></tr>
<tr><td>3</td><td>*</td><td>PROXY</td><td>all other web goes to the cloud</td></tr>
</table>

<h3>Four facts that break PAC deployments</h3>
<ul>
<li><b>Same URL on both sides.</b> The browser's configured PAC URL must equal the portal's PAC URL. If it is empty or different, the browser never loads the right rules and goes direct.</li>
<li><b>It only steers browsers.</b> Command-line tools, update agents and non-web protocols such as SSH ignore a PAC. From a PAC site they go direct, and an edge firewall that blocks direct internet drops them.</li>
<li><b>The edge must allow the cloud proxy.</b> The firewall must let the browser reach the proxy host; otherwise nothing leaves.</li>
<li><b>DIRECT is a hole.</b> Whatever a DIRECT rule names bypasses all policy, inspection and logging. At Jaipur it also fails, because the edge firewall blocks direct internet.</li>
</ul>

<h3>Lab zs-fwd-2: PAC file for Jaipur</h3>
<p>Goal: kabir's browser must send general web through the cloud. Steps: (1) on <b>Forwarding</b> set the PAC URL and rules, with the internal names DIRECT and a final PROXY rule; (2) Activate changes; (3) on PC-JPR, run <code>pac set</code> with that URL; (4) verify.</p>
<pre class="out">C:\\&gt; pac set h&#116;tp://pac.sahyadri.example/proxy.pac
PAC URL set.
C:\\&gt; pac test news.example
<span class="hl">news.example  -&gt;  PROXY (rule 3)</span>
C:\\&gt; curl news.example
200 OK   path: proxy   user: kabir   rule: (default allow)</pre>

<h3>Troubleshooting by method: three tickets</h3>
<p><b>320060, Jaipur cannot reach SaaS mail after a PAC "optimisation".</b> Symptom: mail.saas.example fails for everybody in Jaipur since Friday. Evidence: <code>pac test mail.saas.example</code> returns DIRECT; the audit log shows a new rule "mail.saas.example, DIRECT" above the final proxy rule; Jaipur's edge blocks direct. Root cause: someone bypassed mail to save cloud capacity, and the edge cannot send direct. Fix: remove the rule, Activate. Verify: <code>pac test</code> shows PROXY and curl returns 200 with a log line.</p>
<p><b>320080, the Sales social-media rule works in Pune but not in Jaipur.</b> Symptom: kabir opens social.example. Evidence: the tester says identity anonymous at Jaipur Branch, and the location shows authentication off. Root cause: with no sign-in the user is unknown, so a Sales rule cannot match. Fix: turn authentication on for the location and activate. Verify: the tester shows BLOCKED for kabir with the Sales rule.</p>
<p><b>321090, part two: Jaipur PCs point to a different PAC URL.</b> Symptom: Jaipur web ignores policy and nothing is logged. Evidence: <code>pac show</code> prints an address different from the portal's. Root cause: mismatch, so the browser goes direct. Fix: <code>pac set</code> the correct URL on the PCs (or correct the portal if the portal is the wrong one). Verify: <code>pac test</code> and a logged request. The GRE half of this ticket is in chapter 3.</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> A PAC rule changes which hostnames the browser sends to the proxy address rather than straight to the internet. PROXY means the request carries a full URL to the cloud, where policy and logs apply; DIRECT means a normal connection to the site, which at Jaipur is blocked.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Adding a "performance" DIRECT rule for a SaaS site without checking the edge. (2) Different PAC URLs in portal and browser. (3) Expecting a PAC to carry SSH or RDP. (4) Putting a catch-all rule above specific ones, so the specific ones are never reached.</p></div>
<div class="exam"><p><b>Exam trap.</b> "No PAC rule matches the host." The answer is DIRECT, not PROXY.</p></div>

<div class="scn"><h4>The Friday optimisation</h4><p>To reduce proxy load, an admin sent three SaaS apps DIRECT. At the Pune office (tunnel) nothing changed, but Jaipur lost mail, CRM and chat at once. The edge firewall there blocks direct internet by design, as the security team wanted. Reverting the three rules restored service in minutes.</p><p><b>Lesson:</b> a PAC change must be tested against the site that uses it.</p></div>

<div class="iv"><p class="q">"What is a PAC file and what are its limits?"</p><p>Strong answer: a JavaScript function that returns DIRECT or a proxy per request; browsers only; rules are evaluated in order, first match wins, no match means DIRECT; non-web traffic is not steered; the PAC URL on the device must match; DIRECT entries are unprotected and need an edge that allows them.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PAC is JavaScript that returns DIRECT or PROXY; first match wins; no match is DIRECT.</li>
<li>The browser's PAC URL must equal the portal's PAC URL.</li>
<li>A PAC steers browser web traffic only; other traffic goes direct.</li>
<li>The edge firewall must allow the cloud proxy; at Jaipur it blocks direct.</li>
<li>Debug with pac show, pac test, curl and the audit log.</li>
</ul></div>
`,hi:`
<h3>PAC file kya hai</h3>
<p><b>PAC</b> (proxy auto-config) file ek chhota <b>JavaScript</b> program hai jo browser download karta hai aur har web address ke liye chalata hai jo woh kholne wala hai. Program ek sawal ka jawab deta hai: "yeh request proxy se bhejo ya direct jao?" Jawab ek text string hota hai, ya to <code>DIRECT</code> ya proxy address jaise <code>PROXY gateway.cloud.example:PORT</code>. Exact proxy host aur port vendor documentation se aate hain; unhe yaad karne ke bajaye look up karne wali values samjho.</p>
<p>Jaipur Branch PAC file use karta hai. Uske browsers ko bataya gaya hai ki file <code>h&#116;tp://pac.sahyadri.example/proxy.pac</code> se fetch karo, aur wahi address portal mein PAC URL ke roop mein saved hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="PAC flow">
<rect x="10" y="20" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="42" text-anchor="middle" class="svg-ink" font-size="12">PC-JPR ka</text><text x="65" y="58" text-anchor="middle" class="svg-ink" font-size="12">browser</text>
<rect x="175" y="20" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="240" y="42" text-anchor="middle" class="svg-ink" font-size="12">PAC file rules</text><text x="240" y="58" text-anchor="middle" class="svg-muted" font-size="12">first match wins</text>
<rect x="360" y="20" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="420" y="42" text-anchor="middle" class="svg-ink" font-size="12">PROXY: cloud</text><text x="420" y="58" text-anchor="middle" class="svg-muted" font-size="12">policy aur logs</text>
<rect x="360" y="100" width="120" height="50" rx="8" fill="#fed7aa"/><text x="420" y="122" text-anchor="middle" class="svg-ink" font-size="12">DIRECT</text><text x="420" y="138" text-anchor="middle" class="svg-muted" font-size="12">edge FW decide karta</text>
<rect x="530" y="100" width="100" height="50" rx="8" fill="#fde68a"/><text x="580" y="122" text-anchor="middle" class="svg-ink" font-size="12">Edge FW:</text><text x="580" y="138" text-anchor="middle" class="svg-ink" font-size="12">direct block</text>
<line x1="120" y1="45" x2="175" y2="45" stroke="#64748b" stroke-width="2"/><line x1="305" y1="45" x2="360" y2="45" stroke="#64748b" stroke-width="2"/><line x1="270" y1="70" x2="370" y2="110" stroke="#64748b" stroke-width="2"/><line x1="480" y1="125" x2="530" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">koi rule match na ho to DIRECT</text>
</svg><p class="cap">PAC sirf steer karta hai. Jaipur mein DIRECT jawab edge firewall par dam tod deta hai.</p></div>

<h3>Portal mein use hone wala rule model</h3>
<p>Portal PAC ko <b>rules</b> ki ordered list ke roop mein dikhata hai. Har rule mein ek <b>pattern</b> (host ya domain) aur ek <b>via</b> (DIRECT ya PROXY) hota hai. Browser upar se check karta hai, <b>first match wins</b>, aur koi match na ho to jawab <b>DIRECT</b>. Andar se yeh neeche wale JavaScript jaisa hi hai.</p>
<pre class="code"><span class="c">// Ordered rules se generate hua</span>
function FindProxyForURL(url, host) {
  if (shExpMatch(host, "*.sahyadri.example")) return "DIRECT";
  if (shExpMatch(host, "*.corp.example"))     return "DIRECT";
  return "PROXY gateway.cloud.example:PORT";   <span class="c">// baaki sab cloud ko</span>
}</pre>
<table class="cmp"><tr><th>#</th><th>Pattern</th><th>Via</th><th>Matlab</th></tr>
<tr><td>1</td><td>*.sahyadri.example</td><td>DIRECT</td><td>hamari apni sites local rehti hain</td></tr>
<tr><td>2</td><td>*.corp.example</td><td>DIRECT</td><td>internal names local rehte hain</td></tr>
<tr><td>3</td><td>*</td><td>PROXY</td><td>baaki saara web cloud jaata hai</td></tr>
</table>

<h3>Chaar facts jo PAC deployments tod dete hain</h3>
<ul>
<li><b>Dono taraf same URL.</b> Browser ka configured PAC URL portal ke PAC URL ke barabar hona chahiye. Agar khaali ya alag hai to browser sahi rules kabhi load nahi karta aur direct jaata hai.</li>
<li><b>Yeh sirf browsers ko steer karta hai.</b> Command-line tools, update agents aur SSH jaise non-web protocols PAC ko ignore karte hain. PAC site se woh direct jaate hain, aur direct internet block karne wala edge firewall unhe drop kar deta hai.</li>
<li><b>Edge ko cloud proxy allow karni chahiye.</b> Firewall ko browser ko proxy host tak pahunchne dena chahiye; warna kuch bahar nahi jaata.</li>
<li><b>DIRECT ek hole hai.</b> Jo bhi DIRECT rule mein naam hai woh saari policy, inspection aur logging bypass karta hai. Jaipur mein woh fail bhi hota hai, kyunki edge firewall direct internet block karta hai.</li>
</ul>

<h3>Lab zs-fwd-2: Jaipur ke liye PAC file</h3>
<p>Goal: kabir ke browser ko general web cloud se bhejna hai. Steps: (1) <b>Forwarding</b> par PAC URL aur rules set karo, internal names DIRECT aur aakhir mein ek PROXY rule ke saath; (2) Activate changes; (3) PC-JPR par us URL ke saath <code>pac set</code> chalao; (4) verify karo.</p>
<pre class="out">C:\\&gt; pac set h&#116;tp://pac.sahyadri.example/proxy.pac
PAC URL set.
C:\\&gt; pac test news.example
<span class="hl">news.example  -&gt;  PROXY (rule 3)</span>
C:\\&gt; curl news.example
200 OK   path: proxy   user: kabir   rule: (default allow)</pre>

<h3>Method se troubleshooting: teen tickets</h3>
<p><b>320060, PAC "optimisation" ke baad Jaipur SaaS mail tak nahi pahunchta.</b> Symptom: Jaipur mein Friday se sabke liye mail.saas.example fail hai. Evidence: <code>pac test mail.saas.example</code> DIRECT deta hai; audit log final proxy rule ke upar naya rule "mail.saas.example, DIRECT" dikhata hai; Jaipur ka edge direct block karta hai. Root cause: kisi ne cloud capacity bachane ke liye mail bypass kiya, aur edge direct nahi bhej sakta. Fix: rule hatao, Activate. Verify: <code>pac test</code> PROXY dikhata hai aur curl log line ke saath 200 deta hai.</p>
<p><b>320080, Sales ka social-media rule Pune mein chalta hai lekin Jaipur mein nahi.</b> Symptom: kabir social.example khol leta hai. Evidence: tester Jaipur Branch par identity anonymous batata hai, aur location authentication off dikhati hai. Root cause: sign-in ke bina user unknown hai, to Sales rule match nahi kar sakta. Fix: location ke liye authentication on karo aur activate karo. Verify: tester kabir ke liye Sales rule ke saath BLOCKED dikhata hai.</p>
<p><b>321090, part two: Jaipur PCs alag PAC URL par point karte hain.</b> Symptom: Jaipur web policy ignore karta hai aur kuch log nahi hota. Evidence: <code>pac show</code> portal se alag address print karta hai. Root cause: mismatch, to browser direct jaata hai. Fix: PCs par sahi URL <code>pac set</code> karo (ya agar portal galat hai to portal sahi karo). Verify: <code>pac test</code> aur ek logged request. Is ticket ka GRE half chapter 3 mein hai.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> PAC rule badalta hai ki browser kaun se hostnames proxy address ko bhejta hai aur kaun se seedha internet ko. PROXY ka matlab request full URL ke saath cloud jaati hai, jahan policy aur logs lagte hain; DIRECT ka matlab site se normal connection, jo Jaipur mein blocked hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Edge check kiye bina SaaS site ke liye "performance" DIRECT rule add karna. (2) Portal aur browser mein alag PAC URLs. (3) PAC se SSH ya RDP carry hone ki ummeed. (4) Catch-all rule ko specific rules ke upar rakhna, to specific rules tak baat pahunchti hi nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Host ke liye koi PAC rule match nahi karta." Jawab DIRECT hai, PROXY nahi.</p></div>

<div class="scn"><h4>Friday ka optimisation</h4><p>Proxy load kam karne ke liye ek admin ne teen SaaS apps ko DIRECT bhej diya. Pune office (tunnel) mein kuch nahi badla, lekin Jaipur ne mail, CRM aur chat ek saath kho diye. Wahan ka edge firewall design se direct internet block karta hai, jaisa security team chahti thi. Teeno rules revert karne se kuch minutes mein service wapas aa gayi.</p><p><b>Seekh:</b> PAC change ko us site par test karo jo use use karti hai.</p></div>

<div class="iv"><p class="q">"PAC file kya hai aur uski limits kya hain?"</p><p>Strong answer: ek JavaScript function jo har request ke liye DIRECT ya proxy return karta hai; sirf browsers; rules order mein evaluate hote hain, first match wins, no match ka matlab DIRECT; non-web traffic steer nahi hota; device par PAC URL match karna chahiye; DIRECT entries unprotected hain aur unhe allow karne wala edge chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PAC JavaScript hai jo DIRECT ya PROXY return karta hai; first match wins; no match DIRECT.</li>
<li>Browser ka PAC URL portal ke PAC URL ke barabar hona chahiye.</li>
<li>PAC sirf browser web traffic steer karta hai; baaki direct jaata hai.</li>
<li>Edge firewall ko cloud proxy allow karni chahiye; Jaipur mein woh direct block karta hai.</li>
<li>pac show, pac test, curl aur audit log se debug karo.</li>
</ul></div>
`}};export{e as default};