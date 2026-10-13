var e={id:`rp-discovery`,h:{en:`Finding the RP: static, Auto-RP and BSR`,hi:`RP dhoondhna: static, Auto-RP aur BSR`},body:{en:`
<p>Every branch of a company must know which office handles recruitment. You can print the address on every employee's ID card (easy, but a reprint when it moves), or have HR send a notice to all offices whenever it changes. PIM has exactly these choices for telling routers where the RP is: <b>static</b> configuration, Cisco's <b>Auto-RP</b>, or the standard <b>Bootstrap Router (BSR)</b>. Whatever the method, the rule is the same: <b>all routers must map a group to the same RP</b>, or the shared tree splits in two.</p>

<h3>Method 1: static RP</h3>
<pre class="code"><span class="c">! On EVERY router, including the RP itself</span>
ip pim rp-address 2.2.2.2                  <span class="c">! all groups 224.0.0.0/4</span>
<span class="c">! or only for a range:</span>
access-list 20 permit 239.10.0.0 0.0.255.255
ip pim rp-address 2.2.2.2 20
ip pim rp-address 2.2.2.2 override         <span class="c">! static wins over Auto-RP/BSR info</span></pre>
<pre class="out">R3# show ip pim rp mapping
PIM Group-to-RP Mappings

<span class="hl">Group(s): 224.0.0.0/4, Static
    RP: 2.2.2.2 (?)</span></pre>
<p>Static is simple, predictable and what our configuration lab uses. The downsides: every router must be touched to change the RP, and a single static RP has no failover (Anycast RP in chapter 10 fixes that). By default a <b>dynamically learned mapping wins</b> over a static one for the same group, unless you add <code>override</code>.</p>

<h3>Method 2: Auto-RP (Cisco proprietary)</h3>
<p>Auto-RP uses two roles and two well-known groups from the Internetwork Control Block:</p>
<dl class="terms">
<dt>Candidate RP (C-RP)</dt><dd>A router willing to be RP. It sends <b>RP-Announce</b> messages to <b>224.0.1.39</b> every 60 s, listing the group ranges it offers.</dd>
<dt>Mapping agent (MA)</dt><dd>Listens on 224.0.1.39, chooses one RP per group range (the <b>highest IP</b> C-RP wins), and advertises the result in <b>RP-Discovery</b> messages to <b>224.0.1.40</b> every 60 s. All Cisco PIM routers join 224.0.1.40 automatically.</dd>
</dl>
<pre class="code"><span class="c">! Candidate RP (R2)</span>
ip pim send-rp-announce Loopback0 scope 16 group-list 10
access-list 10 permit 239.0.0.0 0.255.255.255
<span class="c">! Mapping agent (R4)</span>
ip pim send-rp-discovery Loopback0 scope 16
<span class="c">! All sparse-mode routers</span>
ip pim autorp listener</pre>
<p>The <b>chicken-and-egg problem</b>: 224.0.1.39 and .40 are multicast groups, and in pure sparse mode a group needs an RP before it can flow, yet these groups are how you learn the RP. Two solutions: run interfaces in <code>ip pim sparse-dense-mode</code> so groups without an RP (like these two) are flooded in dense mode, or keep <code>ip pim sparse-mode</code> and add <code>ip pim autorp listener</code>, which floods only 224.0.1.39 and 224.0.1.40 in dense mode. <b>scope</b> sets the TTL of the announcements.</p>
<pre class="out">R3# show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s) 239.0.0.0/8
<span class="hl">  RP 2.2.2.2 (?), v2v1
    Info source: 4.4.4.4 (?), elected via Auto-RP</span>
         Uptime: 00:04:32, expires: 00:02:27</pre>

<h3>Method 3: Bootstrap Router (BSR), the standard</h3>
<p>BSR is part of PIMv2 (RFC 5059) and works with any vendor. It does not use multicast groups for its messages, so there is no chicken-and-egg problem:</p>
<ol>
<li><b>Candidate BSRs</b> flood Bootstrap messages. The highest BSR priority wins (default 0), then the highest IP. One BSR is elected.</li>
<li><b>Candidate RPs</b> unicast <b>C-RP-Advertisements</b> to the elected BSR.</li>
<li>The BSR does <b>not</b> choose. It floods the whole candidate list, the <b>RP-set</b>, in Bootstrap messages every 60 s, hop by hop to 224.0.0.13 on every PIM interface.</li>
<li>Every router runs the same algorithm on the RP-set: lowest C-RP priority value wins, then a <b>hash</b> of group and RP address spreads groups across equal candidates, then the highest IP. Same input, same answer everywhere.</li>
</ol>
<pre class="code"><span class="c">! Candidate BSR (R4): hash-mask-length 0, priority 10</span>
ip pim bsr-candidate Loopback0 0 10
<span class="c">! Candidate RP (R2)</span>
ip pim rp-candidate Loopback0 group-list 10 priority 10</pre>
<pre class="out">R3# show ip pim rp mapping
Group(s) 239.0.0.0/8
<span class="hl">  RP 2.2.2.2 (?), v2
    Info source: 4.4.4.4 (?), via bootstrap, priority 10, holdtime 150</span>
         Uptime: 00:03:10, expires: 00:02:19
R3# show ip pim bsr-router
PIMv2 Bootstrap information
  BSR address: 4.4.4.4 (?)
  Uptime:      00:10:12, BSR Priority: 10, Hash mask length: 0
  Expires:     00:01:58</pre>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Auto-RP versus BSR">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">Auto-RP</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">BSR</text>
<rect x="30" y="40" width="100" height="34" rx="6" fill="#ddd6fe"/><text x="80" y="62" text-anchor="middle" class="svg-ink" font-size="12">C-RP</text>
<rect x="190" y="40" width="110" height="34" rx="6" fill="#fde68a"/><text x="245" y="62" text-anchor="middle" class="svg-ink" font-size="12">Mapping agent</text>
<line x1="130" y1="57" x2="190" y2="57" stroke="#64748b" stroke-width="2"/><text x="160" y="92" text-anchor="middle" class="svg-muted" font-size="11">224.0.1.39</text>
<rect x="110" y="150" width="120" height="34" rx="6" fill="#bae6fd"/><text x="170" y="172" text-anchor="middle" class="svg-ink" font-size="12">All routers</text>
<line x1="245" y1="74" x2="190" y2="150" stroke="#64748b" stroke-width="2"/><text x="250" y="120" class="svg-muted" font-size="11">224.0.1.40</text>
<text x="160" y="210" text-anchor="middle" class="svg-accent" font-size="12">MA chooses (highest IP)</text>
<rect x="350" y="40" width="100" height="34" rx="6" fill="#ddd6fe"/><text x="400" y="62" text-anchor="middle" class="svg-ink" font-size="12">C-RP</text>
<rect x="510" y="40" width="100" height="34" rx="6" fill="#fde68a"/><text x="560" y="62" text-anchor="middle" class="svg-ink" font-size="12">BSR</text>
<line x1="450" y1="57" x2="510" y2="57" stroke="#64748b" stroke-width="2"/><text x="480" y="92" text-anchor="middle" class="svg-muted" font-size="11">unicast</text>
<rect x="430" y="150" width="120" height="34" rx="6" fill="#bae6fd"/><text x="490" y="172" text-anchor="middle" class="svg-ink" font-size="12">All routers</text>
<line x1="560" y1="74" x2="510" y2="150" stroke="#64748b" stroke-width="2"/><text x="560" y="120" class="svg-muted" font-size="11">224.0.0.13 hop by hop</text>
<text x="480" y="210" text-anchor="middle" class="svg-accent" font-size="12">Every router hashes the RP-set</text>
</svg><p class="cap">Auto-RP: the mapping agent decides. BSR: the BSR only distributes the RP-set and each router decides.</p></div>

<table class="cmp">
<tr><th></th><th>Static</th><th>Auto-RP</th><th>BSR</th></tr>
<tr><td>Standard</td><td>Any</td><td>Cisco proprietary</td><td>PIMv2 standard</td></tr>
<tr><td>Who picks the RP</td><td>The admin</td><td>Mapping agent (highest C-RP IP)</td><td>Each router (priority, hash, IP)</td></tr>
<tr><td>Transport</td><td>None</td><td>224.0.1.39 / 224.0.1.40, needs dense flooding or autorp listener</td><td>Bootstrap to 224.0.0.13 hop by hop; C-RP ads unicast</td></tr>
<tr><td>Failover</td><td>No (unless Anycast RP)</td><td>Yes, when announcements stop</td><td>Yes, when the RP-set changes</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Auto-RP: C-RPs 2.2.2.2 and 3.3.3.3 both announce 239.0.0.0/8. The mapping agent picks <b>3.3.3.3</b> (highest IP). If you wanted 2.2.2.2 as primary, Auto-RP gives you no priority knob; you would change addresses or group lists. BSR: the same two C-RPs with priorities 10 and 20. Lower priority wins, so every router chooses <b>2.2.2.2</b>. If 2.2.2.2 fails, its advertisements stop, the BSR drops it from the RP-set after the holdtime, and every router moves to 3.3.3.3.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using Auto-RP with pure <code>ip pim sparse-mode</code> and forgetting <code>ip pim autorp listener</code>. The mapping agent's RP-Discovery messages never reach the other routers, and <code>show ip pim rp mapping</code> stays empty on them.</p></div>

<div class="exam"><p><b>Exam trap.</b> Auto-RP: announce to <b>224.0.1.39</b>, discovery to <b>224.0.1.40</b>, Cisco only, highest C-RP IP wins. BSR: standard, flooded hop by hop to 224.0.0.13, the BSR does not select the RP. Dynamic mappings beat static unless <code>override</code>.</p></div>

<div class="scn"><h4>Two RPs for one group</h4><p>After a merger, half of the routers had <code>ip pim rp-address 10.9.9.9</code> from the old company and the other half learned 2.2.2.2 through BSR. Receivers in one half never saw sources in the other. <code>show ip pim rp mapping</code> gave different answers on different routers, so there were two shared trees that never met. Removing the old static mapping made every router follow BSR.</p><p><b>Lesson:</b> run <code>show ip pim rp mapping</code> on several routers; every router must give the same RP for a group.</p></div>

<div class="iv"><p class="q">"Compare Auto-RP and BSR."</p><p>Strong answer: both discover the RP dynamically. Auto-RP is Cisco proprietary: candidate RPs announce to 224.0.1.39, a mapping agent picks the highest-IP candidate and advertises it on 224.0.1.40; because those are multicast groups you need sparse-dense mode or the autorp listener. BSR is the PIMv2 standard: an elected BSR floods the full RP-set hop by hop and every router picks the RP with priority and a hash. Mention that all routers must agree and that <code>show ip pim rp mapping</code> proves it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>All routers must map each group to the same RP; check with <code>show ip pim rp mapping</code>.</li>
<li>Static: <code>ip pim rp-address</code> everywhere; simple, no failover; <code>override</code> beats dynamic info.</li>
<li>Auto-RP: C-RP to 224.0.1.39, mapping agent to 224.0.1.40, highest IP wins, needs autorp listener or sparse-dense.</li>
<li>BSR: standard; BSR floods the RP-set, each router chooses by priority, hash, IP.</li>
<li>Lower C-RP priority wins in BSR; higher BSR priority wins the BSR election.</li>
</ul></div>
`,hi:`
<p>Company ki har branch ko pata hona chahiye ki recruitment kaunsa office sambhalta hai. Aap address har employee ke ID card par chhaap sakte ho (aasaan, par office shift ho to dobara chhaapna), ya HR badlav hone par saare offices ko notice bheje. PIM ke paas routers ko RP batane ke bilkul yahi options hain: <b>static</b> configuration, Cisco ka <b>Auto-RP</b>, ya standard <b>Bootstrap Router (BSR)</b>. Method koi bhi ho, rule same hai: <b>saare routers ek group ko same RP par map karein</b>, warna shared tree do tukdon mein batt jaata hai.</p>

<h3>Method 1: static RP</h3>
<pre class="code"><span class="c">! HAR router par, RP khud bhi</span>
ip pim rp-address 2.2.2.2                  <span class="c">! saare groups 224.0.0.0/4</span>
<span class="c">! ya sirf ek range ke liye:</span>
access-list 20 permit 239.10.0.0 0.0.255.255
ip pim rp-address 2.2.2.2 20
ip pim rp-address 2.2.2.2 override         <span class="c">! static Auto-RP/BSR info se jeetta hai</span></pre>
<pre class="out">R3# show ip pim rp mapping
PIM Group-to-RP Mappings

<span class="hl">Group(s): 224.0.0.0/4, Static
    RP: 2.2.2.2 (?)</span></pre>
<p>Static simple aur predictable hai, aur hamari configuration lab yahi use karti hai. Kamiyan: RP badalne ke liye har router chhoona padta hai, aur akele static RP ka koi failover nahi (chapter 10 ka Anycast RP ise theek karta hai). Default mein same group ke liye <b>dynamically seekha mapping static se jeetta hai</b>, jab tak aap <code>override</code> na jodo.</p>

<h3>Method 2: Auto-RP (Cisco proprietary)</h3>
<p>Auto-RP do roles aur Internetwork Control Block ke do well-known groups use karta hai:</p>
<dl class="terms">
<dt>Candidate RP (C-RP)</dt><dd>Woh router jo RP banne ko tayyar hai. Yeh har 60 s <b>224.0.1.39</b> par <b>RP-Announce</b> messages bhejta hai, jin group ranges ki offer karta hai unki list ke saath.</dd>
<dt>Mapping agent (MA)</dt><dd>224.0.1.39 par sunta hai, har group range ke liye ek RP chunta hai (<b>sabse bada IP</b> wala C-RP jeetta hai), aur result har 60 s <b>224.0.1.40</b> par <b>RP-Discovery</b> messages mein advertise karta hai. Saare Cisco PIM routers 224.0.1.40 apne aap join karte hain.</dd>
</dl>
<pre class="code"><span class="c">! Candidate RP (R2)</span>
ip pim send-rp-announce Loopback0 scope 16 group-list 10
access-list 10 permit 239.0.0.0 0.255.255.255
<span class="c">! Mapping agent (R4)</span>
ip pim send-rp-discovery Loopback0 scope 16
<span class="c">! Saare sparse-mode routers</span>
ip pim autorp listener</pre>
<p><b>Murgi-anda problem</b>: 224.0.1.39 aur .40 multicast groups hain, aur pure sparse mode mein group ko behne ke liye pehle RP chahiye, jabki inhi groups se aap RP seekhte ho. Do solutions: interfaces ko <code>ip pim sparse-dense-mode</code> mein chalao taaki bina RP wale groups (jaise yeh do) dense mode mein flood hon, ya <code>ip pim sparse-mode</code> rakho aur <code>ip pim autorp listener</code> jodo, jo sirf 224.0.1.39 aur 224.0.1.40 ko dense mode mein flood karta hai. <b>scope</b> announcements ka TTL set karta hai.</p>
<pre class="out">R3# show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s) 239.0.0.0/8
<span class="hl">  RP 2.2.2.2 (?), v2v1
    Info source: 4.4.4.4 (?), elected via Auto-RP</span>
         Uptime: 00:04:32, expires: 00:02:27</pre>

<h3>Method 3: Bootstrap Router (BSR), standard</h3>
<p>BSR PIMv2 (RFC 5059) ka hissa hai aur kisi bhi vendor ke saath chalta hai. Yeh apne messages ke liye multicast groups use nahi karta, isliye murgi-anda problem nahi hai:</p>
<ol>
<li><b>Candidate BSRs</b> Bootstrap messages flood karte hain. Sabse zyada BSR priority jeetti hai (default 0), phir sabse bada IP. Ek BSR elect hota hai.</li>
<li><b>Candidate RPs</b> elected BSR ko <b>C-RP-Advertisements</b> unicast karte hain.</li>
<li>BSR khud <b>nahi</b> chunta. Woh poori candidate list, yaani <b>RP-set</b>, har 60 s Bootstrap messages mein flood karta hai, har PIM interface par 224.0.0.13 ko hop by hop.</li>
<li>Har router RP-set par same algorithm chalata hai: sabse kam C-RP priority value jeetti hai, phir group aur RP address ka <b>hash</b> barabar candidates mein groups baant-ta hai, phir sabse bada IP. Same input, har jagah same jawab.</li>
</ol>
<pre class="code"><span class="c">! Candidate BSR (R4): hash-mask-length 0, priority 10</span>
ip pim bsr-candidate Loopback0 0 10
<span class="c">! Candidate RP (R2)</span>
ip pim rp-candidate Loopback0 group-list 10 priority 10</pre>
<pre class="out">R3# show ip pim rp mapping
Group(s) 239.0.0.0/8
<span class="hl">  RP 2.2.2.2 (?), v2
    Info source: 4.4.4.4 (?), via bootstrap, priority 10, holdtime 150</span>
         Uptime: 00:03:10, expires: 00:02:19
R3# show ip pim bsr-router
PIMv2 Bootstrap information
  BSR address: 4.4.4.4 (?)
  Uptime:      00:10:12, BSR Priority: 10, Hash mask length: 0
  Expires:     00:01:58</pre>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Auto-RP versus BSR">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">Auto-RP</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">BSR</text>
<rect x="30" y="40" width="100" height="34" rx="6" fill="#ddd6fe"/><text x="80" y="62" text-anchor="middle" class="svg-ink" font-size="12">C-RP</text>
<rect x="190" y="40" width="110" height="34" rx="6" fill="#fde68a"/><text x="245" y="62" text-anchor="middle" class="svg-ink" font-size="12">Mapping agent</text>
<line x1="130" y1="57" x2="190" y2="57" stroke="#64748b" stroke-width="2"/><text x="160" y="92" text-anchor="middle" class="svg-muted" font-size="11">224.0.1.39</text>
<rect x="110" y="150" width="120" height="34" rx="6" fill="#bae6fd"/><text x="170" y="172" text-anchor="middle" class="svg-ink" font-size="12">Saare routers</text>
<line x1="245" y1="74" x2="190" y2="150" stroke="#64748b" stroke-width="2"/><text x="250" y="120" class="svg-muted" font-size="11">224.0.1.40</text>
<text x="160" y="210" text-anchor="middle" class="svg-accent" font-size="12">MA chunta hai (sabse bada IP)</text>
<rect x="350" y="40" width="100" height="34" rx="6" fill="#ddd6fe"/><text x="400" y="62" text-anchor="middle" class="svg-ink" font-size="12">C-RP</text>
<rect x="510" y="40" width="100" height="34" rx="6" fill="#fde68a"/><text x="560" y="62" text-anchor="middle" class="svg-ink" font-size="12">BSR</text>
<line x1="450" y1="57" x2="510" y2="57" stroke="#64748b" stroke-width="2"/><text x="480" y="92" text-anchor="middle" class="svg-muted" font-size="11">unicast</text>
<rect x="430" y="150" width="120" height="34" rx="6" fill="#bae6fd"/><text x="490" y="172" text-anchor="middle" class="svg-ink" font-size="12">Saare routers</text>
<line x1="560" y1="74" x2="510" y2="150" stroke="#64748b" stroke-width="2"/><text x="560" y="120" class="svg-muted" font-size="11">224.0.0.13 hop by hop</text>
<text x="480" y="210" text-anchor="middle" class="svg-accent" font-size="12">Har router RP-set hash karta hai</text>
</svg><p class="cap">Auto-RP: mapping agent decide karta hai. BSR: BSR sirf RP-set baant-ta hai aur har router khud decide karta hai.</p></div>

<table class="cmp">
<tr><th></th><th>Static</th><th>Auto-RP</th><th>BSR</th></tr>
<tr><td>Standard</td><td>Koi bhi</td><td>Cisco proprietary</td><td>PIMv2 standard</td></tr>
<tr><td>RP kaun chunta hai</td><td>Admin</td><td>Mapping agent (sabse bada C-RP IP)</td><td>Har router (priority, hash, IP)</td></tr>
<tr><td>Transport</td><td>Kuch nahi</td><td>224.0.1.39 / 224.0.1.40, dense flooding ya autorp listener chahiye</td><td>224.0.0.13 par hop by hop Bootstrap; C-RP ads unicast</td></tr>
<tr><td>Failover</td><td>Nahi (Anycast RP ke bina)</td><td>Haan, announcements rukne par</td><td>Haan, RP-set badalne par</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Auto-RP: C-RPs 2.2.2.2 aur 3.3.3.3 dono 239.0.0.0/8 announce karte hain. Mapping agent <b>3.3.3.3</b> chunta hai (sabse bada IP). Agar aapko 2.2.2.2 primary chahiye, Auto-RP koi priority knob nahi deta; aapko addresses ya group lists badalni hongi. BSR: wahi do C-RPs priorities 10 aur 20 ke saath. Kam priority jeetti hai, isliye har router <b>2.2.2.2</b> chunta hai. Agar 2.2.2.2 fail ho, uske advertisements ruk jaate hain, holdtime ke baad BSR use RP-set se hata deta hai, aur har router 3.3.3.3 par chala jaata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Pure <code>ip pim sparse-mode</code> ke saath Auto-RP use karna aur <code>ip pim autorp listener</code> bhool jaana. Mapping agent ke RP-Discovery messages baaki routers tak kabhi nahi pahunchte, aur un par <code>show ip pim rp mapping</code> khaali rehta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Auto-RP: announce <b>224.0.1.39</b> par, discovery <b>224.0.1.40</b> par, sirf Cisco, sabse bada C-RP IP jeetta hai. BSR: standard, 224.0.0.13 par hop by hop flood, BSR RP select nahi karta. Dynamic mappings static se jeet-te hain jab tak <code>override</code> na ho.</p></div>

<div class="scn"><h4>Ek group ke do RPs</h4><p>Merger ke baad aadhe routers par purani company ka <code>ip pim rp-address 10.9.9.9</code> tha aur baaki aadhe BSR se 2.2.2.2 seekh rahe the. Ek aadhe ke receivers ko doosre aadhe ke sources kabhi nahi dikhe. <code>show ip pim rp mapping</code> alag routers par alag jawab deta tha, yaani do shared trees the jo kabhi mile hi nahi. Purana static mapping hatane se har router BSR follow karne laga.</p><p><b>Seekh:</b> kai routers par <code>show ip pim rp mapping</code> chalao; har router ko ek group ke liye same RP dena chahiye.</p></div>

<div class="iv"><p class="q">"Auto-RP aur BSR compare karo."</p><p>Strong answer: dono RP dynamically discover karte hain. Auto-RP Cisco proprietary hai: candidate RPs 224.0.1.39 par announce karte hain, mapping agent sabse bade IP wala candidate chunta hai aur 224.0.1.40 par advertise karta hai; kyunki yeh multicast groups hain, sparse-dense mode ya autorp listener chahiye. BSR PIMv2 standard hai: elected BSR poora RP-set hop by hop flood karta hai aur har router priority aur hash se RP chunta hai. Batao ki saare routers ko agree karna chahiye aur <code>show ip pim rp mapping</code> ise prove karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Saare routers har group ko same RP par map karein; <code>show ip pim rp mapping</code> se check karo.</li>
<li>Static: har jagah <code>ip pim rp-address</code>; simple, failover nahi; <code>override</code> dynamic info ko harata hai.</li>
<li>Auto-RP: C-RP se 224.0.1.39, mapping agent se 224.0.1.40, sabse bada IP jeetta hai, autorp listener ya sparse-dense chahiye.</li>
<li>BSR: standard; BSR RP-set flood karta hai, har router priority, hash, IP se chunta hai.</li>
<li>BSR mein kam C-RP priority jeetti hai; BSR election mein zyada BSR priority jeetti hai.</li>
</ul></div>
`}};export{e as default};