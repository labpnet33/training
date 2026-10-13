var e={id:`packet-tracer`,h:{en:`packet-tracer on Threat Defense: phases, rule-ids and the Snort verdict`,hi:`Threat Defense par packet-tracer: phases, rule-ids aur Snort verdict`},body:{en:`
<p>packet-tracer is a flight simulator for one packet. You describe a packet that has not been sent, and the firewall walks it through the real configuration and tells you, phase by phase, what would happen. On ASA you already used it. On Threat Defense it does one more trick: the simulated packet is also handed to Snort, so the output ends with a <b>SNORT</b> phase that shows which access control rule Snort matched and its verdict.</p>

<h3>The command</h3>
<pre class="code"><span class="c">! Syntax: packet-tracer input &lt;ingress nameif&gt; &lt;proto&gt; &lt;src&gt; &lt;sport&gt; &lt;dst&gt; &lt;dport&gt; [detailed]</span>
&gt; packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443
<span class="c">! Use the PUBLIC destination for traffic arriving from outside: that is what the partner sends</span>
<span class="c">! Add "detailed" to see internal flow and NAT ids when you need more</span></pre>
<p>Always simulate exactly what the client sends: the ingress <b>nameif</b> (outside, not GigabitEthernet0/0), the client's real source, and the destination the client uses. A wrong input gives a confident, wrong answer.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="packet-tracer phases">
<rect x="10" y="30" width="110" height="44" rx="8" fill="#bae6fd"/><text x="65" y="57" text-anchor="middle" class="svg-ink" font-size="13">UN-NAT</text>
<rect x="135" y="30" width="110" height="44" rx="8" fill="#bae6fd"/><text x="190" y="57" text-anchor="middle" class="svg-ink" font-size="13">ROUTE-LOOKUP</text>
<rect x="260" y="30" width="110" height="44" rx="8" fill="#fed7aa"/><text x="315" y="57" text-anchor="middle" class="svg-ink" font-size="13">ACCESS-LIST</text>
<rect x="385" y="30" width="110" height="44" rx="8" fill="#bae6fd"/><text x="440" y="57" text-anchor="middle" class="svg-ink" font-size="13">NAT</text>
<rect x="510" y="30" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="570" y="57" text-anchor="middle" class="svg-ink" font-size="13">SNORT</text>
<line x1="120" y1="52" x2="135" y2="52" stroke="#64748b" stroke-width="2"/><line x1="245" y1="52" x2="260" y2="52" stroke="#64748b" stroke-width="2"/><line x1="370" y1="52" x2="385" y2="52" stroke="#64748b" stroke-width="2"/><line x1="495" y1="52" x2="510" y2="52" stroke="#64748b" stroke-width="2"/>
<text x="65" y="100" text-anchor="middle" class="svg-muted" font-size="12">public → real</text><text x="190" y="100" text-anchor="middle" class="svg-muted" font-size="12">egress ifc</text><text x="315" y="100" text-anchor="middle" class="svg-muted" font-size="12">rule-id</text><text x="440" y="100" text-anchor="middle" class="svg-muted" font-size="12">source xlate</text><text x="570" y="100" text-anchor="middle" class="svg-muted" font-size="12">verdict</text>
<text x="320" y="135" text-anchor="middle" class="svg-accent" font-size="12">The first DROP phase is where you look; later phases never run</text>
</svg><p class="cap">The main phases of an FTD packet-tracer, in order. The first phase with Result: DROP is the answer.</p></div>

<h3>Reading the phases: the broken lab</h3>
<pre class="out">&gt; packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443

Phase: 1
Type: ACCESS-LIST
Subtype:
Result: ALLOW
Config:
Implicit Rule
Additional Information:
MAC Access list

Phase: 2
Type: ROUTE-LOOKUP
Subtype: No ECMP load balancing
Result: ALLOW
Config:
Additional Information:
Destination is locally connected. No ECMP load balancing.
<span class="hl">Found next-hop 203.0.113.3 using egress ifc  outside(vrfid:0)</span>

Phase: 3
Type: ACCESS-LIST
Subtype: log
Result: DROP
Config:
access-group CSM_FW_ACL_ global
<span class="hl">access-list CSM_FW_ACL_ advanced deny ip any any rule-id 268434432 event-log flow-start</span>
access-list CSM_FW_ACL_ remark rule-id 268434432: ACCESS POLICY: NK-ACP - Default
access-list CSM_FW_ACL_ remark rule-id 268434432: L4 RULE: DEFAULT ACTION RULE

Result:
input-interface: outside(vrfid:0)
input-status: up
output-interface: outside(vrfid:0)
Action: drop
<span class="hl">Drop-reason: (acl-drop) Flow is denied by configured rule</span></pre>
<p>Read it like a detective. There is <b>no UN-NAT phase</b>, so no static NAT rule owns 203.0.113.3. Because nothing translated the destination, the route lookup sends it back out of <b>outside</b>. The access list then finds no rule from zone OUTSIDE to zone OUTSIDE, so it falls to the <b>default action</b>, rule-id <b>268434432</b>. Two faults leap out: the NAT and, as you will see, the rule.</p>

<h3>Reading the phases: the fixed lab</h3>
<pre class="out">Phase: 2
Type: UN-NAT
Subtype: static
Result: ALLOW
Config:
object network WEB
 nat (dmz,outside) static 203.0.113.3
Additional Information:
<span class="hl">NAT divert to egress interface dmz(vrfid:0)</span>
<span class="hl">Untranslate 203.0.113.3/443 to 10.0.2.10/443</span>

Phase: 3
Type: ACCESS-LIST
Subtype: log
Result: ALLOW
Config:
access-group CSM_FW_ACL_ global
access-list CSM_FW_ACL_ advanced permit tcp any object WEB eq 443 rule-id 268435458
<span class="hl">access-list CSM_FW_ACL_ remark rule-id 268435458: L7 RULE: Portal-In</span>
...
Phase: 11
Type: SNORT
Subtype:
Result: ALLOW
Config:
Additional Information:
Snort Trace:
Packet: TCP, SYN, seq 1820412377
Session: new snort session
AppID: service unknown (0), application unknown (0)
<span class="hl">Firewall: allow rule, 'Portal-In', allow</span>
Snort id 0, NAP id 2, IPS id 0, Verdict PASS
Snort Verdict: (pass-packet) allow this packet

Result:
input-interface: outside(vrfid:0)
output-interface: dmz(vrfid:0)
<span class="hl">Action: allow</span></pre>

<h3>Rule-ids you should recognise</h3>
<table class="cmp"><tr><th>rule-id / remark</th><th>Meaning</th></tr>
<tr><td>268434432 "DEFAULT ACTION RULE"</td><td>Nothing matched; the policy's default action decided</td></tr>
<tr><td>268435457, 268435458 ...</td><td>Your access control rules, in order; the remark gives the name</td></tr>
<tr><td>"L4 RULE"</td><td>Rule with only zone, network and port conditions</td></tr>
<tr><td>"L7 RULE"</td><td>Rule decided or finished in Snort (Allow, or uses applications, URLs, users)</td></tr>
<tr><td>9998 "PREFILTER POLICY: Default Tunnel and Priority Policy"</td><td>Default prefilter handling of tunnels</td></tr>
<tr><td>"Implicit Rule"</td><td>Built-in LINA behaviour, not one of your rules</td></tr>
</table>
<p>To map a rule-id to a rule on the device, use <code>show access-control-config</code> (rules with hit counts) or <code>show access-list | include 268435458</code>.</p>

<div class="eg"><p><b>Worked example.</b> PC1 (10.0.1.10) browsing 8.8.8.8 from the earlier module: <code>packet-tracer input inside tcp 10.0.1.10 40000 8.8.8.8 80</code>. The ACCESS-LIST phase shows rule-id 268435457 with remark "L7 RULE: Inside-Out", the NAT phase shows dynamic PAT to the outside interface 203.0.113.2, and the SNORT phase shows "allow rule, 'Inside-Out'". If instead you saw 268434432, Inside-Out does not cover port 80 or the zones are wrong.</p></div>

<h3>packet-tracer in the Management Center</h3>
<p>Recent Management Center versions also offer packet-tracer and capture in the device <b>Troubleshoot</b> tools, with a form for the same fields and the same phase output. It is convenient when you do not have CLI access, but the logic is identical.</p>

<div class="warn"><p><b>Common mistakes.</b> Simulating with the real address (10.0.2.10) for traffic that arrives from outside: the partner never sends to 10.0.2.10, so the test proves nothing. Using an interface name like GigabitEthernet0/0 instead of the nameif. Believing "Action: allow" means the application works: packet-tracer simulates one packet and does not test the server or the return path.</p></div>

<div class="exam"><p><b>Exam trap.</b> Missing UN-NAT for a published server means no static NAT rule matches that destination. An ACCESS-LIST drop with rule-id 268434432 means the default action, not a specific Block rule. A SNORT phase with "Verdict BLOCKLIST" or "block" means Snort decided, not LINA.</p></div>

<div class="scn"><h4>The confident wrong answer</h4><p>A junior engineer reported "packet-tracer says allow, the firewall is fine" for a partner complaint. A senior asked to see the command: it used <code>input dmz</code> and the server's real address as the destination. Re-run as <code>input outside ... 203.0.113.3 443</code>, the output had no UN-NAT phase and ended on the default action. The static NAT had been built for the wrong mapped address.</p><p><b>Lesson:</b> packet-tracer is only as good as its input. Simulate the packet the client actually sends, on the interface it actually arrives on.</p></div>

<div class="iv"><p class="q">"What extra information does packet-tracer give you on FTD compared with ASA?"</p><p>The ACCESS-LIST phase uses the CSM_FW_ACL_ list with rule-ids and remarks that name the access control rule (L4 or L7 RULE), and there is a SNORT phase showing Snort's rule match, the AppID result and the verdict (pass, block, fast-forward). Mention the default action rule-id 268434432 and that you map rule-ids with show access-control-config.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Simulate the real client packet on the real ingress nameif: <code>packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443</code>.</li>
<li>No UN-NAT phase for a published server = no static NAT matches the destination.</li>
<li>rule-id 268434432 = default action; the remark names every other rule.</li>
<li>The SNORT phase shows Snort's rule match and verdict.</li>
<li>Allow in packet-tracer is not proof that the application works end to end.</li>
</ul></div>
`,hi:`
<p>packet-tracer ek packet ke liye flight simulator hai. Aap ek aisa packet describe karte ho jo bheja nahi gaya, aur firewall use real configuration se guzarta hai aur phase by phase batata hai ki kya hoga. ASA par aap ise use kar chuke ho. Threat Defense par yeh ek trick aur karta hai: simulated packet Snort ko bhi diya jaata hai, isliye output ek <b>SNORT</b> phase par khatam hota hai jo dikhata hai ki Snort ne kaunsi access control rule match ki aur uska verdict kya hai.</p>

<h3>Command</h3>
<pre class="code"><span class="c">! Syntax: packet-tracer input &lt;ingress nameif&gt; &lt;proto&gt; &lt;src&gt; &lt;sport&gt; &lt;dst&gt; &lt;dport&gt; [detailed]</span>
&gt; packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443
<span class="c">! Outside se aane wale traffic ke liye PUBLIC destination use karo: partner wahi bhejta hai</span>
<span class="c">! Zarurat ho to internal flow aur NAT ids dekhne ke liye "detailed" jodo</span></pre>
<p>Hamesha wahi simulate karo jo client bhejta hai: ingress <b>nameif</b> (outside, GigabitEthernet0/0 nahi), client ka real source, aur woh destination jo client use karta hai. Galat input ek confident, galat jawab deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="packet-tracer ke phases">
<rect x="10" y="30" width="110" height="44" rx="8" fill="#bae6fd"/><text x="65" y="57" text-anchor="middle" class="svg-ink" font-size="13">UN-NAT</text>
<rect x="135" y="30" width="110" height="44" rx="8" fill="#bae6fd"/><text x="190" y="57" text-anchor="middle" class="svg-ink" font-size="13">ROUTE-LOOKUP</text>
<rect x="260" y="30" width="110" height="44" rx="8" fill="#fed7aa"/><text x="315" y="57" text-anchor="middle" class="svg-ink" font-size="13">ACCESS-LIST</text>
<rect x="385" y="30" width="110" height="44" rx="8" fill="#bae6fd"/><text x="440" y="57" text-anchor="middle" class="svg-ink" font-size="13">NAT</text>
<rect x="510" y="30" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="570" y="57" text-anchor="middle" class="svg-ink" font-size="13">SNORT</text>
<line x1="120" y1="52" x2="135" y2="52" stroke="#64748b" stroke-width="2"/><line x1="245" y1="52" x2="260" y2="52" stroke="#64748b" stroke-width="2"/><line x1="370" y1="52" x2="385" y2="52" stroke="#64748b" stroke-width="2"/><line x1="495" y1="52" x2="510" y2="52" stroke="#64748b" stroke-width="2"/>
<text x="65" y="100" text-anchor="middle" class="svg-muted" font-size="12">public → real</text><text x="190" y="100" text-anchor="middle" class="svg-muted" font-size="12">egress ifc</text><text x="315" y="100" text-anchor="middle" class="svg-muted" font-size="12">rule-id</text><text x="440" y="100" text-anchor="middle" class="svg-muted" font-size="12">source xlate</text><text x="570" y="100" text-anchor="middle" class="svg-muted" font-size="12">verdict</text>
<text x="320" y="135" text-anchor="middle" class="svg-accent" font-size="12">Pehla DROP phase hi dekhna hai; baad ke phases chalte hi nahi</text>
</svg><p class="cap">FTD packet-tracer ke main phases, order mein. Result: DROP wala pehla phase hi jawab hai.</p></div>

<h3>Phases padhna: tooti hui lab</h3>
<pre class="out">&gt; packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443

Phase: 1
Type: ACCESS-LIST
Subtype:
Result: ALLOW
Config:
Implicit Rule
Additional Information:
MAC Access list

Phase: 2
Type: ROUTE-LOOKUP
Subtype: No ECMP load balancing
Result: ALLOW
Config:
Additional Information:
Destination is locally connected. No ECMP load balancing.
<span class="hl">Found next-hop 203.0.113.3 using egress ifc  outside(vrfid:0)</span>

Phase: 3
Type: ACCESS-LIST
Subtype: log
Result: DROP
Config:
access-group CSM_FW_ACL_ global
<span class="hl">access-list CSM_FW_ACL_ advanced deny ip any any rule-id 268434432 event-log flow-start</span>
access-list CSM_FW_ACL_ remark rule-id 268434432: ACCESS POLICY: NK-ACP - Default
access-list CSM_FW_ACL_ remark rule-id 268434432: L4 RULE: DEFAULT ACTION RULE

Result:
input-interface: outside(vrfid:0)
input-status: up
output-interface: outside(vrfid:0)
Action: drop
<span class="hl">Drop-reason: (acl-drop) Flow is denied by configured rule</span></pre>
<p>Ise detective ki tarah padho. <b>UN-NAT phase nahi hai</b>, yaani koi static NAT rule 203.0.113.3 ki maalik nahi. Kyunki destination translate nahi hua, route lookup use wapas <b>outside</b> se bhej deta hai. Phir access list ko zone OUTSIDE se zone OUTSIDE ki koi rule nahi milti, to woh <b>default action</b>, rule-id <b>268434432</b>, par gir jaata hai. Do faults saaf dikhte hain: NAT aur, jaise aap dekhoge, rule.</p>

<h3>Phases padhna: fixed lab</h3>
<pre class="out">Phase: 2
Type: UN-NAT
Subtype: static
Result: ALLOW
Config:
object network WEB
 nat (dmz,outside) static 203.0.113.3
Additional Information:
<span class="hl">NAT divert to egress interface dmz(vrfid:0)</span>
<span class="hl">Untranslate 203.0.113.3/443 to 10.0.2.10/443</span>

Phase: 3
Type: ACCESS-LIST
Subtype: log
Result: ALLOW
Config:
access-group CSM_FW_ACL_ global
access-list CSM_FW_ACL_ advanced permit tcp any object WEB eq 443 rule-id 268435458
<span class="hl">access-list CSM_FW_ACL_ remark rule-id 268435458: L7 RULE: Portal-In</span>
...
Phase: 11
Type: SNORT
Subtype:
Result: ALLOW
Config:
Additional Information:
Snort Trace:
Packet: TCP, SYN, seq 1820412377
Session: new snort session
AppID: service unknown (0), application unknown (0)
<span class="hl">Firewall: allow rule, 'Portal-In', allow</span>
Snort id 0, NAP id 2, IPS id 0, Verdict PASS
Snort Verdict: (pass-packet) allow this packet

Result:
input-interface: outside(vrfid:0)
output-interface: dmz(vrfid:0)
<span class="hl">Action: allow</span></pre>

<h3>Rule-ids jo aapko pehchaanne chahiye</h3>
<table class="cmp"><tr><th>rule-id / remark</th><th>Matlab</th></tr>
<tr><td>268434432 "DEFAULT ACTION RULE"</td><td>Kuch match nahi hua; policy ke default action ne decide kiya</td></tr>
<tr><td>268435457, 268435458 ...</td><td>Aapki access control rules, order mein; remark naam deta hai</td></tr>
<tr><td>"L4 RULE"</td><td>Sirf zone, network aur port conditions wali rule</td></tr>
<tr><td>"L7 RULE"</td><td>Snort mein decide ya poori hone wali rule (Allow, ya applications, URLs, users use karti hai)</td></tr>
<tr><td>9998 "PREFILTER POLICY: Default Tunnel and Priority Policy"</td><td>Tunnels ki default prefilter handling</td></tr>
<tr><td>"Implicit Rule"</td><td>Built-in LINA behaviour, aapki rules mein se nahi</td></tr>
</table>
<p>Device par rule-id ko rule se map karne ke liye <code>show access-control-config</code> (hit counts ke saath rules) ya <code>show access-list | include 268435458</code> use karo.</p>

<div class="eg"><p><b>Worked example.</b> Pichle module se PC1 (10.0.1.10) 8.8.8.8 browse kar raha hai: <code>packet-tracer input inside tcp 10.0.1.10 40000 8.8.8.8 80</code>. ACCESS-LIST phase rule-id 268435457 remark "L7 RULE: Inside-Out" ke saath dikhata hai, NAT phase outside interface 203.0.113.2 par dynamic PAT dikhata hai, aur SNORT phase "allow rule, 'Inside-Out'" dikhata hai. Agar iske bajaye 268434432 dikhe, to Inside-Out port 80 cover nahi karti ya zones galat hain.</p></div>

<h3>Management Center mein packet-tracer</h3>
<p>Naye Management Center versions device ke <b>Troubleshoot</b> tools mein bhi packet-tracer aur capture dete hain, unhi fields ke form aur wahi phase output ke saath. Jab CLI access na ho tab yeh convenient hai, lekin logic bilkul same hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Outside se aane wale traffic ke liye real address (10.0.2.10) se simulate karna: partner kabhi 10.0.2.10 par nahi bhejta, to test kuch prove nahi karta. nameif ki jagah GigabitEthernet0/0 jaisa interface naam use karna. Yeh maanna ki "Action: allow" ka matlab application kaam karti hai: packet-tracer ek packet simulate karta hai aur server ya return path test nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> Published server ke liye UN-NAT missing ka matlab hai koi static NAT rule us destination se match nahi karti. rule-id 268434432 wala ACCESS-LIST drop default action hai, koi specific Block rule nahi. "Verdict BLOCKLIST" ya "block" wala SNORT phase matlab Snort ne decide kiya, LINA ne nahi.</p></div>

<div class="scn"><h4>Confident galat jawab</h4><p>Ek junior engineer ne partner complaint par report kiya "packet-tracer allow bolta hai, firewall theek hai". Senior ne command dekhna chaha: usmein <code>input dmz</code> aur server ka real address destination tha. <code>input outside ... 203.0.113.3 443</code> ke saath dobara chalane par output mein UN-NAT phase nahi tha aur woh default action par khatam hua. Static NAT galat mapped address ke liye bana tha.</p><p><b>Seekh:</b> packet-tracer utna hi accha hai jitna uska input. Wahi packet simulate karo jo client sach mein bhejta hai, usi interface par jahan woh sach mein aata hai.</p></div>

<div class="iv"><p class="q">"ASA ke comparison mein FTD par packet-tracer aapko kya extra information deta hai?"</p><p>ACCESS-LIST phase CSM_FW_ACL_ list use karta hai jismein rule-ids aur remarks access control rule ka naam batate hain (L4 ya L7 RULE), aur ek SNORT phase hai jo Snort ka rule match, AppID result aur verdict (pass, block, fast-forward) dikhata hai. Default action rule-id 268434432 mention karo aur yeh ki rule-ids aap show access-control-config se map karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Real ingress nameif par real client packet simulate karo: <code>packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443</code>.</li>
<li>Published server ke liye UN-NAT phase nahi = koi static NAT destination se match nahi karta.</li>
<li>rule-id 268434432 = default action; baaki har rule ka naam remark batata hai.</li>
<li>SNORT phase Snort ka rule match aur verdict dikhata hai.</li>
<li>packet-tracer mein Allow is baat ka saboot nahi ki application end to end kaam karti hai.</li>
</ul></div>
`}};export{e as default};