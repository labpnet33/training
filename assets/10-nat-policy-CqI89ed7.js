var e={id:`nat-policy`,h:{en:`The NAT policy: publishing the DMZ web server (lab 2)`,hi:`NAT policy: DMZ web server publish karna (lab 2)`},body:{en:`
<p>A company has one reception phone number printed on its website. When a customer calls it and asks for "web support", the receptionist forwards the call to an internal extension. The customer never learns the extension; the staff never publish it. Static NAT is that receptionist: the world knows 203.0.113.3, the server really lives at 10.0.2.10, and the firewall connects the two. Good news: on Threat Defense, NAT is the ASA NAT you already learned. Only the place where you configure it is new.</p>

<h3>NAT is its own policy</h3>
<p>The access control policy decides <i>whether</i> traffic is allowed; the <b>NAT policy</b> decides <i>how addresses are translated</i>. They are separate policies assigned to the device, and both are compiled into LINA. On a real Management Center the NAT policy lives under <b>Devices → NAT</b> (a <i>Threat Defense NAT</i> policy). In the lab GUI it is under <b>Policies → NAT</b>, with the columns Type, Source Interface, Destination Interface, Original Source, Translated Source and Port Translation.</p>

<h3>Same model as the ASA</h3>
<dl class="terms">
<dt>Auto NAT</dt><dd>One rule attached to one network object: "this object, when it goes from the real interface to the mapped interface, becomes X". On the device it appears as <code>object network WEB / nat (dmz,outside) static 203.0.113.3</code>. Simple and most common.</dd>
<dt>Manual NAT</dt><dd>Twice NAT: can match source and destination together, for example policy NAT for a VPN or translating only toward one partner. Placed before auto NAT (or in a section after it).</dd>
<dt>Static or Dynamic</dt><dd>Static is one-to-one and works in both directions, so the outside can start connections (publishing). Dynamic with <b>Destination Interface IP</b> as the translated source is interface PAT, the many-to-one hide NAT for users.</dd>
<dt>Interface objects</dt><dd>Source Interface Objects = the real side (zone or interface group where the host lives); Destination Interface Objects = the mapped side.</dd>
</dl>
<p>The evaluation order is the ASA order: Section 1 manual NAT, Section 2 auto NAT (static before dynamic, then longest prefix), Section 3 manual NAT after auto.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Static NAT and the real-IP rule">
<rect x="10" y="80" width="140" height="56" rx="8" fill="#bae6fd"/><text x="80" y="104" text-anchor="middle" class="svg-ink" font-size="13">INET 8.8.8.8</text><text x="80" y="122" text-anchor="middle" class="svg-muted" font-size="12">to 203.0.113.3</text>
<rect x="230" y="60" width="180" height="96" rx="8" fill="#fed7aa"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="14">NK-FTD</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">1 UN-NAT to 10.0.2.10</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">2 rule Web-In (real IP)</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">3 Snort verdict</text>
<rect x="490" y="80" width="140" height="56" rx="8" fill="#fde68a"/><text x="560" y="104" text-anchor="middle" class="svg-ink" font-size="13">WEB 10.0.2.10</text><text x="560" y="122" text-anchor="middle" class="svg-muted" font-size="12">zone DMZ</text>
<line x1="150" y1="108" x2="230" y2="108" stroke="#64748b" stroke-width="2"/><line x1="410" y1="108" x2="490" y2="108" stroke="#64748b" stroke-width="2"/>
<text x="190" y="98" text-anchor="middle" class="svg-muted" font-size="12">OUTSIDE</text><text x="450" y="98" text-anchor="middle" class="svg-muted" font-size="12">DMZ</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="13">The rule matches 10.0.2.10, never 203.0.113.3</text>
</svg><p class="cap">UN-NAT happens before the access control check, so the rule uses the real address.</p></div>

<h3>Lab 2 walkthrough: publish WEB on 203.0.113.3</h3>
<p><b>Task 1, the NAT rule.</b> Policies → NAT → Add Rule:</p>
<pre class="code"><span class="c">! NAT Rule (Auto NAT)</span>
Type                            Static
Source Interface Objects        DMZ
Destination Interface Objects   OUTSIDE
Original Source                 WEB
Translated Source               Address...  203.0.113.3
<span class="c">! leave Port translation empty: all ports are translated one-to-one</span></pre>
<p>Save. The lab NAT table now lists the static rule above the two dynamic PAT rules for INSIDE-NET and DMZ-NET.</p>
<p><b>Task 2, the access rule.</b> Policies → Access Control → Add Rule <b>Web-In</b>: Source Zones OUTSIDE, Destination Zones DMZ, Destination Networks <b>WEB</b>, Destination Ports HTTP and HTTPS, Action Allow. Destination WEB is the real 10.0.2.10. A rule for 203.0.113.3 would never match, exactly like the real-IP rule on the ASA.</p>
<p><b>Task 3, deploy and test.</b> Deploy. On INET open <code>curl 203.0.113.3</code> and the HTTPS address: both answer. <code>ssh -l admin 203.0.113.3</code> times out, because Web-In allows only HTTP and HTTPS and the default action blocks the rest. The proof from the CLI:</p>
<pre class="out">&gt; packet-tracer input outside tcp 8.8.8.8 40000 203.0.113.3 443
Phase: 1
Type: UN-NAT
Subtype: static
Result: ALLOW
Config:
object network WEB
 nat (dmz,outside) static 203.0.113.3
Additional Information:
NAT divert to egress interface dmz
<span class="hl">Untranslate 203.0.113.3/443 to 10.0.2.10/443</span>

Phase: 2
Type: ACCESS-LIST
Result: ALLOW
Config:
<span class="hl">access-list CSM_FW_ACL_ advanced permit tcp ifc outside any ifc dmz host 10.0.2.10 eq h&#116;tps rule-id 268435458</span>
access-list CSM_FW_ACL_ remark rule-id 268435458: L7 RULE: Web-In</pre>
<p><b>Task 4, the counters.</b> <code>show nat</code>:</p>
<pre class="out">&gt; show nat

Auto NAT Policies (Section 2)
1 (dmz) to (outside) source static WEB 203.0.113.3
<span class="hl">    translate_hits = 0, untranslate_hits = 2</span>
2 (inside) to (outside) source dynamic INSIDE-NET interface
    translate_hits = 0, untranslate_hits = 0</pre>
<p><b>untranslate_hits</b> counts connections that arrived for the mapped address and were translated back to the real one: inbound use of the published server. <b>translate_hits</b> counts connections the server itself started. After one HTTP and one HTTPS test you see 2; enter the number your own device shows. <code>show xlate</code> also lists the permanent static entry <code>NAT from dmz:10.0.2.10 to outside:203.0.113.3 flags s</code>.</p>

<div class="eg"><p><b>Worked example.</b> Only one public address, 203.0.113.2, is available and the server must be reached on HTTPS. Use static PAT: Original Source WEB, Translated Source Destination Interface IP, Port translation TCP 443 to 443. The access rule still matches WEB and HTTPS (real address and real port). A second server could get TCP 8443 mapped to its real 443 on the same interface address.</p></div>

<div class="warn"><p><b>Common mistake.</b> Migrating ASA rules that point at the public address, or choosing "OUTSIDE to OUTSIDE" interfaces for the NAT rule. The real side of a published DMZ server is DMZ, the mapped side is OUTSIDE.</p></div>

<div class="exam"><p><b>Exam trap.</b> On Threat Defense, as on the ASA 8.3 and later, access control rules use the real (untranslated) destination. Static NAT works in both directions; dynamic PAT only for connections started from the real side. NAT changes, like all others, need Deploy.</p></div>

<div class="scn"><h4>The migrated rule with zero hits</h4><p>After moving from an ASA to Threat Defense with a migration tool, the partner portal was unreachable. packet-tracer showed UN-NAT working and the ACCESS-LIST phase hitting rule-id 268434432, the default action. The migrated access rule had destination 203.0.113.20, copied from an ancient pre-8.3 configuration. Changing the destination to the portal's real object and deploying fixed it.</p><p><b>Lesson:</b> when UN-NAT works but the default action drops, look at the rule's destination address.</p></div>

<div class="iv"><p class="q">"How do you publish a DMZ web server through Threat Defense?"</p><p>Two policies: a static auto NAT rule (DMZ to OUTSIDE, original source the server object, translated to the public address) and an access control rule from OUTSIDE to DMZ with the server's <b>real</b> address and the needed ports. Deploy, then verify with packet-tracer (UN-NAT and the rule-id), <code>show nat</code> untranslate_hits and a real test from outside.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT is a separate policy: lab Policies → NAT, real Management Center Devices → NAT.</li>
<li>Auto and manual NAT, static and dynamic, sections 1 to 3: the ASA model.</li>
<li>Publishing = static NAT plus an access rule to the real address.</li>
<li>packet-tracer shows UN-NAT before the ACCESS-LIST phase.</li>
<li>untranslate_hits count inbound connections to a published server.</li>
</ul></div>
`,hi:`
<p>Ek company ki website par ek reception phone number chhapa hai. Jab customer us par call karke "web support" maangta hai, receptionist call ko ek internal extension par forward kar deti hai. Customer ko extension kabhi pata nahi chalta; staff use kabhi publish nahi karta. Static NAT wahi receptionist hai: duniya 203.0.113.3 jaanti hai, server sach mein 10.0.2.10 par rehta hai, aur firewall dono ko jodta hai. Achhi khabar: Threat Defense par NAT wahi ASA NAT hai jo aap seekh chuke ho. Sirf woh jagah nayi hai jahan aap ise configure karte ho.</p>

<h3>NAT apni alag policy hai</h3>
<p>Access control policy decide karti hai traffic allowed hai <i>ya nahi</i>; <b>NAT policy</b> decide karti hai addresses <i>kaise translate</i> hon. Yeh device ko assign ki gayi alag policies hain, aur dono LINA mein compile hoti hain. Real Management Center par NAT policy <b>Devices → NAT</b> mein rehti hai (ek <i>Threat Defense NAT</i> policy). Lab GUI mein yeh <b>Policies → NAT</b> mein hai, columns Type, Source Interface, Destination Interface, Original Source, Translated Source aur Port Translation ke saath.</p>

<h3>ASA jaisa hi model</h3>
<dl class="terms">
<dt>Auto NAT</dt><dd>Ek network object se judi ek rule: "yeh object, jab real interface se mapped interface ki taraf jaata hai, X ban jaata hai". Device par yeh <code>object network WEB / nat (dmz,outside) static 203.0.113.3</code> ki tarah dikhti hai. Simple aur sabse common.</dd>
<dt>Manual NAT</dt><dd>Twice NAT: source aur destination saath mein match kar sakta hai, jaise VPN ke liye policy NAT ya sirf ek partner ki taraf translate karna. Auto NAT se pehle rakha jaata hai (ya uske baad wale section mein).</dd>
<dt>Static ya Dynamic</dt><dd>Static one-to-one hai aur dono directions mein kaam karta hai, isliye outside connections shuru kar sakta hai (publishing). Translated source ke roop mein <b>Destination Interface IP</b> wala Dynamic interface PAT hai, users ke liye many-to-one hide NAT.</dd>
<dt>Interface objects</dt><dd>Source Interface Objects = real side (zone ya interface group jahan host rehta hai); Destination Interface Objects = mapped side.</dd>
</dl>
<p>Evaluation order ASA wala order hai: Section 1 manual NAT, Section 2 auto NAT (dynamic se pehle static, phir longest prefix), Section 3 auto ke baad manual NAT.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Static NAT and the real-IP rule">
<rect x="10" y="80" width="140" height="56" rx="8" fill="#bae6fd"/><text x="80" y="104" text-anchor="middle" class="svg-ink" font-size="13">INET 8.8.8.8</text><text x="80" y="122" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.3 ki taraf</text>
<rect x="230" y="60" width="180" height="96" rx="8" fill="#fed7aa"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="14">NK-FTD</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">1 UN-NAT 10.0.2.10 par</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">2 rule Web-In (real IP)</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">3 Snort verdict</text>
<rect x="490" y="80" width="140" height="56" rx="8" fill="#fde68a"/><text x="560" y="104" text-anchor="middle" class="svg-ink" font-size="13">WEB 10.0.2.10</text><text x="560" y="122" text-anchor="middle" class="svg-muted" font-size="12">zone DMZ</text>
<line x1="150" y1="108" x2="230" y2="108" stroke="#64748b" stroke-width="2"/><line x1="410" y1="108" x2="490" y2="108" stroke="#64748b" stroke-width="2"/>
<text x="190" y="98" text-anchor="middle" class="svg-muted" font-size="12">OUTSIDE</text><text x="450" y="98" text-anchor="middle" class="svg-muted" font-size="12">DMZ</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="13">Rule 10.0.2.10 match karti hai, kabhi 203.0.113.3 nahi</text>
</svg><p class="cap">UN-NAT access control check se pehle hota hai, isliye rule real address use karti hai.</p></div>

<h3>Lab 2 walkthrough: WEB ko 203.0.113.3 par publish karo</h3>
<p><b>Task 1, NAT rule.</b> Policies → NAT → Add Rule:</p>
<pre class="code"><span class="c">! NAT Rule (Auto NAT)</span>
Type                            Static
Source Interface Objects        DMZ
Destination Interface Objects   OUTSIDE
Original Source                 WEB
Translated Source               Address...  203.0.113.3
<span class="c">! Port translation khaali chhodo: saare ports one-to-one translate hote hain</span></pre>
<p>Save. Lab NAT table ab static rule ko INSIDE-NET aur DMZ-NET ki do dynamic PAT rules ke upar list karti hai.</p>
<p><b>Task 2, access rule.</b> Policies → Access Control → Add Rule <b>Web-In</b>: Source Zones OUTSIDE, Destination Zones DMZ, Destination Networks <b>WEB</b>, Destination Ports HTTP aur HTTPS, Action Allow. Destination WEB real 10.0.2.10 hai. 203.0.113.3 ke liye rule kabhi match nahi karti, bilkul ASA ke real-IP rule ki tarah.</p>
<p><b>Task 3, deploy aur test.</b> Deploy karo. INET par <code>curl 203.0.113.3</code> aur HTTPS address kholo: dono jawab dete hain. <code>ssh -l admin 203.0.113.3</code> timeout hota hai, kyunki Web-In sirf HTTP aur HTTPS allow karti hai aur baaki default action block karta hai. CLI se saboot:</p>
<pre class="out">&gt; packet-tracer input outside tcp 8.8.8.8 40000 203.0.113.3 443
Phase: 1
Type: UN-NAT
Subtype: static
Result: ALLOW
Config:
object network WEB
 nat (dmz,outside) static 203.0.113.3
Additional Information:
NAT divert to egress interface dmz
<span class="hl">Untranslate 203.0.113.3/443 to 10.0.2.10/443</span>

Phase: 2
Type: ACCESS-LIST
Result: ALLOW
Config:
<span class="hl">access-list CSM_FW_ACL_ advanced permit tcp ifc outside any ifc dmz host 10.0.2.10 eq h&#116;tps rule-id 268435458</span>
access-list CSM_FW_ACL_ remark rule-id 268435458: L7 RULE: Web-In</pre>
<p><b>Task 4, counters.</b> <code>show nat</code>:</p>
<pre class="out">&gt; show nat

Auto NAT Policies (Section 2)
1 (dmz) to (outside) source static WEB 203.0.113.3
<span class="hl">    translate_hits = 0, untranslate_hits = 2</span>
2 (inside) to (outside) source dynamic INSIDE-NET interface
    translate_hits = 0, untranslate_hits = 0</pre>
<p><b>untranslate_hits</b> un connections ko ginta hai jo mapped address ke liye aaye aur real address par wapas translate hue: published server ka inbound use. <b>translate_hits</b> un connections ko ginta hai jo server ne khud shuru kiye. Ek HTTP aur ek HTTPS test ke baad aapko 2 dikhta hai; apne device par jo number dikhe woh daalo. <code>show xlate</code> permanent static entry <code>NAT from dmz:10.0.2.10 to outside:203.0.113.3 flags s</code> bhi list karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Sirf ek public address, 203.0.113.2, available hai aur server HTTPS par reach hona chahiye. Static PAT use karo: Original Source WEB, Translated Source Destination Interface IP, Port translation TCP 443 se 443. Access rule ab bhi WEB aur HTTPS match karti hai (real address aur real port). Ek doosre server ko usi interface address par uske real 443 par mapped TCP 8443 mil sakta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Public address ki taraf point karne wali ASA rules migrate karna, ya NAT rule ke liye "OUTSIDE se OUTSIDE" interfaces chunna. Published DMZ server ki real side DMZ hai, mapped side OUTSIDE.</p></div>

<div class="exam"><p><b>Exam trap.</b> Threat Defense par, ASA 8.3 aur baad ki tarah, access control rules real (untranslated) destination use karti hain. Static NAT dono directions mein kaam karta hai; dynamic PAT sirf real side se shuru hue connections ke liye. NAT changes ko bhi, baaki sabki tarah, Deploy chahiye.</p></div>

<div class="scn"><h4>Zero hits wali migrated rule</h4><p>Migration tool se ASA se Threat Defense par jaane ke baad partner portal unreachable tha. packet-tracer ne dikhaya ki UN-NAT kaam kar raha hai aur ACCESS-LIST phase rule-id 268434432, yaani default action, hit kar raha hai. Migrated access rule ka destination 203.0.113.20 tha, ek bahut purani pre-8.3 configuration se copy kiya hua. Destination ko portal ke real object par badalne aur deploy karne se fix ho gaya.</p><p><b>Seekh:</b> jab UN-NAT kaam kare lekin default action drop kare, to rule ka destination address dekho.</p></div>

<div class="iv"><p class="q">"Threat Defense ke through DMZ web server kaise publish karte ho?"</p><p>Do policies: ek static auto NAT rule (DMZ se OUTSIDE, original source server object, public address par translated) aur OUTSIDE se DMZ ki access control rule jismein server ka <b>real</b> address aur zaroori ports hon. Deploy karo, phir packet-tracer (UN-NAT aur rule-id), <code>show nat</code> untranslate_hits aur outside se real test se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT alag policy hai: lab mein Policies → NAT, real Management Center mein Devices → NAT.</li>
<li>Auto aur manual NAT, static aur dynamic, sections 1 se 3: ASA wala model.</li>
<li>Publishing = static NAT plus real address ki taraf access rule.</li>
<li>packet-tracer ACCESS-LIST phase se pehle UN-NAT dikhata hai.</li>
<li>untranslate_hits published server ki taraf inbound connections ginte hain.</li>
</ul></div>
`}};export{e as default};