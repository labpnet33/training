var e=e=>`<div class="dia"><svg viewBox="0 0 640 350" role="img" aria-label="`+e.alt+`"><rect x="90" y="10" width="170" height="34" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="175" y="32" text-anchor="middle" class="svg-ink" font-size="13">`+e.nx+` A</text><rect x="380" y="10" width="170" height="34" rx="6" fill="#bbf7d0" stroke="#64748b"/><text x="465" y="32" text-anchor="middle" class="svg-ink" font-size="13">`+e.nx+` B</text><line x1="175" y1="44" x2="175" y2="85" stroke="#64748b"/><line x1="465" y1="44" x2="465" y2="85" stroke="#64748b"/><line x1="175" y1="44" x2="465" y2="85" stroke="#64748b" stroke-dasharray="4 3"/><line x1="465" y1="44" x2="175" y2="85" stroke="#64748b" stroke-dasharray="4 3"/><rect x="90" y="85" width="170" height="42" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="175" y="104" text-anchor="middle" class="svg-ink" font-size="13">FI-A</text><rect x="380" y="85" width="170" height="42" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="465" y="104" text-anchor="middle" class="svg-ink" font-size="13">FI-B</text><g fill="#64748b"><rect x="104" y="114" width="10" height="8"/><rect x="122" y="114" width="10" height="8"/><rect x="140" y="114" width="10" height="8"/><rect x="158" y="114" width="10" height="8"/><rect x="176" y="114" width="10" height="8"/><rect x="194" y="114" width="10" height="8"/><rect x="212" y="114" width="10" height="8"/><rect x="230" y="114" width="10" height="8"/><rect x="394" y="114" width="10" height="8"/><rect x="412" y="114" width="10" height="8"/><rect x="430" y="114" width="10" height="8"/><rect x="448" y="114" width="10" height="8"/><rect x="466" y="114" width="10" height="8"/><rect x="484" y="114" width="10" height="8"/><rect x="502" y="114" width="10" height="8"/><rect x="520" y="114" width="10" height="8"/></g><line x1="260" y1="106" x2="380" y2="106" stroke="#0369a1" stroke-width="2"/><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">L1 / L2</text><rect x="30" y="170" width="370" height="120" rx="6" fill="#f1f5f9" stroke="#64748b"/><text x="40" y="188" class="svg-ink" font-size="13">`+e.ch+`</text><rect x="50" y="198" width="150" height="22" rx="4" fill="#7dd3fc" stroke="#64748b"/><text x="125" y="214" text-anchor="middle" class="svg-ink" font-size="12">`+e.iom+` A</text><rect x="220" y="198" width="150" height="22" rx="4" fill="#7dd3fc" stroke="#64748b"/><text x="295" y="214" text-anchor="middle" class="svg-ink" font-size="12">`+e.iom+` B</text><line x1="150" y1="127" x2="125" y2="198" stroke="#0369a1" stroke-width="2"/><line x1="430" y1="127" x2="295" y2="198" stroke="#0369a1" stroke-width="2"/><g fill="#ddd6fe" stroke="#64748b"><rect x="42" y="232" width="36" height="46"/><rect x="85" y="232" width="36" height="46"/><rect x="128" y="232" width="36" height="46"/><rect x="171" y="232" width="36" height="46"/><rect x="214" y="232" width="36" height="46"/><rect x="257" y="232" width="36" height="46"/><rect x="300" y="232" width="36" height="46"/><rect x="343" y="232" width="36" height="46"/></g><text x="210" y="308" text-anchor="middle" class="svg-muted" font-size="12">`+e.bl+`</text><rect x="470" y="196" width="150" height="34" rx="4" fill="#ddd6fe" stroke="#64748b"/><line x1="480" y1="213" x2="610" y2="213" stroke="#64748b"/><text x="545" y="250" text-anchor="middle" class="svg-ink" font-size="12">`+e.cs+`</text><line x1="240" y1="127" x2="500" y2="196" stroke="#0369a1" stroke-width="2"/><line x1="500" y1="127" x2="590" y2="196" stroke="#0369a1" stroke-width="2"/><rect x="30" y="322" width="14" height="14" fill="#bbf7d0" stroke="#64748b"/><text x="50" y="334" class="svg-muted" font-size="12">`+e.l1+`</text><rect x="190" y="322" width="14" height="14" fill="#bae6fd" stroke="#64748b"/><text x="210" y="334" class="svg-muted" font-size="12">`+e.l2+`</text><rect x="380" y="322" width="14" height="14" fill="#ddd6fe" stroke="#64748b"/><text x="400" y="334" class="svg-muted" font-size="12">`+e.l3+`</text></svg><p class="cap">`+e.cap+`</p></div>`,t={id:`ucs-architecture`,h:{en:`UCS architecture: fabric interconnects, chassis and server families`,hi:`UCS architecture: fabric interconnects, chassis aur server families`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn to design the compute layer of a data center the way the Cisco 300-610 DCID exam expects: choose between blade, rack and X-Series servers, size the fabric interconnects, pick the management model (UCS Manager or Intersight), build service profiles and policies, calculate oversubscription, connect servers to LAN and SAN, and decide where HyperFlex, bare-metal and GPU servers fit. Every chapter starts with a customer case, because DCID tests design judgement, not commands.</p>
<p><b>Prerequisites.</b> The data center basics from the introduction module (racks, power, east-west traffic), and a rough idea of VLANs, port-channels and Fibre Channel from the earlier network and storage modules. No UCS experience is needed.</p>

<h3>The customer case: Harbourline Logistics</h3>
<p>Harbourline is a freight and warehouse company with one main data center. It runs 220 ageing rack servers, 1,800 VMs on VMware vSphere, and two Oracle databases on bare metal. Growth plan: 320 hosts in three years. The IT team has four people. Upstream is a pair of Nexus 9300 switches with 25G server ports. Budget is fixed, and the board wants 99.99% availability for the order system.</p>
<p><b>Requirements:</b> stateless servers so a failed host is replaced in minutes; one management point; a simple growth path; no single point of failure. <b>Constraints:</b> 12 racks with 8 kW each, no new cabling trays, and the same cabling team that built the old room.</p>

<h3>Beginner view: what a UCS domain is</h3>
<p>A traditional rack server needs its own top-of-rack switch ports, its own management cable and its own BIOS and firmware handling. Cisco Unified Computing System (<b>UCS</b>) changes that by pulling the network and management out of each server and into a shared pair of devices. A <b>UCS domain</b> is two <b>fabric interconnects (FI)</b> plus everything that connects to them. The FIs are switches that also run the management software, so the whole domain is one managed system.</p>
<dl class="terms">
<dt>Fabric interconnect (FI)</dt><dd>The top of the domain. Carries LAN and SAN traffic, and hosts UCS Manager or the Intersight connection. Always deployed as a pair: FI-A and FI-B.</dd>
<dt>IOM / FEX</dt><dd>I/O module inside a 5108 chassis; it extends the FI to the blades, like a remote line card. X-Series chassis use an intelligent fabric module (IFM) for the same job.</dd>
<dt>Chassis</dt><dd>Shared enclosure with power, fans and IOMs. The 5108 is 6RU with 8 half-width slots. The X9508 is 7U with 8 compute slots and front-loaded nodes.</dd>
<dt>VIC</dt><dd>Virtual Interface Card, the adapter in every server. It presents many virtual NICs and HBAs to the OS.</dd>
</dl>
`+e({alt:`UCS domain architecture`,nx:`Nexus`,ch:`Chassis (5108 or X9508)`,iom:`IOM / IFM`,bl:`8 compute slots: B-series or X-series nodes`,cs:`C-series rack server`,l1:`Upstream LAN`,l2:`Fabric (FI, IOM)`,l3:`Compute`,cap:`One UCS domain: two fabric interconnects, one or more chassis, and optional direct-connect rack servers. Fabric A and fabric B never merge.`})+`
<h3>Fabric interconnect models you must recognise</h3>
<table class="cmp"><tr><th>Model</th><th>Ports</th><th>Design note</th></tr>
<tr><td><b>6454</b></td><td>54 ports: 48 x 10/25G, 6 x 40/100G</td><td>Ports 1-8 can be unified (FC 8/16/32G). Good for 2 to 6 chassis.</td></tr>
<tr><td><b>64108</b></td><td>108 ports: 96 x 10/25G, 12 x 40/100G</td><td>Ports 1-16 can be unified. Larger domains, more direct-connect servers.</td></tr>
<tr><td><b>6536</b></td><td>36 x 40/100G, breakout to 10/25G</td><td>Highest bandwidth; 100G uplinks; the last four ports can carry FC through breakout.</td></tr>
</table>

<h3>B-series, C-series or X-Series?</h3>
<table class="cmp"><tr><th>Family</th><th>Strength</th><th>Weakness</th><th>Fits</th></tr>
<tr><td><b>B-series</b> (5108)</td><td>Dense, shared cabling, mature UCS Manager support</td><td>Chassis limits; PCIe expansion is restricted</td><td>Virtualisation farms</td></tr>
<tr><td><b>C-series</b></td><td>Local disks, GPUs, PCIe slots; flexible form factors</td><td>One cable set per server; more cabling</td><td>Databases, GPU, edge, storage-heavy</td></tr>
<tr><td><b>X-Series</b> (X9508)</td><td>Modular, future-proof midplane-less design, PCIe node X440p for GPUs, managed in Intersight</td><td>Intersight Managed Mode only</td><td>New builds that want one platform</td></tr>
</table>

<h3>Options and trade-offs for Harbourline</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td>A. Keep rack servers plus ToR switches</td><td>No new learning</td><td>220 cable sets, per-server firmware work, no stateless recovery</td></tr>
<tr><td>B. 5108 chassis with B-series</td><td>Mature, UCS Manager available</td><td>Platform is older; limited GPU path</td></tr>
<tr><td>C. X9508 chassis, 6454 FIs, C-series for Oracle</td><td>Fewer cables, current platform, GPU path, Intersight policies</td><td>Team must learn Intersight</td></tr>
</table>
<div class="eg"><p><b>Chosen design.</b> Option C. Two 6454 FIs, three X9508 chassis with 25G IFMs (24 compute slots, each node 2 sockets), four direct-connected C-series rack servers for the Oracle pair and a future GPU box. Each IFM connects with 4 x 25G links to its FI. FI port budget per fabric: 3 chassis x 4 links = 12, plus 4 C-series = 16 server ports, leaving 32 free. Justification: consolidates 220 old hosts into about 24 dense nodes plus the rack servers, uses the free ports for growth to 320 hosts, and removes per-server switch cabling.</p></div>

<div class="warn"><p><b>Post-mortem: the single-FI shortcut.</b> The first quote used one FI to save budget. During the first firmware upgrade the whole domain went down because there was no second fabric to carry traffic. The corrected design bought both FIs. A UCS domain without two FIs is not a redundant design.</p></div>
<div class="exam"><p><b>Exam trap.</b> FI-A and FI-B are not a vPC pair and do not merge their data planes. Redundancy comes from dual fabrics, with the server adapter connected to both. They are joined only by L1/L2 cluster links for management state.</p></div>

<div class="scn"><h4>The chassis that ran at one quarter speed</h4><p>A customer reused two old IOMs with a new 25G FI. Discovery worked, but each blade slot only got 10G lanes, and the 8 uplink ports of the IOM were 10G. Monitoring showed 70 percent utilisation on the links during backups. The engineer checked IOM model and link speed in the chassis inventory and replaced them with the 25G generation.</p><p><b>Lesson:</b> design the FI, IOM and VIC generations together. The slowest element sets the path speed.</p></div>
<div class="iv"><p class="q">"Why do we deploy UCS fabric interconnects instead of a switch per rack?"</p><p>Strong answer: the FIs give one management point, one policy model and fewer cables, because chassis connect through IOMs. Servers become stateless through service profiles. Mention that redundancy is two independent fabrics, and say that the trade-off is dependence on FI port counts and licensing.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A UCS domain is a pair of FIs plus chassis and rack servers, managed as one system.</li>
<li>FI-A and FI-B are independent fabrics joined by L1/L2 links; both are required.</li>
<li>6454, 64108 and 6536 are the current FI models; pick by port count and speed.</li>
<li>B-series for dense virtualisation, C-series for GPUs and local disks, X-Series for modern modular builds.</li>
<li>Design FI, IOM/IFM and VIC speeds together.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap data center ki compute layer ko aise design karna seekhoge jaisa Cisco 300-610 DCID exam expect karta hai: blade, rack aur X-Series servers mein se choose karna, fabric interconnects ka size nikalna, management model (UCS Manager ya Intersight) chunna, service profiles aur policies banana, oversubscription calculate karna, servers ko LAN aur SAN se connect karna, aur decide karna ki HyperFlex, bare-metal aur GPU servers kahan fit hote hain. Har chapter ek customer case se shuru hota hai, kyunki DCID design judgement test karta hai, commands nahi.</p>
<p><b>Prerequisites.</b> Introduction module ki data center basics (racks, power, east-west traffic), aur pehle ke network aur storage modules se VLANs, port-channels aur Fibre Channel ka rough idea. UCS ka koi experience nahi chahiye.</p>

<h3>Customer case: Harbourline Logistics</h3>
<p>Harbourline ek freight aur warehouse company hai jiska ek main data center hai. Usme 220 purane rack servers, VMware vSphere par 1,800 VMs, aur bare metal par do Oracle databases chalte hain. Growth plan: teen saal mein 320 hosts. IT team mein chaar log hain. Upstream mein Nexus 9300 switches ka pair hai jisme 25G server ports hain. Budget fixed hai, aur board order system ke liye 99.99% availability chahta hai.</p>
<p><b>Requirements:</b> stateless servers taaki failed host minutes mein replace ho; ek management point; simple growth path; koi single point of failure nahi. <b>Constraints:</b> 12 racks, har rack 8 kW, naye cabling trays nahi, aur wahi cabling team jisne purana room banaya tha.</p>

<h3>Beginner view: UCS domain kya hai</h3>
<p>Traditional rack server ko apne top-of-rack switch ports, apni management cable aur apna BIOS aur firmware handling chahiye. Cisco Unified Computing System (<b>UCS</b>) network aur management ko har server se nikaal kar do shared devices ke pair mein le jaata hai. <b>UCS domain</b> matlab do <b>fabric interconnects (FI)</b> plus jo kuch unse connect hai. FIs aise switches hain jo management software bhi chalate hain, isliye poora domain ek managed system hota hai.</p>
<dl class="terms">
<dt>Fabric interconnect (FI)</dt><dd>Domain ka top. LAN aur SAN traffic carry karta hai, aur UCS Manager ya Intersight connection host karta hai. Hamesha pair mein lagta hai: FI-A aur FI-B.</dd>
<dt>IOM / FEX</dt><dd>5108 chassis ke andar I/O module; yeh FI ko blades tak extend karta hai, remote line card ki tarah. X-Series chassis mein yahi kaam intelligent fabric module (IFM) karta hai.</dd>
<dt>Chassis</dt><dd>Shared enclosure jisme power, fans aur IOMs hote hain. 5108 6RU ka hai aur 8 half-width slots hain. X9508 7U ka hai, 8 compute slots, front-loaded nodes.</dd>
<dt>VIC</dt><dd>Virtual Interface Card, har server ka adapter. Yeh OS ko bahut saare virtual NICs aur HBAs dikhata hai.</dd>
</dl>
`+e({alt:`UCS domain architecture`,nx:`Nexus`,ch:`Chassis (5108 ya X9508)`,iom:`IOM / IFM`,bl:`8 compute slots: B-series ya X-series nodes`,cs:`C-series rack server`,l1:`Upstream LAN`,l2:`Fabric (FI, IOM)`,l3:`Compute`,cap:`Ek UCS domain: do fabric interconnects, ek ya zyada chassis, aur optional direct-connect rack servers. Fabric A aur fabric B kabhi merge nahi hote.`})+`
<h3>FI models jo aapko pehchanne hain</h3>
<table class="cmp"><tr><th>Model</th><th>Ports</th><th>Design note</th></tr>
<tr><td><b>6454</b></td><td>54 ports: 48 x 10/25G, 6 x 40/100G</td><td>Ports 1-8 unified ho sakte hain (FC 8/16/32G). 2 se 6 chassis ke liye achha.</td></tr>
<tr><td><b>64108</b></td><td>108 ports: 96 x 10/25G, 12 x 40/100G</td><td>Ports 1-16 unified ho sakte hain. Bade domains, zyada direct-connect servers.</td></tr>
<tr><td><b>6536</b></td><td>36 x 40/100G, 10/25G tak breakout</td><td>Sabse zyada bandwidth; 100G uplinks; aakhri chaar ports breakout se FC carry kar sakte hain.</td></tr>
</table>

<h3>B-series, C-series ya X-Series?</h3>
<table class="cmp"><tr><th>Family</th><th>Strength</th><th>Weakness</th><th>Kahan fit</th></tr>
<tr><td><b>B-series</b> (5108)</td><td>Dense, shared cabling, UCS Manager ka mature support</td><td>Chassis limits; PCIe expansion limited</td><td>Virtualisation farms</td></tr>
<tr><td><b>C-series</b></td><td>Local disks, GPUs, PCIe slots; flexible form factors</td><td>Har server ka alag cable set; zyada cabling</td><td>Databases, GPU, edge, storage-heavy</td></tr>
<tr><td><b>X-Series</b> (X9508)</td><td>Modular, future-proof design, GPUs ke liye X440p PCIe node, Intersight se managed</td><td>Sirf Intersight Managed Mode</td><td>Naye builds jo ek platform chahte hain</td></tr>
</table>

<h3>Harbourline ke liye options aur trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td>A. Rack servers plus ToR switches rakho</td><td>Naya seekhna nahi</td><td>220 cable sets, per-server firmware kaam, stateless recovery nahi</td></tr>
<tr><td>B. 5108 chassis ke saath B-series</td><td>Mature, UCS Manager available</td><td>Platform purana; GPU path limited</td></tr>
<tr><td>C. X9508 chassis, 6454 FIs, Oracle ke liye C-series</td><td>Kam cables, current platform, GPU path, Intersight policies</td><td>Team ko Intersight seekhna hoga</td></tr>
</table>
<div class="eg"><p><b>Chosen design.</b> Option C. Do 6454 FIs, teen X9508 chassis 25G IFMs ke saath (24 compute slots, har node 2 sockets), Oracle pair aur future GPU box ke liye chaar direct-connected C-series rack servers. Har IFM apne FI se 4 x 25G links se jaata hai. Har fabric ka FI port budget: 3 chassis x 4 links = 12, plus 4 C-series = 16 server ports, 32 free bachte hain. Justification: 220 purane hosts ko lagbhag 24 dense nodes plus rack servers mein consolidate karta hai, free ports 320 hosts tak growth ke kaam aate hain, aur per-server switch cabling hat jaati hai.</p></div>

<div class="warn"><p><b>Post-mortem: single-FI shortcut.</b> Pehle quote mein budget bachane ke liye ek hi FI tha. Pehle firmware upgrade ke dauraan poora domain down ho gaya kyunki traffic carry karne ke liye doosra fabric nahi tha. Corrected design mein dono FIs khareede gaye. Do FIs ke bina UCS domain redundant design nahi hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> FI-A aur FI-B vPC pair nahi hain aur apne data planes merge nahi karte. Redundancy dual fabrics se aati hai, aur server adapter dono se connected hota hai. Dono sirf management state ke liye L1/L2 cluster links se jude hote hain.</p></div>

<div class="scn"><h4>Chassis jo ek-chauthai speed par chala</h4><p>Ek customer ne do purane IOMs naye 25G FI ke saath reuse kiye. Discovery ho gayi, lekin har blade slot ko sirf 10G lanes mile, aur IOM ke 8 uplink ports 10G the. Backups ke dauraan monitoring mein links par 70 percent utilisation dikha. Engineer ne chassis inventory mein IOM model aur link speed check kiya aur unhe 25G generation se replace kar diya.</p><p><b>Seekh:</b> FI, IOM aur VIC generations ko saath design karo. Sabse slow element path ki speed decide karta hai.</p></div>
<div class="iv"><p class="q">"Hum har rack ke switch ki jagah UCS fabric interconnects kyun lagate hain?"</p><p>Strong answer: FIs ek management point, ek policy model aur kam cables dete hain, kyunki chassis IOMs ke through connect hote hain. Servers service profiles se stateless ho jaate hain. Batao ki redundancy do independent fabrics se aati hai, aur trade-off FI port counts aur licensing par dependence hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>UCS domain matlab FIs ka pair plus chassis aur rack servers, ek system ki tarah managed.</li>
<li>FI-A aur FI-B L1/L2 links se jude independent fabrics hain; dono zaroori hain.</li>
<li>6454, 64108 aur 6536 current FI models hain; port count aur speed se choose karo.</li>
<li>Dense virtualisation ke liye B-series, GPUs aur local disks ke liye C-series, modern modular builds ke liye X-Series.</li>
<li>FI, IOM/IFM aur VIC speeds ko saath design karo.</li>
</ul></div>
`}};export{t as default};