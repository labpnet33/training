var e={id:`static-nat`,h:{en:`Static NAT: one-to-one, publishing a server, port forwarding`,hi:`Static NAT: one-to-one, server publish karna, port forwarding`},body:{en:`
<p>A company's reception desk may give most visitors a temporary badge, but the managing director has a <b>permanent</b> nameplate on the door. Anyone can walk up and knock, any time, because the name on the door never changes. Static NAT is that nameplate: a permanent, one-to-one link between one inside local address and one inside global address. Because it exists before any traffic flows, outside users can start connections to it, which makes it the tool for <b>publishing a server</b>.</p>

<h3>How static NAT behaves</h3>
<ul>
<li><b>One-to-one:</b> one inside local maps to exactly one inside global. Ten servers need ten public addresses.</li>
<li><b>Permanent:</b> the mapping is part of the configuration. It never times out and <code>clear ip nat translation *</code> does not remove it.</li>
<li><b>Bidirectional:</b> outside hosts can open connections to the inside global address, and when the server itself starts a connection outward (software updates, email), it also leaves as the same inside global address.</li>
<li><b>ARP:</b> if the inside global address is inside the outside interface's subnet, the router answers ARP for it on that segment, so the ISP router can deliver packets for it without any extra route.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Static NAT lab topology">
<rect x="10" y="40" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="62" text-anchor="middle" class="svg-ink" font-size="13">PORTAL</text><text x="75" y="80" text-anchor="middle" class="svg-muted" font-size="12">172.16.10.80</text>
<rect x="10" y="140" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="162" text-anchor="middle" class="svg-ink" font-size="13">PC-IN</text><text x="75" y="180" text-anchor="middle" class="svg-muted" font-size="12">172.16.10.20</text>
<rect x="200" y="90" width="120" height="50" rx="8" fill="#bae6fd"/><text x="260" y="112" text-anchor="middle" class="svg-ink" font-size="13">EDGE</text><text x="260" y="130" text-anchor="middle" class="svg-muted" font-size="12">g0/0 in | g0/1 out</text>
<rect x="370" y="90" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="425" y="112" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="425" y="130" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.1</text>
<rect x="520" y="90" width="110" height="50" rx="8" fill="#fde68a"/><text x="575" y="112" text-anchor="middle" class="svg-ink" font-size="13">PC-EXT</text><text x="575" y="130" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.50</text>
<line x1="140" y1="65" x2="200" y2="110" stroke="#64748b" stroke-width="2"/><line x1="140" y1="165" x2="200" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="115" x2="370" y2="115" stroke="#64748b" stroke-width="2"/><line x1="480" y1="115" x2="520" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="345" y="80" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.0/29</text>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="13">static: 172.16.10.80 ↔ 203.0.113.5</text>
</svg><p class="cap">The static NAT lab: the ISP only routes 203.0.113.0/29, so reaching 203.0.113.5 proves the translation works.</p></div>

<h3>Lab walkthrough: publish the course portal</h3>
<p>The e-learning company in the lab hosts its portal on 172.16.10.80. The ISP assigned 203.0.113.0/29 (usable .1 to .6): the ISP router is .1 and EDGE's uplink is .2. We publish the portal as 203.0.113.5.</p>
<pre class="code">EDGE(config)# interface GigabitEthernet0/0
EDGE(config-if)#  ip nat inside
EDGE(config-if)# interface GigabitEthernet0/1
EDGE(config-if)#  ip nat outside
EDGE(config-if)# exit
<span class="c">! local address first, then global address</span>
EDGE(config)# ip nat inside source static 172.16.10.80 203.0.113.5</pre>
<p>Then test from the internet PC with <code>curl h&#116;tp://203.0.113.5</code> and <code>ping 203.0.113.5</code>, and read the table on EDGE:</p>
<pre class="out">EDGE# show ip nat translations
Pro  Inside global      Inside local       Outside local      Outside global
icmp 203.0.113.5:3      172.16.10.80:3     198.51.100.50:3    198.51.100.50:3
<span class="hl">tcp  203.0.113.5:80     172.16.10.80:80    198.51.100.50:49812 198.51.100.50:49812</span>
<span class="hl">---  203.0.113.5        172.16.10.80       ---                ---</span></pre>
<p>The <code>---</code> line is the static mapping and is always present. The tcp and icmp lines are <b>extended entries</b> created for each flow that uses the mapping; they time out, the static line never does.</p>

<h3>Static port forwarding (static PAT)</h3>
<p>Often you have only one or two public addresses but several services. Static NAT can map a single <b>protocol and port</b> instead of the whole address. This is what home routers call "port forwarding".</p>
<pre class="code"><span class="c">! outside users reach 203.0.113.6 port 8080, delivered to the portal on port 80</span>
EDGE(config)# ip nat inside source static tcp 172.16.10.80 80 203.0.113.6 8080
<span class="c">! publish HTTPS using the router's own outside interface address</span>
EDGE(config)# ip nat inside source static tcp 172.16.10.80 443 interface GigabitEthernet0/1 443</pre>
<p>The syntax is <code>ip nat inside source static {tcp|udp} local-ip local-port global-ip global-port</code>. Only that one port is exposed; every other port on the global address is untouched. The table shows it with ports:</p>
<pre class="out">Pro  Inside global      Inside local       Outside local      Outside global
<span class="hl">tcp  203.0.113.6:8080   172.16.10.80:80    ---                ---</span></pre>
<p>If you map the <b>same inside local</b> address to more than one global (for example two ports or two ISPs), add the <code>extendable</code> keyword to each line. IOS usually adds it for you when it detects the case.</p>

<div class="eg"><p><b>Worked example.</b> A branch has one public address, 203.0.113.18, on g0/1, and runs PAT for users. It must also publish an internal HTTPS server 192.168.1.50 and an SSH jump host 192.168.1.60 on port 2222. Use <code>ip nat inside source static tcp 192.168.1.50 443 interface GigabitEthernet0/1 443</code> and <code>ip nat inside source static tcp 192.168.1.60 22 interface GigabitEthernet0/1 2222</code>. Users keep sharing 203.0.113.18 for outbound PAT, and inbound connections to ports 443 and 2222 land on the right servers. Remember to permit those two ports to 203.0.113.18 in any inbound ACL on g0/1, and to restrict port 2222 to trusted sources.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reversing the addresses: <code>ip nat inside source static 203.0.113.5 172.16.10.80</code>. IOS accepts it, but now it believes an inside host called 203.0.113.5 should appear outside as 172.16.10.80. Nothing is published. The rule is always <b>local first, global second</b>.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which NAT type allows hosts on the internet to initiate connections to an internal server?" Static NAT (or static port forwarding). Dynamic NAT and PAT only create entries when inside hosts send first, so an unsolicited inbound packet finds no entry and is not translated.</p></div>

<div class="scn"><h4>The portal that "published" nothing</h4><p>A coaching institute moved its LMS to 172.16.10.80 and the engineer added a static NAT line late at night. Next morning students got timeouts. <code>show ip nat translations</code> showed <code>--- 172.16.10.80 203.0.113.5 --- ---</code>: the inside global column held the private address. The addresses had been typed in reverse. After removing the line and entering <code>ip nat inside source static 172.16.10.80 203.0.113.5</code>, the table showed the correct order and students connected.</p><p><b>Lesson:</b> read the static line back in show ip nat translations; the private address must be in the Inside local column.</p></div>

<div class="iv"><p class="q">"How would you publish an internal web server to the internet with Cisco NAT?"</p><p>Strong answer: mark inside and outside interfaces, then create a static mapping with <code>ip nat inside source static</code> local then global, or a static port mapping with tcp and ports if the public address is shared. Make sure the global address is routed to you (in the outside subnet, or routed by the ISP), permit the service in the outside ACL using the global address, and verify with show ip nat translations and a real test from outside. A senior answer adds: only expose the needed port, and consider a DMZ or firewall.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static NAT is a permanent one-to-one mapping that works in both directions; it publishes servers.</li>
<li>Syntax: ip nat inside source static LOCAL GLOBAL, always local first.</li>
<li>Static port forwarding maps one tcp/udp port: ip nat inside source static tcp LOCAL LPORT GLOBAL GPORT (or interface).</li>
<li>The static line shows --- in the Pro column; flows using it appear as extra tcp/udp/icmp lines.</li>
<li>clear ip nat translation * never removes static entries.</li>
</ul></div>
`,hi:`
<p>Company ka reception zyada tar visitors ko temporary badge deta hai, par managing director ke darwaaze par <b>permanent</b> nameplate hoti hai. Koi bhi kabhi bhi aa kar knock kar sakta hai, kyunki darwaaze ka naam kabhi nahi badalta. Static NAT wahi nameplate hai: ek inside local address aur ek inside global address ke beech permanent, one-to-one link. Kyunki yeh kisi bhi traffic se pehle maujood hota hai, outside users is par connection shuru kar sakte hain, isliye yeh <b>server publish karne</b> ka tool hai.</p>

<h3>Static NAT kaise behave karta hai</h3>
<ul>
<li><b>One-to-one:</b> ek inside local bilkul ek inside global se map hota hai. Das servers ko das public addresses chahiye.</li>
<li><b>Permanent:</b> mapping configuration ka hissa hai. Yeh kabhi time out nahi hoti aur <code>clear ip nat translation *</code> ise nahi hataata.</li>
<li><b>Bidirectional:</b> outside hosts inside global address par connections khol sakte hain, aur jab server khud bahar connection shuru karta hai (software updates, email), woh bhi usi inside global address se nikalta hai.</li>
<li><b>ARP:</b> agar inside global address outside interface ke subnet ke andar hai, router us segment par uske liye ARP ka jawab deta hai, isliye ISP router bina extra route ke uske packets deliver kar sakta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Static NAT lab topology">
<rect x="10" y="40" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="62" text-anchor="middle" class="svg-ink" font-size="13">PORTAL</text><text x="75" y="80" text-anchor="middle" class="svg-muted" font-size="12">172.16.10.80</text>
<rect x="10" y="140" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="162" text-anchor="middle" class="svg-ink" font-size="13">PC-IN</text><text x="75" y="180" text-anchor="middle" class="svg-muted" font-size="12">172.16.10.20</text>
<rect x="200" y="90" width="120" height="50" rx="8" fill="#bae6fd"/><text x="260" y="112" text-anchor="middle" class="svg-ink" font-size="13">EDGE</text><text x="260" y="130" text-anchor="middle" class="svg-muted" font-size="12">g0/0 in | g0/1 out</text>
<rect x="370" y="90" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="425" y="112" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="425" y="130" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.1</text>
<rect x="520" y="90" width="110" height="50" rx="8" fill="#fde68a"/><text x="575" y="112" text-anchor="middle" class="svg-ink" font-size="13">PC-EXT</text><text x="575" y="130" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.50</text>
<line x1="140" y1="65" x2="200" y2="110" stroke="#64748b" stroke-width="2"/><line x1="140" y1="165" x2="200" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="115" x2="370" y2="115" stroke="#64748b" stroke-width="2"/><line x1="480" y1="115" x2="520" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="345" y="80" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.0/29</text>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="13">static: 172.16.10.80 ↔ 203.0.113.5</text>
</svg><p class="cap">Static NAT lab: ISP sirf 203.0.113.0/29 route karta hai, isliye 203.0.113.5 tak pahunchna prove karta hai ki translation chal raha hai.</p></div>

<h3>Lab walkthrough: course portal publish karo</h3>
<p>Lab ki e-learning company apna portal 172.16.10.80 par host karti hai. ISP ne 203.0.113.0/29 diya (usable .1 se .6): ISP router .1 hai aur EDGE ka uplink .2. Hum portal ko 203.0.113.5 ke roop mein publish karte hain.</p>
<pre class="code">EDGE(config)# interface GigabitEthernet0/0
EDGE(config-if)#  ip nat inside
EDGE(config-if)# interface GigabitEthernet0/1
EDGE(config-if)#  ip nat outside
EDGE(config-if)# exit
<span class="c">! pehle local address, phir global address</span>
EDGE(config)# ip nat inside source static 172.16.10.80 203.0.113.5</pre>
<p>Phir internet PC se <code>curl h&#116;tp://203.0.113.5</code> aur <code>ping 203.0.113.5</code> se test karo, aur EDGE par table padho:</p>
<pre class="out">EDGE# show ip nat translations
Pro  Inside global      Inside local       Outside local      Outside global
icmp 203.0.113.5:3      172.16.10.80:3     198.51.100.50:3    198.51.100.50:3
<span class="hl">tcp  203.0.113.5:80     172.16.10.80:80    198.51.100.50:49812 198.51.100.50:49812</span>
<span class="hl">---  203.0.113.5        172.16.10.80       ---                ---</span></pre>
<p><code>---</code> wali line static mapping hai aur hamesha maujood rehti hai. tcp aur icmp lines <b>extended entries</b> hain jo mapping use karne wale har flow ke liye banti hain; yeh time out hoti hain, static line kabhi nahi.</p>

<h3>Static port forwarding (static PAT)</h3>
<p>Aksar aapke paas sirf ek ya do public addresses hote hain par services kai. Static NAT poore address ki jagah ek single <b>protocol aur port</b> map kar sakta hai. Home routers ise "port forwarding" kehte hain.</p>
<pre class="code"><span class="c">! outside users 203.0.113.6 port 8080 par aate hain, portal ko port 80 par deliver</span>
EDGE(config)# ip nat inside source static tcp 172.16.10.80 80 203.0.113.6 8080
<span class="c">! router ke apne outside interface address se HTTPS publish karo</span>
EDGE(config)# ip nat inside source static tcp 172.16.10.80 443 interface GigabitEthernet0/1 443</pre>
<p>Syntax hai <code>ip nat inside source static {tcp|udp} local-ip local-port global-ip global-port</code>. Sirf woh ek port expose hota hai; global address ke baaki saare ports ko koi chhoota nahi. Table ise ports ke saath dikhati hai:</p>
<pre class="out">Pro  Inside global      Inside local       Outside local      Outside global
<span class="hl">tcp  203.0.113.6:8080   172.16.10.80:80    ---                ---</span></pre>
<p>Agar aap <b>same inside local</b> address ko ek se zyada global se map karte ho (jaise do ports ya do ISPs), har line mein <code>extendable</code> keyword jodo. IOS aam taur par yeh case detect karke khud jod deta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek branch ke g0/1 par ek public address hai, 203.0.113.18, aur users ke liye PAT chalta hai. Use ek internal HTTPS server 192.168.1.50 aur port 2222 par ek SSH jump host 192.168.1.60 bhi publish karna hai. Use karo <code>ip nat inside source static tcp 192.168.1.50 443 interface GigabitEthernet0/1 443</code> aur <code>ip nat inside source static tcp 192.168.1.60 22 interface GigabitEthernet0/1 2222</code>. Users outbound PAT ke liye 203.0.113.18 share karte rehte hain, aur ports 443 aur 2222 par inbound connections sahi servers par pahunchte hain. g0/1 ke kisi bhi inbound ACL mein 203.0.113.18 ki taraf yeh do ports permit karna yaad rakho, aur port 2222 ko trusted sources tak limit karo.</p></div>

<div class="warn"><p><b>Common galti.</b> Addresses ulte likhna: <code>ip nat inside source static 203.0.113.5 172.16.10.80</code>. IOS ise accept kar leta hai, par ab woh maanta hai ki 203.0.113.5 naam ka inside host bahar 172.16.10.80 dikhna chahiye. Kuch publish nahi hota. Rule hamesha hai <b>pehle local, phir global</b>.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa NAT type internet ke hosts ko internal server par connections initiate karne deta hai?" Static NAT (ya static port forwarding). Dynamic NAT aur PAT entries tabhi banate hain jab inside hosts pehle bhejte hain, isliye unsolicited inbound packet ko koi entry nahi milti aur woh translate nahi hota.</p></div>

<div class="scn"><h4>Portal jisne kuch "publish" nahi kiya</h4><p>Ek coaching institute ne apna LMS 172.16.10.80 par move kiya aur engineer ne der raat static NAT line jodi. Agli subah students ko timeouts mile. <code>show ip nat translations</code> mein <code>--- 172.16.10.80 203.0.113.5 --- ---</code> dikha: inside global column mein private address tha. Addresses ulte type hue the. Line hata kar <code>ip nat inside source static 172.16.10.80 203.0.113.5</code> daalne ke baad table ne sahi order dikhaya aur students connect ho gaye.</p><p><b>Seekh:</b> show ip nat translations mein static line wapas padho; private address Inside local column mein hona chahiye.</p></div>

<div class="iv"><p class="q">"Cisco NAT se internal web server ko internet par kaise publish karoge?"</p><p>Strong answer: inside aur outside interfaces mark karo, phir <code>ip nat inside source static</code> se static mapping banao, pehle local phir global, ya agar public address shared hai to tcp aur ports ke saath static port mapping. Pakka karo ki global address aap tak route hota hai (outside subnet mein, ya ISP route kare), outside ACL mein global address ke saath service permit karo, aur show ip nat translations aur bahar se asli test se verify karo. Senior answer jodta hai: sirf zaroori port expose karo, aur DMZ ya firewall consider karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static NAT permanent one-to-one mapping hai jo dono directions mein kaam karti hai; yeh servers publish karti hai.</li>
<li>Syntax: ip nat inside source static LOCAL GLOBAL, hamesha pehle local.</li>
<li>Static port forwarding ek tcp/udp port map karta hai: ip nat inside source static tcp LOCAL LPORT GLOBAL GPORT (ya interface).</li>
<li>Static line Pro column mein --- dikhati hai; use karne wale flows extra tcp/udp/icmp lines ki tarah dikhte hain.</li>
<li>clear ip nat translation * kabhi static entries nahi hataata.</li>
</ul></div>
`}};export{e as default};