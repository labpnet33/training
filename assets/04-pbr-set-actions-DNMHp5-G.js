var e={id:`pbr-set`,h:{en:`Set actions, their order and what happens on failure`,hi:`Set actions, unka order aur failure par kya hota hai`},body:{en:`
<p>A taxi dispatcher can give a driver three kinds of instruction: "Take exactly this road", "Take this road only if the map has no better idea", or "Leave through this gate". PBR's set clauses are the same three kinds of instruction. Picking the wrong one is the most common reason a PBR policy "works in the lab and fails in production".</p>

<h3>The four forwarding set clauses</h3>
<table class="cmp"><tr><th>Clause</th><th>Behaviour</th><th>When to use</th></tr>
<tr><td><code>set ip next-hop A [B ...]</code></td><td>Overrides the routing table. Uses the first listed next hop that is directly connected and reachable. If none is usable, falls back to normal routing.</td><td>The usual choice: "guests always via ISP2".</td></tr>
<tr><td><code>set ip next-hop recursive A</code></td><td>A does not need to be connected; the router looks up how to reach A in the routing table and forwards toward it. Only one recursive address is allowed per clause.</td><td>Steering toward a remote point, for example a firewall two hops away.</td></tr>
<tr><td><code>set ip default next-hop A [B ...]</code></td><td>Used <b>only if the routing table has no explicit route</b> for the destination. The default route 0.0.0.0/0 does not count as explicit.</td><td>"Use ISP2 for internet destinations, but let internal routes win."</td></tr>
<tr><td><code>set interface X [Y ...]</code> and <code>set default interface X</code></td><td>Send out the first listed interface that is up; the default variant only when there is no explicit route.</td><td>Point-to-point links (serial, tunnel). <code>set interface Null0</code> drops.</td></tr>
</table>

<h3>Order of evaluation</h3>
<p>You can put several set clauses in one sequence. IOS evaluates them in a fixed order, regardless of the order you typed them:</p>
<ol>
<li><code>set ip next-hop</code> (including verify-availability and recursive)</li>
<li><code>set interface</code></li>
<li><code>set ip default next-hop</code></li>
<li><code>set default interface</code></li>
</ol>
<p>The first clause that can forward the packet wins. If none can, the packet goes to normal routing. This gives you a chain of backups inside one sequence.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="set clause evaluation order">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="13">1 next-hop</text>
<rect x="170" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="240" y="47" text-anchor="middle" class="svg-ink" font-size="13">2 interface</text>
<rect x="330" y="20" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="400" y="41" text-anchor="middle" class="svg-ink" font-size="13">3 default</text><text x="400" y="57" text-anchor="middle" class="svg-muted" font-size="12">next-hop</text>
<rect x="490" y="20" width="140" height="44" rx="8" fill="#fde68a"/><text x="560" y="41" text-anchor="middle" class="svg-ink" font-size="13">4 default</text><text x="560" y="57" text-anchor="middle" class="svg-muted" font-size="12">interface</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="42" x2="330" y2="42" stroke="#64748b" stroke-width="2"/><line x1="470" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/>
<rect x="170" y="150" width="300" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">Normal routing table lookup</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">if no clause can forward</text>
<line x1="560" y1="64" x2="470" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="12">3 and 4 apply only when no explicit route exists</text>
</svg><p class="cap">Set clauses are tried in a fixed order; the routing table is the final fallback.</p></div>

<h3>next-hop versus default next-hop: a worked example</h3>
<div class="eg"><p><b>Worked example.</b> EDGE's routing table has <code>0.0.0.0/0 via 10.0.1.1</code> and an OSPF route <code>172.16.50.0/24 via 10.0.1.1</code> to the head office. Compare two policies on Gi0/3 for a guest packet to 198.51.100.10 and one to 172.16.50.20:</p>
<ul>
<li><code>set ip next-hop 10.0.2.1</code>: both packets go to ISP2. Even the head-office traffic is forced out the guest ISP (which is probably not what you wanted).</li>
<li><code>set ip default next-hop 10.0.2.1</code>: 198.51.100.10 has only the default route, so it goes to ISP2. 172.16.50.20 has an explicit OSPF route, so it follows the routing table via 10.0.1.1.</li>
</ul></div>

<h3>Cross-reference: summarisation changes the answer (blueprint 1.5)</h3>
<p>Because <code>set ip default next-hop</code> depends on "is there an explicit route?", any <b>summary route</b> in the table changes PBR behaviour. Suppose a neighbour starts advertising the summary 198.51.0.0/16, or someone adds <code>ip route 198.51.0.0 255.255.0.0 10.0.1.1</code>. Now 198.51.100.10 has an explicit route, so the default next hop is skipped and guests silently return to ISP1. Worse, if EDGE itself originates an EIGRP or OSPF summary, it installs a <b>discard route to Null0</b> for that summary. Destinations inside the summary that have no more specific route now match the Null0 route, which is explicit, so <code>set ip default next-hop</code> never triggers and the packets are dropped. When a PBR policy with default next-hop "suddenly stops", always ask: did someone add or change a summary?</p>

<pre class="out">EDGE# show ip route 198.51.100.10
Routing entry for 198.51.0.0/16
  <span class="hl">Known via "eigrp 100", distance 5, metric 28160, type internal</span>
  Routing Descriptor Blocks:
  * directly connected, via Null0</pre>

<h3>Failure behaviour: fail-open, not fail-safe</h3>
<p>When the Gi0/1 link to ISP2 goes down, 10.0.2.1 is no longer a connected next hop. PBR considers it unavailable, tries the next address in the list if any, and otherwise routes normally. Guests fall back to ISP1 automatically. That is good. The dangerous case is the opposite: Gi0/1 stays <b>up</b> but ISP2's upstream is broken. From EDGE's point of view 10.0.2.1 is still connected and reachable, so PBR keeps sending guests into a black hole. Plain <code>set ip next-hop</code> checks only the local link, never the path behind it. Chapter 5 fixes this with IP SLA and tracking.</p>

<div class="warn"><p><b>Common mistakes.</b> Using <code>set interface GigabitEthernet0/1</code> on an Ethernet link: without a next hop the router must ARP for each final destination, which only works if the ISP answers proxy ARP. Use <code>set ip next-hop</code> on multi-access links. Second mistake: listing a next hop that is not connected without the <code>recursive</code> keyword; PBR ignores it and you get normal routing.</p></div>

<div class="exam"><p><b>Exam trap.</b> "The routing table has a specific route and a default route; which set clause lets the specific route win?" The answer is <code>set ip default next-hop</code>. And remember that a Null0 summary route counts as an explicit route.</p></div>

<div class="scn"><h4>The summary that broke guest browsing</h4><p>A company's guest policy used <code>set ip default next-hop</code> toward a broadband router, so internal routes would stay on the MPLS WAN. After a routing clean-up, the WAN team added an EIGRP summary 10.0.0.0/8 on the branch router. Guests could suddenly no longer reach a partner portal at 10.200.1.5 that lived on the internet side through a VPN. <code>show ip route 10.200.1.5</code> matched the new summary pointing to Null0. The fix was a specific route for the partner prefix plus changing the guest policy to <code>set ip next-hop</code> for that destination.</p><p><b>Lesson:</b> default next-hop decisions depend on the whole routing table; summarisation changes them.</p></div>

<div class="iv"><p class="q">"What is the difference between set ip next-hop and set ip default next-hop?"</p><p>Strong answer: <code>set ip next-hop</code> overrides the routing table for matched packets, as long as the next hop is connected and usable. <code>set ip default next-hop</code> is used only when the routing table has no explicit route for the destination; the default route does not count. Then give the evaluation order (next-hop, interface, default next-hop, default interface) and mention that summaries, including Null0 discard routes, count as explicit routes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>set ip next-hop</code> overrides; <code>set ip default next-hop</code> only fills gaps where no explicit route exists.</li>
<li>Evaluation order: next-hop, interface, default next-hop, default interface, then normal routing.</li>
<li><code>recursive</code> allows a non-connected next hop; <code>set interface</code> suits point-to-point links.</li>
<li>Summary routes (including Null0 discard routes) count as explicit and change default next-hop behaviour.</li>
<li>Without tracking, PBR only notices a dead local link, not a dead path behind a live link.</li>
</ul></div>
`,hi:`
<p>Ek taxi dispatcher driver ko teen tarah ki instruction de sakta hai: "Bilkul yahi road lo", "Yeh road tabhi lo jab map ke paas koi behtar idea na ho", ya "Is gate se bahar niklo". PBR ke set clauses bhi yahi teen tarah ki instructions hain. Galat wala chunna sabse common wajah hai ki PBR policy "lab mein chalti hai aur production mein fail hoti hai".</p>

<h3>Chaar forwarding set clauses</h3>
<table class="cmp"><tr><th>Clause</th><th>Behaviour</th><th>Kab use karein</th></tr>
<tr><td><code>set ip next-hop A [B ...]</code></td><td>Routing table ko override karta hai. List ka pehla next hop use karta hai jo directly connected aur reachable ho. Koi usable na ho to normal routing par laut aata hai.</td><td>Aam choice: "guests hamesha ISP2 se".</td></tr>
<tr><td><code>set ip next-hop recursive A</code></td><td>A ka connected hona zaroori nahi; router routing table mein dekhta hai A tak kaise pahunchein aur uski taraf forward karta hai. Ek clause mein sirf ek recursive address allowed hai.</td><td>Kisi door ke point ki taraf steer karna, jaise do hop door firewall.</td></tr>
<tr><td><code>set ip default next-hop A [B ...]</code></td><td>Sirf tab use hota hai <b>jab routing table mein destination ka koi explicit route na ho</b>. Default route 0.0.0.0/0 explicit nahi ginta.</td><td>"Internet destinations ke liye ISP2 use karo, lekin internal routes jeetein."</td></tr>
<tr><td><code>set interface X [Y ...]</code> aur <code>set default interface X</code></td><td>List ke pehle up interface se bhejo; default variant sirf tab jab explicit route na ho.</td><td>Point-to-point links (serial, tunnel). <code>set interface Null0</code> drop karta hai.</td></tr>
</table>

<h3>Evaluation ka order</h3>
<p>Aap ek sequence mein kai set clauses daal sakte ho. IOS unhe ek fixed order mein evaluate karta hai, chahe aapne kisi bhi order mein type kiya ho:</p>
<ol>
<li><code>set ip next-hop</code> (verify-availability aur recursive samet)</li>
<li><code>set interface</code></li>
<li><code>set ip default next-hop</code></li>
<li><code>set default interface</code></li>
</ol>
<p>Jo pehla clause packet forward kar sake woh jeet-ta hai. Koi na kar sake to packet normal routing par jaata hai. Isse ek sequence ke andar backups ki chain mil jaati hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="set clause evaluation order">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="13">1 next-hop</text>
<rect x="170" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="240" y="47" text-anchor="middle" class="svg-ink" font-size="13">2 interface</text>
<rect x="330" y="20" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="400" y="41" text-anchor="middle" class="svg-ink" font-size="13">3 default</text><text x="400" y="57" text-anchor="middle" class="svg-muted" font-size="12">next-hop</text>
<rect x="490" y="20" width="140" height="44" rx="8" fill="#fde68a"/><text x="560" y="41" text-anchor="middle" class="svg-ink" font-size="13">4 default</text><text x="560" y="57" text-anchor="middle" class="svg-muted" font-size="12">interface</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="42" x2="330" y2="42" stroke="#64748b" stroke-width="2"/><line x1="470" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/>
<rect x="170" y="150" width="300" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">Normal routing table lookup</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">jab koi clause forward na kar sake</text>
<line x1="560" y1="64" x2="470" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="12">3 aur 4 sirf tab jab explicit route na ho</text>
</svg><p class="cap">Set clauses fixed order mein try hote hain; routing table aakhri fallback hai.</p></div>

<h3>next-hop vs default next-hop: ek worked example</h3>
<div class="eg"><p><b>Worked example.</b> EDGE ki routing table mein <code>0.0.0.0/0 via 10.0.1.1</code> aur head office ka OSPF route <code>172.16.50.0/24 via 10.0.1.1</code> hai. Gi0/3 par do policies compare karo, ek guest packet 198.51.100.10 ke liye aur ek 172.16.50.20 ke liye:</p>
<ul>
<li><code>set ip next-hop 10.0.2.1</code>: dono packets ISP2 par jaate hain. Head-office traffic bhi guest ISP se bahar dhakela jaata hai (jo shayad aap nahi chahte the).</li>
<li><code>set ip default next-hop 10.0.2.1</code>: 198.51.100.10 ke paas sirf default route hai, isliye woh ISP2 par jaata hai. 172.16.50.20 ke paas explicit OSPF route hai, isliye woh routing table follow karke 10.0.1.1 se jaata hai.</li>
</ul></div>

<h3>Cross-reference: summarisation jawab badal deta hai (blueprint 1.5)</h3>
<p>Kyunki <code>set ip default next-hop</code> is baat par depend karta hai ki "kya explicit route hai?", table mein koi bhi <b>summary route</b> PBR behaviour badal deta hai. Maan lo ek neighbour summary 198.51.0.0/16 advertise karna shuru karta hai, ya koi <code>ip route 198.51.0.0 255.255.0.0 10.0.1.1</code> jod deta hai. Ab 198.51.100.10 ka explicit route hai, isliye default next hop skip hota hai aur guests chupchaap ISP1 par laut jaate hain. Isse bura, agar EDGE khud EIGRP ya OSPF summary originate karta hai, to woh us summary ke liye <b>Null0 ki taraf discard route</b> install karta hai. Summary ke andar ke jin destinations ka koi more specific route nahi, woh ab Null0 route se match karte hain, jo explicit hai, isliye <code>set ip default next-hop</code> kabhi trigger nahi hota aur packets drop ho jaate hain. Jab default next-hop wali PBR policy "achanak ruk jaaye", hamesha poocho: kya kisi ne summary joda ya badla?</p>

<pre class="out">EDGE# show ip route 198.51.100.10
Routing entry for 198.51.0.0/16
  <span class="hl">Known via "eigrp 100", distance 5, metric 28160, type internal</span>
  Routing Descriptor Blocks:
  * directly connected, via Null0</pre>

<h3>Failure behaviour: fail-open, fail-safe nahi</h3>
<p>Jab ISP2 ki taraf Gi0/1 link down hota hai, 10.0.2.1 connected next hop nahi rehta. PBR use unavailable maanta hai, list mein agla address ho to use try karta hai, warna normal route karta hai. Guests automatically ISP1 par laut jaate hain. Yeh achha hai. Khatarnak case ulta hai: Gi0/1 <b>up</b> rehta hai lekin ISP2 ka upstream toot gaya hai. EDGE ki nazar se 10.0.2.1 abhi bhi connected aur reachable hai, isliye PBR guests ko black hole mein bhejta rehta hai. Plain <code>set ip next-hop</code> sirf local link check karta hai, uske peeche ka path kabhi nahi. Chapter 5 ise IP SLA aur tracking se fix karta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Ethernet link par <code>set interface GigabitEthernet0/1</code> use karna: next hop ke bina router ko har final destination ke liye ARP karna padta hai, jo sirf tab chalta hai jab ISP proxy ARP ka jawab de. Multi-access links par <code>set ip next-hop</code> use karo. Doosri galti: <code>recursive</code> keyword ke bina aisa next hop list karna jo connected nahi; PBR use ignore karta hai aur aapko normal routing milti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Routing table mein ek specific route aur ek default route hai; kaunsa set clause specific route ko jeetne deta hai?" Jawab <code>set ip default next-hop</code> hai. Aur yaad rakho Null0 summary route bhi explicit route ginta hai.</p></div>

<div class="scn"><h4>Woh summary jisne guest browsing tod di</h4><p>Ek company ki guest policy broadband router ki taraf <code>set ip default next-hop</code> use karti thi, taaki internal routes MPLS WAN par rahein. Routing clean-up ke baad WAN team ne branch router par EIGRP summary 10.0.0.0/8 joda. Guests achanak 10.200.1.5 par ek partner portal tak nahi pahunch paa rahe the jo VPN ke through internet side par tha. <code>show ip route 10.200.1.5</code> naye summary se match kar raha tha jo Null0 ki taraf tha. Fix tha partner prefix ka specific route plus us destination ke liye guest policy ko <code>set ip next-hop</code> mein badalna.</p><p><b>Seekh:</b> default next-hop decisions poori routing table par depend karte hain; summarisation unhe badal deta hai.</p></div>

<div class="iv"><p class="q">"set ip next-hop aur set ip default next-hop mein kya farak hai?"</p><p>Strong answer: <code>set ip next-hop</code> matched packets ke liye routing table ko override karta hai, jab tak next hop connected aur usable ho. <code>set ip default next-hop</code> sirf tab use hota hai jab routing table mein destination ka koi explicit route na ho; default route nahi ginta. Phir evaluation order batao (next-hop, interface, default next-hop, default interface) aur batao ki summaries, Null0 discard routes samet, explicit routes ginte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>set ip next-hop</code> override karta hai; <code>set ip default next-hop</code> sirf wahan bharta hai jahan explicit route nahi.</li>
<li>Evaluation order: next-hop, interface, default next-hop, default interface, phir normal routing.</li>
<li><code>recursive</code> non-connected next hop allow karta hai; <code>set interface</code> point-to-point links ke liye theek hai.</li>
<li>Summary routes (Null0 discard routes samet) explicit ginte hain aur default next-hop behaviour badalte hain.</li>
<li>Tracking ke bina PBR sirf dead local link notice karta hai, live link ke peeche ka dead path nahi.</li>
</ul></div>
`}};export{e as default};