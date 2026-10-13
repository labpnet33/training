var e={id:`detecting-exfiltration`,h:{en:`Detecting exfiltration: DNS, HTTPS and cloud indicators, and the controls that stop it`,hi:`Exfiltration detect karna: DNS, HTTPS aur cloud indicators, aur use rokne wale controls`},body:{en:`
<p>A bank does not read every transaction by hand. Its fraud system looks for patterns: a payment far larger than your usual amount, a brand-new payee abroad, ten transfers at three in the morning. One unusual sign is a question; several together are a blocked card and a phone call. Detecting exfiltration works the same way. You rarely see the stolen data itself, because it is encoded or encrypted. You see the <b>shape</b> of the traffic, and you decide when the shape is wrong.</p>

<h3>Where the evidence comes from</h3>
<ul>
<li><b>DNS logs</b>: the internal resolver's query log, or the protective resolver (Umbrella, Secure Access) logs with the category and verdict of each domain.</li>
<li><b>Web proxy and SWG logs</b>: destination, category, reputation, and bytes sent and received per request.</li>
<li><b>Firewall connection events</b>: Threat Defense and ASA record source, destination, application and byte counts in each direction.</li>
<li><b>NetFlow and IPFIX</b>: every conversation on routers and switches, even where there is no firewall (chapter 8).</li>
<li><b>Endpoint telemetry</b>: which <i>process</i> made the connection, from Secure Endpoint, which is decisive when you need to know whether it was a browser or an unknown tool.</li>
<li><b>SSE / CASB</b>: which cloud application and which <i>instance</i> (company or personal account) received the upload.</li>
</ul>

<h3>DNS tunnelling indicators</h3>
<dl class="terms">
<dt>Query length</dt><dd>Normal names are short; tunnel queries are close to the limits. Names over about 50 characters deserve a look.</dd>
<dt>Randomness (entropy)</dt><dd>Encoded data looks like random letters and digits, unlike words such as <code>mail</code> or <code>update</code>.</dd>
<dt>Unique subdomains per parent domain</dt><dd>A tunnel creates thousands of distinct names under one parent; a normal site uses a handful.</dd>
<dt>Record types</dt><dd>A high share of TXT, NULL or other unusual types from an ordinary workstation.</dd>
<dt>Volume per host</dt><dd>One host making far more queries than its peers, often at a steady rate around the clock.</dd>
<dt>Resolver bypass</dt><dd>Workstations sending port 53 directly to the internet instead of to the internal resolvers, or using DNS over HTTPS (DoH) to an outside provider, which hides the queries inside HTTPS.</dd>
</dl>

<h3>HTTPS and cloud indicators</h3>
<ul>
<li><b>Upload ratio</b>: normal browsing downloads far more than it uploads. A host sending ten times more than it receives to one destination is suspicious.</li>
<li><b>New or low-reputation destinations</b>: a domain first seen yesterday, or a category such as "newly seen domains".</li>
<li><b>Beaconing</b>: connections at a regular interval (every 60 seconds, plus or minus a few) to the same host, typical of command and control.</li>
<li><b>TLS anomalies</b>: self-signed or brand-new certificates, unusual client fingerprints; Encrypted Traffic Analytics can classify encrypted flows without decrypting them.</li>
<li><b>Unsanctioned cloud instances</b>: uploads to a personal account of a service the company also uses.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Layers of exfiltration detection">
<rect x="10" y="30" width="140" height="160" rx="8" fill="#bbf7d0"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">Endpoint</text><text x="80" y="80" text-anchor="middle" class="svg-muted" font-size="11">which process</text><text x="80" y="98" text-anchor="middle" class="svg-muted" font-size="11">file staging</text>
<rect x="170" y="30" width="140" height="160" rx="8" fill="#bae6fd"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="13">DNS layer</text><text x="240" y="80" text-anchor="middle" class="svg-muted" font-size="11">length, entropy</text><text x="240" y="98" text-anchor="middle" class="svg-muted" font-size="11">volume, TXT</text>
<rect x="330" y="30" width="140" height="160" rx="8" fill="#fde68a"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="13">Network edge</text><text x="400" y="80" text-anchor="middle" class="svg-muted" font-size="11">bytes out, flows</text><text x="400" y="98" text-anchor="middle" class="svg-muted" font-size="11">beacons, ports</text>
<rect x="490" y="30" width="140" height="160" rx="8" fill="#ddd6fe"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="13">Cloud / SSE</text><text x="560" y="80" text-anchor="middle" class="svg-muted" font-size="11">app + instance</text><text x="560" y="98" text-anchor="middle" class="svg-muted" font-size="11">DLP match</text>
<text x="320" y="220" text-anchor="middle" class="svg-accent" font-size="12">Correlate the layers in the SIEM or XDR for one confident verdict</text>
</svg><p class="cap">Each layer sees part of the story; together they separate a real tunnel from a noisy but harmless application.</p></div>

<h3>Turning indicators into searches</h3>
<p>Two illustrative Splunk searches (the full SPL is taught in chapter 10). The first ranks hosts by long, unique DNS names; the second finds large uploads:</p>
<pre class="code">index=dns | eval qlen=len(query) | where qlen&gt;50
| stats count dc(query) AS unique BY host | sort -unique

index=proxy | stats sum(bytes_out) AS out sum(bytes_in) AS in BY src_ip dest
| eval ratio=round(out/in,1) | where out&gt;100000000 AND ratio&gt;10</pre>

<h3>Controls that stop the channel</h3>
<p>Detection is half the job; the other half is making the channel hard to use. For DNS, allow port 53 out only from your resolvers, send all workstation DNS through a protective resolver that blocks the "DNS tunnelling" and newly seen categories, and block known DoH providers so DNS cannot hide in HTTPS. On an ASA edge this is a few lines:</p>
<pre class="code"><span class="c">! only the internal resolver 10.10.0.53 may query the internet</span>
access-list INSIDE_IN extended permit udp host 10.10.0.53 any eq domain
access-list INSIDE_IN extended permit tcp host 10.10.0.53 any eq domain
access-list INSIDE_IN extended deny udp any any eq domain log
access-list INSIDE_IN extended deny tcp any any eq domain log
access-list INSIDE_IN extended permit ip 10.10.0.0 255.255.255.0 any
access-group INSIDE_IN in interface inside</pre>
<pre class="out">ASA# show access-list INSIDE_IN | include domain
access-list INSIDE_IN line 1 extended permit udp host 10.10.0.53 any eq domain (hitcnt=48211)
access-list INSIDE_IN line 2 extended permit tcp host 10.10.0.53 any eq domain (hitcnt=312)
<span class="hl">access-list INSIDE_IN line 3 extended deny udp any any eq domain log informational interval 300 (hitcnt=1877)</span>
access-list INSIDE_IN line 4 extended deny tcp any any eq domain log informational interval 300 (hitcnt=0)</pre>
<p>The 1,877 hits on line 3 are hosts trying to bypass the resolver: each one is worth checking. For HTTPS and cloud, use the SWG and SSE application control with DLP (taught in the SSE module), and the Threat Defense Security Intelligence and DNS policies (taught in the NGFW policies module).</p>

<div class="eg"><p><b>Worked example: the upload ratio.</b> A laptop sent 1.8 GB to <code>files.storage.example</code> and received 22 MB back in two hours. Ratio = 1,800 / 22, about 82. A typical user's ratio to the same category is below 0.2. Both thresholds in the search above are crossed (more than 100 MB out, ratio above 10), so the event is raised. The analyst then checks the endpoint: the process was a command-line archiver, not the sync client the company deploys.</p></div>

<div class="warn"><p><b>Common mistake.</b> Alerting on every long DNS name. Security products, CDNs and telemetry services legitimately encode hashes and IDs in DNS lookups, so a naive rule fires all day. Baseline first, then allow-list known services by parent domain, and alert on what remains.</p></div>

<div class="exam"><p><b>Exam trap.</b> DNS over HTTPS removes DNS visibility from the network unless you block or control it. Upload-heavy byte ratios point to exfiltration; download-heavy ratios are normal browsing. A host bypassing the internal resolver is an indicator in itself.</p></div>

<div class="scn"><h4>The tunnel that was an antivirus</h4><p>A new detection for "more than 5,000 unique subdomains per host per day" fired on 300 laptops at once. All the names belonged to the endpoint protection vendor's reputation lookup domain. The engineer added that parent domain to an allow-list and the next day the rule fired on exactly one server, which was querying a two-day-old domain with TXT records. That one was real, and the server was isolated within the hour.</p><p><b>Lesson:</b> tune behaviour rules against your own baseline; the single real alert is only visible once the noise is gone.</p></div>

<div class="iv"><p class="q">"How would you detect DNS tunnelling in an enterprise?"</p><p>Strong answer: centralise DNS (block direct outbound 53 and DoH, force a protective resolver), collect resolver logs into the SIEM, then look per host and per parent domain for query length, randomness, the number of unique subdomains, unusual record types such as TXT, and steady high rates. Correlate with endpoint data to find the process, allow-list legitimate services that encode data in DNS, and contain by isolating the host and blocking the domain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Evidence comes from DNS, proxy, firewall, NetFlow, endpoint and SSE logs; the endpoint tells you which process.</li>
<li>DNS tunnel signs: long, random, unique subdomains under one domain, TXT-heavy, high rate, resolver bypass.</li>
<li>HTTPS and cloud signs: upload-heavy ratios, new destinations, beaconing, TLS anomalies, personal cloud instances.</li>
<li>Controls: resolver-only port 53, protective DNS, block DoH, SWG/SSE with DLP and application control.</li>
<li>Baseline and allow-list before alerting, or the real event is lost in noise.</li>
</ul></div>
`,hi:`
<p>Bank har transaction haath se nahi padhta. Uska fraud system patterns dhoondhta hai: aapki usual amount se kahin badi payment, videsh mein ekdum naya payee, raat teen baje das transfers. Ek unusual sign ek sawaal hai; kai saath mein matlab blocked card aur ek phone call. Exfiltration detect karna aise hi kaam karta hai. Aap churaya hua data khud shayad hi dekhte ho, kyunki woh encoded ya encrypted hota hai. Aap traffic ka <b>shape</b> dekhte ho, aur tay karte ho ki shape kab galat hai.</p>

<h3>Evidence kahan se aata hai</h3>
<ul>
<li><b>DNS logs</b>: internal resolver ka query log, ya protective resolver (Umbrella, Secure Access) ke logs har domain ki category aur verdict ke saath.</li>
<li><b>Web proxy aur SWG logs</b>: har request ka destination, category, reputation, aur bheje aur receive hue bytes.</li>
<li><b>Firewall connection events</b>: Threat Defense aur ASA source, destination, application aur dono direction ke byte counts record karte hain.</li>
<li><b>NetFlow aur IPFIX</b>: routers aur switches par har conversation, wahan bhi jahan firewall nahi hai (chapter 8).</li>
<li><b>Endpoint telemetry</b>: Secure Endpoint se kaunse <i>process</i> ne connection banaya, jo decisive hai jab jaanna ho ki woh browser tha ya koi unknown tool.</li>
<li><b>SSE / CASB</b>: kaunsi cloud application aur kaunse <i>instance</i> (company ya personal account) ne upload receive kiya.</li>
</ul>

<h3>DNS tunnelling indicators</h3>
<dl class="terms">
<dt>Query length</dt><dd>Normal names chhote hote hain; tunnel queries limits ke kareeb hoti hain. Lagbhag 50 characters se lambe names dekhne laayak hain.</dd>
<dt>Randomness (entropy)</dt><dd>Encoded data random letters aur digits jaisa dikhta hai, <code>mail</code> ya <code>update</code> jaise words jaisa nahi.</dd>
<dt>Har parent domain par unique subdomains</dt><dd>Tunnel ek parent ke neeche hazaaron alag names banata hai; normal site mutthi bhar use karti hai.</dd>
<dt>Record types</dt><dd>Ordinary workstation se TXT, NULL ya doosre unusual types ka bada hissa.</dd>
<dt>Har host ka volume</dt><dd>Ek host apne peers se kahin zyada queries karta hai, aksar chaubees ghante steady rate par.</dd>
<dt>Resolver bypass</dt><dd>Workstations port 53 internal resolvers ki jagah seedhe internet par bhejte hain, ya bahar ke provider par DNS over HTTPS (DoH) use karte hain, jo queries ko HTTPS ke andar chhupata hai.</dd>
</dl>

<h3>HTTPS aur cloud indicators</h3>
<ul>
<li><b>Upload ratio</b>: normal browsing upload se kahin zyada download karti hai. Ek destination par receive se das guna zyada bhejne wala host suspicious hai.</li>
<li><b>Naye ya low-reputation destinations</b>: kal pehli baar dikha domain, ya "newly seen domains" jaisi category.</li>
<li><b>Beaconing</b>: same host par regular interval (har 60 seconds, kuch seconds upar neeche) par connections, command and control ki typical pehchaan.</li>
<li><b>TLS anomalies</b>: self-signed ya ekdum naye certificates, unusual client fingerprints; Encrypted Traffic Analytics bina decrypt kiye encrypted flows classify kar sakta hai.</li>
<li><b>Unsanctioned cloud instances</b>: us service ke personal account par uploads jo company bhi use karti hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Layers of exfiltration detection">
<rect x="10" y="30" width="140" height="160" rx="8" fill="#bbf7d0"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">Endpoint</text><text x="80" y="80" text-anchor="middle" class="svg-muted" font-size="11">kaunsa process</text><text x="80" y="98" text-anchor="middle" class="svg-muted" font-size="11">file staging</text>
<rect x="170" y="30" width="140" height="160" rx="8" fill="#bae6fd"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="13">DNS layer</text><text x="240" y="80" text-anchor="middle" class="svg-muted" font-size="11">length, entropy</text><text x="240" y="98" text-anchor="middle" class="svg-muted" font-size="11">volume, TXT</text>
<rect x="330" y="30" width="140" height="160" rx="8" fill="#fde68a"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="13">Network edge</text><text x="400" y="80" text-anchor="middle" class="svg-muted" font-size="11">bytes out, flows</text><text x="400" y="98" text-anchor="middle" class="svg-muted" font-size="11">beacons, ports</text>
<rect x="490" y="30" width="140" height="160" rx="8" fill="#ddd6fe"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="13">Cloud / SSE</text><text x="560" y="80" text-anchor="middle" class="svg-muted" font-size="11">app + instance</text><text x="560" y="98" text-anchor="middle" class="svg-muted" font-size="11">DLP match</text>
<text x="320" y="220" text-anchor="middle" class="svg-accent" font-size="12">Ek confident verdict ke liye layers ko SIEM ya XDR mein correlate karo</text>
</svg><p class="cap">Har layer kahani ka ek hissa dekhti hai; saath milkar woh asli tunnel ko noisy par harmless application se alag karti hain.</p></div>

<h3>Indicators ko searches mein badalna</h3>
<p>Do illustrative Splunk searches (poora SPL chapter 10 mein sikhaya hai). Pehli hosts ko lambe, unique DNS names se rank karti hai; doosri bade uploads dhoondhti hai:</p>
<pre class="code">index=dns | eval qlen=len(query) | where qlen&gt;50
| stats count dc(query) AS unique BY host | sort -unique

index=proxy | stats sum(bytes_out) AS out sum(bytes_in) AS in BY src_ip dest
| eval ratio=round(out/in,1) | where out&gt;100000000 AND ratio&gt;10</pre>

<h3>Channel rokne wale controls</h3>
<p>Detection aadha kaam hai; baaki aadha channel ko use karna mushkil banana hai. DNS ke liye, port 53 bahar sirf apne resolvers se allow karo, saara workstation DNS ek protective resolver se bhejo jo "DNS tunnelling" aur newly seen categories block kare, aur known DoH providers block karo taaki DNS HTTPS mein na chhup sake. ASA edge par yeh kuch lines hain:</p>
<pre class="code"><span class="c">! sirf internal resolver 10.10.0.53 internet ko query kar sakta hai</span>
access-list INSIDE_IN extended permit udp host 10.10.0.53 any eq domain
access-list INSIDE_IN extended permit tcp host 10.10.0.53 any eq domain
access-list INSIDE_IN extended deny udp any any eq domain log
access-list INSIDE_IN extended deny tcp any any eq domain log
access-list INSIDE_IN extended permit ip 10.10.0.0 255.255.255.0 any
access-group INSIDE_IN in interface inside</pre>
<pre class="out">ASA# show access-list INSIDE_IN | include domain
access-list INSIDE_IN line 1 extended permit udp host 10.10.0.53 any eq domain (hitcnt=48211)
access-list INSIDE_IN line 2 extended permit tcp host 10.10.0.53 any eq domain (hitcnt=312)
<span class="hl">access-list INSIDE_IN line 3 extended deny udp any any eq domain log informational interval 300 (hitcnt=1877)</span>
access-list INSIDE_IN line 4 extended deny tcp any any eq domain log informational interval 300 (hitcnt=0)</pre>
<p>Line 3 par 1,877 hits woh hosts hain jo resolver bypass karne ki koshish kar rahe hain: har ek check karne laayak hai. HTTPS aur cloud ke liye, DLP ke saath SWG aur SSE application control use karo (SSE module mein sikhaya), aur Threat Defense Security Intelligence aur DNS policies (NGFW policies module mein sikhaya).</p>

<div class="eg"><p><b>Worked example: upload ratio.</b> Ek laptop ne do ghante mein <code>files.storage.example</code> ko 1.8 GB bheja aur 22 MB wapas receive kiya. Ratio = 1,800 / 22, lagbhag 82. Same category par typical user ka ratio 0.2 se neeche hai. Upar ki search ke dono thresholds cross hue (100 MB se zyada out, ratio 10 se upar), isliye event raise hota hai. Phir analyst endpoint check karta hai: process ek command-line archiver tha, company ka deploy kiya sync client nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> Har lambe DNS name par alert karna. Security products, CDNs aur telemetry services legitimately DNS lookups mein hashes aur IDs encode karte hain, isliye naive rule din bhar fire hota hai. Pehle baseline banao, phir known services ko parent domain se allow-list karo, aur jo bache us par alert karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> DNS over HTTPS network se DNS visibility hata deta hai jab tak aap use block ya control na karo. Upload-heavy byte ratios exfiltration ki taraf ishara karte hain; download-heavy ratios normal browsing hain. Internal resolver bypass karne wala host khud ek indicator hai.</p></div>

<div class="scn"><h4>Woh tunnel jo antivirus nikla</h4><p>"Har host par roz 5,000 se zyada unique subdomains" ka naya detection ek saath 300 laptops par fire hua. Saare names endpoint protection vendor ke reputation lookup domain ke the. Engineer ne woh parent domain allow-list mein joda aur agle din rule sirf ek server par fire hua, jo TXT records ke saath do din purane domain ko query kar raha tha. Woh asli tha, aur server ek ghante mein isolate hua.</p><p><b>Seekh:</b> behaviour rules ko apne baseline ke against tune karo; ek asli alert tabhi dikhta hai jab noise chala jaaye.</p></div>

<div class="iv"><p class="q">"Enterprise mein DNS tunnelling kaise detect karoge?"</p><p>Strong answer: DNS centralise karo (direct outbound 53 aur DoH block, protective resolver force karo), resolver logs SIEM mein collect karo, phir har host aur har parent domain ke liye query length, randomness, unique subdomains ki sankhya, TXT jaise unusual record types, aur steady high rates dekho. Process dhoondhne ke liye endpoint data se correlate karo, DNS mein data encode karne wali legitimate services allow-list karo, aur host isolate karke aur domain block karke contain karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Evidence DNS, proxy, firewall, NetFlow, endpoint aur SSE logs se aata hai; endpoint batata hai kaunsa process.</li>
<li>DNS tunnel signs: ek domain ke neeche lambe, random, unique subdomains, TXT-heavy, high rate, resolver bypass.</li>
<li>HTTPS aur cloud signs: upload-heavy ratios, naye destinations, beaconing, TLS anomalies, personal cloud instances.</li>
<li>Controls: sirf resolver ke liye port 53, protective DNS, DoH block, DLP aur application control ke saath SWG/SSE.</li>
<li>Alert karne se pehle baseline aur allow-list karo, warna asli event noise mein kho jaata hai.</li>
</ul></div>
`}};export{e as default};