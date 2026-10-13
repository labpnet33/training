var e={id:`voip-integration`,h:{en:`Integration: QoS marking, DHCP, 802.1X and snooping with phones`,hi:`Integration: QoS marking, DHCP, 802.1X aur snooping phones ke saath`},body:{en:`
<p>A working voice port is more than PoE plus a VLAN. Around it sit four services that decide call quality and security. This chapter is <b>conceptual</b>: the simulator does not model these features, so there is no captured output here, only configuration shown as configuration.</p>

<h3>1. Marking and queues: DSCP 46 and 802.1p 5</h3>
<p>Voice is sensitive to delay and jitter, not to bandwidth. A call needs roughly tens of kilobits per second but cannot wait behind a big file transfer. The phone marks its packets with <b>DSCP 46 (EF, Expedited Forwarding)</b> and the frames with <b>802.1p priority 5</b>. LLDP-MED network policy tells the phone these values (you saw "Priority: 5, DSCP: 46"). The switch must then <b>trust</b> the marking and place EF traffic in a strict or high-priority queue.</p>
<pre class="code">set class-of-service classifiers dscp VOICE-IN forwarding-class expedited-forwarding loss-priority low code-points ef
set class-of-service interfaces ge-0/0/1 unit 0 classifiers dscp VOICE-IN
set switch-options voip interface ge-0/0/1.0 forwarding-class expedited-forwarding</pre>
<p>Treat this as a reference sketch; exact CoS syntax differs by platform, and the exam tests the idea: mark at the edge, trust at the access port, prioritise in the queue.</p>

<h3>2. DHCP for the voice VLAN</h3>
<p>The phone, after learning its VLAN, sends DHCP in VOICE. The voice scope often carries a vendor option that gives the <b>call server address</b> or provisioning URL. The switch can act as the gateway and DHCP relay:</p>
<pre class="code">set forwarding-options dhcp-relay server-group CALLMGR 10.20.0.50
set forwarding-options dhcp-relay group VOICE-RELAY active-server-group CALLMGR
set forwarding-options dhcp-relay group VOICE-RELAY interface irb.20</pre>
<p>If the phone gets an address from the data scope instead, its voice VLAN never took effect: go back to LLDP-MED.</p>

<h3>3. 802.1X and the phone</h3>
<p>Phone and PC share one port, so 802.1X must authenticate <b>two devices</b>. The port uses <code>supplicant multiple</code> (or the phone is authenticated by MAC RADIUS while the PC uses EAP), and the RADIUS server returns the voice VLAN for the phone. Alternatively the phone is allowed through by a MAC-based rule and the PC authenticates by 802.1X. See the 802.1X module for the mechanics; the voice-specific point is that <b>LLDP and the voip statement still deliver the VLAN</b>, while 802.1X decides whether the device is permitted.</p>

<h3>4. DHCP snooping and the phone port</h3>
<p>On access ports <code>dhcp-security</code> (snooping) builds a binding table so rogue DHCP servers are blocked. Phone ports are untrusted: only the real DHCP server uplink is trusted. Without it, a user can plug a small router into the wall and hand out wrong gateways to phones.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Voice port services">
<rect x="30" y="70" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="85" y="105" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text>
<rect x="200" y="30" width="190" height="140" rx="10" fill="#bae6fd"/><text x="295" y="55" text-anchor="middle" class="svg-ink" font-size="13">Access port ge-0/0/1</text>
<text x="295" y="85" text-anchor="middle" class="svg-muted" font-size="12">PoE + LLDP-MED + voip</text>
<text x="295" y="108" text-anchor="middle" class="svg-muted" font-size="12">trust DSCP 46 to EF queue</text>
<text x="295" y="131" text-anchor="middle" class="svg-muted" font-size="12">802.1X multiple + snooping</text>
<rect x="470" y="70" width="140" height="60" rx="10" fill="#fde68a"/><text x="540" y="95" text-anchor="middle" class="svg-ink" font-size="13">DHCP and call</text><text x="540" y="113" text-anchor="middle" class="svg-ink" font-size="13">server (VOICE)</text>
<line x1="140" y1="100" x2="200" y2="100" stroke="#2563eb" stroke-width="2"/><line x1="390" y1="100" x2="470" y2="100" stroke="#2563eb" stroke-width="2"/>
</svg><p class="cap">Power, policy, priority, address and trust all live on the same edge port.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Marking at the phone but not trusting it at the switch, so EF is re-written to best effort. Putting voice in a queue shared with bulk data. No DHCP scope or relay in VOICE. Marking the whole PC VLAN as EF.</p></div>
<div class="exam"><p><b>Exam trap.</b> LLDP-MED advertises the marking; it does not enforce queueing. The switch CoS configuration decides which queue EF uses. DHCP snooping trusts the server-facing port, never the phone port.</p></div>

<div class="scn"><h4>Choppy calls only when backups run</h4><p>Calls sounded robotic every evening. The phones were correct (VLAN 20, DSCP 46) but the access-switch uplink treated all traffic as best effort, so the nightly backup filled the queue. Mapping EF to a priority queue on the uplink restored call quality without adding bandwidth.</p><p><b>Lesson:</b> QoS must be consistent end to end, or marking is worthless.</p></div>

<div class="iv"><p class="q">"A phone is in the right VLAN but calls are choppy. What do you check?"</p><p>I check that the phone marks DSCP 46, that the switch trusts the marking on the access port, and that EF is mapped to a priority queue on every hop, especially congested uplinks. VLAN membership is correct, so the problem is queueing, not connectivity.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Voice needs low delay: DSCP 46 (EF) and 802.1p 5, trusted and queued with priority.</li>
<li>The voice VLAN needs DHCP or relay and a reachable call server.</li>
<li>802.1X with a phone and PC needs multiple-supplicant or MAC RADIUS handling.</li>
<li>DHCP snooping: trust only the server uplink.</li>
<li>This chapter is conceptual; the lab does not simulate these.</li>
</ul></div>
`,hi:`
<p>Kaam karta voice port PoE aur VLAN se zyada hai. Uske aas paas chaar services call quality aur security tay karti hain. Yeh chapter <b>conceptual</b> hai: simulator in features ko model nahi karta, isliye yahan koi captured output nahi, sirf configuration, configuration ki tarah dikhayi gayi.</p>

<h3>1. Marking aur queues: DSCP 46 aur 802.1p 5</h3>
<p>Voice delay aur jitter se sensitive hai, bandwidth se nahi. Call ko kuch tens of kilobits per second chahiye par woh badi file transfer ke peeche wait nahi kar sakti. Phone apne packets ko <b>DSCP 46 (EF, Expedited Forwarding)</b> aur frames ko <b>802.1p priority 5</b> se mark karta hai. LLDP-MED network policy phone ko yeh values batati hai ("Priority: 5, DSCP: 46" aapne dekha). Switch ko phir marking par <b>trust</b> karna hai aur EF traffic ko strict ya high-priority queue mein daalna hai.</p>
<pre class="code">set class-of-service classifiers dscp VOICE-IN forwarding-class expedited-forwarding loss-priority low code-points ef
set class-of-service interfaces ge-0/0/1 unit 0 classifiers dscp VOICE-IN
set switch-options voip interface ge-0/0/1.0 forwarding-class expedited-forwarding</pre>
<p>Ise reference sketch samjho; exact CoS syntax platform ke hisaab se badalta hai, aur exam idea poochta hai: edge par mark karo, access port par trust karo, queue mein priority do.</p>

<h3>2. Voice VLAN ke liye DHCP</h3>
<p>Phone VLAN seekhne ke baad VOICE mein DHCP bhejta hai. Voice scope mein aksar vendor option hota hai jo <b>call server address</b> ya provisioning URL deta hai. Switch gateway aur DHCP relay ban sakta hai:</p>
<pre class="code">set forwarding-options dhcp-relay server-group CALLMGR 10.20.0.50
set forwarding-options dhcp-relay group VOICE-RELAY active-server-group CALLMGR
set forwarding-options dhcp-relay group VOICE-RELAY interface irb.20</pre>
<p>Phone ko address data scope se mile to uska voice VLAN lagu hi nahi hua: LLDP-MED par wapas jao.</p>

<h3>3. 802.1X aur phone</h3>
<p>Phone aur PC ek port share karte hain, isliye 802.1X ko <b>do devices</b> authenticate karne hote hain. Port <code>supplicant multiple</code> use karta hai (ya phone MAC RADIUS se authenticate hota hai aur PC EAP se), aur RADIUS server phone ke liye voice VLAN return karta hai. Ya phone MAC-based rule se allow hota hai aur PC 802.1X karta hai. Mechanics ke liye 802.1X module dekho; voice ka khaas point yeh hai ki <b>LLDP aur voip statement phir bhi VLAN dete hain</b>, jabki 802.1X tay karta hai ki device permitted hai ya nahi.</p>

<h3>4. DHCP snooping aur phone port</h3>
<p>Access ports par <code>dhcp-security</code> (snooping) binding table banata hai taaki rogue DHCP servers block hon. Phone ports untrusted hain: sirf asli DHCP server uplink trusted. Iske bina user wall mein chhota router lagakar phones ko galat gateway baant sakta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Voice port services">
<rect x="30" y="70" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="85" y="105" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text>
<rect x="200" y="30" width="190" height="140" rx="10" fill="#bae6fd"/><text x="295" y="55" text-anchor="middle" class="svg-ink" font-size="13">Access port ge-0/0/1</text>
<text x="295" y="85" text-anchor="middle" class="svg-muted" font-size="12">PoE + LLDP-MED + voip</text>
<text x="295" y="108" text-anchor="middle" class="svg-muted" font-size="12">DSCP 46 trust, EF queue</text>
<text x="295" y="131" text-anchor="middle" class="svg-muted" font-size="12">802.1X multiple + snooping</text>
<rect x="470" y="70" width="140" height="60" rx="10" fill="#fde68a"/><text x="540" y="95" text-anchor="middle" class="svg-ink" font-size="13">DHCP aur call</text><text x="540" y="113" text-anchor="middle" class="svg-ink" font-size="13">server (VOICE)</text>
<line x1="140" y1="100" x2="200" y2="100" stroke="#2563eb" stroke-width="2"/><line x1="390" y1="100" x2="470" y2="100" stroke="#2563eb" stroke-width="2"/>
</svg><p class="cap">Power, policy, priority, address aur trust sab ek hi edge port par.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Phone par mark karna par switch par trust na karna, jisse EF best effort ban jaata hai. Voice ko bulk data wali queue mein rakhna. VOICE mein DHCP scope ya relay nahi. Poore PC VLAN ko EF mark karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> LLDP-MED marking advertise karta hai; queueing enforce nahi karta. Switch CoS configuration tay karta hai ki EF kaunsi queue use kare. DHCP snooping server-facing port ko trust karta hai, phone port ko kabhi nahi.</p></div>

<div class="scn"><h4>Calls sirf backup ke time choppy</h4><p>Roz shaam calls robotic lagti thi. Phones sahi the (VLAN 20, DSCP 46) par access-switch uplink sab traffic best effort maanta tha, isliye raat ka backup queue bhar deta tha. Uplink par EF ko priority queue mein map karne se bandwidth badhaye bina call quality wapas aayi.</p><p><b>Lesson:</b> QoS end to end consistent ho, warna marking bekaar.</p></div>

<div class="iv"><p class="q">"Phone sahi VLAN mein hai par calls choppy hain. Kya check karoge?"</p><p>Main check karta hoon ki phone DSCP 46 mark karta hai, switch access port par marking trust karta hai, aur har hop par, khaaskar congested uplinks par, EF priority queue se map hai. VLAN membership sahi hai, isliye problem queueing ki hai, connectivity ki nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Voice ko kam delay chahiye: DSCP 46 (EF) aur 802.1p 5, trusted aur priority queue mein.</li>
<li>Voice VLAN ko DHCP ya relay aur reachable call server chahiye.</li>
<li>Phone aur PC ke saath 802.1X ko multiple-supplicant ya MAC RADIUS chahiye.</li>
<li>DHCP snooping: sirf server uplink trust karo.</li>
<li>Yeh chapter conceptual hai; lab ise simulate nahi karta.</li>
</ul></div>
`}};export{e as default};