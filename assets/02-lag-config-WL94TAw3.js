var e={id:`lag-config`,h:{en:`Link aggregation: building an ae interface step by step`,hi:`Link aggregation: ae interface step by step banana`},body:{en:`
<p>Imagine a single-lane road between a factory and a warehouse. Trucks queue, and if the road is blocked, nothing moves. Now build a second road beside it and tell the drivers to use both. You have doubled the capacity and removed the single point of failure. A <b>link aggregation group (LAG)</b> does exactly this for Ethernet: it bundles several physical links into one logical interface that the rest of the network sees as a single, wider link.</p>

<h3>Why bundle links?</h3>
<ul>
<li><b>Bandwidth.</b> Two 1 Gbps links give 2 Gbps in total (but see the hashing note below).</li>
<li><b>Redundancy.</b> If one member fails, the bundle stays up with the remaining members, and traffic moves in well under a second.</li>
<li><b>Simplicity.</b> Spanning tree sees one link, not two, so it does not block the second cable.</li>
</ul>
<p>On Junos the logical interface is called <code>aeN</code> (aggregated Ethernet), for example <code>ae0</code>. The physical cables are the <b>members</b>.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Two links bundled into ae0">
<rect x="30" y="50" width="130" height="90" rx="10" fill="#bbf7d0"/><text x="95" y="90" text-anchor="middle" class="svg-ink" font-size="14">DS1</text><text x="95" y="110" text-anchor="middle" class="svg-muted" font-size="12">distribution</text>
<rect x="480" y="50" width="130" height="90" rx="10" fill="#bbf7d0"/><text x="545" y="90" text-anchor="middle" class="svg-ink" font-size="14">AS1</text><text x="545" y="110" text-anchor="middle" class="svg-muted" font-size="12">access floor</text>
<line x1="160" y1="75" x2="480" y2="75" stroke="#64748b" stroke-width="3"/><line x1="160" y1="115" x2="480" y2="115" stroke="#64748b" stroke-width="3"/>
<text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">ge-0/0/10</text><text x="320" y="134" text-anchor="middle" class="svg-muted" font-size="12">ge-0/0/11</text>
<rect x="215" y="82" width="210" height="26" rx="13" fill="none" stroke="#7c3aed" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="100" text-anchor="middle" class="svg-accent" font-size="12">ae0 (one logical link)</text>
</svg><p class="cap">Two member cables, one logical interface. All VLAN and IP settings go on ae0.</p></div>

<h3>The three steps on Junos</h3>
<p>The Nashik lab joins the distribution switch DS1 and the access switch AS1 with two cables. The configuration has three parts, and each is easy to forget.</p>
<pre class="code"><span class="c">! 1. Tell the chassis how many ae interfaces may exist (both switches)</span>
set chassis aggregated-devices ethernet device-count 1

<span class="c">! 2. Make the physical ports members of ae0 (both switches)</span>
set interfaces ge-0/0/10 ether-options 802.3ad ae0
set interfaces ge-0/0/11 ether-options 802.3ad ae0

<span class="c">! 3. Configure the logical interface ae0 itself: LACP and the trunk</span>
set interfaces ae0 aggregated-ether-options lacp active
set interfaces ae0 aggregated-ether-options minimum-links 2
set interfaces ae0 unit 0 family ethernet-switching interface-mode trunk vlan members [ STAFF PRINT ]
commit</pre>
<ul>
<li><b>device-count</b> reserves ae interfaces. On routers the member statement is <code>gigether-options 802.3ad ae0</code> instead of <code>ether-options</code>.</li>
<li>All logical configuration (units, VLANs, IP addresses) goes on <code>ae0</code>. The members only carry the <code>802.3ad ae0</code> line. Logical settings on a member do not belong there and do not make the bundle work.</li>
<li><b>minimum-links 2</b> is explained in chapter 3.</li>
</ul>

<h3>Verification</h3>
<pre class="out">lab@DS1&gt; show interfaces ae0 terse
Interface               Admin Link Proto    Local                 Remote
ae0                     up    up
ae0.0                   up    up   eth-switch

lab@DS1&gt; show interfaces ae0
Physical interface: ae0, Enabled, Physical link is Up
  Link-level type: Ethernet, MTU: 1514, MRU: 1522, Speed: <span class="hl">2Gbps</span>, ...
  <span class="hl">Minimum links needed: 2</span>, Minimum bandwidth needed: 1bps
  ...
  Logical interface ae0.0 (Index 330) (SNMP ifIndex 525)
    Flags: Up SNMP-Traps 0x4004000 Encapsulation: ENET2
    Protocol eth-switch, MTU: 1514
      Flags: Trunk-Mode</pre>
<p>The bundle speed is the sum of the up members: 2Gbps for two 1-gigabit ports. The lab asks exactly this number.</p>
<pre class="out">lab@DS1&gt; show configuration interfaces ae0
aggregated-ether-options {
    lacp {
        active;
    }
    minimum-links 2;
}
unit 0 {
    family ethernet-switching {
        interface-mode trunk;
        vlan {
            members [ STAFF PRINT ];
        }
    }
}</pre>

<h3>What happens if device-count is missing?</h3>
<p>Junos accepts the commit but never creates <code>ae0</code>. You get no error at commit time; the first sign is:</p>
<pre class="out">lab@SWB&gt; show interfaces terse ae0
<span class="hl">error: device ae0 not found</span></pre>
<p>This is the first of three faults in the troubleshooting lab (chapter 8).</p>

<h3>How traffic is spread: hashing</h3>
<p>The switch does not send each packet over a different member; it hashes header fields (MAC and IP addresses, and optionally ports) so that all packets of one conversation use the <b>same</b> member. This keeps packets in order. The result: one big transfer between two hosts still uses one 1 Gbps link, while many conversations spread across the members. Two links therefore do not make a single flow twice as fast.</p>

<div class="eg"><p><b>Worked example.</b> Four hosts upload to a server through the bundle. Each flow is hashed to member ge-0/0/10 or ge-0/0/11. If three flows land on ge-0/0/10 and one on ge-0/0/11, the bundle is unbalanced even though the total is within 2 Gbps. This is normal and improves with more flows.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting <code>device-count</code>. (2) Putting VLAN configuration on the member ports instead of on ae0. (3) Different speeds or duplex on the members. (4) Configuring the bundle on one switch only: the other side sees two unrelated links, and with Spanning Tree this can create a loop or a blocked port.</p></div>
<div class="exam"><p><b>Exam trap.</b> The member statement is <code>ether-options 802.3ad aeN</code> on EX switches and <code>gigether-options 802.3ad aeN</code> on routers. Both need <code>chassis aggregated-devices ethernet device-count</code>.</p></div>

<div class="scn"><h4>Two cables, one working</h4><p>A warehouse switch had two uplinks that the contractor had cabled but not configured. Spanning Tree blocked one of them, so only 1 Gbps was usable and a cable failure caused a 30-second outage. The team created ae0 with LACP on both switches. Afterwards both cables forwarded traffic, and a cable pull during the test caused only a brief blip.</p><p><b>Lesson:</b> a second cable is only redundancy when it is part of a bundle or a designed alternative path.</p></div>

<div class="iv"><p class="q">"How do you configure an aggregated Ethernet interface on Junos?"</p><p>Set the chassis <code>aggregated-devices ethernet device-count</code>, assign each member port with <code>ether-options 802.3ad ae0</code>, and configure the logical interface ae0 with LACP, the VLAN or IP settings and optionally minimum-links. I verify with <code>show interfaces ae0 terse</code> and <code>show lacp interfaces</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A LAG makes several links look like one logical aeN interface.</li>
<li>Three parts: chassis device-count, member 802.3ad statements, ae0 configuration.</li>
<li>Logical settings (VLANs, addresses) belong on ae0, not on members.</li>
<li>Missing device-count means ae0 is never created ("device ae0 not found").</li>
<li>Hashing keeps each flow on one member, so a single flow never exceeds one link.</li>
</ul></div>
`,hi:`
<p>Socho factory aur warehouse ke beech ek-lane ki sadak hai. Trucks line mein lagte hain, aur sadak band ho jaaye to kuch nahi chalta. Ab uske bagal mein doosri sadak banao aur drivers ko dono use karne ko kaho. Aapne capacity double kar di aur single point of failure hata diya. <b>Link aggregation group (LAG)</b> Ethernet ke liye yahi karta hai: kai physical links ko ek logical interface mein bundle karta hai jo baaki network ko ek chaude link ki tarah dikhta hai.</p>

<h3>Links bundle kyun karte hain?</h3>
<ul>
<li><b>Bandwidth.</b> Do 1 Gbps links kul 2 Gbps dete hain (lekin neeche hashing ka note dekho).</li>
<li><b>Redundancy.</b> Ek member fail ho to bundle bache hue members ke saath up rehta hai, aur traffic second se kam mein shift ho jaata hai.</li>
<li><b>Simplicity.</b> Spanning tree ko ek link dikhta hai, do nahi, isliye woh doosra cable block nahi karta.</li>
</ul>
<p>Junos mein logical interface ko <code>aeN</code> (aggregated Ethernet) kehte hain, jaise <code>ae0</code>. Physical cables <b>members</b> hain.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Do links ae0 mein bundle">
<rect x="30" y="50" width="130" height="90" rx="10" fill="#bbf7d0"/><text x="95" y="90" text-anchor="middle" class="svg-ink" font-size="14">DS1</text><text x="95" y="110" text-anchor="middle" class="svg-muted" font-size="12">distribution</text>
<rect x="480" y="50" width="130" height="90" rx="10" fill="#bbf7d0"/><text x="545" y="90" text-anchor="middle" class="svg-ink" font-size="14">AS1</text><text x="545" y="110" text-anchor="middle" class="svg-muted" font-size="12">access floor</text>
<line x1="160" y1="75" x2="480" y2="75" stroke="#64748b" stroke-width="3"/><line x1="160" y1="115" x2="480" y2="115" stroke="#64748b" stroke-width="3"/>
<text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">ge-0/0/10</text><text x="320" y="134" text-anchor="middle" class="svg-muted" font-size="12">ge-0/0/11</text>
<rect x="215" y="82" width="210" height="26" rx="13" fill="none" stroke="#7c3aed" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="100" text-anchor="middle" class="svg-accent" font-size="12">ae0 (ek logical link)</text>
</svg><p class="cap">Do member cables, ek logical interface. Saari VLAN aur IP settings ae0 par jaati hain.</p></div>

<h3>Junos par teen steps</h3>
<p>Nashik lab distribution switch DS1 aur access switch AS1 ko do cables se jodta hai. Configuration ke teen hisse hain, aur har ek bhoolna aasaan hai.</p>
<pre class="code"><span class="c">! 1. Chassis ko batao kitne ae interfaces ban sakte hain (dono switches)</span>
set chassis aggregated-devices ethernet device-count 1

<span class="c">! 2. Physical ports ko ae0 ka member banao (dono switches)</span>
set interfaces ge-0/0/10 ether-options 802.3ad ae0
set interfaces ge-0/0/11 ether-options 802.3ad ae0

<span class="c">! 3. Logical interface ae0 configure karo: LACP aur trunk</span>
set interfaces ae0 aggregated-ether-options lacp active
set interfaces ae0 aggregated-ether-options minimum-links 2
set interfaces ae0 unit 0 family ethernet-switching interface-mode trunk vlan members [ STAFF PRINT ]
commit</pre>
<ul>
<li><b>device-count</b> ae interfaces reserve karta hai. Routers par member statement <code>ether-options</code> ki jagah <code>gigether-options 802.3ad ae0</code> hota hai.</li>
<li>Saari logical configuration (units, VLANs, IP addresses) <code>ae0</code> par jaati hai. Members par sirf <code>802.3ad ae0</code> line hoti hai. Member par logical settings rakhna galat hai aur bundle ko kaam nahi karwata.</li>
<li><b>minimum-links 2</b> chapter 3 mein samjhaya hai.</li>
</ul>

<h3>Verification</h3>
<pre class="out">lab@DS1&gt; show interfaces ae0 terse
Interface               Admin Link Proto    Local                 Remote
ae0                     up    up
ae0.0                   up    up   eth-switch

lab@DS1&gt; show interfaces ae0
Physical interface: ae0, Enabled, Physical link is Up
  Link-level type: Ethernet, MTU: 1514, MRU: 1522, Speed: <span class="hl">2Gbps</span>, ...
  <span class="hl">Minimum links needed: 2</span>, Minimum bandwidth needed: 1bps
  ...
  Logical interface ae0.0 (Index 330) (SNMP ifIndex 525)
    Flags: Up SNMP-Traps 0x4004000 Encapsulation: ENET2
    Protocol eth-switch, MTU: 1514
      Flags: Trunk-Mode</pre>
<p>Bundle speed up members ka jod hota hai: do 1-gigabit ports ke liye 2Gbps. Lab bilkul yahi number poochta hai.</p>
<pre class="out">lab@DS1&gt; show configuration interfaces ae0
aggregated-ether-options {
    lacp {
        active;
    }
    minimum-links 2;
}
unit 0 {
    family ethernet-switching {
        interface-mode trunk;
        vlan {
            members [ STAFF PRINT ];
        }
    }
}</pre>

<h3>device-count na ho to kya hota hai?</h3>
<p>Junos commit accept kar leta hai lekin <code>ae0</code> kabhi banata nahi. Commit ke waqt koi error nahi aata; pehla sanket yeh hai:</p>
<pre class="out">lab@SWB&gt; show interfaces terse ae0
<span class="hl">error: device ae0 not found</span></pre>
<p>Troubleshooting lab (chapter 8) ke teen faults mein yeh pehla hai.</p>

<h3>Traffic kaise baanta jaata hai: hashing</h3>
<p>Switch har packet ko alag member par nahi bhejta; woh header fields (MAC aur IP addresses, aur optionally ports) ko hash karta hai taaki ek conversation ke saare packets <b>same</b> member use karein. Isse packets order mein rehte hain. Natija: do hosts ke beech ek bada transfer phir bhi ek 1 Gbps link use karta hai, jabki kai conversations members mein bant jaate hain. Isliye do links ek akele flow ko double tez nahi karte.</p>

<div class="eg"><p><b>Worked example.</b> Chaar hosts bundle se server par upload karte hain. Har flow ge-0/0/10 ya ge-0/0/11 par hash hota hai. Teen flows ge-0/0/10 par aur ek ge-0/0/11 par jaaye to bundle unbalanced hai chahe kul 2 Gbps ke andar ho. Yeh normal hai aur zyada flows ke saath behtar hota hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) <code>device-count</code> bhoolna. (2) VLAN configuration ko ae0 ki jagah member ports par daalna. (3) Members par alag speed ya duplex. (4) Bundle sirf ek switch par configure karna: doosri taraf do unrelated links dikhte hain, aur Spanning Tree ke saath loop ya blocked port ban sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Member statement EX switches par <code>ether-options 802.3ad aeN</code> aur routers par <code>gigether-options 802.3ad aeN</code> hai. Dono ko <code>chassis aggregated-devices ethernet device-count</code> chahiye.</p></div>

<div class="scn"><h4>Do cables, ek hi kaam karta tha</h4><p>Ek warehouse switch ke do uplinks the jo contractor ne cable kiye the lekin configure nahi. Spanning Tree ne ek ko block kar diya, isliye sirf 1 Gbps usable tha aur cable failure par 30-second outage hota tha. Team ne dono switches par LACP ke saath ae0 banaya. Baad mein dono cables traffic forward karte the, aur test mein cable kheenchne par sirf chhota blip aaya.</p><p><b>Lesson:</b> doosra cable tabhi redundancy hai jab woh bundle ka hissa ho ya designed alternative path ho.</p></div>

<div class="iv"><p class="q">"Junos par aggregated Ethernet interface kaise configure karte ho?"</p><p>Chassis <code>aggregated-devices ethernet device-count</code> set karo, har member port ko <code>ether-options 802.3ad ae0</code> se assign karo, aur logical interface ae0 ko LACP, VLAN ya IP settings aur optionally minimum-links ke saath configure karo. <code>show interfaces ae0 terse</code> aur <code>show lacp interfaces</code> se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LAG kai links ko ek logical aeN interface jaisa dikhata hai.</li>
<li>Teen hisse: chassis device-count, member 802.3ad statements, ae0 configuration.</li>
<li>Logical settings (VLANs, addresses) ae0 par jaati hain, members par nahi.</li>
<li>device-count na ho to ae0 kabhi banta nahi ("device ae0 not found").</li>
<li>Hashing har flow ko ek member par rakhti hai, isliye ek flow ek link se zyada nahi hota.</li>
</ul></div>
`}};export{e as default};