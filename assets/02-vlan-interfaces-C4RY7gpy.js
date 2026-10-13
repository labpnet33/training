var e={id:`vlan-interfaces`,h:{en:`VLAN interfaces on a FortiGate`,hi:`FortiGate par VLAN interfaces`},body:{en:`
<p>A <b>VLAN</b> is a separate Layer 2 broadcast domain. On a link between a switch and a firewall, frames of several VLANs share the wire, each marked with a 12-bit <b>VLAN ID</b> in an 802.1Q tag. That link is a <b>trunk</b>. On the FortiGate you do not configure the trunk as such; instead you create a <b>VLAN interface</b> for each VLAN, attach it to the physical <b>parent interface</b>, and give it an IP address. The FortiGate tags frames it sends and untags the frames it receives, and it routes between VLAN interfaces just as between physical ports.</p>
<h3>The attributes of a VLAN interface</h3>
<table class="cmp"><tr><th>Attribute</th><th>Meaning</th></tr>
<tr><td><code>type vlan</code></td><td>makes the entry a VLAN sub-interface (the default for a new entry)</td></tr>
<tr><td><code>interface</code></td><td>the parent physical interface, here port2</td></tr>
<tr><td><code>vlanid</code></td><td>the 802.1Q ID, 1 to 4094; it must match the switch</td></tr>
<tr><td><code>ip</code>, <code>allowaccess</code>, <code>alias</code>, <code>role</code></td><td>same meaning as on a physical interface</td></tr></table>
<p>Configuration for the two VLANs of this module. The parent port2 itself carries no address; the VLAN interfaces carry the addresses. This is the real session from the simulator:</p>
<pre class="code">NK-PUNE-FGT # config system interface
NK-PUNE-FGT (interface) # edit VLAN10
new entry 'VLAN10' added
NK-PUNE-FGT (VLAN10) # set vdom root
NK-PUNE-FGT (VLAN10) # set interface port2
NK-PUNE-FGT (VLAN10) # set vlanid 10
NK-PUNE-FGT (VLAN10) # set ip 10.10.10.1 255.255.255.0
NK-PUNE-FGT (VLAN10) # set allowaccess ping
NK-PUNE-FGT (VLAN10) # set alias Staff
NK-PUNE-FGT (VLAN10) # set role lan
NK-PUNE-FGT (VLAN10) # next
NK-PUNE-FGT (interface) # edit VLAN20
new entry 'VLAN20' added
NK-PUNE-FGT (VLAN20) # set interface port2
NK-PUNE-FGT (VLAN20) # set vlanid 20
NK-PUNE-FGT (VLAN20) # set ip 10.10.20.1 255.255.255.0
NK-PUNE-FGT (VLAN20) # set allowaccess ping
NK-PUNE-FGT (VLAN20) # set alias Servers
NK-PUNE-FGT (VLAN20) # set role lan
NK-PUNE-FGT (VLAN20) # end</pre>
<pre class="code">NK-PUNE-FGT # show system interface VLAN10</pre>
<pre class="out">config system interface
    edit "VLAN10"
        set vdom "root"
        set ip 10.10.10.1 255.255.255.0
        set allowaccess ping
        set alias "Staff"
        set role lan
        set snmp-index 9
        set <span class="hl">interface "port2"</span>
        set <span class="hl">vlanid 10</span>
    next
end</pre>
<p>Notice that the new entry is a VLAN automatically (<code>type vlan</code> is the default and is hidden by <code>show</code>). The entry name <code>VLAN10</code> is just a label; the <b>vlanid</b> is what goes on the wire. Many teams name interfaces after the ID or the purpose, but a name that disagrees with the ID is a classic source of confusion.</p>
<p>FortiOS creates a connected route for each VLAN interface at once:</p>
<pre class="code">NK-PUNE-FGT # get router info routing-table connected</pre>
<pre class="out">C       <span class="hl">10.10.10.0/24 is directly connected, VLAN10</span>
C       <span class="hl">10.10.20.0/24 is directly connected, VLAN20</span>
C       203.0.113.0/30 is directly connected, port1</pre>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Two VLAN interfaces on one parent port"><rect x="10" y="40" width="200" height="90" rx="9" fill="#fde68a"/><text x="110" y="82" text-anchor="middle" class="svg-ink" font-size="13">port2 (parent)</text><text x="110" y="99" text-anchor="middle" class="svg-muted" font-size="11">physical, no IP</text><rect x="300" y="15" width="170" height="55" rx="9" fill="#bbf7d0"/><text x="385" y="39.5" text-anchor="middle" class="svg-ink" font-size="13">VLAN10</text><text x="385" y="56.5" text-anchor="middle" class="svg-muted" font-size="11">vlanid 10 | 10.10.10.1/24</text><rect x="300" y="100" width="170" height="55" rx="9" fill="#ddd6fe"/><text x="385" y="124.5" text-anchor="middle" class="svg-ink" font-size="13">VLAN20</text><text x="385" y="141.5" text-anchor="middle" class="svg-muted" font-size="11">vlanid 20 | 10.10.20.1/24</text><line x1="210" y1="70" x2="300" y2="42" stroke="#64748b" stroke-width="2"/><line x1="210" y1="100" x2="300" y2="128" stroke="#64748b" stroke-width="2"/><text x="535" y="85" text-anchor="middle" class="svg-accent" font-size="12">tagged frames</text></svg><p class="cap">Two VLAN interfaces on one parent port</p></div>
<div class="eg"><p><b>Worked example.</b> Adding a Guest VLAN 30 takes one new entry: <code>edit VLAN30</code>, parent port2, vlanid 30, <code>ip 10.10.30.1 255.255.255.0</code>. The firewall instantly has a connected route for 10.10.30.0/24. The switch still has to carry VLAN 30 on its trunk, which is the subject of the next chapter.</p></div>
<div class="warn"><p><b>Common mistake.</b> Giving the parent physical port an address in the same subnet as a VLAN interface, or using the same VLAN ID twice on one parent. The second is rejected (next chapter), the first overlaps subnets.</p></div>
<div class="exam"><p><b>Exam trap.</b> On a FortiGate the VLAN interface is a <b>sub-interface of a parent</b> with a <code>vlanid</code>. The VLAN ID must match the switch; the interface name need not.</p></div>
<div class="scn"><h4>VLAN 10 or VLAN 11?</h4><p>A new VLAN interface called Staff was created with vlanid 11 by a typo while the switch used VLAN 10. The firewall showed the interface up and a connected route, so the engineer assumed all was well, yet PCs could not reach the gateway. Matching vlanid 10 fixed it instantly.</p><p><b>Lesson:</b> a VLAN interface looks healthy even when its ID does not match the switch; check the ID.</p></div>
<div class="iv"><p class="q">"How does a FortiGate join several VLANs on one port?"</p><p>I create a VLAN interface for each VLAN on the physical parent port, set the VLAN ID to match the switch trunk and give each its own IP and allowaccess. The firewall then has a connected route per VLAN and routes and filters between them. The switch port is a trunk that allows those VLANs.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Create one VLAN interface per VLAN on a parent port.</li>
<li>vlanid must match the switch; the name is only a label.</li>
<li>Each VLAN interface gets its own IP and a connected route.</li>
<li>The parent port does not need an IP address.</li>
</ul></div>
`,hi:`
<p><b>VLAN</b> ek alag Layer 2 broadcast domain hai. Switch aur firewall ke beech ke link par kai VLANs ke frames ek hi wire share karte hain, har ek 802.1Q tag mein 12-bit <b>VLAN ID</b> se marked. Woh link <b>trunk</b> hai. FortiGate par aap trunk ko as such configure nahi karte; iske bajay har VLAN ke liye ek <b>VLAN interface</b> banate ho, use physical <b>parent interface</b> se attach karte ho, aur IP address dete ho. FortiGate jo frames bhejta hai unhe tag karta hai aur jo receive karta hai unhe untag karta hai, aur VLAN interfaces ke beech waise hi route karta hai jaise physical ports ke beech.</p>
<h3>VLAN interface ke attributes</h3>
<table class="cmp"><tr><th>Attribute</th><th>Matlab</th></tr>
<tr><td><code>type vlan</code></td><td>entry ko VLAN sub-interface banata hai (naye entry ka default)</td></tr>
<tr><td><code>interface</code></td><td>parent physical interface, yahan port2</td></tr>
<tr><td><code>vlanid</code></td><td>802.1Q ID, 1 se 4094; switch se match hona chahiye</td></tr>
<tr><td><code>ip</code>, <code>allowaccess</code>, <code>alias</code>, <code>role</code></td><td>physical interface jaisa hi matlab</td></tr></table>
<p>Is module ke do VLANs ki configuration. Parent port2 khud koi address nahi rakhta; addresses VLAN interfaces rakhte hain. Yeh simulator ka asli session hai:</p>
<pre class="code">NK-PUNE-FGT # config system interface
NK-PUNE-FGT (interface) # edit VLAN10
new entry 'VLAN10' added
NK-PUNE-FGT (VLAN10) # set vdom root
NK-PUNE-FGT (VLAN10) # set interface port2
NK-PUNE-FGT (VLAN10) # set vlanid 10
NK-PUNE-FGT (VLAN10) # set ip 10.10.10.1 255.255.255.0
NK-PUNE-FGT (VLAN10) # set allowaccess ping
NK-PUNE-FGT (VLAN10) # set alias Staff
NK-PUNE-FGT (VLAN10) # set role lan
NK-PUNE-FGT (VLAN10) # next
NK-PUNE-FGT (interface) # edit VLAN20
new entry 'VLAN20' added
NK-PUNE-FGT (VLAN20) # set interface port2
NK-PUNE-FGT (VLAN20) # set vlanid 20
NK-PUNE-FGT (VLAN20) # set ip 10.10.20.1 255.255.255.0
NK-PUNE-FGT (VLAN20) # set allowaccess ping
NK-PUNE-FGT (VLAN20) # set alias Servers
NK-PUNE-FGT (VLAN20) # set role lan
NK-PUNE-FGT (VLAN20) # end</pre>
<pre class="code">NK-PUNE-FGT # show system interface VLAN10</pre>
<pre class="out">config system interface
    edit "VLAN10"
        set vdom "root"
        set ip 10.10.10.1 255.255.255.0
        set allowaccess ping
        set alias "Staff"
        set role lan
        set snmp-index 9
        set <span class="hl">interface "port2"</span>
        set <span class="hl">vlanid 10</span>
    next
end</pre>
<p>Dhyan do ki naya entry apne aap VLAN hai (<code>type vlan</code> default hai aur <code>show</code> use chhupata hai). Entry naam <code>VLAN10</code> sirf label hai; wire par <b>vlanid</b> jaata hai. Kai teams interfaces ka naam ID ya purpose se rakhti hain, par ID se mel na khane wala naam confusion ka classic source hai.</p>
<p>FortiOS har VLAN interface ke liye turant connected route banata hai:</p>
<pre class="code">NK-PUNE-FGT # get router info routing-table connected</pre>
<pre class="out">C       <span class="hl">10.10.10.0/24 is directly connected, VLAN10</span>
C       <span class="hl">10.10.20.0/24 is directly connected, VLAN20</span>
C       203.0.113.0/30 is directly connected, port1</pre>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Ek parent port par do VLAN interfaces"><rect x="10" y="40" width="200" height="90" rx="9" fill="#fde68a"/><text x="110" y="82" text-anchor="middle" class="svg-ink" font-size="13">port2 (parent)</text><text x="110" y="99" text-anchor="middle" class="svg-muted" font-size="11">physical, IP nahi</text><rect x="300" y="15" width="170" height="55" rx="9" fill="#bbf7d0"/><text x="385" y="39.5" text-anchor="middle" class="svg-ink" font-size="13">VLAN10</text><text x="385" y="56.5" text-anchor="middle" class="svg-muted" font-size="11">vlanid 10 | 10.10.10.1/24</text><rect x="300" y="100" width="170" height="55" rx="9" fill="#ddd6fe"/><text x="385" y="124.5" text-anchor="middle" class="svg-ink" font-size="13">VLAN20</text><text x="385" y="141.5" text-anchor="middle" class="svg-muted" font-size="11">vlanid 20 | 10.10.20.1/24</text><line x1="210" y1="70" x2="300" y2="42" stroke="#64748b" stroke-width="2"/><line x1="210" y1="100" x2="300" y2="128" stroke="#64748b" stroke-width="2"/><text x="535" y="85" text-anchor="middle" class="svg-accent" font-size="12">tagged frames</text></svg><p class="cap">Ek parent port par do VLAN interfaces</p></div>
<div class="eg"><p><b>Worked example.</b> Guest VLAN 30 jodna ek naya entry hai: <code>edit VLAN30</code>, parent port2, vlanid 30, <code>ip 10.10.30.1 255.255.255.0</code>. Firewall ke paas turant 10.10.30.0/24 ka connected route aa jaata hai. Switch ko abhi bhi VLAN 30 apne trunk par le jaana hai, jo agle chapter ka vishay hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Parent physical port ko VLAN interface ke subnet mein hi address dena, ya ek parent par ek hi VLAN ID do baar use karna. Doosra reject hota hai (agla chapter), pehla subnets overlap karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> FortiGate par VLAN interface <b>parent ka sub-interface</b> hota hai jiska <code>vlanid</code> hota hai. VLAN ID switch se match karna chahiye; interface name nahi.</p></div>
<div class="scn"><h4>VLAN 10 ya VLAN 11?</h4><p>Staff naam ka naya VLAN interface typo se vlanid 11 ke saath ban gaya jabki switch VLAN 10 use karta tha. Firewall ne interface up aur connected route dikhaya, isliye engineer ne maan liya sab theek hai, phir bhi PCs gateway tak nahi pahunch paye. vlanid 10 match karne se turant theek hua.</p><p><b>Lesson:</b> VLAN interface tab bhi healthy dikhta hai jab uska ID switch se match na kare; ID check karo.</p></div>
<div class="iv"><p class="q">"FortiGate ek port par kai VLANs se kaise judta hai?"</p><p>Main physical parent port par har VLAN ke liye ek VLAN interface banata hoon, VLAN ID ko switch trunk se match karta hoon aur har ek ko apna IP aur allowaccess deta hoon. Firewall ke paas phir har VLAN ka connected route hota hai aur woh unke beech route aur filter karta hai. Switch port trunk hota hai jo un VLANs ko allow karta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Parent port par har VLAN ke liye ek VLAN interface banao.</li>
<li>vlanid switch se match karna chahiye; naam sirf label hai.</li>
<li>Har VLAN interface ko apna IP aur connected route milta hai.</li>
<li>Parent port ko IP address ki zaroorat nahi.</li>
</ul></div>
`}};export{e as default};