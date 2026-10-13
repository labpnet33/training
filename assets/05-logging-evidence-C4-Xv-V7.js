var e={id:`logging-evidence`,h:{en:`Logging and hit counters: collecting evidence`,hi:`Logging aur hit counters: saboot jama karna`},body:{en:`
<p>A firewall decision you cannot prove is only an opinion. When a manager asks "was that connection really blocked, and by which rule?", you need evidence. FortiOS gives you three kinds: <b>traffic logs</b> (what happened), <b>hit counters</b> (how often a policy decided) and the <b>session table</b> (what is open right now). Think of a shop: the CCTV recording is the log, the turnstile counter is the hit count and the people inside the shop right now are the session table.</p>

<h3>The logtraffic setting</h3>
<p>Each policy has its own logging level:</p>
<table class="cmp"><tr><th>Value</th><th>What is logged</th></tr>
<tr><td><code>disable</code></td><td>no traffic log for this policy</td></tr>
<tr><td><code>utm</code> (default)</td><td>only sessions that triggered a security profile event</td></tr>
<tr><td><code>all</code></td><td>every session accepted or denied by this policy, at session end</td></tr></table>
<p>There is also <code>set logtraffic-start enable</code>, which writes an extra log when the session starts, useful for long-lived sessions but heavier on the disk. Where logs are stored (local disk, FortiAnalyzer, syslog) is a logging design choice; this chapter reads logs directly on the FortiGate.</p>
<p>A rule of thumb many teams use: log <b>all</b> on deny policies and on policies that guard sensitive servers; use <b>utm</b> or <b>all</b> on general outbound policies depending on disk and licence. Logging everything has a cost, so decide on purpose.</p>

<h3>Logging the implicit deny</h3>
<p>Traffic dropped by the implicit deny is not logged by default. Turn it on once, globally:</p>
<pre class="code">config log setting
    set fwpolicy-implicit-log enable
end</pre>
<p>Now a blocked SSH attempt from PC1 to 8.8.8.8 produces a log with <code>policyid=0</code>, and an allowed web session produces one with the real policy.</p>
<pre class="out">FGT1 # execute log filter category 0
FGT1 # execute log display
2 logs found.
2 logs returned.

1: date=2026-10-02 time=04:03:12 ... type="traffic" subtype="forward" level="notice" vd="root" srcip=10.0.1.10 srcport=57160 srcintf="port2" srcintfrole="lan" dstip=8.8.8.8 dstport=22 dstintf="port1" dstintfrole="wan" ... proto=6 <span class="hl">action="deny" policyid=0</span> policytype="policy" service="tcp/22" trandisp="noop" ...

2: date=2026-10-02 time=04:03:12 ... type="traffic" subtype="forward" ... srcip=10.0.1.10 srcport=64251 ... dstip=8.8.8.8 dstport=80 ... proto=6 <span class="hl">action="accept" policyid=1 policyname="LAN-to-WAN"</span> policytype="policy" service="HTTP" trandisp="snat" transip=203.0.113.2 transport=60001 ...</pre>
<p>Read a log line by pairs. <code>srcip/srcintf</code> and <code>dstip/dstintf</code> tell who and where. <code>action</code> and <code>policyid</code> tell the decision. <code>trandisp=snat</code> with <code>transip</code> shows the translated source. <code>category 0</code> in the filter means traffic logs. The log lines above are shortened with "..." for the page; the real output has more fields.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Three evidence sources">
<rect x="20" y="30" width="180" height="110" rx="10" fill="#bae6fd"/><text x="110" y="62" text-anchor="middle" class="svg-ink" font-size="14">Traffic log</text><text x="110" y="85" text-anchor="middle" class="svg-muted" font-size="12">history: who, what,</text><text x="110" y="102" text-anchor="middle" class="svg-muted" font-size="12">action, policyid</text>
<rect x="230" y="30" width="180" height="110" rx="10" fill="#bbf7d0"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="14">Hit counter</text><text x="320" y="85" text-anchor="middle" class="svg-muted" font-size="12">how often each policy</text><text x="320" y="102" text-anchor="middle" class="svg-muted" font-size="12">decided, first/last</text>
<rect x="440" y="30" width="180" height="110" rx="10" fill="#ddd6fe"/><text x="530" y="62" text-anchor="middle" class="svg-ink" font-size="14">Session table</text><text x="530" y="85" text-anchor="middle" class="svg-muted" font-size="12">open now, NAT,</text><text x="530" y="102" text-anchor="middle" class="svg-muted" font-size="12">policy_id</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">same question, three angles: which policy decided?</text>
</svg><p class="cap">Use all three. They confirm each other.</p></div>

<h3>Hit counters</h3>
<p>Every policy counts how many sessions it has decided. The CLI view is <code>diagnose firewall iprope show 100004 &lt;policy-id&gt;</code> (100004 is the table of IPv4 forward policies). In the GUI the same data appears as "Hit count" and "Last used" columns.</p>
<pre class="out">FGT1 # diagnose firewall iprope show 100004 1
idx=1 pkts/bytes=5/600 asic_pkts/asic_bytes=0/0 nturbo_pkts/nturbo_bytes=0/0 flag=0x0 <span class="hl">hit count:1</span> first:2026-10-02 04:03:12 last:2026-10-02 04:03:12
established session count:1</pre>
<p>Use counters in two ways. After a test, the policy you expect should go up by one. In a clean-up, a policy with no hits for months is a candidate for review. A deny policy whose counter stays at zero while users complain is a strong sign of shadowing (chapter 4).</p>

<h3>The session table as proof</h3>
<p>The session table shows accepted traffic that is open now, and records which policy created it:</p>
<pre class="out">FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
tcp     3600   10.0.1.10:64251       203.0.113.2:60001     8.8.8.8:80            -</pre>
<p>The verbose form, <code>diagnose sys session list</code>, includes <code>policy_id=1</code> in each entry, which ties the session to its policy. Denied traffic never creates a session, so absence from this table plus a deny log entry is the proof of a block.</p>

<div class="eg"><p><b>Worked example.</b> The manager asks "Did anybody reach the social site yesterday?" You filter the traffic log for dstip 198.51.100.10. Entries with <code>action="deny" policyid=1 policyname="BLOCK-SOCIAL"</code> show attempts that were blocked. One entry with <code>action="accept" policyid=3</code> from 10.0.1.20 shows the single allowed exception. Your answer is backed by log lines, not memory.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Expecting the default <code>utm</code> setting to log plain accepted sessions; expecting implicit deny drops in the log without <code>fwpolicy-implicit-log</code>; reading the log of a session that is still open (traffic logs are normally written when the session ends, so use <code>logtraffic-start</code> or the session table for live traffic); forgetting that logs have a size and retention limit.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which logtraffic value logs all sessions that match a policy?" is <code>all</code>. The value <code>utm</code> logs only what the security profiles flagged. And "policy id 0" in a log means the implicit deny, never a real policy you can edit.</p></div>

<div class="scn"><h4>The audit that needed proof</h4><p>An auditor asked how the company knew database port 3306 was never reachable from the guest VLAN. The team had logtraffic all on a deny policy and fwpolicy-implicit-log on. Their query showed 214 denied attempts in one month, all with policyid matching that deny, and no accepted entries. The auditor accepted the log export as evidence.</p><p><b>Lesson:</b> logging is part of the control. A block you cannot show is hard to defend.</p></div>

<div class="iv"><p class="q">"A user says the firewall blocked their app yesterday. How do you confirm?"</p><p>Filter the traffic log by source IP and destination, read <code>action</code>, <code>policyid</code> and <code>policyname</code>. If nothing is logged, check whether the matching policy has logging enabled and whether <code>fwpolicy-implicit-log</code> is on for implicit denies. Cross-check with hit counters and the policy lookup tool.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>logtraffic</code> is disable, utm (default) or all; implicit deny needs <code>fwpolicy-implicit-log</code>.</li>
<li>Read a traffic log by action, policyid and the interface and IP pairs.</li>
<li><code>diagnose firewall iprope show 100004 &lt;id&gt;</code> prints hit count, first and last use.</li>
<li>The session table lists accepted sessions with NAT and policy_id; denied traffic has none.</li>
<li>Counters, logs and sessions agree; use all three before you call a problem solved.</li>
</ul></div>
`,hi:`
<p>Jo firewall decision aap saabit nahi kar sakte woh sirf ek raay hai. Manager poochhe "kya woh connection sach mein block hua, aur kis rule se?", to aapko saboot chahiye. FortiOS teen tarah ke saboot deta hai: <b>traffic logs</b> (kya hua), <b>hit counters</b> (policy ne kitni baar decide kiya) aur <b>session table</b> (abhi kya khula hai). Dukaan socho: CCTV recording log hai, turnstile counter hit count hai aur dukaan ke andar abhi maujood log session table hain.</p>

<h3>logtraffic setting</h3>
<p>Har policy ka apna logging level hota hai:</p>
<table class="cmp"><tr><th>Value</th><th>Kya log hota hai</th></tr>
<tr><td><code>disable</code></td><td>is policy ke liye koi traffic log nahi</td></tr>
<tr><td><code>utm</code> (default)</td><td>sirf woh sessions jinhone security profile event trigger kiya</td></tr>
<tr><td><code>all</code></td><td>is policy ke accept ya deny kiya har session, session khatam hone par</td></tr></table>
<p><code>set logtraffic-start enable</code> bhi hai, jo session shuru hone par ek extra log likhta hai; lambe chalne wale sessions ke liye useful hai lekin disk par bhaari. Logs kahan store hote hain (local disk, FortiAnalyzer, syslog) yeh logging design ka choice hai; is chapter mein logs seedha FortiGate par padhte hain.</p>
<p>Kai teams ka rule of thumb: deny policies aur sensitive servers ki guard karne wali policies par <b>all</b> log karo; general outbound policies par disk aur licence ke hisaab se <b>utm</b> ya <b>all</b>. Sab kuch log karne ki keemat hoti hai, isliye soch samajhkar decide karo.</p>

<h3>Implicit deny ko log karna</h3>
<p>Implicit deny se drop hua traffic default mein log nahi hota. Ek baar globally on karo:</p>
<pre class="code">config log setting
    set fwpolicy-implicit-log enable
end</pre>
<p>Ab PC1 se 8.8.8.8 par blocked SSH attempt <code>policyid=0</code> wala log banata hai, aur allowed web session asli policy wala log banata hai.</p>
<pre class="out">FGT1 # execute log filter category 0
FGT1 # execute log display
2 logs found.
2 logs returned.

1: date=2026-10-02 time=04:03:12 ... type="traffic" subtype="forward" level="notice" vd="root" srcip=10.0.1.10 srcport=57160 srcintf="port2" srcintfrole="lan" dstip=8.8.8.8 dstport=22 dstintf="port1" dstintfrole="wan" ... proto=6 <span class="hl">action="deny" policyid=0</span> policytype="policy" service="tcp/22" trandisp="noop" ...

2: date=2026-10-02 time=04:03:12 ... type="traffic" subtype="forward" ... srcip=10.0.1.10 srcport=64251 ... dstip=8.8.8.8 dstport=80 ... proto=6 <span class="hl">action="accept" policyid=1 policyname="LAN-to-WAN"</span> policytype="policy" service="HTTP" trandisp="snat" transip=203.0.113.2 transport=60001 ...</pre>
<p>Log line ko pairs mein padho. <code>srcip/srcintf</code> aur <code>dstip/dstintf</code> batate hain kaun aur kahan. <code>action</code> aur <code>policyid</code> decision batate hain. <code>trandisp=snat</code> aur <code>transip</code> translated source dikhate hain. Filter mein <code>category 0</code> ka matlab traffic logs hai. Upar ki log lines page ke liye "..." se chhoti ki gayi hain; asli output mein aur fields hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Three evidence sources">
<rect x="20" y="30" width="180" height="110" rx="10" fill="#bae6fd"/><text x="110" y="62" text-anchor="middle" class="svg-ink" font-size="14">Traffic log</text><text x="110" y="85" text-anchor="middle" class="svg-muted" font-size="12">history: kaun, kya,</text><text x="110" y="102" text-anchor="middle" class="svg-muted" font-size="12">action, policyid</text>
<rect x="230" y="30" width="180" height="110" rx="10" fill="#bbf7d0"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="14">Hit counter</text><text x="320" y="85" text-anchor="middle" class="svg-muted" font-size="12">har policy ne kitni baar</text><text x="320" y="102" text-anchor="middle" class="svg-muted" font-size="12">decide kiya, first/last</text>
<rect x="440" y="30" width="180" height="110" rx="10" fill="#ddd6fe"/><text x="530" y="62" text-anchor="middle" class="svg-ink" font-size="14">Session table</text><text x="530" y="85" text-anchor="middle" class="svg-muted" font-size="12">abhi khule, NAT,</text><text x="530" y="102" text-anchor="middle" class="svg-muted" font-size="12">policy_id</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">ek hi sawaal, teen angle: kaunsi policy ne decide kiya?</text>
</svg><p class="cap">Teeno use karo. Yeh ek doosre ko confirm karte hain.</p></div>

<h3>Hit counters</h3>
<p>Har policy ginti hai ki usne kitne sessions decide kiye. CLI view <code>diagnose firewall iprope show 100004 &lt;policy-id&gt;</code> hai (100004 IPv4 forward policies ki table hai). GUI mein wahi data "Hit count" aur "Last used" columns mein dikhta hai.</p>
<pre class="out">FGT1 # diagnose firewall iprope show 100004 1
idx=1 pkts/bytes=5/600 asic_pkts/asic_bytes=0/0 nturbo_pkts/nturbo_bytes=0/0 flag=0x0 <span class="hl">hit count:1</span> first:2026-10-02 04:03:12 last:2026-10-02 04:03:12
established session count:1</pre>
<p>Counters do tarah se use karo. Test ke baad jis policy se aap ummeed karte ho woh ek se badhni chahiye. Clean-up mein mahino se zero hits wali policy review ke liye candidate hai. Users shikayat karein aur deny policy ka counter zero rahe to yeh shadowing ka majboot sanket hai (chapter 4).</p>

<h3>Session table saboot ke roop mein</h3>
<p>Session table accepted traffic dikhata hai jo abhi khula hai, aur batata hai ki kaunsi policy ne use banaya:</p>
<pre class="out">FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
tcp     3600   10.0.1.10:64251       203.0.113.2:60001     8.8.8.8:80            -</pre>
<p>Verbose form <code>diagnose sys session list</code> har entry mein <code>policy_id=1</code> dikhata hai, jo session ko uski policy se jodta hai. Denied traffic kabhi session nahi banata, isliye is table mein na hona aur deny log entry hona block ka saboot hai.</p>

<div class="eg"><p><b>Worked example.</b> Manager poochta hai "Kal kisi ne social site reach ki?" Aap traffic log ko dstip 198.51.100.10 se filter karte ho. <code>action="deny" policyid=1 policyname="BLOCK-SOCIAL"</code> wali entries blocked attempts dikhati hain. 10.0.1.20 se ek entry <code>action="accept" policyid=3</code> ke saath single allowed exception dikhati hai. Aapka jawab log lines par tika hai, yaaddasht par nahi.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Default <code>utm</code> se plain accepted sessions log hone ki ummeed karna; <code>fwpolicy-implicit-log</code> ke bina implicit deny drops log mein dhoondhna; abhi khule session ka log padhna (traffic logs aam taur par session khatam hone par likhe jaate hain, isliye live traffic ke liye <code>logtraffic-start</code> ya session table use karo); yeh bhoolna ki logs ki size aur retention limit hoti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kaunsi logtraffic value policy se match hone wale saare sessions log karti hai?" jawab <code>all</code> hai. <code>utm</code> sirf wahi log karta hai jo security profiles ne flag kiya. Aur log mein "policy id 0" ka matlab implicit deny hai, kabhi aisi asli policy nahi jise aap edit kar sako.</p></div>

<div class="scn"><h4>Audit jise saboot chahiye tha</h4><p>Auditor ne poochha ki company ko kaise pata ki guest VLAN se database port 3306 kabhi reachable nahi tha. Team ne deny policy par logtraffic all aur fwpolicy-implicit-log on rakha tha. Unki query ne ek mahine mein 214 denied attempts dikhaye, sab us deny ke policyid ke saath, aur koi accepted entry nahi. Auditor ne log export ko saboot maan liya.</p><p><b>Lesson:</b> logging control ka hissa hai. Jo block aap dikha nahi sakte use defend karna mushkil hai.</p></div>

<div class="iv"><p class="q">"User kehta hai firewall ne kal uski app block ki. Kaise confirm karte ho?"</p><p>Traffic log ko source IP aur destination se filter karo, <code>action</code>, <code>policyid</code> aur <code>policyname</code> padho. Kuch log na ho to check karo ki matching policy par logging enabled hai ya nahi aur implicit denies ke liye <code>fwpolicy-implicit-log</code> on hai ya nahi. Hit counters aur policy lookup tool se cross-check karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>logtraffic</code> disable, utm (default) ya all hota hai; implicit deny ko <code>fwpolicy-implicit-log</code> chahiye.</li>
<li>Traffic log ko action, policyid aur interface aur IP pairs se padho.</li>
<li><code>diagnose firewall iprope show 100004 &lt;id&gt;</code> hit count, first aur last use print karta hai.</li>
<li>Session table accepted sessions ko NAT aur policy_id ke saath list karta hai; denied traffic ka session nahi hota.</li>
<li>Counters, logs aur sessions ek doosre se milte hain; problem solved kehne se pehle teeno use karo.</li>
</ul></div>
`}};export{e as default};