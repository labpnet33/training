var e={id:`anycast-rp-msdp`,h:{en:`Anycast RP with MSDP: one address, two routers`,hi:`MSDP ke saath anycast RP: ek address, do routers`},body:{en:`
<p>Every method so far has a weakness: one RP is one point of failure, and Auto-RP or BSR only choose <i>one</i> RP per range at a time. When the RP dies, new receivers wait for timers and the dynamic protocol to re-converge, which can take minutes. <b>Anycast RP</b> removes that wait. Two (or more) routers are RPs at the same time, and routing sends each router to the nearest one.</p>

<h3>The idea: anycast</h3>
<p>Think of a pizza chain with the same helpline number in every city. You dial one number and the phone network connects you to the <i>nearest</i> outlet. If the Pune outlet is closed, the network connects you to Mumbai and you notice nothing. In anycast RP, the helpline number is an IP address, for example <code>10.255.255.100</code>, configured as a loopback on <b>both</b> RP routers. Every router uses it as the RP address. The IGP (OSPF) carries two routes to that /32, and each router follows the cheaper one.</p>

<h3>The problem it creates, and how MSDP solves it</h3>
<p>Now the sources and the receivers may be sent to <b>different</b> RPs. A studio in Mumbai registers with RP-A (the nearest). A viewer in Delhi joins RP-B (the nearest to Delhi). RP-B has a receiver but never heard of the source, so nothing arrives.</p>
<p><b>MSDP</b> (Multicast Source Discovery Protocol) fixes this. The two RPs form an MSDP peering over TCP (port 639). When an RP learns of a new source through a register, it sends a <b>Source-Active (SA)</b> message to its peer: "source 10.101.0.10 is sending to group 239.10.1.1 and I am the RP". The peer RP, if it has receivers for that group, joins towards the source and the stream flows. The SA messages are stored in an <b>SA cache</b>.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Anycast RP with MSDP">
<rect x="20" y="95" width="100" height="55" rx="8" fill="#bbf7d0"/><text x="70" y="119" text-anchor="middle" class="svg-ink" font-size="13">STUDIO</text><text x="70" y="137" text-anchor="middle" class="svg-muted" font-size="12">Mumbai</text>
<rect x="180" y="20" width="150" height="62" rx="8" fill="#fde68a"/><text x="255" y="42" text-anchor="middle" class="svg-ink" font-size="13">RP-A (R2)</text><text x="255" y="59" text-anchor="middle" class="svg-muted" font-size="12">lo0 2.2.2.2</text><text x="255" y="75" text-anchor="middle" class="svg-accent" font-size="12">lo1 10.255.255.100</text>
<rect x="400" y="20" width="150" height="62" rx="8" fill="#fde68a"/><text x="475" y="42" text-anchor="middle" class="svg-ink" font-size="13">RP-B (R4)</text><text x="475" y="59" text-anchor="middle" class="svg-muted" font-size="12">lo0 4.4.4.4</text><text x="475" y="75" text-anchor="middle" class="svg-accent" font-size="12">lo1 10.255.255.100</text>
<rect x="520" y="165" width="100" height="55" rx="8" fill="#bae6fd"/><text x="570" y="189" text-anchor="middle" class="svg-ink" font-size="13">VIEWER</text><text x="570" y="207" text-anchor="middle" class="svg-muted" font-size="12">Delhi</text>
<line x1="120" y1="115" x2="190" y2="75" stroke="#64748b" stroke-width="2"/><text x="85" y="85" class="svg-muted" font-size="12">register</text>
<line x1="330" y1="51" x2="400" y2="51" stroke="#64748b" stroke-width="3"/><text x="365" y="40" text-anchor="middle" class="svg-accent" font-size="12">MSDP SA</text>
<line x1="540" y1="82" x2="565" y2="165" stroke="#64748b" stroke-width="2"/><text x="590" y="130" class="svg-muted" font-size="12">(*,G) join</text>
</svg><p class="cap">The register lands on RP-A, the join lands on RP-B. The MSDP SA message connects them.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! R2 (RP-A) and R4 (RP-B): the shared anycast loopback</span>
interface Loopback1
 ip address 10.255.255.100 255.255.255.255
 ip pim sparse-mode
<span class="c">! all routers: the RP is the anycast address</span>
ip pim rp-address 10.255.255.100
<span class="c">! MSDP uses the UNIQUE loopbacks, never the anycast address</span>
<span class="c">! R2:</span>
ip msdp peer 4.4.4.4 connect-source Loopback0
<span class="c">! R4:</span>
ip msdp peer 2.2.2.2 connect-source Loopback0</pre>
<p>Two rules: (1) the MSDP session must use the unique address of each RP, because the anycast address exists on both routers and a TCP session to it would end at the wrong one; (2) on real IOS XE also set <code>ip msdp originator-id Loopback0</code> so that the SA messages carry the unique address, not the anycast one (the simulator does not model the originator ID).</p>

<h3>Verify</h3>
<pre class="out">R4#show ip msdp summary
MSDP Peer Status Summary
Peer Address     AS    State    Uptime/  Reset SA    Peer Name
                                Downtime Count Count
2.2.2.2          ?     <span class="hl">Up</span>       00:00:36 0     1     ?

R4#show ip msdp sa-cache
MSDP Source-Active Cache - 1 entries
<span class="hl">(10.101.0.10, 239.10.1.1), RP 10.255.255.100</span>, AS ?, 00:00:12/00:05:48, Peer 2.2.2.2

R4#show ip mroute 239.10.1.1

(*, 239.10.1.1), 00:00:24/00:02:36, RP 10.255.255.100, flags: SC
  Incoming interface: Null, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/1, Forward/Sparse, 00:00:24/00:02:36

(10.101.0.10, 239.10.1.1), 00:00:12/00:02:48, <span class="hl">flags: TMA</span>
  Incoming interface: GigabitEthernet0/0, RPF nbr 10.0.3.1
  Outgoing interface list:
    GigabitEthernet0/1, Forward/Sparse, 00:00:12/00:03:18</pre>
<p>Read the flags: <b>M</b> means this entry was created by MSDP; <b>A</b> means the router is a candidate for MSDP advertisement. The <code>Peer</code> in the SA cache is the <i>unique</i> address of the peer RP.</p>

<h3>Failover</h3>
<p>Shut Loopback1 on RP-A. OSPF removes that copy of the /32 and every router now sees one path, to RP-B. The first-hop router registers with RP-B directly, joins reach RP-B, and delivery continues. No timers of Auto-RP or BSR are involved, only OSPF convergence. That is why anycast RP is the preferred design for RP redundancy.</p>

<div class="note"><p><b>PIM anycast RP (RFC 4610).</b> A variation lets the RPs exchange the registers themselves with PIM instead of MSDP, so no MSDP peers are needed. Cisco supports it on newer platforms; the simulator in this course only models MSDP.</p></div>
<div class="note"><p><b>Junos note.</b> Same design on Junos: put the anycast address on lo0 next to the unique one and mark the unique one <code>primary</code>, make the RP local, and peer MSDP on the unique addresses.</p>
<pre class="code">set interfaces lo0 unit 0 family inet address 2.2.2.2/32 primary
set interfaces lo0 unit 0 family inet address 10.255.255.100/32
set protocols pim rp local address 10.255.255.100
set protocols msdp local-address 2.2.2.2
set protocols msdp peer 4.4.4.4
<span class="c"># other routers</span>
set protocols pim rp static address 10.255.255.100</pre></div>

<div class="warn"><p><b>Common mistakes.</b> (1) MSDP sourced from the anycast address. (2) Forgetting <code>ip pim sparse-mode</code> on the new loopback. (3) Surprise that one RP gets all the traffic: anycast sends everyone to the <i>nearest</i> RP, which depends on your metrics. (4) Running anycast together with Auto-RP or BSR: not supported in this design; use a static RP pointing at the anycast address.</p></div>
<div class="exam"><p><b>Exam trap.</b> MSDP exchanges <b>sources</b>, not group membership. It runs between RPs over TCP 639. Without MSDP, anycast RP splits the domain into islands.</p></div>

<div class="scn"><h4>Lab 4 walk-through: Mumbai to Delhi through MSDP</h4><p>In <b>mq-rp-anycast</b> the studio is in Mumbai, the viewer in Delhi, and the circuits are labelled in the lab (MPLS between the cities). After you create Loopback1 on both RPs and point everybody at 10.255.255.100, R4 shows the (*,G) with RP 10.255.255.100, but the stream does not arrive until the MSDP peering is up: only then does R4 learn the Mumbai source from the SA cache and join towards it. Finally you shut Loopback1 on R2 and prove the stream still reaches VIEWER.</p><p><b>Lesson:</b> anycast RP without MSDP looks configured and fails exactly when sources and receivers are served by different RPs.</p></div>

<div class="iv"><p class="q">"How do you make the RP highly available?"</p><p>Strong answer: anycast RP. Two RPs share one loopback address, the IGP sends each router to the nearest one, MSDP between the unique addresses shares active sources, and failover equals IGP convergence. Mention <code>originator-id</code>, using a static RP pointing at the anycast address, and that Auto-RP and BSR alone give slower failover.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Anycast RP: the same /32 on two RPs; unicast routing selects the nearest.</li>
<li>MSDP between the RPs' unique addresses carries Source-Active messages (TCP 639).</li>
<li>Flags M (created by MSDP) and A (MSDP advertisement candidate) appear on (S,G) entries.</li>
<li>Failover is as fast as the IGP: shut the anycast loopback and traffic moves.</li>
<li>Never source MSDP from the anycast address.</li>
</ul></div>
`,hi:`
<p>Ab tak ke har method mein ek kamzori hai: ek RP ek point of failure hai, aur Auto-RP ya BSR ek samay mein ek range ke liye sirf <i>ek</i> RP chunte hain. RP mar jaye to naye receivers timers aur dynamic protocol ke re-converge hone ka intezaar karte hain, jisme minutes lag sakte hain. <b>Anycast RP</b> yeh intezaar hata deta hai. Do (ya zyada) routers ek saath RP hote hain, aur routing har router ko nazdeeki wale tak bhejti hai.</p>

<h3>Idea: anycast</h3>
<p>Ek pizza chain ki kalpana karo jiska helpline number har city mein same hai. Aap ek number dial karte ho aur phone network aapko <i>sabse nazdeeki</i> outlet se jodta hai. Agar Pune outlet band hai, to network aapko Mumbai se jod deta hai aur aapko pata bhi nahi chalta. Anycast RP mein helpline number ek IP address hai, jaise <code>10.255.255.100</code>, jo <b>dono</b> RP routers par loopback ki tarah configure hai. Har router ise RP address ki tarah use karta hai. IGP (OSPF) us /32 ke do routes le jaata hai, aur har router sasta wala follow karta hai.</p>

<h3>Jo problem yeh banata hai, aur MSDP use kaise solve karta hai</h3>
<p>Ab sources aur receivers <b>alag</b> RPs ke paas ja sakte hain. Mumbai ka studio RP-A (nazdeeki) ke paas register karta hai. Delhi ka viewer RP-B (Delhi ke nazdeeki) ko join karta hai. RP-B ke paas receiver hai par usne source ke baare mein suna hi nahi, isliye kuch nahi aata.</p>
<p><b>MSDP</b> (Multicast Source Discovery Protocol) ise fix karta hai. Dono RPs TCP (port 639) par MSDP peering banate hain. Jab koi RP register se naye source ke baare mein jaanta hai, to apne peer ko <b>Source-Active (SA)</b> message bhejta hai: "source 10.101.0.10 group 239.10.1.1 par bhej raha hai aur main RP hoon". Peer RP, agar uske paas us group ke receivers hain, source ki taraf join karta hai aur stream chalti hai. SA messages ek <b>SA cache</b> mein rakhe jaate hain.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="MSDP ke saath anycast RP">
<rect x="20" y="95" width="100" height="55" rx="8" fill="#bbf7d0"/><text x="70" y="119" text-anchor="middle" class="svg-ink" font-size="13">STUDIO</text><text x="70" y="137" text-anchor="middle" class="svg-muted" font-size="12">Mumbai</text>
<rect x="180" y="20" width="150" height="62" rx="8" fill="#fde68a"/><text x="255" y="42" text-anchor="middle" class="svg-ink" font-size="13">RP-A (R2)</text><text x="255" y="59" text-anchor="middle" class="svg-muted" font-size="12">lo0 2.2.2.2</text><text x="255" y="75" text-anchor="middle" class="svg-accent" font-size="12">lo1 10.255.255.100</text>
<rect x="400" y="20" width="150" height="62" rx="8" fill="#fde68a"/><text x="475" y="42" text-anchor="middle" class="svg-ink" font-size="13">RP-B (R4)</text><text x="475" y="59" text-anchor="middle" class="svg-muted" font-size="12">lo0 4.4.4.4</text><text x="475" y="75" text-anchor="middle" class="svg-accent" font-size="12">lo1 10.255.255.100</text>
<rect x="520" y="165" width="100" height="55" rx="8" fill="#bae6fd"/><text x="570" y="189" text-anchor="middle" class="svg-ink" font-size="13">VIEWER</text><text x="570" y="207" text-anchor="middle" class="svg-muted" font-size="12">Delhi</text>
<line x1="120" y1="115" x2="190" y2="75" stroke="#64748b" stroke-width="2"/><text x="85" y="85" class="svg-muted" font-size="12">register</text>
<line x1="330" y1="51" x2="400" y2="51" stroke="#64748b" stroke-width="3"/><text x="365" y="40" text-anchor="middle" class="svg-accent" font-size="12">MSDP SA</text>
<line x1="540" y1="82" x2="565" y2="165" stroke="#64748b" stroke-width="2"/><text x="590" y="130" class="svg-muted" font-size="12">(*,G) join</text>
</svg><p class="cap">Register RP-A par pahunchta hai, join RP-B par. MSDP SA message dono ko jodta hai.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! R2 (RP-A) aur R4 (RP-B): shared anycast loopback</span>
interface Loopback1
 ip address 10.255.255.100 255.255.255.255
 ip pim sparse-mode
<span class="c">! saare routers: RP anycast address hai</span>
ip pim rp-address 10.255.255.100
<span class="c">! MSDP UNIQUE loopbacks use karta hai, anycast address kabhi nahi</span>
<span class="c">! R2:</span>
ip msdp peer 4.4.4.4 connect-source Loopback0
<span class="c">! R4:</span>
ip msdp peer 2.2.2.2 connect-source Loopback0</pre>
<p>Do rules: (1) MSDP session har RP ka unique address use kare, kyunki anycast address dono routers par hai aur uske TCP session galat router par khatam ho sakte hain; (2) real IOS XE par <code>ip msdp originator-id Loopback0</code> bhi set karo taaki SA messages anycast nahi, unique address carry karein (simulator originator ID model nahi karta).</p>

<h3>Verify</h3>
<pre class="out">R4#show ip msdp summary
MSDP Peer Status Summary
Peer Address     AS    State    Uptime/  Reset SA    Peer Name
                                Downtime Count Count
2.2.2.2          ?     <span class="hl">Up</span>       00:00:36 0     1     ?

R4#show ip msdp sa-cache
MSDP Source-Active Cache - 1 entries
<span class="hl">(10.101.0.10, 239.10.1.1), RP 10.255.255.100</span>, AS ?, 00:00:12/00:05:48, Peer 2.2.2.2

R4#show ip mroute 239.10.1.1

(*, 239.10.1.1), 00:00:24/00:02:36, RP 10.255.255.100, flags: SC
  Incoming interface: Null, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/1, Forward/Sparse, 00:00:24/00:02:36

(10.101.0.10, 239.10.1.1), 00:00:12/00:02:48, <span class="hl">flags: TMA</span>
  Incoming interface: GigabitEthernet0/0, RPF nbr 10.0.3.1
  Outgoing interface list:
    GigabitEthernet0/1, Forward/Sparse, 00:00:12/00:03:18</pre>
<p>Flags padho: <b>M</b> ka matlab entry MSDP ne banayi; <b>A</b> ka matlab router MSDP advertisement ka candidate hai. SA cache ka <code>Peer</code> peer RP ka <i>unique</i> address hai.</p>

<h3>Failover</h3>
<p>RP-A par Loopback1 shut karo. OSPF /32 ki woh copy hata deta hai aur ab har router ko ek hi path dikhta hai, RP-B ki taraf. First-hop router seedha RP-B ke paas register karta hai, joins RP-B tak pahunchte hain, aur delivery chalti rehti hai. Auto-RP ya BSR ke timers involve nahi, sirf OSPF convergence. Isiliye RP redundancy ke liye anycast RP preferred design hai.</p>

<div class="note"><p><b>PIM anycast RP (RFC 4610).</b> Ek variation RPs ko MSDP ki jagah PIM se registers khud exchange karne deta hai, isliye MSDP peers nahi chahiye. Cisco ise naye platforms par support karta hai; is course ka simulator sirf MSDP model karta hai.</p></div>
<div class="note"><p><b>Junos note.</b> Junos par same design: anycast address lo0 par unique address ke saath rakho aur unique ko <code>primary</code> mark karo, RP ko local banao, aur MSDP ko unique addresses par peer karo.</p>
<pre class="code">set interfaces lo0 unit 0 family inet address 2.2.2.2/32 primary
set interfaces lo0 unit 0 family inet address 10.255.255.100/32
set protocols pim rp local address 10.255.255.100
set protocols msdp local-address 2.2.2.2
set protocols msdp peer 4.4.4.4
<span class="c"># baaki routers</span>
set protocols pim rp static address 10.255.255.100</pre></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) MSDP anycast address se source karna. (2) Naye loopback par <code>ip pim sparse-mode</code> bhool jaana. (3) Surprise ki ek RP ko saara traffic mil raha hai: anycast sabko <i>nazdeeki</i> RP ke paas bhejta hai, jo aapke metrics par depend karta hai. (4) Anycast ko Auto-RP ya BSR ke saath chalana: is design mein supported nahi; anycast address ki taraf point karta static RP use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> MSDP <b>sources</b> exchange karta hai, group membership nahi. Yeh RPs ke beech TCP 639 par chalta hai. MSDP ke bina anycast RP domain ko islands mein baant deta hai.</p></div>

<div class="scn"><h4>Lab 4 walk-through: MSDP ke through Mumbai se Delhi</h4><p><b>mq-rp-anycast</b> mein studio Mumbai mein hai, viewer Delhi mein, aur circuits lab mein labelled hain (cities ke beech MPLS). Dono RPs par Loopback1 banane aur sabko 10.255.255.100 ki taraf point karne ke baad R4 RP 10.255.255.100 ke saath (*,G) dikhata hai, lekin stream tab tak nahi aati jab tak MSDP peering up na ho: tabhi R4 SA cache se Mumbai source seekhta hai aur uski taraf join karta hai. Aakhir mein aap R2 par Loopback1 shut karte ho aur prove karte ho ki stream VIEWER tak phir bhi pahunchti hai.</p><p><b>Seekh:</b> MSDP ke bina anycast RP configured dikhta hai aur theek tab fail hota hai jab sources aur receivers ko alag RPs serve karte hain.</p></div>

<div class="iv"><p class="q">"RP ko highly available kaise banate ho?"</p><p>Strong answer: anycast RP. Do RPs ek loopback address share karte hain, IGP har router ko nazdeeki wale ke paas bhejta hai, unique addresses ke beech MSDP active sources share karta hai, aur failover IGP convergence ke barabar hai. <code>originator-id</code>, anycast address ki taraf point karte static RP, aur yeh bhi batao ki sirf Auto-RP aur BSR slower failover dete hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Anycast RP: do RPs par same /32; unicast routing nazdeeki ko chunti hai.</li>
<li>RPs ke unique addresses ke beech MSDP Source-Active messages (TCP 639) carry karta hai.</li>
<li>Flags M (MSDP ne banayi) aur A (MSDP advertisement candidate) (S,G) entries par dikhte hain.</li>
<li>Failover IGP jitna tez: anycast loopback shut karo aur traffic shift ho jaata hai.</li>
<li>MSDP ko kabhi anycast address se source mat karo.</li>
</ul></div>
`}};export{e as default};