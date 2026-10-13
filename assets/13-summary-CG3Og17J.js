var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Pilots are experts, yet they run a checklist before every flight because under pressure memory skips steps. Use this chapter the same way: before the ENCOR exam, before an interview, and before you touch a production BGP edge. If you can do everything in the first list without notes, you are ready for objective 3.2.c.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="From configuration to a working BGP route">
<rect x="5" y="40" width="95" height="56" rx="8" fill="#e2e8f0"/><text x="52" y="64" text-anchor="middle" class="svg-ink" font-size="12">Reachability</text><text x="52" y="82" text-anchor="middle" class="svg-muted" font-size="11">route to peer</text>
<rect x="112" y="40" width="95" height="56" rx="8" fill="#fed7aa"/><text x="159" y="64" text-anchor="middle" class="svg-ink" font-size="12">TCP 179</text><text x="159" y="82" text-anchor="middle" class="svg-muted" font-size="11">IPs, ACL, source</text>
<rect x="219" y="40" width="95" height="56" rx="8" fill="#fde68a"/><text x="266" y="64" text-anchor="middle" class="svg-ink" font-size="12">OPEN</text><text x="266" y="82" text-anchor="middle" class="svg-muted" font-size="11">AS, RID</text>
<rect x="326" y="40" width="95" height="56" rx="8" fill="#bae6fd"/><text x="373" y="64" text-anchor="middle" class="svg-ink" font-size="12">Established</text><text x="373" y="82" text-anchor="middle" class="svg-muted" font-size="11">PfxRcd number</text>
<rect x="433" y="40" width="95" height="56" rx="8" fill="#ddd6fe"/><text x="480" y="64" text-anchor="middle" class="svg-ink" font-size="12">Best path</text><text x="480" y="82" text-anchor="middle" class="svg-muted" font-size="11">*&gt; in table</text>
<rect x="540" y="40" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="587" y="64" text-anchor="middle" class="svg-ink" font-size="12">Route</text><text x="587" y="82" text-anchor="middle" class="svg-muted" font-size="11">B [20/x]</text>
<line x1="100" y1="68" x2="112" y2="68" stroke="#64748b" stroke-width="2"/><line x1="207" y1="68" x2="219" y2="68" stroke="#64748b" stroke-width="2"/><line x1="314" y1="68" x2="326" y2="68" stroke="#64748b" stroke-width="2"/><line x1="421" y1="68" x2="433" y2="68" stroke="#64748b" stroke-width="2"/><line x1="528" y1="68" x2="540" y2="68" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Every BGP fault breaks one of these links; find the first broken one.</text>
</svg><p class="cap">The whole module in one chain.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why BGP exists, what an AS is, and the difference between transit and peering.</li>
<li>Classify an ASN as public, private or documentation, and convert asdot to asplain.</li>
<li>Name the five message types and the six neighbor states, and say what Idle and Active mean for troubleshooting.</li>
<li>Configure an eBGP session with <code>router bgp</code>, <code>bgp router-id</code> and <code>neighbor ... remote-as</code> (lab 1).</li>
<li>Advertise a prefix with <code>network ... mask</code> that matches the RIB exactly.</li>
<li>Peer between loopbacks with a route, <code>update-source</code> and <code>ebgp-multihop</code> (lab 2).</li>
<li>Read every column and status code of <code>show ip bgp</code> and <code>show ip bgp summary</code>.</li>
<li>List the four attribute categories with examples.</li>
<li>Walk the best-path algorithm from memory and apply it to two paths.</li>
<li>Influence outbound traffic with weight and local preference, inbound with prepend and MED.</li>
<li>Build a summary with <code>aggregate-address</code> and explain <code>summary-only</code> and <code>as-set</code>.</li>
<li>Troubleshoot a session stuck in Idle or Active in layers.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AS / ASN</dt><dd>Autonomous system and its number; private 64512 to 65534 and 4200000000 to 4294967294.</dd>
<dt>eBGP / iBGP</dt><dd>Session between different ASes (AD 20, TTL 1) or within one AS (AD 200, TTL 255).</dd>
<dt>AS_PATH</dt><dd>List of ASes a route crossed; the right-most is the origin; own ASN means loop, reject.</dd>
<dt>NEXT_HOP</dt><dd>Address to forward to; must be reachable for the route to be valid.</dd>
<dt>Loc-RIB</dt><dd>The BGP table after inbound policy, holding the best path per prefix.</dd>
<dt>Weight</dt><dd>Cisco-only, local to one router, higher wins; 32768 for local routes.</dd>
<dt>LOCAL_PREF</dt><dd>AS-wide exit preference, default 100, higher wins, never sent to eBGP peers.</dd>
<dt>MED</dt><dd>Hint to a neighbouring AS about the preferred entry link, lower wins.</dd>
<dt>Aggregate</dt><dd>A summary created with <code>aggregate-address</code>; needs a component in the BGP table.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Transport</td><td>TCP port 179</td></tr>
<tr><td>Timers</td><td>Keepalive 60 s, hold 180 s; lower hold time is used</td></tr>
<tr><td>AD</td><td>eBGP 20, iBGP 200, locally generated aggregate 200</td></tr>
<tr><td>States</td><td>Idle, Connect, Active, OpenSent, OpenConfirm, Established</td></tr>
<tr><td>Loop prevention</td><td>eBGP: own ASN in AS_PATH; iBGP: split horizon, full mesh n(n-1)/2</td></tr>
<tr><td>Best path</td><td>Weight, LP, local, AIGP, AS_PATH, origin, MED, eBGP, IGP metric, oldest, RID</td></tr>
<tr><td>Origin</td><td>i &lt; e &lt; ?</td></tr>
<tr><td>Local routes</td><td>Next hop 0.0.0.0, weight 32768</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code">router bgp 65010
 bgp router-id 10.10.10.10
 neighbor 100.64.10.1 remote-as 64500
 neighbor 100.64.10.1 description Skyline-Net
 network 192.168.50.0 mask 255.255.255.0
 aggregate-address 192.168.48.0 255.255.252.0 summary-only
 neighbor 3.3.3.3 update-source Loopback0
 neighbor 3.3.3.3 ebgp-multihop 2
 neighbor 100.64.20.1 route-map ISP-B-OUT out
<span class="c">! verification</span>
show ip bgp summary
show ip bgp
show ip bgp 203.0.113.0
show ip bgp neighbors 100.64.10.1
show ip bgp neighbors 100.64.10.1 advertised-routes
show ip route bgp
clear ip bgp 100.64.10.1 soft in</pre>

<div class="eg"><p><b>Worked example: a final self-test.</b> R1 in AS 65101 shows <code>*&gt; 172.31.4.0/24 10.12.0.2 0 65102 65103 65104 i</code>. Read it aloud: valid and best; next hop R2's link address; weight 0 (learned); AS_PATH length 3; origin AS 65104; origin code IGP, so R4 used a network statement. In the routing table it appears as <code>B 172.31.4.0/24 [20/0] via 10.12.0.2</code>. If you could say all of that without looking back, you have the module.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising the best-path list but not the direction of each step. Know which prefer higher (weight, local preference) and which prefer lower or shorter (everything else), and that MED comparison is limited to one neighbouring AS by default.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Configure and verify eBGP between directly connected neighbors" means the exam expects you to spot missing <code>remote-as</code>, wrong neighbor IPs, a network statement with the wrong mask, and to read <code>show ip bgp summary</code> states. Drag-and-drop questions on attribute categories and best-path order are common.</p></div>

<div class="scn"><h4>The change checklist that saved a night</h4><p>A network team adopted a five-line pre-change checklist for every BGP edge change: session state and PfxRcd before and after, <code>advertised-routes</code> before and after, and one end-to-end ping from a LAN host. During a routine ACL update, the "after" check showed State/PfxRcd as Active within a minute, and the change was rolled back before users noticed. The cause was exactly the missing reverse port-179 line from the troubleshooting chapter.</p><p><b>Lesson:</b> a short, consistent verification routine turns BGP outages into five-minute rollbacks.</p></div>

<div class="iv"><p class="q">"In two minutes, tell me what you know about eBGP."</p><p>Strong answer: BGP-4 is a path-vector protocol between autonomous systems over TCP 179. eBGP peers are configured by IP, expect a directly connected neighbor with TTL 1, prepend their ASN and change the next hop; AD is 20. Sessions move from Idle to Established; Active means TCP is failing. Prefixes are originated with network statements that must match the RIB or by redistribution. Best path follows weight, local preference, locally originated, AS_PATH, origin, MED, eBGP over iBGP, IGP metric and tie-breakers. Mention prepending and MED for inbound traffic and <code>aggregate-address</code> for summaries.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BGP connects ASes over TCP 179 using policy and attributes, not link speed.</li>
<li>Session first (Idle, Active, Established), then routes, then forwarding.</li>
<li>network needs an exact RIB match; loopback peering needs a route, update-source and ebgp-multihop.</li>
<li>Best path: N WLLA OMNI, then oldest, router ID, cluster list, neighbor IP.</li>
<li>Weight and local preference steer outbound traffic; prepend and MED steer inbound traffic.</li>
</ul></div>
`,hi:`
<p>Pilots experts hote hain, phir bhi har flight se pehle checklist chalate hain kyunki pressure mein memory steps chhod deti hai. Is chapter ko aise hi use karo: ENCOR exam se pehle, interview se pehle, aur production BGP edge ko chhoone se pehle. Agar aap pehli list ka sab kuch bina notes ke kar sakte ho, to aap objective 3.2.c ke liye ready ho.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Configuration se chalte hue BGP route tak">
<rect x="5" y="40" width="95" height="56" rx="8" fill="#e2e8f0"/><text x="52" y="64" text-anchor="middle" class="svg-ink" font-size="12">Reachability</text><text x="52" y="82" text-anchor="middle" class="svg-muted" font-size="11">peer tak route</text>
<rect x="112" y="40" width="95" height="56" rx="8" fill="#fed7aa"/><text x="159" y="64" text-anchor="middle" class="svg-ink" font-size="12">TCP 179</text><text x="159" y="82" text-anchor="middle" class="svg-muted" font-size="11">IPs, ACL, source</text>
<rect x="219" y="40" width="95" height="56" rx="8" fill="#fde68a"/><text x="266" y="64" text-anchor="middle" class="svg-ink" font-size="12">OPEN</text><text x="266" y="82" text-anchor="middle" class="svg-muted" font-size="11">AS, RID</text>
<rect x="326" y="40" width="95" height="56" rx="8" fill="#bae6fd"/><text x="373" y="64" text-anchor="middle" class="svg-ink" font-size="12">Established</text><text x="373" y="82" text-anchor="middle" class="svg-muted" font-size="11">PfxRcd number</text>
<rect x="433" y="40" width="95" height="56" rx="8" fill="#ddd6fe"/><text x="480" y="64" text-anchor="middle" class="svg-ink" font-size="12">Best path</text><text x="480" y="82" text-anchor="middle" class="svg-muted" font-size="11">table mein *&gt;</text>
<rect x="540" y="40" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="587" y="64" text-anchor="middle" class="svg-ink" font-size="12">Route</text><text x="587" y="82" text-anchor="middle" class="svg-muted" font-size="11">B [20/x]</text>
<line x1="100" y1="68" x2="112" y2="68" stroke="#64748b" stroke-width="2"/><line x1="207" y1="68" x2="219" y2="68" stroke="#64748b" stroke-width="2"/><line x1="314" y1="68" x2="326" y2="68" stroke="#64748b" stroke-width="2"/><line x1="421" y1="68" x2="433" y2="68" stroke="#64748b" stroke-width="2"/><line x1="528" y1="68" x2="540" y2="68" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Har BGP fault inme se ek kadi todta hai; pehli tooti kadi dhoondho.</text>
</svg><p class="cap">Poora module ek chain mein.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki BGP kyun hai, AS kya hai, aur transit aur peering mein kya fark hai.</li>
<li>ASN ko public, private ya documentation mein classify karo, aur asdot ko asplain mein convert karo.</li>
<li>Paanch message types aur chhe neighbor states batao, aur troubleshooting ke liye Idle aur Active ka matlab batao.</li>
<li><code>router bgp</code>, <code>bgp router-id</code> aur <code>neighbor ... remote-as</code> se eBGP session configure karo (lab 1).</li>
<li>RIB se exactly match karte <code>network ... mask</code> se prefix advertise karo.</li>
<li>Route, <code>update-source</code> aur <code>ebgp-multihop</code> ke saath loopbacks ke beech peer karo (lab 2).</li>
<li><code>show ip bgp</code> aur <code>show ip bgp summary</code> ka har column aur status code padho.</li>
<li>Chaar attribute categories examples ke saath batao.</li>
<li>Best-path algorithm yaad se chalo aur do paths par lagao.</li>
<li>Outbound traffic weight aur local preference se, inbound prepend aur MED se prabhavit karo.</li>
<li><code>aggregate-address</code> se summary banao aur <code>summary-only</code> aur <code>as-set</code> samjhao.</li>
<li>Idle ya Active mein atke session ko layers mein troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AS / ASN</dt><dd>Autonomous system aur uska number; private 64512 se 65534 aur 4200000000 se 4294967294.</dd>
<dt>eBGP / iBGP</dt><dd>Alag ASes ke beech session (AD 20, TTL 1) ya ek AS ke andar (AD 200, TTL 255).</dd>
<dt>AS_PATH</dt><dd>Un ASes ki list jinse route guzra; sabse right wala origin; apna ASN matlab loop, reject.</dd>
<dt>NEXT_HOP</dt><dd>Forward karne ka address; route valid hone ke liye reachable hona chahiye.</dd>
<dt>Loc-RIB</dt><dd>Inbound policy ke baad ki BGP table, har prefix ka best path rakhti hai.</dd>
<dt>Weight</dt><dd>Cisco-only, ek router ke liye local, zyada jeetta; local routes ke liye 32768.</dd>
<dt>LOCAL_PREF</dt><dd>AS-wide exit preference, default 100, zyada jeetta, eBGP peers ko kabhi nahi bheji jaati.</dd>
<dt>MED</dt><dd>Padosi AS ko preferred entry link ka hint, kam jeetta.</dd>
<dt>Aggregate</dt><dd><code>aggregate-address</code> se bana summary; BGP table mein ek component chahiye.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Transport</td><td>TCP port 179</td></tr>
<tr><td>Timers</td><td>Keepalive 60 s, hold 180 s; kam hold time use hota hai</td></tr>
<tr><td>AD</td><td>eBGP 20, iBGP 200, locally generated aggregate 200</td></tr>
<tr><td>States</td><td>Idle, Connect, Active, OpenSent, OpenConfirm, Established</td></tr>
<tr><td>Loop prevention</td><td>eBGP: AS_PATH mein apna ASN; iBGP: split horizon, full mesh n(n-1)/2</td></tr>
<tr><td>Best path</td><td>Weight, LP, local, AIGP, AS_PATH, origin, MED, eBGP, IGP metric, oldest, RID</td></tr>
<tr><td>Origin</td><td>i &lt; e &lt; ?</td></tr>
<tr><td>Local routes</td><td>Next hop 0.0.0.0, weight 32768</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code">router bgp 65010
 bgp router-id 10.10.10.10
 neighbor 100.64.10.1 remote-as 64500
 neighbor 100.64.10.1 description Skyline-Net
 network 192.168.50.0 mask 255.255.255.0
 aggregate-address 192.168.48.0 255.255.252.0 summary-only
 neighbor 3.3.3.3 update-source Loopback0
 neighbor 3.3.3.3 ebgp-multihop 2
 neighbor 100.64.20.1 route-map ISP-B-OUT out
<span class="c">! verification</span>
show ip bgp summary
show ip bgp
show ip bgp 203.0.113.0
show ip bgp neighbors 100.64.10.1
show ip bgp neighbors 100.64.10.1 advertised-routes
show ip route bgp
clear ip bgp 100.64.10.1 soft in</pre>

<div class="eg"><p><b>Worked example: aakhri self-test.</b> AS 65101 mein R1 <code>*&gt; 172.31.4.0/24 10.12.0.2 0 65102 65103 65104 i</code> dikhata hai. Ise zor se padho: valid aur best; next hop R2 ka link address; weight 0 (seekha hua); AS_PATH length 3; origin AS 65104; origin code IGP, yaani R4 ne network statement use kiya. Routing table mein yeh <code>B 172.31.4.0/24 [20/0] via 10.12.0.2</code> dikhta hai. Agar aap yeh sab bina peeche dekhe bol sake, to module aapka hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Best-path list ratna par har step ki direction nahi. Jaano ki kaunse zyada prefer karte hain (weight, local preference) aur kaunse kam ya chhota (baaki sab), aur yeh ki MED comparison default mein ek padosi AS tak seemit hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Directly connected neighbors ke beech eBGP configure aur verify karna" ka matlab hai exam expect karta hai ki aap missing <code>remote-as</code>, galat neighbor IPs, galat mask wala network statement pakdo, aur <code>show ip bgp summary</code> states padho. Attribute categories aur best-path order par drag-and-drop questions common hain.</p></div>

<div class="scn"><h4>Woh change checklist jisne raat bachayi</h4><p>Ek network team ne har BGP edge change ke liye paanch line ki pre-change checklist apnayi: pehle aur baad mein session state aur PfxRcd, pehle aur baad mein <code>advertised-routes</code>, aur LAN host se ek end-to-end ping. Ek routine ACL update ke dauraan "baad" wale check ne ek minute mein State/PfxRcd ko Active dikhaya, aur users ke notice karne se pehle change roll back ho gaya. Wajah bilkul troubleshooting chapter wali missing ulti port-179 line thi.</p><p><b>Seekh:</b> chhoti, consistent verification routine BGP outages ko paanch minute ke rollback mein badal deti hai.</p></div>

<div class="iv"><p class="q">"Do minute mein batao ki aap eBGP ke baare mein kya jaante ho."</p><p>Strong answer: BGP-4 autonomous systems ke beech TCP 179 par chalne wala path-vector protocol hai. eBGP peers IP se configure hote hain, TTL 1 ke saath directly connected neighbor expect karte hain, apna ASN prepend karte hain aur next hop badalte hain; AD 20 hai. Sessions Idle se Established tak jaate hain; Active matlab TCP fail ho raha hai. Prefixes RIB se match karne wale network statements se ya redistribution se originate hote hain. Best path weight, local preference, locally originated, AS_PATH, origin, MED, eBGP over iBGP, IGP metric aur tie-breakers follow karta hai. Inbound traffic ke liye prepending aur MED, aur summaries ke liye <code>aggregate-address</code> batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BGP ASes ko TCP 179 par policy aur attributes se jodta hai, link speed se nahi.</li>
<li>Pehle session (Idle, Active, Established), phir routes, phir forwarding.</li>
<li>network ko exact RIB match chahiye; loopback peering ko route, update-source aur ebgp-multihop chahiye.</li>
<li>Best path: N WLLA OMNI, phir oldest, router ID, cluster list, neighbor IP.</li>
<li>Weight aur local preference outbound traffic chalate hain; prepend aur MED inbound traffic.</li>
</ul></div>
`}};export{e as default};