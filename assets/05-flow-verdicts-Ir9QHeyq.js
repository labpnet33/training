var e={id:`flow-verdicts`,h:{en:`Debug flow verdicts: denied, no route, allowed, NAT and replies`,hi:`Debug flow verdicts: denied, no route, allowed, NAT aur replies`},body:{en:`
<p>After a few tickets you will recognise the verdict lines the way a doctor recognises a rash. This chapter collects the ones you will meet most, each with output captured from the lab, and tells you what to do next.</p>

<h3>Verdict table</h3>
<table class="cmp"><tr><th>Message</th><th>Meaning</th><th>Next step</th></tr>
<tr><td><code>Denied by forward policy check (policy 0)</code></td><td>No policy matched: implicit deny</td><td>Add or correct a policy (service, address, interface)</td></tr>
<tr><td><code>no route to host, drop</code></td><td>Routing lookup found nothing</td><td>Check <code>get router info routing-table all</code></td></tr>
<tr><td><code>reverse path check fail, drop</code></td><td>The source is not reachable through the ingress port</td><td>Fix the route back to the source or the ingress interface</td></tr>
<tr><td><code>Allowed by Policy-N: SNAT</code></td><td>Accepted by policy N with source NAT</td><td>Verify the NAT address in the session</td></tr>
<tr><td><code>Find an existing session ... reply direction</code></td><td>Return traffic of a known session</td><td>Normal; nothing to fix</td></tr></table>

<h3>Verdict 1: no route</h3>
<p>We remove the default route on FGT1 and ping 9.9.9.9 from PC1 with the flow filtered on that destination and a count of 3:</p>
<pre class="out">id=65308 trace_id=1 func=print_pkt_detail line=6005 msg="vd-root:0 received a packet(proto=1, 10.0.1.10:19499-&gt;9.9.9.9:2048) tun_id=0.0.0.0 from port2. type=8, code=0, id=19499, seq=1."
id=65308 trace_id=1 func=init_ip_session_common line=6204 msg="allocate a new session-000025d1, tun_id=0.0.0.0"
id=65308 trace_id=1 func=vf_ip_route_input_common line=2605 msg="find a route: flag=00000000 gw-0.0.0.0 via none"
id=65308 trace_id=1 func=ip_route_input_slow line=2330 msg=<span class="hl">"no route to host, drop"</span></pre>
<p>Note <code>via none</code>: routing found no interface. The routing table confirms why. Only connected routes remain:</p>
<pre class="out">get router info routing-table all
...
Routing table for VRF=0
C       10.0.1.0/24 is directly connected, port2
C       10.0.2.0/24 is directly connected, port3
C       203.0.113.0/30 is directly connected, port1</pre>
<p>With the default route in place the table contains <code>S*  0.0.0.0/0 [10/0] via 203.0.113.1, port1</code> and the same ping works. The lesson: the verdict names the layer (routing), the routing table names the fix.</p>

<h3>Verdict 2: allowed, with source NAT</h3>
<p>After the route is restored, PC1 pings 8.8.8.8 and the flow shows the whole decision chain:</p>
<pre class="out">msg="vd-root:0 received a packet(proto=1, 10.0.1.10:19499-&gt;8.8.8.8:2048) tun_id=0.0.0.0 from port2. type=8, code=0, id=19499, seq=1."
msg="allocate a new session-000025d2, tun_id=0.0.0.0"
msg="find a route: flag=04000000 gw-203.0.113.1 via port1"
msg="in-[port2], out-[port1], skb_flags-02000000, vid-0, app_id: 0, url_cat_id: 0"
msg=<span class="hl">"Allowed by Policy-1: SNAT"</span>
msg=<span class="hl">"SNAT 10.0.1.10-&gt;203.0.113.2:40001"</span></pre>
<p>Read it as five decisions: packet received on port2, new session, route via port1 gateway 203.0.113.1, policy lookup, <b>allowed by policy 1</b> with SNAT, and the translation 10.0.1.10 to 203.0.113.2 using source port 40001 (the sniffer on port1 showed the same 203.0.113.2).</p>

<h3>Verdict 3: later packets reuse the session</h3>
<p>For the second and later packets of the same flow, the kernel skips the policy and NAT decisions because the session already holds them:</p>
<pre class="out">msg="vd-root:0 received a packet(proto=1, 10.0.1.10:19499-&gt;8.8.8.8:2048) ... type=8, code=0, id=19499, seq=2."
msg=<span class="hl">"Find an existing session, id-000025d2, original direction"</span>
msg="SNAT 10.0.1.10-&gt;203.0.113.2:40001"
msg="find a route: flag=00000000 gw-203.0.113.1 via port1"</pre>
<p>And for the reply packet of a TCP flow the debug shows <code>Find an existing session ... reply direction</code>, then the route back toward the client (for example <code>via port2</code>). Seeing "reply direction" is good news: the return path works.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Verdict families">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Denied</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">policy 0</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">No route</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">via none</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Allowed</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">Policy-N</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Existing</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">session reuse</text>
</svg><p class="cap">Four verdict families. The first two are failures, the last two are normal.</p></div>

<div class="eg"><p><b>Worked example.</b> Policy 2 is corrected to include HTTP and PC1 tries the page again. This time the flow shows <code>Allowed by Policy-2:</code> with no SNAT (the DMZ policy has NAT disabled), then for the reply from port3 <code>Find an existing session, id-000025d1, reply direction</code>. The page loads, and the same trace proves that policy 2, not policy 1, decided.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reading only the last line. The earlier lines show the route and the interfaces the policy lookup used. A "denied" line with an unexpected <code>out-[...]</code> interface means routing sent the packet somewhere you did not expect.</p></div>
<div class="exam"><p><b>Exam trap.</b> An existing session is reused without a new policy check, so changing a policy does not affect flows already in the table until the session expires or is cleared. "Allowed by Policy-N" tells you which policy ID matched.</p></div>

<div class="scn"><h4>The route that was deleted at 02:00</h4><p>At 02:00 a change window removed a static route by mistake. Users on existing connections kept working for a while, but every new destination failed. The debug flow for a new destination showed "no route to host, drop" with <code>via none</code>; existing sessions were still being reused. The routing table had no default route. Restoring it fixed new flows within seconds.</p><p><b>Lesson:</b> existing sessions can hide a routing problem for a while; test with a destination you have not used before.</p></div>

<div class="iv"><p class="q">"What does 'Denied by forward policy check (policy 0)' tell you, and what do you do?"</p><p>It means no firewall policy matched the packet, so the implicit deny dropped it. I check the in and out interfaces from the previous line, then compare the source address, destination address, service and schedule with my policies, and correct or add the policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy 0 equals implicit deny; "no route to host" equals routing problem.</li>
<li>"Allowed by Policy-N" names the policy and NAT result.</li>
<li>Later packets reuse the session; reply packets show "reply direction".</li>
<li>Read the whole trace, especially the route and interface lines.</li>
<li>Test with a fresh destination so old sessions do not mislead you.</li>
</ul></div>
`,hi:`
<p>Kuch tickets ke baad aap verdict lines ko waise pehchanoge jaise doctor rash pehchanta hai. Yeh chapter woh lines jama karta hai jo sabse zyada milengi, har ek lab se capture hue output ke saath, aur batata hai ki agla kadam kya hai.</p>

<h3>Verdict table</h3>
<table class="cmp"><tr><th>Message</th><th>Matlab</th><th>Agla step</th></tr>
<tr><td><code>Denied by forward policy check (policy 0)</code></td><td>Koi policy match nahi hui: implicit deny</td><td>Policy jodo ya theek karo (service, address, interface)</td></tr>
<tr><td><code>no route to host, drop</code></td><td>Routing lookup ko kuch nahi mila</td><td><code>get router info routing-table all</code> check karo</td></tr>
<tr><td><code>reverse path check fail, drop</code></td><td>Source ingress port ke through reachable nahi</td><td>Source tak route ya ingress interface theek karo</td></tr>
<tr><td><code>Allowed by Policy-N: SNAT</code></td><td>Policy N ne source NAT ke saath accept kiya</td><td>Session mein NAT address verify karo</td></tr>
<tr><td><code>Find an existing session ... reply direction</code></td><td>Known session ka return traffic</td><td>Normal; kuch fix nahi karna</td></tr></table>

<h3>Verdict 1: no route</h3>
<p>Hum FGT1 ka default route hataate hain aur PC1 se 9.9.9.9 ping karte hain, flow us destination par filtered aur count 3 ke saath:</p>
<pre class="out">id=65308 trace_id=1 func=print_pkt_detail line=6005 msg="vd-root:0 received a packet(proto=1, 10.0.1.10:19499-&gt;9.9.9.9:2048) tun_id=0.0.0.0 from port2. type=8, code=0, id=19499, seq=1."
id=65308 trace_id=1 func=init_ip_session_common line=6204 msg="allocate a new session-000025d1, tun_id=0.0.0.0"
id=65308 trace_id=1 func=vf_ip_route_input_common line=2605 msg="find a route: flag=00000000 gw-0.0.0.0 via none"
id=65308 trace_id=1 func=ip_route_input_slow line=2330 msg=<span class="hl">"no route to host, drop"</span></pre>
<p><code>via none</code> dekho: routing ko koi interface nahi mila. Routing table confirm karta hai kyun. Sirf connected routes bachte hain:</p>
<pre class="out">get router info routing-table all
...
Routing table for VRF=0
C       10.0.1.0/24 is directly connected, port2
C       10.0.2.0/24 is directly connected, port3
C       203.0.113.0/30 is directly connected, port1</pre>
<p>Default route rehne par table mein <code>S*  0.0.0.0/0 [10/0] via 203.0.113.1, port1</code> hota hai aur wahi ping chalta hai. Lesson: verdict layer ka naam batata hai (routing), routing table fix ka naam.</p>

<h3>Verdict 2: allowed, source NAT ke saath</h3>
<p>Route restore hone ke baad PC1 8.8.8.8 ping karta hai aur flow poori decision chain dikhata hai:</p>
<pre class="out">msg="vd-root:0 received a packet(proto=1, 10.0.1.10:19499-&gt;8.8.8.8:2048) tun_id=0.0.0.0 from port2. type=8, code=0, id=19499, seq=1."
msg="allocate a new session-000025d2, tun_id=0.0.0.0"
msg="find a route: flag=04000000 gw-203.0.113.1 via port1"
msg="in-[port2], out-[port1], skb_flags-02000000, vid-0, app_id: 0, url_cat_id: 0"
msg=<span class="hl">"Allowed by Policy-1: SNAT"</span>
msg=<span class="hl">"SNAT 10.0.1.10-&gt;203.0.113.2:40001"</span></pre>
<p>Ise paanch decisions ki tarah padho: packet port2 par aaya, naya session, port1 se gateway 203.0.113.1 ka route, policy lookup, SNAT ke saath <b>policy 1 ne allow kiya</b>, aur source port 40001 ke saath 10.0.1.10 se 203.0.113.2 ka translation (port1 ke sniffer ne bhi wahi 203.0.113.2 dikhaya tha).</p>

<h3>Verdict 3: baad ke packets session reuse karte hain</h3>
<p>Same flow ke doosre aur baad ke packets ke liye kernel policy aur NAT decisions skip karta hai kyunki session mein woh pehle se hain:</p>
<pre class="out">msg="vd-root:0 received a packet(proto=1, 10.0.1.10:19499-&gt;8.8.8.8:2048) ... type=8, code=0, id=19499, seq=2."
msg=<span class="hl">"Find an existing session, id-000025d2, original direction"</span>
msg="SNAT 10.0.1.10-&gt;203.0.113.2:40001"
msg="find a route: flag=00000000 gw-203.0.113.1 via port1"</pre>
<p>Aur TCP flow ke reply packet ke liye debug <code>Find an existing session ... reply direction</code> dikhata hai, phir client ki taraf route (jaise <code>via port2</code>). "Reply direction" dikhna achhi khabar hai: return path kaam kar raha hai.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Verdict families">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Denied</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">policy 0</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">No route</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">via none</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Allowed</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">Policy-N</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Existing</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">session reuse</text>
</svg><p class="cap">Chaar verdict families. Pehli do failures hain, aakhri do normal.</p></div>

<div class="eg"><p><b>Worked example.</b> Policy 2 theek hoti hai (HTTP jodkar) aur PC1 page phir try karta hai. Is baar flow <code>Allowed by Policy-2:</code> dikhata hai bina SNAT ke (DMZ policy par NAT disabled hai), phir port3 se aaye reply ke liye <code>Find an existing session, id-000025d1, reply direction</code>. Page load hota hai, aur wahi trace saabit karta hai ki policy 1 nahi, policy 2 ne decide kiya.</p></div>

<div class="warn"><p><b>Common mistake.</b> Sirf aakhri line padhna. Pehli lines route aur woh interfaces dikhati hain jo policy lookup ne use kiye. "Denied" line ke saath unexpected <code>out-[...]</code> interface ka matlab routing ne packet aisi jagah bheja jahan aapne expect nahi kiya tha.</p></div>
<div class="exam"><p><b>Exam trap.</b> Existing session bina nayi policy check ke reuse hota hai, isliye policy badalne se table mein pehle se maujood flows par asar nahi padta jab tak session expire ya clear na ho. "Allowed by Policy-N" batata hai kaunsi policy ID match hui.</p></div>

<div class="scn"><h4>02:00 baje delete hua route</h4><p>02:00 baje change window mein galti se ek static route hat gaya. Existing connections wale users kuch der chalte rahe, lekin har nayi destination fail hui. Nayi destination ke debug flow ne "no route to host, drop" <code>via none</code> ke saath dikhaya; existing sessions abhi bhi reuse ho rahe the. Routing table mein default route nahi tha. Use wapas lagane se naye flows seconds mein theek ho gaye.</p><p><b>Lesson:</b> existing sessions routing problem ko kuch der chhupa sakte hain; aisi destination se test karo jo pehle use nahi hui.</p></div>

<div class="iv"><p class="q">"'Denied by forward policy check (policy 0)' kya batata hai, aur aap kya karte ho?"</p><p>Matlab koi firewall policy packet se match nahi hui, isliye implicit deny ne drop kiya. Main pichhli line ke in aur out interfaces check karta hoon, phir source address, destination address, service aur schedule ko apni policies se compare karta hoon, aur policy theek ya add karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy 0 barabar implicit deny; "no route to host" barabar routing problem.</li>
<li>"Allowed by Policy-N" policy aur NAT result batata hai.</li>
<li>Baad ke packets session reuse karte hain; reply packets "reply direction" dikhate hain.</li>
<li>Poora trace padho, khaaskar route aur interface lines.</li>
<li>Fresh destination se test karo taaki purane sessions gumraah na karein.</li>
</ul></div>
`}};export{e as default};