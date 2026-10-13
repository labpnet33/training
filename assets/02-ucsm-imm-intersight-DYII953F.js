var e=e=>`<div class="dia"><svg viewBox="0 0 640 320" role="img" aria-label="`+e.alt+`"><path d="M60 70 a28 28 0 0 1 14 -50 a36 36 0 0 1 68 -6 a30 30 0 0 1 40 28 a26 26 0 0 1 -6 28 z" fill="#fde68a" stroke="#64748b"/><text x="112" y="58" text-anchor="middle" class="svg-ink" font-size="13">`+e.saas+`</text><rect x="400" y="20" width="200" height="50" rx="8" fill="#fde68a" stroke="#64748b"/><text x="500" y="42" text-anchor="middle" class="svg-ink" font-size="13">`+e.app+`</text><text x="500" y="60" text-anchor="middle" class="svg-muted" font-size="12">`+e.app2+`</text><rect x="20" y="170" width="170" height="60" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="105" y="192" text-anchor="middle" class="svg-ink" font-size="13">`+e.d1+`</text><rect x="35" y="204" width="60" height="18" rx="3" fill="#fed7aa" stroke="#64748b"/><text x="65" y="217" text-anchor="middle" class="svg-ink" font-size="11">`+e.dc+`</text><rect x="215" y="170" width="170" height="60" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="300" y="192" text-anchor="middle" class="svg-ink" font-size="13">`+e.d2+`</text><rect x="230" y="204" width="60" height="18" rx="3" fill="#fed7aa" stroke="#64748b"/><text x="260" y="217" text-anchor="middle" class="svg-ink" font-size="11">`+e.dc+`</text><rect x="440" y="170" width="170" height="60" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="525" y="192" text-anchor="middle" class="svg-ink" font-size="13">`+e.pl+`</text><rect x="455" y="204" width="60" height="18" rx="3" fill="#fed7aa" stroke="#64748b"/><text x="485" y="217" text-anchor="middle" class="svg-ink" font-size="11">`+e.dc+`</text><line x1="65" y1="204" x2="100" y2="75" stroke="#0369a1" stroke-width="2"/><line x1="260" y1="204" x2="140" y2="78" stroke="#0369a1" stroke-width="2"/><line x1="485" y1="204" x2="500" y2="70" stroke="#0369a1" stroke-width="2" stroke-dasharray="5 3"/><text x="310" y="110" text-anchor="middle" class="svg-muted" font-size="12">`+e.https+`</text><text x="560" y="130" text-anchor="middle" class="svg-muted" font-size="12">`+e.air+`</text><rect x="30" y="268" width="14" height="14" fill="#fde68a" stroke="#64748b"/><text x="50" y="280" class="svg-muted" font-size="12">`+e.l1+`</text><rect x="190" y="268" width="14" height="14" fill="#bae6fd" stroke="#64748b"/><text x="210" y="280" class="svg-muted" font-size="12">`+e.l2+`</text><rect x="350" y="268" width="14" height="14" fill="#ddd6fe" stroke="#64748b"/><text x="370" y="280" class="svg-muted" font-size="12">`+e.l3+`</text><rect x="480" y="268" width="14" height="14" fill="#fed7aa" stroke="#64748b"/><text x="500" y="280" class="svg-muted" font-size="12">`+e.l4+`</text></svg><p class="cap">`+e.cap+`</p></div>`,t={id:`ucsm-imm-intersight`,h:{en:`Management design: UCS Manager, Intersight Managed Mode and Intersight options`,hi:`Management design: UCS Manager, Intersight Managed Mode aur Intersight options`},body:{en:`
<h3>The customer case: Northwind Pharma</h3>
<p>Northwind Pharma has two data centers and one manufacturing plant. DC1 and DC2 each run a UCS domain (two 6454 FIs, seven chassis per site, 112 nodes in total). The plant has two C-series servers that run the batch-record system. Regulations say the plant network has no internet access. The auditor wants proof of firmware levels and who changed what. The infrastructure team is five people who today log into three separate consoles.</p>
<p><b>Requirements:</b> one place for policies and inventory; consistent firmware; role-based access with audit trail; the plant must stay air-gapped. <b>Constraints:</b> DC firewalls allow outbound HTTPS only through a proxy; one old domain has M4 blades that must stay until their lease ends; only the infrastructure team may touch plant servers.</p>

<h3>Two management models for the same hardware</h3>
<p><b>UCS Manager (UCSM)</b> is the original model. It runs on the FI pair, offers a GUI, CLI and XML API, and manages one domain. Policies, pools and profiles live in that domain. For many domains Cisco offered UCS Central. <b>Intersight Managed Mode (IMM)</b> moves the whole configuration to Cisco Intersight. The FIs run in IMM, there is no UCSM GUI, and you configure through <b>domain profiles</b> (ports, VLANs, VSANs, NTP, port policies), <b>chassis profiles</b> and <b>server profiles</b>. The X-Series platform supports IMM only. IMM needs 6400 or 6500 series FIs; the older 6200 and 6300 families stay in UCSM.</p>
<table class="cmp"><tr><th>Question</th><th>UCS Manager</th><th>Intersight Managed Mode</th></tr>
<tr><td>Where does config live?</td><td>On the FI pair, one domain</td><td>In Intersight, many domains</td></tr>
<tr><td>Multi-site view</td><td>UCS Central (extra product)</td><td>Built in, same pane for all</td></tr>
<tr><td>X-Series</td><td>Not supported</td><td>Supported (required)</td></tr>
<tr><td>Older hardware (M4, 6200/6300)</td><td>Supported</td><td>Not supported</td></tr>
<tr><td>Switching mode later</td><td colspan="2">Re-initialise the FIs: the domain configuration is erased, so plan a rebuild</td></tr>
</table>

<h3>Intersight design choices</h3>
<p>Every managed device runs a <b>Device Connector</b>, an agent that opens an outbound, encrypted connection to Intersight. Claiming a device means entering its device ID and claim code in Intersight. Because the connection starts from the inside, you do not open inbound firewall holes. The connector needs DNS, NTP and outbound HTTPS (port 443), directly or through a proxy configured on the connector.</p>
`+e({alt:`Intersight deployment options`,saas:`Intersight SaaS`,app:`Private Virtual Appliance`,app2:`air-gapped plant`,d1:`DC1 domain (IMM)`,d2:`DC2 domain (IMM)`,pl:`Plant: 2 C-series`,dc:`Connector`,https:`outbound HTTPS 443`,air:`local, no internet`,l1:`Management platform`,l2:`UCS domain`,l3:`Standalone servers`,l4:`Device Connector`,cap:`Every endpoint opens an outbound connection from its Device Connector. Nothing needs inbound access from the internet.`})+`
<table class="cmp"><tr><th>Form</th><th>Where it runs</th><th>Choose when</th></tr>
<tr><td><b>Intersight SaaS</b></td><td>Cisco cloud</td><td>Internet egress is allowed; you want continuous feature updates</td></tr>
<tr><td><b>Connected Virtual Appliance</b></td><td>Your VM, linked to the cloud</td><td>Policy says data stays on-prem but limited cloud contact is fine</td></tr>
<tr><td><b>Private Virtual Appliance</b></td><td>Your VM, no cloud contact</td><td>Air-gapped sites; you import updates and firmware by hand</td></tr>
</table>
<p>Intersight also gives <b>organisations</b> and <b>resource groups</b> with role-based access, an audit log, an API for Terraform and Ansible, and licence tiers (for example Essentials and Advantage) that decide which features are available. Firmware is handled by a <b>firmware policy</b> attached to profiles, and Intersight checks the chosen firmware and driver combination against the Hardware Compatibility List and shows security advisories for devices it manages.</p>

<h3>Options and trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td>1. Stay on UCSM plus UCS Central</td><td>No change for staff</td><td>No X-Series; extra product; weak path forward</td></tr>
<tr><td>2. All IMM, SaaS, everywhere</td><td>Simplest operations</td><td>Plant breaks the air-gap rule</td></tr>
<tr><td>3. IMM with SaaS for DCs, Private Virtual Appliance for the plant, M4 domain claimed read-only</td><td>Meets every constraint</td><td>Two Intersight instances to run</td></tr>
</table>
<div class="eg"><p><b>Chosen design.</b> Option 3. DC1 and DC2 are rebuilt in IMM one at a time, so the other site carries the load. The FIs get a domain profile with the same VLAN policy at both sites. The plant gets a Private Virtual Appliance on a small VM host, with firmware bundles imported by an approved USB workflow. The M4 domain stays on UCSM and is claimed in Intersight for inventory and advisories until its lease ends. Organisations separate "Datacenter" and "Plant", so plant servers are visible only to the infrastructure team.</p></div>

<div class="warn"><p><b>Post-mortem: the connector that stayed red.</b> After the DC1 rebuild, both FIs showed "Not Connected". Cause: the proxy setting was entered on one FI only, and the corporate firewall blocked the direct path. Fix: set the proxy in the Device Connector of each FI (or the domain policy), confirm DNS and NTP, and re-check the claim. Always test connector reachability before the maintenance window, not during.</p></div>
<div class="exam"><p><b>Exam trap.</b> IMM is chosen per domain, not per server, and it is not an in-place switch. If a question says "keep the existing UCSM configuration and add X-Series", the answer is that it cannot be done in the same domain.</p></div>

<div class="scn"><h4>The mixed-mode surprise</h4><p>A team bought X-Series chassis for a UCSM-managed domain. Chassis discovery never started. The engineer checked the domain mode and found UCSM. The only path was to move the FIs to IMM, which erased the old domain. They avoided downtime by building the new domain next to the old one and migrating hosts in batches.</p><p><b>Lesson:</b> decide the management model before ordering hardware.</p></div>
<div class="iv"><p class="q">"When would you not choose Intersight SaaS?"</p><p>Strong answer: when a site has no internet path by policy, such as an air-gapped plant or a restricted government zone. Then use a Private Virtual Appliance and plan for manual firmware imports. Mention that the Device Connector connects outbound only, so security teams usually accept SaaS once they see that.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>UCSM manages one domain locally; IMM moves configuration to Intersight and is required for X-Series.</li>
<li>Switching a domain between UCSM and IMM means re-initialising the FIs.</li>
<li>The Device Connector opens outbound HTTPS, so no inbound holes are required.</li>
<li>SaaS, Connected Virtual Appliance and Private Virtual Appliance trade convenience against isolation.</li>
<li>Organisations, roles, firmware policy and the HCL check are core Intersight design tools.</li>
</ul></div>
`,hi:`
<h3>Customer case: Northwind Pharma</h3>
<p>Northwind Pharma ke do data centers aur ek manufacturing plant hain. DC1 aur DC2 mein har ek mein UCS domain hai (do 6454 FIs, har site par saat chassis, total 112 nodes). Plant mein do C-series servers hain jo batch-record system chalate hain. Regulations kehte hain ki plant network par internet access nahi hoga. Auditor firmware levels ka proof aur kisne kya change kiya, yeh dekhna chahta hai. Infrastructure team paanch logon ki hai jo aaj teen alag consoles mein login karti hai.</p>
<p><b>Requirements:</b> policies aur inventory ke liye ek jagah; consistent firmware; audit trail ke saath role-based access; plant air-gapped rehna chahiye. <b>Constraints:</b> DC firewalls sirf proxy ke through outbound HTTPS allow karte hain; ek purane domain mein M4 blades hain jo lease khatam hone tak rahenge; plant servers ko sirf infrastructure team chhu sakti hai.</p>

<h3>Ek hi hardware ke liye do management models</h3>
<p><b>UCS Manager (UCSM)</b> original model hai. Yeh FI pair par chalta hai, GUI, CLI aur XML API deta hai, aur ek domain manage karta hai. Policies, pools aur profiles usi domain mein rehte hain. Kai domains ke liye Cisco UCS Central deta tha. <b>Intersight Managed Mode (IMM)</b> poori configuration ko Cisco Intersight mein le jaata hai. FIs IMM mein chalte hain, UCSM GUI nahi hota, aur aap <b>domain profiles</b> (ports, VLANs, VSANs, NTP, port policies), <b>chassis profiles</b> aur <b>server profiles</b> se configure karte ho. X-Series platform sirf IMM support karta hai. IMM ko 6400 ya 6500 series FIs chahiye; purane 6200 aur 6300 UCSM mein rehte hain.</p>
<table class="cmp"><tr><th>Sawal</th><th>UCS Manager</th><th>Intersight Managed Mode</th></tr>
<tr><td>Config kahan rehti hai?</td><td>FI pair par, ek domain</td><td>Intersight mein, kai domains</td></tr>
<tr><td>Multi-site view</td><td>UCS Central (extra product)</td><td>Built in, sab ke liye ek pane</td></tr>
<tr><td>X-Series</td><td>Supported nahi</td><td>Supported (zaroori)</td></tr>
<tr><td>Purana hardware (M4, 6200/6300)</td><td>Supported</td><td>Supported nahi</td></tr>
<tr><td>Baad mein mode badalna</td><td colspan="2">FIs ko re-initialise karna padta hai: domain configuration erase hoti hai, isliye rebuild plan karo</td></tr>
</table>

<h3>Intersight design choices</h3>
<p>Har managed device mein <b>Device Connector</b> chalta hai, ek agent jo Intersight tak outbound, encrypted connection kholta hai. Device claim karne ka matlab hai Intersight mein uska device ID aur claim code daalna. Connection andar se shuru hota hai, isliye inbound firewall holes nahi kholne padte. Connector ko DNS, NTP aur outbound HTTPS (port 443) chahiye, seedha ya connector par configure kiye proxy se.</p>
`+e({alt:`Intersight deployment options`,saas:`Intersight SaaS`,app:`Private Virtual Appliance`,app2:`air-gapped plant`,d1:`DC1 domain (IMM)`,d2:`DC2 domain (IMM)`,pl:`Plant: 2 C-series`,dc:`Connector`,https:`outbound HTTPS 443`,air:`local, internet nahi`,l1:`Management platform`,l2:`UCS domain`,l3:`Standalone servers`,l4:`Device Connector`,cap:`Har endpoint apne Device Connector se outbound connection kholta hai. Internet se inbound access ki zaroorat nahi.`})+`
<table class="cmp"><tr><th>Form</th><th>Kahan chalta hai</th><th>Kab choose karein</th></tr>
<tr><td><b>Intersight SaaS</b></td><td>Cisco cloud</td><td>Internet egress allowed hai; continuous feature updates chahiye</td></tr>
<tr><td><b>Connected Virtual Appliance</b></td><td>Aapka VM, cloud se linked</td><td>Policy kehti hai data on-prem rahe lekin limited cloud contact theek hai</td></tr>
<tr><td><b>Private Virtual Appliance</b></td><td>Aapka VM, cloud contact nahi</td><td>Air-gapped sites; updates aur firmware haath se import karte ho</td></tr>
</table>
<p>Intersight <b>organisations</b> aur <b>resource groups</b> ke saath role-based access, audit log, Terraform aur Ansible ke liye API, aur licence tiers (jaise Essentials aur Advantage) bhi deta hai jo decide karte hain kaunse features milenge. Firmware ko profiles se attached <b>firmware policy</b> handle karti hai, aur Intersight chuna hua firmware aur driver combination Hardware Compatibility List se check karta hai aur managed devices ke security advisories dikhata hai.</p>

<h3>Options aur trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td>1. UCSM plus UCS Central par rehna</td><td>Staff ke liye koi change nahi</td><td>X-Series nahi; extra product; aage ka rasta kamzor</td></tr>
<tr><td>2. Sab jagah IMM, SaaS</td><td>Sabse simple operations</td><td>Plant air-gap rule todta hai</td></tr>
<tr><td>3. DCs ke liye SaaS ke saath IMM, plant ke liye Private Virtual Appliance, M4 domain read-only claim</td><td>Har constraint poora</td><td>Do Intersight instances chalane padte hain</td></tr>
</table>
<div class="eg"><p><b>Chosen design.</b> Option 3. DC1 aur DC2 ek ek karke IMM mein rebuild hote hain, taaki doosri site load uthaye. FIs ko domain profile milta hai jisme dono sites par same VLAN policy hai. Plant ko chhote VM host par Private Virtual Appliance milta hai, firmware bundles approved USB workflow se import hote hain. M4 domain UCSM par rehta hai aur lease khatam hone tak inventory aur advisories ke liye Intersight mein claim hota hai. Organisations "Datacenter" aur "Plant" ko alag karte hain, taaki plant servers sirf infrastructure team ko dikhein.</p></div>

<div class="warn"><p><b>Post-mortem: connector jo red raha.</b> DC1 rebuild ke baad dono FIs "Not Connected" dikha rahe the. Wajah: proxy setting sirf ek FI par daali gayi thi, aur corporate firewall ne direct path block kiya hua tha. Fix: har FI ke Device Connector mein proxy set karo (ya domain policy mein), DNS aur NTP confirm karo, aur claim dobara check karo. Connector reachability maintenance window se pehle test karo, uske dauraan nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> IMM per domain choose hota hai, per server nahi, aur yeh in-place switch nahi hai. Agar sawal kahe "existing UCSM configuration rakho aur X-Series jodo", to jawab hai ki same domain mein yeh nahi ho sakta.</p></div>

<div class="scn"><h4>Mixed-mode ka surprise</h4><p>Ek team ne UCSM-managed domain ke liye X-Series chassis khareeda. Chassis discovery shuru hi nahi hui. Engineer ne domain mode check kiya to UCSM nikla. Ek hi raasta tha: FIs ko IMM mein le jaana, jisse purana domain erase ho gaya. Unhone naya domain purane ke bagal mein bana kar hosts ko batches mein migrate karke downtime bachaya.</p><p><b>Seekh:</b> hardware order karne se pehle management model decide karo.</p></div>
<div class="iv"><p class="q">"Aap Intersight SaaS kab choose nahi karoge?"</p><p>Strong answer: jab kisi site par policy se internet path nahi hai, jaise air-gapped plant ya restricted government zone. Tab Private Virtual Appliance use karo aur manual firmware imports plan karo. Batao ki Device Connector sirf outbound connect karta hai, isliye security teams aam taur par SaaS maan leti hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>UCSM ek domain ko locally manage karta hai; IMM configuration Intersight mein le jaata hai aur X-Series ke liye zaroori hai.</li>
<li>Domain ko UCSM aur IMM ke beech badalne ka matlab FIs re-initialise karna hai.</li>
<li>Device Connector outbound HTTPS kholta hai, isliye inbound holes ki zaroorat nahi.</li>
<li>SaaS, Connected Virtual Appliance aur Private Virtual Appliance convenience aur isolation ka trade-off hain.</li>
<li>Organisations, roles, firmware policy aur HCL check core Intersight design tools hain.</li>
</ul></div>
`}};export{t as default};