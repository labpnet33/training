var e={id:`architecture`,h:{en:`Choosing the wireless architecture: a customer case`,hi:`Wireless architecture chunna: ek customer case`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn to design the wired and wireless infrastructure that a Wi-Fi network sits on, the way the Cisco ENWLSD 300-425 exam asks it: you are given a customer, its sites, its devices and its limits, and you must choose and justify a design. We cover architecture choice, AP modes and switching, FlexConnect branches, controller placement and sizing, access-switch power and uplinks, WLAN design and QoS, security, AAA, DHCP and DNS, Cisco Catalyst Center assurance, and outdoor mesh. <b>Prerequisites:</b> you know what an SSID, a VLAN, an access point (AP) and a wireless LAN controller (WLC) are, and you can read a simple network diagram. No design experience is needed.</p>

<h3>The case: Kestrel Foods</h3>
<p>Kestrel Foods is a fictional food distributor. It has one head-office campus with 420 users per floor, a brand-new tower that the IT team wants to build as an SD-Access fabric, 35 small branch depots (5 to 8 APs each, linked to the head office by a 20 Mbps WAN with 60 ms round-trip time), and a small trial site run by a partner who wants zero equipment to manage. The CIO says: "One wireless platform, simple to run, and a depot must keep working if the WAN fails."</p>
<p>Notice how a real design starts: <b>requirements</b> (one platform, depot survives WAN failure), <b>constraints</b> (20 Mbps WAN, 60 ms RTT, small branch IT), and only then the <b>options</b>. Beginners jump to a product name first. The exam punishes that.</p>

<h3>The five architecture options</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Five wireless architecture options">
<rect x="10" y="10" width="116" height="62" rx="8" fill="#bae6fd"/><text x="68" y="34" text-anchor="middle" class="svg-ink" font-size="12">Appliance</text><text x="68" y="52" text-anchor="middle" class="svg-ink" font-size="12">C9800-80/-40/-L</text>
<rect x="136" y="10" width="116" height="62" rx="8" fill="#ddd6fe"/><text x="194" y="34" text-anchor="middle" class="svg-ink" font-size="12">Virtual</text><text x="194" y="52" text-anchor="middle" class="svg-ink" font-size="12">C9800-CL</text>
<rect x="262" y="10" width="116" height="62" rx="8" fill="#bbf7d0"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="12">Embedded on</text><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">Catalyst switch</text>
<rect x="388" y="10" width="116" height="62" rx="8" fill="#fde68a"/><text x="446" y="34" text-anchor="middle" class="svg-ink" font-size="12">SD-Access</text><text x="446" y="52" text-anchor="middle" class="svg-ink" font-size="12">fabric wireless</text>
<ellipse cx="572" cy="41" rx="60" ry="31" fill="#fed7aa"/><text x="572" y="38" text-anchor="middle" class="svg-ink" font-size="12">Meraki</text><text x="572" y="54" text-anchor="middle" class="svg-ink" font-size="12">cloud</text>
<line x1="68" y1="72" x2="68" y2="150" stroke="#64748b"/><line x1="194" y1="72" x2="194" y2="150" stroke="#64748b"/><line x1="320" y1="72" x2="320" y2="150" stroke="#64748b"/><line x1="446" y1="72" x2="446" y2="150" stroke="#64748b"/><line x1="572" y1="72" x2="572" y2="150" stroke="#64748b" stroke-dasharray="4 3"/>
<circle cx="68" cy="165" r="14" fill="#e2e8f0" stroke="#64748b"/><text x="68" y="169" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<circle cx="194" cy="165" r="14" fill="#e2e8f0" stroke="#64748b"/><text x="194" y="169" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<circle cx="320" cy="165" r="14" fill="#e2e8f0" stroke="#64748b"/><text x="320" y="169" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<circle cx="446" cy="165" r="14" fill="#e2e8f0" stroke="#64748b"/><text x="446" y="169" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<circle cx="572" cy="165" r="14" fill="#e2e8f0" stroke="#64748b"/><text x="572" y="169" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<text x="68" y="205" text-anchor="middle" class="svg-muted" font-size="11">Large campus</text><text x="194" y="205" text-anchor="middle" class="svg-muted" font-size="11">Data center, cloud</text><text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="11">Small site</text><text x="446" y="205" text-anchor="middle" class="svg-muted" font-size="11">New tower</text><text x="572" y="205" text-anchor="middle" class="svg-muted" font-size="11">No controller</text>
<rect x="10" y="225" width="14" height="14" fill="#bae6fd"/><text x="30" y="237" class="svg-muted" font-size="11">Physical controller</text>
<rect x="160" y="225" width="14" height="14" fill="#ddd6fe"/><text x="180" y="237" class="svg-muted" font-size="11">Software controller</text>
<rect x="320" y="225" width="14" height="14" fill="#bbf7d0"/><text x="340" y="237" class="svg-muted" font-size="11">Built into switch</text>
<rect x="470" y="225" width="14" height="14" fill="#fde68a"/><text x="490" y="237" class="svg-muted" font-size="11">Fabric</text>
<text x="10" y="260" class="svg-muted" font-size="11">Dashed line = management through the cloud, data stays local</text>
</svg><p class="cap">The five choices. Each solves a different size and operating-model problem.</p></div>

<table class="cmp"><tr><th>Option</th><th>Best for</th><th>Trade-off</th></tr>
<tr><td><b>Catalyst 9800 appliance</b> (C9800-80, C9800-40, C9800-L)</td><td>Campus with hundreds or thousands of APs, HA pair, high throughput</td><td>Hardware to buy, rack and patch; capacity is fixed by model</td></tr>
<tr><td><b>Catalyst 9800-CL virtual</b></td><td>Private cloud or public cloud, quick rollout, branches that need a nearby controller</td><td>Performance depends on the hypervisor resources you give it</td></tr>
<tr><td><b>Embedded Wireless Controller on a Catalyst 9000 switch</b> (also EWC on a 9100-series AP)</td><td>Small sites that want no separate controller box</td><td>Low AP and client scale; fewer features than a full 9800</td></tr>
<tr><td><b>SD-Access fabric wireless</b></td><td>Buildings already built as an SD-Access fabric managed by Catalyst Center</td><td>Needs the full fabric; more design and licensing effort</td></tr>
<tr><td><b>Meraki cloud-managed</b></td><td>Lean IT teams, many small sites, dashboard-only operation</td><td>Different management plane and feature set from the Catalyst 9800 family</td></tr>
</table>
<p>Check exact AP and client limits in the current datasheet before you commit. As a rough guide, the C9800-80 is the large model, the C9800-40 is mid-range, the C9800-L is for small and medium sites, and the C9800-CL comes in small, medium and large templates.</p>

<h3>Kestrel's decision</h3>
<div class="eg"><p><b>Requirement to design match.</b> (1) Head office, 420 APs plus growth to about 600: a pair of C9800-40 or C9800-80 in <b>SSO high availability</b>, in the data center. (2) Tower: SD-Access fabric wireless, because the wired side is already a fabric, using a fabric-enabled 9800. (3) 35 depots with a 60 ms WAN: the same 9800 pair, APs in <b>FlexConnect</b> mode so clients keep working when the WAN drops (chapter 2). (4) Partner trial site: Meraki cloud-managed, because the partner has no network staff. The CIO's "one platform" goal is met for 98 percent of the APs; the trial site is a documented exception.</p></div>

<h3>Why not simply buy the biggest controller?</h3>
<p>Because design is about <b>fit</b>. A large appliance for a 20-AP site wastes money and power. A tiny embedded controller for 600 APs fails the first day. And a design that only works while the WAN is up fails the CIO's rule. Always check four things before you pick: <b>scale</b> (APs and clients today and in three years), <b>where traffic must go</b> (central or local), <b>failure behaviour</b> (what happens if the WAN or a controller dies), and <b>who operates it</b> (a skilled team or a one-person branch).</p>

<div class="warn"><p><b>Common mistake.</b> Treating the controller as the only thing in the design. The exam expects you to also consider the access switch ports, PoE budget, VLANs, DHCP, AAA and the WAN, which are the next chapters.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Embedded wireless" does not mean "cheaper 9800 with the same features". The embedded controller is for small sites, with lower scale. If the question gives hundreds of APs, it is not the answer.</p></div>

<div class="scn"><h4>The undersized virtual controller</h4><p>Kestrel's engineers piloted a C9800-CL as the controller for the depots. They deployed the small template on a host where the virtual CPUs shared cores with ten other virtual machines. At 08:00, when 35 depots powered on forklifts and scanners together, APs failed to join, clients saw slow authentication, and the pilot looked like a Wi-Fi failure. The cause was the controller VM starved of CPU, not the radios. They moved the VM to dedicated resources matching the template, sized the template to the planned AP count, and added an HA peer.</p><p><b>Lesson:</b> a virtual controller is only as good as the resources you reserve for it. Size it from the datasheet, not from hope.</p></div>

<div class="iv"><p class="q">"A customer has a campus, 30 branches and one new SD-Access building. Which wireless architecture do you propose?"</p><p>Strong answer: restate the requirements first, then propose a mix. A 9800 HA pair at the campus data center, FlexConnect for branches over the WAN, fabric wireless for the SD-Access building, and mention Meraki only if a site has no IT staff. Justify each choice by scale, traffic path and failure behaviour, and say what you would verify in the datasheet.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Start from requirements and constraints, then choose the architecture.</li>
<li>Options: 9800 appliance, 9800-CL virtual, embedded wireless, SD-Access fabric wireless, Meraki cloud-managed.</li>
<li>Big campus means appliance in SSO HA; small site may use embedded; fabric building uses fabric wireless.</li>
<li>Branches over a WAN usually need FlexConnect so they survive WAN failure.</li>
<li>Virtual controllers need reserved CPU, memory and the right template.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap Wi-Fi network jis wired aur wireless infrastructure par khada hota hai, usko design karna seekhoge, bilkul waise jaise Cisco ENWLSD 300-425 exam poochta hai: aapko customer, uski sites, devices aur limits di jaati hain, aur aapko design chunna aur justify karna hota hai. Hum cover karenge architecture choice, AP modes aur switching, FlexConnect branches, controller placement aur sizing, access-switch power aur uplinks, WLAN design aur QoS, security, AAA, DHCP aur DNS, Cisco Catalyst Center assurance, aur outdoor mesh. <b>Prerequisites:</b> aapko pata ho ki SSID, VLAN, access point (AP) aur wireless LAN controller (WLC) kya hote hain, aur aap simple network diagram padh sakte ho. Design ka experience zaroori nahi hai.</p>

<h3>Case: Kestrel Foods</h3>
<p>Kestrel Foods ek fictional food distributor hai. Iska ek head-office campus hai jahan har floor par 420 users hain, ek bilkul naya tower hai jise IT team SD-Access fabric banana chahti hai, 35 chhote branch depots hain (har ek mein 5 se 8 AP, head office se 20 Mbps WAN aur 60 ms round-trip time se jude), aur ek chhota trial site hai jo ek partner chalata hai aur jo koi equipment manage nahi karna chahta. CIO kehta hai: "Ek wireless platform, chalana aasan, aur WAN fail ho jaye to depot chalta rahe."</p>
<p>Dekho real design kaise shuru hota hai: pehle <b>requirements</b> (ek platform, WAN failure mein depot survive kare), phir <b>constraints</b> (20 Mbps WAN, 60 ms RTT, branch par kam IT), aur uske baad <b>options</b>. Beginners pehle product ka naam bol dete hain. Exam isko punish karta hai.</p>

<h3>Paanch architecture options</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Paanch wireless architecture options">
<rect x="10" y="10" width="116" height="62" rx="8" fill="#bae6fd"/><text x="68" y="34" text-anchor="middle" class="svg-ink" font-size="12">Appliance</text><text x="68" y="52" text-anchor="middle" class="svg-ink" font-size="12">C9800-80/-40/-L</text>
<rect x="136" y="10" width="116" height="62" rx="8" fill="#ddd6fe"/><text x="194" y="34" text-anchor="middle" class="svg-ink" font-size="12">Virtual</text><text x="194" y="52" text-anchor="middle" class="svg-ink" font-size="12">C9800-CL</text>
<rect x="262" y="10" width="116" height="62" rx="8" fill="#bbf7d0"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="12">Embedded</text><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">Catalyst switch par</text>
<rect x="388" y="10" width="116" height="62" rx="8" fill="#fde68a"/><text x="446" y="34" text-anchor="middle" class="svg-ink" font-size="12">SD-Access</text><text x="446" y="52" text-anchor="middle" class="svg-ink" font-size="12">fabric wireless</text>
<ellipse cx="572" cy="41" rx="60" ry="31" fill="#fed7aa"/><text x="572" y="38" text-anchor="middle" class="svg-ink" font-size="12">Meraki</text><text x="572" y="54" text-anchor="middle" class="svg-ink" font-size="12">cloud</text>
<line x1="68" y1="72" x2="68" y2="150" stroke="#64748b"/><line x1="194" y1="72" x2="194" y2="150" stroke="#64748b"/><line x1="320" y1="72" x2="320" y2="150" stroke="#64748b"/><line x1="446" y1="72" x2="446" y2="150" stroke="#64748b"/><line x1="572" y1="72" x2="572" y2="150" stroke="#64748b" stroke-dasharray="4 3"/>
<circle cx="68" cy="165" r="14" fill="#e2e8f0" stroke="#64748b"/><text x="68" y="169" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<circle cx="194" cy="165" r="14" fill="#e2e8f0" stroke="#64748b"/><text x="194" y="169" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<circle cx="320" cy="165" r="14" fill="#e2e8f0" stroke="#64748b"/><text x="320" y="169" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<circle cx="446" cy="165" r="14" fill="#e2e8f0" stroke="#64748b"/><text x="446" y="169" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<circle cx="572" cy="165" r="14" fill="#e2e8f0" stroke="#64748b"/><text x="572" y="169" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<text x="68" y="205" text-anchor="middle" class="svg-muted" font-size="11">Bada campus</text><text x="194" y="205" text-anchor="middle" class="svg-muted" font-size="11">Data center, cloud</text><text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="11">Chhota site</text><text x="446" y="205" text-anchor="middle" class="svg-muted" font-size="11">Naya tower</text><text x="572" y="205" text-anchor="middle" class="svg-muted" font-size="11">Controller nahi</text>
<rect x="10" y="225" width="14" height="14" fill="#bae6fd"/><text x="30" y="237" class="svg-muted" font-size="11">Physical controller</text>
<rect x="160" y="225" width="14" height="14" fill="#ddd6fe"/><text x="180" y="237" class="svg-muted" font-size="11">Software controller</text>
<rect x="320" y="225" width="14" height="14" fill="#bbf7d0"/><text x="340" y="237" class="svg-muted" font-size="11">Switch ke andar</text>
<rect x="470" y="225" width="14" height="14" fill="#fde68a"/><text x="490" y="237" class="svg-muted" font-size="11">Fabric</text>
<text x="10" y="260" class="svg-muted" font-size="11">Dashed line = cloud se management, data local rehta hai</text>
</svg><p class="cap">Paanch choices. Har ek alag size aur operating-model problem solve karta hai.</p></div>

<table class="cmp"><tr><th>Option</th><th>Kiske liye best</th><th>Trade-off</th></tr>
<tr><td><b>Catalyst 9800 appliance</b> (C9800-80, C9800-40, C9800-L)</td><td>Campus jahan sau-hazaar APs hain, HA pair, high throughput</td><td>Hardware kharidna, rack karna aur patch karna padta hai; capacity model se fixed hai</td></tr>
<tr><td><b>Catalyst 9800-CL virtual</b></td><td>Private cloud ya public cloud, tez rollout, branches jinhe paas ka controller chahiye</td><td>Performance us resource par depend karti hai jo aap hypervisor mein dete ho</td></tr>
<tr><td><b>Catalyst 9000 switch par Embedded Wireless Controller</b> (9100-series AP par bhi EWC)</td><td>Chhote sites jo alag controller box nahi chahte</td><td>AP aur client scale kam; full 9800 se kam features</td></tr>
<tr><td><b>SD-Access fabric wireless</b></td><td>Wo buildings jo pehle se SD-Access fabric hain aur Catalyst Center se manage hoti hain</td><td>Poora fabric chahiye; design aur licensing effort zyada</td></tr>
<tr><td><b>Meraki cloud-managed</b></td><td>Lean IT team, bahut saare chhote sites, sirf dashboard se operation</td><td>Management plane aur feature set Catalyst 9800 family se alag hai</td></tr>
</table>
<p>Commit karne se pehle current datasheet mein exact AP aur client limits check karo. Mota andaza: C9800-80 bada model hai, C9800-40 mid-range hai, C9800-L chhote aur medium sites ke liye hai, aur C9800-CL small, medium aur large templates mein aata hai.</p>

<h3>Kestrel ka decision</h3>
<div class="eg"><p><b>Requirement se design match.</b> (1) Head office, 420 AP aur growth ke saath lagbhag 600: data center mein <b>SSO high availability</b> mein C9800-40 ya C9800-80 ka pair. (2) Tower: SD-Access fabric wireless, kyunki wired side pehle se fabric hai, fabric-enabled 9800 ke saath. (3) 60 ms WAN wale 35 depots: wahi 9800 pair, APs <b>FlexConnect</b> mode mein taaki WAN girne par clients chalte rahein (chapter 2). (4) Partner trial site: Meraki cloud-managed, kyunki partner ke paas network staff nahi hai. CIO ka "ek platform" goal 98 percent APs ke liye poora hota hai; trial site ek documented exception hai.</p></div>

<h3>Sabse bada controller kyun nahi le lete?</h3>
<p>Kyunki design <b>fit</b> ka naam hai. 20-AP site ke liye bada appliance paisa aur power waste karta hai. 600 APs ke liye chhota embedded controller pehle din fail ho jata hai. Aur jo design sirf WAN up hone par chalta hai, wo CIO ke rule ko todta hai. Pick karne se pehle hamesha chaar cheezein check karo: <b>scale</b> (aaj aur teen saal baad ke APs aur clients), <b>traffic kahan jana chahiye</b> (central ya local), <b>failure behaviour</b> (WAN ya controller mar jaye to kya hoga), aur <b>kaun operate karega</b> (skilled team ya akela branch banda).</p>

<div class="warn"><p><b>Common mistake.</b> Controller ko hi poora design samajhna. Exam aapse access switch ports, PoE budget, VLANs, DHCP, AAA aur WAN bhi consider karwata hai, jo agle chapters hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Embedded wireless" ka matlab "sasta 9800 jisme same features hain" nahi hai. Embedded controller chhote sites ke liye hai, kam scale ke saath. Agar question mein sau-hazaar APs diye hain, to wo answer nahi hai.</p></div>

<div class="scn"><h4>Undersized virtual controller</h4><p>Kestrel ke engineers ne depots ke controller ke roop mein C9800-CL ka pilot kiya. Unhone small template ek aise host par deploy kiya jahan virtual CPUs dus aur virtual machines ke saath cores share karte the. Subah 08:00 baje, jab 35 depots mein forklifts aur scanners ek saath on hue, APs join nahi ho paaye, clients ko slow authentication dikhi, aur pilot Wi-Fi failure jaisa lagne laga. Wajah radios nahi, balki CPU ki kami se bhookha controller VM tha. Unhone VM ko template ke hisaab se dedicated resources par move kiya, template ko planned AP count ke hisaab se size kiya, aur ek HA peer joda.</p><p><b>Lesson:</b> virtual controller utna hi achha hai jitne resources aap uske liye reserve karte ho. Size datasheet se karo, ummeed se nahi.</p></div>

<div class="iv"><p class="q">"Customer ke paas campus, 30 branches aur ek naya SD-Access building hai. Aap kaunsa wireless architecture propose karoge?"</p><p>Strong answer: pehle requirements dohrao, phir mix propose karo. Campus data center mein 9800 HA pair, branches ke liye WAN ke upar FlexConnect, SD-Access building ke liye fabric wireless, aur Meraki sirf tab mention karo jab kisi site par IT staff na ho. Har choice ko scale, traffic path aur failure behaviour se justify karo, aur batao ki datasheet mein kya verify karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle requirements aur constraints, phir architecture choose karo.</li>
<li>Options: 9800 appliance, 9800-CL virtual, embedded wireless, SD-Access fabric wireless, Meraki cloud-managed.</li>
<li>Bada campus matlab SSO HA mein appliance; chhota site embedded use kar sakta hai; fabric building fabric wireless use karti hai.</li>
<li>WAN ke upar branches ko aam taur par FlexConnect chahiye taaki WAN failure survive ho.</li>
<li>Virtual controllers ko reserved CPU, memory aur sahi template chahiye.</li>
</ul></div>
`}};export{e as default};