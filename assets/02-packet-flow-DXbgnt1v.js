var e={id:`packet-flow`,h:{en:`Packet flow through LINA and Snort`,hi:`LINA aur Snort ke through packet flow`},body:{en:`
<p>You cannot troubleshoot a machine you cannot picture. Before any command, you need a mental movie of what happens to the partner's first SYN from the moment it hits the outside interface of NK-FTD until it leaves the dmz interface towards WEB. Once you can play that movie, every tool in this module simply shows you one frame of it.</p>

<h3>The journey of the first packet</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="FTD packet flow">
<rect x="10" y="20" width="110" height="44" rx="8" fill="#e2e8f0"/><text x="65" y="47" text-anchor="middle" class="svg-ink" font-size="13">1 Ingress</text>
<rect x="135" y="20" width="110" height="44" rx="8" fill="#bae6fd"/><text x="190" y="47" text-anchor="middle" class="svg-ink" font-size="13">2 Conn lookup</text>
<rect x="260" y="20" width="110" height="44" rx="8" fill="#bae6fd"/><text x="315" y="47" text-anchor="middle" class="svg-ink" font-size="13">3 Prefilter</text>
<rect x="385" y="20" width="110" height="44" rx="8" fill="#bae6fd"/><text x="440" y="47" text-anchor="middle" class="svg-ink" font-size="13">4 UN-NAT</text>
<rect x="510" y="20" width="120" height="44" rx="8" fill="#bae6fd"/><text x="570" y="47" text-anchor="middle" class="svg-ink" font-size="13">5 Route lookup</text>
<rect x="510" y="110" width="120" height="44" rx="8" fill="#bae6fd"/><text x="570" y="137" text-anchor="middle" class="svg-ink" font-size="13">6 ACL (L3/L4)</text>
<rect x="385" y="110" width="110" height="44" rx="8" fill="#bae6fd"/><text x="440" y="137" text-anchor="middle" class="svg-ink" font-size="13">7 NAT, conn</text>
<rect x="260" y="110" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="315" y="137" text-anchor="middle" class="svg-ink" font-size="13">8 Snort</text>
<rect x="135" y="110" width="110" height="44" rx="8" fill="#bae6fd"/><text x="190" y="137" text-anchor="middle" class="svg-ink" font-size="13">9 Verdict</text>
<rect x="10" y="110" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="65" y="137" text-anchor="middle" class="svg-ink" font-size="13">10 Egress</text>
<line x1="120" y1="42" x2="135" y2="42" stroke="#64748b" stroke-width="2"/><line x1="245" y1="42" x2="260" y2="42" stroke="#64748b" stroke-width="2"/><line x1="370" y1="42" x2="385" y2="42" stroke="#64748b" stroke-width="2"/><line x1="495" y1="42" x2="510" y2="42" stroke="#64748b" stroke-width="2"/>
<line x1="570" y1="64" x2="570" y2="110" stroke="#64748b" stroke-width="2"/><line x1="510" y1="132" x2="495" y2="132" stroke="#64748b" stroke-width="2"/><line x1="385" y1="132" x2="370" y2="132" stroke="#64748b" stroke-width="2"/><line x1="260" y1="132" x2="245" y2="132" stroke="#64748b" stroke-width="2"/><line x1="135" y1="132" x2="120" y2="132" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="190" width="620" height="56" rx="8" fill="#fde68a"/><text x="320" y="214" text-anchor="middle" class="svg-ink" font-size="13">Blue = LINA (data plane)   Purple = Snort 3 (inspection)</text><text x="320" y="234" text-anchor="middle" class="svg-muted" font-size="12">Existing connections skip steps 3 to 7; Fastpath and Trust skip Snort</text>
</svg><p class="cap">The first packet of a new flow walks every step. Later packets match the connection entry and take the short path.</p></div>

<ol>
<li><b>Ingress.</b> The frame arrives on outside (GigabitEthernet0/0). A capture taken here proves arrival.</li>
<li><b>Connection lookup.</b> LINA checks its connection table. If the packet belongs to an existing connection, it skips the policy steps and goes straight to inspection or egress. This is why a policy change does not always affect a long-lived flow until it is cleared.</li>
<li><b>Prefilter.</b> The prefilter policy is evaluated in LINA, before the access control policy. A prefilter rule can <b>Fastpath</b> (bypass Snort completely), <b>Block</b>, or <b>Analyze</b> (continue to the normal policy). Tunnels such as GRE and IP-in-IP are handled here too.</li>
<li><b>UN-NAT.</b> If a static NAT rule matches the destination (203.0.113.3), LINA translates it back to the real address (10.0.2.10) and decides the egress interface (dmz). No match means no UN-NAT phase at all, which is the first fault in our lab.</li>
<li><b>Route lookup.</b> For traffic not diverted by NAT, the routing table picks the egress interface.</li>
<li><b>Access control, L3/L4 part.</b> The access control policy is compiled into a LINA access list named <code>CSM_FW_ACL_</code>. Rules that only use zones, networks and ports are decided here. A Block rule with only L3/L4 conditions drops the packet in LINA. Allow rules, and any rule that needs Snort conditions (applications, URLs, users), are a <i>permit</i> in LINA and are finished in Snort.</li>
<li><b>NAT and connection creation.</b> Source NAT is applied, the xlate is built, and a connection entry is created.</li>
<li><b>Snort.</b> LINA passes the packet to Snort through the DAQ (data acquisition) layer. Snort evaluates, roughly in this order: Security Intelligence (IP, URL, DNS), SSL decryption, application identification and the full access control rule match, then intrusion and file inspection for allowed traffic.</li>
<li><b>Verdict.</b> Snort returns a verdict to LINA: pass, drop/block, or <b>fast-forward</b> (trust: send the rest of this flow without Snort).</li>
<li><b>Egress.</b> LINA does the final route and adjacency (ARP) lookup and transmits on dmz.</li>
</ol>

<h3>Allow, Trust, Fastpath: who inspects what</h3>
<table class="cmp"><tr><th>Action</th><th>Where decided</th><th>Snort inspection</th></tr>
<tr><td>Prefilter Fastpath</td><td>LINA, before access control</td><td>None at all</td></tr>
<tr><td>Prefilter Block</td><td>LINA</td><td>None</td></tr>
<tr><td>Access control Block (L3/L4 only)</td><td>LINA access list</td><td>None</td></tr>
<tr><td>Access control Trust</td><td>Snort, first packets</td><td>Then fast-forwarded</td></tr>
<tr><td>Access control Allow</td><td>Snort</td><td>Full: intrusion, file, malware</td></tr>
<tr><td>Default action</td><td>rule-id 268434432</td><td>Depends on action</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> The partner's SYN to 203.0.113.3 on TCP 443 after the lab is fixed: ingress outside, no existing connection, prefilter Analyze, UN-NAT 203.0.113.3 to 10.0.2.10 with egress dmz, access list permits it as rule Portal-In, NAT and connection created, Snort matches Portal-In, intrusion policy finds nothing, verdict pass, ARP for 10.0.2.10 on dmz, transmit. Every one of those steps is a line in packet-tracer output.</p></div>

<h3>What happens if Snort is down or busy</h3>
<p>Snort restarts briefly during some deployments, and it can be overloaded. Two advanced settings decide what LINA does then: <b>Snort Fail Open</b> for <i>busy</i> and for <i>down</i>. With fail-open on, traffic is passed without inspection; with it off, traffic that needs Snort is dropped. <code>show snort statistics</code> reports "Packets bypassed (Snort Down)" and "(Snort Busy)" so you can prove it.</p>

<div class="warn"><p><b>Common mistake.</b> Treating Trust as "faster Allow" for everything. Trusted flows are not checked by the intrusion or file policy. Use Trust (or prefilter Fastpath) only for known, high-volume, trusted flows such as backups between two data centre subnets.</p></div>

<div class="exam"><p><b>Exam trap.</b> The prefilter policy is evaluated <b>before</b> the access control policy and runs in LINA. Fastpath bypasses Snort; it is not the same as Trust, which Snort decides on the first packets. Also: UN-NAT happens before the access control rule, so rules use the <b>real</b> server address.</p></div>

<div class="scn"><h4>The rule change that did not stop the session</h4><p>An engineer blocked an old file-transfer server with a new Block rule and deployed. Monitoring still showed the transfer running. <code>show conn address 10.0.2.40</code> revealed a connection that had been up for six hours. New connections were blocked correctly, but the existing one matched the connection table at step 2 and never re-entered the policy. The engineer cleared that single connection with <code>clear conn address 10.0.2.40</code> during the change window and the transfer stopped.</p><p><b>Lesson:</b> policy is checked when a connection is created. Existing flows keep running until they end or are cleared.</p></div>

<div class="iv"><p class="q">"Walk me through the packet flow on Threat Defense."</p><p>Ingress, connection lookup, prefilter, UN-NAT, route lookup, the L3/L4 part of access control in LINA (CSM_FW_ACL_), NAT and connection creation, then Snort through DAQ: Security Intelligence, SSL, application identification and full rule match, intrusion and file inspection. Snort returns a verdict (pass, block or fast-forward) and LINA forwards on egress. Bonus points for mentioning that L3/L4 Block rules drop in LINA and that Fastpath skips Snort completely.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LINA handles ingress, connection lookup, prefilter, UN-NAT, routing, the L3/L4 ACL, NAT and egress.</li>
<li>Snort handles SI, decryption, application and full rule matching, intrusion and file inspection.</li>
<li>Prefilter runs before access control; Fastpath bypasses Snort completely.</li>
<li>Existing connections skip policy evaluation; clear them when a policy change must apply now.</li>
<li>Snort fail-open settings decide what happens when Snort is busy or down.</li>
</ul></div>
`,hi:`
<p>Jo machine aap imagine nahi kar sakte, use troubleshoot bhi nahi kar sakte. Koi bhi command chalane se pehle aapke dimaag mein ek movie honi chahiye ki partner ke pehle SYN ke saath kya hota hai, jab se woh NK-FTD ke outside interface par aata hai tab tak jab woh dmz interface se WEB ki taraf nikalta hai. Jab aap yeh movie chala sakte ho, to is module ka har tool aapko bas uska ek frame dikhata hai.</p>

<h3>Pehle packet ka safar</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="FTD packet flow">
<rect x="10" y="20" width="110" height="44" rx="8" fill="#e2e8f0"/><text x="65" y="47" text-anchor="middle" class="svg-ink" font-size="13">1 Ingress</text>
<rect x="135" y="20" width="110" height="44" rx="8" fill="#bae6fd"/><text x="190" y="47" text-anchor="middle" class="svg-ink" font-size="13">2 Conn lookup</text>
<rect x="260" y="20" width="110" height="44" rx="8" fill="#bae6fd"/><text x="315" y="47" text-anchor="middle" class="svg-ink" font-size="13">3 Prefilter</text>
<rect x="385" y="20" width="110" height="44" rx="8" fill="#bae6fd"/><text x="440" y="47" text-anchor="middle" class="svg-ink" font-size="13">4 UN-NAT</text>
<rect x="510" y="20" width="120" height="44" rx="8" fill="#bae6fd"/><text x="570" y="47" text-anchor="middle" class="svg-ink" font-size="13">5 Route lookup</text>
<rect x="510" y="110" width="120" height="44" rx="8" fill="#bae6fd"/><text x="570" y="137" text-anchor="middle" class="svg-ink" font-size="13">6 ACL (L3/L4)</text>
<rect x="385" y="110" width="110" height="44" rx="8" fill="#bae6fd"/><text x="440" y="137" text-anchor="middle" class="svg-ink" font-size="13">7 NAT, conn</text>
<rect x="260" y="110" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="315" y="137" text-anchor="middle" class="svg-ink" font-size="13">8 Snort</text>
<rect x="135" y="110" width="110" height="44" rx="8" fill="#bae6fd"/><text x="190" y="137" text-anchor="middle" class="svg-ink" font-size="13">9 Verdict</text>
<rect x="10" y="110" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="65" y="137" text-anchor="middle" class="svg-ink" font-size="13">10 Egress</text>
<line x1="120" y1="42" x2="135" y2="42" stroke="#64748b" stroke-width="2"/><line x1="245" y1="42" x2="260" y2="42" stroke="#64748b" stroke-width="2"/><line x1="370" y1="42" x2="385" y2="42" stroke="#64748b" stroke-width="2"/><line x1="495" y1="42" x2="510" y2="42" stroke="#64748b" stroke-width="2"/>
<line x1="570" y1="64" x2="570" y2="110" stroke="#64748b" stroke-width="2"/><line x1="510" y1="132" x2="495" y2="132" stroke="#64748b" stroke-width="2"/><line x1="385" y1="132" x2="370" y2="132" stroke="#64748b" stroke-width="2"/><line x1="260" y1="132" x2="245" y2="132" stroke="#64748b" stroke-width="2"/><line x1="135" y1="132" x2="120" y2="132" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="190" width="620" height="56" rx="8" fill="#fde68a"/><text x="320" y="214" text-anchor="middle" class="svg-ink" font-size="13">Blue = LINA (data plane)   Purple = Snort 3 (inspection)</text><text x="320" y="234" text-anchor="middle" class="svg-muted" font-size="12">Existing connections steps 3 se 7 skip karte hain; Fastpath aur Trust Snort skip karte hain</text>
</svg><p class="cap">Naye flow ka pehla packet har step se guzarta hai. Baad ke packets connection entry se match hote hain aur chhota raasta lete hain.</p></div>

<ol>
<li><b>Ingress.</b> Frame outside (GigabitEthernet0/0) par aata hai. Yahan liya gaya capture arrival prove karta hai.</li>
<li><b>Connection lookup.</b> LINA apni connection table check karta hai. Agar packet kisi existing connection ka hai, to woh policy steps skip karke seedha inspection ya egress par jaata hai. Isiliye policy change hamesha long-lived flow ko tab tak affect nahi karta jab tak use clear na kiya jaaye.</li>
<li><b>Prefilter.</b> Prefilter policy LINA mein, access control policy se pehle evaluate hoti hai. Prefilter rule <b>Fastpath</b> (Snort ko poori tarah bypass), <b>Block</b>, ya <b>Analyze</b> (normal policy par aage badho) kar sakti hai. GRE aur IP-in-IP jaise tunnels bhi yahin handle hote hain.</li>
<li><b>UN-NAT.</b> Agar koi static NAT rule destination (203.0.113.3) se match karti hai, to LINA use real address (10.0.2.10) mein wapas translate karta hai aur egress interface (dmz) decide karta hai. Match nahi = UN-NAT phase hi nahi, aur yahi hamari lab ka pehla fault hai.</li>
<li><b>Route lookup.</b> Jo traffic NAT se divert nahi hua, uske liye routing table egress interface chunti hai.</li>
<li><b>Access control, L3/L4 hissa.</b> Access control policy ek LINA access list <code>CSM_FW_ACL_</code> mein compile hoti hai. Jo rules sirf zones, networks aur ports use karti hain, woh yahin decide hoti hain. Sirf L3/L4 conditions wali Block rule packet ko LINA mein drop karti hai. Allow rules, aur koi bhi rule jise Snort conditions (applications, URLs, users) chahiye, LINA mein <i>permit</i> hoti hain aur Snort mein poori hoti hain.</li>
<li><b>NAT aur connection creation.</b> Source NAT apply hota hai, xlate banta hai, aur connection entry create hoti hai.</li>
<li><b>Snort.</b> LINA packet ko DAQ (data acquisition) layer ke through Snort ko deta hai. Snort lagbhag is order mein evaluate karta hai: Security Intelligence (IP, URL, DNS), SSL decryption, application identification aur poora access control rule match, phir allowed traffic ke liye intrusion aur file inspection.</li>
<li><b>Verdict.</b> Snort LINA ko verdict lautata hai: pass, drop/block, ya <b>fast-forward</b> (trust: is flow ka baaki traffic Snort ke bina bhejo).</li>
<li><b>Egress.</b> LINA final route aur adjacency (ARP) lookup karta hai aur dmz par transmit karta hai.</li>
</ol>

<h3>Allow, Trust, Fastpath: kaun kya inspect karta hai</h3>
<table class="cmp"><tr><th>Action</th><th>Kahan decide hota hai</th><th>Snort inspection</th></tr>
<tr><td>Prefilter Fastpath</td><td>LINA, access control se pehle</td><td>Bilkul nahi</td></tr>
<tr><td>Prefilter Block</td><td>LINA</td><td>Nahi</td></tr>
<tr><td>Access control Block (sirf L3/L4)</td><td>LINA access list</td><td>Nahi</td></tr>
<tr><td>Access control Trust</td><td>Snort, pehle packets</td><td>Phir fast-forward</td></tr>
<tr><td>Access control Allow</td><td>Snort</td><td>Poora: intrusion, file, malware</td></tr>
<tr><td>Default action</td><td>rule-id 268434432</td><td>Action par depend karta hai</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Lab fix hone ke baad partner ka 203.0.113.3 par TCP 443 ka SYN: ingress outside, koi existing connection nahi, prefilter Analyze, UN-NAT 203.0.113.3 se 10.0.2.10 egress dmz ke saath, access list use rule Portal-In ke roop mein permit karti hai, NAT aur connection bante hain, Snort Portal-In match karta hai, intrusion policy ko kuch nahi milta, verdict pass, dmz par 10.0.2.10 ke liye ARP, transmit. Inmein se har step packet-tracer output ki ek line hai.</p></div>

<h3>Agar Snort down ya busy ho to kya hota hai</h3>
<p>Kuch deployments ke dauraan Snort thodi der ke liye restart hota hai, aur woh overload bhi ho sakta hai. Do advanced settings decide karti hain ki tab LINA kya kare: <i>busy</i> aur <i>down</i> ke liye <b>Snort Fail Open</b>. Fail-open on ho to traffic bina inspection pass hota hai; off ho to jis traffic ko Snort chahiye woh drop hota hai. <code>show snort statistics</code> "Packets bypassed (Snort Down)" aur "(Snort Busy)" report karta hai taaki aap prove kar sako.</p>

<div class="warn"><p><b>Common galti.</b> Trust ko har cheez ke liye "fast Allow" samajhna. Trusted flows intrusion ya file policy se check nahi hote. Trust (ya prefilter Fastpath) sirf jaane-pehchaane, high-volume, trusted flows ke liye use karo, jaise do data centre subnets ke beech backups.</p></div>

<div class="exam"><p><b>Exam trap.</b> Prefilter policy access control policy se <b>pehle</b> evaluate hoti hai aur LINA mein chalti hai. Fastpath Snort bypass karta hai; yeh Trust jaisa nahi hai, jise Snort pehle packets par decide karta hai. Aur: UN-NAT access control rule se pehle hota hai, isliye rules server ka <b>real</b> address use karti hain.</p></div>

<div class="scn"><h4>Woh rule change jisne session nahi roka</h4><p>Ek engineer ne ek purane file-transfer server ko nayi Block rule se block kiya aur deploy kiya. Monitoring mein transfer ab bhi chal raha tha. <code>show conn address 10.0.2.40</code> ne ek connection dikhaya jo chhe ghante se up tha. Naye connections sahi se block ho rahe the, lekin purana wala step 2 par connection table se match hua aur kabhi policy mein dobara nahi gaya. Engineer ne change window mein <code>clear conn address 10.0.2.40</code> se sirf woh ek connection clear kiya aur transfer ruk gaya.</p><p><b>Seekh:</b> policy tab check hoti hai jab connection banta hai. Existing flows tab tak chalte rehte hain jab tak khatam ya clear na ho.</p></div>

<div class="iv"><p class="q">"Threat Defense par packet flow samjhao."</p><p>Ingress, connection lookup, prefilter, UN-NAT, route lookup, LINA mein access control ka L3/L4 hissa (CSM_FW_ACL_), NAT aur connection creation, phir DAQ ke through Snort: Security Intelligence, SSL, application identification aur poora rule match, intrusion aur file inspection. Snort verdict lautata hai (pass, block ya fast-forward) aur LINA egress par forward karta hai. Bonus points agar aap batao ki L3/L4 Block rules LINA mein drop karti hain aur Fastpath Snort ko poori tarah skip karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LINA ingress, connection lookup, prefilter, UN-NAT, routing, L3/L4 ACL, NAT aur egress handle karta hai.</li>
<li>Snort SI, decryption, application aur poora rule matching, intrusion aur file inspection handle karta hai.</li>
<li>Prefilter access control se pehle chalta hai; Fastpath Snort ko poori tarah bypass karta hai.</li>
<li>Existing connections policy evaluation skip karte hain; jab policy change abhi apply karna ho to unhe clear karo.</li>
<li>Snort fail-open settings decide karti hain ki Snort busy ya down ho to kya hoga.</li>
</ul></div>
`}};export{e as default};