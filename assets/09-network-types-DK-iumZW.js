var e={id:`network-types`,h:{en:`Network types: broadcast, point-to-point, NBMA and point-to-multipoint`,hi:`Network types: broadcast, point-to-point, NBMA aur point-to-multipoint`},body:{en:`
<p>Imagine three kinds of meeting. In a conference room everyone hears everyone, so you elect a chairperson to take minutes (a <b>broadcast</b> network with a DR). On a phone call between two people there is nothing to elect (<b>point-to-point</b>). On a call centre switchboard, nobody can shout to the room; the operator must dial each person individually (<b>non-broadcast</b>). The OSPF network type tells the router which kind of meeting it is in, and therefore how to find neighbours, whether to elect a DR, and which timers to use.</p>

<h3>The five network types</h3>
<table class="cmp"><tr><th>Network type</th><th>Default on</th><th>Hello / Dead</th><th>DR/BDR</th><th>Neighbours</th></tr>
<tr><td>Broadcast</td><td>Ethernet</td><td>10 / 40</td><td>Yes</td><td>Discovered by multicast 224.0.0.5</td></tr>
<tr><td>Point-to-point</td><td>Serial (HDLC, PPP), GRE tunnels</td><td>10 / 40</td><td>No</td><td>Discovered by multicast</td></tr>
<tr><td>Non-broadcast (NBMA)</td><td>Frame Relay physical interfaces (historic)</td><td>30 / 120</td><td>Yes</td><td>Manual <code>neighbor</code> statements, unicast Hellos</td></tr>
<tr><td>Point-to-multipoint</td><td>Never default; configured</td><td>30 / 120</td><td>No</td><td>Discovered by multicast</td></tr>
<tr><td>Point-to-multipoint non-broadcast</td><td>Never default; configured</td><td>30 / 120</td><td>No</td><td>Manual <code>neighbor</code> statements</td></tr>
</table>
<p>Loopbacks have their own type, LOOPBACK, and are always advertised as a /32 host route unless you set <code>ip ospf network point-to-point</code> on them. Frame Relay itself has disappeared from most networks, but the exam still tests NBMA and point-to-multipoint, and the same ideas apply to hub-and-spoke overlays such as DMVPN (covered in a later module) and to provider services that do not carry multicast.</p>

<h3>Non-broadcast: neighbours by hand, and a hub that must be DR</h3>
<p>On an NBMA cloud a router cannot send a multicast Hello to "everyone", so you list each neighbour's address. A DR is still elected, and because the spokes usually cannot talk to each other directly, the DR <b>must be the hub</b>: only it has a direct circuit to every spoke. Set spoke priority to 0 so they can never win.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="NBMA hub and spoke">
<rect x="250" y="20" width="140" height="55" rx="8" fill="#ddd6fe"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">HUB 10.10.0.1</text><text x="320" y="63" text-anchor="middle" class="svg-accent" font-size="12">DR, neighbor x2</text>
<rect x="60" y="150" width="160" height="55" rx="8" fill="#bbf7d0"/><text x="140" y="174" text-anchor="middle" class="svg-ink" font-size="13">SPOKE1 10.10.0.2</text><text x="140" y="193" text-anchor="middle" class="svg-muted" font-size="12">priority 0</text>
<rect x="420" y="150" width="160" height="55" rx="8" fill="#bbf7d0"/><text x="500" y="174" text-anchor="middle" class="svg-ink" font-size="13">SPOKE2 10.10.0.3</text><text x="500" y="193" text-anchor="middle" class="svg-muted" font-size="12">priority 0</text>
<line x1="290" y1="75" x2="160" y2="150" stroke="#64748b" stroke-width="2"/><line x1="350" y1="75" x2="480" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="220" y1="178" x2="420" y2="178" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">no direct circuit</text>
<text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="12">10.10.0.0/24, one subnet</text>
</svg><p class="cap">One subnet, but spokes cannot reach each other at Layer 2. Only the hub can be DR.</p></div>

<pre class="code"><span class="c">! HUB</span>
interface GigabitEthernet0/2
 ip address 10.10.0.1 255.255.255.0
 ip ospf network non-broadcast
router ospf 1
 neighbor 10.10.0.2
 neighbor 10.10.0.3
<span class="c">! Each SPOKE</span>
interface GigabitEthernet0/0
 ip ospf network non-broadcast
 ip ospf priority 0</pre>
<pre class="out">HUB#show ip ospf interface GigabitEthernet0/2 | include Type|Timer|State
  Process ID 1, Router ID 10.0.0.1, <span class="hl">Network Type NON_BROADCAST</span>, Cost: 1
  Transmit Delay is 1 sec, State DR, Priority 1
<span class="hl">  Timer intervals configured, Hello 30, Dead 120, Wait 120, Retransmit 5</span>

HUB#show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.0.0.2          0   FULL/DROTHER    00:01:51    10.10.0.2       GigabitEthernet0/2
10.0.0.3          0   FULL/DROTHER    00:01:44    10.10.0.3       GigabitEthernet0/2</pre>
<p>Configuring <code>neighbor</code> on the hub is enough, because a spoke answers the unicast Hellos it receives. Many engineers configure it on both sides anyway for clarity.</p>

<h3>Point-to-multipoint: no DR, host routes instead</h3>
<p>Point-to-multipoint treats the cloud as a collection of point-to-point links. There is no DR, so the "wrong DR" problem disappears. Each router advertises its own interface address as a <b>/32 host route</b>, and spokes reach each other through the hub, which becomes the next hop. The plain version uses multicast Hellos (the cloud must replicate them, for example with pseudo-broadcast); the <code>non-broadcast</code> variant uses <code>neighbor</code> statements and also lets you set a per-neighbour cost with <code>neighbor 10.10.0.3 cost 50</code>.</p>
<pre class="code">interface GigabitEthernet0/2
 ip ospf network point-to-multipoint</pre>
<pre class="out">SPOKE1#show ip route ospf | include 10.10.0
O        10.10.0.1/32 [110/1] via 10.10.0.1, 00:02:10, GigabitEthernet0/0
<span class="hl">O        10.10.0.3/32 [110/2] via 10.10.0.1, 00:02:10, GigabitEthernet0/0</span>

SPOKE1#show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">10.0.0.1          0   FULL/  -        00:01:57    10.10.0.1       GigabitEthernet0/0</span></pre>

<h3>What happens when the types do not match</h3>
<ul>
<li><b>Different timers</b> (broadcast 10/40 against non-broadcast or point-to-multipoint 30/120): Hellos are rejected, no neighbour at all. Debug shows "Mismatched hello parameters".</li>
<li><b>Same timers, DR type against non-DR type</b> (broadcast against point-to-point, or non-broadcast against point-to-multipoint with tuned timers): the adjacency can reach FULL, but one router describes the link as a transit network with a DR and the other as point-to-point. The SPF two-way check fails and routes behind the link are missing. FULL neighbour, missing routes: think network type.</li>
<li><b>Two DR-capable types with priority 0 everywhere</b>: no DR can be elected, neighbours stay in 2-WAY/DROTHER and no network LSA is created.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A two-router Ethernet link uses the default broadcast type. Adding <code>ip ospf network point-to-point</code> on both ends skips the 40-second wait for DR election, removes a type-2 LSA from the area and makes the link appear as a simple point-to-point link in both router LSAs. Configured on only one end, the neighbour still reaches FULL (timers are both 10/40) but the routes over it disappear.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Leaving a spoke with priority 1 on an NBMA network: after the hub reloads, a spoke becomes DR and other spokes lose routes. Forgetting <code>neighbor</code> statements on non-broadcast and waiting for a neighbour that never comes. Changing the network type on one end only.</p></div>

<div class="exam"><p><b>Exam trap.</b> Remember the timer pairs: 10/40 for broadcast and point-to-point, 30/120 for non-broadcast and both point-to-multipoint types. And only non-broadcast and point-to-multipoint non-broadcast need the <code>neighbor</code> command.</p></div>

<div class="scn"><h4>The spoke that became DR</h4><p>A retailer's hub router in an NBMA hub-and-spoke network reloaded for an upgrade. While it was down, the spokes elected one of themselves as DR. When the hub returned it did not pre-empt (OSPF DR election is not pre-emptive), so store-to-store routes pointed at a DR that had no circuits to the other stores. <code>show ip ospf neighbor</code> on the hub showed a spoke as DR. Setting <code>ip ospf priority 0</code> on every spoke and clearing the OSPF process restored the hub as DR, and the problem never came back after later reloads.</p><p><b>Lesson:</b> on hub-and-spoke NBMA, design the DR election, do not leave it to chance.</p></div>

<div class="iv"><p class="q">"Compare the non-broadcast and point-to-multipoint network types."</p><p>Strong answer: both default to 30/120 timers. Non-broadcast elects a DR and BDR and needs manual <code>neighbor</code> statements; on hub-and-spoke the hub must be DR, so spokes get priority 0. Point-to-multipoint elects no DR, discovers neighbours with multicast, advertises /32 host routes and uses the hub as next hop between spokes, which is simpler and more robust. Mention the non-broadcast variant of point-to-multipoint for clouds without multicast and its per-neighbour cost.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Broadcast and point-to-point: 10/40. Non-broadcast and point-to-multipoint: 30/120.</li>
<li>DR/BDR only on broadcast and non-broadcast; non-broadcast needs <code>neighbor</code> statements.</li>
<li>On NBMA hub-and-spoke the hub must be DR: spokes use <code>ip ospf priority 0</code>.</li>
<li>Point-to-multipoint: no DR, /32 host routes, hub as next hop.</li>
<li>FULL neighbour but missing routes often means mismatched network types.</li>
</ul></div>
`,hi:`
<p>Teen tarah ki meetings socho. Conference room mein sab sabko sunte hain, isliye minutes likhne ke liye ek chairperson chunte ho (DR wala <b>broadcast</b> network). Do logon ke beech phone call mein chunne ko kuch nahi (<b>point-to-point</b>). Call centre ke switchboard par koi room mein chilla nahi sakta; operator ko har insaan ko alag se dial karna padta hai (<b>non-broadcast</b>). OSPF network type router ko batata hai ki woh kis tarah ki meeting mein hai, aur isliye neighbours kaise dhoondhe, DR chune ya nahi, aur kaunse timers use kare.</p>

<h3>Paanch network types</h3>
<table class="cmp"><tr><th>Network type</th><th>Default kahan</th><th>Hello / Dead</th><th>DR/BDR</th><th>Neighbours</th></tr>
<tr><td>Broadcast</td><td>Ethernet</td><td>10 / 40</td><td>Haan</td><td>Multicast 224.0.0.5 se discover</td></tr>
<tr><td>Point-to-point</td><td>Serial (HDLC, PPP), GRE tunnels</td><td>10 / 40</td><td>Nahi</td><td>Multicast se discover</td></tr>
<tr><td>Non-broadcast (NBMA)</td><td>Frame Relay physical interfaces (purana)</td><td>30 / 120</td><td>Haan</td><td>Manual <code>neighbor</code> statements, unicast Hellos</td></tr>
<tr><td>Point-to-multipoint</td><td>Kabhi default nahi; configure hota hai</td><td>30 / 120</td><td>Nahi</td><td>Multicast se discover</td></tr>
<tr><td>Point-to-multipoint non-broadcast</td><td>Kabhi default nahi; configure hota hai</td><td>30 / 120</td><td>Nahi</td><td>Manual <code>neighbor</code> statements</td></tr>
</table>
<p>Loopbacks ka apna type hai, LOOPBACK, aur woh hamesha /32 host route ke roop mein advertise hote hain jab tak aap un par <code>ip ospf network point-to-point</code> set na karo. Frame Relay khud zyada tar networks se gayab ho chuka hai, lekin exam ab bhi NBMA aur point-to-multipoint test karta hai, aur yahi ideas DMVPN jaise hub-and-spoke overlays (baad ke module mein) aur multicast na le jaane wali provider services par lagu hote hain.</p>

<h3>Non-broadcast: haath se neighbours, aur hub ka DR hona zaroori</h3>
<p>NBMA cloud par router "sabko" multicast Hello nahi bhej sakta, isliye aap har neighbour ka address list karte ho. DR ab bhi chuna jaata hai, aur kyunki spokes aam taur par ek doosre se seedhe baat nahi kar sakte, DR <b>hub hi hona chahiye</b>: sirf uske paas har spoke tak direct circuit hai. Spoke priority 0 set karo taaki woh kabhi jeet na sakein.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="NBMA hub aur spoke">
<rect x="250" y="20" width="140" height="55" rx="8" fill="#ddd6fe"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">HUB 10.10.0.1</text><text x="320" y="63" text-anchor="middle" class="svg-accent" font-size="12">DR, neighbor x2</text>
<rect x="60" y="150" width="160" height="55" rx="8" fill="#bbf7d0"/><text x="140" y="174" text-anchor="middle" class="svg-ink" font-size="13">SPOKE1 10.10.0.2</text><text x="140" y="193" text-anchor="middle" class="svg-muted" font-size="12">priority 0</text>
<rect x="420" y="150" width="160" height="55" rx="8" fill="#bbf7d0"/><text x="500" y="174" text-anchor="middle" class="svg-ink" font-size="13">SPOKE2 10.10.0.3</text><text x="500" y="193" text-anchor="middle" class="svg-muted" font-size="12">priority 0</text>
<line x1="290" y1="75" x2="160" y2="150" stroke="#64748b" stroke-width="2"/><line x1="350" y1="75" x2="480" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="220" y1="178" x2="420" y2="178" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">direct circuit nahi</text>
<text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="12">10.10.0.0/24, ek subnet</text>
</svg><p class="cap">Ek subnet, lekin spokes Layer 2 par ek doosre tak nahi pahunch sakte. Sirf hub DR ban sakta hai.</p></div>

<pre class="code"><span class="c">! HUB</span>
interface GigabitEthernet0/2
 ip address 10.10.0.1 255.255.255.0
 ip ospf network non-broadcast
router ospf 1
 neighbor 10.10.0.2
 neighbor 10.10.0.3
<span class="c">! Har SPOKE</span>
interface GigabitEthernet0/0
 ip ospf network non-broadcast
 ip ospf priority 0</pre>
<pre class="out">HUB#show ip ospf interface GigabitEthernet0/2 | include Type|Timer|State
  Process ID 1, Router ID 10.0.0.1, <span class="hl">Network Type NON_BROADCAST</span>, Cost: 1
  Transmit Delay is 1 sec, State DR, Priority 1
<span class="hl">  Timer intervals configured, Hello 30, Dead 120, Wait 120, Retransmit 5</span>

HUB#show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.0.0.2          0   FULL/DROTHER    00:01:51    10.10.0.2       GigabitEthernet0/2
10.0.0.3          0   FULL/DROTHER    00:01:44    10.10.0.3       GigabitEthernet0/2</pre>
<p>Hub par <code>neighbor</code> configure karna kaafi hai, kyunki spoke use milne wale unicast Hellos ka jawab deta hai. Kai engineers clarity ke liye dono sides par configure karte hain.</p>

<h3>Point-to-multipoint: DR nahi, uski jagah host routes</h3>
<p>Point-to-multipoint cloud ko point-to-point links ka collection maanta hai. Koi DR nahi, isliye "galat DR" wali problem gayab ho jaati hai. Har router apna interface address <b>/32 host route</b> ke roop mein advertise karta hai, aur spokes hub ke through ek doosre tak pahunchte hain, jo next hop ban jaata hai. Plain version multicast Hellos use karta hai (cloud ko unhe replicate karna padta hai, jaise pseudo-broadcast se); <code>non-broadcast</code> variant <code>neighbor</code> statements use karta hai aur <code>neighbor 10.10.0.3 cost 50</code> se per-neighbour cost set karne deta hai.</p>
<pre class="code">interface GigabitEthernet0/2
 ip ospf network point-to-multipoint</pre>
<pre class="out">SPOKE1#show ip route ospf | include 10.10.0
O        10.10.0.1/32 [110/1] via 10.10.0.1, 00:02:10, GigabitEthernet0/0
<span class="hl">O        10.10.0.3/32 [110/2] via 10.10.0.1, 00:02:10, GigabitEthernet0/0</span>

SPOKE1#show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">10.0.0.1          0   FULL/  -        00:01:57    10.10.0.1       GigabitEthernet0/0</span></pre>

<h3>Jab types match nahi karte to kya hota hai</h3>
<ul>
<li><b>Alag timers</b> (broadcast 10/40 vs non-broadcast ya point-to-multipoint 30/120): Hellos reject hote hain, koi neighbour nahi. Debug "Mismatched hello parameters" dikhata hai.</li>
<li><b>Same timers, DR type vs non-DR type</b> (broadcast vs point-to-point, ya tuned timers ke saath non-broadcast vs point-to-multipoint): adjacency FULL tak pahunch sakti hai, lekin ek router link ko DR wala transit network batata hai aur doosra point-to-point. SPF two-way check fail hota hai aur link ke peeche ke routes gayab hote hain. FULL neighbour, missing routes: network type socho.</li>
<li><b>Har jagah priority 0 wale do DR-capable types</b>: koi DR chuna nahi ja sakta, neighbours 2-WAY/DROTHER mein rehte hain aur koi network LSA nahi banta.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Do routers ka Ethernet link default broadcast type use karta hai. Dono ends par <code>ip ospf network point-to-point</code> jodne se DR election ka 40 second wait skip hota hai, area se ek type-2 LSA hat jaata hai aur link dono router LSAs mein simple point-to-point link dikhta hai. Sirf ek end par configure kiya to neighbour phir bhi FULL pahunchta hai (dono timers 10/40 hain) lekin uske upar ke routes gayab ho jaate hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> NBMA network par spoke ko priority 1 par chhodna: hub reload ke baad spoke DR ban jaata hai aur doosre spokes routes kho dete hain. Non-broadcast par <code>neighbor</code> statements bhoolna aur aise neighbour ka wait karna jo kabhi nahi aata. Network type sirf ek end par badalna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Timer pairs yaad rakho: broadcast aur point-to-point ke liye 10/40, non-broadcast aur dono point-to-multipoint types ke liye 30/120. Aur sirf non-broadcast aur point-to-multipoint non-broadcast ko <code>neighbor</code> command chahiye.</p></div>

<div class="scn"><h4>Woh spoke jo DR ban gaya</h4><p>Ek retailer ka NBMA hub-and-spoke network mein hub router upgrade ke liye reload hua. Jab woh down tha, spokes ne apne mein se ek ko DR chun liya. Hub wapas aaya to usne pre-empt nahi kiya (OSPF DR election pre-emptive nahi hai), isliye store-to-store routes aise DR ko point kar rahe the jiske paas doosre stores tak circuits hi nahi the. Hub par <code>show ip ospf neighbor</code> ne ek spoke ko DR dikhaya. Har spoke par <code>ip ospf priority 0</code> set karke OSPF process clear karne se hub wapas DR bana, aur baad ke reloads mein problem kabhi wapas nahi aayi.</p><p><b>Lesson:</b> hub-and-spoke NBMA par DR election design karo, kismat par mat chhodo.</p></div>

<div class="iv"><p class="q">"Non-broadcast aur point-to-multipoint network types ko compare karo."</p><p>Strong answer: dono ke default timers 30/120 hain. Non-broadcast DR aur BDR chunta hai aur manual <code>neighbor</code> statements chahiye; hub-and-spoke par hub DR hona chahiye, isliye spokes ko priority 0 milti hai. Point-to-multipoint koi DR nahi chunta, multicast se neighbours discover karta hai, /32 host routes advertise karta hai aur spokes ke beech hub ko next hop use karta hai, jo simple aur zyada robust hai. Bina multicast wale clouds ke liye point-to-multipoint ka non-broadcast variant aur uski per-neighbour cost bhi mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Broadcast aur point-to-point: 10/40. Non-broadcast aur point-to-multipoint: 30/120.</li>
<li>DR/BDR sirf broadcast aur non-broadcast par; non-broadcast ko <code>neighbor</code> statements chahiye.</li>
<li>NBMA hub-and-spoke par hub DR hona chahiye: spokes <code>ip ospf priority 0</code> use karte hain.</li>
<li>Point-to-multipoint: DR nahi, /32 host routes, hub next hop.</li>
<li>FULL neighbour lekin missing routes ka matlab aksar mismatched network types hota hai.</li>
</ul></div>
`}};export{e as default};