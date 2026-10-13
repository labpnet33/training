var e={id:`where-to-capture`,h:{en:`Where to capture: host, SPAN, TAP and on the router`,hi:`Kahan capture karein: host, SPAN, TAP aur router par`},body:{en:`
<p>Think of a doctor listening to your heart. Where she places the stethoscope decides what she hears. Put it on the wrong side of the chest and the heart sounds faint or missing, even though it is beating perfectly. Captures work the same way: the <b>capture point</b> decides what you can see, and the wrong point makes a healthy network look broken.</p>

<h3>Why a switch hides traffic from you</h3>
<p>In the old days of hubs, every frame was repeated out of every port, so any PC could see everybody's traffic. A <b>switch</b> learns MAC addresses and forwards a unicast frame only out of the port where the destination lives. If you plug a laptop into a spare switch port and run Wireshark, you will see only broadcasts (ARP requests, DHCP Discovers), some multicasts and traffic addressed to your own laptop. You will <b>not</b> see a conversation between two other hosts. To see it you need one of the four methods below.</p>

<h3>1. Capture on the host itself</h3>
<p>Run Wireshark or <code>tcpdump</code> on the client or server that has the problem. It is the easiest method and sees exactly what that host sends and receives, including loopback traffic. The limits: you need admin rights on the machine, you cannot do it on printers, IP phones or cameras, and a busy server may drop packets while capturing. Modern NICs also use <b>offloading</b>: the capture may show oversized TCP segments or "incorrect checksum" warnings because the NIC finishes those jobs after the capture point. That is normal, not a fault.</p>

<h3>2. SPAN: port mirroring on the switch</h3>
<p><b>SPAN</b> (Switched Port Analyzer), also called port mirroring, tells the switch to copy frames from one or more <b>source</b> ports or VLANs to a <b>destination</b> port where your analyser sits. <b>RSPAN</b> carries the copy across switches in a dedicated remote-SPAN VLAN, and <b>ERSPAN</b> wraps it in GRE so it can cross a routed network.</p>
<pre class="code"><span class="c">! copy everything in and out of Gi0/1 to the laptop on Gi0/24</span>
SW1(config)# monitor session 1 source interface GigabitEthernet0/1 both
SW1(config)# monitor session 1 destination interface GigabitEthernet0/24
SW1# show monitor session 1</pre>
<pre class="out">Session 1
---------
<span class="hl">Type                   : Local Session</span>
Source Ports           :
    <span class="hl">Both               : Gi0/1</span>
<span class="hl">Destination Ports      : Gi0/24</span>
    Encapsulation      : Native
          Ingress      : Disabled</pre>
<p>Facts to remember: the destination port stops acting as a normal switch port (it does not take part in STP or forward normal traffic); a busy source can oversubscribe the destination so the copy <b>drops frames</b> under load; and by default SPAN does not copy frames with errors (runts, CRC errors), because the switch discards them first.</p>

<h3>3. A network TAP</h3>
<p>A <b>TAP</b> (Test Access Point) is a small hardware device inserted inline in a cable. It copies every bit in both directions to monitor ports. Because it works in hardware it never drops frames under load, copies errored frames too, and cannot be misconfigured by a change on the switch. The price: you must break the link briefly to insert it, and it costs money. Data centers often leave permanent TAPs on critical links so a capture is always one click away.</p>

<h3>4. Embedded packet capture on the router or switch</h3>
<p>Cisco IOS XE can capture on the device itself with <b>Embedded Packet Capture</b> (EPC), configured with <code>monitor capture</code>. You name a capture, attach it to an interface and direction, add a match, start it, look at the buffer and export it as a .pcap file to flash. At CCNA level you only need to know that it exists and why it is useful: no laptop, no SPAN port, and it works on a remote site at 2 a.m.</p>
<pre class="code"><span class="c">! IOS XE: capture both directions on Gi1/0/1, then save a pcap</span>
R1# monitor capture CAP interface GigabitEthernet1/0/1 both
R1# monitor capture CAP match ipv4 any any
R1# monitor capture CAP start
R1# monitor capture CAP stop
R1# show monitor capture CAP buffer brief
R1# monitor capture CAP export flash:cap1.pcap</pre>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Four capture points">
<rect x="20" y="90" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="120" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="265" y="90" width="110" height="50" rx="8" fill="#bae6fd"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="510" y="90" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="565" y="120" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<line x1="130" y1="115" x2="265" y2="115" stroke="#64748b" stroke-width="2"/><line x1="375" y1="115" x2="510" y2="115" stroke="#64748b" stroke-width="2"/>
<rect x="420" y="102" width="46" height="26" rx="4" fill="#fde68a"/><text x="443" y="120" text-anchor="middle" class="svg-ink" font-size="12">TAP</text>
<text x="75" y="75" text-anchor="middle" class="svg-accent" font-size="12">1 host capture</text>
<text x="320" y="75" text-anchor="middle" class="svg-accent" font-size="12">2 SPAN copy</text>
<rect x="265" y="170" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">Analyser</text>
<line x1="320" y1="140" x2="320" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<text x="443" y="75" text-anchor="middle" class="svg-accent" font-size="12">3 TAP</text>
<text x="565" y="75" text-anchor="middle" class="svg-accent" font-size="12">4 EPC on R1</text>
</svg><p class="cap">Four ways to see the same conversation. The lab capture panel behaves like a TAP on the link you choose.</p></div>

<h3>Choosing the point: close to the problem, and on both sides</h3>
<p>Start at the link <b>closest to the symptom</b>, usually the client or the server. If the request is visible but the reply is not, move one hop along the path and capture again, or capture on <b>both sides</b> of the suspected device at the same time. If a packet enters a router on one side and never leaves on the other, that router dropped it: check its ACLs, routes and NAT.</p>

<h3>How it works in this course's labs</h3>
<p>Every lab has a <b>Capture packets</b> button. It opens the capture panel with a link selector: <b>All links</b>, or one link such as <code>PC1 eth0 ↔ SW1 Gi0/1</code>. The panel behaves like a TAP on that cable: it sees both directions, never drops, and marks each frame with "Captured on" in the frame details. The red dot next to "Capturing on" shows it is running; the pause button freezes it, and <b>Clear</b> empties the list. Some protocol traffic, such as periodic OSPF Hellos, is generated only while a capture is open, so start the capture <b>before</b> you reproduce the problem.</p>

<div class="eg"><p><b>Worked example.</b> In Lab 3 you want R2's Hellos toward R1. Choose the link <code>R1 Gi0/0 ↔ R2 Gi0/0</code>, not "All links". With all links selected you would also see R2 and R3 exchanging Hellos on 10.0.23.0/30, and two different problems would mix in one list. One link, one conversation.</p></div>

<div class="warn"><p><b>Common mistake.</b> Plugging a laptop into a random access port and expecting to see another PC's traffic. A switch only floods broadcasts and unknown unicasts. Without SPAN, a TAP or a capture on the host, the conversation you care about never reaches your laptop.</p></div>

<div class="exam"><p><b>Exam trap.</b> SPAN copies traffic; it does not redirect it. The original frame still goes to its real destination. Also remember: local SPAN stays inside one switch, RSPAN uses a special VLAN across switches, ERSPAN uses GRE across a routed network.</p></div>

<div class="scn"><h4>The capture that lied under load</h4><p>An engineer mirrored a 10 Gbps uplink to a 1 Gbps laptop port to investigate slow backups. The capture showed hundreds of "missing" segments and TCP retransmissions, and the team almost replaced the uplink optics. A second engineer noticed that the SPAN destination was far slower than the source. They repeated the capture with a hardware TAP and a 10 Gbps capture card: no loss at all. The real problem, found later, was a disk on the backup server.</p><p><b>Lesson:</b> SPAN can drop copies when the destination is oversubscribed. Before trusting "missing" packets, make sure the capture point itself could keep up.</p></div>

<div class="iv"><p class="q">"What is the difference between SPAN and a TAP, and when would you use each?"</p><p>Strong answer: SPAN is a switch feature that copies frames from source ports or VLANs to a destination port; it is free and quick to configure, but it can drop copies under load and normally does not copy errored frames. A TAP is inline hardware that copies every bit in both directions without loss, including errors, but requires breaking the link to install. I use SPAN for quick checks and a TAP for high-rate links or when I must prove loss. Mention RSPAN, ERSPAN and embedded packet capture as alternatives.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A switch does not send other hosts' unicast frames to your laptop; you need a real capture method.</li>
<li>Four methods: host capture, SPAN/RSPAN/ERSPAN, a hardware TAP, and embedded packet capture on the device.</li>
<li>SPAN copies, never redirects, and can drop copies when the destination is oversubscribed.</li>
<li>Capture close to the symptom first, then on both sides of a suspect device.</li>
<li>In the labs, pick one link in the selector and start the capture before reproducing the problem.</li>
</ul></div>
`,hi:`
<p>Socho ek doctor aapka dil sun rahi hai. Stethoscope kahan rakhti hai, usi se tay hota hai ki kya sunai dega. Chest ki galat side par rakho to dil ki awaaz dheemi ya gayab lagegi, jabki dil bilkul theek dhadak raha hai. Captures bhi aise hi kaam karte hain: <b>capture point</b> tay karta hai ki aap kya dekh sakte ho, aur galat point ek healthy network ko bhi kharab dikha deta hai.</p>

<h3>Switch aapse traffic kyun chhupata hai</h3>
<p>Purane hubs ke zamane mein har frame har port se repeat hota tha, isliye koi bhi PC sabka traffic dekh sakta tha. <b>Switch</b> MAC addresses seekhta hai aur unicast frame sirf usi port se bhejta hai jahan destination hai. Agar aap laptop ko switch ke khaali port mein lagao aur Wireshark chalao, to aapko sirf broadcasts (ARP requests, DHCP Discovers), kuch multicasts aur apne laptop ke liye aaya traffic dikhega. Do dusre hosts ki baatcheet aapko <b>nahi</b> dikhegi. Use dekhne ke liye neeche ke chaar methods mein se ek chahiye.</p>

<h3>1. Host par hi capture</h3>
<p>Jis client ya server mein problem hai, us par Wireshark ya <code>tcpdump</code> chalao. Yeh sabse aasaan method hai aur bilkul wahi dekhta hai jo woh host bhejta aur receive karta hai, loopback traffic bhi. Limits: machine par admin rights chahiye, printers, IP phones ya cameras par yeh nahi kar sakte, aur busy server capture karte waqt packets drop kar sakta hai. Modern NICs <b>offloading</b> bhi karte hain: capture mein bade TCP segments ya "incorrect checksum" warnings dikh sakti hain kyunki NIC yeh kaam capture point ke baad poora karta hai. Yeh normal hai, fault nahi.</p>

<h3>2. SPAN: switch par port mirroring</h3>
<p><b>SPAN</b> (Switched Port Analyzer), jise port mirroring bhi kehte hain, switch ko bolta hai ki ek ya zyada <b>source</b> ports ya VLANs ke frames ko ek <b>destination</b> port par copy kare jahan aapka analyser hai. <b>RSPAN</b> copy ko ek dedicated remote-SPAN VLAN mein switches ke paar le jaata hai, aur <b>ERSPAN</b> use GRE mein lapet deta hai taaki woh routed network paar kar sake.</p>
<pre class="code"><span class="c">! Gi0/1 ke andar aur bahar ka sab kuch Gi0/24 wale laptop par copy karo</span>
SW1(config)# monitor session 1 source interface GigabitEthernet0/1 both
SW1(config)# monitor session 1 destination interface GigabitEthernet0/24
SW1# show monitor session 1</pre>
<pre class="out">Session 1
---------
<span class="hl">Type                   : Local Session</span>
Source Ports           :
    <span class="hl">Both               : Gi0/1</span>
<span class="hl">Destination Ports      : Gi0/24</span>
    Encapsulation      : Native
          Ingress      : Disabled</pre>
<p>Yaad rakhne wale facts: destination port normal switch port ki tarah kaam karna band kar deta hai (STP mein hissa nahi leta, normal traffic forward nahi karta); busy source destination ko oversubscribe kar sakta hai to load mein copy <b>frames drop</b> karti hai; aur default mein SPAN error wale frames (runts, CRC errors) copy nahi karta, kyunki switch unhe pehle hi discard kar deta hai.</p>

<h3>3. Network TAP</h3>
<p><b>TAP</b> (Test Access Point) ek chhota hardware device hai jo cable mein inline lagaya jaata hai. Yeh dono directions ka har bit monitor ports par copy karta hai. Hardware mein kaam karne ki wajah se load mein bhi kabhi frames drop nahi karta, error wale frames bhi copy karta hai, aur switch par kisi change se misconfigure nahi ho sakta. Keemat: use lagane ke liye link thodi der todna padta hai, aur paisa lagta hai. Data centers aksar critical links par permanent TAPs chhod dete hain taaki capture hamesha ek click door ho.</p>

<h3>4. Router ya switch par embedded packet capture</h3>
<p>Cisco IOS XE device par hi <b>Embedded Packet Capture</b> (EPC) se capture kar sakta hai, jo <code>monitor capture</code> se configure hota hai. Aap capture ko naam dete ho, use interface aur direction se jodte ho, match add karte ho, start karte ho, buffer dekhte ho aur use .pcap file ke roop mein flash par export karte ho. CCNA level par bas itna pata hona chahiye ki yeh exist karta hai aur kyun kaam ka hai: na laptop, na SPAN port, aur raat 2 baje remote site par bhi chalta hai.</p>
<pre class="code"><span class="c">! IOS XE: Gi1/0/1 par dono directions capture karo, phir pcap save karo</span>
R1# monitor capture CAP interface GigabitEthernet1/0/1 both
R1# monitor capture CAP match ipv4 any any
R1# monitor capture CAP start
R1# monitor capture CAP stop
R1# show monitor capture CAP buffer brief
R1# monitor capture CAP export flash:cap1.pcap</pre>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Chaar capture points">
<rect x="20" y="90" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="120" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="265" y="90" width="110" height="50" rx="8" fill="#bae6fd"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="510" y="90" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="565" y="120" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<line x1="130" y1="115" x2="265" y2="115" stroke="#64748b" stroke-width="2"/><line x1="375" y1="115" x2="510" y2="115" stroke="#64748b" stroke-width="2"/>
<rect x="420" y="102" width="46" height="26" rx="4" fill="#fde68a"/><text x="443" y="120" text-anchor="middle" class="svg-ink" font-size="12">TAP</text>
<text x="75" y="75" text-anchor="middle" class="svg-accent" font-size="12">1 host capture</text>
<text x="320" y="75" text-anchor="middle" class="svg-accent" font-size="12">2 SPAN copy</text>
<rect x="265" y="170" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">Analyser</text>
<line x1="320" y1="140" x2="320" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<text x="443" y="75" text-anchor="middle" class="svg-accent" font-size="12">3 TAP</text>
<text x="565" y="75" text-anchor="middle" class="svg-accent" font-size="12">4 R1 par EPC</text>
</svg><p class="cap">Ek hi baatcheet dekhne ke chaar tareeke. Lab ka capture panel aapke chune link par TAP ki tarah behave karta hai.</p></div>

<h3>Point chunna: problem ke paas, aur dono sides par</h3>
<p><b>Symptom ke sabse paas</b> wale link se shuru karo, aam taur par client ya server. Agar request dikhti hai lekin reply nahi, to path par ek hop aage badho aur dobara capture karo, ya suspect device ke <b>dono sides</b> par ek saath capture karo. Agar packet router mein ek side se ghusta hai aur dusri side se kabhi nahi nikalta, to us router ne use drop kiya: uske ACLs, routes aur NAT check karo.</p>

<h3>Is course ki labs mein yeh kaise kaam karta hai</h3>
<p>Har lab mein <b>Capture packets</b> button hai. Yeh capture panel kholta hai jismein link selector hota hai: <b>All links</b>, ya ek link jaise <code>PC1 eth0 ↔ SW1 Gi0/1</code>. Panel us cable par TAP ki tarah behave karta hai: dono directions dekhta hai, kabhi drop nahi karta, aur frame details mein har frame par "Captured on" likhta hai. "Capturing on" ke paas laal dot batata hai ki chal raha hai; pause button use rok deta hai, aur <b>Clear</b> list khaali karta hai. Kuch protocol traffic, jaise periodic OSPF Hellos, sirf capture khula hone par generate hota hai, isliye problem reproduce karne se <b>pehle</b> capture start karo.</p>

<div class="eg"><p><b>Worked example.</b> Lab 3 mein aapko R1 ki taraf R2 ke Hellos chahiye. Link <code>R1 Gi0/0 ↔ R2 Gi0/0</code> chuno, "All links" nahi. All links chunne par aapko 10.0.23.0/30 par R2 aur R3 ke Hellos bhi dikhenge, aur do alag problems ek hi list mein mix ho jaayenge. Ek link, ek baatcheet.</p></div>

<div class="warn"><p><b>Common galti.</b> Laptop ko kisi bhi access port mein laga kar dusre PC ka traffic dekhne ki umeed karna. Switch sirf broadcasts aur unknown unicasts flood karta hai. SPAN, TAP ya host par capture ke bina, jis baatcheet mein aapko interest hai woh aapke laptop tak kabhi nahi pahunchti.</p></div>

<div class="exam"><p><b>Exam trap.</b> SPAN traffic copy karta hai; redirect nahi karta. Original frame phir bhi apne asli destination par jaata hai. Yeh bhi yaad rakho: local SPAN ek switch ke andar rehta hai, RSPAN switches ke paar ek special VLAN use karta hai, ERSPAN routed network ke paar GRE use karta hai.</p></div>

<div class="scn"><h4>Woh capture jo load mein jhooth bola</h4><p>Ek engineer ne slow backups investigate karne ke liye 10 Gbps uplink ko 1 Gbps laptop port par mirror kiya. Capture mein sainkdon "missing" segments aur TCP retransmissions dikhe, aur team uplink optics badalne hi wali thi. Dusre engineer ne notice kiya ki SPAN destination source se kahin slow tha. Unhone hardware TAP aur 10 Gbps capture card se capture dohraya: koi loss nahi. Asli problem, jo baad mein mili, backup server ki ek disk thi.</p><p><b>Seekh:</b> destination oversubscribe ho to SPAN copies drop kar sakta hai. "Missing" packets par bharosa karne se pehle pakka karo ki capture point khud speed jhel sakta tha.</p></div>

<div class="iv"><p class="q">"SPAN aur TAP mein kya farak hai, aur har ek kab use karoge?"</p><p>Strong answer: SPAN switch ka feature hai jo source ports ya VLANs ke frames destination port par copy karta hai; free hai aur jaldi configure hota hai, lekin load mein copies drop kar sakta hai aur normally error wale frames copy nahi karta. TAP inline hardware hai jo dono directions ka har bit bina loss ke copy karta hai, errors bhi, lekin lagane ke liye link todna padta hai. Quick checks ke liye main SPAN use karta hoon aur high-rate links ya jab loss prove karna ho tab TAP. RSPAN, ERSPAN aur embedded packet capture ko alternatives ke roop mein mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switch dusre hosts ke unicast frames aapke laptop ko nahi bhejta; asli capture method chahiye.</li>
<li>Chaar methods: host capture, SPAN/RSPAN/ERSPAN, hardware TAP, aur device par embedded packet capture.</li>
<li>SPAN copy karta hai, kabhi redirect nahi, aur destination oversubscribe ho to copies drop kar sakta hai.</li>
<li>Pehle symptom ke paas capture karo, phir suspect device ke dono sides par.</li>
<li>Labs mein selector mein ek link chuno aur problem reproduce karne se pehle capture start karo.</li>
</ul></div>
`}};export{e as default};