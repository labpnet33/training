var e={id:`dhcp-relay`,h:{en:`DHCP relay for multi-VLAN clients (preview)`,hi:`Multi-VLAN clients ke liye DHCP relay (preview)`},body:{en:`
<p>A new employee on the fourth floor shouts "Does anyone have a desk for me?" Only the fourth floor hears the shout, but the facilities office is on the ground floor. So the floor receptionist writes the question on a note, adds "from the fourth floor", and sends it down by internal mail. The facilities office picks a fourth-floor desk and sends the answer back to the receptionist, who passes it on. That receptionist is a <b>DHCP relay agent</b>, and on Cisco the note-writing is done by one command: <code>ip helper-address</code>.</p>

<h3>Why DHCP breaks when you add VLANs</h3>
<p>A PC without an address uses <b>DHCP</b> (Dynamic Host Configuration Protocol) to get its IP, mask, default gateway and DNS server. It has no address yet, so it starts with a <b>broadcast</b>: the DHCP Discover goes to 255.255.255.255 from source 0.0.0.0, UDP port 68 to port 67. Routers and SVIs do not forward broadcasts; that is exactly the broadcast-domain boundary a VLAN creates. So if the company's single DHCP server sits in VLAN 100, clients in VLANs 10 and 20 would never reach it.</p>
<p>Putting a DHCP server in every VLAN is wasteful. Instead, the gateway interface of each client VLAN becomes a <b>relay agent</b>.</p>

<h3>What the relay agent does</h3>
<ol>
<li>The client broadcasts a Discover inside VLAN 10.</li>
<li>DSW1's SVI Vlan10, configured with <code>ip helper-address 10.1.100.10</code>, receives it.</li>
<li>DSW1 turns it into a <b>unicast</b> to 10.1.100.10 and writes its own interface address 10.1.10.1 into the <b>giaddr</b> (gateway IP address) field of the DHCP message.</li>
<li>The server reads giaddr, chooses the pool whose subnet contains 10.1.10.1 (the USERS pool) and sends an Offer back to 10.1.10.1.</li>
<li>DSW1 relays the Offer to the client in VLAN 10. Request and Ack follow the same path.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="DHCP relay converts a broadcast in VLAN 10 to a unicast to the server in VLAN 100">
<rect x="10" y="90" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="112" text-anchor="middle" class="svg-ink" font-size="13">PC1 VLAN 10</text><text x="75" y="130" text-anchor="middle" class="svg-muted" font-size="12">no IP yet</text>
<rect x="250" y="80" width="150" height="70" rx="8" fill="#ddd6fe"/><text x="325" y="104" text-anchor="middle" class="svg-ink" font-size="13">DSW1 Vlan10</text><text x="325" y="122" text-anchor="middle" class="svg-muted" font-size="12">10.1.10.1</text><text x="325" y="140" text-anchor="middle" class="svg-accent" font-size="12">helper 10.1.100.10</text>
<rect x="500" y="90" width="130" height="50" rx="8" fill="#fde68a"/><text x="565" y="112" text-anchor="middle" class="svg-ink" font-size="13">DHCP server</text><text x="565" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.1.100.10</text>
<line x1="140" y1="115" x2="250" y2="115" stroke="#64748b" stroke-width="2"/><line x1="400" y1="115" x2="500" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="195" y="60" text-anchor="middle" class="svg-ink" font-size="12">1: broadcast</text><text x="195" y="78" text-anchor="middle" class="svg-muted" font-size="12">to 255.255.255.255</text>
<text x="450" y="60" text-anchor="middle" class="svg-ink" font-size="12">2: unicast</text><text x="450" y="78" text-anchor="middle" class="svg-muted" font-size="12">giaddr 10.1.10.1</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">3: server picks the pool matching giaddr and replies to the relay</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">4: relay forwards the answer into VLAN 10</text>
</svg><p class="cap">The helper address goes on the interface where the client broadcasts arrive, not on the server's interface.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! On every client-facing gateway: SVIs on a Layer 3 switch...</span>
DSW1(config)# interface Vlan10
DSW1(config-if)# ip helper-address 10.1.100.10
DSW1(config-if)# interface Vlan20
DSW1(config-if)# ip helper-address 10.1.100.10

<span class="c">! ...or subinterfaces on a router-on-a-stick</span>
R1(config)# interface GigabitEthernet0/0.10
R1(config-subif)# ip helper-address 10.1.100.10</pre>
<p>By default <code>ip helper-address</code> forwards not only DHCP/BOOTP (UDP 67) but a small set of other UDP broadcasts: TFTP, DNS, time, NetBIOS name and datagram, TACACS and IEN-116. You can trim this list with <code>no ip forward-protocol udp &lt;port&gt;</code>. You may configure several helper addresses on one interface for redundant servers.</p>

<h3>Verification</h3>
<pre class="out">DSW1# show ip interface Vlan10 | include Helper|Internet
  Internet address is 10.1.10.1/24
<span class="hl">  Helper address is 10.1.100.10</span>

PC1&gt; ip dhcp
<span class="hl">DDORA IP 10.1.10.51/24 GW 10.1.10.1</span></pre>
<p>The lab PC's "DDORA" line shows the full Discover, Offer, Request, Ack exchange completed, and the gateway it received is the SVI of its own VLAN, which proves the server chose the right pool from giaddr.</p>

<div class="eg"><p><b>Worked example.</b> Server pools: USERS 10.1.10.0/24 (default-router 10.1.10.1) and PRINTERS 10.1.20.0/24 (default-router 10.1.20.1). A printer in VLAN 20 broadcasts; Vlan20 relays with giaddr 10.1.20.1; the server matches 10.1.20.1 to the PRINTERS pool and offers 10.1.20.60 with gateway 10.1.20.1. If you forgot the helper on Vlan20, printers would get no address and self-assign 169.254.x.x (APIPA on Windows), while VLAN 10 PCs keep working.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Configuring the helper on the server-side interface instead of the client VLAN's gateway. No pool on the server for the client subnet. A pool whose <code>default-router</code> points to the wrong gateway. The server has no route back to the giaddr subnet, so Offers never return. Forgetting the helper on a newly added VLAN.</p></div>

<div class="exam"><p><b>Exam trap.</b> The question "Where do you configure <code>ip helper-address</code>?" has one answer: on the Layer 3 interface that <b>receives the client's broadcast</b>, that is the client VLAN's SVI or subinterface. Also remember that the relay sets giaddr, and that is how the server chooses the scope.</p></div>

<div class="scn"><h4>Only the new VLAN got 169.254 addresses</h4><p>A college added VLAN 50 for a new computer lab with an SVI 10.9.50.1 and a DHCP pool on the central Windows server. Every lab PC showed a 169.254 address. Other VLANs were fine. <code>show ip interface Vlan50</code> showed "Helper address is not set". The template for new VLANs had skipped the helper line. After adding <code>ip helper-address 10.9.200.5</code>, the PCs were renewed with <code>ipconfig /renew</code> and received 10.9.50.x addresses.</p><p><b>Lesson:</b> every new client VLAN needs three things: an SVI, a pool on the server and a helper address on the SVI.</p></div>

<div class="iv"><p class="q">"Why do we need ip helper-address, and how does the DHCP server know which subnet to assign?"</p><p>Strong answer: DHCP Discover is a broadcast and routers do not forward broadcasts, so a central server in another VLAN is unreachable. The helper on the client VLAN's gateway converts it to a unicast to the server and fills giaddr with the receiving interface's IP; the server chooses the pool matching giaddr and replies to the relay. Add that the server needs a route back to that subnet and that the helper also forwards some other UDP services by default. DHCP itself is covered in depth in the services module.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DHCP starts with a broadcast, and broadcasts do not cross VLAN or router boundaries.</li>
<li><code>ip helper-address</code> on the client VLAN's gateway relays DHCP to a central server as unicast.</li>
<li>The relay writes giaddr; the server uses it to choose the right pool.</li>
<li>Verify with <code>show ip interface</code> (Helper address) and a successful DHCP on a client.</li>
<li>No helper on a VLAN = clients in that VLAN get 169.254.x.x while others work.</li>
</ul></div>
`,hi:`
<p>Chauthi floor par ek naya employee chillata hai "Kya koi mere liye desk hai?" Chillana sirf chauthi floor sunti hai, lekin facilities office ground floor par hai. To floor ka receptionist sawaal ek note par likhta hai, "chauthi floor se" jodta hai, aur internal mail se neeche bhejta hai. Facilities office chauthi floor ki ek desk chunta hai aur jawab receptionist ko wapas bhejta hai, jo use aage de deta hai. Woh receptionist <b>DHCP relay agent</b> hai, aur Cisco par note likhne ka kaam ek command karti hai: <code>ip helper-address</code>.</p>

<h3>VLANs jodne par DHCP kyun toot-ta hai</h3>
<p>Bina address wala PC apna IP, mask, default gateway aur DNS server lene ke liye <b>DHCP</b> (Dynamic Host Configuration Protocol) use karta hai. Uske paas abhi address nahi hai, isliye woh <b>broadcast</b> se shuru karta hai: DHCP Discover source 0.0.0.0 se 255.255.255.255 ko jaata hai, UDP port 68 se port 67. Routers aur SVIs broadcasts forward nahi karte; yahi to woh broadcast-domain boundary hai jo VLAN banata hai. Isliye agar company ka akela DHCP server VLAN 100 mein hai, to VLANs 10 aur 20 ke clients kabhi us tak nahi pahunchenge.</p>
<p>Har VLAN mein DHCP server rakhna bekaar hai. Iski jagah har client VLAN ka gateway interface <b>relay agent</b> ban jaata hai.</p>

<h3>Relay agent kya karta hai</h3>
<ol>
<li>Client VLAN 10 ke andar Discover broadcast karta hai.</li>
<li>DSW1 ka SVI Vlan10, jis par <code>ip helper-address 10.1.100.10</code> configured hai, use receive karta hai.</li>
<li>DSW1 use 10.1.100.10 ke liye <b>unicast</b> mein badalta hai aur DHCP message ke <b>giaddr</b> (gateway IP address) field mein apna interface address 10.1.10.1 likhta hai.</li>
<li>Server giaddr padhta hai, woh pool chunta hai jiske subnet mein 10.1.10.1 hai (USERS pool) aur Offer wapas 10.1.10.1 ko bhejta hai.</li>
<li>DSW1 Offer ko VLAN 10 ke client tak relay karta hai. Request aur Ack bhi same path follow karte hain.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="DHCP relay VLAN 10 ke broadcast ko VLAN 100 ke server ke liye unicast mein badalta hai">
<rect x="10" y="90" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="112" text-anchor="middle" class="svg-ink" font-size="13">PC1 VLAN 10</text><text x="75" y="130" text-anchor="middle" class="svg-muted" font-size="12">abhi IP nahi</text>
<rect x="250" y="80" width="150" height="70" rx="8" fill="#ddd6fe"/><text x="325" y="104" text-anchor="middle" class="svg-ink" font-size="13">DSW1 Vlan10</text><text x="325" y="122" text-anchor="middle" class="svg-muted" font-size="12">10.1.10.1</text><text x="325" y="140" text-anchor="middle" class="svg-accent" font-size="12">helper 10.1.100.10</text>
<rect x="500" y="90" width="130" height="50" rx="8" fill="#fde68a"/><text x="565" y="112" text-anchor="middle" class="svg-ink" font-size="13">DHCP server</text><text x="565" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.1.100.10</text>
<line x1="140" y1="115" x2="250" y2="115" stroke="#64748b" stroke-width="2"/><line x1="400" y1="115" x2="500" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="195" y="60" text-anchor="middle" class="svg-ink" font-size="12">1: broadcast</text><text x="195" y="78" text-anchor="middle" class="svg-muted" font-size="12">255.255.255.255 ko</text>
<text x="450" y="60" text-anchor="middle" class="svg-ink" font-size="12">2: unicast</text><text x="450" y="78" text-anchor="middle" class="svg-muted" font-size="12">giaddr 10.1.10.1</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">3: server giaddr se match hone wala pool chunta hai aur relay ko jawab deta hai</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">4: relay jawab VLAN 10 mein forward karta hai</text>
</svg><p class="cap">Helper address us interface par lagta hai jahan client ke broadcasts aate hain, server ke interface par nahi.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! Har client-facing gateway par: Layer 3 switch ke SVIs...</span>
DSW1(config)# interface Vlan10
DSW1(config-if)# ip helper-address 10.1.100.10
DSW1(config-if)# interface Vlan20
DSW1(config-if)# ip helper-address 10.1.100.10

<span class="c">! ...ya router-on-a-stick ke subinterfaces</span>
R1(config)# interface GigabitEthernet0/0.10
R1(config-subif)# ip helper-address 10.1.100.10</pre>
<p>Default mein <code>ip helper-address</code> sirf DHCP/BOOTP (UDP 67) hi nahi, balki kuch aur UDP broadcasts bhi forward karta hai: TFTP, DNS, time, NetBIOS name aur datagram, TACACS aur IEN-116. Is list ko <code>no ip forward-protocol udp &lt;port&gt;</code> se chhota kar sakte ho. Redundant servers ke liye ek interface par kai helper addresses configure kar sakte ho.</p>

<h3>Verification</h3>
<pre class="out">DSW1# show ip interface Vlan10 | include Helper|Internet
  Internet address is 10.1.10.1/24
<span class="hl">  Helper address is 10.1.100.10</span>

PC1&gt; ip dhcp
<span class="hl">DDORA IP 10.1.10.51/24 GW 10.1.10.1</span></pre>
<p>Lab PC ki "DDORA" line dikhati hai ki poora Discover, Offer, Request, Ack exchange complete hua, aur use mila gateway uske apne VLAN ka SVI hai, jo saabit karta hai ki server ne giaddr se sahi pool chuna.</p>

<div class="eg"><p><b>Worked example.</b> Server pools: USERS 10.1.10.0/24 (default-router 10.1.10.1) aur PRINTERS 10.1.20.0/24 (default-router 10.1.20.1). VLAN 20 ka printer broadcast karta hai; Vlan20 giaddr 10.1.20.1 ke saath relay karta hai; server 10.1.20.1 ko PRINTERS pool se match karta hai aur gateway 10.1.20.1 ke saath 10.1.20.60 offer karta hai. Agar aap Vlan20 par helper bhool gaye, to printers ko koi address nahi milega aur woh khud 169.254.x.x assign kar lenge (Windows par APIPA), jabki VLAN 10 ke PCs chalte rahenge.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Helper ko client VLAN ke gateway ki jagah server-side interface par configure karna. Server par client subnet ka koi pool na hona. Aisa pool jiska <code>default-router</code> galat gateway ki taraf ishara kare. Server ke paas giaddr subnet ka return route na hona, jisse Offers kabhi wapas nahi aate. Naye VLAN par helper bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> "<code>ip helper-address</code> kahan configure karte ho?" ka ek hi jawab hai: us Layer 3 interface par jo <b>client ka broadcast receive karta hai</b>, yaani client VLAN ka SVI ya subinterface. Yeh bhi yaad rakho ki relay giaddr set karta hai, aur isi se server scope chunta hai.</p></div>

<div class="scn"><h4>Sirf naye VLAN ko 169.254 addresses mile</h4><p>Ek college ne nayi computer lab ke liye VLAN 50 joda, SVI 10.9.50.1 aur central Windows server par DHCP pool ke saath. Lab ke har PC par 169.254 address dikha. Dusre VLANs theek the. <code>show ip interface Vlan50</code> ne "Helper address is not set" dikhaya. Naye VLANs ke template mein helper line chhoot gayi thi. <code>ip helper-address 10.9.200.5</code> jodne ke baad PCs ko <code>ipconfig /renew</code> se renew kiya gaya aur unhe 10.9.50.x addresses mile.</p><p><b>Seekh:</b> har naye client VLAN ko teen cheezein chahiye: SVI, server par pool aur SVI par helper address.</p></div>

<div class="iv"><p class="q">"ip helper-address ki zaroorat kyun hai, aur DHCP server ko kaise pata chalta hai ki kaunsa subnet assign karna hai?"</p><p>Strong answer: DHCP Discover broadcast hai aur routers broadcasts forward nahi karte, isliye dusre VLAN ka central server unreachable hai. Client VLAN ke gateway par helper use server ke liye unicast mein badalta hai aur giaddr mein receiving interface ka IP bharta hai; server giaddr se match hone wala pool chunta hai aur relay ko jawab deta hai. Jodo ki server ko us subnet ka return route chahiye aur helper default mein kuch aur UDP services bhi forward karta hai. DHCP khud services module mein detail mein cover hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DHCP broadcast se shuru hota hai, aur broadcasts VLAN ya router boundaries cross nahi karte.</li>
<li>Client VLAN ke gateway par <code>ip helper-address</code> DHCP ko central server tak unicast mein relay karta hai.</li>
<li>Relay giaddr likhta hai; server usse sahi pool chunta hai.</li>
<li><code>show ip interface</code> (Helper address) aur client par successful DHCP se verify karo.</li>
<li>VLAN par helper nahi = us VLAN ke clients ko 169.254.x.x milta hai jabki baaki chalte hain.</li>
</ul></div>
`}};export{e as default};