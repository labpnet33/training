var e={id:`bgp-sessions-messages`,h:{en:`BGP sessions: messages, states and the first configuration`,hi:`BGP sessions: messages, states aur pehli configuration`},body:{en:`
<p>Before two people can trade parcels they have a phone call: "Hello, I am company 65010, I will hang up if I hear nothing for 90 seconds." A BGP session starts the same way. Two routers open a TCP connection, introduce themselves, and then exchange routes. Understanding this call tells you where to look when it fails.</p>

<h3>Four message types</h3>
<table class="cmp"><tr><th>Message</th><th>Purpose</th></tr>
<tr><td>OPEN</td><td>First message: AS number, hold time, router ID, capabilities</td></tr>
<tr><td>UPDATE</td><td>New prefixes with their attributes, and withdrawn prefixes</td></tr>
<tr><td>KEEPALIVE</td><td>"I am still here", sent every hold time divided by 3 (30 s with the default 90 s)</td></tr>
<tr><td>NOTIFICATION</td><td>An error. The session closes right after it</td></tr></table>
<p>BGP is incremental. After the first full exchange it sends only changes, so a stable Internet table does not cause constant traffic. There is no periodic refresh.</p>

<h3>The finite state machine</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="BGP states">
<rect x="10" y="50" width="86" height="44" rx="8" fill="#e5e7eb" stroke="#64748b"/><text x="53" y="77" text-anchor="middle" class="svg-ink" font-size="12">Idle</text>
<rect x="116" y="50" width="86" height="44" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="159" y="77" text-anchor="middle" class="svg-ink" font-size="12">Connect</text>
<rect x="222" y="50" width="86" height="44" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="265" y="77" text-anchor="middle" class="svg-ink" font-size="12">Active</text>
<rect x="328" y="50" width="86" height="44" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="371" y="77" text-anchor="middle" class="svg-ink" font-size="12">OpenSent</text>
<rect x="434" y="50" width="86" height="44" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="477" y="77" text-anchor="middle" class="svg-ink" font-size="12">OpenConfirm</text>
<rect x="540" y="50" width="90" height="44" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="585" y="77" text-anchor="middle" class="svg-ink" font-size="12">Established</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Stuck in Active: TCP does not get through. Established: routes can flow.</text>
</svg><p class="cap">Idle, Connect, Active, OpenSent, OpenConfirm, Established.</p></div>
<ul>
<li><b>Idle</b>: nothing started, or waiting after an error before retrying.</li>
<li><b>Connect and Active</b>: the router tries to open TCP port 179. A peer that stays in <b>Active</b> usually means the TCP connection is failing: wrong neighbour address, no route to it, a firewall filter, or the other side has not configured you.</li>
<li><b>OpenSent and OpenConfirm</b>: OPEN messages were exchanged and checked (AS number, router ID, hold time).</li>
<li><b>Established</b>: UPDATEs flow.</li>
</ul>

<h3>The first configuration</h3>
<p>In Junos a neighbour always lives in a <b>group</b>. Options on the group are inherited by its neighbours, and a neighbour can override them. You need the local AS number, a group type (external or internal), the remote AS and the neighbour address.</p>
<pre class="code">set routing-options autonomous-system 65010
set protocols bgp group ISP type external
set protocols bgp group ISP peer-as 64500
set protocols bgp group ISP neighbor 100.65.1.1</pre>
<p>Before configuration the router says BGP is not running. After the commit and a short wait, the session is Established and the neighbour output shows the timers:</p>
<pre class="out">lab@NGP-R1&gt; show bgp summary
Groups: 1 Peers: 1 Down peers: 0
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
100.65.1.1            64500          3          2       0       0        0:25 Establ
  inet.0: 2/2/2/0
lab@NGP-R1&gt; show bgp neighbor 100.65.1.1
Peer: 100.65.1.1+179 AS 64500 Local: 100.65.1.2+39053 AS 65010
  Type: External    State: Established    Flags: &lt;Sync&gt;
  Holdtime: 90 Preference: 170
  Peer ID: 100.65.255.1  Local ID: 10.20.255.1  Active Holdtime: 90
  Keepalive Interval: 30  Group index: 0    Peer index: 0
  NLRI for this session: inet-unicast</pre>
<p>Notice the <b>+179</b> on the peer side: the neighbour listens on port 179, and our side used a random port. <b>Local ID</b> is the BGP router ID, taken from the router-id statement (here the loopback). The negotiated hold time is 90 and the keepalive 30, as the table above says.</p>

<h3>What breaks a session</h3>
<p>Two mistakes were tried in the lab. A neighbour address that nobody owns, and a wrong remote AS number (64501 instead of 64500):</p>
<pre class="out">lab@NGP-R1&gt; show bgp summary
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
100.65.1.1            64501          0          2       0       0           0 <span class="hl">Idle</span>
100.65.1.5            64500          0          0       0       0           0 <span class="hl">Active</span></pre>
<p>The address 100.65.1.5 does not exist on the link, so TCP never connects and the state stays Active. For the wrong remote AS the neighbour opens, but the AS in the OPEN message does not match peer-as, so the router rejects the session (a NOTIFICATION on a real network) and the peer does not become established; the simulator shows it as Idle. After correcting peer-as to 64500, the session was Established again with 2 active prefixes.</p>

<div class="eg"><p><b>Worked example.</b> A peer is stuck in Active. Check in order: (1) is the neighbour address correct? (2) <code>ping</code> the neighbour from the same interface; (3) does the other side list your address and your AS? If TCP to 179 cannot be opened, none of the BGP details matter yet. Only when the state reaches OpenSent do the AS number and hold time start to matter.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>routing-options autonomous-system</code>. BGP will not run without a local AS. Also, swapping local and remote AS numbers: peer-as is the neighbour's number, not yours.</p></div>
<div class="exam"><p><b>Exam trap.</b> Active does not mean "working": it means TCP is trying and failing. Hold time is 90 seconds by default and keepalives are a third of it. The hold time is negotiated: the lower of the two configured values is used. The AS number in the OPEN must match the configured peer-as.</p></div>

<div class="scn"><h4>Active at 2 a.m.</h4><p>A provider change moved the ISP handoff to a new /30. The edge router kept the old neighbour address and sat in Active for hours. The configuration looked fine. A ping to the neighbour failed, which immediately showed the address problem. The commit history showed the interface address had changed but the neighbour had not.</p><p><b>Lesson:</b> a ping from the right interface tells you more in ten seconds than reading BGP debug output.</p></div>

<div class="iv"><p class="q">"A BGP peer is stuck in Active. What does that mean and what do you check?"</p><p>It means the router is trying to open the TCP connection to port 179 and failing. I check the neighbour address, ping it, look for a missing route or a filter on port 179, and confirm that the other side has the right address and AS for me. The AS and capability checks only come after TCP works.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BGP messages: OPEN, UPDATE, KEEPALIVE, NOTIFICATION; keepalive is a third of the 90 s hold time.</li>
<li>States: Idle, Connect, Active, OpenSent, OpenConfirm, Established.</li>
<li>Active means TCP is failing; check address, reachability and filters.</li>
<li>Neighbours live in groups with type, peer-as and neighbour address.</li>
</ul></div>
`,hi:`
<p>Do log parcels ka len-den karne se pehle phone par baat karte hain: "Hello, main company 65010 hoon, 90 second tak kuch na sunoon to phone kaat dunga." BGP session bhi aise hi shuru hota hai. Do routers TCP connection kholte hain, apna parichay dete hain, phir routes badalte hain. Is call ko samajhne se pata chalta hai ki fail hone par kahan dekhna hai.</p>

<h3>Chaar message types</h3>
<table class="cmp"><tr><th>Message</th><th>Kaam</th></tr>
<tr><td>OPEN</td><td>Pehla message: AS number, hold time, router ID, capabilities</td></tr>
<tr><td>UPDATE</td><td>Naye prefixes attributes ke saath, aur withdraw kiye prefixes</td></tr>
<tr><td>KEEPALIVE</td><td>"Main abhi hoon", hold time ka 3 se bhaag par bheja jaata hai (default 90 s par 30 s)</td></tr>
<tr><td>NOTIFICATION</td><td>Error. Iske turant baad session band ho jaata hai</td></tr></table>
<p>BGP incremental hai. Pehle poore exchange ke baad wo sirf changes bhejta hai, isliye stable Internet table se lagataar traffic nahi hota. Periodic refresh nahi hota.</p>

<h3>Finite state machine</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="BGP states">
<rect x="10" y="50" width="86" height="44" rx="8" fill="#e5e7eb" stroke="#64748b"/><text x="53" y="77" text-anchor="middle" class="svg-ink" font-size="12">Idle</text>
<rect x="116" y="50" width="86" height="44" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="159" y="77" text-anchor="middle" class="svg-ink" font-size="12">Connect</text>
<rect x="222" y="50" width="86" height="44" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="265" y="77" text-anchor="middle" class="svg-ink" font-size="12">Active</text>
<rect x="328" y="50" width="86" height="44" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="371" y="77" text-anchor="middle" class="svg-ink" font-size="12">OpenSent</text>
<rect x="434" y="50" width="86" height="44" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="477" y="77" text-anchor="middle" class="svg-ink" font-size="12">OpenConfirm</text>
<rect x="540" y="50" width="90" height="44" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="585" y="77" text-anchor="middle" class="svg-ink" font-size="12">Established</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Active mein atke: TCP nahi pahunch raha. Established: routes chal sakte hain.</text>
</svg><p class="cap">Idle, Connect, Active, OpenSent, OpenConfirm, Established.</p></div>
<ul>
<li><b>Idle</b>: kuch shuru nahi hua, ya error ke baad dobara try se pehle intezaar.</li>
<li><b>Connect aur Active</b>: router TCP port 179 kholne ki koshish karta hai. <b>Active</b> mein atka peer aam taur par batata hai ki TCP connection fail ho raha hai: galat neighbour address, uska route nahi, firewall filter, ya doosri taraf aap configured nahi ho.</li>
<li><b>OpenSent aur OpenConfirm</b>: OPEN messages badle aur check hue (AS number, router ID, hold time).</li>
<li><b>Established</b>: UPDATEs chalte hain.</li>
</ul>

<h3>Pehli configuration</h3>
<p>Junos mein neighbour hamesha ek <b>group</b> mein rehta hai. Group ke options neighbours inherit karte hain, aur neighbour unhe override kar sakta hai. Aapko local AS number, group type (external ya internal), remote AS aur neighbour address chahiye.</p>
<pre class="code">set routing-options autonomous-system 65010
set protocols bgp group ISP type external
set protocols bgp group ISP peer-as 64500
set protocols bgp group ISP neighbor 100.65.1.1</pre>
<p>Configuration se pehle router kehta hai BGP chal nahi raha. Commit aur thodi der ke baad session Established hota hai aur neighbour output timers dikhata hai:</p>
<pre class="out">lab@NGP-R1&gt; show bgp summary
Groups: 1 Peers: 1 Down peers: 0
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
100.65.1.1            64500          3          2       0       0        0:25 Establ
  inet.0: 2/2/2/0
lab@NGP-R1&gt; show bgp neighbor 100.65.1.1
Peer: 100.65.1.1+179 AS 64500 Local: 100.65.1.2+39053 AS 65010
  Type: External    State: Established    Flags: &lt;Sync&gt;
  Holdtime: 90 Preference: 170
  Peer ID: 100.65.255.1  Local ID: 10.20.255.1  Active Holdtime: 90
  Keepalive Interval: 30  Group index: 0    Peer index: 0
  NLRI for this session: inet-unicast</pre>
<p>Peer side par <b>+179</b> dekho: neighbour port 179 par sunta hai, aur hamari taraf random port tha. <b>Local ID</b> BGP router ID hai, router-id statement se (yahan loopback). Negotiated hold time 90 aur keepalive 30 hai, jaise upar ki table kehti hai.</p>

<h3>Session kya tod deta hai</h3>
<p>Lab mein do galtiyan try ki gayi. Aisa neighbour address jo kisi ka nahi, aur galat remote AS number (64500 ki jagah 64501):</p>
<pre class="out">lab@NGP-R1&gt; show bgp summary
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
100.65.1.1            64501          0          2       0       0           0 <span class="hl">Idle</span>
100.65.1.5            64500          0          0       0       0           0 <span class="hl">Active</span></pre>
<p>Address 100.65.1.5 link par hai hi nahi, isliye TCP kabhi connect nahi hota aur state Active rehti hai. Galat remote AS mein neighbour OPEN kholta hai, par OPEN message ka AS peer-as se match nahi karta, isliye router session reject karta hai (asli network par NOTIFICATION) aur peer established nahi hota; simulator ise Idle dikhata hai. peer-as ko 64500 karne ke baad session phir Established hua aur 2 active prefixes aaye.</p>

<div class="eg"><p><b>Worked example.</b> Peer Active mein atka hai. Order mein check karo: (1) neighbour address sahi hai? (2) usi interface se neighbour ko <code>ping</code> karo; (3) doosri taraf aapka address aur AS listed hai? Agar TCP 179 nahi khul sakta to BGP ki details abhi maayne nahi rakhtin. State OpenSent tak pahunchne par hi AS number aur hold time ka matlab hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>routing-options autonomous-system</code> bhool jaana. Local AS ke bina BGP nahi chalta. Aur local aur remote AS numbers ulta dena: peer-as neighbour ka number hai, aapka nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Active ka matlab "kaam kar raha" nahi: matlab TCP koshish kar raha hai aur fail ho raha hai. Default hold time 90 second hai aur keepalive uska ek tihai. Hold time negotiate hota hai: dono configured values mein se kam wali use hoti hai. OPEN ka AS number configured peer-as se match hona chahiye.</p></div>

<div class="scn"><h4>Raat 2 baje Active</h4><p>Provider ke change ne ISP handoff naye /30 par kar diya. Edge router ne purana neighbour address rakha aur ghanton Active mein raha. Configuration theek dikhti thi. Neighbour ko ping fail hui, jisse turant address ki problem dikhi. Commit history ne dikhaya ki interface address badla tha par neighbour nahi.</p><p><b>Lesson:</b> sahi interface se ping BGP debug output padhne se zyada dus second mein batata hai.</p></div>

<div class="iv"><p class="q">"BGP peer Active mein atka hai. Iska kya matlab hai aur kya check karte ho?"</p><p>Matlab router TCP port 179 par connection kholne ki koshish kar raha hai aur fail ho raha hai. Main neighbour address check karta hoon, ping karta hoon, missing route ya port 179 par filter dekhta hoon, aur confirm karta hoon ki doosri taraf mere liye sahi address aur AS hai. AS aur capability checks TCP chalne ke baad aate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BGP messages: OPEN, UPDATE, KEEPALIVE, NOTIFICATION; keepalive 90 s hold time ka ek tihai.</li>
<li>States: Idle, Connect, Active, OpenSent, OpenConfirm, Established.</li>
<li>Active ka matlab TCP fail ho raha hai; address, reachability aur filters check karo.</li>
<li>Neighbours groups mein rehte hain type, peer-as aur neighbour address ke saath.</li>
</ul></div>
`}};export{e as default};