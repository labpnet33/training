var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have built the corridor between the courier network and your warehouse. You know what a service connection is for, how to create it in either management tool, how HQ-FW joins it, which routes must come back, what the backbone settings mean, and how to find the hop where a packet disappears. This chapter helps you revise quickly.</p>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain the purpose of a service connection and the hub-and-spoke path between mobile users and remote networks.</li>
<li>I can create a service connection in SCM (Add Service Connection, Push Config) and in Panorama (Service Connection &gt; Add, Commit and Push with Service Setup).</li>
<li>I can build the tunnel and BGP on HQ-FW (peer AS 65002, Prisma AS 65534, TTL 8) and read the endpoint from Network Details.</li>
<li>I can explain Source NAT for mobile users: Data Traffic, Infrastructure Traffic, a /25 to /32 RFC 1918 pool.</li>
<li>I can name the three Backbone Routing values and the two Routing Preference values.</li>
<li>I can list the return routes HQ needs: mobile pool, branch subnets, infrastructure subnet (or NAT pool).</li>
<li>I can explain Withdraw Static Routes, Outbound Routes, and the license limits.</li>
<li>I can verify with Monitor, Insights: Data Centers and HQ-FW commands, and fix a no-return-path ticket.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Service connection</dt><dd>IPsec tunnel from Prisma Access to HQ or a data centre; also called a Corporate Access Node.</dd>
<dt>Hub and spoke</dt><dd>Mobile users reach remote networks through a service connection.</dd>
<dt>Source NAT (Mobile Users)</dt><dd>Translates mobile-user traffic into a small RFC 1918 pool (/25 to /32).</dd>
<dt>Backbone Routing</dt><dd>Policy for asymmetric return traffic across service connections.</dd>
<dt>Hot potato</dt><dd>A Routing Preference value; hand traffic to the nearest exit.</dd>
<dt>Withdraw Static Routes</dt><dd>Removes a service connection's static routes when its tunnel is down.</dd>
<dt>Outbound Routes</dt><dd>Prefixes advertised toward the corporate side.</dd>
<dt>Infrastructure subnet</dt><dd>The backbone subnet (lab 10.255.0.0/24), AS 65534 by default.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Purpose</td><td>HQ and data centre access, authentication servers, hub for mobile-to-branch traffic</td></tr>
<tr><td>Internet egress</td><td>Not supported over service connections</td></tr>
<tr><td>Limits</td><td>5 base; 200 with the Private Application add-on</td></tr>
<tr><td>SCM path</td><td>Prisma Access &gt; Service Connections &gt; Add Service Connection; Push Config</td></tr>
<tr><td>Panorama path</td><td>Cloud Services &gt; Configuration &gt; Service Connection &gt; Add; Commit and Push with Service Setup</td></tr>
<tr><td>Panorama tabs</td><td>Static Routes, BGP, Miscellaneous</td></tr>
<tr><td>Panorama tunnel</td><td>Auto Key, IPv4 only, up to 31 characters</td></tr>
<tr><td>BGP</td><td>MRAI 1 to 600 (default 30), TTL 8, no default route accepted</td></tr>
<tr><td>Source NAT pool</td><td>RFC 1918, /25 to /32</td></tr>
<tr><td>Backbone Routing</td><td>no-asymmetric-routing, asymmetric-routing-only, asymmetric-routing-with-load-share (default)</td></tr>
<tr><td>Routing Preference</td><td>Default or Hot potato</td></tr>
<tr><td>Withdraw Static Routes</td><td>On by default in SCM</td></tr>
<tr><td>Return routes</td><td>Mobile pool, branch subnets, infrastructure subnet</td></tr>
</table>

<h3>Command cheat sheet (HQ-FW)</h3>
<pre class="code"><span class="c"># tunnel and IKE</span>
show vpn ike-sa gateway SC-GW
show vpn ipsec-sa tunnel SC-TUN
show vpn tunnel
show vpn flow
test vpn ike-sa gateway SC-GW
clear vpn ike-sa gateway SC-GW
clear vpn ipsec-sa tunnel SC-TUN
<span class="c"># routing and sessions</span>
show routing protocol bgp summary
show routing route
test routing fib-lookup virtual-router default ip 10.200.0.15
show session all filter source 10.200.0.15</pre>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module recap">
<rect x="10" y="40" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="12">Create</text>
<rect x="140" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="195" y="76" text-anchor="middle" class="svg-ink" font-size="12">HQ tunnel</text>
<rect x="270" y="40" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="325" y="76" text-anchor="middle" class="svg-ink" font-size="12">Routes back</text>
<rect x="400" y="40" width="110" height="60" rx="8" fill="#fde68a"/><text x="455" y="76" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<rect x="530" y="40" width="100" height="60" rx="8" fill="#fed7aa"/><text x="580" y="76" text-anchor="middle" class="svg-ink" font-size="12">Fix</text>
<line x1="120" y1="70" x2="140" y2="70" stroke="#64748b" stroke-width="2"/><line x1="250" y1="70" x2="270" y2="70" stroke="#64748b" stroke-width="2"/><line x1="380" y1="70" x2="400" y2="70" stroke="#64748b" stroke-width="2"/><line x1="510" y1="70" x2="530" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Create, tunnel, routes back, verify, fix.</p></div>

<div class="eg"><p><b>Worked example.</b> Self-test: HQ-FW 192.0.2.10, endpoint 203.0.113.102, HQ LAN 10.10.0.0/24, AS 65002, Prisma AS 65534, mobile pool 10.200.0.0/23, branch 10.20.0.0/24, infrastructure 10.255.0.0/24. Write the three HQ return routes and the two outputs that prove success.</p></div>

<div class="warn"><p><b>Last reminders.</b> The lab PSK NkPrisma2026 is a lab value only. Some details are not stated in the public documentation we use, such as an exact separate toggle for remote-network access to service connections and the IPsec ports of cloud endpoints. Do not assume them; read your own console and the current vendor documentation.</p></div>
<div class="exam"><p><b>Exam trap.</b> Service connections are in the Planning and Deployment domain, and return-path faults in the Troubleshooting domain of the Security Service Edge Engineer exam. Know the SCM and Panorama paths for both tools.</p></div>

<div class="scn"><h4>The ten-minute handover</h4><p>An architect handed a new data centre to operations with a one-page card: endpoint address, tunnel monitor host, BGP peers, return prefixes, push scope and test hosts. On the first incident the on-call engineer found the missing prefix in two minutes using the card.</p><p><b>Lesson:</b> write down the five facts that others will need at 2 am.</p></div>

<div class="iv"><p class="q">"Summarise how you connect HQ to Prisma Access."</p><p>Create a service connection near HQ with the tunnel, tunnel monitoring and BGP or static routes; push (with Service Setup in Panorama); build the matching tunnel and BGP on HQ-FW; add return routes to the mobile pool, branch subnets and infrastructure subnet; decide on Source NAT and backbone options; and verify from cloud, firewall and user.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Service connection equals HQ or data centre access and the hub for mobile-to-branch traffic.</li>
<li>HQ-FW needs tunnel, BGP and return routes.</li>
<li>Source NAT is optional and shrinks the return route.</li>
<li>Backbone and routing preference matter with several service connections.</li>
<li>Verify from three views and follow the packet when it fails.</li>
</ul></div>
`,hi:`
<p>Aapne courier network aur apne warehouse ke beech corridor bana liya. Aap jaante ho service connection kis liye hai, dono management tools mein kaise banta hai, HQ-FW kaise judta hai, kaun se routes wapas aane chahiye, backbone settings ka kya matlab hai, aur woh hop kaise dhoondhte ho jahan packet gayab hota hai. Yeh chapter jaldi revise karne mein madad karta hai.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Main service connection ka purpose aur mobile users aur remote networks ke beech hub-and-spoke path samjha sakta hoon.</li>
<li>Main SCM (Add Service Connection, Push Config) aur Panorama (Service Connection &gt; Add, Service Setup ke saath Commit and Push) mein service connection bana sakta hoon.</li>
<li>Main HQ-FW par tunnel aur BGP bana sakta hoon (peer AS 65002, Prisma AS 65534, TTL 8) aur Network Details se endpoint padh sakta hoon.</li>
<li>Main mobile users ke liye Source NAT samjha sakta hoon: Data Traffic, Infrastructure Traffic, /25 se /32 RFC 1918 pool.</li>
<li>Main Backbone Routing ki teen values aur Routing Preference ki do values bata sakta hoon.</li>
<li>Main HQ ko chahiye return routes list kar sakta hoon: mobile pool, branch subnets, infrastructure subnet (ya NAT pool).</li>
<li>Main Withdraw Static Routes, Outbound Routes aur license limits samjha sakta hoon.</li>
<li>Main Monitor, Insights: Data Centers aur HQ-FW commands se verify kar sakta hoon, aur no-return-path ticket fix kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Service connection</dt><dd>Prisma Access se HQ ya data centre tak IPsec tunnel; Corporate Access Node bhi kehte hain.</dd>
<dt>Hub and spoke</dt><dd>Mobile users remote networks tak service connection ke through pahunchte hain.</dd>
<dt>Source NAT (Mobile Users)</dt><dd>Mobile-user traffic ko chhote RFC 1918 pool (/25 se /32) mein translate karta hai.</dd>
<dt>Backbone Routing</dt><dd>Service connections ke across asymmetric return traffic ki policy.</dd>
<dt>Hot potato</dt><dd>Routing Preference ki ek value; traffic ko nazdeeki exit ko pass karo.</dd>
<dt>Withdraw Static Routes</dt><dd>Tunnel down hone par service connection ke static routes hata deta hai.</dd>
<dt>Outbound Routes</dt><dd>Corporate side ki taraf advertise hone wale prefixes.</dd>
<dt>Infrastructure subnet</dt><dd>Backbone subnet (lab 10.255.0.0/24), default AS 65534.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Purpose</td><td>HQ aur data centre access, authentication servers, mobile-to-branch traffic ka hub</td></tr>
<tr><td>Internet egress</td><td>Service connections par supported nahi</td></tr>
<tr><td>Limits</td><td>5 base; Private Application add-on ke saath 200</td></tr>
<tr><td>SCM path</td><td>Prisma Access &gt; Service Connections &gt; Add Service Connection; Push Config</td></tr>
<tr><td>Panorama path</td><td>Cloud Services &gt; Configuration &gt; Service Connection &gt; Add; Service Setup ke saath Commit and Push</td></tr>
<tr><td>Panorama tabs</td><td>Static Routes, BGP, Miscellaneous</td></tr>
<tr><td>Panorama tunnel</td><td>Auto Key, IPv4 only, 31 characters tak</td></tr>
<tr><td>BGP</td><td>MRAI 1 se 600 (default 30), TTL 8, default route accept nahi</td></tr>
<tr><td>Source NAT pool</td><td>RFC 1918, /25 se /32</td></tr>
<tr><td>Backbone Routing</td><td>no-asymmetric-routing, asymmetric-routing-only, asymmetric-routing-with-load-share (default)</td></tr>
<tr><td>Routing Preference</td><td>Default ya Hot potato</td></tr>
<tr><td>Withdraw Static Routes</td><td>SCM mein default on</td></tr>
<tr><td>Return routes</td><td>Mobile pool, branch subnets, infrastructure subnet</td></tr>
</table>

<h3>Command cheat sheet (HQ-FW)</h3>
<pre class="code"><span class="c"># tunnel aur IKE</span>
show vpn ike-sa gateway SC-GW
show vpn ipsec-sa tunnel SC-TUN
show vpn tunnel
show vpn flow
test vpn ike-sa gateway SC-GW
clear vpn ike-sa gateway SC-GW
clear vpn ipsec-sa tunnel SC-TUN
<span class="c"># routing aur sessions</span>
show routing protocol bgp summary
show routing route
test routing fib-lookup virtual-router default ip 10.200.0.15
show session all filter source 10.200.0.15</pre>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module recap">
<rect x="10" y="40" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="12">Create</text>
<rect x="140" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="195" y="76" text-anchor="middle" class="svg-ink" font-size="12">HQ tunnel</text>
<rect x="270" y="40" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="325" y="76" text-anchor="middle" class="svg-ink" font-size="12">Routes back</text>
<rect x="400" y="40" width="110" height="60" rx="8" fill="#fde68a"/><text x="455" y="76" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<rect x="530" y="40" width="100" height="60" rx="8" fill="#fed7aa"/><text x="580" y="76" text-anchor="middle" class="svg-ink" font-size="12">Fix</text>
<line x1="120" y1="70" x2="140" y2="70" stroke="#64748b" stroke-width="2"/><line x1="250" y1="70" x2="270" y2="70" stroke="#64748b" stroke-width="2"/><line x1="380" y1="70" x2="400" y2="70" stroke="#64748b" stroke-width="2"/><line x1="510" y1="70" x2="530" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Create, tunnel, routes back, verify, fix.</p></div>

<div class="eg"><p><b>Worked example.</b> Self-test: HQ-FW 192.0.2.10, endpoint 203.0.113.102, HQ LAN 10.10.0.0/24, AS 65002, Prisma AS 65534, mobile pool 10.200.0.0/23, branch 10.20.0.0/24, infrastructure 10.255.0.0/24. HQ ke teen return routes aur success prove karne wale do outputs likho.</p></div>

<div class="warn"><p><b>Aakhri reminders.</b> Lab PSK NkPrisma2026 sirf lab value hai. Kuch details public documentation mein stated nahi hain jo hum use karte hain, jaise remote-network access to service connections ke liye exact alag toggle aur cloud endpoints ke IPsec ports. Inhe assume mat karo; apna console aur current vendor documentation padho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Security Service Edge Engineer exam mein service connections Planning and Deployment domain mein aate hain, aur return-path faults Troubleshooting domain mein. Dono tools ke SCM aur Panorama paths jaano.</p></div>

<div class="scn"><h4>Das minute ka handover</h4><p>Architect ne naya data centre operations ko ek page ke card ke saath handover kiya: endpoint address, tunnel monitor host, BGP peers, return prefixes, push scope aur test hosts. Pehle incident par on-call engineer ne card se do minute mein missing prefix dhoondh liya.</p><p><b>Lesson:</b> woh paanch facts likh do jo doosron ko raat 2 baje chahiye honge.</p></div>

<div class="iv"><p class="q">"HQ ko Prisma Access se kaise jodte ho, summarise karo."</p><p>HQ ke nazdeek service connection banao tunnel, tunnel monitoring aur BGP ya static routes ke saath; push karo (Panorama mein Service Setup ke saath); HQ-FW par matching tunnel aur BGP banao; mobile pool, branch subnets aur infrastructure subnet ke return routes add karo; Source NAT aur backbone options decide karo; aur cloud, firewall aur user teeno se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Service connection matlab HQ ya data centre access aur mobile-to-branch traffic ka hub.</li>
<li>HQ-FW ko tunnel, BGP aur return routes chahiye.</li>
<li>Source NAT optional hai aur return route chhota karta hai.</li>
<li>Backbone aur routing preference kai service connections ke saath matter karte hain.</li>
<li>Teen views se verify karo aur fail ho to packet follow karo.</li>
</ul></div>
`}};export{e as default};