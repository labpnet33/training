var e={id:`interfaces-zones-policies`,h:{en:`Interfaces, zones and policies: the three nouns`,hi:`Interfaces, zones aur policies: teen nouns`},body:{en:`
<p>Every FortiGate configuration is built from three nouns: <b>interfaces</b> (where traffic enters and leaves), <b>zones</b> (optional groups of interfaces) and <b>policies</b> (the permission rules). Get these three clear and the rest of the track is detail.</p>
<h3>Interfaces</h3>
<p>Each port (<code>port1</code>, <code>port2</code> and so on) is a routed interface with its own IP address and subnet, just like a router port. There are also <b>VLAN interfaces</b> (802.1Q sub-interfaces on a port), loopbacks and aggregate interfaces. Two settings you meet on day one: <b>role</b> (lan, wan, dmz, undefined), which tags the interface for the GUI and logs, and <b>allowaccess</b>, which controls which management services the FortiGate itself answers on that interface (ping, HTTPS, SSH). Neither changes forwarding. Full detail is in nse4-setup.</p>
<h3>Zones</h3>
<p>A <b>zone</b> groups several interfaces so one policy can cover all of them. If port3 and port4 are both DMZ segments, put them in a zone called DMZ and write one policy to the zone instead of two. A zone also has an <b>intrazone</b> setting that decides whether traffic between two members of the same zone is allowed or denied by default. Zones and VLAN interfaces get their own module, nse4-zones. For now remember: <b>a policy refers to interfaces or zones, never to a bare IP network</b>.</p>
<h3>Policies</h3>
<p>A <b>firewall policy</b> says: traffic arriving on <i>srcintf</i> from <i>srcaddr</i>, leaving through <i>dstintf</i> to <i>dstaddr</i>, using <i>service</i>, during <i>schedule</i>, gets <i>action</i>. Policies are numbered and checked <b>top to bottom, first match wins</b>. This is the real policy used in the labs:</p>
<pre class="code">NK-PUNE-FGT # show firewall policy</pre>
<pre class="out">config firewall policy
    edit 1
        set name "LAN-to-WAN"
        set uuid c419304d-fa62-513a-b900-7e81c948a7ab
        set <span class="hl">srcintf "port2"</span>
        set <span class="hl">dstintf "port1"</span>
        set action accept
        set srcaddr "all"
        set dstaddr "all"
        set schedule "always"
        set service "ALL"
        set <span class="hl">nat enable</span>
    next
end</pre>
<table class="cmp"><tr><th>Field</th><th>Meaning</th><th>Here</th></tr><tr><td>srcintf / dstintf</td><td>ingress and egress interface or zone</td><td>port2 / port1</td></tr><tr><td>srcaddr / dstaddr</td><td>address objects; <code>all</code> means any</td><td>all</td></tr><tr><td>service</td><td>protocol and port object</td><td>ALL</td></tr><tr><td>schedule</td><td>when the rule applies</td><td>always</td></tr><tr><td>action</td><td>accept / deny</td><td>accept</td></tr><tr><td>nat</td><td>rewrite the source to the egress address</td><td>enable</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="One policy, one direction"><rect x="10" y="40" width="120" height="70" rx="9" fill="#bbf7d0"/><text x="70" y="72" text-anchor="middle" class="svg-ink" font-size="13">port2</text><text x="70" y="89" text-anchor="middle" class="svg-muted" font-size="11">LAN 10.0.1.1</text><line x1="130" y1="75" x2="215" y2="75" stroke="#64748b" stroke-width="2"/><text x="172" y="68" text-anchor="middle" class="svg-accent" font-size="11">policy 1</text><rect x="215" y="30" width="210" height="90" rx="9" fill="#fde68a"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="320" y="89" text-anchor="middle" class="svg-muted" font-size="11">LAN-to-WAN: accept + NAT</text><line x1="425" y1="75" x2="510" y2="75" stroke="#64748b" stroke-width="2"/><rect x="510" y="40" width="120" height="70" rx="9" fill="#e2e8f0"/><text x="570" y="72" text-anchor="middle" class="svg-ink" font-size="13">port1</text><text x="570" y="89" text-anchor="middle" class="svg-muted" font-size="11">WAN 203.0.113.2</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="11">There is no policy from port1 to port2, so the internet cannot start connections inwards</text></svg><p class="cap">One policy, one direction</p></div>
<div class="eg"><p><b>Worked example.</b> To let the DMZ web server reach an update server, you add a policy with srcintf port3, dstintf port1, srcaddr the server's address object, service HTTPS. The LAN gets no new permission. Each policy answers one question: which direction, which sources, which services.</p></div>
<div class="warn"><p><b>Common mistake.</b> Writing a policy for the wrong direction. A policy port1 &rarr; port2 does not allow LAN-initiated traffic; it governs connections that start on the WAN side. Replies are handled by the session, not by a reverse policy.</p></div>
<div class="exam"><p><b>Exam trap.</b> Policies match on interface or zone, not on a subnet alone. Subnets are described by <b>address objects</b> inside the policy. Also: policy order matters and the implicit deny is last.</p></div>
<div class="scn"><h4>One DMZ, two ports</h4><p>A company split its DMZ across port3 and port4 and wrote identical policies for each. A later change updated one and forgot the other, and a service worked from only half the servers. After grouping both interfaces into a DMZ zone, one policy covered both and the drift disappeared.</p><p><b>Lesson:</b> zones reduce duplicate policies and the mistakes that come with them.</p></div>
<div class="iv"><p class="q">"What is the difference between an interface, a zone and a policy?"</p><p>An interface is a routed port or VLAN with its own subnet. A zone is a group of interfaces that lets one policy cover several of them. A policy is the permission rule: ingress, egress, source, destination, service, schedule and action. Policies reference interfaces or zones, are evaluated top down, and the first match wins.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Interfaces carry the IPs; zones group interfaces; policies grant permission.</li>
<li>Role and allowaccess do not change forwarding.</li>
<li>Policies are one-directional; replies ride the session.</li>
<li>First match wins; implicit deny is last.</li>
</ul></div>
`,hi:`
<p>Har FortiGate configuration teen nouns se bani hai: <b>interfaces</b> (jahan traffic aata aur jaata hai), <b>zones</b> (interfaces ke optional groups) aur <b>policies</b> (permission rules). Yeh teen saaf ho gaye to baaki track details hai.</p>
<h3>Interfaces</h3>
<p>Har port (<code>port1</code>, <code>port2</code> aadi) ek routed interface hai jiska apna IP address aur subnet hota hai, router port ki tarah. <b>VLAN interfaces</b> (port par 802.1Q sub-interfaces), loopbacks aur aggregate interfaces bhi hote hain. Pehle din do settings milti hain: <b>role</b> (lan, wan, dmz, undefined), jo interface ko GUI aur logs ke liye tag karta hai, aur <b>allowaccess</b>, jo tay karta hai ki us interface par FortiGate khud kaunsi management services ka jawab dega (ping, HTTPS, SSH). Dono forwarding nahi badalte. Poori detail nse4-setup mein hai.</p>
<h3>Zones</h3>
<p><b>Zone</b> kai interfaces ko group karta hai taaki ek policy sab ko cover kare. Agar port3 aur port4 dono DMZ segments hain to unhe DMZ naam ke zone mein daalo aur do ki jagah zone ke liye ek policy likho. Zone mein <b>intrazone</b> setting bhi hoti hai jo tay karti hai ki same zone ke do members ke beech traffic default se allow ya deny hoga. Zones aur VLAN interfaces ka apna module hai, nse4-zones. Abhi yaad rakho: <b>policy interfaces ya zones ko refer karti hai, kisi bare IP network ko nahi</b>.</p>
<h3>Policies</h3>
<p><b>Firewall policy</b> kehti hai: <i>srcintf</i> par <i>srcaddr</i> se aane wala traffic, <i>dstintf</i> se <i>dstaddr</i> ki taraf jaane wala, <i>service</i> use karte hue, <i>schedule</i> ke dauran, <i>action</i> paata hai. Policies numbered hoti hain aur <b>upar se neeche check hoti hain, pehli match jeetti hai</b>. Labs mein yahi asli policy use hoti hai:</p>
<pre class="code">NK-PUNE-FGT # show firewall policy</pre>
<pre class="out">config firewall policy
    edit 1
        set name "LAN-to-WAN"
        set uuid c419304d-fa62-513a-b900-7e81c948a7ab
        set <span class="hl">srcintf "port2"</span>
        set <span class="hl">dstintf "port1"</span>
        set action accept
        set srcaddr "all"
        set dstaddr "all"
        set schedule "always"
        set service "ALL"
        set <span class="hl">nat enable</span>
    next
end</pre>
<table class="cmp"><tr><th>Field</th><th>Matlab</th><th>Yahan</th></tr><tr><td>srcintf / dstintf</td><td>ingress aur egress interface ya zone</td><td>port2 / port1</td></tr><tr><td>srcaddr / dstaddr</td><td>address objects; <code>all</code> matlab any</td><td>all</td></tr><tr><td>service</td><td>protocol aur port object</td><td>ALL</td></tr><tr><td>schedule</td><td>rule kab lagu hota hai</td><td>always</td></tr><tr><td>action</td><td>accept / deny</td><td>accept</td></tr><tr><td>nat</td><td>source ko egress address mein badlo</td><td>enable</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Ek policy, ek direction"><rect x="10" y="40" width="120" height="70" rx="9" fill="#bbf7d0"/><text x="70" y="72" text-anchor="middle" class="svg-ink" font-size="13">port2</text><text x="70" y="89" text-anchor="middle" class="svg-muted" font-size="11">LAN 10.0.1.1</text><line x1="130" y1="75" x2="215" y2="75" stroke="#64748b" stroke-width="2"/><text x="172" y="68" text-anchor="middle" class="svg-accent" font-size="11">policy 1</text><rect x="215" y="30" width="210" height="90" rx="9" fill="#fde68a"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="320" y="89" text-anchor="middle" class="svg-muted" font-size="11">LAN-to-WAN: accept + NAT</text><line x1="425" y1="75" x2="510" y2="75" stroke="#64748b" stroke-width="2"/><rect x="510" y="40" width="120" height="70" rx="9" fill="#e2e8f0"/><text x="570" y="72" text-anchor="middle" class="svg-ink" font-size="13">port1</text><text x="570" y="89" text-anchor="middle" class="svg-muted" font-size="11">WAN 203.0.113.2</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="11">port1 se port2 ki koi policy nahi, isliye internet andar ki taraf connection shuru nahi kar sakta</text></svg><p class="cap">Ek policy, ek direction</p></div>
<div class="eg"><p><b>Worked example.</b> DMZ web server ko update server tak jaane dene ke liye aap policy add karte ho: srcintf port3, dstintf port1, srcaddr server ka address object, service HTTPS. LAN ko koi nayi permission nahi milti. Har policy ek sawaal ka jawab deti hai: kaunsa direction, kaunse sources, kaunsi services.</p></div>
<div class="warn"><p><b>Common mistake.</b> Galat direction ki policy likhna. port1 &rarr; port2 policy LAN se shuru hone wale traffic ko allow nahi karti; woh un connections ko govern karti hai jo WAN side se shuru hote hain. Replies session handle karta hai, reverse policy nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Policies interface ya zone par match karti hain, sirf subnet par nahi. Subnets policy ke andar <b>address objects</b> se describe hote hain. Ye bhi: policy order matter karta hai aur implicit deny sabse aakhir mein hai.</p></div>
<div class="scn"><h4>Ek DMZ, do ports</h4><p>Ek company ne DMZ ko port3 aur port4 mein baant diya aur dono ke liye ek jaisi policies likhin. Baad ke change ne ek ko update kiya aur doosri bhool gaya, aur ek service sirf aadhe servers se chali. Dono interfaces ko DMZ zone mein group karne ke baad ek policy ne dono ko cover kiya aur drift khatam ho gaya.</p><p><b>Lesson:</b> zones duplicate policies aur unse hone wali galtiyan kam karte hain.</p></div>
<div class="iv"><p class="q">"Interface, zone aur policy mein kya difference hai?"</p><p>Interface ek routed port ya VLAN hai jiska apna subnet hota hai. Zone interfaces ka group hai jisse ek policy kai interfaces cover karti hai. Policy permission rule hai: ingress, egress, source, destination, service, schedule aur action. Policies interfaces ya zones ko refer karti hain, upar se neeche evaluate hoti hain, aur pehli match jeetti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Interfaces IPs rakhte hain; zones interfaces ko group karte hain; policies permission deti hain.</li>
<li>Role aur allowaccess forwarding nahi badalte.</li>
<li>Policies one-directional hoti hain; replies session par chalte hain.</li>
<li>Pehli match jeetti hai; implicit deny aakhir mein hai.</li>
</ul></div>
`}};export{e as default};