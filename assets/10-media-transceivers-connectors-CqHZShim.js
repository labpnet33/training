var e={id:`media`,h:{en:`Transmission media, transceivers and connectors`,hi:`Transmission media, transceivers aur connectors`},body:{en:`
<p>Objective 1.5 is about choosing the right <b>physical path</b>: wireless or wired, copper or fibre, which cable category, which optic and which connector. Think of it like choosing transport for goods: a bicycle courier (copper) is cheap and fine within the city, a train (multimode fibre) moves a lot over medium distances, and a long-haul freight line (single-mode fibre) crosses the country. net-start introduced the basics; here you learn the exact standards and distances the exam tests.</p>

<h3>Wireless media</h3>
<ul>
<li><b>802.11 (Wi-Fi):</b> radio in the 2.4, 5 and 6 GHz bands; a shared, half-duplex medium using CSMA/CA. The standards (a/b/g/n/ac/ax/be), channels and security are covered in the wireless module.</li>
<li><b>Cellular:</b> 4G LTE and 5G from a mobile operator, through a SIM in a router or modem. Common as a backup WAN link, for pop-up sites, and for IoT.</li>
<li><b>Satellite:</b> for remote locations with no terrestrial links. Traditional <b>geostationary (GEO)</b> satellites orbit at about 35,786 km, giving round-trip latency around 600 ms, which hurts voice and interactive apps. <b>Low Earth orbit (LEO)</b> constellations orbit a few hundred to about 1,200 km up and give latency of tens of milliseconds. Rain and obstructions affect both.</li>
</ul>

<h3>Copper: 802.3 over twisted pair</h3>
<table class="cmp"><tr><th>Standard</th><th>Speed</th><th>Cable</th><th>Max distance</th></tr>
<tr><td>100BASE-TX</td><td>100 Mb/s</td><td>Cat5 or better</td><td>100 m</td></tr>
<tr><td>1000BASE-T</td><td>1 Gb/s</td><td>Cat5e or better</td><td>100 m</td></tr>
<tr><td>2.5G/5GBASE-T</td><td>2.5 / 5 Gb/s</td><td>Cat5e / Cat6</td><td>100 m</td></tr>
<tr><td>10GBASE-T</td><td>10 Gb/s</td><td>Cat6 (55 m) or Cat6a</td><td>100 m on Cat6a</td></tr>
<tr><td>25G/40GBASE-T</td><td>25 / 40 Gb/s</td><td>Cat8</td><td>30 m</td></tr>
</table>
<p>Copper also comes as <b>coaxial</b> cable: a central conductor with a shield. <b>RG-6</b> carries cable TV and cable broadband and uses the screw-on <b>F-type</b> connector; <b>RG-59</b> is older and thinner, used for CCTV and short video runs. <b>Twinaxial</b> (twinax) has two inner conductors and is used for DAC cables.</p>
<p><b>DAC (direct attach copper)</b> is a twinax cable with the transceivers permanently attached at each end (SFP+, SFP28 or QSFP). It is cheap, low-power and low-latency, ideal for server-to-top-of-rack links; passive DACs reach about 5 to 7 m. For longer in-row links, an <b>AOC</b> (active optical cable) does the same job with fibre.</p>

<h3>Fibre: single-mode versus multimode</h3>
<table class="cmp"><tr><th></th><th>Multimode (MMF)</th><th>Single-mode (SMF)</th></tr>
<tr><td>Core</td><td>50 or 62.5 microns</td><td>About 9 microns</td></tr>
<tr><td>Light source</td><td>LED or VCSEL, 850 nm</td><td>Laser, 1310 or 1550 nm</td></tr>
<tr><td>Distance</td><td>Hundreds of metres</td><td>Kilometres (10, 40, 80 km and more)</td></tr>
<tr><td>Grades and colour</td><td>OM1-OM5; orange (OM1/OM2), aqua (OM3/OM4), lime (OM5)</td><td>OS1/OS2; yellow jacket</td></tr>
<tr><td>Typical use</td><td>Inside a building or data center</td><td>Between buildings, campus backbone, WAN, ISP</td></tr>
</table>
<table class="cmp"><tr><th>Standard</th><th>Fibre and wavelength</th><th>Reach</th></tr>
<tr><td>1000BASE-SX</td><td>MMF, 850 nm</td><td>About 550 m</td></tr>
<tr><td>1000BASE-LX</td><td>SMF, 1310 nm</td><td>5-10 km</td></tr>
<tr><td>10GBASE-SR</td><td>MMF, 850 nm</td><td>300 m on OM3, 400 m on OM4</td></tr>
<tr><td>10GBASE-LR</td><td>SMF, 1310 nm</td><td>10 km</td></tr>
<tr><td>10GBASE-ER</td><td>SMF, 1550 nm</td><td>40 km</td></tr>
<tr><td>40G/100GBASE-SR4</td><td>MMF, 4 fibre pairs, MPO connector</td><td>About 100-150 m on OM4</td></tr>
</table>
<p>Memory aid for the letters: <b>S</b>R = <b>S</b>hort reach (multimode), <b>L</b>R = <b>L</b>ong reach (single-mode, 10 km), <b>E</b>R = <b>E</b>xtended reach (40 km). T = twisted pair copper.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Reach of common media">
<text x="10" y="22" class="svg-ink" font-size="13">Typical maximum reach (not to scale)</text>
<rect x="150" y="36" width="30" height="22" fill="#fed7aa"/><text x="140" y="52" text-anchor="end" class="svg-ink" font-size="12">DAC twinax</text><text x="188" y="52" class="svg-muted" font-size="12">5-7 m</text>
<rect x="150" y="66" width="120" height="22" fill="#bae6fd"/><text x="140" y="82" text-anchor="end" class="svg-ink" font-size="12">Cat6a copper</text><text x="278" y="82" class="svg-muted" font-size="12">100 m</text>
<rect x="150" y="96" width="200" height="22" fill="#bbf7d0"/><text x="140" y="112" text-anchor="end" class="svg-ink" font-size="12">10GBASE-SR MMF</text><text x="358" y="112" class="svg-muted" font-size="12">300-400 m</text>
<rect x="150" y="126" width="320" height="22" fill="#fde68a"/><text x="140" y="142" text-anchor="end" class="svg-ink" font-size="12">10GBASE-LR SMF</text><text x="478" y="142" class="svg-muted" font-size="12">10 km</text>
<rect x="150" y="156" width="420" height="22" fill="#ddd6fe"/><text x="140" y="172" text-anchor="end" class="svg-ink" font-size="12">10GBASE-ER SMF</text><text x="578" y="172" class="svg-muted" font-size="12">40 km</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">Pick the cheapest medium that meets the distance with margin.</text>
</svg><p class="cap">Distance decides the medium: DAC in the rack, copper to the desk, multimode inside the building, single-mode between buildings and beyond.</p></div>

<h3>Transceivers</h3>
<p>A <b>transceiver</b> (optic or module) converts electrical signals to light or copper signalling and plugs into a switch port. Two properties matter for the exam:</p>
<ul>
<li><b>Protocol:</b> Ethernet transceivers and <b>Fibre Channel</b> transceivers (used in SANs) look similar but are not interchangeable.</li>
<li><b>Form factor:</b> <b>SFP</b> (1 Gb/s), <b>SFP+</b> (10 Gb/s), <b>SFP28</b> (25 Gb/s), <b>QSFP+</b> (40 Gb/s, "quad" = four lanes), <b>QSFP28</b> (100 Gb/s), <b>QSFP-DD</b> (400 Gb/s).</li>
</ul>
<p>Both ends of a link must match in speed, wavelength and fibre type: an SR optic on one end and an LR optic on the other will not work. <b>BiDi</b> optics send and receive on different wavelengths over a single strand.</p>

<h3>Connectors</h3>
<table class="cmp"><tr><th>Connector</th><th>Medium</th><th>Recognise it by</th><th>Memory aid</th></tr>
<tr><td>LC</td><td>Fibre</td><td>Small, push-and-latch, usually duplex; standard on SFP optics</td><td><b>L</b>ittle <b>C</b>onnector</td></tr>
<tr><td>SC</td><td>Fibre</td><td>Square, push-pull, larger than LC</td><td><b>S</b>quare <b>C</b>onnector, stick and click</td></tr>
<tr><td>ST</td><td>Fibre</td><td>Round, bayonet twist-lock; legacy</td><td><b>S</b>tick and <b>T</b>wist</td></tr>
<tr><td>MPO</td><td>Fibre</td><td>One rectangular ferrule with 12 or 24 fibres; used for 40G/100G SR4 and trunk cables</td><td><b>M</b>ulti-fibre <b>P</b>ush-<b>O</b>n</td></tr>
<tr><td>RJ45</td><td>Twisted pair</td><td>8 positions, 8 contacts (8P8C); Ethernet</td><td>Wider: 8 wires</td></tr>
<tr><td>RJ11</td><td>Twisted pair</td><td>6 positions, 2 or 4 contacts; analogue phone and DSL</td><td>Narrower: phone</td></tr>
<tr><td>F-type</td><td>Coax</td><td>Screw-on threaded; cable modem and TV</td><td><b>F</b>or cable TV</td></tr>
<tr><td>BNC</td><td>Coax</td><td>Bayonet push-and-twist; CCTV, test gear, old 10BASE2</td><td><b>B</b>ayonet</td></tr>
</table>

<h3>Plenum versus non-plenum</h3>
<p>The <b>plenum</b> is the air-handling space above a drop ceiling or below a raised floor. Cable run there must be <b>plenum-rated</b> (CMP): its jacket resists fire and gives off little toxic smoke. Non-plenum PVC cable (CM) is cheaper but releases toxic smoke when burning, so fire codes forbid it in plenum spaces. Vertical shafts between floors need at least <b>riser</b>-rated (CMR) cable.</p>

<h3>Verifying optics on a switch</h3>
<pre class="code">SW-CORE# show interfaces status</pre>
<pre class="out">Port      Name       Status       Vlan   Duplex  Speed Type
<span class="hl">Te1/1/1   TO-BLDG-B  connected    trunk  full    10G   SFP-10GBase-LR</span>
Te1/1/2   TO-DC-RACK notconnect   1      full    10G   SFP-10GBase-SR
Gi1/0/1   PC-SALES   connected    10     a-full  a-1000 10/100/1000BaseTX</pre>
<p>The Type column tells you which transceiver is in each port, so you can check it against the fibre type and the far end.</p>

<div class="eg"><p><b>Worked example: pick media for a new site.</b> Desks 60 m from the IDF at 1 Gb/s: Cat6 copper, RJ45. IDF to MDF in the same building, 180 m, 10 Gb/s: OM4 multimode, 10GBASE-SR, LC. Building A to building B, 2.5 km: single-mode, 10GBASE-LR, LC. Servers to top-of-rack switch, 2 m, 25 Gb/s: SFP28 DAC. Cable run above the office ceiling: plenum-rated.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Plugging an LR (single-mode) optic into multimode fibre, or mixing SR and LR at two ends of a link. Using Cat6 for 10GBASE-T beyond 55 m. Running PVC cable above a drop ceiling. Assuming a 10G port accepts a 1G SFP without checking.</p></div>

<div class="exam"><p><b>Exam traps.</b> Single-mode = small core, laser, long distance, yellow. Multimode = larger core, 850 nm, short distance, aqua or orange. DAC = twinax copper with fixed transceivers, short. F-type = cable modem; BNC = bayonet coax; RJ11 = phone; RJ45 = Ethernet. LC small, SC square, ST twist, MPO many fibres. Plenum = fire-rated for air spaces.</p></div>

<div class="scn"><h4>The link between buildings that kept flapping</h4><p>A campus added a 10 Gb/s link between two buildings 700 m apart over existing OM3 multimode fibre, using 10GBASE-SR optics. The link came up but flapped several times a day and logged input errors. OM3 supports 10GBASE-SR only to about 300 m; the receiver was right at its sensitivity limit. The team used spare single-mode strands in the same duct and swapped to 10GBASE-LR optics. The link has been clean ever since.</p><p><b>Lesson:</b> check the standard's reach against the real distance and fibre grade before ordering optics.</p></div>

<div class="iv"><p class="q">"When would you choose single-mode fibre over multimode, and what must match on both ends?"</p><p>Strong answer: single-mode has a roughly 9 micron core and uses lasers at 1310 or 1550 nm, so it reaches kilometres; use it between buildings, on campus backbones and for WAN or provider handoffs. Multimode has a 50 or 62.5 micron core and 850 nm sources, cheaper optics, and reaches a few hundred metres, so it suits links inside a building or data center. Both ends must match in fibre type, speed, wavelength and standard (SR to SR, LR to LR), with the right connector (usually LC), and the distance must be inside the optic's reach. Mention DAC for very short in-rack links.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wireless: 802.11, cellular (4G/5G), satellite (GEO about 600 ms, LEO tens of ms).</li>
<li>Copper Ethernet reaches 100 m (Cat6a for 10G); Cat8 does 25/40G to 30 m; coax RG-6 uses F-type.</li>
<li>Multimode: 850 nm, hundreds of metres (SR); single-mode: 1310/1550 nm, kilometres (LR 10 km, ER 40 km).</li>
<li>SFP 1G, SFP+ 10G, SFP28 25G, QSFP+ 40G, QSFP28 100G; Ethernet and Fibre Channel optics differ; DAC for short links.</li>
<li>Connectors: LC, SC, ST, MPO (fibre); RJ45, RJ11 (twisted pair); F-type, BNC (coax). Plenum cable in air spaces.</li>
</ul></div>
`,hi:`
<p>Objective 1.5 sahi <b>physical path</b> chunne ke baare mein hai: wireless ya wired, copper ya fibre, kaunsi cable category, kaunsa optic aur kaunsa connector. Ise saaman ke liye transport chunne jaisa socho: bicycle courier (copper) sasta hai aur sheher ke andar theek hai, train (multimode fibre) medium distance par bahut saara le jaati hai, aur long-haul freight line (single-mode fibre) desh paar karti hai. net-start ne basics bataye the; yahan aap exact standards aur distances seekhte ho jo exam test karta hai.</p>

<h3>Wireless media</h3>
<ul>
<li><b>802.11 (Wi-Fi):</b> 2.4, 5 aur 6 GHz bands mein radio; ek shared, half-duplex medium jo CSMA/CA use karta hai. Standards (a/b/g/n/ac/ax/be), channels aur security wireless module mein cover hote hain.</li>
<li><b>Cellular:</b> mobile operator se 4G LTE aur 5G, router ya modem mein SIM ke through. Backup WAN link, pop-up sites aur IoT ke liye common hai.</li>
<li><b>Satellite:</b> un remote jagahon ke liye jahan zameeni links nahi hain. Traditional <b>geostationary (GEO)</b> satellites lagbhag 35,786 km par ghoomte hain, jisse round-trip latency lagbhag 600 ms hoti hai, jo voice aur interactive apps ko nuksaan karti hai. <b>Low Earth orbit (LEO)</b> constellations kuch sau se lagbhag 1,200 km upar ghoomti hain aur das ke milliseconds ki latency deti hain. Baarish aur rukawatein dono par asar daalti hain.</li>
</ul>

<h3>Copper: twisted pair par 802.3</h3>
<table class="cmp"><tr><th>Standard</th><th>Speed</th><th>Cable</th><th>Max distance</th></tr>
<tr><td>100BASE-TX</td><td>100 Mb/s</td><td>Cat5 ya behtar</td><td>100 m</td></tr>
<tr><td>1000BASE-T</td><td>1 Gb/s</td><td>Cat5e ya behtar</td><td>100 m</td></tr>
<tr><td>2.5G/5GBASE-T</td><td>2.5 / 5 Gb/s</td><td>Cat5e / Cat6</td><td>100 m</td></tr>
<tr><td>10GBASE-T</td><td>10 Gb/s</td><td>Cat6 (55 m) ya Cat6a</td><td>Cat6a par 100 m</td></tr>
<tr><td>25G/40GBASE-T</td><td>25 / 40 Gb/s</td><td>Cat8</td><td>30 m</td></tr>
</table>
<p>Copper <b>coaxial</b> cable ke roop mein bhi aata hai: beech mein conductor aur upar shield. <b>RG-6</b> cable TV aur cable broadband le jaata hai aur screw-on <b>F-type</b> connector use karta hai; <b>RG-59</b> purana aur patla hai, CCTV aur chhote video runs ke liye. <b>Twinaxial</b> (twinax) mein do andar ke conductors hote hain aur yeh DAC cables mein use hota hai.</p>
<p><b>DAC (direct attach copper)</b> ek twinax cable hai jiske dono ends par transceivers hamesha ke liye jude hote hain (SFP+, SFP28 ya QSFP). Yeh sasta, kam power wala aur low-latency hai, server se top-of-rack links ke liye perfect; passive DACs lagbhag 5 se 7 m tak jaate hain. Lambe in-row links ke liye <b>AOC</b> (active optical cable) fibre ke saath yahi kaam karta hai.</p>

<h3>Fibre: single-mode vs multimode</h3>
<table class="cmp"><tr><th></th><th>Multimode (MMF)</th><th>Single-mode (SMF)</th></tr>
<tr><td>Core</td><td>50 ya 62.5 microns</td><td>Lagbhag 9 microns</td></tr>
<tr><td>Light source</td><td>LED ya VCSEL, 850 nm</td><td>Laser, 1310 ya 1550 nm</td></tr>
<tr><td>Distance</td><td>Kuch sau metre</td><td>Kilometres (10, 40, 80 km aur zyada)</td></tr>
<tr><td>Grades aur rang</td><td>OM1-OM5; orange (OM1/OM2), aqua (OM3/OM4), lime (OM5)</td><td>OS1/OS2; yellow jacket</td></tr>
<tr><td>Typical use</td><td>Building ya data center ke andar</td><td>Buildings ke beech, campus backbone, WAN, ISP</td></tr>
</table>
<table class="cmp"><tr><th>Standard</th><th>Fibre aur wavelength</th><th>Reach</th></tr>
<tr><td>1000BASE-SX</td><td>MMF, 850 nm</td><td>Lagbhag 550 m</td></tr>
<tr><td>1000BASE-LX</td><td>SMF, 1310 nm</td><td>5-10 km</td></tr>
<tr><td>10GBASE-SR</td><td>MMF, 850 nm</td><td>OM3 par 300 m, OM4 par 400 m</td></tr>
<tr><td>10GBASE-LR</td><td>SMF, 1310 nm</td><td>10 km</td></tr>
<tr><td>10GBASE-ER</td><td>SMF, 1550 nm</td><td>40 km</td></tr>
<tr><td>40G/100GBASE-SR4</td><td>MMF, 4 fibre pairs, MPO connector</td><td>OM4 par lagbhag 100-150 m</td></tr>
</table>
<p>Letters ka memory aid: <b>S</b>R = <b>S</b>hort reach (multimode), <b>L</b>R = <b>L</b>ong reach (single-mode, 10 km), <b>E</b>R = <b>E</b>xtended reach (40 km). T = twisted pair copper.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Common media ki reach">
<text x="10" y="22" class="svg-ink" font-size="13">Typical maximum reach (scale par nahi)</text>
<rect x="150" y="36" width="30" height="22" fill="#fed7aa"/><text x="140" y="52" text-anchor="end" class="svg-ink" font-size="12">DAC twinax</text><text x="188" y="52" class="svg-muted" font-size="12">5-7 m</text>
<rect x="150" y="66" width="120" height="22" fill="#bae6fd"/><text x="140" y="82" text-anchor="end" class="svg-ink" font-size="12">Cat6a copper</text><text x="278" y="82" class="svg-muted" font-size="12">100 m</text>
<rect x="150" y="96" width="200" height="22" fill="#bbf7d0"/><text x="140" y="112" text-anchor="end" class="svg-ink" font-size="12">10GBASE-SR MMF</text><text x="358" y="112" class="svg-muted" font-size="12">300-400 m</text>
<rect x="150" y="126" width="320" height="22" fill="#fde68a"/><text x="140" y="142" text-anchor="end" class="svg-ink" font-size="12">10GBASE-LR SMF</text><text x="478" y="142" class="svg-muted" font-size="12">10 km</text>
<rect x="150" y="156" width="420" height="22" fill="#ddd6fe"/><text x="140" y="172" text-anchor="end" class="svg-ink" font-size="12">10GBASE-ER SMF</text><text x="578" y="172" class="svg-muted" font-size="12">40 km</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">Sabse sasta medium chuno jo margin ke saath distance poora kare.</text>
</svg><p class="cap">Distance medium decide karta hai: rack mein DAC, desk tak copper, building ke andar multimode, buildings ke beech aur aage single-mode.</p></div>

<h3>Transceivers</h3>
<p><b>Transceiver</b> (optic ya module) electrical signals ko light ya copper signalling mein badalta hai aur switch port mein lagta hai. Exam ke liye do properties important hain:</p>
<ul>
<li><b>Protocol:</b> Ethernet transceivers aur <b>Fibre Channel</b> transceivers (SANs mein use hote hain) ek jaise dikhte hain lekin ek doosre ki jagah nahi lag sakte.</li>
<li><b>Form factor:</b> <b>SFP</b> (1 Gb/s), <b>SFP+</b> (10 Gb/s), <b>SFP28</b> (25 Gb/s), <b>QSFP+</b> (40 Gb/s, "quad" = chaar lanes), <b>QSFP28</b> (100 Gb/s), <b>QSFP-DD</b> (400 Gb/s).</li>
</ul>
<p>Link ke dono ends speed, wavelength aur fibre type mein match hone chahiye: ek end par SR optic aur doosre par LR optic kaam nahi karega. <b>BiDi</b> optics ek hi strand par alag wavelengths par bhejte aur receive karte hain.</p>

<h3>Connectors</h3>
<table class="cmp"><tr><th>Connector</th><th>Medium</th><th>Kaise pehchaano</th><th>Memory aid</th></tr>
<tr><td>LC</td><td>Fibre</td><td>Chhota, push-and-latch, aam taur par duplex; SFP optics par standard</td><td><b>L</b>ittle <b>C</b>onnector</td></tr>
<tr><td>SC</td><td>Fibre</td><td>Square, push-pull, LC se bada</td><td><b>S</b>quare <b>C</b>onnector, stick and click</td></tr>
<tr><td>ST</td><td>Fibre</td><td>Gol, bayonet twist-lock; legacy</td><td><b>S</b>tick and <b>T</b>wist</td></tr>
<tr><td>MPO</td><td>Fibre</td><td>Ek rectangular ferrule mein 12 ya 24 fibres; 40G/100G SR4 aur trunk cables ke liye</td><td><b>M</b>ulti-fibre <b>P</b>ush-<b>O</b>n</td></tr>
<tr><td>RJ45</td><td>Twisted pair</td><td>8 positions, 8 contacts (8P8C); Ethernet</td><td>Chauda: 8 wires</td></tr>
<tr><td>RJ11</td><td>Twisted pair</td><td>6 positions, 2 ya 4 contacts; analogue phone aur DSL</td><td>Patla: phone</td></tr>
<tr><td>F-type</td><td>Coax</td><td>Screw-on threaded; cable modem aur TV</td><td>Cable TV ke liye <b>F</b></td></tr>
<tr><td>BNC</td><td>Coax</td><td>Bayonet push-and-twist; CCTV, test gear, purana 10BASE2</td><td><b>B</b>ayonet</td></tr>
</table>

<h3>Plenum vs non-plenum</h3>
<p><b>Plenum</b> drop ceiling ke upar ya raised floor ke neeche ki air-handling jagah hai. Wahan chalne wali cable <b>plenum-rated</b> (CMP) honi chahiye: uski jacket aag rokti hai aur kam zehreela dhuaan deti hai. Non-plenum PVC cable (CM) sasti hai lekin jalne par zehreela dhuaan chhodti hai, isliye fire codes use plenum spaces mein mana karte hain. Floors ke beech vertical shafts ko kam se kam <b>riser</b>-rated (CMR) cable chahiye.</p>

<h3>Switch par optics verify karna</h3>
<pre class="code">SW-CORE# show interfaces status</pre>
<pre class="out">Port      Name       Status       Vlan   Duplex  Speed Type
<span class="hl">Te1/1/1   TO-BLDG-B  connected    trunk  full    10G   SFP-10GBase-LR</span>
Te1/1/2   TO-DC-RACK notconnect   1      full    10G   SFP-10GBase-SR
Gi1/0/1   PC-SALES   connected    10     a-full  a-1000 10/100/1000BaseTX</pre>
<p>Type column batata hai ki har port mein kaunsa transceiver hai, taaki aap use fibre type aur far end se check kar sako.</p>

<div class="eg"><p><b>Worked example: nayi site ke liye media chuno.</b> IDF se 60 m door desks 1 Gb/s par: Cat6 copper, RJ45. Same building mein IDF se MDF, 180 m, 10 Gb/s: OM4 multimode, 10GBASE-SR, LC. Building A se building B, 2.5 km: single-mode, 10GBASE-LR, LC. Servers se top-of-rack switch, 2 m, 25 Gb/s: SFP28 DAC. Office ceiling ke upar cable run: plenum-rated.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> LR (single-mode) optic ko multimode fibre mein lagana, ya link ke do ends par SR aur LR mix karna. 55 m se aage 10GBASE-T ke liye Cat6 use karna. Drop ceiling ke upar PVC cable chalana. Bina check kiye maan lena ki 10G port 1G SFP le lega.</p></div>

<div class="exam"><p><b>Exam traps.</b> Single-mode = chhota core, laser, lambi doori, yellow. Multimode = bada core, 850 nm, chhoti doori, aqua ya orange. DAC = fixed transceivers wala twinax copper, chhota. F-type = cable modem; BNC = bayonet coax; RJ11 = phone; RJ45 = Ethernet. LC chhota, SC square, ST twist, MPO bahut saare fibres. Plenum = air spaces ke liye fire-rated.</p></div>

<div class="scn"><h4>Buildings ke beech ka link jo baar baar flap karta tha</h4><p>Ek campus ne 700 m door do buildings ke beech existing OM3 multimode fibre par 10GBASE-SR optics ke saath 10 Gb/s link joda. Link up hua lekin din mein kai baar flap karta tha aur input errors log karta tha. OM3 10GBASE-SR ko sirf lagbhag 300 m tak support karta hai; receiver apni sensitivity limit par tha. Team ne same duct ke spare single-mode strands use kiye aur 10GBASE-LR optics lagaye. Tab se link saaf chal raha hai.</p><p><b>Seekh:</b> optics order karne se pehle standard ki reach ko asli distance aur fibre grade se check karo.</p></div>

<div class="iv"><p class="q">"Aap multimode ki jagah single-mode fibre kab chunoge, aur dono ends par kya match hona chahiye?"</p><p>Strong answer: single-mode ka core lagbhag 9 micron hai aur yeh 1310 ya 1550 nm par lasers use karta hai, isliye kilometres tak jaata hai; ise buildings ke beech, campus backbones aur WAN ya provider handoffs par use karo. Multimode ka core 50 ya 62.5 micron hai aur 850 nm sources, saste optics, aur kuch sau metre ki reach hai, isliye building ya data center ke andar ke links ke liye theek hai. Dono ends fibre type, speed, wavelength aur standard (SR se SR, LR se LR) mein match hone chahiye, sahi connector (aam taur par LC) ke saath, aur distance optic ki reach ke andar honi chahiye. Bahut chhote in-rack links ke liye DAC mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wireless: 802.11, cellular (4G/5G), satellite (GEO lagbhag 600 ms, LEO das ke ms).</li>
<li>Copper Ethernet 100 m tak jaata hai (10G ke liye Cat6a); Cat8 30 m tak 25/40G karta hai; coax RG-6 F-type use karta hai.</li>
<li>Multimode: 850 nm, kuch sau metre (SR); single-mode: 1310/1550 nm, kilometres (LR 10 km, ER 40 km).</li>
<li>SFP 1G, SFP+ 10G, SFP28 25G, QSFP+ 40G, QSFP28 100G; Ethernet aur Fibre Channel optics alag hain; chhote links ke liye DAC.</li>
<li>Connectors: LC, SC, ST, MPO (fibre); RJ45, RJ11 (twisted pair); F-type, BNC (coax). Air spaces mein plenum cable.</li>
</ul></div>
`}};export{e as default};