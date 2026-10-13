var e={id:`virtual-router`,h:{en:`The virtual router: virtual IP, virtual MAC and gratuitous ARP`,hi:`Virtual router: virtual IP, virtual MAC aur gratuitous ARP`},body:{en:`
<p>Think of a company mobile number that is forwarded to whoever is on call this week. Customers save one number. The SIM card physically moves from one engineer's phone to another's when the shift changes, and the phone network is told "this number is now on this tower". The number (IP) and the SIM identity (MAC) stay the same; only the person holding them changes. That is exactly how an FHRP virtual router works.</p>

<h3>Two addresses per router, plus two shared ones</h3>
<p>In the lab, each router keeps its own <b>real</b> interface address: R1 is <code>192.168.10.2</code>, R2 is <code>192.168.10.3</code>. Those addresses are used for management, for OSPF, and for the FHRP hellos themselves. On top of that, the group defines:</p>
<dl class="terms">
<dt>Virtual IP (VIP)</dt><dd>A spare address in the same subnet, here <code>192.168.10.1</code>. Hosts use it as their default gateway. With HSRP it must not be the real address of any router in the group.</dd>
<dt>Virtual MAC (VMAC)</dt><dd>A MAC address that does not belong to any physical NIC. It is built from a fixed prefix plus the group number. For HSRP version 1 group 10 it is <code>0000.0c07.ac0a</code> (10 decimal = 0a hex).</dd>
<dt>Group</dt><dd>The set of routers that share one VIP and VMAC. The group number must match on every member, because it is part of the virtual MAC.</dd>
</dl>

<h3>Step by step: how a PC reaches the web server</h3>
<ol>
<li>PC1 (<code>192.168.10.11</code>) wants <code>203.0.113.10</code>. It is not in PC1's subnet, so PC1 must send the frame to its gateway <code>192.168.10.1</code>.</li>
<li>PC1 broadcasts an ARP request: "who has 192.168.10.1?"</li>
<li>Both routers receive it, but only the router currently <b>on duty</b> (HSRP Active) answers, and it answers with the <b>virtual MAC</b> <code>0000.0c07.ac0a</code>, not with its own burned-in MAC.</li>
<li>PC1 caches 192.168.10.1 = 0000.0c07.ac0a and sends the packet in a frame addressed to that MAC.</li>
<li>SW1 forwards the frame out of the port where it last learned 0000.0c07.ac0a, the port toward R1. The Active router sources its HSRP hellos from the virtual MAC, which keeps that switch entry fresh.</li>
<li>R1 routes the packet to CORE, CORE delivers it to WEB. The reply comes back through whatever path the routing protocol chooses; the FHRP only controls the outbound first hop.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="ARP for the virtual IP before and after failover">
<rect x="20" y="20" width="280" height="36" rx="8" fill="#bbf7d0"/><text x="160" y="43" text-anchor="middle" class="svg-ink" font-size="13">PC1 ARP cache (never changes)</text>
<rect x="20" y="62" width="280" height="30" rx="6" fill="#e2e8f0"/><text x="160" y="82" text-anchor="middle" class="svg-ink" font-size="13">192.168.10.1 = 0000.0c07.ac0a</text>
<rect x="340" y="20" width="280" height="36" rx="8" fill="#bae6fd"/><text x="480" y="43" text-anchor="middle" class="svg-ink" font-size="13">SW1 MAC table for the VMAC</text>
<rect x="340" y="62" width="130" height="30" rx="6" fill="#e2e8f0"/><text x="405" y="82" text-anchor="middle" class="svg-ink" font-size="12">before: Gi0/1 (R1)</text>
<rect x="490" y="62" width="130" height="30" rx="6" fill="#fde68a"/><text x="555" y="82" text-anchor="middle" class="svg-ink" font-size="12">after: Gi0/2 (R2)</text>
<rect x="60" y="150" width="200" height="50" rx="8" fill="#bae6fd"/><text x="160" y="171" text-anchor="middle" class="svg-ink" font-size="14">R1 Active</text><text x="160" y="189" text-anchor="middle" class="svg-muted" font-size="12">fails, goes silent</text>
<rect x="380" y="150" width="200" height="50" rx="8" fill="#fde68a"/><text x="480" y="171" text-anchor="middle" class="svg-ink" font-size="14">R2 becomes Active</text><text x="480" y="189" text-anchor="middle" class="svg-muted" font-size="12">sends gratuitous ARP</text>
<line x1="260" y1="175" x2="380" y2="175" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">hold time expires</text>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Gratuitous ARP: sender 192.168.10.1 / 0000.0c07.ac0a, sent to broadcast</text>
</svg><p class="cap">After failover the host's ARP entry stays the same; only the switch's MAC table moves the VMAC to R2's port.</p></div>

<h3>What happens at failover: gratuitous ARP</h3>
<p>When R1 fails, R2 stops receiving R1's hellos. After the hold time R2 declares itself Active. It now owns the VIP and the VMAC. But SW1 still believes 0000.0c07.ac0a lives on port Gi0/1, toward the dead R1. Frames from the PCs would go nowhere until that entry aged out (five minutes by default).</p>
<p>So the new Active router immediately sends a <b>gratuitous ARP</b>: an ARP message that nobody asked for, announcing "192.168.10.1 is at 0000.0c07.ac0a", sent to the broadcast address with the virtual MAC as the source. Every switch on the way learns the VMAC on the new port. The PCs already have the same mapping in their ARP cache, so they simply keep sending, and their frames now land on R2.</p>
<p>This is the whole trick: because the MAC does not change, <b>no host has to re-ARP</b>. Only the switches have to learn a new port, and gratuitous ARP tells them at once.</p>

<h3>What you see on the devices</h3>
<pre class="out">PC1&gt; arp
<span class="hl">00:00:0c:07:ac:0a  192.168.10.1 expires in 112 seconds</span>

SW1# show mac address-table address 0000.0c07.ac0a
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
<span class="hl">   1    0000.0c07.ac0a    DYNAMIC     Gi0/1</span>
Total Mac Addresses for this criterion: 1</pre>
<p>After a failover, the PC line stays identical and the switch line shows <code>Gi0/2</code>.</p>

<div class="eg"><p><b>Worked example.</b> Group 25 in HSRP version 1: 25 decimal = 19 hex, so the VMAC is <code>0000.0c07.ac19</code>. Group 200: 200 = c8 hex, VMAC <code>0000.0c07.acc8</code>. If a router answers ARP for the gateway with its own burned-in MAC, for example <code>5254.0012.0a01</code>, the gateway is <b>not</b> protected by an FHRP: when that router dies, hosts keep sending to a MAC that no longer exists until their ARP entry expires.</p></div>

<div class="warn"><p><b>Common mistake.</b> Pointing hosts (or the DHCP <code>default-router</code>) at a router's real address, for example 192.168.10.2, instead of the VIP. HSRP is running, <code>show standby</code> looks perfect, and failover still breaks every user. Always check the gateway that the hosts actually use.</p></div>

<div class="exam"><p><b>Exam trap.</b> Hosts learn the <b>virtual MAC</b> for the gateway, not the Active router's physical MAC. A question that asks "what MAC address does PC1 have in its ARP cache for the default gateway?" wants the VMAC. And gratuitous ARP updates <b>switch MAC tables</b>; the host ARP cache does not need to change.</p></div>

<div class="scn"><h4>Five minutes of silence after every failover</h4><p>A college lab ran a home-made script that moved the gateway address between two routers with <code>ip address</code> commands. Every test caused about five minutes of outage. The engineer checked the PCs and saw the old physical MAC of the dead router still in their ARP cache, and the switches still pointed at the old port. Replacing the script with HSRP gave a shared virtual MAC and a gratuitous ARP on takeover; the outage dropped to a few seconds.</p><p><b>Lesson:</b> moving an IP is not enough; the MAC must move too, and the switches must be told.</p></div>

<div class="iv"><p class="q">"Walk me through what happens at Layer 2 when the HSRP Active router fails."</p><p>Strong answer: the Standby stops hearing hellos, waits for the hold time, and becomes Active. It takes over the VIP and the same virtual MAC, then sends gratuitous ARPs sourced from the VMAC so switches update their MAC tables to its port. Hosts keep the same ARP entry for the gateway, so they do not re-ARP; their frames simply arrive at the new router. Mention that the real interface IPs never change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Each router keeps its real IP; the group adds a shared VIP and a shared virtual MAC.</li>
<li>Only the on-duty router answers ARP for the VIP, and it answers with the virtual MAC.</li>
<li>The HSRP version 1 VMAC is 0000.0c07.acXX, XX = group in hex; group 10 gives ac0a.</li>
<li>At failover the new router sends gratuitous ARP so switches move the VMAC to its port.</li>
<li>Hosts never re-ARP and never change configuration.</li>
</ul></div>
`,hi:`
<p>Ek company ka mobile number socho jo us hafte on-call engineer ko forward hota hai. Customers ek hi number save karte hain. Shift badalne par SIM card physically ek engineer ke phone se doosre ke phone mein chala jaata hai, aur phone network ko bataya jaata hai "yeh number ab is tower par hai". Number (IP) aur SIM identity (MAC) same rehte hain; bas unhe pakadne wala insaan badalta hai. FHRP virtual router bilkul aise hi kaam karta hai.</p>

<h3>Har router ke do addresses, plus do shared</h3>
<p>Lab mein har router apna <b>asli</b> interface address rakhta hai: R1 <code>192.168.10.2</code> hai, R2 <code>192.168.10.3</code>. Yeh addresses management, OSPF, aur khud FHRP hellos ke liye use hote hain. Iske upar group yeh define karta hai:</p>
<dl class="terms">
<dt>Virtual IP (VIP)</dt><dd>Same subnet ka ek khaali address, yahan <code>192.168.10.1</code>. Hosts ise default gateway ki tarah use karte hain. HSRP mein yeh group ke kisi router ka asli address nahi hona chahiye.</dd>
<dt>Virtual MAC (VMAC)</dt><dd>Ek MAC address jo kisi physical NIC ka nahi hai. Yeh ek fixed prefix plus group number se banta hai. HSRP version 1 group 10 ke liye yeh <code>0000.0c07.ac0a</code> hai (10 decimal = 0a hex).</dd>
<dt>Group</dt><dd>Routers ka woh set jo ek VIP aur VMAC share karta hai. Group number har member par match hona chahiye, kyunki yeh virtual MAC ka hissa hai.</dd>
</dl>

<h3>Step by step: PC web server tak kaise pahunchta hai</h3>
<ol>
<li>PC1 (<code>192.168.10.11</code>) ko <code>203.0.113.10</code> chahiye. Yeh PC1 ke subnet mein nahi hai, isliye PC1 ko frame apne gateway <code>192.168.10.1</code> ko bhejna hoga.</li>
<li>PC1 ek ARP request broadcast karta hai: "192.168.10.1 kiske paas hai?"</li>
<li>Dono routers ise receive karte hain, lekin sirf woh router jo abhi <b>duty par</b> hai (HSRP Active) jawab deta hai, aur <b>virtual MAC</b> <code>0000.0c07.ac0a</code> ke saath jawab deta hai, apne burned-in MAC ke saath nahi.</li>
<li>PC1 192.168.10.1 = 0000.0c07.ac0a cache karta hai aur packet ko us MAC par addressed frame mein bhejta hai.</li>
<li>SW1 frame ko us port se bahar bhejta hai jahan usne 0000.0c07.ac0a aakhri baar seekha tha, yaani R1 wala port. Active router apne HSRP hellos virtual MAC se source karta hai, jisse switch ki woh entry fresh rehti hai.</li>
<li>R1 packet ko CORE ki taraf route karta hai, CORE use WEB tak deliver karta hai. Reply us path se wapas aata hai jo routing protocol chune; FHRP sirf outbound first hop control karta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Failover se pehle aur baad virtual IP ka ARP">
<rect x="20" y="20" width="280" height="36" rx="8" fill="#bbf7d0"/><text x="160" y="43" text-anchor="middle" class="svg-ink" font-size="13">PC1 ARP cache (kabhi nahi badalta)</text>
<rect x="20" y="62" width="280" height="30" rx="6" fill="#e2e8f0"/><text x="160" y="82" text-anchor="middle" class="svg-ink" font-size="13">192.168.10.1 = 0000.0c07.ac0a</text>
<rect x="340" y="20" width="280" height="36" rx="8" fill="#bae6fd"/><text x="480" y="43" text-anchor="middle" class="svg-ink" font-size="13">VMAC ke liye SW1 MAC table</text>
<rect x="340" y="62" width="130" height="30" rx="6" fill="#e2e8f0"/><text x="405" y="82" text-anchor="middle" class="svg-ink" font-size="12">pehle: Gi0/1 (R1)</text>
<rect x="490" y="62" width="130" height="30" rx="6" fill="#fde68a"/><text x="555" y="82" text-anchor="middle" class="svg-ink" font-size="12">baad: Gi0/2 (R2)</text>
<rect x="60" y="150" width="200" height="50" rx="8" fill="#bae6fd"/><text x="160" y="171" text-anchor="middle" class="svg-ink" font-size="14">R1 Active</text><text x="160" y="189" text-anchor="middle" class="svg-muted" font-size="12">fail, chup ho gaya</text>
<rect x="380" y="150" width="200" height="50" rx="8" fill="#fde68a"/><text x="480" y="171" text-anchor="middle" class="svg-ink" font-size="14">R2 Active banta hai</text><text x="480" y="189" text-anchor="middle" class="svg-muted" font-size="12">gratuitous ARP bhejta hai</text>
<line x1="260" y1="175" x2="380" y2="175" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">hold time khatam</text>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Gratuitous ARP: sender 192.168.10.1 / 0000.0c07.ac0a, broadcast par</text>
</svg><p class="cap">Failover ke baad host ki ARP entry same rehti hai; sirf switch ki MAC table VMAC ko R2 ke port par le jaati hai.</p></div>

<h3>Failover par kya hota hai: gratuitous ARP</h3>
<p>Jab R1 fail hota hai, R2 ko R1 ke hellos milna band ho jaate hain. Hold time ke baad R2 khud ko Active declare karta hai. Ab VIP aur VMAC uske paas hain. Lekin SW1 abhi bhi maanta hai ki 0000.0c07.ac0a port Gi0/1 par hai, mare hue R1 ki taraf. PCs ke frames kahin nahi jaayenge jab tak woh entry age out na ho (default mein paanch minute).</p>
<p>Isliye naya Active router turant ek <b>gratuitous ARP</b> bhejta hai: ek ARP message jo kisi ne maanga nahi, jo announce karta hai "192.168.10.1 0000.0c07.ac0a par hai", broadcast address par, virtual MAC ko source rakh kar. Raaste ka har switch VMAC ko naye port par seekh leta hai. PCs ke ARP cache mein pehle se same mapping hai, isliye woh bas bhejte rehte hain, aur unke frames ab R2 par pahunchte hain.</p>
<p>Poori trick yahi hai: kyunki MAC nahi badalta, <b>kisi host ko dobara ARP nahi karna padta</b>. Sirf switches ko naya port seekhna padta hai, aur gratuitous ARP unhe turant bata deta hai.</p>

<h3>Devices par kya dikhta hai</h3>
<pre class="out">PC1&gt; arp
<span class="hl">00:00:0c:07:ac:0a  192.168.10.1 expires in 112 seconds</span>

SW1# show mac address-table address 0000.0c07.ac0a
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
<span class="hl">   1    0000.0c07.ac0a    DYNAMIC     Gi0/1</span>
Total Mac Addresses for this criterion: 1</pre>
<p>Failover ke baad PC wali line bilkul same rehti hai aur switch wali line <code>Gi0/2</code> dikhati hai.</p>

<div class="eg"><p><b>Worked example.</b> HSRP version 1 mein group 25: 25 decimal = 19 hex, isliye VMAC <code>0000.0c07.ac19</code> hai. Group 200: 200 = c8 hex, VMAC <code>0000.0c07.acc8</code>. Agar koi router gateway ke ARP ka jawab apne burned-in MAC se deta hai, jaise <code>5254.0012.0a01</code>, to gateway FHRP se protected <b>nahi</b> hai: jab woh router marta hai, hosts us MAC par bhejte rehte hain jo ab exist nahi karta, jab tak unki ARP entry expire na ho.</p></div>

<div class="warn"><p><b>Common galti.</b> Hosts (ya DHCP <code>default-router</code>) ko VIP ki jagah router ke asli address, jaise 192.168.10.2, ki taraf point karna. HSRP chal raha hai, <code>show standby</code> perfect dikhta hai, phir bhi failover har user ko tod deta hai. Hamesha woh gateway check karo jo hosts asal mein use kar rahe hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Hosts gateway ke liye <b>virtual MAC</b> seekhte hain, Active router ka physical MAC nahi. Agar question poochhe "PC1 ki ARP cache mein default gateway ke liye kaunsa MAC hai?", to jawab VMAC hai. Aur gratuitous ARP <b>switch MAC tables</b> update karta hai; host ARP cache ko badalne ki zaroorat nahi.</p></div>

<div class="scn"><h4>Har failover ke baad paanch minute ka sannata</h4><p>Ek college lab ek ghar ka banaya script chalata tha jo <code>ip address</code> commands se gateway address ko do routers ke beech move karta tha. Har test mein lagbhag paanch minute ka outage hota tha. Engineer ne PCs check kiye aur dekha ki unki ARP cache mein mare hue router ka purana physical MAC abhi bhi tha, aur switches abhi bhi purane port ki taraf point kar rahe the. Script ki jagah HSRP lagane se shared virtual MAC aur takeover par gratuitous ARP mila; outage kuch seconds ka reh gaya.</p><p><b>Seekh:</b> sirf IP move karna kaafi nahi; MAC ko bhi move hona chahiye, aur switches ko batana chahiye.</p></div>

<div class="iv"><p class="q">"Jab HSRP Active router fail hota hai to Layer 2 par kya hota hai, step by step batao."</p><p>Strong answer: Standby ko hellos sunna band ho jaata hai, woh hold time wait karta hai, aur Active ban jaata hai. Woh VIP aur wahi virtual MAC le leta hai, phir VMAC se sourced gratuitous ARPs bhejta hai taaki switches apni MAC tables ko uske port par update karein. Hosts gateway ki wahi ARP entry rakhte hain, isliye dobara ARP nahi karte; unke frames bas naye router par pahunchne lagte hain. Batao ki asli interface IPs kabhi nahi badalte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har router apna asli IP rakhta hai; group ek shared VIP aur ek shared virtual MAC jodta hai.</li>
<li>Sirf duty wala router VIP ke ARP ka jawab deta hai, aur virtual MAC ke saath deta hai.</li>
<li>HSRP version 1 VMAC 0000.0c07.acXX hai, XX = group hex mein; group 10 se ac0a banta hai.</li>
<li>Failover par naya router gratuitous ARP bhejta hai taaki switches VMAC ko uske port par le jaayein.</li>
<li>Hosts kabhi dobara ARP nahi karte aur kabhi configuration nahi badalte.</li>
</ul></div>
`}};export{e as default};