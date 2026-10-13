var e={id:`ospf-overlay`,h:{en:`OSPF over the overlay: how it works and where it stops`,hi:`Overlay par OSPF: kaise chalta hai aur kahan rukta hai`},body:{en:`
<p>Many networks already run OSPF, and a team that knows OSPF well will ask: "Can I run OSPF over the SD-WAN overlay instead of BGP?" The honest answer is yes for small and medium overlays, and no for the steering features of chapter 5. This chapter shows how OSPF is set up over IPsec tunnels, how it interacts with SD-WAN, and its four limits. For OSPF basics (areas, neighbor states, LSAs) go back to <b>nse4-dynamic</b>.</p>
<h3>OSPF on a tunnel interface</h3>
<p>A route-based IPsec tunnel is an interface, so OSPF can run on it like on any interface. The important choice is the <b>network type</b> on the OSPF interface. On a dial-up hub, one tunnel interface serves many spokes at once (this is the design with <code>net-device disable</code>, see fsd-ipsec), so the hub interface behaves like a multi-access network without multicast delivery. FortiOS has the types broadcast, non-broadcast, point-to-point, point-to-multipoint and point-to-multipoint non-broadcast. For a hub with many spokes behind one tunnel interface, <b>point-to-multipoint</b> is the usual and documented choice: no designated router is elected, each spoke becomes an individual neighbor, and the cost is per neighbor. Both ends of a link must use compatible network types, otherwise the neighbors do not form or they flap.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="diagram"><rect x="230" y="20" width="180" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="11">area 0, point-to-multipoint</text><rect x="20" y="150" width="170" height="60" rx="10" fill="#bae6fd"/><text x="105" y="176" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><text x="105" y="194" text-anchor="middle" class="svg-muted" font-size="11">neighbor 1, cost 10</text><rect x="235" y="150" width="170" height="60" rx="10" fill="#bae6fd"/><text x="320" y="176" text-anchor="middle" class="svg-ink" font-size="13">BR2-FGT</text><text x="320" y="194" text-anchor="middle" class="svg-muted" font-size="11">neighbor 2, cost 10</text><rect x="450" y="150" width="170" height="60" rx="10" fill="#e2e8f0"/><text x="535" y="176" text-anchor="middle" class="svg-ink" font-size="13">BR3-FGT</text><text x="535" y="194" text-anchor="middle" class="svg-muted" font-size="11">neighbor 3, cost 10</text><line x1="280" y1="80" x2="125" y2="150" stroke="#64748b" stroke-width="2"/><line x1="320" y1="80" x2="320" y2="150" stroke="#64748b" stroke-width="2"/><line x1="360" y1="80" x2="515" y2="150" stroke="#64748b" stroke-width="2"/><text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">one tunnel interface, three neighbors</text></svg><p class="cap">On a dial-up hub with one tunnel interface, point-to-multipoint lets the hub keep one OSPF neighbor per spoke.</p></div>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT: OSPF on the overlay tunnel interfaces</span>
config router ospf
    set router-id 10.255.255.1
    set default-information-originate always
    config area
        edit 0.0.0.0
        next
    end
    config network
        edit 1
            set prefix 169.254.16.0 255.255.255.0
        next
        edit 2
            set prefix 169.254.17.0 255.255.255.0
        next
    end
    config ospf-interface
        edit "HUB1-VPN1"
            set interface "HUB1-VPN1"
            set network-type point-to-multipoint
            set cost 10
        next
        edit "HUB1-VPN2"
            set interface "HUB1-VPN2"
            set network-type point-to-multipoint
            set cost 10
        next
    end
end</pre>
<p>The spoke has the mirror configuration with its own router ID, the same two <code>ospf-interface</code> entries and the same network type, plus a network statement for its LAN (and <code>passive-interface</code> on the LAN port if no OSPF neighbors live there). The setting <code>default-information-originate always</code> makes the hub inject a default route, which is discussed in the next chapter. Notice that the cost is the <b>same</b> on both tunnels. That is deliberate and is the key point below.</p>
<h3>The four limits of OSPF over an overlay</h3>
<ol><li><b>Equal cost or no choice.</b> SD-WAN rules can only select members that have a route to the destination (chapter 2). OSPF installs only the lowest-cost path. If the VPN1 cost is 10 and the VPN2 cost is 20, the table holds only the VPN1 route; VPN2 has no route and no SD-WAN rule can use it. To let SD-WAN choose, give both tunnels the same cost so that ECMP routes are installed. You then lose OSPF's own preference between the tunnels and rely on SD-WAN for it.</li><li><b>No SLA feedback.</b> The SD-WAN neighbor object, <code>route-map-out-preferable</code> and communities of chapter 5 are BGP mechanisms. OSPF has costs and tags but no conditional advertisement based on SD-WAN health. The hub cannot learn from OSPF which spoke tunnel is degraded, so return traffic cannot follow the spoke's measurements.</li><li><b>Scale and stability.</b> Every spoke is a router in the area. A flapping tunnel floods LSAs to all routers and triggers SPF runs everywhere. With hundreds of spokes you need areas and summarisation, and Fortinet's large reference designs therefore use BGP. Hello and dead timers also interact with tunnel failure detection, so tune them with DPD or BFD in mind.</li><li><b>Policy tools.</b> BGP offers communities, local preference, AS path, additional paths and route reflection. OSPF offers cost, area types, route tags on external routes and filters. For regional steering per prefix, BGP is the better tool.</li></ol>
<p>OSPF over ADVPN is possible and Fortinet has an example for it, but the same limits apply, and the detail belongs to fsd-advpn.</p>
<h3>Where OSPF still fits</h3>
<ul><li>A small overlay with a few spokes where the team already runs OSPF.</li><li>Inside the data centre and branch LANs, with BGP only on the overlay. The border device redistributes between them; filter the redistribution with route maps and tags to avoid loops (see the redistribution chapter of nse4-dynamic).</li><li>Brownfield migration, where OSPF first carries the overlay and BGP is introduced later.</li></ul>
<h3>Verification</h3>
<pre class="out"><span class="c">! Reference configuration (not run in the simulator). Illustrative output, values chosen for teaching.</span>
HUB1-FGT # get router info ospf neighbor
OSPF process 0, VRF 0:
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.255.255.11     1   Full/ -         00:00:36    169.254.16.10   HUB1-VPN1
10.255.255.12     1   Full/ -         00:00:34    169.254.16.11   HUB1-VPN1
<span class="hl">10.255.255.11     1   Full/ -         00:00:37    169.254.17.10   HUB1-VPN2</span></pre>
<p>Check <code>get router info ospf interface</code> for the network type, cost and timers on each tunnel, and <code>get router info routing-table ospf</code> for the routes that OSPF contributes. A neighbor stuck in <b>Init</b> or <b>ExStart</b> over a tunnel usually points to MTU or network-type problems; a neighbor that never appears points to the tunnel, the interface not being in a network statement, or a timer or type mismatch.</p>
<div class="warn"><p><b>Common mistake.</b> Giving the primary tunnel a lower OSPF cost "so it is preferred" and then wondering why the SD-WAN rule never uses the second tunnel for voice. The second tunnel has no route.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the network type for a hub that serves many spokes on one tunnel interface (point-to-multipoint) and know that SD-WAN neighbor based steering is a BGP feature, not an OSPF one.</p></div>
<div class="scn"><h4>The OSPF overlay that grew too big</h4><p>A logistics company ran OSPF over 40 branch tunnels without trouble. At 180 branches, every ISP flap at one branch caused all hubs to recompute SPF and the CPU of the hubs spiked during morning hours. The design moved to BGP on the overlay with route reflection, kept OSPF inside each site, and the hub CPU dropped to normal.</p><p><b>Lesson:</b> OSPF works well until the flooding domain gets large; then use BGP between the sites.</p></div>
<div class="iv"><p class="q">"Can I use OSPF instead of BGP in an SD-WAN overlay?"</p><p>Yes for small overlays, with point-to-multipoint on the hub tunnel interface and equal cost on the tunnels so SD-WAN sees ECMP routes. But I would not choose it at scale: every spoke is in the flooding domain, and the SD-WAN neighbor, communities and route-map-out-preferable feedback are BGP features. For many branches and regional steering I use iBGP with a route reflector.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>OSPF runs on tunnel interfaces; use point-to-multipoint on a hub interface that serves many spokes.</li><li>Equal cost on both tunnels is needed so SD-WAN rules have two routes to choose from.</li><li>No SLA-driven advertisement in OSPF; the SD-WAN neighbor feature is for BGP.</li><li>Large overlays favour BGP; OSPF stays useful inside sites and in small overlays.</li></ul></div>
`,hi:`
<p>Kai networks pehle se OSPF chalate hain, aur jo team OSPF achhi tarah jaanti hai woh poochegi: "Kya main BGP ki jagah SD-WAN overlay par OSPF chala sakta hoon?" Imaandaar jawab: chhote aur medium overlays ke liye haan, aur chapter 5 ke steering features ke liye nahi. Yeh chapter dikhata hai ki IPsec tunnels par OSPF kaise set hota hai, woh SD-WAN se kaise interact karta hai, aur uski chaar limits kya hain. OSPF basics (areas, neighbor states, LSAs) ke liye <b>nse4-dynamic</b> par wapas jao.</p>
<h3>Tunnel interface par OSPF</h3>
<p>Route-based IPsec tunnel ek interface hai, isliye OSPF us par kisi bhi interface ki tarah chal sakta hai. Zaroori chunav OSPF interface ka <b>network type</b> hai. Dial-up hub par ek tunnel interface ek saath kai spokes ko serve karta hai (yeh <code>net-device disable</code> wala design hai, fsd-ipsec dekho), isliye hub interface multicast delivery ke bina multi-access network jaisa behave karta hai. FortiOS mein types hain broadcast, non-broadcast, point-to-point, point-to-multipoint aur point-to-multipoint non-broadcast. Ek tunnel interface ke peeche kai spokes wale hub ke liye <b>point-to-multipoint</b> aam aur documented chunav hai: koi designated router elect nahi hota, har spoke alag neighbor banta hai, aur cost per neighbor hoti hai. Link ke dono ends par compatible network types hone chahiye, warna neighbors bante nahi ya flap karte hain.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="diagram"><rect x="230" y="20" width="180" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="11">area 0, point-to-multipoint</text><rect x="20" y="150" width="170" height="60" rx="10" fill="#bae6fd"/><text x="105" y="176" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><text x="105" y="194" text-anchor="middle" class="svg-muted" font-size="11">neighbor 1, cost 10</text><rect x="235" y="150" width="170" height="60" rx="10" fill="#bae6fd"/><text x="320" y="176" text-anchor="middle" class="svg-ink" font-size="13">BR2-FGT</text><text x="320" y="194" text-anchor="middle" class="svg-muted" font-size="11">neighbor 2, cost 10</text><rect x="450" y="150" width="170" height="60" rx="10" fill="#e2e8f0"/><text x="535" y="176" text-anchor="middle" class="svg-ink" font-size="13">BR3-FGT</text><text x="535" y="194" text-anchor="middle" class="svg-muted" font-size="11">neighbor 3, cost 10</text><line x1="280" y1="80" x2="125" y2="150" stroke="#64748b" stroke-width="2"/><line x1="320" y1="80" x2="320" y2="150" stroke="#64748b" stroke-width="2"/><line x1="360" y1="80" x2="515" y2="150" stroke="#64748b" stroke-width="2"/><text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">ek tunnel interface, teen neighbors</text></svg><p class="cap">Ek tunnel interface wale dial-up hub par point-to-multipoint hub ko har spoke ke liye ek OSPF neighbor rakhne deta hai.</p></div>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT: OSPF on the overlay tunnel interfaces</span>
config router ospf
    set router-id 10.255.255.1
    set default-information-originate always
    config area
        edit 0.0.0.0
        next
    end
    config network
        edit 1
            set prefix 169.254.16.0 255.255.255.0
        next
        edit 2
            set prefix 169.254.17.0 255.255.255.0
        next
    end
    config ospf-interface
        edit "HUB1-VPN1"
            set interface "HUB1-VPN1"
            set network-type point-to-multipoint
            set cost 10
        next
        edit "HUB1-VPN2"
            set interface "HUB1-VPN2"
            set network-type point-to-multipoint
            set cost 10
        next
    end
end</pre>
<p>Spoke par mirror configuration hoti hai: apna router ID, wahi do <code>ospf-interface</code> entries aur wahi network type, plus apne LAN ka network statement (aur LAN port par <code>passive-interface</code> agar wahan koi OSPF neighbor nahi). <code>default-information-originate always</code> hub ko default route inject karne deta hai, jiski baat agle chapter mein hai. Dhyan do ki cost dono tunnels par <b>same</b> hai. Yeh jaanbujhkar hai aur neeche ka key point yahi hai.</p>
<h3>Overlay par OSPF ki chaar limits</h3>
<ol><li><b>Equal cost ya koi choice nahi.</b> SD-WAN rules sirf un members ko chun sakte hain jinke paas destination tak route ho (chapter 2). OSPF sirf sabse kam cost wala path install karta hai. Agar VPN1 ki cost 10 aur VPN2 ki 20 hai, to table mein sirf VPN1 route hota hai; VPN2 ka route nahi hota aur koi SD-WAN rule use use nahi kar sakta. SD-WAN ko chunne dene ke liye dono tunnels ko same cost do taaki ECMP routes install hon. Tab aap tunnels ke beech OSPF ki apni preference kho dete ho aur uske liye SD-WAN par nirbhar hote ho.</li><li><b>SLA feedback nahi.</b> SD-WAN neighbor object, <code>route-map-out-preferable</code> aur chapter 5 ki communities BGP mechanisms hain. OSPF mein costs aur tags hain lekin SD-WAN health par based conditional advertisement nahi. Hub OSPF se nahi seekh sakta ki kaun sa spoke tunnel degraded hai, isliye return traffic spoke ki measurements follow nahi kar sakta.</li><li><b>Scale aur stability.</b> Har spoke area mein ek router hai. Flapping tunnel saare routers ko LSAs flood karta hai aur har jagah SPF run karwata hai. Saikdon spokes ke saath areas aur summarisation chahiye, isliye Fortinet ke bade reference designs BGP use karte hain. Hello aur dead timers tunnel failure detection se bhi interact karte hain, isliye DPD ya BFD ko dhyan mein rakhkar tune karo.</li><li><b>Policy tools.</b> BGP communities, local preference, AS path, additional paths aur route reflection deta hai. OSPF cost, area types, external routes par route tags aur filters deta hai. Per prefix regional steering ke liye BGP behtar tool hai.</li></ol>
<p>ADVPN par OSPF possible hai aur Fortinet ke paas uska example hai, lekin wahi limits lagu hoti hain, aur detail fsd-advpn ki hai.</p>
<h3>OSPF kahan ab bhi fit hota hai</h3>
<ul><li>Chhota overlay jahan kuch spokes hain aur team pehle se OSPF chalati hai.</li><li>Data centre aur branch LANs ke andar, overlay par sirf BGP ke saath. Border device dono ke beech redistribute karta hai; loops se bachne ke liye redistribution ko route maps aur tags se filter karo (nse4-dynamic ka redistribution chapter dekho).</li><li>Brownfield migration, jahan pehle OSPF overlay ko carry karta hai aur BGP baad mein aata hai.</li></ul>
<h3>Verification</h3>
<pre class="out"><span class="c">! Reference configuration (not run in the simulator). Illustrative output, values chosen for teaching.</span>
HUB1-FGT # get router info ospf neighbor
OSPF process 0, VRF 0:
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.255.255.11     1   Full/ -         00:00:36    169.254.16.10   HUB1-VPN1
10.255.255.12     1   Full/ -         00:00:34    169.254.16.11   HUB1-VPN1
<span class="hl">10.255.255.11     1   Full/ -         00:00:37    169.254.17.10   HUB1-VPN2</span></pre>
<p>Har tunnel par network type, cost aur timers ke liye <code>get router info ospf interface</code> dekho, aur OSPF jo routes deta hai unke liye <code>get router info routing-table ospf</code>. Tunnel par neighbor <b>Init</b> ya <b>ExStart</b> mein atka ho to aam taur par MTU ya network-type problem hoti hai; jo neighbor kabhi dikhe hi nahi woh tunnel, network statement mein na hone wala interface, ya timer ya type mismatch ki taraf ishara karta hai.</p>
<div class="warn"><p><b>Common galti.</b> Primary tunnel ko kam OSPF cost dena "taaki woh prefer ho" aur phir sochna ki SD-WAN rule voice ke liye doosra tunnel kabhi kyun use nahi karta. Doosre tunnel ka route hi nahi hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ek tunnel interface par kai spokes serve karne wale hub ka network type (point-to-multipoint) jaano, aur yeh bhi ki SD-WAN neighbor based steering BGP feature hai, OSPF ka nahi.</p></div>
<div class="scn"><h4>OSPF overlay jo bahut bada ho gaya</h4><p>Ek logistics company ne 40 branch tunnels par bina dikkat ke OSPF chalaya. 180 branches par ek branch ka har ISP flap saare hubs ko SPF dobara compute karwata tha aur subah ke ghanton mein hubs ka CPU spike karta tha. Design overlay par route reflection wale BGP par gaya, har site ke andar OSPF rakha gaya, aur hub CPU normal ho gaya.</p><p><b>Seekh:</b> OSPF tab tak achha chalta hai jab tak flooding domain bada na ho; phir sites ke beech BGP use karo.</p></div>
<div class="iv"><p class="q">"Kya SD-WAN overlay mein BGP ki jagah OSPF use kar sakte hain?"</p><p>Haan chhote overlays ke liye, hub tunnel interface par point-to-multipoint aur tunnels par equal cost ke saath taaki SD-WAN ko ECMP routes dikhen. Lekin scale par main use nahi chunta: har spoke flooding domain mein hai, aur SD-WAN neighbor, communities aur route-map-out-preferable feedback BGP features hain. Bahut branches aur regional steering ke liye main route reflector ke saath iBGP use karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>OSPF tunnel interfaces par chalta hai; kai spokes serve karne wale hub interface par point-to-multipoint use karo.</li><li>SD-WAN rules ko do routes chahiye isliye dono tunnels par equal cost zaroori hai.</li><li>OSPF mein SLA-driven advertisement nahi; SD-WAN neighbor feature BGP ke liye hai.</li><li>Bade overlays BGP pasand karte hain; OSPF sites ke andar aur chhote overlays mein kaam ka rehta hai.</li></ul></div>
`}};export{e as default};