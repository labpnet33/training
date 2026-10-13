var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: bring two sites into the SD-WAN fabric`,hi:`Troubleshooting workflow: do sites ko SD-WAN fabric mein laao`},body:{en:`
<p>A doctor does not start with brain surgery. Pulse, breathing, blood pressure, then deeper tests. Fabric troubleshooting is the same: check the layers <b>bottom-up</b>, and stop at the first one that is broken. This chapter gives you the workflow for both fabrics and then walks the lab <i>Troubleshoot · Bring two sites into the SD-WAN fabric</i> step by step.</p>

<h3>The SD-WAN workflow</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Bottom-up SD-WAN troubleshooting ladder">
<rect x="20" y="180" width="600" height="32" rx="6" fill="#e2e8f0"/><text x="320" y="201" text-anchor="middle" class="svg-ink" font-size="13">1 Transport: interface, IP, default route, reach Validator, NTP</text>
<rect x="50" y="143" width="540" height="32" rx="6" fill="#fde68a"/><text x="320" y="164" text-anchor="middle" class="svg-ink" font-size="13">2 Identity: org name, system-ip, site-id, certificate</text>
<rect x="80" y="106" width="480" height="32" rx="6" fill="#bae6fd"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="13">3 Control connections and OMP</text>
<rect x="110" y="69" width="420" height="32" rx="6" fill="#bbf7d0"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">4 BFD / IPsec data plane</text>
<rect x="140" y="32" width="360" height="32" rx="6" fill="#ddd6fe"/><text x="320" y="53" text-anchor="middle" class="svg-ink" font-size="13">5 Service routes, then policy</text>
</svg><p class="cap">Fix the lowest broken layer first; everything above depends on it.</p></div>
<table class="cmp"><tr><th>Layer</th><th>Command</th><th>Look for</th></tr>
<tr><td>Transport</td><td><code>show ip interface brief</code>, <code>show ip route</code>, ping the Validator</td><td>WAN up, default route, reachability, correct time</td></tr>
<tr><td>Identity</td><td><code>show sdwan control local-properties</code></td><td>org name, system-ip, site-id, Validator address, certificate state</td></tr>
<tr><td>Control</td><td><code>show sdwan control connections</code> / <code>connection-history</code></td><td>state up, or the error code</td></tr>
<tr><td>OMP</td><td><code>show sdwan omp peers</code> / <code>routes</code> / <code>tlocs</code></td><td>peer up, remote TLOCs and prefixes present</td></tr>
<tr><td>Data plane</td><td><code>show sdwan bfd sessions</code></td><td>one session per allowed colour pair, up, stable transitions</td></tr>
<tr><td>Service</td><td><code>show ip route</code> (vrf), ping from a host</td><td><code>m</code> routes, AD 251, end-to-end reachability</td></tr>
<tr><td>Policy</td><td><code>show sdwan policy from-controller</code>, <code>app-route stats</code></td><td>policy received, traffic on the intended colour</td></tr></table>

<h3>Lab walkthrough</h3>
<p><b>Topology.</b> CTRL (controller, 203.0.113.2, system-ip 10.255.0.1, org NK-FABRIC) hangs off the INET cloud. EDGE1 (Mumbai, site 100, 10.255.0.11) is healthy: biz-internet 198.51.100.2 and mpls 172.16.1.2, LAN 10.10.1.0/24 with PC1 10.10.1.10. EDGE2 (Pune, site 200) was staged by copying EDGE1: biz-internet 198.51.100.6, mpls 172.16.2.2, LAN 10.20.1.0/24 with PC2 10.20.1.10. It never joined. You can use CLI or CTRL's web GUI (Dashboard, Templates, Policy).</p>

<h4>Task 1: diagnose</h4>
<pre class="out">EDGE2# show sdwan control connections
PEER TYPE   PROTOCOL PEER SYSTEM IP  SITE ID  PEER IP         PORT   LOCAL COLOR     STATE  UPTIME
----------- -------- --------------- -------- --------------- ------ --------------- ------ -----------

<span class="hl">% Control connection via biz-internet is down: ORGMISMATCH - organization-name does not match the controller</span>
% Control connection via mpls is down: DCONFAIL - DTLS connection failure (controller unreachable on this transport)</pre>
<p>Two lines, two different stories. <b>mpls DCONFAIL</b> is expected and harmless: the MPLS cloud has no path to CTRL (EDGE1 shows the same). <b>biz-internet ORGMISMATCH</b> is the real fault: DTLS reached the controller, but the identity check failed. The answer to the task is <b>ORGMISMATCH</b>.</p>

<h4>Task 2: fix the organization name</h4>
<pre class="code">EDGE2# configure terminal
EDGE2(config)# system
EDGE2(config-system)# organization-name NK-FABRIC
EDGE2(config-system)# end
EDGE2# show sdwan control connections</pre>
<pre class="out"><span class="hl">% Control connection via biz-internet is down: SYSIPDUP - system-ip already used by another device in the fabric</span>
% Control connection via mpls is down: DCONFAIL - DTLS connection failure (controller unreachable on this transport)</pre>
<p>Progress: the org check passes, and the next check fails. This "peel the onion" pattern is normal; each fix reveals the next problem.</p>

<h4>Task 3: give EDGE2 a unique system-ip</h4>
<pre class="code">EDGE2# configure terminal
EDGE2(config)# system
EDGE2(config-system)# system-ip 10.255.0.12
EDGE2(config-system)# end
EDGE2# show sdwan control connections</pre>
<pre class="out">PEER TYPE   PROTOCOL PEER SYSTEM IP  SITE ID  PEER IP         PORT   LOCAL COLOR     STATE  UPTIME
----------- -------- --------------- -------- --------------- ------ --------------- ------ -----------
<span class="hl">controller  dtls     10.255.0.1      1        203.0.113.2     12346  biz-internet    up     0:00:00:08</span>

% Control connection via mpls is down: DCONFAIL - DTLS connection failure (controller unreachable on this transport)

EDGE2# show sdwan control connection-history
PEER TYPE   PEER IP         LOCAL COLOR     STATE      LOCAL ERROR  TIME AGO
----------- --------------- --------------- ---------- ------------ -----------
controller  203.0.113.2     biz-internet    connect    SYSIPDUP     0:00:00:41
controller  203.0.113.2     biz-internet    connect    ORGMISMATCH  0:00:02:15
controller  203.0.113.2     mpls            connect    DCONFAIL     0:00:09:30</pre>
<p>The history is your evidence trail for the change record. On the GUI, the same fix is made on the Templates page (system-ip, site-id and org as template values) and the dashboard alarm clears.</p>

<h4>Task 4: verify the data plane</h4>
<pre class="out">EDGE1# show sdwan bfd sessions
SYSTEM IP       SITE ID  STATE  SOURCE TLOC     REMOTE TLOC     SOURCE IP       DST PUBLIC IP   PORT   ENCAP  MULT TX(ms) UPTIME      TRANSITIONS
<span class="hl">10.255.0.12     200      up     biz-internet    biz-internet    198.51.100.2    198.51.100.6    12346  ipsec  7    1000   0:00:00:52  0</span>
<span class="hl">10.255.0.12     200      up     mpls            mpls            172.16.1.2      172.16.2.2      12346  ipsec  7    1000   0:00:00:52  0</span></pre>
<p>The mpls tunnel is up even though EDGE2's mpls TLOC has no control connection: TLOCs are advertised over <b>any</b> working control connection, and the data plane only needs underlay reachability between the two MPLS addresses.</p>

<h4>Task 5: service routes and reachability</h4>
<pre class="out">EDGE1# show sdwan omp routes
1     10.10.1.0/24        0.0.0.0          C,Red,R  installed       10.255.0.11      biz-internet    ipsec
1     10.10.1.0/24        0.0.0.0          C,Red,R  installed       10.255.0.11      mpls            ipsec
<span class="hl">1     10.20.1.0/24        10.255.0.1       C,I,R    installed       10.255.0.12      biz-internet    ipsec</span>
<span class="hl">1     10.20.1.0/24        10.255.0.1       C,I,R    installed       10.255.0.12      mpls            ipsec</span>
EDGE1# show ip route
<span class="hl">m     10.20.1.0/24 [251/0] via 10.255.0.12, 00:00:47, Sdwan-system-intf</span></pre>
<p>PC1 now pings 10.20.1.10. Prove it is the overlay: <code>show ip route</code> on INET and MPLS has no 10.10.1.0/24 or 10.20.1.0/24. The providers only ever see encrypted packets between TLOC addresses.</p>

<h4>Task 6: steer voice onto MPLS</h4>
<pre class="code">CTRL# configure terminal
CTRL(config)# app-route-policy VOICE-MPLS
CTRL(config-app-route-policy)# sequence 10 match dscp 46 preferred-color mpls
CTRL(config-app-route-policy)# exit
CTRL(config)# apply-policy app-route VOICE-MPLS
CTRL(config)# end</pre>
<pre class="out">EDGE1# show sdwan policy from-controller
<span class="hl">from-controller app-route-policy VOICE-MPLS</span>
 sequence 10
  match dscp 46
  action preferred-color mpls</pre>
<p>Both edges receive the policy over OMP; DSCP 46 flows between PC1 and PC2 now use the mpls tunnel, and everything else still load-shares.</p>

<h3>The SD-Access quick ladder</h3>
<p>Underlay (<code>show isis neighbors</code>, loopback-to-loopback ping with large packets for MTU), endpoint onboarding (<code>show access-session</code>: authorised, right VN and SGT), registration (<code>show lisp site</code> on the control plane node), resolution (<code>show lisp instance-id ... map-cache</code> on the edge), policy (<code>show cts role-based permissions</code>), and finally the exit (border BGP per VN, fusion route leaking).</p>

<div class="warn"><p><b>Common mistakes.</b> Chasing the mpls DCONFAIL line, which is by design. Changing several things at once, so you do not know which fix worked. Stopping after the control connection comes up without checking BFD, OMP and a real ping.</p></div>

<div class="exam"><p><b>Exam traps.</b> Error codes map to layers: DCONFAIL = reachability, ORGMISMATCH/CTORGNMMIS = identity, duplicate system-ip = identity. An OMP route with <b>Inv,U</b> means a data-plane (BFD) problem, not a control-plane one.</p></div>

<div class="scn"><h4>The branch that "was fine yesterday"</h4><p>A branch dropped out of the fabric after a router replacement. The engineer saw DCONFAIL and spent an hour with the ISP. The connection-history showed DCONFAIL only on LTE; on biz-internet it showed a certificate error. The replacement router's clock was set to 2019, so every certificate looked invalid. After configuring NTP, the connection came up and the ISP ticket was closed.</p><p><b>Lesson:</b> read every line of the history per colour; the loudest error is not always the real one.</p></div>

<div class="iv"><p class="q">"A new branch will not join the SD-WAN fabric. How do you troubleshoot?"</p><p>Strong answer: bottom-up. Transport interface, IP, default route and reachability to the Validator; NTP. Then identity with <code>show sdwan control local-properties</code>. Then <code>show sdwan control connections</code> and <code>connection-history</code> for the error code per colour: DCONFAIL for reachability, org mismatch, duplicate system-ip, serial not authorised, certificate errors. Once up, check OMP peers, TLOCs and routes, BFD sessions, the <code>m</code> routes, a real ping, and finally policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot bottom-up: transport, identity, control, OMP, BFD, service, policy.</li>
<li>Read error codes per colour; some DCONFAILs are expected by design.</li>
<li>Copied configurations cause org-name and duplicate system-ip failures.</li>
<li>Prove the overlay: providers never learn the LAN prefixes.</li>
<li>SD-Access ladder: underlay, onboarding, LISP registration and cache, SGT policy, border/fusion.</li>
</ul></div>
`,hi:`
<p>Doctor brain surgery se shuru nahi karta. Pehle pulse, saans, blood pressure, phir gehre tests. Fabric troubleshooting bhi aisa hi hai: layers ko <b>neeche se upar</b> check karo, aur pehli tooti layer par ruko. Yeh chapter aapko dono fabrics ka workflow deta hai aur phir lab <i>Troubleshoot · Bring two sites into the SD-WAN fabric</i> ko step by step chalata hai.</p>

<h3>SD-WAN workflow</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Neeche se upar SD-WAN troubleshooting seedhi">
<rect x="20" y="180" width="600" height="32" rx="6" fill="#e2e8f0"/><text x="320" y="201" text-anchor="middle" class="svg-ink" font-size="13">1 Transport: interface, IP, default route, Validator tak reach, NTP</text>
<rect x="50" y="143" width="540" height="32" rx="6" fill="#fde68a"/><text x="320" y="164" text-anchor="middle" class="svg-ink" font-size="13">2 Identity: org name, system-ip, site-id, certificate</text>
<rect x="80" y="106" width="480" height="32" rx="6" fill="#bae6fd"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="13">3 Control connections aur OMP</text>
<rect x="110" y="69" width="420" height="32" rx="6" fill="#bbf7d0"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">4 BFD / IPsec data plane</text>
<rect x="140" y="32" width="360" height="32" rx="6" fill="#ddd6fe"/><text x="320" y="53" text-anchor="middle" class="svg-ink" font-size="13">5 Service routes, phir policy</text>
</svg><p class="cap">Sabse neeche wali tooti layer pehle theek karo; upar ki har cheez us par depend karti hai.</p></div>
<table class="cmp"><tr><th>Layer</th><th>Command</th><th>Kya dekhna hai</th></tr>
<tr><td>Transport</td><td><code>show ip interface brief</code>, <code>show ip route</code>, Validator ko ping</td><td>WAN up, default route, reachability, sahi time</td></tr>
<tr><td>Identity</td><td><code>show sdwan control local-properties</code></td><td>org name, system-ip, site-id, Validator address, certificate state</td></tr>
<tr><td>Control</td><td><code>show sdwan control connections</code> / <code>connection-history</code></td><td>state up, ya error code</td></tr>
<tr><td>OMP</td><td><code>show sdwan omp peers</code> / <code>routes</code> / <code>tlocs</code></td><td>peer up, remote TLOCs aur prefixes maujood</td></tr>
<tr><td>Data plane</td><td><code>show sdwan bfd sessions</code></td><td>har allowed colour pair ka ek session, up, stable transitions</td></tr>
<tr><td>Service</td><td><code>show ip route</code> (vrf), host se ping</td><td><code>m</code> routes, AD 251, end-to-end reachability</td></tr>
<tr><td>Policy</td><td><code>show sdwan policy from-controller</code>, <code>app-route stats</code></td><td>policy mili, traffic intended colour par</td></tr></table>

<h3>Lab walkthrough</h3>
<p><b>Topology.</b> CTRL (controller, 203.0.113.2, system-ip 10.255.0.1, org NK-FABRIC) INET cloud se juda hai. EDGE1 (Mumbai, site 100, 10.255.0.11) healthy hai: biz-internet 198.51.100.2 aur mpls 172.16.1.2, LAN 10.10.1.0/24 PC1 10.10.1.10 ke saath. EDGE2 (Pune, site 200) EDGE1 ko copy karke stage kiya gaya: biz-internet 198.51.100.6, mpls 172.16.2.2, LAN 10.20.1.0/24 PC2 10.20.1.10 ke saath. Yeh kabhi join nahi hua. Aap CLI ya CTRL ka web GUI (Dashboard, Templates, Policy) use kar sakte ho.</p>

<h4>Task 1: diagnose</h4>
<pre class="out">EDGE2# show sdwan control connections
PEER TYPE   PROTOCOL PEER SYSTEM IP  SITE ID  PEER IP         PORT   LOCAL COLOR     STATE  UPTIME
----------- -------- --------------- -------- --------------- ------ --------------- ------ -----------

<span class="hl">% Control connection via biz-internet is down: ORGMISMATCH - organization-name does not match the controller</span>
% Control connection via mpls is down: DCONFAIL - DTLS connection failure (controller unreachable on this transport)</pre>
<p>Do lines, do alag kahaniyan. <b>mpls DCONFAIL</b> expected aur harmless hai: MPLS cloud ka CTRL tak path nahi hai (EDGE1 bhi yahi dikhata hai). <b>biz-internet ORGMISMATCH</b> asli fault hai: DTLS controller tak pahuncha, lekin identity check fail hua. Task ka jawab <b>ORGMISMATCH</b> hai.</p>

<h4>Task 2: organization name theek karo</h4>
<pre class="code">EDGE2# configure terminal
EDGE2(config)# system
EDGE2(config-system)# organization-name NK-FABRIC
EDGE2(config-system)# end
EDGE2# show sdwan control connections</pre>
<pre class="out"><span class="hl">% Control connection via biz-internet is down: SYSIPDUP - system-ip already used by another device in the fabric</span>
% Control connection via mpls is down: DCONFAIL - DTLS connection failure (controller unreachable on this transport)</pre>
<p>Progress: org check pass hota hai, aur agla check fail hota hai. Yeh "pyaaz ki parat utaarna" pattern normal hai; har fix agli problem dikhata hai.</p>

<h4>Task 3: EDGE2 ko unique system-ip do</h4>
<pre class="code">EDGE2# configure terminal
EDGE2(config)# system
EDGE2(config-system)# system-ip 10.255.0.12
EDGE2(config-system)# end
EDGE2# show sdwan control connections</pre>
<pre class="out">PEER TYPE   PROTOCOL PEER SYSTEM IP  SITE ID  PEER IP         PORT   LOCAL COLOR     STATE  UPTIME
----------- -------- --------------- -------- --------------- ------ --------------- ------ -----------
<span class="hl">controller  dtls     10.255.0.1      1        203.0.113.2     12346  biz-internet    up     0:00:00:08</span>

% Control connection via mpls is down: DCONFAIL - DTLS connection failure (controller unreachable on this transport)

EDGE2# show sdwan control connection-history
PEER TYPE   PEER IP         LOCAL COLOR     STATE      LOCAL ERROR  TIME AGO
----------- --------------- --------------- ---------- ------------ -----------
controller  203.0.113.2     biz-internet    connect    SYSIPDUP     0:00:00:41
controller  203.0.113.2     biz-internet    connect    ORGMISMATCH  0:00:02:15
controller  203.0.113.2     mpls            connect    DCONFAIL     0:00:09:30</pre>
<p>History change record ke liye aapka saboot hai. GUI par yahi fix Templates page par hota hai (system-ip, site-id aur org template values ki tarah) aur dashboard alarm clear ho jaata hai.</p>

<h4>Task 4: data plane verify karo</h4>
<pre class="out">EDGE1# show sdwan bfd sessions
SYSTEM IP       SITE ID  STATE  SOURCE TLOC     REMOTE TLOC     SOURCE IP       DST PUBLIC IP   PORT   ENCAP  MULT TX(ms) UPTIME      TRANSITIONS
<span class="hl">10.255.0.12     200      up     biz-internet    biz-internet    198.51.100.2    198.51.100.6    12346  ipsec  7    1000   0:00:00:52  0</span>
<span class="hl">10.255.0.12     200      up     mpls            mpls            172.16.1.2      172.16.2.2      12346  ipsec  7    1000   0:00:00:52  0</span></pre>
<p>mpls tunnel up hai jabki EDGE2 ke mpls TLOC ka koi control connection nahi: TLOCs <b>kisi bhi</b> chalte control connection par advertise hote hain, aur data plane ko sirf do MPLS addresses ke beech underlay reachability chahiye.</p>

<h4>Task 5: service routes aur reachability</h4>
<pre class="out">EDGE1# show sdwan omp routes
1     10.10.1.0/24        0.0.0.0          C,Red,R  installed       10.255.0.11      biz-internet    ipsec
1     10.10.1.0/24        0.0.0.0          C,Red,R  installed       10.255.0.11      mpls            ipsec
<span class="hl">1     10.20.1.0/24        10.255.0.1       C,I,R    installed       10.255.0.12      biz-internet    ipsec</span>
<span class="hl">1     10.20.1.0/24        10.255.0.1       C,I,R    installed       10.255.0.12      mpls            ipsec</span>
EDGE1# show ip route
<span class="hl">m     10.20.1.0/24 [251/0] via 10.255.0.12, 00:00:47, Sdwan-system-intf</span></pre>
<p>PC1 ab 10.20.1.10 ko ping karta hai. Sabit karo ki yeh overlay hai: INET aur MPLS par <code>show ip route</code> mein 10.10.1.0/24 ya 10.20.1.0/24 nahi hai. Providers ko sirf TLOC addresses ke beech encrypted packets dikhte hain.</p>

<h4>Task 6: voice ko MPLS par bhejo</h4>
<pre class="code">CTRL# configure terminal
CTRL(config)# app-route-policy VOICE-MPLS
CTRL(config-app-route-policy)# sequence 10 match dscp 46 preferred-color mpls
CTRL(config-app-route-policy)# exit
CTRL(config)# apply-policy app-route VOICE-MPLS
CTRL(config)# end</pre>
<pre class="out">EDGE1# show sdwan policy from-controller
<span class="hl">from-controller app-route-policy VOICE-MPLS</span>
 sequence 10
  match dscp 46
  action preferred-color mpls</pre>
<p>Dono edges ko OMP par policy milti hai; PC1 aur PC2 ke beech DSCP 46 flows ab mpls tunnel use karte hain, aur baaki sab ab bhi load-share hota hai.</p>

<h3>SD-Access ki quick seedhi</h3>
<p>Underlay (<code>show isis neighbors</code>, MTU ke liye bade packets ke saath loopback-to-loopback ping), endpoint onboarding (<code>show access-session</code>: authorised, sahi VN aur SGT), registration (control plane node par <code>show lisp site</code>), resolution (edge par <code>show lisp instance-id ... map-cache</code>), policy (<code>show cts role-based permissions</code>), aur aakhir mein exit (har VN ka border BGP, fusion route leaking).</p>

<div class="warn"><p><b>Common galtiyan.</b> mpls DCONFAIL line ke peeche bhaagna, jo design se hai. Ek saath kai cheezein badalna, jisse pata nahi chalta ki kaunsa fix kaam aaya. Control connection up hone ke baad BFD, OMP aur asli ping check kiye bina ruk jaana.</p></div>

<div class="exam"><p><b>Exam traps.</b> Error codes layers se map hote hain: DCONFAIL = reachability, ORGMISMATCH/CTORGNMMIS = identity, duplicate system-ip = identity. <b>Inv,U</b> wala OMP route data-plane (BFD) problem hai, control-plane nahi.</p></div>

<div class="scn"><h4>Woh branch jo "kal theek thi"</h4><p>Router replacement ke baad ek branch fabric se bahar ho gayi. Engineer ne DCONFAIL dekha aur ISP ke saath ek ghanta bitaya. Connection-history ne dikhaya ki DCONFAIL sirf LTE par tha; biz-internet par certificate error tha. Replacement router ki clock 2019 par set thi, isliye har certificate invalid dikh raha tha. NTP configure karne ke baad connection up ho gaya aur ISP ticket band hua.</p><p><b>Seekh:</b> har colour ki history ki har line padho; sabse zor ka error hamesha asli nahi hota.</p></div>

<div class="iv"><p class="q">"Naya branch SD-WAN fabric join nahi kar raha. Aap kaise troubleshoot karoge?"</p><p>Strong answer: neeche se upar. Transport interface, IP, default route aur Validator tak reachability; NTP. Phir <code>show sdwan control local-properties</code> se identity. Phir har colour ke error code ke liye <code>show sdwan control connections</code> aur <code>connection-history</code>: reachability ke liye DCONFAIL, org mismatch, duplicate system-ip, serial authorised nahi, certificate errors. Up hone ke baad OMP peers, TLOCs aur routes, BFD sessions, <code>m</code> routes, asli ping, aur aakhir mein policy check karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Neeche se upar troubleshoot karo: transport, identity, control, OMP, BFD, service, policy.</li>
<li>Har colour ke error codes padho; kuch DCONFAILs design se expected hain.</li>
<li>Copy ki gayi configurations org-name aur duplicate system-ip failures laati hain.</li>
<li>Overlay sabit karo: providers kabhi LAN prefixes nahi seekhte.</li>
<li>SD-Access seedhi: underlay, onboarding, LISP registration aur cache, SGT policy, border/fusion.</li>
</ul></div>
`}};export{e as default};