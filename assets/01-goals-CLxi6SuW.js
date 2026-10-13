var e={id:`goals`,h:{en:`What you will learn, and ACI in one picture`,hi:`Aap kya seekhoge, aur ek picture mein ACI`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain why Cisco ACI (Application Centric Infrastructure) exists, name every component of an ACI fabric, bring a brand-new fabric online from the APIC GUI, build a tenant with a VRF, bridge domains and EPGs, connect bare-metal servers through the access-policy chain, write contracts that allow only the traffic an application needs, connect the fabric to the outside world with an L3Out, and troubleshoot the most common tickets using faults, endpoint tables and zoning rules. This matches section 1.4 of the CCNP Data Center core exam (DCCOR 350-601) and a good part of the DCACI 300-620 concentration exam.</p>

<h3>Prerequisites</h3>
<ul>
<li><b>Switching basics:</b> VLANs, trunks, access ports, MAC address tables, ARP.</li>
<li><b>Routing basics:</b> SVIs as default gateways, VRFs, and what OSPF and BGP do (you do not need to be an expert).</li>
<li><b>Data center basics:</b> spine-leaf design, east-west traffic and the idea of a VXLAN overlay (see the data center introduction module).</li>
<li><b>Security basics:</b> what an ACL permit and deny rule is.</li>
</ul>
<p>If one of these is shaky, do not worry. Every chapter defines its terms the first time they appear and connects them to the traditional networking you already know.</p>

<h3>Start with an analogy: an orchestra and its conductor</h3>
<p>Imagine a 60-piece orchestra where there is no conductor and no shared sheet music. Each musician is told individually, by phone, what to play. Somebody always misses a change, and the music drifts out of tune. That is a traditional data center network: every switch is configured one by one, by hand, over SSH.</p>
<p>Now give the orchestra a <b>conductor</b> and a single <b>score</b>. The conductor does not play any instrument (he is not in the "data path"), but he decides what everybody plays and makes sure they stay together. In ACI the conductor is the <b>APIC</b> (Application Policy Infrastructure Controller) and the score is the <b>policy</b>: a description of what each application needs. The musicians are the <b>Nexus 9000 switches</b> running in ACI mode.</p>

<h3>ACI mode versus NX-OS mode in one picture</h3>
<p>The same Nexus 9000 hardware can run two different software images. In <b>NX-OS mode</b> (also called standalone mode) each switch is an independent box with its own CLI and running-config; you build VXLAN EVPN fabrics yourself or with a tool such as Nexus Dashboard Fabric Controller. In <b>ACI mode</b> the switches boot an ACI image, join a fabric discovered by the APIC, and accept configuration only from the APIC.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="NX-OS mode versus ACI mode">
<text x="160" y="20" text-anchor="middle" class="svg-accent" font-size="14">NX-OS mode</text>
<text x="480" y="20" text-anchor="middle" class="svg-accent" font-size="14">ACI mode</text>
<rect x="100" y="32" width="120" height="34" rx="6" fill="#fed7aa"/><text x="160" y="54" text-anchor="middle" class="svg-ink" font-size="13">Engineer + SSH</text>
<rect x="20" y="170" width="80" height="34" rx="6" fill="#bae6fd"/><text x="60" y="192" text-anchor="middle" class="svg-ink" font-size="12">Switch 1</text>
<rect x="120" y="170" width="80" height="34" rx="6" fill="#bae6fd"/><text x="160" y="192" text-anchor="middle" class="svg-ink" font-size="12">Switch 2</text>
<rect x="220" y="170" width="80" height="34" rx="6" fill="#bae6fd"/><text x="260" y="192" text-anchor="middle" class="svg-ink" font-size="12">Switch 3</text>
<line x1="140" y1="66" x2="60" y2="170" stroke="#64748b" stroke-width="2"/><line x1="160" y1="66" x2="160" y2="170" stroke="#64748b" stroke-width="2"/><line x1="180" y1="66" x2="260" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="160" y="228" text-anchor="middle" class="svg-muted" font-size="12">one running-config per box</text>
<line x1="320" y1="30" x2="320" y2="235" stroke="#64748b" stroke-dasharray="4 4"/>
<rect x="400" y="32" width="160" height="34" rx="6" fill="#ddd6fe"/><text x="480" y="54" text-anchor="middle" class="svg-ink" font-size="13">APIC cluster (policy)</text>
<rect x="430" y="100" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="480" y="120" text-anchor="middle" class="svg-ink" font-size="12">Spine</text>
<rect x="350" y="170" width="80" height="34" rx="6" fill="#bae6fd"/><text x="390" y="192" text-anchor="middle" class="svg-ink" font-size="12">Leaf 101</text>
<rect x="440" y="170" width="80" height="34" rx="6" fill="#bae6fd"/><text x="480" y="192" text-anchor="middle" class="svg-ink" font-size="12">Leaf 102</text>
<rect x="530" y="170" width="80" height="34" rx="6" fill="#bae6fd"/><text x="570" y="192" text-anchor="middle" class="svg-ink" font-size="12">Leaf 103</text>
<line x1="480" y1="130" x2="390" y2="170" stroke="#64748b" stroke-width="2"/><line x1="480" y1="130" x2="480" y2="170" stroke="#64748b" stroke-width="2"/><line x1="480" y1="130" x2="570" y2="170" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="66" x2="480" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="480" y="228" text-anchor="middle" class="svg-muted" font-size="12">one policy, rendered on every leaf</text>
</svg><p class="cap">Left: every switch is configured separately. Right: you describe the policy once on the APIC and it is pushed to the fabric.</p></div>

<table class="cmp"><tr><th>Topic</th><th>NX-OS (standalone) mode</th><th>ACI mode</th></tr>
<tr><td>Where you configure</td><td>Each switch CLI, or an external tool</td><td>Only the APIC (GUI, REST API, APIC CLI)</td></tr>
<tr><td>Unit of configuration</td><td>VLAN, SVI, ACL, interface</td><td>Tenant, VRF, bridge domain, EPG, contract</td></tr>
<tr><td>Default security between groups</td><td>Everything allowed unless an ACL blocks it</td><td>Nothing allowed between EPGs until a contract permits it (whitelist)</td></tr>
<tr><td>Underlay and overlay</td><td>You design OSPF/IS-IS, BGP EVPN, VXLAN</td><td>Built automatically: IS-IS, COOP, MP-BGP, iVXLAN</td></tr>
<tr><td>Switch CLI</td><td>Full configuration</td><td>Read-only show and troubleshooting commands</td></tr>
</table>

<p>If you try to configure an ACI leaf directly, the switch reminds you who is in charge:</p>
<pre class="out">LEAF101# configure terminal
<span class="hl">Error: This switch is part of an ACI fabric. Configuration is managed by the APIC (Application Policy Infrastructure Controller).</span></pre>

<h3>How this module is organised</h3>
<ol>
<li>Chapters 2 to 4: why ACI exists, its components and the object model everything is built on.</li>
<li>Chapter 5: fabric discovery. This matches <b>Lab 1</b> (register LEAF101, SPINE201 and LEAF102).</li>
<li>Chapters 6 to 8: tenant constructs, forwarding and access policies. This matches <b>Lab 2</b> (first tenant NK-PROD with EPG WEB) and <b>Lab 4</b> (fault F0467 ticket).</li>
<li>Chapter 9: contracts. This matches <b>Lab 3</b> (WEB-TO-APP, HTTP only) and <b>Lab 5</b> (NOC shift ticket).</li>
<li>Chapters 10 to 12: L3Out, VMM integration and microsegmentation, operations and Multi-Site.</li>
<li>Chapter 13: summary, glossary and exam checklist.</li>
</ol>

<div class="eg"><p><b>Worked example: the lab fabric you will build.</b> One APIC (APIC1) is cabled to LEAF101 port eth1/8. LEAF101 and LEAF102 each connect to SPINE201 on eth1/49. WEB1 (10.1.1.11/24) is on LEAF101 eth1/1, WEB2 (10.1.1.12/24) on LEAF102 eth1/1 and APP1 (10.1.2.21/24) on LEAF102 eth1/2. The tenant is NK-PROD with VRF PROD, bridge domains WEB-BD (10.1.1.1/24) and APP-BD (10.1.2.1/24), application profile ECOM and EPGs WEB and APP. You will create every one of these objects yourself.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking "ACI is just a GUI for VLANs". If you keep translating every EPG into "a VLAN", you will be confused by contracts, pcTags and access policies. A VLAN in ACI is only the tag used on a wire. The real building blocks are policy objects. Learn the new vocabulary first, then map it back.</p></div>

<div class="exam"><p><b>Exam trap.</b> A Nexus 9000 cannot be in both modes at once, and converting between NX-OS mode and ACI mode requires loading a different image and reloading the switch. Only switch models listed as ACI-capable can join a fabric (for example N9K-C93180YC-FX leaves and N9K-C9364C spines).</p></div>

<div class="scn"><h4>Choosing the mode for a new data center</h4><p>A payments company was building a new DC with 24 leaves. The network team was small (four engineers), the security team demanded that every application tier be isolated, and the auditors wanted a record of every change. In an NX-OS design they estimated more than 3,000 lines of ACL per leaf pair to keep tiers apart, maintained by hand. They chose ACI mode: the tiers became EPGs, the allowed flows became a dozen contracts, and every change was logged automatically in the APIC audit log with the user name and time.</p><p><b>Lesson:</b> ACI pays off when you need consistent policy, segmentation and auditability across many switches, run by a small team.</p></div>

<div class="iv"><p class="q">"What is the difference between running a Nexus 9000 in NX-OS mode and in ACI mode?"</p><p>Strong answer: same hardware, different software image. In NX-OS mode each switch is configured on its own CLI and you design the underlay and overlay yourself. In ACI mode the switches are managed by an APIC cluster, configuration is policy-based (tenants, EPGs, contracts), the underlay is built automatically, and the default between EPGs is deny. Mention that the switch CLI in ACI is read-only for troubleshooting, and that the APIC is not in the data path.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ACI is a spine-leaf fabric of Nexus 9000 switches in ACI mode, managed as one system by the APIC cluster.</li>
<li>You describe what applications need (policy); the APIC renders it on the right leaves.</li>
<li>NX-OS mode and ACI mode use different images; the ACI switch CLI is read-only.</li>
<li>Between EPGs ACI is a whitelist: traffic needs a contract.</li>
<li>The five labs follow the chapters: discovery, first tenant, contract, F0467 ticket, NOC shift.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki Cisco ACI (Application Centric Infrastructure) kyun bana, ACI fabric ke har component ka naam le paoge, APIC GUI se bilkul naya fabric online la paoge, VRF, bridge domains aur EPGs ke saath tenant bana paoge, access-policy chain ke through bare-metal servers jod paoge, aise contracts likh paoge jo sirf wahi traffic allow karein jo application ko chahiye, L3Out se fabric ko bahar ki duniya se jod paoge, aur faults, endpoint tables aur zoning rules se sabse common tickets troubleshoot kar paoge. Yeh CCNP Data Center core exam (DCCOR 350-601) ke section 1.4 aur DCACI 300-620 concentration exam ke bade hisse se match karta hai.</p>

<h3>Prerequisites</h3>
<ul>
<li><b>Switching basics:</b> VLANs, trunks, access ports, MAC address tables, ARP.</li>
<li><b>Routing basics:</b> default gateway ki tarah SVIs, VRFs, aur OSPF aur BGP kya karte hain (expert hona zaroori nahi).</li>
<li><b>Data center basics:</b> spine-leaf design, east-west traffic aur VXLAN overlay ka idea (data center introduction module dekho).</li>
<li><b>Security basics:</b> ACL permit aur deny rule kya hota hai.</li>
</ul>
<p>Agar inmein se kuch kamzor hai to tension mat lo. Har chapter apne terms pehli baar aate hi define karta hai aur unhe us traditional networking se jodta hai jo aap pehle se jaante ho.</p>

<h3>Ek analogy se shuru karo: orchestra aur uska conductor</h3>
<p>Socho ek 60 logon ka orchestra hai jismein na conductor hai na shared sheet music. Har musician ko alag se, phone par, bataya jaata hai ki kya bajana hai. Koi na koi change miss kar deta hai, aur music besura ho jaata hai. Yahi traditional data center network hai: har switch ek-ek karke, haath se, SSH par configure hota hai.</p>
<p>Ab orchestra ko ek <b>conductor</b> aur ek hi <b>score</b> do. Conductor koi instrument nahi bajata (woh "data path" mein nahi hai), lekin woh decide karta hai ki sab kya bajayenge aur sabko saath rakhta hai. ACI mein conductor hai <b>APIC</b> (Application Policy Infrastructure Controller) aur score hai <b>policy</b>: har application ko kya chahiye uska description. Musicians hain ACI mode mein chalne wale <b>Nexus 9000 switches</b>.</p>

<h3>Ek picture mein ACI mode vs NX-OS mode</h3>
<p>Same Nexus 9000 hardware do alag software images chala sakta hai. <b>NX-OS mode</b> (jise standalone mode bhi kehte hain) mein har switch ek independent box hai jiska apna CLI aur running-config hai; VXLAN EVPN fabrics aap khud banate ho ya Nexus Dashboard Fabric Controller jaise tool se. <b>ACI mode</b> mein switches ACI image boot karte hain, APIC dwara discover kiye gaye fabric mein join hote hain, aur configuration sirf APIC se lete hain.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="NX-OS mode vs ACI mode">
<text x="160" y="20" text-anchor="middle" class="svg-accent" font-size="14">NX-OS mode</text>
<text x="480" y="20" text-anchor="middle" class="svg-accent" font-size="14">ACI mode</text>
<rect x="100" y="32" width="120" height="34" rx="6" fill="#fed7aa"/><text x="160" y="54" text-anchor="middle" class="svg-ink" font-size="13">Engineer + SSH</text>
<rect x="20" y="170" width="80" height="34" rx="6" fill="#bae6fd"/><text x="60" y="192" text-anchor="middle" class="svg-ink" font-size="12">Switch 1</text>
<rect x="120" y="170" width="80" height="34" rx="6" fill="#bae6fd"/><text x="160" y="192" text-anchor="middle" class="svg-ink" font-size="12">Switch 2</text>
<rect x="220" y="170" width="80" height="34" rx="6" fill="#bae6fd"/><text x="260" y="192" text-anchor="middle" class="svg-ink" font-size="12">Switch 3</text>
<line x1="140" y1="66" x2="60" y2="170" stroke="#64748b" stroke-width="2"/><line x1="160" y1="66" x2="160" y2="170" stroke="#64748b" stroke-width="2"/><line x1="180" y1="66" x2="260" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="160" y="228" text-anchor="middle" class="svg-muted" font-size="12">har box ka apna running-config</text>
<line x1="320" y1="30" x2="320" y2="235" stroke="#64748b" stroke-dasharray="4 4"/>
<rect x="400" y="32" width="160" height="34" rx="6" fill="#ddd6fe"/><text x="480" y="54" text-anchor="middle" class="svg-ink" font-size="13">APIC cluster (policy)</text>
<rect x="430" y="100" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="480" y="120" text-anchor="middle" class="svg-ink" font-size="12">Spine</text>
<rect x="350" y="170" width="80" height="34" rx="6" fill="#bae6fd"/><text x="390" y="192" text-anchor="middle" class="svg-ink" font-size="12">Leaf 101</text>
<rect x="440" y="170" width="80" height="34" rx="6" fill="#bae6fd"/><text x="480" y="192" text-anchor="middle" class="svg-ink" font-size="12">Leaf 102</text>
<rect x="530" y="170" width="80" height="34" rx="6" fill="#bae6fd"/><text x="570" y="192" text-anchor="middle" class="svg-ink" font-size="12">Leaf 103</text>
<line x1="480" y1="130" x2="390" y2="170" stroke="#64748b" stroke-width="2"/><line x1="480" y1="130" x2="480" y2="170" stroke="#64748b" stroke-width="2"/><line x1="480" y1="130" x2="570" y2="170" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="66" x2="480" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="480" y="228" text-anchor="middle" class="svg-muted" font-size="12">ek policy, har leaf par render</text>
</svg><p class="cap">Left: har switch alag se configure hota hai. Right: aap policy ek baar APIC par describe karte ho aur woh fabric par push ho jaati hai.</p></div>

<table class="cmp"><tr><th>Topic</th><th>NX-OS (standalone) mode</th><th>ACI mode</th></tr>
<tr><td>Configure kahan karte ho</td><td>Har switch ka CLI, ya koi external tool</td><td>Sirf APIC (GUI, REST API, APIC CLI)</td></tr>
<tr><td>Configuration ki unit</td><td>VLAN, SVI, ACL, interface</td><td>Tenant, VRF, bridge domain, EPG, contract</td></tr>
<tr><td>Groups ke beech default security</td><td>Sab allowed jab tak ACL block na kare</td><td>EPGs ke beech kuch allowed nahi jab tak contract permit na kare (whitelist)</td></tr>
<tr><td>Underlay aur overlay</td><td>Aap OSPF/IS-IS, BGP EVPN, VXLAN design karte ho</td><td>Apne aap banta hai: IS-IS, COOP, MP-BGP, iVXLAN</td></tr>
<tr><td>Switch CLI</td><td>Poori configuration</td><td>Sirf read-only show aur troubleshooting commands</td></tr>
</table>

<p>Agar aap ACI leaf ko directly configure karne ki koshish karo, to switch yaad dila deta hai ki boss kaun hai:</p>
<pre class="out">LEAF101# configure terminal
<span class="hl">Error: This switch is part of an ACI fabric. Configuration is managed by the APIC (Application Policy Infrastructure Controller).</span></pre>

<h3>Yeh module kaise organised hai</h3>
<ol>
<li>Chapters 2 se 4: ACI kyun hai, uske components aur object model jis par sab kuch bana hai.</li>
<li>Chapter 5: fabric discovery. Yeh <b>Lab 1</b> se match karta hai (LEAF101, SPINE201 aur LEAF102 register karna).</li>
<li>Chapters 6 se 8: tenant constructs, forwarding aur access policies. Yeh <b>Lab 2</b> (EPG WEB ke saath pehla tenant NK-PROD) aur <b>Lab 4</b> (fault F0467 ticket) se match karta hai.</li>
<li>Chapter 9: contracts. Yeh <b>Lab 3</b> (WEB-TO-APP, sirf HTTP) aur <b>Lab 5</b> (NOC shift ticket) se match karta hai.</li>
<li>Chapters 10 se 12: L3Out, VMM integration aur microsegmentation, operations aur Multi-Site.</li>
<li>Chapter 13: summary, glossary aur exam checklist.</li>
</ol>

<div class="eg"><p><b>Worked example: lab fabric jo aap banaoge.</b> Ek APIC (APIC1) LEAF101 ke port eth1/8 se cabled hai. LEAF101 aur LEAF102 dono eth1/49 par SPINE201 se jude hain. WEB1 (10.1.1.11/24) LEAF101 eth1/1 par hai, WEB2 (10.1.1.12/24) LEAF102 eth1/1 par aur APP1 (10.1.2.21/24) LEAF102 eth1/2 par. Tenant NK-PROD hai jismein VRF PROD, bridge domains WEB-BD (10.1.1.1/24) aur APP-BD (10.1.2.1/24), application profile ECOM aur EPGs WEB aur APP hain. Inmein se har object aap khud banaoge.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki "ACI bas VLANs ka GUI hai". Agar aap har EPG ko "ek VLAN" mein translate karte rahoge, to contracts, pcTags aur access policies par confuse ho jaoge. ACI mein VLAN sirf woh tag hai jo wire par use hota hai. Asli building blocks policy objects hain. Pehle nayi vocabulary seekho, phir use purane concepts se map karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Nexus 9000 ek saath dono modes mein nahi ho sakta, aur NX-OS mode aur ACI mode ke beech convert karne ke liye alag image load karke switch reload karna padta hai. Sirf ACI-capable list wale switch models hi fabric join kar sakte hain (jaise N9K-C93180YC-FX leaves aur N9K-C9364C spines).</p></div>

<div class="scn"><h4>Naye data center ke liye mode chunna</h4><p>Ek payments company 24 leaves wala naya DC bana rahi thi. Network team chhoti thi (chaar engineers), security team chahti thi ki har application tier isolated ho, aur auditors ko har change ka record chahiye tha. NX-OS design mein unka estimate tha ki tiers ko alag rakhne ke liye har leaf pair par 3,000 se zyada ACL lines lagengi, jo haath se maintain karni padti. Unhone ACI mode chuna: tiers EPGs ban gaye, allowed flows ek darjan contracts ban gaye, aur har change APIC audit log mein user name aur time ke saath apne aap log hua.</p><p><b>Seekh:</b> ACI tab faayda deta hai jab aapko bahut saare switches par consistent policy, segmentation aur auditability chahiye, aur team chhoti ho.</p></div>

<div class="iv"><p class="q">"Nexus 9000 ko NX-OS mode mein aur ACI mode mein chalane mein kya farak hai?"</p><p>Strong answer: same hardware, alag software image. NX-OS mode mein har switch apne CLI par configure hota hai aur underlay aur overlay aap khud design karte ho. ACI mode mein switches APIC cluster se manage hote hain, configuration policy-based hoti hai (tenants, EPGs, contracts), underlay apne aap banta hai, aur EPGs ke beech default deny hai. Yeh bhi batao ki ACI mein switch CLI troubleshooting ke liye read-only hai, aur APIC data path mein nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ACI, ACI mode wale Nexus 9000 switches ka spine-leaf fabric hai, jise APIC cluster ek system ki tarah manage karta hai.</li>
<li>Aap batate ho applications ko kya chahiye (policy); APIC use sahi leaves par render karta hai.</li>
<li>NX-OS mode aur ACI mode alag images use karte hain; ACI switch CLI read-only hai.</li>
<li>EPGs ke beech ACI whitelist hai: traffic ko contract chahiye.</li>
<li>Paanch labs chapters ke saath chalte hain: discovery, pehla tenant, contract, F0467 ticket, NOC shift.</li>
</ul></div>
`}};export{e as default};