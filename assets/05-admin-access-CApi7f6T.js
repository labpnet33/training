var e={id:`admin-access`,h:{en:`Administrative access: allowaccess, ports and trusted hosts`,hi:`Administrative access: allowaccess, ports aur trusted hosts`},body:{en:`
<p>There are two kinds of traffic on a firewall, and they follow different rules. <b>Traffic through the firewall</b> (a PC reaching a web server) is judged by firewall policies. <b>Traffic to the firewall itself</b> (an admin opening the GUI, a monitoring system pinging it) is judged by the <b>allowaccess</b> setting of the interface it arrives on. This is the most common source of "I can browse but I cannot manage the box" tickets.</p>
<h3>The allowaccess values</h3>
<table class="cmp"><tr><th>Value</th><th>Service</th></tr>
<tr><td><code>ping</code></td><td>the interface answers ICMP echo</td></tr>
<tr><td><code>h&#116;tps</code></td><td>the HTTPS admin service (GUI), TCP 443 by default</td></tr>
<tr><td><code>ssh</code></td><td>the SSH admin service, TCP 22 by default</td></tr>
<tr><td><code>h&#116;tp</code></td><td>unencrypted GUI; avoid it</td></tr>
<tr><td><code>telnet</code></td><td>unencrypted CLI; avoid it</td></tr>
<tr><td><code>snmp</code></td><td>SNMP monitoring</td></tr>
<tr><td><code>fgfm</code></td><td>FortiManager management channel</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Through traffic uses policies; to-the-box traffic uses allowaccess"><rect x="10" y="20" width="130" height="55" rx="9" fill="#e2e8f0"/><text x="75" y="52.5" text-anchor="middle" class="svg-ink" font-size="13">PC1 10.0.1.10</text><rect x="10" y="115" width="130" height="55" rx="9" fill="#e2e8f0"/><text x="75" y="147.5" text-anchor="middle" class="svg-ink" font-size="13">Admin 10.0.1.50</text><rect x="250" y="55" width="150" height="90" rx="9" fill="#fde68a"/><text x="325" y="97" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="325" y="114" text-anchor="middle" class="svg-muted" font-size="11">port2</text><rect x="510" y="20" width="120" height="55" rx="9" fill="#bbf7d0"/><text x="570" y="52.5" text-anchor="middle" class="svg-ink" font-size="13">Web server</text><line x1="140" y1="47" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><text x="195" y="60" text-anchor="middle" class="svg-accent" font-size="11">through: policy</text><line x1="140" y1="142" x2="250" y2="115" stroke="#64748b" stroke-width="2"/><text x="195" y="140" text-anchor="middle" class="svg-accent" font-size="11">to: allowaccess</text><line x1="400" y1="85" x2="510" y2="47" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Through traffic uses policies; to-the-box traffic uses allowaccess</p></div>
<h3>Principles of good access design</h3>
<ul>
<li><b>Least privilege.</b> Allow only the services each interface needs. The LAN may need ping, HTTPS and SSH. The WAN needs ping at most, and often nothing.</li>
<li><b>Encrypted only.</b> Prefer HTTPS and SSH to HTTP and Telnet.</li>
<li><b>Separate management when you can.</b> A dedicated management port or VLAN is easier to protect than the user LAN.</li>
<li><b>Layer the controls.</b> allowaccess opens the door; the admin account's trusted hosts, a strong password and an idle timeout lock it.</li>
</ul>
<p>The brief for the second lab found a WAN that answers HTTPS, SSH and HTTP. The ticket's before and after, in real output:</p>
<pre class="out">NK-PUNE-FGT # show system interface port1
    edit "port1"
        set ip 203.0.113.2 255.255.255.252
        set allowaccess ping <span class="hl">h&#116;tps ssh h&#116;tp</span>
        set alias "WAN"
        set role wan

NK-PUNE-FGT # show system interface port2
    edit "port2"
        set ip 10.0.1.1 255.255.255.0
        set allowaccess <span class="hl">ssh</span>
        set alias "LAN"
        set role lan</pre>
<p>The WAN is overexposed, the LAN is underexposed. The repair keeps the LAN's existing SSH with <code>append</code> and trims the WAN with <code>set</code> (where replacing is exactly what you want):</p>
<pre class="code">NK-PUNE-FGT # config system interface
NK-PUNE-FGT (interface) # edit port2
NK-PUNE-FGT (port2) # append allowaccess ping h&#116;tps
NK-PUNE-FGT (port2) # next
NK-PUNE-FGT (interface) # edit port1
NK-PUNE-FGT (port1) # set allowaccess ping
NK-PUNE-FGT (port1) # end</pre>
<pre class="out">NK-PUNE-FGT # show system interface port2
        set allowaccess <span class="hl">ssh ping h&#116;tps</span>
NK-PUNE-FGT # show system interface port1
        set allowaccess <span class="hl">ping</span>

PC1&gt; ping 10.0.1.1
84 bytes from 10.0.1.1 icmp_seq=1 ttl=64 time=0.500 ms</pre>
<p>Note the order <code>ssh ping h&#116;tps</code>: <code>append</code> adds to the end and order is not important. The PC now reaches the gateway. A second layer, the <b>trusted host</b> of the admin account (chapter 3), then limits which sources may log in even if an interface allows the service.</p>
<div class="eg"><p><b>Worked example.</b> A monitoring server at 10.0.1.60 needs SNMP on port2 only. You run <code>append allowaccess snmp</code> on port2. Port1 stays at ping, so a scanner on the internet sees no SNMP. If the monitoring needs ping from the ISP, allow ping on port1 and nothing more.</p></div>
<div class="warn"><p><b>Common mistake.</b> Opening HTTPS or SSH on the WAN "temporarily" and forgetting it. Management services on the internet are scanned constantly. If remote administration is needed, restrict it with trusted hosts, a non-default port or, better, a VPN.</p></div>
<div class="exam"><p><b>Exam trap.</b> If users can browse but the GUI or ping to the firewall fails, check <b>allowaccess</b> before policies. Also know that the admin port of the HTTPS service is changed under <code>config system global</code> (admin-sport).</p></div>
<div class="scn"><h4>The audit finding</h4><p>An external audit found that a branch FortiGate answered the HTTPS admin service from the internet. The WAN had allowaccess ping h&#116;tps ssh h&#116;tp from a long-ago "temporary" troubleshooting session. The team reduced it to ping, enabled trusted hosts for admins and added a quarterly check of every WAN interface for extra allowaccess values.</p><p><b>Lesson:</b> audit for exposed management as a routine, not a surprise.</p></div>
<div class="iv"><p class="q">"Where is administrative access controlled on a FortiGate?"</p><p>On each interface with allowaccess, which decides which management services answer there; on each administrator account with trusted hosts and profile; and globally with admin ports, timeouts and HTTPS settings in system global. Policies do not control access to the box itself. I allow only what is required, keep it off the WAN and prefer HTTPS and SSH.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Through traffic uses policy; to-the-box traffic uses allowaccess.</li>
<li>Allow the least: LAN may manage, WAN ping at most.</li>
<li>Use append on lists; set replaces.</li>
<li>Trusted hosts add a second gate on the admin account.</li>
</ul></div>
`,hi:`
<p>Firewall par do tarah ka traffic hota hai, aur dono ke rules alag hain. <b>Firewall ke through traffic</b> (PC ka web server tak pahunchna) firewall policies se judge hota hai. <b>Firewall tak jaane wala traffic</b> (admin ka GUI kholna, monitoring system ka ping) us interface ke <b>allowaccess</b> setting se judge hota hai jis par woh aata hai. "Browse ho jaata hai par box manage nahi hota" tickets ka yeh sabse common source hai.</p>
<h3>allowaccess ki values</h3>
<table class="cmp"><tr><th>Value</th><th>Service</th></tr>
<tr><td><code>ping</code></td><td>interface ICMP echo ka jawab deta hai</td></tr>
<tr><td><code>h&#116;tps</code></td><td>HTTPS admin service (GUI), default TCP 443</td></tr>
<tr><td><code>ssh</code></td><td>SSH admin service, default TCP 22</td></tr>
<tr><td><code>h&#116;tp</code></td><td>unencrypted GUI; avoid karo</td></tr>
<tr><td><code>telnet</code></td><td>unencrypted CLI; avoid karo</td></tr>
<tr><td><code>snmp</code></td><td>SNMP monitoring</td></tr>
<tr><td><code>fgfm</code></td><td>FortiManager management channel</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Through traffic policies use karta hai; box tak ka traffic allowaccess"><rect x="10" y="20" width="130" height="55" rx="9" fill="#e2e8f0"/><text x="75" y="52.5" text-anchor="middle" class="svg-ink" font-size="13">PC1 10.0.1.10</text><rect x="10" y="115" width="130" height="55" rx="9" fill="#e2e8f0"/><text x="75" y="147.5" text-anchor="middle" class="svg-ink" font-size="13">Admin 10.0.1.50</text><rect x="250" y="55" width="150" height="90" rx="9" fill="#fde68a"/><text x="325" y="97" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="325" y="114" text-anchor="middle" class="svg-muted" font-size="11">port2</text><rect x="510" y="20" width="120" height="55" rx="9" fill="#bbf7d0"/><text x="570" y="52.5" text-anchor="middle" class="svg-ink" font-size="13">Web server</text><line x1="140" y1="47" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><text x="195" y="60" text-anchor="middle" class="svg-accent" font-size="11">through: policy</text><line x1="140" y1="142" x2="250" y2="115" stroke="#64748b" stroke-width="2"/><text x="195" y="140" text-anchor="middle" class="svg-accent" font-size="11">to: allowaccess</text><line x1="400" y1="85" x2="510" y2="47" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Through traffic policies use karta hai; box tak ka traffic allowaccess</p></div>
<h3>Achhe access design ke principles</h3>
<ul>
<li><b>Least privilege.</b> Har interface par sirf wahi services allow karo jo chahiye. LAN ko ping, HTTPS aur SSH chahiye ho sakte hain. WAN ko zyada se zyada ping, aur aksar kuch nahi.</li>
<li><b>Sirf encrypted.</b> HTTP aur Telnet ke bajay HTTPS aur SSH ko prefer karo.</li>
<li><b>Jahan ho sake management alag rakho.</b> Dedicated management port ya VLAN user LAN se zyada aasaani se protect hota hai.</li>
<li><b>Controls ko layer karo.</b> allowaccess darwaza kholta hai; admin account ke trusted hosts, strong password aur idle timeout use lock karte hain.</li>
</ul>
<p>Doosre lab ke brief ne aisa WAN paya jo HTTPS, SSH aur HTTP ka jawab deta hai. Ticket ka before aur after, asli output mein:</p>
<pre class="out">NK-PUNE-FGT # show system interface port1
    edit "port1"
        set ip 203.0.113.2 255.255.255.252
        set allowaccess ping <span class="hl">h&#116;tps ssh h&#116;tp</span>
        set alias "WAN"
        set role wan

NK-PUNE-FGT # show system interface port2
    edit "port2"
        set ip 10.0.1.1 255.255.255.0
        set allowaccess <span class="hl">ssh</span>
        set alias "LAN"
        set role lan</pre>
<p>WAN zyada exposed hai, LAN kam. Repair LAN ke maujooda SSH ko <code>append</code> se rakhta hai aur WAN ko <code>set</code> se trim karta hai (jahan replace karna hi chahiye):</p>
<pre class="code">NK-PUNE-FGT # config system interface
NK-PUNE-FGT (interface) # edit port2
NK-PUNE-FGT (port2) # append allowaccess ping h&#116;tps
NK-PUNE-FGT (port2) # next
NK-PUNE-FGT (interface) # edit port1
NK-PUNE-FGT (port1) # set allowaccess ping
NK-PUNE-FGT (port1) # end</pre>
<pre class="out">NK-PUNE-FGT # show system interface port2
        set allowaccess <span class="hl">ssh ping h&#116;tps</span>
NK-PUNE-FGT # show system interface port1
        set allowaccess <span class="hl">ping</span>

PC1&gt; ping 10.0.1.1
84 bytes from 10.0.1.1 icmp_seq=1 ttl=64 time=0.500 ms</pre>
<p>Order <code>ssh ping h&#116;tps</code> dekho: <code>append</code> end mein jodta hai aur order important nahi. PC ab gateway tak pahunchta hai. Doosri layer, admin account ka <b>trusted host</b> (chapter 3), phir limit karta hai ki interface service allow kare tab bhi kaunse sources login kar sakte hain.</p>
<div class="eg"><p><b>Worked example.</b> Monitoring server 10.0.1.60 ko sirf port2 par SNMP chahiye. Aap port2 par <code>append allowaccess snmp</code> chalate ho. port1 ping par rehta hai, isliye internet par scanner ko SNMP nahi dikhta. Monitoring ko ISP se ping chahiye to port1 par ping allow karo aur kuch nahi.</p></div>
<div class="warn"><p><b>Common mistake.</b> WAN par HTTPS ya SSH "temporarily" kholna aur bhool jaana. Internet par management services lagatar scan hoti hain. Remote administration chahiye to trusted hosts, non-default port ya, behtar, VPN se restrict karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Users browse kar sakte hain par GUI ya firewall ko ping fail ho to policies se pehle <b>allowaccess</b> check karo. Ye bhi jaano ki HTTPS service ka admin port <code>config system global</code> (admin-sport) mein badalta hai.</p></div>
<div class="scn"><h4>Audit finding</h4><p>Ek external audit ne paya ki branch FortiGate internet se HTTPS admin service ka jawab deta hai. WAN par kaafi pehle ke "temporary" troubleshooting session se allowaccess ping h&#116;tps ssh h&#116;tp tha. Team ne use ping tak kam kiya, admins ke liye trusted hosts enable kiye aur har WAN interface ke extra allowaccess values ka quarterly check jodd diya.</p><p><b>Lesson:</b> exposed management ka audit routine banao, surprise nahi.</p></div>
<div class="iv"><p class="q">"FortiGate par administrative access kahan control hota hai?"</p><p>Har interface par allowaccess se, jo tay karta hai ki wahan kaunsi management services jawab dengi; har administrator account par trusted hosts aur profile se; aur globally system global mein admin ports, timeouts aur HTTPS settings se. Policies box tak ke access ko control nahi karti. Main sirf zaroori allow karta hoon, WAN par nahi rakhta aur HTTPS aur SSH ko prefer karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Through traffic policy use karta hai; box tak ka traffic allowaccess.</li>
<li>Kam se kam allow karo: LAN manage kar sakta hai, WAN zyada se zyada ping.</li>
<li>Lists par append use karo; set replace karta hai.</li>
<li>Trusted hosts admin account par doosra gate jodte hain.</li>
</ul></div>
`}};export{e as default};