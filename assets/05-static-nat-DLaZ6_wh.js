var e={id:`static-nat`,h:{en:`Static NAT: publishing a server one-to-one (lab 1)`,hi:`Static NAT: server ko one-to-one publish karna (lab 1)`},body:{en:`
<p>A shop inside a large mall has no street entrance, yet it is listed in the phone book with its own number. Anyone can call that number at any time, and the call always rings in the same shop. And when the shop calls a supplier, the supplier's caller ID shows that same number. That is <b>static NAT</b>: a permanent, one-to-one, two-way identity for one internal server.</p>

<h3>What static NAT does</h3>
<ul>
<li><b>One-to-one</b>: one real address, one mapped address, all ports.</li>
<li><b>Permanent</b>: the xlate exists from the moment you configure it, with no traffic needed.</li>
<li><b>Bidirectional</b>: inbound connections to the mapped address are untranslated to the real address, and outbound connections from the server are translated to the mapped address.</li>
</ul>
<p>This is the right tool when a server needs a whole public address: a web server with HTTP and HTTPS, a mail server, a VPN concentrator behind the firewall, or anything that uses many ports.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Static NAT for WEB">
<rect x="20" y="80" width="130" height="56" rx="8" fill="#bae6fd"/><text x="85" y="104" text-anchor="middle" class="svg-ink" font-size="13">INET</text><text x="85" y="122" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<rect x="250" y="80" width="140" height="56" rx="8" fill="#fed7aa"/><text x="320" y="104" text-anchor="middle" class="svg-ink" font-size="13">NK-ASA</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">proxy ARP .3</text>
<rect x="490" y="80" width="130" height="56" rx="8" fill="#ddd6fe"/><text x="555" y="104" text-anchor="middle" class="svg-ink" font-size="13">WEB</text><text x="555" y="122" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.10</text>
<line x1="150" y1="98" x2="250" y2="98" stroke="#64748b" stroke-width="2"/><line x1="390" y1="98" x2="490" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="200" y="88" text-anchor="middle" class="svg-accent" font-size="12">dst 203.0.113.3</text>
<text x="440" y="88" text-anchor="middle" class="svg-accent" font-size="12">dst 10.0.2.10</text>
<line x1="150" y1="124" x2="250" y2="124" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="390" y1="124" x2="490" y2="124" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="200" y="150" text-anchor="middle" class="svg-muted" font-size="12">src 203.0.113.3</text>
<text x="440" y="150" text-anchor="middle" class="svg-muted" font-size="12">src 10.0.2.10</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">inbound untranslate (solid), outbound translate (dashed)</text>
</svg><p class="cap">One static rule serves both directions for WEB.</p></div>

<h3>Lab 1 walkthrough: publish WEB on 203.0.113.3</h3>
<p><b>Task 1, the translation.</b> Create the object for the real server and attach a static rule from dmz to outside:</p>
<pre class="code"><span class="c">! Real server on dmz, seen as 203.0.113.3 on outside</span>
NK-ASA# configure terminal
NK-ASA(config)# object network WEB
NK-ASA(config-network-object)# host 10.0.2.10
NK-ASA(config-network-object)# nat (dmz,outside) static 203.0.113.3
NK-ASA(config-network-object)# exit</pre>
<p><b>Task 2, the permission.</b> The outside interface has security level 0, so nothing starts from the internet unless an ACL permits it. Write the ACL with the <b>real</b> address, using the object, for web ports only:</p>
<pre class="code"><span class="c">! Real-IP rule: permit to object WEB (10.0.2.10), never to 203.0.113.3</span>
NK-ASA(config)# access-list OUTSIDE_IN extended permit tcp any object WEB eq www
NK-ASA(config)# access-list OUTSIDE_IN extended permit tcp any object WEB eq h&#116;tps
NK-ASA(config)# access-group OUTSIDE_IN in interface outside
NK-ASA(config)# end</pre>
<p>The lab checks both sides of this: INET must reach 203.0.113.3 on ports 80 and 443, and must <b>not</b> reach it on SSH. Because static NAT maps every port, the ACL is what keeps SSH closed.</p>
<p><b>Task 3, prove inbound.</b> From INET run <code>curl 203.0.113.3</code>, then read the counters:</p>
<pre class="out">NK-ASA# show nat
Auto NAT Policies (Section 2)
1 (dmz) to (outside) source static WEB 203.0.113.3
    <span class="hl">translate_hits = 0, untranslate_hits = 1</span>
2 (inside) to (outside) source dynamic INSIDE-NET interface
    translate_hits = 7, untranslate_hits = 0
3 (dmz) to (outside) source dynamic DMZ-NET interface
    translate_hits = 0, untranslate_hits = 0</pre>
<p>Inbound traffic toward the mapped address is an <b>untranslate</b>, so <code>untranslate_hits</code> is the number the lab asks for. It counts new connections, not packets, so one curl typically adds 1.</p>
<p><b>Task 4, prove outbound.</b> From WEB run <code>ping 8.8.8.8</code> and look at the xlate table:</p>
<pre class="out">NK-ASA# show xlate
2 in use, 3 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
<span class="hl">NAT from dmz:10.0.2.10 to outside:203.0.113.3</span>
    flags s idle 0:00:02 timeout 0:00:00
ICMP PAT from inside:10.0.1.10/1 to outside:203.0.113.2/1 flags ri idle 0:00:20 timeout 0:00:30</pre>
<p>The server's ping leaves as 203.0.113.3 through the static entry (flag <code>s</code>, timeout 0 meaning permanent), not through the DMZ-NET PAT, because static section 2 rules are checked before dynamic ones.</p>

<h3>Proxy ARP: how the ISP finds 203.0.113.3</h3>
<p>The ISP router has 203.0.113.1/29 on its link, so it believes 203.0.113.3 is directly connected and sends an ARP request for it. Nobody owns .3 physically. The ASA answers with its own outside MAC address, because by default it performs <b>proxy ARP</b> for mapped addresses of static rules on the mapped interface. Frames for .3 therefore arrive at the ASA, which untranslates them.</p>
<pre class="out">ISP# show ip arp
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  203.0.113.1             -   5254.0000.0a01  ARPA   GigabitEthernet0/0
Internet  203.0.113.2             4   5254.0000.1c02  ARPA   GigabitEthernet0/0
<span class="hl">Internet  203.0.113.3             1   5254.0000.1c02  ARPA   GigabitEthernet0/0</span></pre>
<p>Two addresses, one MAC: that is proxy ARP working. If the ISP instead gives you a public block that is <b>not</b> on the link (for example 198.51.100.64/28 routed to 203.0.113.2), proxy ARP is irrelevant; the ISP needs a route for that block pointing to the ASA.</p>

<div class="eg"><p><b>Worked example.</b> A company has .3 to .6 free. It publishes WEB on .3 and a mail server 10.0.2.25 on .4 with two more objects and static rules, and permits <code>eq www</code>, <code>eq h&#116;tps</code> to WEB and <code>eq smtp</code> to the mail object. Two addresses remain for future servers. For a whole block, a <code>subnet</code> object can map to another subnet object of the same size (net-to-net static), and each host keeps its last octet.</p></div>

<div class="warn"><p><b>Common mistake.</b> Choosing a mapped address that another device already uses, such as the ISP's .1 or a second firewall's address. The ASA proxy-ARPs for it and the two devices fight over the address, causing intermittent outages that look like a flapping link.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which counter increases when an internet user reaches a statically NATed server?" <code>untranslate_hits</code>. The server's own outbound traffic increases <code>translate_hits</code>. And the ACL for that server must reference the real IP, 10.0.2.10.</p></div>

<div class="scn"><h4>Intermittent website after a new router</h4><p>After an ISP swapped its router, a published web server worked only some of the time. <code>show nat</code> looked perfect. On the ISP side, <code>show ip arp</code> showed 203.0.113.3 pointing to a different MAC every few minutes: a new load balancer had been given .3 by mistake. The ASA and the balancer answered ARP in turn. Re-addressing the balancer ended the flapping.</p><p><b>Lesson:</b> a static NAT mapped address must be free on the mapped subnet, because the ASA will claim it with proxy ARP.</p></div>

<div class="iv"><p class="q">"Walk me through publishing a DMZ web server on the ASA."</p><p>Create a network object for the real IP with <code>nat (dmz,outside) static</code> to a free public address; permit only the needed ports to the object (the real IP) in the outside ACL; apply it with <code>access-group</code>; verify untranslate hits in <code>show nat</code>, the static xlate in <code>show xlate</code>, and the phases in <code>packet-tracer</code>. Mention proxy ARP and the need for a free mapped address.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static NAT is one-to-one, permanent and bidirectional, for all ports.</li>
<li>Publishing = static NAT plus an ACL permitting only the needed ports to the real IP.</li>
<li>Inbound hits are untranslate_hits; the server's outbound traffic uses the same static mapping.</li>
<li>The ASA proxy-ARPs for mapped addresses on the mapped interface; the mapped address must be free.</li>
<li>Off-link public blocks need a route on the ISP router toward the ASA.</li>
</ul></div>
`,hi:`
<p>Ek bade mall ke andar ki dukaan ka koi street entrance nahi, phir bhi woh phone book mein apne number ke saath listed hai. Koi bhi kabhi bhi woh number call kar sakta hai, aur call hamesha usi dukaan mein bajti hai. Aur jab dukaan kisi supplier ko call karti hai, supplier ke caller ID par wahi number dikhta hai. Yahi <b>static NAT</b> hai: ek internal server ki permanent, one-to-one, do-taraf wali pehchaan.</p>

<h3>Static NAT kya karta hai</h3>
<ul>
<li><b>One-to-one</b>: ek real address, ek mapped address, saare ports.</li>
<li><b>Permanent</b>: xlate configure karte hi exist karta hai, kisi traffic ki zaroorat nahi.</li>
<li><b>Bidirectional</b>: mapped address par aane wale inbound connections real address par untranslate hote hain, aur server se jaane wale outbound connections mapped address par translate hote hain.</li>
</ul>
<p>Yeh sahi tool hai jab server ko poora public address chahiye: HTTP aur HTTPS wala web server, mail server, firewall ke peeche VPN concentrator, ya kuch bhi jo bahut saare ports use kare.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Static NAT for WEB">
<rect x="20" y="80" width="130" height="56" rx="8" fill="#bae6fd"/><text x="85" y="104" text-anchor="middle" class="svg-ink" font-size="13">INET</text><text x="85" y="122" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<rect x="250" y="80" width="140" height="56" rx="8" fill="#fed7aa"/><text x="320" y="104" text-anchor="middle" class="svg-ink" font-size="13">NK-ASA</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">.3 ke liye proxy ARP</text>
<rect x="490" y="80" width="130" height="56" rx="8" fill="#ddd6fe"/><text x="555" y="104" text-anchor="middle" class="svg-ink" font-size="13">WEB</text><text x="555" y="122" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.10</text>
<line x1="150" y1="98" x2="250" y2="98" stroke="#64748b" stroke-width="2"/><line x1="390" y1="98" x2="490" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="200" y="88" text-anchor="middle" class="svg-accent" font-size="12">dst 203.0.113.3</text>
<text x="440" y="88" text-anchor="middle" class="svg-accent" font-size="12">dst 10.0.2.10</text>
<line x1="150" y1="124" x2="250" y2="124" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="390" y1="124" x2="490" y2="124" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="200" y="150" text-anchor="middle" class="svg-muted" font-size="12">src 203.0.113.3</text>
<text x="440" y="150" text-anchor="middle" class="svg-muted" font-size="12">src 10.0.2.10</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">inbound untranslate (solid), outbound translate (dashed)</text>
</svg><p class="cap">WEB ke liye ek static rule dono directions serve karti hai.</p></div>

<h3>Lab 1 walkthrough: WEB ko 203.0.113.3 par publish karo</h3>
<p><b>Task 1, translation.</b> Real server ke liye object banao aur dmz se outside tak static rule lagao:</p>
<pre class="code"><span class="c">! Real server dmz par, outside par 203.0.113.3 ki tarah dikhta hai</span>
NK-ASA# configure terminal
NK-ASA(config)# object network WEB
NK-ASA(config-network-object)# host 10.0.2.10
NK-ASA(config-network-object)# nat (dmz,outside) static 203.0.113.3
NK-ASA(config-network-object)# exit</pre>
<p><b>Task 2, permission.</b> Outside interface ka security level 0 hai, isliye internet se kuch bhi shuru nahi hota jab tak ACL permit na kare. ACL ko <b>real</b> address ke saath, object use karke, sirf web ports ke liye likho:</p>
<pre class="code"><span class="c">! Real-IP rule: object WEB (10.0.2.10) ko permit karo, 203.0.113.3 ko kabhi nahi</span>
NK-ASA(config)# access-list OUTSIDE_IN extended permit tcp any object WEB eq www
NK-ASA(config)# access-list OUTSIDE_IN extended permit tcp any object WEB eq h&#116;tps
NK-ASA(config)# access-group OUTSIDE_IN in interface outside
NK-ASA(config)# end</pre>
<p>Lab iske dono sides check karta hai: INET ko 203.0.113.3 tak ports 80 aur 443 par pahunchna chahiye, aur SSH par <b>nahi</b> pahunchna chahiye. Kyunki static NAT har port map karta hai, ACL hi SSH ko band rakhti hai.</p>
<p><b>Task 3, inbound saabit karo.</b> INET se <code>curl 203.0.113.3</code> chalao, phir counters padho:</p>
<pre class="out">NK-ASA# show nat
Auto NAT Policies (Section 2)
1 (dmz) to (outside) source static WEB 203.0.113.3
    <span class="hl">translate_hits = 0, untranslate_hits = 1</span>
2 (inside) to (outside) source dynamic INSIDE-NET interface
    translate_hits = 7, untranslate_hits = 0
3 (dmz) to (outside) source dynamic DMZ-NET interface
    translate_hits = 0, untranslate_hits = 0</pre>
<p>Mapped address ki taraf inbound traffic ek <b>untranslate</b> hai, isliye <code>untranslate_hits</code> woh number hai jo lab maangta hai. Yeh packets nahi, naye connections ginta hai, isliye ek curl aam taur par 1 jodta hai.</p>
<p><b>Task 4, outbound saabit karo.</b> WEB se <code>ping 8.8.8.8</code> chalao aur xlate table dekho:</p>
<pre class="out">NK-ASA# show xlate
2 in use, 3 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
<span class="hl">NAT from dmz:10.0.2.10 to outside:203.0.113.3</span>
    flags s idle 0:00:02 timeout 0:00:00
ICMP PAT from inside:10.0.1.10/1 to outside:203.0.113.2/1 flags ri idle 0:00:20 timeout 0:00:30</pre>
<p>Server ka ping static entry se 203.0.113.3 ban kar nikalta hai (flag <code>s</code>, timeout 0 matlab permanent), DMZ-NET PAT se nahi, kyunki section 2 ki static rules dynamic se pehle check hoti hain.</p>

<h3>Proxy ARP: ISP 203.0.113.3 ko kaise dhoondhta hai</h3>
<p>ISP router ke link par 203.0.113.1/29 hai, isliye woh maanta hai ki 203.0.113.3 directly connected hai aur uske liye ARP request bhejta hai. Physically .3 kisi ke paas nahi hai. ASA apne outside MAC address se jawab deta hai, kyunki default mein woh mapped interface par static rules ke mapped addresses ke liye <b>proxy ARP</b> karta hai. Isliye .3 ke frames ASA par pahunchte hain, jo unhe untranslate karta hai.</p>
<pre class="out">ISP# show ip arp
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  203.0.113.1             -   5254.0000.0a01  ARPA   GigabitEthernet0/0
Internet  203.0.113.2             4   5254.0000.1c02  ARPA   GigabitEthernet0/0
<span class="hl">Internet  203.0.113.3             1   5254.0000.1c02  ARPA   GigabitEthernet0/0</span></pre>
<p>Do addresses, ek MAC: yahi proxy ARP ka kaam karna hai. Agar ISP aapko aisa public block de jo link par <b>nahi</b> hai (jaise 198.51.100.64/28 jo 203.0.113.2 ki taraf routed ho), to proxy ARP ka koi role nahi; ISP ko us block ke liye ASA ki taraf route chahiye.</p>

<div class="eg"><p><b>Worked example.</b> Ek company ke paas .3 se .6 khaali hain. Woh WEB ko .3 par aur mail server 10.0.2.25 ko .4 par do aur objects aur static rules se publish karti hai, aur WEB ke liye <code>eq www</code>, <code>eq h&#116;tps</code> aur mail object ke liye <code>eq smtp</code> permit karti hai. Future servers ke liye do addresses bachte hain. Poore block ke liye, <code>subnet</code> object same size ke doosre subnet object par map ho sakta hai (net-to-net static), aur har host apna aakhri octet rakhta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Aisa mapped address choose karna jo koi aur device pehle se use kar raha ho, jaise ISP ka .1 ya doosre firewall ka address. ASA uske liye proxy ARP karta hai aur dono devices address par ladte hain, jisse beech beech mein outages hote hain jo flapping link jaise dikhte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Jab internet user statically NAT kiye server tak pahunchta hai to kaunsa counter badhta hai?" <code>untranslate_hits</code>. Server ka apna outbound traffic <code>translate_hits</code> badhata hai. Aur us server ki ACL ko real IP, 10.0.2.10, reference karna chahiye.</p></div>

<div class="scn"><h4>Naye router ke baad beech beech mein chalti website</h4><p>ISP ne apna router badla, uske baad ek published web server sirf kabhi kabhi kaam karta tha. <code>show nat</code> perfect dikh raha tha. ISP side par <code>show ip arp</code> ne 203.0.113.3 ko har kuch minute mein alag MAC par point karte dikhaya: ek naye load balancer ko galti se .3 de diya gaya tha. ASA aur balancer baari baari ARP ka jawab de rahe the. Balancer ko re-address karne se flapping khatam hui.</p><p><b>Seekh:</b> static NAT mapped address mapped subnet par free hona chahiye, kyunki ASA proxy ARP se use claim karega.</p></div>

<div class="iv"><p class="q">"ASA par DMZ web server publish karne ka process batao."</p><p>Real IP ke liye network object banao jismein free public address par <code>nat (dmz,outside) static</code> ho; outside ACL mein object (real IP) ke liye sirf zaroori ports permit karo; <code>access-group</code> se apply karo; <code>show nat</code> mein untranslate hits, <code>show xlate</code> mein static xlate, aur <code>packet-tracer</code> mein phases verify karo. Proxy ARP aur free mapped address ki zaroorat batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static NAT one-to-one, permanent aur bidirectional hai, saare ports ke liye.</li>
<li>Publish karna = static NAT plus ACL jo real IP ke liye sirf zaroori ports permit kare.</li>
<li>Inbound hits untranslate_hits hain; server ka outbound traffic wahi static mapping use karta hai.</li>
<li>ASA mapped interface par mapped addresses ke liye proxy ARP karta hai; mapped address free hona chahiye.</li>
<li>Off-link public blocks ke liye ISP router par ASA ki taraf route chahiye.</li>
</ul></div>
`}};export{e as default};