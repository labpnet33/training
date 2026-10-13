var e={id:`how-tunnels-form`,h:{en:`How tunnels form: registration, NAT traversal and the failure signatures`,hi:`Tunnels kaise bante hain: registration, NAT traversal aur failure signatures`},body:{en:`
<h3>You never type a tunnel address</h3>
<p>In AutoVPN there is no tunnel configuration on the MX itself. So how does MX-BLR find MX-MUM? Through the <b>cloud dashboard</b>, which acts like a telephone exchange. Each MX keeps a connection to the dashboard (this is why a device that cannot reach the dashboard is "offline" in the other modules). The tunnel setup follows these steps.</p>
<ol>
<li><b>Registration.</b> The hub MX tells the dashboard its role and the <b>public IP address</b> of its active uplink (for MX-MUM this is 198.51.100.10 on wan1, or 203.0.113.10 if it fails over to wan2). It also reports the subnets that have Use VPN enabled.</li>
<li><b>Information to the spokes.</b> The dashboard gives each spoke the hub's public address and the subnets that exist behind it. The spoke gives its own subnets to the dashboard.</li>
<li><b>Connection attempt.</b> The spoke sends tunnel-building packets to the hub's public address. Because the hub's address is public and stable, the hub does not need to know the spoke in advance.</li>
<li><b>Tunnel up.</b> If the packets get through, both sides agree and the tunnel state becomes up. Routes for the remote VPN subnets appear.</li>
</ol>

<h3>NAT traversal in plain words</h3>
<p><b>NAT</b> (network address translation) rewrites private addresses to a public one at the edge, often at the ISP. A branch MX may sit behind such a device and have only a private address in front of it. The MX then has to make the first move: it sends an <b>outbound</b> packet, the NAT device remembers it, and replies from the hub are allowed back in. Doing this on purpose to get through NAT is called <b>NAT traversal</b>. This is why a spoke can usually build a tunnel even without a public IP of its own, while the hub needs a reachable public address. In our lab the circuits use public documentation addresses, so you are shown the idea without a NAT device in the way.</p>

<h3>What must be true for a tunnel to be up</h3>
<p>The simulator checks exactly these conditions, and each failure looks different on the <b>Site-to-site VPN</b> page and in <b>Alerts and events</b>:</p>
<table class="cmp"><tr><th>Condition</th><th>If missing, the tunnel table says</th></tr>
<tr><td>Both ends have VPN mode (hub and spoke)</td><td>down: hub has mode none</td></tr>
<tr><td>Spoke lists that hub</td><td>down: hub not in spoke list</td></tr>
<tr><td>Each side has at least one subnet enabled</td><td>down: no VPN subnets on this side</td></tr>
<tr><td>Each side has an uplink up</td><td>down: no uplink (alert: uplink down)</td></tr>
<tr><td>Outbound UDP allowed upstream on both circuits</td><td>down: no response from peer (UDP blocked upstream?)</td></tr>
<tr><td>Organization licence valid</td><td>down: licence invalid or expired</td></tr></table>
<p>The word "UDP" means the connectionless transport protocol that tunnel traffic uses. <b>Outbound UDP must be allowed</b> on the circuit so that the tunnel packets can leave the site and the replies come back. An ISP router, a data-centre firewall or an upstream security device can block it without the MX knowing why. The exact list of ports and destinations is in the vendor documentation and is not given here.</p>
<pre class="out">Site-to-site VPN  (network: Bengaluru Branch)
Mode : spoke      Hubs : 1 MX-MUM
Hub      Hub address      Tunnel   Detail
MX-MUM   198.51.100.10    <span class="hl">down</span>     <span class="hl">no response from peer: outbound UDP blocked upstream?</span>

Alerts and events
10:41  alert  VPN tunnel to MX-MUM is down (MX-BLR)</pre>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Tunnel formation through the cloud dashboard">
<rect x="250" y="10" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Dashboard</text><text x="320" y="48" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.80</text>
<rect x="20" y="150" width="150" height="55" rx="8" fill="#bae6fd"/><text x="95" y="174" text-anchor="middle" class="svg-ink" font-size="13">MX-MUM (hub)</text><text x="95" y="192" text-anchor="middle" class="svg-muted" font-size="12">public 198.51.100.10</text>
<rect x="470" y="150" width="150" height="55" rx="8" fill="#bbf7d0"/><text x="545" y="174" text-anchor="middle" class="svg-ink" font-size="13">MX-BLR (spoke)</text><text x="545" y="192" text-anchor="middle" class="svg-muted" font-size="12">public 198.51.100.20</text>
<line x1="95" y1="150" x2="270" y2="60" stroke="#64748b" stroke-width="2"/><text x="120" y="95" class="svg-muted" font-size="12">1 register</text>
<line x1="370" y1="60" x2="545" y2="150" stroke="#64748b" stroke-width="2"/><text x="470" y="95" class="svg-muted" font-size="12">2 hub address</text>
<line x1="170" y1="178" x2="470" y2="178" stroke="#7c3aed" stroke-width="3" stroke-dasharray="8 4"/><text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">3 outbound UDP, 4 tunnel up</text>
</svg><p class="cap">The dashboard introduces the two MXs. The tunnel itself goes directly between them over the underlay.</p></div>

<div class="eg"><p><b>Worked example.</b> Delhi (MX-DEL, 203.0.113.30 on ACT-BB) cannot build to Mumbai. wan1 on both sides is up, modes and lists are right, VPN subnets are enabled, the licence is valid. The remaining cause is upstream: the ISP-B circuit at Delhi filters outbound UDP. The fix is not in the dashboard but a request to the ISP (or to whoever owns the upstream firewall), supported by the vendor's list of required traffic.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> Nothing here is a setting: this chapter explains what the dashboard reports. The conditions in the table are the ones you check when you read the tunnel state.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Debugging the hub first when the problem is the spoke's uplink; forgetting that the hub's public IP changes when it fails over to wan2; calling an expired licence a "network fault"; assuming that every upstream device allows outbound UDP.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Why can a spoke behind NAT still form a tunnel?" Because it starts the conversation with an outbound packet, so replies are allowed back (NAT traversal). The hub needs a reachable public address.</p></div>

<div class="scn"><h4>The licence nobody renewed</h4><p>All three sites showed tunnel down at 00:00 on the first of the month, while uplinks were green and nothing had been changed. The event log had no change entries. The Overview page showed the organization licence as expired. After the licence was renewed, the tunnels came up within minutes without touching any VPN setting.</p><p><b>Lesson:</b> when every tunnel fails at once with no change in the log, think organization-wide: licence, dashboard connectivity, a global upstream block.</p></div>

<div class="iv"><p class="q">"Walk me through how an AutoVPN tunnel is established."</p><p>Strong answer: each MX keeps a connection to the cloud dashboard; the hub registers its role, public IP and VPN subnets; the dashboard distributes that to the spokes; the spoke sends outbound tunnel packets to the hub's public address, which also handles NAT; replies come back and routes appear. Needs: modes, hub in the list, subnets, uplinks, outbound UDP allowed, valid licence.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The dashboard introduces hub and spoke; the tunnel then runs between the MXs.</li>
<li>The hub registers its public IP, which changes if it fails over to another uplink.</li>
<li>The spoke starts the tunnel, which also lets it work through NAT.</li>
<li>Outbound UDP must be allowed upstream; exact ports are in the vendor documentation.</li>
<li>Six conditions decide up or down: modes, hub list, subnets, uplinks, UDP, licence.</li>
</ul></div>
`,hi:`
<h3>Aap kabhi tunnel address type nahi karte</h3>
<p>AutoVPN mein MX par tunnel configuration hoti hi nahi. To MX-BLR ko MX-MUM kaise milta hai? <b>Cloud dashboard</b> ke through, jo telephone exchange ki tarah kaam karta hai. Har MX dashboard se ek connection rakhta hai (isiliye jo device dashboard tak nahi pahunch paata woh doosre modules mein "offline" hota hai). Tunnel setup in steps mein hota hai.</p>
<ol>
<li><b>Registration.</b> Hub MX dashboard ko apna role aur apni active uplink ka <b>public IP address</b> batata hai (MX-MUM ke liye wan1 par 198.51.100.10, ya wan2 par failover ho to 203.0.113.10). Woh un subnets ko bhi report karta hai jinpar Use VPN enabled hai.</li>
<li><b>Spokes ko information.</b> Dashboard har spoke ko hub ka public address aur uske peeche ke subnets deta hai. Spoke apne subnets dashboard ko deta hai.</li>
<li><b>Connection attempt.</b> Spoke hub ke public address par tunnel-building packets bhejta hai. Hub ka address public aur stable hai, isliye hub ko spoke ko pehle se jaanna zaroori nahi.</li>
<li><b>Tunnel up.</b> Agar packets pahunch jaate hain, dono sides agree karte hain aur tunnel state up ho jaati hai. Remote VPN subnets ke routes dikhne lagte hain.</li>
</ol>

<h3>NAT traversal seedhe shabdon mein</h3>
<p><b>NAT</b> (network address translation) edge par, aksar ISP par, private addresses ko ek public address mein rewrite karta hai. Branch MX aise device ke peeche ho sakta hai aur uske saamne sirf private address ho. Tab MX ko pehla kadam uthana padta hai: woh <b>outbound</b> packet bhejta hai, NAT device use yaad rakhta hai, aur hub ke replies andar aane diye jaate hain. NAT paar karne ke liye jaanbujhkar aisa karna <b>NAT traversal</b> kehlata hai. Isiliye spoke aam taur par bina apne public IP ke bhi tunnel bana leta hai, jabki hub ko reachable public address chahiye. Humari lab mein circuits public documentation addresses use karte hain, to NAT device ke bina bas idea dikhaya jaata hai.</p>

<h3>Tunnel up hone ke liye kya true hona chahiye</h3>
<p>Simulator bilkul yehi conditions check karta hai, aur har failure <b>Site-to-site VPN</b> page aur <b>Alerts and events</b> mein alag dikhta hai:</p>
<table class="cmp"><tr><th>Condition</th><th>Missing ho to tunnel table kehti hai</th></tr>
<tr><td>Dono ends par VPN mode (hub aur spoke)</td><td>down: hub has mode none</td></tr>
<tr><td>Spoke us hub ko list karta hai</td><td>down: hub not in spoke list</td></tr>
<tr><td>Har side par kam se kam ek subnet enabled</td><td>down: no VPN subnets on this side</td></tr>
<tr><td>Har side ka uplink up</td><td>down: no uplink (alert: uplink down)</td></tr>
<tr><td>Dono circuits par upstream outbound UDP allowed</td><td>down: no response from peer (UDP blocked upstream?)</td></tr>
<tr><td>Organization licence valid</td><td>down: licence invalid or expired</td></tr></table>
<p>"UDP" ka matlab woh connectionless transport protocol jo tunnel traffic use karta hai. Circuit par <b>outbound UDP allowed</b> hona chahiye taaki tunnel packets site se nikal sakein aur replies wapas aa sakein. ISP router, data-centre firewall ya upstream security device use block kar sakta hai aur MX ko wajah nahi pata chalti. Ports aur destinations ki exact list vendor documentation mein hai aur yahan nahi di gayi.</p>
<pre class="out">Site-to-site VPN  (network: Bengaluru Branch)
Mode : spoke      Hubs : 1 MX-MUM
Hub      Hub address      Tunnel   Detail
MX-MUM   198.51.100.10    <span class="hl">down</span>     <span class="hl">no response from peer: outbound UDP blocked upstream?</span>

Alerts and events
10:41  alert  VPN tunnel to MX-MUM is down (MX-BLR)</pre>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Cloud dashboard ke through tunnel formation">
<rect x="250" y="10" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Dashboard</text><text x="320" y="48" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.80</text>
<rect x="20" y="150" width="150" height="55" rx="8" fill="#bae6fd"/><text x="95" y="174" text-anchor="middle" class="svg-ink" font-size="13">MX-MUM (hub)</text><text x="95" y="192" text-anchor="middle" class="svg-muted" font-size="12">public 198.51.100.10</text>
<rect x="470" y="150" width="150" height="55" rx="8" fill="#bbf7d0"/><text x="545" y="174" text-anchor="middle" class="svg-ink" font-size="13">MX-BLR (spoke)</text><text x="545" y="192" text-anchor="middle" class="svg-muted" font-size="12">public 198.51.100.20</text>
<line x1="95" y1="150" x2="270" y2="60" stroke="#64748b" stroke-width="2"/><text x="120" y="95" class="svg-muted" font-size="12">1 register</text>
<line x1="370" y1="60" x2="545" y2="150" stroke="#64748b" stroke-width="2"/><text x="470" y="95" class="svg-muted" font-size="12">2 hub address</text>
<line x1="170" y1="178" x2="470" y2="178" stroke="#7c3aed" stroke-width="3" stroke-dasharray="8 4"/><text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">3 outbound UDP, 4 tunnel up</text>
</svg><p class="cap">Dashboard dono MXs ka parichay karata hai. Tunnel khud underlay par seedha MXs ke beech chalta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Delhi (MX-DEL, ACT-BB par 203.0.113.30) Mumbai tak tunnel nahi bana pa raha. Dono sides par wan1 up hai, modes aur lists theek hain, VPN subnets enabled hain, licence valid hai. Bacha hua cause upstream hai: Delhi ka ISP-B circuit outbound UDP filter karta hai. Fix dashboard mein nahi hai balki ISP (ya upstream firewall ke owner) se request hai, vendor ki required traffic list ke saath.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Yahan kuch setting nahi hai: yeh chapter samjhata hai ki dashboard kya report karta hai. Table ki conditions woh hain jo aap tunnel state padhte waqt check karte ho.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Jab problem spoke ke uplink mein hai tab pehle hub debug karna; yeh bhool jaana ki wan2 par failover hone par hub ka public IP badal jaata hai; expired licence ko "network fault" kehna; maan lena ki har upstream device outbound UDP allow karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "NAT ke peeche spoke bhi tunnel kyun bana leta hai?" Kyunki woh outbound packet se baat shuru karta hai, to replies wapas allowed hote hain (NAT traversal). Hub ko reachable public address chahiye.</p></div>

<div class="scn"><h4>Licence jo kisi ne renew nahi kiya</h4><p>Mahine ki pehli tareekh ko 00:00 par teeno sites ke tunnels down dikhe, jabki uplinks green the aur kuch badla nahi tha. Event log mein koi change entry nahi thi. Overview page par organization licence expired dikha. Licence renew hone ke baad VPN ki koi setting chhue bina tunnels kuch minutes mein up ho gaye.</p><p><b>Seekh:</b> jab sab tunnels ek saath fail hon aur log mein koi change na ho, to organization-wide socho: licence, dashboard connectivity, global upstream block.</p></div>

<div class="iv"><p class="q">"AutoVPN tunnel kaise establish hota hai, samjhao."</p><p>Strong answer: har MX cloud dashboard se connection rakhta hai; hub apna role, public IP aur VPN subnets register karta hai; dashboard woh spokes ko deta hai; spoke hub ke public address par outbound tunnel packets bhejta hai, jisse NAT bhi handle hota hai; replies aate hain aur routes bante hain. Zaroori: modes, list mein hub, subnets, uplinks, outbound UDP allowed, valid licence.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dashboard hub aur spoke ka parichay karata hai; tunnel phir MXs ke beech chalta hai.</li>
<li>Hub apna public IP register karta hai, jo doosre uplink par failover par badal jaata hai.</li>
<li>Spoke tunnel shuru karta hai, isse woh NAT ke through bhi kaam karta hai.</li>
<li>Upstream outbound UDP allowed hona chahiye; exact ports vendor documentation mein.</li>
<li>Chhe conditions up ya down decide karti hain: modes, hub list, subnets, uplinks, UDP, licence.</li>
</ul></div>
`}};export{e as default};