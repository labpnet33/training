var e={id:`requirements-design`,h:{en:`Requirements and design: what must match and how to cable it`,hi:`Requirements aur design: kya match hona chahiye aur cabling kaise karein`},body:{en:`
<p>A good HA pair is like a pair of identical twins in matching uniforms. If one is a different size, wears different gear, or has a different job description, the swap is noticed. PAN-OS is strict: before two firewalls will form a working pair, a list of things must be the same. Most "HA will not come up" tickets are a failed item on this list, so learn it well.</p>

<h3>What must match</h3>
<table class="cmp"><tr><th>Item</th><th>Rule</th></tr>
<tr><td>Hardware model</td><td>Same model on both sides (two PA-440, or two VM-Series of the same size).</td></tr>
<tr><td>PAN-OS version</td><td>Same major and feature release. A short mismatch during an upgrade is tolerated, but treat it as temporary.</td></tr>
<tr><td>Licences</td><td>Same licence set (Threat Prevention, URL filtering, GlobalProtect and so on), because a licence missing on one side stops that feature after failover. Licences are per device and are not shared by HA.</td></tr>
<tr><td>Interface layout</td><td>The same interfaces in the same slots, with the same roles, so that policy referencing ethernet1/1 means the same thing everywhere.</td></tr>
<tr><td>Multi-vsys capability</td><td>Both firewalls must be set the same way for multiple virtual systems.</td></tr>
<tr><td>Group ID and mode</td><td>Same HA group ID and the same mode (active/passive).</td></tr>
<tr><td>Content versions</td><td>Application and threat content should match. Keep them aligned with the same update schedule.</td></tr>
</table>
<p>The firewalls report a <b>version and licence compatibility</b> result to each other. If model or major version differ, the pair stays in a non-functional state and logs the reason.</p>

<h3>Interface behaviour on the passive firewall</h3>
<p>By default, data interfaces on the passive unit are held <b>down</b> (the link state is "shutdown"). That is clean: the switch never sees two live firewalls. The cost is that on failover the new active unit has to bring links up, which takes time. You can set the passive link state to <b>auto</b> so links stay up, which speeds failover, but then your design must make sure the passive unit does not forward or loop traffic (Layer 3 interfaces are safe; for Layer 2 or virtual wire designs read the guidance carefully).</p>
<p>In active/passive, there is no shared virtual MAC. Each firewall uses its own interface MACs. After failover the new active unit sends <b>gratuitous ARP</b> messages for its interface addresses so neighbours update their ARP tables and switches update their MAC tables. For this to work well the upstream and downstream devices must accept gratuitous ARP and not apply long ARP lifetimes or port-security rules that block a MAC move.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Typical HA topology">
<rect x="250" y="10" width="140" height="34" rx="8" fill="#ddd6fe"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">ISP / Untrust switch</text>
<rect x="60" y="85" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="125" y="120" text-anchor="middle" class="svg-ink" font-size="14">FW-A active</text>
<rect x="450" y="85" width="130" height="60" rx="10" fill="#e2e8f0"/><text x="515" y="120" text-anchor="middle" class="svg-ink" font-size="14">FW-B passive</text>
<rect x="250" y="180" width="140" height="34" rx="8" fill="#fde68a"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="13">Trust switch (LAN)</text>
<line x1="125" y1="85" x2="270" y2="44" stroke="#64748b" stroke-width="2"/><line x1="515" y1="85" x2="370" y2="44" stroke="#64748b" stroke-width="2"/>
<line x1="125" y1="145" x2="270" y2="180" stroke="#64748b" stroke-width="2"/><line x1="515" y1="145" x2="370" y2="180" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="115" x2="450" y2="115" stroke="#64748b" stroke-width="2"/><text x="320" y="108" text-anchor="middle" class="svg-accent" font-size="12">HA1 + HA2 direct</text>
</svg><p class="cap">Both firewalls connect to both sides, the HA links are direct. Only the active one passes traffic.</p></div>

<h3>Design choices</h3>
<ul>
<li><b>Direct HA cabling</b> when the units are in the same rack. Use a dedicated isolated VLAN or link when they are far apart, and remember HA2 over Layer 3 needs IP or UDP transport.</li>
<li><b>Dual-homing</b>: connect each firewall to both the upstream and downstream devices. A common mistake is a design where only one path exists, which defeats HA.</li>
<li><b>Management network</b>: keep management on a separate interface with a different IP on each firewall. Management settings are not synchronised.</li>
<li><b>Panorama</b>: if you manage the pair with Panorama, push configuration to both members from Panorama and keep naming consistent.</li>
<li><b>Dynamic routing</b>: use graceful restart where supported so neighbours do not tear down routes during failover, or tune timers. This is covered conceptually in the pan-routing module.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> FW-A is a PA-440 on PAN-OS 11.1 with Threat Prevention and URL licences. FW-B is a PA-440 on PAN-OS 11.1 with only Threat Prevention. HA forms and works. After a failover, URL filtering stops working because FW-B has no URL licence. Nobody noticed in testing because the test traffic was not URL-filtered. The fix was to apply the missing licence and to add a licence check to the pair build checklist.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Forgetting that the passive unit needs its own management IP, its own licences and its own content-update access. HA copies policy, not entitlements.</p></div>
<div class="exam"><p><b>Exam trap.</b> The two firewalls must be the same model and run the same PAN-OS version for a stable pair. HA does not synchronise the management interface IP, hostname or licences.</p></div>

<div class="scn"><h4>The pair that refused to form</h4><p>An engineer unboxed a second firewall, configured HA exactly like the first and saw one unit stuck in a non-functional state. The new unit had shipped with an older PAN-OS release. The log said the versions did not match. Upgrading the new unit to the same release, rebooting it and re-enabling HA brought the pair up in a few minutes.</p><p><b>Lesson:</b> check model, version and licences before you debug links.</p></div>

<div class="iv"><p class="q">"What do you check before building an HA pair?"</p><p>Same model, same PAN-OS release, same licences, same interface layout and slots, same multi-vsys setting, matching content versions, a free group ID, and the HA links cabled and addressed. Add that the passive firewall needs its own management IP and licence entitlements because those are not synced.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Same model, same PAN-OS release, same licences and interface layout.</li>
<li>Passive data interfaces are down by default; auto link state speeds failover but needs care.</li>
<li>No floating MAC in active/passive: the new active firewall uses gratuitous ARP.</li>
<li>Management settings, hostname and licences are not synchronised.</li>
<li>Dual-home each firewall and isolate the HA links.</li>
</ul></div>
`,hi:`
<p>Achha HA pair ek jaise matching uniform pehne identical twins ki tarah hota hai. Agar ek ka size alag ho, gear alag ho ya job description alag ho, to swap pakda jaata hai. PAN-OS strict hai: do firewalls ek working pair banayein, usse pehle ek list ki cheezein same honi chahiye. Zyadatar "HA up nahi aa raha" tickets is list ki kisi ek item ke fail hone ki wajah se hote hain, isliye ise achhe se seekho.</p>

<h3>Kya match hona chahiye</h3>
<table class="cmp"><tr><th>Item</th><th>Rule</th></tr>
<tr><td>Hardware model</td><td>Dono taraf same model (do PA-440, ya same size ke do VM-Series).</td></tr>
<tr><td>PAN-OS version</td><td>Same major aur feature release. Upgrade ke dauraan chhota mismatch chal jaata hai, lekin use temporary samjho.</td></tr>
<tr><td>Licences</td><td>Same licence set (Threat Prevention, URL filtering, GlobalProtect waghera), kyunki ek side par licence na ho to failover ke baad woh feature band ho jaata hai. Licences per device hote hain aur HA unhe share nahi karta.</td></tr>
<tr><td>Interface layout</td><td>Same slots mein same interfaces, same roles ke saath, taaki ethernet1/1 ka reference policy mein har jagah same matlab rakhe.</td></tr>
<tr><td>Multi-vsys capability</td><td>Dono firewalls multiple virtual systems ke liye ek jaise set hone chahiye.</td></tr>
<tr><td>Group ID aur mode</td><td>Same HA group ID aur same mode (active/passive).</td></tr>
<tr><td>Content versions</td><td>Application aur threat content match karna chahiye. Same update schedule se align rakho.</td></tr>
</table>
<p>Firewalls ek doosre ko <b>version aur licence compatibility</b> ka result report karte hain. Model ya major version alag ho to pair non-functional state mein rehta hai aur wajah log karta hai.</p>

<h3>Passive firewall par interface behaviour</h3>
<p>Default mein passive unit ke data interfaces <b>down</b> rakhe jaate hain (link state "shutdown"). Yeh clean hai: switch kabhi do live firewalls nahi dekhta. Qeemat yeh hai ki failover par naye active unit ko links up karne padte hain, jismein time lagta hai. Aap passive link state ko <b>auto</b> set kar sakte ho taaki links up rahein, jisse failover tez hota hai, lekin tab aapka design yeh sunishchit kare ki passive unit traffic forward ya loop na kare (Layer 3 interfaces safe hain; Layer 2 ya virtual wire designs ke liye guidance dhyaan se padho).</p>
<p>Active/passive mein shared virtual MAC nahi hota. Har firewall apne interface MACs use karta hai. Failover ke baad naya active unit apne interface addresses ke liye <b>gratuitous ARP</b> messages bhejta hai taaki neighbours apni ARP tables aur switches apni MAC tables update kar lein. Isse achhe se kaam karne ke liye upstream aur downstream devices ko gratuitous ARP accept karna chahiye aur lambi ARP lifetime ya port-security rules nahi hone chahiye jo MAC move rok dein.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Typical HA topology">
<rect x="250" y="10" width="140" height="34" rx="8" fill="#ddd6fe"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">ISP / Untrust switch</text>
<rect x="60" y="85" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="125" y="120" text-anchor="middle" class="svg-ink" font-size="14">FW-A active</text>
<rect x="450" y="85" width="130" height="60" rx="10" fill="#e2e8f0"/><text x="515" y="120" text-anchor="middle" class="svg-ink" font-size="14">FW-B passive</text>
<rect x="250" y="180" width="140" height="34" rx="8" fill="#fde68a"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="13">Trust switch (LAN)</text>
<line x1="125" y1="85" x2="270" y2="44" stroke="#64748b" stroke-width="2"/><line x1="515" y1="85" x2="370" y2="44" stroke="#64748b" stroke-width="2"/>
<line x1="125" y1="145" x2="270" y2="180" stroke="#64748b" stroke-width="2"/><line x1="515" y1="145" x2="370" y2="180" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="115" x2="450" y2="115" stroke="#64748b" stroke-width="2"/><text x="320" y="108" text-anchor="middle" class="svg-accent" font-size="12">HA1 + HA2 direct</text>
</svg><p class="cap">Dono firewalls dono taraf jude hain, HA links direct hain. Sirf active traffic pass karta hai.</p></div>

<h3>Design choices</h3>
<ul>
<li><b>Direct HA cabling</b> jab units same rack mein hon. Door hon to dedicated isolated VLAN ya link use karo, aur yaad rakho ki Layer 3 par HA2 ko IP ya UDP transport chahiye.</li>
<li><b>Dual-homing</b>: har firewall ko upstream aur downstream dono devices se jodo. Common galti aisa design hai jisme sirf ek path hai, jo HA ka matlab khatam kar deta hai.</li>
<li><b>Management network</b>: management ko alag interface par rakho, har firewall par alag IP ke saath. Management settings synchronise nahi hoti.</li>
<li><b>Panorama</b>: agar pair ko Panorama se manage karte ho, to configuration Panorama se dono members par push karo aur naming consistent rakho.</li>
<li><b>Dynamic routing</b>: jahan supported ho graceful restart use karo taaki failover mein neighbours routes na girayein, ya timers tune karo. Yeh conceptually pan-routing module mein aata hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> FW-A PA-440 hai, PAN-OS 11.1, Threat Prevention aur URL licences ke saath. FW-B PA-440 hai, PAN-OS 11.1, sirf Threat Prevention ke saath. HA ban jaata hai aur chalta hai. Failover ke baad URL filtering band ho jaati hai kyunki FW-B ke paas URL licence nahi hai. Testing mein kisi ko pata nahi chala kyunki test traffic URL-filtered nahi tha. Fix tha missing licence lagana aur pair build checklist mein licence check jodna.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Yeh bhoolna ki passive unit ko apna management IP, apne licences aur apna content-update access chahiye. HA policy copy karta hai, entitlements nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Stable pair ke liye dono firewalls same model aur same PAN-OS version par hone chahiye. HA management interface IP, hostname ya licences synchronise nahi karta.</p></div>

<div class="scn"><h4>Woh pair jo ban hi nahi raha tha</h4><p>Ek engineer ne doosra firewall unbox kiya, HA bilkul pehle jaisa configure kiya aur dekha ki ek unit non-functional state mein atka hai. Naya unit purani PAN-OS release ke saath aaya tha. Log ne kaha ki versions match nahi karte. Naye unit ko same release par upgrade karke, reboot karke aur HA dobara enable karke pair kuch minutes mein up aa gaya.</p><p><b>Lesson:</b> links debug karne se pehle model, version aur licences check karo.</p></div>

<div class="iv"><p class="q">"HA pair banane se pehle kya check karte ho?"</p><p>Same model, same PAN-OS release, same licences, same interface layout aur slots, same multi-vsys setting, matching content versions, ek free group ID, aur HA links cabled aur addressed. Yeh jodo ki passive firewall ko apna management IP aur licence entitlements chahiye kyunki woh sync nahi hote.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Same model, same PAN-OS release, same licences aur interface layout.</li>
<li>Passive data interfaces default mein down hote hain; auto link state failover tez karta hai lekin dhyaan chahiye.</li>
<li>Active/passive mein floating MAC nahi: naya active firewall gratuitous ARP use karta hai.</li>
<li>Management settings, hostname aur licences synchronise nahi hote.</li>
<li>Har firewall ko dual-home karo aur HA links ko isolate rakho.</li>
</ul></div>
`}};export{e as default};