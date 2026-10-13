var e={id:`ssm-and-rpf`,h:{en:`Source-specific multicast and the RPF check in depth`,hi:`Source-specific multicast aur RPF check gehrai se`},body:{en:`
<p>Two ideas finish the PIM picture. <b>SSM</b> removes the RP completely when receivers know which source they want. The <b>RPF check</b> is the rule that decides whether any PIM join or data packet is accepted; most "silent stream" tickets end here.</p>

<h3>Source-specific multicast</h3>
<p>In ASM a receiver says "give me group G" and the network finds the sources with the help of an RP. In SSM the receiver says "give me group G <b>from source S</b>", an <b>(S,G) channel</b>. The last-hop router sends an (S,G) join straight toward S, so there is no RP, no Register, no shared tree and no MSDP. That removes a whole class of failures and makes SSM the best choice for known feeds such as a market-data ticker, a video channel or an IPTV head-end.</p>
<table class="cmp"><tr><th></th><th>ASM</th><th>SSM</th></tr>
<tr><td>Receiver asks for</td><td>(*,G)</td><td>(S,G)</td></tr>
<tr><td>RP needed</td><td>yes</td><td>no</td></tr>
<tr><td>IGMP version</td><td>v2 or v3</td><td>v3 (Include mode)</td></tr>
<tr><td>Default group range</td><td>224/4 except SSM</td><td>232.0.0.0/8</td></tr>
<tr><td>Source must be known by receiver</td><td>no</td><td>yes (by application or directory)</td></tr></table>
<p>Junos treats <b>232.0.0.0/8</b> as SSM without any configuration. You can add ranges, for example a private one:</p>
<pre class="code">set routing-options multicast ssm-groups [ 232.0.0.0/8 239.232.0.0/16 ]</pre>
<p>For hosts that only speak IGMPv2 there is <b>SSM mapping</b> on the router: a static map from a group range to a source address, so a v2 report for the group is treated as an (S,G) join. It is configured under the IGMP protocol with an <code>ssm-map</code>. It is described here for completeness.</p>

<h3>The silent ticker lab</h3>
<p>A market-data feed 10.63.10.50 sends to 232.63.1.1. R3-BRANCH serves the dealers on irb.60. The stream is silent. We start at the receiver, as in every multicast ticket.</p>
<p><b>Check 1 - what does IGMP know?</b> We saw in chapter 2 that irb.60 listens as IGMPv2 and records <code>Group mode: Exclude, Source: 0.0.0.0</code>. Setting <code>set protocols igmp interface irb.60 version 3</code> makes it <code>Include</code> with source 10.63.10.50. This is necessary for SSM.</p>
<p><b>Check 2 - can the router join toward the source?</b> Even with a correct IGMP report, <code>show pim join extensive</code> on R3 shows the (S,G) entry with no usable upstream:</p>
<pre class="out">lab@R3&gt; show pim join extensive
Group: 232.63.1.1
    Source: 10.63.10.50
    Flags: sparse,spt
    Upstream interface: <span class="hl">unknown</span>
    Upstream neighbor: unknown
    Upstream state: <span class="hl">None (RPF check failed)</span>
    Downstream neighbors:
        Interface: irb.60
            10.63.60.1 State: Join Flags: S Timeout: Infinity</pre>
<p><b>Check 3 - ask for the RPF decision directly.</b></p>
<pre class="out">lab@R3&gt; show multicast rpf 10.63.10.50
Multicast RPF table: inet.0 , 11 entries
10.63.10.0/24
    Protocol: OSPF
    Interface: <span class="hl">ge-0/0/2.0</span>
    Neighbor: 10.63.13.1
    Note: PIM is not running on ge-0/0/2.0 - joins toward this source cannot be sent

lab@R3&gt; show pim neighbors
Interface           IP V Mode        Option       Uptime Neighbor addr
ge-0/0/0.0           4 2             HPLGT      00:00:30 10.63.23.1</pre>
<p>The picture is clear. OSPF prefers the direct backup link ge-0/0/2 to R1 (metric 5, cheaper) for the feed network 10.63.10.0/24, but PIM is only enabled on ge-0/0/0 toward R2-CORE. The RPF interface is the one with no PIM neighbour, so the join cannot be sent. The simulator even prints the reason in the Note line.</p>

<h3>Fixing RPF without changing unicast routing</h3>
<p>You could enable PIM on ge-0/0/2, but the design says the backup link is unicast only. The standard answer is a dedicated multicast RPF table. PIM looks up sources in <b>inet.2</b> if a <b>rib-group</b> points it there:</p>
<pre class="code">delete routing-options rib inet.2 static route 10.63.10.0/24 next-hop 10.63.13.1
set routing-options rib inet.2 static route 10.63.10.0/24 next-hop 10.63.23.1
set routing-options rib-groups MCAST-RPF import-rib inet.2
set protocols pim rib-group inet MCAST-RPF</pre>
<pre class="out">lab@R3&gt; show multicast rpf 10.63.10.50
Multicast RPF table: <span class="hl">inet.2</span> , 1 entries
10.63.10.0/24
    Protocol: Static (inet.2)
    Interface: ge-0/0/0.0
    Neighbor: 10.63.23.1</pre>
<p>Now the RPF interface is ge-0/0/0.0 with neighbour 10.63.23.1, the PIM-enabled path through R2-CORE. Unicast traffic still uses the backup link; only multicast lookups use inet.2. A real network usually copies interface and IGP routes into inet.2 as well, through <code>import-rib [ inet.0 inet.2 ]</code>; the simulator falls back to inet.0 when inet.2 has no match.</p>
<p>Prove it end to end: FEED sends five packets to 232.63.1.1, PC1 (subscribed) receives them, PC2 (not subscribed) does not, and the core router holds the (S,G) state with no RP anywhere:</p>
<pre class="out">lab@R2&gt; show pim join extensive
Group: 232.63.1.1
    Source: 10.63.10.50
    Flags: sparse,spt
    Upstream interface: ge-0/0/0.0
    Upstream neighbor: 10.63.12.1
    Upstream state: Join to Source
    Downstream neighbors:
        Interface: ge-0/0/1.0
            10.63.23.2 State: Join Flags: S

lab@R3&gt; show multicast route
Group: 232.63.1.1
    Source: 10.63.10.50/32
    Upstream interface: ge-0/0/0.0
    Downstream interface list:
        irb.60</pre>

<h3>The RPF rule restated</h3>
<ul>
<li>For a <b>data packet</b> from S: it must arrive on the interface that the RPF table says leads to S; otherwise it is dropped (the stream is not looped).</li>
<li>For a <b>join</b> to S or to the RP: it is sent out of the RPF interface to the RPF neighbour, which must be a PIM neighbour.</li>
<li>The RPF table is inet.0 by default; an rib-group can add or replace it with inet.2.</li>
<li>When several equal-cost paths exist, the RPF neighbour is chosen by a hash or by the highest address, and can change.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> R3 has two routes to 10.63.10.0/24: OSPF metric 6 via ge-0/0/2 (no PIM) and a static inet.2 route via ge-0/0/0 (PIM). With inet.0 only, RPF picks ge-0/0/2: no join. With the rib-group, RPF picks ge-0/0/0: the join goes to 10.63.23.1 and the tree forms.</p></div>

<div class="warn"><p><b>Common mistake.</b> Fixing a multicast RPF problem by changing unicast metrics, which can move production traffic. A dedicated inet.2 route gives multicast its own path. Another mistake: setting the inet.2 route but forgetting the <code>pim rib-group</code>, so PIM never looks there.</p></div>
<div class="exam"><p><b>Exam trap.</b> SSM needs IGMPv3 (or SSM mapping) and does not use an RP, even if one is configured. An (S,G) join in the 232/8 range is never sent to an RP. "Upstream interface: unknown" with an RPF-failed state points to routing or PIM neighbour problems, not to IGMP.</p></div>

<div class="scn"><h4>The dealers saw nothing at the open</h4><p>At market open the ticker stayed blank on one branch. IGMP showed the group, the RP did not exist (SSM), and the link looked fine. <code>show multicast rpf</code> on the branch router named the backup link as the RPF interface and printed that PIM was not running there. A one-line inet.2 static route plus a rib-group fixed it without touching the unicast design.</p><p><b>Lesson:</b> start at the receiver, then ask the router for its RPF decision; do not guess.</p></div>

<div class="iv"><p class="q">"What is an RPF failure and how do you fix one?"</p><p>The RPF check requires multicast data from source S to arrive on the interface that unicast routing would use to reach S, with a PIM neighbour behind it. A failure means the best unicast path to the source goes through an interface without PIM or without a PIM neighbour. I run show multicast rpf SOURCE, then either enable PIM on the right link, fix unicast routing, or give PIM its own table with an inet.2 route and rib-group.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSM joins (S,G) directly; no RP, Register or MSDP; 232/8 by default.</li>
<li>SSM needs IGMPv3 on the receiver LAN (or SSM mapping for v2 hosts).</li>
<li>The RPF check validates joins and data; show multicast rpf SOURCE shows the decision.</li>
<li>A rib-group pointing PIM to inet.2 lets multicast use a different path from unicast.</li>
<li>Upstream state "None (RPF check failed)" is a routing or PIM neighbour problem.</li>
</ul></div>
`,hi:`
<p>Do ideas PIM ki tasveer poori karte hain. <b>SSM</b> RP ko poori tarah hata deta hai jab receivers jaante hain ki unhe kaunsa source chahiye. <b>RPF check</b> woh rule hai jo tay karta hai ki koi PIM join ya data packet accept hoga ya nahi; zyadatar "silent stream" tickets yahin khatam hote hain.</p>

<h3>Source-specific multicast</h3>
<p>ASM mein receiver kehta hai "mujhe group G do" aur network RP ki madad se sources dhoondhta hai. SSM mein receiver kehta hai "mujhe group G <b>source S se</b> do", ek <b>(S,G) channel</b>. Last-hop router (S,G) join seedha S ki taraf bhejta hai, isliye RP nahi, Register nahi, shared tree nahi aur MSDP nahi. Isse failures ki ek poori class hat jaati hai aur SSM known feeds, jaise market-data ticker, video channel ya IPTV head-end ke liye best choice ban jaata hai.</p>
<table class="cmp"><tr><th></th><th>ASM</th><th>SSM</th></tr>
<tr><td>Receiver maangta hai</td><td>(*,G)</td><td>(S,G)</td></tr>
<tr><td>RP chahiye</td><td>haan</td><td>nahi</td></tr>
<tr><td>IGMP version</td><td>v2 ya v3</td><td>v3 (Include mode)</td></tr>
<tr><td>Default group range</td><td>224/4 SSM ko chhodkar</td><td>232.0.0.0/8</td></tr>
<tr><td>Receiver ko source pata hona chahiye</td><td>nahi</td><td>haan (application ya directory se)</td></tr></table>
<p>Junos <b>232.0.0.0/8</b> ko bina configuration ke SSM maanta hai. Aap ranges jod sakte ho, jaise private range:</p>
<pre class="code">set routing-options multicast ssm-groups [ 232.0.0.0/8 239.232.0.0/16 ]</pre>
<p>Sirf IGMPv2 bolne wale hosts ke liye router par <b>SSM mapping</b> hoti hai: group range se source address ka static map, taaki group ka v2 report (S,G) join maana jaye. Yeh IGMP protocol ke andar <code>ssm-map</code> se configure hota hai. Yahan poorti ke liye bataya gaya hai.</p>

<h3>Silent ticker lab</h3>
<p>Market-data feed 10.63.10.50, 232.63.1.1 par bhejta hai. R3-BRANCH irb.60 par dealers ko serve karta hai. Stream chup hai. Hum receiver side se shuru karte hain, jaise har multicast ticket mein.</p>
<p><b>Check 1 - IGMP ko kya pata hai?</b> Chapter 2 mein dekha ki irb.60 IGMPv2 par sunta hai aur <code>Group mode: Exclude, Source: 0.0.0.0</code> record karta hai. <code>set protocols igmp interface irb.60 version 3</code> use source 10.63.10.50 ke saath <code>Include</code> bana deta hai. SSM ke liye yeh zaroori hai.</p>
<p><b>Check 2 - kya router source ki taraf join bhej sakta hai?</b> Sahi IGMP report ke baad bhi R3 par <code>show pim join extensive</code> (S,G) entry ko bina usable upstream ke dikhata hai:</p>
<pre class="out">lab@R3&gt; show pim join extensive
Group: 232.63.1.1
    Source: 10.63.10.50
    Flags: sparse,spt
    Upstream interface: <span class="hl">unknown</span>
    Upstream neighbor: unknown
    Upstream state: <span class="hl">None (RPF check failed)</span>
    Downstream neighbors:
        Interface: irb.60
            10.63.60.1 State: Join Flags: S Timeout: Infinity</pre>
<p><b>Check 3 - RPF decision seedha poochho.</b></p>
<pre class="out">lab@R3&gt; show multicast rpf 10.63.10.50
Multicast RPF table: inet.0 , 11 entries
10.63.10.0/24
    Protocol: OSPF
    Interface: <span class="hl">ge-0/0/2.0</span>
    Neighbor: 10.63.13.1
    Note: PIM is not running on ge-0/0/2.0 - joins toward this source cannot be sent

lab@R3&gt; show pim neighbors
Interface           IP V Mode        Option       Uptime Neighbor addr
ge-0/0/0.0           4 2             HPLGT      00:00:30 10.63.23.1</pre>
<p>Tasveer saaf hai. OSPF feed network 10.63.10.0/24 ke liye R1 ke direct backup link ge-0/0/2 ko prefer karta hai (metric 5, sasta), lekin PIM sirf R2-CORE ki taraf ge-0/0/0 par enabled hai. RPF interface wahi hai jis par PIM neighbour nahi, isliye join bhejna possible nahi. Simulator Note line mein wajah bhi print karta hai.</p>

<h3>Unicast routing badle bina RPF fix karna</h3>
<p>Aap ge-0/0/2 par PIM enable kar sakte the, lekin design kehta hai ki backup link sirf unicast ke liye hai. Standard jawab dedicated multicast RPF table hai. PIM sources ko <b>inet.2</b> mein dhoondhta hai agar <b>rib-group</b> use wahan point kare:</p>
<pre class="code">delete routing-options rib inet.2 static route 10.63.10.0/24 next-hop 10.63.13.1
set routing-options rib inet.2 static route 10.63.10.0/24 next-hop 10.63.23.1
set routing-options rib-groups MCAST-RPF import-rib inet.2
set protocols pim rib-group inet MCAST-RPF</pre>
<pre class="out">lab@R3&gt; show multicast rpf 10.63.10.50
Multicast RPF table: <span class="hl">inet.2</span> , 1 entries
10.63.10.0/24
    Protocol: Static (inet.2)
    Interface: ge-0/0/0.0
    Neighbor: 10.63.23.1</pre>
<p>Ab RPF interface ge-0/0/0.0 hai aur neighbour 10.63.23.1, yaani R2-CORE se jaane wala PIM-enabled path. Unicast traffic ab bhi backup link use karta hai; sirf multicast lookups inet.2 use karte hain. Real network mein aam taur par interface aur IGP routes ko bhi <code>import-rib [ inet.0 inet.2 ]</code> se inet.2 mein copy karte hain; inet.2 mein match na ho to simulator inet.0 par fall back karta hai.</p>
<p>End to end saabit karo: FEED 232.63.1.1 par paanch packets bhejta hai, PC1 (subscribed) unhe paata hai, PC2 (subscribed nahi) nahi paata, aur core router par (S,G) state hai, kahin RP nahi:</p>
<pre class="out">lab@R2&gt; show pim join extensive
Group: 232.63.1.1
    Source: 10.63.10.50
    Flags: sparse,spt
    Upstream interface: ge-0/0/0.0
    Upstream neighbor: 10.63.12.1
    Upstream state: Join to Source
    Downstream neighbors:
        Interface: ge-0/0/1.0
            10.63.23.2 State: Join Flags: S

lab@R3&gt; show multicast route
Group: 232.63.1.1
    Source: 10.63.10.50/32
    Upstream interface: ge-0/0/0.0
    Downstream interface list:
        irb.60</pre>

<h3>RPF rule dobara</h3>
<ul>
<li><b>Data packet</b> ke liye: S se aaya packet usi interface par aana chahiye jise RPF table S tak jaata batati hai; warna drop (stream loop nahi hoti).</li>
<li><b>Join</b> ke liye: S ya RP ki taraf join RPF interface se RPF neighbour ko jaata hai, jo PIM neighbour hona chahiye.</li>
<li>RPF table default mein inet.0 hai; rib-group ise inet.2 se add ya replace kar sakta hai.</li>
<li>Kai equal-cost paths hon to RPF neighbour hash ya highest address se chuna jaata hai, aur badal sakta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> R3 ke paas 10.63.10.0/24 ke do routes hain: ge-0/0/2 se OSPF metric 6 (PIM nahi) aur ge-0/0/0 se static inet.2 route (PIM). Sirf inet.0 ke saath RPF ge-0/0/2 chunta hai: join nahi. Rib-group ke saath RPF ge-0/0/0 chunta hai: join 10.63.23.1 ko jaata hai aur tree ban jaata hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Multicast RPF problem ko unicast metrics badalkar fix karna, jisse production traffic hil sakta hai. Dedicated inet.2 route multicast ko apna path deta hai. Ek aur galti: inet.2 route set karna lekin <code>pim rib-group</code> bhool jaana, isliye PIM wahan dekhta hi nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> SSM ko IGMPv3 (ya SSM mapping) chahiye aur woh RP use nahi karta, chahe ek configured ho. 232/8 range ka (S,G) join kabhi RP ko nahi jaata. RPF-failed state ke saath "Upstream interface: unknown" routing ya PIM neighbour problem batata hai, IGMP nahi.</p></div>

<div class="scn"><h4>Market open par dealers ko kuch nahi dikha</h4><p>Market open par ek branch par ticker khaali raha. IGMP ne group dikhaya, RP tha hi nahi (SSM), aur link theek lag raha tha. Branch router par <code>show multicast rpf</code> ne backup link ko RPF interface bataya aur print kiya ki wahan PIM nahi chal raha. Ek line ke inet.2 static route aur rib-group ne unicast design chhue bina fix kar diya.</p><p><b>Lesson:</b> receiver se shuru karo, phir router se uska RPF decision poochho; andaza mat lagao.</p></div>

<div class="iv"><p class="q">"RPF failure kya hai aur use fix kaise karte hain?"</p><p>RPF check maangta hai ki source S ka multicast data us interface par aaye jise unicast routing S tak pahunchne ke liye use karti, aur uske peeche PIM neighbour ho. Failure ka matlab source tak best unicast path aise interface se jaata hai jis par PIM nahi ya PIM neighbour nahi. Main show multicast rpf SOURCE chalata hoon, phir ya sahi link par PIM enable karta hoon, ya unicast routing theek karta hoon, ya inet.2 route aur rib-group se PIM ko apni table deta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSM seedha (S,G) join karta hai; RP, Register, MSDP nahi; default 232/8.</li>
<li>SSM ko receiver LAN par IGMPv3 chahiye (ya v2 hosts ke liye SSM mapping).</li>
<li>RPF check joins aur data validate karta hai; show multicast rpf SOURCE decision dikhata hai.</li>
<li>PIM ko inet.2 ki taraf point karne wala rib-group multicast ko unicast se alag path deta hai.</li>
<li>Upstream state "None (RPF check failed)" routing ya PIM neighbour problem hai.</li>
</ul></div>
`}};export{e as default};