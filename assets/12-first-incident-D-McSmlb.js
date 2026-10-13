var e={id:`first-incident`,h:{en:`Troubleshooting workflow: a first incident end to end, and a blocked flow`,hi:`Troubleshooting workflow: pehla incident shuru se ant tak, aur ek blocked flow`},body:{en:`
<p>A fire drill is boring until the day of a real fire, when everyone already knows the stairs, the meeting point and who calls whom. Security teams practise in the same way. This chapter runs two drills with everything from this module: a simulated malware beacon from alert to lessons learned, and the most common daily ticket for a security engineer, "the security stuff is blocking my application". Both follow one habit: <b>evidence first, smallest safe action, verify, document</b>.</p>

<h3>Drill 1: the beaconing laptop</h3>
<p>Topology from chapter 7: users in 10.1.10.0/24 behind FW1, DNS security for all users, EDR on every laptop, logs into the SIEM. At 10:05 the SOC console shows an alert: <i>DNS request blocked, category Command and Control, host 10.1.10.77, domain cdn-stats.example</i>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Incident timeline">
<line x1="20" y1="70" x2="620" y2="70" stroke="#64748b" stroke-width="2"/>
<circle cx="40" cy="70" r="8" fill="#fde68a"/><text x="40" y="45" text-anchor="middle" class="svg-ink" font-size="12">10:05</text><text x="40" y="100" text-anchor="middle" class="svg-muted" font-size="12">alert</text>
<circle cx="150" cy="70" r="8" fill="#fde68a"/><text x="150" y="45" text-anchor="middle" class="svg-ink" font-size="12">10:12</text><text x="150" y="100" text-anchor="middle" class="svg-muted" font-size="12">triage</text>
<circle cx="260" cy="70" r="8" fill="#fde68a"/><text x="260" y="45" text-anchor="middle" class="svg-ink" font-size="12">10:20</text><text x="260" y="100" text-anchor="middle" class="svg-muted" font-size="12">scope</text>
<circle cx="370" cy="70" r="8" fill="#fed7aa"/><text x="370" y="45" text-anchor="middle" class="svg-ink" font-size="12">10:24</text><text x="370" y="100" text-anchor="middle" class="svg-muted" font-size="12">contain</text>
<circle cx="480" cy="70" r="8" fill="#bbf7d0"/><text x="480" y="45" text-anchor="middle" class="svg-ink" font-size="12">14:00</text><text x="480" y="100" text-anchor="middle" class="svg-muted" font-size="12">eradicate, recover</text>
<circle cx="590" cy="70" r="8" fill="#bae6fd"/><text x="590" y="45" text-anchor="middle" class="svg-ink" font-size="12">+2 days</text><text x="590" y="100" text-anchor="middle" class="svg-muted" font-size="12">lessons</text>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">Detection to containment in 19 minutes because preparation was done</text>
</svg><p class="cap">The incident mapped onto the NIST lifecycle from chapter 10.</p></div>

<h4>Step 1: triage (is it real?)</h4>
<p>Questions: is the domain really malicious (category, age, reputation), is the host real and whose is it, and is this repeated? The analyst searches the DNS logs in the SIEM:</p>
<pre class="out">index=dns query="cdn-stats.example" earliest=-7d | table _time src_ip query action category

_time                  src_ip        query               action    category
2026-09-30 10:05:12    10.1.10.77    cdn-stats.example   blocked   Command and Control
2026-09-30 10:10:12    10.1.10.77    cdn-stats.example   blocked   Command and Control
<span class="hl">2026-09-30 10:15:12    10.1.10.77    cdn-stats.example   blocked   Command and Control</span></pre>
<p>Exactly every five minutes, from one host, to a newly registered C2 domain: the regular rhythm of a <b>beacon</b>. Humans do not browse on a timer. Verdict: true positive, severity high (C2 means code is running on the laptop), but not yet critical because every lookup was blocked.</p>

<h4>Step 2: scope (how big is it?)</h4>
<ul>
<li><b>Other hosts?</b> The same search without the IP filter returns only 10.1.10.77. One host.</li>
<li><b>Did anything get through?</b> The firewall connection logs and NetFlow show no connections from 10.1.10.77 to unknown external IPs on unusual ports, and no large uploads. The C2 was blocked at DNS before any session.</li>
<li><b>What started it?</b> The EDR console's trajectory for the host shows a browser downloading <code>codec-pack-setup.exe</code> from free-codec-update.example at 09:58, the file creating a scheduled task (persistence), then the periodic DNS lookups. The file hash is new: no antivirus signature yet.</li>
<li><b>Who?</b> The DHCP and ISE session logs map 10.1.10.77 to laptop MKT-LT-077 and user ravi@corp.example.</li>
</ul>

<h4>Step 3: containment</h4>
<p>Short-term containment must stop harm without destroying evidence: the analyst uses the EDR console to <b>isolate</b> the laptop (it can talk only to the EDR cloud), adds the file hash to a custom block list so no other host can run it, and blocks free-codec-update.example in DNS security. The user's password is reset and active sessions revoked, in case credentials were captured. The laptop stays powered on so memory evidence is kept.</p>

<h4>Step 4: eradication and recovery</h4>
<p>The desktop team collects the evidence the IR plan requires, reimages the laptop from a clean build, and returns it. The SOC keeps a watch rule for the hash and both domains for 30 days. A retrospective search across all endpoints for the hash finds no other copies.</p>

<h4>Step 5: lessons learned</h4>
<p>Blameless review: DNS security worked; the web gateway allowed an executable download from an uncategorised site; the user could install software. Actions: block executable downloads from uncategorised and newly seen domains, remove local admin rights for marketing, and add an ATT&amp;CK-tagged SIEM rule for "periodic DNS to one domain from one host".</p>

<h3>Drill 2: "security is blocking my application"</h3>
<p>Ticket: <i>users in 10.1.10.0/24 cannot reach the new partner portal at 198.51.100.80 on TCP 8443 since this morning</i>. Never start by disabling controls. Work the path in order, one control at a time:</p>
<ol>
<li><b>Define the flow exactly</b>: source, destination, protocol, port, time. Reproduce it from one test host.</li>
<li><b>DNS</b>: does the name resolve, or is the domain blocked by DNS policy?</li>
<li><b>Firewall</b>: packet-tracer and ACL hit counts, then a capture on both interfaces.</li>
<li><b>NGFW inspection</b>: IPS, file, URL or decryption events for this flow.</li>
<li><b>Identity and endpoint</b>: does ISE place this user in a VLAN or group that the rule does not cover? Is the EDR blocking the client application?</li>
<li><b>Fix narrowly, verify, document</b> the change and its owner.</li>
</ol>
<pre class="out">FW1# packet-tracer input inside tcp 10.1.10.25 51515 198.51.100.80 8443
...
Phase: 2
Type: ROUTE-LOOKUP
Subtype: Resolve Egress Interface
Result: ALLOW
Additional Information:
Found next-hop 203.0.113.1 using egress ifc  outside

Phase: 3
Type: ACCESS-LIST
Subtype:
<span class="hl">Result: DROP</span>
Config:
Implicit Rule
Additional Information:

Result:
input-interface: inside
input-status: up
input-line-status: up
output-interface: outside
output-status: up
output-line-status: up
Action: drop
<span class="hl">Drop-reason: (acl-drop) Flow is denied by configured rule</span></pre>
<p>Routing is fine; the inside ACL (which allows only web ports) hits its implicit deny for 8443. The correct fix is one rule: permit tcp 10.1.10.0/24 to host 198.51.100.80 eq 8443, with a change record, not opening all high ports.</p>

<pre class="code"><span class="c">! Narrow fix, placed above any broader deny, with a remark for the owner</span>
access-list INSIDE_OUT line 1 remark CHG-2026-0930 partner portal, owner: sales-ops
access-list INSIDE_OUT line 2 extended permit tcp 10.1.10.0 255.255.255.0 host 198.51.100.80 eq 8443</pre>

<div class="eg"><p><b>Worked example.</b> After the change, packet-tracer shows <code>Action: allow</code>, <code>show access-list INSIDE_OUT</code> shows the new line with a rising hit count, and <code>show conn address 198.51.100.80</code> lists sessions from the test host. Three pieces of evidence, then close the ticket.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reimaging before scoping, so you never learn how it got in. Blocking only the IP of a C2 server that changes daily. Disabling the IPS or the whole policy "to test". Declaring a flow fixed without proof on the device.</p></div>

<div class="exam"><p><b>Exam trap.</b> Periodic, same-interval connections to one destination suggest beaconing. Containment (isolate, block) precedes eradication (remove, reimage). On the ASA, packet-tracer shows the exact phase that drops the packet; the implicit rule means nothing matched.</p></div>

<div class="scn"><h4>The analyst who did not panic</h4><p>A junior SOC analyst saw a critical XDR incident on a finance server at 2 a.m. Instead of shutting the server down, she followed the runbook: confirmed the detection, checked that no data had left, isolated the host through EDR, called the on-call manager and preserved logs. The cause was a vulnerable test service on the server. Because the evidence was intact, the team fixed the root cause the same day.</p><p><b>Lesson:</b> a calm, evidence-first process beats speed without thought.</p></div>

<div class="iv"><p class="q">"You receive an alert that a laptop is contacting a known C2 domain. What do you do?"</p><p>Strong answer: triage (confirm the domain's reputation and the pattern, identify host and user), scope (other hosts, did any session succeed, what process started it, via EDR trajectory and firewall and flow logs), contain (isolate with EDR, block hash and domains, reset credentials), eradicate and recover (reimage, monitor), then lessons learned. Mention preserving evidence and communicating with the incident lead.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every incident follows triage, scope, contain, eradicate, recover, lessons learned.</li>
<li>Regular-interval traffic to one domain from one host is a classic beacon pattern.</li>
<li>Contain without destroying evidence; block hashes and domains as well as isolating the host.</li>
<li>For blocked flows, walk DNS, firewall, NGFW inspection, identity and endpoint in order.</li>
<li>Fix narrowly, prove with packet-tracer, hit counts and connections, and document the change.</li>
</ul></div>
`,hi:`
<p>Fire drill tab tak boring lagti hai jab tak asli aag ka din nahi aata, jab sabko pehle se seedhiyan, meeting point aur kaun kise call karega pata hota hai. Security teams bhi aise hi practise karti hain. Yeh chapter is module ki har cheez ke saath do drills chalata hai: alert se lessons learned tak ek simulated malware beacon, aur security engineer ka sabse common daily ticket, "security wali cheezein meri application block kar rahi hain". Dono ek habit follow karte hain: <b>pehle evidence, sabse chhota safe action, verify, document</b>.</p>

<h3>Drill 1: beacon karta laptop</h3>
<p>Chapter 7 ki topology: FW1 ke peeche 10.1.10.0/24 mein users, sab users ke liye DNS security, har laptop par EDR, logs SIEM mein. 10:05 par SOC console ek alert dikhata hai: <i>DNS request blocked, category Command and Control, host 10.1.10.77, domain cdn-stats.example</i>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Incident timeline">
<line x1="20" y1="70" x2="620" y2="70" stroke="#64748b" stroke-width="2"/>
<circle cx="40" cy="70" r="8" fill="#fde68a"/><text x="40" y="45" text-anchor="middle" class="svg-ink" font-size="12">10:05</text><text x="40" y="100" text-anchor="middle" class="svg-muted" font-size="12">alert</text>
<circle cx="150" cy="70" r="8" fill="#fde68a"/><text x="150" y="45" text-anchor="middle" class="svg-ink" font-size="12">10:12</text><text x="150" y="100" text-anchor="middle" class="svg-muted" font-size="12">triage</text>
<circle cx="260" cy="70" r="8" fill="#fde68a"/><text x="260" y="45" text-anchor="middle" class="svg-ink" font-size="12">10:20</text><text x="260" y="100" text-anchor="middle" class="svg-muted" font-size="12">scope</text>
<circle cx="370" cy="70" r="8" fill="#fed7aa"/><text x="370" y="45" text-anchor="middle" class="svg-ink" font-size="12">10:24</text><text x="370" y="100" text-anchor="middle" class="svg-muted" font-size="12">contain</text>
<circle cx="480" cy="70" r="8" fill="#bbf7d0"/><text x="480" y="45" text-anchor="middle" class="svg-ink" font-size="12">14:00</text><text x="480" y="100" text-anchor="middle" class="svg-muted" font-size="12">eradicate, recover</text>
<circle cx="590" cy="70" r="8" fill="#bae6fd"/><text x="590" y="45" text-anchor="middle" class="svg-ink" font-size="12">+2 din</text><text x="590" y="100" text-anchor="middle" class="svg-muted" font-size="12">lessons</text>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">Preparation hui thi, isliye detection se containment 19 minute mein</text>
</svg><p class="cap">Incident chapter 10 ke NIST lifecycle par mapped.</p></div>

<h4>Step 1: triage (kya yeh asli hai?)</h4>
<p>Sawaal: kya domain sach mein malicious hai (category, age, reputation), kya host asli hai aur kiska hai, aur kya yeh repeat ho raha hai? Analyst SIEM mein DNS logs search karta hai:</p>
<pre class="out">index=dns query="cdn-stats.example" earliest=-7d | table _time src_ip query action category

_time                  src_ip        query               action    category
2026-09-30 10:05:12    10.1.10.77    cdn-stats.example   blocked   Command and Control
2026-09-30 10:10:12    10.1.10.77    cdn-stats.example   blocked   Command and Control
<span class="hl">2026-09-30 10:15:12    10.1.10.77    cdn-stats.example   blocked   Command and Control</span></pre>
<p>Bilkul har paanch minute, ek host se, ek naye registered C2 domain par: yeh <b>beacon</b> ki regular rhythm hai. Insaan timer par browse nahi karte. Verdict: true positive, severity high (C2 ka matlab hai laptop par code chal raha hai), lekin abhi critical nahi kyunki har lookup block hua.</p>

<h4>Step 2: scope (yeh kitna bada hai?)</h4>
<ul>
<li><b>Doosre hosts?</b> IP filter ke bina wahi search sirf 10.1.10.77 lautati hai. Ek host.</li>
<li><b>Kya kuch paar gaya?</b> Firewall connection logs aur NetFlow 10.1.10.77 se unusual ports par unknown external IPs tak koi connection nahi dikhate, aur koi bada upload nahi. C2 kisi session se pehle DNS par block ho gaya.</li>
<li><b>Shuru kisne kiya?</b> Host ke liye EDR console ki trajectory dikhati hai ki 09:58 par browser ne free-codec-update.example se <code>codec-pack-setup.exe</code> download kiya, file ne ek scheduled task banaya (persistence), phir periodic DNS lookups. File hash naya hai: abhi koi antivirus signature nahi.</li>
<li><b>Kaun?</b> DHCP aur ISE session logs 10.1.10.77 ko laptop MKT-LT-077 aur user ravi@corp.example se map karte hain.</li>
</ul>

<h4>Step 3: containment</h4>
<p>Short-term containment ko evidence nasht kiye bina nuksaan rokna chahiye: analyst EDR console se laptop ko <b>isolate</b> karta hai (woh sirf EDR cloud se baat kar sakta hai), file hash ko custom block list mein jodta hai taaki koi doosra host use chala na sake, aur DNS security mein free-codec-update.example block karta hai. Agar credentials capture hue hon, isliye user ka password reset aur active sessions revoke kiye jaate hain. Laptop on rehta hai taaki memory evidence bacha rahe.</p>

<h4>Step 4: eradication aur recovery</h4>
<p>Desktop team IR plan ke hisaab se zaroori evidence collect karti hai, laptop ko clean build se reimage karti hai, aur wapas deti hai. SOC 30 din tak hash aur dono domains ke liye watch rule rakhta hai. Saare endpoints par hash ki retrospective search koi aur copy nahi dhoondti.</p>

<h4>Step 5: lessons learned</h4>
<p>Blameless review: DNS security ne kaam kiya; web gateway ne uncategorised site se executable download allow kiya; user software install kar sakta tha. Actions: uncategorised aur naye dikhe domains se executable downloads block karo, marketing ke local admin rights hatao, aur "ek host se ek domain par periodic DNS" ke liye ATT&amp;CK-tagged SIEM rule jodo.</p>

<h3>Drill 2: "security meri application block kar rahi hai"</h3>
<p>Ticket: <i>10.1.10.0/24 ke users aaj subah se naye partner portal 198.51.100.80 par TCP 8443 tak nahi pahunch pa rahe</i>. Kabhi controls disable karke shuru mat karo. Path ko order mein chalo, ek baar mein ek control:</p>
<ol>
<li><b>Flow exactly define karo</b>: source, destination, protocol, port, time. Ek test host se reproduce karo.</li>
<li><b>DNS</b>: kya naam resolve hota hai, ya DNS policy domain block kar rahi hai?</li>
<li><b>Firewall</b>: packet-tracer aur ACL hit counts, phir dono interfaces par capture.</li>
<li><b>NGFW inspection</b>: is flow ke liye IPS, file, URL ya decryption events.</li>
<li><b>Identity aur endpoint</b>: kya ISE is user ko aise VLAN ya group mein rakhta hai jise rule cover nahi karta? Kya EDR client application block kar raha hai?</li>
<li><b>Narrowly fix karo, verify karo, document karo</b> change aur uska owner.</li>
</ol>
<pre class="out">FW1# packet-tracer input inside tcp 10.1.10.25 51515 198.51.100.80 8443
...
Phase: 2
Type: ROUTE-LOOKUP
Subtype: Resolve Egress Interface
Result: ALLOW
Additional Information:
Found next-hop 203.0.113.1 using egress ifc  outside

Phase: 3
Type: ACCESS-LIST
Subtype:
<span class="hl">Result: DROP</span>
Config:
Implicit Rule
Additional Information:

Result:
input-interface: inside
input-status: up
input-line-status: up
output-interface: outside
output-status: up
output-line-status: up
Action: drop
<span class="hl">Drop-reason: (acl-drop) Flow is denied by configured rule</span></pre>
<p>Routing theek hai; inside ACL (jo sirf web ports allow karta hai) 8443 ke liye apne implicit deny par hit karta hai. Sahi fix ek rule hai: 10.1.10.0/24 se host 198.51.100.80 eq 8443 tak permit tcp, change record ke saath, saare high ports kholna nahi.</p>

<pre class="code"><span class="c">! Narrow fix, kisi bhi broader deny ke upar, owner ke liye remark ke saath</span>
access-list INSIDE_OUT line 1 remark CHG-2026-0930 partner portal, owner: sales-ops
access-list INSIDE_OUT line 2 extended permit tcp 10.1.10.0 255.255.255.0 host 198.51.100.80 eq 8443</pre>

<div class="eg"><p><b>Worked example.</b> Change ke baad packet-tracer <code>Action: allow</code> dikhata hai, <code>show access-list INSIDE_OUT</code> nayi line ko badhte hit count ke saath dikhata hai, aur <code>show conn address 198.51.100.80</code> test host se sessions list karta hai. Teen saboot, phir ticket band karo.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Scope nikalne se pehle reimage karna, jisse aap kabhi nahi seekhte ki andar kaise aaya. Roz badalne wale C2 server ka sirf IP block karna. "Test karne ke liye" IPS ya poori policy disable karna. Device par saboot ke bina flow ko fixed declare karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Ek destination tak periodic, same-interval connections beaconing ki taraf ishara karte hain. Containment (isolate, block) eradication (hatao, reimage) se pehle aata hai. ASA par packet-tracer exact phase dikhata hai jo packet drop karta hai; implicit rule ka matlab hai kuch match nahi hua.</p></div>

<div class="scn"><h4>Analyst jo ghabrayi nahi</h4><p>Ek junior SOC analyst ne raat 2 baje finance server par critical XDR incident dekha. Server band karne ki jagah usne runbook follow ki: detection confirm kiya, check kiya ki koi data bahar nahi gaya, EDR se host isolate kiya, on-call manager ko call kiya aur logs preserve kiye. Wajah server par ek vulnerable test service thi. Kyunki evidence intact tha, team ne usi din root cause fix kar diya.</p><p><b>Seekh:</b> shaant, evidence-first process bina soche speed se behtar hai.</p></div>

<div class="iv"><p class="q">"Aapko alert milta hai ki ek laptop known C2 domain se contact kar raha hai. Aap kya karoge?"</p><p>Strong answer: triage (domain ki reputation aur pattern confirm karo, host aur user pehchaano), scope (doosre hosts, kya koi session successful hua, kis process ne shuru kiya, EDR trajectory aur firewall aur flow logs se), contain (EDR se isolate, hash aur domains block, credentials reset), eradicate aur recover (reimage, monitor), phir lessons learned. Evidence preserve karna aur incident lead ke saath communicate karna mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har incident triage, scope, contain, eradicate, recover, lessons learned follow karta hai.</li>
<li>Ek host se ek domain par regular-interval traffic classic beacon pattern hai.</li>
<li>Evidence nasht kiye bina contain karo; host isolate karne ke saath hashes aur domains bhi block karo.</li>
<li>Blocked flows ke liye DNS, firewall, NGFW inspection, identity aur endpoint order mein chalo.</li>
<li>Narrowly fix karo, packet-tracer, hit counts aur connections se prove karo, aur change document karo.</li>
</ul></div>
`}};export{e as default};