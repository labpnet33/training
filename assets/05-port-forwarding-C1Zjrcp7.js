var e={id:`port-forwarding`,h:{en:`Port forwarding VIPs: one public address, many services`,hi:`Port forwarding VIPs: ek public address, kai services`},body:{en:`
<p>A static one-to-one VIP gives a server a whole public address. Public addresses are scarce and often you only want to expose one service. <b>Port forwarding</b> solves both: one public address can carry many services, each public port leading to a different internal server or port. Think of a block of flats with one street number: "flat 8080 is the web shop, flat 2222 is the admin desk".</p>

<h3>The Pune requirement</h3>
<p>The web server WEB (10.0.2.10) sits in the DMZ on port3. Customers must open it on the public address <b>203.0.113.3 port 8080</b>, while the server listens on port <b>80</b>. Nothing else on the server may be reachable. First, see the starting point: no VIP, no policy.</p>
<pre class="out">INET-SRV&gt; curl 203.0.113.3:8080
curl: (28) Failed to connect to 203.0.113.3 port 8080 after 2001 ms: Timeout was reached

FGT1 # diagnose firewall iprope lookup 8.8.8.8 50000 203.0.113.3 8080 tcp port1
&lt;src [8.8.8.8-50000] dst [203.0.113.3-8080] proto tcp dev port1&gt; <span class="hl">matches policy id: 0</span></pre>

<h3>Build the VIP with port forwarding</h3>
<pre class="code">config firewall vip
    edit "WEB-VIP"
        set extip 203.0.113.3
        set mappedip "10.0.2.10"
        set extintf "port1"
        set portforward enable
        set extport 8080
        set mappedport 80
    next
end</pre>
<pre class="out">FGT1 # show firewall vip
config firewall vip
    edit "WEB-VIP"
        set extip 203.0.113.3
        set mappedip "10.0.2.10"
        set extintf "port1"
        <span class="hl">set portforward enable</span>
        <span class="hl">set extport 8080</span>
        <span class="hl">set mappedport 80</span>
    next
end</pre>
<ul>
<li><code>portforward enable</code> switches the VIP from "all ports" to "one port".</li>
<li><code>extport</code> is the port clients use on the public address.</li>
<li><code>mappedport</code> is the port on the internal server.</li>
<li>The protocol defaults to TCP (<code>set protocol udp</code> for UDP services). Extport and mappedport can be ranges of equal length.</li>
</ul>

<h3>The policy: use the VIP and the mapped port</h3>
<pre class="code">config firewall policy
    edit 0
        set name WAN-to-WEB
        set srcintf port1
        set dstintf port3
        set srcaddr all
        set dstaddr WEB-VIP
        set action accept
        set schedule always
        set service HTTP
        set nat disable
        set logtraffic all
    end</pre>
<p>Here is a point that surprises many learners. The policy service is <b>HTTP (TCP 80)</b>, not 8080, although clients connect to 8080. The reason is the order of operations you learned: DNAT happens first, so by the time the policy is evaluated the destination is already 10.0.2.10 port 80. The service must therefore match the <b>mapped</b> port. The lab confirms it:</p>
<pre class="out">FGT1 # diagnose firewall iprope lookup 8.8.8.8 50000 203.0.113.3 8080 tcp port1
&lt;src [8.8.8.8-50000] dst [203.0.113.3-8080] proto tcp dev port1&gt; <span class="hl">matches policy id: 2</span>

INET-SRV&gt; curl 203.0.113.3:8080
&lt;html&gt;&lt;body&gt;&lt;h1&gt;WEB&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;</pre>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Port forwarding steps">
<rect x="10" y="60" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="75" y="90" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="75" y="110" text-anchor="middle" class="svg-muted" font-size="12">to 203.0.113.3:8080</text>
<rect x="250" y="40" width="150" height="110" rx="10" fill="#ddd6fe"/><text x="325" y="72" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="325" y="94" text-anchor="middle" class="svg-muted" font-size="12">1 DNAT 8080 to 80</text><text x="325" y="112" text-anchor="middle" class="svg-muted" font-size="12">2 route to port3</text><text x="325" y="130" text-anchor="middle" class="svg-muted" font-size="12">3 policy: service HTTP</text>
<rect x="510" y="60" width="120" height="70" rx="10" fill="#fde68a"/><text x="570" y="90" text-anchor="middle" class="svg-ink" font-size="13">WEB</text><text x="570" y="110" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.10:80</text>
<line x1="140" y1="95" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><line x1="400" y1="95" x2="510" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The policy sees port 80, the translated port.</p></div>

<h3>Prove it in the session table</h3>
<pre class="out">FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
tcp     3600   8.8.8.8:57160         -                     203.0.113.3:8080      <span class="hl">10.0.2.10:80</span>

FGT1 # diagnose sys session list
...
orgin-&gt;sink: org pre-&gt;post, reply pre-&gt;post dev=3-&gt;5/5-&gt;3 gwy=10.0.2.10/8.8.8.8
hook=pre dir=org act=dnat 8.8.8.8:57160-&gt;203.0.113.3:8080(10.0.2.10:80)
hook=post dir=reply act=snat 10.0.2.10:80-&gt;8.8.8.8:57160(203.0.113.3:8080)
misc=0 policy_id=2 ...</pre>
<p>The original direction carries a <b>dnat</b> hook (the client's 8080 becomes 80), and the reply gets an <b>snat</b> hook so the answer appears to come from 203.0.113.3:8080. This is the mirror image of the SNAT session in chapter 2.</p>

<h3>Prove that nothing else is exposed</h3>
<p>The requirement said nothing else may be reachable. Test it, do not assume it:</p>
<pre class="out">INET-SRV&gt; curl 203.0.113.3:80
curl: (28) Failed to connect to 203.0.113.3 port 80 after 2001 ms: Timeout was reached
INET-SRV&gt; ping 203.0.113.3
203.0.113.3 icmp_seq=1 timeout
INET-SRV&gt; curl 203.0.113.3:22
curl: (28) Failed to connect to 203.0.113.3 port 22 after 2001 ms: Timeout was reached

FGT1 # diagnose firewall iprope lookup 8.8.8.8 50000 203.0.113.3 22 tcp port1
&lt;src [8.8.8.8-50000] dst [203.0.113.3-22] proto tcp dev port1&gt; <span class="hl">matches policy id: 0</span></pre>
<p>Port 80, ping and SSH on the public address fail. The VIP only translates its own port, and no other traffic matches a policy, so everything else falls to the implicit deny. The LAN is unaffected: PC1 still browses through policy 1.</p>

<h3>Several services, one address</h3>
<p>Create one VIP per public port. For example <code>WEB-VIP</code> (8080 to 80), <code>SSH-ADMIN-VIP</code> (2222 to 22) and so on, all using extip 203.0.113.3. Group them with <code>config firewall vipgrp</code> if you want a single policy destination. The pairs of address and extport must be unique.</p>

<div class="eg"><p><b>Worked example.</b> A branch has one public address and two internal web apps, both listening on port 80. You publish app A as 203.0.113.3:8080 to 10.0.2.10:80 and app B as 203.0.113.3:8081 to 10.0.2.11:80. Two VIPs, two policies (or one group), one public IP. Customers use the port to choose the app.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Using the external port in the policy service (8080) instead of the mapped port; forgetting <code>portforward enable</code>, which silently leaves a full one-to-one mapping; publishing administrative ports (SSH, RDP) to the whole internet; using a dstintf of port1; testing only the allowed port and never the disallowed ones.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which service does the policy need for extport 8080 and mappedport 80?" The answer is HTTP (TCP 80), the mapped port, because DNAT is applied before the policy match. Also, the session table shows the <i>external</i> port in DESTINATION and the <i>mapped</i> port in DESTINATION-NAT.</p></div>

<div class="scn"><h4>The "open" admin port</h4><p>A vendor asked to reach a management page, so a VIP was created with portforward off and a policy with service ALL "just for the weekend". An automated scan found SSH open on the public address. The engineer replaced it with a port-forward VIP for the single required port, limited the source to the vendor's documented address range 192.0.2.0/28 and set logtraffic all. The scan then saw nothing.</p><p><b>Lesson:</b> publish the smallest thing possible: one port, one source range, logged.</p></div>

<div class="iv"><p class="q">"A server listens on 80 but customers should use public port 8080. How do you configure it?"</p><p>A VIP with <code>extip</code>, <code>extintf</code>, <code>mappedip</code>, <code>portforward enable</code>, <code>extport 8080</code> and <code>mappedport 80</code>, and an inbound policy with the VIP as destination, the DMZ as egress and service HTTP (the mapped port), NAT off. Mention testing blocked ports and reading DESTINATION-NAT in the session list.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>portforward enable</code> with <code>extport</code> and <code>mappedport</code> limits the VIP to one service.</li>
<li>The policy service must match the mapped port, because DNAT precedes policy matching.</li>
<li>Session table: DESTINATION has the public address and external port; DESTINATION-NAT has the mapped ones.</li>
<li>Verify the negative cases: other ports and ping must fail.</li>
<li>One public IP can carry many VIPs, each with a unique external port.</li>
</ul></div>
`,hi:`
<p>Static one-to-one VIP server ko poora public address de deta hai. Public addresses kam hote hain aur aksar aap sirf ek service expose karna chahte ho. <b>Port forwarding</b> dono ka hal hai: ek public address kai services le ja sakta hai, har public port alag internal server ya port tak le jaata hai. Ek flats ke block ko socho jiska ek street number hai: "flat 8080 web shop hai, flat 2222 admin desk hai".</p>

<h3>Pune ki requirement</h3>
<p>Web server WEB (10.0.2.10) DMZ ke port3 par hai. Customers ko use public address <b>203.0.113.3 port 8080</b> par kholna hai, jabki server port <b>80</b> par sunta hai. Server ki aur koi cheez reachable nahi honi chahiye. Pehle starting point dekho: na VIP, na policy.</p>
<pre class="out">INET-SRV&gt; curl 203.0.113.3:8080
curl: (28) Failed to connect to 203.0.113.3 port 8080 after 2001 ms: Timeout was reached

FGT1 # diagnose firewall iprope lookup 8.8.8.8 50000 203.0.113.3 8080 tcp port1
&lt;src [8.8.8.8-50000] dst [203.0.113.3-8080] proto tcp dev port1&gt; <span class="hl">matches policy id: 0</span></pre>

<h3>Port forwarding ke saath VIP banao</h3>
<pre class="code">config firewall vip
    edit "WEB-VIP"
        set extip 203.0.113.3
        set mappedip "10.0.2.10"
        set extintf "port1"
        set portforward enable
        set extport 8080
        set mappedport 80
    next
end</pre>
<pre class="out">FGT1 # show firewall vip
config firewall vip
    edit "WEB-VIP"
        set extip 203.0.113.3
        set mappedip "10.0.2.10"
        set extintf "port1"
        <span class="hl">set portforward enable</span>
        <span class="hl">set extport 8080</span>
        <span class="hl">set mappedport 80</span>
    next
end</pre>
<ul>
<li><code>portforward enable</code> VIP ko "saare ports" se "ek port" par switch karta hai.</li>
<li><code>extport</code> woh port hai jo clients public address par use karte hain.</li>
<li><code>mappedport</code> internal server ka port hai.</li>
<li>Protocol default TCP hai (UDP services ke liye <code>set protocol udp</code>). Extport aur mappedport barabar lambai ki ranges ho sakte hain.</li>
</ul>

<h3>Policy: VIP aur mapped port use karo</h3>
<pre class="code">config firewall policy
    edit 0
        set name WAN-to-WEB
        set srcintf port1
        set dstintf port3
        set srcaddr all
        set dstaddr WEB-VIP
        set action accept
        set schedule always
        set service HTTP
        set nat disable
        set logtraffic all
    end</pre>
<p>Yahan ek baat jo kai learners ko chaunkati hai. Policy service <b>HTTP (TCP 80)</b> hai, 8080 nahi, jabki clients 8080 par connect karte hain. Wajah woh order of operations hai jo aapne seekha: DNAT pehle hota hai, isliye policy evaluate hone tak destination pehle se 10.0.2.10 port 80 ho chuka hota hai. Isliye service ko <b>mapped</b> port match karna hota hai. Lab ise confirm karta hai:</p>
<pre class="out">FGT1 # diagnose firewall iprope lookup 8.8.8.8 50000 203.0.113.3 8080 tcp port1
&lt;src [8.8.8.8-50000] dst [203.0.113.3-8080] proto tcp dev port1&gt; <span class="hl">matches policy id: 2</span>

INET-SRV&gt; curl 203.0.113.3:8080
&lt;html&gt;&lt;body&gt;&lt;h1&gt;WEB&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;</pre>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Port forwarding steps">
<rect x="10" y="60" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="75" y="90" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="75" y="110" text-anchor="middle" class="svg-muted" font-size="12">to 203.0.113.3:8080</text>
<rect x="250" y="40" width="150" height="110" rx="10" fill="#ddd6fe"/><text x="325" y="72" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="325" y="94" text-anchor="middle" class="svg-muted" font-size="12">1 DNAT 8080 se 80</text><text x="325" y="112" text-anchor="middle" class="svg-muted" font-size="12">2 port3 par route</text><text x="325" y="130" text-anchor="middle" class="svg-muted" font-size="12">3 policy: service HTTP</text>
<rect x="510" y="60" width="120" height="70" rx="10" fill="#fde68a"/><text x="570" y="90" text-anchor="middle" class="svg-ink" font-size="13">WEB</text><text x="570" y="110" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.10:80</text>
<line x1="140" y1="95" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><line x1="400" y1="95" x2="510" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Policy port 80 dekhti hai, translated port.</p></div>

<h3>Session table mein saboot</h3>
<pre class="out">FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
tcp     3600   8.8.8.8:57160         -                     203.0.113.3:8080      <span class="hl">10.0.2.10:80</span>

FGT1 # diagnose sys session list
...
orgin-&gt;sink: org pre-&gt;post, reply pre-&gt;post dev=3-&gt;5/5-&gt;3 gwy=10.0.2.10/8.8.8.8
hook=pre dir=org act=dnat 8.8.8.8:57160-&gt;203.0.113.3:8080(10.0.2.10:80)
hook=post dir=reply act=snat 10.0.2.10:80-&gt;8.8.8.8:57160(203.0.113.3:8080)
misc=0 policy_id=2 ...</pre>
<p>Original direction mein <b>dnat</b> hook hai (client ka 8080 80 ban jaata hai), aur reply ko <b>snat</b> hook milta hai taaki jawab 203.0.113.3:8080 se aata dikhe. Yeh chapter 2 ke SNAT session ki mirror image hai.</p>

<h3>Saabit karo ki aur kuch exposed nahi</h3>
<p>Requirement thi ki aur kuch reachable nahi hona chahiye. Use test karo, maan mat lo:</p>
<pre class="out">INET-SRV&gt; curl 203.0.113.3:80
curl: (28) Failed to connect to 203.0.113.3 port 80 after 2001 ms: Timeout was reached
INET-SRV&gt; ping 203.0.113.3
203.0.113.3 icmp_seq=1 timeout
INET-SRV&gt; curl 203.0.113.3:22
curl: (28) Failed to connect to 203.0.113.3 port 22 after 2001 ms: Timeout was reached

FGT1 # diagnose firewall iprope lookup 8.8.8.8 50000 203.0.113.3 22 tcp port1
&lt;src [8.8.8.8-50000] dst [203.0.113.3-22] proto tcp dev port1&gt; <span class="hl">matches policy id: 0</span></pre>
<p>Public address par port 80, ping aur SSH fail hote hain. VIP sirf apna port translate karta hai, aur koi aur traffic kisi policy se match nahi karta, isliye baaki sab implicit deny par girta hai. LAN par asar nahi: PC1 ab bhi policy 1 se browse karta hai.</p>

<h3>Ek address, kai services</h3>
<p>Har public port ke liye ek VIP banao. Jaise <code>WEB-VIP</code> (8080 se 80), <code>SSH-ADMIN-VIP</code> (2222 se 22) aur aise hi, sab extip 203.0.113.3 use karte hue. Agar ek hi policy destination chahiye to unhe <code>config firewall vipgrp</code> se group karo. Address aur extport ke pairs unique hone chahiye.</p>

<div class="eg"><p><b>Worked example.</b> Ek branch ke paas ek public address aur do internal web apps hain, dono port 80 par sunti hain. Aap app A ko 203.0.113.3:8080 se 10.0.2.10:80 par aur app B ko 203.0.113.3:8081 se 10.0.2.11:80 par publish karte ho. Do VIPs, do policies (ya ek group), ek public IP. Customers port se app chunte hain.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Policy service mein mapped port ki jagah external port (8080) use karna; <code>portforward enable</code> bhoolna, jo chupchap full one-to-one mapping chhod deta hai; administrative ports (SSH, RDP) poore internet ko publish karna; port1 ka dstintf lagana; sirf allowed port test karna aur disallowed ports kabhi nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Extport 8080 aur mappedport 80 ke liye policy ko kaunsi service chahiye?" Jawab HTTP (TCP 80) hai, mapped port, kyunki DNAT policy match se pehle lagta hai. Aur session table DESTINATION mein <i>external</i> port aur DESTINATION-NAT mein <i>mapped</i> port dikhata hai.</p></div>

<div class="scn"><h4>"Khula" admin port</h4><p>Ek vendor ko management page reach karna tha, to portforward off wala VIP aur service ALL wali policy "bas weekend ke liye" banayi gayi. Ek automated scan ne public address par SSH khula paya. Engineer ne use ek single required port ke port-forward VIP se replace kiya, source ko vendor ki documented address range 192.0.2.0/28 tak limit kiya aur logtraffic all set kiya. Scan ko phir kuch nahi dikha.</p><p><b>Lesson:</b> sabse chhoti cheez publish karo: ek port, ek source range, logged.</p></div>

<div class="iv"><p class="q">"Server 80 par sunta hai lekin customers ko public port 8080 use karna hai. Kaise configure karoge?"</p><p><code>extip</code>, <code>extintf</code>, <code>mappedip</code>, <code>portforward enable</code>, <code>extport 8080</code> aur <code>mappedport 80</code> ke saath VIP, aur inbound policy jisme VIP destination, DMZ egress aur service HTTP (mapped port) ho, NAT off. Blocked ports test karne aur session list mein DESTINATION-NAT padhne ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>portforward enable</code> aur <code>extport</code>, <code>mappedport</code> VIP ko ek service tak limit karte hain.</li>
<li>Policy service ko mapped port match karna hota hai, kyunki DNAT policy matching se pehle hota hai.</li>
<li>Session table: DESTINATION mein public address aur external port; DESTINATION-NAT mein mapped wale.</li>
<li>Negative cases verify karo: doosre ports aur ping fail hone chahiye.</li>
<li>Ek public IP kai VIPs le sakta hai, har ek ka unique external port.</li>
</ul></div>
`}};export{e as default};