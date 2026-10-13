var e={id:`mode-config-addressing`,h:{en:`Mode-config, the overlay IP plan, peer IDs, add-route and net-device`,hi:`Mode-config, overlay IP plan, peer IDs, add-route aur net-device`},body:{en:`
<p>BGP needs addresses to peer over. If every spoke tunnel needed a hand-typed IP, a 200-branch overlay would be a spreadsheet nightmare. <b>Mode-config</b> lets the hub assign the spoke's tunnel address during IKE, so the spoke phase 1 does not hold an IP at all.</p>
<h3>The address plan first</h3>
<table class="cmp"><tr><th>Tunnel</th><th>Overlay range</th><th>Hub tunnel IP</th><th>Pool for spokes</th></tr><tr><td>HUB1-VPN1 (ISP1)</td><td>169.254.16.0/24</td><td>169.254.16.1</td><td>169.254.16.10 to 169.254.16.250</td></tr><tr><td>HUB1-VPN2 (ISP2)</td><td>169.254.17.0/24</td><td>169.254.17.1</td><td>169.254.17.10 to 169.254.17.250</td></tr></table>
<p>The link-local range 169.254.0.0/16 is a common choice because these addresses are never routed outside the overlay and do not collide with LAN plans. Check that your FortiOS version and your design accept it; a private range is also valid. A /24 per tunnel gives about 240 spokes; larger deployments use wider ranges, such as a /23, or several hubs. The point is to decide it once, write it down, and give each tunnel a different range, because BGP neighbors and SD-WAN members are identified by these addresses.</p>
<h3>Mode-config on the hub</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT: give spokes their tunnel address from a pool</span>
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set mode-cfg enable
        set assign-ip enable
        set assign-ip-from range
        set ipv4-start-ip 169.254.16.10
        set ipv4-end-ip 169.254.16.250
        set ipv4-netmask 255.255.255.0
    next
end
config system interface
    edit "HUB1-VPN1"
        set ip 169.254.16.1 255.255.255.255
        set remote-ip 169.254.16.254 255.255.255.0
    next
end</pre>
<p>The tunnel interface gets the hub address as a /32 and a remote-ip with a mask of the whole range: the hub treats the pool as reachable through this interface. The remote-ip is outside the pool on purpose.</p>
<h3>Mode-config on the spoke</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: accept the address from the hub and use an ID that the hub can recognise</span>
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set mode-cfg enable
        set localid "BR1-FGT"
    next
end</pre>
<p>With IKEv2 the spoke asks for an address in the configuration payload and the hub answers with one from the pool. The result appears on the spoke tunnel interface; there is no manual IP. The same spoke gets a different address on each tunnel (one from each range).</p>
<div class="note"><p>Option names and defaults of mode-config differ a little between IKEv1 and IKEv2 and between releases; confirm them in the CLI reference of your version. The design idea is stable: the hub owns a pool per tunnel, each spoke receives one address per tunnel.</p></div>
<h3>Identity: local ID and peer ID</h3>
<p>The hub should know who is connecting. With a pre-shared key, set a <code>localid</code> on the spoke, and on the hub use a peer type that checks the ID. With a single shared key and <code>peertype any</code> the hub accepts anyone with the key; many designs accept this inside a controlled environment, but for production prefer one of these:</p>
<ul><li><b>Certificates.</b> Hub peer type set to accept certificates from a given CA or subject; each spoke has its own certificate. A lost or stolen unit is revoked on its own.</li><li><b>Peer ID per spoke.</b> Workable at small scale, but it defeats the idea of a generic dial-up gate when there are hundreds of spokes unless you automate it through FortiManager.</li><li><b>Prefix ID or group patterns.</b> Some peer types let the hub accept a pattern of IDs; check the CLI reference of your version for what is supported.</li></ul>
<h3>net-device</h3>
<p>The <code>net-device</code> option controls whether a dial-up phase 1 creates a separate virtual device for each tunnel that connects.</p>
<table class="cmp"><tr><th>Setting</th><th>Effect</th><th>Typical use</th></tr><tr><td>disable</td><td>All spokes share the one tunnel interface of the phase 1; spokes are told apart by their addresses</td><td>Hub designs with mode-config addresses and routing from BGP; scales well</td></tr><tr><td>enable</td><td>Each connecting tunnel gets its own device instance</td><td>When per-tunnel interfaces are needed, for example per-tunnel features; costs more resources at scale</td></tr></table>
<p>Treat this as a design choice that must match the rest of your design (mode-config, routing, ADVPN). The Fortinet SD-WAN architecture and ADVPN documentation shows the recommended value for each release; do not mix values between hubs of one overlay.</p>
<h3>add-route</h3>
<p>With <code>add-route enable</code>, FortiOS installs a route for the remote selector of each tunnel, for example for the spoke LAN. This is convenient for a plain site-to-site VPN. In an SD-WAN overlay, routes should come from BGP so that SD-WAN, communities and route reflection work. Therefore: <code>add-route disable</code> on both sides, and use a routing protocol. If you see strange routes with the IPsec tunnel as the interface and a low distance, check this option first.</p>
<h3>Loopbacks and the exchanged address</h3>
<p>The routing design of fsd-routing peers BGP on loopbacks (hub 10.255.255.1, spokes 10.255.255.11 and .12). For this to work over IPsec, each side needs a route to the other loopback through the tunnel, and for ADVPN the IKE exchange can carry the loopback address with <code>exchange-ip-addr4</code>, so that the peer knows which BGP address belongs to this tunnel. The next chapters return to it; for now remember that phase 1 can carry a loopback address and that BGP over loopbacks uses it.</p>
<div class="warn"><p><b>Common mistake.</b> A mode-config pool that overlaps with the pool of another hub or tunnel. Two spokes get the same address on different tunnels, BGP neighbors collide, and the symptom looks like random flapping. Keep one range per tunnel and document it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Mode-config gives the spoke its tunnel IP from a pool on the hub. add-route is disabled when a routing protocol runs the overlay. The peer must be identified by something stronger than its IP address when it dials in.</p></div>
<div class="scn"><h4>The pool that ran out</h4><p>An overlay with a /24 pool per tunnel stopped accepting new spokes at about the 240th branch: the new tunnels came up for phase 1 but received no address. The company had grown beyond the plan. They added a second hub tunnel with a new range and later moved to a /23.</p><p><b>Lesson:</b> Size the pool for the future. A pool is cheap to make large and expensive to renumber.</p></div>
<div class="iv"><p class="q">"Why use mode-config in an SD-WAN overlay?"</p><p>It lets the hub assign each spoke its tunnel address during IKE, so spoke configurations stay generic and a template can build them without per-site tunnel IPs. The address plan lives on the hub as a pool per tunnel, and BGP neighbors are those addresses or the loopbacks behind them.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>One range and pool per tunnel; plan it before building.</li><li>Hub: mode-cfg with a pool and the interface IP; spoke: mode-cfg enable and a local ID.</li><li>Identify spokes by certificates or IDs, not only by a shared key.</li><li>add-route disable; BGP carries the routes.</li><li>net-device is a design choice; keep it identical across the hubs of one overlay.</li></ul></div>
`,hi:`
<p>BGP ko peer karne ke liye addresses chahiye. Agar har spoke tunnel ko haath se type kiya IP chahiye hota to 200-branch overlay spreadsheet ka dukhdayi sapna hota. <b>Mode-config</b> hub ko IKE ke dauran spoke ka tunnel address assign karne deta hai, isliye spoke phase 1 mein koi IP hota hi nahi.</p>
<h3>Pehle address plan</h3>
<table class="cmp"><tr><th>Tunnel</th><th>Overlay range</th><th>Hub tunnel IP</th><th>Spokes ke liye pool</th></tr><tr><td>HUB1-VPN1 (ISP1)</td><td>169.254.16.0/24</td><td>169.254.16.1</td><td>169.254.16.10 se 169.254.16.250</td></tr><tr><td>HUB1-VPN2 (ISP2)</td><td>169.254.17.0/24</td><td>169.254.17.1</td><td>169.254.17.10 se 169.254.17.250</td></tr></table>
<p>Link-local range 169.254.0.0/16 aam choice hai kyunki yeh addresses overlay ke bahar kabhi route nahi hote aur LAN plans se nahi takrate. Check karo ki aapka FortiOS version aur design ise accept karte hain; private range bhi valid hai. Har tunnel ke liye /24 lagbhag 240 spokes deta hai; bade deployments badi ranges, jaise /23, ya kai hubs use karte hain. Baat yeh hai ki ek baar tay karo, likh lo, aur har tunnel ko alag range do, kyunki BGP neighbors aur SD-WAN members inhi addresses se pehchane jaate hain.</p>
<h3>Hub par mode-config</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT: give spokes their tunnel address from a pool</span>
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set mode-cfg enable
        set assign-ip enable
        set assign-ip-from range
        set ipv4-start-ip 169.254.16.10
        set ipv4-end-ip 169.254.16.250
        set ipv4-netmask 255.255.255.0
    next
end
config system interface
    edit "HUB1-VPN1"
        set ip 169.254.16.1 255.255.255.255
        set remote-ip 169.254.16.254 255.255.255.0
    next
end</pre>
<p>Tunnel interface ko hub address /32 ke roop mein aur poori range ke mask wala remote-ip milta hai: hub pool ko is interface ke through reachable maanta hai. Remote-ip jaanbujhkar pool ke bahar hai.</p>
<h3>Spoke par mode-config</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: accept the address from the hub and use an ID that the hub can recognise</span>
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set mode-cfg enable
        set localid "BR1-FGT"
    next
end</pre>
<p>IKEv2 mein spoke configuration payload mein address maangta hai aur hub pool se ek ke saath jawab deta hai. Result spoke ke tunnel interface par dikhta hai; manual IP nahi. Wahi spoke har tunnel par alag address paata hai (har range se ek).</p>
<div class="note"><p>Mode-config ke option names aur defaults IKEv1 aur IKEv2 ke beech aur releases ke beech thode alag hote hain; apne version ke CLI reference mein confirm karo. Design ka idea stable hai: hub har tunnel ke liye pool rakhta hai, har spoke ko har tunnel par ek address milta hai.</p></div>
<h3>Identity: local ID aur peer ID</h3>
<p>Hub ko pata hona chahiye ki kaun connect kar raha hai. Pre-shared key ke saath spoke par <code>localid</code> set karo, aur hub par aisa peer type use karo jo ID check kare. Ek shared key aur <code>peertype any</code> ke saath hub key wale har kisi ko accept karta hai; kai designs controlled environment ke andar ise accept karte hain, par production ke liye in mein se ek prefer karo:</p>
<ul><li><b>Certificates.</b> Hub peer type kisi CA ya subject ke certificates accept karne ke liye set; har spoke ka apna certificate. Kho gaya ya chori hua unit akele revoke hota hai.</li><li><b>Har spoke ke liye peer ID.</b> Chhote scale par chalta hai, par saikdon spokes ke saath generic dial-up gate ka idea tod deta hai jab tak FortiManager se automate na karo.</li><li><b>Prefix ID ya group patterns.</b> Kuch peer types hub ko IDs ka pattern accept karne dete hain; kya supported hai yeh apne version ke CLI reference mein dekho.</li></ul>
<h3>net-device</h3>
<p><code>net-device</code> option tay karta hai ki dial-up phase 1 har connect hone wale tunnel ke liye alag virtual device banata hai ya nahi.</p>
<table class="cmp"><tr><th>Setting</th><th>Asar</th><th>Aam use</th></tr><tr><td>disable</td><td>Saare spokes phase 1 ka ek tunnel interface share karte hain; spokes addresses se alag pehchane jaate hain</td><td>Mode-config addresses aur BGP se routing wale hub designs; achhe scale hota hai</td></tr><tr><td>enable</td><td>Har connect hone wale tunnel ko apna device instance milta hai</td><td>Jab per-tunnel interfaces chahiye, jaise per-tunnel features; scale par zyada resources lagte hain</td></tr></table>
<p>Ise aise design choice ki tarah lo jo baaki design (mode-config, routing, ADVPN) se match kare. Fortinet SD-WAN architecture aur ADVPN documentation har release ke liye recommended value dikhata hai; ek overlay ke hubs ke beech values mix mat karo.</p>
<h3>add-route</h3>
<p><code>add-route enable</code> ke saath FortiOS har tunnel ke remote selector ke liye route install karta hai, jaise spoke LAN ke liye. Yeh plain site-to-site VPN ke liye suvidhajanak hai. SD-WAN overlay mein routes BGP se aane chahiye taaki SD-WAN, communities aur route reflection kaam karein. Isliye: dono sides par <code>add-route disable</code>, aur routing protocol use karo. IPsec tunnel interface wale aur kam distance wale ajeeb routes dikhein to pehle yeh option check karo.</p>
<h3>Loopbacks aur exchange kiya address</h3>
<p>fsd-routing ka routing design BGP ko loopbacks par peer karta hai (hub 10.255.255.1, spokes 10.255.255.11 aur .12). IPsec par yeh kaam kare iske liye har side ko tunnel ke through doosre loopback ka route chahiye, aur ADVPN ke liye IKE exchange <code>exchange-ip-addr4</code> se loopback address le jaa sakta hai, taaki peer jaane ki kaun sa BGP address is tunnel ka hai. Agle chapters iski taraf lautte hain; abhi yaad rakho ki phase 1 loopback address le jaa sakta hai aur loopbacks par BGP use istemal karta hai.</p>
<div class="warn"><p><b>Common galti.</b> Mode-config pool jo doosre hub ya tunnel ke pool se overlap kare. Do spokes alag tunnels par same address paate hain, BGP neighbors takra jaate hain, aur symptom random flapping jaisa dikhta hai. Har tunnel ke liye ek range rakho aur document karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Mode-config spoke ko uska tunnel IP hub ke pool se deta hai. Routing protocol overlay chalaye to add-route disabled hota hai. Dial-in karte waqt peer ko IP address se zyada mazboot cheez se pehchanna chahiye.</p></div>
<div class="scn"><h4>Pool jo khatam ho gaya</h4><p>Har tunnel ke liye /24 pool wala overlay lagbhag 240wen branch par naye spokes accept karna band kar gaya: naye tunnels phase 1 ke liye up hue par unhe address nahi mila. Company plan se aage badh gayi thi. Unhone nayi range ke saath doosra hub tunnel joda aur baad mein /23 par gaye.</p><p><b>Seekh:</b> Pool ko future ke liye size karo. Pool bada banana sasta hai aur renumber karna mehnga.</p></div>
<div class="iv"><p class="q">"SD-WAN overlay mein mode-config kyun use karte ho?"</p><p>Yeh hub ko IKE ke dauran har spoke ka tunnel address assign karne deta hai, isliye spoke configurations generic rehti hain aur template bina per-site tunnel IPs ke unhe bana sakta hai. Address plan hub par har tunnel ke pool ke roop mein rehta hai, aur BGP neighbors yahi addresses ya unke peeche ke loopbacks hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Har tunnel ke liye ek range aur pool; banane se pehle plan karo.</li><li>Hub: pool ke saath mode-cfg aur interface IP; spoke: mode-cfg enable aur local ID.</li><li>Spokes ko sirf shared key se nahi, certificates ya IDs se pehchano.</li><li>add-route disable; BGP routes le jaata hai.</li><li>net-device design choice hai; ek overlay ke hubs par same rakho.</li></ul></div>
`}};export{e as default};