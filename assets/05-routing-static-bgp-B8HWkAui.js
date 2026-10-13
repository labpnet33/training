var e={id:`routing-static-bgp`,h:{en:`Routing: static routes versus BGP`,hi:`Routing: static routes versus BGP`},body:{en:`
<p>The tunnel is a road. Routing is the signboard that tells each side which addresses live at the other end. Without it, the road exists but nobody drives on it. A remote network can use <b>static routes</b>, <b>BGP</b>, or both. This chapter shows how each works and when to pick it.</p>

<h3>Static routes</h3>
<p>You type the branch subnets into the remote network object, for example 10.20.0.0/24 (or a /32 for a single host). Prisma Access then knows these subnets live behind this tunnel. On the branch you add a default or specific route pointing at the tunnel interface.</p>
<ul>
<li><b>Good for:</b> a small branch with one LAN, a simple lab, and sites that rarely change.</li>
<li><b>Weak spot:</b> every change is manual on both sides. A forgotten subnet is unreachable from the cloud.</li>
<li>Static routes cannot be combined with ECMP.</li>
</ul>

<h3>BGP</h3>
<p>BGP lets the branch announce its subnets and receive Prisma Access routes automatically. It is eBGP, so the two sides use different autonomous system (AS) numbers.</p>
<table class="cmp"><tr><th>Field (cloud side)</th><th>Meaning</th><th>Lab value</th></tr>
<tr><td>Peer AS</td><td>The AS of your branch router. Use a private AS (RFC 6996 range)</td><td>65001</td></tr>
<tr><td>Peer IP Address</td><td>Router ID of the branch eBGP router</td><td>10.254.1.2</td></tr>
<tr><td>Local IP Address</td><td>Optional. The address Prisma Access uses to peer. Up to 250 per remote network. Must not overlap the infrastructure subnet or branch subnets</td><td>10.254.1.1</td></tr>
<tr><td>Secret</td><td>Optional MD5 password for the session</td><td>lab value</td></tr>
<tr><td>MRAI timer</td><td>Minimum route advertisement interval, 1 to 600 seconds, default 30</td><td>30</td></tr>
<tr><td>Summarize Mobile User Routes</td><td>Send one summary for mobile pools instead of many /24 blocks</td><td>on</td></tr>
<tr><td>Advertise Default Route</td><td>Send a default route to the branch</td><td>optional</td></tr>
<tr><td>Don't Advertise Prisma Access Routes (SCM: Do Not Export Routes)</td><td>Receive only; do not announce cloud routes to the branch</td><td>off</td></tr>
</table>
<p>The cloud side itself speaks as the infrastructure BGP AS, which defaults to 65534. So BR-FW, which is AS 65001, peers with AS 65534.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="eBGP over the tunnel">
<rect x="20" y="40" width="190" height="100" rx="10" fill="#bbf7d0"/><text x="115" y="68" text-anchor="middle" class="svg-ink" font-size="14">BR-FW AS 65001</text><text x="115" y="92" text-anchor="middle" class="svg-muted" font-size="12">tunnel.1 10.254.1.2/32</text><text x="115" y="112" text-anchor="middle" class="svg-muted" font-size="12">announces 10.20.0.0/24</text>
<rect x="430" y="40" width="190" height="100" rx="10" fill="#bae6fd"/><text x="525" y="68" text-anchor="middle" class="svg-ink" font-size="14">Prisma AS 65534</text><text x="525" y="92" text-anchor="middle" class="svg-muted" font-size="12">Local IP 10.254.1.1/32</text><text x="525" y="112" text-anchor="middle" class="svg-muted" font-size="12">announces pools + HQ</text>
<line x1="210" y1="90" x2="430" y2="90" stroke="#64748b" stroke-width="3"/><text x="320" y="80" text-anchor="middle" class="svg-accent" font-size="12">eBGP over IPsec, TTL 8</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">branch needs route to 10.254.1.1</text>
</svg><p class="cap">The BGP session rides inside the tunnel between two /32 addresses.</p></div>

<h3>Facts you must remember</h3>
<ul>
<li>The eBGP TTL is set to 8, so the peers may be several hops away.</li>
<li>The branch device needs a <b>static route to the Prisma Access Local IP</b> (10.254.1.1) through the tunnel, otherwise the session cannot start.</li>
<li>MED sent by the CPE is not honoured.</li>
<li>The default BGP hold time is 90 seconds (RFC 4271), so a dead peer is detected slowly compared with static failover.</li>
<li>Prisma Access does not accept a BGP default route from the peer on a service connection.</li>
</ul>

<h3>Branch BGP outline on PAN-OS</h3>
<pre class="code"><span class="c"># outline only: confirm exact keywords with ? on your release</span>
<span class="c"># 1 static route to the Prisma Access Local IP, through the tunnel</span>
set network virtual-router default routing-table ip static-route TO-PA-BGP destination 10.254.1.1/32 interface tunnel.1
<span class="c"># 2 enable BGP: router ID 10.254.1.2, local AS 65001</span>
<span class="c"># 3 eBGP peer group, peer 10.254.1.1, peer AS 65534, local address tunnel.1 10.254.1.2/32</span>
<span class="c"># 4 export 10.20.0.0/24 (redistribute or network statement)</span></pre>

<div class="eg"><p><b>Worked example.</b> Branch BR-FW announces 10.20.0.0/24 to Prisma Access. Prisma Access installs it, advertises it over its backbone and to service connections, and sends the mobile pool 10.200.0.0/23 back to the branch (a summary if Summarize Mobile User Routes is on). A new VLAN 10.20.1.0/24 appears at the branch. With BGP it is announced after the next MRAI. With static routes someone must add it to the remote network and push.</p></div>

<h3>Choosing</h3>
<table class="cmp"><tr><th>Need</th><th>Pick</th></tr>
<tr><td>One small LAN, few changes</td><td>Static</td></tr>
<tr><td>Many subnets, frequent change</td><td>BGP</td></tr>
<tr><td>ECMP over several tunnels</td><td>BGP (required)</td></tr>
<tr><td>Mobile users must reach branch hosts</td><td>Either, as long as the subnets are known to the cloud</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Using a public AS number; giving a Local IP that overlaps the infrastructure subnet; forgetting the branch static route to the Local IP; announcing a subnet that overlaps the mobile pool or infrastructure subnet.</p></div>
<div class="exam"><p><b>Exam trap.</b> Peer AS is your branch AS, not Prisma Access. TTL 8. MRAI default 30 s with range 1 to 600. ECMP needs BGP.</p></div>

<div class="scn"><h4>BGP stuck in Connect</h4><p>The remote network showed BGP Status "Connect" for an hour. The branch had the right AS and peer, but nobody had added a static route to 10.254.1.1. Once the route through tunnel.1 existed, the session became Established and the branch subnet appeared in the Local RIB.</p><p><b>Lesson:</b> BGP rides inside the tunnel. The tunnel must carry a route to the peer address first.</p></div>

<div class="iv"><p class="q">"How do you run BGP between a branch and Prisma Access?"</p><p>Define Peer AS (branch private AS), Peer IP (branch router ID) and an optional Local IP on the remote network. On the branch, add a static route to the Local IP via the tunnel, peer with the infrastructure AS 65534, and announce the LAN. TTL is 8 and the MRAI default is 30 seconds.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static is simple and manual; BGP is dynamic and needed for ECMP.</li>
<li>Peer AS is the branch AS; Prisma Access uses infrastructure AS 65534 by default.</li>
<li>Local IP must not overlap infrastructure or branch subnets; branch needs a route to it.</li>
<li>MRAI 1 to 600 s (default 30); TTL 8; MED not honoured.</li>
<li>Summarize and no-export style options control what is announced.</li>
</ul></div>
`,hi:`
<p>Tunnel ek road hai. Routing signboard hai jo har side ko batata hai ki kaun se addresses dusre end par hain. Iske bina road hai lekin koi chalta nahi. Remote network <b>static routes</b>, <b>BGP</b>, ya dono use kar sakta hai. Yeh chapter dikhata hai ki har ek kaise kaam karta hai aur kab chunna hai.</p>

<h3>Static routes</h3>
<p>Aap branch subnets remote network object mein type karte ho, jaise 10.20.0.0/24 (ya ek host ke liye /32). Phir Prisma Access jaan jaata hai ki yeh subnets is tunnel ke peeche hain. Branch par aap default ya specific route add karte ho jo tunnel interface ko point kare.</p>
<ul>
<li><b>Achha hai:</b> chhota branch jisme ek LAN ho, simple lab, aur woh sites jo kam badalti hain.</li>
<li><b>Kamzori:</b> har change dono sides par manual hai. Bhoola hua subnet cloud se unreachable rehta hai.</li>
<li>Static routes ko ECMP ke saath combine nahi kar sakte.</li>
</ul>

<h3>BGP</h3>
<p>BGP branch ko apne subnets announce karne aur Prisma Access routes automatically receive karne deta hai. Yeh eBGP hai, isliye dono sides alag autonomous system (AS) numbers use karti hain.</p>
<table class="cmp"><tr><th>Field (cloud side)</th><th>Matlab</th><th>Lab value</th></tr>
<tr><td>Peer AS</td><td>Aapke branch router ka AS. Private AS use karo (RFC 6996 range)</td><td>65001</td></tr>
<tr><td>Peer IP Address</td><td>Branch eBGP router ka router ID</td><td>10.254.1.2</td></tr>
<tr><td>Local IP Address</td><td>Optional. Woh address jo Prisma Access peering ke liye use karta hai. Ek remote network par 250 tak. Infrastructure subnet ya branch subnets se overlap nahi hona chahiye</td><td>10.254.1.1</td></tr>
<tr><td>Secret</td><td>Session ke liye optional MD5 password</td><td>lab value</td></tr>
<tr><td>MRAI timer</td><td>Minimum route advertisement interval, 1 se 600 seconds, default 30</td><td>30</td></tr>
<tr><td>Summarize Mobile User Routes</td><td>Mobile pools ke liye kai /24 blocks ki jagah ek summary bhejo</td><td>on</td></tr>
<tr><td>Advertise Default Route</td><td>Branch ko default route bhejo</td><td>optional</td></tr>
<tr><td>Don't Advertise Prisma Access Routes (SCM: Do Not Export Routes)</td><td>Sirf receive karo; cloud routes branch ko announce mat karo</td><td>off</td></tr>
</table>
<p>Cloud side khud infrastructure BGP AS ke roop mein bolti hai, jiska default 65534 hai. To BR-FW, jo AS 65001 hai, AS 65534 se peer karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="eBGP over the tunnel">
<rect x="20" y="40" width="190" height="100" rx="10" fill="#bbf7d0"/><text x="115" y="68" text-anchor="middle" class="svg-ink" font-size="14">BR-FW AS 65001</text><text x="115" y="92" text-anchor="middle" class="svg-muted" font-size="12">tunnel.1 10.254.1.2/32</text><text x="115" y="112" text-anchor="middle" class="svg-muted" font-size="12">announces 10.20.0.0/24</text>
<rect x="430" y="40" width="190" height="100" rx="10" fill="#bae6fd"/><text x="525" y="68" text-anchor="middle" class="svg-ink" font-size="14">Prisma AS 65534</text><text x="525" y="92" text-anchor="middle" class="svg-muted" font-size="12">Local IP 10.254.1.1/32</text><text x="525" y="112" text-anchor="middle" class="svg-muted" font-size="12">announces pools + HQ</text>
<line x1="210" y1="90" x2="430" y2="90" stroke="#64748b" stroke-width="3"/><text x="320" y="80" text-anchor="middle" class="svg-accent" font-size="12">eBGP over IPsec, TTL 8</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">branch needs route to 10.254.1.1</text>
</svg><p class="cap">BGP session tunnel ke andar do /32 addresses ke beech chalta hai.</p></div>

<h3>Yaad rakhne wale facts</h3>
<ul>
<li>eBGP TTL 8 set hota hai, to peers kai hops door ho sakte hain.</li>
<li>Branch device ko tunnel ke through <b>Prisma Access Local IP ka static route</b> (10.254.1.1) chahiye, warna session start nahi hoga.</li>
<li>CPE ka bheja MED honour nahi hota.</li>
<li>Default BGP hold time 90 seconds hai (RFC 4271), isliye static failover ke muqable dead peer dheere detect hota hai.</li>
<li>Service connection par Prisma Access peer se BGP default route accept nahi karta.</li>
</ul>

<h3>PAN-OS par branch BGP outline</h3>
<pre class="code"><span class="c"># sirf outline: exact keywords apni release par ? se confirm karo</span>
<span class="c"># 1 Prisma Access Local IP ka static route, tunnel ke through</span>
set network virtual-router default routing-table ip static-route TO-PA-BGP destination 10.254.1.1/32 interface tunnel.1
<span class="c"># 2 BGP enable: router ID 10.254.1.2, local AS 65001</span>
<span class="c"># 3 eBGP peer group, peer 10.254.1.1, peer AS 65534, local address tunnel.1 10.254.1.2/32</span>
<span class="c"># 4 10.20.0.0/24 export karo (redistribute ya network statement)</span></pre>

<div class="eg"><p><b>Worked example.</b> Branch BR-FW 10.20.0.0/24 ko Prisma Access ko announce karta hai. Prisma Access ise install karke backbone par aur service connections ko advertise karta hai, aur mobile pool 10.200.0.0/23 branch ko wapas bhejta hai (Summarize Mobile User Routes on ho to summary). Branch par naya VLAN 10.20.1.0/24 aata hai. BGP ke saath woh agle MRAI ke baad announce ho jaata hai. Static routes ke saath kisi ko ise remote network mein add karke push karna padta hai.</p></div>

<h3>Choose kaise karein</h3>
<table class="cmp"><tr><th>Zaroorat</th><th>Choice</th></tr>
<tr><td>Ek chhota LAN, kam changes</td><td>Static</td></tr>
<tr><td>Bahut subnets, frequent change</td><td>BGP</td></tr>
<tr><td>Kai tunnels par ECMP</td><td>BGP (zaroori)</td></tr>
<tr><td>Mobile users ko branch hosts tak pahunchna hai</td><td>Dono chalte hain, bas subnets cloud ko pata hon</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Public AS number use karna; Local IP jo infrastructure subnet se overlap kare; Local IP ka branch static route bhoolna; aisa subnet announce karna jo mobile pool ya infrastructure subnet se overlap kare.</p></div>
<div class="exam"><p><b>Exam trap.</b> Peer AS aapka branch AS hai, Prisma Access ka nahi. TTL 8. MRAI default 30 s, range 1 se 600. ECMP ko BGP chahiye.</p></div>

<div class="scn"><h4>BGP Connect mein atka</h4><p>Remote network par BGP Status ek ghante tak "Connect" raha. Branch par AS aur peer sahi the, lekin kisi ne 10.254.1.1 ka static route add nahi kiya tha. Tunnel ke through route aate hi session Established ho gaya aur branch subnet Local RIB mein dikha.</p><p><b>Lesson:</b> BGP tunnel ke andar chalta hai. Tunnel ko pehle peer address ka route carry karna padta hai.</p></div>

<div class="iv"><p class="q">"Branch aur Prisma Access ke beech BGP kaise chalate ho?"</p><p>Remote network par Peer AS (branch private AS), Peer IP (branch router ID) aur optional Local IP define karo. Branch par Local IP ka static route tunnel se add karo, infrastructure AS 65534 se peer karo, aur LAN announce karo. TTL 8 hai aur MRAI default 30 seconds.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static simple aur manual hai; BGP dynamic hai aur ECMP ke liye zaroori.</li>
<li>Peer AS branch AS hai; Prisma Access default infrastructure AS 65534 use karta hai.</li>
<li>Local IP infrastructure ya branch subnets se overlap na kare; branch ko uska route chahiye.</li>
<li>MRAI 1 se 600 s (default 30); TTL 8; MED honour nahi hota.</li>
<li>Summarize aur no-export type options decide karte hain kya announce hoga.</li>
</ul></div>
`}};export{e as default};