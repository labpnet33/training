var e={id:`carrier-outage`,h:{en:`Carrier outage handling (lab vs-circuit-outage)`,hi:`Carrier outage handling (lab vs-circuit-outage)`},body:{en:`
<p>Think of a city with three roads to the airport. One road is closed by a flood. Drivers do not stop travelling; they take another road. The traffic police still has three jobs: tell the road authority exactly which road is closed and where (evidence), confirm that traffic really is flowing on the other roads (continuity), and reopen the lane to normal traffic when the road is repaired (failback). An SD-WAN carrier outage is the same. Delhi (Branch1) has three circuits: Internet, MPLS and LTE. When the Internet carrier suffers a fibre cut, the site should keep working over MPLS and LTE, and your job is to prove that and to give the carrier clean evidence.</p>

<h3>The incident in the lab</h3>
<p>Lab <b>vs-circuit-outage</b>: the Delhi Internet circuit (vni-0/0, 203.0.113.4/30, carrier 203.0.113.5, branch 203.0.113.6) has failed upstream. The carrier confirms a fibre cut. You must (1) collect the tunnel table and WAN interface details, (2) prove Delhi PC1 still reaches Bengaluru PC2, and (3) confirm that the voice policy still selects a healthy transport.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Delhi outage">
<rect x="20" y="85" width="120" height="60" rx="8" fill="#bae6fd"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="13">Branch1 Delhi</text><text x="80" y="130" text-anchor="middle" class="svg-muted" font-size="12">site-id 101</text>
<rect x="260" y="15" width="110" height="46" rx="8" fill="#fecaca"/><text x="315" y="42" text-anchor="middle" class="svg-ink" font-size="13">INET (cut)</text>
<rect x="260" y="92" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="315" y="119" text-anchor="middle" class="svg-ink" font-size="13">MPLS</text>
<rect x="260" y="168" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="315" y="195" text-anchor="middle" class="svg-ink" font-size="13">LTE</text>
<rect x="500" y="85" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="560" y="112" text-anchor="middle" class="svg-ink" font-size="13">Controller, DC,</text><text x="560" y="130" text-anchor="middle" class="svg-ink" font-size="13">Bengaluru</text>
<line x1="140" y1="100" x2="260" y2="40" stroke="#ef4444" stroke-width="3" stroke-dasharray="6 5"/><line x1="140" y1="115" x2="260" y2="115" stroke="#64748b" stroke-width="3"/><line x1="140" y1="130" x2="260" y2="190" stroke="#64748b" stroke-width="3"/>
<line x1="370" y1="115" x2="500" y2="115" stroke="#64748b" stroke-width="3"/><line x1="370" y1="40" x2="500" y2="100" stroke="#ef4444" stroke-width="2" stroke-dasharray="6 5"/><line x1="370" y1="190" x2="500" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="195" y="52" class="svg-accent" font-size="12">tunnel down</text>
</svg><p class="cap">The Internet path is cut; MPLS and LTE tunnels carry Delhi's traffic. The overlay stays Established.</p></div>

<h3>Step 1: collect evidence for the carrier</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 101   Hostname: Branch1
Controller: 198.51.100.20 (CTL)   Overlay (MP-BGP): Established
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    <span class="hl">down</span>    <span class="hl">circuit down (provider fault)</span>
MPLS       vni-0/1    up      -
LTE        vni-0/2    up      -

admin@Branch1-cli&gt; show orgs org Acme sd-wan wan-interfaces
Interface  Transport  Oper  Address              Circuit (latency/jitter/loss)
vni-0/0    Internet   up    203.0.113.6/30       30 ms / 6 ms / 0.3 %
vni-0/1    MPLS       up    172.31.1.2/30        20 ms / 2 ms / 0.05 %
vni-0/2    LTE        up    100.64.1.2/30        60 ms / 15 ms / 1 %</pre>
<p>Read the two outputs together. The <b>interface is up</b> (the cable and the CPE port are fine) but the <b>tunnel is down with reason circuit down (provider fault)</b>. That combination tells you the fault is beyond your demarcation, in the carrier network. In this course model the circuit line still shows nominal values for the down circuit; on real equipment you would see failed probes or no measurements.</p>
<p>A good carrier ticket contains: customer and organization (Acme), site (Delhi, Branch1), circuit identifier and WAN address (203.0.113.6/30, carrier gateway 203.0.113.5), the exact start time with <b>time zone</b>, symptoms (tunnel down, interface up, gateway not answering), what you already ruled out (CPE interface, address, route), the impact (redundant transports carrying traffic), and your contact. Add <code>ping 203.0.113.5</code> output if it fails.</p>

<h3>Step 2: prove continuity</h3>
<p>The tunnel table says MPLS and LTE are up, but users care about service. Prove it from the user's side: <code>ping 10.1.2.10</code> from PC1 (Delhi) to PC2 (Bengaluru).</p>
<pre class="out">PC1&gt; ping 10.1.2.10
PING 10.1.2.10 56 data bytes
64 bytes from 10.1.2.10: icmp_seq=1 ttl=63 time=<span class="hl">80.0</span> ms
64 bytes from 10.1.2.10: icmp_seq=2 ttl=63 time=80.0 ms
64 bytes from 10.1.2.10: icmp_seq=3 ttl=63 time=80.0 ms
64 bytes from 10.1.2.10: icmp_seq=4 ttl=63 time=80.0 ms
--- 10.1.2.10 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss</pre>
<p>The round trip is about 80 ms in the course model because both branches now use their best remaining transport (MPLS at 20 ms one way, so 2 x (20 + 20)). The PC output format is similar to the branch ping. This works because the LAN prefixes are carried by the MP-BGP session, which stays Established while at least one tunnel is up.</p>

<h3>Step 3: confirm the voice policy</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application voice
Application: voice
Result: forward via MPLS
Rule: R-VOICE  Forwarding profile: VOICE-FP  SLA profile: VOICE
Reason: First transport in the priority list that is up and meets the SLA
(Learning-model helper: shows what the policy would choose now.)</pre>
<p>VOICE-FP has priority MPLS, Internet and fallback allow. MPLS is first and healthy (20 ms, 2 ms, 0.05 percent against 150, 30, 1), so the outage of Internet changes nothing for voice. If MPLS were the failed circuit, voice would move to Internet, and with Internet also failing, LTE (60 ms, 15 ms, 1 percent) is borderline: loss of exactly 1 percent still meets the limit of 1 percent, and with fallback allow the best available path would be used even if no transport met the SLA.</p>
<div class="eg"><p><b>Worked example.</b> Impact statement: "Delhi lost 1 of 3 transports at 10:42 IST. Remaining capacity MPLS plus LTE. Voice remains on MPLS (policy R-VOICE). Business impact: none; redundancy reduced; if MPLS fails next, voice uses LTE at 60 ms. Carrier ticket opened 10:50." A manager reads this and relaxes; an engineer reads it and sees the remaining risk.</p></div>

<h3>Failback</h3>
<p>When the carrier repairs the fibre, the Internet tunnel rebuilds and the table returns to three tunnels up. Verify (<code>show orgs org Acme sd-wan brief</code> shows all up), check SLA monitor for stable values for some minutes before you trust it (a flapping circuit is worse than a down one), and record the restoration time for the carrier SLA credit. Do not change the policy during the outage "to help": the policy already did its job.</p>

<div class="warn"><p><b>Common mistakes.</b> Opening the carrier ticket without the time and the circuit identifier; rebooting the CPE; changing policy or routes during the outage; declaring "all good" because the overlay is Established without testing a service; forgetting the follow-up to confirm failback.</p></div>
<div class="exam"><p><b>Exam trap.</b> Overlay Established does not mean all transports are up; it means at least one is. Read the per-transport rows. Also, an interface that is up with a tunnel that is down points at the carrier or beyond, not at the CPE port.</p></div>

<div class="scn"><h4>Fibre cut on a Friday evening</h4><p>A branch with two circuits lost its primary at 19:10. The monitoring raised a warning only. The engineer confirmed from the tunnel table that the second circuit carried the overlay, tested a ping from a user PC, checked that the voice rule had moved to the healthy path, and opened the carrier ticket with timestamps and the carrier-side gateway address. Nobody was called at night. On Monday the credit request used the same evidence.</p><p><b>Lesson:</b> with redundancy, an outage becomes a ticket, not an emergency, if you can prove continuity.</p></div>

<div class="iv"><p class="q">"A branch's primary circuit goes down. What do you do?"</p><p>Collect tunnel and WAN interface evidence, identify that the interface is up and the tunnel is down with a provider fault, open a carrier ticket with times and identifiers, prove continuity with a user-side test, confirm the policy selects a healthy path, then verify failback and record the outage window.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Interface up with tunnel down and reason circuit down points to the carrier.</li>
<li>A carrier ticket needs identifiers, time with zone, symptoms and what you ruled out.</li>
<li>Prove continuity from a PC, not only from the tunnel table.</li>
<li>The path-selection result shows whether voice still has a healthy transport.</li>
<li>Do not change policy during an outage that the policy already handles; verify failback afterwards.</li>
</ul></div>
`,hi:`
<p>Socho ek shehar se airport tak teen roads hain. Ek road flood se band ho gayi. Drivers safar band nahi karte; wo doosri road lete hain. Traffic police ke phir bhi teen kaam hain: road authority ko exactly batana kaunsi road band hai aur kahan (evidence), confirm karna ki doosri roads par traffic sach mein chal raha hai (continuity), aur repair ke baad lane ko normal traffic ke liye wapas kholna (failback). SD-WAN carrier outage bilkul aisa hi hai. Delhi (Branch1) ke teen circuits hain: Internet, MPLS aur LTE. Internet carrier ka fibre cut ho to site ko MPLS aur LTE par chalte rehna chahiye, aur aapka kaam ye prove karna aur carrier ko clean evidence dena hai.</p>

<h3>Lab mein incident</h3>
<p>Lab <b>vs-circuit-outage</b>: Delhi ka Internet circuit (vni-0/0, 203.0.113.4/30, carrier 203.0.113.5, branch 203.0.113.6) upstream fail ho gaya hai. Carrier fibre cut confirm karta hai. Aapko (1) tunnel table aur WAN interface details collect karni hain, (2) prove karna hai ki Delhi PC1 ab bhi Bengaluru PC2 tak pahunchta hai, aur (3) confirm karna hai ki voice policy ab bhi healthy transport chunti hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Delhi outage">
<rect x="20" y="85" width="120" height="60" rx="8" fill="#bae6fd"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="13">Branch1 Delhi</text><text x="80" y="130" text-anchor="middle" class="svg-muted" font-size="12">site-id 101</text>
<rect x="260" y="15" width="110" height="46" rx="8" fill="#fecaca"/><text x="315" y="42" text-anchor="middle" class="svg-ink" font-size="13">INET (cut)</text>
<rect x="260" y="92" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="315" y="119" text-anchor="middle" class="svg-ink" font-size="13">MPLS</text>
<rect x="260" y="168" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="315" y="195" text-anchor="middle" class="svg-ink" font-size="13">LTE</text>
<rect x="500" y="85" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="560" y="112" text-anchor="middle" class="svg-ink" font-size="13">Controller, DC,</text><text x="560" y="130" text-anchor="middle" class="svg-ink" font-size="13">Bengaluru</text>
<line x1="140" y1="100" x2="260" y2="40" stroke="#ef4444" stroke-width="3" stroke-dasharray="6 5"/><line x1="140" y1="115" x2="260" y2="115" stroke="#64748b" stroke-width="3"/><line x1="140" y1="130" x2="260" y2="190" stroke="#64748b" stroke-width="3"/>
<line x1="370" y1="115" x2="500" y2="115" stroke="#64748b" stroke-width="3"/><line x1="370" y1="40" x2="500" y2="100" stroke="#ef4444" stroke-width="2" stroke-dasharray="6 5"/><line x1="370" y1="190" x2="500" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="195" y="52" class="svg-accent" font-size="12">tunnel down</text>
</svg><p class="cap">Internet path cut hai; MPLS aur LTE tunnels Delhi ka traffic le jate hain. Overlay Established rehta hai.</p></div>

<h3>Step 1: carrier ke liye evidence collect karo</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 101   Hostname: Branch1
Controller: 198.51.100.20 (CTL)   Overlay (MP-BGP): Established
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    <span class="hl">down</span>    <span class="hl">circuit down (provider fault)</span>
MPLS       vni-0/1    up      -
LTE        vni-0/2    up      -

admin@Branch1-cli&gt; show orgs org Acme sd-wan wan-interfaces
Interface  Transport  Oper  Address              Circuit (latency/jitter/loss)
vni-0/0    Internet   up    203.0.113.6/30       30 ms / 6 ms / 0.3 %
vni-0/1    MPLS       up    172.31.1.2/30        20 ms / 2 ms / 0.05 %
vni-0/2    LTE        up    100.64.1.2/30        60 ms / 15 ms / 1 %</pre>
<p>Dono outputs ek saath padho. <b>Interface up hai</b> (cable aur CPE port theek hain) lekin <b>tunnel down hai reason circuit down (provider fault) ke saath</b>. Ye combination batata hai ki fault aapke demarcation ke paar, carrier network mein hai. Is course model mein down circuit ki circuit line abhi bhi nominal values dikhati hai; real equipment par failed probes ya koi measurement nahi dikhega.</p>
<p>Achhe carrier ticket mein hota hai: customer aur organization (Acme), site (Delhi, Branch1), circuit identifier aur WAN address (203.0.113.6/30, carrier gateway 203.0.113.5), exact start time <b>time zone</b> ke saath, symptoms (tunnel down, interface up, gateway answer nahi kar raha), aap ne kya rule out kiya (CPE interface, address, route), impact (redundant transports traffic le rahe hain), aur aapka contact. Fail ho to <code>ping 203.0.113.5</code> ka output jodo.</p>

<h3>Step 2: continuity prove karo</h3>
<p>Tunnel table kehti hai MPLS aur LTE up hain, lekin users ko service chahiye. User ki taraf se prove karo: PC1 (Delhi) se PC2 (Bengaluru) tak <code>ping 10.1.2.10</code>.</p>
<pre class="out">PC1&gt; ping 10.1.2.10
PING 10.1.2.10 56 data bytes
64 bytes from 10.1.2.10: icmp_seq=1 ttl=63 time=<span class="hl">80.0</span> ms
64 bytes from 10.1.2.10: icmp_seq=2 ttl=63 time=80.0 ms
64 bytes from 10.1.2.10: icmp_seq=3 ttl=63 time=80.0 ms
64 bytes from 10.1.2.10: icmp_seq=4 ttl=63 time=80.0 ms
--- 10.1.2.10 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss</pre>
<p>Course model mein round trip lagbhag 80 ms hai kyunki dono branches ab apna best bacha hua transport use karte hain (MPLS 20 ms one way, yani 2 x (20 + 20)). PC output ka format branch ping jaisa hi hai. Ye isliye chalta hai kyunki LAN prefixes MP-BGP session carry karta hai, jo kam se kam ek tunnel up hone tak Established rehta hai.</p>

<h3>Step 3: voice policy confirm karo</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan path-selection application voice
Application: voice
Result: forward via MPLS
Rule: R-VOICE  Forwarding profile: VOICE-FP  SLA profile: VOICE
Reason: First transport in the priority list that is up and meets the SLA
(Learning-model helper: shows what the policy would choose now.)</pre>
<p>VOICE-FP ki priority MPLS, Internet hai aur fallback allow. MPLS pehla hai aur healthy (20 ms, 2 ms, 0.05 percent, limits 150, 30, 1 ke against), isliye Internet ke outage se voice ko koi farak nahi padta. MPLS fail circuit hota to voice Internet par jati, aur Internet bhi fail ho to LTE (60 ms, 15 ms, 1 percent) borderline hai: exactly 1 percent loss limit 1 percent ko meet karta hai, aur fallback allow ke saath koi bhi transport SLA meet na kare to bhi best available path use hota.</p>
<div class="eg"><p><b>Worked example.</b> Impact statement: "Delhi ne 10:42 IST par 3 mein se 1 transport khoya. Bacha capacity MPLS plus LTE. Voice MPLS par hai (policy R-VOICE). Business impact: none; redundancy kam hui; MPLS bhi fail hua to voice LTE par 60 ms se chalegi. Carrier ticket 10:50 par khola." Manager padhke relax hota hai; engineer padhke bacha hua risk dekhta hai.</p></div>

<h3>Failback</h3>
<p>Carrier fibre repair kare to Internet tunnel dobara bante hi table wapas teen tunnels up dikhati hai. Verify karo (<code>show orgs org Acme sd-wan brief</code> mein sab up), kuch minute SLA monitor ke stable values dekho tab bharosa karo (flapping circuit down circuit se bura hai), aur carrier SLA credit ke liye restoration time record karo. Outage ke dauran "madad ke liye" policy mat badlo: policy apna kaam kar chuki hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Time aur circuit identifier ke bina carrier ticket kholna; CPE reboot karna; outage mein policy ya routes badalna; service test kiye bina sirf overlay Established dekhkar "all good" kehna; failback confirm karne ka follow-up bhool jana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Overlay Established ka matlab ye nahi ki saare transports up hain; matlab kam se kam ek up hai. Per-transport rows padho. Ye bhi: interface up aur tunnel down ho to carrier ya uske aage ki taraf ishara hai, CPE port ki taraf nahi.</p></div>

<div class="scn"><h4>Friday shaam fibre cut</h4><p>Do circuits wali branch ka primary 19:10 par gaya. Monitoring ne sirf warning di. Engineer ne tunnel table se confirm kiya ki doosra circuit overlay carry kar raha hai, user PC se ping test kiya, check kiya ki voice rule healthy path par chala gaya hai, aur timestamps aur carrier-side gateway address ke saath carrier ticket khola. Raat ko kisi ko call nahi hua. Monday ko credit request mein wahi evidence use hua.</p><p><b>Lesson:</b> redundancy ke saath outage emergency nahi, ticket ban jata hai, agar aap continuity prove kar sako.</p></div>

<div class="iv"><p class="q">"Branch ka primary circuit down ho gaya. Aap kya karoge?"</p><p>Tunnel aur WAN interface evidence collect karo, pehchano ki interface up hai aur tunnel provider fault ke saath down hai, times aur identifiers ke saath carrier ticket kholo, user-side test se continuity prove karo, confirm karo ki policy healthy path chun rahi hai, phir failback verify karo aur outage window record karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Interface up, tunnel down aur reason circuit down carrier ki taraf ishara karte hain.</li>
<li>Carrier ticket ko identifiers, zone ke saath time, symptoms aur rule-out ki list chahiye.</li>
<li>Continuity PC se prove karo, sirf tunnel table se nahi.</li>
<li>Path-selection result batata hai ki voice ke paas healthy transport hai ya nahi.</li>
<li>Jo outage policy khud handle karti hai usme policy mat badlo; baad mein failback verify karo.</li>
</ul></div>
`}};export{e as default};