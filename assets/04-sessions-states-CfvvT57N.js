var e={id:`sessions`,h:{en:`BGP sessions: TCP 179, messages and the six neighbor states`,hi:`BGP sessions: TCP 179, messages aur chhe neighbor states`},body:{en:`
<p>Two companies that want to trade do not shout offers across the street. They first sign a contract (who we are, what we trade, how often we check in), then they send orders, and they phone regularly to say "still here". If the phone goes silent for too long, the contract is suspended. A BGP session works the same way: a TCP connection, an OPEN that is the contract, UPDATEs that are the orders, and KEEPALIVEs that are the phone calls.</p>

<h3>Neighbors are configured, not discovered</h3>
<p>OSPF discovers neighbors with multicast hellos. BGP never does. You configure every peer by IP address with <code>neighbor x remote-as y</code>, and BGP opens a <b>unicast TCP connection to port 179</b>. TCP gives BGP reliable, ordered delivery, so BGP itself does not need acknowledgements or retransmission, and it only sends <b>changes</b> after the first full exchange. One side acts as the TCP client (random source port) and the other as the server on port 179. If both sides open a connection at the same moment, the <b>collision</b> is resolved by keeping the connection started by the router with the higher BGP router ID.</p>

<h3>The five message types</h3>
<table class="cmp"><tr><th>Type</th><th>Message</th><th>Purpose</th></tr>
<tr><td>1</td><td><b>OPEN</b></td><td>First message after TCP is up: BGP version 4, My AS, hold time, BGP identifier (router ID) and capabilities (IPv4 unicast, route refresh, 4-byte ASN and more)</td></tr>
<tr><td>2</td><td><b>UPDATE</b></td><td>Advertises new prefixes with their path attributes, and withdraws prefixes that are gone</td></tr>
<tr><td>3</td><td><b>NOTIFICATION</b></td><td>Reports an error and <b>closes the session</b>, with an error code and subcode such as 2/2 "bad peer AS"</td></tr>
<tr><td>4</td><td><b>KEEPALIVE</b></td><td>"I am alive", every 60 seconds by default</td></tr>
<tr><td>5</td><td><b>ROUTE-REFRESH</b></td><td>Asks the peer to resend its updates, used after changing inbound policy</td></tr>
</table>
<p>Every message starts with a 19-byte header (a 16-byte marker, length and type). The default <b>keepalive is 60 seconds</b> and the <b>hold time is 180 seconds</b>. The two peers use the <b>lower</b> of the two proposed hold times, and the keepalive becomes one third of it. You can tune both with <code>timers bgp 10 30</code> under the process or per neighbor with <code>neighbor x timers 10 30</code>.</p>

<h3>The BGP router ID</h3>
<p>The router ID is a 32-bit number written like an IPv4 address and carried in the OPEN. IOS chooses it in this order: the <code>bgp router-id</code> command, otherwise the <b>highest loopback</b> IPv4 address, otherwise the <b>highest active physical interface</b> address. Always set it by hand, as lab 1 does with <code>bgp router-id 10.10.10.10</code>, so it never changes after a reload. Peers must not share a router ID: IOS typically rejects such an OPEN with NOTIFICATION 2/3 (bad BGP identifier), so the session does not come up.</p>

<h3>The finite state machine</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="BGP neighbor states">
<rect x="10" y="20" width="95" height="44" rx="8" fill="#e2e8f0"/><text x="57" y="47" text-anchor="middle" class="svg-ink" font-size="13">Idle</text>
<rect x="135" y="20" width="95" height="44" rx="8" fill="#fed7aa"/><text x="182" y="47" text-anchor="middle" class="svg-ink" font-size="13">Connect</text>
<rect x="260" y="20" width="95" height="44" rx="8" fill="#fde68a"/><text x="307" y="47" text-anchor="middle" class="svg-ink" font-size="13">OpenSent</text>
<rect x="385" y="20" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="440" y="47" text-anchor="middle" class="svg-ink" font-size="13">OpenConfirm</text>
<rect x="520" y="20" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="575" y="47" text-anchor="middle" class="svg-ink" font-size="13">Established</text>
<rect x="135" y="130" width="95" height="44" rx="8" fill="#fed7aa"/><text x="182" y="157" text-anchor="middle" class="svg-ink" font-size="13">Active</text>
<line x1="105" y1="42" x2="135" y2="42" stroke="#64748b" stroke-width="2"/><line x1="230" y1="42" x2="260" y2="42" stroke="#64748b" stroke-width="2"/><line x1="355" y1="42" x2="385" y2="42" stroke="#64748b" stroke-width="2"/><line x1="495" y1="42" x2="520" y2="42" stroke="#64748b" stroke-width="2"/>
<line x1="182" y1="64" x2="182" y2="130" stroke="#64748b" stroke-width="2"/><text x="190" y="100" class="svg-muted" font-size="12">TCP failed</text>
<line x1="230" y1="150" x2="300" y2="64" stroke="#64748b" stroke-width="2"/><text x="275" y="120" class="svg-muted" font-size="12">TCP up, OPEN sent</text>
<text x="307" y="85" text-anchor="middle" class="svg-muted" font-size="12">wait for OPEN</text><text x="440" y="85" text-anchor="middle" class="svg-muted" font-size="12">wait KEEPALIVE</text><text x="575" y="85" text-anchor="middle" class="svg-muted" font-size="12">UPDATEs flow</text>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="12">Any error or NOTIFICATION sends the session back to Idle</text>
</svg><p class="cap">The happy path runs along the top. Active is the "TCP keeps failing" loop.</p></div>
<table class="cmp"><tr><th>State</th><th>What is happening</th><th>What it tells a troubleshooter</th></tr>
<tr><td><b>Idle</b></td><td>BGP is not trying, or has just reset after an error. It waits for a start event and a retry timer.</td><td>Neighbor shut down (<code>Idle (Admin)</code>), no route to the peer, eBGP peer not directly connected and no multihop, or max-prefix hit (<code>Idle (PfxCt)</code>).</td></tr>
<tr><td><b>Connect</b></td><td>TCP three-way handshake in progress.</td><td>Usually passes quickly; rarely seen.</td></tr>
<tr><td><b>Active</b></td><td>The TCP attempt failed; BGP is retrying and listening for the peer.</td><td>A <b>TCP problem</b>: wrong neighbor IP, peer not configured for you, ACL or firewall blocking 179, wrong source address, MD5 mismatch.</td></tr>
<tr><td><b>OpenSent</b></td><td>TCP is up, OPEN sent, waiting for the peer's OPEN.</td><td>If it falls back, the OPEN was rejected: wrong AS, bad router ID, unsupported capability.</td></tr>
<tr><td><b>OpenConfirm</b></td><td>OPENs accepted, waiting for the first KEEPALIVE.</td><td>Rarely stuck; if so, suspect timers or packet loss.</td></tr>
<tr><td><b>Established</b></td><td>Session up; UPDATEs and KEEPALIVEs flow.</td><td>Now any problem is about routes and policy, not the session.</td></tr>
</table>

<h3>What a healthy session looks like</h3>
<pre class="out">CUST-EDGE# show ip bgp neighbors 100.64.10.1
BGP neighbor is 100.64.10.1,  remote AS 64500, external link
 Description: Skyline-Net
  BGP version 4, remote router ID 64.50.0.1
<span class="hl">  BGP state = Established, up for 00:12:31</span>
  Last read 00:00:21, last write 00:00:14, hold time is 180, keepalive interval is 60 seconds
  Neighbor capabilities:
    Route refresh: advertised and received(new)
    Four-octets ASN Capability: advertised and received
    Address family IPv4 Unicast: advertised and received
  ...
Local host: 100.64.10.2, Local port: 179
Foreign host: 100.64.10.1, Foreign port: 34127</pre>
<p>The last two lines show who opened TCP: CUST-EDGE is listening on 179, so the ISP router was the client this time.</p>

<div class="eg"><p><b>Worked example.</b> CUST-EDGE proposes hold time 180; the ISP is configured with <code>timers bgp 20 60</code> and proposes 60. The session uses hold time <b>60</b> (the lower) and keepalive <b>20</b>. If three keepalives in a row are lost, the hold timer expires after 60 seconds, CUST-EDGE sends NOTIFICATION 4/0 (hold timer expired) and the session goes back to Idle, withdrawing every route learned from that peer.</p></div>

<div class="warn"><p><b>Common mistake.</b> Seeing "Active" and assuming the session is active in the sense of "working". Active is a <b>failure</b> state. A working session shows a <b>number</b> (prefixes received) in the State/PfxRcd column of <code>show ip bgp summary</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> The states in order are Idle, Connect, Active, OpenSent, OpenConfirm, Established. A wrong <code>remote-as</code> is discovered in the OPEN exchange (NOTIFICATION 2/2), after TCP succeeded; a blocked port 179 keeps the session in Active and no OPEN is ever sent.</p></div>

<div class="scn"><h4>Session flapping every three minutes</h4><p>A branch eBGP session to an ISP came up, stayed Established for about three minutes, dropped with "hold time expired", and repeated. <code>show ip bgp neighbors</code> showed keepalives sent but none received. A new firewall between the routers allowed the TCP SYN to port 179 but then timed out the idle TCP session after 150 seconds, silently dropping later keepalives. The fix was a firewall rule with a longer idle timeout for TCP 179.</p><p><b>Lesson:</b> a session that reaches Established and then drops at a regular interval usually points to timers or a middle box, not to BGP configuration.</p></div>

<div class="iv"><p class="q">"Walk me through the BGP neighbor states and what you check in each."</p><p>Strong answer: Idle (not trying: shutdown, no route, multihop missing), Connect (TCP handshake), Active (TCP failing: check reachability, the neighbor IP on both sides, ACLs on 179, update-source, MD5), OpenSent and OpenConfirm (OPEN exchange: AS number, router ID, capabilities), Established (routes flow). Then add that you start with <code>show ip bgp summary</code>, then <code>show ip bgp neighbors</code>, and read the log for NOTIFICATION codes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BGP peers are configured by IP and connect over TCP port 179; no multicast discovery.</li>
<li>Messages: OPEN, UPDATE, NOTIFICATION, KEEPALIVE, ROUTE-REFRESH.</li>
<li>Default keepalive 60 s and hold 180 s; the lower hold time wins.</li>
<li>Router ID: <code>bgp router-id</code>, then highest loopback, then highest interface IP.</li>
<li>Idle and Active are failure states; only a number in State/PfxRcd means Established.</li>
</ul></div>
`,hi:`
<p>Do companies jo trade karna chahti hain, sadak ke paar chilla kar offers nahi deti. Pehle woh contract sign karti hain (hum kaun hain, kya trade karenge, kitni baar check-in karenge), phir orders bhejti hain, aur regularly phone karke kehti hain "abhi bhi yahin hain". Agar phone bahut der tak chup rahe, to contract suspend ho jaata hai. BGP session bhi aise hi kaam karta hai: ek TCP connection, ek OPEN jo contract hai, UPDATEs jo orders hain, aur KEEPALIVEs jo phone calls hain.</p>

<h3>Neighbors configure hote hain, discover nahi</h3>
<p>OSPF multicast hellos se neighbors discover karta hai. BGP kabhi nahi karta. Aap har peer ko IP address se <code>neighbor x remote-as y</code> ke saath configure karte ho, aur BGP <b>port 179 par unicast TCP connection</b> kholta hai. TCP BGP ko reliable, ordered delivery deta hai, isliye BGP ko khud acknowledgements ya retransmission nahi chahiye, aur pehle full exchange ke baad woh sirf <b>changes</b> bhejta hai. Ek side TCP client (random source port) banti hai aur doosri port 179 par server. Agar dono sides ek hi pal mein connection kholein, to <b>collision</b> aise suljhta hai ki higher BGP router ID wale router ka shuru kiya connection rakha jaata hai.</p>

<h3>Paanch message types</h3>
<table class="cmp"><tr><th>Type</th><th>Message</th><th>Kaam</th></tr>
<tr><td>1</td><td><b>OPEN</b></td><td>TCP up hone ke baad pehla message: BGP version 4, My AS, hold time, BGP identifier (router ID) aur capabilities (IPv4 unicast, route refresh, 4-byte ASN aur aur bhi)</td></tr>
<tr><td>2</td><td><b>UPDATE</b></td><td>Naye prefixes unke path attributes ke saath advertise karta hai, aur gaye hue prefixes withdraw karta hai</td></tr>
<tr><td>3</td><td><b>NOTIFICATION</b></td><td>Error report karta hai aur <b>session band kar deta hai</b>, error code aur subcode ke saath jaise 2/2 "bad peer AS"</td></tr>
<tr><td>4</td><td><b>KEEPALIVE</b></td><td>"Main zinda hoon", default mein har 60 seconds</td></tr>
<tr><td>5</td><td><b>ROUTE-REFRESH</b></td><td>Peer se updates dobara bhejne ko kehta hai, inbound policy badalne ke baad use hota hai</td></tr>
</table>
<p>Har message 19-byte header se shuru hota hai (16-byte marker, length aur type). Default <b>keepalive 60 seconds</b> aur <b>hold time 180 seconds</b> hai. Dono peers do proposed hold times mein se <b>kam wala</b> use karte hain, aur keepalive uska ek tihai ban jaata hai. Dono ko process ke neeche <code>timers bgp 10 30</code> se ya per neighbor <code>neighbor x timers 10 30</code> se tune kar sakte ho.</p>

<h3>BGP router ID</h3>
<p>Router ID ek 32-bit number hai jo IPv4 address ki tarah likha jaata hai aur OPEN mein jaata hai. IOS ise is order mein chunta hai: <code>bgp router-id</code> command, warna <b>highest loopback</b> IPv4 address, warna <b>highest active physical interface</b> address. Ise hamesha haath se set karo, jaise lab 1 <code>bgp router-id 10.10.10.10</code> se karti hai, taaki reload ke baad kabhi na badle. Peers ka router ID same nahi hona chahiye: IOS aam taur par aisa OPEN NOTIFICATION 2/3 (bad BGP identifier) ke saath reject karta hai, isliye session up nahi hota.</p>

<h3>Finite state machine</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="BGP neighbor states">
<rect x="10" y="20" width="95" height="44" rx="8" fill="#e2e8f0"/><text x="57" y="47" text-anchor="middle" class="svg-ink" font-size="13">Idle</text>
<rect x="135" y="20" width="95" height="44" rx="8" fill="#fed7aa"/><text x="182" y="47" text-anchor="middle" class="svg-ink" font-size="13">Connect</text>
<rect x="260" y="20" width="95" height="44" rx="8" fill="#fde68a"/><text x="307" y="47" text-anchor="middle" class="svg-ink" font-size="13">OpenSent</text>
<rect x="385" y="20" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="440" y="47" text-anchor="middle" class="svg-ink" font-size="13">OpenConfirm</text>
<rect x="520" y="20" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="575" y="47" text-anchor="middle" class="svg-ink" font-size="13">Established</text>
<rect x="135" y="130" width="95" height="44" rx="8" fill="#fed7aa"/><text x="182" y="157" text-anchor="middle" class="svg-ink" font-size="13">Active</text>
<line x1="105" y1="42" x2="135" y2="42" stroke="#64748b" stroke-width="2"/><line x1="230" y1="42" x2="260" y2="42" stroke="#64748b" stroke-width="2"/><line x1="355" y1="42" x2="385" y2="42" stroke="#64748b" stroke-width="2"/><line x1="495" y1="42" x2="520" y2="42" stroke="#64748b" stroke-width="2"/>
<line x1="182" y1="64" x2="182" y2="130" stroke="#64748b" stroke-width="2"/><text x="190" y="100" class="svg-muted" font-size="12">TCP fail</text>
<line x1="230" y1="150" x2="300" y2="64" stroke="#64748b" stroke-width="2"/><text x="275" y="120" class="svg-muted" font-size="12">TCP up, OPEN gaya</text>
<text x="307" y="85" text-anchor="middle" class="svg-muted" font-size="12">OPEN ka wait</text><text x="440" y="85" text-anchor="middle" class="svg-muted" font-size="12">KEEPALIVE wait</text><text x="575" y="85" text-anchor="middle" class="svg-muted" font-size="12">UPDATEs chalte hain</text>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="12">Koi bhi error ya NOTIFICATION session ko Idle par wapas bhejta hai</text>
</svg><p class="cap">Happy path upar chalta hai. Active "TCP baar baar fail" wala loop hai.</p></div>
<table class="cmp"><tr><th>State</th><th>Kya ho raha hai</th><th>Troubleshooter ko kya batata hai</th></tr>
<tr><td><b>Idle</b></td><td>BGP try nahi kar raha, ya error ke baad abhi reset hua. Start event aur retry timer ka wait kar raha hai.</td><td>Neighbor shut down (<code>Idle (Admin)</code>), peer tak route nahi, eBGP peer directly connected nahi aur multihop nahi, ya max-prefix hit (<code>Idle (PfxCt)</code>).</td></tr>
<tr><td><b>Connect</b></td><td>TCP three-way handshake chal raha hai.</td><td>Aam taur par jaldi guzar jaata hai; kam dikhta hai.</td></tr>
<tr><td><b>Active</b></td><td>TCP attempt fail hua; BGP retry kar raha hai aur peer ko sun raha hai.</td><td>Ek <b>TCP problem</b>: galat neighbor IP, peer aapke liye configured nahi, ACL ya firewall 179 block kar raha, galat source address, MD5 mismatch.</td></tr>
<tr><td><b>OpenSent</b></td><td>TCP up hai, OPEN bheja, peer ke OPEN ka wait.</td><td>Agar wapas gire, to OPEN reject hua: galat AS, bad router ID, unsupported capability.</td></tr>
<tr><td><b>OpenConfirm</b></td><td>OPENs accept hue, pehle KEEPALIVE ka wait.</td><td>Kam hi atakta hai; atke to timers ya packet loss par shak karo.</td></tr>
<tr><td><b>Established</b></td><td>Session up; UPDATEs aur KEEPALIVEs chal rahe hain.</td><td>Ab koi bhi problem routes aur policy ki hai, session ki nahi.</td></tr>
</table>

<h3>Healthy session kaisa dikhta hai</h3>
<pre class="out">CUST-EDGE# show ip bgp neighbors 100.64.10.1
BGP neighbor is 100.64.10.1,  remote AS 64500, external link
 Description: Skyline-Net
  BGP version 4, remote router ID 64.50.0.1
<span class="hl">  BGP state = Established, up for 00:12:31</span>
  Last read 00:00:21, last write 00:00:14, hold time is 180, keepalive interval is 60 seconds
  Neighbor capabilities:
    Route refresh: advertised and received(new)
    Four-octets ASN Capability: advertised and received
    Address family IPv4 Unicast: advertised and received
  ...
Local host: 100.64.10.2, Local port: 179
Foreign host: 100.64.10.1, Foreign port: 34127</pre>
<p>Aakhri do lines batati hain ki TCP kisne khola: CUST-EDGE 179 par sun raha hai, isliye is baar ISP router client tha.</p>

<div class="eg"><p><b>Worked example.</b> CUST-EDGE hold time 180 propose karta hai; ISP <code>timers bgp 20 60</code> ke saath configured hai aur 60 propose karta hai. Session hold time <b>60</b> (kam wala) aur keepalive <b>20</b> use karta hai. Agar lagatar teen keepalives kho jaayein, to 60 seconds baad hold timer expire hota hai, CUST-EDGE NOTIFICATION 4/0 (hold timer expired) bhejta hai aur session Idle par wapas jaata hai, us peer se seekhe har route ko withdraw karte hue.</p></div>

<div class="warn"><p><b>Common galti.</b> "Active" dekh kar maan lena ki session "chal raha hai" wale matlab mein active hai. Active ek <b>failure</b> state hai. Chalta hua session <code>show ip bgp summary</code> ke State/PfxRcd column mein ek <b>number</b> (received prefixes) dikhata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> States ka order hai Idle, Connect, Active, OpenSent, OpenConfirm, Established. Galat <code>remote-as</code> OPEN exchange mein pakda jaata hai (NOTIFICATION 2/2), TCP safal hone ke baad; blocked port 179 session ko Active mein rakhta hai aur koi OPEN kabhi nahi jaata.</p></div>

<div class="scn"><h4>Har teen minute mein flap hota session</h4><p>Ek branch ka ISP ke saath eBGP session up hua, lagbhag teen minute Established raha, "hold time expired" ke saath gira, aur yahi dohrata raha. <code>show ip bgp neighbors</code> mein keepalives sent dikh rahe the par received ek bhi nahi. Routers ke beech ek naya firewall port 179 ka TCP SYN allow kar raha tha par 150 seconds baad idle TCP session ko timeout kar deta tha, baad ke keepalives chupchaap drop karte hue. Fix tha TCP 179 ke liye lambe idle timeout wala firewall rule.</p><p><b>Seekh:</b> jo session Established tak pahunch kar regular interval par girta hai, woh aam taur par timers ya beech ke box ki taraf ishara karta hai, BGP configuration ki taraf nahi.</p></div>

<div class="iv"><p class="q">"BGP neighbor states aur har ek mein aap kya check karte ho, samjhao."</p><p>Strong answer: Idle (try nahi kar raha: shutdown, route nahi, multihop missing), Connect (TCP handshake), Active (TCP fail: reachability, dono sides par neighbor IP, 179 par ACLs, update-source, MD5 check karo), OpenSent aur OpenConfirm (OPEN exchange: AS number, router ID, capabilities), Established (routes chalte hain). Phir jodo ki aap <code>show ip bgp summary</code> se shuru karte ho, phir <code>show ip bgp neighbors</code>, aur NOTIFICATION codes ke liye log padhte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BGP peers IP se configure hote hain aur TCP port 179 par judte hain; koi multicast discovery nahi.</li>
<li>Messages: OPEN, UPDATE, NOTIFICATION, KEEPALIVE, ROUTE-REFRESH.</li>
<li>Default keepalive 60 s aur hold 180 s; kam hold time jeetta hai.</li>
<li>Router ID: <code>bgp router-id</code>, phir highest loopback, phir highest interface IP.</li>
<li>Idle aur Active failure states hain; State/PfxRcd mein sirf number ka matlab Established hai.</li>
</ul></div>
`}};export{e as default};