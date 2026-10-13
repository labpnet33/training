var e={id:`ipsec-summary`,h:{en:`Summary: design patterns, exam traps and the can-do checklist`,hi:`Summary: design patterns, exam traps aur can-do checklist`},body:{en:`
<p>You have built a dial-up hub, three spokes' worth of logic, BGP over the overlay, ADVPN shortcuts and a repeatable method for tickets. This last chapter gathers everything into one page you can revise the night before the exam or an interview.</p>

<h3>The Kaveri Retail design on a page</h3>
<div class="dia"><svg viewBox="0 0 660 250" role="img" aria-label="Design summary">
<rect x="250" y="15" width="160" height="70" rx="10" fill="#bae6fd"/><text x="330" y="40" text-anchor="middle" class="svg-ink" font-size="14">HQ-FGT hub</text><text x="330" y="60" text-anchor="middle" class="svg-muted" font-size="12">KR-ADVPN dynamic, sender, RR</text><text x="330" y="76" text-anchor="middle" class="svg-muted" font-size="11">hairpin policy, 10.255.1.1</text>
<rect x="20" y="160" width="190" height="70" rx="10" fill="#ddd6fe"/><text x="115" y="185" text-anchor="middle" class="svg-ink" font-size="14">MDU-FGT spoke</text><text x="115" y="205" text-anchor="middle" class="svg-muted" font-size="12">TO-HQ static, receiver, .2</text>
<rect x="450" y="160" width="190" height="70" rx="10" fill="#ddd6fe"/><text x="545" y="185" text-anchor="middle" class="svg-ink" font-size="14">TRY-FGT spoke</text><text x="545" y="205" text-anchor="middle" class="svg-muted" font-size="12">TO-HQ static, receiver, .3</text>
<line x1="270" y1="85" x2="130" y2="160" stroke="#64748b" stroke-width="3"/><line x1="390" y1="85" x2="530" y2="160" stroke="#64748b" stroke-width="3"/>
<line x1="210" y1="195" x2="450" y2="195" stroke="#22c55e" stroke-width="4" stroke-dasharray="8 5"/>
</svg><p class="cap">Static spokes dial a dynamic hub; iBGP reflects LANs; shortcuts connect spokes on demand.</p></div>

<h3>Design patterns</h3>
<ul>
<li><b>Single hub, ADVPN</b> (this module): simplest; the hub is a single point of failure for new shortcuts, existing shortcuts survive if independent.</li>
<li><b>Dual hub</b>: two phase 1s on each spoke to two hubs, BGP preference decides the active hub. Theory for the exam; not modelled in these labs.</li>
<li><b>Overlay plan</b>: one subnet per hub overlay, /32 per unit, router-ID equal to the tunnel IP.</li>
<li><b>Static vs dial-up</b>: static where the peer address is fixed (the spoke dials the hub); dynamic where many unknown peers connect (the hub).</li>
</ul>

<h3>Can-do checklist</h3>
<ul>
<li>Explain IKE SA versus child SA and what selectors(total,up) means.</li>
<li>Configure a static spoke and a dynamic hub with matching phase 1 and phase 2.</li>
<li>Address a tunnel interface (/32 ip, remote-ip with mask) and explain exchange-interface-ip and add-route.</li>
<li>Build iBGP with a route reflector, neighbor-group and neighbor-range.</li>
<li>Enable ADVPN: sender, receivers, hairpin policy; recognise shortcut names.</li>
<li>Read an IKE debug and name the failing clause from the notify.</li>
<li>Apply the ladder: selectors, policy, routing, return path.</li>
</ul>

<h3>Most-tested facts</h3>
<table class="tbl"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>IKE ports</td><td>UDP 500 (4500 with NAT-T)</td></tr>
<tr><td>Wrong proposal / DH</td><td>NO_PROPOSAL_CHOSEN</td></tr>
<tr><td>Wrong PSK or ID</td><td>AUTHENTICATION_FAILED</td></tr>
<tr><td>Wrong selectors</td><td>TS_UNACCEPTABLE</td></tr>
<tr><td>Dial-up instance names</td><td>template_N (KR-ADVPN_0)</td></tr>
<tr><td>Shortcut names</td><td>phase1_N (TO-HQ_0)</td></tr>
<tr><td>add-route distance</td><td>15</td></tr>
<tr><td>idle-timeoutinterval minimum</td><td>10 minutes</td></tr>
<tr><td>Hub needs for spoke-to-spoke</td><td>policy tunnel to same tunnel</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">get vpn ipsec tunnel summary
diagnose vpn ike gateway list name TO-HQ
diagnose vpn tunnel list name TO-HQ
diagnose vpn ike gateway clear name TO-HQ
diagnose vpn ike log filter name TO-HQ
diagnose debug application ike -1
diagnose debug enable        <span class="c">! and later: diagnose debug disable, diagnose debug reset</span>
get router info routing-table all
get router info bgp summary
execute router clear bgp all</pre>
<div class="warn"><p><b>Common mistake.</b> Leaving the debug on. Always <code>diagnose debug disable</code> and <code>diagnose debug reset</code> when finished, or the console floods and the unit slows.</p></div>
<div class="exam"><p><b>Last traps.</b> (1) A policy must name the tunnel or IKE is ignored. (2) next-hop-self-rr on the reflector defeats ADVPN. (3) Receiver is needed on both spokes. (4) PFS must agree. (5) Clear BGP after option changes.</p></div>

<div class="scn"><h4>Handover note</h4><p>The Kaveri engineer who built the overlay left the company. His handover page had five lines: addresses, the PSK location, the BGP AS, the ADVPN roles, and "check policy, route, next hop before touching crypto". The new engineer closed the first ticket in ten minutes.</p><p><b>Lesson:</b> write the design in five lines; it saves hours at 2 a.m.</p></div>

<div class="iv"><p class="q">"Walk me through building a new branch on an existing ADVPN network."</p><p>Reserve a /32 from the overlay, configure the tunnel interface, static phase 1 to the hub with the same proposal, DH and key, phase 2 with PFS, receiver enabled, policies LAN to tunnel and back, then BGP to the hub. The hub needs no change. Verify with the summary, BGP and a ping to another branch.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know the three notifies and what each points to.</li>
<li>Know the ADVPN trio: sender, receivers, hairpin policy.</li>
<li>Know the ladder for tickets with a tunnel that is up.</li>
<li>Plan the overlay and document the design in a few lines.</li>
</ul></div>
`,hi:`
<p>Aapne dial-up hub, teen spokes ka logic, overlay par BGP, ADVPN shortcuts aur tickets ke liye repeatable method bana liya. Yeh aakhri chapter sab kuch ek page mein samet deta hai jise aap exam ya interview se pehle raat ko revise kar sakte ho.</p>

<h3>Kaveri Retail design ek page par</h3>
<div class="dia"><svg viewBox="0 0 660 250" role="img" aria-label="Design summary">
<rect x="250" y="15" width="160" height="70" rx="10" fill="#bae6fd"/><text x="330" y="40" text-anchor="middle" class="svg-ink" font-size="14">HQ-FGT hub</text><text x="330" y="60" text-anchor="middle" class="svg-muted" font-size="12">KR-ADVPN dynamic, sender, RR</text><text x="330" y="76" text-anchor="middle" class="svg-muted" font-size="11">hairpin policy, 10.255.1.1</text>
<rect x="20" y="160" width="190" height="70" rx="10" fill="#ddd6fe"/><text x="115" y="185" text-anchor="middle" class="svg-ink" font-size="14">MDU-FGT spoke</text><text x="115" y="205" text-anchor="middle" class="svg-muted" font-size="12">TO-HQ static, receiver, .2</text>
<rect x="450" y="160" width="190" height="70" rx="10" fill="#ddd6fe"/><text x="545" y="185" text-anchor="middle" class="svg-ink" font-size="14">TRY-FGT spoke</text><text x="545" y="205" text-anchor="middle" class="svg-muted" font-size="12">TO-HQ static, receiver, .3</text>
<line x1="270" y1="85" x2="130" y2="160" stroke="#64748b" stroke-width="3"/><line x1="390" y1="85" x2="530" y2="160" stroke="#64748b" stroke-width="3"/>
<line x1="210" y1="195" x2="450" y2="195" stroke="#22c55e" stroke-width="4" stroke-dasharray="8 5"/>
</svg><p class="cap">Static spokes dynamic hub ko dial karte hain; iBGP LANs reflect karta hai; shortcuts zaroorat par spokes ko jodte hain.</p></div>

<h3>Design patterns</h3>
<ul>
<li><b>Single hub, ADVPN</b> (yeh module): sabse simple; naye shortcuts ke liye hub single point of failure hai, independent ho to existing shortcuts bach jaate hain.</li>
<li><b>Dual hub</b>: har spoke par do hubs ke liye do phase 1, BGP preference active hub tay karta hai. Exam ke liye theory; in labs mein model nahi hai.</li>
<li><b>Overlay plan</b>: har hub overlay ke liye ek subnet, har unit ka /32, router-ID tunnel IP ke barabar.</li>
<li><b>Static vs dial-up</b>: jahan peer address fixed hai wahan static (spoke hub ko dial karta hai); jahan bahut se anjaan peers connect hote hain wahan dynamic (hub).</li>
</ul>

<h3>Can-do checklist</h3>
<ul>
<li>IKE SA aur child SA ka farq aur selectors(total,up) ka matlab samjhao.</li>
<li>Matching phase 1 aur phase 2 ke saath static spoke aur dynamic hub configure karo.</li>
<li>Tunnel interface address karo (/32 ip, mask ke saath remote-ip) aur exchange-interface-ip tathaa add-route samjhao.</li>
<li>Route reflector, neighbor-group aur neighbor-range ke saath iBGP banao.</li>
<li>ADVPN enable karo: sender, receivers, hairpin policy; shortcut names pehchano.</li>
<li>IKE debug padho aur notify se failing clause batao.</li>
<li>Seedhi lagao: selectors, policy, routing, return path.</li>
</ul>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="tbl"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>IKE ports</td><td>UDP 500 (NAT-T ke saath 4500)</td></tr>
<tr><td>Galat proposal / DH</td><td>NO_PROPOSAL_CHOSEN</td></tr>
<tr><td>Galat PSK ya ID</td><td>AUTHENTICATION_FAILED</td></tr>
<tr><td>Galat selectors</td><td>TS_UNACCEPTABLE</td></tr>
<tr><td>Dial-up instance names</td><td>template_N (KR-ADVPN_0)</td></tr>
<tr><td>Shortcut names</td><td>phase1_N (TO-HQ_0)</td></tr>
<tr><td>add-route distance</td><td>15</td></tr>
<tr><td>idle-timeoutinterval minimum</td><td>10 minute</td></tr>
<tr><td>Spoke-to-spoke ke liye hub ko chahiye</td><td>tunnel se usi tunnel ki policy</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">get vpn ipsec tunnel summary
diagnose vpn ike gateway list name TO-HQ
diagnose vpn tunnel list name TO-HQ
diagnose vpn ike gateway clear name TO-HQ
diagnose vpn ike log filter name TO-HQ
diagnose debug application ike -1
diagnose debug enable        <span class="c">! aur baad mein: diagnose debug disable, diagnose debug reset</span>
get router info routing-table all
get router info bgp summary
execute router clear bgp all</pre>
<div class="warn"><p><b>Common mistake.</b> Debug on chhod dena. Kaam khatam hone par hamesha <code>diagnose debug disable</code> aur <code>diagnose debug reset</code> chalao, warna console flood hota hai aur unit slow ho jata hai.</p></div>
<div class="exam"><p><b>Aakhri traps.</b> (1) Policy mein tunnel ka naam ho warna IKE ignore. (2) Reflector par next-hop-self-rr ADVPN ko haraa deta hai. (3) Receiver dono spokes par chahiye. (4) PFS agree hona chahiye. (5) Option badalne ke baad BGP clear karo.</p></div>

<div class="scn"><h4>Handover note</h4><p>Kaveri ka jis engineer ne overlay banaya woh company chhod gaya. Uske handover page par paanch lines thin: addresses, PSK kahan hai, BGP AS, ADVPN roles, aur "crypto ko chhune se pehle policy, route, next hop dekho". Naye engineer ne pehla ticket das minute mein band kar diya.</p><p><b>Lesson:</b> design paanch lines mein likho; raat ke 2 baje ghanton bachte hain.</p></div>

<div class="iv"><p class="q">"Maujooda ADVPN network par nayi branch kaise banaoge?"</p><p>Overlay se ek /32 reserve karo, tunnel interface configure karo, hub tak same proposal, DH aur key ke saath static phase 1, PFS ke saath phase 2, receiver enabled, LAN se tunnel aur wapas ki policies, phir hub tak BGP. Hub par kuch badalna nahi. Summary, BGP aur doosri branch ko ping se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen notifies aur har ek kis cheez ki taraf ishara karta hai, jaano.</li>
<li>ADVPN trio jaano: sender, receivers, hairpin policy.</li>
<li>Up tunnel wale tickets ke liye seedhi jaano.</li>
<li>Overlay plan karo aur design ko kuch lines mein document karo.</li>
</ul></div>
`}};export{e as default};