var e={id:`fibre`,h:{en:`Fibre optics: single-mode vs multimode, connectors and SFP transceivers`,hi:`Fibre optics: single-mode vs multimode, connectors aur SFP transceivers`},body:{en:`
<p>Picture a long glass tube with mirrored walls. Shine a torch in one end and the light bounces along the walls all the way to the far end, even around gentle bends. That is an optical fibre: a hair-thin strand of glass that carries data as pulses of light. Light does not care about electrical noise, lightning or nearby motors, and it travels kilometres where copper gives up at 100 m.</p>

<h3>How a fibre is built</h3>
<p>Every fibre has a <b>core</b> (where the light travels), surrounded by <b>cladding</b> (glass with a slightly lower refractive index that keeps the light inside), then a protective buffer and jacket. The cladding is always 125 micrometres (µm) across. What changes is the core:</p>
<ul>
<li><b>Multimode fibre (MMF)</b>: a wide core of <b>50 µm</b> (or 62.5 µm in old cable). Light enters at many angles, so it travels along many paths (modes). Different paths arrive at slightly different times, which smears the pulses (modal dispersion) and limits distance to hundreds of metres. Uses cheap 850 nm LED or VCSEL light sources.</li>
<li><b>Single-mode fibre (SMF)</b>: a tiny core of about <b>9 µm</b>. Only one path fits, so pulses stay sharp over tens of kilometres. Uses more expensive 1310 nm or 1550 nm lasers.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Multimode versus single-mode fibre">
<rect x="30" y="30" width="580" height="60" rx="30" fill="#fed7aa"/><rect x="30" y="45" width="580" height="30" fill="#fde68a"/>
<polyline points="40,60 120,48 200,72 280,48 360,72 440,48 520,72 600,60" fill="none" stroke="#64748b" stroke-width="2"/>
<polyline points="40,60 160,72 280,48 400,72 520,48 600,60" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="13">Multimode: 50 µm core, many paths, hundreds of metres</text>
<rect x="30" y="120" width="580" height="50" rx="25" fill="#fde68a"/><rect x="30" y="140" width="580" height="10" fill="#bae6fd"/>
<line x1="40" y1="145" x2="600" y2="145" stroke="#64748b" stroke-width="2"/>
<text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">Single-mode: 9 µm core, one path, tens of kilometres</text>
</svg><p class="cap">A wide core lets light bounce along many paths; a narrow core allows just one.</p></div>

<h3>Fibre grades and jacket colours</h3>
<table class="cmp"><tr><th>Grade</th><th>Type</th><th>Usual jacket</th><th>Example reach</th></tr>
<tr><td>OM1 / OM2</td><td>MMF 62.5 / 50 µm, legacy</td><td>Orange</td><td>1000BASE-SX about 275 m / 550 m</td></tr>
<tr><td>OM3</td><td>MMF 50 µm, laser-optimised</td><td>Aqua</td><td>10GBASE-SR about 300 m</td></tr>
<tr><td>OM4</td><td>MMF 50 µm, better</td><td>Aqua or violet</td><td>10GBASE-SR about 400 m; 100GBASE-SR4 about 100 m</td></tr>
<tr><td>OM5</td><td>MMF, wideband</td><td>Lime green</td><td>Short-wave multiplexing</td></tr>
<tr><td>OS1 / OS2</td><td>SMF 9 µm</td><td>Yellow</td><td>1000BASE-LX 5 to 10 km, 10GBASE-LR 10 km, 10GBASE-ER 40 km</td></tr>
</table>
<p>The golden rule: <b>the optic, the fibre type and the far-end optic must all match</b>. An SR (multimode, 850 nm) optic will not talk to an LR (single-mode, 1310 nm) optic, and plugging single-mode optics into multimode cable gives a weak or dead link.</p>

<h3>Connectors</h3>
<ul>
<li><b>LC</b>: small, square, push-and-click, usually as a duplex pair. The standard on SFP and SFP+ modules.</li>
<li><b>SC</b>: larger square push-pull connector, common on older gear and patch panels.</li>
<li><b>ST</b>: round bayonet twist-lock, legacy.</li>
<li><b>MPO/MTP</b>: a rectangular connector with 12 or more fibres in a row, used by parallel optics such as 40GBASE-SR4 and 100GBASE-SR4.</li>
</ul>
<p>Ferrule polish matters too: <b>UPC</b> connectors are usually blue and <b>APC</b> (angled) are green. Never mate an APC connector with a UPC one; the air gap causes loss and can damage the end faces.</p>

<h3>Transceivers: SFP, SFP+, QSFP</h3>
<p>Switches with fibre ports do not have the optics built in. They have empty <b>cages</b> into which you plug a hot-swappable transceiver. This lets one switch model serve short multimode links, long single-mode links or even copper, just by choosing the module.</p>
<table class="cmp"><tr><th>Form factor</th><th>Speed</th><th>Examples</th></tr>
<tr><td>SFP</td><td>1 Gbps</td><td>1000BASE-SX, 1000BASE-LX/LH, 1000BASE-T copper SFP</td></tr>
<tr><td>SFP+</td><td>10 Gbps</td><td>10GBASE-SR, 10GBASE-LR, DAC twinax cables</td></tr>
<tr><td>SFP28</td><td>25 Gbps</td><td>25GBASE-SR</td></tr>
<tr><td>QSFP+ / QSFP28</td><td>40 / 100 Gbps</td><td>40GBASE-SR4, 100GBASE-SR4, 100GBASE-LR4</td></tr>
</table>
<p>A <b>DAC</b> (direct attach copper) is a twinax cable with SFP+ or QSFP ends moulded on, cheap and ideal for a few metres inside a rack. An <b>AOC</b> is the same idea with fibre inside.</p>

<h3>Transmit goes to receive</h3>
<p>A duplex fibre link uses two strands: A and B. The transmit of one end must reach the receive of the other, so the strands are crossed somewhere in the path (patch cords are usually built A-to-B). If a technician reverses one pair in a patch panel, Tx meets Tx and the link stays down. Swapping the two LC connectors at one end is the classic quick fix.</p>

<h3>Verifying optics</h3>
<pre class="code">SW1# show inventory
SW1# show interfaces gi1/0/49 status
SW1# show interfaces transceiver         <span class="c">! needs DOM-capable optics</span></pre>
<pre class="out">SW1# show interfaces transceiver
                                         Optical   Optical
           Temperature  Voltage  Current Tx Power  Rx Power
Port       (Celsius)    (Volts)  (mA)    (dBm)     (dBm)
---------  -----------  -------  ------- --------  --------
Gi1/0/49     31.8       3.29      6.2     -5.3      -6.1
<span class="hl">Gi1/0/50     32.4       3.30      6.1     -5.2     -18.9</span></pre>
<p><b>DOM</b> (digital optical monitoring) shows light levels in dBm. Values closer to zero are stronger. Gi1/0/50 receives almost 13 dB less light than Gi1/0/49 on a similar path: suspect a dirty connector, a tight bend or a bad splice.</p>

<div class="eg"><p><b>Worked example.</b> A campus needs a 10 Gbps uplink over 1.2 km of installed OS2 single-mode fibre. 10GBASE-SR is multimode and reaches only a few hundred metres, so it is wrong. 10GBASE-LR (1310 nm, up to 10 km on SMF) in an SFP+ at both ends with LC duplex patch cords is the correct choice.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Mixing SR and LR optics on one link. Using orange OM1 patch cords on a 10G link. Never cleaning connectors: a single fingerprint or speck of dust causes CRC errors or a dead link. Looking into a fibre or an optic port: lasers can be invisible and harmful to your eyes.</p></div>

<div class="exam"><p><b>Exam trap.</b> Multimode: larger core, shorter distance, cheaper optics. Single-mode: smaller core, longer distance, lasers. If a question mentions "several kilometres", the answer is single-mode. Fibre is also immune to electromagnetic interference, a common reason to choose it in factories.</p></div>

<div class="scn"><h4>The new uplink that never came up</h4><p>A new 10G uplink between two buildings stayed notconnect. Both SFP+ modules showed as present in <code>show inventory</code>. <code>show interfaces transceiver</code> showed normal Tx power on both switches but Rx power around -40 dBm (effectively no light). The engineer checked the patch panel and found the strands reversed at one end, so each switch was transmitting into the other's transmitter. Swapping the two LC connectors at one patch panel brought the link up with Rx around -3 dBm.</p><p><b>Lesson:</b> with fibre, check that each Tx lands on the far Rx, and use DOM readings as evidence.</p></div>

<div class="iv"><p class="q">"Compare single-mode and multimode fibre. When would you pick each?"</p><p>Strong answer: MMF has a 50 µm core, many modes, 850 nm VCSEL optics, and reaches hundreds of metres, so it is used inside buildings and data centers where it is cheaper. SMF has a 9 µm core, one mode, 1310 or 1550 nm lasers, and reaches tens of kilometres, so it is used between buildings and for campus or WAN links. Mention that optics, fibre and far-end optic must match, name the SFP form factors, and say you verify with DOM light levels.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MMF: 50 µm core, orange or aqua, SR optics, hundreds of metres. SMF: 9 µm core, yellow, LR/ER optics, kilometres.</li>
<li>Both optics and the fibre between them must match in type and wavelength.</li>
<li>LC is the common SFP connector; MPO carries parallel optics for 40/100G.</li>
<li>SFP 1G, SFP+ 10G, SFP28 25G, QSFP 40/100G; DAC for short in-rack links.</li>
<li>Tx must reach Rx; use <code>show interfaces transceiver</code> to read light levels.</li>
</ul></div>
`,hi:`
<p>Ek lambi glass ki tube socho jiski deewarein mirror jaisi hain. Ek end mein torch chamkao aur light deewaron se takra kar door wale end tak pahunch jaati hai, halke mod ke around bhi. Yahi optical fibre hai: baal jitna patla glass ka dhaaga jo data ko light ke pulses ke roop mein le jaata hai. Light ko electrical noise, bijli girne ya paas ke motors se farak nahi padta, aur woh kilometres tak jaati hai jahan copper 100 m par haar maan leta hai.</p>

<h3>Fibre kaise bana hota hai</h3>
<p>Har fibre mein ek <b>core</b> hota hai (jahan light chalti hai), uske around <b>cladding</b> (thoda kam refractive index wala glass jo light ko andar rakhta hai), phir protective buffer aur jacket. Cladding hamesha 125 micrometre (µm) chauda hota hai. Jo badalta hai woh core hai:</p>
<ul>
<li><b>Multimode fibre (MMF)</b>: <b>50 µm</b> ka chauda core (purani cable mein 62.5 µm). Light kai angles se andar aati hai, isliye kai raaston (modes) par chalti hai. Alag raaste thode alag time par pahunchte hain, jisse pulses phail jaate hain (modal dispersion) aur doori kuch sau metre tak limited ho jaati hai. Saste 850 nm LED ya VCSEL light sources use hote hain.</li>
<li><b>Single-mode fibre (SMF)</b>: lagbhag <b>9 µm</b> ka bahut chhota core. Sirf ek raasta fit hota hai, isliye pulses dasiyon kilometres tak sharp rehte hain. Mehenge 1310 nm ya 1550 nm lasers use hote hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Multimode vs single-mode fibre">
<rect x="30" y="30" width="580" height="60" rx="30" fill="#fed7aa"/><rect x="30" y="45" width="580" height="30" fill="#fde68a"/>
<polyline points="40,60 120,48 200,72 280,48 360,72 440,48 520,72 600,60" fill="none" stroke="#64748b" stroke-width="2"/>
<polyline points="40,60 160,72 280,48 400,72 520,48 600,60" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="13">Multimode: 50 µm core, kai raaste, kuch sau metre</text>
<rect x="30" y="120" width="580" height="50" rx="25" fill="#fde68a"/><rect x="30" y="140" width="580" height="10" fill="#bae6fd"/>
<line x1="40" y1="145" x2="600" y2="145" stroke="#64748b" stroke-width="2"/>
<text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">Single-mode: 9 µm core, ek raasta, dasiyon kilometre</text>
</svg><p class="cap">Chauda core light ko kai raaston par bounce hone deta hai; patla core sirf ek.</p></div>

<h3>Fibre grades aur jacket colours</h3>
<table class="cmp"><tr><th>Grade</th><th>Type</th><th>Aam jacket</th><th>Example reach</th></tr>
<tr><td>OM1 / OM2</td><td>MMF 62.5 / 50 µm, legacy</td><td>Orange</td><td>1000BASE-SX lagbhag 275 m / 550 m</td></tr>
<tr><td>OM3</td><td>MMF 50 µm, laser-optimised</td><td>Aqua</td><td>10GBASE-SR lagbhag 300 m</td></tr>
<tr><td>OM4</td><td>MMF 50 µm, behtar</td><td>Aqua ya violet</td><td>10GBASE-SR lagbhag 400 m; 100GBASE-SR4 lagbhag 100 m</td></tr>
<tr><td>OM5</td><td>MMF, wideband</td><td>Lime green</td><td>Short-wave multiplexing</td></tr>
<tr><td>OS1 / OS2</td><td>SMF 9 µm</td><td>Yellow</td><td>1000BASE-LX 5 se 10 km, 10GBASE-LR 10 km, 10GBASE-ER 40 km</td></tr>
</table>
<p>Golden rule: <b>optic, fibre type aur far-end optic teeno match hone chahiye</b>. SR (multimode, 850 nm) optic LR (single-mode, 1310 nm) optic se baat nahi karega, aur single-mode optics ko multimode cable mein lagane se link kamzor ya dead hota hai.</p>

<h3>Connectors</h3>
<ul>
<li><b>LC</b>: chhota, square, push karke click, aam taur par duplex pair mein. SFP aur SFP+ modules par standard.</li>
<li><b>SC</b>: bada square push-pull connector, purane gear aur patch panels par common.</li>
<li><b>ST</b>: gol bayonet twist-lock, legacy.</li>
<li><b>MPO/MTP</b>: rectangular connector jisme 12 ya zyada fibres ek line mein hote hain, 40GBASE-SR4 aur 100GBASE-SR4 jaise parallel optics use karte hain.</li>
</ul>
<p>Ferrule polish bhi matter karta hai: <b>UPC</b> connectors aam taur par blue hote hain aur <b>APC</b> (angled) green. APC connector ko kabhi UPC se mat jodo; air gap se loss hota hai aur end faces kharab ho sakte hain.</p>

<h3>Transceivers: SFP, SFP+, QSFP</h3>
<p>Fibre ports wale switches mein optics built-in nahi hote. Unmein khaali <b>cages</b> hote hain jinmein aap hot-swappable transceiver lagate ho. Isse ek hi switch model chhote multimode links, lambe single-mode links ya copper bhi serve kar sakta hai, bas module chun ke.</p>
<table class="cmp"><tr><th>Form factor</th><th>Speed</th><th>Examples</th></tr>
<tr><td>SFP</td><td>1 Gbps</td><td>1000BASE-SX, 1000BASE-LX/LH, 1000BASE-T copper SFP</td></tr>
<tr><td>SFP+</td><td>10 Gbps</td><td>10GBASE-SR, 10GBASE-LR, DAC twinax cables</td></tr>
<tr><td>SFP28</td><td>25 Gbps</td><td>25GBASE-SR</td></tr>
<tr><td>QSFP+ / QSFP28</td><td>40 / 100 Gbps</td><td>40GBASE-SR4, 100GBASE-SR4, 100GBASE-LR4</td></tr>
</table>
<p><b>DAC</b> (direct attach copper) ek twinax cable hai jiske ends par SFP+ ya QSFP moulded hote hain, sasta aur rack ke andar kuch metre ke liye ideal. <b>AOC</b> wahi idea hai lekin andar fibre ke saath.</p>

<h3>Transmit receive tak jaata hai</h3>
<p>Duplex fibre link do strands use karta hai: A aur B. Ek end ka transmit dusre end ke receive tak pahunchna chahiye, isliye path mein kahin strands cross hote hain (patch cords aam taur par A-to-B bane hote hain). Agar technician patch panel mein ek pair ulta kar de, to Tx Tx se milta hai aur link down rehta hai. Ek end par dono LC connectors swap karna classic quick fix hai.</p>

<h3>Optics verify karna</h3>
<pre class="code">SW1# show inventory
SW1# show interfaces gi1/0/49 status
SW1# show interfaces transceiver         <span class="c">! DOM-capable optics chahiye</span></pre>
<pre class="out">SW1# show interfaces transceiver
                                         Optical   Optical
           Temperature  Voltage  Current Tx Power  Rx Power
Port       (Celsius)    (Volts)  (mA)    (dBm)     (dBm)
---------  -----------  -------  ------- --------  --------
Gi1/0/49     31.8       3.29      6.2     -5.3      -6.1
<span class="hl">Gi1/0/50     32.4       3.30      6.1     -5.2     -18.9</span></pre>
<p><b>DOM</b> (digital optical monitoring) light levels dBm mein dikhata hai. Zero ke kareeb values zyada strong hain. Gi1/0/50 milte-julte path par Gi1/0/49 se lagbhag 13 dB kam light receive karta hai: ganda connector, tight bend ya kharab splice par shak karo.</p>

<div class="eg"><p><b>Worked example.</b> Ek campus ko 1.2 km installed OS2 single-mode fibre par 10 Gbps uplink chahiye. 10GBASE-SR multimode hai aur sirf kuch sau metre jaata hai, isliye galat hai. Dono ends par SFP+ mein 10GBASE-LR (1310 nm, SMF par 10 km tak) LC duplex patch cords ke saath sahi choice hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Ek link par SR aur LR optics mix karna. 10G link par orange OM1 patch cords use karna. Connectors kabhi saaf na karna: ek fingerprint ya dhool ka ek kan CRC errors ya dead link deta hai. Fibre ya optic port mein jhaankna: lasers invisible ho sakte hain aur aankhon ke liye nuksaandeh hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Multimode: bada core, kam doori, saste optics. Single-mode: chhota core, zyada doori, lasers. Agar question mein "kai kilometre" likha ho, jawab single-mode hai. Fibre electromagnetic interference se immune bhi hai, factories mein use chunne ka common reason.</p></div>

<div class="scn"><h4>Naya uplink jo kabhi up nahi hua</h4><p>Do buildings ke beech ek naya 10G uplink notconnect par ruka raha. <code>show inventory</code> mein dono SFP+ modules present dikh rahe the. <code>show interfaces transceiver</code> mein dono switches par Tx power normal tha lekin Rx power lagbhag -40 dBm (yaani light hi nahi). Engineer ne patch panel check kiya aur paaya ki ek end par strands ulte the, isliye har switch dusre ke transmitter mein transmit kar raha tha. Ek patch panel par dono LC connectors swap karne se link lagbhag -3 dBm Rx ke saath up ho gaya.</p><p><b>Seekh:</b> fibre mein check karo ki har Tx door wale Rx par pahunche, aur DOM readings ko saboot ki tarah use karo.</p></div>

<div class="iv"><p class="q">"Single-mode aur multimode fibre compare karo. Kab kaunsa chunoge?"</p><p>Strong answer: MMF ka 50 µm core hai, kai modes, 850 nm VCSEL optics, aur kuch sau metre tak jaata hai, isliye buildings aur data centers ke andar use hota hai jahan yeh sasta hai. SMF ka 9 µm core hai, ek mode, 1310 ya 1550 nm lasers, aur dasiyon kilometre tak jaata hai, isliye buildings ke beech aur campus ya WAN links ke liye use hota hai. Batao ki optics, fibre aur far-end optic match hone chahiye, SFP form factors ke naam lo, aur kaho ki aap DOM light levels se verify karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MMF: 50 µm core, orange ya aqua, SR optics, kuch sau metre. SMF: 9 µm core, yellow, LR/ER optics, kilometres.</li>
<li>Dono optics aur unke beech ka fibre type aur wavelength mein match hone chahiye.</li>
<li>LC common SFP connector hai; MPO 40/100G ke parallel optics le jaata hai.</li>
<li>SFP 1G, SFP+ 10G, SFP28 25G, QSFP 40/100G; rack ke andar chhote links ke liye DAC.</li>
<li>Tx ko Rx tak pahunchna chahiye; light levels padhne ke liye <code>show interfaces transceiver</code> use karo.</li>
</ul></div>
`}};export{e as default};