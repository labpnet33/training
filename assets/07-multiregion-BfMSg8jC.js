var e={id:`multiregion`,h:{en:`Multiregion designs: hub-to-hub, summaries and inter-regional shortcuts`,hi:`Multiregion designs: hub-to-hub, summaries aur inter-regional shortcuts`},body:{en:`
<p>One region (a hub, or two hubs, and their branches) scales to hundreds of sites. A company with sites in India, Singapore and Europe uses <b>several regions</b>, each a hub-and-spoke network, joined together. The Fortinet SD-WAN architecture guide describes a region as the basic building block: a hub-and-spoke overlay, ideally with two hubs, and the regions are interconnected through their hubs. This chapter shows the connections, the routing summaries, and how a shortcut can cross regions. For this chapter read HUB1-FGT as the hub of region 1 (with BR1-FGT) and HUB2-FGT as the hub of region 2 (with BR2-FGT).</p>
<h3>The building blocks</h3>
<table class="cmp"><tr><th>Piece</th><th>What it is</th></tr><tr><td><b>Region</b></td><td>A hub-and-spoke (single or dual hub) with its own AS number, LAN range and loopback range.</td></tr><tr><td><b>Hub-to-hub tunnel</b></td><td>A static IPsec tunnel between the hubs of two regions. The hubs of all regions are fully meshed.</td></tr><tr><td><b>auto-discovery-forwarder</b></td><td>Phase 1 option on the hub-to-hub tunnel. It forwards shortcut messages (query and reply) to the other region so that spokes of different regions can negotiate.</td></tr><tr><td><b>Regional summary</b></td><td>One aggregate route per region for LANs and one for loopbacks, so a hub does not carry every branch route of other regions.</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="diagram"><rect x="10" y="20" width="270" height="220" rx="10" fill="#e2e8f0"/><text x="145" y="42" text-anchor="middle" class="svg-ink" font-size="13">Region 1 (AS 65001)</text><rect x="360" y="20" width="270" height="220" rx="10" fill="#e2e8f0"/><text x="495" y="42" text-anchor="middle" class="svg-ink" font-size="13">Region 2 (AS 65002)</text><rect x="75" y="60" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="145" y="87" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT</text><rect x="425" y="60" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="495" y="87" text-anchor="middle" class="svg-ink" font-size="13">HUB2-FGT</text><rect x="75" y="170" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="145" y="197" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><rect x="425" y="170" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="495" y="197" text-anchor="middle" class="svg-ink" font-size="13">BR2-FGT</text><line x1="215" y1="82" x2="425" y2="82" stroke="#d97706" stroke-width="3"/><text x="320" y="74" text-anchor="middle" class="svg-accent" font-size="11">hub-to-hub, forwarder, EBGP</text><line x1="145" y1="104" x2="145" y2="170" stroke="#64748b" stroke-width="2"/><line x1="495" y1="104" x2="495" y2="170" stroke="#64748b" stroke-width="2"/><line x1="215" y1="192" x2="425" y2="192" stroke="#16a34a" stroke-width="3" stroke-dasharray="8 5"/><text x="320" y="184" text-anchor="middle" class="svg-accent" font-size="11">inter-regional shortcut</text></svg><p class="cap">Hubs are connected hub to hub. A shortcut between BR1 and BR2 skips both hubs.</p></div>
<h3>Hub-to-hub phase 1</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT: static tunnel to the hub of region 2, forwarding shortcut messages</span>
config vpn ipsec phase1-interface
    edit "H1-H2"
        set interface "wan1"
        set ike-version 2
        set remote-gw 203.0.113.20
        set add-route disable
        set exchange-ip-addr4 10.255.255.1
        set auto-discovery-forwarder enable
    next
end</pre>
<p>HUB2-FGT has the mirror configuration (remote gateway 203.0.113.10, its own loopback). The hub-to-hub tunnel is not a dial-up tunnel: it is static and each hub initiates. The same hub keeps <code>auto-discovery-sender enable</code> on the dial-up tunnels to its own spokes. Here exchange-ip-addr4 is what makes the hub loopbacks reachable over the hub-to-hub tunnel.</p>
<h3>Routing between regions</h3>
<p>The Fortinet guides show two families of design:</p>
<ol><li><b>Regions with summaries, no inter-regional shortcut.</b> EBGP between regional hubs; each hub advertises a summary of its region to the other hubs, and the receiving hubs advertise a default or summary route to their own spokes. Cross-region traffic <b>always</b> flows through the regional hubs. Simple and predictable.</li><li><b>Inter-regional ADVPN.</b> The BGP next hop (the loopback of the originating spoke) is kept <b>unchanged end to end</b>, so BR1 can resolve the next hop of a region 2 prefix through a shortcut. The 7.6 guide recommends RR-less dynamic BGP between regions: a single EBGP session between each pair of hubs of different regions, on loopbacks, with the hub-to-hub IKE exchange of the loopback address giving mutual reachability. The hubs advertise regional LAN summaries, regional loopback summaries (for example 10.200.2.0/24 for region 2) and a broader loopback summary that covers all regions (for example 10.200.0.0/14); the receiving hub resolves the regional summary through the /32 that IKE injects over the hub-to-hub tunnel. Once an inter-regional shortcut exists, the same BGP route is resolved recursively through the shortcut exactly as inside one region (chapter 4).</li></ol>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT: advertise one loopback summary for region 1 to the remote hub</span>
config router bgp
    set as 65001
    config aggregate-address
        edit 1
            set prefix 10.255.255.0 255.255.255.0
            set summary-only enable
        next
    end
    config neighbor
        edit "10.255.254.1"
            set remote-as 65002
            set ebgp-enforce-multihop enable
            set update-source "Loopback"
        next
    end
end</pre>
<p>10.255.254.1 is the loopback of HUB2-FGT. The settings that keep the spoke next hop unchanged (no next-hop-self toward the remote hub, reflection to your own spokes) must be checked in the guide for your design; an older design example that sets next-hop-self on hubs sends every inter-regional packet through the hubs on purpose.</p>
<h3>Spoke BGP policy in a multiregion network</h3>
<ul><li><b>Prefer the local region.</b> A spoke connects only to its regional hubs. Remote-region prefixes arrive reflected by those hubs, so the spoke needs no direct knowledge of other regions.</li><li><b>Prefer the best inter-region path at the hub.</b> If two paths exist between regions, for example the internet and a private circuit, set local preference on the hub: 800 for the internet path, 90 for the private circuit as the backup, as in a Fortinet community design where the circuit is used only when the internet between the regions fails.</li><li><b>Keep the AS plan simple.</b> One AS per region (65001, 65002), iBGP inside, EBGP between hubs, loops stopped by the AS path.</li></ul>
<div class="eg"><p>BR1 in Mumbai talks to BR2 in Singapore. Through the hubs the path costs 38 ms (BR1 to HUB1) + 12 ms (HUB1 to HUB2) + 35 ms (HUB2 to BR2) = 85 ms one way. With an inter-regional shortcut the direct internet path takes 60 ms. For 40 branch pairs sending 10 Mbit/s each, the hub-to-hub link is relieved of 400 Mbit/s.</p></div>
<div class="warn"><p><b>Common mistake.</b> Forgetting <code>auto-discovery-forwarder</code> on the hub-to-hub tunnel. Inside each region ADVPN works perfectly; across regions nothing forms, because the query cannot cross the hubs. Likewise, advertising every branch prefix between regions defeats summarisation and overloads the hubs.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sender on the hub for its spokes, <b>forwarder</b> on the hub-to-hub tunnel, receiver on the spokes. And an inter-regional shortcut needs the next hop to stay the originating spoke end to end.</p></div>
<div class="scn"><h4>The Europe to India video calls</h4><p>A company with a European and an Indian region had its engineering teams on daily video calls. All traffic took spoke to regional hub, hub to hub, hub to spoke: 190 ms and a congested hub-to-hub link. After enabling auto-discovery-forwarder on the hub-to-hub tunnels and preserving the originating next hop, the busy branch pairs built shortcuts across the regions at 120 ms, and the hub-to-hub link dropped to 20 percent.</p><p><b>Lesson:</b> Inter-regional ADVPN is a routing project as much as an IPsec one: forwarder plus unchanged next hops.</p></div>
<div class="iv"><p class="q">"How would you connect two regions and let branches shortcut across them?"</p><p>Each region is a dual-hub hub-and-spoke with its own AS and loopback range. The hubs of the regions are connected by static hub-to-hub IPsec tunnels with auto-discovery-forwarder enabled and loopback exchange. EBGP between hubs advertises regional LAN and loopback summaries. I keep the BGP next hop as the originating spoke so that ADVPN can resolve it through an inter-regional shortcut, and use local preference for the path between regions.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>A region is a hub-and-spoke (preferably dual hub); regions are joined by hub-to-hub tunnels.</li><li>auto-discovery-forwarder on the hub-to-hub tunnel carries shortcut messages across regions.</li><li>Summarise per region (LANs and loopbacks); keep the originating next hop for inter-regional shortcuts.</li><li>Local preference chooses between inter-region paths (for example 800 internet, 90 private circuit).</li><li>Without inter-regional ADVPN, cross-region traffic always crosses the hubs.</li></ul></div>
`,hi:`
<p>Ek region (ek hub, ya do hubs, aur unke branches) saikdon sites tak scale karta hai. India, Singapore aur Europe mein sites wali company <b>kai regions</b> use karti hai, har ek hub-and-spoke network, aapas mein joda hua. Fortinet SD-WAN architecture guide region ko basic building block batata hai: hub-and-spoke overlay, behtar do hubs ke saath, aur regions apne hubs ke through interconnect hote hain. Yeh chapter connections, routing summaries, aur shortcut regions ke paar kaise ja sakta hai yeh dikhata hai. Is chapter ke liye HUB1-FGT ko region 1 ka hub (BR1-FGT ke saath) aur HUB2-FGT ko region 2 ka hub (BR2-FGT ke saath) samjho.</p>
<h3>Building blocks</h3>
<table class="cmp"><tr><th>Piece</th><th>Yeh kya hai</th></tr><tr><td><b>Region</b></td><td>Hub-and-spoke (single ya dual hub) apne AS number, LAN range aur loopback range ke saath.</td></tr><tr><td><b>Hub-to-hub tunnel</b></td><td>Do regions ke hubs ke beech static IPsec tunnel. Saare regions ke hubs fully meshed hote hain.</td></tr><tr><td><b>auto-discovery-forwarder</b></td><td>Hub-to-hub tunnel par phase 1 option. Woh shortcut messages (query aur reply) ko doosre region tak forward karta hai taaki alag regions ke spokes negotiate kar sakein.</td></tr><tr><td><b>Regional summary</b></td><td>Har region ke liye LANs ka ek aggregate route aur loopbacks ka ek, taaki hub doosre regions ke har branch route ko carry na kare.</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="diagram"><rect x="10" y="20" width="270" height="220" rx="10" fill="#e2e8f0"/><text x="145" y="42" text-anchor="middle" class="svg-ink" font-size="13">Region 1 (AS 65001)</text><rect x="360" y="20" width="270" height="220" rx="10" fill="#e2e8f0"/><text x="495" y="42" text-anchor="middle" class="svg-ink" font-size="13">Region 2 (AS 65002)</text><rect x="75" y="60" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="145" y="87" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT</text><rect x="425" y="60" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="495" y="87" text-anchor="middle" class="svg-ink" font-size="13">HUB2-FGT</text><rect x="75" y="170" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="145" y="197" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><rect x="425" y="170" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="495" y="197" text-anchor="middle" class="svg-ink" font-size="13">BR2-FGT</text><line x1="215" y1="82" x2="425" y2="82" stroke="#d97706" stroke-width="3"/><text x="320" y="74" text-anchor="middle" class="svg-accent" font-size="11">hub-to-hub, forwarder, EBGP</text><line x1="145" y1="104" x2="145" y2="170" stroke="#64748b" stroke-width="2"/><line x1="495" y1="104" x2="495" y2="170" stroke="#64748b" stroke-width="2"/><line x1="215" y1="192" x2="425" y2="192" stroke="#16a34a" stroke-width="3" stroke-dasharray="8 5"/><text x="320" y="184" text-anchor="middle" class="svg-accent" font-size="11">inter-regional shortcut</text></svg><p class="cap">Hubs hub-to-hub jude hain. BR1 aur BR2 ke beech shortcut dono hubs ko skip karta hai.</p></div>
<h3>Hub-to-hub phase 1</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT: static tunnel to the hub of region 2, forwarding shortcut messages</span>
config vpn ipsec phase1-interface
    edit "H1-H2"
        set interface "wan1"
        set ike-version 2
        set remote-gw 203.0.113.20
        set add-route disable
        set exchange-ip-addr4 10.255.255.1
        set auto-discovery-forwarder enable
    next
end</pre>
<p>HUB2-FGT par mirror configuration hai (remote gateway 203.0.113.10, apna loopback). Hub-to-hub tunnel dial-up nahi hai: woh static hai aur har hub initiate karta hai. Wahi hub apne spokes ke dial-up tunnels par <code>auto-discovery-sender enable</code> rakhta hai. Yahan exchange-ip-addr4 hi hub loopbacks ko hub-to-hub tunnel par reachable banata hai.</p>
<h3>Regions ke beech routing</h3>
<p>Fortinet guides do families ke design dikhate hain:</p>
<ol><li><b>Summaries wale regions, inter-regional shortcut nahi.</b> Regional hubs ke beech EBGP; har hub apne region ka summary doosre hubs ko advertise karta hai, aur receiving hubs apne spokes ko default ya summary route dete hain. Cross-region traffic <b>hamesha</b> regional hubs se guzarta hai. Simple aur predictable.</li><li><b>Inter-regional ADVPN.</b> BGP next hop (originating spoke ka loopback) <b>end to end unchanged</b> rehta hai, taaki BR1 region 2 prefix ka next hop shortcut se resolve kar sake. 7.6 guide regions ke beech RR-less dynamic BGP recommend karta hai: alag regions ke hubs ki har jodi ke beech loopbacks par ek hi EBGP session, jisme hub-to-hub IKE loopback address ka exchange mutual reachability deta hai. Hubs regional LAN summaries, regional loopback summaries (jaise region 2 ke liye 10.200.2.0/24) aur saare regions ko cover karne wala broader loopback summary (jaise 10.200.0.0/14) advertise karte hain; receiving hub regional summary ko us /32 se resolve karta hai jo IKE hub-to-hub tunnel par inject karta hai. Inter-regional shortcut ban jaane par wahi BGP route recursively shortcut se resolve hota hai, bilkul ek region ke andar jaisa (chapter 4).</li></ol>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT: advertise one loopback summary for region 1 to the remote hub</span>
config router bgp
    set as 65001
    config aggregate-address
        edit 1
            set prefix 10.255.255.0 255.255.255.0
            set summary-only enable
        next
    end
    config neighbor
        edit "10.255.254.1"
            set remote-as 65002
            set ebgp-enforce-multihop enable
            set update-source "Loopback"
        next
    end
end</pre>
<p>10.255.254.1 HUB2-FGT ka loopback hai. Spoke next hop ko unchanged rakhne wali settings (remote hub ki taraf next-hop-self nahi, apne spokes ko reflection) apne design ke liye guide mein check karni hain; ek purana design example jo hubs par next-hop-self lagata hai woh jaan-boojhkar har inter-regional packet ko hubs se bhejta hai.</p>
<h3>Multiregion network mein spoke BGP policy</h3>
<ul><li><b>Local region prefer karo.</b> Spoke sirf apne regional hubs se judta hai. Remote-region prefixes un hubs se reflect hokar aate hain, isliye spoke ko doosre regions ki seedhi jaankari nahi chahiye.</li><li><b>Hub par best inter-region path prefer karo.</b> Regions ke beech do paths hon, jaise internet aur private circuit, to hub par local preference set karo: internet path ke liye 800, backup private circuit ke liye 90, jaisa ek Fortinet community design mein hai jahan circuit tabhi use hota hai jab regions ke beech internet fail ho.</li><li><b>AS plan simple rakho.</b> Har region ke liye ek AS (65001, 65002), andar iBGP, hubs ke beech EBGP, loops AS path rokta hai.</li></ul>
<div class="eg"><p>Mumbai mein BR1 Singapore ke BR2 se baat karta hai. Hubs ke through path ka kharcha 38 ms (BR1 se HUB1) + 12 ms (HUB1 se HUB2) + 35 ms (HUB2 se BR2) = 85 ms one way. Inter-regional shortcut ke saath direct internet path 60 ms leta hai. 40 branch pairs jo har ek 10 Mbit/s bhejti hain, unke liye hub-to-hub link se 400 Mbit/s hat jaata hai.</p></div>
<div class="warn"><p><b>Common galti.</b> Hub-to-hub tunnel par <code>auto-discovery-forwarder</code> bhool jaana. Har region ke andar ADVPN bilkul theek chalta hai; regions ke paar kuch nahi banta, kyunki query hubs ko cross nahi kar paati. Isi tarah regions ke beech har branch prefix advertise karna summarisation ko haraata hai aur hubs ko overload karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Apne spokes ke liye hub par sender, hub-to-hub tunnel par <b>forwarder</b>, spokes par receiver. Aur inter-regional shortcut ke liye next hop end to end originating spoke hi rehna chahiye.</p></div>
<div class="scn"><h4>Europe se India video calls</h4><p>European aur Indian region wali company ki engineering teams roz video calls par thi. Saara traffic spoke se regional hub, hub se hub, hub se spoke gaya: 190 ms aur congested hub-to-hub link. Hub-to-hub tunnels par auto-discovery-forwarder enable karne aur originating next hop preserve karne ke baad busy branch pairs ne regions ke paar 120 ms par shortcuts banaye, aur hub-to-hub link 20 percent par aa gayi.</p><p><b>Seekh:</b> Inter-regional ADVPN utna hi routing project hai jitna IPsec ka: forwarder plus unchanged next hops.</p></div>
<div class="iv"><p class="q">"Do regions ko kaise jodoge aur branches ko unke beech shortcut kaise banane doge?"</p><p>Har region apne AS aur loopback range ke saath dual-hub hub-and-spoke hai. Regions ke hubs static hub-to-hub IPsec tunnels se jude hain jinpar auto-discovery-forwarder enabled aur loopback exchange hai. Hubs ke beech EBGP regional LAN aur loopback summaries advertise karta hai. Main BGP next hop ko originating spoke rakhta hoon taaki ADVPN use inter-regional shortcut se resolve kar sake, aur regions ke beech path ke liye local preference use karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Region ek hub-and-spoke (behtar dual hub) hai; regions hub-to-hub tunnels se jude hain.</li><li>Hub-to-hub tunnel par auto-discovery-forwarder shortcut messages ko regions ke paar le jaata hai.</li><li>Har region ka summary (LANs aur loopbacks); inter-regional shortcuts ke liye originating next hop rakho.</li><li>Local preference inter-region paths ke beech chunta hai (jaise internet 800, private circuit 90).</li><li>Inter-regional ADVPN ke bina cross-region traffic hamesha hubs se guzarta hai.</li></ul></div>
`}};export{e as default};