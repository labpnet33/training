var e={id:`stack`,h:{en:`The security stack, layer by layer`,hi:`Security stack, layer dar layer`},body:{en:`
<p>A modern bank branch has a guard at the door, a metal detector, cameras, a vault with a time lock, staff ID cards, a manager who approves large withdrawals and a head office that watches all branches at once. Each serves a different purpose, and together they form a system. An enterprise network has its own "security stack". This chapter walks it from the internet edge down to the user and the SOC, so that every product in this track has a clear place.</p>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="Enterprise security stack">
<rect x="200" y="8" width="240" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">Internet and SaaS apps</text>
<rect x="10" y="8" width="170" height="80" rx="8" fill="#bbf7d0"/><text x="95" y="30" text-anchor="middle" class="svg-ink" font-size="13">Cloud security</text><text x="95" y="50" text-anchor="middle" class="svg-muted" font-size="12">SSE: SWG, DNS,</text><text x="95" y="68" text-anchor="middle" class="svg-muted" font-size="12">CASB, ZTNA, FWaaS</text>
<rect x="460" y="8" width="170" height="60" rx="8" fill="#fde68a"/><text x="545" y="32" text-anchor="middle" class="svg-ink" font-size="13">Email security</text><text x="545" y="52" text-anchor="middle" class="svg-muted" font-size="12">gateway, sandbox</text>
<line x1="320" y1="44" x2="320" y2="70" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="70" width="240" height="46" rx="8" fill="#fed7aa"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">Perimeter NGFW + IPS</text><text x="320" y="107" text-anchor="middle" class="svg-muted" font-size="12">zones, NAT, app, URL, files</text>
<line x1="440" y1="93" x2="480" y2="93" stroke="#64748b" stroke-width="2"/>
<rect x="480" y="78" width="150" height="36" rx="8" fill="#e2e8f0"/><text x="555" y="101" text-anchor="middle" class="svg-ink" font-size="13">DMZ servers</text>
<line x1="320" y1="116" x2="320" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="140" width="240" height="46" rx="8" fill="#bae6fd"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">Campus switches</text><text x="320" y="177" text-anchor="middle" class="svg-muted" font-size="12">802.1X, segmentation, L2 security</text>
<line x1="440" y1="163" x2="480" y2="163" stroke="#64748b" stroke-width="2"/>
<rect x="480" y="140" width="150" height="46" rx="8" fill="#ddd6fe"/><text x="555" y="160" text-anchor="middle" class="svg-ink" font-size="13">NAC / identity</text><text x="555" y="177" text-anchor="middle" class="svg-muted" font-size="12">ISE, MFA, SSO</text>
<line x1="320" y1="186" x2="320" y2="210" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="210" width="240" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="230" text-anchor="middle" class="svg-ink" font-size="13">Endpoints and servers</text><text x="320" y="247" text-anchor="middle" class="svg-muted" font-size="12">EDR agent, VPN client, posture</text>
<rect x="10" y="270" width="620" height="50" rx="8" fill="#fde68a"/><text x="320" y="291" text-anchor="middle" class="svg-ink" font-size="13">Visibility and response: logs, NetFlow, SIEM, SOAR, XDR</text><text x="320" y="309" text-anchor="middle" class="svg-muted" font-size="12">every layer above sends events here; the SOC works here</text>
</svg><p class="cap">One enterprise, every layer. Traffic flows top to bottom; telemetry from every layer flows into the SOC at the bottom.</p></div>

<h3>Layer 1: the perimeter firewall and NGFW</h3>
<p>The firewall sits between trust zones: inside, DMZ, outside. A classic <b>stateful firewall</b> decides by addresses, ports and connection state. A <b>next-generation firewall (NGFW)</b> adds application identification, user identity, URL categories, intrusion prevention, file and malware inspection and threat intelligence feeds (called <b>Security Intelligence</b> on Cisco Secure Firewall). In this track: Cisco ASA and Secure Firewall Threat Defense managed by Management Center. Chapter 7 builds the basics.</p>

<h3>Layer 2: intrusion prevention (IPS)</h3>
<p>An <b>IDS</b> (intrusion detection system) watches a copy of traffic and alerts. An <b>IPS</b> sits inline and can drop the malicious packets. Both use signatures (rules) and some anomaly detection. On Threat Defense the engine is <b>Snort 3</b>. An IPS must be tuned: too loose and it misses attacks, too strict and it breaks business traffic.</p>

<h3>Layer 3: secure web and DNS</h3>
<p>Every connection begins with a DNS lookup, so <b>DNS-layer security</b> can block malicious and newly seen domains before a TCP session even starts, for every port and protocol. A <b>secure web gateway (SWG)</b> or web proxy then inspects web traffic itself: URL filtering, file inspection, application controls. Today these usually run in the cloud as part of <b>Secure Service Edge (SSE)</b>, which also includes a cloud access security broker (<b>CASB</b>, visibility and control of SaaS apps), zero trust network access (<b>ZTNA</b>) and firewall as a service. Cisco's SSE is <b>Secure Access</b>; when SSE is combined with SD-WAN networking the whole design is called <b>SASE</b>.</p>

<h3>Layer 4: email security</h3>
<p>Email is still the number one delivery channel. Email security checks sender reputation, SPF/DKIM/DMARC, attachments (sandboxing), URLs (rewriting and click-time checks) and impersonation. It can also remediate: pull a malicious message from every mailbox after delivery. Cisco products: Secure Email Gateway and Secure Email Threat Defense for cloud mailboxes.</p>

<h3>Layer 5: endpoint protection (EPP and EDR)</h3>
<p><b>EPP</b> (endpoint protection platform) prevents known threats, like modern antivirus. <b>EDR</b> (endpoint detection and response) records process, file and network behaviour on each laptop and server, detects suspicious activity, lets the analyst see the full trajectory of a file and isolate the host with one click. Cisco Secure Endpoint provides both.</p>

<h3>Layer 6: network access control and identity</h3>
<p><b>NAC</b> decides who and what may connect to the network. With <b>802.1X</b> the switch or wireless controller asks a RADIUS server, such as Cisco <b>ISE</b>, to authenticate the user or device and return an authorisation: VLAN, downloadable ACL or security group tag. <b>Identity</b> controls such as <b>MFA</b> (Cisco <b>Duo</b>) and single sign-on protect applications. Chapter 9 covers this.</p>

<h3>Layer 7: visibility and response</h3>
<p>Every layer produces events. A <b>SIEM</b> (security information and event management, for example <b>Splunk</b>) collects, normalises and correlates them. <b>SOAR</b> (security orchestration, automation and response) runs playbooks such as "block domain, isolate host, open ticket". <b>XDR</b> (extended detection and response, Cisco <b>XDR</b>) correlates detections across endpoint, network, email and cloud into one incident. Chapter 10 covers this.</p>

<h3>Layer 8: cloud workloads</h3>
<p>Servers in public cloud need the same thinking: security groups as firewalls, cloud posture management (<b>CSPM</b>) to find misconfigurations such as public storage, workload protection (<b>CWPP</b>) and cloud logs into the SIEM. The <b>shared responsibility model</b> says the provider secures the cloud itself; you secure what you put in it.</p>

<table class="cmp"><tr><th>Layer</th><th>Main question it answers</th><th>Track module</th></tr>
<tr><td>NGFW and IPS</td><td>Should this flow pass, and is its content malicious?</td><td>ASA and Threat Defense modules</td></tr>
<tr><td>DNS, web, SSE</td><td>Is this destination or web content safe?</td><td>Secure Service Edge</td></tr>
<tr><td>Email</td><td>Is this message genuine and safe?</td><td>Endpoint and email security</td></tr>
<tr><td>EDR</td><td>What is this process doing on the host?</td><td>Endpoint and email security</td></tr>
<tr><td>NAC and identity</td><td>Who or what is this, and what may it reach?</td><td>802.1X and ISE, Duo</td></tr>
<tr><td>SIEM, SOAR, XDR</td><td>What is happening across all of it?</td><td>Visibility, Duo, XDR and Splunk</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A phishing email with a link to a fake login page arrives. Chances to stop it: (1) email security rewrites and blocks the URL, (2) DNS security refuses to resolve the new domain, (3) the SWG blocks the page category, (4) Duo MFA stops a login with the stolen password, (5) the SIEM alerts on the login attempt from an unusual country. Five chances, five different layers.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Buying overlapping products without integrating them, so each console shows a piece of the story. Not sending logs anywhere. Deploying an IPS or SWG in blocking mode on day one without a monitor phase.</p></div>

<div class="exam"><p><b>Exam trap.</b> IDS is passive (copy of traffic, alert only); IPS is inline (can drop). SSE = SWG + CASB + ZTNA + FWaaS delivered from the cloud; SASE = SSE + SD-WAN. EPP prevents, EDR detects and responds.</p></div>

<div class="scn"><h4>Five consoles, no story</h4><p>A company had an NGFW, email security, EDR and DNS security, each from different teams. A ransomware precursor triggered a low-severity alert in each console, but nobody saw them together. After an incident review they forwarded all four into one SIEM with a correlation rule: the same host in two different tools within one hour raises a high-severity alert. The next similar chain was caught in minutes.</p><p><b>Lesson:</b> layers only work as a system when their telemetry meets in one place.</p></div>

<div class="iv"><p class="q">"Describe the security stack you would design for a 500-user company."</p><p>Strong answer: go layer by layer. NGFW with IPS at the edge and for the DMZ; DNS and web security through an SSE service so roaming users are covered; email security with sandboxing and DMARC; EDR on every endpoint and server; 802.1X with ISE and MFA with SSO for apps; all logs into a SIEM with a small set of high-value correlation rules. Mention integration and a monitor-first rollout.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The stack: NGFW, IPS, DNS/web (SSE), email, EDR, NAC and identity, SIEM/SOAR/XDR, cloud.</li>
<li>Each layer answers a different question; together they give defence in depth.</li>
<li>IDS alerts on a copy; IPS sits inline and blocks.</li>
<li>SSE combines SWG, CASB, ZTNA and FWaaS in the cloud; SASE adds SD-WAN.</li>
<li>Telemetry from every layer must meet in one place, or nobody sees the full attack.</li>
</ul></div>
`,hi:`
<p>Ek modern bank branch mein darwaze par guard hota hai, metal detector, cameras, time lock wala vault, staff ID cards, ek manager jo badi withdrawals approve karta hai aur ek head office jo ek saath saari branches dekhta hai. Har ek ka alag purpose hai, aur saath mein woh ek system banate hain. Enterprise network ka bhi apna "security stack" hota hai. Yeh chapter use internet edge se le kar user aur SOC tak chalta hai, taaki is track ke har product ki ek clear jagah ho.</p>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="Enterprise security stack">
<rect x="200" y="8" width="240" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">Internet aur SaaS apps</text>
<rect x="10" y="8" width="170" height="80" rx="8" fill="#bbf7d0"/><text x="95" y="30" text-anchor="middle" class="svg-ink" font-size="13">Cloud security</text><text x="95" y="50" text-anchor="middle" class="svg-muted" font-size="12">SSE: SWG, DNS,</text><text x="95" y="68" text-anchor="middle" class="svg-muted" font-size="12">CASB, ZTNA, FWaaS</text>
<rect x="460" y="8" width="170" height="60" rx="8" fill="#fde68a"/><text x="545" y="32" text-anchor="middle" class="svg-ink" font-size="13">Email security</text><text x="545" y="52" text-anchor="middle" class="svg-muted" font-size="12">gateway, sandbox</text>
<line x1="320" y1="44" x2="320" y2="70" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="70" width="240" height="46" rx="8" fill="#fed7aa"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">Perimeter NGFW + IPS</text><text x="320" y="107" text-anchor="middle" class="svg-muted" font-size="12">zones, NAT, app, URL, files</text>
<line x1="440" y1="93" x2="480" y2="93" stroke="#64748b" stroke-width="2"/>
<rect x="480" y="78" width="150" height="36" rx="8" fill="#e2e8f0"/><text x="555" y="101" text-anchor="middle" class="svg-ink" font-size="13">DMZ servers</text>
<line x1="320" y1="116" x2="320" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="140" width="240" height="46" rx="8" fill="#bae6fd"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">Campus switches</text><text x="320" y="177" text-anchor="middle" class="svg-muted" font-size="12">802.1X, segmentation, L2 security</text>
<line x1="440" y1="163" x2="480" y2="163" stroke="#64748b" stroke-width="2"/>
<rect x="480" y="140" width="150" height="46" rx="8" fill="#ddd6fe"/><text x="555" y="160" text-anchor="middle" class="svg-ink" font-size="13">NAC / identity</text><text x="555" y="177" text-anchor="middle" class="svg-muted" font-size="12">ISE, MFA, SSO</text>
<line x1="320" y1="186" x2="320" y2="210" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="210" width="240" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="230" text-anchor="middle" class="svg-ink" font-size="13">Endpoints aur servers</text><text x="320" y="247" text-anchor="middle" class="svg-muted" font-size="12">EDR agent, VPN client, posture</text>
<rect x="10" y="270" width="620" height="50" rx="8" fill="#fde68a"/><text x="320" y="291" text-anchor="middle" class="svg-ink" font-size="13">Visibility aur response: logs, NetFlow, SIEM, SOAR, XDR</text><text x="320" y="309" text-anchor="middle" class="svg-muted" font-size="12">upar ki har layer yahan events bhejti hai; SOC yahan kaam karta hai</text>
</svg><p class="cap">Ek enterprise, har layer. Traffic upar se neeche chalta hai; har layer ki telemetry neeche SOC mein aati hai.</p></div>

<h3>Layer 1: perimeter firewall aur NGFW</h3>
<p>Firewall trust zones ke beech baithta hai: inside, DMZ, outside. Classic <b>stateful firewall</b> addresses, ports aur connection state se decide karta hai. <b>Next-generation firewall (NGFW)</b> application identification, user identity, URL categories, intrusion prevention, file aur malware inspection aur threat intelligence feeds jodta hai (Cisco Secure Firewall par ise <b>Security Intelligence</b> kehte hain). Is track mein: Cisco ASA aur Management Center se managed Secure Firewall Threat Defense. Chapter 7 basics banata hai.</p>

<h3>Layer 2: intrusion prevention (IPS)</h3>
<p><b>IDS</b> (intrusion detection system) traffic ki copy dekhta hai aur alert karta hai. <b>IPS</b> inline baithta hai aur malicious packets drop kar sakta hai. Dono signatures (rules) aur kuch anomaly detection use karte hain. Threat Defense par engine <b>Snort 3</b> hai. IPS ko tune karna padta hai: bahut dheela to attacks miss karta hai, bahut sakht to business traffic tod deta hai.</p>

<h3>Layer 3: secure web aur DNS</h3>
<p>Har connection DNS lookup se shuru hota hai, isliye <b>DNS-layer security</b> malicious aur naye dikhe domains ko TCP session shuru hone se pehle hi block kar sakti hai, har port aur protocol ke liye. Phir <b>secure web gateway (SWG)</b> ya web proxy web traffic ko khud inspect karta hai: URL filtering, file inspection, application controls. Aaj yeh aam taur par cloud mein <b>Secure Service Edge (SSE)</b> ke hisse ke roop mein chalte hain, jismein cloud access security broker (<b>CASB</b>, SaaS apps ki visibility aur control), zero trust network access (<b>ZTNA</b>) aur firewall as a service bhi hote hain. Cisco ka SSE <b>Secure Access</b> hai; jab SSE ko SD-WAN networking ke saath joda jaata hai to poore design ko <b>SASE</b> kehte hain.</p>

<h3>Layer 4: email security</h3>
<p>Email abhi bhi number one delivery channel hai. Email security sender reputation, SPF/DKIM/DMARC, attachments (sandboxing), URLs (rewriting aur click-time checks) aur impersonation check karti hai. Yeh remediate bhi kar sakti hai: delivery ke baad har mailbox se malicious message nikaal lena. Cisco products: Secure Email Gateway aur cloud mailboxes ke liye Secure Email Threat Defense.</p>

<h3>Layer 5: endpoint protection (EPP aur EDR)</h3>
<p><b>EPP</b> (endpoint protection platform) known threats ko rokta hai, modern antivirus ki tarah. <b>EDR</b> (endpoint detection and response) har laptop aur server par process, file aur network behaviour record karta hai, suspicious activity detect karta hai, analyst ko file ki poori trajectory dikhata hai aur ek click mein host isolate karne deta hai. Cisco Secure Endpoint dono deta hai.</p>

<h3>Layer 6: network access control aur identity</h3>
<p><b>NAC</b> decide karta hai ki kaun aur kya network se connect ho sakta hai. <b>802.1X</b> ke saath switch ya wireless controller ek RADIUS server, jaise Cisco <b>ISE</b>, se user ya device authenticate karne aur authorisation lautane ko kehta hai: VLAN, downloadable ACL ya security group tag. <b>Identity</b> controls jaise <b>MFA</b> (Cisco <b>Duo</b>) aur single sign-on applications ko protect karte hain. Chapter 9 ise cover karta hai.</p>

<h3>Layer 7: visibility aur response</h3>
<p>Har layer events banati hai. <b>SIEM</b> (security information and event management, jaise <b>Splunk</b>) unhe collect, normalise aur correlate karta hai. <b>SOAR</b> (security orchestration, automation and response) playbooks chalata hai jaise "domain block karo, host isolate karo, ticket kholo". <b>XDR</b> (extended detection and response, Cisco <b>XDR</b>) endpoint, network, email aur cloud ke detections ko ek incident mein correlate karta hai. Chapter 10 ise cover karta hai.</p>

<h3>Layer 8: cloud workloads</h3>
<p>Public cloud ke servers ko bhi yahi soch chahiye: firewalls ki tarah security groups, public storage jaisi misconfigurations dhoondne ke liye cloud posture management (<b>CSPM</b>), workload protection (<b>CWPP</b>) aur cloud logs SIEM mein. <b>Shared responsibility model</b> kehta hai ki provider cloud ko khud secure karta hai; aap usmein jo rakhte ho use aap secure karte ho.</p>

<table class="cmp"><tr><th>Layer</th><th>Main sawaal jiska yeh jawab deti hai</th><th>Track module</th></tr>
<tr><td>NGFW aur IPS</td><td>Kya yeh flow pass hona chahiye, aur kya iska content malicious hai?</td><td>ASA aur Threat Defense modules</td></tr>
<tr><td>DNS, web, SSE</td><td>Kya yeh destination ya web content safe hai?</td><td>Secure Service Edge</td></tr>
<tr><td>Email</td><td>Kya yeh message genuine aur safe hai?</td><td>Endpoint aur email security</td></tr>
<tr><td>EDR</td><td>Yeh process host par kya kar raha hai?</td><td>Endpoint aur email security</td></tr>
<tr><td>NAC aur identity</td><td>Yeh kaun ya kya hai, aur yeh kya reach kar sakta hai?</td><td>802.1X aur ISE, Duo</td></tr>
<tr><td>SIEM, SOAR, XDR</td><td>In sab mein kya ho raha hai?</td><td>Visibility, Duo, XDR aur Splunk</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Fake login page ke link wala ek phishing email aata hai. Rokne ke mauke: (1) email security URL rewrite karke block karti hai, (2) DNS security naya domain resolve karne se mana karti hai, (3) SWG page category block karta hai, (4) Duo MFA chori hue password wala login rokta hai, (5) SIEM unusual country se login attempt par alert karta hai. Paanch mauke, paanch alag layers.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Overlapping products khareedna aur unhe integrate na karna, jisse har console kahani ka ek tukda dikhata hai. Logs kahin na bhejna. Pehle din hi IPS ya SWG ko blocking mode mein deploy karna, bina monitor phase ke.</p></div>

<div class="exam"><p><b>Exam trap.</b> IDS passive hai (traffic ki copy, sirf alert); IPS inline hai (drop kar sakta hai). SSE = SWG + CASB + ZTNA + FWaaS cloud se; SASE = SSE + SD-WAN. EPP rokta hai, EDR detect aur respond karta hai.</p></div>

<div class="scn"><h4>Paanch consoles, koi kahani nahi</h4><p>Ek company ke paas NGFW, email security, EDR aur DNS security the, har ek alag team ka. Ek ransomware precursor ne har console mein low-severity alert trigger kiya, lekin kisi ne unhe saath mein nahi dekha. Incident review ke baad unhone chaaron ko ek SIEM mein forward kiya ek correlation rule ke saath: ek ghante ke andar do alag tools mein same host high-severity alert uthata hai. Agli aisi chain minutes mein pakdi gayi.</p><p><b>Seekh:</b> layers system ki tarah tabhi kaam karti hain jab unki telemetry ek jagah milti hai.</p></div>

<div class="iv"><p class="q">"500 users wali company ke liye aap kaisa security stack design karoge?"</p><p>Strong answer: layer dar layer chalo. Edge aur DMZ ke liye IPS ke saath NGFW; SSE service ke through DNS aur web security taaki roaming users cover hon; sandboxing aur DMARC ke saath email security; har endpoint aur server par EDR; ISE ke saath 802.1X aur apps ke liye SSO ke saath MFA; saare logs ek SIEM mein kuch high-value correlation rules ke saath. Integration aur monitor-first rollout mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stack: NGFW, IPS, DNS/web (SSE), email, EDR, NAC aur identity, SIEM/SOAR/XDR, cloud.</li>
<li>Har layer alag sawaal ka jawab deti hai; saath mein woh defence in depth deti hain.</li>
<li>IDS copy par alert karta hai; IPS inline baithta hai aur block karta hai.</li>
<li>SSE cloud mein SWG, CASB, ZTNA aur FWaaS jodta hai; SASE SD-WAN jodta hai.</li>
<li>Har layer ki telemetry ek jagah milni chahiye, warna koi poora attack nahi dekhta.</li>
</ul></div>
`}};export{e as default};