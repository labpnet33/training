var e={id:`underlay-control-connections`,h:{en:`Layers 1 and 2: underlay, ports, NAT and control connections`,hi:`Layers 1 aur 2: underlay, ports, NAT aur control connections`},body:{en:`
<p>A new employee cannot enter the office if the road to it is blocked, the gate is closed, or the guard cannot read the badge. In SD-WAN the "road" is the underlay, the "gate" is a firewall or NAT in the path, and the "badge" is the certificate (next chapter). This chapter covers the first two: can the packet physically reach the controllers, and what do the control connections say?</p>

<h3>What an edge needs from the underlay</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Underlay path from edge to controllers">
<rect x="10" y="80" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="60" y="108" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1</text><text x="60" y="125" text-anchor="middle" class="svg-muted" font-size="11">VPN 0 203.0.113.14</text>
<rect x="150" y="80" width="90" height="60" rx="8" fill="#fde68a"/><text x="195" y="108" text-anchor="middle" class="svg-ink" font-size="13">ISP gateway</text><text x="195" y="125" text-anchor="middle" class="svg-muted" font-size="11">203.0.113.13</text>
<rect x="280" y="80" width="90" height="60" rx="8" fill="#e5e7eb"/><text x="325" y="105" text-anchor="middle" class="svg-ink" font-size="13">NAT or</text><text x="325" y="122" text-anchor="middle" class="svg-ink" font-size="13">firewall</text>
<rect x="420" y="10" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="475" y="30" text-anchor="middle" class="svg-ink" font-size="12">VBOND</text><text x="475" y="46" text-anchor="middle" class="svg-muted" font-size="11">198.51.100.30</text>
<rect x="420" y="87" width="110" height="46" rx="8" fill="#bae6fd"/><text x="475" y="107" text-anchor="middle" class="svg-ink" font-size="12">VSMART</text><text x="475" y="123" text-anchor="middle" class="svg-muted" font-size="11">198.51.100.20</text>
<rect x="420" y="164" width="110" height="46" rx="8" fill="#fed7aa"/><text x="475" y="184" text-anchor="middle" class="svg-ink" font-size="12">VMANAGE</text><text x="475" y="200" text-anchor="middle" class="svg-muted" font-size="11">198.51.100.10</text>
<line x1="110" y1="110" x2="150" y2="110" stroke="#64748b" stroke-width="2"/><line x1="240" y1="110" x2="280" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="100" x2="420" y2="34" stroke="#64748b" stroke-width="2"/><line x1="370" y1="110" x2="420" y2="110" stroke="#64748b" stroke-width="2"/><line x1="370" y1="120" x2="420" y2="186" stroke="#64748b" stroke-width="2"/>
<text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="12">Needs: interface up, IP, default route, DNS if names are used, UDP 12346 and hops</text>
</svg><p class="cap">Everything the control connection needs from the underlay is in this picture.</p></div>
<p>Four things must be true on every transport (VPN 0): the <b>interface is up with an IP address</b>, there is a <b>route</b> to the controllers (usually a default route to the provider gateway), <b>names resolve</b> if the Validator is configured by name (a DNS server is reachable), and the <b>firewall or NAT allows the control traffic</b>. The edge sends DTLS over UDP, starting at port 12346; when it is behind a NAT it can hop the source port by steps of 20 (12366, 12386, 12406 and 12426), so a firewall that only allows 12346 may block the other attempts. TLS over TCP is the alternative, starting at port 23456.</p>

<h3>Layer 1 in five commands</h3>
<pre class="code">E-BLR-1# show ip interface brief | include Gigabit
E-BLR-1# show ip route
E-BLR-1# ping 198.51.100.30
E-BLR-1# show run | include name-server
E-BLR-1# traceroute 198.51.100.30</pre>
<pre class="out">E-BLR-1# show ip interface brief | include Gigabit
GigabitEthernet1  203.0.113.14  YES manual up     up
GigabitEthernet2  10.3.10.1     YES manual up     up
E-BLR-1# ping 198.51.100.30
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 30/32/36 ms</pre>
<p>Note that these run in the global (VPN 0) table. If ping works, layer 1 is healthy at the level that matters. If it fails, find where it stops with traceroute, then read the route table: a default route via the wrong gateway is the classic cause. A ping that works but a control connection that does not usually means a firewall that allows ICMP but not UDP 12346.</p>

<h3>Layer 2: reading the control connections</h3>
<pre class="out">E-BLR-1# show sdwan control connections
PEER    PEER  PEER          SITE  DOMAIN  PEER           LOCAL
TYPE    PROT  SYSTEM IP     ID    ID      PRIVATE IP     COLOR         STATE
vsmart  dtls  10.255.255.2  1     1       198.51.100.20  biz-internet  <span class="hl">up</span>
vmanage dtls  10.255.255.1  1     0       198.51.100.10  biz-internet  <span class="hl">up</span></pre>
<table class="cmp"><tr><th>State</th><th>Meaning</th><th>Where to look</th></tr>
<tr><td>up</td><td>Connection established and authenticated</td><td>Nothing; move to OMP</td></tr>
<tr><td>connect</td><td>The edge is trying but has not completed the handshake</td><td>Underlay, firewall or NAT; connection-history</td></tr>
<tr><td>challenge</td><td>The authentication exchange is in progress or stuck</td><td>Certificate, serial number, organisation name, clock</td></tr>
<tr><td>tear_down</td><td>The connection was closed, by an error or by the peer</td><td>connection-history error code</td></tr>
<tr><td>no entry</td><td>The edge never tried, or has no valid Validator target</td><td>System settings, the Validator address, VPN 0 tunnel interface</td></tr></table>
<p>A healthy edge normally shows only the Controller and the Manager. Its connection to the Validator is short: once the edge has learned where the Controller and Manager are, the Validator connection is closed. So a missing vbond row is not a fault when the other two are up. A vbond row that stays in <b>connect</b>, or no rows at all, means the very first step failed.</p><pre class="out">E-BLR-1# show sdwan control connections
PEER    PEER  PEER          SITE  DOMAIN  PEER           LOCAL
TYPE    PROT  SYSTEM IP     ID    ID      PRIVATE IP     COLOR         STATE
vbond   dtls  -             0     0       198.51.100.30  biz-internet  <span class="hl">connect</span></pre>

<h3>The identity of the edge</h3>
<pre class="out">E-BLR-1# show sdwan control local-properties
organization-name            BHARAT-RETAIL
certificate-status           Installed
root-ca-chain-status         Installed
certificate-validity         Valid
system-ip                    10.255.0.13
site-id                      300
number-vbond-peers           1
<span class="hl">INTERFACE         PUBLIC IPV4     PUBLIC PORT  PRIVATE IPV4    COLOR         STATE  NAT TYPE</span>
GigabitEthernet1  203.0.113.14    12346        203.0.113.14    biz-internet  up     E</pre>
<p>(The interface table is trimmed.) Three checks: the <b>organisation name</b> must be identical on every device and controller; <b>certificate-status</b> and <b>certificate-validity</b> must be Installed and Valid; and the <b>site-id</b> and <b>system-ip</b> must be unique to this device. The NAT TYPE column shows <b>E</b> (endpoint-independent mapping), <b>A</b> (address-port dependent mapping) or <b>N</b> (not learned, which needs at least two Validators).</p>

<h3>NAT in the path</h3>
<p>A branch behind a NAT sees its private address, but the world sees a public address. The edge learns its public address and port from the Validator and advertises both in its TLOC. Problems start when the NAT is <b>address-port dependent</b> (often called symmetric): it creates a different public port for every destination, so the port learned from the Validator is not the port other edges will see.</p>
<table class="cmp"><tr><th>Side A</th><th>Side B</th><th>Direct tunnel</th></tr>
<tr><td>Public IP, no NAT</td><td>Any</td><td>Works</td></tr>
<tr><td>Endpoint-independent (E)</td><td>Endpoint-independent (E)</td><td>Works</td></tr>
<tr><td>Endpoint-independent (E)</td><td>Address-port dependent (A)</td><td>Usually works</td></tr>
<tr><td>Address-port dependent (A)</td><td>Address-port dependent (A)</td><td>Does not work directly</td></tr></table>
<p>The practical fix when two symmetric NATs meet is to give one site another transport (for example MPLS or a public address), place a hub with a public address between them, or change the NAT behaviour at the provider device. The details are release and platform dependent; check the release notes.</p>

<h3>Controller-side checks</h3>
<p>A control connection has two ends, so look at the controller too. On the Controllers use the same commands without the <code>sdwan</code> word:</p>
<pre class="code">VSMART# show control connections
VSMART# show control local-properties
VSMART# show control valid-vedges
VBOND# show orchestrator valid-vedges
VBOND# show orchestrator connections</pre>
<p>The Validator and the Controller keep a list of valid devices; if an edge's serial or chassis number is not in <code>valid-vedges</code>, it cannot authenticate (chapter 3). Remember too that a Controller has a limited number of connections and a Controller group can keep an edge away from a Controller it should use.</p>

<div class="eg"><p><b>Worked example.</b> E-BLR-1 shows the vbond row in <i>connect</i> for ten minutes. Layer 1: <code>ping 198.51.100.30</code> succeeds, so reachability exists. <code>show sdwan control connection-history</code> repeats DCONFAIL, a DTLS failure. So ICMP passes but DTLS does not: the branch firewall allows only UDP 12346 outbound and the edge is hopping to 12366. The firewall change request asks for UDP 12346 to 12426 outbound from 203.0.113.14 to the three controller addresses. After the change the row goes up in seconds.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Testing from VPN 10 and calling the underlay healthy. (2) Treating a working ping as proof that UDP 12346 passes. (3) Opening only port 12346 and forgetting the hopped ports. (4) Comparing the organisation name by eye and missing a trailing space or a different case. (5) Ignoring the controller side.</p></div>

<div class="exam"><p><b>Exam trap.</b> The control connection runs in VPN 0 over the transport interface; the edge needs a tunnel interface there. The default DTLS port is UDP 12346 and TLS uses TCP. NAT type E means endpoint-independent, A means address-port dependent.</p></div>

<div class="scn"><h4>Delhi works, Bengaluru connect</h4><p>A new circuit was installed at Bengaluru. E-BLR-1 pinged the Validator but stayed in <i>connect</i>. The provider router had a stateful firewall feature enabled by default that blocked inbound UDP replies from unknown sources. Asking the provider to disable it for the circuit fixed the problem within the hour.</p><p><b>Lesson:</b> the provider path can include a firewall you did not install; ping proves little.</p></div>

<div class="iv"><p class="q">"The edge has an IP address and can ping the Validator but shows no control connection. What next?"</p><p>I read <code>show sdwan control connection-history</code> for the error code. DCONFAIL points to an underlay or firewall problem on UDP 12346 and the hopped ports, so I test the path from the edge and check ACLs and NAT. CRTREJSER, SERNTPRES or CRTVERFL point to identity, so I check the organisation name, the WAN edge list, the certificate and the clock.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay needs an up interface, an IP, a route, DNS if names are used and an open firewall.</li>
<li>DTLS uses UDP 12346 with port hopping in steps of 20; TLS uses TCP.</li>
<li>States: up, connect, challenge, tear_down; the history tells you why.</li>
<li>local-properties shows organisation name, certificate state and NAT type.</li>
<li>Two address-port-dependent NATs cannot form a direct tunnel.</li>
</ul></div>
`,hi:`
<p>Naya employee office mein nahi ghus sakta agar sadak band ho, gate band ho, ya guard badge nahi padh paye. SD-WAN mein "sadak" underlay hai, "gate" path mein firewall ya NAT hai, aur "badge" certificate hai (agla chapter). Yeh chapter pehle do cover karta hai: kya packet physically controllers tak pahunch sakta hai, aur control connections kya kehte hain?</p>

<h3>Edge ko underlay se kya chahiye</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Underlay path from edge to controllers">
<rect x="10" y="80" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="60" y="108" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1</text><text x="60" y="125" text-anchor="middle" class="svg-muted" font-size="11">VPN 0 203.0.113.14</text>
<rect x="150" y="80" width="90" height="60" rx="8" fill="#fde68a"/><text x="195" y="108" text-anchor="middle" class="svg-ink" font-size="13">ISP gateway</text><text x="195" y="125" text-anchor="middle" class="svg-muted" font-size="11">203.0.113.13</text>
<rect x="280" y="80" width="90" height="60" rx="8" fill="#e5e7eb"/><text x="325" y="105" text-anchor="middle" class="svg-ink" font-size="13">NAT ya</text><text x="325" y="122" text-anchor="middle" class="svg-ink" font-size="13">firewall</text>
<rect x="420" y="10" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="475" y="30" text-anchor="middle" class="svg-ink" font-size="12">VBOND</text><text x="475" y="46" text-anchor="middle" class="svg-muted" font-size="11">198.51.100.30</text>
<rect x="420" y="87" width="110" height="46" rx="8" fill="#bae6fd"/><text x="475" y="107" text-anchor="middle" class="svg-ink" font-size="12">VSMART</text><text x="475" y="123" text-anchor="middle" class="svg-muted" font-size="11">198.51.100.20</text>
<rect x="420" y="164" width="110" height="46" rx="8" fill="#fed7aa"/><text x="475" y="184" text-anchor="middle" class="svg-ink" font-size="12">VMANAGE</text><text x="475" y="200" text-anchor="middle" class="svg-muted" font-size="11">198.51.100.10</text>
<line x1="110" y1="110" x2="150" y2="110" stroke="#64748b" stroke-width="2"/><line x1="240" y1="110" x2="280" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="100" x2="420" y2="34" stroke="#64748b" stroke-width="2"/><line x1="370" y1="110" x2="420" y2="110" stroke="#64748b" stroke-width="2"/><line x1="370" y1="120" x2="420" y2="186" stroke="#64748b" stroke-width="2"/>
<text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="12">Chahiye: interface up, IP, default route, naam ho to DNS, UDP 12346 aur hops</text>
</svg><p class="cap">Control connection ko underlay se jo chahiye woh sab is picture mein hai.</p></div>
<p>Har transport (VPN 0) par chaar cheezein sach honi chahiye: <b>interface up aur IP address ke saath</b>, controllers tak <b>route</b> (aam taur par provider gateway ki taraf default route), agar Validator naam se configure hai to <b>naam resolve ho</b> (DNS server reachable), aur <b>firewall ya NAT control traffic allow kare</b>. Edge UDP par DTLS bhejta hai, port 12346 se shuru karke; NAT ke peeche hone par woh source port 20 ke steps mein hop kar sakta hai (12366, 12386, 12406 aur 12426), isliye sirf 12346 allow karne wala firewall baaki attempts block kar sakta hai. Doosra option TCP par TLS hai, port 23456 se shuru.</p>

<h3>Layer 1 paanch commands mein</h3>
<pre class="code">E-BLR-1# show ip interface brief | include Gigabit
E-BLR-1# show ip route
E-BLR-1# ping 198.51.100.30
E-BLR-1# show run | include name-server
E-BLR-1# traceroute 198.51.100.30</pre>
<pre class="out">E-BLR-1# show ip interface brief | include Gigabit
GigabitEthernet1  203.0.113.14  YES manual up     up
GigabitEthernet2  10.3.10.1     YES manual up     up
E-BLR-1# ping 198.51.100.30
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 30/32/36 ms</pre>
<p>Dhyan do ki yeh global (VPN 0) table mein chalte hain. Ping chale to layer 1 us level par theek hai jo matter karta hai. Fail ho to traceroute se dekho kahan rukta hai, phir route table padho: galat gateway ki taraf default route classic wajah hai. Ping chale lekin control connection na bane to aksar firewall ICMP allow karta hai lekin UDP 12346 nahi.</p>

<h3>Layer 2: control connections padhna</h3>
<pre class="out">E-BLR-1# show sdwan control connections
PEER    PEER  PEER          SITE  DOMAIN  PEER           LOCAL
TYPE    PROT  SYSTEM IP     ID    ID      PRIVATE IP     COLOR         STATE
vsmart  dtls  10.255.255.2  1     1       198.51.100.20  biz-internet  <span class="hl">up</span>
vmanage dtls  10.255.255.1  1     0       198.51.100.10  biz-internet  <span class="hl">up</span></pre>
<table class="cmp"><tr><th>State</th><th>Matlab</th><th>Kahan dekhein</th></tr>
<tr><td>up</td><td>Connection bana aur authenticate hua</td><td>Kuch nahi; OMP par jao</td></tr>
<tr><td>connect</td><td>Edge koshish kar raha hai lekin handshake poora nahi hua</td><td>Underlay, firewall ya NAT; connection-history</td></tr>
<tr><td>challenge</td><td>Authentication exchange chal raha hai ya atka hai</td><td>Certificate, serial number, organisation name, clock</td></tr>
<tr><td>tear_down</td><td>Connection band hua, error se ya peer se</td><td>connection-history error code</td></tr>
<tr><td>koi entry nahi</td><td>Edge ne koshish hi nahi ki, ya valid Validator target nahi</td><td>System settings, Validator address, VPN 0 tunnel interface</td></tr></table>
<p>Healthy edge aam taur par sirf Controller aur Manager dikhata hai. Validator se uska connection chhota hota hai: edge ko Controller aur Manager ka pata chalte hi Validator connection band ho jaata hai. To baaki do up hon to vbond row ka na hona fault nahi hai. Agar vbond row <b>connect</b> mein atki rahe, ya koi row hi na ho, to bilkul pehla step fail hua hai.</p><pre class="out">E-BLR-1# show sdwan control connections
PEER    PEER  PEER          SITE  DOMAIN  PEER           LOCAL
TYPE    PROT  SYSTEM IP     ID    ID      PRIVATE IP     COLOR         STATE
vbond   dtls  -             0     0       198.51.100.30  biz-internet  <span class="hl">connect</span></pre>

<h3>Edge ki identity</h3>
<pre class="out">E-BLR-1# show sdwan control local-properties
organization-name            BHARAT-RETAIL
certificate-status           Installed
root-ca-chain-status         Installed
certificate-validity         Valid
system-ip                    10.255.0.13
site-id                      300
number-vbond-peers           1
<span class="hl">INTERFACE         PUBLIC IPV4     PUBLIC PORT  PRIVATE IPV4    COLOR         STATE  NAT TYPE</span>
GigabitEthernet1  203.0.113.14    12346        203.0.113.14    biz-internet  up     E</pre>
<p>(Interface table trimmed hai.) Teen checks: <b>organisation name</b> har device aur controller par bilkul same ho; <b>certificate-status</b> aur <b>certificate-validity</b> Installed aur Valid hon; aur <b>site-id</b> aur <b>system-ip</b> is device ke liye unique hon. NAT TYPE column <b>E</b> (endpoint-independent mapping), <b>A</b> (address-port dependent mapping) ya <b>N</b> (not learned, jiske liye kam se kam do Validators chahiye) dikhata hai.</p>

<h3>Path mein NAT</h3>
<p>NAT ke peeche branch apna private address dekhti hai, lekin duniya public address dekhti hai. Edge apna public address aur port Validator se seekhta hai aur dono apne TLOC mein advertise karta hai. Problem tab shuru hoti hai jab NAT <b>address-port dependent</b> (aksar symmetric kehte hain) ho: woh har destination ke liye alag public port banata hai, isliye Validator se seekha port woh nahi hota jo doosre edges dekhenge.</p>
<table class="cmp"><tr><th>Side A</th><th>Side B</th><th>Direct tunnel</th></tr>
<tr><td>Public IP, NAT nahi</td><td>Koi bhi</td><td>Chalta hai</td></tr>
<tr><td>Endpoint-independent (E)</td><td>Endpoint-independent (E)</td><td>Chalta hai</td></tr>
<tr><td>Endpoint-independent (E)</td><td>Address-port dependent (A)</td><td>Aam taur par chalta hai</td></tr>
<tr><td>Address-port dependent (A)</td><td>Address-port dependent (A)</td><td>Seedha nahi chalta</td></tr></table>
<p>Do symmetric NAT milne par practical fix hai ek site ko doosra transport dena (jaise MPLS ya public address), dono ke beech public address wala hub rakhna, ya provider device par NAT behaviour badalna. Details release aur platform par nirbhar hain; release notes dekho.</p>

<h3>Controller-side checks</h3>
<p>Control connection ke do ends hain, isliye controller bhi dekho. Controllers par wahi commands <code>sdwan</code> shabd ke bina use hote hain:</p>
<pre class="code">VSMART# show control connections
VSMART# show control local-properties
VSMART# show control valid-vedges
VBOND# show orchestrator valid-vedges
VBOND# show orchestrator connections</pre>
<p>Validator aur Controller valid devices ki list rakhte hain; agar edge ka serial ya chassis number <code>valid-vedges</code> mein nahi hai to woh authenticate nahi ho sakta (chapter 3). Yaad rakho ki Controller ke connections limited hote hain aur Controller group edge ko aise Controller se door rakh sakta hai jise use karna chahiye.</p>

<div class="eg"><p><b>Worked example.</b> E-BLR-1 ki vbond row das minute se <i>connect</i> mein hai. Layer 1: <code>ping 198.51.100.30</code> chalta hai, to reachability hai. <code>show sdwan control connection-history</code> baar-baar DCONFAIL dikhata hai, yaani DTLS failure. To ICMP guzarta hai lekin DTLS nahi: branch firewall sirf UDP 12346 outbound allow karta hai aur edge 12366 par hop kar raha hai. Firewall change request mein 203.0.113.14 se teen controller addresses tak UDP 12346 se 12426 outbound maanga gaya. Change ke baad row seconds mein up ho gayi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) VPN 10 se test karke underlay ko theek kehna. (2) Chalte ping ko UDP 12346 guzarne ka saboot samajhna. (3) Sirf port 12346 kholna aur hopped ports bhool jaana. (4) Organisation name aankh se compare karke trailing space ya alag case chhod dena. (5) Controller side ignore karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Control connection transport interface par VPN 0 mein chalta hai; edge ko wahan tunnel interface chahiye. Default DTLS port UDP 12346 hai aur TLS TCP use karta hai. NAT type E matlab endpoint-independent, A matlab address-port dependent.</p></div>

<div class="scn"><h4>Delhi chalta hai, Bengaluru connect</h4><p>Bengaluru mein naya circuit laga. E-BLR-1 ne Validator ko ping kiya lekin <i>connect</i> mein raha. Provider router par stateful firewall feature default se on tha jo anjaan sources se inbound UDP replies block karta tha. Provider se circuit ke liye use band karwane par ek ghante mein problem theek hui.</p><p><b>Lesson:</b> provider path mein aisa firewall ho sakta hai jo aapne nahi lagaya; ping kam sabit karta hai.</p></div>

<div class="iv"><p class="q">"Edge ke paas IP hai aur Validator ko ping kar sakta hai lekin control connection nahi. Agla step?"</p><p>Main error code ke liye <code>show sdwan control connection-history</code> padhta hoon. DCONFAIL underlay ya UDP 12346 aur hopped ports par firewall problem ki taraf ishara karta hai, to main edge se path test karta hoon aur ACLs aur NAT dekhta hoon. CRTREJSER, SERNTPRES ya CRTVERFL identity ki taraf ishara karte hain, to organisation name, WAN edge list, certificate aur clock check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay ko up interface, IP, route, naam ho to DNS aur khula firewall chahiye.</li>
<li>DTLS UDP 12346 use karta hai, 20 ke steps mein port hopping ke saath; TLS TCP use karta hai.</li>
<li>States: up, connect, challenge, tear_down; history wajah batati hai.</li>
<li>local-properties organisation name, certificate state aur NAT type dikhata hai.</li>
<li>Do address-port-dependent NAT seedha tunnel nahi bana sakte.</li>
</ul></div>
`}};export{e as default};