var e={id:`ap-architectures`,h:{en:`Autonomous vs lightweight APs and wireless controllers`,hi:`Autonomous vs lightweight APs aur wireless controllers`},body:{en:`
<p>A small restaurant has one chef who plans the menu, buys the food and cooks it. That works for one kitchen. A chain of 50 restaurants cannot let every chef invent their own menu; a head office plans menus and prices centrally, and each kitchen just cooks. Access points evolved the same way: from self-contained <b>autonomous</b> APs to <b>lightweight</b> APs run by a central controller.</p>

<h3>Autonomous (standalone, "fat") APs</h3>
<p>An <b>autonomous AP</b> contains everything: radio, SSIDs, security settings, VLAN mapping and its own management interface. You configure each AP separately, by web page or CLI. Traffic from clients goes straight from the AP onto its switch port, usually an 802.1Q trunk carrying one VLAN per SSID.</p>
<ul>
<li><b>Good for:</b> homes, small offices, one to a few APs, point-to-point bridges.</li>
<li><b>Weak at scale:</b> 40 APs mean 40 separate configurations; changing a guest password is 40 changes; each AP chooses channels and power alone, with no view of its neighbours; roaming between APs is slower because keys are not shared.</li>
</ul>

<h3>Lightweight ("thin") APs and the wireless LAN controller</h3>
<p>A <b>lightweight AP</b> has almost no local configuration. After booting, it finds a <b>wireless LAN controller (WLC)</b>, downloads its settings and firmware from it, and then serves clients. The work is split, a model called <b>split MAC</b>:</p>
<table class="cmp"><tr><th>Lightweight AP (real-time)</th><th>Controller (management)</th></tr>
<tr><td>Beacons and probe responses, acknowledgements, retransmissions, encryption of frames on the air, queuing</td><td>SSID and security configuration, authentication (including talking to RADIUS), client database, roaming between APs, channel and power planning (radio resource management), rogue AP detection, firmware</td></tr>
</table>
<p>The AP and controller talk using <b>CAPWAP</b> (Control and Provisioning of Wireless Access Points, an IETF standard): <b>UDP 5246</b> for the encrypted control channel and <b>UDP 5247</b> for the data channel. In <b>central switching</b> (tunnel mode) client traffic travels inside CAPWAP to the controller, which drops it into the SSID's VLAN. In <b>local switching</b> (often called FlexConnect or distributed mode) the AP puts client traffic onto its own switch port and only control goes to the controller, which suits branches across a WAN.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lightweight AP joins a controller">
<rect x="20" y="150" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="177" text-anchor="middle" class="svg-ink" font-size="13">AP1 (lightweight)</text>
<rect x="260" y="150" width="120" height="44" rx="8" fill="#bae6fd"/><text x="320" y="177" text-anchor="middle" class="svg-ink" font-size="13">SW1 (PoE)</text>
<rect x="500" y="150" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="560" y="170" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="560" y="186" text-anchor="middle" class="svg-muted" font-size="12">10.30.99.10</text>
<rect x="260" y="20" width="120" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">R1 DHCP</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">option 43</text>
<line x1="140" y1="172" x2="260" y2="172" stroke="#64748b" stroke-width="2"/><line x1="380" y1="172" x2="500" y2="172" stroke="#64748b" stroke-width="2"/><line x1="320" y1="64" x2="320" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="150" y="110" class="svg-accent" font-size="12">1. DHCP: IP + controller address</text>
<text x="360" y="120" class="svg-accent" font-size="12">2. CAPWAP discovery and join</text>
<text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">3. Config download, then SSIDs go live (UDP 5246 control, 5247 data)</text>
</svg><p class="cap">How a lightweight AP finds its controller in the lab: DHCP option 43 carries the controller address.</p></div>

<h3>How a lightweight AP finds the controller</h3>
<ol>
<li>It gets power (usually <b>PoE</b>: 802.3af gives up to 15.4 W at the switch port, 802.3at up to 30 W, 802.3bt up to 60 or 90 W; modern APs often need 802.3at or better).</li>
<li>It gets an IP address by DHCP.</li>
<li>It learns controller addresses from any of: a statically configured address, <b>DHCP option 43</b>, a DNS name the AP looks up, or a broadcast on its local subnet.</li>
<li>It sends CAPWAP discovery, joins the controller, downloads configuration, and brings up its radios.</li>
</ol>
<pre class="code"><span class="c">! R1: DHCP pool for the AP management VLAN</span>
ip dhcp pool AP-POOL
 network 10.30.10.0 255.255.255.0
 default-router 10.30.10.1
<span class="c">! type f1, length 04, then 10.30.99.10 in hex = 0a1e.630a</span>
 option 43 hex f104.0a1e.630a</pre>
<pre class="out">(WLC1) &gt;show ap summary
Number of APs.................................... 4

AP Name          Slots  AP Model     Ethernet MAC       IP Address       Clients  Mode     Join
AP1              2      NK-AP3800    00:50:42:a6:98:01  10.30.10.11      0        Local    <span class="hl">DHCP-43</span>
AP2              2      NK-AP3800    00:50:43:a6:9a:01  10.30.10.12      0        Local    DHCP-43
AP3              2      NK-AP3800    00:50:44:a6:9b:01  10.30.10.13      0        Local    DHCP-43
AP4              2      NK-AP3800    00:50:3d:a6:90:01  10.30.10.14      0        Local    DHCP-43</pre>
<p>The lab controller uses a widely deployed controller-style CLI; other vendors show the same facts (AP name, IP, mode, how it joined) in a similar table.</p>

<div class="eg"><p><b>Worked example.</b> Controller address 10.30.99.10. Convert each octet to hex: 10 = 0a, 30 = 1e, 99 = 63, 10 = 0a. The option 43 value is type f1, length 04 (one address of 4 bytes), then 0a1e630a: <code>f104.0a1e.630a</code>. For two controllers the length becomes 08 and both addresses follow.</p></div>

<h3>Other models you will meet</h3>
<ul>
<li><b>Cloud-managed APs</b>: the AP gets its configuration from a vendor cloud dashboard over the internet; client data stays local. Easy for many small sites.</li>
<li><b>Embedded or virtual controllers</b>: one AP in a group acts as the controller for the others, or the controller runs as a VM.</li>
<li><b>Controller functions you get "for free"</b>: <b>RRM</b> (radio resource management: automatic channel and transmit power), central guest portals, rogue AP detection and seamless roaming.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Plugging a lightweight AP into an access port in the wrong VLAN, with no DHCP option 43, no DNS entry and no controller on that subnet. The AP boots, gets an address, then loops in discovery forever and never broadcasts an SSID. Also check PoE budget: an AP that gets too little power may disable a radio.</p></div>

<div class="exam"><p><b>Exam trap.</b> Autonomous = each AP configured individually, no controller. Lightweight = managed by a controller using CAPWAP (UDP 5246 control, 5247 data). If a scenario has "dozens of APs, consistent configuration, automatic channel and power", the answer is lightweight APs with a controller (or cloud management).</p></div>

<div class="scn"><h4>Thirty APs, thirty passwords</h4><p>A college ran 30 autonomous APs. Each term the guest PSK was changed by hand, and every term a few APs were missed, so some rooms had the old password. Channels were set when installed and never changed; two new neighbouring buildings created interference nobody noticed. The college migrated to lightweight APs on a controller: one guest WLAN change now updates every AP, and RRM re-plans channels and power nightly.</p><p><b>Lesson:</b> beyond a handful of APs, central management is a reliability feature, not a luxury.</p></div>

<div class="iv"><p class="q">"Compare autonomous and lightweight access points."</p><p>Strong answer: an autonomous AP holds its full configuration and is managed individually, fine for small sites. A lightweight AP is managed by a controller: it discovers the controller by static address, DHCP option 43, DNS or broadcast, joins over CAPWAP (UDP 5246 control, 5247 data) and downloads its configuration. Split MAC keeps real-time tasks on the AP and management on the controller, giving central configuration, RRM, fast roaming and rogue detection. Mention local versus central switching and cloud-managed options.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Autonomous AP: self-contained, configured one by one, fine for small deployments.</li>
<li>Lightweight AP: managed by a controller over CAPWAP, UDP 5246 (control) and 5247 (data), split MAC.</li>
<li>Controller discovery: static, DHCP option 43, DNS, subnet broadcast.</li>
<li>Central switching tunnels client data to the controller; local switching drops it at the AP.</li>
<li>Controllers provide central config, RRM, roaming, guest portals and rogue detection; cloud management is a modern alternative.</li>
</ul></div>
`,hi:`
<p>Ek chhote restaurant mein ek chef hai jo menu plan karta hai, khana khareedta hai aur pakata hai. Ek kitchen ke liye yeh chalta hai. 50 restaurants ki chain har chef ko apna menu banane nahi de sakti; head office centrally menu aur prices plan karta hai, aur har kitchen bas pakata hai. Access points bhi aise hi evolve hue: self-contained <b>autonomous</b> APs se central controller se chalne wale <b>lightweight</b> APs tak.</p>

<h3>Autonomous (standalone, "fat") APs</h3>
<p><b>Autonomous AP</b> mein sab kuch hota hai: radio, SSIDs, security settings, VLAN mapping aur apna management interface. Aap har AP ko alag se configure karte ho, web page ya CLI se. Clients ka traffic seedha AP se uske switch port par jaata hai, aam taur par ek 802.1Q trunk jo har SSID ke liye ek VLAN le jaata hai.</p>
<ul>
<li><b>Achha hai:</b> ghar, chhote offices, ek se kuch APs, point-to-point bridges ke liye.</li>
<li><b>Scale par kamzor:</b> 40 APs matlab 40 alag configurations; guest password badalna 40 changes hai; har AP akele channels aur power chunta hai, padosiyon ka koi view nahi; APs ke beech roaming slow hai kyunki keys share nahi hoti.</li>
</ul>

<h3>Lightweight ("thin") APs aur wireless LAN controller</h3>
<p><b>Lightweight AP</b> mein lagbhag koi local configuration nahi hoti. Boot hone ke baad woh ek <b>wireless LAN controller (WLC)</b> dhoondhta hai, usse apni settings aur firmware download karta hai, aur phir clients serve karta hai. Kaam baanta jaata hai, is model ko <b>split MAC</b> kehte hain:</p>
<table class="cmp"><tr><th>Lightweight AP (real-time)</th><th>Controller (management)</th></tr>
<tr><td>Beacons aur probe responses, acknowledgements, retransmissions, hawa par frames ka encryption, queuing</td><td>SSID aur security configuration, authentication (RADIUS se baat samet), client database, APs ke beech roaming, channel aur power planning (radio resource management), rogue AP detection, firmware</td></tr>
</table>
<p>AP aur controller <b>CAPWAP</b> (Control and Provisioning of Wireless Access Points, ek IETF standard) se baat karte hain: encrypted control channel ke liye <b>UDP 5246</b> aur data channel ke liye <b>UDP 5247</b>. <b>Central switching</b> (tunnel mode) mein client traffic CAPWAP ke andar controller tak jaata hai, jo use SSID ke VLAN mein daalta hai. <b>Local switching</b> (aksar FlexConnect ya distributed mode kehte hain) mein AP client traffic apne switch port par daalta hai aur sirf control controller tak jaata hai, jo WAN ke paar branches ke liye theek hai.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lightweight AP controller join karta hai">
<rect x="20" y="150" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="177" text-anchor="middle" class="svg-ink" font-size="13">AP1 (lightweight)</text>
<rect x="260" y="150" width="120" height="44" rx="8" fill="#bae6fd"/><text x="320" y="177" text-anchor="middle" class="svg-ink" font-size="13">SW1 (PoE)</text>
<rect x="500" y="150" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="560" y="170" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="560" y="186" text-anchor="middle" class="svg-muted" font-size="12">10.30.99.10</text>
<rect x="260" y="20" width="120" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">R1 DHCP</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">option 43</text>
<line x1="140" y1="172" x2="260" y2="172" stroke="#64748b" stroke-width="2"/><line x1="380" y1="172" x2="500" y2="172" stroke="#64748b" stroke-width="2"/><line x1="320" y1="64" x2="320" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="150" y="110" class="svg-accent" font-size="12">1. DHCP: IP + controller address</text>
<text x="360" y="120" class="svg-accent" font-size="12">2. CAPWAP discovery aur join</text>
<text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">3. Config download, phir SSIDs live (UDP 5246 control, 5247 data)</text>
</svg><p class="cap">Lab mein lightweight AP apna controller kaise dhoondhta hai: DHCP option 43 controller address le jaata hai.</p></div>

<h3>Lightweight AP controller kaise dhoondhta hai</h3>
<ol>
<li>Use power milti hai (aam taur par <b>PoE</b>: 802.3af switch port par 15.4 W tak deta hai, 802.3at 30 W tak, 802.3bt 60 ya 90 W tak; modern APs ko aksar 802.3at ya behtar chahiye).</li>
<li>Use DHCP se IP address milta hai.</li>
<li>Woh controller addresses in mein se kisi se seekhta hai: statically configured address, <b>DHCP option 43</b>, ek DNS naam jo AP lookup karta hai, ya apne local subnet par broadcast.</li>
<li>Woh CAPWAP discovery bhejta hai, controller join karta hai, configuration download karta hai, aur apne radios chalu karta hai.</li>
</ol>
<pre class="code"><span class="c">! R1: AP management VLAN ke liye DHCP pool</span>
ip dhcp pool AP-POOL
 network 10.30.10.0 255.255.255.0
 default-router 10.30.10.1
<span class="c">! type f1, length 04, phir 10.30.99.10 hex mein = 0a1e.630a</span>
 option 43 hex f104.0a1e.630a</pre>
<pre class="out">(WLC1) &gt;show ap summary
Number of APs.................................... 4

AP Name          Slots  AP Model     Ethernet MAC       IP Address       Clients  Mode     Join
AP1              2      NK-AP3800    00:50:42:a6:98:01  10.30.10.11      0        Local    <span class="hl">DHCP-43</span>
AP2              2      NK-AP3800    00:50:43:a6:9a:01  10.30.10.12      0        Local    DHCP-43
AP3              2      NK-AP3800    00:50:44:a6:9b:01  10.30.10.13      0        Local    DHCP-43
AP4              2      NK-AP3800    00:50:3d:a6:90:01  10.30.10.14      0        Local    DHCP-43</pre>
<p>Lab controller ek widely deployed controller-style CLI use karta hai; doosre vendors bhi same facts (AP naam, IP, mode, kaise join hua) aise hi table mein dikhate hain.</p>

<div class="eg"><p><b>Worked example.</b> Controller address 10.30.99.10. Har octet ko hex mein badlo: 10 = 0a, 30 = 1e, 99 = 63, 10 = 0a. Option 43 value hai type f1, length 04 (4 bytes ka ek address), phir 0a1e630a: <code>f104.0a1e.630a</code>. Do controllers ke liye length 08 ho jaati hai aur dono addresses aage aate hain.</p></div>

<h3>Doosre models jo aapko milenge</h3>
<ul>
<li><b>Cloud-managed APs</b>: AP internet par vendor cloud dashboard se apni configuration leta hai; client data local rehta hai. Kai chhoti sites ke liye aasaan.</li>
<li><b>Embedded ya virtual controllers</b>: group ka ek AP baaki ke liye controller ban jaata hai, ya controller VM ki tarah chalta hai.</li>
<li><b>Controller functions jo "free" milte hain</b>: <b>RRM</b> (radio resource management: automatic channel aur transmit power), central guest portals, rogue AP detection aur seamless roaming.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> Lightweight AP ko galat VLAN ke access port mein lagana, jahan na DHCP option 43 ho, na DNS entry aur na us subnet par controller. AP boot hota hai, address leta hai, phir hamesha discovery mein ghoomta rehta hai aur kabhi SSID broadcast nahi karta. PoE budget bhi check karo: kam power paane wala AP ek radio disable kar sakta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Autonomous = har AP alag se configure, koi controller nahi. Lightweight = CAPWAP (UDP 5246 control, 5247 data) se controller dwara managed. Agar scenario mein "darjanon APs, consistent configuration, automatic channel aur power" ho, to jawab controller (ya cloud management) ke saath lightweight APs hai.</p></div>

<div class="scn"><h4>Tees APs, tees passwords</h4><p>Ek college 30 autonomous APs chalata tha. Har term guest PSK haath se badla jaata tha, aur har term kuch APs chhoot jaate the, isliye kuch kamron mein purana password rehta tha. Channels install ke waqt set hue aur kabhi nahi badle; do nayi padosi buildings ne interference paida kiya jo kisi ne notice nahi kiya. College ne controller par lightweight APs mein migrate kiya: ab ek guest WLAN change har AP update karta hai, aur RRM har raat channels aur power re-plan karta hai.</p><p><b>Seekh:</b> kuch APs se aage, central management reliability feature hai, luxury nahi.</p></div>

<div class="iv"><p class="q">"Autonomous aur lightweight access points compare karo."</p><p>Strong answer: autonomous AP apni poori configuration rakhta hai aur individually manage hota hai, chhoti sites ke liye theek. Lightweight AP controller se manage hota hai: woh controller ko static address, DHCP option 43, DNS ya broadcast se dhoondhta hai, CAPWAP (UDP 5246 control, 5247 data) par join karta hai aur apni configuration download karta hai. Split MAC real-time kaam AP par aur management controller par rakhta hai, jisse central configuration, RRM, fast roaming aur rogue detection milte hain. Local vs central switching aur cloud-managed options ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Autonomous AP: self-contained, ek ek karke configure, chhote deployments ke liye theek.</li>
<li>Lightweight AP: CAPWAP par controller se managed, UDP 5246 (control) aur 5247 (data), split MAC.</li>
<li>Controller discovery: static, DHCP option 43, DNS, subnet broadcast.</li>
<li>Central switching client data controller tak tunnel karta hai; local switching use AP par hi utaar deta hai.</li>
<li>Controllers central config, RRM, roaming, guest portals aur rogue detection dete hain; cloud management ek modern alternative hai.</li>
</ul></div>
`}};export{e as default};