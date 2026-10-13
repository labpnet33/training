var e={id:`goals`,h:{en:`What you will learn: the big picture of Wi-Fi`,hi:`Aap kya seekhoge: Wi-Fi ki big picture`},body:{en:`
<p>Picture a school trip where every teacher carries a walkie-talkie. Everyone on the same channel hears every message. Only one person can talk at a time; if two press the button together, both messages are garbled and they must try again. A louder voice reaches further, a thick wall muffles it, and a group on a different channel can talk at the same time without disturbing you. That is almost exactly how Wi-Fi works. Keep this picture in mind: most wireless problems you will ever troubleshoot are a version of "too many people on one channel", "the voice is too weak" or "the listener does not know the password".</p>

<h3>What you will learn</h3>
<ul>
<li>Radio basics: frequency, wavelength, amplitude, and the three Wi-Fi bands (2.4, 5 and 6 GHz).</li>
<li>Power maths in <b>mW</b> and <b>dBm</b> with the 3 dB and 10 dB rules, plus RSSI, noise floor and SNR.</li>
<li>How walls, metal, water and people change a signal: absorption, reflection, refraction, scattering.</li>
<li>The 802.11 standards from 802.11b to 802.11be (Wi-Fi 4, 5, 6, 6E and 7), with bands and speeds.</li>
<li>Channels: why 2.4 GHz has only three clean channels (1, 6, 11), 5 and 6 GHz channels, channel width and bonding.</li>
<li>The vocabulary: SSID, BSSID, BSS, ESS, IBSS, and how clients roam.</li>
<li>Cisco AP modes: local, FlexConnect, monitor, sniffer and bridge.</li>
<li>802.11 frame types and the step-by-step join (association) process.</li>
<li>Security overview: WPA2 and WPA3, PSK versus 802.1X.</li>
<li>Site surveys and channel planning, then a repeatable client troubleshooting workflow.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should be comfortable with the OSI layers and MAC addresses (module ccna-models), IPv4 addresses, masks and the idea of a default gateway (ccna-ipv4), and you should know roughly what DHCP does. A basic idea of what a <b>VLAN</b> is helps; VLANs are covered in depth later in the switching domain. No radio or physics background is needed; we build everything from zero.</p>

<h3>Wired versus wireless</h3>
<p>On a switched Ethernet port, your PC has a private cable to the switch and can send and receive at the same time (<b>full duplex</b>). In Wi-Fi, the air is one shared medium. On a given channel only one radio can transmit at a time, so Wi-Fi is <b>half duplex</b>. Because a radio cannot hear a collision while it is transmitting, Wi-Fi does not use CSMA/CD like old Ethernet hubs. It uses <b>CSMA/CA</b> (carrier sense multiple access with collision avoidance): listen first, wait a random back-off time if the channel is busy, transmit, and expect an <b>ACK</b>. No ACK means the frame is resent.</p>

<table class="cmp"><tr><th>Property</th><th>Wired Ethernet (802.3)</th><th>Wi-Fi (802.11)</th></tr>
<tr><td>Medium</td><td>Private copper or fibre per port</td><td>Shared air, per channel</td></tr>
<tr><td>Duplex</td><td>Full duplex</td><td>Half duplex</td></tr>
<tr><td>Access method</td><td>None needed on switch ports (CSMA/CD only on legacy half duplex)</td><td>CSMA/CA with ACKs</td></tr>
<tr><td>Security boundary</td><td>You must plug in to a port</td><td>Anyone in range can hear; encryption is essential</td></tr>
<tr><td>Performance killers</td><td>Duplex mismatch, errors</td><td>Weak signal, noise, interference, too many clients</td></tr></table>

<p>Three groups shape Wi-Fi. The <b>IEEE 802.11</b> working group writes the standards (802.11ac, 802.11ax). The <b>Wi-Fi Alliance</b> tests products for interoperability and gives the friendly names (Wi-Fi 5, Wi-Fi 6) and the security certifications (WPA2, WPA3). Each country's <b>regulator</b> decides which frequencies and power levels are allowed; in India that is the Department of Telecommunications through its WPC wing.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab topology">
<rect x="10" y="150" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="65" y="172" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1</text><text x="65" y="188" text-anchor="middle" class="svg-muted" font-size="12">client</text>
<rect x="170" y="150" width="110" height="46" rx="8" fill="#bae6fd"/><text x="225" y="172" text-anchor="middle" class="svg-ink" font-size="13">AP1..AP3</text><text x="225" y="188" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10</text>
<path d="M125 160 q10 -12 20 0 t20 0" fill="none" stroke="#64748b" stroke-width="1.5"/><path d="M125 180 q10 -12 20 0 t20 0" fill="none" stroke="#64748b" stroke-width="1.5"/>
<text x="145" y="140" text-anchor="middle" class="svg-accent" font-size="12">air</text>
<rect x="330" y="150" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="385" y="178" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<line x1="280" y1="173" x2="330" y2="173" stroke="#64748b" stroke-width="2"/><text x="305" y="215" text-anchor="middle" class="svg-muted" font-size="12">wire</text>
<rect x="500" y="150" width="120" height="46" rx="8" fill="#ddd6fe"/><text x="560" y="172" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="560" y="188" text-anchor="middle" class="svg-muted" font-size="12">10.10.99.10</text>
<line x1="440" y1="173" x2="500" y2="173" stroke="#64748b" stroke-width="2"/><text x="470" y="165" text-anchor="middle" class="svg-muted" font-size="12">trunk</text>
<rect x="330" y="30" width="110" height="46" rx="8" fill="#fde68a"/><text x="385" y="52" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="385" y="68" text-anchor="middle" class="svg-muted" font-size="12">gateway, DHCP</text>
<line x1="385" y1="76" x2="385" y2="150" stroke="#64748b" stroke-width="2"/><text x="395" y="118" class="svg-muted" font-size="12">trunk</text>
<rect x="500" y="30" width="120" height="46" rx="8" fill="#fed7aa"/><text x="560" y="52" text-anchor="middle" class="svg-ink" font-size="13">SRV1</text><text x="560" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.10.50.10</text>
<line x1="440" y1="53" x2="500" y2="53" stroke="#64748b" stroke-width="2"/>
<text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="12">STAFF VLAN 20 = 10.10.20.0/24, GUEST VLAN 30 = 10.10.30.0/24</text>
</svg><p class="cap">The lab topology used in this module: only the last hop, client to AP, is radio. Everything behind the AP is ordinary switching and routing.</p></div>

<h3>Why it matters</h3>
<p>Most users today never plug in a cable. When "the network is slow" or "I cannot connect", the fault is usually in the radio part or in the join process, not in routing. An engineer who can read a signal level, pick channels and walk a client through the join process step by step solves in minutes what others guess at for days. The CCNA exam tests these principles directly, and interviewers love Wi-Fi questions because they reveal whether you understand shared media.</p>

<div class="eg"><p><b>Worked example.</b> An AP shows a connection rate of 300 Mbps to one laptop. Because of CSMA/CA overhead, ACKs and retries, real throughput on one channel is often about half the connection rate, roughly 150 Mbps. If 30 students in the NK training hall all download at once on the same channel, they share that airtime: about 150 / 30 = 5 Mbps each. Put neighbouring APs on different channels and each channel has its own airtime, so capacity multiplies.</p></div>

<p>In the labs of this module you will do exactly that: read the channel plan on WLC1, move AP1, AP2 and AP3 to non-overlapping channels, shrink a cell with transmit power, and then fix a laptop that cannot join NK-STAFF. Configuring the controller itself, creating WLANs and choosing security in the GUI, belongs to the later module ccna-wlan; here we focus on the principles that make those settings meaningful.</p>

<div class="warn"><p><b>Common mistake.</b> Believing the speed printed on the router box ("AX3000") is what each user gets. That number is the sum of the maximum PHY rates of all radios under ideal conditions. Real per-user throughput depends on signal, interference and how many clients share the channel.</p></div>

<div class="exam"><p><b>Exam trap.</b> 802.11 uses <b>CSMA/CA</b>, not CSMA/CD, and it is <b>half duplex</b>. The IEEE writes the standards; the Wi-Fi Alliance certifies products and owns the names Wi-Fi 6 and WPA3.</p></div>

<div class="scn"><h4>The hall that crawled when it filled up</h4><p>Network Kings opened a new training hall with three ceiling APs. With five people inside, Wi-Fi was fast. With forty students, pages timed out. The engineer checked the controller and found all three APs on 2.4 GHz channel 1 and 5 GHz channel 36, the factory defaults. All three cells were one big collision domain sharing one channel's airtime. Moving the APs to channels 1, 6 and 11 on 2.4 GHz and 36, 40 and 44 on 5 GHz tripled usable capacity without buying anything.</p><p><b>Lesson:</b> in Wi-Fi, capacity comes from separate channels, not from more APs on the same channel.</p></div>

<div class="iv"><p class="q">"How is Wi-Fi different from wired Ethernet?"</p><p>Strong answer: Wi-Fi is a shared, half-duplex medium; on each channel only one radio talks at a time, controlled by CSMA/CA with acknowledgements, while switched Ethernet is full duplex with a private link per port. Mention that the air is open to anyone in range, so encryption and authentication are mandatory, and that performance depends on signal, noise and airtime, not only on link speed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wi-Fi behaves like a walkie-talkie group: shared channel, one talker at a time.</li>
<li>802.11 is half duplex and uses CSMA/CA with ACKs.</li>
<li>IEEE writes standards, the Wi-Fi Alliance certifies and names them, regulators set frequencies and power.</li>
<li>More capacity comes from more non-overlapping channels, not more APs on one channel.</li>
<li>This module teaches principles; WLC configuration comes in ccna-wlan.</li>
</ul></div>
`,hi:`
<p>Ek school trip socho jahan har teacher ke paas walkie-talkie hai. Same channel par sab log har message sunte hain. Ek time par sirf ek insaan bol sakta hai; agar do log saath mein button dabayein, to dono messages bigad jaate hain aur unhe dobara try karna padta hai. Tez awaaz door tak jaati hai, moti deewar use dabaa deti hai, aur alag channel wala group usi time bina aapko disturb kiye baat kar sakta hai. Wi-Fi bilkul aise hi kaam karta hai. Yeh picture dimaag mein rakho: jitni bhi wireless problems aap kabhi troubleshoot karoge, zyada tar inka koi roop hongi: "ek channel par bahut saare log", "awaaz bahut kamzor hai" ya "sunne wale ko password nahi pata".</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li>Radio basics: frequency, wavelength, amplitude, aur teen Wi-Fi bands (2.4, 5 aur 6 GHz).</li>
<li><b>mW</b> aur <b>dBm</b> mein power maths, 3 dB aur 10 dB rules ke saath, plus RSSI, noise floor aur SNR.</li>
<li>Deewar, metal, paani aur log signal ko kaise badalte hain: absorption, reflection, refraction, scattering.</li>
<li>802.11b se 802.11be tak ke 802.11 standards (Wi-Fi 4, 5, 6, 6E aur 7), bands aur speeds ke saath.</li>
<li>Channels: 2.4 GHz mein sirf teen clean channels (1, 6, 11) kyun hain, 5 aur 6 GHz channels, channel width aur bonding.</li>
<li>Vocabulary: SSID, BSSID, BSS, ESS, IBSS, aur clients roam kaise karte hain.</li>
<li>Cisco AP modes: local, FlexConnect, monitor, sniffer aur bridge.</li>
<li>802.11 frame types aur step-by-step join (association) process.</li>
<li>Security overview: WPA2 aur WPA3, PSK vs 802.1X.</li>
<li>Site surveys aur channel planning, phir ek repeatable client troubleshooting workflow.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko OSI layers aur MAC addresses (module ccna-models), IPv4 addresses, masks aur default gateway ka idea (ccna-ipv4) aana chahiye, aur roughly pata hona chahiye ki DHCP kya karta hai. <b>VLAN</b> kya hota hai iska basic idea madad karta hai; VLANs switching domain mein baad mein detail se aate hain. Koi radio ya physics background nahi chahiye; hum sab kuch zero se banayenge.</p>

<h3>Wired vs wireless</h3>
<p>Switched Ethernet port par aapke PC ka switch tak ek private cable hota hai aur woh ek saath send aur receive kar sakta hai (<b>full duplex</b>). Wi-Fi mein hawa ek shared medium hai. Kisi ek channel par ek time par sirf ek radio transmit kar sakta hai, isliye Wi-Fi <b>half duplex</b> hai. Kyunki radio transmit karte waqt collision sun nahi sakta, Wi-Fi purane Ethernet hubs jaisa CSMA/CD use nahi karta. Woh <b>CSMA/CA</b> (carrier sense multiple access with collision avoidance) use karta hai: pehle suno, channel busy ho to random back-off time wait karo, transmit karo, aur ek <b>ACK</b> ki ummeed rakho. ACK nahi aaya matlab frame dobara bheja jaata hai.</p>

<table class="cmp"><tr><th>Property</th><th>Wired Ethernet (802.3)</th><th>Wi-Fi (802.11)</th></tr>
<tr><td>Medium</td><td>Har port ka private copper ya fibre</td><td>Shared hawa, har channel par</td></tr>
<tr><td>Duplex</td><td>Full duplex</td><td>Half duplex</td></tr>
<tr><td>Access method</td><td>Switch ports par zaroorat nahi (CSMA/CD sirf legacy half duplex par)</td><td>ACKs ke saath CSMA/CA</td></tr>
<tr><td>Security boundary</td><td>Port mein plug karna padta hai</td><td>Range mein koi bhi sun sakta hai; encryption zaroori</td></tr>
<tr><td>Performance killers</td><td>Duplex mismatch, errors</td><td>Kamzor signal, noise, interference, bahut saare clients</td></tr></table>

<p>Teen groups Wi-Fi ko shape karte hain. <b>IEEE 802.11</b> working group standards likhta hai (802.11ac, 802.11ax). <b>Wi-Fi Alliance</b> products ko interoperability ke liye test karta hai aur friendly naam (Wi-Fi 5, Wi-Fi 6) aur security certifications (WPA2, WPA3) deta hai. Har desh ka <b>regulator</b> tay karta hai ki kaunsi frequencies aur power levels allowed hain; India mein yeh Department of Telecommunications apne WPC wing ke through karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab topology">
<rect x="10" y="150" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="65" y="172" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1</text><text x="65" y="188" text-anchor="middle" class="svg-muted" font-size="12">client</text>
<rect x="170" y="150" width="110" height="46" rx="8" fill="#bae6fd"/><text x="225" y="172" text-anchor="middle" class="svg-ink" font-size="13">AP1..AP3</text><text x="225" y="188" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10</text>
<path d="M125 160 q10 -12 20 0 t20 0" fill="none" stroke="#64748b" stroke-width="1.5"/><path d="M125 180 q10 -12 20 0 t20 0" fill="none" stroke="#64748b" stroke-width="1.5"/>
<text x="145" y="140" text-anchor="middle" class="svg-accent" font-size="12">hawa</text>
<rect x="330" y="150" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="385" y="178" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<line x1="280" y1="173" x2="330" y2="173" stroke="#64748b" stroke-width="2"/><text x="305" y="215" text-anchor="middle" class="svg-muted" font-size="12">taar</text>
<rect x="500" y="150" width="120" height="46" rx="8" fill="#ddd6fe"/><text x="560" y="172" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="560" y="188" text-anchor="middle" class="svg-muted" font-size="12">10.10.99.10</text>
<line x1="440" y1="173" x2="500" y2="173" stroke="#64748b" stroke-width="2"/><text x="470" y="165" text-anchor="middle" class="svg-muted" font-size="12">trunk</text>
<rect x="330" y="30" width="110" height="46" rx="8" fill="#fde68a"/><text x="385" y="52" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="385" y="68" text-anchor="middle" class="svg-muted" font-size="12">gateway, DHCP</text>
<line x1="385" y1="76" x2="385" y2="150" stroke="#64748b" stroke-width="2"/><text x="395" y="118" class="svg-muted" font-size="12">trunk</text>
<rect x="500" y="30" width="120" height="46" rx="8" fill="#fed7aa"/><text x="560" y="52" text-anchor="middle" class="svg-ink" font-size="13">SRV1</text><text x="560" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.10.50.10</text>
<line x1="440" y1="53" x2="500" y2="53" stroke="#64748b" stroke-width="2"/>
<text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="12">STAFF VLAN 20 = 10.10.20.0/24, GUEST VLAN 30 = 10.10.30.0/24</text>
</svg><p class="cap">Is module ki lab topology: sirf aakhri hop, client se AP, radio hai. AP ke peeche sab kuch normal switching aur routing hai.</p></div>

<h3>Yeh kyun zaroori hai</h3>
<p>Aaj zyada tar users kabhi cable plug nahi karte. Jab "network slow hai" ya "main connect nahi kar pa raha", to fault aam taur par radio wale hisse mein ya join process mein hota hai, routing mein nahi. Jo engineer signal level padh sakta hai, channels chun sakta hai aur client ko join process mein step by step le ja sakta hai, woh minutes mein woh solve karta hai jiska doosre din bhar andaaza lagate rehte hain. CCNA exam in principles ko seedha test karta hai, aur interviewers ko Wi-Fi questions pasand hain kyunki unse pata chalta hai ki aap shared media samajhte ho ya nahi.</p>

<div class="eg"><p><b>Worked example.</b> Ek AP ek laptop ko 300 Mbps connection rate dikhata hai. CSMA/CA overhead, ACKs aur retries ki wajah se ek channel par real throughput aksar connection rate ka lagbhag aadha hota hai, roughly 150 Mbps. Agar NK training hall mein 30 students ek saath same channel par download karein, to woh airtime share karte hain: har ek ko lagbhag 150 / 30 = 5 Mbps. Padosi APs ko alag channels par daalo aur har channel ka apna airtime hota hai, isliye capacity multiply hoti hai.</p></div>

<p>Is module ki labs mein aap bilkul yahi karoge: WLC1 par channel plan padhoge, AP1, AP2 aur AP3 ko non-overlapping channels par le jaoge, transmit power se ek cell chhota karoge, aur phir ek laptop ko theek karoge jo NK-STAFF join nahi kar pa raha. Controller ko khud configure karna, GUI mein WLANs banana aur security chunna, baad ke module ccna-wlan ka kaam hai; yahan hum un principles par focus karte hain jo un settings ko meaningful banate hain.</p>

<div class="warn"><p><b>Common galti.</b> Yeh maanna ki router box par chhapi speed ("AX3000") har user ko milti hai. Woh number ideal conditions mein saare radios ke maximum PHY rates ka jod hai. Real per-user throughput signal, interference aur channel share karne wale clients ki sankhya par depend karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> 802.11 <b>CSMA/CA</b> use karta hai, CSMA/CD nahi, aur yeh <b>half duplex</b> hai. IEEE standards likhta hai; Wi-Fi Alliance products certify karta hai aur Wi-Fi 6 aur WPA3 naamon ka maalik hai.</p></div>

<div class="scn"><h4>Woh hall jo bharte hi reng gaya</h4><p>Network Kings ne teen ceiling APs ke saath naya training hall khola. Andar paanch log the to Wi-Fi tez tha. Chaalees students aaye to pages time out hone lage. Engineer ne controller check kiya aur dekha ki teeno APs 2.4 GHz channel 1 aur 5 GHz channel 36 par the, factory defaults. Teeno cells ek bada collision domain the jo ek channel ka airtime share kar rahe the. APs ko 2.4 GHz par channels 1, 6 aur 11 aur 5 GHz par 36, 40 aur 44 par le jaane se bina kuch khareede usable capacity teen guna ho gayi.</p><p><b>Seekh:</b> Wi-Fi mein capacity alag channels se aati hai, same channel par zyada APs se nahi.</p></div>

<div class="iv"><p class="q">"Wi-Fi wired Ethernet se kaise alag hai?"</p><p>Strong answer: Wi-Fi ek shared, half-duplex medium hai; har channel par ek time par sirf ek radio bolta hai, jise acknowledgements ke saath CSMA/CA control karta hai, jabki switched Ethernet har port par private link ke saath full duplex hai. Batao ki hawa range mein kisi ke liye bhi khuli hai, isliye encryption aur authentication zaroori hain, aur performance signal, noise aur airtime par depend karti hai, sirf link speed par nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wi-Fi walkie-talkie group jaisa hai: shared channel, ek time par ek bolne wala.</li>
<li>802.11 half duplex hai aur ACKs ke saath CSMA/CA use karta hai.</li>
<li>IEEE standards likhta hai, Wi-Fi Alliance certify karke naam deta hai, regulators frequencies aur power tay karte hain.</li>
<li>Zyada capacity zyada non-overlapping channels se aati hai, ek channel par zyada APs se nahi.</li>
<li>Yeh module principles sikhata hai; WLC configuration ccna-wlan mein aata hai.</li>
</ul></div>
`}};export{e as default};