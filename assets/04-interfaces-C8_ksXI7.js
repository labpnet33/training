var e={id:`interfaces`,h:{en:`Interfaces: addresses, alias, role and link state`,hi:`Interfaces: addresses, alias, role aur link state`},body:{en:`
<p>Every FortiGate port is a routed interface with its own subnet, like a router port. Two interfaces can never be in overlapping subnets, because the firewall must be able to decide unambiguously which interface a destination lives behind. This chapter covers the settings you need on every interface.</p>
<h3>The settings that matter on day one</h3>
<table class="cmp"><tr><th>Attribute</th><th>What it does</th><th>Example</th></tr>
<tr><td><code>ip</code></td><td>address and mask</td><td>10.0.1.1 255.255.255.0</td></tr>
<tr><td><code>mode</code></td><td>static (default), DHCP or PPPoE addressing</td><td>static</td></tr>
<tr><td><code>allowaccess</code></td><td>management services answered on this interface</td><td>ping h&#116;tps ssh</td></tr>
<tr><td><code>alias</code></td><td>friendly label shown beside the port name</td><td>LAN</td></tr>
<tr><td><code>role</code></td><td>lan, wan, dmz or undefined; tags the interface for GUI and logs</td><td>lan</td></tr>
<tr><td><code>status</code></td><td>up or down administratively</td><td>up</td></tr></table>
<p>The lab brief asks for the LAN on port2 and the WAN on port1. Notice the compact form <code>set ip 203.0.113.2/30</code>, which FortiOS stores as address plus dotted mask. Real configuration and result:</p>
<pre class="code">NK-PUNE-FGT # config system interface
NK-PUNE-FGT (interface) # edit port1
NK-PUNE-FGT (port1) # set ip 203.0.113.2/30
NK-PUNE-FGT (port1) # set allowaccess ping
NK-PUNE-FGT (port1) # set alias WAN
NK-PUNE-FGT (port1) # set role wan
NK-PUNE-FGT (port1) # end
NK-PUNE-FGT # show system interface port1</pre>
<pre class="out">config system interface
    edit "port1"
        set vdom "root"
        set ip <span class="hl">203.0.113.2 255.255.255.252</span>
        set allowaccess ping
        set type physical
        set alias "WAN"
        set role wan
        set snmp-index 1
    next
end</pre>
<p>Role is cosmetic for forwarding, but it feeds the GUI (for example a WAN role unlocks the WAN-specific options) and the logs. <b>Alias</b> is also what the GUI shows first, so use short, honest labels. Check link state and speed with:</p>
<pre class="code">NK-PUNE-FGT # get system interface physical</pre>
<pre class="out">== [onboard]
	==[port1]
		mode: static
		ip: 203.0.113.2 255.255.255.252
		ipv6: ::/0
		<span class="hl">status: up</span>
		speed: 1000Mbps (Duplex: full)
	==[port2]
		mode: static
		ip: 10.0.1.1 255.255.255.0
		<span class="hl">status: up</span>
		speed: 1000Mbps (Duplex: full)
	==[port3]
		ip: 0.0.0.0 0.0.0.0
		<span class="hl">status: down</span>
		speed: n/a</pre>
<p>(Output shortened to the useful lines.) A port that is down with no cable, like port3, is normal. A port that should be up but shows down is a Layer 1 or Layer 2 problem: cable, the far side, or the status attribute.</p>
<h3>Proving the neighbour is there</h3>
<p>Once the WAN port is addressed and the ISP answers, the firewall learns its neighbour and shows it in the ARP table:</p>
<pre class="code">NK-PUNE-FGT # get system arp</pre>
<pre class="out">Address           Age(min)   Hardware Addr      Interface
<span class="hl">203.0.113.1</span>       0          52:54:ca:e3:d3:01  port1</pre>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Two interfaces, two separate subnets"><rect x="10" y="35" width="180" height="80" rx="9" fill="#bbf7d0"/><text x="100" y="72" text-anchor="middle" class="svg-ink" font-size="13">port2 (LAN)</text><text x="100" y="89" text-anchor="middle" class="svg-muted" font-size="11">10.0.1.1/24 | role lan</text><rect x="225" y="35" width="180" height="80" rx="9" fill="#fde68a"/><text x="315" y="72" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="315" y="89" text-anchor="middle" class="svg-muted" font-size="11">two subnets, no overlap</text><rect x="440" y="35" width="190" height="80" rx="9" fill="#e2e8f0"/><text x="535" y="72" text-anchor="middle" class="svg-ink" font-size="13">port1 (WAN)</text><text x="535" y="89" text-anchor="middle" class="svg-muted" font-size="11">203.0.113.2/30 | role wan</text><line x1="190" y1="75" x2="225" y2="75" stroke="#64748b" stroke-width="2"/><line x1="405" y1="75" x2="440" y2="75" stroke="#64748b" stroke-width="2"/><text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Each interface owns exactly one subnet</text></svg><p class="cap">Two interfaces, two separate subnets</p></div>
<div class="eg"><p><b>Worked example.</b> If port4 is given 10.0.1.9/24 while port2 holds 10.0.1.1/24, FortiOS refuses the save with "Subnets overlap between 'port4' and the primary IP of 'port2'". The fix is a different subnet for port4, for example 10.0.3.1/24, never two interfaces in one subnet.</p></div>
<p>For reference, a WAN that gets its address from the ISP uses DHCP mode (reference configuration, not run in the simulator):</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
config system interface
    edit "port1"
        set mode dhcp
        set allowaccess ping
        set role wan
    next
end</pre>
<div class="warn"><p><b>Common mistake.</b> Typing a wrong mask on the LAN interface (for example 255.255.0.0 instead of 255.255.255.0). The overlap check then blocks the next interface, and users on the real /24 may behave strangely. Check the mask whenever a save is refused.</p></div>
<div class="exam"><p><b>Exam trap.</b> Role and alias do not change forwarding. A question may describe "I set role wan but traffic still does not leave": the role was never the cause.</p></div>
<div class="scn"><h4>Two branches, one subnet</h4><p>A rollout script gave every branch the LAN 10.0.1.0/24. Later two branches were joined over a site-to-site link and routing broke because both sides owned the same subnet. A per-site addressing plan (10.site.1.0/24) written before the first deployment would have prevented a renumbering project.</p><p><b>Lesson:</b> plan unique subnets per site before configuring interfaces.</p></div>
<div class="iv"><p class="q">"How do you check that a FortiGate interface is up and addressed correctly?"</p><p>I use <code>show system interface portX</code> for the configured address and settings, <code>get system interface physical</code> for link status and speed, <code>get router info routing-table connected</code> to confirm the connected route exists, and <code>get system arp</code> to see that the neighbour has been learned. A ping from the firewall to the neighbour confirms Layer 3.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Each interface owns one subnet; overlaps are refused.</li>
<li>ip, allowaccess, alias, role and status are the day-one attributes.</li>
<li>Role and alias do not change forwarding.</li>
<li>Verify with show, get system interface physical and get system arp.</li>
</ul></div>
`,hi:`
<p>Har FortiGate port ek routed interface hai jiska apna subnet hota hai, router port ki tarah. Do interfaces kabhi overlapping subnets mein nahi ho sakte, kyunki firewall ko bina confusion ke tay karna hota hai ki destination kis interface ke peeche hai. Yeh chapter har interface par zaroori settings cover karta hai.</p>
<h3>Pehle din ki zaroori settings</h3>
<table class="cmp"><tr><th>Attribute</th><th>Kya karta hai</th><th>Example</th></tr>
<tr><td><code>ip</code></td><td>address aur mask</td><td>10.0.1.1 255.255.255.0</td></tr>
<tr><td><code>mode</code></td><td>static (default), DHCP ya PPPoE addressing</td><td>static</td></tr>
<tr><td><code>allowaccess</code></td><td>is interface par jawab di jaane wali management services</td><td>ping h&#116;tps ssh</td></tr>
<tr><td><code>alias</code></td><td>port name ke saath dikhne wala friendly label</td><td>LAN</td></tr>
<tr><td><code>role</code></td><td>lan, wan, dmz ya undefined; interface ko GUI aur logs ke liye tag karta hai</td><td>lan</td></tr>
<tr><td><code>status</code></td><td>administratively up ya down</td><td>up</td></tr></table>
<p>Lab brief LAN ko port2 par aur WAN ko port1 par maangta hai. Compact form <code>set ip 203.0.113.2/30</code> dekho, jise FortiOS address plus dotted mask ki tarah store karta hai. Asli configuration aur result:</p>
<pre class="code">NK-PUNE-FGT # config system interface
NK-PUNE-FGT (interface) # edit port1
NK-PUNE-FGT (port1) # set ip 203.0.113.2/30
NK-PUNE-FGT (port1) # set allowaccess ping
NK-PUNE-FGT (port1) # set alias WAN
NK-PUNE-FGT (port1) # set role wan
NK-PUNE-FGT (port1) # end
NK-PUNE-FGT # show system interface port1</pre>
<pre class="out">config system interface
    edit "port1"
        set vdom "root"
        set ip <span class="hl">203.0.113.2 255.255.255.252</span>
        set allowaccess ping
        set type physical
        set alias "WAN"
        set role wan
        set snmp-index 1
    next
end</pre>
<p>Forwarding ke liye role cosmetic hai, par yeh GUI (jaise WAN role WAN-specific options kholta hai) aur logs ko feed karta hai. <b>Alias</b> GUI mein sabse pehle dikhta hai, isliye chhote, imaandaar labels use karo. Link state aur speed check karo:</p>
<pre class="code">NK-PUNE-FGT # get system interface physical</pre>
<pre class="out">== [onboard]
	==[port1]
		mode: static
		ip: 203.0.113.2 255.255.255.252
		ipv6: ::/0
		<span class="hl">status: up</span>
		speed: 1000Mbps (Duplex: full)
	==[port2]
		mode: static
		ip: 10.0.1.1 255.255.255.0
		<span class="hl">status: up</span>
		speed: 1000Mbps (Duplex: full)
	==[port3]
		ip: 0.0.0.0 0.0.0.0
		<span class="hl">status: down</span>
		speed: n/a</pre>
<p>(Output kaam ki lines tak chhota kiya.) Bina cable wala port down hona, jaise port3, normal hai. Jo port up hona chahiye par down dikhe woh Layer 1 ya Layer 2 problem hai: cable, doosri side, ya status attribute.</p>
<h3>Saabit karna ki neighbour hai</h3>
<p>WAN port address ho jaye aur ISP jawab de to firewall apne neighbour ko seekhta hai aur ARP table mein dikhata hai:</p>
<pre class="code">NK-PUNE-FGT # get system arp</pre>
<pre class="out">Address           Age(min)   Hardware Addr      Interface
<span class="hl">203.0.113.1</span>       0          52:54:ca:e3:d3:01  port1</pre>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Do interfaces, do alag subnets"><rect x="10" y="35" width="180" height="80" rx="9" fill="#bbf7d0"/><text x="100" y="72" text-anchor="middle" class="svg-ink" font-size="13">port2 (LAN)</text><text x="100" y="89" text-anchor="middle" class="svg-muted" font-size="11">10.0.1.1/24 | role lan</text><rect x="225" y="35" width="180" height="80" rx="9" fill="#fde68a"/><text x="315" y="72" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="315" y="89" text-anchor="middle" class="svg-muted" font-size="11">do subnets, overlap nahi</text><rect x="440" y="35" width="190" height="80" rx="9" fill="#e2e8f0"/><text x="535" y="72" text-anchor="middle" class="svg-ink" font-size="13">port1 (WAN)</text><text x="535" y="89" text-anchor="middle" class="svg-muted" font-size="11">203.0.113.2/30 | role wan</text><line x1="190" y1="75" x2="225" y2="75" stroke="#64748b" stroke-width="2"/><line x1="405" y1="75" x2="440" y2="75" stroke="#64748b" stroke-width="2"/><text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Har interface ka ek hi subnet</text></svg><p class="cap">Do interfaces, do alag subnets</p></div>
<div class="eg"><p><b>Worked example.</b> Agar port4 ko 10.0.1.9/24 diya jaye jabki port2 ke paas 10.0.1.1/24 hai, to FortiOS "Subnets overlap between 'port4' and the primary IP of 'port2'" ke saath save refuse karta hai. Fix port4 ke liye alag subnet hai, jaise 10.0.3.1/24, kabhi ek subnet mein do interfaces nahi.</p></div>
<p>Reference ke liye, jis WAN ko ISP se address milta hai woh DHCP mode use karta hai (reference configuration, simulator mein run nahi hui):</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
config system interface
    edit "port1"
        set mode dhcp
        set allowaccess ping
        set role wan
    next
end</pre>
<div class="warn"><p><b>Common mistake.</b> LAN interface par galat mask type karna (jaise 255.255.255.0 ki jagah 255.255.0.0). Overlap check tab agla interface block kar deta hai, aur asli /24 ke users ajeeb behave kar sakte hain. Save refuse ho to mask check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Role aur alias forwarding nahi badalte. Sawaal bata sakta hai "maine role wan set kiya par traffic abhi bhi bahar nahi jaata": role kabhi cause nahi tha.</p></div>
<div class="scn"><h4>Do branches, ek subnet</h4><p>Ek rollout script ne har branch ko LAN 10.0.1.0/24 de diya. Baad mein do branches site-to-site link se jode gaye aur routing toot gayi kyunki dono taraf same subnet tha. Pehli deployment se pehle likha per-site addressing plan (10.site.1.0/24) renumbering project se bacha leta.</p><p><b>Lesson:</b> interfaces configure karne se pehle har site ke liye unique subnets plan karo.</p></div>
<div class="iv"><p class="q">"FortiGate interface up aur sahi address wala hai yeh kaise check karte ho?"</p><p>Configured address aur settings ke liye <code>show system interface portX</code>, link status aur speed ke liye <code>get system interface physical</code>, connected route ke liye <code>get router info routing-table connected</code>, aur neighbour seekha gaya hai yeh dekhne ke liye <code>get system arp</code>. Firewall se neighbour ko ping Layer 3 confirm karta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har interface ka ek subnet; overlaps refuse hote hain.</li>
<li>ip, allowaccess, alias, role aur status pehle din ke attributes hain.</li>
<li>Role aur alias forwarding nahi badalte.</li>
<li>show, get system interface physical aur get system arp se verify karo.</li>
</ul></div>
`}};export{e as default};