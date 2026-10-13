var e={id:`summary`,h:{en:`Summary, migration pitfalls and exam checklist`,hi:`Summary, migration pitfalls aur exam checklist`},body:{en:`
<p>You started this module with a hotel front desk: one main number shared by every room, a restaurant with its own listed number, a spa reached through an extension, and a guard who only ever checks real room numbers. Every chapter since then has filled in one part of that picture. Use this chapter as your last revision before the labs, an interview or the NAT items of the CCNP Security exams, and keep the migration checklist for the day you inherit an old configuration.</p>

<h3>The whole module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="NAT sections and packet order">
<text x="160" y="20" text-anchor="middle" class="svg-accent" font-size="13">Which rule wins (first match)</text>
<rect x="20" y="32" width="280" height="50" rx="8" fill="#fed7aa"/><text x="160" y="53" text-anchor="middle" class="svg-ink" font-size="13">1 Manual NAT (your order)</text><text x="160" y="71" text-anchor="middle" class="svg-muted" font-size="12">VPN identity NAT, policy NAT</text>
<rect x="20" y="92" width="280" height="50" rx="8" fill="#bae6fd"/><text x="160" y="113" text-anchor="middle" class="svg-ink" font-size="13">2 Auto NAT (sorted)</text><text x="160" y="131" text-anchor="middle" class="svg-muted" font-size="12">static first, then dynamic</text>
<rect x="20" y="152" width="280" height="50" rx="8" fill="#bbf7d0"/><text x="160" y="173" text-anchor="middle" class="svg-ink" font-size="13">3 Manual after-auto</text><text x="160" y="191" text-anchor="middle" class="svg-muted" font-size="12">catch-all PAT</text>
<text x="480" y="20" text-anchor="middle" class="svg-accent" font-size="13">New inbound flow</text>
<rect x="360" y="32" width="240" height="36" rx="8" fill="#ddd6fe"/><text x="480" y="55" text-anchor="middle" class="svg-ink" font-size="13">UN-NAT: mapped to real</text>
<rect x="360" y="92" width="240" height="36" rx="8" fill="#fde68a"/><text x="480" y="115" text-anchor="middle" class="svg-ink" font-size="13">ACL: real IP, real port</text>
<rect x="360" y="152" width="240" height="36" rx="8" fill="#e2e8f0"/><text x="480" y="175" text-anchor="middle" class="svg-ink" font-size="13">NAT, inspect, xlate, conn</text>
<line x1="480" y1="68" x2="480" y2="92" stroke="#64748b" stroke-width="2"/><line x1="480" y1="128" x2="480" y2="152" stroke="#64748b" stroke-width="2"/>
<text x="320" y="232" text-anchor="middle" class="svg-muted" font-size="12">Translate with the right rule, permit the real host, prove it with packet-tracer</text>
</svg><p class="cap">Left: the order in which NAT rules are matched. Right: the order in which a new inbound packet is processed.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain real and mapped addresses and read <code>nat (real_ifc,mapped_ifc)</code> correctly every time.</li>
<li>Choose between auto NAT (inside the object) and manual (twice) NAT (global, can match the destination).</li>
<li>Name the three NAT sections and predict the winning rule, including the section 2 sort: static before dynamic, then fewest addresses.</li>
<li>Configure dynamic PAT on the interface, dynamic PAT to a single address, dynamic NAT with a pool and <code>interface</code> fallback, and a PAT pool with <code>round-robin</code>.</li>
<li>Publish WEB 10.0.2.10 as 203.0.113.3 with static NAT and an ACL for HTTP and HTTPS only (lab 1).</li>
<li>Publish JUMP 10.0.2.20 SSH as 203.0.113.2 port 2222 for the partner only with static PAT (lab 2).</li>
<li>Write identity twice NAT for VPN traffic with <code>no-proxy-arp route-lookup</code> at the top of section 1.</li>
<li>Translate a destination with twice NAT, and solve overlapping networks by translating both sides.</li>
<li>Apply the real-IP rule to every ACL and fix migrated ACLs that still use public addresses (ticket lab).</li>
<li>Verify with <code>show nat detail</code>, <code>show xlate</code>, <code>show conn</code> and <code>packet-tracer</code>, and clear stale translations after a change.</li>
</ul>

<h3>Migration pitfalls: from pre-8.3 syntax to the 8.3+ model</h3>
<p>Old PIX and ASA 8.2 configurations still arrive in backups, design documents and exam questions. The table maps each old idea to its modern form and names the trap.</p>
<table class="cmp"><tr><th>Pre-8.3</th><th>8.3 and later</th><th>Trap</th></tr>
<tr><td><code>nat (inside) 1 10.0.1.0 255.255.255.0</code> + <code>global (outside) 1 interface</code></td><td>object with <code>nat (inside,outside) dynamic interface</code></td><td>The NAT ID pairing is gone; the object holds both sides</td></tr>
<tr><td><code>static (dmz,outside) 203.0.113.3 10.0.2.10 netmask 255.255.255.255</code></td><td>object WEB with <code>nat (dmz,outside) static 203.0.113.3</code></td><td>The old command listed the mapped address first</td></tr>
<tr><td><code>static (dmz,outside) tcp interface 2222 10.0.2.20 22 ...</code></td><td><code>nat (dmz,outside) static interface service tcp ssh 2222</code></td><td>The new service keyword lists the real port first</td></tr>
<tr><td><code>nat (inside) 0 access-list NONAT</code></td><td>identity twice NAT in section 1</td><td>Must sit above any PAT that also matches the inside network</td></tr>
<tr><td>ACL permits the mapped address</td><td>ACL permits the real address and port</td><td>Accepted without error, never matches</td></tr>
<tr><td><code>nat-control</code></td><td>removed</td><td>Traffic with no matching rule now passes untranslated</td></tr></table>
<p>An in-place software upgrade converts NAT and ACLs automatically, creating objects with generated names such as <code>obj-10.0.2.10</code>. A <b>manual</b> copy of an old configuration onto a new box does not. That is how the INC-7740 ticket happens, and it is why every migration plan needs a step that rewrites ACL addresses to real addresses and a packet-tracer test for every published service.</p>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Real address</dt><dd>The address a host really has on its own interface; what ACLs use since 8.3.</dd>
<dt>Mapped address</dt><dd>The address the other side sees after translation.</dd>
<dt>Auto NAT (object NAT)</dt><dd>A NAT rule inside a network object; translates the source only; section 2.</dd>
<dt>Manual NAT (twice NAT)</dt><dd>A global rule that can match and translate source, destination and service; sections 1 and 3.</dd>
<dt>Dynamic PAT</dt><dd>Many real hosts share one mapped address, told apart by port; outbound-initiated only.</dd>
<dt>Static PAT</dt><dd>One real address and port published on a mapped address and port; port forwarding.</dd>
<dt>Identity NAT</dt><dd>A rule that maps addresses to themselves so no broader rule translates them, used for VPN exemption.</dd>
<dt>xlate</dt><dd>An entry in the translation table; the flags show static (s), dynamic (i), portmap (r), identity (I) and twice (T).</dd>
<dt>UN-NAT</dt><dd>The packet-tracer phase that untranslates a mapped destination back to the real one, before the ACL.</dd>
<dt>Proxy ARP</dt><dd>The ASA answering ARP for mapped addresses on the mapped interface; turned off per rule with <code>no-proxy-arp</code>.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Order of NAT sections</td><td>Manual, auto, manual after-auto; first match wins</td></tr>
<tr><td>Section 2 sort</td><td>Static before dynamic, then fewest real addresses, lower IP, name</td></tr>
<tr><td>Address in the ACL for a static-NAT server</td><td>Real IP (8.3 and later)</td></tr>
<tr><td>Port in the ACL for a port forward 2222 to 22</td><td>22, the real port</td></tr>
<tr><td>Counter for inbound hits to a static rule</td><td><code>untranslate_hits</code></td></tr>
<tr><td>Twice NAT destination order</td><td>Mapped then real</td></tr>
<tr><td>Single mapped address in a dynamic rule</td><td>PAT; a range or subnet means dynamic NAT</td></tr>
<tr><td>Fallback when the dynamic pool is empty</td><td><code>interface</code> keyword after the pool</td></tr>
<tr><td>VPN exemption keywords</td><td><code>no-proxy-arp route-lookup</code></td></tr>
<tr><td>Static NAT direction</td><td>Both: inbound publish and outbound source</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! users out (dynamic PAT)</span>
object network INSIDE-NET
 subnet 10.0.1.0 255.255.255.0
 nat (inside,outside) dynamic interface
<span class="c">! publish a server (static NAT, lab 1)</span>
object network WEB
 host 10.0.2.10
 nat (dmz,outside) static 203.0.113.3
<span class="c">! port forward on the interface address (lab 2)</span>
object network JUMP
 host 10.0.2.20
 nat (dmz,outside) static interface service tcp ssh 2222
<span class="c">! ACL with real addresses and real ports</span>
access-list OUTSIDE_IN extended permit tcp any object WEB eq www
access-list OUTSIDE_IN extended permit tcp any object WEB eq h&#116;tps
access-list OUTSIDE_IN extended permit tcp host 198.51.100.10 object JUMP eq ssh
access-group OUTSIDE_IN in interface outside
<span class="c">! VPN exemption at the top of section 1</span>
nat (inside,outside) 1 source static INSIDE-NET INSIDE-NET destination static BRANCH-NET BRANCH-NET no-proxy-arp route-lookup
<span class="c">! verify and clean up</span>
show nat detail
show xlate
show conn address 10.0.2.10
packet-tracer input outside tcp 8.8.8.8 40000 203.0.113.3 80
clear nat counters
clear xlate local 10.0.2.10</pre>

<pre class="out">NK-ASA# show nat
Auto NAT Policies (Section 2)
1 (dmz) to (outside) source static WEB 203.0.113.3
    <span class="hl">translate_hits = 3, untranslate_hits = 57</span>
2 (dmz) to (outside) source static JUMP interface  service tcp ssh 2222
    translate_hits = 0, untranslate_hits = 6
3 (dmz) to (outside) source dynamic DMZ-NET interface
    translate_hits = 212, untranslate_hits = 0
4 (inside) to (outside) source dynamic INSIDE-NET interface
    translate_hits = 4810, untranslate_hits = 0</pre>

<div class="eg"><p><b>Worked example: read the table above.</b> WEB has 57 untranslate hits, so customers reach it; its 3 translate hits show the server itself going out as 203.0.113.3. JUMP has 6 inbound hits from the partner. The two statics sit above the DMZ PAT because section 2 puts static rules first, which is why WEB never leaves as 203.0.113.2.</p></div>

<div class="warn"><p><b>Six mistakes to never make again.</b> Swapping the interfaces in <code>nat (real,mapped)</code>; permitting the public IP or the mapped port in the ACL; a broad section 1 rule that overrides your statics; VPN exemption without <code>no-proxy-arp</code> or placed below the PAT; a mapped address already used by another device; and forgetting <code>clear xlate</code> after changing a rule.</p></div>

<div class="exam"><p><b>Last exam trap.</b> When a question shows packet-tracer with UN-NAT ALLOW and ACCESS-LIST DROP on the Implicit Rule, the answer is almost never a NAT change. Look for an ACL that uses the mapped address or port, and remember that on 8.3 and later only the real values ever match.</p></div>

<div class="scn"><h4>The weekend migration that went live on Monday</h4><p>A retailer replaced an ageing ASA 8.2 pair with new hardware and pasted the old configuration after hand-converting the NAT. The engineer followed a checklist: map each <code>static</code> to an object, rebuild <code>nat 0</code> as identity twice NAT at the top of section 1, rewrite every ACL public address to its object, and run packet-tracer for each of the 14 published services before cutover. Two traces failed on the ACCESS-LIST phase because a port forward still permitted the mapped port. Both were fixed on Saturday; on Monday nobody noticed the change.</p><p><b>Lesson:</b> a migration is finished when every flow has been proven, not when the configuration has been pasted.</p></div>

<div class="iv"><p class="q">"You inherit a pre-8.3 ASA configuration. How do you move it to a modern ASA safely?"</p><p>Strong answer: inventory every <code>static</code>, <code>nat</code>/<code>global</code> pair and <code>nat 0</code>; rebuild them as objects with auto NAT and identity twice NAT in section 1; rewrite ACLs from mapped to real addresses and ports; keep order in mind (section 1 exemptions, section 3 catch-alls); then prove each published service and VPN with packet-tracer and check <code>show nat</code> counters after cutover. Mention that the automatic conversion only happens on an in-place upgrade.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three sections, first match wins: manual, auto (static first), manual after-auto.</li>
<li>Dynamic PAT for users, static NAT for whole servers, static PAT to share one address by port.</li>
<li>Identity twice NAT with <code>no-proxy-arp route-lookup</code> at the top of section 1 exempts VPN traffic.</li>
<li>ACLs always use real addresses and real ports; migrated public-IP rules never match.</li>
<li>Prove everything with <code>show nat detail</code>, <code>show xlate</code> and packet-tracer; next up, sec-asa-tshoot takes captures and syslog deeper.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module ek hotel front desk se shuru kiya tha: ek main number jo har room share karta hai, ek restaurant jiska apna listed number hai, ek spa jo extension se milta hai, aur ek guard jo hamesha sirf real room numbers check karta hai. Uske baad har chapter ne us picture ka ek hissa bhara hai. Is chapter ko labs, interview ya CCNP Security exams ke NAT items se pehle aakhri revision ki tarah use karo, aur migration checklist us din ke liye sambhal ke rakho jab aapko koi purani configuration milegi.</p>

<h3>Poora module ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="NAT sections aur packet order">
<text x="160" y="20" text-anchor="middle" class="svg-accent" font-size="13">Kaunsi rule jeetti hai (first match)</text>
<rect x="20" y="32" width="280" height="50" rx="8" fill="#fed7aa"/><text x="160" y="53" text-anchor="middle" class="svg-ink" font-size="13">1 Manual NAT (aapka order)</text><text x="160" y="71" text-anchor="middle" class="svg-muted" font-size="12">VPN identity NAT, policy NAT</text>
<rect x="20" y="92" width="280" height="50" rx="8" fill="#bae6fd"/><text x="160" y="113" text-anchor="middle" class="svg-ink" font-size="13">2 Auto NAT (sorted)</text><text x="160" y="131" text-anchor="middle" class="svg-muted" font-size="12">pehle static, phir dynamic</text>
<rect x="20" y="152" width="280" height="50" rx="8" fill="#bbf7d0"/><text x="160" y="173" text-anchor="middle" class="svg-ink" font-size="13">3 Manual after-auto</text><text x="160" y="191" text-anchor="middle" class="svg-muted" font-size="12">catch-all PAT</text>
<text x="480" y="20" text-anchor="middle" class="svg-accent" font-size="13">Naya inbound flow</text>
<rect x="360" y="32" width="240" height="36" rx="8" fill="#ddd6fe"/><text x="480" y="55" text-anchor="middle" class="svg-ink" font-size="13">UN-NAT: mapped se real</text>
<rect x="360" y="92" width="240" height="36" rx="8" fill="#fde68a"/><text x="480" y="115" text-anchor="middle" class="svg-ink" font-size="13">ACL: real IP, real port</text>
<rect x="360" y="152" width="240" height="36" rx="8" fill="#e2e8f0"/><text x="480" y="175" text-anchor="middle" class="svg-ink" font-size="13">NAT, inspect, xlate, conn</text>
<line x1="480" y1="68" x2="480" y2="92" stroke="#64748b" stroke-width="2"/><line x1="480" y1="128" x2="480" y2="152" stroke="#64748b" stroke-width="2"/>
<text x="320" y="232" text-anchor="middle" class="svg-muted" font-size="12">Sahi rule se translate karo, real host permit karo, packet-tracer se prove karo</text>
</svg><p class="cap">Left: NAT rules kis order mein match hoti hain. Right: naya inbound packet kis order mein process hota hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Real aur mapped addresses explain karo aur <code>nat (real_ifc,mapped_ifc)</code> har baar sahi padho.</li>
<li>Auto NAT (object ke andar) aur manual (twice) NAT (global, destination bhi match kar sakta hai) mein se sahi chuno.</li>
<li>Teen NAT sections ke naam batao aur jeetne wali rule predict karo, section 2 ke sort ke saath: dynamic se pehle static, phir sabse kam addresses.</li>
<li>Interface par dynamic PAT, ek single address par dynamic PAT, pool aur <code>interface</code> fallback ke saath dynamic NAT, aur <code>round-robin</code> ke saath PAT pool configure karo.</li>
<li>WEB 10.0.2.10 ko static NAT se 203.0.113.3 par publish karo, ACL ke saath jo sirf HTTP aur HTTPS allow kare (lab 1).</li>
<li>JUMP 10.0.2.20 ka SSH static PAT se 203.0.113.2 port 2222 par sirf partner ke liye publish karo (lab 2).</li>
<li>VPN traffic ke liye identity twice NAT <code>no-proxy-arp route-lookup</code> ke saath section 1 ke top par likho.</li>
<li>Twice NAT se destination translate karo, aur dono sides translate karke overlapping networks solve karo.</li>
<li>Har ACL par real-IP rule lagao aur migrate hui ACLs theek karo jo ab bhi public addresses use karti hain (ticket lab).</li>
<li><code>show nat detail</code>, <code>show xlate</code>, <code>show conn</code> aur <code>packet-tracer</code> se verify karo, aur change ke baad stale translations clear karo.</li>
</ul>

<h3>Migration pitfalls: pre-8.3 syntax se 8.3+ model tak</h3>
<p>Purane PIX aur ASA 8.2 configurations ab bhi backups, design documents aur exam questions mein aate hain. Yeh table har purane idea ko uske modern form se map karti hai aur trap ka naam batati hai.</p>
<table class="cmp"><tr><th>Pre-8.3</th><th>8.3 aur baad</th><th>Trap</th></tr>
<tr><td><code>nat (inside) 1 10.0.1.0 255.255.255.0</code> + <code>global (outside) 1 interface</code></td><td>object ke saath <code>nat (inside,outside) dynamic interface</code></td><td>NAT ID pairing khatam; object dono sides rakhta hai</td></tr>
<tr><td><code>static (dmz,outside) 203.0.113.3 10.0.2.10 netmask 255.255.255.255</code></td><td>object WEB ke saath <code>nat (dmz,outside) static 203.0.113.3</code></td><td>Purana command mapped address pehle likhta tha</td></tr>
<tr><td><code>static (dmz,outside) tcp interface 2222 10.0.2.20 22 ...</code></td><td><code>nat (dmz,outside) static interface service tcp ssh 2222</code></td><td>Naya service keyword real port pehle likhta hai</td></tr>
<tr><td><code>nat (inside) 0 access-list NONAT</code></td><td>section 1 mein identity twice NAT</td><td>Inside network ko match karne wale kisi bhi PAT se upar honi chahiye</td></tr>
<tr><td>ACL mapped address permit karti hai</td><td>ACL real address aur port permit karti hai</td><td>Bina error accept hoti hai, kabhi match nahi karti</td></tr>
<tr><td><code>nat-control</code></td><td>hata diya gaya</td><td>Jis traffic ki koi rule match nahi karti, woh ab bina translate hue nikal jaata hai</td></tr></table>
<p>In-place software upgrade NAT aur ACLs ko apne aap convert karta hai, aur <code>obj-10.0.2.10</code> jaise generated naam wale objects banata hai. Purani configuration ko naye box par <b>manually</b> copy karne se yeh nahi hota. INC-7740 ticket isi tarah hota hai, aur isiliye har migration plan mein ek step chahiye jo ACL addresses ko real addresses mein rewrite kare, aur har published service ke liye ek packet-tracer test.</p>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Real address</dt><dd>Woh address jo host ka apne interface par sach mein hai; 8.3 se ACLs yahi use karti hain.</dd>
<dt>Mapped address</dt><dd>Translation ke baad doosri side jo address dekhti hai.</dd>
<dt>Auto NAT (object NAT)</dt><dd>Network object ke andar NAT rule; sirf source translate karti hai; section 2.</dd>
<dt>Manual NAT (twice NAT)</dt><dd>Global rule jo source, destination aur service match aur translate kar sakti hai; sections 1 aur 3.</dd>
<dt>Dynamic PAT</dt><dd>Bahut saare real hosts ek mapped address share karte hain, port se alag pehchane jaate hain; sirf outbound-initiated.</dd>
<dt>Static PAT</dt><dd>Ek real address aur port ek mapped address aur port par publish; port forwarding.</dd>
<dt>Identity NAT</dt><dd>Rule jo addresses ko khud par map karti hai taaki koi broader rule unhe translate na kare; VPN exemption ke liye.</dd>
<dt>xlate</dt><dd>Translation table ki ek entry; flags static (s), dynamic (i), portmap (r), identity (I) aur twice (T) dikhate hain.</dd>
<dt>UN-NAT</dt><dd>packet-tracer ka phase jo mapped destination ko ACL se pehle wapas real mein untranslate karta hai.</dd>
<dt>Proxy ARP</dt><dd>ASA mapped interface par mapped addresses ke liye ARP ka jawab deta hai; har rule par <code>no-proxy-arp</code> se band hota hai.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>NAT sections ka order</td><td>Manual, auto, manual after-auto; first match jeetta hai</td></tr>
<tr><td>Section 2 sort</td><td>Dynamic se pehle static, phir sabse kam real addresses, lower IP, naam</td></tr>
<tr><td>Static-NAT server ke liye ACL mein address</td><td>Real IP (8.3 aur baad)</td></tr>
<tr><td>Port forward 2222 se 22 ke liye ACL mein port</td><td>22, real port</td></tr>
<tr><td>Static rule par inbound hits ka counter</td><td><code>untranslate_hits</code></td></tr>
<tr><td>Twice NAT destination order</td><td>Pehle mapped, phir real</td></tr>
<tr><td>Dynamic rule mein single mapped address</td><td>PAT; range ya subnet ka matlab dynamic NAT</td></tr>
<tr><td>Dynamic pool khali hone par fallback</td><td>Pool ke baad <code>interface</code> keyword</td></tr>
<tr><td>VPN exemption keywords</td><td><code>no-proxy-arp route-lookup</code></td></tr>
<tr><td>Static NAT direction</td><td>Dono: inbound publish aur outbound source</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! users bahar (dynamic PAT)</span>
object network INSIDE-NET
 subnet 10.0.1.0 255.255.255.0
 nat (inside,outside) dynamic interface
<span class="c">! server publish (static NAT, lab 1)</span>
object network WEB
 host 10.0.2.10
 nat (dmz,outside) static 203.0.113.3
<span class="c">! interface address par port forward (lab 2)</span>
object network JUMP
 host 10.0.2.20
 nat (dmz,outside) static interface service tcp ssh 2222
<span class="c">! real addresses aur real ports wali ACL</span>
access-list OUTSIDE_IN extended permit tcp any object WEB eq www
access-list OUTSIDE_IN extended permit tcp any object WEB eq h&#116;tps
access-list OUTSIDE_IN extended permit tcp host 198.51.100.10 object JUMP eq ssh
access-group OUTSIDE_IN in interface outside
<span class="c">! section 1 ke top par VPN exemption</span>
nat (inside,outside) 1 source static INSIDE-NET INSIDE-NET destination static BRANCH-NET BRANCH-NET no-proxy-arp route-lookup
<span class="c">! verify aur clean up</span>
show nat detail
show xlate
show conn address 10.0.2.10
packet-tracer input outside tcp 8.8.8.8 40000 203.0.113.3 80
clear nat counters
clear xlate local 10.0.2.10</pre>

<pre class="out">NK-ASA# show nat
Auto NAT Policies (Section 2)
1 (dmz) to (outside) source static WEB 203.0.113.3
    <span class="hl">translate_hits = 3, untranslate_hits = 57</span>
2 (dmz) to (outside) source static JUMP interface  service tcp ssh 2222
    translate_hits = 0, untranslate_hits = 6
3 (dmz) to (outside) source dynamic DMZ-NET interface
    translate_hits = 212, untranslate_hits = 0
4 (inside) to (outside) source dynamic INSIDE-NET interface
    translate_hits = 4810, untranslate_hits = 0</pre>

<div class="eg"><p><b>Worked example: upar ki table padho.</b> WEB ke 57 untranslate hits hain, yaani customers us tak pahunch rahe hain; uske 3 translate hits dikhate hain ki server khud 203.0.113.3 ban kar bahar ja raha hai. JUMP ke partner se 6 inbound hits hain. Dono statics DMZ PAT se upar hain kyunki section 2 static rules ko pehle rakhta hai, isiliye WEB kabhi 203.0.113.2 ban kar bahar nahi jaata.</p></div>

<div class="warn"><p><b>Chhe galtiyan jo dobara kabhi mat karna.</b> <code>nat (real,mapped)</code> mein interfaces ulte likhna; ACL mein public IP ya mapped port permit karna; section 1 ki broad rule jo aapke statics ko override kar de; VPN exemption bina <code>no-proxy-arp</code> ke ya PAT ke neeche; mapped address jo pehle se kisi aur device ka hai; aur rule badalne ke baad <code>clear xlate</code> bhool jaana.</p></div>

<div class="exam"><p><b>Aakhri exam trap.</b> Jab question mein packet-tracer UN-NAT ALLOW aur phir ACCESS-LIST DROP on the Implicit Rule dikhaye, to answer lagbhag kabhi NAT change nahi hota. Aisi ACL dhoondo jo mapped address ya port use karti hai, aur yaad rakho ki 8.3 aur baad mein sirf real values hi match hoti hain.</p></div>

<div class="scn"><h4>Weekend migration jo Monday ko chupchaap live ho gayi</h4><p>Ek retailer ne purane ASA 8.2 pair ko naye hardware se replace kiya aur NAT ko haath se convert karke purani configuration paste ki. Engineer ne ek checklist follow ki: har <code>static</code> ko object mein map karo, <code>nat 0</code> ko section 1 ke top par identity twice NAT ki tarah dobara banao, har ACL public address ko uske object se rewrite karo, aur cutover se pehle 14 published services mein se har ek ke liye packet-tracer chalao. Do traces ACCESS-LIST phase par fail hue kyunki ek port forward ab bhi mapped port permit kar raha tha. Dono Saturday ko theek ho gaye; Monday ko kisi ko change ka pata bhi nahi chala.</p><p><b>Lesson:</b> migration tab khatam hoti hai jab har flow prove ho jaaye, tab nahi jab configuration paste ho jaaye.</p></div>

<div class="iv"><p class="q">"Aapko ek pre-8.3 ASA configuration mili hai. Aap use modern ASA par safely kaise le jaoge?"</p><p>Strong answer: har <code>static</code>, <code>nat</code>/<code>global</code> pair aur <code>nat 0</code> ki inventory banao; unhe auto NAT wale objects aur section 1 mein identity twice NAT ki tarah dobara banao; ACLs ko mapped se real addresses aur ports mein rewrite karo; order dhyan mein rakho (section 1 mein exemptions, section 3 mein catch-alls); phir har published service aur VPN ko packet-tracer se prove karo aur cutover ke baad <code>show nat</code> counters check karo. Yeh bhi batao ki automatic conversion sirf in-place upgrade par hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen sections, first match jeetta hai: manual, auto (pehle static), manual after-auto.</li>
<li>Users ke liye dynamic PAT, poore servers ke liye static NAT, ek address ko port se share karne ke liye static PAT.</li>
<li>Section 1 ke top par <code>no-proxy-arp route-lookup</code> wala identity twice NAT VPN traffic ko exempt karta hai.</li>
<li>ACLs hamesha real addresses aur real ports use karti hain; migrate hui public-IP rules kabhi match nahi karti.</li>
<li>Sab kuch <code>show nat detail</code>, <code>show xlate</code> aur packet-tracer se prove karo; aage sec-asa-tshoot captures aur syslog ko aur gehraai se sikhata hai.</li>
</ul></div>
`}};export{e as default};