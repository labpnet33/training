var e={id:`verify`,h:{en:`Verification: IKE SAs, IPsec counters and vpn-sessiondb`,hi:`Verification: IKE SAs, IPsec counters aur vpn-sessiondb`},body:{en:`
<p>A doctor does not say "you look fine" after one glance. She checks pulse, temperature and blood pressure in a fixed order, because each one rules out a different problem. VPN verification is the same: a fixed order of four checks, each answering one question. Learn the order and you will diagnose any tunnel quickly.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Verification order">
<rect x="10" y="40" width="140" height="70" rx="8" fill="#e2e8f0"/><text x="80" y="68" text-anchor="middle" class="svg-ink" font-size="13">1. Config</text><text x="80" y="88" text-anchor="middle" class="svg-muted" font-size="11">map, peer, ACL</text>
<rect x="170" y="40" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="240" y="68" text-anchor="middle" class="svg-ink" font-size="13">2. IKE SA</text><text x="240" y="88" text-anchor="middle" class="svg-muted" font-size="11">phase 1 up?</text>
<rect x="330" y="40" width="140" height="70" rx="8" fill="#bae6fd"/><text x="400" y="68" text-anchor="middle" class="svg-ink" font-size="13">3. IPsec SA</text><text x="400" y="88" text-anchor="middle" class="svg-muted" font-size="11">encaps / decaps</text>
<rect x="490" y="40" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="560" y="68" text-anchor="middle" class="svg-ink" font-size="13">4. Session</text><text x="560" y="88" text-anchor="middle" class="svg-muted" font-size="11">vpn-sessiondb</text>
<line x1="150" y1="75" x2="170" y2="75" stroke="#64748b"/><line x1="310" y1="75" x2="330" y2="75" stroke="#64748b"/><line x1="470" y1="75" x2="490" y2="75" stroke="#64748b"/>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Stop at the first check that fails; that layer holds the fault.</text>
</svg><p class="cap">Config, then phase 1, then phase 2 counters, then the session summary.</p></div>

<h3>Check 2a: IKEv1 SA on the ASA</h3>
<pre class="out">HQ-ASA# show crypto ikev1 sa

IKEv1 SAs:

   Active SA: 1
    Rekey SA: 0 (A tunnel will report 1 Active and 1 Rekey SA during rekey)
Total IKE SA: 1

1   IKE Peer: 198.51.100.20
    Type    : L2L             Role    : initiator
<span class="hl">    Rekey   : no              State   : MM_ACTIVE</span></pre>
<p>On the ASA, a healthy IKEv1 phase 1 shows <b>MM_ACTIVE</b> (main mode complete). IOS shows the same condition as <b>QM_IDLE</b>. States such as <code>MM_WAIT_MSG2</code> mean the ASA sent its proposal and is waiting for a reply: the peer is unreachable, UDP 500 is blocked, or the peer has no matching configuration.</p>

<h3>Check 2b: IKEv2 SA on the ASA</h3>
<pre class="out">HQ-ASA# show crypto ikev2 sa

IKEv2 SAs:

Session-id:3, Status:UP-ACTIVE, IKE count:1, CHILD count:1

Tunnel-id Local                 Remote                Status         Role
<span class="hl"> 51843921 100.64.51.2/500       100.64.52.2/500       READY    INITIATOR</span>
      Encr: AES-CBC, keysize: 256, Hash: SHA256, DH Grp:14, Auth sign: PSK, Auth verify: PSK
      Life/Active Time: 86400/1840 sec
Child sa: local selector  10.30.0.0/0 - 10.30.0.255/65535
          remote selector 10.40.0.0/0 - 10.40.0.255/65535
          ESP spi in/out: 0x7c41a2f3/0x9e2b4c18</pre>
<p><b>READY</b> means the IKE SA is up. The <b>Child sa</b> lines show the negotiated traffic selectors (address range and port range) and the inbound and outbound SPIs. If the selectors are not the networks you expected, the crypto ACLs are not what you think.</p>

<h3>Check 3: IPsec SA and the counters</h3>
<pre class="out">HQ-ASA# show crypto ipsec sa peer 100.64.52.2
peer address: 100.64.52.2
    Crypto map tag: OUTSIDE_MAP, seq num: 10, local addr: 100.64.51.2

      access-list VPN-BR extended permit ip 10.30.0.0 255.255.255.0 10.40.0.0 255.255.255.0
      local ident (addr/mask/prot/port): (10.30.0.0/255.255.255.0/0/0)
      remote ident (addr/mask/prot/port): (10.40.0.0/255.255.255.0/0/0)
      current_peer: 100.64.52.2

<span class="hl">      #pkts encaps: 1530, #pkts encrypt: 1530, #pkts digest: 1530</span>
<span class="hl">      #pkts decaps: 1522, #pkts decrypt: 1522, #pkts verify: 1522</span>
      #pkts compressed: 0, #pkts decompressed: 0
      #pre-frag successes: 0, #pre-frag failures: 0, #fragments created: 0
      #send errors: 0, #recv errors: 0

      local crypto endpt.: 100.64.51.2/500, remote crypto endpt.: 100.64.52.2/500
      path mtu 1500, ipsec overhead 74(44), media mtu 1500</pre>
<p>Read the counters like a two-way conversation:</p>
<table class="cmp"><tr><th>Pattern</th><th>Meaning</th><th>Look at</th></tr>
<tr><td>encaps and decaps both rising</td><td>Healthy</td><td>Nothing</td></tr>
<tr><td>encaps rising, decaps 0</td><td>We send, the peer never sends back</td><td>Peer's routing, NAT exemption, crypto ACL, or ESP blocked toward us</td></tr>
<tr><td>decaps rising, encaps 0</td><td>Peer sends, we never answer</td><td>Our NAT exemption, our routing, the host's gateway</td></tr>
<tr><td>No IPsec SA at all</td><td>Phase 2 never formed</td><td>Proposal, selectors, PFS</td></tr>
<tr><td>recv errors rising</td><td>Packets fail integrity or replay checks</td><td>Key mismatch after rekey, a device altering packets, MTU</td></tr></table>
<p>Note that a ping that is never answered still increases encaps on the sender, so always compare <b>both</b> directions and <b>both</b> peers.</p>

<h3>Check 4: the session summary</h3>
<pre class="out">HQ-ASA# show vpn-sessiondb l2l

Session Type: LAN-to-LAN

<span class="hl">Connection   : 100.64.52.2</span>
Index        : 7                      IP Addr      : 100.64.52.2
Protocol     : IKEv2 IPsec
Encryption   : IKEv2: (1)AES256  IPsec: (1)AES256
Hashing      : IKEv2: (1)SHA256  IPsec: (1)SHA256
Bytes Tx     : 128520                 Bytes Rx     : 127848
Login Time   : 09:12:44 UTC Fri Oct 2 2026
Duration     : 1h:03m:12s</pre>
<p><code>show vpn-sessiondb l2l</code> lists every site-to-site peer with protocol, algorithms, bytes in each direction and uptime. It is the first command a NOC engineer runs to answer "is the Pune tunnel up?". Add <code>detail</code> and <code>filter ipaddress 100.64.52.2</code> for one peer. To reset one tunnel, use <code>vpn-sessiondb logoff ipaddress 100.64.52.2</code> (or <code>clear crypto ikev2 sa</code> carefully: without arguments it clears every tunnel).</p>

<h3>Proving the path with packet-tracer</h3>
<pre class="out">HQ-ASA# packet-tracer input inside icmp 10.30.0.10 8 0 10.40.0.10
...
Phase: 4
Type: NAT
Subtype:
Result: ALLOW
Additional Information:
Static translate 10.30.0.10/0 to 10.30.0.10/0
...
Phase: 7
<span class="hl">Type: VPN</span>
<span class="hl">Subtype: encrypt</span>
Result: ALLOW
...
Result:
input-interface: inside
output-interface: outside
Action: allow</pre>
<p>A <b>VPN encrypt</b> phase proves the packet matched the crypto map. The NAT phase proves the identity rule matched. If the tunnel is down, the first run may show a drop while IKE is triggered; run it a second time.</p>

<h3>The router side in one look</h3>
<pre class="out">BR# show crypto session
Crypto session current status

Interface: GigabitEthernet0/0
<span class="hl">Session status: UP-ACTIVE</span>
Peer: 100.64.51.2 port 500
  IKEv2 SA: local 100.64.52.2/500 remote 100.64.51.2/500 Active
  IPSEC FLOW: permit ip 10.40.0.0/255.255.255.0 10.30.0.0/255.255.255.0
        Active SAs: 2, origin: crypto map</pre>
<p><b>Active SAs: 2</b> is one inbound and one outbound IPsec SA, as expected.</p>

<div class="warn"><p><b>Common mistake.</b> Declaring a tunnel healthy because the IKE SA is up. Phase 1 can stay up for a day while phase 2 fails every time. Always look at the IPsec SA and its counters.</p></div>
<div class="exam"><p><b>Exam trap.</b> ASA IKEv1 healthy state is <code>MM_ACTIVE</code>; IOS IKEv1 healthy state is <code>QM_IDLE</code>; IKEv2 on both shows <code>READY</code>. <code>show vpn-sessiondb l2l</code> is ASA-only.</p></div>

<div class="scn"><h4>The NOC's two-minute answer</h4><p>A store manager phoned at 9:05: "billing is down". The NOC engineer ran <code>show vpn-sessiondb l2l</code> on the HQ ASA: the store's peer was missing. <code>show crypto ikev2 sa</code> had no entry for it either, and a ping from the ASA to the store's public IP failed. The store's ISP circuit was down; the ISP confirmed an outage. The engineer could tell the manager within two minutes that the VPN configuration was fine and give an ISP ticket number.</p><p><b>Lesson:</b> a fixed verification order turns a vague complaint into the right owner fast.</p></div>

<div class="iv"><p class="q">"show crypto ipsec sa shows encaps increasing and decaps at zero. What does that tell you?"</p><p>Strong answer: our side has a working SA and is encrypting; the peer is not sending anything back, or it is not reaching us. Check the peer's counters: if its decaps rise, our packets arrive and its return traffic is not being encrypted (its routing, NAT exemption or crypto ACL). If its decaps are zero, ESP is being dropped in the path. Mention running packet-tracer and captures to confirm.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Verify in order: configuration, IKE SA, IPsec SA counters, session summary.</li>
<li>ASA IKEv1 = MM_ACTIVE, IOS IKEv1 = QM_IDLE, IKEv2 = READY.</li>
<li>Encaps and decaps must both rise on both peers; one-sided counters point to the return path.</li>
<li><code>show vpn-sessiondb l2l</code> gives peer, protocol, algorithms, bytes and uptime on the ASA.</li>
<li><code>packet-tracer</code> shows the NAT exemption and the VPN encrypt phase.</li>
</ul></div>
`,hi:`
<p>Doctor ek nazar ke baad "aap theek lag rahe ho" nahi kehti. Woh pulse, temperature aur blood pressure ek fixed order mein check karti hai, kyunki har ek alag problem ko rule out karta hai. VPN verification bhi aisa hi hai: chaar checks ka ek fixed order, har ek ek sawaal ka jawab deta hai. Order seekh lo aur aap kisi bhi tunnel ko jaldi diagnose kar loge.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Verification order">
<rect x="10" y="40" width="140" height="70" rx="8" fill="#e2e8f0"/><text x="80" y="68" text-anchor="middle" class="svg-ink" font-size="13">1. Config</text><text x="80" y="88" text-anchor="middle" class="svg-muted" font-size="11">map, peer, ACL</text>
<rect x="170" y="40" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="240" y="68" text-anchor="middle" class="svg-ink" font-size="13">2. IKE SA</text><text x="240" y="88" text-anchor="middle" class="svg-muted" font-size="11">phase 1 up?</text>
<rect x="330" y="40" width="140" height="70" rx="8" fill="#bae6fd"/><text x="400" y="68" text-anchor="middle" class="svg-ink" font-size="13">3. IPsec SA</text><text x="400" y="88" text-anchor="middle" class="svg-muted" font-size="11">encaps / decaps</text>
<rect x="490" y="40" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="560" y="68" text-anchor="middle" class="svg-ink" font-size="13">4. Session</text><text x="560" y="88" text-anchor="middle" class="svg-muted" font-size="11">vpn-sessiondb</text>
<line x1="150" y1="75" x2="170" y2="75" stroke="#64748b"/><line x1="310" y1="75" x2="330" y2="75" stroke="#64748b"/><line x1="470" y1="75" x2="490" y2="75" stroke="#64748b"/>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Pehle fail hone wale check par ruko; fault usi layer mein hai.</text>
</svg><p class="cap">Config, phir phase 1, phir phase 2 counters, phir session summary.</p></div>

<h3>Check 2a: ASA par IKEv1 SA</h3>
<pre class="out">HQ-ASA# show crypto ikev1 sa

IKEv1 SAs:

   Active SA: 1
    Rekey SA: 0 (A tunnel will report 1 Active and 1 Rekey SA during rekey)
Total IKE SA: 1

1   IKE Peer: 198.51.100.20
    Type    : L2L             Role    : initiator
<span class="hl">    Rekey   : no              State   : MM_ACTIVE</span></pre>
<p>ASA par healthy IKEv1 phase 1 <b>MM_ACTIVE</b> dikhata hai (main mode complete). IOS wahi condition <b>QM_IDLE</b> ki tarah dikhata hai. <code>MM_WAIT_MSG2</code> jaise states ka matlab hai ASA ne apna proposal bheja aur reply ka wait kar raha hai: peer unreachable hai, UDP 500 blocked hai, ya peer ke paas matching configuration nahi hai.</p>

<h3>Check 2b: ASA par IKEv2 SA</h3>
<pre class="out">HQ-ASA# show crypto ikev2 sa

IKEv2 SAs:

Session-id:3, Status:UP-ACTIVE, IKE count:1, CHILD count:1

Tunnel-id Local                 Remote                Status         Role
<span class="hl"> 51843921 100.64.51.2/500       100.64.52.2/500       READY    INITIATOR</span>
      Encr: AES-CBC, keysize: 256, Hash: SHA256, DH Grp:14, Auth sign: PSK, Auth verify: PSK
      Life/Active Time: 86400/1840 sec
Child sa: local selector  10.30.0.0/0 - 10.30.0.255/65535
          remote selector 10.40.0.0/0 - 10.40.0.255/65535
          ESP spi in/out: 0x7c41a2f3/0x9e2b4c18</pre>
<p><b>READY</b> ka matlab IKE SA up hai. <b>Child sa</b> lines negotiated traffic selectors (address range aur port range) aur inbound aur outbound SPIs dikhati hain. Agar selectors woh networks nahi hain jo aap expect kar rahe the, to crypto ACLs waisi nahi hain jaisa aap soch rahe ho.</p>

<h3>Check 3: IPsec SA aur counters</h3>
<pre class="out">HQ-ASA# show crypto ipsec sa peer 100.64.52.2
peer address: 100.64.52.2
    Crypto map tag: OUTSIDE_MAP, seq num: 10, local addr: 100.64.51.2

      access-list VPN-BR extended permit ip 10.30.0.0 255.255.255.0 10.40.0.0 255.255.255.0
      local ident (addr/mask/prot/port): (10.30.0.0/255.255.255.0/0/0)
      remote ident (addr/mask/prot/port): (10.40.0.0/255.255.255.0/0/0)
      current_peer: 100.64.52.2

<span class="hl">      #pkts encaps: 1530, #pkts encrypt: 1530, #pkts digest: 1530</span>
<span class="hl">      #pkts decaps: 1522, #pkts decrypt: 1522, #pkts verify: 1522</span>
      #pkts compressed: 0, #pkts decompressed: 0
      #pre-frag successes: 0, #pre-frag failures: 0, #fragments created: 0
      #send errors: 0, #recv errors: 0

      local crypto endpt.: 100.64.51.2/500, remote crypto endpt.: 100.64.52.2/500
      path mtu 1500, ipsec overhead 74(44), media mtu 1500</pre>
<p>Counters ko do-tarfa baatcheet ki tarah padho:</p>
<table class="cmp"><tr><th>Pattern</th><th>Matlab</th><th>Kahan dekho</th></tr>
<tr><td>encaps aur decaps dono badh rahe</td><td>Healthy</td><td>Kuch nahi</td></tr>
<tr><td>encaps badh rahe, decaps 0</td><td>Hum bhejte hain, peer kabhi wapas nahi bhejta</td><td>Peer ki routing, NAT exemption, crypto ACL, ya hamari taraf ESP blocked</td></tr>
<tr><td>decaps badh rahe, encaps 0</td><td>Peer bhejta hai, hum kabhi jawab nahi dete</td><td>Hamari NAT exemption, hamari routing, host ka gateway</td></tr>
<tr><td>Koi IPsec SA nahi</td><td>Phase 2 kabhi bana hi nahi</td><td>Proposal, selectors, PFS</td></tr>
<tr><td>recv errors badh rahe</td><td>Packets integrity ya replay checks fail karte hain</td><td>Rekey ke baad key mismatch, packets badalne wala device, MTU</td></tr></table>
<p>Dhyaan do ki jis ping ka jawab kabhi nahi aata woh bhi sender par encaps badhata hai, isliye hamesha <b>dono</b> directions aur <b>dono</b> peers compare karo.</p>

<h3>Check 4: session summary</h3>
<pre class="out">HQ-ASA# show vpn-sessiondb l2l

Session Type: LAN-to-LAN

<span class="hl">Connection   : 100.64.52.2</span>
Index        : 7                      IP Addr      : 100.64.52.2
Protocol     : IKEv2 IPsec
Encryption   : IKEv2: (1)AES256  IPsec: (1)AES256
Hashing      : IKEv2: (1)SHA256  IPsec: (1)SHA256
Bytes Tx     : 128520                 Bytes Rx     : 127848
Login Time   : 09:12:44 UTC Fri Oct 2 2026
Duration     : 1h:03m:12s</pre>
<p><code>show vpn-sessiondb l2l</code> har site-to-site peer ko protocol, algorithms, har direction ke bytes aur uptime ke saath list karta hai. "Pune tunnel up hai?" ka jawab dene ke liye NOC engineer yahi pehla command chalata hai. Ek peer ke liye <code>detail</code> aur <code>filter ipaddress 100.64.52.2</code> jodo. Ek tunnel reset karne ke liye <code>vpn-sessiondb logoff ipaddress 100.64.52.2</code> use karo (ya <code>clear crypto ikev2 sa</code> dhyaan se: bina arguments ke yeh har tunnel clear kar deta hai).</p>

<h3>packet-tracer se path saabit karna</h3>
<pre class="out">HQ-ASA# packet-tracer input inside icmp 10.30.0.10 8 0 10.40.0.10
...
Phase: 4
Type: NAT
Subtype:
Result: ALLOW
Additional Information:
Static translate 10.30.0.10/0 to 10.30.0.10/0
...
Phase: 7
<span class="hl">Type: VPN</span>
<span class="hl">Subtype: encrypt</span>
Result: ALLOW
...
Result:
input-interface: inside
output-interface: outside
Action: allow</pre>
<p><b>VPN encrypt</b> phase saabit karta hai ki packet crypto map se match hua. NAT phase saabit karta hai ki identity rule match hua. Agar tunnel down hai, to pehli run IKE trigger hote waqt drop dikha sakti hai; ise doosri baar chalao.</p>

<h3>Router side ek nazar mein</h3>
<pre class="out">BR# show crypto session
Crypto session current status

Interface: GigabitEthernet0/0
<span class="hl">Session status: UP-ACTIVE</span>
Peer: 100.64.51.2 port 500
  IKEv2 SA: local 100.64.52.2/500 remote 100.64.51.2/500 Active
  IPSEC FLOW: permit ip 10.40.0.0/255.255.255.0 10.30.0.0/255.255.255.0
        Active SAs: 2, origin: crypto map</pre>
<p><b>Active SAs: 2</b> ek inbound aur ek outbound IPsec SA hai, jaisa expected hai.</p>

<div class="warn"><p><b>Common galti.</b> IKE SA up hone ki wajah se tunnel ko healthy declare karna. Phase 1 din bhar up reh sakta hai jabki phase 2 har baar fail ho. Hamesha IPsec SA aur uske counters dekho.</p></div>
<div class="exam"><p><b>Exam trap.</b> ASA IKEv1 ka healthy state <code>MM_ACTIVE</code> hai; IOS IKEv1 ka healthy state <code>QM_IDLE</code>; dono par IKEv2 <code>READY</code> dikhata hai. <code>show vpn-sessiondb l2l</code> sirf ASA par hai.</p></div>

<div class="scn"><h4>NOC ka do minute ka jawab</h4><p>Ek store manager ne 9:05 par phone kiya: "billing down hai". NOC engineer ne HQ ASA par <code>show vpn-sessiondb l2l</code> chalaya: store ka peer gayab tha. <code>show crypto ikev2 sa</code> mein bhi uski koi entry nahi thi, aur ASA se store ke public IP ka ping fail hua. Store ka ISP circuit down tha; ISP ne outage confirm kiya. Engineer do minute mein manager ko bata paaya ki VPN configuration theek hai aur ISP ticket number de diya.</p><p><b>Seekh:</b> fixed verification order ek vague complaint ko jaldi sahi owner tak pahuncha deta hai.</p></div>

<div class="iv"><p class="q">"show crypto ipsec sa mein encaps badh rahe hain aur decaps zero hain. Isse kya pata chalta hai?"</p><p>Strong answer: hamari side ka SA kaam kar raha hai aur encrypt kar raha hai; peer wapas kuch nahi bhej raha, ya woh hum tak nahi pahunch raha. Peer ke counters check karo: agar uske decaps badh rahe hain, to hamare packets pahunch rahe hain aur uska return traffic encrypt nahi ho raha (uski routing, NAT exemption ya crypto ACL). Agar uske decaps zero hain, to path mein ESP drop ho raha hai. Confirm karne ke liye packet-tracer aur captures chalane ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein verify karo: configuration, IKE SA, IPsec SA counters, session summary.</li>
<li>ASA IKEv1 = MM_ACTIVE, IOS IKEv1 = QM_IDLE, IKEv2 = READY.</li>
<li>Dono peers par encaps aur decaps dono badhne chahiye; ek-tarfa counters return path ki taraf ishaara karte hain.</li>
<li><code>show vpn-sessiondb l2l</code> ASA par peer, protocol, algorithms, bytes aur uptime deta hai.</li>
<li><code>packet-tracer</code> NAT exemption aur VPN encrypt phase dikhata hai.</li>
</ul></div>
`}};export{e as default};