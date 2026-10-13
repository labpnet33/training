var e={id:`summary-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p><b>Analogy: a building with floors.</b> The trunk is the lift shaft, tags are floor numbers, subinterfaces are the doors on each floor, and zones and rules are the security desks. This module taught you to build the doors and desks correctly.</p>

<h3>What you now know</h3>
<ul>
<li>A trunk carries many VLANs on one link using 802.1Q tags; an access port carries one.</li>
<li>Layer 3 subinterfaces (ethernet1/2.10) give each VLAN its own gateway, zone and policy.</li>
<li>Untagged frames go to the parent interface; tags are unique per parent.</li>
<li>Virtual wire, Layer 2 and tap exist for other needs; aggregate ethernet is a parent that adds capacity.</li>
</ul>

<h3>Run in the simulator vs reference only</h3>
<table>
<tr><th>Topic</th><th>Status</th></tr>
<tr><td>L3 subinterfaces, zones, routes, rules, tests</td><td>Captured from the simulator</td></tr>
<tr><td>Virtual wire, Layer 2, VLAN interface, tap, aggregate ethernet</td><td>Reference configuration (not run in the simulator)</td></tr>
</table>
<p>This module has no labs of its own. Practise on pan-setup (interfaces, zones, commit), pan-policy (rules), ccna-vlans (the switch side) and nse4-zones (zone thinking).</p>

<h3>The build checklist (L3 subinterfaces)</h3>
<pre class="code">set network interface ethernet ethernet1/2 layer3 units ethernet1/2.10 tag 10 ip 10.10.10.1/24 interface-management-profile allow-ping
set network virtual-router default interface ethernet1/2.10
set zone users network layer3 ethernet1/2.10
set rulebase security rules Users-to-Servers from users to servers source any destination any application [ ping web-browsing ] service application-default action allow
commit</pre>
<p>Then verify: <code>show interface all</code>, <code>show routing route</code>, <code>show arp all</code>, a host ping, <code>test security-policy-match</code>, <code>show session all</code>, <code>show log traffic</code>.</p>

<h3>Exam checklist</h3>
<ul>
<li>A subinterface needs a tag, an IP, a virtual router and a zone.</li>
<li>Commit fails if the tag is missing; a wrong tag commits and fails silently.</li>
<li>Same-zone traffic is allowed by default; between zones it is denied until a rule exists.</li>
<li>Virtual wire: no IP, no routing, default tag 0 only.</li>
<li>Layer 2: VLAN object is the domain, VLAN interface is the gateway.</li>
<li>Tap cannot block.</li>
<li>Only Layer 3 routes and terminates VPN and DHCP.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Question: "Which interface mode lets the firewall be added with no IP changes and no routing role?" Virtual wire. "Which lets it see traffic without affecting it?" Tap. "Which gives each VLAN a separate policy and gateway?" Layer 3 subinterfaces.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Learning commands without the reason. Forgetting the switch half of the design. Claiming practice was done for modes the simulator does not run.</p></div>
<div class="exam"><p><b>Exam trap.</b> Read for the word that decides the mode: "no readdressing" (virtual wire), "visibility only" (tap), "per-VLAN gateway" (L3 subinterfaces), "switch" (Layer 2).</p></div>

<div class="scn"><h4>Pick the mode in one minute</h4><p>A client wants every VLAN to have its own policy and wants VPN to a branch. The one mode that supports both is Layer 3 with tagged subinterfaces. Add aggregate ethernet only if bandwidth or redundancy demands it.</p></div>

<div class="iv"><p class="q">"Walk me through building two VLANs on one firewall port."</p><p>Switch trunk with both VLANs; on the firewall, a parent interface, two subinterfaces with matching tags, IPs, virtual router, zones, then rules between zones, commit, and verify from a host with ARP, session and log.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trunk plus tags plus subinterfaces equals one port, many networks.</li>
<li>Zone and rule per VLAN is the security payoff.</li>
<li>Choose the mode by requirement, not convenience.</li>
<li>Be honest about what you ran and what you only read.</li>
</ul></div>
`,hi:`
<p><b>Analogy: manzilon wali building.</b> Trunk lift shaft hai, tags floor numbers, subinterfaces har floor ke darwaaze, aur zones aur rules security desks. Is module ne aapko darwaaze aur desks sahi banana sikhaya.</p>

<h3>Ab aap kya jaante ho</h3>
<ul>
<li>Trunk 802.1Q tags se ek link par kai VLANs carry karta hai; access port ek.</li>
<li>Layer 3 subinterfaces (ethernet1/2.10) har VLAN ko apna gateway, zone aur policy dete hain.</li>
<li>Untagged frames parent interface par jaate hain; tags har parent par unique hote hain.</li>
<li>Virtual wire, Layer 2 aur tap doosri zarooraton ke liye hain; aggregate ethernet capacity badhane wala parent hai.</li>
</ul>

<h3>Simulator mein chala vs sirf reference</h3>
<table>
<tr><th>Topic</th><th>Status</th></tr>
<tr><td>L3 subinterfaces, zones, routes, rules, tests</td><td>Simulator se captured</td></tr>
<tr><td>Virtual wire, Layer 2, VLAN interface, tap, aggregate ethernet</td><td>Reference configuration (not run in the simulator)</td></tr>
</table>
<p>Is module ka apna koi lab nahi hai. Practice pan-setup (interfaces, zones, commit), pan-policy (rules), ccna-vlans (switch side) aur nse4-zones (zone soch) par karo.</p>

<h3>Build checklist (L3 subinterfaces)</h3>
<pre class="code">set network interface ethernet ethernet1/2 layer3 units ethernet1/2.10 tag 10 ip 10.10.10.1/24 interface-management-profile allow-ping
set network virtual-router default interface ethernet1/2.10
set zone users network layer3 ethernet1/2.10
set rulebase security rules Users-to-Servers from users to servers source any destination any application [ ping web-browsing ] service application-default action allow
commit</pre>
<p>Phir verify karo: <code>show interface all</code>, <code>show routing route</code>, <code>show arp all</code>, host ping, <code>test security-policy-match</code>, <code>show session all</code>, <code>show log traffic</code>.</p>

<h3>Exam checklist</h3>
<ul>
<li>Subinterface ko tag, IP, virtual router aur zone chahiye.</li>
<li>Tag missing ho to commit fail; galat tag commit hota hai aur chupchaap fail.</li>
<li>Same-zone traffic default se allowed; zones ke beech rule aane tak denied.</li>
<li>Virtual wire: na IP, na routing, default sirf tag 0.</li>
<li>Layer 2: VLAN object domain, VLAN interface gateway.</li>
<li>Tap block nahi kar sakta.</li>
<li>Sirf Layer 3 route karta hai aur VPN aur DHCP terminate karta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Sawal: "Kaun sa interface mode firewall ko bina IP change aur bina routing role ke jodta hai?" Virtual wire. "Kaun traffic ko bina asar ke dikhata hai?" Tap. "Kaun har VLAN ko alag policy aur gateway deta hai?" Layer 3 subinterfaces.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reason ke bina commands ratna. Design ka switch wala aadha hissa bhool jaana. Un modes ke liye practice ka dava karna jo simulator chalata hi nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Woh shabd padho jo mode tay karta hai: "no readdressing" (virtual wire), "visibility only" (tap), "per-VLAN gateway" (L3 subinterfaces), "switch" (Layer 2).</p></div>

<div class="scn"><h4>Ek minute mein mode chuno</h4><p>Client chahta hai har VLAN ki apni policy ho aur branch tak VPN bhi. Dono ko support karne wala ek hi mode hai: tagged subinterfaces ke saath Layer 3. Aggregate ethernet tabhi jodo jab bandwidth ya redundancy maange.</p></div>

<div class="iv"><p class="q">"Ek firewall port par do VLANs banana samjhao."</p><p>Switch trunk jisme dono VLANs hon; firewall par parent interface, matching tags wale do subinterfaces, IPs, virtual router, zones, phir zones ke beech rules, commit, aur host se ARP, session aur log se verify.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trunk plus tags plus subinterfaces barabar ek port, kai networks.</li>
<li>Har VLAN ka zone aur rule security ka fayda hai.</li>
<li>Mode requirement se chuno, convenience se nahi.</li>
<li>Imaandari rakho: kya chalaya aur kya sirf padha.</li>
</ul></div>
`}};export{e as default};