var e={id:`router-config`,h:{en:`Router configuration and verification: ip pim, versions, join-group and static-group`,hi:`Router configuration aur verification: ip pim, versions, join-group aur static-group`},body:{en:`
<p>This chapter is the hands-on core of the module. You will switch IGMP on, choose its version, create memberships by hand, and read the three show commands that tell you everything. Every command here runs in the lab <b>Lab · IGMP versions, join-group and static-group</b>, with the same names and addresses.</p>

<h3>The lab network</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab topology">
<rect x="20" y="95" width="90" height="46" rx="8" fill="#fde68a"/><text x="65" y="115" text-anchor="middle" class="svg-ink" font-size="13">SRC</text><text x="65" y="131" text-anchor="middle" class="svg-muted" font-size="11">10.20.2.10</text>
<rect x="190" y="85" width="120" height="66" rx="8" fill="#ddd6fe"/><text x="250" y="110" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="250" y="128" text-anchor="middle" class="svg-muted" font-size="11">RP: Lo0 1.1.1.1</text>
<rect x="390" y="95" width="80" height="46" rx="8" fill="#bae6fd"/><text x="430" y="123" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="540" y="30" width="90" height="46" rx="8" fill="#bbf7d0"/><text x="585" y="50" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="585" y="66" text-anchor="middle" class="svg-muted" font-size="11">10.20.1.11</text>
<rect x="540" y="150" width="90" height="46" rx="8" fill="#bbf7d0"/><text x="585" y="170" text-anchor="middle" class="svg-ink" font-size="13">PC2</text><text x="585" y="186" text-anchor="middle" class="svg-muted" font-size="11">10.20.1.12</text>
<line x1="110" y1="118" x2="190" y2="118" stroke="#64748b" stroke-width="2"/><text x="150" y="108" text-anchor="middle" class="svg-accent" font-size="11">g0/1 .1</text>
<line x1="310" y1="118" x2="390" y2="118" stroke="#64748b" stroke-width="2"/><text x="350" y="108" text-anchor="middle" class="svg-accent" font-size="11">g0/0 .1</text>
<line x1="470" y1="105" x2="540" y2="58" stroke="#64748b" stroke-width="2"/><line x1="470" y1="132" x2="540" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="150" y="150" text-anchor="middle" class="svg-muted" font-size="11">10.20.2.0/24</text><text x="350" y="150" text-anchor="middle" class="svg-muted" font-size="11">10.20.1.0/24 hostel LAN</text>
</svg><p class="cap">R1 is the only router. Studio on g0/1, hostel LAN with two student PCs on g0/0.</p></div>

<h3>Step 1: enable multicast routing and PIM</h3>
<p>Two things must exist before IGMP works. Multicast routing must be on globally, and each interface that faces receivers must have a PIM mode. On IOS XE, <b>IGMP starts on an interface as soon as PIM is configured there</b>. That is why a hostel LAN interface needs <code>ip pim sparse-mode</code> even though no other router lives on it.</p>
<pre class="code">R1(config)# ip multicast-routing
R1(config)# ip pim rp-address 1.1.1.1
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip pim sparse-mode</pre>
<p>Before PIM is configured, the interface reports it plainly:</p>
<pre class="out">R1#show ip igmp interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 10.20.1.1/24
  <span class="hl">IGMP is disabled on interface</span></pre>
<p>After PIM is on, the same command prints version 2, the query timers and the querying router (R1 itself, because it is alone on the LAN):</p>
<pre class="out">R1#show ip igmp interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 10.20.1.1/24
  IGMP is enabled on interface
  <span class="hl">Current IGMP host version is 2</span>
  Current IGMP router version is 2
  IGMP querier timeout is 120 seconds
  Multicast routing is enabled on interface
  Multicast designated router (DR) is 10.20.1.1 (this system)
  IGMP querying router is 10.20.1.1 (this system)
  No multicast groups joined by this system</pre>

<h3>Step 2: let receivers join, and read the membership</h3>
<pre class="out">PC1&gt; join 239.20.1.1
Joined 239.20.1.1 on eth0
PC2&gt; join 239.20.1.1
Joined 239.20.1.1 on eth0

R1#show ip igmp groups
IGMP Connected Group Membership
Group Address    Interface                Uptime    Expires   Last Reporter   Group Accounted
239.20.1.1       GigabitEthernet0/0       00:00:24  00:02:36  <span class="hl">10.20.1.12</span>

R1#show ip mroute 239.20.1.1
(*, 239.20.1.1), 00:00:24/00:02:36, RP 1.1.1.1, flags: SC
  Incoming interface: Null, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:24/00:02:36</pre>
<p>Two joined hosts, one line, one reporter: that is report suppression from chapter 3. The (*,G) entry has flag <b>C</b> (a directly connected member) and the hostel interface is in the outgoing interface list (OIL). Incoming interface is Null because R1 itself is the RP.</p>

<h3>Step 3: set the IGMP version</h3>
<p>The default is <code>ip igmp version 2</code>. Change it per interface:</p>
<pre class="code">interface GigabitEthernet0/0
 ip igmp version 3        <span class="c">! or 1, or back to 2 with: no ip igmp version</span></pre>
<p>All routers on one LAN should use the same version. The running configuration shows the line only when it differs from 2.</p>

<h3>join-group versus static-group</h3>
<p>Both commands put a group on an interface without a real receiver. They behave very differently.</p>
<table class="cmp"><tr><th></th><th><code>ip igmp join-group G</code></th><th><code>ip igmp static-group G</code></th></tr>
<tr><td>What the router becomes</td><td>A real member: it acts like a host and consumes the group</td><td>Nothing: it only keeps the interface in the OIL</td></tr>
<tr><td>Traffic is delivered to</td><td>The router CPU (and out of the interface)</td><td>Out of the interface only</td></tr>
<tr><td>Answers a ping to G</td><td>Yes</td><td>No</td></tr>
<tr><td>CPU cost</td><td>Process-switched, can be high for a fast stream</td><td>Low: forwarded in the normal path</td></tr>
<tr><td>Typical use</td><td>A quick test that the tree reaches this interface (multicast ping)</td><td>Receivers that cannot send IGMP, or a deliberate permanent delivery</td></tr>
<tr><td>With a source</td><td>No source form</td><td><code>ip igmp static-group G source S</code> (SSM)</td></tr>
</table>
<pre class="code">interface GigabitEthernet0/0
 ip igmp join-group 239.20.1.9
 ip igmp static-group 239.20.1.50</pre>
<pre class="out">R1#show ip igmp groups
IGMP Connected Group Membership
Group Address    Interface                Uptime    Expires   Last Reporter   Group Accounted
232.20.1.1       GigabitEthernet0/0       00:00:36  00:02:24  10.20.1.12
239.20.1.1       GigabitEthernet0/0       00:01:24  00:02:36  10.20.1.12
239.20.1.9       GigabitEthernet0/0       00:00:12  00:02:48  <span class="hl">10.20.1.1</span>
239.20.1.50      GigabitEthernet0/0       00:00:12  <span class="hl">stopped</span>   10.20.1.1

R1#show ip igmp interface GigabitEthernet0/0
...
  Multicast groups joined by this system (number of users):
      239.20.1.9(1)</pre>
<p>Read the clues. The static group never expires (<b>stopped</b> in the Expires column) and its reporter is the router's own address. The join-group appears in the "joined by this system" list; the static group does not, because the router is not a member of it.</p>
<p>Real platforms also let you control IGMP with <code>ip igmp access-group</code> (which groups a LAN may join), <code>ip igmp limit</code> (how many groups per interface) and <code>ip igmp immediate-leave group-list</code> (skip the last-member query when only one host sits behind the interface). These are important in production; the lab simulator does not model them.</p>

<h3>The read-order for verification</h3>
<ol>
<li><code>show ip igmp interface</code>: enabled? version? who is the querier?</li>
<li><code>show ip igmp groups</code>: is the group listed on the right interface?</li>
<li><code>show ip mroute G</code>: is there a (*,G) or (S,G) with this interface in the OIL?</li>
<li>On the host: <code>show mcast</code> (lab PCs) to see packets received.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>ip pim</code> on a host-only LAN interface (IGMP stays disabled). Using join-group on a busy interface "to test" and leaving it there (CPU load, and it hides real receiver faults). Using static-group to "fix" a missing group and never finding the real cause.</p></div>
<div class="exam"><p><b>Exam trap.</b> join-group makes the router a receiver and answers pings; static-group does not. Both appear in <code>show ip igmp groups</code>. Static entries never expire. The IGMP default version is 2 on IOS XE. IGMP needs a PIM mode on the interface in this platform.</p></div>

<div class="scn"><h4>The test that became permanent</h4><p>An engineer added <code>ip igmp join-group 239.40.1.1</code> on a branch router to check a stream, then went home. For two weeks the branch WAN carried the stream constantly, although nobody watched, and the router CPU stayed at 70 percent because the group was process-switched. A review of <code>show ip igmp interface</code> listed "Multicast groups joined by this system" and exposed the leftover line.</p><p><b>Lesson:</b> test with join-group, then remove it. Prefer static-group only when you really want permanent delivery.</p></div>

<div class="iv"><p class="q">"What is the difference between ip igmp join-group and ip igmp static-group?"</p><p>Strong answer: join-group makes the router itself a member: it receives and processes the traffic (CPU) and answers a multicast ping, so it is a good test. static-group only adds the interface to the outgoing list so traffic is forwarded out of it without the router being a member, with low CPU cost; it never expires and can hide a real receiver fault. Mention the SSM form <code>static-group G source S</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGMP is enabled by PIM on the interface; no PIM means "IGMP is disabled on interface".</li>
<li>Default version is 2; <code>ip igmp version 3</code> is needed for source filters.</li>
<li>Verify in order: igmp interface, igmp groups, mroute, host show mcast.</li>
<li>join-group = router acts as a receiver (CPU, answers ping); static-group = forward only, never expires.</li>
<li>Remove test join-groups; they hide faults and load the CPU.</li>
</ul></div>
`,hi:`
<p>Yeh chapter module ka hands-on core hai. Aap IGMP on karoge, uska version chunoge, hath se memberships banaoge, aur woh teen show commands padhoge jo sab kuch bata dete hain. Yahan ka har command lab <b>Lab · IGMP versions, join-group aur static-group</b> mein chalta hai, wahi names aur addresses ke saath.</p>

<h3>Lab network</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab topology">
<rect x="20" y="95" width="90" height="46" rx="8" fill="#fde68a"/><text x="65" y="115" text-anchor="middle" class="svg-ink" font-size="13">SRC</text><text x="65" y="131" text-anchor="middle" class="svg-muted" font-size="11">10.20.2.10</text>
<rect x="190" y="85" width="120" height="66" rx="8" fill="#ddd6fe"/><text x="250" y="110" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="250" y="128" text-anchor="middle" class="svg-muted" font-size="11">RP: Lo0 1.1.1.1</text>
<rect x="390" y="95" width="80" height="46" rx="8" fill="#bae6fd"/><text x="430" y="123" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="540" y="30" width="90" height="46" rx="8" fill="#bbf7d0"/><text x="585" y="50" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="585" y="66" text-anchor="middle" class="svg-muted" font-size="11">10.20.1.11</text>
<rect x="540" y="150" width="90" height="46" rx="8" fill="#bbf7d0"/><text x="585" y="170" text-anchor="middle" class="svg-ink" font-size="13">PC2</text><text x="585" y="186" text-anchor="middle" class="svg-muted" font-size="11">10.20.1.12</text>
<line x1="110" y1="118" x2="190" y2="118" stroke="#64748b" stroke-width="2"/><text x="150" y="108" text-anchor="middle" class="svg-accent" font-size="11">g0/1 .1</text>
<line x1="310" y1="118" x2="390" y2="118" stroke="#64748b" stroke-width="2"/><text x="350" y="108" text-anchor="middle" class="svg-accent" font-size="11">g0/0 .1</text>
<line x1="470" y1="105" x2="540" y2="58" stroke="#64748b" stroke-width="2"/><line x1="470" y1="132" x2="540" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="150" y="150" text-anchor="middle" class="svg-muted" font-size="11">10.20.2.0/24</text><text x="350" y="150" text-anchor="middle" class="svg-muted" font-size="11">10.20.1.0/24 hostel LAN</text>
</svg><p class="cap">R1 akela router hai. g0/1 par studio, g0/0 par do student PCs wali hostel LAN.</p></div>

<h3>Step 1: multicast routing aur PIM on karo</h3>
<p>IGMP ke kaam karne se pehle do cheezein chahiye. Multicast routing global level par on ho, aur receivers ki taraf dekhne wale har interface par PIM mode ho. IOS XE par <b>interface par PIM configure hote hi IGMP shuru ho jaata hai</b>. Isiliye hostel LAN interface ko <code>ip pim sparse-mode</code> chahiye, bhale hi wahan koi doosra router na ho.</p>
<pre class="code">R1(config)# ip multicast-routing
R1(config)# ip pim rp-address 1.1.1.1
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip pim sparse-mode</pre>
<p>PIM configure hone se pehle interface seedha bata deta hai:</p>
<pre class="out">R1#show ip igmp interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 10.20.1.1/24
  <span class="hl">IGMP is disabled on interface</span></pre>
<p>PIM on hone ke baad wahi command version 2, query timers aur querying router dikhata hai (R1 khud, kyunki woh LAN par akela hai):</p>
<pre class="out">R1#show ip igmp interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 10.20.1.1/24
  IGMP is enabled on interface
  <span class="hl">Current IGMP host version is 2</span>
  Current IGMP router version is 2
  IGMP querier timeout is 120 seconds
  Multicast routing is enabled on interface
  Multicast designated router (DR) is 10.20.1.1 (this system)
  IGMP querying router is 10.20.1.1 (this system)
  No multicast groups joined by this system</pre>

<h3>Step 2: receivers join karein, aur membership padho</h3>
<pre class="out">PC1&gt; join 239.20.1.1
Joined 239.20.1.1 on eth0
PC2&gt; join 239.20.1.1
Joined 239.20.1.1 on eth0

R1#show ip igmp groups
IGMP Connected Group Membership
Group Address    Interface                Uptime    Expires   Last Reporter   Group Accounted
239.20.1.1       GigabitEthernet0/0       00:00:24  00:02:36  <span class="hl">10.20.1.12</span>

R1#show ip mroute 239.20.1.1
(*, 239.20.1.1), 00:00:24/00:02:36, RP 1.1.1.1, flags: SC
  Incoming interface: Null, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:24/00:02:36</pre>
<p>Do joined hosts, ek line, ek reporter: yeh chapter 3 ka report suppression hai. (*,G) entry par flag <b>C</b> hai (directly connected member) aur hostel interface outgoing interface list (OIL) mein hai. Incoming interface Null hai kyunki R1 khud RP hai.</p>

<h3>Step 3: IGMP version set karo</h3>
<p>Default <code>ip igmp version 2</code> hai. Per interface badlo:</p>
<pre class="code">interface GigabitEthernet0/0
 ip igmp version 3        <span class="c">! ya 1, ya wapas 2: no ip igmp version</span></pre>
<p>Ek LAN ke saare routers ko same version use karna chahiye. Running configuration mein yeh line tabhi dikhti hai jab version 2 se alag ho.</p>

<h3>join-group vs static-group</h3>
<p>Dono commands bina asli receiver ke interface par group daal dete hain. Dono ka behaviour bahut alag hai.</p>
<table class="cmp"><tr><th></th><th><code>ip igmp join-group G</code></th><th><code>ip igmp static-group G</code></th></tr>
<tr><td>Router kya banta hai</td><td>Asli member: host ki tarah behave karta hai aur group consume karta hai</td><td>Kuch nahi: sirf interface ko OIL mein rakhta hai</td></tr>
<tr><td>Traffic kahan deliver hota hai</td><td>Router CPU ko (aur interface se bahar)</td><td>Sirf interface se bahar</td></tr>
<tr><td>G ke ping ka jawab</td><td>Haan</td><td>Nahi</td></tr>
<tr><td>CPU cost</td><td>Process-switched, tez stream ke liye zyada ho sakta hai</td><td>Kam: normal path mein forward</td></tr>
<tr><td>Typical use</td><td>Jaldi test ki tree is interface tak pahunchta hai ya nahi (multicast ping)</td><td>Aise receivers jo IGMP nahi bhej sakte, ya jaan-boojhkar permanent delivery</td></tr>
<tr><td>Source ke saath</td><td>Source wala form nahi</td><td><code>ip igmp static-group G source S</code> (SSM)</td></tr>
</table>
<pre class="code">interface GigabitEthernet0/0
 ip igmp join-group 239.20.1.9
 ip igmp static-group 239.20.1.50</pre>
<pre class="out">R1#show ip igmp groups
IGMP Connected Group Membership
Group Address    Interface                Uptime    Expires   Last Reporter   Group Accounted
232.20.1.1       GigabitEthernet0/0       00:00:36  00:02:24  10.20.1.12
239.20.1.1       GigabitEthernet0/0       00:01:24  00:02:36  10.20.1.12
239.20.1.9       GigabitEthernet0/0       00:00:12  00:02:48  <span class="hl">10.20.1.1</span>
239.20.1.50      GigabitEthernet0/0       00:00:12  <span class="hl">stopped</span>   10.20.1.1

R1#show ip igmp interface GigabitEthernet0/0
...
  Multicast groups joined by this system (number of users):
      239.20.1.9(1)</pre>
<p>Clues padho. Static group kabhi expire nahi hota (Expires column mein <b>stopped</b>) aur uska reporter router ka apna address hai. Join-group "joined by this system" list mein aata hai; static group nahi aata, kyunki router us ka member nahi hai.</p>
<p>Real platforms par IGMP ko <code>ip igmp access-group</code> (LAN kin groups ko join kar sakti hai), <code>ip igmp limit</code> (per interface kitne groups) aur <code>ip igmp immediate-leave group-list</code> (interface ke peeche ek hi host ho to last-member query skip karna) se bhi control kar sakte hain. Production mein yeh important hain; lab simulator inhe model nahi karta.</p>

<h3>Verification ka padhne ka order</h3>
<ol>
<li><code>show ip igmp interface</code>: enabled? version? querier kaun hai?</li>
<li><code>show ip igmp groups</code>: kya group sahi interface par listed hai?</li>
<li><code>show ip mroute G</code>: kya (*,G) ya (S,G) hai jiske OIL mein yeh interface hai?</li>
<li>Host par: <code>show mcast</code> (lab PCs) se received packets dekho.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Host-only LAN interface par <code>ip pim</code> bhool jaana (IGMP disabled rehta hai). Busy interface par "test ke liye" join-group lagakar wahin chhod dena (CPU load, aur asli receiver faults chhup jaate hain). Missing group "theek karne" ke liye static-group lagana aur asli wajah kabhi na dhoondhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> join-group router ko receiver banata hai aur ping ka jawab deta hai; static-group nahi. Dono <code>show ip igmp groups</code> mein dikhte hain. Static entries kabhi expire nahi hoti. IOS XE par IGMP ka default version 2 hai. Is platform mein IGMP ko interface par PIM mode chahiye.</p></div>

<div class="scn"><h4>Test jo permanent ban gaya</h4><p>Ek engineer ne branch router par stream check karne ke liye <code>ip igmp join-group 239.40.1.1</code> lagaya aur ghar chala gaya. Do hafte tak branch WAN par stream lagatar chalti rahi, jabki koi dekh nahi raha tha, aur router CPU 70 percent par raha kyunki group process-switched tha. <code>show ip igmp interface</code> ka review "Multicast groups joined by this system" dikhata tha aur bachi hui line pakdi gayi.</p><p><b>Lesson:</b> join-group se test karo, phir hata do. static-group tabhi use karo jab sach mein permanent delivery chahiye.</p></div>

<div class="iv"><p class="q">"ip igmp join-group aur ip igmp static-group mein kya farak hai?"</p><p>Strong answer: join-group router ko khud member banata hai: woh traffic receive aur process karta hai (CPU) aur multicast ping ka jawab deta hai, isliye achha test hai. static-group sirf interface ko outgoing list mein jodta hai, taaki traffic router ke member bane bina bahar forward ho, kam CPU cost ke saath; yeh kabhi expire nahi hota aur asli receiver fault ko chhupa sakta hai. SSM form <code>static-group G source S</code> bhi batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGMP interface par PIM se on hota hai; PIM nahi to "IGMP is disabled on interface".</li>
<li>Default version 2 hai; source filters ke liye <code>ip igmp version 3</code> chahiye.</li>
<li>Order mein verify karo: igmp interface, igmp groups, mroute, host show mcast.</li>
<li>join-group = router receiver ki tarah (CPU, ping ka jawab); static-group = sirf forward, kabhi expire nahi.</li>
<li>Test wale join-groups hata do; woh faults chhupate hain aur CPU load karte hain.</li>
</ul></div>
`}};export{e as default};