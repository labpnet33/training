var e={id:`snort3-architecture`,h:{en:`Snort 3 architecture: LINA, Snort and the order of checks`,hi:`Snort 3 architecture: LINA, Snort aur checks ka order`},body:{en:`
<p>Imagine a parcel sorting centre with two teams. The <b>conveyor team</b> is fast: it reads the label, checks the postcode, routes the parcel and stamps it. The <b>inspection lab</b> is slower but clever: it opens the box, scans the contents and can stop a dangerous parcel. Parcels that are obviously fine, such as sealed bulk mail from a trusted partner, skip the lab completely. Threat Defense has exactly these two teams. <b>LINA</b> is the conveyor, built from ASA code. <b>Snort 3</b> is the inspection lab. Knowing which team does what, and in which order, is the single most useful skill for designing and troubleshooting an NGFW.</p>

<h3>Two engines in one box</h3>
<dl class="terms">
<dt>LINA</dt><dd>The data-plane engine that came from the ASA. It owns interfaces, routing, NAT, VPN, the connection table, the <b>prefilter policy</b> and a compiled access list built from your access control rules. It works on layers 2 to 4.</dd>
<dt>Snort 3</dt><dd>The open-source inspection engine maintained by Cisco Talos. It identifies applications, looks up URLs, applies Security Intelligence, decrypts TLS, runs intrusion rules and inspects files. It works up to layer 7. Snort 3 is one multi-threaded process with modules called <b>inspectors</b>; the older Snort 2 ran several separate processes with <b>preprocessors</b>.</dd>
<dt>Verdict</dt><dd>Snort's answer back to LINA for a packet or a whole flow: pass, drop, block the rest of the flow, or fast-forward the flow so later packets skip Snort.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Packet path through LINA and Snort">
<rect x="10" y="30" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="55" y="52" text-anchor="middle" class="svg-ink" font-size="12">Ingress</text><text x="55" y="68" text-anchor="middle" class="svg-muted" font-size="12">conn lookup</text>
<rect x="115" y="30" width="95" height="50" rx="8" fill="#bae6fd"/><text x="162" y="52" text-anchor="middle" class="svg-ink" font-size="12">Prefilter</text><text x="162" y="68" text-anchor="middle" class="svg-muted" font-size="12">fastpath/block</text>
<rect x="225" y="30" width="95" height="50" rx="8" fill="#bae6fd"/><text x="272" y="52" text-anchor="middle" class="svg-ink" font-size="12">NAT, route</text><text x="272" y="68" text-anchor="middle" class="svg-muted" font-size="12">LINA ACL</text>
<rect x="545" y="30" width="85" height="50" rx="8" fill="#e2e8f0"/><text x="587" y="52" text-anchor="middle" class="svg-ink" font-size="12">Egress</text><text x="587" y="68" text-anchor="middle" class="svg-muted" font-size="12">NAT, VPN</text>
<text x="160" y="20" class="svg-accent" font-size="12">LINA (layers 2-4)</text>
<rect x="60" y="140" width="95" height="56" rx="8" fill="#fde68a"/><text x="107" y="164" text-anchor="middle" class="svg-ink" font-size="12">1 Security</text><text x="107" y="180" text-anchor="middle" class="svg-ink" font-size="12">Intelligence</text>
<rect x="165" y="140" width="95" height="56" rx="8" fill="#fed7aa"/><text x="212" y="164" text-anchor="middle" class="svg-ink" font-size="12">2 Decryption</text><text x="212" y="180" text-anchor="middle" class="svg-muted" font-size="12">policy</text>
<rect x="270" y="140" width="95" height="56" rx="8" fill="#ddd6fe"/><text x="317" y="164" text-anchor="middle" class="svg-ink" font-size="12">3 Access rules</text><text x="317" y="180" text-anchor="middle" class="svg-muted" font-size="12">app, URL, user</text>
<rect x="375" y="140" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="422" y="164" text-anchor="middle" class="svg-ink" font-size="12">4 Intrusion</text><text x="422" y="180" text-anchor="middle" class="svg-muted" font-size="12">NAP + rules</text>
<rect x="480" y="140" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="527" y="164" text-anchor="middle" class="svg-ink" font-size="12">5 File and</text><text x="527" y="180" text-anchor="middle" class="svg-ink" font-size="12">malware</text>
<text x="250" y="225" class="svg-accent" font-size="12">Snort 3 (up to layer 7)</text>
<line x1="100" y1="55" x2="115" y2="55" stroke="#64748b" stroke-width="2"/><line x1="210" y1="55" x2="225" y2="55" stroke="#64748b" stroke-width="2"/>
<line x1="272" y1="80" x2="107" y2="140" stroke="#64748b" stroke-width="2"/><line x1="527" y1="140" x2="587" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="55" x2="545" y2="55" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/><text x="432" y="48" text-anchor="middle" class="svg-muted" font-size="12">fastpath / Trust</text>
<text x="320" y="255" text-anchor="middle" class="svg-muted" font-size="12">Any step can block; later steps then never run</text>
</svg><p class="cap">LINA handles the fast layer-2 to layer-4 work; Snort 3 makes the layer-7 decisions in a fixed order.</p></div>

<h3>The order of checks for a new connection</h3>
<ol>
<li><b>LINA ingress</b>: is this packet part of an existing connection? If yes, it follows that connection's verdict.</li>
<li><b>Prefilter policy</b>: <b>Fastpath</b> (skip Snort entirely), <b>Block</b>, or <b>Analyze</b> (continue). Use it for tunnels you want to inspect inside, or for trusted bulk flows such as backups.</li>
<li><b>NAT untranslate, route lookup and the LINA ACL</b>: simple zone, network and port rules can be decided here; anything that needs Snort is sent to Snort.</li>
<li><b>Security Intelligence</b>: IP, URL and DNS reputation. The earliest and cheapest Snort check.</li>
<li><b>Decryption policy</b>: decide whether the TLS session is decrypted.</li>
<li><b>Access control rules</b> evaluated top-down with application, URL, user and other layer-7 conditions. First match wins.</li>
<li><b>Deep inspection</b> on Allow rules: the network analysis policy normalises traffic, then the intrusion policy and the file and malware policy run.</li>
</ol>

<h3>Access control rule actions</h3>
<table class="cmp"><tr><th>Action</th><th>Result</th><th>Deep inspection?</th></tr>
<tr><td>Allow</td><td>pass, then inspect</td><td>yes: intrusion and file policy if attached</td></tr>
<tr><td>Trust</td><td>pass, fast-forward the flow</td><td>no</td></tr>
<tr><td>Monitor</td><td>log a match and keep evaluating the next rules</td><td>decided by a later rule</td></tr>
<tr><td>Block / Block with reset</td><td>drop silently / drop and send TCP reset</td><td>no</td></tr>
<tr><td>Interactive Block (with reset)</td><td>web only: show a warning page; the user may continue</td><td>yes if the user continues</td></tr></table>

<h3>How policies hang together</h3>
<p>The <b>access control policy</b> (NK-ACP in our labs) is the parent. It points to the prefilter policy, the decryption policy, the identity policy, the Security Intelligence settings and the <b>DNS policy</b>. Each Allow rule can point to an <b>intrusion policy</b> plus a <b>variable set</b>, and to a <b>file policy</b>. The <b>Advanced</b> tab sets the default network analysis policy and the intrusion policy used <i>before</i> a rule is matched. You edit them separately but deploy them together.</p>

<pre class="code"><span class="c">! Management Center navigation (7.x)</span>
Policies &gt; Access Control &gt; NK-ACP          <span class="c">! parent policy</span>
  Security Intelligence tab                   <span class="c">! networks, URLs, DNS policy</span>
  Rules tab &gt; rule &gt; Inspection               <span class="c">! intrusion policy, variable set, file policy</span>
  Advanced tab                                <span class="c">! NAP, default intrusion policy, TLS server identity</span>
Policies &gt; Intrusion | Malware &amp; File | Decryption | DNS
Deploy &gt; Deployment                          <span class="c">! push everything to FTD1</span></pre>

<pre class="out">&gt; show snort instances
Total number of instances available - 2
+----------+----------+
| INSTANCE |   PID    |
+----------+----------+
<span class="hl">| 1        | 20312    |</span>
| 2        | 20313    |
+----------+----------+</pre>

<div class="eg"><p><b>Worked example.</b> A nightly backup moves 4 TB from 10.0.2.20 to a partner over TCP 8443. Inspecting it would burn CPU for no security gain. Option A: a prefilter rule Fastpath for that source, destination and port: the flow never reaches Snort. Option B: an access control rule Trust: LINA still sends the first packets to Snort, Snort checks SI and the rule, then fast-forwards the rest. Option A saves more CPU; option B still gets Security Intelligence and connection logging from Snort.</p></div>

<div class="warn"><p><b>Common mistake.</b> Putting a broad Trust or Fastpath rule at the top "temporarily" while testing. Everything it matches skips intrusion, file and most Snort logging, and it is easy to forget. Scope such exceptions to exact hosts and ports and give them an owner and a review date.</p></div>

<div class="exam"><p><b>Exam trap.</b> Security Intelligence is checked <b>before</b> the access control rules, so a Trust rule does not stop an SI block. But prefilter Fastpath happens in LINA <b>before</b> Snort, so fast-pathed traffic is not checked by SI either.</p></div>

<div class="scn"><h4>The deploy that dropped VoIP calls</h4><p>A contact centre deployed a large intrusion policy change at 11:00. For a few seconds the Snort engine reloaded and voice calls stuttered. The engineer checked the deployment history: the change required an inspection restart. The team moved large policy deploys to the evening window and, on the inline set, kept Snort fail-open for "down" enabled as designed in sec-fw-deploy.</p><p><b>Lesson:</b> know which changes interrupt inspection and deploy them in a window.</p></div>

<div class="iv"><p class="q">"Walk me through what happens to the first packet of an HTTPS connection through Threat Defense."</p><p>LINA checks the connection table, then the prefilter policy, then NAT and routing and the LINA access list. The packet goes to Snort: Security Intelligence first, then the decryption policy, then access control rules with application and URL conditions, then on an Allow rule the network analysis and intrusion policy and the file policy. Snort returns a verdict to LINA, which applies egress NAT and sends the packet. Mention that application and URL matches need a few packets, and that Trust and Fastpath skip deep inspection.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LINA does layers 2 to 4 (interfaces, routing, NAT, VPN, prefilter); Snort 3 does layer 7.</li>
<li>Order: prefilter, SI, decryption, access rules, then intrusion and file inspection on Allow rules.</li>
<li>Allow inspects; Trust and Fastpath skip deep inspection; Monitor logs and continues.</li>
<li>The access control policy is the parent that links intrusion, file, decryption, DNS and SI settings.</li>
<li>Some deploys restart inspection: plan a window.</li>
</ul></div>
`,hi:`
<p>Ek parcel sorting centre socho jisme do teams hain. <b>Conveyor team</b> tez hai: label padhti hai, postcode check karti hai, parcel route karti hai aur stamp lagati hai. <b>Inspection lab</b> dheemi hai lekin hoshiyaar: box kholti hai, contents scan karti hai aur khatarnaak parcel rok sakti hai. Jo parcels saaf theek hain, jaise trusted partner ka sealed bulk mail, woh lab poori tarah skip karte hain. Threat Defense mein bilkul yahi do teams hain. <b>LINA</b> conveyor hai, ASA code se bana. <b>Snort 3</b> inspection lab hai. Kaunsi team kya karti hai aur kis order mein, yeh jaanna NGFW design aur troubleshoot karne ki sabse useful skill hai.</p>

<h3>Ek box mein do engines</h3>
<dl class="terms">
<dt>LINA</dt><dd>ASA se aaya data-plane engine. Interfaces, routing, NAT, VPN, connection table, <b>prefilter policy</b> aur aapke access control rules se bani compiled access list iske paas hai. Yeh layers 2 se 4 par kaam karta hai.</dd>
<dt>Snort 3</dt><dd>Cisco Talos ka maintain kiya open-source inspection engine. Yeh applications pehchanta hai, URLs lookup karta hai, Security Intelligence lagata hai, TLS decrypt karta hai, intrusion rules chalata hai aur files inspect karta hai. Yeh layer 7 tak kaam karta hai. Snort 3 ek multi-threaded process hai jisme <b>inspectors</b> naam ke modules hain; purana Snort 2 kai alag processes chalata tha jinme <b>preprocessors</b> the.</dd>
<dt>Verdict</dt><dd>Kisi packet ya poore flow ke liye Snort ka LINA ko jawab: pass, drop, baaki flow block, ya flow fast-forward taaki baad ke packets Snort skip karein.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="LINA aur Snort se packet ka raasta">
<rect x="10" y="30" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="55" y="52" text-anchor="middle" class="svg-ink" font-size="12">Ingress</text><text x="55" y="68" text-anchor="middle" class="svg-muted" font-size="12">conn lookup</text>
<rect x="115" y="30" width="95" height="50" rx="8" fill="#bae6fd"/><text x="162" y="52" text-anchor="middle" class="svg-ink" font-size="12">Prefilter</text><text x="162" y="68" text-anchor="middle" class="svg-muted" font-size="12">fastpath/block</text>
<rect x="225" y="30" width="95" height="50" rx="8" fill="#bae6fd"/><text x="272" y="52" text-anchor="middle" class="svg-ink" font-size="12">NAT, route</text><text x="272" y="68" text-anchor="middle" class="svg-muted" font-size="12">LINA ACL</text>
<rect x="545" y="30" width="85" height="50" rx="8" fill="#e2e8f0"/><text x="587" y="52" text-anchor="middle" class="svg-ink" font-size="12">Egress</text><text x="587" y="68" text-anchor="middle" class="svg-muted" font-size="12">NAT, VPN</text>
<text x="160" y="20" class="svg-accent" font-size="12">LINA (layers 2-4)</text>
<rect x="60" y="140" width="95" height="56" rx="8" fill="#fde68a"/><text x="107" y="164" text-anchor="middle" class="svg-ink" font-size="12">1 Security</text><text x="107" y="180" text-anchor="middle" class="svg-ink" font-size="12">Intelligence</text>
<rect x="165" y="140" width="95" height="56" rx="8" fill="#fed7aa"/><text x="212" y="164" text-anchor="middle" class="svg-ink" font-size="12">2 Decryption</text><text x="212" y="180" text-anchor="middle" class="svg-muted" font-size="12">policy</text>
<rect x="270" y="140" width="95" height="56" rx="8" fill="#ddd6fe"/><text x="317" y="164" text-anchor="middle" class="svg-ink" font-size="12">3 Access rules</text><text x="317" y="180" text-anchor="middle" class="svg-muted" font-size="12">app, URL, user</text>
<rect x="375" y="140" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="422" y="164" text-anchor="middle" class="svg-ink" font-size="12">4 Intrusion</text><text x="422" y="180" text-anchor="middle" class="svg-muted" font-size="12">NAP + rules</text>
<rect x="480" y="140" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="527" y="164" text-anchor="middle" class="svg-ink" font-size="12">5 File aur</text><text x="527" y="180" text-anchor="middle" class="svg-ink" font-size="12">malware</text>
<text x="250" y="225" class="svg-accent" font-size="12">Snort 3 (layer 7 tak)</text>
<line x1="100" y1="55" x2="115" y2="55" stroke="#64748b" stroke-width="2"/><line x1="210" y1="55" x2="225" y2="55" stroke="#64748b" stroke-width="2"/>
<line x1="272" y1="80" x2="107" y2="140" stroke="#64748b" stroke-width="2"/><line x1="527" y1="140" x2="587" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="55" x2="545" y2="55" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/><text x="432" y="48" text-anchor="middle" class="svg-muted" font-size="12">fastpath / Trust</text>
<text x="320" y="255" text-anchor="middle" class="svg-muted" font-size="12">Koi bhi step block kar sakta hai; phir baad ke steps nahi chalte</text>
</svg><p class="cap">LINA tez layer-2 se layer-4 kaam sambhalta hai; Snort 3 fixed order mein layer-7 faisle karta hai.</p></div>

<h3>Naye connection ke checks ka order</h3>
<ol>
<li><b>LINA ingress</b>: kya yeh packet kisi existing connection ka hissa hai? Agar haan, to woh us connection ka verdict follow karta hai.</li>
<li><b>Prefilter policy</b>: <b>Fastpath</b> (Snort poori tarah skip), <b>Block</b>, ya <b>Analyze</b> (aage badho). Ise un tunnels ke liye use karo jinke andar inspect karna hai, ya backups jaise trusted bulk flows ke liye.</li>
<li><b>NAT untranslate, route lookup aur LINA ACL</b>: simple zone, network aur port rules yahin decide ho sakti hain; jisko Snort chahiye woh Snort ko bheja jaata hai.</li>
<li><b>Security Intelligence</b>: IP, URL aur DNS reputation. Sabse pehla aur sasta Snort check.</li>
<li><b>Decryption policy</b>: decide karo ki TLS session decrypt hoga ya nahi.</li>
<li><b>Access control rules</b> upar se neeche application, URL, user aur baaki layer-7 conditions ke saath evaluate hoti hain. Pehli match jeetti hai.</li>
<li>Allow rules par <b>deep inspection</b>: network analysis policy traffic normalise karti hai, phir intrusion policy aur file aur malware policy chalti hain.</li>
</ol>

<h3>Access control rule actions</h3>
<table class="cmp"><tr><th>Action</th><th>Result</th><th>Deep inspection?</th></tr>
<tr><td>Allow</td><td>pass, phir inspect</td><td>haan: attached ho to intrusion aur file policy</td></tr>
<tr><td>Trust</td><td>pass, flow fast-forward</td><td>nahi</td></tr>
<tr><td>Monitor</td><td>match log karo aur agli rules evaluate karte raho</td><td>baad ki rule decide karti hai</td></tr>
<tr><td>Block / Block with reset</td><td>chupchaap drop / drop karke TCP reset bhejo</td><td>nahi</td></tr>
<tr><td>Interactive Block (with reset)</td><td>sirf web: warning page dikhao; user continue kar sakta hai</td><td>haan agar user continue kare</td></tr></table>

<h3>Policies aapas mein kaise judti hain</h3>
<p><b>Access control policy</b> (hamare labs mein NK-ACP) parent hai. Yeh prefilter policy, decryption policy, identity policy, Security Intelligence settings aur <b>DNS policy</b> ki taraf point karti hai. Har Allow rule ek <b>intrusion policy</b> plus <b>variable set</b>, aur ek <b>file policy</b> ki taraf point kar sakti hai. <b>Advanced</b> tab default network analysis policy aur rule match hone se <i>pehle</i> use hone wali intrusion policy set karta hai. Aap inhe alag-alag edit karte ho lekin saath deploy karte ho.</p>

<pre class="code"><span class="c">! Management Center navigation (7.x)</span>
Policies &gt; Access Control &gt; NK-ACP          <span class="c">! parent policy</span>
  Security Intelligence tab                   <span class="c">! networks, URLs, DNS policy</span>
  Rules tab &gt; rule &gt; Inspection               <span class="c">! intrusion policy, variable set, file policy</span>
  Advanced tab                                <span class="c">! NAP, default intrusion policy, TLS server identity</span>
Policies &gt; Intrusion | Malware &amp; File | Decryption | DNS
Deploy &gt; Deployment                          <span class="c">! sab kuch FTD1 par push karo</span></pre>

<pre class="out">&gt; show snort instances
Total number of instances available - 2
+----------+----------+
| INSTANCE |   PID    |
+----------+----------+
<span class="hl">| 1        | 20312    |</span>
| 2        | 20313    |
+----------+----------+</pre>

<div class="eg"><p><b>Worked example.</b> Ek nightly backup 10.0.2.20 se partner tak TCP 8443 par 4 TB le jaata hai. Ise inspect karna bina security fayde ke CPU jalayega. Option A: us source, destination aur port ke liye prefilter rule Fastpath: flow kabhi Snort tak nahi pahunchta. Option B: access control rule Trust: LINA pehle packets phir bhi Snort ko bhejta hai, Snort SI aur rule check karta hai, phir baaki ko fast-forward karta hai. Option A zyada CPU bachata hai; option B mein Snort se Security Intelligence aur connection logging phir bhi milti hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Testing ke dauraan "temporarily" upar ek broad Trust ya Fastpath rule daal dena. Jo bhi isse match hota hai woh intrusion, file aur zyada tar Snort logging skip karta hai, aur ise bhoolna aasaan hai. Aise exceptions ko exact hosts aur ports tak seemit rakho aur unhe owner aur review date do.</p></div>

<div class="exam"><p><b>Exam trap.</b> Security Intelligence access control rules se <b>pehle</b> check hoti hai, isliye Trust rule SI block ko nahi rokti. Lekin prefilter Fastpath LINA mein Snort se <b>pehle</b> hota hai, isliye fast-pathed traffic SI se bhi check nahi hota.</p></div>

<div class="scn"><h4>Deploy jisne VoIP calls gira diye</h4><p>Ek contact centre ne 11:00 baje bada intrusion policy change deploy kiya. Kuch seconds ke liye Snort engine reload hua aur voice calls atakne lage. Engineer ne deployment history check ki: change ko inspection restart chahiye tha. Team ne bade policy deploys shaam ki window mein shift kiye aur inline set par "down" ke liye Snort fail-open enabled rakha, jaisa sec-fw-deploy mein design kiya tha.</p><p><b>Lesson:</b> jaano kaunse changes inspection rokte hain aur unhe window mein deploy karo.</p></div>

<div class="iv"><p class="q">"Threat Defense se HTTPS connection ke pehle packet ke saath kya hota hai, step by step batao."</p><p>LINA connection table check karta hai, phir prefilter policy, phir NAT aur routing aur LINA access list. Packet Snort ke paas jaata hai: pehle Security Intelligence, phir decryption policy, phir application aur URL conditions wali access control rules, phir Allow rule par network analysis aur intrusion policy aur file policy. Snort LINA ko verdict lautata hai, jo egress NAT lagakar packet bhejta hai. Batao ki application aur URL match ko kuch packets chahiye, aur Trust aur Fastpath deep inspection skip karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LINA layers 2 se 4 karta hai (interfaces, routing, NAT, VPN, prefilter); Snort 3 layer 7 karta hai.</li>
<li>Order: prefilter, SI, decryption, access rules, phir Allow rules par intrusion aur file inspection.</li>
<li>Allow inspect karta hai; Trust aur Fastpath deep inspection skip karte hain; Monitor log karke aage badhta hai.</li>
<li>Access control policy parent hai jo intrusion, file, decryption, DNS aur SI settings ko jodti hai.</li>
<li>Kuch deploys inspection restart karte hain: window plan karo.</li>
</ul></div>
`}};export{e as default};