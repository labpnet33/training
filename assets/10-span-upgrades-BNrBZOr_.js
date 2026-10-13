var e={id:`span-upgrades`,h:{en:`SPAN, RSPAN and ERSPAN, plus ISSU and upgrade planning`,hi:`SPAN, RSPAN aur ERSPAN, saath mein ISSU aur upgrade planning`},body:{en:`
<p>When a doctor cannot explain a symptom from the patient's description, they order a scan to see inside. <b>SPAN</b> (Switched Port Analyzer) is the network engineer's scan: the switch copies the packets of a port or VLAN to another port where a packet analyzer, IDS or capture appliance is listening, so you can see exactly what goes over the wire. In the second half of this chapter we look at the other big operational task, keeping NX-OS up to date without surprises.</p>

<h3>Local SPAN on NX-OS (Lab 3)</h3>
<p>A SPAN <b>session</b> has <b>sources</b> (interfaces, port-channels or VLANs, each with direction <code>rx</code>, <code>tx</code> or <code>both</code>) and a <b>destination</b>. On NX-OS the destination must be a Layer 2 port in <b>monitor mode</b>, and new sessions are created shut.</p>
<pre class="code">LEAF1(config)# monitor session 1
LEAF1(config-monitor)# source interface Ethernet1/5 both
LEAF1(config-monitor)# destination interface Ethernet1/7
LEAF1(config-monitor)# no shut
LEAF1(config-monitor)# end
LEAF1# show monitor session 1</pre>
<pre class="out">   session 1
---------------
type              : local
<span class="hl">state             : down (Dst in wrong mode)</span>
source intf       :
    rx            : Eth1/5
    tx            : Eth1/5
    both          : Eth1/5
filter VLANs      : filter not specified
destination ports : Eth1/7</pre>
<p>The session is configured and not shut, yet it is down. The reason in brackets tells you why: Ethernet1/7 is still a normal switchport. Put it in monitor mode:</p>
<pre class="code">LEAF1(config)# interface Ethernet1/7
LEAF1(config-if)# switchport
LEAF1(config-if)# switchport monitor</pre>
<pre class="out">LEAF1# show monitor session 1 | include state
<span class="hl">state             : up</span></pre>
<p>A monitor-mode port stops forwarding and learning normal traffic; it only transmits copies. Now generate traffic (SRV1 pings SRV2) and capture on the analyzer:</p>
<pre class="out">ANALYZER&gt; tcpdump -i eth0
10:41:02.113 ARP, Request who-has 172.16.10.12 tell 172.16.10.11
<span class="hl">10:41:02.115 IP 172.16.10.11 &gt; 172.16.10.12: ICMP echo request, id 1, seq 1</span>
10:41:02.116 IP 172.16.10.12 &gt; 172.16.10.11: ICMP echo reply, id 1, seq 1</pre>
<p>Because the source direction is <code>both</code>, you see requests (received on Ethernet1/5) and replies (sent out of Ethernet1/5). The echo requests come from <b>172.16.10.11</b>, SRV1. When the capture is finished in production, remove the session with <code>no monitor session 1</code> and return the port to normal.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Local SPAN and ERSPAN">
<rect x="10" y="20" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="13">SRV1 Eth1/5</text>
<rect x="170" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="230" y="45" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text>
<rect x="340" y="20" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="405" y="45" text-anchor="middle" class="svg-ink" font-size="13">ANALYZER Eth1/7</text>
<line x1="120" y1="40" x2="170" y2="40" stroke="#64748b" stroke-width="2"/><line x1="290" y1="40" x2="340" y2="40" stroke="#64748b" stroke-width="2"/>
<text x="560" y="45" text-anchor="middle" class="svg-accent" font-size="13">Local SPAN</text>
<rect x="10" y="120" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="65" y="145" text-anchor="middle" class="svg-ink" font-size="13">Source leaf</text>
<rect x="170" y="120" width="180" height="40" rx="8" fill="#fde68a"/><text x="260" y="145" text-anchor="middle" class="svg-ink" font-size="13">routed fabric (GRE)</text>
<rect x="400" y="120" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="460" y="145" text-anchor="middle" class="svg-ink" font-size="13">Analyzer IP</text>
<line x1="120" y1="140" x2="170" y2="140" stroke="#64748b" stroke-width="2"/><line x1="350" y1="140" x2="400" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="580" y="145" text-anchor="middle" class="svg-accent" font-size="13">ERSPAN</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Local SPAN: same switch. ERSPAN: copies wrapped in GRE and routed anywhere.</text>
</svg><p class="cap">Local SPAN needs the analyzer on the same switch; ERSPAN sends copies across a routed network.</p></div>

<h3>RSPAN and ERSPAN</h3>
<p><b>RSPAN</b> (remote SPAN) carries copies across a dedicated remote-SPAN VLAN between switches. It is a Layer 2, Catalyst-era technique; Nexus 9000 does not support it, and in routed spine-leaf fabrics it would not cross the Layer 3 links anyway. <b>ERSPAN</b> (Encapsulated Remote SPAN) wraps the copies in <b>GRE</b> and routes them to an IP address, so the analyzer can sit anywhere in the network.</p>
<pre class="code">monitor erspan origin ip-address 10.255.0.21 global
monitor session 2 type erspan-source
  erspan-id 20
  vrf default
  destination ip 192.0.2.80
  source interface Ethernet1/5 both
  no shut</pre>
<p>The receiver can be a capture appliance that understands ERSPAN, or another switch with an <code>erspan-destination</code> session that decapsulates the copies onto a local port. Remember the extra header bytes: copies of full-size frames become larger than the original.</p>

<div class="warn"><p><b>Common mistakes with SPAN.</b> Destination not in <code>switchport monitor</code> mode ("Dst in wrong mode"). Forgetting <code>no shut</code> ("Session admin shut"). Oversubscription: mirroring <code>both</code> directions of a busy 10G port into a 10G destination can need 20 Gbps, so copies are dropped (the production traffic is not affected). Leaving old sessions configured, which uses the limited number of active sessions the hardware supports.</p></div>

<h3>Upgrades: ISSU and planning</h3>
<p>NX-OS upgrades fix bugs and security vulnerabilities and add features, but they are also one of the riskiest routine changes. <b>ISSU</b> (In-Service Software Upgrade) upgrades without disrupting the data plane where the platform and the version pair support it; otherwise the upgrade is <b>disruptive</b> (the switch reloads). The tool tells you which before you start:</p>
<pre class="code">LEAF1# show incompatibility-all nxos bootflash:nxos64-cs.10.4.3.F.bin
LEAF1# show install all impact nxos bootflash:nxos64-cs.10.4.3.F.bin</pre>
<pre class="out">Compatibility check is done:
Module  bootable          Impact  Install-type  Reason
------  --------  --------------  ------------  ------
<span class="hl">     1       yes      disruptive         reset  Incompatible image for ISSU</span>

Images will be upgraded according to following table:
Module   Image     Running-Version   New-Version   Upg-Required
     1   nxos      10.3(4a)          10.4(3)       yes</pre>
<p>The actual upgrade is <code>install all nxos bootflash:nxos64-cs.10.4.3.F.bin</code> (add <code>non-disruptive</code> to make it refuse anything that would reload). A good upgrade plan:</p>
<ol>
<li>Read the release notes and check the supported <b>upgrade path</b> (some jumps need an intermediate release).</li>
<li>Copy the image, check space with <code>dir bootflash:</code> and verify the image hash against the published value.</li>
<li>Run the incompatibility and impact checks; take a checkpoint and back up the configuration.</li>
<li>Drain traffic if needed, for example with <b>maintenance mode</b> (Graceful Insertion and Removal, <code>system mode maintenance</code>), which gracefully moves routing traffic away.</li>
<li>For a <b>vPC pair</b>, upgrade one peer, verify the vPC and all neighbors, then upgrade the other.</li>
<li>Post-checks against the pre-check snapshot; then return to normal mode.</li>
</ol>
<p><b>EPLD</b> (electronic programmable logic device) images update hardware logic on modules. They are separate from NX-OS, are needed only when the release notes say so, and are always disruptive (the module reloads): <code>install epld bootflash:n9000-epld.10.4.3.F.img module all</code>, verified with <code>show version module 1 epld</code>.</p>

<div class="eg"><p><b>Worked example.</b> A fabric has 20 leaves in 10 vPC pairs and 2 spines. The impact check shows disruptive upgrades. Each leaf takes about 20 minutes to reload and verify. Doing one member of every pair in a first window (10 leaves in parallel, about 30 minutes with checks) and the other members in a second window keeps every dual-homed server connected throughout. The spines go one at a time in maintenance mode, so the fabric always has one spine carrying traffic.</p></div>

<div class="exam"><p><b>Exam trap.</b> SPAN destination needs <code>switchport monitor</code>; sessions start shut. ERSPAN uses GRE and needs an origin IP. <code>show install all impact</code> predicts disruptive or non-disruptive; <code>install all</code> performs the upgrade; EPLD upgrades are separate and disruptive.</p></div>

<div class="scn"><h4>The capture that showed half a conversation</h4><p>A security team asked for a capture of a suspicious server on Ethernet1/12. The engineer configured <code>source interface Ethernet1/12 rx</code> and the analyst reported only inbound packets, no replies. The engineer changed the direction to <code>both</code>. The analyst then saw gaps, and <code>show interface</code> on the destination showed output discards: the server was sending about 7 Gbps and receiving 6, more than the 10G destination port could carry. The engineer added a VLAN filter to capture only the suspicious VLAN, the discards stopped, and the analyst got a complete capture.</p><p><b>Lesson:</b> choose the direction deliberately and size the destination for the copied traffic, or filter.</p></div>

<div class="iv"><p class="q">"Your SPAN session shows down. What do you check?"</p><p>Strong answer: read the reason in <code>show monitor session</code>. "Dst in wrong mode" means the destination is missing <code>switchport monitor</code>; "Session admin shut" means <code>no shut</code> is missing; also check the destination link is up, the source exists, and the platform limit on active sessions. Then mention direction (rx, tx, both), oversubscription, and ERSPAN when the analyzer is on another switch.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SPAN copies traffic from sources (rx, tx, both) to a destination in <code>switchport monitor</code> mode; sessions start shut.</li>
<li><code>show monitor session N</code> gives the state and the reason when it is down.</li>
<li>ERSPAN sends copies in GRE across a routed network; RSPAN is Layer 2 and not used on Nexus 9000.</li>
<li>Plan upgrades with <code>show incompatibility-all</code>, <code>show install all impact</code>, then <code>install all</code>.</li>
<li>Upgrade vPC peers one at a time; EPLD upgrades are separate and disruptive.</li>
</ul></div>
`,hi:`
<p>Jab doctor patient ke bataye lakshan se symptom samajh nahi paata, to woh andar dekhne ke liye scan karwata hai. <b>SPAN</b> (Switched Port Analyzer) network engineer ka scan hai: switch ek port ya VLAN ke packets ko dusre port par copy karta hai jahan packet analyzer, IDS ya capture appliance sun raha hota hai, taaki aap dekh sako ki wire par bilkul kya ja raha hai. Is chapter ke dusre hisse mein hum dusra bada operational kaam dekhenge: NX-OS ko bina surprises ke up to date rakhna.</p>

<h3>NX-OS par local SPAN (Lab 3)</h3>
<p>SPAN <b>session</b> ke <b>sources</b> hote hain (interfaces, port-channels ya VLANs, har ek direction <code>rx</code>, <code>tx</code> ya <code>both</code> ke saath) aur ek <b>destination</b>. NX-OS par destination <b>monitor mode</b> wala Layer 2 port hona chahiye, aur naye sessions shut bante hain.</p>
<pre class="code">LEAF1(config)# monitor session 1
LEAF1(config-monitor)# source interface Ethernet1/5 both
LEAF1(config-monitor)# destination interface Ethernet1/7
LEAF1(config-monitor)# no shut
LEAF1(config-monitor)# end
LEAF1# show monitor session 1</pre>
<pre class="out">   session 1
---------------
type              : local
<span class="hl">state             : down (Dst in wrong mode)</span>
source intf       :
    rx            : Eth1/5
    tx            : Eth1/5
    both          : Eth1/5
filter VLANs      : filter not specified
destination ports : Eth1/7</pre>
<p>Session configured hai aur shut nahi hai, phir bhi down hai. Brackets mein reason batata hai kyun: Ethernet1/7 ab bhi normal switchport hai. Use monitor mode mein daalo:</p>
<pre class="code">LEAF1(config)# interface Ethernet1/7
LEAF1(config-if)# switchport
LEAF1(config-if)# switchport monitor</pre>
<pre class="out">LEAF1# show monitor session 1 | include state
<span class="hl">state             : up</span></pre>
<p>Monitor-mode port normal traffic forward aur learn karna band kar deta hai; woh sirf copies transmit karta hai. Ab traffic generate karo (SRV1 SRV2 ko ping kare) aur analyzer par capture karo:</p>
<pre class="out">ANALYZER&gt; tcpdump -i eth0
10:41:02.113 ARP, Request who-has 172.16.10.12 tell 172.16.10.11
<span class="hl">10:41:02.115 IP 172.16.10.11 &gt; 172.16.10.12: ICMP echo request, id 1, seq 1</span>
10:41:02.116 IP 172.16.10.12 &gt; 172.16.10.11: ICMP echo reply, id 1, seq 1</pre>
<p>Kyunki source direction <code>both</code> hai, aapko requests (Ethernet1/5 par receive hue) aur replies (Ethernet1/5 se bheje gaye) dono dikhte hain. Echo requests <b>172.16.10.11</b>, yaani SRV1, se aati hain. Production mein capture khatam hone par <code>no monitor session 1</code> se session hatao aur port ko normal karo.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Local SPAN aur ERSPAN">
<rect x="10" y="20" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="13">SRV1 Eth1/5</text>
<rect x="170" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="230" y="45" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text>
<rect x="340" y="20" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="405" y="45" text-anchor="middle" class="svg-ink" font-size="13">ANALYZER Eth1/7</text>
<line x1="120" y1="40" x2="170" y2="40" stroke="#64748b" stroke-width="2"/><line x1="290" y1="40" x2="340" y2="40" stroke="#64748b" stroke-width="2"/>
<text x="560" y="45" text-anchor="middle" class="svg-accent" font-size="13">Local SPAN</text>
<rect x="10" y="120" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="65" y="145" text-anchor="middle" class="svg-ink" font-size="13">Source leaf</text>
<rect x="170" y="120" width="180" height="40" rx="8" fill="#fde68a"/><text x="260" y="145" text-anchor="middle" class="svg-ink" font-size="13">routed fabric (GRE)</text>
<rect x="400" y="120" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="460" y="145" text-anchor="middle" class="svg-ink" font-size="13">Analyzer IP</text>
<line x1="120" y1="140" x2="170" y2="140" stroke="#64748b" stroke-width="2"/><line x1="350" y1="140" x2="400" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="580" y="145" text-anchor="middle" class="svg-accent" font-size="13">ERSPAN</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Local SPAN: same switch. ERSPAN: copies GRE mein lipat kar kahin bhi route hoti hain.</text>
</svg><p class="cap">Local SPAN ke liye analyzer same switch par chahiye; ERSPAN copies routed network ke paar bhejta hai.</p></div>

<h3>RSPAN aur ERSPAN</h3>
<p><b>RSPAN</b> (remote SPAN) switches ke beech ek dedicated remote-SPAN VLAN par copies le jaata hai. Yeh Layer 2, Catalyst zamane ki technique hai; Nexus 9000 ise support nahi karta, aur routed spine-leaf fabrics mein yeh waise bhi Layer 3 links paar nahi karti. <b>ERSPAN</b> (Encapsulated Remote SPAN) copies ko <b>GRE</b> mein lapet kar ek IP address tak route karta hai, taaki analyzer network mein kahin bhi baith sake.</p>
<pre class="code">monitor erspan origin ip-address 10.255.0.21 global
monitor session 2 type erspan-source
  erspan-id 20
  vrf default
  destination ip 192.0.2.80
  source interface Ethernet1/5 both
  no shut</pre>
<p>Receiver ek capture appliance ho sakta hai jo ERSPAN samajhta ho, ya dusra switch jismein <code>erspan-destination</code> session ho jo copies ko decapsulate karke local port par daale. Extra header bytes yaad rakho: full-size frames ki copies original se badi ho jaati hain.</p>

<div class="warn"><p><b>SPAN ki common galtiyan.</b> Destination <code>switchport monitor</code> mode mein nahi ("Dst in wrong mode"). <code>no shut</code> bhool jaana ("Session admin shut"). Oversubscription: busy 10G port ki <code>both</code> directions ko 10G destination mein mirror karne ke liye 20 Gbps chahiye ho sakte hain, isliye copies drop hoti hain (production traffic par asar nahi padta). Purane sessions configured chhod dena, jo hardware ke support kiye gaye seemit active sessions kha jaate hain.</p></div>

<h3>Upgrades: ISSU aur planning</h3>
<p>NX-OS upgrades bugs aur security vulnerabilities fix karte hain aur features jodte hain, lekin yeh sabse risky routine changes mein se bhi hain. <b>ISSU</b> (In-Service Software Upgrade) data plane ko disrupt kiye bina upgrade karta hai jahan platform aur version pair support karein; warna upgrade <b>disruptive</b> hota hai (switch reload hota hai). Tool shuru karne se pehle batata hai kaunsa:</p>
<pre class="code">LEAF1# show incompatibility-all nxos bootflash:nxos64-cs.10.4.3.F.bin
LEAF1# show install all impact nxos bootflash:nxos64-cs.10.4.3.F.bin</pre>
<pre class="out">Compatibility check is done:
Module  bootable          Impact  Install-type  Reason
------  --------  --------------  ------------  ------
<span class="hl">     1       yes      disruptive         reset  Incompatible image for ISSU</span>

Images will be upgraded according to following table:
Module   Image     Running-Version   New-Version   Upg-Required
     1   nxos      10.3(4a)          10.4(3)       yes</pre>
<p>Asli upgrade <code>install all nxos bootflash:nxos64-cs.10.4.3.F.bin</code> hai (<code>non-disruptive</code> jodo taaki reload karne wali kisi bhi cheez ko mana kar de). Achha upgrade plan:</p>
<ol>
<li>Release notes padho aur supported <b>upgrade path</b> check karo (kuch jumps ko beech ki release chahiye).</li>
<li>Image copy karo, <code>dir bootflash:</code> se space check karo aur image hash ko published value se verify karo.</li>
<li>Incompatibility aur impact checks chalao; checkpoint lo aur configuration backup karo.</li>
<li>Zaroorat ho to traffic drain karo, jaise <b>maintenance mode</b> se (Graceful Insertion and Removal, <code>system mode maintenance</code>), jo routing traffic ko aaram se hata deta hai.</li>
<li><b>vPC pair</b> ke liye ek peer upgrade karo, vPC aur saare neighbors verify karo, phir dusra upgrade karo.</li>
<li>Pre-check snapshot ke against post-checks; phir normal mode par wapas.</li>
</ol>
<p><b>EPLD</b> (electronic programmable logic device) images modules par hardware logic update karti hain. Yeh NX-OS se alag hain, sirf tab chahiye jab release notes kahein, aur hamesha disruptive hoti hain (module reload hota hai): <code>install epld bootflash:n9000-epld.10.4.3.F.img module all</code>, <code>show version module 1 epld</code> se verify.</p>

<div class="eg"><p><b>Worked example.</b> Ek fabric mein 10 vPC pairs mein 20 leaves aur 2 spines hain. Impact check disruptive upgrades dikhata hai. Har leaf ko reload aur verify hone mein lagbhag 20 minute lagte hain. Pehli window mein har pair ka ek member (10 leaves parallel mein, checks ke saath lagbhag 30 minute) aur dusri window mein baaki members karne se har dual-homed server poore time connected rehta hai. Spines maintenance mode mein ek ek karke jaate hain, taaki fabric mein hamesha ek spine traffic uthaye.</p></div>

<div class="exam"><p><b>Exam trap.</b> SPAN destination ko <code>switchport monitor</code> chahiye; sessions shut shuru hote hain. ERSPAN GRE use karta hai aur origin IP chahiye. <code>show install all impact</code> disruptive ya non-disruptive predict karta hai; <code>install all</code> upgrade karta hai; EPLD upgrades alag aur disruptive hain.</p></div>

<div class="scn"><h4>Woh capture jisne aadhi baatcheet dikhayi</h4><p>Security team ne Ethernet1/12 par ek suspicious server ka capture maanga. Engineer ne <code>source interface Ethernet1/12 rx</code> configure kiya aur analyst ne sirf inbound packets report kiye, replies nahi. Engineer ne direction <code>both</code> kar di. Phir analyst ko gaps dikhe, aur destination par <code>show interface</code> ne output discards dikhaye: server lagbhag 7 Gbps bhej raha tha aur 6 receive kar raha tha, jo 10G destination port se zyada tha. Engineer ne sirf suspicious VLAN capture karne ke liye VLAN filter joda, discards ruk gaye, aur analyst ko poora capture mila.</p><p><b>Seekh:</b> direction soch samajh kar chuno aur destination ko copied traffic ke hisaab se size karo, ya filter karo.</p></div>

<div class="iv"><p class="q">"Aapka SPAN session down dikhata hai. Kya check karoge?"</p><p>Strong answer: <code>show monitor session</code> mein reason padho. "Dst in wrong mode" ka matlab destination par <code>switchport monitor</code> missing hai; "Session admin shut" ka matlab <code>no shut</code> missing hai; yeh bhi check karo ki destination link up hai, source exist karta hai, aur active sessions ki platform limit. Phir direction (rx, tx, both), oversubscription, aur analyzer dusre switch par ho to ERSPAN ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SPAN sources (rx, tx, both) se traffic ko <code>switchport monitor</code> mode wale destination par copy karta hai; sessions shut shuru hote hain.</li>
<li><code>show monitor session N</code> state aur down hone par reason deta hai.</li>
<li>ERSPAN copies ko GRE mein routed network ke paar bhejta hai; RSPAN Layer 2 hai aur Nexus 9000 par use nahi hota.</li>
<li>Upgrades ko <code>show incompatibility-all</code>, <code>show install all impact</code>, phir <code>install all</code> se plan karo.</li>
<li>vPC peers ek ek karke upgrade karo; EPLD upgrades alag aur disruptive hain.</li>
</ul></div>
`}};export{e as default};