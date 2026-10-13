var e={id:`npv`,h:{en:`NPV and NPIV: edge switches without domains, many logins per port, UCS and F-port channels`,hi:`NPV aur NPIV: bina domain ke edge switches, ek port par kai logins, UCS aur F-port channels`},body:{en:`
<p>Think of a large office building with one mail room. The individual employees do not each register with the national post office; the mail room collects their letters and hands them over at the post office counter, one counter window serving many names. Two ideas hide in that picture. The post office counter that accepts letters for many names is <b>NPIV</b>. The mail room that acts on behalf of everyone behind it is an <b>NPV</b> switch.</p>

<h3>NPIV: many logins on one F_Port</h3>
<p>Normally one N_Port does one FLOGI and gets one FCID. <b>NPIV</b> (N_Port ID Virtualization) lets a single physical port request <b>additional</b> FCIDs: after the normal FLOGI, the port sends <b>FDISC</b> (fabric discovery) requests, each with a different WWPN, and each gets its own FCID. You enable it on the switch that owns the F_Port:</p>
<pre class="code">MDS-A(config)# feature npiv</pre>
<p>Who uses it? Virtual machines with virtual HBAs (each VM gets its own WWPN), hypervisor or container hosts that present several WWPNs, and above all <b>NPV switches</b>, which log all their servers in through one uplink.</p>

<h3>NPV: an edge switch that behaves like a host</h3>
<p>An <b>NPV</b> (N_Port Virtualization) switch does not join the fabric as a switch. It takes <b>no domain ID</b>, runs no name server and holds no zoning. Its server-facing ports are normal F_Ports; its uplinks are <b>NP_Ports</b> (proxy N_Ports) connected to F_Ports on an NPIV-enabled core. When a server does FLOGI, the NPV switch converts it into an FDISC on its uplink, so the server's login actually lands on the core switch, which assigns an FCID from <b>its own</b> domain.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="NPV edge and NPIV core">
<rect x="20" y="15" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="80" y="40" text-anchor="middle" class="svg-ink" font-size="12">Blade 1</text>
<rect x="160" y="15" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="220" y="40" text-anchor="middle" class="svg-ink" font-size="12">Blade 2</text>
<rect x="300" y="15" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="360" y="40" text-anchor="middle" class="svg-ink" font-size="12">Blade 3</text>
<rect x="60" y="95" width="320" height="50" rx="8" fill="#fde68a"/><text x="220" y="117" text-anchor="middle" class="svg-ink" font-size="13">NPV edge (e.g. UCS fabric interconnect A)</text><text x="220" y="135" text-anchor="middle" class="svg-muted" font-size="12">F ports down, NP ports up, no domain ID</text>
<line x1="80" y1="55" x2="140" y2="95" stroke="#64748b" stroke-width="2"/><line x1="220" y1="55" x2="220" y2="95" stroke="#64748b" stroke-width="2"/><line x1="360" y1="55" x2="300" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="190" width="320" height="50" rx="8" fill="#bae6fd"/><text x="220" y="212" text-anchor="middle" class="svg-ink" font-size="13">Core MDS-A (feature npiv)</text><text x="220" y="230" text-anchor="middle" class="svg-muted" font-size="12">domain 0x0a, name server, zoning</text>
<line x1="170" y1="145" x2="170" y2="190" stroke="#64748b" stroke-width="3"/><line x1="270" y1="145" x2="270" y2="190" stroke="#64748b" stroke-width="3"/>
<text x="150" y="172" text-anchor="end" class="svg-muted" font-size="12">NP</text><text x="290" y="172" class="svg-muted" font-size="12">NP</text>
<rect x="420" y="190" width="200" height="50" rx="8" fill="#e2e8f0"/><text x="520" y="220" text-anchor="middle" class="svg-ink" font-size="12">ARRAY1 on the core</text>
<line x1="380" y1="215" x2="420" y2="215" stroke="#64748b" stroke-width="2"/>
<text x="520" y="120" text-anchor="middle" class="svg-accent" font-size="12">All FCIDs start 0x0a</text>
</svg><p class="cap">The NPV edge proxies every server login up its NP uplinks; the core does all fabric services.</p></div>

<h3>Why NPV exists</h3>
<ul>
<li><b>Domain count.</b> A fabric supports at most 239 domains, and in practice vendors support far fewer in one fabric. Every blade chassis or top-of-rack FC switch in full switch mode consumes one. In NPV mode they consume none.</li>
<li><b>Interoperability.</b> An NPV switch only speaks the N_Port login protocol upstream, so an edge from one vendor can attach to a core from another without E_Port interop problems.</li>
<li><b>Simplicity.</b> Zoning, name server and domain management happen in one place, the core.</li>
</ul>

<h3>Configuration at a glance</h3>
<pre class="code"><span class="c">! core (MDS-A): accept multiple logins on the F ports facing the edge</span>
feature npiv
interface fc1/9
  switchport mode F
  no shutdown

<span class="c">! edge switch: WARNING, enabling NPV erases the configuration and reloads</span>
feature npv
vsan database
  vsan 10 interface fc1/1
  vsan 10 interface fc1/9
interface fc1/9
  switchport mode NP
  no shutdown
interface fc1/1
  switchport mode F
  no shutdown</pre>

<h3>Verification</h3>
<pre class="out">EDGE# show npv flogi-table
--------------------------------------------------------------------------------
SERVER                                                                  EXTERNAL
INTERFACE VSAN FCID             PORT NAME               NODE NAME       INTERFACE
--------------------------------------------------------------------------------
fc1/1     10   0x0a0101 20:00:00:25:b5:aa:00:11 20:00:00:25:b5:00:00:11 fc1/9
fc1/2     10   0x0a0102 20:00:00:25:b5:aa:00:12 20:00:00:25:b5:00:00:12 fc1/9

MDS-A# show flogi database interface fc1/9
INTERFACE        VSAN    FCID           PORT NAME               NODE NAME
<span class="hl">fc1/9            10      0x0a0100       20:09:00:de:fb:77:00:01 20:00:00:de:fb:77:00:00
fc1/9            10      0x0a0101       20:00:00:25:b5:aa:00:11 20:00:00:25:b5:00:00:11
fc1/9            10      0x0a0102       20:00:00:25:b5:aa:00:12 20:00:00:25:b5:00:00:12</span></pre>
<p>On the core, one interface shows several logins: the first is the NP port itself (FLOGI), the others are the servers behind it (FDISC). All FCIDs start with <code>0a</code>, the core's domain. <code>show npv status</code> on the edge shows each NP uplink and whether it is up; an uplink cannot come up if the core port lacks NPIV.</p>

<h3>Cisco UCS fabric interconnects</h3>
<p>UCS fabric interconnects run Fibre Channel in <b>end-host mode</b> by default, which is NPV. FI-A connects to MDS-A (fabric A) and FI-B to MDS-B (fabric B). The blades' vHBAs get WWPNs from UCS pools, the FI proxies their logins to the MDS, and <b>all zoning is done on the MDS</b>. The alternative, FC switching mode, turns the FI into a full FC switch with its own domain; it is mainly used when arrays connect directly to the FI.</p>

<h3>F-port trunking and channeling (concept)</h3>
<p>By default each server is pinned to one NP uplink. If that uplink fails, its servers must log in again through another uplink, a short disruption for them. With <b>F-port channeling</b> the uplinks are bundled into one SAN port channel between the NPV device and the core; a member failure is invisible to servers as long as one member remains. With <b>F-port trunking</b> that channel carries several VSANs (TF on the core side, TNP on the NPV side). On the MDS core this needs <code>feature fport-channel-trunk</code> in addition to NPIV. It is the standard design for UCS uplinks.</p>

<div class="eg"><p><b>Worked example: domain budget.</b> Design: 2 core directors plus 60 blade chassis per fabric, each chassis with its own FC switch. In switch mode: 62 domains per fabric, far beyond what vendors support in one fabric, and 60 more switches to zone and upgrade. In NPV mode: <b>2 domains per fabric</b>, and zoning only on the two cores. Each chassis uses two 32G NP uplinks in an F-port channel: 64 Gb/s per chassis, surviving one link failure without any server re-login.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Enabling <code>feature npv</code> on a switch without a configuration backup (it erases and reloads). Forgetting <code>feature npiv</code> on the core, so NP uplinks never come up. Looking for zoning on the NPV edge: there is none; zone on the core. Expecting local switching on an NPV edge: traffic between two servers behind it still goes through the core.</p></div>
<div class="exam"><p><b>Exam tip.</b> NPIV = core feature, many FCIDs per F_Port (FLOGI then FDISC). NPV = edge mode, no domain ID, NP uplinks, proxies logins. UCS FIs default to end-host (NPV) mode. F-port channel/trunk = TF on the core, TNP on the NPV side.</p></div>

<div class="scn"><h4>Blades down after a core replacement</h4><p>A team replaced an old core MDS in fabric A with a new one and copied only the VSAN and zoning configuration. After cut-over, every blade server lost its fabric A paths; fabric B carried everything. On the UCS side the FC uplinks toward the new core stayed down. <code>show flogi database</code> on the new core showed nothing on those ports. The missing line was <code>feature npiv</code>: without it the core rejects the FDISC logins that an NPV device depends on. After enabling NPIV (and <code>feature fport-channel-trunk</code> for the port channel), all blades logged in and zoning worked unchanged because it was WWPN-based.</p><p><b>Lesson:</b> an NPV edge is only as good as the NPIV core it hangs off; feature lists belong in every migration checklist.</p></div>

<div class="iv"><p class="q">"What is the difference between NPV and NPIV?"</p><p>Strong answer: NPIV is a feature on the switch (or HBA) that allows one physical N_Port to hold several fabric logins, using FDISC after the first FLOGI; it is enabled on the core. NPV is a mode for an edge switch: it does not take a domain ID, has no fabric services, and proxies its servers' logins upstream through NP ports to an NPIV-enabled core. Benefits: fewer domains, easier multi-vendor interop, central zoning. Give the UCS example: fabric interconnects in end-host mode are NPV, the MDS core runs NPIV and usually F-port trunking and channeling.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NPIV lets one F_Port accept many logins: FLOGI first, then FDISC per extra WWPN; enable it on the core.</li>
<li>NPV edges take no domain ID, run no fabric services and proxy logins through NP ports.</li>
<li>Enabling NPV on an MDS erases the configuration and reloads the switch.</li>
<li>UCS fabric interconnects default to end-host (NPV) mode; zoning happens on the MDS core.</li>
<li>F-port channeling and trunking (TF/TNP, <code>feature fport-channel-trunk</code>) protect NPV uplinks and carry several VSANs.</li>
</ul></div>
`,hi:`
<p>Ek badi office building socho jismein ek mail room hai. Har employee alag se national post office mein register nahi karta; mail room unke letters ikattha karta hai aur post office counter par de deta hai, ek counter window bahut saare naamon ko serve karti hai. Is picture mein do ideas chhupe hain. Post office counter jo bahut naamon ke letters accept karta hai woh <b>NPIV</b> hai. Mail room jo apne peeche ke sab logon ki taraf se kaam karta hai woh ek <b>NPV</b> switch hai.</p>

<h3>NPIV: ek F_Port par kai logins</h3>
<p>Normally ek N_Port ek FLOGI karta hai aur ek FCID leta hai. <b>NPIV</b> (N_Port ID Virtualization) ek physical port ko <b>extra</b> FCIDs maangne deta hai: normal FLOGI ke baad port <b>FDISC</b> (fabric discovery) requests bhejta hai, har ek alag WWPN ke saath, aur har ek ko apna FCID milta hai. Aap ise us switch par enable karte ho jiska F_Port hai:</p>
<pre class="code">MDS-A(config)# feature npiv</pre>
<p>Ise kaun use karta hai? Virtual HBAs wali virtual machines (har VM ko apna WWPN milta hai), hypervisor ya container hosts jo kai WWPNs present karte hain, aur sabse zyada <b>NPV switches</b>, jo apne saare servers ko ek uplink se login karate hain.</p>

<h3>NPV: edge switch jo host ki tarah behave karta hai</h3>
<p><b>NPV</b> (N_Port Virtualization) switch fabric mein switch ki tarah join nahi karta. Woh <b>koi domain ID nahi</b> leta, koi name server nahi chalata aur koi zoning nahi rakhta. Uske server-facing ports normal F_Ports hain; uske uplinks <b>NP_Ports</b> (proxy N_Ports) hain jo NPIV-enabled core ke F_Ports se jude hain. Jab server FLOGI karta hai, NPV switch use apne uplink par FDISC mein badal deta hai, isliye server ka login asal mein core switch par land hota hai, jo <b>apne</b> domain se FCID assign karta hai.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="NPV edge aur NPIV core">
<rect x="20" y="15" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="80" y="40" text-anchor="middle" class="svg-ink" font-size="12">Blade 1</text>
<rect x="160" y="15" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="220" y="40" text-anchor="middle" class="svg-ink" font-size="12">Blade 2</text>
<rect x="300" y="15" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="360" y="40" text-anchor="middle" class="svg-ink" font-size="12">Blade 3</text>
<rect x="60" y="95" width="320" height="50" rx="8" fill="#fde68a"/><text x="220" y="117" text-anchor="middle" class="svg-ink" font-size="13">NPV edge (jaise UCS fabric interconnect A)</text><text x="220" y="135" text-anchor="middle" class="svg-muted" font-size="12">neeche F ports, upar NP ports, koi domain ID nahi</text>
<line x1="80" y1="55" x2="140" y2="95" stroke="#64748b" stroke-width="2"/><line x1="220" y1="55" x2="220" y2="95" stroke="#64748b" stroke-width="2"/><line x1="360" y1="55" x2="300" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="190" width="320" height="50" rx="8" fill="#bae6fd"/><text x="220" y="212" text-anchor="middle" class="svg-ink" font-size="13">Core MDS-A (feature npiv)</text><text x="220" y="230" text-anchor="middle" class="svg-muted" font-size="12">domain 0x0a, name server, zoning</text>
<line x1="170" y1="145" x2="170" y2="190" stroke="#64748b" stroke-width="3"/><line x1="270" y1="145" x2="270" y2="190" stroke="#64748b" stroke-width="3"/>
<text x="150" y="172" text-anchor="end" class="svg-muted" font-size="12">NP</text><text x="290" y="172" class="svg-muted" font-size="12">NP</text>
<rect x="420" y="190" width="200" height="50" rx="8" fill="#e2e8f0"/><text x="520" y="220" text-anchor="middle" class="svg-ink" font-size="12">Core par ARRAY1</text>
<line x1="380" y1="215" x2="420" y2="215" stroke="#64748b" stroke-width="2"/>
<text x="520" y="120" text-anchor="middle" class="svg-accent" font-size="12">Saare FCIDs 0x0a se shuru</text>
</svg><p class="cap">NPV edge har server login ko apne NP uplinks se upar proxy karta hai; core saari fabric services karta hai.</p></div>

<h3>NPV kyun exist karta hai</h3>
<ul>
<li><b>Domain count.</b> Ek fabric zyada se zyada 239 domains support karta hai, aur practice mein vendors ek fabric mein kahin kam support karte hain. Full switch mode mein har blade chassis ya top-of-rack FC switch ek domain leta hai. NPV mode mein koi nahi leta.</li>
<li><b>Interoperability.</b> NPV switch upstream sirf N_Port login protocol bolta hai, isliye ek vendor ka edge doosre vendor ke core se bina E_Port interop problems ke jud sakta hai.</li>
<li><b>Simplicity.</b> Zoning, name server aur domain management ek jagah hota hai, core par.</li>
</ul>

<h3>Configuration ek nazar mein</h3>
<pre class="code"><span class="c">! core (MDS-A): edge ki taraf wale F ports par multiple logins accept karo</span>
feature npiv
interface fc1/9
  switchport mode F
  no shutdown

<span class="c">! edge switch: WARNING, NPV enable karne se configuration erase hoti hai aur reload hota hai</span>
feature npv
vsan database
  vsan 10 interface fc1/1
  vsan 10 interface fc1/9
interface fc1/9
  switchport mode NP
  no shutdown
interface fc1/1
  switchport mode F
  no shutdown</pre>

<h3>Verification</h3>
<pre class="out">EDGE# show npv flogi-table
--------------------------------------------------------------------------------
SERVER                                                                  EXTERNAL
INTERFACE VSAN FCID             PORT NAME               NODE NAME       INTERFACE
--------------------------------------------------------------------------------
fc1/1     10   0x0a0101 20:00:00:25:b5:aa:00:11 20:00:00:25:b5:00:00:11 fc1/9
fc1/2     10   0x0a0102 20:00:00:25:b5:aa:00:12 20:00:00:25:b5:00:00:12 fc1/9

MDS-A# show flogi database interface fc1/9
INTERFACE        VSAN    FCID           PORT NAME               NODE NAME
<span class="hl">fc1/9            10      0x0a0100       20:09:00:de:fb:77:00:01 20:00:00:de:fb:77:00:00
fc1/9            10      0x0a0101       20:00:00:25:b5:aa:00:11 20:00:00:25:b5:00:00:11
fc1/9            10      0x0a0102       20:00:00:25:b5:aa:00:12 20:00:00:25:b5:00:00:12</span></pre>
<p>Core par ek interface kai logins dikhata hai: pehla khud NP port hai (FLOGI), baaki uske peeche ke servers (FDISC). Saare FCIDs <code>0a</code> se shuru hote hain, jo core ka domain hai. Edge par <code>show npv status</code> har NP uplink dikhata hai aur batata hai ki woh up hai ya nahi; agar core port par NPIV nahi hai to uplink up nahi ho sakta.</p>

<h3>Cisco UCS fabric interconnects</h3>
<p>UCS fabric interconnects default mein Fibre Channel <b>end-host mode</b> mein chalate hain, jo NPV hai. FI-A MDS-A (fabric A) se judta hai aur FI-B MDS-B (fabric B) se. Blades ke vHBAs ko UCS pools se WWPNs milte hain, FI unke logins MDS tak proxy karta hai, aur <b>saari zoning MDS par hoti hai</b>. Alternative, FC switching mode, FI ko apne domain wala poora FC switch bana deta hai; yeh mainly tab use hota hai jab arrays seedhe FI se judte hain.</p>

<h3>F-port trunking aur channeling (concept)</h3>
<p>Default mein har server ek NP uplink par pinned hota hai. Agar woh uplink fail ho, uske servers ko doosre uplink se dobara login karna padta hai, jo unke liye chhota disruption hai. <b>F-port channeling</b> ke saath uplinks NPV device aur core ke beech ek SAN port channel mein bundle hote hain; jab tak ek member bacha hai, member failure servers ko dikhta hi nahi. <b>F-port trunking</b> ke saath woh channel kai VSANs le jaata hai (core side par TF, NPV side par TNP). MDS core par iske liye NPIV ke alawa <code>feature fport-channel-trunk</code> chahiye. UCS uplinks ke liye yahi standard design hai.</p>

<div class="eg"><p><b>Worked example: domain budget.</b> Design: har fabric mein 2 core directors plus 60 blade chassis, har chassis ka apna FC switch. Switch mode mein: har fabric mein 62 domains, jo vendors ek fabric mein support karte hain usse kahin zyada, aur zone aur upgrade karne ke liye 60 aur switches. NPV mode mein: <b>har fabric mein 2 domains</b>, aur zoning sirf do cores par. Har chassis F-port channel mein do 32G NP uplinks use karta hai: har chassis 64 Gb/s, aur ek link failure bina kisi server re-login ke jhel leta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Configuration backup ke bina switch par <code>feature npv</code> enable karna (yeh erase karke reload karta hai). Core par <code>feature npiv</code> bhool jaana, jisse NP uplinks kabhi up nahi hote. NPV edge par zoning dhoondhna: wahan hai hi nahi; core par zone karo. NPV edge par local switching expect karna: uske peeche ke do servers ke beech ka traffic bhi core se hokar jaata hai.</p></div>
<div class="exam"><p><b>Exam tip.</b> NPIV = core feature, har F_Port par kai FCIDs (pehle FLOGI phir FDISC). NPV = edge mode, koi domain ID nahi, NP uplinks, logins proxy karta hai. UCS FIs default mein end-host (NPV) mode mein hain. F-port channel/trunk = core par TF, NPV side par TNP.</p></div>

<div class="scn"><h4>Core replacement ke baad blades down</h4><p>Ek team ne fabric A ke purane core MDS ko naye se replace kiya aur sirf VSAN aur zoning configuration copy ki. Cut-over ke baad har blade server ne apne fabric A paths kho diye; fabric B sab kuch utha raha tha. UCS side par naye core ki taraf ke FC uplinks down rahe. Naye core par <code>show flogi database</code> un ports par kuch nahi dikha raha tha. Missing line thi <code>feature npiv</code>: iske bina core un FDISC logins ko reject karta hai jin par NPV device depend karta hai. NPIV (aur port channel ke liye <code>feature fport-channel-trunk</code>) enable karne ke baad saare blades login ho gaye aur zoning bina badlaav ke kaam kar gayi kyunki woh WWPN-based thi.</p><p><b>Seekh:</b> NPV edge utna hi achha hai jitna uska NPIV core; feature lists har migration checklist mein honi chahiye.</p></div>

<div class="iv"><p class="q">"NPV aur NPIV mein kya farak hai?"</p><p>Strong answer: NPIV switch (ya HBA) ka ek feature hai jo ek physical N_Port ko kai fabric logins rakhne deta hai, pehle FLOGI ke baad FDISC use karke; yeh core par enable hota hai. NPV edge switch ka ek mode hai: woh domain ID nahi leta, uske paas fabric services nahi hoti, aur woh apne servers ke logins NP ports se NPIV-enabled core tak proxy karta hai. Fayde: kam domains, aasaan multi-vendor interop, central zoning. UCS example do: end-host mode mein fabric interconnects NPV hain, MDS core NPIV aur aam taur par F-port trunking aur channeling chalata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NPIV ek F_Port ko kai logins accept karne deta hai: pehle FLOGI, phir har extra WWPN ke liye FDISC; ise core par enable karo.</li>
<li>NPV edges koi domain ID nahi lete, koi fabric services nahi chalate aur NP ports se logins proxy karte hain.</li>
<li>MDS par NPV enable karne se configuration erase hoti hai aur switch reload hota hai.</li>
<li>UCS fabric interconnects default mein end-host (NPV) mode mein hain; zoning MDS core par hoti hai.</li>
<li>F-port channeling aur trunking (TF/TNP, <code>feature fport-channel-trunk</code>) NPV uplinks ko protect karte hain aur kai VSANs le jaate hain.</li>
</ul></div>
`}};export{e as default};