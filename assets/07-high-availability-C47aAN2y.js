var e={id:`high-availability`,h:{en:`High availability: ION HA groups, interface bypass and link failover`,hi:`High availability: ION HA groups, interface bypass aur link failover`},body:{en:`
<p>Availability in Prisma SD-WAN has three layers: <b>link failover</b> (a circuit fails or degrades), <b>device HA</b> (an ION fails) and <b>interface bypass</b> (an ION loses power or crashes and traffic must still pass). The exam lists <b>interconnectivity and high availability</b> under Planning and Design, so you must be able to say which layer solves which failure.</p>
<h3>Analogy: three safety nets under a trapeze artist</h3>
<p>The first net catches a slip (a bad circuit: the policy moves traffic to another circuit). The second net is a second artist who takes over if the first one cannot continue (the standby ION). The third is a trapdoor that keeps the stage open even if the lights go out (bypass pair). Each net covers a different fall.</p>
<table class="cmp"><tr><th>Failure</th><th>Protection</th><th>Where it is designed</th></tr>
<tr><td>One circuit down or brown-out</td><td>Several circuits plus path policy (active, backup, Layer 3 failure paths)</td><td>Branch design, policy</td></tr>
<tr><td>One ION fails</td><td>HA group with a second ION</td><td>HA design</td></tr>
<tr><td>ION loses power or crashes</td><td>Bypass pair (fail-to-wire), or the HA partner</td><td>Hardware choice and port design</td></tr>
<tr><td>Whole data center lost</td><td>Second data center</td><td>DC design (chapter 5)</td></tr></table>
<h3>ION HA, as documented</h3>
<ul>
<li>An <b>HA group</b> holds <b>a maximum of two ION devices</b> in the release I reviewed.</li>
<li>The model is <b>active/backup</b>: one device forwards, the other waits. The marketing claim of the product is that this deployment model survives a device failure and still preserves 100 percent of WAN capacity, because both devices keep their WAN circuits connected (the standby is on the circuits, not idle in a box).</li>
<li>Each device gets a <b>priority between 1 and 254</b>. If preempt is enabled, the higher priority device becomes active; without preempt, the device added first stays active.</li>
<li>Recommended gap: at least <b>40</b> between active and backup priorities, because tracking failures reduce the active priority by a configurable amount.</li>
<li><b>Track availability:</b> the ION can track the state of physical interfaces and Layer 3 reachability of WAN circuits. When a tracked item fails, the priority of the active device is lowered and the roles switch. A maximum of <b>four interfaces</b> can be tracked.</li>
<li><b>Cautions in the documentation:</b> do not enable Layer 3 availability tracking on a private WAN interface that has BGP peering configured, nor on devices sharing a single circuit.</li>
<li>The documentation also says the HA control interface must live on an external LAN switch in a common VLAN; the two devices cannot be joined only by a direct Ethernet cable.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Branch HA group">
<rect x="10" y="10" width="620" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">Circuits: Internet-A, Internet-B, MPLS</text>
<rect x="110" y="95" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="185" y="122" text-anchor="middle" class="svg-ink" font-size="13">ION-1 ACTIVE</text><text x="185" y="140" text-anchor="middle" class="svg-muted" font-size="11">priority 200</text>
<rect x="380" y="95" width="150" height="60" rx="10" fill="#fde68a"/><text x="455" y="122" text-anchor="middle" class="svg-ink" font-size="13">ION-2 BACKUP</text><text x="455" y="140" text-anchor="middle" class="svg-muted" font-size="11">priority 100</text>
<line x1="185" y1="50" x2="185" y2="95" stroke="#64748b" stroke-width="2"/><line x1="455" y1="50" x2="455" y2="95" stroke="#64748b" stroke-width="2"/><line x1="230" y1="50" x2="410" y2="95" stroke="#64748b" stroke-width="1.5"/><line x1="410" y1="50" x2="230" y2="95" stroke="#64748b" stroke-width="1.5"/>
<rect x="150" y="195" width="340" height="40" rx="8" fill="#bae6fd"/><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="13">LAN switch: HA VLAN + user VLANs</text>
<line x1="185" y1="155" x2="250" y2="195" stroke="#64748b" stroke-width="2"/><line x1="455" y1="155" x2="390" y2="195" stroke="#64748b" stroke-width="2"/>
<text x="320" y="260" text-anchor="middle" class="svg-muted" font-size="11">Heartbeat between the IONs travels through the LAN switch (HA VLAN)</text>
</svg><p class="cap">Both IONs are connected to the circuits; only the active one answers on the LAN. If tracking fails on ION-1, its priority drops below ION-2 (a gap of at least 40 makes this predictable).</p></div>
<h3>Bypass pairs</h3>
<p>A <b>bypass pair</b> is a pair of ports where one port connects to the LAN and the other to the WAN. The documentation distinguishes a <b>hardware bypass pair</b> (Ethernet interfaces with relay hardware, with strict rules about which ports pair) and a <b>virtual bypass pair</b> (interfaces without that hardware; virtual interfaces cannot be created on them). Bypass pairs are used for Internet or private WAN connectivity, for private Layer 2 operation where the ION is a Layer 2 element toward a router, and for LAN-only configuration used in branch clustering and HA. They are available only on branch ION devices and cannot be set on controller interfaces. The practical meaning: with a hardware bypass pair the physical path LAN to WAN can remain connected if the box is off, which is why physical-model choice matters for fail-to-wire designs.</p>
<h3>HA topologies by platform</h3>
<p>The branch HA documentation groups topologies by platform: Gen-1 (2000, 3000, 7000, 9000), Gen-2 (3200, 5200, 9200), Gen-2 embedded switch (1200-S, 3200 L2), software cellular bypass (1200-S with 5G), platforms without bypass pairs (for example ION 1000 and 1200) and a hybrid mode mixing 3000 and 3200. In every topology you do the same planning: decide which circuits each device terminates, make sure each circuit is reachable by both devices, create the HA control interface and the LAN interface on a VLAN, then add the devices to the HA group.</p>
<p>Example from the documentation for devices without bypass pairs: the HA control interface is a subinterface on a port with a dedicated VLAN (the example uses VLAN 130), the LAN subinterface uses another VLAN (the example uses 100) and is identical on both devices, and only the active device answers ARP. Each device has its own unique IP address on every circuit.</p>
<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! Design record for STORE-007 HA group. These are design parameters,</span>
<span class="c">! not device commands. Field wording follows the HA documentation.</span>
HA group:            STORE-007-HA
Members:             ION-1 (priority 200), ION-2 (priority 100)
Preempt:             enabled
Priority gap:        100 (documentation recommends at least 40)
Track availability:  WAN circuit reachability on Internet-A (reduce priority by 120)
                     Physical interface status on LAN trunk (reduce priority by 120)
HA control VLAN:     130 on the LAN switch (example value)
LAN VLAN:            100, same address on both IONs (example value)
Do not track:        private WAN with BGP peering, shared single circuit</pre>
<p>For checking an HA group on a real device, the documentation mentions the ION CLI commands <code>dump spoke ha config</code> and <code>dump spoke ha status</code>. I do not show sample output, because I could not verify its exact format.</p>
<div class="eg"><p><b>Worked example: priority arithmetic.</b> ION-1 priority 200, ION-2 priority 100. Tracking Internet-A reachability reduces ION-1 by 120, so it falls to 80, lower than ION-2 at 100, and with preempt enabled ION-2 becomes active. If the reduction were only 50, ION-1 would drop to 150 and stay active even with the circuit down. That is why the reduction must be larger than the gap. Also, if both devices lose the same shared circuit and you tracked it on both, both priorities drop together and you get no useful switch.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Gap smaller than the tracking reduction, so failover never fires. Tracking a circuit that both devices share. Connecting the two IONs with a direct cable for HA instead of through the LAN switch. Using a model without bypass pairs and expecting fail-to-wire. Forgetting a licence for the second device.</p></div>
<div class="exam"><p><b>Exam trap.</b> HA is <b>active/backup</b> with at most <b>two</b> devices per group; priority range 1 to 254; track up to four interfaces; recommended gap at least 40. Do not confuse Prisma SD-WAN HA with PAN-OS firewall HA (which has its own HA ports and pair rules), and do not claim active/active.</p></div>
<div class="scn"><h4>The failover that never happened</h4><p>At a store the active ION lost its internet circuit, but the standby never took over, so card payments went over the slow MPLS only. The review found priorities 120 and 100 and a tracking reduction of 10. The active device kept the higher priority even with the circuit down. They changed priorities to 200 and 100 and the reduction to 120, then tested by unplugging the circuit. Failover happened in the expected window.</p><p><b>Lesson:</b> design the arithmetic, then test failure by unplugging, not by trusting the screen.</p></div>
<div class="iv"><p class="q">"How does HA work for a Prisma SD-WAN branch, and what are its limits?"</p><p>Two IONs in an active/backup HA group, priority 1 to 254, optional preempt, with the HA control interface on a LAN switch VLAN. Tracking physical interface state and WAN reachability lowers the active priority to force a switch. Limits: two devices per group, up to four tracked interfaces, and care with BGP private WANs and shared circuits. Bypass pairs on physical models add fail-to-wire.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three layers: link failover (policy), device HA (HA group), interface bypass (fail-to-wire).</li>
<li>HA group: max two IONs, active/backup, priority 1 to 254, gap of at least 40, up to four tracked interfaces.</li>
<li>Tracking reductions must exceed the priority gap or failover will not fire.</li>
<li>HA control interface lives on a LAN switch VLAN; the LAN address is identical on both IONs.</li>
<li>Bypass pairs are for physical branch IONs; pick the model for the failure you must survive.</li>
</ul></div>
`,hi:`
<p>Prisma SD-WAN mein availability ki teen layers hain: <b>link failover</b> (circuit fail ya degrade ho), <b>device HA</b> (ION fail ho) aur <b>interface bypass</b> (ION ka power chala jaye ya crash ho aur traffic phir bhi pass hona chahiye). Exam <b>interconnectivity and high availability</b> ko Planning and Design ke under list karta hai, isliye aapko bata paana chahiye ki kaunsi layer kaunsa failure solve karti hai.</p>
<h3>Analogy: trapeze artist ke neeche teen nets</h3>
<p>Pehla net phisalne par pakadta hai (kharab circuit: policy traffic doosre circuit par move karti hai). Doosra net doosra artist hai jo pehle ke continue na kar paane par sambhal leta hai (standby ION). Teesra trapdoor hai jo light chali jaye tab bhi stage khula rakhta hai (bypass pair). Har net alag girne ko cover karta hai.</p>
<table class="cmp"><tr><th>Failure</th><th>Protection</th><th>Kahan design hota hai</th></tr>
<tr><td>Ek circuit down ya brown-out</td><td>Kai circuits plus path policy (active, backup, Layer 3 failure paths)</td><td>Branch design, policy</td></tr>
<tr><td>Ek ION fail</td><td>Doosre ION ke saath HA group</td><td>HA design</td></tr>
<tr><td>ION ka power gaya ya crash</td><td>Bypass pair (fail-to-wire), ya HA partner</td><td>Hardware choice aur port design</td></tr>
<tr><td>Poora data center gaya</td><td>Doosra data center</td><td>DC design (chapter 5)</td></tr></table>
<h3>ION HA, jaisa documented hai</h3>
<ul>
<li>Jo release maine dekha usme ek <b>HA group</b> mein <b>maximum do ION devices</b> hote hain.</li>
<li>Model <b>active/backup</b> hai: ek device forward karta hai, doosra intezaar karta hai. Product ka claim hai ki yeh deployment model device failure survive karta hai aur phir bhi 100 percent WAN capacity preserve karta hai, kyunki dono devices apne WAN circuits connected rakhte hain (standby circuits par hai, box mein idle nahi).</li>
<li>Har device ko <b>1 se 254 ke beech priority</b> milti hai. Agar preempt enabled hai to higher priority device active banta hai; preempt ke bina jo device pehle add hua woh active rehta hai.</li>
<li>Recommended gap: active aur backup priorities ke beech kam se kam <b>40</b>, kyunki tracking failures active priority ko configurable amount se ghatate hain.</li>
<li><b>Track availability:</b> ION physical interfaces ki state aur WAN circuits ki Layer 3 reachability track kar sakta hai. Jab tracked cheez fail hoti hai to active device ki priority kam hoti hai aur roles switch hote hain. Maximum <b>chaar interfaces</b> track ho sakte hain.</li>
<li><b>Documentation ki cautions:</b> BGP peering wale private WAN interface par Layer 3 availability tracking enable mat karo, aur na hi aise devices par jo ek hi circuit share karte hain.</li>
<li>Documentation yeh bhi kehti hai ki HA control interface external LAN switch par common VLAN mein honi chahiye; dono devices sirf direct Ethernet cable se nahi jode ja sakte.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Branch HA group">
<rect x="10" y="10" width="620" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">Circuits: Internet-A, Internet-B, MPLS</text>
<rect x="110" y="95" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="185" y="122" text-anchor="middle" class="svg-ink" font-size="13">ION-1 ACTIVE</text><text x="185" y="140" text-anchor="middle" class="svg-muted" font-size="11">priority 200</text>
<rect x="380" y="95" width="150" height="60" rx="10" fill="#fde68a"/><text x="455" y="122" text-anchor="middle" class="svg-ink" font-size="13">ION-2 BACKUP</text><text x="455" y="140" text-anchor="middle" class="svg-muted" font-size="11">priority 100</text>
<line x1="185" y1="50" x2="185" y2="95" stroke="#64748b" stroke-width="2"/><line x1="455" y1="50" x2="455" y2="95" stroke="#64748b" stroke-width="2"/><line x1="230" y1="50" x2="410" y2="95" stroke="#64748b" stroke-width="1.5"/><line x1="410" y1="50" x2="230" y2="95" stroke="#64748b" stroke-width="1.5"/>
<rect x="150" y="195" width="340" height="40" rx="8" fill="#bae6fd"/><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="13">LAN switch: HA VLAN + user VLANs</text>
<line x1="185" y1="155" x2="250" y2="195" stroke="#64748b" stroke-width="2"/><line x1="455" y1="155" x2="390" y2="195" stroke="#64748b" stroke-width="2"/>
<text x="320" y="260" text-anchor="middle" class="svg-muted" font-size="11">IONs ke beech heartbeat LAN switch (HA VLAN) se guzarti hai</text>
</svg><p class="cap">Dono IONs circuits se connected hain; sirf active LAN par jawab deta hai. Agar ION-1 par tracking fail ho, to uski priority ION-2 se neeche gir jaati hai (kam se kam 40 ka gap ise predictable banata hai).</p></div>
<h3>Bypass pairs</h3>
<p><b>Bypass pair</b> ports ki ek jodi hai jisme ek port LAN se aur doosra WAN se connect hota hai. Documentation <b>hardware bypass pair</b> (relay hardware wale Ethernet interfaces, kaun se ports pair ho sakte hain uske strict rules ke saath) aur <b>virtual bypass pair</b> (us hardware ke bina interfaces; unpar virtual interfaces nahi ban sakte) mein fark karti hai. Bypass pairs Internet ya private WAN connectivity ke liye, private Layer 2 operation ke liye jahan ION router ki taraf Layer 2 element hota hai, aur branch clustering aur HA mein use hone wali LAN-only configuration ke liye use hote hain. Yeh sirf branch ION devices par available hain aur controller interfaces par set nahi ho sakte. Practical matlab: hardware bypass pair ke saath box off ho tab bhi physical LAN se WAN path connected reh sakta hai, isliye fail-to-wire designs mein physical model ka choice matter karta hai.</p>
<h3>Platform ke hisaab se HA topologies</h3>
<p>Branch HA documentation topologies ko platform ke hisaab se group karti hai: Gen-1 (2000, 3000, 7000, 9000), Gen-2 (3200, 5200, 9200), Gen-2 embedded switch (1200-S, 3200 L2), software cellular bypass (5G wala 1200-S), bypass pairs ke bina platforms (jaise ION 1000 aur 1200) aur hybrid mode jo 3000 aur 3200 ko mix karta hai. Har topology mein planning ek jaisi hoti hai: tay karo ki har device kaun se circuits terminate karta hai, pakka karo ki har circuit dono devices ko reachable ho, VLAN par HA control interface aur LAN interface banao, phir devices ko HA group mein add karo.</p>
<p>Bypass pairs ke bina devices ke liye documentation ka example: HA control interface ek port par dedicated VLAN wala subinterface hai (example mein VLAN 130), LAN subinterface doosre VLAN ka hai (example mein 100) aur dono devices par identical hai, aur sirf active device ARP ka jawab deta hai. Har device ka har circuit par apna unique IP address hota hai.</p>
<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! STORE-007 HA group ka design record. Yeh design parameters hain,</span>
<span class="c">! device commands nahi. Field wording HA documentation ke hisaab se hai.</span>
HA group:            STORE-007-HA
Members:             ION-1 (priority 200), ION-2 (priority 100)
Preempt:             enabled
Priority gap:        100 (documentation kam se kam 40 recommend karti hai)
Track availability:  Internet-A par WAN circuit reachability (priority 120 ghatao)
                     LAN trunk par physical interface status (priority 120 ghatao)
HA control VLAN:     LAN switch par 130 (example value)
LAN VLAN:            100, dono IONs par same address (example value)
Do not track:        BGP peering wala private WAN, shared single circuit</pre>
<p>Real device par HA group check karne ke liye documentation ION CLI commands <code>dump spoke ha config</code> aur <code>dump spoke ha status</code> ka zikr karti hai. Main sample output nahi dikhata, kyunki uska exact format verify nahi kar paya.</p>
<div class="eg"><p><b>Worked example: priority arithmetic.</b> ION-1 priority 200, ION-2 priority 100. Internet-A reachability tracking ION-1 ko 120 se ghatati hai, to woh 80 par aa jaata hai, ION-2 ki 100 se kam, aur preempt enabled hone par ION-2 active ban jaata hai. Agar reduction sirf 50 hota, to ION-1 150 par rehta aur circuit down hone par bhi active rehta. Isliye reduction gap se bada hona chahiye. Aur agar dono devices ek hi shared circuit kho dein aur aapne use dono par track kiya ho, to dono priorities saath girti hain aur koi useful switch nahi hota.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Gap tracking reduction se chhota, isliye failover kabhi fire nahi hota. Aisa circuit track karna jo dono devices share karte hain. Dono IONs ko HA ke liye LAN switch ki jagah direct cable se jodna. Bypass pairs ke bina model use karke fail-to-wire expect karna. Doosre device ka licence bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> HA <b>active/backup</b> hai, har group mein adhiktam <b>do</b> devices; priority range 1 se 254; chaar interfaces tak track; recommended gap kam se kam 40. Prisma SD-WAN HA ko PAN-OS firewall HA se confuse mat karo (uske apne HA ports aur pair rules hain), aur active/active ka claim mat karo.</p></div>
<div class="scn"><h4>Woh failover jo hua hi nahi</h4><p>Ek store mein active ION ka internet circuit gir gaya, par standby ne takeover nahi kiya, isliye card payments sirf slow MPLS par gaye. Review mein priorities 120 aur 100 aur tracking reduction 10 mili. Circuit down hone par bhi active device ki priority zyada rahi. Unhone priorities 200 aur 100 aur reduction 120 kiya, phir circuit nikaal kar test kiya. Failover expected window mein hua.</p><p><b>Seekh:</b> arithmetic design karo, phir screen par bharosa karne ki jagah plug nikaal kar failure test karo.</p></div>
<div class="iv"><p class="q">"Prisma SD-WAN branch ke liye HA kaise kaam karta hai, aur uski limits kya hain?"</p><p>Active/backup HA group mein do IONs, priority 1 se 254, optional preempt, aur HA control interface LAN switch VLAN par. Physical interface state aur WAN reachability track karne se active priority kam hoti hai aur switch force hota hai. Limits: har group mein do devices, chaar tak tracked interfaces, aur BGP private WANs aur shared circuits par savdhani. Physical models par bypass pairs fail-to-wire jodte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen layers: link failover (policy), device HA (HA group), interface bypass (fail-to-wire).</li>
<li>HA group: max do IONs, active/backup, priority 1 se 254, kam se kam 40 ka gap, chaar tak tracked interfaces.</li>
<li>Tracking reductions priority gap se bade hone chahiye warna failover fire nahi hoga.</li>
<li>HA control interface LAN switch VLAN par rehti hai; LAN address dono IONs par identical hota hai.</li>
<li>Bypass pairs physical branch IONs ke liye hain; jo failure survive karna hai uske hisaab se model chuno.</li>
</ul></div>
`}};export{e as default};