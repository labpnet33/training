var e={id:`requirements`,h:{en:`Requirements and design rules for a failover pair`,hi:`Failover pair ki requirements aur design rules`},body:{en:`
<p>A relay race only works if both runners use the same kind of baton and run on the same track. If one runner expects a baton and the other hands over a ball, the change-over fails even though both are fit. A failover pair is the same: the standby can only take over if it can run <b>exactly</b> the configuration and state of the active unit. That is why the ASA checks a list of requirements before two units agree to become a pair, and why a good design protects the links between them.</p>

<h3>What must match on both units</h3>
<table class="cmp"><tr><th>Requirement</th><th>Why it matters</th><th>What you see if it does not match</th></tr>
<tr><td><b>Same model</b> (for example two ASAv, two ASA 5516-X, two Secure Firewall 3110)</td><td>The configuration names interfaces and resources that must exist on the peer</td><td>The pair does not form; the mate is reported incompatible</td></tr>
<tr><td><b>Same number and types of interfaces</b> and the same modules</td><td>Replicated interface commands must apply 1:1</td><td>Configuration replication errors, interfaces missing on the standby</td></tr>
<tr><td><b>Same software version</b></td><td>State and configuration formats must be understood by both</td><td>Allowed temporarily only during a supported zero-downtime upgrade (chapter 10)</td></tr>
<tr><td><b>Same firewall mode</b> (routed or transparent)</td><td>Forwarding logic is completely different</td><td>Log <code>%ASA-1-105044 (Secondary) Mate operational mode ... is not compatible with my mode ...</code></td></tr>
<tr><td><b>Same context mode</b> (single or multiple)</td><td>Configuration structure differs</td><td>The pair does not form</td></tr>
<tr><td><b>Licences</b> that permit failover and matching feature entitlements</td><td>Features like contexts or strong encryption must be available on whichever unit is active</td><td>Failover disabled or features missing after a switchover</td></tr>
<tr><td>Same RAM and flash (recommended)</td><td>The standby must hold the same tables and images</td><td>Standby runs out of memory during bulk sync</td></tr></table>
<p>Licensing details vary by platform: older ASA 5500-X base licences restricted failover, while newer Smart-Licensed platforms treat the pair as one and share entitlements. The exam point is simple: both units need a licence state that allows failover, and features must be available after a switchover.</p>

<h3>What does not need to be configured on the secondary</h3>
<p>Almost nothing. The secondary only needs the <b>bootstrap</b> failover commands (unit role, failover interface, its addresses, the key and <code>failover</code>) and the failover interfaces enabled. Everything else (hostname, interfaces, NAT, access rules, routes) arrives from the active unit by replication. In lab 1, ASA2 starts from factory state for exactly this reason.</p>

<h3>Designing the failover and state links</h3>
<p>These links are the nervous system of the pair. If they fail at the wrong moment, the units can lose track of each other. Follow these rules:</p>
<ul>
<li><b>Dedicated interfaces.</b> Never share the failover link with user traffic. On busy firewalls give the state link its own interface too.</li>
<li><b>Direct cable or isolated switch VLAN.</b> A direct cable is simple, but when it fails you cannot tell which unit's port failed. A switch in the middle lets you see which side went down; if you use one, put the ports in their own VLAN with no other devices, enable PortFast and keep the path free of anything that could filter or delay hellos.</li>
<li><b>Redundancy for the link itself.</b> Newer releases allow an <b>EtherChannel</b> as the failover link, so a single cable or port failure does not break unit communication.</li>
<li><b>Speed and latency.</b> The state link should be at least as fast as the fastest data interface in use; keep latency low (under about 10 ms, and never near the supported maximum of 250 ms) so state updates keep up.</li>
<li><b>No shared fate.</b> Do not run the failover link, the state link and the data interfaces through one switch or one cable tray without redundancy. If everything goes down together, both units can decide to be active ("split brain").</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Good and bad failover link design">
<text x="160" y="24" text-anchor="middle" class="svg-accent" font-size="13">Good: dedicated and independent</text>
<rect x="40" y="40" width="90" height="40" rx="8" fill="#bae6fd"/><text x="85" y="65" text-anchor="middle" class="svg-ink" font-size="13">ASA1</text>
<rect x="190" y="40" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="235" y="65" text-anchor="middle" class="svg-ink" font-size="13">ASA2</text>
<line x1="130" y1="52" x2="190" y2="52" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><line x1="130" y1="70" x2="190" y2="70" stroke="#64748b" stroke-width="3"/>
<text x="160" y="105" text-anchor="middle" class="svg-muted" font-size="12">FOLINK and STATELINK cables</text>
<rect x="40" y="130" width="240" height="36" rx="8" fill="#bbf7d0"/><text x="160" y="153" text-anchor="middle" class="svg-ink" font-size="12">data via SW-IN / SW-OUT</text>
<text x="480" y="24" text-anchor="middle" class="svg-accent" font-size="13">Risky: one switch carries everything</text>
<rect x="360" y="40" width="90" height="40" rx="8" fill="#bae6fd"/><text x="405" y="65" text-anchor="middle" class="svg-ink" font-size="13">ASA1</text>
<rect x="510" y="40" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="555" y="65" text-anchor="middle" class="svg-ink" font-size="13">ASA2</text>
<rect x="430" y="140" width="100" height="40" rx="8" fill="#fed7aa"/><text x="480" y="165" text-anchor="middle" class="svg-ink" font-size="13">one switch</text>
<line x1="405" y1="80" x2="460" y2="140" stroke="#64748b" stroke-width="2"/><line x1="555" y1="80" x2="500" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="480" y="210" text-anchor="middle" class="svg-muted" font-size="12">switch reboots: both units may go active</text>
</svg><p class="cap">Keep the failover and state links independent from the data path, or make every piece redundant.</p></div>

<h3>Protecting failover traffic</h3>
<p>Configuration replication sends your whole running configuration, including local passwords and VPN pre-shared keys, across the failover link. Without protection it travels in clear text. Always configure one of:</p>
<pre class="code"><span class="c">! shared secret: authenticates and encrypts failover messages</span>
failover key NKfo2026
<span class="c">! or, on newer releases, an IPsec tunnel between the failover interfaces</span>
failover ipsec pre-shared-key NKfo2026-ipsec</pre>
<p>The key must be identical on both units and it is case-sensitive. It is shown as <code>*****</code> in the running configuration, so you cannot compare it by eye: if in doubt, re-enter it on both units. Lab 3 contains exactly this fault.</p>

<div class="eg"><p><b>Worked example: sizing the state link.</b> An ASA handles 80 000 concurrent connections and about 3 000 new connections per second at peak, on 1 Gbps data interfaces. Each new or closed connection, and many state changes, generate a state update. The data interfaces are 1 Gbps, so the rule of thumb says the state link should be 1 Gbps too, on its own port. The designer uses Gi0/4 for STATELINK and Gi0/5 for FOLINK, exactly like the lab, so a burst of state updates can never delay a hello.</p></div>

<h3>Standby addresses everywhere</h3>
<p>Give every data interface (and the management interface) a <b>standby address</b> from the same subnet. Without it you cannot manage the standby on that network and, as chapter 7 shows, the units cannot test that interface, which is reported as <code>Normal (Waiting)</code>.</p>

<div class="warn"><p><b>Common mistake.</b> Ordering a "matching" second unit that has a different interface module or a different software train. The units will not pair or will pair with missing interfaces. Check model, modules and <code>show version</code> before the change window, not during it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Expect lists of requirements: same model, same interfaces, same software version, same firewall mode, same context mode, compatible licences. Also remember that without a failover key the configuration (with its secrets) crosses the failover link in clear text.</p></div>

<div class="scn"><h4>Split brain after a switch reload</h4><p>A company cabled FOLINK, STATELINK and both data interfaces of its ASA pair through one small access switch to save ports. During a firmware update the switch rebooted. Each ASA lost the failover link and every monitored interface at the same moment; the secondary could not hear the primary anywhere and became active while the primary was still active. When the switch returned, both units owned 203.0.113.2 and the ISP router flapped between two MACs until the pair renegotiated. The engineer moved the failover and state links to direct cables and added the switch to the change calendar as a dependency.</p><p><b>Lesson:</b> the links that decide who is active must not share fate with everything else.</p></div>

<div class="iv"><p class="q">"What are the prerequisites for configuring ASA failover?"</p><p>Strong answer: two units of the same model with the same number and type of interfaces and modules, the same software version (except during a supported upgrade), the same firewall mode and context mode, and licences that allow failover with matching features. Then design: dedicated failover link and ideally a dedicated state link sized like the data interfaces, low latency, a failover key or IPsec to protect replication, and standby addresses on all data interfaces. Mention avoiding shared fate to prevent split brain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Match model, interfaces and modules, software version, firewall mode, context mode and licences.</li>
<li>The secondary needs only bootstrap failover commands; everything else is replicated.</li>
<li>Failover and state links: dedicated, fast, low latency, ideally redundant, never sharing fate with data.</li>
<li>Always set <code>failover key</code> (or IPsec) so replicated secrets are not sent in clear text.</li>
<li>Configure a standby address on every data interface.</li>
</ul></div>
`,hi:`
<p>Relay race tabhi chalti hai jab dono runners ek jaisa baton use karein aur ek hi track par dauden. Agar ek runner baton expect kare aur doosra ball pakda de, to change-over fail ho jaata hai chahe dono fit hon. Failover pair bhi aisa hi hai: standby tabhi take over kar sakta hai jab woh active unit ki configuration aur state <b>bilkul</b> waise hi chala sake. Isiliye do units pair banne ke liye maanne se pehle ASA requirements ki ek list check karta hai, aur isiliye achha design unke beech ke links ko bachata hai.</p>

<h3>Dono units par kya match hona chahiye</h3>
<table class="cmp"><tr><th>Requirement</th><th>Kyun zaroori hai</th><th>Match na ho to kya dikhta hai</th></tr>
<tr><td><b>Same model</b> (jaise do ASAv, do ASA 5516-X, do Secure Firewall 3110)</td><td>Configuration un interfaces aur resources ke naam leti hai jo peer par exist karne chahiye</td><td>Pair nahi banta; mate incompatible report hota hai</td></tr>
<tr><td><b>Same number aur types ke interfaces</b> aur same modules</td><td>Replicate hui interface commands 1:1 apply honi chahiye</td><td>Configuration replication errors, standby par interfaces missing</td></tr>
<tr><td><b>Same software version</b></td><td>State aur configuration formats dono ko samajh aane chahiye</td><td>Sirf supported zero-downtime upgrade ke dauraan temporarily allowed (chapter 10)</td></tr>
<tr><td><b>Same firewall mode</b> (routed ya transparent)</td><td>Forwarding logic bilkul alag hai</td><td>Log <code>%ASA-1-105044 (Secondary) Mate operational mode ... is not compatible with my mode ...</code></td></tr>
<tr><td><b>Same context mode</b> (single ya multiple)</td><td>Configuration structure alag hai</td><td>Pair nahi banta</td></tr>
<tr><td><b>Licences</b> jo failover allow karein aur matching feature entitlements</td><td>Contexts ya strong encryption jaise features us unit par available hone chahiye jo bhi active ho</td><td>Failover disabled ya switchover ke baad features missing</td></tr>
<tr><td>Same RAM aur flash (recommended)</td><td>Standby ko same tables aur images rakhni hoti hain</td><td>Bulk sync ke dauraan standby ki memory khatam</td></tr></table>
<p>Licensing details platform ke hisaab se badalti hain: purane ASA 5500-X base licences failover restrict karte the, jabki naye Smart-Licensed platforms pair ko ek maante hain aur entitlements share karte hain. Exam point simple hai: dono units ki licence state failover allow kare, aur switchover ke baad features available hon.</p>

<h3>Secondary par kya configure nahi karna padta</h3>
<p>Lagbhag kuch nahi. Secondary ko sirf <b>bootstrap</b> failover commands chahiye (unit role, failover interface, uske addresses, key aur <code>failover</code>) aur failover interfaces enabled. Baaki sab (hostname, interfaces, NAT, access rules, routes) active unit se replication se aata hai. Lab 1 mein ASA2 isi wajah se factory state se shuru hota hai.</p>

<h3>Failover aur state links design karna</h3>
<p>Yeh links pair ka nervous system hain. Agar galat samay par fail hon, to units ek doosre ki khabar kho sakte hain. Yeh rules follow karo:</p>
<ul>
<li><b>Dedicated interfaces.</b> Failover link ko kabhi user traffic ke saath share mat karo. Busy firewalls par state link ko bhi apna interface do.</li>
<li><b>Direct cable ya isolated switch VLAN.</b> Direct cable simple hai, lekin fail ho to aap nahi bata sakte ki kis unit ka port fail hua. Beech mein switch se dikhta hai ki kaunsi side gayi; use karo to ports ko apne VLAN mein rakho jismein koi aur device na ho, PortFast enable karo aur path ko aisi cheez se khaali rakho jo hellos ko filter ya delay kare.</li>
<li><b>Link ke liye khud redundancy.</b> Naye releases failover link ke roop mein <b>EtherChannel</b> allow karte hain, taaki ek cable ya port failure unit communication na tode.</li>
<li><b>Speed aur latency.</b> State link kam se kam use ho rahe sabse tez data interface jitna tez hona chahiye; latency kam rakho (lagbhag 10 ms se kam, aur supported maximum 250 ms ke paas kabhi nahi) taaki state updates peeche na rahein.</li>
<li><b>Shared fate nahi.</b> Failover link, state link aur data interfaces ko bina redundancy ke ek switch ya ek cable tray se mat le jao. Agar sab ek saath gaya, to dono units active banne ka faisla kar sakte hain ("split brain").</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Good and bad failover link design">
<text x="160" y="24" text-anchor="middle" class="svg-accent" font-size="13">Achha: dedicated aur independent</text>
<rect x="40" y="40" width="90" height="40" rx="8" fill="#bae6fd"/><text x="85" y="65" text-anchor="middle" class="svg-ink" font-size="13">ASA1</text>
<rect x="190" y="40" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="235" y="65" text-anchor="middle" class="svg-ink" font-size="13">ASA2</text>
<line x1="130" y1="52" x2="190" y2="52" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><line x1="130" y1="70" x2="190" y2="70" stroke="#64748b" stroke-width="3"/>
<text x="160" y="105" text-anchor="middle" class="svg-muted" font-size="12">FOLINK aur STATELINK cables</text>
<rect x="40" y="130" width="240" height="36" rx="8" fill="#bbf7d0"/><text x="160" y="153" text-anchor="middle" class="svg-ink" font-size="12">data SW-IN / SW-OUT se</text>
<text x="480" y="24" text-anchor="middle" class="svg-accent" font-size="13">Risky: ek switch sab le jaata hai</text>
<rect x="360" y="40" width="90" height="40" rx="8" fill="#bae6fd"/><text x="405" y="65" text-anchor="middle" class="svg-ink" font-size="13">ASA1</text>
<rect x="510" y="40" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="555" y="65" text-anchor="middle" class="svg-ink" font-size="13">ASA2</text>
<rect x="430" y="140" width="100" height="40" rx="8" fill="#fed7aa"/><text x="480" y="165" text-anchor="middle" class="svg-ink" font-size="13">ek switch</text>
<line x1="405" y1="80" x2="460" y2="140" stroke="#64748b" stroke-width="2"/><line x1="555" y1="80" x2="500" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="480" y="210" text-anchor="middle" class="svg-muted" font-size="12">switch reboot: dono units active ho sakte hain</text>
</svg><p class="cap">Failover aur state links ko data path se independent rakho, ya har piece ko redundant banao.</p></div>

<h3>Failover traffic ko protect karna</h3>
<p>Configuration replication aapki poori running configuration, local passwords aur VPN pre-shared keys ke saath, failover link par bhejta hai. Bina protection ke yeh clear text mein jaati hai. Hamesha inmein se ek configure karo:</p>
<pre class="code"><span class="c">! shared secret: failover messages ko authenticate aur encrypt karta hai</span>
failover key NKfo2026
<span class="c">! ya, naye releases par, failover interfaces ke beech IPsec tunnel</span>
failover ipsec pre-shared-key NKfo2026-ipsec</pre>
<p>Key dono units par identical honi chahiye aur case-sensitive hai. Running configuration mein yeh <code>*****</code> dikhti hai, isliye aankh se compare nahi kar sakte: shak ho to dono units par dobara daalo. Lab 3 mein bilkul yahi fault hai.</p>

<div class="eg"><p><b>Worked example: state link ka size.</b> Ek ASA 80 000 concurrent connections aur peak par lagbhag 3 000 naye connections per second handle karta hai, 1 Gbps data interfaces par. Har naya ya band hua connection, aur kai state changes, ek state update banate hain. Data interfaces 1 Gbps hain, isliye rule of thumb kehta hai state link bhi 1 Gbps ho, apne port par. Designer STATELINK ke liye Gi0/4 aur FOLINK ke liye Gi0/5 use karta hai, bilkul lab ki tarah, taaki state updates ka burst kabhi hello ko delay na kare.</p></div>

<h3>Har jagah standby addresses</h3>
<p>Har data interface (aur management interface) ko same subnet se ek <b>standby address</b> do. Iske bina aap us network par standby manage nahi kar sakte aur, jaisa chapter 7 dikhata hai, units us interface ko test nahi kar sakte, jo <code>Normal (Waiting)</code> report hota hai.</p>

<div class="warn"><p><b>Common galti.</b> Ek "matching" doosra unit order karna jiska interface module ya software train alag ho. Units pair nahi banenge ya missing interfaces ke saath banenge. Model, modules aur <code>show version</code> change window se pehle check karo, uske dauraan nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Requirements ki lists expect karo: same model, same interfaces, same software version, same firewall mode, same context mode, compatible licences. Yeh bhi yaad rakho ki failover key ke bina configuration (apne secrets ke saath) failover link par clear text mein jaati hai.</p></div>

<div class="scn"><h4>Switch reload ke baad split brain</h4><p>Ek company ne ports bachane ke liye apne ASA pair ke FOLINK, STATELINK aur dono data interfaces ek chhote access switch se cable kiye. Firmware update ke dauraan switch reboot hua. Har ASA ne ek hi pal mein failover link aur har monitored interface kho diya; secondary ko primary kahin sunai nahi diya aur woh active ban gaya jabki primary abhi bhi active tha. Switch wapas aaya to dono units 203.0.113.2 ke maalik the aur ISP router do MACs ke beech flap karta raha jab tak pair ne renegotiate nahi kiya. Engineer ne failover aur state links ko direct cables par shift kiya aur switch ko change calendar mein dependency ki tarah joda.</p><p><b>Seekh:</b> jo links tay karte hain ki active kaun hai, unki kismat baaki sab ke saath nahi judni chahiye.</p></div>

<div class="iv"><p class="q">"ASA failover configure karne ke prerequisites kya hain?"</p><p>Strong answer: same model ke do units jinke interfaces aur modules ka number aur type same ho, same software version (supported upgrade ke alawa), same firewall mode aur context mode, aur licences jo matching features ke saath failover allow karein. Phir design: dedicated failover link aur ideally data interfaces jitna bada dedicated state link, kam latency, replication protect karne ke liye failover key ya IPsec, aur saare data interfaces par standby addresses. Split brain se bachne ke liye shared fate avoid karne ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Model, interfaces aur modules, software version, firewall mode, context mode aur licences match karo.</li>
<li>Secondary ko sirf bootstrap failover commands chahiye; baaki sab replicate hota hai.</li>
<li>Failover aur state links: dedicated, tez, kam latency, ideally redundant, data ke saath kabhi shared fate nahi.</li>
<li>Hamesha <code>failover key</code> (ya IPsec) set karo taaki replicate hue secrets clear text mein na jaayein.</li>
<li>Har data interface par standby address configure karo.</li>
</ul></div>
`}};export{e as default};