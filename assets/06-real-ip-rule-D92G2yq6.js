var e={id:`real-ip`,h:{en:`The real-IP rule: ACLs match untranslated addresses`,hi:`Real-IP rule: ACLs untranslated addresses match karti hain`},body:{en:`
<p>This is the chapter interviewers love and the one that causes the most real outages after migrations. The rule fits in one sentence: <b>since ASA 8.3, access rules reference the real (untranslated) IP address and port of a host, never the mapped (NAT) one.</b></p>

<h3>The analogy: the courier and the building reception</h3>
<p>A courier arrives with a parcel addressed to "Tower A, Reception" (the public address). The receptionist looks up the internal directory, writes "Floor 3, Desk 10" on the parcel (the real address) and only then checks the security list, which is written in desk numbers. If the security list said "Tower A, Reception", no parcel would ever match it, because by the time the list is read the address has already been rewritten.</p>

<h3>Why the rule exists</h3>
<p>Before 8.3, ACLs used the address as seen on the interface where the ACL was applied, so an inbound ACL on outside referenced the public (global) address. Cisco redesigned NAT in 8.3 around network objects and made the ACL independent of NAT: <b>the ASA untranslates the destination first, then checks the ACL.</b> The benefit: you can change a server's public IP (or add a second one) without touching a single ACL line, and one ACE describes a server by what it really is.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Un-NAT happens before the ACL check">
<rect x="10" y="30" width="150" height="70" rx="8" fill="#fed7aa"/><text x="85" y="55" text-anchor="middle" class="svg-ink" font-size="13">From INET</text><text x="85" y="75" text-anchor="middle" class="svg-muted" font-size="12">dst 203.0.113.3:80</text><text x="85" y="92" text-anchor="middle" class="svg-muted" font-size="12">mapped address</text>
<rect x="200" y="30" width="130" height="70" rx="8" fill="#ddd6fe"/><text x="265" y="58" text-anchor="middle" class="svg-ink" font-size="13">1. Un-NAT</text><text x="265" y="80" text-anchor="middle" class="svg-muted" font-size="12">object WEB</text>
<rect x="370" y="30" width="130" height="70" rx="8" fill="#fde68a"/><text x="435" y="55" text-anchor="middle" class="svg-ink" font-size="13">2. ACL check</text><text x="435" y="75" text-anchor="middle" class="svg-muted" font-size="12">dst 10.0.2.10:80</text><text x="435" y="92" text-anchor="middle" class="svg-muted" font-size="12">real address</text>
<rect x="530" y="30" width="100" height="70" rx="8" fill="#bae6fd"/><text x="580" y="60" text-anchor="middle" class="svg-ink" font-size="13">WEB</text><text x="580" y="80" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.10</text>
<line x1="160" y1="65" x2="200" y2="65" stroke="#64748b" stroke-width="2"/><line x1="330" y1="65" x2="370" y2="65" stroke="#64748b" stroke-width="2"/><line x1="500" y1="65" x2="530" y2="65" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="140" width="250" height="70" rx="8" fill="#bbf7d0"/><text x="185" y="165" text-anchor="middle" class="svg-ink" font-size="13">Matches</text><text x="185" y="187" text-anchor="middle" class="svg-muted" font-size="12">permit tcp any object WEB eq www</text>
<rect x="330" y="140" width="250" height="70" rx="8" fill="#e2e8f0"/><text x="455" y="165" text-anchor="middle" class="svg-ink" font-size="13">Never matches</text><text x="455" y="187" text-anchor="middle" class="svg-muted" font-size="12">permit tcp any host 203.0.113.3 eq www</text>
</svg><p class="cap">By the time the ACL is read, the destination is already 10.0.2.10. An ACE written for 203.0.113.3 has zero hits forever.</p></div>

<h3>What "real" means</h3>
<p>The <b>real</b> address is the address a host actually has on the network where it lives, before the ASA translates anything. The <b>mapped</b> address is what the other side sees after NAT. For WEB, real is 10.0.2.10 on dmz, mapped is 203.0.113.3 on outside. For the partner 198.51.100.10 on outside, nothing translates it, so its real address is simply 198.51.100.10. Ports follow the same rule: with port forwarding, the ACL uses the real port on the server.</p>

<h3>Many examples</h3>
<table class="cmp"><tr><th>Situation</th><th>NAT</th><th>Correct ACE (real)</th><th>Wrong ACE</th></tr>
<tr><td>Static NAT web server</td><td>10.0.2.10 to 203.0.113.3</td><td><code>permit tcp any object WEB eq www</code></td><td><code>any host 203.0.113.3 eq www</code></td></tr>
<tr><td>Mail server</td><td>10.0.2.25 to 203.0.113.4</td><td><code>permit tcp any object MAIL eq smtp</code></td><td><code>any host 203.0.113.4 eq smtp</code></td></tr>
<tr><td>Port forward on interface IP</td><td>203.0.113.2:8080 to 10.0.2.10:80</td><td><code>permit tcp any host 10.0.2.10 eq www</code></td><td><code>any interface outside eq 8080</code></td></tr>
<tr><td>Server with two public IPs</td><td>two objects, same host</td><td>one ACE for 10.0.2.10</td><td>two ACEs for the public IPs</td></tr>
<tr><td>Outbound ACL, PAT users</td><td>10.0.1.0/24 to 203.0.113.2</td><td><code>OUTSIDE_OUT … object INSIDE-NET any</code></td><td><code>… host 203.0.113.2 any</code></td></tr>
<tr><td>Partner on outside</td><td>none</td><td><code>host 198.51.100.10</code></td><td>(nothing to translate)</td></tr>
</table>

<pre class="code"><span class="c">! port forwarding: public 203.0.113.2:8080 goes to WEB:80</span>
object network WEB-PF
 host 10.0.2.10
 nat (dmz,outside) static interface service tcp www 8080
<span class="c">! the ACL uses the REAL host and the REAL port 80</span>
access-list OUTSIDE_IN extended permit tcp any object WEB-PF eq www</pre>

<h3>Proving it on the box</h3>
<pre class="out">NK-ASA# show nat
Auto NAT Policies (Section 2)
1 (dmz) to (outside) source static WEB 203.0.113.3
    translate_hits = 0, <span class="hl">untranslate_hits = 12</span>
NK-ASA# packet-tracer input outside tcp 8.8.8.8 40000 203.0.113.3 80
Phase: 1
Type: UN-NAT
Subtype: static
Result: ALLOW
Config:
object network WEB
 nat (dmz,outside) static 203.0.113.3
Additional Information:
NAT divert to egress interface dmz
<span class="hl">Untranslate 203.0.113.3/80 to 10.0.2.10/80</span>

Phase: 2
Type: ACCESS-LIST
Subtype: log
Result: ALLOW
Config:
access-group OUTSIDE_IN in interface outside
access-list OUTSIDE_IN extended permit tcp any object WEB eq www</pre>
<p>Read it top-down: phase 1 rewrites the destination to the real address; phase 2 checks the ACL against 10.0.2.10. <code>untranslate_hits</code> rising while the ACE's <code>hitcnt</code> stays at 0 is the classic signature of an ACL written for the mapped address.</p>

<div class="eg"><p><b>Worked example.</b> The company moves WEB's public address from 203.0.113.3 to 203.0.113.5. With the real-IP rule you change only one NAT line: <code>object network WEB</code>, <code>nat (dmz,outside) static 203.0.113.5</code>. OUTSIDE_IN still says <code>object WEB</code> (10.0.2.10) and keeps working without edits.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Copying pre-8.3 ACLs that reference public IPs; writing the external port (8080) in the ACL for a port-forward instead of the real port (80); and "fixing" a zero-hit rule by opening <code>any any</code> instead of correcting the address.</p></div>

<div class="exam"><p><b>Exam trap.</b> "On ASA 9.x, a server 10.0.2.10 is statically translated to 203.0.113.3. Which address does the outside inbound ACL use?" Always 10.0.2.10. The same logic applies to outbound and global ACLs. Also remember that NAT itself is the next module; here you only need its order relative to the ACL.</p></div>

<div class="scn"><h4>The migration that went dark at midnight</h4><p>A logistics company replaced an old ASA running 8.2 with a new one on 9.x, and an engineer hand-copied the ACLs line by line. After cut-over, the customer portal was unreachable. <code>show access-list</code> showed <code>permit tcp any host 203.0.113.3 eq h&#116;tps (hitcnt=0)</code>, while <code>show nat</code> showed untranslate_hits climbing. packet-tracer confirmed the UN-NAT phase and a drop by the implicit rule. The engineer rewrote the ACE to <code>object WEB</code> and the portal came back in minutes.</p><p><b>Lesson:</b> when migrating from pre-8.3 configs, every ACE that references a mapped address must be rewritten to the real address. Test with packet-tracer before the cut-over.</p></div>

<div class="iv"><p class="q">"Your ACL permits 10.0.2.10, yet customers connect to 203.0.113.3. Why does the ASA check the real address?"</p><p>Strong answer: since 8.3 the ASA untranslates the destination before evaluating access rules, so the packet already carries 10.0.2.10 when the ACL is checked. This decouples ACLs from NAT: a public IP can change without ACL edits. Show you can prove it with <code>packet-tracer</code> (UN-NAT phase before ACCESS-LIST) and <code>show nat</code> untranslate_hits, and mention that port-forward rules use the real port too.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Since 8.3: un-NAT first, then the ACL, so ACLs use real addresses and real ports.</li>
<li>Real = the address the host really has where it lives; mapped = what the other side sees.</li>
<li>Port forwarding: the ACE permits the server's real port, not the public port.</li>
<li>Zero hitcnt plus rising untranslate_hits means the ACE uses the mapped address.</li>
<li>Decoupling ACLs from NAT lets public IPs change without ACL edits.</li>
</ul></div>
`,hi:`
<p>Yeh woh chapter hai jo interviewers ko bahut pasand hai aur jo migrations ke baad sabse zyada real outages karta hai. Rule ek sentence mein aa jaata hai: <b>ASA 8.3 se, access rules kisi host ka real (untranslated) IP address aur port refer karti hain, kabhi mapped (NAT) wala nahi.</b></p>

<h3>Analogy: courier aur building reception</h3>
<p>Ek courier "Tower A, Reception" (public address) ke naam ka parcel lekar aata hai. Receptionist internal directory dekhti hai, parcel par "Floor 3, Desk 10" (real address) likhti hai aur tab jaake security list check karti hai, jo desk numbers mein likhi hai. Agar security list mein "Tower A, Reception" likha hota, to koi parcel kabhi match nahi karta, kyunki list padhne tak address pehle hi dobara likha ja chuka hota hai.</p>

<h3>Yeh rule kyun hai</h3>
<p>8.3 se pehle, ACLs woh address use karti thi jo us interface par dikhta tha jahan ACL lagi hai, isliye outside ki inbound ACL public (global) address refer karti thi. Cisco ne 8.3 mein NAT ko network objects ke aas paas redesign kiya aur ACL ko NAT se independent bana diya: <b>ASA pehle destination untranslate karta hai, phir ACL check karta hai.</b> Fayda: aap server ka public IP badal sakte ho (ya doosra jod sakte ho) bina ek bhi ACL line chhue, aur ek ACE server ko uski asli pehchaan se describe karti hai.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Un-NAT ACL check se pehle hota hai">
<rect x="10" y="30" width="150" height="70" rx="8" fill="#fed7aa"/><text x="85" y="55" text-anchor="middle" class="svg-ink" font-size="13">INET se</text><text x="85" y="75" text-anchor="middle" class="svg-muted" font-size="12">dst 203.0.113.3:80</text><text x="85" y="92" text-anchor="middle" class="svg-muted" font-size="12">mapped address</text>
<rect x="200" y="30" width="130" height="70" rx="8" fill="#ddd6fe"/><text x="265" y="58" text-anchor="middle" class="svg-ink" font-size="13">1. Un-NAT</text><text x="265" y="80" text-anchor="middle" class="svg-muted" font-size="12">object WEB</text>
<rect x="370" y="30" width="130" height="70" rx="8" fill="#fde68a"/><text x="435" y="55" text-anchor="middle" class="svg-ink" font-size="13">2. ACL check</text><text x="435" y="75" text-anchor="middle" class="svg-muted" font-size="12">dst 10.0.2.10:80</text><text x="435" y="92" text-anchor="middle" class="svg-muted" font-size="12">real address</text>
<rect x="530" y="30" width="100" height="70" rx="8" fill="#bae6fd"/><text x="580" y="60" text-anchor="middle" class="svg-ink" font-size="13">WEB</text><text x="580" y="80" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.10</text>
<line x1="160" y1="65" x2="200" y2="65" stroke="#64748b" stroke-width="2"/><line x1="330" y1="65" x2="370" y2="65" stroke="#64748b" stroke-width="2"/><line x1="500" y1="65" x2="530" y2="65" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="140" width="250" height="70" rx="8" fill="#bbf7d0"/><text x="185" y="165" text-anchor="middle" class="svg-ink" font-size="13">Match karti hai</text><text x="185" y="187" text-anchor="middle" class="svg-muted" font-size="12">permit tcp any object WEB eq www</text>
<rect x="330" y="140" width="250" height="70" rx="8" fill="#e2e8f0"/><text x="455" y="165" text-anchor="middle" class="svg-ink" font-size="13">Kabhi match nahi</text><text x="455" y="187" text-anchor="middle" class="svg-muted" font-size="12">permit tcp any host 203.0.113.3 eq www</text>
</svg><p class="cap">ACL padhne tak destination pehle hi 10.0.2.10 ho chuka hota hai. 203.0.113.3 ke liye likhi ACE par hamesha zero hits rahenge.</p></div>

<h3>"Real" ka matlab kya hai</h3>
<p><b>Real</b> address woh address hai jo host ke paas sach mein us network par hai jahan woh rehta hai, ASA ke kuch bhi translate karne se pehle. <b>Mapped</b> address woh hai jo NAT ke baad doosri side dekhti hai. WEB ke liye, real dmz par 10.0.2.10 hai, mapped outside par 203.0.113.3 hai. Outside par partner 198.51.100.10 ko kuch translate nahi karta, isliye uska real address bas 198.51.100.10 hai. Ports bhi same rule follow karte hain: port forwarding mein ACL server ka real port use karti hai.</p>

<h3>Bahut saare examples</h3>
<table class="cmp"><tr><th>Situation</th><th>NAT</th><th>Sahi ACE (real)</th><th>Galat ACE</th></tr>
<tr><td>Static NAT web server</td><td>10.0.2.10 se 203.0.113.3</td><td><code>permit tcp any object WEB eq www</code></td><td><code>any host 203.0.113.3 eq www</code></td></tr>
<tr><td>Mail server</td><td>10.0.2.25 se 203.0.113.4</td><td><code>permit tcp any object MAIL eq smtp</code></td><td><code>any host 203.0.113.4 eq smtp</code></td></tr>
<tr><td>Interface IP par port forward</td><td>203.0.113.2:8080 se 10.0.2.10:80</td><td><code>permit tcp any host 10.0.2.10 eq www</code></td><td><code>any interface outside eq 8080</code></td></tr>
<tr><td>Do public IPs wala server</td><td>do objects, same host</td><td>10.0.2.10 ke liye ek ACE</td><td>public IPs ke liye do ACEs</td></tr>
<tr><td>Outbound ACL, PAT users</td><td>10.0.1.0/24 se 203.0.113.2</td><td><code>OUTSIDE_OUT … object INSIDE-NET any</code></td><td><code>… host 203.0.113.2 any</code></td></tr>
<tr><td>Outside par partner</td><td>koi nahi</td><td><code>host 198.51.100.10</code></td><td>(translate karne ko kuch nahi)</td></tr>
</table>

<pre class="code"><span class="c">! port forwarding: public 203.0.113.2:8080 WEB:80 par jaata hai</span>
object network WEB-PF
 host 10.0.2.10
 nat (dmz,outside) static interface service tcp www 8080
<span class="c">! ACL REAL host aur REAL port 80 use karti hai</span>
access-list OUTSIDE_IN extended permit tcp any object WEB-PF eq www</pre>

<h3>Box par saabit karna</h3>
<pre class="out">NK-ASA# show nat
Auto NAT Policies (Section 2)
1 (dmz) to (outside) source static WEB 203.0.113.3
    translate_hits = 0, <span class="hl">untranslate_hits = 12</span>
NK-ASA# packet-tracer input outside tcp 8.8.8.8 40000 203.0.113.3 80
Phase: 1
Type: UN-NAT
Subtype: static
Result: ALLOW
Config:
object network WEB
 nat (dmz,outside) static 203.0.113.3
Additional Information:
NAT divert to egress interface dmz
<span class="hl">Untranslate 203.0.113.3/80 to 10.0.2.10/80</span>

Phase: 2
Type: ACCESS-LIST
Subtype: log
Result: ALLOW
Config:
access-group OUTSIDE_IN in interface outside
access-list OUTSIDE_IN extended permit tcp any object WEB eq www</pre>
<p>Upar se neeche padho: phase 1 destination ko real address mein badalta hai; phase 2 ACL ko 10.0.2.10 ke against check karta hai. <code>untranslate_hits</code> badhte rehna jabki ACE ka <code>hitcnt</code> 0 par ruka rahe, mapped address ke liye likhi ACL ka classic signature hai.</p>

<div class="eg"><p><b>Worked example.</b> Company WEB ka public address 203.0.113.3 se 203.0.113.5 karti hai. Real-IP rule ke saath aap sirf ek NAT line badalte ho: <code>object network WEB</code>, <code>nat (dmz,outside) static 203.0.113.5</code>. OUTSIDE_IN abhi bhi <code>object WEB</code> (10.0.2.10) kehti hai aur bina edit ke kaam karti rehti hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Public IPs refer karne wali pre-8.3 ACLs copy karna; port-forward ke liye ACL mein real port (80) ki jagah external port (8080) likhna; aur zero-hit rule ko address theek karne ke bajaye <code>any any</code> kholkar "fix" karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> "ASA 9.x par server 10.0.2.10 statically 203.0.113.3 mein translate hota hai. Outside inbound ACL kaunsa address use karti hai?" Hamesha 10.0.2.10. Yahi logic outbound aur global ACLs par bhi lagta hai. Yeh bhi yaad rakho ki NAT khud agla module hai; yahan aapko sirf ACL ke relative uska order chahiye.</p></div>

<div class="scn"><h4>Woh migration jo aadhi raat ko andhera kar gayi</h4><p>Ek logistics company ne 8.2 chalane wale purane ASA ko 9.x wale naye ASA se replace kiya, aur ek engineer ne ACLs line by line haath se copy ki. Cut-over ke baad customer portal unreachable tha. <code>show access-list</code> mein <code>permit tcp any host 203.0.113.3 eq h&#116;tps (hitcnt=0)</code> dikha, jabki <code>show nat</code> mein untranslate_hits badh rahe the. packet-tracer ne UN-NAT phase aur implicit rule se drop confirm kiya. Engineer ne ACE ko <code>object WEB</code> mein dobara likha aur portal minutes mein wapas aa gaya.</p><p><b>Seekh:</b> pre-8.3 configs se migrate karte waqt, mapped address refer karne wali har ACE ko real address mein dobara likhna padta hai. Cut-over se pehle packet-tracer se test karo.</p></div>

<div class="iv"><p class="q">"Aapki ACL 10.0.2.10 permit karti hai, jabki customers 203.0.113.3 se connect karte hain. ASA real address kyun check karta hai?"</p><p>Strong answer: 8.3 se ASA access rules evaluate karne se pehle destination untranslate karta hai, isliye ACL check hone tak packet mein pehle se 10.0.2.10 hota hai. Yeh ACLs ko NAT se decouple karta hai: public IP bina ACL edit ke badal sakta hai. Dikhao ki aap ise <code>packet-tracer</code> (ACCESS-LIST se pehle UN-NAT phase) aur <code>show nat</code> ke untranslate_hits se prove kar sakte ho, aur mention karo ki port-forward rules bhi real port use karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>8.3 se: pehle un-NAT, phir ACL, isliye ACLs real addresses aur real ports use karti hain.</li>
<li>Real = host ka asli address jahan woh rehta hai; mapped = jo doosri side dekhti hai.</li>
<li>Port forwarding: ACE server ka real port permit karti hai, public port nahi.</li>
<li>Zero hitcnt plus badhte untranslate_hits ka matlab ACE mapped address use kar rahi hai.</li>
<li>ACLs ko NAT se decouple karne se public IPs bina ACL edit ke badal sakte hain.</li>
</ul></div>
`}};export{e as default};