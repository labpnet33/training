var e={id:`routes-policies`,h:{en:`Wiring it together: the zone route and the firewall policy`,hi:`Sab kuch jodna: zone ka route aur firewall policy`},body:{en:`
<p>Members and zones alone carry no traffic. You need two more things that you already know from <b>nse4-routing</b>: a route and a policy. In SD-WAN, both point at the <b>zone</b>. The route tells the FortiGate "internet traffic leaves through the zone"; the policy says "the LAN may go to the zone, with NAT". SD-WAN then chooses the member.</p>
<pre class="code"><span class="c">! Try it: lab "Two ISPs become one SD-WAN zone"</span>
config router static
    edit 1
        set sdwan-zone "virtual-wan-link"
        set comment "Default route over the SD-WAN zone"
    next
end
config firewall policy
    edit 10
        set name "LAN-to-SDWAN"
        set srcintf "port2"
        set dstintf "virtual-wan-link"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set nat enable
    next
end</pre>
<p>Compare this with the floating-route design of nse4-routing. There you needed two default routes with different distances and one policy that listed both interfaces. Here there is one default route and one policy, and the choice between ISP-A and ISP-B moves into SD-WAN where it can use quality measurements. The route has no gateway of its own because each member carries its gateway.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="diagram"><rect x="10" y="70" width="110" height="50" rx="10" fill="#bae6fd"/><text x="65" y="92" text-anchor="middle" class="svg-ink" font-size="13">port2 LAN</text><text x="65" y="109" text-anchor="middle" class="svg-muted" font-size="11">10.0.1.0/24</text><rect x="160" y="20" width="200" height="50" rx="10" fill="#fed7aa"/><text x="260" y="42" text-anchor="middle" class="svg-ink" font-size="13">Policy 10</text><text x="260" y="59" text-anchor="middle" class="svg-muted" font-size="11">port2 -> virtual-wan-link</text><rect x="160" y="120" width="200" height="50" rx="10" fill="#ddd6fe"/><text x="260" y="142" text-anchor="middle" class="svg-ink" font-size="13">Route 1</text><text x="260" y="159" text-anchor="middle" class="svg-muted" font-size="11">0.0.0.0/0 -> zone</text><rect x="410" y="70" width="220" height="50" rx="10" fill="#bbf7d0"/><text x="520" y="92" text-anchor="middle" class="svg-ink" font-size="13">SD-WAN picks a member</text><text x="520" y="109" text-anchor="middle" class="svg-muted" font-size="11">port1 / port4</text><line x1="120" y1="95" x2="160" y2="45" stroke="#64748b" stroke-width="2"/><line x1="120" y1="95" x2="160" y2="145" stroke="#64748b" stroke-width="2"/><line x1="360" y1="45" x2="410" y2="90" stroke="#64748b" stroke-width="2"/><line x1="360" y1="145" x2="410" y2="100" stroke="#64748b" stroke-width="2"/></svg><p class="cap">The route and the policy both point at the zone; SD-WAN picks the member.</p></div>
<h3>What changes in the routing table</h3>
<p>With SD-WAN enabled, the zone's routes appear in the routing table through the member interfaces, and the table behaves like the ECMP example in chapter 6 of nse4-routing: the member gateways are the next hops. SD-WAN rules and the implicit rule decide which of them a given session uses. When a member is considered dead by its health check, its next hop is not used for new sessions even though the interface itself may still be up. That is the big difference from a plain static route.</p>
<h3>Other routes and policies</h3>
<ul><li>Routes to internal networks stay normal static routes (or OSPF/BGP) on the internal interfaces.</li><li>A static route can name a member interface directly when you need a specific path, but then that traffic skips SD-WAN decisions.</li><li>Policies to a zone apply to every member; you no longer need one per ISP.</li><li>NAT still uses the address of the egress interface (see the failover story in nse4-routing).</li></ul>
<div class="warn"><p><b>Common mistake.</b> Leaving an old floating default route (distance 20 via port4) in place after SD-WAN is enabled. It overlaps with the zone route and confuses troubleshooting. Remove it, or its interface will not be allowed as a member.</p></div>
<div class="exam"><p><b>Exam trap.</b> Policies and the default route refer to the SD-WAN zone. The members' own interfaces are not used in policies. NAT still follows the egress interface.</p></div>
<div class="scn"><h4>One policy instead of four</h4><p>A bank branch template had four policies, one per ISP direction and protocol, and every new link meant new copies. Moving the template to a zone gave one policy and one default route per branch; adding a third link later was a three-line change on each unit.</p><p><b>Lesson:</b> Zones make templates smaller and growth cheaper.</p></div>
<div class="iv"><p class="q">"Which objects point to the SD-WAN zone instead of to physical interfaces?"</p><p>The default static route (set with sdwan-zone) and the firewall policies (srcintf or dstintf). Internal routes and policies still use physical interfaces. NAT uses the address of whichever member carries the session.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>One default route and one policy point at the zone.</li><li>Each member carries its own gateway.</li><li>A dead member is skipped for new sessions even if its interface is up.</li><li>Remove old floating routes and per-ISP policies after migrating.</li></ul></div>
`,hi:`
<p>Sirf members aur zones traffic nahi uthate. Aapko do aur cheezein chahiye jo aap <b>nse4-routing</b> se jaante ho: route aur policy. SD-WAN mein dono <b>zone</b> ko point karte hain. Route FortiGate ko batata hai "internet traffic zone se nikalta hai"; policy kehti hai "LAN zone tak jaa sakta hai, NAT ke saath". SD-WAN phir member chunta hai.</p>
<pre class="code"><span class="c">! Try it: lab "Do ISPs ek SD-WAN zone bante hain"</span>
config router static
    edit 1
        set sdwan-zone "virtual-wan-link"
        set comment "Default route over the SD-WAN zone"
    next
end
config firewall policy
    edit 10
        set name "LAN-to-SDWAN"
        set srcintf "port2"
        set dstintf "virtual-wan-link"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set nat enable
    next
end</pre>
<p>Isse nse4-routing ke floating-route design se compare karo. Wahan alag distance wale do default routes aur dono interfaces list karne wali ek policy chahiye thi. Yahan ek default route aur ek policy hai, aur ISP-A aur ISP-B ka chunav SD-WAN mein chala gaya hai jahan woh quality measurements use kar sakta hai. Route ka apna gateway nahi hota kyunki har member apna gateway rakhta hai.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="diagram"><rect x="10" y="70" width="110" height="50" rx="10" fill="#bae6fd"/><text x="65" y="92" text-anchor="middle" class="svg-ink" font-size="13">port2 LAN</text><text x="65" y="109" text-anchor="middle" class="svg-muted" font-size="11">10.0.1.0/24</text><rect x="160" y="20" width="200" height="50" rx="10" fill="#fed7aa"/><text x="260" y="42" text-anchor="middle" class="svg-ink" font-size="13">Policy 10</text><text x="260" y="59" text-anchor="middle" class="svg-muted" font-size="11">port2 -> virtual-wan-link</text><rect x="160" y="120" width="200" height="50" rx="10" fill="#ddd6fe"/><text x="260" y="142" text-anchor="middle" class="svg-ink" font-size="13">Route 1</text><text x="260" y="159" text-anchor="middle" class="svg-muted" font-size="11">0.0.0.0/0 -> zone</text><rect x="410" y="70" width="220" height="50" rx="10" fill="#bbf7d0"/><text x="520" y="92" text-anchor="middle" class="svg-ink" font-size="13">SD-WAN member chunta hai</text><text x="520" y="109" text-anchor="middle" class="svg-muted" font-size="11">port1 / port4</text><line x1="120" y1="95" x2="160" y2="45" stroke="#64748b" stroke-width="2"/><line x1="120" y1="95" x2="160" y2="145" stroke="#64748b" stroke-width="2"/><line x1="360" y1="45" x2="410" y2="90" stroke="#64748b" stroke-width="2"/><line x1="360" y1="145" x2="410" y2="100" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Route aur policy dono zone ko point karte hain; SD-WAN member chunta hai.</p></div>
<h3>Routing table mein kya badalta hai</h3>
<p>SD-WAN enabled hone par zone ke routes member interfaces ke through routing table mein aate hain, aur table nse4-routing ke chapter 6 ke ECMP example jaisa behave karta hai: member gateways next hops hote hain. SD-WAN rules aur implicit rule tay karte hain ki diya gaya session inmein se kaun sa use karega. Health check kisi member ko dead maane to uska next hop naye sessions ke liye use nahi hota, chahe interface khud up ho. Yeh plain static route se bada difference hai.</p>
<h3>Doosre routes aur policies</h3>
<ul><li>Internal networks ke routes normal static routes (ya OSPF/BGP) internal interfaces par rehte hain.</li><li>Specific path chahiye to static route member interface ko seedha naam de sakta hai, lekin tab woh traffic SD-WAN decisions skip karta hai.</li><li>Zone ki policies har member par lagu hoti hain; ab har ISP ke liye alag policy nahi chahiye.</li><li>NAT ab bhi egress interface ka address use karta hai (nse4-routing ki failover kahani dekho).</li></ul>
<div class="warn"><p><b>Common galti.</b> SD-WAN enable hone ke baad purana floating default route (port4 ke through distance 20) chhod dena. Woh zone route se overlap karta hai aur troubleshooting confuse karta hai. Use hatao, warna uska interface member banne nahi diya jayega.</p></div>
<div class="exam"><p><b>Exam trap.</b> Policies aur default route SD-WAN zone ko refer karte hain. Members ke apne interfaces policies mein use nahi hote. NAT ab bhi egress interface follow karta hai.</p></div>
<div class="scn"><h4>Chaar ki jagah ek policy</h4><p>Bank branch template mein chaar policies thi, har ISP direction aur protocol ke liye ek, aur har nayi link ka matlab nayi copies. Template ko zone par le jaane se har branch par ek policy aur ek default route mila; baad mein teesri link jodna har unit par teen line ka change tha.</p><p><b>Seekh:</b> Zones templates ko chhota aur growth ko sasta banate hain.</p></div>
<div class="iv"><p class="q">"Kaun se objects physical interfaces ki jagah SD-WAN zone ko point karte hain?"</p><p>Default static route (sdwan-zone ke saath) aur firewall policies (srcintf ya dstintf). Internal routes aur policies physical interfaces use karte rehte hain. NAT us member ka address use karta hai jo session uthata hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Ek default route aur ek policy zone ko point karti hain.</li><li>Har member apna gateway rakhta hai.</li><li>Dead member naye sessions ke liye skip hota hai chahe uska interface up ho.</li><li>Migrate karne ke baad purane floating routes aur per-ISP policies hatao.</li></ul></div>
`}};export{e as default};