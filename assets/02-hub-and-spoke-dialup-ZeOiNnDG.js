var e={id:`hub-spoke-dialup`,h:{en:`Hub and spoke with dial-up spokes`,hi:`Dial-up spokes ke saath hub and spoke`},body:{en:`
<p>A hub that serves 200 branches cannot have 200 hand-written phase 1 entries. The standard design is a <b>dial-up</b> phase 1 on the hub: it listens on one address and accepts any spoke that proves its identity. The spoke is the initiator and has a normal phase 1 with a fixed remote gateway.</p>
<h3>The two sides</h3>
<table class="cmp"><tr><th>Side</th><th>Phase 1 type</th><th>Knows the peer address?</th><th>Starts the tunnel?</th></tr><tr><td>Hub</td><td>Dynamic (dial-up)</td><td>No, learns it when the spoke connects</td><td>No, it waits</td></tr><tr><td>Spoke</td><td>Static (remote-gw)</td><td>Yes, the hub address on that underlay</td><td>Yes</td></tr></table>
<p>This explains an everyday fact: if the spoke is behind NAT or has a changing address, nothing needs to change on the hub. It also explains a limit: the hub cannot start a tunnel to a spoke that has not connected yet.</p>
<h3>Hub phase 1 and phase 2</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT, tunnel over ISP1 (wan1 = 203.0.113.10)</span>
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set type dynamic
        set interface "wan1"
        set ike-version 2
        set peertype any
        set net-device disable
        set proposal aes256-sha256
        set dhgrp 14
        set add-route disable
        set dpd on-idle
        set dpd-retrycount 3
        set dpd-retryinterval 5
        set psksecret ENC example-secret-not-real
    next
end
config vpn ipsec phase2-interface
    edit "HUB1-VPN1"
        set phase1name "HUB1-VPN1"
        set proposal aes256-sha256
        set pfs enable
        set dhgrp 14
    next
end</pre>
<p>Line by line: <code>type dynamic</code> makes it a dial-up gate. <code>peertype any</code> accepts a peer whatever its ID, and the pre-shared key is the proof; stronger designs use certificates or a peer ID check (chapter 4). <code>add-route disable</code> stops FortiOS from adding a route for each spoke subnet: in an SD-WAN design the routes come from BGP, not from IPsec. The tunnel addresses come from mode-config, which chapter 4 adds to this block. A second tunnel for ISP2 is a second phase 1 on wan2 with its own name (chapter 5).</p>
<h3>Spoke phase 1 and phase 2</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT, tunnel over ISP1 toward HUB1-FGT</span>
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set interface "wan1"
        set ike-version 2
        set peertype any
        set net-device enable
        set proposal aes256-sha256
        set dhgrp 14
        set remote-gw 203.0.113.10
        set add-route disable
        set dpd on-idle
        set dpd-retrycount 3
        set dpd-retryinterval 5
        set psksecret ENC example-secret-not-real
    next
end
config vpn ipsec phase2-interface
    edit "HUB1-VPN1"
        set phase1name "HUB1-VPN1"
        set proposal aes256-sha256
        set pfs enable
        set dhgrp 14
        set auto-negotiate enable
    next
end</pre>
<p>The names on both sides are the same, HUB1-VPN1, on purpose: it makes monitoring and templates simpler. The spoke has <code>remote-gw</code> and <code>auto-negotiate enable</code>, so it brings the tunnel up by itself and re-establishes it after a failure.</p>
<div class="note"><p>Whether the spoke uses <code>net-device enable</code> or disable is a design question that depends on the release and on the features used; chapter 4 explains what the option does and why the hub shown here uses disable. Check the current Fortinet SD-WAN architecture guide for the value that fits your version before copying it.</p></div>
<h3>Selectors</h3>
<p>For a route-based overlay, the phase 2 selectors should be wide: source 0.0.0.0/0 and destination 0.0.0.0/0 (the defaults when you do not set them). Routing, not the selector, decides what enters the tunnel. Narrow selectors in an SD-WAN overlay are a frequent cause of tunnels that are up but pass no traffic for some subnets.</p>
<h3>Firewall policy and the zone</h3>
<p>The tunnel interface needs policies. On the hub, a policy from the overlay zone to the LAN and back; on the spoke, from the LAN to the overlay zone. Interfaces become members of an SD-WAN zone named, for example, overlay (chapter 6). Policies use the zone, so adding a tunnel never needs a policy change.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="diagram"><rect x="10" y="60" width="150" height="80" rx="10" fill="#bbf7d0"/><text x="85" y="92" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><text x="85" y="112" text-anchor="middle" class="svg-muted" font-size="11">static, initiator</text><rect x="480" y="60" width="150" height="80" rx="10" fill="#ddd6fe"/><text x="555" y="92" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT</text><text x="555" y="112" text-anchor="middle" class="svg-muted" font-size="11">dynamic, listener</text><line x1="160" y1="100" x2="480" y2="100" stroke="#d97706" stroke-width="3"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="12">HUB1-VPN1 over ISP1</text><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="11">UDP 500 and 4500</text></svg><p class="cap">The spoke starts the tunnel to the hub address; the hub waits.</p></div>
<div class="warn"><p><b>Common mistake.</b> Leaving add-route enabled on a dial-up hub. FortiOS adds routes for the spoke subnets from the IPsec negotiation, with their own distance and priority, and these compete with BGP. The result is routes that do not follow your design. Disable it and let BGP carry the prefixes.</p></div>
<div class="exam"><p><b>Exam trap.</b> The hub is dynamic and passive; the spoke is static and active. Wide selectors in an SD-WAN overlay. Routes come from the routing protocol, not from add-route.</p></div>
<div class="scn"><h4>The hub that could not call a branch</h4><p>An engineer on HUB1-FGT wanted to ping the tunnel address of BR2-FGT to test it, but the tunnel was down and the ping failed, and he saw no way to bring it up from the hub. The tunnel only came up after someone at the branch rebooted a port.</p><p><b>Lesson:</b> A dial-up hub waits. The spoke initiates and keeps the tunnel up with auto-negotiate and DPD, and tests start at the spoke.</p></div>
<div class="iv"><p class="q">"Why use a dial-up phase 1 on the hub?"</p><p>Because the hub does not know the spoke address in advance and must not need one phase 1 per spoke. A dynamic phase 1 accepts any spoke that authenticates, so a new branch needs no hub change. The spoke initiates with a static remote gateway.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Hub: type dynamic. Spoke: remote-gw and auto-negotiate.</li><li>Disable add-route; routes come from BGP.</li><li>Wide selectors for route-based overlays.</li><li>Policies use the SD-WAN zone, not single tunnels.</li></ul></div>
`,hi:`
<p>200 branches ko serve karne wale hub ke paas 200 haath se likhe phase 1 entries nahi ho sakte. Standard design hub par <b>dial-up</b> phase 1 hai: woh ek address par sunta hai aur har us spoke ko accept karta hai jo apni identity sabit kare. Spoke initiator hota hai aur uska normal phase 1 fixed remote gateway ke saath hota hai.</p>
<h3>Dono sides</h3>
<table class="cmp"><tr><th>Side</th><th>Phase 1 type</th><th>Peer address pata hai?</th><th>Tunnel shuru karta hai?</th></tr><tr><td>Hub</td><td>Dynamic (dial-up)</td><td>Nahi, spoke ke connect hone par seekhta hai</td><td>Nahi, intezaar karta hai</td></tr><tr><td>Spoke</td><td>Static (remote-gw)</td><td>Haan, us underlay par hub address</td><td>Haan</td></tr></table>
<p>Yeh ek roz ka fact samjhata hai: spoke NAT ke peeche ho ya uska address badalta ho, hub par kuch badalna nahi padta. Yeh ek limit bhi samjhata hai: hub aise spoke ko tunnel shuru nahi kar sakta jo abhi connect nahi hua.</p>
<h3>Hub phase 1 aur phase 2</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! HUB1-FGT, tunnel over ISP1 (wan1 = 203.0.113.10)</span>
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set type dynamic
        set interface "wan1"
        set ike-version 2
        set peertype any
        set net-device disable
        set proposal aes256-sha256
        set dhgrp 14
        set add-route disable
        set dpd on-idle
        set dpd-retrycount 3
        set dpd-retryinterval 5
        set psksecret ENC example-secret-not-real
    next
end
config vpn ipsec phase2-interface
    edit "HUB1-VPN1"
        set phase1name "HUB1-VPN1"
        set proposal aes256-sha256
        set pfs enable
        set dhgrp 14
    next
end</pre>
<p>Line by line: <code>type dynamic</code> ise dial-up gate banata hai. <code>peertype any</code> peer ka ID kuch bhi ho use accept karta hai, aur pre-shared key proof hai; mazboot designs certificates ya peer ID check use karte hain (chapter 4). <code>add-route disable</code> FortiOS ko har spoke subnet ke liye route jodne se rokta hai: SD-WAN design mein routes BGP se aate hain, IPsec se nahi. Tunnel addresses mode-config se aate hain, jo chapter 4 is block mein jodta hai. ISP2 ka doosra tunnel wan2 par apne naam ke saath doosra phase 1 hai (chapter 5).</p>
<h3>Spoke phase 1 aur phase 2</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT, tunnel over ISP1 toward HUB1-FGT</span>
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set interface "wan1"
        set ike-version 2
        set peertype any
        set net-device enable
        set proposal aes256-sha256
        set dhgrp 14
        set remote-gw 203.0.113.10
        set add-route disable
        set dpd on-idle
        set dpd-retrycount 3
        set dpd-retryinterval 5
        set psksecret ENC example-secret-not-real
    next
end
config vpn ipsec phase2-interface
    edit "HUB1-VPN1"
        set phase1name "HUB1-VPN1"
        set proposal aes256-sha256
        set pfs enable
        set dhgrp 14
        set auto-negotiate enable
    next
end</pre>
<p>Dono sides par naam same hain, HUB1-VPN1, jaanbujhkar: isse monitoring aur templates aasan hote hain. Spoke ke paas <code>remote-gw</code> aur <code>auto-negotiate enable</code> hai, isliye woh tunnel khud up karta hai aur failure ke baad dobara establish karta hai.</p>
<div class="note"><p>Spoke <code>net-device enable</code> use kare ya disable, yeh design ka sawal hai jo release aur use hone wale features par depend karta hai; chapter 4 batata hai ki option kya karta hai aur yahan dikhaya hub disable kyun use karta hai. Copy karne se pehle apne version ke liye current Fortinet SD-WAN architecture guide mein sahi value check karo.</p></div>
<h3>Selectors</h3>
<p>Route-based overlay ke liye phase 2 selectors wide hone chahiye: source 0.0.0.0/0 aur destination 0.0.0.0/0 (jab aap set nahi karte to defaults). Tunnel mein kya jaata hai yeh selector nahi, routing tay karti hai. SD-WAN overlay mein narrow selectors un tunnels ki aam wajah hain jo up hain par kuch subnets ke liye traffic nahi paas karte.</p>
<h3>Firewall policy aur zone</h3>
<p>Tunnel interface ko policies chahiye. Hub par overlay zone se LAN tak aur wapas ek policy; spoke par LAN se overlay zone tak. Interfaces ek SD-WAN zone ke members ban jaate hain jiska naam, jaise, overlay hai (chapter 6). Policies zone use karti hain, isliye tunnel jodne par policy badalni nahi padti.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="diagram"><rect x="10" y="60" width="150" height="80" rx="10" fill="#bbf7d0"/><text x="85" y="92" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><text x="85" y="112" text-anchor="middle" class="svg-muted" font-size="11">static, initiator</text><rect x="480" y="60" width="150" height="80" rx="10" fill="#ddd6fe"/><text x="555" y="92" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT</text><text x="555" y="112" text-anchor="middle" class="svg-muted" font-size="11">dynamic, listener</text><line x1="160" y1="100" x2="480" y2="100" stroke="#d97706" stroke-width="3"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="12">HUB1-VPN1 over ISP1</text><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="11">UDP 500 and 4500</text></svg><p class="cap">Spoke hub address par tunnel shuru karta hai; hub intezaar karta hai.</p></div>
<div class="warn"><p><b>Common galti.</b> Dial-up hub par add-route enabled chhodna. FortiOS IPsec negotiation se spoke subnets ke routes jodta hai, apni distance aur priority ke saath, aur yeh BGP se compete karte hain. Natija aise routes hain jo aapke design ko follow nahi karte. Ise disable karo aur prefixes BGP ko le jaane do.</p></div>
<div class="exam"><p><b>Exam trap.</b> Hub dynamic aur passive hai; spoke static aur active hai. SD-WAN overlay mein wide selectors. Routes routing protocol se aate hain, add-route se nahi.</p></div>
<div class="scn"><h4>Hub jo branch ko call nahi kar saka</h4><p>HUB1-FGT par ek engineer BR2-FGT ke tunnel address ko test karne ke liye ping karna chahta tha, par tunnel down tha aur ping fail hua, aur use hub se tunnel up karne ka koi tareeka nahi dikha. Tunnel tabhi up hua jab branch par kisi ne port reboot kiya.</p><p><b>Seekh:</b> Dial-up hub intezaar karta hai. Spoke initiate karta hai aur auto-negotiate aur DPD se tunnel up rakhta hai, aur tests spoke se shuru hote hain.</p></div>
<div class="iv"><p class="q">"Hub par dial-up phase 1 kyun use karte ho?"</p><p>Kyunki hub ko spoke ka address pehle se nahi pata aur har spoke ke liye ek phase 1 nahi chahiye. Dynamic phase 1 har us spoke ko accept karta hai jo authenticate ho, isliye naye branch ke liye hub par kuch badalna nahi padta. Spoke static remote gateway se initiate karta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Hub: type dynamic. Spoke: remote-gw aur auto-negotiate.</li><li>Add-route disable karo; routes BGP se aate hain.</li><li>Route-based overlays ke liye wide selectors.</li><li>Policies SD-WAN zone use karti hain, akele tunnels nahi.</li></ul></div>
`}};export{e as default};