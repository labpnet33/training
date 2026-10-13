var e={id:`npv-isl-oversub`,h:{en:`NPV and NPIV, port channels, oversubscription and fan-in/fan-out`,hi:`NPV aur NPIV, port channels, oversubscription aur fan-in/fan-out`},body:{en:`
<p>Once the topology is chosen, three questions decide whether the SAN works under load: how do edge switches attach to the core, how many links join them, and how much traffic can the hosts push through those links at once? This chapter answers all three with real numbers.</p>

<h3>The case: Zenith Health</h3>
<div class="eg"><p><b>Customer.</b> Zenith Health, a hospital group. Eight Cisco UCS blade chassis (64 blades, 16G FC each) run the electronic patient record and imaging. Two MDS 9000 core switches per fabric hold three arrays. A radiology archive of 400 TB sits on its own array.</p><p><b>Symptom.</b> Every night at 02:00, the imaging backup runs and morning clinicians complain that the patient record application freezes for seconds. The SAN team sees ISL utilisation at 95 percent and thousands of "credit loss" style events on the edge.</p><p><b>Requirements.</b> No visible slowdown during backup; add 4 more chassis next year; minimise the number of switches the team must zone and upgrade; keep a vendor-neutral core.</p></div>

<h3>NPIV: many logins on one port</h3>
<p><b>N_Port ID Virtualization (NPIV)</b> lets one physical F port accept several fabric logins (FLOGI plus FDISC), each with its own FCID. It is needed when a host presents multiple virtual WWPNs (for example VMs with their own identities) and, importantly, when the port faces an NPV switch. On Cisco MDS you enable it with <code>feature npiv</code> on the <b>core</b> switch.</p>

<h3>NPV: the edge switch that behaves like a host</h3>
<p><b>N_Port Virtualization (NPV)</b> turns an edge switch into a proxy. Instead of joining the fabric with an E port and its own domain ID, it logs in to the core through <b>NP ports</b> (uplinks) and forwards the FLOGIs of its servers as multiple logins on those uplinks. The core sees an F port with many N ports behind it. Cisco UCS fabric interconnects work this way in <b>end-host mode</b>.</p>
<table class="cmp"><tr><th>Aspect</th><th>NPV edge</th><th>Full switch edge (E ports)</th></tr>
<tr><td>Domain ID</td><td>None used</td><td>One per switch</td></tr>
<tr><td>Zoning</td><td>Done on the core only</td><td>Distributed, edge participates</td></tr>
<tr><td>Core requirement</td><td>NPIV enabled</td><td>Same vendor or interop mode</td></tr>
<tr><td>Local switching</td><td>None; all traffic goes to core</td><td>Possible on the edge</td></tr>
<tr><td>Management</td><td>Light, little state</td><td>Full fabric participant</td></tr>
<tr><td>Scale</td><td>Avoids domain ID limit</td><td>Domain count must stay in supported range</td></tr>
</table>
<p>Practical rule: <b>use NPV when the number of edge switches would be large, when the edge is a blade or FI, or when the core is another vendor</b>. Keep E-port core-edge when edge-local traffic matters or when you need edge zoning enforcement. Note: enabling <code>feature npv</code> on an MDS erases the configuration and reloads the switch, so plan it as a rebuild, not a change.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="NPV edge to NPIV core with port channel">
<rect x="20" y="20" width="120" height="40" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="12">Blade 1..32 HBA</text>
<rect x="20" y="110" width="120" height="40" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="80" y="135" text-anchor="middle" class="svg-ink" font-size="12">Blade 33..64 HBA</text>
<rect x="210" y="40" width="140" height="120" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="280" y="78" text-anchor="middle" class="svg-ink" font-size="13">NPV edge</text><text x="280" y="98" text-anchor="middle" class="svg-ink" font-size="12">(UCS FI / MDS)</text><text x="280" y="124" text-anchor="middle" class="svg-muted" font-size="11">server ports = F</text>
<rect x="440" y="40" width="130" height="120" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="505" y="78" text-anchor="middle" class="svg-ink" font-size="13">MDS core A</text><text x="505" y="98" text-anchor="middle" class="svg-ink" font-size="12">NPIV on</text><text x="505" y="124" text-anchor="middle" class="svg-muted" font-size="11">zoning here</text>
<line x1="140" y1="40" x2="210" y2="70" stroke="#64748b" stroke-width="2"/><line x1="140" y1="130" x2="210" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="350" y1="70" x2="440" y2="70" stroke="#16a34a" stroke-width="4"/><line x1="350" y1="90" x2="440" y2="90" stroke="#16a34a" stroke-width="4"/><line x1="350" y1="110" x2="440" y2="110" stroke="#16a34a" stroke-width="4"/><line x1="350" y1="130" x2="440" y2="130" stroke="#16a34a" stroke-width="4"/>
<text x="395" y="62" text-anchor="middle" class="svg-ink" font-size="11">NP to F</text>
<rect x="440" y="200" width="130" height="40" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="505" y="225" text-anchor="middle" class="svg-ink" font-size="12">Storage arrays</text>
<line x1="505" y1="160" x2="505" y2="200" stroke="#64748b" stroke-width="2"/>
<text x="395" y="180" text-anchor="middle" class="svg-muted" font-size="11">4 x 32G port channel = 128G</text>
<text x="80" y="95" text-anchor="middle" class="svg-muted" font-size="11">hosts: blue</text>
<text x="320" y="268" text-anchor="middle" class="svg-muted" font-size="11">Orange = NPV edge, green = core (fabric A), purple = storage</text>
</svg><p class="cap">The edge has no domain ID and no zoning; the four uplinks form one NP port channel.</p></div>

<h3>Port channels and ISL design</h3>
<p>A <b>SAN port channel</b> bundles up to 16 physical links into one logical ISL (or F/NP link). Frames are balanced per flow by source ID, destination ID and optionally exchange ID, so a link failure shrinks capacity but does not break the fabric. Put members on different line cards or ASICs so a card failure does not remove the whole bundle. Without a port channel, FSPF treats each ISL as a separate path and a failure triggers a reroute.</p>
<pre class="code"><span class="c">! core (NPIV) side</span>
feature npiv
interface port-channel 1
  switchport mode F
  channel mode active
interface fc1/1-4
  channel-group 1 force
  no shutdown
<span class="c">! NPV edge side (feature npv already enabled)</span>
interface port-channel 1
  switchport mode NP
  channel mode active</pre>
<pre class="out">npv-edge# show npv status
npiv is disabled
disruptive load balancing is disabled
External Interfaces:
====================
  Interface: port-channel1, VSAN: 10, FCID: 0x610001, State: <span class="hl">Up</span>
Number of External Interfaces: 1</pre>

<h3>Oversubscription and fan-in/fan-out in numbers</h3>
<p><b>ISL oversubscription</b> is total host port bandwidth on an edge divided by uplink bandwidth. Zenith has 64 blades at 16G = 1,024G per fabric-side if every blade used it; with 4 x 32G uplinks per edge pair the ratio is far higher unless you add links. <b>Fan-in/fan-out</b> terms are used differently by vendors, so always state the direction: here, <b>hosts per storage port</b>. Typical planning figures are 7:1 to 15:1 hosts per array port for mixed workloads, and much lower (3:1 to 5:1) for latency-critical flash, but real averages come from measured data, not from rules of thumb.</p>
<div class="eg"><p><b>Worked example.</b> One edge pair: 32 blades x 16G = 512G. Uplinks: 4 x 32G = 128G. Ratio = 512 / 128 = <b>4:1</b>. Imaging backup alone can drive 8 blades at 12G = 96G, which is 75 percent of the uplinks, before production traffic. After adding 4 more uplinks (8 x 32G = 256G) the ratio is <b>2:1</b> and backup uses 38 percent.</p></div>

<h3>Chosen design for Zenith</h3>
<p>UCS fabric interconnects stay in end-host (NPV) mode, with 8 x 32G uplinks per FI in an NP port channel to the MDS core (NPIV). Backup traffic moves to its own VSAN with its own port channel pair so it cannot starve production. Hosts at 4G or 8G legacy ports are upgraded or moved off the core, since one slow-draining device can hold up shared credits.</p>

<div class="warn"><p><b>Common mistake.</b> Enabling NPV on a switch that also needs to run local zoning, or forgetting <code>feature npiv</code> on the core, so the edge uplink never comes up. Another: sizing ISLs from the average, not the backup or boot-storm peak.</p></div>
<div class="exam"><p><b>Exam trap.</b> NPIV is enabled on the switch that <em>receives</em> the multiple logins (core); NPV is enabled on the proxy edge. NPV edge uses no domain ID, so it does not count toward the fabric domain limit.</p></div>

<div class="scn"><h4>The 02:00 patient-record freeze</h4><p>At Zenith, the backup VSAN did not exist; backup and production shared four 32G uplinks. A single old 4G host on the same edge slowly returned credits, so frames queued and a "slow drain" spread to unrelated hosts. Fixes: separate backup VSAN and port channel, 8 uplinks, remove the 4G host, and set up port-monitor alerts for credit and utilisation thresholds.</p><p><b>Lesson:</b> oversubscription is a peak-hour number, and one slow device can hurt everyone who shares its links.</p></div>

<div class="iv"><p class="q">"When would you choose NPV over a full switch at the edge?"</p><p>Strong answer: when there are many edge switches or blade FIs, to save domain IDs and reduce zoning and upgrade effort, or when the core is another vendor. Mention that all traffic goes to the core (no local switching), zoning is on the core, and the core needs NPIV.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NPIV lets a port take several logins; NPV makes an edge switch a proxy with NP uplinks and no domain ID.</li>
<li>SAN port channels bundle up to 16 links and keep the fabric stable on a link failure.</li>
<li>Oversubscription = edge host bandwidth divided by uplink bandwidth; size it for peaks.</li>
<li>State the fan-in/fan-out direction; plan hosts-per-storage-port ratios from measurements.</li>
<li>Isolate backup traffic and retire slow-draining devices.</li>
</ul></div>
`,hi:`
<p>Topology chun lene ke baad teen sawal tay karte hain ki load mein SAN chalega ya nahi: edge switches core se kaise judte hain, unhe kitni links jodti hain, aur hosts un links se ek saath kitna traffic bhej sakte hain? Yeh chapter teeno ka jawab real numbers ke saath deta hai.</p>

<h3>Case: Zenith Health</h3>
<div class="eg"><p><b>Customer.</b> Zenith Health, ek hospital group. Aath Cisco UCS blade chassis (64 blades, har ek 16G FC) electronic patient record aur imaging chalate hain. Har fabric mein do MDS 9000 core switches teen arrays sambhalte hain. 400 TB ka radiology archive apne array par hai.</p><p><b>Symptom.</b> Roz raat 02:00 baje imaging backup chalta hai aur subah clinicians shikayat karte hain ki patient record application kuch seconds ke liye freeze ho jaati hai. SAN team ko ISL utilisation 95 percent aur edge par hazaron "credit loss" jaise events dikhte hain.</p><p><b>Requirements.</b> Backup ke dauran koi dikhne wala slowdown nahi; agle saal 4 aur chassis jodna; zone aur upgrade karne wale switches kam se kam; vendor-neutral core.</p></div>

<h3>NPIV: ek port par kai logins</h3>
<p><b>N_Port ID Virtualization (NPIV)</b> ek physical F port ko kai fabric logins (FLOGI plus FDISC) accept karne deta hai, har ek ka apna FCID. Yeh tab chahiye jab host multiple virtual WWPNs dikhata hai (jaise apni identity wale VMs) aur sabse zaroori, jab port NPV switch ki taraf ho. Cisco MDS par <b>core</b> switch par <code>feature npiv</code> se enable karte hain.</p>

<h3>NPV: edge switch jo host ki tarah behave karta hai</h3>
<p><b>N_Port Virtualization (NPV)</b> edge switch ko proxy bana deta hai. E port aur apne domain ID ke saath fabric join karne ki jagah, woh <b>NP ports</b> (uplinks) se core mein login karta hai aur apne servers ke FLOGIs ko un uplinks par multiple logins ki tarah forward karta hai. Core ko ek F port dikhta hai jiske peeche kai N ports hain. Cisco UCS fabric interconnects <b>end-host mode</b> mein isi tarah kaam karte hain.</p>
<table class="cmp"><tr><th>Pehlu</th><th>NPV edge</th><th>Full switch edge (E ports)</th></tr>
<tr><td>Domain ID</td><td>Koi nahi</td><td>Har switch ka ek</td></tr>
<tr><td>Zoning</td><td>Sirf core par</td><td>Distributed, edge bhi hissa leta hai</td></tr>
<tr><td>Core requirement</td><td>NPIV enabled</td><td>Same vendor ya interop mode</td></tr>
<tr><td>Local switching</td><td>Nahi; sab traffic core jaata hai</td><td>Edge par possible</td></tr>
<tr><td>Management</td><td>Halka, kam state</td><td>Poora fabric participant</td></tr>
<tr><td>Scale</td><td>Domain ID limit se bachata hai</td><td>Domain count supported range mein rehna chahiye</td></tr>
</table>
<p>Practical rule: <b>NPV tab use karo jab edge switches bahut hon, edge blade ya FI ho, ya core doosre vendor ka ho</b>. E-port core-edge tab rakho jab edge-local traffic matter kare ya edge par zoning enforcement chahiye. Dhyan rahe: MDS par <code>feature npv</code> enable karne se configuration erase hota hai aur switch reload hota hai, isliye ise change nahi, rebuild ki tarah plan karo.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Port channel ke saath NPV edge se NPIV core">
<rect x="20" y="20" width="120" height="40" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="12">Blade 1..32 HBA</text>
<rect x="20" y="110" width="120" height="40" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="80" y="135" text-anchor="middle" class="svg-ink" font-size="12">Blade 33..64 HBA</text>
<rect x="210" y="40" width="140" height="120" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="280" y="78" text-anchor="middle" class="svg-ink" font-size="13">NPV edge</text><text x="280" y="98" text-anchor="middle" class="svg-ink" font-size="12">(UCS FI / MDS)</text><text x="280" y="124" text-anchor="middle" class="svg-muted" font-size="11">server ports = F</text>
<rect x="440" y="40" width="130" height="120" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="505" y="78" text-anchor="middle" class="svg-ink" font-size="13">MDS core A</text><text x="505" y="98" text-anchor="middle" class="svg-ink" font-size="12">NPIV on</text><text x="505" y="124" text-anchor="middle" class="svg-muted" font-size="11">zoning yahan</text>
<line x1="140" y1="40" x2="210" y2="70" stroke="#64748b" stroke-width="2"/><line x1="140" y1="130" x2="210" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="350" y1="70" x2="440" y2="70" stroke="#16a34a" stroke-width="4"/><line x1="350" y1="90" x2="440" y2="90" stroke="#16a34a" stroke-width="4"/><line x1="350" y1="110" x2="440" y2="110" stroke="#16a34a" stroke-width="4"/><line x1="350" y1="130" x2="440" y2="130" stroke="#16a34a" stroke-width="4"/>
<text x="395" y="62" text-anchor="middle" class="svg-ink" font-size="11">NP to F</text>
<rect x="440" y="200" width="130" height="40" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="505" y="225" text-anchor="middle" class="svg-ink" font-size="12">Storage arrays</text>
<line x1="505" y1="160" x2="505" y2="200" stroke="#64748b" stroke-width="2"/>
<text x="395" y="180" text-anchor="middle" class="svg-muted" font-size="11">4 x 32G port channel = 128G</text>
<text x="80" y="95" text-anchor="middle" class="svg-muted" font-size="11">hosts: neela</text>
<text x="320" y="268" text-anchor="middle" class="svg-muted" font-size="11">Orange = NPV edge, hara = core (fabric A), purple = storage</text>
</svg><p class="cap">Edge ke paas domain ID aur zoning nahi hai; chaar uplinks ek NP port channel banate hain.</p></div>

<h3>Port channels aur ISL design</h3>
<p><b>SAN port channel</b> 16 physical links tak ko ek logical ISL (ya F/NP link) mein bundle karta hai. Frames source ID, destination ID aur optionally exchange ID se per flow balance hote hain, isliye link fail hone par capacity ghat'ti hai par fabric nahi tootta. Members ko alag line cards ya ASICs par rakho taaki card failure poora bundle na hataye. Port channel ke bina FSPF har ISL ko alag path maanta hai aur failure par reroute hota hai.</p>
<pre class="code"><span class="c">! core (NPIV) side</span>
feature npiv
interface port-channel 1
  switchport mode F
  channel mode active
interface fc1/1-4
  channel-group 1 force
  no shutdown
<span class="c">! NPV edge side (feature npv pehle se enabled)</span>
interface port-channel 1
  switchport mode NP
  channel mode active</pre>
<pre class="out">npv-edge# show npv status
npiv is disabled
disruptive load balancing is disabled
External Interfaces:
====================
  Interface: port-channel1, VSAN: 10, FCID: 0x610001, State: <span class="hl">Up</span>
Number of External Interfaces: 1</pre>

<h3>Oversubscription aur fan-in/fan-out numbers mein</h3>
<p><b>ISL oversubscription</b> edge par total host port bandwidth ko uplink bandwidth se divide karne par milta hai. Zenith mein 64 blades x 16G = 1,024G hota hai agar har blade poora use kare; edge pair par 4 x 32G uplinks ke saath ratio kaafi zyada hota hai jab tak links na badhao. <b>Fan-in/fan-out</b> terms vendors alag tarah use karte hain, isliye direction hamesha batao: yahan <b>hosts per storage port</b>. Mixed workloads ke liye typical planning figures 7:1 se 15:1 hosts per array port hain, aur latency-critical flash ke liye bahut kam (3:1 se 5:1), par asli averages measured data se aate hain, rules of thumb se nahi.</p>
<div class="eg"><p><b>Worked example.</b> Ek edge pair: 32 blades x 16G = 512G. Uplinks: 4 x 32G = 128G. Ratio = 512 / 128 = <b>4:1</b>. Sirf imaging backup 8 blades ko 12G par chala sakta hai = 96G, yaani production traffic se pehle hi uplinks ka 75 percent. 4 aur uplinks jodne par (8 x 32G = 256G) ratio <b>2:1</b> ho jaata hai aur backup 38 percent use karta hai.</p></div>

<h3>Zenith ke liye chosen design</h3>
<p>UCS fabric interconnects end-host (NPV) mode mein rehte hain, har FI se MDS core (NPIV) tak NP port channel mein 8 x 32G uplinks. Backup traffic apne VSAN aur apne port channel pair par jaata hai taaki production ko bhookha na rakhe. 4G ya 8G legacy ports wale hosts upgrade ya core se hata diye jaate hain, kyunki ek slow-draining device shared credits rok sakta hai.</p>

<div class="warn"><p><b>Common mistake.</b> Aise switch par NPV enable karna jise local zoning bhi chalani hai, ya core par <code>feature npiv</code> bhool jaana jis wajah se edge uplink kabhi up nahi hota. Doosri: ISLs ko average se size karna, backup ya boot-storm peak se nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> NPIV us switch par enable hota hai jo multiple logins <em>receive</em> karta hai (core); NPV proxy edge par enable hota hai. NPV edge domain ID use nahi karta, isliye fabric domain limit mein count nahi hota.</p></div>

<div class="scn"><h4>02:00 baje patient-record freeze</h4><p>Zenith mein backup VSAN tha hi nahi; backup aur production chaar 32G uplinks share kar rahe the. Usi edge par ek purana 4G host credits dheere lauta raha tha, isliye frames queue mein ruke aur "slow drain" unrelated hosts tak phail gaya. Fix: alag backup VSAN aur port channel, 8 uplinks, 4G host hataya, aur credit aur utilisation thresholds ke liye port-monitor alerts lagaye.</p><p><b>Lesson:</b> oversubscription peak-hour ka number hai, aur ek slow device un sab ko nuksan pahuncha sakta hai jo uske links share karte hain.</p></div>

<div class="iv"><p class="q">"Edge par full switch ki jagah NPV kab chunoge?"</p><p>Strong answer: jab edge switches ya blade FIs bahut hon, domain IDs bachane aur zoning aur upgrade effort kam karne ke liye, ya jab core doosre vendor ka ho. Bolo ki saara traffic core jaata hai (local switching nahi), zoning core par hoti hai, aur core par NPIV chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NPIV port ko kai logins deta hai; NPV edge switch ko NP uplinks wala proxy banata hai, domain ID ke bina.</li>
<li>SAN port channels 16 links tak bundle karte hain aur link failure par fabric stable rakhte hain.</li>
<li>Oversubscription = edge host bandwidth divided by uplink bandwidth; peaks ke liye size karo.</li>
<li>Fan-in/fan-out ki direction batao; hosts-per-storage-port ratios measurements se plan karo.</li>
<li>Backup traffic isolate karo aur slow-draining devices retire karo.</li>
</ul></div>
`}};export{e as default};