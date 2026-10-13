var e={id:`lab`,h:{en:`Lab walkthrough: build a site-to-site IPsec tunnel on both sides`,hi:`Lab walkthrough: dono taraf site-to-site IPsec tunnel banao`},body:{en:`
<p>Learning to drive starts in an empty car park, not on the highway. The module lab is that car park: two routers, one ISP, two PCs, and nothing else that can go wrong. You will build the tunnel with IKEv1 and a crypto map on IOS, exactly as chapter 8 described, and prove it works with the same commands you will use on real networks. Read this chapter once, then do the lab without looking back.</p>

<h3>The topology</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Lab topology">
<rect x="10" y="80" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="55" y="102" text-anchor="middle" class="svg-ink" font-size="12">PC-HQ</text><text x="55" y="119" text-anchor="middle" class="svg-muted" font-size="11">10.30.0.10</text>
<rect x="130" y="70" width="110" height="70" rx="8" fill="#bae6fd"/><text x="185" y="95" text-anchor="middle" class="svg-ink" font-size="13">HQ</text><text x="185" y="113" text-anchor="middle" class="svg-muted" font-size="11">Gi0/1 10.30.0.1</text><text x="185" y="129" text-anchor="middle" class="svg-muted" font-size="11">Gi0/0 100.64.51.2</text>
<rect x="270" y="70" width="100" height="70" rx="8" fill="#e2e8f0"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="11">.51.1 / .52.1</text>
<rect x="400" y="70" width="110" height="70" rx="8" fill="#bae6fd"/><text x="455" y="95" text-anchor="middle" class="svg-ink" font-size="13">BR</text><text x="455" y="113" text-anchor="middle" class="svg-muted" font-size="11">Gi0/0 100.64.52.2</text><text x="455" y="129" text-anchor="middle" class="svg-muted" font-size="11">Gi0/1 10.40.0.1</text>
<rect x="540" y="80" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="585" y="102" text-anchor="middle" class="svg-ink" font-size="12">PC-BR</text><text x="585" y="119" text-anchor="middle" class="svg-muted" font-size="11">10.40.0.10</text>
<line x1="100" y1="105" x2="130" y2="105" stroke="#64748b"/><line x1="240" y1="105" x2="270" y2="105" stroke="#64748b"/><line x1="370" y1="105" x2="400" y2="105" stroke="#64748b"/><line x1="510" y1="105" x2="540" y2="105" stroke="#64748b"/>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">HQ and BR have a default route to the ISP; the ISP knows only the /30 links</text>
</svg><p class="cap">The lab: HQ LAN 10.30.0.0/24, BR LAN 10.40.0.0/24, WAN links 100.64.51.0/30 and 100.64.52.0/30.</p></div>

<h3>Task 1: show the problem first</h3>
<p>Always prove the failure before you fix it, so you know your change is what fixed it.</p>
<pre class="code">PC-HQ&gt; ping 10.40.0.10</pre>
<pre class="out">PC-HQ&gt; ping 10.40.0.10
<span class="hl">10.40.0.10 icmp_seq=1 timeout</span>
10.40.0.10 icmp_seq=2 timeout</pre>
<p>HQ forwards the packet to the ISP on its default route. The ISP has no route for 10.40.0.0/24, a private network, and drops it. That is the real internet's behaviour too.</p>

<h3>Task 2: configure HQ</h3>
<pre class="code">HQ&gt; enable
HQ# configure terminal
<span class="c">! Phase 1: AES-256, SHA-256, pre-share, group 14</span>
HQ(config)# crypto isakmp policy 10
HQ(config-isakmp)# encryption aes 256
HQ(config-isakmp)# hash sha256
HQ(config-isakmp)# authentication pre-share
HQ(config-isakmp)# group 14
HQ(config-isakmp)# exit
<span class="c">! Pre-shared key for the branch peer</span>
HQ(config)# crypto isakmp key NKvpn2026 address 100.64.52.2
<span class="c">! Phase 2 transform set</span>
HQ(config)# crypto ipsec transform-set TS-HQ esp-aes 256 esp-sha256-hmac
HQ(cfg-crypto-trans)# mode tunnel
HQ(cfg-crypto-trans)# exit
<span class="c">! Interesting traffic: HQ LAN to BR LAN</span>
HQ(config)# access-list 110 permit ip 10.30.0.0 0.0.0.255 10.40.0.0 0.0.0.255
<span class="c">! Crypto map and binding</span>
HQ(config)# crypto map VPN-MAP 10 ipsec-isakmp
HQ(config-crypto-map)# set peer 100.64.52.2
HQ(config-crypto-map)# set transform-set TS-HQ
HQ(config-crypto-map)# match address 110
HQ(config-crypto-map)# exit
HQ(config)# interface GigabitEthernet0/0
HQ(config-if)# crypto map VPN-MAP
HQ(config-if)# end</pre>
<p>When you enter <code>crypto map VPN-MAP 10 ipsec-isakmp</code>, IOS prints a note that the map will remain disabled until a peer and a valid access list are configured. That is normal. When you apply the map on Gi0/0, IOS logs <code>%CRYPTO-6-ISAKMP_ON_OFF: ISAKMP is ON</code>.</p>

<h3>Task 3: configure BR as the mirror image</h3>
<pre class="code">BR# configure terminal
BR(config)# crypto isakmp policy 10
BR(config-isakmp)# encryption aes 256
BR(config-isakmp)# hash sha256
BR(config-isakmp)# authentication pre-share
BR(config-isakmp)# group 14
BR(config-isakmp)# exit
BR(config)# crypto isakmp key NKvpn2026 address 100.64.51.2
BR(config)# crypto ipsec transform-set TS-BR esp-aes 256 esp-sha256-hmac
BR(cfg-crypto-trans)# mode tunnel
BR(cfg-crypto-trans)# exit
<span class="c">! Mirror: BR LAN to HQ LAN</span>
BR(config)# access-list 120 permit ip 10.40.0.0 0.0.0.255 10.30.0.0 0.0.0.255
BR(config)# crypto map VPN-MAP 10 ipsec-isakmp
BR(config-crypto-map)# set peer 100.64.51.2
BR(config-crypto-map)# set transform-set TS-BR
BR(config-crypto-map)# match address 120
BR(config-crypto-map)# exit
BR(config)# interface GigabitEthernet0/0
BR(config-if)# crypto map VPN-MAP
BR(config-if)# end</pre>
<p>Only three things changed: the peer address in the key and the map, the transform set name, and the ACL (reversed). The policy and key value are identical.</p>

<h3>Task 4: bring the tunnel up and read the ISAKMP state</h3>
<pre class="out">PC-HQ&gt; ping 10.40.0.10
10.40.0.10 icmp_seq=1 timeout
<span class="hl">84 bytes from 10.40.0.10 icmp_seq=2 ttl=62 time=4.112 ms</span>
84 bytes from 10.40.0.10 icmp_seq=3 ttl=62 time=3.870 ms

HQ# show crypto isakmp sa
IPv4 Crypto ISAKMP SA
dst             src             state          conn-id status
<span class="hl">100.64.52.2     100.64.51.2     QM_IDLE           1001 ACTIVE</span></pre>
<p>The first packet triggered IKE and was dropped while the SAs were built; that is expected. <b>QM_IDLE</b> means phase 1 is up and idle, ready for quick mode (phase 2) negotiations. That is the answer the lab asks for. Notice <code>ttl=62</code>: only HQ and BR decremented the inner TTL. The ISP hop is invisible because it only forwarded the outer ESP packet.</p>

<h3>Task 5: prove encryption in both directions</h3>
<pre class="out">BR# show crypto ipsec sa

interface: GigabitEthernet0/0
    Crypto map tag: VPN-MAP, local addr 100.64.52.2

   protected vrf: (none)
   local  ident (addr/mask/prot/port): (10.40.0.0/255.255.255.0/0/0)
   remote ident (addr/mask/prot/port): (10.30.0.0/255.255.255.0/0/0)
   current_peer 100.64.51.2 port 500
     PERMIT, flags={origin_is_acl,}
<span class="hl">    #pkts encaps: 4, #pkts encrypt: 4, #pkts digest: 4</span>
<span class="hl">    #pkts decaps: 4, #pkts decrypt: 4, #pkts verify: 4</span>
    #send errors 0, #recv errors 0

     local crypto endpt.: 100.64.52.2, remote crypto endpt.: 100.64.51.2</pre>
<div class="eg"><p><b>Worked example: reading the counters.</b> PC-HQ sent four echo requests after the tunnel was up (the timed-out first one was never encrypted). BR decrypted 4 requests (decaps 4) and encrypted 4 replies (encaps 4). On HQ you would see the opposite roles with the same numbers. Equal, rising encaps and decaps on both sides is the definition of a healthy tunnel.</p></div>

<div class="warn"><p><b>Common mistakes in this lab.</b> Pinging from the HQ router itself (its source is 100.64.51.2, which is not in ACL 110, so no tunnel). Typing <code>access-list 120</code> on BR in the same direction as HQ. Forgetting to apply the crypto map on Gi0/0. Using a different key on one router.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>MM_NO_STATE</code> or <code>MM_KEY_EXCH</code> instead of QM_IDLE means phase 1 is stuck (reachability, policy or key). QM_IDLE with no IPsec SA means phase 2 failed (transform set or ACL).</p></div>

<div class="scn"><h4>The trainee who pinged from the router</h4><p>A trainee configured both routers perfectly, then typed <code>ping 10.40.0.10</code> on HQ and saw five dots. <code>show crypto isakmp sa</code> was empty. The trainer asked: "which source address did that ping use?" The router used its exit interface address 100.64.51.2. Repeating the ping from PC-HQ (or with <code>ping 10.40.0.10 source GigabitEthernet0/1</code>) brought the tunnel up immediately.</p><p><b>Lesson:</b> generate interesting traffic from inside the protected network.</p></div>

<div class="iv"><p class="q">"You just configured a crypto map tunnel. How do you prove it works?"</p><p>Strong answer: send traffic from a host in the protected LAN, check <code>show crypto isakmp sa</code> (QM_IDLE) or <code>show crypto ikev2 sa</code> (READY), then <code>show crypto ipsec sa</code> on both peers: the correct local and remote idents, the right peer, and encaps and decaps both rising. Mention that the first packet may be lost while the SAs are built.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Prove the failure first: private networks are not routed by the ISP.</li>
<li>Both routers: same ISAKMP policy and key, transform set, mirrored ACL, crypto map on Gi0/0.</li>
<li>The first packet may be lost while IKE builds the SAs.</li>
<li>QM_IDLE = IKEv1 phase 1 up; encaps and decaps rising on both sides = tunnel healthy.</li>
<li>Test from a LAN host or with an explicit inside source.</li>
</ul></div>
`,hi:`
<p>Driving seekhna khaali car park mein shuru hota hai, highway par nahi. Module lab woh car park hai: do routers, ek ISP, do PCs, aur kuch nahi jo galat ho sake. Aap IOS par IKEv1 aur crypto map ke saath tunnel banaoge, bilkul jaise chapter 8 ne bataya, aur unhi commands se saabit karoge ki woh kaam karta hai jo aap real networks par use karoge. Yeh chapter ek baar padho, phir bina peeche dekhe lab karo.</p>

<h3>Topology</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Lab topology">
<rect x="10" y="80" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="55" y="102" text-anchor="middle" class="svg-ink" font-size="12">PC-HQ</text><text x="55" y="119" text-anchor="middle" class="svg-muted" font-size="11">10.30.0.10</text>
<rect x="130" y="70" width="110" height="70" rx="8" fill="#bae6fd"/><text x="185" y="95" text-anchor="middle" class="svg-ink" font-size="13">HQ</text><text x="185" y="113" text-anchor="middle" class="svg-muted" font-size="11">Gi0/1 10.30.0.1</text><text x="185" y="129" text-anchor="middle" class="svg-muted" font-size="11">Gi0/0 100.64.51.2</text>
<rect x="270" y="70" width="100" height="70" rx="8" fill="#e2e8f0"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="11">.51.1 / .52.1</text>
<rect x="400" y="70" width="110" height="70" rx="8" fill="#bae6fd"/><text x="455" y="95" text-anchor="middle" class="svg-ink" font-size="13">BR</text><text x="455" y="113" text-anchor="middle" class="svg-muted" font-size="11">Gi0/0 100.64.52.2</text><text x="455" y="129" text-anchor="middle" class="svg-muted" font-size="11">Gi0/1 10.40.0.1</text>
<rect x="540" y="80" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="585" y="102" text-anchor="middle" class="svg-ink" font-size="12">PC-BR</text><text x="585" y="119" text-anchor="middle" class="svg-muted" font-size="11">10.40.0.10</text>
<line x1="100" y1="105" x2="130" y2="105" stroke="#64748b"/><line x1="240" y1="105" x2="270" y2="105" stroke="#64748b"/><line x1="370" y1="105" x2="400" y2="105" stroke="#64748b"/><line x1="510" y1="105" x2="540" y2="105" stroke="#64748b"/>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">HQ aur BR ka ISP ki taraf default route; ISP sirf /30 links jaanta hai</text>
</svg><p class="cap">Lab: HQ LAN 10.30.0.0/24, BR LAN 10.40.0.0/24, WAN links 100.64.51.0/30 aur 100.64.52.0/30.</p></div>

<h3>Task 1: pehle problem dikhao</h3>
<p>Fix karne se pehle hamesha failure saabit karo, taaki aapko pata ho ki aapke change ne hi fix kiya.</p>
<pre class="code">PC-HQ&gt; ping 10.40.0.10</pre>
<pre class="out">PC-HQ&gt; ping 10.40.0.10
<span class="hl">10.40.0.10 icmp_seq=1 timeout</span>
10.40.0.10 icmp_seq=2 timeout</pre>
<p>HQ packet ko apne default route par ISP ko forward karta hai. ISP ke paas 10.40.0.0/24, ek private network, ka route nahi hai, aur woh use drop kar deta hai. Real internet ka behaviour bhi yahi hai.</p>

<h3>Task 2: HQ configure karo</h3>
<pre class="code">HQ&gt; enable
HQ# configure terminal
<span class="c">! Phase 1: AES-256, SHA-256, pre-share, group 14</span>
HQ(config)# crypto isakmp policy 10
HQ(config-isakmp)# encryption aes 256
HQ(config-isakmp)# hash sha256
HQ(config-isakmp)# authentication pre-share
HQ(config-isakmp)# group 14
HQ(config-isakmp)# exit
<span class="c">! Branch peer ke liye pre-shared key</span>
HQ(config)# crypto isakmp key NKvpn2026 address 100.64.52.2
<span class="c">! Phase 2 transform set</span>
HQ(config)# crypto ipsec transform-set TS-HQ esp-aes 256 esp-sha256-hmac
HQ(cfg-crypto-trans)# mode tunnel
HQ(cfg-crypto-trans)# exit
<span class="c">! Interesting traffic: HQ LAN se BR LAN</span>
HQ(config)# access-list 110 permit ip 10.30.0.0 0.0.0.255 10.40.0.0 0.0.0.255
<span class="c">! Crypto map aur binding</span>
HQ(config)# crypto map VPN-MAP 10 ipsec-isakmp
HQ(config-crypto-map)# set peer 100.64.52.2
HQ(config-crypto-map)# set transform-set TS-HQ
HQ(config-crypto-map)# match address 110
HQ(config-crypto-map)# exit
HQ(config)# interface GigabitEthernet0/0
HQ(config-if)# crypto map VPN-MAP
HQ(config-if)# end</pre>
<p>Jab aap <code>crypto map VPN-MAP 10 ipsec-isakmp</code> enter karte ho, IOS ek note print karta hai ki peer aur valid access list configure hone tak map disabled rahega. Yeh normal hai. Jab aap Gi0/0 par map apply karte ho, IOS <code>%CRYPTO-6-ISAKMP_ON_OFF: ISAKMP is ON</code> log karta hai.</p>

<h3>Task 3: BR ko mirror image ki tarah configure karo</h3>
<pre class="code">BR# configure terminal
BR(config)# crypto isakmp policy 10
BR(config-isakmp)# encryption aes 256
BR(config-isakmp)# hash sha256
BR(config-isakmp)# authentication pre-share
BR(config-isakmp)# group 14
BR(config-isakmp)# exit
BR(config)# crypto isakmp key NKvpn2026 address 100.64.51.2
BR(config)# crypto ipsec transform-set TS-BR esp-aes 256 esp-sha256-hmac
BR(cfg-crypto-trans)# mode tunnel
BR(cfg-crypto-trans)# exit
<span class="c">! Mirror: BR LAN se HQ LAN</span>
BR(config)# access-list 120 permit ip 10.40.0.0 0.0.0.255 10.30.0.0 0.0.0.255
BR(config)# crypto map VPN-MAP 10 ipsec-isakmp
BR(config-crypto-map)# set peer 100.64.51.2
BR(config-crypto-map)# set transform-set TS-BR
BR(config-crypto-map)# match address 120
BR(config-crypto-map)# exit
BR(config)# interface GigabitEthernet0/0
BR(config-if)# crypto map VPN-MAP
BR(config-if)# end</pre>
<p>Sirf teen cheezein badli: key aur map mein peer address, transform set ka naam, aur ACL (ulti). Policy aur key ki value identical hai.</p>

<h3>Task 4: tunnel up karo aur ISAKMP state padho</h3>
<pre class="out">PC-HQ&gt; ping 10.40.0.10
10.40.0.10 icmp_seq=1 timeout
<span class="hl">84 bytes from 10.40.0.10 icmp_seq=2 ttl=62 time=4.112 ms</span>
84 bytes from 10.40.0.10 icmp_seq=3 ttl=62 time=3.870 ms

HQ# show crypto isakmp sa
IPv4 Crypto ISAKMP SA
dst             src             state          conn-id status
<span class="hl">100.64.52.2     100.64.51.2     QM_IDLE           1001 ACTIVE</span></pre>
<p>Pehle packet ne IKE trigger kiya aur SAs bante waqt drop ho gaya; yeh expected hai. <b>QM_IDLE</b> ka matlab hai phase 1 up aur idle hai, quick mode (phase 2) negotiations ke liye ready. Lab yahi answer maangta hai. <code>ttl=62</code> dekho: sirf HQ aur BR ne inner TTL ghataya. ISP hop dikhta hi nahi kyunki usne sirf outer ESP packet forward kiya.</p>

<h3>Task 5: dono directions mein encryption saabit karo</h3>
<pre class="out">BR# show crypto ipsec sa

interface: GigabitEthernet0/0
    Crypto map tag: VPN-MAP, local addr 100.64.52.2

   protected vrf: (none)
   local  ident (addr/mask/prot/port): (10.40.0.0/255.255.255.0/0/0)
   remote ident (addr/mask/prot/port): (10.30.0.0/255.255.255.0/0/0)
   current_peer 100.64.51.2 port 500
     PERMIT, flags={origin_is_acl,}
<span class="hl">    #pkts encaps: 4, #pkts encrypt: 4, #pkts digest: 4</span>
<span class="hl">    #pkts decaps: 4, #pkts decrypt: 4, #pkts verify: 4</span>
    #send errors 0, #recv errors 0

     local crypto endpt.: 100.64.52.2, remote crypto endpt.: 100.64.51.2</pre>
<div class="eg"><p><b>Worked example: counters padhna.</b> Tunnel up hone ke baad PC-HQ ne chaar echo requests bheje (timed-out pehla kabhi encrypt nahi hua). BR ne 4 requests decrypt kiye (decaps 4) aur 4 replies encrypt kiye (encaps 4). HQ par aapko ulte roles same numbers ke saath dikhenge. Dono sides par barabar, badhte encaps aur decaps hi healthy tunnel ki definition hai.</p></div>

<div class="warn"><p><b>Is lab ki common galtiyan.</b> HQ router se khud ping karna (uska source 100.64.51.2 hai, jo ACL 110 mein nahi, isliye tunnel nahi). BR par <code>access-list 120</code> HQ wali direction mein hi type karna. Gi0/0 par crypto map apply karna bhoolna. Ek router par alag key use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> QM_IDLE ki jagah <code>MM_NO_STATE</code> ya <code>MM_KEY_EXCH</code> ka matlab phase 1 atka hai (reachability, policy ya key). QM_IDLE ke saath IPsec SA na hona matlab phase 2 fail hua (transform set ya ACL).</p></div>

<div class="scn"><h4>Woh trainee jisne router se ping kiya</h4><p>Ek trainee ne dono routers perfect configure kiye, phir HQ par <code>ping 10.40.0.10</code> type kiya aur paanch dots dekhe. <code>show crypto isakmp sa</code> khaali tha. Trainer ne poocha: "us ping ne kaunsa source address use kiya?" Router ne apna exit interface address 100.64.51.2 use kiya. PC-HQ se (ya <code>ping 10.40.0.10 source GigabitEthernet0/1</code> se) ping dohrane par tunnel turant up ho gaya.</p><p><b>Seekh:</b> interesting traffic protected network ke andar se generate karo.</p></div>

<div class="iv"><p class="q">"Aapne abhi crypto map tunnel configure kiya. Kaise saabit karoge ki woh kaam karta hai?"</p><p>Strong answer: protected LAN ke host se traffic bhejo, <code>show crypto isakmp sa</code> (QM_IDLE) ya <code>show crypto ikev2 sa</code> (READY) check karo, phir dono peers par <code>show crypto ipsec sa</code>: sahi local aur remote idents, sahi peer, aur encaps aur decaps dono badh rahe hon. Batao ki SAs bante waqt pehla packet kho sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle failure saabit karo: ISP private networks route nahi karta.</li>
<li>Dono routers: same ISAKMP policy aur key, transform set, mirrored ACL, Gi0/0 par crypto map.</li>
<li>IKE ke SAs banate waqt pehla packet kho sakta hai.</li>
<li>QM_IDLE = IKEv1 phase 1 up; dono sides par badhte encaps aur decaps = tunnel healthy.</li>
<li>LAN host se ya explicit inside source ke saath test karo.</li>
</ul></div>
`}};export{e as default};