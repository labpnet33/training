var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now build a two-level IS-IS network, read its databases, predict which adjacencies form, find the cause of a silent link and operate the network safely. This chapter is your revision sheet.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IS-IS in one picture">
<rect x="20" y="20" width="600" height="34" rx="8" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">NET = area + system ID + 00 | one NET per router | one area per router</text>
<rect x="20" y="62" width="600" height="34" rx="8" fill="#bae6fd"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="13">PDUs: IIH, LSP, CSNP, PSNP | TLVs | LSP ID = system ID + pseudonode + fragment</text>
<rect x="20" y="104" width="600" height="34" rx="8" fill="#bbf7d0"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">Levels: L1 (same area), L2 (backbone), L1-2 (both) | circuit-type per interface</text>
<rect x="20" y="146" width="600" height="34" rx="8" fill="#fde68a"/><text x="320" y="168" text-anchor="middle" class="svg-ink" font-size="13">LAN: DIS + pseudonode | core links: isis network point-to-point</text>
<rect x="20" y="188" width="600" height="34" rx="8" fill="#fed7aa"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">ATT bit = default route | leaking = specific routes | OL bit = drain</text>
</svg><p class="cap">IS-IS on one page.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can write a NET and split it into area, system ID and NSEL, and I can encode a loopback in the system ID.</li>
<li>I can name the four PDUs and say what each does.</li>
<li>I can read <code>show isis database detail</code> and explain LSP ID, sequence number, lifetime, ATT/P/OL and the TLVs shown.</li>
<li>I can predict the adjacency (L1, L2, none) for any pair of router types and areas.</li>
<li>I can explain DIS election, the pseudonode and why core links use point-to-point.</li>
<li>I can explain the attached bit, default route, route leaking, the up/down bit and summarisation.</li>
<li>I can drain a router with the overload bit and know the three authentication scopes.</li>
<li>I can troubleshoot a silent adjacency using the six-step workflow.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>NET</dt><dd>Network Entity Title: area + system ID + NSEL 00.</dd>
<dt>System ID</dt><dd>Six-byte unique router identifier.</dd>
<dt>IIH / LSP / CSNP / PSNP</dt><dd>Hello, link-state PDU, complete and partial sequence number PDUs.</dd>
<dt>TLV</dt><dd>Type-Length-Value block inside a PDU.</dd>
<dt>DIS / pseudonode</dt><dd>LAN chairperson and the virtual router that represents the LAN.</dd>
<dt>ATT bit</dt><dd>Attached bit in a level-1 LSP: this router reaches other areas.</dd>
<dt>OL bit</dt><dd>Overload bit: do not use this router for transit.</dd>
<dt>Route leaking</dt><dd>Selectively advertising level-2 routes into level 1.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>NSEL of a router</td><td>00</td></tr>
<tr><td>System ID length</td><td>6 bytes</td></tr>
<tr><td>Default IOS router type / metric style</td><td>level-1-2 / narrow</td></tr>
<tr><td>Default interface metric on IOS</td><td>10; distance 115</td></tr>
<tr><td>Hello interval and hold (LAN, router)</td><td>10 s and 30 s; DIS 3.33 s and 10 s</td></tr>
<tr><td>LSP max lifetime / refresh</td><td>1200 s / 900 s</td></tr>
<tr><td>CSNP interval from the DIS</td><td>10 s</td></tr>
<tr><td>DIS election</td><td>Highest priority (default 64), then highest MAC; preemptive; no backup</td></tr>
<tr><td>Adjacency L1-2 to L1-2, different areas</td><td>Level 2 only</td></tr>
<tr><td>Circuit Id 00 / R3.01</td><td>Point-to-point / LAN with DIS R3 and pseudonode 01</td></tr>
<tr><td>Leaked route code on IOS</td><td>i ia</td></tr></table>

<h3>Command cheat-sheet (IOS XE style)</h3>
<pre class="code"><span class="c">! Configure</span>
router isis
 net 49.0001.0000.0000.0002.00
 is-type level-1-2
 redistribute isis ip level-2 into level-1 route-map &lt;NAME&gt;
 set-overload-bit
interface GigabitEthernet0/1
 ip router isis
 isis network point-to-point
 isis circuit-type level-2-only
 isis priority 100 level-1
 isis metric 30
<span class="c">! Verify</span>
show isis neighbors
show clns neighbors
show clns interface &lt;int&gt;
show isis database [detail]
show isis hostname
show ip route isis
show running-config | section router isis</pre>

<div class="eg"><p><b>Worked example.</b> Self-test with the lab. Predict before you type: R2 (L1-2, 49.0001) connects to R3 (L1-2, 49.0002) and to R1 (L1, 49.0001). Which neighbours and which types does R2 show? Answer: R1 as L1 and R3 as L2. Which router sets ATT and where? R2 sets it in its level-1 LSP. Does R1 know 4.4.4.4 before leaking? No: only a default route. After leaking 4.4.4.4/32: yes, as <code>i ia</code>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising commands without predicting the output. In the exam you rarely see the output; you must know what it would say. Predict first, then run the command, and learn from every difference.</p></div>
<div class="exam"><p><b>Exam trap.</b> Re-read: ATT is set by L1-2 routers in <b>level-1</b> LSPs; L1 adjacency needs the same area; L2 needs none; DIS is per level and preemptive; narrow metric is the IOS default (next module).</p></div>

<div class="scn"><h4>From lab to production</h4><p>A candidate who had completed both IS-IS labs was asked, in his first week on a real network, why one access router had no route to another area. He checked R-access: level-1 only, ATT not seen in the neighbour's LSP because the neighbour had no level-2 adjacency after a failed uplink. The uplink repair restored ATT and the default route returned. He had practised exactly this chain in the lab.</p><p><b>Lesson:</b> lab practice with predicted outputs transfers directly to production.</p></div>

<div class="iv"><p class="q">"Explain IS-IS to me in two minutes."</p><p>Link-state IGP on layer 2 with TLVs; routers named by a NET; two levels, L1 inside an area, L2 as the backbone, L1-2 joining them; DIS and pseudonode on LANs, point-to-point on core links; ATT bit gives level-1 routers a default route, leaking gives specifics, overload bit drains a router; authentication protects adjacencies. Finish with one troubleshooting example.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NET names router and area; read it from the right.</li>
<li>L1 needs the same area; L2 does not; L1-2 in different areas form L2.</li>
<li>DIS per level, preemptive, no backup; use p2p on core links.</li>
<li>ATT bit gives a default route; leaking gives specific routes; OL bit drains.</li>
<li>Next: spcor-isis-design for wide metrics, multivendor cores and redistribution.</li>
</ul></div>
`,hi:`
<p>Ab aap two-level IS-IS network bana sakte ho, uske databases padh sakte ho, predict kar sakte ho ki kaunsi adjacencies banengi, chup link ka cause dhoondh sakte ho aur network ko safely operate kar sakte ho. Yeh chapter aapki revision sheet hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IS-IS ek picture mein">
<rect x="20" y="20" width="600" height="34" rx="8" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">NET = area + system ID + 00 | router ka ek NET | router ka ek area</text>
<rect x="20" y="62" width="600" height="34" rx="8" fill="#bae6fd"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="13">PDUs: IIH, LSP, CSNP, PSNP | TLVs | LSP ID = system ID + pseudonode + fragment</text>
<rect x="20" y="104" width="600" height="34" rx="8" fill="#bbf7d0"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">Levels: L1 (same area), L2 (backbone), L1-2 (dono) | circuit-type per interface</text>
<rect x="20" y="146" width="600" height="34" rx="8" fill="#fde68a"/><text x="320" y="168" text-anchor="middle" class="svg-ink" font-size="13">LAN: DIS + pseudonode | core links: isis network point-to-point</text>
<rect x="20" y="188" width="600" height="34" rx="8" fill="#fed7aa"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">ATT bit = default route | leaking = specific routes | OL bit = drain</text>
</svg><p class="cap">IS-IS ek page par.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main NET likh sakta hoon aur use area, system ID aur NSEL mein baant sakta hoon, aur loopback ko system ID mein encode kar sakta hoon.</li>
<li>Main chaar PDUs ke naam aur har ka kaam bata sakta hoon.</li>
<li>Main <code>show isis database detail</code> padh sakta hoon aur LSP ID, sequence number, lifetime, ATT/P/OL aur dikhaye TLVs samjha sakta hoon.</li>
<li>Main router types aur areas ki kisi bhi jodi ke liye adjacency (L1, L2, koi nahi) predict kar sakta hoon.</li>
<li>Main DIS election, pseudonode aur core links par point-to-point ka karan samjha sakta hoon.</li>
<li>Main attached bit, default route, route leaking, up/down bit aur summarisation samjha sakta hoon.</li>
<li>Main overload bit se router drain kar sakta hoon aur authentication ke teen scopes jaanta hoon.</li>
<li>Main chhe-step workflow se chup adjacency troubleshoot kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>NET</dt><dd>Network Entity Title: area + system ID + NSEL 00.</dd>
<dt>System ID</dt><dd>Chhe-byte unique router identifier.</dd>
<dt>IIH / LSP / CSNP / PSNP</dt><dd>Hello, link-state PDU, complete aur partial sequence number PDUs.</dd>
<dt>TLV</dt><dd>PDU ke andar Type-Length-Value block.</dd>
<dt>DIS / pseudonode</dt><dd>LAN ka chairperson aur woh virtual router jo LAN ko represent karta hai.</dd>
<dt>ATT bit</dt><dd>Level-1 LSP mein attached bit: yeh router doosre areas tak pahunchta hai.</dd>
<dt>OL bit</dt><dd>Overload bit: is router ko transit ke liye use mat karo.</dd>
<dt>Route leaking</dt><dd>Level-2 routes ko chunkar level 1 mein advertise karna.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Router ka NSEL</td><td>00</td></tr>
<tr><td>System ID length</td><td>6 bytes</td></tr>
<tr><td>Default IOS router type / metric style</td><td>level-1-2 / narrow</td></tr>
<tr><td>IOS par default interface metric</td><td>10; distance 115</td></tr>
<tr><td>Hello interval aur hold (LAN, router)</td><td>10 s aur 30 s; DIS 3.33 s aur 10 s</td></tr>
<tr><td>LSP max lifetime / refresh</td><td>1200 s / 900 s</td></tr>
<tr><td>DIS se CSNP interval</td><td>10 s</td></tr>
<tr><td>DIS election</td><td>Sabse zyada priority (default 64), phir sabse bada MAC; preemptive; backup nahi</td></tr>
<tr><td>Alag areas ke L1-2 se L1-2 adjacency</td><td>Sirf level 2</td></tr>
<tr><td>Circuit Id 00 / R3.01</td><td>Point-to-point / LAN jahan DIS R3 aur pseudonode 01</td></tr>
<tr><td>IOS par leak kiye route ka code</td><td>i ia</td></tr></table>

<h3>Command cheat-sheet (IOS XE style)</h3>
<pre class="code"><span class="c">! Configure</span>
router isis
 net 49.0001.0000.0000.0002.00
 is-type level-1-2
 redistribute isis ip level-2 into level-1 route-map &lt;NAME&gt;
 set-overload-bit
interface GigabitEthernet0/1
 ip router isis
 isis network point-to-point
 isis circuit-type level-2-only
 isis priority 100 level-1
 isis metric 30
<span class="c">! Verify</span>
show isis neighbors
show clns neighbors
show clns interface &lt;int&gt;
show isis database [detail]
show isis hostname
show ip route isis
show running-config | section router isis</pre>

<div class="eg"><p><b>Worked example.</b> Lab ke saath self-test. Type karne se pehle predict karo: R2 (L1-2, 49.0001) R3 (L1-2, 49.0002) aur R1 (L1, 49.0001) se juda hai. R2 kaunse neighbours aur kaunse types dikhata hai? Jawab: R1 L1 ki tarah aur R3 L2 ki tarah. ATT kaun set karta hai aur kahan? R2 ise apne level-1 LSP mein set karta hai. Kya leaking se pehle R1 4.4.4.4 jaanta hai? Nahi: sirf default route. 4.4.4.4/32 leak karne ke baad: haan, <code>i ia</code> ki tarah.</p></div>

<div class="warn"><p><b>Common mistake.</b> Output predict kiye bina commands ratna. Exam mein output kam hi dikhta hai; aapko pata hona chahiye woh kya kehta. Pehle predict karo, phir command chalao, aur har farak se seekho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Dobara padho: ATT bit L1-2 routers <b>level-1</b> LSPs mein set karte hain; L1 adjacency ko same area chahiye; L2 ko nahi; DIS per level aur preemptive hai; narrow metric IOS default hai (agla module).</p></div>

<div class="scn"><h4>Lab se production tak</h4><p>Jis candidate ne dono IS-IS labs kar liye the, usse real network par pehle hafte mein poochha gaya ki ek access router ke paas doosre area ka route kyun nahi. Usne R-access check kiya: sirf level-1, neighbour ke LSP mein ATT nahi dikha kyunki failed uplink ke baad neighbour ki level-2 adjacency nahi thi. Uplink repair se ATT wapas aaya aur default route lautaya. Usne yehi chain lab mein practise ki thi.</p><p><b>Lesson:</b> predicted outputs ke saath lab practice seedha production par kaam aati hai.</p></div>

<div class="iv"><p class="q">"Mujhe do minute mein IS-IS samjhao."</p><p>Layer 2 par TLVs wala link-state IGP; routers NET se naam paate hain; do levels, L1 area ke andar, L2 backbone, L1-2 unhe jodta hai; LANs par DIS aur pseudonode, core links par point-to-point; ATT bit level-1 routers ko default route deta hai, leaking specifics deti hai, overload bit router drain karta hai; authentication adjacencies protect karti hai. Ek troubleshooting example se khatam karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NET router aur area ko naam deta hai; ise right se padho.</li>
<li>L1 ko same area chahiye; L2 ko nahi; alag areas ke L1-2 L2 banate hain.</li>
<li>DIS per level, preemptive, backup nahi; core links par p2p use karo.</li>
<li>ATT bit default route deta hai; leaking specific routes; OL bit drain karta hai.</li>
<li>Aage: wide metrics, multivendor cores aur redistribution ke liye spcor-isis-design.</li>
</ul></div>
`}};export{e as default};