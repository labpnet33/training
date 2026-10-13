var e={id:`static-pat`,h:{en:`Static PAT: port forwarding on the interface address (lab 2)`,hi:`Static PAT: interface address par port forwarding (lab 2)`},body:{en:`
<p>Back to the hotel. The spa has no phone number of its own, so the directory says "call the main number and press 2222". The switchboard then rings the spa's internal extension 22. <b>Static PAT</b> does exactly that: it maps one <b>port</b> on a public address, often the firewall's own outside address, to one port on an internal server. It is what home routers call port forwarding, and it is how a site with a single public IP still publishes services.</p>

<h3>The syntax, word by word</h3>
<pre class="code"><span class="c">! object NAT static PAT</span>
object network JUMP
 host 10.0.2.20
 nat (dmz,outside) static interface service tcp ssh 2222
<span class="c">!                        |          |       |   |    +-- mapped port (what the partner dials)</span>
<span class="c">!                        |          |       |   +------- real port (what the server listens on)</span>
<span class="c">!                        |          |       +----------- protocol</span>
<span class="c">!                        |          +------------------- ports are translated</span>
<span class="c">!                        +------------------------------ mapped address = outside interface IP</span></pre>
<p>The order inside <code>service</code> is <b>real port first, mapped port second</b>, the same real-then-mapped logic as the interface pair. Instead of <code>interface</code> you can write a spare address, for example <code>static 203.0.113.5 service tcp h&#116;tps h&#116;tps</code>, to forward only 443 on .5.</p>
<p>Unlike static NAT, static PAT maps <b>only that one port</b>. Everything else sent to 203.0.113.2 is still handled by the ASA itself or dropped. It is still permanent and bidirectional for that port: the server's replies are sent from 203.0.113.2 port 2222.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Port forwarding">
<rect x="20" y="90" width="140" height="56" rx="8" fill="#bae6fd"/><text x="90" y="114" text-anchor="middle" class="svg-ink" font-size="13">PARTNER</text><text x="90" y="132" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.10</text>
<rect x="250" y="90" width="140" height="56" rx="8" fill="#fed7aa"/><text x="320" y="114" text-anchor="middle" class="svg-ink" font-size="13">NK-ASA</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">outside 203.0.113.2</text>
<rect x="480" y="30" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="550" y="52" text-anchor="middle" class="svg-ink" font-size="13">JUMP :22</text><text x="550" y="70" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.20</text>
<rect x="480" y="160" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="550" y="182" text-anchor="middle" class="svg-ink" font-size="13">WEB :443</text><text x="550" y="200" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.10</text>
<line x1="160" y1="118" x2="250" y2="118" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="108" x2="480" y2="58" stroke="#64748b" stroke-width="2"/><line x1="390" y1="130" x2="480" y2="182" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="205" y="108" text-anchor="middle" class="svg-accent" font-size="12">:2222</text>
<text x="440" y="70" text-anchor="middle" class="svg-accent" font-size="12">2222 to 22</text>
<text x="440" y="185" text-anchor="middle" class="svg-muted" font-size="12">443 to 443</text>
<text x="320" y="228" text-anchor="middle" class="svg-ink" font-size="12">one public IP, services told apart by port</text>
</svg><p class="cap">Two servers can share the outside address as long as each uses a different mapped port.</p></div>

<h3>Lab 2 walkthrough: SSH to JUMP for the partner only</h3>
<p>The brief: the partner 198.51.100.10 needs SSH to JUMP (10.0.2.20). There is no spare public IP in this scenario, and the partner's own firewall only allows destination port 2222 outbound. So we publish JUMP's port 22 as 203.0.113.2 port 2222.</p>
<p><b>Task 1, the static PAT.</b></p>
<pre class="code">NK-ASA# configure terminal
NK-ASA(config)# object network JUMP
NK-ASA(config-network-object)# host 10.0.2.20
NK-ASA(config-network-object)# nat (dmz,outside) static interface service tcp ssh 2222
NK-ASA(config-network-object)# exit</pre>
<p><b>Task 2, the ACL with the real address and the real port.</b> The ACL is checked after the ASA has untranslated 203.0.113.2:2222 to 10.0.2.20:22, so the permit must say <code>object JUMP eq ssh</code>. Restricting the source to the partner is the least-privilege part of the brief:</p>
<pre class="code"><span class="c">! Real IP (object JUMP) and real port (ssh = 22), partner host only</span>
NK-ASA(config)# access-list OUTSIDE_IN extended permit tcp host 198.51.100.10 object JUMP eq ssh
NK-ASA(config)# access-group OUTSIDE_IN in interface outside
NK-ASA(config)# end</pre>
<p>The lab verifies that PARTNER reaches 203.0.113.2 port 2222 and that INET does <b>not</b>.</p>
<p><b>Task 3, prove it with packet-tracer, then connect.</b></p>
<pre class="out">NK-ASA# packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.2 2222

Phase: 1
Type: UN-NAT
Subtype: static
Result: ALLOW
Config:
object network JUMP
 nat (dmz,outside) static interface service tcp ssh 2222
Additional Information:
NAT divert to egress interface dmz
<span class="hl">Untranslate 203.0.113.2/2222 to 10.0.2.20/22</span>

Phase: 2
Type: ACCESS-LIST
Subtype: log
Result: ALLOW
Config:
access-group OUTSIDE_IN in interface outside
access-list OUTSIDE_IN extended permit tcp host 198.51.100.10 object JUMP eq ssh
...
Result:
input-interface: outside
output-interface: dmz
<span class="hl">Action: allow</span></pre>
<p>The UN-NAT phase answers the lab question: 2222 becomes real port <b>22</b>. Then from PARTNER: <code>ssh -p 2222 -l admin 203.0.113.2</code>. While the session is up, <code>show xlate</code> shows the permanent port mapping:</p>
<pre class="out">NK-ASA# show xlate
<span class="hl">TCP PAT from dmz:10.0.2.20 22-22 to outside:203.0.113.2 2222-2222</span>
    flags sr idle 0:00:08 timeout 0:00:00</pre>
<p>Flags <code>s</code> (static) and <code>r</code> (portmap) together mean static PAT.</p>

<h3>Several ports, several servers</h3>
<p>Because one object holds one NAT rule, forwarding two ports of the same server needs two objects with the same host address, for example <code>JUMP-SSH</code> and <code>JUMP-RDP</code>. Different servers can share the interface address freely as long as each mapped port is unique on that address.</p>

<div class="eg"><p><b>Worked example.</b> A branch has only 203.0.113.2. It needs HTTPS to WEB and SSH to JUMP. Object WEB: <code>nat (dmz,outside) static interface service tcp h&#116;tps h&#116;tps</code>. Object JUMP: <code>nat (dmz,outside) static interface service tcp ssh 2222</code>. ACL: <code>permit tcp any object WEB eq h&#116;tps</code> and <code>permit tcp host 198.51.100.10 object JUMP eq ssh</code>. Two services, one address.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forwarding a port the ASA itself already uses on that interface, such as 443 while ASDM or remote-access VPN listens there. The two collide and one of them stops working. Move the management service to another port (for example <code>h&#116;tp server enable 8443</code>) or pick a different mapped port.</p></div>

<div class="exam"><p><b>Exam trap.</b> In <code>service tcp ssh 2222</code>, which port does the server listen on? 22, the first one. Which port does the ACL permit? Also 22, because ACLs use the real address and real port. 2222 appears only in the NAT rule and on the client's command line.</p></div>

<div class="scn"><h4>The ACL that permitted the wrong port</h4><p>A contractor needed RDP to a server published as 203.0.113.2 port 33890. The engineer wrote the ACL as <code>permit tcp any object RDP-SRV eq 33890</code>. <code>packet-tracer</code> showed UN-NAT to 10.0.2.30/3389 followed by an ACCESS-LIST drop on the Implicit Rule. Changing the permit to the real port 3389, and restricting the source to the contractor's address, fixed it.</p><p><b>Lesson:</b> after the UN-NAT phase only the real address and real port exist; write the ACL for those.</p></div>

<div class="iv"><p class="q">"You have one public IP. How do you publish SSH on a DMZ server using port 2222?"</p><p>Object NAT with <code>nat (dmz,outside) static interface service tcp ssh 2222</code>, then an ACL permitting the source you trust to the object's real address on <code>eq ssh</code>, applied inbound on outside. Verify with packet-tracer (Untranslate 203.0.113.2/2222 to 10.0.2.20/22) and <code>show xlate</code> flags sr. Mention conflicts with ASA services on the same port.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static PAT maps one port of a public address, often the interface IP, to one port of a server.</li>
<li><code>service tcp REAL MAPPED</code>: real port first, mapped port second.</li>
<li>The ACL permits the real IP and the real port, and should restrict the source where possible.</li>
<li>One NAT rule per object: two ports of one server need two objects.</li>
<li>Avoid mapped ports the ASA itself uses on that interface.</li>
</ul></div>
`,hi:`
<p>Wapas hotel par. Spa ka apna phone number nahi hai, isliye directory kehti hai "main number call karo aur 2222 dabao". Phir switchboard spa ka internal extension 22 bajata hai. <b>Static PAT</b> bilkul yahi karta hai: yeh public address ke ek <b>port</b> ko, aksar firewall ke apne outside address ko, internal server ke ek port par map karta hai. Home routers ise port forwarding kehte hain, aur isi tarah ek public IP wali site bhi services publish karti hai.</p>

<h3>Syntax, shabd dar shabd</h3>
<pre class="code"><span class="c">! object NAT static PAT</span>
object network JUMP
 host 10.0.2.20
 nat (dmz,outside) static interface service tcp ssh 2222
<span class="c">!                        |          |       |   |    +-- mapped port (jo partner dial karta hai)</span>
<span class="c">!                        |          |       |   +------- real port (jis par server sunta hai)</span>
<span class="c">!                        |          |       +----------- protocol</span>
<span class="c">!                        |          +------------------- ports translate hote hain</span>
<span class="c">!                        +------------------------------ mapped address = outside interface IP</span></pre>
<p><code>service</code> ke andar order hai <b>pehle real port, phir mapped port</b>, interface pair jaisa hi real-phir-mapped logic. <code>interface</code> ki jagah aap spare address likh sakte ho, jaise <code>static 203.0.113.5 service tcp h&#116;tps h&#116;tps</code>, taaki .5 par sirf 443 forward ho.</p>
<p>Static NAT ke ulat, static PAT <b>sirf woh ek port</b> map karta hai. 203.0.113.2 par bheja gaya baaki sab ab bhi ASA khud handle karta hai ya drop hota hai. Us port ke liye yeh phir bhi permanent aur bidirectional hai: server ke replies 203.0.113.2 port 2222 se bheje jaate hain.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Port forwarding">
<rect x="20" y="90" width="140" height="56" rx="8" fill="#bae6fd"/><text x="90" y="114" text-anchor="middle" class="svg-ink" font-size="13">PARTNER</text><text x="90" y="132" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.10</text>
<rect x="250" y="90" width="140" height="56" rx="8" fill="#fed7aa"/><text x="320" y="114" text-anchor="middle" class="svg-ink" font-size="13">NK-ASA</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">outside 203.0.113.2</text>
<rect x="480" y="30" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="550" y="52" text-anchor="middle" class="svg-ink" font-size="13">JUMP :22</text><text x="550" y="70" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.20</text>
<rect x="480" y="160" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="550" y="182" text-anchor="middle" class="svg-ink" font-size="13">WEB :443</text><text x="550" y="200" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.10</text>
<line x1="160" y1="118" x2="250" y2="118" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="108" x2="480" y2="58" stroke="#64748b" stroke-width="2"/><line x1="390" y1="130" x2="480" y2="182" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="205" y="108" text-anchor="middle" class="svg-accent" font-size="12">:2222</text>
<text x="440" y="70" text-anchor="middle" class="svg-accent" font-size="12">2222 se 22</text>
<text x="440" y="185" text-anchor="middle" class="svg-muted" font-size="12">443 se 443</text>
<text x="320" y="228" text-anchor="middle" class="svg-ink" font-size="12">ek public IP, services port se pehchani jaati hain</text>
</svg><p class="cap">Do servers outside address share kar sakte hain jab tak har ek alag mapped port use kare.</p></div>

<h3>Lab 2 walkthrough: sirf partner ke liye JUMP par SSH</h3>
<p>Brief: partner 198.51.100.10 ko JUMP (10.0.2.20) par SSH chahiye. Is scenario mein koi spare public IP nahi hai, aur partner ka apna firewall bahar sirf destination port 2222 allow karta hai. Isliye hum JUMP ka port 22 ko 203.0.113.2 port 2222 ki tarah publish karte hain.</p>
<p><b>Task 1, static PAT.</b></p>
<pre class="code">NK-ASA# configure terminal
NK-ASA(config)# object network JUMP
NK-ASA(config-network-object)# host 10.0.2.20
NK-ASA(config-network-object)# nat (dmz,outside) static interface service tcp ssh 2222
NK-ASA(config-network-object)# exit</pre>
<p><b>Task 2, real address aur real port wali ACL.</b> ACL tab check hoti hai jab ASA 203.0.113.2:2222 ko 10.0.2.20:22 par untranslate kar chuka hota hai, isliye permit mein <code>object JUMP eq ssh</code> hona chahiye. Source ko partner tak limit karna brief ka least-privilege hissa hai:</p>
<pre class="code"><span class="c">! Real IP (object JUMP) aur real port (ssh = 22), sirf partner host</span>
NK-ASA(config)# access-list OUTSIDE_IN extended permit tcp host 198.51.100.10 object JUMP eq ssh
NK-ASA(config)# access-group OUTSIDE_IN in interface outside
NK-ASA(config)# end</pre>
<p>Lab verify karta hai ki PARTNER 203.0.113.2 port 2222 tak pahunchta hai aur INET <b>nahi</b> pahunchta.</p>
<p><b>Task 3, packet-tracer se saabit karo, phir connect karo.</b></p>
<pre class="out">NK-ASA# packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.2 2222

Phase: 1
Type: UN-NAT
Subtype: static
Result: ALLOW
Config:
object network JUMP
 nat (dmz,outside) static interface service tcp ssh 2222
Additional Information:
NAT divert to egress interface dmz
<span class="hl">Untranslate 203.0.113.2/2222 to 10.0.2.20/22</span>

Phase: 2
Type: ACCESS-LIST
Subtype: log
Result: ALLOW
Config:
access-group OUTSIDE_IN in interface outside
access-list OUTSIDE_IN extended permit tcp host 198.51.100.10 object JUMP eq ssh
...
Result:
input-interface: outside
output-interface: dmz
<span class="hl">Action: allow</span></pre>
<p>UN-NAT phase lab ke sawaal ka jawab deta hai: 2222 real port <b>22</b> ban jaata hai. Phir PARTNER se: <code>ssh -p 2222 -l admin 203.0.113.2</code>. Session up rehte hue <code>show xlate</code> permanent port mapping dikhata hai:</p>
<pre class="out">NK-ASA# show xlate
<span class="hl">TCP PAT from dmz:10.0.2.20 22-22 to outside:203.0.113.2 2222-2222</span>
    flags sr idle 0:00:08 timeout 0:00:00</pre>
<p>Flags <code>s</code> (static) aur <code>r</code> (portmap) saath mein static PAT ka matlab hain.</p>

<h3>Kai ports, kai servers</h3>
<p>Kyunki ek object mein ek NAT rule hoti hai, same server ke do ports forward karne ke liye same host address wale do objects chahiye, jaise <code>JUMP-SSH</code> aur <code>JUMP-RDP</code>. Alag servers interface address aaram se share kar sakte hain jab tak us address par har mapped port unique ho.</p>

<div class="eg"><p><b>Worked example.</b> Ek branch ke paas sirf 203.0.113.2 hai. Use WEB tak HTTPS aur JUMP tak SSH chahiye. Object WEB: <code>nat (dmz,outside) static interface service tcp h&#116;tps h&#116;tps</code>. Object JUMP: <code>nat (dmz,outside) static interface service tcp ssh 2222</code>. ACL: <code>permit tcp any object WEB eq h&#116;tps</code> aur <code>permit tcp host 198.51.100.10 object JUMP eq ssh</code>. Do services, ek address.</p></div>

<div class="warn"><p><b>Common galti.</b> Woh port forward karna jo ASA khud us interface par pehle se use karta hai, jaise 443 jab ASDM ya remote-access VPN wahan sun raha ho. Dono takraate hain aur unmein se ek kaam karna band kar deta hai. Management service ko doosre port par le jao (jaise <code>h&#116;tp server enable 8443</code>) ya alag mapped port chuno.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>service tcp ssh 2222</code> mein server kis port par sunta hai? 22, pehla wala. ACL kaunsa port permit karti hai? Woh bhi 22, kyunki ACLs real address aur real port use karti hain. 2222 sirf NAT rule mein aur client ki command line par dikhta hai.</p></div>

<div class="scn"><h4>Woh ACL jisne galat port permit kiya</h4><p>Ek contractor ko 203.0.113.2 port 33890 par published server par RDP chahiye tha. Engineer ne ACL likhi <code>permit tcp any object RDP-SRV eq 33890</code>. <code>packet-tracer</code> ne 10.0.2.30/3389 par UN-NAT aur uske baad Implicit Rule par ACCESS-LIST drop dikhaya. Permit ko real port 3389 par badalne, aur source ko contractor ke address tak limit karne se theek hua.</p><p><b>Seekh:</b> UN-NAT phase ke baad sirf real address aur real port exist karte hain; ACL unke liye likho.</p></div>

<div class="iv"><p class="q">"Aapke paas ek public IP hai. DMZ server par SSH ko port 2222 use karke kaise publish karoge?"</p><p><code>nat (dmz,outside) static interface service tcp ssh 2222</code> ke saath object NAT, phir ek ACL jo trusted source ko object ke real address par <code>eq ssh</code> permit kare, outside par inbound lagi ho. Packet-tracer (Untranslate 203.0.113.2/2222 to 10.0.2.20/22) aur <code>show xlate</code> flags sr se verify karo. Same port par ASA services ke saath conflicts batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static PAT public address ke ek port ko, aksar interface IP ko, server ke ek port par map karta hai.</li>
<li><code>service tcp REAL MAPPED</code>: pehle real port, phir mapped port.</li>
<li>ACL real IP aur real port permit karti hai, aur jahan ho sake source limit karni chahiye.</li>
<li>Ek object mein ek NAT rule: ek server ke do ports ke liye do objects chahiye.</li>
<li>Woh mapped ports avoid karo jo ASA khud us interface par use karta hai.</li>
</ul></div>
`}};export{e as default};