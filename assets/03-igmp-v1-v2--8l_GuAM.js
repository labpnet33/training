var e={id:`igmp-v1-v2`,h:{en:`IGMPv1 and v2: joins, queries, leaves and the querier`,hi:`IGMPv1 aur v2: joins, queries, leaves aur querier`},body:{en:`
<p>Picture a hostel warden with a list of which rooms want the morning newspaper. Students drop a note when they want it. Every now and then the warden shouts down the corridor, "Does anyone still want the paper?" If nobody answers for a while, the delivery stops. The warden does not care <b>which</b> student reads it, only whether <b>anyone</b> on the floor does. That warden is a router running <b>IGMP</b>.</p>

<h3>What IGMP does, and where</h3>
<p><b>IGMP (Internet Group Management Protocol)</b> runs only between hosts and the routers on their own LAN. It is IP protocol 2, always sent with TTL 1, so it never leaves the subnet. The router learns one fact per interface: "at least one host here wants group G". It then uses PIM (chapters 7 and 8) to pull the stream from the rest of the network. Hosts never talk PIM and routers never forward IGMP.</p>

<h3>IGMPv1 (RFC 1112): the original</h3>
<ul>
<li>Two messages: <b>Membership Query</b> (router to 224.0.0.1, all hosts) and <b>Membership Report</b> (host to the group address itself).</li>
<li>A host that wants a group sends an <b>unsolicited report</b> at once; it does not wait for a query.</li>
<li><b>Report suppression</b>: when a query arrives, each host starts a random timer per group. If it hears another host report the same group first, it stays silent. One report per group per LAN is enough.</li>
<li><b>No leave message</b>. When the last receiver goes away, the router keeps forwarding until the membership times out (about three minutes). That is wasted bandwidth.</li>
<li><b>No querier election</b> in the protocol. The multicast routing protocol decides: on Cisco the PIM <b>DR</b> sends the queries.</li>
</ul>

<h3>IGMPv2 (RFC 2236): the default on IOS interfaces</h3>
<p>IGMPv2 keeps the v1 behaviour and fixes its weaknesses:</p>
<dl class="terms">
<dt>Leave Group</dt><dd>A host leaving sends a <b>Leave</b> to <b>224.0.0.2</b> (all routers). The router does not trust it blindly, because other hosts may still want the group.</dd>
<dt>Group-Specific Query</dt><dd>After a Leave, the querier sends a query to the group address itself, "anyone still want G?", by default 2 times, 1 second apart (last member query count and interval). If no report comes back, the group is removed. Leave latency drops from minutes to about 2 to 3 seconds.</dd>
<dt>Querier election</dt><dd>When several routers share a LAN, only one sends queries: the router with the <b>lowest IP address</b> on that subnet becomes the <b>querier</b>. If the others hear no query for the querier timeout (2 x query interval, 120 s on IOS), they elect a new one.</dd>
<dt>Max Response Time</dt><dd>A field in the query (10 s by default) telling hosts how long they may wait before reporting. It spreads reports out and tunes leave latency.</dd>
</dl>
<p>General queries go to 224.0.0.1 every <b>60 seconds</b> on IOS (the RFC default is 125 s). v2 reports still go to the group address, and report suppression still applies.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="IGMPv2 join and leave">
<rect x="20" y="20" width="110" height="40" rx="8" fill="#bae6fd"/><text x="75" y="45" text-anchor="middle" class="svg-ink" font-size="13">R3 querier</text>
<rect x="500" y="20" width="120" height="40" rx="8" fill="#fde68a"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="13">PC3 10.3.3.10</text>
<line x1="75" y1="60" x2="75" y2="240" stroke="#64748b" stroke-dasharray="4 4"/><line x1="560" y1="60" x2="560" y2="240" stroke="#64748b" stroke-dasharray="4 4"/>
<line x1="560" y1="85" x2="75" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="12">1. Report to 239.10.10.10 (join)</text>
<line x1="75" y1="120" x2="560" y2="120" stroke="#64748b" stroke-width="2"/><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">2. General Query to 224.0.0.1 every 60 s</text>
<line x1="560" y1="155" x2="75" y2="155" stroke="#64748b" stroke-width="2"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">3. Leave to 224.0.0.2</text>
<line x1="75" y1="190" x2="560" y2="190" stroke="#64748b" stroke-width="2"/><text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">4. Group-Specific Query to 239.10.10.10 (x2)</text>
<text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="12">5. No report: R3 removes the group and prunes upstream</text>
</svg><p class="cap">The IGMPv2 life cycle on the lab's classroom LAN behind R3.</p></div>

<h3>Enabling and tuning IGMP on IOS</h3>
<p>There is no "router igmp" command. IGMP starts automatically on an interface as soon as you enable PIM on it. The defaults are fine for most networks; these are the knobs you should recognise:</p>
<pre class="code">interface GigabitEthernet0/0
 ip pim sparse-mode                    <span class="c">! also turns on IGMP (v2 by default)</span>
 ip igmp version 2
 ip igmp query-interval 60
 ip igmp query-max-response-time 10
 ip igmp join-group 239.1.1.1          <span class="c">! router itself joins: it processes the packets, answers pings</span>
 ip igmp static-group 239.1.1.2        <span class="c">! forward the group out of here with no host report, not processed</span></pre>
<p><code>join-group</code> makes the router a real member, useful for testing because the router replies to a <code>ping 239.1.1.1</code>. <code>static-group</code> just forces the interface into the outgoing list, useful for a receiver that cannot send IGMP.</p>

<h3>Verification</h3>
<pre class="out">R3# show ip igmp interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 10.3.3.1/24
  IGMP is enabled on interface
<span class="hl">  Current IGMP host version is 2
  Current IGMP router version is 2</span>
  IGMP query interval is 60 seconds
  IGMP configured query interval is 60 seconds
  IGMP querier timeout is 120 seconds
  IGMP max query response time is 10 seconds
  Last member query count is 2
  Last member query response interval is 1000 ms
  Multicast routing is enabled on interface
  Multicast TTL threshold is 0
  Multicast designated router (DR) is 10.3.3.1 (this system)
<span class="hl">  IGMP querying router is 10.3.3.1 (this system)</span>

R3# show ip igmp groups
IGMP Connected Group Membership
Group Address    Interface                Uptime    Expires   Last Reporter   Group Accounted
<span class="hl">239.10.10.10     GigabitEthernet0/0       00:03:12  00:02:48  10.3.3.10</span></pre>
<p>Read the group table like this: the group, the interface where members live, how long it has existed, when it will expire unless another report arrives, and the <b>last</b> host that reported (not the only one). In our labs the classroom PCs join with the simulator command <code>join 239.10.10.10</code> and leave with <code>leave 239.10.10.10</code>.</p>

<div class="eg"><p><b>Worked example.</b> LAN 10.3.3.0/24 has two routers: R3 at 10.3.3.1 and R5 at 10.3.3.2. IGMP querier: R3 (lowest IP). PIM DR: R5 (highest IP, equal priority). This split is normal and often confuses people. If R3 fails, R5 stops hearing queries, waits the 120 s querier timeout, then starts querying itself.</p></div>

<div class="warn"><p><b>Common mistake.</b> Assuming the IGMP querier and the PIM DR are the same router. In IGMPv2 the querier is the <b>lowest</b> IP; the PIM DR is the <b>highest</b> priority, then highest IP. Only the DR sends PIM joins for the LAN's receivers.</p></div>

<div class="exam"><p><b>Exam trap.</b> v1 has no Leave and no querier election. v2 Leave goes to <b>224.0.0.2</b>, v2 reports go to the <b>group address</b>, and general queries go to <b>224.0.0.1</b>. Querier = lowest IP.</p></div>

<div class="scn"><h4>Slow channel changes</h4><p>A campus IPTV system took three minutes to stop an old channel after a user switched, so the access link briefly carried two HD channels and pixelated. <code>show ip igmp interface</code> showed "Current IGMP router version is 1": someone had set <code>ip igmp version 1</code> for an old set-top box years ago. With v1 there is no Leave, so the group waited for timeout. Moving to v2 cut the leave time to about two seconds.</p><p><b>Lesson:</b> leave latency depends on the IGMP version; v1 waits for timeouts.</p></div>

<div class="iv"><p class="q">"Explain what happens when the last host on a LAN leaves a group in IGMPv2."</p><p>Strong answer: the host sends a Leave to 224.0.0.2. The querier replies with group-specific queries to the group (last member query count 2, interval 1 s). If no host reports, the router removes the group from the interface, and if that interface was the last in the outgoing list it sends a PIM prune upstream. Mention that v1 had no Leave and relied on timeouts.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGMP runs only on the host LAN (protocol 2, TTL 1); routers learn "someone wants G", not who.</li>
<li>v1: query and report only, no Leave, querier chosen by PIM DR.</li>
<li>v2: adds Leave (to 224.0.0.2), group-specific query and querier election (lowest IP).</li>
<li>IOS defaults: v2, query interval 60 s, max response 10 s, querier timeout 120 s.</li>
<li>IGMP is enabled by <code>ip pim</code> on the interface; verify with <code>show ip igmp interface</code> and <code>show ip igmp groups</code>.</li>
</ul></div>
`,hi:`
<p>Hostel ke warden ko socho jiske paas list hai ki kaunse rooms ko subah ka akhbaar chahiye. Students chahiye to ek note daal dete hain. Beech beech mein warden corridor mein chillata hai, "Kya ab bhi kisi ko akhbaar chahiye?" Agar kuch der tak koi jawab na de, delivery band. Warden ko parwah nahi ki <b>kaunsa</b> student padhta hai, bas yeh ki floor par <b>koi</b> padhta hai ya nahi. Woh warden ek router hai jo <b>IGMP</b> chala raha hai.</p>

<h3>IGMP kya karta hai, aur kahan</h3>
<p><b>IGMP (Internet Group Management Protocol)</b> sirf hosts aur unke apne LAN ke routers ke beech chalta hai. Yeh IP protocol 2 hai, hamesha TTL 1 ke saath bheja jaata hai, isliye kabhi subnet se bahar nahi jaata. Router har interface ke liye ek fact seekhta hai: "yahan kam se kam ek host ko group G chahiye". Phir woh PIM (chapter 7 aur 8) use karke baaki network se stream kheenchta hai. Hosts kabhi PIM nahi bolte aur routers kabhi IGMP forward nahi karte.</p>

<h3>IGMPv1 (RFC 1112): original</h3>
<ul>
<li>Do messages: <b>Membership Query</b> (router se 224.0.0.1, all hosts ko) aur <b>Membership Report</b> (host se khud group address par).</li>
<li>Jis host ko group chahiye woh turant <b>unsolicited report</b> bhejta hai; query ka wait nahi karta.</li>
<li><b>Report suppression</b>: query aane par har host har group ke liye random timer shuru karta hai. Agar woh pehle kisi aur host ko same group report karte sun le, to chup rehta hai. Har LAN par har group ki ek report kaafi hai.</li>
<li><b>Koi leave message nahi</b>. Aakhri receiver chala jaaye to bhi router tab tak forward karta rehta hai jab tak membership time out na ho (lagbhag teen minute). Yeh bandwidth ki barbaadi hai.</li>
<li>Protocol mein <b>querier election nahi</b>. Multicast routing protocol decide karta hai: Cisco par PIM <b>DR</b> queries bhejta hai.</li>
</ul>

<h3>IGMPv2 (RFC 2236): IOS interfaces par default</h3>
<p>IGMPv2 v1 ka behaviour rakhta hai aur uski kamzoriyan theek karta hai:</p>
<dl class="terms">
<dt>Leave Group</dt><dd>Jaane wala host <b>224.0.0.2</b> (all routers) par <b>Leave</b> bhejta hai. Router aankh band karke bharosa nahi karta, kyunki doosre hosts ko ab bhi group chahiye ho sakta hai.</dd>
<dt>Group-Specific Query</dt><dd>Leave ke baad querier khud group address par query bhejta hai, "kya ab bhi kisi ko G chahiye?", default mein 2 baar, 1 second ke gap par (last member query count aur interval). Koi report wapas na aaye to group hata diya jaata hai. Leave latency minutes se ghat kar lagbhag 2 se 3 seconds ho jaati hai.</dd>
<dt>Querier election</dt><dd>Jab kai routers ek LAN share karte hain, sirf ek queries bhejta hai: us subnet par <b>sabse chhote IP address</b> wala router <b>querier</b> banta hai. Agar baaki querier timeout (2 x query interval, IOS par 120 s) tak koi query na sunein, to naya querier elect karte hain.</dd>
<dt>Max Response Time</dt><dd>Query ka ek field (default 10 s) jo hosts ko batata hai ki report karne se pehle kitna wait kar sakte hain. Isse reports phail jaati hain aur leave latency tune hoti hai.</dd>
</dl>
<p>IOS par general queries har <b>60 seconds</b> 224.0.0.1 par jaati hain (RFC default 125 s hai). v2 reports ab bhi group address par jaati hain, aur report suppression ab bhi lagta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="IGMPv2 join and leave">
<rect x="20" y="20" width="110" height="40" rx="8" fill="#bae6fd"/><text x="75" y="45" text-anchor="middle" class="svg-ink" font-size="13">R3 querier</text>
<rect x="500" y="20" width="120" height="40" rx="8" fill="#fde68a"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="13">PC3 10.3.3.10</text>
<line x1="75" y1="60" x2="75" y2="240" stroke="#64748b" stroke-dasharray="4 4"/><line x1="560" y1="60" x2="560" y2="240" stroke="#64748b" stroke-dasharray="4 4"/>
<line x1="560" y1="85" x2="75" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="12">1. 239.10.10.10 par Report (join)</text>
<line x1="75" y1="120" x2="560" y2="120" stroke="#64748b" stroke-width="2"/><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">2. Har 60 s 224.0.0.1 par General Query</text>
<line x1="560" y1="155" x2="75" y2="155" stroke="#64748b" stroke-width="2"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">3. 224.0.0.2 par Leave</text>
<line x1="75" y1="190" x2="560" y2="190" stroke="#64748b" stroke-width="2"/><text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">4. 239.10.10.10 par Group-Specific Query (x2)</text>
<text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="12">5. Koi report nahi: R3 group hatata hai aur upstream prune karta hai</text>
</svg><p class="cap">Lab ke R3 ke peeche wale classroom LAN par IGMPv2 ka life cycle.</p></div>

<h3>IOS par IGMP enable aur tune karna</h3>
<p>"router igmp" jaisa koi command nahi hai. Interface par PIM enable karte hi IGMP apne aap shuru ho jaata hai. Zyada tar networks ke liye defaults theek hain; yeh knobs aapko pehchanne chahiye:</p>
<pre class="code">interface GigabitEthernet0/0
 ip pim sparse-mode                    <span class="c">! IGMP bhi on karta hai (default v2)</span>
 ip igmp version 2
 ip igmp query-interval 60
 ip igmp query-max-response-time 10
 ip igmp join-group 239.1.1.1          <span class="c">! router khud join karta hai: packets process karta hai, pings ka jawab deta hai</span>
 ip igmp static-group 239.1.1.2        <span class="c">! bina host report ke group yahan se forward karo, process nahi hota</span></pre>
<p><code>join-group</code> router ko asli member banata hai, testing ke liye useful kyunki router <code>ping 239.1.1.1</code> ka reply deta hai. <code>static-group</code> bas interface ko outgoing list mein zabardasti daalta hai, us receiver ke liye useful jo IGMP nahi bhej sakta.</p>

<h3>Verification</h3>
<pre class="out">R3# show ip igmp interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 10.3.3.1/24
  IGMP is enabled on interface
<span class="hl">  Current IGMP host version is 2
  Current IGMP router version is 2</span>
  IGMP query interval is 60 seconds
  IGMP configured query interval is 60 seconds
  IGMP querier timeout is 120 seconds
  IGMP max query response time is 10 seconds
  Last member query count is 2
  Last member query response interval is 1000 ms
  Multicast routing is enabled on interface
  Multicast TTL threshold is 0
  Multicast designated router (DR) is 10.3.3.1 (this system)
<span class="hl">  IGMP querying router is 10.3.3.1 (this system)</span>

R3# show ip igmp groups
IGMP Connected Group Membership
Group Address    Interface                Uptime    Expires   Last Reporter   Group Accounted
<span class="hl">239.10.10.10     GigabitEthernet0/0       00:03:12  00:02:48  10.3.3.10</span></pre>
<p>Group table aise padho: group, woh interface jahan members rehte hain, kitni der se exist karta hai, kab expire hoga agar doosri report na aaye, aur <b>aakhri</b> host jisne report kiya (akela nahi). Hamari labs mein classroom PCs simulator command <code>join 239.10.10.10</code> se join karte hain aur <code>leave 239.10.10.10</code> se chhodte hain.</p>

<div class="eg"><p><b>Worked example.</b> LAN 10.3.3.0/24 par do routers hain: R3 10.3.3.1 par aur R5 10.3.3.2 par. IGMP querier: R3 (sabse chhota IP). PIM DR: R5 (sabse bada IP, priority barabar). Yeh split normal hai aur aksar logon ko confuse karta hai. Agar R3 fail ho, R5 ko queries sunaayi dena band hota hai, woh 120 s querier timeout ka wait karta hai, phir khud query karna shuru karta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Maan lena ki IGMP querier aur PIM DR same router hain. IGMPv2 mein querier <b>sabse chhota</b> IP hai; PIM DR <b>sabse zyada</b> priority, phir sabse bada IP. Sirf DR LAN ke receivers ke liye PIM joins bhejta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> v1 mein na Leave hai na querier election. v2 Leave <b>224.0.0.2</b> par jaata hai, v2 reports <b>group address</b> par, aur general queries <b>224.0.0.1</b> par. Querier = sabse chhota IP.</p></div>

<div class="scn"><h4>Dheeme channel changes</h4><p>Ek campus IPTV system user ke channel badalne ke baad purana channel band karne mein teen minute leta tha, isliye access link par kuch der do HD channels chalte aur picture toot-ti. <code>show ip igmp interface</code> ne dikhaya "Current IGMP router version is 1": kisi ne saalon pehle ek purane set-top box ke liye <code>ip igmp version 1</code> set kiya tha. v1 mein Leave nahi hota, isliye group timeout ka wait karta tha. v2 par jaane se leave time lagbhag do second ho gaya.</p><p><b>Seekh:</b> leave latency IGMP version par depend karti hai; v1 timeouts ka wait karta hai.</p></div>

<div class="iv"><p class="q">"IGMPv2 mein jab LAN ka aakhri host group chhodta hai to kya hota hai, samjhao."</p><p>Strong answer: host 224.0.0.2 par Leave bhejta hai. Querier group par group-specific queries se jawab deta hai (last member query count 2, interval 1 s). Koi host report na kare to router interface se group hata deta hai, aur agar woh interface outgoing list ka aakhri tha to upstream PIM prune bhejta hai. Batao ki v1 mein Leave nahi tha aur woh timeouts par nirbhar tha.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGMP sirf host LAN par chalta hai (protocol 2, TTL 1); routers seekhte hain "kisi ko G chahiye", kaun yeh nahi.</li>
<li>v1: sirf query aur report, koi Leave nahi, querier PIM DR chunta hai.</li>
<li>v2: Leave (224.0.0.2 par), group-specific query aur querier election (sabse chhota IP) jodta hai.</li>
<li>IOS defaults: v2, query interval 60 s, max response 10 s, querier timeout 120 s.</li>
<li>IGMP interface par <code>ip pim</code> se enable hota hai; <code>show ip igmp interface</code> aur <code>show ip igmp groups</code> se verify karo.</li>
</ul></div>
`}};export{e as default};