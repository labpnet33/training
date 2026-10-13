var e={id:`ssm-bidir`,h:{en:`PIM SSM and bidirectional PIM`,hi:`PIM SSM aur bidirectional PIM`},body:{en:`
<p>Sparse mode is a compromise that suits "a few sources, many receivers, sources unknown in advance". Two variants remove parts of it for special cases. If receivers already <b>know the source</b>, like a TV viewer who knows the broadcaster, you can drop the RP entirely: that is <b>Source-Specific Multicast (SSM)</b>. If <b>everybody is a source and a receiver</b>, like a conference call, you can drop the source trees and keep one two-way shared tree: that is <b>bidirectional PIM</b>.</p>

<h3>PIM Source-Specific Multicast (SSM)</h3>
<p>In SSM a receiver subscribes to a <b>channel</b>, which is an (S,G) pair rather than just a group. The receiver's IGMPv3 report says INCLUDE {S} for group G, and the last-hop router immediately sends an <b>(S,G) join straight toward S</b>. There is:</p>
<ul>
<li><b>No RP</b>, so no RP discovery, no single point of failure, and nothing to misconfigure.</li>
<li><b>No shared tree, no registers, no SPT switchover.</b> Only source trees.</li>
<li><b>No (*,G) state</b> for SSM groups.</li>
<li>Built-in protection: a host that did not ask for a source never receives it, so a rogue sender to the same group cannot inject traffic.</li>
</ul>
<p>SSM uses the <b>232.0.0.0/8</b> range by default. Requirements: PIM sparse mode on every interface in the path, <b>IGMPv3</b> on the receiver LAN, and the SSM range enabled on the routers.</p>
<pre class="code"><span class="c">! All routers</span>
ip multicast-routing
ip pim ssm default                          <span class="c">! 232.0.0.0/8 is SSM</span>
<span class="c">! or a custom range: ip pim ssm range 30 (standard ACL)</span>
<span class="c">! Last-hop router, receiver LAN</span>
interface GigabitEthernet0/0
 ip pim sparse-mode
 ip igmp version 3</pre>
<pre class="out">R3# show ip mroute 232.1.1.1
<span class="hl">(10.1.1.10, 232.1.1.1), 00:02:10/00:02:49, flags: sTI</span>
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:02:10/00:02:49</pre>
<p>Flags: <b>s</b> = SSM group, <b>T</b> = on the source tree, <b>I</b> = source-specific host report received. There is no (*, 232.1.1.1) line. In the lab simulator a PC joins a channel with <code>join 232.1.1.1 source 10.1.1.10</code>.</p>
<p><b>What about IGMPv2-only hosts?</b> They cannot name a source. IOS offers <b>SSM mapping</b>: the router translates a v2 report for an SSM group into (S,G) using a static list or DNS.</p>
<pre class="code">ip igmp ssm-map enable
no ip igmp ssm-map query dns
access-list 11 permit 232.1.1.0 0.0.0.255
ip igmp ssm-map static 11 10.1.1.10         <span class="c">! v2 joins for 232.1.1.x mean source 10.1.1.10</span></pre>

<h3>Bidirectional PIM (bidir)</h3>
<p>Think of a trading floor or a video conference where 200 hosts both send and receive on the same group. Sparse mode would create up to 200 (S,G) entries per router, plus registers and SPT switchovers for each sender. Bidir PIM keeps <b>only (*,G)</b>:</p>
<ul>
<li>One shared tree rooted at the RP, and traffic flows <b>both up and down</b> it. A source's packets travel up toward the RP and are copied down every branch they pass, including branches before reaching the RP.</li>
<li><b>No registers and no source trees.</b> State is one entry per group, no matter how many senders.</li>
<li>The normal RPF check cannot work for traffic flowing up the tree, so each link elects a <b>Designated Forwarder (DF)</b>: the router with the best unicast route to the RP (lowest AD, then lowest metric, then highest IP). Only the DF forwards traffic from that link toward the RP and onto that link from above. This keeps the tree loop-free.</li>
<li>The RP does not even have to exist as a router interface: a <b>phantom RP</b> address in a routed subnet works, because traffic only needs to flow toward it.</li>
</ul>
<pre class="code"><span class="c">! All routers (older IOS needs ip pim bidir-enable first)</span>
ip pim bidir-enable
ip pim rp-address 2.2.2.2 40 bidir
access-list 40 permit 239.50.0.0 0.0.255.255</pre>
<pre class="out">R3# show ip mroute 239.50.50.50
<span class="hl">(*, 239.50.50.50), 00:03:11/-, RP 2.2.2.2, flags: B</span>
  Bidir-Upstream: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:03:11/00:02:48
    GigabitEthernet0/2, Bidir-Upstream/Sparse, 00:03:11/stopped

R3# show ip pim interface df
* implies this system is the DF
Interface                RP               DF Winner        Metric     Uptime
<span class="hl">GigabitEthernet0/0       2.2.2.2          *10.3.3.1        101        00:05:12</span>
GigabitEthernet0/2       2.2.2.2           10.0.23.2       0          00:05:12</pre>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="SSM versus bidir">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">SSM: (S,G) only, no RP</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">Bidir: (*,G) only, two-way</text>
<rect x="40" y="45" width="90" height="32" rx="6" fill="#bbf7d0"/><text x="85" y="66" text-anchor="middle" class="svg-ink" font-size="12">Source S</text>
<rect x="190" y="110" width="80" height="32" rx="6" fill="#bae6fd"/><text x="230" y="131" text-anchor="middle" class="svg-ink" font-size="12">LHR</text>
<rect x="190" y="185" width="100" height="32" rx="6" fill="#fde68a"/><text x="240" y="206" text-anchor="middle" class="svg-ink" font-size="11">IGMPv3 (S,G)</text>
<line x1="130" y1="65" x2="190" y2="120" stroke="#64748b" stroke-width="3"/><line x1="230" y1="142" x2="235" y2="185" stroke="#64748b" stroke-width="3"/>
<rect x="430" y="45" width="100" height="32" rx="6" fill="#ddd6fe"/><text x="480" y="66" text-anchor="middle" class="svg-ink" font-size="12">RP</text>
<rect x="350" y="120" width="80" height="32" rx="6" fill="#bae6fd"/><text x="390" y="141" text-anchor="middle" class="svg-ink" font-size="12">R-A (DF)</text>
<rect x="530" y="120" width="80" height="32" rx="6" fill="#bae6fd"/><text x="570" y="141" text-anchor="middle" class="svg-ink" font-size="12">R-B (DF)</text>
<rect x="340" y="190" width="100" height="30" rx="6" fill="#fde68a"/><text x="390" y="210" text-anchor="middle" class="svg-ink" font-size="11">send + receive</text>
<rect x="520" y="190" width="100" height="30" rx="6" fill="#fde68a"/><text x="570" y="210" text-anchor="middle" class="svg-ink" font-size="11">send + receive</text>
<line x1="390" y1="120" x2="455" y2="77" stroke="#64748b" stroke-width="3"/><line x1="570" y1="120" x2="505" y2="77" stroke="#64748b" stroke-width="3"/>
<line x1="390" y1="152" x2="390" y2="190" stroke="#64748b" stroke-width="3"/><line x1="570" y1="152" x2="570" y2="190" stroke="#64748b" stroke-width="3"/>
<text x="480" y="105" text-anchor="middle" class="svg-accent" font-size="11">up and down</text>
</svg><p class="cap">SSM removes the RP; bidir removes the source trees and lets traffic flow both ways on one shared tree.</p></div>

<table class="cmp">
<tr><th></th><th>PIM-SM</th><th>PIM SSM</th><th>Bidir PIM</th></tr>
<tr><td>RP needed</td><td>Yes</td><td>No</td><td>Yes (can be phantom)</td></tr>
<tr><td>State</td><td>(*,G) and (S,G)</td><td>(S,G) only</td><td>(*,G) only</td></tr>
<tr><td>Registers</td><td>Yes</td><td>No</td><td>No</td></tr>
<tr><td>Loop prevention</td><td>RPF</td><td>RPF</td><td>DF election per link</td></tr>
<tr><td>Best for</td><td>General one-to-many</td><td>One-to-many, known source (IPTV)</td><td>Many-to-many</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> An IPTV head-end with 300 channels, each from one known encoder. SSM: 300 (S,G) entries on the path, no RP. A trading application with 40 groups and 150 hosts that all publish: sparse mode could reach 40 x 150 = 6000 (S,G) entries per router; bidir keeps 40 (*,G) entries.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling SSM but leaving the receiver LAN on IGMPv2. The v2 report for 232.1.1.1 carries no source, the router cannot build (S,G) and, since SSM groups never use an RP, nothing is joined at all. Use IGMPv3 or SSM mapping.</p></div>

<div class="exam"><p><b>Exam trap.</b> SSM: 232/8, IGMPv3, (S,G) only, no RP, no MSDP needed. Bidir: (*,G) only, traffic flows up and down the shared tree, a <b>DF</b> is elected per link, no registers, good for many-to-many.</p></div>

<div class="scn"><h4>IPTV that ignored the RP outage</h4><p>A university ran IPTV in 232/8 with SSM and general campus multicast in 239/8 with PIM-SM. When the RP was rebooted for an upgrade, a lecture capture system in 239/8 went dark for new viewers, but every TV channel kept playing and new viewers could still tune in. SSM joins go straight to the source and never touch the RP. The team moved the lecture capture system to SSM as well.</p><p><b>Lesson:</b> SSM has no RP dependency; for one-to-many streams from known sources it is the most robust design.</p></div>

<div class="iv"><p class="q">"When would you use SSM, and when bidirectional PIM?"</p><p>Strong answer: SSM when receivers know the source, typically IPTV or content distribution: receivers send IGMPv3 INCLUDE reports, last-hop routers join (S,G) directly, no RP or shared tree exists, and the 232/8 range is used by default. Bidir for many-to-many applications like trading or conferencing: one (*,G) shared tree carries traffic both ways, a DF per link prevents loops, and state stays one entry per group however many senders there are.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSM: receivers subscribe to (S,G) with IGMPv3; no RP, no (*,G), default range 232/8 via <code>ip pim ssm default</code>.</li>
<li>IGMPv2 hosts need SSM mapping to use SSM.</li>
<li>Bidir: only (*,G); traffic flows up and down the shared tree; no registers or SPT.</li>
<li>Bidir uses a Designated Forwarder per link instead of the RPF check for upstream traffic.</li>
<li>Choose SSM for one-to-many with known sources, bidir for many-to-many.</li>
</ul></div>
`,hi:`
<p>Sparse mode ek samjhauta hai jo "kuch sources, kai receivers, sources pehle se pata nahi" ke liye theek hai. Do variants khaas cases ke liye iske hisse hata dete hain. Agar receivers ko <b>source pehle se pata</b> hai, jaise TV viewer jo broadcaster ko jaanta hai, to aap RP poori tarah hata sakte ho: yeh <b>Source-Specific Multicast (SSM)</b> hai. Agar <b>har koi source aur receiver dono</b> hai, jaise conference call, to aap source trees hata kar ek do-taraf shared tree rakh sakte ho: yeh <b>bidirectional PIM</b> hai.</p>

<h3>PIM Source-Specific Multicast (SSM)</h3>
<p>SSM mein receiver ek <b>channel</b> subscribe karta hai, jo sirf group nahi balki (S,G) pair hai. Receiver ki IGMPv3 report group G ke liye INCLUDE {S} kehti hai, aur last-hop router turant <b>seedha S ki taraf (S,G) join</b> bhejta hai. Isme:</p>
<ul>
<li><b>Koi RP nahi</b>, isliye na RP discovery, na single point of failure, na misconfigure karne ko kuch.</li>
<li><b>Na shared tree, na registers, na SPT switchover.</b> Sirf source trees.</li>
<li>SSM groups ke liye <b>koi (*,G) state nahi</b>.</li>
<li>Built-in suraksha: jis host ne source nahi maanga use woh kabhi nahi milta, isliye same group par koi rogue sender traffic nahi ghusa sakta.</li>
</ul>
<p>SSM default mein <b>232.0.0.0/8</b> range use karta hai. Zaroorat: path ke har interface par PIM sparse mode, receiver LAN par <b>IGMPv3</b>, aur routers par SSM range enabled.</p>
<pre class="code"><span class="c">! Saare routers</span>
ip multicast-routing
ip pim ssm default                          <span class="c">! 232.0.0.0/8 SSM hai</span>
<span class="c">! ya custom range: ip pim ssm range 30 (standard ACL)</span>
<span class="c">! Last-hop router, receiver LAN</span>
interface GigabitEthernet0/0
 ip pim sparse-mode
 ip igmp version 3</pre>
<pre class="out">R3# show ip mroute 232.1.1.1
<span class="hl">(10.1.1.10, 232.1.1.1), 00:02:10/00:02:49, flags: sTI</span>
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:02:10/00:02:49</pre>
<p>Flags: <b>s</b> = SSM group, <b>T</b> = source tree par, <b>I</b> = source-specific host report mili. Koi (*, 232.1.1.1) line nahi hai. Lab simulator mein PC <code>join 232.1.1.1 source 10.1.1.10</code> se channel join karta hai.</p>
<p><b>Sirf IGMPv2 wale hosts ka kya?</b> Woh source ka naam nahi le sakte. IOS <b>SSM mapping</b> deta hai: router SSM group ki v2 report ko static list ya DNS se (S,G) mein translate karta hai.</p>
<pre class="code">ip igmp ssm-map enable
no ip igmp ssm-map query dns
access-list 11 permit 232.1.1.0 0.0.0.255
ip igmp ssm-map static 11 10.1.1.10         <span class="c">! 232.1.1.x ke v2 joins ka matlab source 10.1.1.10</span></pre>

<h3>Bidirectional PIM (bidir)</h3>
<p>Ek trading floor ya video conference socho jahan 200 hosts same group par bhejte aur receive dono karte hain. Sparse mode har router mein 200 tak (S,G) entries banata, plus har sender ke liye registers aur SPT switchovers. Bidir PIM <b>sirf (*,G)</b> rakhta hai:</p>
<ul>
<li>RP par rooted ek shared tree, aur traffic us par <b>upar aur neeche dono</b> behta hai. Source ke packets RP ki taraf upar jaate hain aur raste mein har shaakh par neeche copy hote hain, RP tak pahunchne se pehle wali shaakhon par bhi.</li>
<li><b>Na registers, na source trees.</b> State har group ki ek entry, chahe kitne bhi senders hon.</li>
<li>Tree par upar behne wale traffic ke liye normal RPF check kaam nahi kar sakta, isliye har link ek <b>Designated Forwarder (DF)</b> elect karta hai: RP tak sabse achha unicast route wala router (sabse kam AD, phir sabse kam metric, phir sabse bada IP). Sirf DF us link se RP ki taraf aur upar se us link par traffic forward karta hai. Isse tree loop-free rehta hai.</li>
<li>RP ka router interface ki tarah exist karna bhi zaroori nahi: routed subnet mein <b>phantom RP</b> address kaam karta hai, kyunki traffic ko bas uski taraf behna hai.</li>
</ul>
<pre class="code"><span class="c">! Saare routers (purane IOS ko pehle ip pim bidir-enable chahiye)</span>
ip pim bidir-enable
ip pim rp-address 2.2.2.2 40 bidir
access-list 40 permit 239.50.0.0 0.0.255.255</pre>
<pre class="out">R3# show ip mroute 239.50.50.50
<span class="hl">(*, 239.50.50.50), 00:03:11/-, RP 2.2.2.2, flags: B</span>
  Bidir-Upstream: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:03:11/00:02:48
    GigabitEthernet0/2, Bidir-Upstream/Sparse, 00:03:11/stopped

R3# show ip pim interface df
* implies this system is the DF
Interface                RP               DF Winner        Metric     Uptime
<span class="hl">GigabitEthernet0/0       2.2.2.2          *10.3.3.1        101        00:05:12</span>
GigabitEthernet0/2       2.2.2.2           10.0.23.2       0          00:05:12</pre>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="SSM versus bidir">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">SSM: sirf (S,G), koi RP nahi</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">Bidir: sirf (*,G), do-taraf</text>
<rect x="40" y="45" width="90" height="32" rx="6" fill="#bbf7d0"/><text x="85" y="66" text-anchor="middle" class="svg-ink" font-size="12">Source S</text>
<rect x="190" y="110" width="80" height="32" rx="6" fill="#bae6fd"/><text x="230" y="131" text-anchor="middle" class="svg-ink" font-size="12">LHR</text>
<rect x="190" y="185" width="100" height="32" rx="6" fill="#fde68a"/><text x="240" y="206" text-anchor="middle" class="svg-ink" font-size="11">IGMPv3 (S,G)</text>
<line x1="130" y1="65" x2="190" y2="120" stroke="#64748b" stroke-width="3"/><line x1="230" y1="142" x2="235" y2="185" stroke="#64748b" stroke-width="3"/>
<rect x="430" y="45" width="100" height="32" rx="6" fill="#ddd6fe"/><text x="480" y="66" text-anchor="middle" class="svg-ink" font-size="12">RP</text>
<rect x="350" y="120" width="80" height="32" rx="6" fill="#bae6fd"/><text x="390" y="141" text-anchor="middle" class="svg-ink" font-size="12">R-A (DF)</text>
<rect x="530" y="120" width="80" height="32" rx="6" fill="#bae6fd"/><text x="570" y="141" text-anchor="middle" class="svg-ink" font-size="12">R-B (DF)</text>
<rect x="340" y="190" width="100" height="30" rx="6" fill="#fde68a"/><text x="390" y="210" text-anchor="middle" class="svg-ink" font-size="11">bhejo + pao</text>
<rect x="520" y="190" width="100" height="30" rx="6" fill="#fde68a"/><text x="570" y="210" text-anchor="middle" class="svg-ink" font-size="11">bhejo + pao</text>
<line x1="390" y1="120" x2="455" y2="77" stroke="#64748b" stroke-width="3"/><line x1="570" y1="120" x2="505" y2="77" stroke="#64748b" stroke-width="3"/>
<line x1="390" y1="152" x2="390" y2="190" stroke="#64748b" stroke-width="3"/><line x1="570" y1="152" x2="570" y2="190" stroke="#64748b" stroke-width="3"/>
<text x="480" y="105" text-anchor="middle" class="svg-accent" font-size="11">upar aur neeche</text>
</svg><p class="cap">SSM RP hata deta hai; bidir source trees hata deta hai aur ek shared tree par traffic ko dono taraf behne deta hai.</p></div>

<table class="cmp">
<tr><th></th><th>PIM-SM</th><th>PIM SSM</th><th>Bidir PIM</th></tr>
<tr><td>RP chahiye</td><td>Haan</td><td>Nahi</td><td>Haan (phantom ho sakta hai)</td></tr>
<tr><td>State</td><td>(*,G) aur (S,G)</td><td>Sirf (S,G)</td><td>Sirf (*,G)</td></tr>
<tr><td>Registers</td><td>Haan</td><td>Nahi</td><td>Nahi</td></tr>
<tr><td>Loop prevention</td><td>RPF</td><td>RPF</td><td>Har link par DF election</td></tr>
<tr><td>Sabse achha</td><td>General one-to-many</td><td>One-to-many, jaana-pehchana source (IPTV)</td><td>Many-to-many</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> 300 channels wala IPTV head-end, har channel ek jaane-pehchane encoder se. SSM: path par 300 (S,G) entries, koi RP nahi. 40 groups aur 150 hosts wali trading application jahan sab publish karte hain: sparse mode har router mein 40 x 150 = 6000 (S,G) entries tak pahunch sakta hai; bidir 40 (*,G) entries rakhta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> SSM enable karna par receiver LAN ko IGMPv2 par chhod dena. 232.1.1.1 ki v2 report mein source nahi hota, router (S,G) nahi bana sakta aur, kyunki SSM groups kabhi RP use nahi karte, kuch bhi join nahi hota. IGMPv3 ya SSM mapping use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> SSM: 232/8, IGMPv3, sirf (S,G), koi RP nahi, MSDP ki zaroorat nahi. Bidir: sirf (*,G), traffic shared tree par upar neeche behta hai, har link par <b>DF</b> elect hota hai, koi registers nahi, many-to-many ke liye achha.</p></div>

<div class="scn"><h4>IPTV jisne RP outage ko ignore kiya</h4><p>Ek university 232/8 mein SSM ke saath IPTV aur 239/8 mein PIM-SM ke saath general campus multicast chalati thi. Upgrade ke liye RP reboot hua to 239/8 wala lecture capture system naye viewers ke liye band ho gaya, par har TV channel chalta raha aur naye viewers ab bhi tune kar sakte the. SSM joins seedhe source tak jaate hain aur RP ko kabhi chhoote nahi. Team ne lecture capture system bhi SSM par shift kar diya.</p><p><b>Seekh:</b> SSM ki koi RP dependency nahi; jaane-pehchane sources se one-to-many streams ke liye yeh sabse robust design hai.</p></div>

<div class="iv"><p class="q">"SSM kab use karoge, aur bidirectional PIM kab?"</p><p>Strong answer: SSM tab jab receivers ko source pata ho, typically IPTV ya content distribution: receivers IGMPv3 INCLUDE reports bhejte hain, last-hop routers seedha (S,G) join karte hain, koi RP ya shared tree nahi hota, aur default mein 232/8 range use hoti hai. Bidir trading ya conferencing jaisi many-to-many applications ke liye: ek (*,G) shared tree dono taraf traffic le jaata hai, har link par DF loops rokta hai, aur state har group ki ek entry rehti hai chahe kitne bhi senders hon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSM: receivers IGMPv3 se (S,G) subscribe karte hain; koi RP nahi, koi (*,G) nahi, <code>ip pim ssm default</code> se default range 232/8.</li>
<li>IGMPv2 hosts ko SSM use karne ke liye SSM mapping chahiye.</li>
<li>Bidir: sirf (*,G); traffic shared tree par upar neeche behta hai; na registers na SPT.</li>
<li>Bidir upstream traffic ke liye RPF check ki jagah har link par Designated Forwarder use karta hai.</li>
<li>Jaane-pehchane sources wale one-to-many ke liye SSM, many-to-many ke liye bidir chuno.</li>
</ul></div>
`}};export{e as default};