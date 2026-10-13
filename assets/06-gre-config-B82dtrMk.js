var e={id:`gre-config`,h:{en:`Building a GRE tunnel: config, states, keepalives and MTU`,hi:`GRE tunnel banana: config, states, keepalives aur MTU`},body:{en:`
<p>A tunnel interface is like a phone extension that only works when the building's main line is working. You can install the extension (create Tunnel0), give it a number (an IP address) and tell it which office to ring (the destination). But if the main line is dead or the far office number is unknown, the extension shows "no service". Understanding when a tunnel shows up/up, up/down or flaps is half of GRE troubleshooting. This chapter walks through the GRE lab step by step.</p>

<h3>Lab topology</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="GRE lab addressing">
<rect x="20" y="80" width="110" height="46" rx="8" fill="#fde68a"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="117" text-anchor="middle" class="svg-muted" font-size="12">10.1.10.10</text>
<rect x="160" y="80" width="100" height="46" rx="8" fill="#bae6fd"/><text x="210" y="100" text-anchor="middle" class="svg-ink" font-size="13">BR1</text><text x="210" y="117" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 .11.2</text>
<rect x="270" y="20" width="100" height="46" rx="8" fill="#e2e8f0"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<rect x="380" y="80" width="100" height="46" rx="8" fill="#bae6fd"/><text x="430" y="100" text-anchor="middle" class="svg-ink" font-size="13">BR2</text><text x="430" y="117" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 .22.2</text>
<rect x="510" y="80" width="110" height="46" rx="8" fill="#fde68a"/><text x="565" y="100" text-anchor="middle" class="svg-ink" font-size="13">PC2</text><text x="565" y="117" text-anchor="middle" class="svg-muted" font-size="12">10.2.20.10</text>
<line x1="130" y1="103" x2="160" y2="103" stroke="#64748b" stroke-width="2"/><line x1="480" y1="103" x2="510" y2="103" stroke="#64748b" stroke-width="2"/>
<line x1="240" y1="80" x2="290" y2="66" stroke="#64748b" stroke-width="2"/><line x1="350" y1="66" x2="400" y2="80" stroke="#64748b" stroke-width="2"/>
<path d="M210 126 Q320 190 430 126" fill="none" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="13">Tunnel0: .1 ---- 172.16.12.0/30 ---- .2</text>
</svg><p class="cap">BR1 and BR2 have a default route to the ISP; the LANs are unknown to the ISP.</p></div>

<h3>Step 1 and 2: the tunnel interfaces</h3>
<pre class="code"><span class="c">! BR1</span>
interface Tunnel0
 ip address 172.16.12.1 255.255.255.252
 tunnel source GigabitEthernet0/0      <span class="c">! my public side (100.64.11.2)</span>
 tunnel destination 100.64.22.2        <span class="c">! BR2 public address</span>
<span class="c">! BR2: the mirror image</span>
interface Tunnel0
 ip address 172.16.12.2 255.255.255.252
 tunnel source GigabitEthernet0/0
 tunnel destination 100.64.11.2</pre>
<p>The <b>tunnel source</b> can be an interface name or an IP address; it must be the address the far end uses as its destination. The default <code>tunnel mode gre ip</code> does not need to be typed. Once both sides are configured, <code>ping 172.16.12.2</code> from BR1 succeeds.</p>

<h3>Tunnel interface states</h3>
<table class="cmp"><tr><th>State</th><th>Meaning</th></tr>
<tr><td>administratively down/down</td><td><code>shutdown</code> on Tunnel0</td></tr>
<tr><td>up/down</td><td>Source interface down or without an IP, no destination configured, <b>no route to the destination</b>, recursive routing, or keepalives failing</td></tr>
<tr><td>up/up</td><td>Source up and the destination is routable (a default route is enough). Without keepalives this says nothing about the far end</td></tr>
</table>
<p>That last row is the classic trap: with no keepalives, BR1's Tunnel0 stays up/up even if BR2 is powered off, and routes keep pointing into a black hole.</p>

<h3>Step 3: route the LANs through the tunnel</h3>
<pre class="code">BR1(config)# ip route 10.2.20.0 255.255.255.0 172.16.12.2
BR2(config)# ip route 10.1.10.0 255.255.255.0 172.16.12.1</pre>
<p>Now PC1 pings PC2. Instead of statics you could run OSPF or EIGRP on Tunnel0, because GRE carries multicast hellos. Note the tunnel's default <b>bandwidth is 100 kbit/s</b> on IOS XE, which makes OSPF cost 1000 with the default reference bandwidth; set <code>bandwidth</code> on the tunnel so routing protocols compare it fairly with other paths.</p>

<h3>Step 4: keepalives</h3>
<pre class="code">interface Tunnel0
 keepalive 5 3          <span class="c">! every 5 s, down after 3 missed replies (both routers)</span></pre>
<p>A GRE keepalive is clever: the router builds a GRE packet whose inner packet is addressed back to itself, and sends it to the far end. The far end simply decapsulates it and routes the inner packet back. If three replies are missed, line protocol goes down, and any static route through the tunnel is withdrawn, so a backup path can take over. Typing just <code>keepalive</code> uses 10 seconds and 3 retries.</p>

<h3>Step 5: verification</h3>
<pre class="out">BR1# show interfaces tunnel 0
<span class="hl">Tunnel0 is up, line protocol is up</span>
  Hardware is Tunnel
  Internet address is 172.16.12.1/30
  MTU 17916 bytes, BW 100 Kbit/sec, DLY 50000 usec,
  Encapsulation TUNNEL, loopback not set
  <span class="hl">Keepalive set (5 sec), retries 3</span>
  <span class="hl">Tunnel source 100.64.11.2 (GigabitEthernet0/0), destination 100.64.22.2</span>
  Tunnel protocol/transport GRE/IP
    Key disabled, sequencing disabled
    Checksumming of packets disabled
  Tunnel TTL 255, Fast tunneling enabled
  <span class="hl">Tunnel transport MTU 1476 bytes</span>

PC1&gt; trace 10.2.20.10
trace to 10.2.20.10, 8 hops max, press Ctrl+C to stop
 1   10.1.10.1   1.102 ms  0.874 ms  0.912 ms
 2   <span class="hl">172.16.12.2</span>   2.331 ms  2.018 ms  2.140 ms
 3   *10.2.20.10   3.020 ms (ICMP type:3, code:3, Destination port unreachable)</pre>
<p>The ISP never appears in the trace. <b>Tunnel transport MTU 1476</b> is 1500 minus the 24-byte GRE overhead.</p>

<h3>MTU and MSS: the silent killer</h3>
<p>If a host sends a full 1500-byte packet into the tunnel, the result is 1524 bytes. With the DF bit set (most TCP traffic uses path MTU discovery), the router drops it and sends ICMP "fragmentation needed"; if a firewall blocks that ICMP, the connection hangs. Symptoms: ping works, small web pages work, large downloads and some applications stall. The standard fix on the tunnel interface:</p>
<pre class="code">interface Tunnel0
 ip mtu 1400
 ip tcp adjust-mss 1360      <span class="c">! 1400 minus 20 IP minus 20 TCP</span></pre>
<p><code>ip mtu 1400</code> leaves room for GRE plus a later IPsec header. <code>ip tcp adjust-mss</code> rewrites the MSS value in TCP SYN packets passing through, so both hosts agree to send segments small enough to fit, and no fragmentation is needed at all.</p>

<div class="warn"><p><b>Common mistakes.</b> Using the far end's tunnel IP (172.16.12.2) as the <code>tunnel destination</code>: the destination must be the public underlay address. Mismatched source and destination (BR2 pointing to the wrong WAN address). Forgetting return routes on BR2. Assuming up/up means the far end is alive without keepalives.</p></div>

<div class="exam"><p><b>Exam traps.</b> A GRE tunnel is up/up as soon as the source is up and a route to the destination exists. <code>ip tcp adjust-mss 1360</code> pairs with <code>ip mtu 1400</code>. Tunnel keepalives only need to be configured on one side to work, but configure both so both sides detect failures.</p></div>

<div class="scn"><h4>Email works, file uploads hang</h4><p>After moving a branch from MPLS to an internet GRE tunnel, users could browse and read mail, but uploads to the SharePoint server froze at 0 percent. Ping with 1472 bytes and DF set failed through the tunnel while 1300 bytes worked. The upstream firewall dropped ICMP unreachables, so path MTU discovery never worked. Adding <code>ip mtu 1400</code> and <code>ip tcp adjust-mss 1360</code> to both tunnel interfaces fixed it instantly.</p><p><b>Lesson:</b> every tunnel needs an MTU and MSS plan on day one.</p></div>

<div class="iv"><p class="q">"When is a GRE tunnel interface up/up, and how do you make it reflect the far end's health?"</p><p>It is up/up when the tunnel source is up with an address and the destination is reachable in the routing table; nothing is checked end to end. Add GRE keepalives, for example <code>keepalive 5 3</code>, so line protocol goes down when replies stop, which withdraws routes via the tunnel. Mention that keepalives are a GRE packet looped back by the far end, and that a routing protocol over the tunnel also detects failure through its hellos.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnel needs an IP, <code>tunnel source</code> (own public side) and <code>tunnel destination</code> (far public address).</li>
<li>Route LAN traffic into the tunnel with statics or an IGP over the tunnel.</li>
<li>up/up only means source up plus route to destination; <code>keepalive 5 3</code> adds real liveness.</li>
<li>Transport MTU is 1476; set <code>ip mtu 1400</code> and <code>ip tcp adjust-mss 1360</code>.</li>
<li>Verify with <code>show interfaces tunnel 0</code>, <code>show ip interface brief</code> and a traceroute: the tunnel is one hop.</li>
</ul></div>
`,hi:`
<p>Tunnel interface ek phone extension jaisa hai jo tabhi chalta hai jab building ki main line chal rahi ho. Aap extension install kar sakte ho (Tunnel0 banao), use number de sakte ho (IP address) aur bata sakte ho ki kaunse office ko ring kare (destination). Lekin agar main line dead hai ya far office ka number pata nahi, to extension "no service" dikhata hai. Tunnel kab up/up, up/down dikhata hai ya flap karta hai, yeh samajhna GRE troubleshooting ka aadha kaam hai. Yeh chapter GRE lab ko step by step chalata hai.</p>

<h3>Lab topology</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="GRE lab addressing">
<rect x="20" y="80" width="110" height="46" rx="8" fill="#fde68a"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="117" text-anchor="middle" class="svg-muted" font-size="12">10.1.10.10</text>
<rect x="160" y="80" width="100" height="46" rx="8" fill="#bae6fd"/><text x="210" y="100" text-anchor="middle" class="svg-ink" font-size="13">BR1</text><text x="210" y="117" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 .11.2</text>
<rect x="270" y="20" width="100" height="46" rx="8" fill="#e2e8f0"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<rect x="380" y="80" width="100" height="46" rx="8" fill="#bae6fd"/><text x="430" y="100" text-anchor="middle" class="svg-ink" font-size="13">BR2</text><text x="430" y="117" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 .22.2</text>
<rect x="510" y="80" width="110" height="46" rx="8" fill="#fde68a"/><text x="565" y="100" text-anchor="middle" class="svg-ink" font-size="13">PC2</text><text x="565" y="117" text-anchor="middle" class="svg-muted" font-size="12">10.2.20.10</text>
<line x1="130" y1="103" x2="160" y2="103" stroke="#64748b" stroke-width="2"/><line x1="480" y1="103" x2="510" y2="103" stroke="#64748b" stroke-width="2"/>
<line x1="240" y1="80" x2="290" y2="66" stroke="#64748b" stroke-width="2"/><line x1="350" y1="66" x2="400" y2="80" stroke="#64748b" stroke-width="2"/>
<path d="M210 126 Q320 190 430 126" fill="none" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="13">Tunnel0: .1 ---- 172.16.12.0/30 ---- .2</text>
</svg><p class="cap">BR1 aur BR2 ka ISP ki taraf default route hai; ISP ko LANs pata nahi.</p></div>

<h3>Step 1 aur 2: tunnel interfaces</h3>
<pre class="code"><span class="c">! BR1</span>
interface Tunnel0
 ip address 172.16.12.1 255.255.255.252
 tunnel source GigabitEthernet0/0      <span class="c">! mera public side (100.64.11.2)</span>
 tunnel destination 100.64.22.2        <span class="c">! BR2 ka public address</span>
<span class="c">! BR2: bilkul ulta</span>
interface Tunnel0
 ip address 172.16.12.2 255.255.255.252
 tunnel source GigabitEthernet0/0
 tunnel destination 100.64.11.2</pre>
<p><b>Tunnel source</b> interface name ya IP address ho sakta hai; yeh wahi address hona chahiye jo far end apni destination ki tarah use karta hai. Default <code>tunnel mode gre ip</code> type karne ki zaroorat nahi. Dono sides configure hone ke baad BR1 se <code>ping 172.16.12.2</code> successful hota hai.</p>

<h3>Tunnel interface states</h3>
<table class="cmp"><tr><th>State</th><th>Matlab</th></tr>
<tr><td>administratively down/down</td><td>Tunnel0 par <code>shutdown</code></td></tr>
<tr><td>up/down</td><td>Source interface down ya bina IP, destination configure nahi, <b>destination tak route nahi</b>, recursive routing, ya keepalives fail</td></tr>
<tr><td>up/up</td><td>Source up aur destination routable (default route kaafi hai). Keepalives ke bina yeh far end ke baare mein kuch nahi batata</td></tr>
</table>
<p>Aakhri row classic trap hai: keepalives ke bina BR1 ka Tunnel0 up/up rehta hai chahe BR2 band ho, aur routes ek black hole ki taraf point karte rehte hain.</p>

<h3>Step 3: LANs ko tunnel se route karo</h3>
<pre class="code">BR1(config)# ip route 10.2.20.0 255.255.255.0 172.16.12.2
BR2(config)# ip route 10.1.10.0 255.255.255.0 172.16.12.1</pre>
<p>Ab PC1 PC2 ko ping karta hai. Statics ki jagah aap Tunnel0 par OSPF ya EIGRP chala sakte ho, kyunki GRE multicast hellos le jaata hai. Dhyan do ki IOS XE par tunnel ki default <b>bandwidth 100 kbit/s</b> hai, jo default reference bandwidth ke saath OSPF cost 1000 banati hai; tunnel par <code>bandwidth</code> set karo taaki routing protocols ise baaki paths se sahi compare karein.</p>

<h3>Step 4: keepalives</h3>
<pre class="code">interface Tunnel0
 keepalive 5 3          <span class="c">! har 5 s, 3 missed replies ke baad down (dono routers)</span></pre>
<p>GRE keepalive smart hai: router ek GRE packet banata hai jiska inner packet khud usi ko addressed hota hai, aur use far end ko bhejta hai. Far end bas use decapsulate karke inner packet wapas route kar deta hai. Agar teen replies miss hoti hain, line protocol down ho jaata hai, aur tunnel se jaane wala har static route hat jaata hai, taaki backup path le sake. Sirf <code>keepalive</code> type karne par 10 seconds aur 3 retries use hote hain.</p>

<h3>Step 5: verification</h3>
<pre class="out">BR1# show interfaces tunnel 0
<span class="hl">Tunnel0 is up, line protocol is up</span>
  Hardware is Tunnel
  Internet address is 172.16.12.1/30
  MTU 17916 bytes, BW 100 Kbit/sec, DLY 50000 usec,
  Encapsulation TUNNEL, loopback not set
  <span class="hl">Keepalive set (5 sec), retries 3</span>
  <span class="hl">Tunnel source 100.64.11.2 (GigabitEthernet0/0), destination 100.64.22.2</span>
  Tunnel protocol/transport GRE/IP
    Key disabled, sequencing disabled
    Checksumming of packets disabled
  Tunnel TTL 255, Fast tunneling enabled
  <span class="hl">Tunnel transport MTU 1476 bytes</span>

PC1&gt; trace 10.2.20.10
trace to 10.2.20.10, 8 hops max, press Ctrl+C to stop
 1   10.1.10.1   1.102 ms  0.874 ms  0.912 ms
 2   <span class="hl">172.16.12.2</span>   2.331 ms  2.018 ms  2.140 ms
 3   *10.2.20.10   3.020 ms (ICMP type:3, code:3, Destination port unreachable)</pre>
<p>Trace mein ISP kabhi nahi dikhta. <b>Tunnel transport MTU 1476</b> matlab 1500 minus 24-byte GRE overhead.</p>

<h3>MTU aur MSS: chupa hua killer</h3>
<p>Agar host tunnel mein poora 1500-byte packet bhejta hai, to result 1524 bytes hota hai. DF bit set ho (zyada tar TCP traffic path MTU discovery use karta hai), to router use drop karta hai aur ICMP "fragmentation needed" bhejta hai; agar firewall woh ICMP block kar de, to connection atak jaata hai. Lakshan: ping chalta hai, chhote web pages chalte hain, bade downloads aur kuch applications atak jaati hain. Tunnel interface par standard fix:</p>
<pre class="code">interface Tunnel0
 ip mtu 1400
 ip tcp adjust-mss 1360      <span class="c">! 1400 minus 20 IP minus 20 TCP</span></pre>
<p><code>ip mtu 1400</code> GRE aur baad mein IPsec header ke liye jagah chhodta hai. <code>ip tcp adjust-mss</code> guzarte hue TCP SYN packets mein MSS value rewrite karta hai, taaki dono hosts itne chhote segments bhejne par agree karein jo fit ho jaayein, aur fragmentation ki zaroorat hi na pade.</p>

<div class="warn"><p><b>Common galtiyan.</b> Far end ka tunnel IP (172.16.12.2) <code>tunnel destination</code> ki tarah use karna: destination public underlay address hona chahiye. Source aur destination mismatch (BR2 galat WAN address ki taraf point kar raha). BR2 par return routes bhoolna. Keepalives ke bina maan lena ki up/up matlab far end zinda hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> GRE tunnel tab hi up/up ho jaata hai jab source up ho aur destination tak route ho. <code>ip tcp adjust-mss 1360</code> ki jodi <code>ip mtu 1400</code> ke saath hai. Tunnel keepalives kaam karne ke liye sirf ek side configure hona kaafi hai, lekin dono par configure karo taaki dono sides failure pakdein.</p></div>

<div class="scn"><h4>Email chalta hai, file uploads atakte hain</h4><p>Ek branch ko MPLS se internet GRE tunnel par shift karne ke baad, users browse kar sakte the aur mail padh sakte the, lekin SharePoint server par uploads 0 percent par ruk jaate the. Tunnel ke through DF set ke saath 1472 bytes ka ping fail hua jabki 1300 bytes chala. Upstream firewall ICMP unreachables drop karta tha, isliye path MTU discovery kabhi kaam nahi karta tha. Dono tunnel interfaces par <code>ip mtu 1400</code> aur <code>ip tcp adjust-mss 1360</code> jodne se turant fix ho gaya.</p><p><b>Seekh:</b> har tunnel ko pehle din se MTU aur MSS plan chahiye.</p></div>

<div class="iv"><p class="q">"GRE tunnel interface kab up/up hota hai, aur aap ise far end ki health kaise dikhane laayak banaoge?"</p><p>Yeh tab up/up hota hai jab tunnel source address ke saath up ho aur destination routing table mein reachable ho; end to end kuch check nahi hota. GRE keepalives jodo, jaise <code>keepalive 5 3</code>, taaki replies rukne par line protocol down ho aur tunnel se jaane wale routes hat jaayein. Batao ki keepalives ek GRE packet hai jo far end wapas loop karta hai, aur tunnel par chalne wala routing protocol bhi apne hellos se failure pakadta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnel ko IP, <code>tunnel source</code> (apna public side) aur <code>tunnel destination</code> (far public address) chahiye.</li>
<li>LAN traffic ko statics ya tunnel par IGP se tunnel mein route karo.</li>
<li>up/up ka matlab sirf source up plus destination tak route; <code>keepalive 5 3</code> asli liveness jodta hai.</li>
<li>Transport MTU 1476 hai; <code>ip mtu 1400</code> aur <code>ip tcp adjust-mss 1360</code> set karo.</li>
<li><code>show interfaces tunnel 0</code>, <code>show ip interface brief</code> aur traceroute se verify karo: tunnel ek hop hai.</li>
</ul></div>
`}};export{e as default};