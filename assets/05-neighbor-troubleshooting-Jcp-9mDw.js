var e={id:`neighbor-ts`,h:{en:`Neighbor relationships: states, update-source, multihop, AS and timers`,hi:`Neighbor relationships: states, update-source, multihop, AS aur timers`},body:{en:`
<p>A BGP session is like a formal business meeting. First the two companies must be able to phone each other (IP reachability). Then someone must pick up (TCP port 179). Then both introduce themselves with the right company name and badge (the OPEN message: AS number, router ID, hold time, capabilities). Only then does business start (UPDATE messages). When a meeting never happens, the stage where it stopped tells you who to blame. BGP neighbor states are those stages.</p>

<h3>Read the state, name the layer</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Where a BGP session gets stuck">
<rect x="10" y="30" width="110" height="44" rx="8" fill="#e2e8f0"/><text x="65" y="57" text-anchor="middle" class="svg-ink" font-size="13">Idle</text>
<rect x="135" y="30" width="110" height="44" rx="8" fill="#fde68a"/><text x="190" y="57" text-anchor="middle" class="svg-ink" font-size="13">Connect / Active</text>
<rect x="260" y="30" width="110" height="44" rx="8" fill="#fed7aa"/><text x="315" y="57" text-anchor="middle" class="svg-ink" font-size="13">OpenSent</text>
<rect x="385" y="30" width="110" height="44" rx="8" fill="#fed7aa"/><text x="440" y="57" text-anchor="middle" class="svg-ink" font-size="13">OpenConfirm</text>
<rect x="510" y="30" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="570" y="57" text-anchor="middle" class="svg-ink" font-size="13">Established</text>
<text x="65" y="100" text-anchor="middle" class="svg-muted" font-size="12">shutdown, PfxCt,</text><text x="65" y="116" text-anchor="middle" class="svg-muted" font-size="12">no route to peer</text>
<text x="190" y="100" text-anchor="middle" class="svg-muted" font-size="12">TCP 179 fails:</text><text x="190" y="116" text-anchor="middle" class="svg-muted" font-size="12">ACL, source, MD5</text>
<text x="378" y="100" text-anchor="middle" class="svg-muted" font-size="12">OPEN rejected: wrong AS,</text><text x="378" y="116" text-anchor="middle" class="svg-muted" font-size="12">router ID, capabilities</text>
<text x="570" y="100" text-anchor="middle" class="svg-muted" font-size="12">look at prefixes</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">The state where a session stops points to the broken layer</text>
</svg><p class="cap">Idle and Active are the states you will see in real tickets; OpenSent and OpenConfirm flash by and fall back to Idle after a NOTIFICATION.</p></div>

<table class="cmp"><tr><th>What you see</th><th>Meaning</th><th>Typical causes</th></tr>
<tr><td>Idle (Admin)</td><td>Session disabled by configuration</td><td><code>neighbor X shutdown</code> left behind after maintenance</td></tr>
<tr><td>Idle (PfxCt)</td><td>Maximum-prefix limit exceeded</td><td>Peer leaked routes; needs <code>clear ip bgp X</code> after the fix</td></tr>
<tr><td>Idle</td><td>Not trying, or backing off after an error</td><td>No route to the peer address; a NOTIFICATION was just exchanged</td></tr>
<tr><td>Active</td><td>TCP connection keeps failing</td><td>Wrong peer address, ACL dropping TCP 179, missing update-source, TTL (multihop), MD5 on one side only</td></tr>
<tr><td>Flapping via OpenSent to Idle</td><td>OPEN message rejected</td><td>Wrong remote-as, duplicate router ID, hold time or capability mismatch</td></tr>
</table>

<h3>Wrong AS: decode the NOTIFICATION</h3>
<p>This is exactly ALRT-88121 from the NOC lab. EDGE1 was edited during maintenance and now shows:</p>
<pre class="out">EDGE1# show ip bgp summary | include 172.30.1.1
172.30.1.1      4        64880       0       0        1    0    0 00:00:21 Idle
EDGE1#
<span class="hl">%BGP-3-NOTIFICATION: sent to neighbor 172.30.1.1 passive 2/2 (peer in wrong AS) 2 bytes FD20</span></pre>
<p>Error code 2 is "OPEN message error", subcode 2 is "Bad peer AS". The data bytes are the AS the peer actually sent, in hex: 0xFD20 = 15 x 4096 + 13 x 256 + 2 x 16 = <b>64800</b>. The configured remote-as is 64880, a typo. The fix is <code>neighbor 172.30.1.1 remote-as 64800</code>; you never need to touch the partner's router.</p>
<table class="cmp"><tr><th>NOTIFICATION</th><th>Meaning</th></tr>
<tr><td>2/2</td><td>Bad peer AS (remote-as mismatch)</td></tr>
<tr><td>2/3</td><td>Bad BGP identifier (for example duplicate router ID)</td></tr>
<tr><td>4/0</td><td>Hold timer expired (keepalives lost)</td></tr>
<tr><td>6/x</td><td>Cease: 6/1 maximum prefixes, 6/2 administrative shutdown, 6/4 administrative reset</td></tr>
</table>

<h3>update-source and TCP</h3>
<p>When a session sits in Active, test the transport exactly as BGP uses it. For loopback peering: <code>ping 10.255.0.1 source Loopback0</code>. Then look at the socket: <code>show tcp brief | include 179</code> shows whether any connection to port 179 exists. A router only accepts a BGP connection from an address listed as a neighbor, so a missing update-source on one side is a classic cause of Active.</p>

<h3>eBGP between loopbacks: multihop and connected check</h3>
<p>eBGP sends packets with <b>TTL 1</b> and, by default, expects the neighbor address to be on a directly connected subnet. Peering eBGP between loopbacks (for example over two parallel links) breaks both assumptions. Two options:</p>
<pre class="code"><span class="c">! Option A: raise the TTL (peer loopbacks are 2 hops apart)</span>
router bgp 65010
 neighbor 192.0.2.2 remote-as 65020
 neighbor 192.0.2.2 update-source Loopback0
 neighbor 192.0.2.2 ebgp-multihop 2
<span class="c">! Option B: directly connected routers, only skip the connected check</span>
 neighbor 192.0.2.2 disable-connected-check
<span class="c">! Either way, each side needs a route to the other loopback</span>
ip route 192.0.2.2 255.255.255.255 198.51.100.2</pre>
<pre class="out">R1# show ip bgp neighbors 192.0.2.2 | include hops|state
  BGP state = Established, up for 00:03:11
<span class="hl">  External BGP neighbor may be up to 2 hops away.</span></pre>

<h3>Timers</h3>
<p>Defaults on IOS are keepalive 60 s and hold 180 s. In the OPEN message each side proposes a hold time and the <b>lower</b> one is used; keepalives are then sent at one third of it. <code>neighbor X timers 10 30</code> changes the proposal for one neighbor (<code>timers bgp 10 30</code> for all), but the new value only applies when the session is re-established. A hold time of 0 disables keepalives entirely, and IOS rejects hold times of 1 or 2 seconds.</p>
<pre class="out">PEER-A# show ip bgp neighbors 10.40.0.2 | include Hold|hold
<span class="hl">  Hold time is 30, keepalive interval is 10 seconds</span>
  Configured hold time is 30, keepalive interval is 10 seconds</pre>

<div class="eg"><p><b>Worked example.</b> PEER-A proposes hold 30, PEER-B keeps the default 180. Negotiated hold = min(30, 180) = <b>30 s</b>, keepalive = 30 / 3 = <b>10 s</b> on both sides. If PEER-A loses three keepalives in a row, the hold timer expires after 30 s and it sends NOTIFICATION 4/0. Before the change the same failure took 180 s to detect.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing <code>remote-as</code> on your side to match a typo on the peer instead of checking which side is wrong. Using <code>ebgp-multihop</code> with a huge TTL (255) for directly connected peers, which removes the TTL protection that GTSM (chapter 6) adds. Expecting new timers to apply without a reset. Forgetting the static route to the peer loopback for eBGP multihop.</p></div>

<div class="exam"><p><b>Exam traps.</b> Active does not mean "working"; it means TCP keeps failing. Idle (Admin) is a shutdown, Idle (PfxCt) is max-prefix. NOTIFICATION 2/2 is always a remote-as mismatch, and the hex data is the peer's real AS. The negotiated hold time is the lower of the two.</p></div>

<div class="scn"><h4>Two alarms, two different root causes</h4><p>After partner maintenance (INC-5530), both EDGE1 and EDGE2 lost their partner sessions. The on-call engineer assumed one shared cause and asked the partner to check their router. Reading the states separately told a different story: EDGE2 showed <code>Idle (Admin)</code>, a forgotten <code>neighbor 172.30.2.1 shutdown</code>; EDGE1 logged NOTIFICATION 2/2 with data FD20, a mistyped remote-as. Two one-line fixes on our own routers restored both sessions without involving the partner.</p><p><b>Lesson:</b> diagnose each session from its own state and log; similar symptoms can have different causes.</p></div>

<div class="iv"><p class="q">"A BGP neighbor is stuck in Active. How do you troubleshoot?"</p><p>Explain that Active means the router is trying but TCP 179 does not complete. Then list checks in order: correct neighbor address and remote-as, ping using the same source (update-source), route to the peer, ACLs or firewalls filtering TCP 179 in both directions, TTL for eBGP between loopbacks (ebgp-multihop or disable-connected-check), and MD5 configured on only one side (check logs for BADAUTH). Mention <code>show ip bgp neighbors</code>, <code>show tcp brief</code> and <code>debug ip bgp</code> used carefully.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Idle (Admin) = shutdown, Idle (PfxCt) = max-prefix, Active = TCP failing.</li>
<li>NOTIFICATION 2/2 = wrong remote-as; the hex data is the AS the peer really uses (FD20 = 64800).</li>
<li>Test with the real source: <code>ping PEER source Loopback0</code>.</li>
<li>eBGP between loopbacks needs ebgp-multihop or disable-connected-check, plus a route to the peer loopback.</li>
<li>The lower hold time wins; new timers apply after the session resets.</li>
</ul></div>
`,hi:`
<p>BGP session ek formal business meeting jaisa hai. Pehle dono companies ek dusre ko phone kar sakein (IP reachability). Phir koi phone uthaye (TCP port 179). Phir dono sahi company naam aur badge ke saath apna introduction dein (OPEN message: AS number, router ID, hold time, capabilities). Tabhi business shuru hota hai (UPDATE messages). Jab meeting kabhi hoti hi nahi, to jis stage par woh ruki woh batata hai ki galti kiski hai. BGP neighbor states yahi stages hain.</p>

<h3>State padho, layer ka naam lo</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="BGP session kahan atakta hai">
<rect x="10" y="30" width="110" height="44" rx="8" fill="#e2e8f0"/><text x="65" y="57" text-anchor="middle" class="svg-ink" font-size="13">Idle</text>
<rect x="135" y="30" width="110" height="44" rx="8" fill="#fde68a"/><text x="190" y="57" text-anchor="middle" class="svg-ink" font-size="13">Connect / Active</text>
<rect x="260" y="30" width="110" height="44" rx="8" fill="#fed7aa"/><text x="315" y="57" text-anchor="middle" class="svg-ink" font-size="13">OpenSent</text>
<rect x="385" y="30" width="110" height="44" rx="8" fill="#fed7aa"/><text x="440" y="57" text-anchor="middle" class="svg-ink" font-size="13">OpenConfirm</text>
<rect x="510" y="30" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="570" y="57" text-anchor="middle" class="svg-ink" font-size="13">Established</text>
<text x="65" y="100" text-anchor="middle" class="svg-muted" font-size="12">shutdown, PfxCt,</text><text x="65" y="116" text-anchor="middle" class="svg-muted" font-size="12">peer ka route nahi</text>
<text x="190" y="100" text-anchor="middle" class="svg-muted" font-size="12">TCP 179 fail:</text><text x="190" y="116" text-anchor="middle" class="svg-muted" font-size="12">ACL, source, MD5</text>
<text x="378" y="100" text-anchor="middle" class="svg-muted" font-size="12">OPEN reject: galat AS,</text><text x="378" y="116" text-anchor="middle" class="svg-muted" font-size="12">router ID, capabilities</text>
<text x="570" y="100" text-anchor="middle" class="svg-muted" font-size="12">prefixes dekho</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">Session jis state par rukta hai woh tooti layer ki taraf ishara karti hai</text>
</svg><p class="cap">Idle aur Active woh states hain jo aapko real tickets mein dikhengi; OpenSent aur OpenConfirm jaldi guzar jaati hain aur NOTIFICATION ke baad Idle par gir jaati hain.</p></div>

<table class="cmp"><tr><th>Aapko kya dikhta hai</th><th>Matlab</th><th>Typical causes</th></tr>
<tr><td>Idle (Admin)</td><td>Session configuration se disabled</td><td>Maintenance ke baad chhoota hua <code>neighbor X shutdown</code></td></tr>
<tr><td>Idle (PfxCt)</td><td>Maximum-prefix limit cross hui</td><td>Peer ne routes leak kiye; fix ke baad <code>clear ip bgp X</code> chahiye</td></tr>
<tr><td>Idle</td><td>Koshish nahi kar raha, ya error ke baad ruka hai</td><td>Peer address ka route nahi; abhi abhi NOTIFICATION exchange hua</td></tr>
<tr><td>Active</td><td>TCP connection baar baar fail</td><td>Galat peer address, ACL TCP 179 drop kar raha, update-source missing, TTL (multihop), MD5 sirf ek side</td></tr>
<tr><td>OpenSent se Idle tak flap</td><td>OPEN message reject hua</td><td>Galat remote-as, duplicate router ID, hold time ya capability mismatch</td></tr>
</table>

<h3>Galat AS: NOTIFICATION decode karo</h3>
<p>Yeh bilkul NOC lab ka ALRT-88121 hai. Maintenance ke dauraan EDGE1 edit hua aur ab yeh dikhata hai:</p>
<pre class="out">EDGE1# show ip bgp summary | include 172.30.1.1
172.30.1.1      4        64880       0       0        1    0    0 00:00:21 Idle
EDGE1#
<span class="hl">%BGP-3-NOTIFICATION: sent to neighbor 172.30.1.1 passive 2/2 (peer in wrong AS) 2 bytes FD20</span></pre>
<p>Error code 2 "OPEN message error" hai, subcode 2 "Bad peer AS" hai. Data bytes woh AS hain jo peer ne asal mein bheja, hex mein: 0xFD20 = 15 x 4096 + 13 x 256 + 2 x 16 = <b>64800</b>. Configured remote-as 64880 hai, ek typo. Fix hai <code>neighbor 172.30.1.1 remote-as 64800</code>; partner ke router ko chhoone ki zaroorat hi nahi.</p>
<table class="cmp"><tr><th>NOTIFICATION</th><th>Matlab</th></tr>
<tr><td>2/2</td><td>Bad peer AS (remote-as mismatch)</td></tr>
<tr><td>2/3</td><td>Bad BGP identifier (jaise duplicate router ID)</td></tr>
<tr><td>4/0</td><td>Hold timer expired (keepalives kho gaye)</td></tr>
<tr><td>6/x</td><td>Cease: 6/1 maximum prefixes, 6/2 administrative shutdown, 6/4 administrative reset</td></tr>
</table>

<h3>update-source aur TCP</h3>
<p>Jab session Active mein pada ho, transport ko bilkul waise test karo jaise BGP use karta hai. Loopback peering ke liye: <code>ping 10.255.0.1 source Loopback0</code>. Phir socket dekho: <code>show tcp brief | include 179</code> batata hai ki port 179 ka koi connection hai ya nahi. Router sirf neighbor ke roop mein listed address se BGP connection accept karta hai, isliye ek side par missing update-source Active ki classic wajah hai.</p>

<h3>Loopbacks ke beech eBGP: multihop aur connected check</h3>
<p>eBGP packets <b>TTL 1</b> ke saath bhejta hai aur default mein expect karta hai ki neighbor address directly connected subnet par ho. Loopbacks ke beech eBGP peering (jaise do parallel links par) dono assumptions tod deti hai. Do options:</p>
<pre class="code"><span class="c">! Option A: TTL badhao (peer loopbacks 2 hops door hain)</span>
router bgp 65010
 neighbor 192.0.2.2 remote-as 65020
 neighbor 192.0.2.2 update-source Loopback0
 neighbor 192.0.2.2 ebgp-multihop 2
<span class="c">! Option B: directly connected routers, sirf connected check skip karo</span>
 neighbor 192.0.2.2 disable-connected-check
<span class="c">! Dono tarah, har side ko dusre loopback ka route chahiye</span>
ip route 192.0.2.2 255.255.255.255 198.51.100.2</pre>
<pre class="out">R1# show ip bgp neighbors 192.0.2.2 | include hops|state
  BGP state = Established, up for 00:03:11
<span class="hl">  External BGP neighbor may be up to 2 hops away.</span></pre>

<h3>Timers</h3>
<p>IOS par defaults keepalive 60 s aur hold 180 s hain. OPEN message mein har side ek hold time propose karti hai aur <b>kam</b> wala use hota hai; keepalives phir uske ek-tihaai par bheje jaate hain. <code>neighbor X timers 10 30</code> ek neighbor ke liye proposal badalta hai (sab ke liye <code>timers bgp 10 30</code>), par nayi value session dobara banne par hi lagti hai. Hold time 0 keepalives poori tarah band kar deta hai, aur IOS 1 ya 2 second ke hold times reject karta hai.</p>
<pre class="out">PEER-A# show ip bgp neighbors 10.40.0.2 | include Hold|hold
<span class="hl">  Hold time is 30, keepalive interval is 10 seconds</span>
  Configured hold time is 30, keepalive interval is 10 seconds</pre>

<div class="eg"><p><b>Worked example.</b> PEER-A hold 30 propose karta hai, PEER-B default 180 rakhta hai. Negotiated hold = min(30, 180) = <b>30 s</b>, keepalive = 30 / 3 = <b>10 s</b> dono sides par. Agar PEER-A lagatar teen keepalives kho de, to hold timer 30 s baad expire hota hai aur woh NOTIFICATION 4/0 bhejta hai. Change se pehle wahi failure pakadne mein 180 s lagte the.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Kaunsi side galat hai check karne ki jagah peer ke typo se match karne ke liye apni side ka <code>remote-as</code> badal dena. Directly connected peers ke liye bahut bade TTL (255) ke saath <code>ebgp-multihop</code> use karna, jo woh TTL protection hata deta hai jo GTSM (chapter 6) deta hai. Bina reset ke naye timers lagne ki umeed. eBGP multihop ke liye peer loopback ka static route bhool jaana.</p></div>

<div class="exam"><p><b>Exam traps.</b> Active ka matlab "chal raha hai" nahi; iska matlab TCP baar baar fail ho raha hai. Idle (Admin) shutdown hai, Idle (PfxCt) max-prefix hai. NOTIFICATION 2/2 hamesha remote-as mismatch hai, aur hex data peer ka asli AS hai. Negotiated hold time dono mein se kam wala hota hai.</p></div>

<div class="scn"><h4>Do alarms, do alag root causes</h4><p>Partner maintenance (INC-5530) ke baad EDGE1 aur EDGE2 dono ke partner sessions gir gaye. On-call engineer ne ek hi shared cause maana aur partner ko apna router check karne ko kaha. States ko alag alag padhne par alag kahani nikli: EDGE2 <code>Idle (Admin)</code> dikha raha tha, ek bhoola hua <code>neighbor 172.30.2.1 shutdown</code>; EDGE1 ne data FD20 ke saath NOTIFICATION 2/2 log kiya, galat type hua remote-as. Hamare apne routers par do one-line fixes ne partner ko involve kiye bina dono sessions restore kar diye.</p><p><b>Seekh:</b> har session ko uski apni state aur log se diagnose karo; milte-julte symptoms ke alag causes ho sakte hain.</p></div>

<div class="iv"><p class="q">"BGP neighbor Active mein atka hai. Aap kaise troubleshoot karoge?"</p><p>Samjhao ki Active matlab router koshish kar raha hai par TCP 179 complete nahi hota. Phir checks order mein batao: sahi neighbor address aur remote-as, same source (update-source) se ping, peer tak route, dono directions mein TCP 179 filter karne wale ACLs ya firewalls, loopbacks ke beech eBGP ke liye TTL (ebgp-multihop ya disable-connected-check), aur MD5 sirf ek side configure (BADAUTH ke liye logs dekho). <code>show ip bgp neighbors</code>, <code>show tcp brief</code> aur dhyan se use kiya <code>debug ip bgp</code> mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Idle (Admin) = shutdown, Idle (PfxCt) = max-prefix, Active = TCP fail ho raha hai.</li>
<li>NOTIFICATION 2/2 = galat remote-as; hex data woh AS hai jo peer asal mein use karta hai (FD20 = 64800).</li>
<li>Asli source se test karo: <code>ping PEER source Loopback0</code>.</li>
<li>Loopbacks ke beech eBGP ko ebgp-multihop ya disable-connected-check chahiye, plus peer loopback ka route.</li>
<li>Kam hold time jeetta hai; naye timers session reset ke baad lagte hain.</li>
</ul></div>
`}};export{e as default};