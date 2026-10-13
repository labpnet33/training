var e={id:`vip-policies-internal-access`,h:{en:`VIP policies in practice: scope, internal users and safe publishing`,hi:`VIP policies practice mein: scope, internal users aur safe publishing`},body:{en:`
<p>You can now build a VIP and its policy. This chapter covers what goes wrong in real networks after the first test succeeds: users inside the LAN who open the <i>public</i> address of the server, the interface scope of a VIP, source restrictions, and keeping a published server safe. Think of the VIP as a published phone number: people outside dial it from the street, but staff inside the building do not reach the desk unless the phone system is told to handle the public number for them too.</p>

<h3>Problem: the LAN cannot open the public address</h3>
<p>The website is published as 203.0.113.3 port 8080. Customers outside reach it. A LAN user, PC1, opens the same public address and times out:</p>
<pre class="out">PC1&gt; curl 203.0.113.3:8080
curl: (28) Failed to connect to 203.0.113.3 port 8080 after 2001 ms: Timeout was reached

FGT1 # diagnose firewall iprope lookup 10.0.1.10 50000 203.0.113.3 8080 tcp port2
&lt;src [10.0.1.10-50000] dst [203.0.113.3-8080] proto tcp dev port2&gt; <span class="hl">matches policy id: 1</span>

FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
tcp     10     10.0.1.10:64251       203.0.113.2:60001     203.0.113.3:8080      -</pre>
<p>Read it. The VIP is bound to <code>extintf port1</code>, so it is considered only for traffic that <b>arrives on port1</b>. PC1's packet arrives on port2, the VIP does not apply, and the general LAN-to-WAN policy 1 accepts it. The packet is source-NATed and sent towards the ISP, which has no server behind 203.0.113.3 for it, so no reply arrives. The session has a short expire (10) because it never completed.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="VIP scope by extintf">
<rect x="10" y="20" width="200" height="70" rx="10" fill="#bbf7d0"/><text x="110" y="50" text-anchor="middle" class="svg-ink" font-size="13">Outside client (port1)</text><text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="12">VIP applies: DNAT</text>
<rect x="10" y="110" width="200" height="70" rx="10" fill="#bae6fd"/><text x="110" y="140" text-anchor="middle" class="svg-ink" font-size="13">LAN client (port2)</text><text x="110" y="160" text-anchor="middle" class="svg-muted" font-size="12">extintf port1: VIP skipped</text>
<rect x="260" y="50" width="130" height="100" rx="10" fill="#ddd6fe"/><text x="325" y="95" text-anchor="middle" class="svg-ink" font-size="14">FortiGate</text><text x="325" y="117" text-anchor="middle" class="svg-muted" font-size="12">extintf decides</text>
<rect x="450" y="20" width="180" height="70" rx="10" fill="#fde68a"/><text x="540" y="50" text-anchor="middle" class="svg-ink" font-size="13">WEB in DMZ</text><text x="540" y="70" text-anchor="middle" class="svg-muted" font-size="12">reached by DNAT</text>
<rect x="450" y="110" width="180" height="70" rx="10" fill="#fed7aa"/><text x="540" y="140" text-anchor="middle" class="svg-ink" font-size="13">ISP / internet</text><text x="540" y="160" text-anchor="middle" class="svg-muted" font-size="12">LAN packet leaks out</text>
<line x1="210" y1="55" x2="260" y2="85" stroke="#64748b" stroke-width="2"/><line x1="210" y1="145" x2="260" y2="120" stroke="#64748b" stroke-width="2"/><line x1="390" y1="85" x2="450" y2="55" stroke="#64748b" stroke-width="2"/><line x1="390" y1="120" x2="450" y2="145" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A VIP is only considered on the interface named in extintf.</p></div>

<h3>Fix: let the VIP apply on the LAN side and give the LAN its own policy</h3>
<pre class="code">config firewall vip
    edit "WEB-VIP"
        set extintf "any"
    next
end
config firewall policy
    edit 0
        set name "LAN-to-WEB-PUBLIC"
        set srcintf "port2"
        set dstintf "port3"
        set srcaddr "all"
        set dstaddr "WEB-VIP"
        set action accept
        set schedule "always"
        set service "HTTP"
        set nat enable
    next
end</pre>
<p>With <code>extintf any</code> the VIP is considered on every interface. After DNAT the destination is 10.0.2.10, so routing picks port3. The general policy 1 goes from port2 to port1 and therefore no longer matches, and the new policy does. No re-ordering was needed here, but always confirm with the lookup.</p>
<pre class="out">FGT1 # diagnose firewall iprope lookup 10.0.1.10 50000 203.0.113.3 8080 tcp port2
&lt;src [10.0.1.10-50000] dst [203.0.113.3-8080] proto tcp dev port2&gt; <span class="hl">matches policy id: 3</span>

PC1&gt; curl 203.0.113.3:8080
&lt;html&gt;&lt;body&gt;&lt;h1&gt;WEB&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;

FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
tcp     3600   10.0.1.10:57160       <span class="hl">10.0.2.1:60002</span>        203.0.113.3:8080      <span class="hl">10.0.2.10:80</span></pre>
<p>This session has <b>both</b> translations. The destination is rewritten to the server (DNAT), and, because this policy has <code>nat enable</code>, the source is rewritten to the FortiGate DMZ address 10.0.2.1. The server then sees all LAN users as 10.0.2.1. If the server's default gateway is already the FortiGate, as in this lab, <code>nat disable</code> would also work and would keep the real client address in the server logs; the lab above was verified with NAT enabled. This design is often called <b>hairpin NAT</b> or NAT loopback.</p>

<h3>Best practice: do not hairpin if you can avoid it</h3>
<ul>
<li>A common alternative is <b>split DNS</b>: internal clients resolve the website name to the private address 10.0.2.10, so they never use the VIP.</li>
<li>If you must hairpin, keep the LAN policy as narrow as the outside one: only the VIP, only the needed service.</li>
</ul>

<h3>Safe publishing checklist</h3>
<table class="cmp"><tr><th>Check</th><th>Why</th></tr>
<tr><td>Service restricted (not ALL)</td><td>The VIP can map every port; the policy decides what is reachable</td></tr>
<tr><td>Source restricted when possible</td><td>A vendor or partner range is much safer than "all"</td></tr>
<tr><td><code>logtraffic all</code></td><td>Evidence of who connected</td></tr>
<tr><td>NAT disabled on inbound policy</td><td>Keeps real client IPs for logs and blocking</td></tr>
<tr><td>Only the server's DMZ interface as dstintf</td><td>Prevents the VIP leading elsewhere</td></tr>
<tr><td>Negative tests</td><td>Other ports and ping must fail</td></tr></table>
<p>A VIP policy is a hole in the wall by design, so the security profile bundle (IPS, web application protection) normally goes on it. Those profiles are in the UTM modules. The <code>match-vip</code> setting that appears in <code>get firewall policy</code> (disabled by default) is used on <b>deny</b> policies so that a deny can match traffic that was destination-translated by a VIP; know that it exists and that it is off by default.</p>

<div class="eg"><p><b>Worked example.</b> HR portal at 10.0.2.20 is published to a partner. The VIP uses extport 8443 and mappedport 443. The policy source is the partner range 198.51.100.0/28, service HTTPS, NAT off, logtraffic all. Staff inside the LAN use the portal name that resolves to 10.0.2.20 through the internal DNS, with a plain LAN-to-DMZ policy. No hairpin is needed and the public VIP is visible only to the partner.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Leaving <code>extintf port1</code> and wondering why internal users time out; opening the VIP to "all" sources for an admin service; using NAT on the inbound policy so server logs show only the firewall address; creating a LAN-to-VIP policy without testing that outbound internet access is unaffected.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>extintf</code> limits where the VIP is considered. <code>any</code> applies it on all interfaces. Also, on a VIP policy the <b>destination interface is the server side</b>, and the service matches the mapped port.</p></div>

<div class="scn"><h4>The website that only staff could not open</h4><p>After a launch, customers reached the new site, but sales staff in the office got timeouts on the same address. The engineer's lookup from the LAN showed the general outbound policy, and the session table showed the packet leaving through the ISP link. The VIP was only valid on the WAN interface. Setting <code>extintf any</code> and adding a narrow LAN-to-DMZ policy fixed it, and the longer-term plan became split DNS.</p><p><b>Lesson:</b> the public name works for staff only if the firewall is told to handle the VIP from the inside, or if DNS gives them the private address.</p></div>

<div class="iv"><p class="q">"Internal users cannot reach a server through its public VIP address, but external users can. Why?"</p><p>The VIP is limited to the WAN interface through <code>extintf</code>, so traffic arriving on the LAN interface is not translated and follows the normal outbound policy. Fix it with <code>extintf any</code> and a LAN-to-DMZ policy with the VIP as destination (hairpin NAT), or better with split DNS so internal clients use the private address.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VIP applies only on the interface in <code>extintf</code>; <code>any</code> applies everywhere.</li>
<li>Internal users of a public VIP need a LAN policy to the VIP (hairpin) or split DNS.</li>
<li>A hairpin session shows both DNAT and SNAT in one session entry.</li>
<li>Publish narrowly: restricted service and source, logging, NAT off, negative tests.</li>
<li><code>match-vip</code> is off by default and relates to deny policies and VIP-translated traffic.</li>
</ul></div>
`,hi:`
<p>Ab aap VIP aur uski policy bana sakte ho. Yeh chapter woh batata hai jo pehle test ke succeed hone ke baad real networks mein galat hota hai: LAN ke andar ke users jo server ka <i>public</i> address kholte hain, VIP ka interface scope, source restrictions, aur published server ko safe rakhna. VIP ko ek published phone number ki tarah socho: bahar ke log use street se dial karte hain, lekin building ke andar ka staff desk tak nahi pahunchta jab tak phone system ko public number unke liye bhi handle karne ko na kaha jaye.</p>

<h3>Problem: LAN public address nahi khol paata</h3>
<p>Website 203.0.113.3 port 8080 par published hai. Bahar ke customers reach karte hain. LAN user PC1 wahi public address kholta hai aur timeout milta hai:</p>
<pre class="out">PC1&gt; curl 203.0.113.3:8080
curl: (28) Failed to connect to 203.0.113.3 port 8080 after 2001 ms: Timeout was reached

FGT1 # diagnose firewall iprope lookup 10.0.1.10 50000 203.0.113.3 8080 tcp port2
&lt;src [10.0.1.10-50000] dst [203.0.113.3-8080] proto tcp dev port2&gt; <span class="hl">matches policy id: 1</span>

FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
tcp     10     10.0.1.10:64251       203.0.113.2:60001     203.0.113.3:8080      -</pre>
<p>Ise padho. VIP <code>extintf port1</code> se bound hai, isliye woh sirf us traffic ke liye consider hota hai jo <b>port1 par aata hai</b>. PC1 ka packet port2 par aata hai, VIP apply nahi hota, aur general LAN-to-WAN policy 1 use accept kar leti hai. Packet source-NAT hokar ISP ki taraf jaata hai, jiske paas 203.0.113.3 ke peeche koi server nahi, isliye reply nahi aata. Session ka expire chhota (10) hai kyunki woh kabhi complete nahi hua.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="VIP scope by extintf">
<rect x="10" y="20" width="200" height="70" rx="10" fill="#bbf7d0"/><text x="110" y="50" text-anchor="middle" class="svg-ink" font-size="13">Outside client (port1)</text><text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="12">VIP apply: DNAT</text>
<rect x="10" y="110" width="200" height="70" rx="10" fill="#bae6fd"/><text x="110" y="140" text-anchor="middle" class="svg-ink" font-size="13">LAN client (port2)</text><text x="110" y="160" text-anchor="middle" class="svg-muted" font-size="12">extintf port1: VIP skip</text>
<rect x="260" y="50" width="130" height="100" rx="10" fill="#ddd6fe"/><text x="325" y="95" text-anchor="middle" class="svg-ink" font-size="14">FortiGate</text><text x="325" y="117" text-anchor="middle" class="svg-muted" font-size="12">extintf decide karta hai</text>
<rect x="450" y="20" width="180" height="70" rx="10" fill="#fde68a"/><text x="540" y="50" text-anchor="middle" class="svg-ink" font-size="13">WEB in DMZ</text><text x="540" y="70" text-anchor="middle" class="svg-muted" font-size="12">DNAT se pahunchta hai</text>
<rect x="450" y="110" width="180" height="70" rx="10" fill="#fed7aa"/><text x="540" y="140" text-anchor="middle" class="svg-ink" font-size="13">ISP / internet</text><text x="540" y="160" text-anchor="middle" class="svg-muted" font-size="12">LAN packet bahar leak</text>
<line x1="210" y1="55" x2="260" y2="85" stroke="#64748b" stroke-width="2"/><line x1="210" y1="145" x2="260" y2="120" stroke="#64748b" stroke-width="2"/><line x1="390" y1="85" x2="450" y2="55" stroke="#64748b" stroke-width="2"/><line x1="390" y1="120" x2="450" y2="145" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">VIP sirf extintf mein likhe interface par consider hota hai.</p></div>

<h3>Fix: VIP ko LAN side par apply hone do aur LAN ko apni policy do</h3>
<pre class="code">config firewall vip
    edit "WEB-VIP"
        set extintf "any"
    next
end
config firewall policy
    edit 0
        set name "LAN-to-WEB-PUBLIC"
        set srcintf "port2"
        set dstintf "port3"
        set srcaddr "all"
        set dstaddr "WEB-VIP"
        set action accept
        set schedule "always"
        set service "HTTP"
        set nat enable
    next
end</pre>
<p><code>extintf any</code> ke saath VIP har interface par consider hota hai. DNAT ke baad destination 10.0.2.10 hai, isliye routing port3 chunti hai. General policy 1 port2 se port1 ki hai, isliye ab match nahi karti, aur nayi policy karti hai. Yahan re-ordering ki zaroorat nahi padi, lekin hamesha lookup se confirm karo.</p>
<pre class="out">FGT1 # diagnose firewall iprope lookup 10.0.1.10 50000 203.0.113.3 8080 tcp port2
&lt;src [10.0.1.10-50000] dst [203.0.113.3-8080] proto tcp dev port2&gt; <span class="hl">matches policy id: 3</span>

PC1&gt; curl 203.0.113.3:8080
&lt;html&gt;&lt;body&gt;&lt;h1&gt;WEB&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;

FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
tcp     3600   10.0.1.10:57160       <span class="hl">10.0.2.1:60002</span>        203.0.113.3:8080      <span class="hl">10.0.2.10:80</span></pre>
<p>Is session mein <b>dono</b> translations hain. Destination server par rewrite hota hai (DNAT), aur kyunki is policy mein <code>nat enable</code> hai, source FortiGate ke DMZ address 10.0.2.1 par rewrite hota hai. Server phir saare LAN users ko 10.0.2.1 ke roop mein dekhta hai. Agar server ka default gateway pehle se FortiGate hai, jaisa is lab mein hai, to <code>nat disable</code> bhi chalega aur server logs mein asli client address rakhega; upar ka lab NAT enabled ke saath verify hua hai. Is design ko aksar <b>hairpin NAT</b> ya NAT loopback kehte hain.</p>

<h3>Best practice: ho sake to hairpin mat karo</h3>
<ul>
<li>Common alternative <b>split DNS</b> hai: internal clients website ka naam private address 10.0.2.10 par resolve karte hain, isliye woh VIP kabhi use nahi karte.</li>
<li>Hairpin karna hi pade to LAN policy ko bhi bahar wali jitni narrow rakho: sirf VIP, sirf zaroori service.</li>
</ul>

<h3>Safe publishing checklist</h3>
<table class="cmp"><tr><th>Check</th><th>Kyun</th></tr>
<tr><td>Service restricted (ALL nahi)</td><td>VIP har port map kar sakta hai; policy decide karti hai kya reachable hai</td></tr>
<tr><td>Jahan ho sake source restricted</td><td>Vendor ya partner range "all" se kahin safe hai</td></tr>
<tr><td><code>logtraffic all</code></td><td>Kisne connect kiya iska saboot</td></tr>
<tr><td>Inbound policy par NAT disabled</td><td>Logs aur blocking ke liye asli client IPs rehte hain</td></tr>
<tr><td>Sirf server ka DMZ interface dstintf</td><td>VIP kisi aur jagah na le jaye</td></tr>
<tr><td>Negative tests</td><td>Doosre ports aur ping fail hone chahiye</td></tr></table>
<p>VIP policy design se hi deewar mein ek chhed hai, isliye us par aam taur par security profile bundle (IPS, web application protection) lagta hai. Woh profiles UTM modules mein hain. <code>get firewall policy</code> mein dikhne wali <code>match-vip</code> setting (default disabled) <b>deny</b> policies par use hoti hai taaki deny woh traffic match kar sake jo VIP se destination-translate hua ho; bas itna jaano ki yeh hai aur default mein off hai.</p>

<div class="eg"><p><b>Worked example.</b> HR portal 10.0.2.20 par partner ke liye published hai. VIP extport 8443 aur mappedport 443 use karta hai. Policy source partner range 198.51.100.0/28, service HTTPS, NAT off, logtraffic all hai. LAN ke andar staff portal ka naam use karta hai jo internal DNS se 10.0.2.20 par resolve hota hai, plain LAN-to-DMZ policy ke saath. Hairpin ki zaroorat nahi aur public VIP sirf partner ko dikhta hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> <code>extintf port1</code> chhodkar sochna ki internal users ko timeout kyun mil raha hai; admin service ke liye VIP ko "all" sources ke liye kholna; inbound policy par NAT use karna jisse server logs mein sirf firewall address dikhta hai; LAN-to-VIP policy banakar yeh test na karna ki outbound internet access affect to nahi hua.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>extintf</code> limit karta hai ki VIP kahan consider hota hai. <code>any</code> use sab interfaces par apply karta hai. Aur VIP policy mein <b>destination interface server side</b> hota hai, aur service mapped port ko match karti hai.</p></div>

<div class="scn"><h4>Website jo sirf staff nahi khol paaya</h4><p>Launch ke baad customers nayi site tak pahunche, lekin office ke sales staff ko usi address par timeout mila. Engineer ke LAN se lookup ne general outbound policy dikhayi, aur session table ne packet ko ISP link se jaata dikhaya. VIP sirf WAN interface par valid tha. <code>extintf any</code> set karke aur narrow LAN-to-DMZ policy add karke fix hua, aur lambe samay ka plan split DNS bana.</p><p><b>Lesson:</b> public naam staff ke liye tabhi chalta hai jab firewall ko VIP ko andar se handle karne ko kaha jaye, ya DNS unhe private address de.</p></div>

<div class="iv"><p class="q">"Internal users server ko uske public VIP address se reach nahi kar paate, lekin external users kar paate hain. Kyun?"</p><p>VIP <code>extintf</code> se WAN interface tak limited hai, isliye LAN interface par aane wala traffic translate nahi hota aur normal outbound policy follow karta hai. <code>extintf any</code> aur VIP destination wali LAN-to-DMZ policy (hairpin NAT) se fix karo, ya behtar split DNS se taaki internal clients private address use karein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VIP sirf <code>extintf</code> wale interface par apply hota hai; <code>any</code> har jagah apply hota hai.</li>
<li>Public VIP use karne wale internal users ko VIP tak LAN policy (hairpin) ya split DNS chahiye.</li>
<li>Hairpin session ek hi session entry mein DNAT aur SNAT dono dikhata hai.</li>
<li>Narrowly publish karo: restricted service aur source, logging, NAT off, negative tests.</li>
<li><code>match-vip</code> default off hai aur deny policies aur VIP-translated traffic se related hai.</li>
</ul></div>
`}};export{e as default};