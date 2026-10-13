var e={id:`requirements-to-design`,h:{en:`From requirements to design: reading the brief`,hi:`Requirements se design tak: brief ko padhna`},body:{en:`
<p>Before an architect pours a single bag of cement, she reads the client's brief three times, walks the plot and draws the plan on paper. Networks deserve the same respect. Most failed builds, in the lab and in real life, did not fail on a typo. They failed because someone typed commands before they understood what the business asked for. This chapter is the first step of the capstone method: turn a paragraph of requirements into a design you can build, verify and defend.</p>
<p><b>What you will learn:</b> how to extract facts from a brief, draw a topology with interface names, decide VLANs, subnets, routing and redundancy, and write the design down before you touch a device. <b>Prerequisites:</b> the CCNA topics you studied earlier (VLANs, inter-VLAN routing, OSPF, NAT, ACLs, FHRP, IPv6). Those chapters teach each feature. This module teaches the method that joins them.</p>

<h3>Step 1: read the brief twice, mark two kinds of words</h3>
<p>On the first read, underline <b>nouns</b>: sites, user counts, servers, links, providers. On the second read, underline <b>verbs of obligation</b>: must, only, never, within, at least. Nouns give you the size of the network. Obligation words give you the constraints, and constraints are what get marked in an exam.</p>
<div class="tbl"><table>
<tr><th>Phrase in the brief</th><th>Design decision it forces</th></tr>
<tr><td>"120 users in Sales, 40 in Finance"</td><td>Two VLANs, two subnets sized for growth (next chapter)</td></tr>
<tr><td>"Finance must not reach Guest"</td><td>An ACL or no routing between them, placed close to the source</td></tr>
<tr><td>"Branch has one ISP link"</td><td>Static default route is enough; no redundancy needed there</td></tr>
<tr><td>"HQ must survive a router failure"</td><td>Two gateways with HSRP, two uplinks, floating static route</td></tr>
<tr><td>"Admins connect remotely, securely"</td><td>SSH only, local user, VTY access class, no Telnet</td></tr>
<tr><td>"Users share one public IP"</td><td>PAT (NAT overload) on the edge router</td></tr>
</table></div>

<h3>Step 2: draw the topology before you type</h3>
<p>Draw boxes for devices, lines for links, and write the <b>interface name on both ends</b> of every line. Mark which links are trunks, which are routed, and where the ISP begins. This drawing is your map for the whole build, for verification and for troubleshooting. If you cannot draw it, you do not understand it yet.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Sample capstone topology">
<rect x="20" y="70" width="110" height="50" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="75" y="92" text-anchor="middle" class="svg-ink" font-size="13">BR-R1</text><text x="75" y="110" text-anchor="middle" class="svg-muted" font-size="11">Branch router</text>
<rect x="260" y="70" width="110" height="50" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="315" y="92" text-anchor="middle" class="svg-ink" font-size="13">HQ-R1</text><text x="315" y="110" text-anchor="middle" class="svg-muted" font-size="11">HQ edge</text>
<rect x="500" y="70" width="110" height="50" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="555" y="92" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="555" y="110" text-anchor="middle" class="svg-muted" font-size="11">198.51.100.0/30</text>
<rect x="260" y="140" width="110" height="36" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="315" y="163" text-anchor="middle" class="svg-ink" font-size="13">HQ-SW1 (trunk)</text>
<line x1="130" y1="95" x2="260" y2="95" stroke="#64748b" stroke-width="2"/><text x="195" y="86" text-anchor="middle" class="svg-accent" font-size="11">WAN 10.0.0.0/30</text>
<line x1="370" y1="95" x2="500" y2="95" stroke="#64748b" stroke-width="2"/><text x="435" y="86" text-anchor="middle" class="svg-accent" font-size="11">Gi0/1 to Gi0/0</text>
<line x1="315" y1="120" x2="315" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="75" y="145" text-anchor="middle" class="svg-muted" font-size="11">LAN 10.2.10.0/24</text>
<text x="450" y="165" text-anchor="middle" class="svg-muted" font-size="11">VLAN 10 Sales, VLAN 20 Finance</text>
</svg><p class="cap">A first sketch: every link has a name and a subnet before any command is typed.</p></div>

<h3>Step 3: VLANs, one per function and security zone</h3>
<p>Create a VLAN when a group of users has a different <b>job or trust level</b>: Sales, Finance, Guest, Voice, Management. Do not create one per floor just because the building has floors. Give every VLAN a number from a plan, a name, and exactly one subnet. Keep an unused VLAN as a parking lot for unused ports, and keep VLAN 1 empty of users.</p>

<h3>Step 4: subnets and routing</h3>
<p>Size each subnet from the user count plus growth (the next chapter shows the arithmetic). Then choose routing by asking one question per router: how many neighbours can it learn routes from? A stub site with a single exit needs only a <b>default route</b>. Two or more routers inside the company that must learn each other's LANs need <b>OSPF</b>. The Internet exit is a <b>default route</b>, originated into OSPF when other routers need it.</p>

<h3>Step 5: redundancy only where the brief asks</h3>
<p>Walk each path and ask: if this box or cable dies, who loses service? Add redundancy where the brief says "must survive" and write the cost beside it: HSRP means two routers and a virtual IP, dual ISP means a floating static with a higher administrative distance. Extra redundancy nobody asked for is extra faults to troubleshoot.</p>

<h3>Step 6: security and management</h3>
<p>List who may talk to whom, then turn each rule into one control: an ACL, a port-security setting, DHCP snooping, or simply no route. Add the device-hardening basics every time: <code>service password-encryption</code>, <code>enable secret</code>, SSH with a local user, a banner.</p>

<div class="eg"><p><b>Worked example.</b> Brief: "Pune HQ has 120 Sales users and 40 Finance users. The Nashik branch has 25 staff. Finance must not reach the Internet directly. HQ has one ISP; all staff share one public IP. Admins use SSH." Reading it twice gives: 3 LAN subnets (Sales, Finance, Branch), 2 VLANs at HQ (10 Sales, 20 Finance), 1 router-on-a-stick gateway at HQ, 1 branch router with a WAN /30, OSPF between HQ and branch, a default route to the ISP originated into OSPF, PAT for the Internet, an extended ACL denying Finance to outside, and SSH on the VTY lines. The design fits on half a page, and every line traces back to a phrase in the brief.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Starting to type before the drawing exists. Designing for what you assume instead of what is written. Inventing requirements ("it should probably also have a backup link"). Using one VLAN for everything because it is easier, and then discovering the ACL has nothing to separate.</p></div>

<div class="exam"><p><b>Exam traps.</b> The question text is the specification. A device name, VLAN number or subnet written in the question is not a suggestion. A word like "only" or "must not" is usually worth marks and is the easiest to miss. If the brief says "use the first usable address as the gateway", every host in the answer key expects it.</p></div>

<div class="scn"><h4>The plan on a napkin saved a night shift</h4><p>A system integrator was told to bring up a new Pune office over a weekend. The engineer spent 40 minutes drawing the topology with interface names and a subnet per link, and pasted it into the ticket. At 2 a.m. a colleague who had never seen the site took over, read the drawing, and found within minutes that the uplink had been cabled to Gi0/2 instead of Gi0/1 as drawn. Without the sketch he would have debugged OSPF for an hour.</p><p><b>Lesson:</b> a drawing with interface names is the cheapest troubleshooting tool you will ever make.</p></div>

<div class="iv"><p class="q">"You get a one-page requirement for a new site. What do you do first?"</p><p>Strong answer: read it twice, list sites, users, services and the must/never constraints, draw a topology with interface names and subnets, decide VLANs, addressing, routing and redundancy, write the design down, and only then start configuring in layers with verification after each one.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read the brief twice: nouns for size, obligation words for constraints.</li>
<li>Draw the topology with interface names on both ends before typing.</li>
<li>One VLAN per function or trust level, one subnet per VLAN.</li>
<li>Stub sites use a default route; multi-router cores use OSPF.</li>
<li>Add redundancy only where the brief demands it, and note its cost.</li>
</ul></div>
`,hi:`
<p>Architect cement ka ek bag daalne se pehle client ka brief teen baar padhta hai, plot par chalta hai aur plan kaagaz par banata hai. Network ko bhi yahi izzat milni chahiye. Zyadatar failed builds, lab mein bhi aur real life mein bhi, kisi typo se fail nahi hue. Woh isliye fail hue kyunki kisi ne commands type kar diye jabki use samajh hi nahi aaya tha ki business ne maanga kya hai. Yeh chapter capstone method ka pehla step hai: requirements ke ek paragraph ko aisa design banao jise aap build, verify aur defend kar sako.</p>
<p><b>Is chapter mein aap seekhoge:</b> brief se facts kaise nikalte hain, interface names ke saath topology kaise banate hain, VLANs, subnets, routing aur redundancy kaise decide karte hain, aur device chhune se pehle design likhna. <b>Prerequisites:</b> pehle ke CCNA topics (VLANs, inter-VLAN routing, OSPF, NAT, ACLs, FHRP, IPv6). Un chapters ne har feature sikhaya. Yeh module woh method sikhata hai jo sabko jodta hai.</p>

<h3>Step 1: brief do baar padho, do tarah ke words mark karo</h3>
<p>Pehli read mein <b>nouns</b> underline karo: sites, user counts, servers, links, providers. Doosri read mein <b>obligation wale verbs</b> underline karo: must, only, never, within, at least. Nouns se network ka size pata chalta hai. Obligation words se constraints milte hain, aur exam mein marks constraints par hi lagte hain.</p>
<div class="tbl"><table>
<tr><th>Brief ka phrase</th><th>Isse kaunsa design decision banta hai</th></tr>
<tr><td>"120 users in Sales, 40 in Finance"</td><td>Do VLANs, growth ke hisaab se size kiye hue do subnets (agla chapter)</td></tr>
<tr><td>"Finance must not reach Guest"</td><td>ACL ya un dono ke beech routing nahi, source ke paas lagao</td></tr>
<tr><td>"Branch has one ISP link"</td><td>Static default route kaafi hai; wahan redundancy nahi chahiye</td></tr>
<tr><td>"HQ must survive a router failure"</td><td>HSRP ke saath do gateways, do uplinks, floating static route</td></tr>
<tr><td>"Admins connect remotely, securely"</td><td>Sirf SSH, local user, VTY access class, Telnet nahi</td></tr>
<tr><td>"Users share one public IP"</td><td>Edge router par PAT (NAT overload)</td></tr>
</table></div>

<h3>Step 2: type karne se pehle topology draw karo</h3>
<p>Devices ke liye boxes, links ke liye lines banao, aur har line ke <b>dono ends par interface name</b> likho. Mark karo kaunse links trunk hain, kaunse routed hain, aur ISP kahan se shuru hota hai. Yeh drawing poore build, verification aur troubleshooting ka map hai. Agar aap draw nahi kar sakte, matlab abhi samjhe nahi.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Sample capstone topology">
<rect x="20" y="70" width="110" height="50" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="75" y="92" text-anchor="middle" class="svg-ink" font-size="13">BR-R1</text><text x="75" y="110" text-anchor="middle" class="svg-muted" font-size="11">Branch router</text>
<rect x="260" y="70" width="110" height="50" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="315" y="92" text-anchor="middle" class="svg-ink" font-size="13">HQ-R1</text><text x="315" y="110" text-anchor="middle" class="svg-muted" font-size="11">HQ edge</text>
<rect x="500" y="70" width="110" height="50" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="555" y="92" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="555" y="110" text-anchor="middle" class="svg-muted" font-size="11">198.51.100.0/30</text>
<rect x="260" y="140" width="110" height="36" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="315" y="163" text-anchor="middle" class="svg-ink" font-size="13">HQ-SW1 (trunk)</text>
<line x1="130" y1="95" x2="260" y2="95" stroke="#64748b" stroke-width="2"/><text x="195" y="86" text-anchor="middle" class="svg-accent" font-size="11">WAN 10.0.0.0/30</text>
<line x1="370" y1="95" x2="500" y2="95" stroke="#64748b" stroke-width="2"/><text x="435" y="86" text-anchor="middle" class="svg-accent" font-size="11">Gi0/1 to Gi0/0</text>
<line x1="315" y1="120" x2="315" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="75" y="145" text-anchor="middle" class="svg-muted" font-size="11">LAN 10.2.10.0/24</text>
<text x="450" y="165" text-anchor="middle" class="svg-muted" font-size="11">VLAN 10 Sales, VLAN 20 Finance</text>
</svg><p class="cap">Pehla sketch: command type karne se pehle har link ka naam aur subnet maujood hai.</p></div>

<h3>Step 3: VLANs, har function aur security zone ke liye ek</h3>
<p>VLAN tab banao jab users ke ek group ka <b>kaam ya trust level</b> alag ho: Sales, Finance, Guest, Voice, Management. Sirf isliye har floor ka VLAN mat banao ki building mein floors hain. Har VLAN ko plan se number do, ek naam do, aur bilkul ek subnet. Unused ports ke liye ek unused VLAN parking lot rakho, aur VLAN 1 mein users mat rakho.</p>

<h3>Step 4: subnets aur routing</h3>
<p>Har subnet ka size user count plus growth se nikalo (arithmetic agle chapter mein hai). Phir har router ke liye ek sawal poochho: yeh kitne neighbours se routes seekh sakta hai? Single exit wale stub site ko sirf <b>default route</b> chahiye. Company ke andar do ya zyada routers jinhe ek-dusre ke LANs seekhne hain, unke liye <b>OSPF</b>. Internet exit ek <b>default route</b> hai, jise zaroorat padne par OSPF mein originate karte hain.</p>

<h3>Step 5: redundancy sirf wahan jahan brief maange</h3>
<p>Har path ko chalo aur poochho: yeh box ya cable mar gaya to kiski service jayegi? Redundancy wahan lagao jahan brief mein "must survive" likha ho, aur uski keemat saath likho: HSRP matlab do routers aur ek virtual IP, dual ISP matlab zyada administrative distance wala floating static. Jo redundancy kisi ne maangi nahi, woh extra faults hain jo aapko baad mein troubleshoot karne padenge.</p>

<h3>Step 6: security aur management</h3>
<p>Likho kaun kisse baat kar sakta hai, phir har rule ko ek control mein badlo: ACL, port-security setting, DHCP snooping, ya simply koi route nahi. Device hardening ke basics har baar lagao: <code>service password-encryption</code>, <code>enable secret</code>, local user ke saath SSH, ek banner.</p>

<div class="eg"><p><b>Worked example.</b> Brief: "Pune HQ mein 120 Sales users aur 40 Finance users hain. Nashik branch mein 25 staff hain. Finance Internet tak seedha nahi pahunchna chahiye. HQ ka ek ISP hai; saare staff ek public IP share karte hain. Admins SSH use karte hain." Do baar padhne se milta hai: 3 LAN subnets (Sales, Finance, Branch), HQ par 2 VLANs (10 Sales, 20 Finance), HQ par 1 router-on-a-stick gateway, branch par WAN /30 wala 1 router, HQ aur branch ke beech OSPF, ISP ka default route jo OSPF mein originate hota hai, Internet ke liye PAT, Finance ko outside se rokne wali extended ACL, aur VTY lines par SSH. Design aadhe page mein aa jata hai, aur har line brief ke kisi phrase tak trace hoti hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Drawing banne se pehle type karna shuru kar dena. Jo likha hai uski jagah jo aapne maan liya uske liye design karna. Requirements khud invent karna ("shayad ek backup link bhi hona chahiye"). Aasaani ke liye sab kuch ek VLAN mein rakhna, aur phir pata chalna ki ACL ke paas separate karne ko kuch hai hi nahi.</p></div>

<div class="exam"><p><b>Exam traps.</b> Question ka text hi specification hai. Question mein likha device name, VLAN number ya subnet suggestion nahi hai. "only" ya "must not" jaisa word aksar marks ka hota hai aur sabse aasaani se chhoot jata hai. Agar brief kehta hai "gateway ke liye first usable address use karo", to answer key mein har host wahi expect karta hai.</p></div>

<div class="scn"><h4>Napkin ka plan, raat ki shift bacha gaya</h4><p>Ek system integrator ko weekend mein naya Pune office up karna tha. Engineer ne 40 minute lagakar interface names aur har link ke subnet ke saath topology banayi aur ticket mein paste kar di. Raat 2 baje ek colleague, jisne site kabhi nahi dekhi thi, ne handover liya, drawing padhi aur kuch minutes mein pakad liya ki uplink drawing ke Gi0/1 ki jagah Gi0/2 par cable hua hai. Sketch na hota to woh ek ghanta OSPF debug karta.</p><p><b>Lesson:</b> interface names wali drawing aapka sabse sasta troubleshooting tool hai.</p></div>

<div class="iv"><p class="q">"Naye site ki one-page requirement mili hai. Sabse pehle kya karoge?"</p><p>Strong answer: do baar padhunga, sites, users, services aur must/never constraints list karunga, interface names aur subnets ke saath topology draw karunga, VLANs, addressing, routing aur redundancy decide karunga, design likhunga, aur phir layers mein configure karunga, har layer ke baad verification ke saath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Brief do baar padho: size ke liye nouns, constraints ke liye obligation words.</li>
<li>Type karne se pehle dono ends par interface names ke saath topology draw karo.</li>
<li>Har function ya trust level ke liye ek VLAN, har VLAN ke liye ek subnet.</li>
<li>Stub sites default route use karte hain; multi-router core OSPF.</li>
<li>Redundancy sirf wahan jahan brief maange, aur uski keemat note karo.</li>
</ul></div>
`}};export{e as default};