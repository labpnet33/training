var e={id:`ids-ips`,h:{en:`IDS vs IPS: passive and inline, signature and anomaly`,hi:`IDS vs IPS: passive aur inline, signature aur anomaly`},body:{en:`
<p>A shop can protect itself in two ways. It can install CCTV cameras that record everything and alert the manager when something looks wrong; the camera cannot stop a thief, but it tells you what happened. Or it can put a guard at the door who checks bags and physically stops anyone carrying stolen goods. The camera is an <b>IDS</b>; the guard is an <b>IPS</b>. Both look inside traffic for attacks, which a stateful firewall alone does not do.</p>

<h3>IDS: intrusion detection, passive</h3>
<p>An <b>intrusion detection system</b> receives a <b>copy</b> of the traffic, from a switch <b>SPAN</b> port (port mirroring) or a network <b>TAP</b>. It analyses the copy and raises alerts. Because it is out of the path:</p>
<ul>
<li>It adds <b>no latency</b> and cannot break traffic if it fails or is overloaded.</li>
<li>It <b>cannot stop</b> the packet that triggered the alert; by the time it alerts, that packet has already arrived. Some IDS can send TCP resets or ask a firewall to block the source afterwards, but the first packets get through.</li>
<li>SPAN can drop copies under load, so an IDS may miss things.</li>
</ul>

<h3>IPS: intrusion prevention, inline</h3>
<p>An <b>intrusion prevention system</b> sits <b>inline</b>: every packet passes through it. When traffic matches a malicious pattern, it can <b>drop</b> the packet, <b>reset</b> the connection, or block the source for a while, before the attack reaches the target. The costs: it adds some latency, it must be sized for full throughput, and a <b>false positive</b> blocks real business traffic. If the IPS engine fails, the design must choose <b>fail-open</b> (traffic keeps flowing uninspected, favouring availability) or <b>fail-closed</b> (traffic stops, favouring security); hardware bypass interfaces implement fail-open physically.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="IDS passive vs IPS inline">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">IDS (passive)</text>
<rect x="20" y="40" width="80" height="36" rx="8" fill="#bae6fd"/><text x="60" y="63" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="130" y="40" width="70" height="36" rx="8" fill="#e2e8f0"/><text x="165" y="63" text-anchor="middle" class="svg-ink" font-size="12">Switch</text>
<rect x="230" y="40" width="80" height="36" rx="8" fill="#bbf7d0"/><text x="270" y="63" text-anchor="middle" class="svg-ink" font-size="12">Servers</text>
<line x1="100" y1="58" x2="130" y2="58" stroke="#64748b"/><line x1="200" y1="58" x2="230" y2="58" stroke="#64748b"/>
<rect x="125" y="120" width="80" height="36" rx="8" fill="#fde68a"/><text x="165" y="143" text-anchor="middle" class="svg-ink" font-size="12">IDS</text>
<line x1="165" y1="76" x2="165" y2="120" stroke="#64748b" stroke-dasharray="5 4"/><text x="175" y="102" class="svg-accent" font-size="12">SPAN copy</text>
<text x="165" y="185" text-anchor="middle" class="svg-muted" font-size="12">alerts only, no latency</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">IPS (inline)</text>
<rect x="340" y="40" width="80" height="36" rx="8" fill="#bae6fd"/><text x="380" y="63" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="445" y="40" width="70" height="36" rx="8" fill="#fed7aa"/><text x="480" y="63" text-anchor="middle" class="svg-ink" font-size="12">IPS</text>
<rect x="540" y="40" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="585" y="63" text-anchor="middle" class="svg-ink" font-size="12">Servers</text>
<line x1="420" y1="58" x2="445" y2="58" stroke="#64748b"/><line x1="515" y1="58" x2="540" y2="58" stroke="#64748b"/>
<text x="480" y="110" text-anchor="middle" class="svg-muted" font-size="12">every packet passes through</text>
<text x="480" y="130" text-anchor="middle" class="svg-muted" font-size="12">can drop, reset, block</text>
<text x="480" y="185" text-anchor="middle" class="svg-muted" font-size="12">adds latency, fail-open or fail-closed</text>
</svg><p class="cap">Same detection engine, different position. Position decides whether it can prevent or only detect.</p></div>

<h3>How attacks are detected</h3>
<table class="cmp"><tr><th>Method</th><th>How it works</th><th>Good at</th><th>Weak at</th></tr>
<tr><td><b>Signature-based</b></td><td>Matches known patterns (bytes, protocol fields, sequences) described in rules</td><td>Known attacks, very accurate, few false positives when tuned</td><td>New (zero-day) attacks with no signature yet</td></tr>
<tr><td><b>Anomaly / behaviour-based</b></td><td>Learns a baseline of normal traffic and alerts on deviations</td><td>Unknown attacks, unusual volumes, new behaviour</td><td>More false positives; the baseline must be clean</td></tr>
<tr><td><b>Policy-based</b></td><td>Alerts when traffic breaks a defined policy (Telnet on a server VLAN)</td><td>Compliance</td><td>Only as good as the policy</td></tr>
<tr><td><b>Reputation-based</b></td><td>Blocks known-bad IPs, domains and URLs from threat intelligence</td><td>Cheap, fast, catches C2</td><td>New infrastructure not yet listed</td></tr>
</table>
<p>In Cisco Secure Firewall Threat Defense, the IPS engine is <b>Snort 3</b>, fed with rules from Talos. Reputation blocking is <b>Security Intelligence</b>. You will build these policies in the sec-ftd-ips module.</p>

<h3>True, false, positive, negative</h3>
<dl class="terms">
<dt>True positive</dt><dd>An attack happened and the IPS alerted. Good.</dd>
<dt>False positive</dt><dd>Normal traffic triggered an alert (or a block). Wastes analyst time; inline, it breaks applications.</dd>
<dt>True negative</dt><dd>Normal traffic, no alert. Good.</dd>
<dt>False negative</dt><dd>An attack happened and nothing alerted. The most dangerous outcome.</dd>
</dl>
<p><b>Tuning</b> is the ongoing work of reducing false positives (disable rules that do not apply to your systems, add precise exceptions) without creating false negatives.</p>

<div class="eg"><p><b>Worked example: reading an inline event.</b> The web server in the DMZ is protected by an inline IPS policy:</p>
<pre class="out">Intrusion event (nk-sim)
Priority     1
Message      SERVER-WEB directory traversal attempt
Source       198.51.100.44:53112  zone outside
Destination  10.0.2.10:80         zone dmz
<span class="hl">Inline result  Dropped</span></pre>
<p>This is the path traversal probe from chapter 3. Because the IPS is inline, the request never reached 10.0.2.10. Had the same sensor been on a SPAN port, the event would say "would have dropped" and the request would have arrived.</p></div>

<div class="warn"><p><b>Common mistake.</b> Deploying a brand-new IPS policy straight into blocking mode on a production link. Start in detection (or "inline tap"/monitor) mode, watch the events for a few days, tune the false positives, then switch to prevention.</p></div>

<div class="exam"><p><b>Exam trap.</b> An IDS on a SPAN port <b>cannot drop the triggering packet</b>. "Zero-day" plus "which detection method" points to <b>anomaly-based</b>. And an IPS cannot inspect encrypted payloads unless the traffic is decrypted first.</p></div>

<div class="scn"><h4>The payroll outage caused by security</h4><p>On payday, the payroll web application stopped accepting logins. The server was healthy and the firewall showed allowed connections, yet every login POST reset. The IPS events showed a newly enabled SQL injection rule matching a login field that legitimately contained special characters. The team added a narrow exception for that one rule, that one destination and that one URL path, kept the rule active for everything else, and logins recovered in minutes.</p><p><b>Lesson:</b> an inline IPS is part of the application path; tune it with the same care as a firewall rule.</p></div>

<div class="iv"><p class="q">"What is the difference between an IDS and an IPS, and when would you choose each?"</p><p>An IDS is passive: it gets a copy via SPAN or TAP, alerts, adds no latency, and cannot stop the first packets. An IPS is inline: it can drop and reset in real time, but adds latency and risk from false positives and needs a fail-open or fail-closed decision. Choose IDS for visibility where availability is critical or during tuning; choose IPS where you must stop attacks, such as in front of internet-facing servers. Mention detection methods: signature for known threats, anomaly for unknown.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IDS = passive copy (SPAN/TAP), alerts only; IPS = inline, can drop, reset and block.</li>
<li>IPS adds latency and needs a fail-open or fail-closed decision.</li>
<li>Signature finds known attacks; anomaly finds unknown ones with more false positives; reputation blocks known-bad sources.</li>
<li>False negatives are the most dangerous; false positives break applications when inline.</li>
<li>Start in detection mode, tune, then prevent. Cisco's engine is Snort 3 in Threat Defense.</li>
</ul></div>
`,hi:`
<p>Ek dukaan do tarah se apni hifazat kar sakti hai. Woh CCTV cameras laga sakti hai jo sab kuch record karte hain aur kuch galat dikhne par manager ko alert karte hain; camera chor ko rok nahi sakta, lekin batata hai ki kya hua. Ya woh darwaze par guard rakh sakti hai jo bags check karta hai aur chori ka maal le jaane wale ko physically rokta hai. Camera <b>IDS</b> hai; guard <b>IPS</b> hai. Dono traffic ke andar attacks dhoondte hain, jo akela stateful firewall nahi karta.</p>

<h3>IDS: intrusion detection, passive</h3>
<p><b>Intrusion detection system</b> ko traffic ki <b>copy</b> milti hai, switch ke <b>SPAN</b> port (port mirroring) ya network <b>TAP</b> se. Woh copy analyse karta hai aur alerts raise karta hai. Kyunki woh path se bahar hai:</p>
<ul>
<li>Woh <b>koi latency nahi</b> jodta aur fail ya overload hone par traffic nahi tod sakta.</li>
<li>Woh alert trigger karne wale packet ko <b>rok nahi sakta</b>; jab tak alert aata hai, woh packet pahunch chuka hota hai. Kuch IDS baad mein TCP resets bhej sakte hain ya firewall se source block karwa sakte hain, lekin pehle packets nikal jaate hain.</li>
<li>Load mein SPAN copies drop kar sakta hai, isliye IDS cheezein miss kar sakta hai.</li>
</ul>

<h3>IPS: intrusion prevention, inline</h3>
<p><b>Intrusion prevention system</b> <b>inline</b> baithta hai: har packet usmein se guzarta hai. Jab traffic malicious pattern se match karta hai, woh attack target tak pahunchne se pehle packet <b>drop</b> kar sakta hai, connection <b>reset</b> kar sakta hai, ya source ko kuch der block kar sakta hai. Keemat: yeh kuch latency jodta hai, ise full throughput ke liye size karna padta hai, aur ek <b>false positive</b> asli business traffic block kar deta hai. Agar IPS engine fail ho jaaye, design ko chunna padta hai <b>fail-open</b> (traffic bina inspection chalta rahe, availability ko tarjeeh) ya <b>fail-closed</b> (traffic ruk jaaye, security ko tarjeeh); hardware bypass interfaces fail-open ko physically implement karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="IDS passive vs IPS inline">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">IDS (passive)</text>
<rect x="20" y="40" width="80" height="36" rx="8" fill="#bae6fd"/><text x="60" y="63" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="130" y="40" width="70" height="36" rx="8" fill="#e2e8f0"/><text x="165" y="63" text-anchor="middle" class="svg-ink" font-size="12">Switch</text>
<rect x="230" y="40" width="80" height="36" rx="8" fill="#bbf7d0"/><text x="270" y="63" text-anchor="middle" class="svg-ink" font-size="12">Servers</text>
<line x1="100" y1="58" x2="130" y2="58" stroke="#64748b"/><line x1="200" y1="58" x2="230" y2="58" stroke="#64748b"/>
<rect x="125" y="120" width="80" height="36" rx="8" fill="#fde68a"/><text x="165" y="143" text-anchor="middle" class="svg-ink" font-size="12">IDS</text>
<line x1="165" y1="76" x2="165" y2="120" stroke="#64748b" stroke-dasharray="5 4"/><text x="175" y="102" class="svg-accent" font-size="12">SPAN copy</text>
<text x="165" y="185" text-anchor="middle" class="svg-muted" font-size="12">sirf alerts, koi latency nahi</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">IPS (inline)</text>
<rect x="340" y="40" width="80" height="36" rx="8" fill="#bae6fd"/><text x="380" y="63" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="445" y="40" width="70" height="36" rx="8" fill="#fed7aa"/><text x="480" y="63" text-anchor="middle" class="svg-ink" font-size="12">IPS</text>
<rect x="540" y="40" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="585" y="63" text-anchor="middle" class="svg-ink" font-size="12">Servers</text>
<line x1="420" y1="58" x2="445" y2="58" stroke="#64748b"/><line x1="515" y1="58" x2="540" y2="58" stroke="#64748b"/>
<text x="480" y="110" text-anchor="middle" class="svg-muted" font-size="12">har packet guzarta hai</text>
<text x="480" y="130" text-anchor="middle" class="svg-muted" font-size="12">drop, reset, block kar sakta hai</text>
<text x="480" y="185" text-anchor="middle" class="svg-muted" font-size="12">latency jodta hai, fail-open ya fail-closed</text>
</svg><p class="cap">Same detection engine, alag position. Position tay karti hai ki woh rok sakta hai ya sirf detect kar sakta hai.</p></div>

<h3>Attacks kaise detect hote hain</h3>
<table class="cmp"><tr><th>Method</th><th>Kaise kaam karta hai</th><th>Kismein achha</th><th>Kismein kamzor</th></tr>
<tr><td><b>Signature-based</b></td><td>Rules mein describe kiye known patterns (bytes, protocol fields, sequences) match karta hai</td><td>Known attacks, bahut accurate, tune hone par kam false positives</td><td>Naye (zero-day) attacks jinki abhi signature nahi</td></tr>
<tr><td><b>Anomaly / behaviour-based</b></td><td>Normal traffic ka baseline seekhta hai aur deviation par alert karta hai</td><td>Unknown attacks, ajeeb volumes, naya behaviour</td><td>Zyada false positives; baseline saaf hona chahiye</td></tr>
<tr><td><b>Policy-based</b></td><td>Jab traffic defined policy todta hai tab alert (server VLAN par Telnet)</td><td>Compliance</td><td>Policy jitna hi achha</td></tr>
<tr><td><b>Reputation-based</b></td><td>Threat intelligence se known-bad IPs, domains aur URLs block karta hai</td><td>Sasta, tez, C2 pakadta hai</td><td>Naya infrastructure jo abhi list mein nahi</td></tr>
</table>
<p>Cisco Secure Firewall Threat Defense mein IPS engine <b>Snort 3</b> hai, jise Talos ke rules milte hain. Reputation blocking <b>Security Intelligence</b> hai. Aap yeh policies sec-ftd-ips module mein banaoge.</p>

<h3>True, false, positive, negative</h3>
<dl class="terms">
<dt>True positive</dt><dd>Attack hua aur IPS ne alert kiya. Achha.</dd>
<dt>False positive</dt><dd>Normal traffic ne alert (ya block) trigger kiya. Analyst ka time waste; inline mein applications tootti hain.</dd>
<dt>True negative</dt><dd>Normal traffic, koi alert nahi. Achha.</dd>
<dt>False negative</dt><dd>Attack hua aur kuch alert nahi hua. Sabse khatarnaak nateeja.</dd>
</dl>
<p><b>Tuning</b> false positives kam karne ka lagataar kaam hai (jo rules aapke systems par apply nahi hote unhe disable karo, precise exceptions jodo) bina false negatives banaye.</p>

<div class="eg"><p><b>Worked example: inline event padhna.</b> DMZ ka web server ek inline IPS policy se protected hai:</p>
<pre class="out">Intrusion event (nk-sim)
Priority     1
Message      SERVER-WEB directory traversal attempt
Source       198.51.100.44:53112  zone outside
Destination  10.0.2.10:80         zone dmz
<span class="hl">Inline result  Dropped</span></pre>
<p>Yeh chapter 3 wala path traversal probe hai. Kyunki IPS inline hai, request kabhi 10.0.2.10 tak nahi pahunchi. Agar yahi sensor SPAN port par hota, to event kehta "would have dropped" aur request pahunch jaati.</p></div>

<div class="warn"><p><b>Common galti.</b> Bilkul nayi IPS policy ko seedha production link par blocking mode mein deploy karna. Detection (ya "inline tap"/monitor) mode mein shuru karo, kuch din events dekho, false positives tune karo, phir prevention par switch karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> SPAN port par IDS <b>trigger karne wala packet drop nahi kar sakta</b>. "Zero-day" plus "kaunsa detection method" ka ishaara <b>anomaly-based</b> ki taraf hai. Aur IPS encrypted payloads inspect nahi kar sakta jab tak traffic pehle decrypt na ho.</p></div>

<div class="scn"><h4>Security ki wajah se payroll outage</h4><p>Payday par payroll web application ne logins lena band kar diya. Server healthy tha aur firewall allowed connections dikha raha tha, phir bhi har login POST reset ho raha tha. IPS events ne dikhaya ki naya enable kiya gaya SQL injection rule ek login field se match kar raha tha jismein legitimately special characters the. Team ne us ek rule, us ek destination aur us ek URL path ke liye narrow exception joda, baaki sab ke liye rule active rakha, aur logins minutes mein theek ho gaye.</p><p><b>Seekh:</b> inline IPS application path ka hissa hai; use firewall rule jitni hi saavdhani se tune karo.</p></div>

<div class="iv"><p class="q">"IDS aur IPS mein kya farak hai, aur aap kab kaunsa chunoge?"</p><p>IDS passive hai: SPAN ya TAP se copy leta hai, alert karta hai, koi latency nahi jodta, aur pehle packets rok nahi sakta. IPS inline hai: real time mein drop aur reset kar sakta hai, lekin latency aur false positives ka risk jodta hai aur fail-open ya fail-closed decision chahiye. IDS wahan chuno jahan availability critical ho ya tuning ke dauraan visibility chahiye; IPS wahan jahan attacks rokne hi hain, jaise internet-facing servers ke saamne. Detection methods batao: known threats ke liye signature, unknown ke liye anomaly.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IDS = passive copy (SPAN/TAP), sirf alerts; IPS = inline, drop, reset aur block kar sakta hai.</li>
<li>IPS latency jodta hai aur fail-open ya fail-closed decision chahiye.</li>
<li>Signature known attacks dhoondta hai; anomaly unknown ko zyada false positives ke saath; reputation known-bad sources block karta hai.</li>
<li>False negatives sabse khatarnaak hain; inline hone par false positives applications todte hain.</li>
<li>Detection mode mein shuru karo, tune karo, phir prevent karo. Cisco ka engine Threat Defense mein Snort 3 hai.</li>
</ul></div>
`}};export{e as default};