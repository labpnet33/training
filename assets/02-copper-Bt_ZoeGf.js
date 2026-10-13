var e={id:`copper`,h:{en:`Copper cabling: UTP categories, RJ-45, pinouts and Auto-MDIX`,hi:`Copper cabling: UTP categories, RJ-45, pinouts aur Auto-MDIX`},body:{en:`
<p>Think of a copper Ethernet cable as four pairs of people whispering down a long corridor. Each pair twists around each other so that noise from the corridor (electrical interference) hits both people equally and cancels out. The longer the corridor, the weaker the whisper, which is why copper Ethernet has a strict length limit of <b>100 metres</b>.</p>

<h3>UTP: unshielded twisted pair</h3>
<p>Almost every desk, phone, printer and access point connects with <b>UTP</b> cable: eight copper wires arranged as <b>four twisted pairs</b>, with no metal shield, ending in an <b>RJ-45</b> connector (technically 8P8C, eight positions and eight contacts). The twisting is the protection: interference induced on one wire of a pair is also induced on its partner, and the receiver looks only at the <b>difference</b> between them, so the noise cancels. This is called differential signalling.</p>
<p>Where there is heavy electrical noise (factories, next to lift motors) you may see <b>shielded</b> variants such as F/UTP or S/FTP, which add foil or braid. They need proper grounding at both ends, otherwise the shield can make things worse.</p>

<h3>Cable categories</h3>
<p>The category tells you how fast a cable can carry data over the full 100 m. Higher categories have tighter twists and better insulation.</p>
<table class="cmp"><tr><th>Category</th><th>Typical use</th><th>Maximum Ethernet speed</th></tr>
<tr><td>Cat5</td><td>Legacy</td><td>100 Mbps (100BASE-TX)</td></tr>
<tr><td>Cat5e</td><td>Most existing offices</td><td>1 Gbps at 100 m; 2.5 Gbps (2.5GBASE-T) at 100 m</td></tr>
<tr><td>Cat6</td><td>Newer offices</td><td>1 Gbps at 100 m; 5 Gbps at 100 m; 10 Gbps only up to about 55 m</td></tr>
<tr><td>Cat6A</td><td>Wi-Fi 6/7 access points, new builds</td><td>10 Gbps (10GBASE-T) at 100 m</td></tr>
<tr><td>Cat8</td><td>Short data center links</td><td>25/40 Gbps up to 30 m</td></tr>
</table>
<p>The 100 m limit is the whole channel: typically 90 m of permanent cable in the wall from the patch panel to the wall outlet, plus up to 10 m of patch cords at both ends.</p>

<h3>Which wires send and which receive</h3>
<p>10BASE-T and 100BASE-TX use only two of the four pairs: one pair to transmit, one to receive. A PC, router or server NIC is an <b>MDI</b> device: it transmits on pins <b>1 and 2</b> and receives on pins <b>3 and 6</b>. A switch or hub port is <b>MDI-X</b> (the X means crossed internally): it transmits on 3 and 6 and receives on 1 and 2. That way a plain cable connects a PC's transmit pins straight to the switch's receive pins.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Straight-through and crossover pinouts">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">Straight-through</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">Crossover</text>
<rect x="20" y="40" width="90" height="150" rx="8" fill="#bae6fd"/><text x="65" y="60" text-anchor="middle" class="svg-ink" font-size="12">PC (MDI)</text>
<rect x="210" y="40" width="90" height="150" rx="8" fill="#bbf7d0"/><text x="255" y="60" text-anchor="middle" class="svg-ink" font-size="12">SW (MDI-X)</text>
<text x="65" y="95" text-anchor="middle" class="svg-muted" font-size="12">Tx 1,2</text><text x="65" y="155" text-anchor="middle" class="svg-muted" font-size="12">Rx 3,6</text>
<text x="255" y="95" text-anchor="middle" class="svg-muted" font-size="12">Rx 1,2</text><text x="255" y="155" text-anchor="middle" class="svg-muted" font-size="12">Tx 3,6</text>
<line x1="110" y1="90" x2="210" y2="90" stroke="#64748b" stroke-width="2"/><line x1="110" y1="150" x2="210" y2="150" stroke="#64748b" stroke-width="2"/>
<rect x="340" y="40" width="90" height="150" rx="8" fill="#bbf7d0"/><text x="385" y="60" text-anchor="middle" class="svg-ink" font-size="12">SW1</text>
<rect x="530" y="40" width="90" height="150" rx="8" fill="#bbf7d0"/><text x="575" y="60" text-anchor="middle" class="svg-ink" font-size="12">SW2</text>
<text x="385" y="95" text-anchor="middle" class="svg-muted" font-size="12">Tx 3,6</text><text x="385" y="155" text-anchor="middle" class="svg-muted" font-size="12">Rx 1,2</text>
<text x="575" y="95" text-anchor="middle" class="svg-muted" font-size="12">Tx 3,6</text><text x="575" y="155" text-anchor="middle" class="svg-muted" font-size="12">Rx 1,2</text>
<line x1="430" y1="90" x2="530" y2="150" stroke="#64748b" stroke-width="2"/><line x1="430" y1="150" x2="530" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="212" text-anchor="middle" class="svg-accent" font-size="12">Auto-MDIX swaps the pairs itself, so either cable works</text>
</svg><p class="cap">Unlike devices use straight-through; like devices historically needed a crossover.</p></div>

<h3>Straight-through, crossover and the "like devices" rule</h3>
<ul>
<li><b>Straight-through</b> (pin 1 to pin 1, both ends wired T568B or both T568A): connects <b>unlike</b> devices, MDI to MDI-X. Examples: PC to switch, router to switch, AP to switch.</li>
<li><b>Crossover</b> (one end T568A, the other T568B, so 1-2 swap with 3-6): connects <b>like</b> devices. Examples: switch to switch, router to router, PC to PC, and also PC to router (both MDI).</li>
</ul>
<p><b>1000BASE-T</b> (gigabit copper) uses <b>all four pairs</b> in both directions at the same time, with echo cancellation. A gigabit link with one broken pair cannot run at 1 Gbps; many switches then fail to link or fall back to 100 Mbps.</p>

<h3>Auto-MDIX</h3>
<p>Modern switches, and most NICs, support <b>Auto-MDIX</b>: the port detects which pairs the far end transmits on and swaps its own transmit and receive internally. With Auto-MDIX on at least one end, a straight-through cable works between two switches. On Cisco Catalyst it is enabled by default with <code>mdix auto</code>. On older platforms Auto-MDIX only works when <b>speed and duplex are both auto</b>: hard-code the speed and it silently turns off, and a switch-to-switch link on a straight cable goes down.</p>
<pre class="code">SW1(config)# interface fa0/2
SW1(config-if)# speed auto
SW1(config-if)# duplex auto
SW1(config-if)# mdix auto        <span class="c">! default on most Catalyst switches</span>
SW1(config-if)# end
SW1# show controllers ethernet-controller fa0/2 phy | include MDIX
 Auto-MDIX                    :  On   [AdminState=1   Flags=0x00056248]</pre>
<p>The exact <code>show controllers</code> wording varies by platform; the point is that you can confirm Auto-MDIX on the port.</p>

<div class="eg"><p><b>Worked example.</b> A technician connects SW1 Fa0/2 to a new switch SW2 with a straight-through patch cord. Both switches have Auto-MDIX on, and the link comes up. Later someone hard-codes SW1 Fa0/2 to <code>speed 100</code> for a test. On an older Catalyst that disables Auto-MDIX on that port; if SW2's port is also fixed, the link drops to notconnect. Using a crossover cable, or returning the port to auto, restores it.</p></div>

<h3>The console cable is different</h3>
<p>From the IOS module, remember that the blue <b>rollover</b> console cable (pin 1 to pin 8, 2 to 7 and so on) or a USB console cable is only for management access. It never carries Ethernet traffic.</p>

<div class="warn"><p><b>Common mistakes.</b> Running copper past 100 m and wondering why the link flaps or shows CRC errors. Untwisting pairs too far at the connector when crimping, which causes crosstalk. Using Cat5 patch cords on a 10 Gbps copper link. Assuming Auto-MDIX still works after hard-coding speed.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know which pins a PC and a switch transmit on (1,2 versus 3,6) and which device pairs need crossover: switch-switch, router-router, PC-PC and PC-router. Router-to-switch is straight-through.</p></div>

<div class="scn"><h4>The printer that was 130 metres away</h4><p>A warehouse printer kept going offline. The switch port showed the link going up and down, and <code>show interfaces</code> on SW1 had a growing CRC count. The engineer checked the cable plan: the run from the IDF to the far end of the warehouse was about 130 m, beyond the 100 m channel limit. The signal arrived too weak and distorted. They installed a small switch halfway (fed by fibre from the IDF), and the CRC counter stayed at zero.</p><p><b>Lesson:</b> copper Ethernet is 100 m per segment. Beyond that, add a switch or use fibre.</p></div>

<div class="iv"><p class="q">"When do you need a crossover cable, and is it still relevant?"</p><p>Strong answer: crossover is for like devices, both MDI (PC-PC, router-router, PC-router) or both MDI-X (switch-switch), because both sides would otherwise transmit on the same pins. Today Auto-MDIX detects and swaps the pairs, so a straight-through cable usually works, but on some platforms Auto-MDIX needs speed and duplex on auto. Add that gigabit uses all four pairs, so a single damaged pair breaks 1 Gbps.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>UTP has four twisted pairs and an RJ-45 connector; twisting cancels interference.</li>
<li>Copper Ethernet is limited to 100 m per channel. Cat5e: 1 Gbps; Cat6A: 10 Gbps at 100 m.</li>
<li>MDI devices (PC, router) transmit on 1,2; MDI-X (switch) transmits on 3,6.</li>
<li>Straight-through for unlike devices, crossover for like devices; Auto-MDIX makes either work.</li>
<li>1000BASE-T uses all four pairs; 10BASE-T and 100BASE-TX use two.</li>
</ul></div>
`,hi:`
<p>Copper Ethernet cable ko aise socho jaise chaar jode log ek lambe corridor mein fusfusa rahe hain. Har joda ek dusre ke around lipta hai taaki corridor ka shor (electrical interference) dono logon ko barabar lage aur cancel ho jaaye. Corridor jitna lamba, fusfusahat utni kamzor, isiliye copper Ethernet ki ek strict length limit hai: <b>100 metre</b>.</p>

<h3>UTP: unshielded twisted pair</h3>
<p>Lagbhag har desk, phone, printer aur access point <b>UTP</b> cable se judta hai: aath copper wires jo <b>chaar twisted pairs</b> mein lage hain, bina metal shield ke, aur end par <b>RJ-45</b> connector (technically 8P8C, aath positions aur aath contacts). Twisting hi protection hai: pair ke ek wire par jo interference aata hai woh uske partner par bhi aata hai, aur receiver sirf dono ke beech ka <b>difference</b> dekhta hai, isliye noise cancel ho jaata hai. Ise differential signalling kehte hain.</p>
<p>Jahan bahut electrical noise hota hai (factories, lift motors ke paas) wahan aapko <b>shielded</b> variants dikhenge jaise F/UTP ya S/FTP, jo foil ya braid jodte hain. Unhe dono ends par sahi grounding chahiye, warna shield cheezon ko aur bigaad sakta hai.</p>

<h3>Cable categories</h3>
<p>Category batati hai ki cable poore 100 m par kitni fast data le ja sakti hai. Oonchi categories mein twists tight aur insulation behtar hota hai.</p>
<table class="cmp"><tr><th>Category</th><th>Typical use</th><th>Maximum Ethernet speed</th></tr>
<tr><td>Cat5</td><td>Legacy</td><td>100 Mbps (100BASE-TX)</td></tr>
<tr><td>Cat5e</td><td>Zyada tar existing offices</td><td>100 m par 1 Gbps; 100 m par 2.5 Gbps (2.5GBASE-T)</td></tr>
<tr><td>Cat6</td><td>Naye offices</td><td>100 m par 1 Gbps; 100 m par 5 Gbps; 10 Gbps sirf lagbhag 55 m tak</td></tr>
<tr><td>Cat6A</td><td>Wi-Fi 6/7 access points, naye builds</td><td>100 m par 10 Gbps (10GBASE-T)</td></tr>
<tr><td>Cat8</td><td>Chhote data center links</td><td>30 m tak 25/40 Gbps</td></tr>
</table>
<p>100 m limit poore channel ki hai: aam taur par patch panel se wall outlet tak deewar mein 90 m permanent cable, aur dono ends par milake 10 m tak patch cords.</p>

<h3>Kaunse wires bhejte hain aur kaunse receive karte hain</h3>
<p>10BASE-T aur 100BASE-TX chaar mein se sirf do pairs use karte hain: ek pair transmit ke liye, ek receive ke liye. PC, router ya server ka NIC <b>MDI</b> device hai: woh pins <b>1 aur 2</b> par transmit karta hai aur pins <b>3 aur 6</b> par receive. Switch ya hub ka port <b>MDI-X</b> hai (X ka matlab andar se crossed): woh 3 aur 6 par transmit aur 1 aur 2 par receive karta hai. Is tarah ek simple cable PC ke transmit pins ko seedha switch ke receive pins se jod deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Straight-through aur crossover pinouts">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">Straight-through</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">Crossover</text>
<rect x="20" y="40" width="90" height="150" rx="8" fill="#bae6fd"/><text x="65" y="60" text-anchor="middle" class="svg-ink" font-size="12">PC (MDI)</text>
<rect x="210" y="40" width="90" height="150" rx="8" fill="#bbf7d0"/><text x="255" y="60" text-anchor="middle" class="svg-ink" font-size="12">SW (MDI-X)</text>
<text x="65" y="95" text-anchor="middle" class="svg-muted" font-size="12">Tx 1,2</text><text x="65" y="155" text-anchor="middle" class="svg-muted" font-size="12">Rx 3,6</text>
<text x="255" y="95" text-anchor="middle" class="svg-muted" font-size="12">Rx 1,2</text><text x="255" y="155" text-anchor="middle" class="svg-muted" font-size="12">Tx 3,6</text>
<line x1="110" y1="90" x2="210" y2="90" stroke="#64748b" stroke-width="2"/><line x1="110" y1="150" x2="210" y2="150" stroke="#64748b" stroke-width="2"/>
<rect x="340" y="40" width="90" height="150" rx="8" fill="#bbf7d0"/><text x="385" y="60" text-anchor="middle" class="svg-ink" font-size="12">SW1</text>
<rect x="530" y="40" width="90" height="150" rx="8" fill="#bbf7d0"/><text x="575" y="60" text-anchor="middle" class="svg-ink" font-size="12">SW2</text>
<text x="385" y="95" text-anchor="middle" class="svg-muted" font-size="12">Tx 3,6</text><text x="385" y="155" text-anchor="middle" class="svg-muted" font-size="12">Rx 1,2</text>
<text x="575" y="95" text-anchor="middle" class="svg-muted" font-size="12">Tx 3,6</text><text x="575" y="155" text-anchor="middle" class="svg-muted" font-size="12">Rx 1,2</text>
<line x1="430" y1="90" x2="530" y2="150" stroke="#64748b" stroke-width="2"/><line x1="430" y1="150" x2="530" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="212" text-anchor="middle" class="svg-accent" font-size="12">Auto-MDIX pairs khud swap karta hai, isliye koi bhi cable chalta hai</text>
</svg><p class="cap">Alag type ke devices straight-through use karte hain; same type ke devices ko pehle crossover chahiye hota tha.</p></div>

<h3>Straight-through, crossover aur "same type devices" wala rule</h3>
<ul>
<li><b>Straight-through</b> (pin 1 se pin 1, dono ends T568B ya dono T568A): <b>alag type</b> ke devices jodta hai, MDI se MDI-X. Examples: PC se switch, router se switch, AP se switch.</li>
<li><b>Crossover</b> (ek end T568A, dusra T568B, yaani 1-2 ka 3-6 se swap): <b>same type</b> ke devices jodta hai. Examples: switch se switch, router se router, PC se PC, aur PC se router bhi (dono MDI).</li>
</ul>
<p><b>1000BASE-T</b> (gigabit copper) <b>chaaron pairs</b> ko dono directions mein ek saath use karta hai, echo cancellation ke saath. Jis gigabit link ka ek pair toota ho woh 1 Gbps par nahi chal sakta; bahut saare switches tab link hi nahi banate ya 100 Mbps par gir jaate hain.</p>

<h3>Auto-MDIX</h3>
<p>Modern switches, aur zyada tar NICs, <b>Auto-MDIX</b> support karte hain: port detect karta hai ki far end kin pairs par transmit kar raha hai aur apne transmit aur receive ko andar hi swap kar leta hai. Kam se kam ek end par Auto-MDIX on ho to do switches ke beech straight-through cable chal jaata hai. Cisco Catalyst par yeh <code>mdix auto</code> ke saath default enabled hota hai. Purane platforms par Auto-MDIX tabhi kaam karta hai jab <b>speed aur duplex dono auto</b> hon: speed hard-code karo to yeh chupchaap off ho jaata hai, aur straight cable wala switch-to-switch link down ho jaata hai.</p>
<pre class="code">SW1(config)# interface fa0/2
SW1(config-if)# speed auto
SW1(config-if)# duplex auto
SW1(config-if)# mdix auto        <span class="c">! zyada tar Catalyst switches par default</span>
SW1(config-if)# end
SW1# show controllers ethernet-controller fa0/2 phy | include MDIX
 Auto-MDIX                    :  On   [AdminState=1   Flags=0x00056248]</pre>
<p><code>show controllers</code> ki exact wording platform ke hisaab se badalti hai; point yeh hai ki aap port par Auto-MDIX confirm kar sakte ho.</p>

<div class="eg"><p><b>Worked example.</b> Ek technician SW1 Fa0/2 ko naye switch SW2 se straight-through patch cord se jodta hai. Dono switches par Auto-MDIX on hai, aur link up ho jaata hai. Baad mein koi test ke liye SW1 Fa0/2 ko <code>speed 100</code> par hard-code kar deta hai. Purane Catalyst par isse us port par Auto-MDIX disable ho jaata hai; agar SW2 ka port bhi fixed hai, to link notconnect par gir jaata hai. Crossover cable use karna, ya port ko wapas auto karna, use theek kar deta hai.</p></div>

<h3>Console cable alag hai</h3>
<p>IOS module se yaad rakho ki neela <b>rollover</b> console cable (pin 1 se pin 8, 2 se 7 aur aage) ya USB console cable sirf management access ke liye hai. Yeh kabhi Ethernet traffic nahi le jaata.</p>

<div class="warn"><p><b>Common galtiyan.</b> Copper ko 100 m se aage chalana aur phir sochna ki link flap kyun ho raha hai ya CRC errors kyun dikh rahe hain. Crimp karte waqt connector par pairs ko zyada untwist kar dena, jisse crosstalk hota hai. 10 Gbps copper link par Cat5 patch cords use karna. Yeh maan lena ki speed hard-code karne ke baad bhi Auto-MDIX chalta rahega.</p></div>

<div class="exam"><p><b>Exam trap.</b> Yaad rakho PC aur switch kin pins par transmit karte hain (1,2 vs 3,6) aur kin device pairs ko crossover chahiye: switch-switch, router-router, PC-PC aur PC-router. Router-to-switch straight-through hai.</p></div>

<div class="scn"><h4>Woh printer jo 130 metre door tha</h4><p>Ek warehouse ka printer baar baar offline ho raha tha. Switch port par link up-down ho raha tha, aur SW1 par <code>show interfaces</code> mein CRC count badh raha tha. Engineer ne cable plan check kiya: IDF se warehouse ke door wale end tak run lagbhag 130 m tha, 100 m channel limit se zyada. Signal bahut kamzor aur distorted pahunch raha tha. Unhone beech mein ek chhota switch lagaya (IDF se fibre se feed kiya), aur CRC counter zero par ruka raha.</p><p><b>Seekh:</b> copper Ethernet har segment mein 100 m hai. Usse aage switch lagao ya fibre use karo.</p></div>

<div class="iv"><p class="q">"Crossover cable kab chahiye, aur kya woh aaj bhi relevant hai?"</p><p>Strong answer: crossover same type ke devices ke liye hai, dono MDI (PC-PC, router-router, PC-router) ya dono MDI-X (switch-switch), kyunki warna dono sides same pins par transmit karengi. Aaj Auto-MDIX pairs detect aur swap kar leta hai, isliye straight-through cable aam taur par chal jaata hai, lekin kuch platforms par Auto-MDIX ko speed aur duplex auto par chahiye. Yeh bhi jodo ki gigabit chaaron pairs use karta hai, isliye ek damaged pair 1 Gbps tod deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>UTP mein chaar twisted pairs aur RJ-45 connector hota hai; twisting interference cancel karti hai.</li>
<li>Copper Ethernet har channel mein 100 m tak limited hai. Cat5e: 1 Gbps; Cat6A: 100 m par 10 Gbps.</li>
<li>MDI devices (PC, router) 1,2 par transmit karte hain; MDI-X (switch) 3,6 par.</li>
<li>Alag type devices ke liye straight-through, same type ke liye crossover; Auto-MDIX dono ko chala deta hai.</li>
<li>1000BASE-T chaaron pairs use karta hai; 10BASE-T aur 100BASE-TX do.</li>
</ul></div>
`}};export{e as default};