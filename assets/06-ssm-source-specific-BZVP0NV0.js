var e={id:`ssm-source-specific`,h:{en:`Source-specific multicast: channels without an RP`,hi:`Source-specific multicast: bina RP ke channels`},body:{en:`
<p>Sparse mode with an RP has a hidden cost. A receiver that joins (*,G) says "send me group G from anybody". Anybody means any host that decides to transmit to G: the wrong camera, a test box, an attacker. And somebody must run the RP. <b>Source-Specific Multicast (SSM)</b> removes both problems by changing one idea: the receiver names the source as well.</p>

<h3>The channel idea</h3>
<p>Think of a TV remote. You do not ask for "whatever is on frequency 7". You ask for "channel 7 from this broadcaster". In SSM a <b>channel</b> is the pair <b>(S,G)</b>: source address plus group address. Two different encoders can both use 232.50.0.1 and nobody mixes them up, because the channel is the pair. Because the receiver already knows the source, its last-hop router can send the join <b>straight toward the source</b>, using the normal RPF lookup. There is no RP, no Register, no shared tree and no switchover. The tree is the shortest-path tree from the first message.</p>
<ul>
<li><b>Group range.</b> SSM uses <b>232.0.0.0/8</b> by default. You can add your own range with an ACL.</li>
<li><b>Receivers need IGMPv3.</b> Only IGMPv3 can carry a source address (INCLUDE mode). An IGMPv2 report names only the group, so the router cannot build an (S,G) join.</li>
<li><b>Routers need to treat the range as SSM</b> with <code>ip pim ssm</code>, so that they never try to find an RP for it.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="SSM channel">
<rect x="10" y="20" width="110" height="46" rx="8" fill="#fde68a"/><text x="65" y="40" text-anchor="middle" class="svg-ink" font-size="13">PC1 live</text><text x="65" y="57" text-anchor="middle" class="svg-muted" font-size="11">10.50.1.10</text>
<rect x="10" y="130" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="65" y="150" text-anchor="middle" class="svg-ink" font-size="13">PC2 test</text><text x="65" y="167" text-anchor="middle" class="svg-muted" font-size="11">10.50.1.20</text>
<rect x="170" y="75" width="70" height="46" rx="8" fill="#bae6fd"/><text x="205" y="103" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="300" y="75" width="70" height="46" rx="8" fill="#bae6fd"/><text x="335" y="103" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<rect x="430" y="75" width="70" height="46" rx="8" fill="#bae6fd"/><text x="465" y="103" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<rect x="545" y="75" width="85" height="46" rx="8" fill="#bbf7d0"/><text x="587" y="95" text-anchor="middle" class="svg-ink" font-size="13">PC3 STB</text><text x="587" y="111" text-anchor="middle" class="svg-muted" font-size="11">IGMPv3</text>
<line x1="120" y1="43" x2="170" y2="90" stroke="#64748b"/><line x1="120" y1="153" x2="170" y2="108" stroke="#64748b" stroke-dasharray="4 3"/><line x1="240" y1="98" x2="300" y2="98" stroke="#64748b"/><line x1="370" y1="98" x2="430" y2="98" stroke="#64748b"/><line x1="500" y1="98" x2="545" y2="98" stroke="#64748b"/>
<text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="12">Join (10.50.1.10, 232.50.0.1) travels toward the source: no RP</text>
</svg><p class="cap">The test encoder PC2 also sends to 232.50.0.1, but nobody asked for (10.50.1.20, 232.50.0.1), so its packets go no further than R1.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! R1, R2 and R3: treat 232.0.0.0/8 as SSM (no RP for it)</span>
ip pim ssm default

<span class="c">! R3, viewer LAN: accept source-specific reports</span>
interface GigabitEthernet0/0
 ip igmp version 3</pre>
<p>To use a different group range, for example an enterprise range inside the admin-scoped block, give it an ACL: <code>ip pim ssm range SSM-RANGE</code> with a standard ACL permitting, say, 239.232.0.0 0.0.255.255. Every router in the tree must have the same definition.</p>
<p>The receiver in the simulator joins with <code>join 232.50.0.1 source 10.50.1.10</code>. A real set-top box does the same inside its IGMPv3 stack.</p>

<h3>Verification</h3>
<pre class="out">R3#show ip pim rp mapping
PIM Group-to-RP Mappings

<span class="hl">Group(s): 232.0.0.0/8, SSM (no RP)</span>

R3#show ip igmp interface g0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 10.50.3.1/24
  IGMP is enabled on interface
  <span class="hl">Current IGMP host version is 3</span>
  <span class="hl">Current IGMP router version is 3</span>
  ...

R3#show ip mroute 232.50.0.1
(10.50.1.10, 232.50.0.1), 00:01:39/00:02:21, flags: <span class="hl">sTI</span>
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:01:39/00:02:51

PC3#show mcast
Group            Source filter        Joined     Packets received
232.50.0.1       <span class="hl">include 10.50.1.10</span>   00:02:39   5</pre>
<p>There is no (*,G) anywhere. The entry key is the pair (10.50.1.10, 232.50.0.1) and the flags are <b>s</b> (SSM group), <b>T</b> (SPT bit) and <b>I</b> (the router received a source-specific host report). The routers in the middle show <b>sT</b> without <b>I</b>. The PC reports <b>include 10.50.1.10</b>: it accepts packets from that one source only.</p>
<p>Now both encoders transmit five packets to 232.50.0.1. PC3 counted exactly 5 packets (the live encoder's). On R2, <code>show ip mroute 232.50.0.1</code> lists only the (10.50.1.10, 232.50.0.1) entry and no entry for 10.50.1.20: the test stream stopped at R1 because no router had a join for that pair.</p>

<h3>What happens with IGMPv2 on the viewer LAN</h3>
<p>If the LAN interface stays at the default version 2, the router still lists the group in <code>show ip igmp groups</code> but it cannot build a tree:</p>
<pre class="out">R3#show ip igmp groups
Group Address    Interface                Uptime    Expires   Last Reporter   Group Accounted
232.50.0.1       GigabitEthernet0/0       00:00:12  00:02:48  10.50.3.10

R3#show ip mroute 232.50.0.1
<span class="hl">Group 232.50.0.1 not found</span></pre>
<p>This is the classic SSM fault: IGMP shows a member, the mroute table shows nothing. Look at the IGMP version first.</p>

<table class="cmp"><tr><th></th><th>ASM (sparse mode with RP)</th><th>SSM</th></tr>
<tr><td>Receiver asks for</td><td>(*,G): any source</td><td>(S,G): one source</td></tr>
<tr><td>Needs an RP, register, MSDP</td><td>Yes</td><td>No</td></tr>
<tr><td>IGMP version on the LAN</td><td>2 or 3</td><td>3</td></tr>
<tr><td>Unwanted senders</td><td>Can reach receivers</td><td>Ignored: not in any join</td></tr>
<tr><td>Group range</td><td>224/4 except SSM ranges</td><td>232.0.0.0/8 (or your own range)</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Deccan Broadcast runs 24 channels, each from its own encoder. Choosing group addresses from 232.50.0.0/16 and one source per channel gives 24 (S,G) entries per last-hop router at most, no RP to size, no MSDP between sites, and a test encoder that cannot disturb viewers.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Enabling <code>ip pim ssm default</code> on some routers only: a router without it still looks for an RP for the group. (2) Leaving IGMP at version 2 on the receiver LAN. (3) Using a group outside the SSM range for source-specific joins: the router treats it as ASM and needs an RP.</p></div>
<div class="exam"><p><b>Exam trap.</b> SSM needs no RP, but sparse-mode PIM must still be enabled on every interface: SSM is a mode of the same PIM-SM protocol, not a new one. IGMPv3 is needed only at the receiver edge.</p></div>

<div class="scn"><h4>The test box on air</h4><p>During a rehearsal at Deccan Broadcast, viewers saw a colour-bar test pattern flash into the news channel for two seconds. A technician had started a test encoder on the same group address, 239.50.0.1, as the live feed. Because the viewers had joined (*,G), the RP forwarded both sources. After moving all channels into 232.50.0.0/16 and enabling IGMPv3 on the set-top LANs, the test encoder could transmit on the same group number without reaching any viewer.</p><p><b>Lesson:</b> SSM protects the stream from unwanted sources by design, and removes the RP from the picture.</p></div>

<div class="iv"><p class="q">"Why would you choose SSM over ASM with an RP?"</p><p>Strong answer: when the source is known in advance, such as IPTV, market data or a lecture server. SSM builds the shortest-path tree directly, with no RP, no register process, no MSDP, and receivers are protected from other sources on the same group. It requires IGMPv3 on the receiver LAN and the range configured as SSM on every router. Mention 232/8 and <code>ip pim ssm default</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A channel is the pair (S,G); the join goes straight toward the source, with no RP.</li>
<li>Default range 232.0.0.0/8; <code>ip pim ssm default</code> on every router, or <code>ip pim ssm range ACL</code>.</li>
<li>IGMPv3 on the receiver LAN: a v2 LAN shows the group in IGMP but no mroute entry.</li>
<li>Flags: s on SSM entries, I on the last-hop router that received a source-specific report.</li>
<li>Other sources sending to the same group are ignored.</li>
</ul></div>
`,hi:`
<p>RP wale sparse mode ki ek chhupi keemat hai. Jo receiver (*,G) join karta hai woh kehta hai "mujhe group G kisi se bhi bhejo". Kisi se bhi ka matlab koi bhi host jo G par transmit karne ka faisla kare: galat camera, test box, attacker. Aur kisi ko RP chalana padta hai. <b>Source-Specific Multicast (SSM)</b> ek idea badalkar dono problems hata deta hai: receiver source ka naam bhi batata hai.</p>

<h3>Channel ka idea</h3>
<p>TV remote socho. Aap "frequency 7 par jo bhi aa raha hai" nahi maangte. Aap maangte ho "channel 7 is broadcaster se". SSM mein <b>channel</b> ek jodi hai <b>(S,G)</b>: source address plus group address. Do alag encoders dono 232.50.0.1 use kar sakte hain aur koi gadbad nahi hoti, kyunki channel jodi hai. Receiver ko source pehle se pata hai, isliye uska last-hop router join ko normal RPF lookup se <b>seedha source ki taraf</b> bhej sakta hai. RP nahi, Register nahi, shared tree nahi aur switchover nahi. Tree pehle message se hi shortest-path tree hota hai.</p>
<ul>
<li><b>Group range.</b> SSM default mein <b>232.0.0.0/8</b> use karta hai. Aap ACL se apni range jod sakte ho.</li>
<li><b>Receivers ko IGMPv3 chahiye.</b> Sirf IGMPv3 source address le ja sakta hai (INCLUDE mode). IGMPv2 report sirf group ka naam batati hai, isliye router (S,G) join nahi bana sakta.</li>
<li><b>Routers ko range SSM maanni hogi</b> <code>ip pim ssm</code> se, taaki woh us range ke liye RP dhoondhne ki koshish kabhi na karein.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="SSM channel">
<rect x="10" y="20" width="110" height="46" rx="8" fill="#fde68a"/><text x="65" y="40" text-anchor="middle" class="svg-ink" font-size="13">PC1 live</text><text x="65" y="57" text-anchor="middle" class="svg-muted" font-size="11">10.50.1.10</text>
<rect x="10" y="130" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="65" y="150" text-anchor="middle" class="svg-ink" font-size="13">PC2 test</text><text x="65" y="167" text-anchor="middle" class="svg-muted" font-size="11">10.50.1.20</text>
<rect x="170" y="75" width="70" height="46" rx="8" fill="#bae6fd"/><text x="205" y="103" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="300" y="75" width="70" height="46" rx="8" fill="#bae6fd"/><text x="335" y="103" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<rect x="430" y="75" width="70" height="46" rx="8" fill="#bae6fd"/><text x="465" y="103" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<rect x="545" y="75" width="85" height="46" rx="8" fill="#bbf7d0"/><text x="587" y="95" text-anchor="middle" class="svg-ink" font-size="13">PC3 STB</text><text x="587" y="111" text-anchor="middle" class="svg-muted" font-size="11">IGMPv3</text>
<line x1="120" y1="43" x2="170" y2="90" stroke="#64748b"/><line x1="120" y1="153" x2="170" y2="108" stroke="#64748b" stroke-dasharray="4 3"/><line x1="240" y1="98" x2="300" y2="98" stroke="#64748b"/><line x1="370" y1="98" x2="430" y2="98" stroke="#64748b"/><line x1="500" y1="98" x2="545" y2="98" stroke="#64748b"/>
<text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="12">Join (10.50.1.10, 232.50.0.1) source ki taraf jaata hai: RP nahi</text>
</svg><p class="cap">Test encoder PC2 bhi 232.50.0.1 par bhejta hai, par (10.50.1.20, 232.50.0.1) kisi ne maanga nahi, isliye uske packets R1 se aage nahi jaate.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! R1, R2 aur R3: 232.0.0.0/8 ko SSM maano (is range ke liye RP nahi)</span>
ip pim ssm default

<span class="c">! R3, viewer LAN: source-specific reports accept karo</span>
interface GigabitEthernet0/0
 ip igmp version 3</pre>
<p>Alag group range use karne ke liye, jaise admin-scoped block ke andar enterprise range, use ACL do: <code>ip pim ssm range SSM-RANGE</code> aur ek standard ACL jo, maano, 239.232.0.0 0.0.255.255 permit kare. Tree ke har router par same definition honi chahiye.</p>
<p>Simulator mein receiver <code>join 232.50.0.1 source 10.50.1.10</code> se join karta hai. Asli set-top box yahi apne IGMPv3 stack ke andar karta hai.</p>

<h3>Verification</h3>
<pre class="out">R3#show ip pim rp mapping
PIM Group-to-RP Mappings

<span class="hl">Group(s): 232.0.0.0/8, SSM (no RP)</span>

R3#show ip igmp interface g0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 10.50.3.1/24
  IGMP is enabled on interface
  <span class="hl">Current IGMP host version is 3</span>
  <span class="hl">Current IGMP router version is 3</span>
  ...

R3#show ip mroute 232.50.0.1
(10.50.1.10, 232.50.0.1), 00:01:39/00:02:21, flags: <span class="hl">sTI</span>
  Incoming interface: GigabitEthernet0/2, RPF nbr 10.0.23.2
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:01:39/00:02:51

PC3#show mcast
Group            Source filter        Joined     Packets received
232.50.0.1       <span class="hl">include 10.50.1.10</span>   00:02:39   5</pre>
<p>Kahin bhi (*,G) nahi hai. Entry ki key jodi (10.50.1.10, 232.50.0.1) hai aur flags <b>s</b> (SSM group), <b>T</b> (SPT bit) aur <b>I</b> (router ko source-specific host report mili) hain. Beech ke routers <b>I</b> ke bina <b>sT</b> dikhate hain. PC <b>include 10.50.1.10</b> report karta hai: woh sirf us ek source ke packets accept karta hai.</p>
<p>Ab dono encoders 232.50.0.1 par paanch paanch packets transmit karte hain. PC3 ne theek 5 packets gine (live encoder ke). R2 par <code>show ip mroute 232.50.0.1</code> sirf (10.50.1.10, 232.50.0.1) entry list karta hai aur 10.50.1.20 ki koi entry nahi: test stream R1 par ruk gayi kyunki us jodi ke liye kisi router ke paas join nahi tha.</p>

<h3>Viewer LAN par IGMPv2 ho to kya hota hai</h3>
<p>Agar LAN interface default version 2 par rahe, to router group ko <code>show ip igmp groups</code> mein phir bhi list karta hai par tree nahi bana sakta:</p>
<pre class="out">R3#show ip igmp groups
Group Address    Interface                Uptime    Expires   Last Reporter   Group Accounted
232.50.0.1       GigabitEthernet0/0       00:00:12  00:02:48  10.50.3.10

R3#show ip mroute 232.50.0.1
<span class="hl">Group 232.50.0.1 not found</span></pre>
<p>Yeh classic SSM fault hai: IGMP member dikhata hai, mroute table kuch nahi dikhati. Sabse pehle IGMP version dekho.</p>

<table class="cmp"><tr><th></th><th>ASM (RP ke saath sparse mode)</th><th>SSM</th></tr>
<tr><td>Receiver kya maangta hai</td><td>(*,G): koi bhi source</td><td>(S,G): ek source</td></tr>
<tr><td>RP, register, MSDP chahiye</td><td>Haan</td><td>Nahi</td></tr>
<tr><td>LAN par IGMP version</td><td>2 ya 3</td><td>3</td></tr>
<tr><td>Unwanted senders</td><td>Receivers tak pahunch sakte hain</td><td>Ignore: kisi join mein nahi</td></tr>
<tr><td>Group range</td><td>224/4, SSM ranges ko chhodkar</td><td>232.0.0.0/8 (ya aapki apni range)</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Deccan Broadcast 24 channels chalata hai, har ek apne encoder se. 232.50.0.0/16 se group addresses aur har channel ke liye ek source chunne par har last-hop router par zyada se zyada 24 (S,G) entries, size karne ke liye koi RP nahi, sites ke beech MSDP nahi, aur ek test encoder jo viewers ko disturb nahi kar sakta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) <code>ip pim ssm default</code> sirf kuch routers par lagana: jis router par nahi hai woh phir bhi group ke liye RP dhoondhta hai. (2) Receiver LAN par IGMP ko version 2 par chhod dena. (3) Source-specific joins ke liye SSM range se bahar ka group use karna: router ise ASM maanta hai aur use RP chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> SSM ko RP nahi chahiye, par har interface par sparse-mode PIM on hona zaroori hai: SSM usi PIM-SM protocol ka ek mode hai, naya protocol nahi. IGMPv3 sirf receiver edge par chahiye.</p></div>

<div class="scn"><h4>Test box on air</h4><p>Deccan Broadcast ke rehearsal ke dauraan viewers ne dekha ki news channel mein do second ke liye colour-bar test pattern chamak gaya. Ek technician ne live feed wale hi group address, 239.50.0.1, par test encoder shuru kar diya tha. Viewers ne (*,G) join kiya tha, isliye RP ne dono sources forward kar diye. Saare channels ko 232.50.0.0/16 mein le jaakar aur set-top LANs par IGMPv3 on karne ke baad test encoder usi group number par transmit kar sakta tha bina kisi viewer tak pahunche.</p><p><b>Seekh:</b> SSM design se hi stream ko unwanted sources se bachata hai, aur RP ko picture se hata deta hai.</p></div>

<div class="iv"><p class="q">"ASM with RP ki jagah SSM kyun chunoge?"</p><p>Strong answer: jab source pehle se pata ho, jaise IPTV, market data ya lecture server. SSM shortest-path tree seedha banata hai, bina RP, bina register process, bina MSDP ke, aur receivers same group par doosre sources se bache rehte hain. Ismein receiver LAN par IGMPv3 aur har router par range SSM ke roop mein configured chahiye. 232/8 aur <code>ip pim ssm default</code> ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Channel jodi (S,G) hai; join seedha source ki taraf jaata hai, RP ke bina.</li>
<li>Default range 232.0.0.0/8; har router par <code>ip pim ssm default</code>, ya <code>ip pim ssm range ACL</code>.</li>
<li>Receiver LAN par IGMPv3: v2 LAN par group IGMP mein dikhta hai par mroute entry nahi.</li>
<li>Flags: SSM entries par s, source-specific report paane wale last-hop router par I.</li>
<li>Usi group par bhejne wale doosre sources ignore ho jaate hain.</li>
</ul></div>
`}};export{e as default};