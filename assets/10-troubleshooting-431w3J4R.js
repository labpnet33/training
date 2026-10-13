var e={id:`troubleshooting`,h:{en:`Troubleshooting NAT: a repeatable workflow with the labs`,hi:`NAT troubleshooting: labs ke saath ek repeatable workflow`},body:{en:`
<p>A good mechanic does not replace parts at random. He checks fuel, then spark, then air, in the same order every time, because that order finds most faults fastest. NAT faults are just as predictable. Almost every NAT ticket comes down to one of four causes: <b>inside/outside wrong</b>, <b>ACL does not match</b>, <b>no route back</b>, or <b>pool too small</b>. This chapter gives you a fixed workflow and then runs it against the three labs of this module, plus the classic "inside/outside swapped" ticket.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="NAT troubleshooting workflow">
<rect x="170" y="10" width="300" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="12">1. Test from a real inside host</text>
<rect x="170" y="60" width="300" height="36" rx="8" fill="#bae6fd"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="12">2. statistics: inside/outside correct?</text>
<rect x="170" y="110" width="300" height="36" rx="8" fill="#bae6fd"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="12">3. Rule + ACL match the host?</text>
<rect x="170" y="160" width="300" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="183" text-anchor="middle" class="svg-ink" font-size="12">4. translations: entry created?</text>
<rect x="170" y="210" width="300" height="36" rx="8" fill="#fde68a"/><text x="320" y="233" text-anchor="middle" class="svg-ink" font-size="12">5. Pool free? (allocated %, misses)</text>
<rect x="170" y="260" width="300" height="36" rx="8" fill="#fed7aa"/><text x="320" y="283" text-anchor="middle" class="svg-ink" font-size="12">6. Upstream route back to inside global?</text>
<line x1="320" y1="46" x2="320" y2="60" stroke="#64748b" stroke-width="2"/><line x1="320" y1="96" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="146" x2="320" y2="160" stroke="#64748b" stroke-width="2"/><line x1="320" y1="196" x2="320" y2="210" stroke="#64748b" stroke-width="2"/><line x1="320" y1="246" x2="320" y2="260" stroke="#64748b" stroke-width="2"/>
<text x="560" y="83" text-anchor="middle" class="svg-accent" font-size="12">labels swapped</text>
<text x="560" y="133" text-anchor="middle" class="svg-accent" font-size="12">wrong wildcard</text>
<text x="560" y="233" text-anchor="middle" class="svg-accent" font-size="12">pool too small</text>
<text x="560" y="283" text-anchor="middle" class="svg-accent" font-size="12">missing route</text>
</svg><p class="cap">The NAT workflow. Each step rules out one of the four classic faults.</p></div>

<h3>The workflow</h3>
<ol>
<li><b>Reproduce from a real inside host</b> (not from the router). Note source, destination and protocol. Check the host's IP, mask and gateway, and that the router has a default route (<code>show ip route</code>).</li>
<li><b>Check the border</b>: <code>show ip nat statistics</code> lists Inside and Outside interfaces. LAN must be inside, uplink outside.</li>
<li><b>Check the rule and ACL</b>: <code>show running-config | include ip nat</code> and <code>show access-lists</code>. Is the rule bound to the right ACL and pool or interface? Is <code>overload</code> there when it should be? Does the host's address really match the wildcard?</li>
<li><b>Generate traffic and read the table</b>: <code>show ip nat translations</code>. No entry means steps 2 or 3 (or 5) failed. An entry exists means outbound translation works: move to the return path.</li>
<li><b>Check the pool</b>: in statistics, <code>allocated</code> near 100% and rising pool <code>misses</code> mean exhaustion.</li>
<li><b>Check the route back</b>: on the upstream router, is there a route (or connected subnet) for the inside global address? Replies to an unknown address are dropped by the ISP, and the NAT table shows entries with no returning traffic.</li>
<li>Only then use <code>debug ip nat</code> limited to one host, fix, <code>clear ip nat translation *</code> if old entries remain, and retest.</li>
</ol>

<h3>Lab 1, static NAT: "the portal is not reachable from outside"</h3>
<p>PC-EXT runs <code>curl h&#116;tp://203.0.113.5</code> and times out. Step 2 shows g0/0 inside and g0/1 outside: fine. Step 3 shows <code>ip nat inside source static 172.16.10.80 203.0.113.5</code>: correct order. Step 4 shows the <code>---</code> line but no tcp flow. Step 6: 203.0.113.5 is inside EDGE's outside subnet 203.0.113.0/29, so the ISP reaches it by ARP, which EDGE answers. If you still see no tcp line, check the portal's gateway (172.16.10.1) and any inbound ACL on g0/1 that must permit destination 203.0.113.5 port 80. When it works, the table shows <code>tcp 203.0.113.5:80 172.16.10.80:80 198.51.100.50:… </code>.</p>

<h3>Lab 2, dynamic NAT: "one staff PC has no internet"</h3>
<p>PC1 and PC2 work, PC3 does not. Steps 2 to 4 pass for PC1 and PC2, and ACL 20 does match 10.20.0.13. Step 5 finds it:</p>
<pre class="out">EDGE# show ip nat statistics | include pool|allocated
[Id: 1] access-list 20 pool PUBLIC refcount 4
 pool PUBLIC: netmask 255.255.255.0
<span class="hl">        type generic, total addresses 2, allocated 2 (100%), misses 5</span></pre>
<p>Diagnosis: <b>pool too small</b>. Fix: add <code>overload</code> to the rule (after clearing translations), or enlarge the pool.</p>

<h3>Lab 3, PAT, and the "inside/outside swapped" ticket</h3>
<p>Imagine BR was configured with every correct line except the labels: <code>ip nat outside</code> on g0/0 and g0/2, <code>ip nat inside</code> on g0/1. PC1 cannot browse, and the table is empty.</p>
<pre class="out">BR# show ip nat statistics
Total active translations: 0 (0 static, 0 dynamic; 0 extended)
<span class="hl">Outside interfaces:
  GigabitEthernet0/0, GigabitEthernet0/2
Inside interfaces:
  GigabitEthernet0/1</span>
Hits: 0  Misses: 0
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 1 interface GigabitEthernet0/1 refcount 0</pre>
<p>Step 2 finds it at once: the LANs are listed as outside. PC1's packets arrive on an "outside" interface and leave on an "inside" one, so the inside source rule never applies. Fix: swap the labels, then retest; <code>refcount</code> rises and PAT entries on 203.0.113.18 appear.</p>

<h3>The fourth fault: no route back</h3>
<pre class="out">ISP# show ip route 100.64.60.10
<span class="hl">% Subnet not in table</span></pre>
<p>Suppose EDGE's pool were changed to 100.64.60.10–11, a range the ISP was never told about. EDGE creates translations and sends packets out, <code>show ip nat translations</code> looks healthy, yet no replies return: the ISP has no route to 100.64.60.0 and drops them. Fix: the ISP adds a static route for the pool block pointing to EDGE (or the pool is moved into a routed range).</p>

<div class="eg"><p><b>Worked example: reading the clues together.</b> Ticket: "Nobody at the branch can browse". Statistics: interfaces correct, rule <code>access-list 1 interface GigabitEthernet0/1 overload</code>, total active translations 0. ACL: <code>permit 192.168.10.0 0.0.0.255</code>. Hosts are in 192.168.1.0/24 and 192.168.2.0/24. Conclusion: ACL does not match, so nothing is translated. Fix the ACL to <code>192.168.0.0 0.0.3.255</code> and entries appear.</p></div>

<div class="warn"><p><b>Common mistake.</b> Jumping straight to <code>debug ip nat</code> on a busy production router. Debug is the last step, limited by an ACL. Statistics and translations already answer most questions safely.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Translations exist, but users still cannot browse." That rules out labels and ACL; the answer is usually the return path (route to the inside global) or a filter on the outside. "No translations at all" points to labels, ACL, rule or pool.</p></div>

<div class="scn"><h4>Everything correct, still no replies</h4><p>A company bought a new /29 from its ISP, 203.0.113.48/29, and moved its NAT pool there. Outbound translations appeared in the table, but no page ever loaded. The engineer confirmed NAT was working, then asked the ISP to check their routing: the new /29 had been allocated on paper but never routed to the customer's link. Once the ISP added the static route, replies arrived.</p><p><b>Lesson:</b> when translations are created but nothing comes back, look outward: the upstream network must route the inside global addresses to you.</p></div>

<div class="iv"><p class="q">"Users behind a NAT router cannot reach the internet. How do you troubleshoot?"</p><p>Strong answer: test from an inside host, confirm IP, gateway and default route; check show ip nat statistics for the inside and outside interface lists; check the NAT rule and that the ACL really matches the hosts; generate traffic and look for entries in show ip nat translations; check pool allocation and misses; if entries exist but no replies, check the upstream route to the inside global addresses and outside ACLs. Finish with a limited debug ip nat if needed, and clear stale translations after a fix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four classic faults: labels swapped, ACL does not match, pool too small, no route back.</li>
<li>Empty table = labels, rule, ACL or pool. Entries but no replies = return path or outside filter.</li>
<li>show ip nat statistics answers labels, bindings and pool usage in one command.</li>
<li>The upstream router must route the inside global addresses to your NAT router.</li>
<li>Debug last and limited; clear stale translations after changes, then retest from a host.</li>
</ul></div>
`,hi:`
<p>Achha mechanic random parts nahi badalta. Woh har baar same order mein fuel, phir spark, phir air check karta hai, kyunki yeh order zyada tar faults sabse jaldi dhoondhta hai. NAT faults bhi utne hi predictable hain. Lagbhag har NAT ticket chaar wajahon mein se ek par aata hai: <b>inside/outside galat</b>, <b>ACL match nahi karta</b>, <b>return route nahi</b>, ya <b>pool chhota</b>. Yeh chapter aapko ek fixed workflow deta hai aur phir use is module ki teeno labs par chalata hai, plus classic "inside/outside swapped" ticket.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="NAT troubleshooting workflow">
<rect x="170" y="10" width="300" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="12">1. Asli inside host se test</text>
<rect x="170" y="60" width="300" height="36" rx="8" fill="#bae6fd"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="12">2. statistics: inside/outside sahi?</text>
<rect x="170" y="110" width="300" height="36" rx="8" fill="#bae6fd"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="12">3. Rule + ACL host ko match?</text>
<rect x="170" y="160" width="300" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="183" text-anchor="middle" class="svg-ink" font-size="12">4. translations: entry bani?</text>
<rect x="170" y="210" width="300" height="36" rx="8" fill="#fde68a"/><text x="320" y="233" text-anchor="middle" class="svg-ink" font-size="12">5. Pool free? (allocated %, misses)</text>
<rect x="170" y="260" width="300" height="36" rx="8" fill="#fed7aa"/><text x="320" y="283" text-anchor="middle" class="svg-ink" font-size="12">6. Inside global ka upstream route?</text>
<line x1="320" y1="46" x2="320" y2="60" stroke="#64748b" stroke-width="2"/><line x1="320" y1="96" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="146" x2="320" y2="160" stroke="#64748b" stroke-width="2"/><line x1="320" y1="196" x2="320" y2="210" stroke="#64748b" stroke-width="2"/><line x1="320" y1="246" x2="320" y2="260" stroke="#64748b" stroke-width="2"/>
<text x="560" y="83" text-anchor="middle" class="svg-accent" font-size="12">labels ulte</text>
<text x="560" y="133" text-anchor="middle" class="svg-accent" font-size="12">galat wildcard</text>
<text x="560" y="233" text-anchor="middle" class="svg-accent" font-size="12">pool chhota</text>
<text x="560" y="283" text-anchor="middle" class="svg-accent" font-size="12">route missing</text>
</svg><p class="cap">NAT workflow. Har step chaar classic faults mein se ek ko rule out karta hai.</p></div>

<h3>Workflow</h3>
<ol>
<li><b>Asli inside host se reproduce karo</b> (router se nahi). Source, destination aur protocol note karo. Host ka IP, mask aur gateway check karo, aur ki router ke paas default route hai (<code>show ip route</code>).</li>
<li><b>Border check karo</b>: <code>show ip nat statistics</code> Inside aur Outside interfaces list karta hai. LAN inside hona chahiye, uplink outside.</li>
<li><b>Rule aur ACL check karo</b>: <code>show running-config | include ip nat</code> aur <code>show access-lists</code>. Kya rule sahi ACL aur pool ya interface se bound hai? Jahan chahiye wahan <code>overload</code> hai? Kya host ka address sach mein wildcard match karta hai?</li>
<li><b>Traffic banao aur table padho</b>: <code>show ip nat translations</code>. Entry nahi matlab step 2 ya 3 (ya 5) fail hua. Entry hai matlab outbound translation chal raha hai: return path par jao.</li>
<li><b>Pool check karo</b>: statistics mein <code>allocated</code> 100% ke paas aur badhte pool <code>misses</code> matlab exhaustion.</li>
<li><b>Return route check karo</b>: upstream router par, kya inside global address ka route (ya connected subnet) hai? Unknown address ke replies ISP drop kar deta hai, aur NAT table mein entries dikhti hain par traffic wapas nahi aata.</li>
<li>Tabhi ek host tak limited <code>debug ip nat</code> use karo, fix karo, purani entries bachi hon to <code>clear ip nat translation *</code>, aur dobara test karo.</li>
</ol>

<h3>Lab 1, static NAT: "portal bahar se reachable nahi"</h3>
<p>PC-EXT <code>curl h&#116;tp://203.0.113.5</code> chalata hai aur time out hota hai. Step 2 g0/0 inside aur g0/1 outside dikhata hai: theek. Step 3 <code>ip nat inside source static 172.16.10.80 203.0.113.5</code> dikhata hai: sahi order. Step 4 <code>---</code> line dikhata hai par koi tcp flow nahi. Step 6: 203.0.113.5 EDGE ke outside subnet 203.0.113.0/29 ke andar hai, isliye ISP ARP se ise reach karta hai, jiska jawab EDGE deta hai. Agar phir bhi tcp line na dikhe, portal ka gateway (172.16.10.1) aur g0/1 ka koi inbound ACL check karo jise destination 203.0.113.5 port 80 permit karna chahiye. Chalne par table <code>tcp 203.0.113.5:80 172.16.10.80:80 198.51.100.50:… </code> dikhati hai.</p>

<h3>Lab 2, dynamic NAT: "ek staff PC ka internet nahi chal raha"</h3>
<p>PC1 aur PC2 chalte hain, PC3 nahi. PC1 aur PC2 ke liye steps 2 se 4 pass hote hain, aur ACL 20 10.20.0.13 ko match karta hai. Step 5 wajah dhoondhta hai:</p>
<pre class="out">EDGE# show ip nat statistics | include pool|allocated
[Id: 1] access-list 20 pool PUBLIC refcount 4
 pool PUBLIC: netmask 255.255.255.0
<span class="hl">        type generic, total addresses 2, allocated 2 (100%), misses 5</span></pre>
<p>Diagnosis: <b>pool chhota hai</b>. Fix: (translations clear karke) rule mein <code>overload</code> jodo, ya pool bada karo.</p>

<h3>Lab 3, PAT, aur "inside/outside swapped" ticket</h3>
<p>Socho BR par labels ke alawa har line sahi configure hui: g0/0 aur g0/2 par <code>ip nat outside</code>, g0/1 par <code>ip nat inside</code>. PC1 browse nahi kar sakta, aur table khali hai.</p>
<pre class="out">BR# show ip nat statistics
Total active translations: 0 (0 static, 0 dynamic; 0 extended)
<span class="hl">Outside interfaces:
  GigabitEthernet0/0, GigabitEthernet0/2
Inside interfaces:
  GigabitEthernet0/1</span>
Hits: 0  Misses: 0
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 1 interface GigabitEthernet0/1 refcount 0</pre>
<p>Step 2 turant pakad leta hai: LANs outside ki tarah listed hain. PC1 ke packets "outside" interface par aate hain aur "inside" se nikalte hain, isliye inside source rule kabhi apply nahi hota. Fix: labels swap karo, phir dobara test karo; <code>refcount</code> badhta hai aur 203.0.113.18 par PAT entries dikhti hain.</p>

<h3>Chautha fault: return route nahi</h3>
<pre class="out">ISP# show ip route 100.64.60.10
<span class="hl">% Subnet not in table</span></pre>
<p>Socho EDGE ka pool 100.64.60.10–11 kar diya gaya, aisi range jiske baare mein ISP ko kabhi bataya nahi gaya. EDGE translations banata hai aur packets bahar bhejta hai, <code>show ip nat translations</code> healthy dikhta hai, phir bhi replies wapas nahi aate: ISP ke paas 100.64.60.0 ka route nahi aur woh unhe drop karta hai. Fix: ISP pool block ke liye EDGE ki taraf static route jode (ya pool ko routed range mein le jaao).</p>

<div class="eg"><p><b>Worked example: clues ko saath padhna.</b> Ticket: "Branch mein koi browse nahi kar sakta". Statistics: interfaces sahi, rule <code>access-list 1 interface GigabitEthernet0/1 overload</code>, total active translations 0. ACL: <code>permit 192.168.10.0 0.0.0.255</code>. Hosts 192.168.1.0/24 aur 192.168.2.0/24 mein hain. Nateeja: ACL match nahi karta, isliye kuch translate nahi hota. ACL ko <code>192.168.0.0 0.0.3.255</code> karo aur entries dikhne lagti hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Busy production router par seedha <code>debug ip nat</code> par kood jaana. Debug aakhri step hai, ACL se limited. Statistics aur translations zyada tar sawaalon ka jawab safely de dete hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Translations hain, par users phir bhi browse nahi kar sakte." Isse labels aur ACL rule out hote hain; jawab aam taur par return path (inside global ka route) ya outside par filter hota hai. "Koi translation hi nahi" labels, ACL, rule ya pool ki taraf ishaara karta hai.</p></div>

<div class="scn"><h4>Sab sahi, phir bhi replies nahi</h4><p>Ek company ne ISP se naya /29 kharida, 203.0.113.48/29, aur apna NAT pool wahan shift kiya. Outbound translations table mein dikhe, par koi page kabhi load nahi hua. Engineer ne confirm kiya ki NAT chal raha hai, phir ISP se unki routing check karne ko kaha: naya /29 kaagaz par allocate hua tha par customer ke link ki taraf kabhi route nahi hua. ISP ke static route jodte hi replies aane lage.</p><p><b>Seekh:</b> jab translations bante hain par kuch wapas nahi aata, bahar dekho: upstream network ko inside global addresses aap tak route karne chahiye.</p></div>

<div class="iv"><p class="q">"NAT router ke peeche users internet tak nahi pahunch paa rahe. Kaise troubleshoot karoge?"</p><p>Strong answer: inside host se test karo, IP, gateway aur default route confirm karo; inside aur outside interface lists ke liye show ip nat statistics check karo; NAT rule check karo aur ki ACL sach mein hosts match karta hai; traffic banao aur show ip nat translations mein entries dhoondho; pool allocation aur misses check karo; agar entries hain par replies nahi, to inside global addresses ka upstream route aur outside ACLs check karo. Zaroorat ho to limited debug ip nat se khatam karo, aur fix ke baad stale translations clear karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar classic faults: labels ulte, ACL match nahi karta, pool chhota, return route nahi.</li>
<li>Khali table = labels, rule, ACL ya pool. Entries par replies nahi = return path ya outside filter.</li>
<li>show ip nat statistics ek command mein labels, bindings aur pool usage batata hai.</li>
<li>Upstream router ko inside global addresses aapke NAT router tak route karne chahiye.</li>
<li>Debug aakhri aur limited; changes ke baad stale translations clear karo, phir host se dobara test.</li>
</ul></div>
`}};export{e as default};