var e={id:`overview`,h:{en:`Layer 2 switching: what you will learn and the big picture`,hi:`Layer 2 switching: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how an EX switch running Junos moves Ethernet frames inside a campus: how it learns MAC addresses, how VLANs cut one switch into several separate networks, how trunks carry many VLANs between switches, what the native VLAN does, and how IRB interfaces route between VLANs. This is the Layer 2 Switching and VLANs part of the JNCIS-ENT exam (JN0-352). By the last chapter you will be able to build, verify and troubleshoot all of it on the same lab devices you will use in the simulator.</p>
<p><b>Prerequisites.</b> This module assumes you finished the JNCIA-Junos modules. In particular you should be comfortable with the CLI from <b>JNCIA CLI</b>: <code>configure</code>, <code>set</code>, <code>show | compare</code>, <code>commit</code>, <code>rollback</code> and operational <code>show</code> commands. We will not re-teach them, we will simply use them. You should also know what an IP address, a subnet mask and a default gateway are.</p>

<h3>Analogy: an office building with locked floors</h3>
<p>Think of a switch as the lift lobby and corridors of an office building. A <b>frame</b> is a letter addressed to a desk. The switch is the clerk who remembers which corridor each desk is on, so most letters go straight to the right door instead of being shouted down every corridor. A <b>VLAN</b> is a locked floor: Finance people can walk their own floor freely, but they cannot walk into Design. If Finance must talk to Design, the letter goes to the <b>reception desk</b> on the ground floor, which is a router. A <b>trunk</b> is the main lift shaft: it carries people from every floor, and each passenger wears a coloured badge (the 802.1Q tag) saying which floor they belong to.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Access switch, trunk and core with IRB">
<rect x="20" y="30" width="90" height="36" rx="8" fill="#bae6fd"/><text x="65" y="53" text-anchor="middle" class="svg-ink" font-size="13">PC1 VLAN 10</text>
<rect x="20" y="150" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="65" y="173" text-anchor="middle" class="svg-ink" font-size="13">PC2 VLAN 20</text>
<rect x="210" y="85" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="265" y="112" text-anchor="middle" class="svg-ink" font-size="14">ACC</text><text x="265" y="132" text-anchor="middle" class="svg-muted" font-size="12">access switch</text>
<rect x="430" y="85" width="120" height="60" rx="10" fill="#fde68a"/><text x="490" y="112" text-anchor="middle" class="svg-ink" font-size="14">CORE</text><text x="490" y="132" text-anchor="middle" class="svg-muted" font-size="12">irb.10  irb.20</text>
<line x1="110" y1="48" x2="210" y2="102" stroke="#64748b" stroke-width="2"/>
<line x1="110" y1="168" x2="210" y2="128" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="115" x2="430" y2="115" stroke="#64748b" stroke-width="5"/>
<text x="375" y="104" text-anchor="middle" class="svg-accent" font-size="12">trunk 802.1Q</text>
<text x="150" y="60" class="svg-muted" font-size="12">access</text><text x="150" y="168" class="svg-muted" font-size="12">access</text>
</svg><p class="cap">Hosts attach to access ports, switches connect with a trunk, and the core routes between VLANs with IRB.</p></div>

<h3>The pieces you will meet</h3>
<dl class="terms">
<dt>Frame</dt><dd>The Layer 2 unit of data: destination MAC, source MAC, optional VLAN tag, payload.</dd>
<dt>MAC table</dt><dd>The switch's memory of which address lives behind which port (the Ethernet switching table).</dd>
<dt>VLAN</dt><dd>A virtual LAN: one separate broadcast domain inside the switch, identified by a 12-bit ID from 1 to 4094.</dd>
<dt>Access port</dt><dd>A port for one end device that belongs to exactly one VLAN and carries untagged frames.</dd>
<dt>Trunk port</dt><dd>A port between switches that carries many VLANs, each frame tagged.</dd>
<dt>IRB</dt><dd>Integrated routing and bridging: the switch's own Layer 3 interface inside a VLAN, used as the hosts' default gateway.</dd>
</dl>

<h3>Enhanced Layer 2 Software (ELS)</h3>
<p>Modern EX switches such as the EX4300 and EX2300 use <b>ELS</b>, a Junos configuration style where VLANs are defined under <code>[edit vlans]</code> and ports use <code>family ethernet-switching</code> on <code>unit 0</code>. All the commands in this module use that style. Older EX models used a different syntax with <code>vlan members</code> under <code>[edit ethernet-switching-options]</code>; the exam and the lab use ELS.</p>

<div class="eg"><p><b>Worked example: the labs in this module.</b> Lab 1 uses one switch AS1 and four PCs (192.168.50.11 to .14) in the Chennai design studio; you split them into VLANs DESIGN (110) and FINANCE (120). Lab 2 uses an access switch ACC and a core switch CORE in Pune with VLANs SALES (10) and ENG (20) and IRB gateways 10.10.10.1 and 10.10.20.1. Lab 3 is a Hyderabad troubleshooting ticket about trunks and the native VLAN. Every chapter prepares you for one of these.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking a VLAN is an IP subnet. A VLAN is a Layer 2 broadcast domain, and a subnet is a Layer 3 idea. By convention one VLAN maps to one subnet, but the switch does not enforce it, and two VLANs using the same subnet simply cannot talk to each other.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam may show old-style EX syntax or ELS syntax and ask which is valid. Check for <code>set vlans NAME vlan-id N</code> and <code>interface-mode</code>; those mark ELS.</p></div>

<div class="scn"><h4>The flat office that grew too big</h4><p>A design studio ran 90 devices in one broadcast domain. Printers, laptops and phones all heard every broadcast, ARP traffic was constant, and the finance desks could see the designers' shared folders. After the network team created three VLANs and a routed core, broadcast noise dropped sharply and finance traffic was reachable only through the gateway where an access list could control it.</p><p><b>Lesson:</b> VLANs shrink broadcast domains and give you a place to apply policy.</p></div>

<div class="iv"><p class="q">"Why do we use VLANs instead of buying a separate switch per department?"</p><p>A strong answer: VLANs give logical separation on shared hardware, reduce broadcast domain size, simplify moves because membership is configuration not cabling, and let you apply security policy at the routing point. Mention that inter-VLAN traffic needs a Layer 3 device, in our labs an IRB interface.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A switch learns source MACs and forwards by destination MAC; a VLAN is a separate broadcast domain.</li>
<li>Access ports carry one untagged VLAN; trunks carry many tagged VLANs.</li>
<li>IRB interfaces are the gateways that route between VLANs on the switch.</li>
<li>This module uses ELS syntax: <code>set vlans</code>, <code>family ethernet-switching</code>, <code>interface-mode</code>.</li>
<li>Assumes JNCIA CLI skills: candidate configuration, commit and rollback.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki Junos chalane wala EX switch campus ke andar Ethernet frames kaise move karta hai: MAC addresses kaise learn karta hai, VLANs ek switch ko kai alag networks mein kaise baantte hain, trunks switches ke beech kai VLANs kaise le jaate hain, native VLAN kya karta hai, aur IRB interfaces VLANs ke beech routing kaise karte hain. Yeh JNCIS-ENT exam (JN0-352) ka Layer 2 Switching aur VLANs wala hissa hai. Aakhri chapter tak aap wahi lab devices par sab kuch build, verify aur troubleshoot kar paoge jo simulator mein milenge.</p>
<p><b>Prerequisites.</b> Yeh module maanta hai ki aapne JNCIA-Junos modules khatam kar liye hain. Khaas taur par <b>JNCIA CLI</b> wali CLI aani chahiye: <code>configure</code>, <code>set</code>, <code>show | compare</code>, <code>commit</code>, <code>rollback</code> aur operational <code>show</code> commands. Hum inhe dobara nahi sikhayenge, bas use karenge. IP address, subnet mask aur default gateway kya hote hain, yeh bhi pata hona chahiye.</p>

<h3>Analogy: ek office building jiski floors locked hain</h3>
<p>Switch ko office building ka lift lobby aur corridors samjho. <b>Frame</b> ek desk ke naam likhi chitthi hai. Switch woh clerk hai jise yaad rehta hai ki kaunsa desk kis corridor mein hai, isliye zyadatar chitthiyan seedhe sahi darwaze par jaati hain, har corridor mein chillayi nahi jaati. <b>VLAN</b> ek locked floor hai: Finance wale apni floor par azaadi se ghoom sakte hain, par Design mein nahi ja sakte. Finance ko Design se baat karni ho to chitthi ground floor ke <b>reception desk</b> par jaati hai, yaani router. <b>Trunk</b> main lift shaft hai: woh har floor ke log le jaata hai, aur har passenger ke paas ek rangeen badge (802.1Q tag) hota hai jo batata hai woh kaunsi floor ka hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Access switch, trunk aur core with IRB">
<rect x="20" y="30" width="90" height="36" rx="8" fill="#bae6fd"/><text x="65" y="53" text-anchor="middle" class="svg-ink" font-size="13">PC1 VLAN 10</text>
<rect x="20" y="150" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="65" y="173" text-anchor="middle" class="svg-ink" font-size="13">PC2 VLAN 20</text>
<rect x="210" y="85" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="265" y="112" text-anchor="middle" class="svg-ink" font-size="14">ACC</text><text x="265" y="132" text-anchor="middle" class="svg-muted" font-size="12">access switch</text>
<rect x="430" y="85" width="120" height="60" rx="10" fill="#fde68a"/><text x="490" y="112" text-anchor="middle" class="svg-ink" font-size="14">CORE</text><text x="490" y="132" text-anchor="middle" class="svg-muted" font-size="12">irb.10  irb.20</text>
<line x1="110" y1="48" x2="210" y2="102" stroke="#64748b" stroke-width="2"/>
<line x1="110" y1="168" x2="210" y2="128" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="115" x2="430" y2="115" stroke="#64748b" stroke-width="5"/>
<text x="375" y="104" text-anchor="middle" class="svg-accent" font-size="12">trunk 802.1Q</text>
<text x="150" y="60" class="svg-muted" font-size="12">access</text><text x="150" y="168" class="svg-muted" font-size="12">access</text>
</svg><p class="cap">Hosts access ports par lagte hain, switches trunk se jude hain, aur core IRB se VLANs ke beech routing karta hai.</p></div>

<h3>Jin cheezon se milna hai</h3>
<dl class="terms">
<dt>Frame</dt><dd>Layer 2 ka data unit: destination MAC, source MAC, optional VLAN tag, payload.</dd>
<dt>MAC table</dt><dd>Switch ki yaaddasht ki kaunsa address kis port ke peeche hai (Ethernet switching table).</dd>
<dt>VLAN</dt><dd>Virtual LAN: switch ke andar ek alag broadcast domain, jise 1 se 4094 ki 12-bit ID se pehchana jaata hai.</dd>
<dt>Access port</dt><dd>Ek end device ke liye port jo bilkul ek VLAN ka hota hai aur untagged frames le jaata hai.</dd>
<dt>Trunk port</dt><dd>Switches ke beech ka port jo kai VLANs le jaata hai, har frame tagged.</dd>
<dt>IRB</dt><dd>Integrated routing and bridging: VLAN ke andar switch ka apna Layer 3 interface, jo hosts ka default gateway banta hai.</dd>
</dl>

<h3>Enhanced Layer 2 Software (ELS)</h3>
<p>EX4300 aur EX2300 jaise modern EX switches <b>ELS</b> use karte hain, ek Junos configuration style jisme VLANs <code>[edit vlans]</code> ke neeche define hote hain aur ports <code>unit 0</code> par <code>family ethernet-switching</code> use karte hain. Is module ke saare commands isi style mein hain. Purane EX models alag syntax use karte the jisme <code>vlan members</code> <code>[edit ethernet-switching-options]</code> ke neeche aata tha; exam aur lab ELS use karte hain.</p>

<div class="eg"><p><b>Worked example: is module ke labs.</b> Lab 1 mein Chennai design studio ka ek switch AS1 aur chaar PCs (192.168.50.11 se .14) hain; aap unhe VLANs DESIGN (110) aur FINANCE (120) mein baantte ho. Lab 2 mein Pune ka access switch ACC aur core switch CORE hai, VLANs SALES (10) aur ENG (20) aur IRB gateways 10.10.10.1 aur 10.10.20.1 ke saath. Lab 3 Hyderabad ka troubleshooting ticket hai, trunks aur native VLAN par. Har chapter inme se kisi ek ki taiyari karata hai.</p></div>

<div class="warn"><p><b>Aam beginner galti.</b> VLAN ko IP subnet samajhna. VLAN Layer 2 broadcast domain hai, subnet Layer 3 ka concept hai. Convention se ek VLAN ek subnet se map hota hai, par switch ise enforce nahi karta, aur same subnet use karne wale do VLANs aapas mein baat nahi kar sakte.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam purana EX syntax ya ELS syntax dikha kar poochh sakta hai ki kaunsa valid hai. <code>set vlans NAME vlan-id N</code> aur <code>interface-mode</code> dekho; yeh ELS ki pehchaan hain.</p></div>

<div class="scn"><h4>Flat office jo bahut bada ho gaya</h4><p>Ek design studio mein 90 devices ek hi broadcast domain mein the. Printers, laptops aur phones sab har broadcast sunte the, ARP traffic hamesha chalta tha, aur finance desks designers ke shared folders dekh sakti thin. Network team ne teen VLANs aur routed core banaya to broadcast noise bahut kam hua aur finance traffic sirf gateway se pahunchta tha jahan access list lagayi ja sakti thi.</p><p><b>Lesson:</b> VLANs broadcast domain chhota karte hain aur policy lagane ki jagah dete hain.</p></div>

<div class="iv"><p class="q">"Har department ke liye alag switch lene ki jagah VLANs kyun use karte hain?"</p><p>Achha jawab: VLANs shared hardware par logical separation dete hain, broadcast domain chhota karte hain, moves aasaan karte hain kyunki membership configuration hai cabling nahi, aur routing point par security policy lagane dete hain. Bolo ki inter-VLAN traffic ke liye Layer 3 device chahiye, hamare labs mein IRB interface.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switch source MAC learn karta hai aur destination MAC se forward karta hai; VLAN ek alag broadcast domain hai.</li>
<li>Access ports ek untagged VLAN le jaate hain; trunks kai tagged VLANs.</li>
<li>IRB interfaces woh gateways hain jo switch par VLANs ke beech route karte hain.</li>
<li>Yeh module ELS syntax use karta hai: <code>set vlans</code>, <code>family ethernet-switching</code>, <code>interface-mode</code>.</li>
<li>JNCIA CLI skills maani gayi hain: candidate configuration, commit aur rollback.</li>
</ul></div>
`}};export{e as default};