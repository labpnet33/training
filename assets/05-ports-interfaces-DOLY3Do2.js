var e={id:`ports-interfaces`,h:{en:`WLC ports versus interfaces: service, distribution, LAG, management, virtual, dynamic`,hi:`WLC ports vs interfaces: service, distribution, LAG, management, virtual, dynamic`},body:{en:`
<p>Think of an office building. The <b>doors</b> are physical: the main entrance, the loading bay, the staff-only back door. The <b>departments</b> are logical: Sales on floor 2, Finance on floor 3, Reception on the ground floor. Many departments share the same main door, and a department's name tells you nothing about which door you walked through. A WLC has the same split: <b>ports</b> are physical sockets, <b>interfaces</b> are logical addresses in VLANs that ride over those ports. Confusing the two is the number one source of wrong answers on this topic.</p>

<h3>Physical ports on a controller</h3>
<table class="cmp"><tr><th>Port</th><th>What it does</th></tr>
<tr><td><b>Distribution system (DS) ports</b></td><td>The data ports that connect the WLC to the switch. They carry CAPWAP from the APs, client traffic onto the client VLANs, and management traffic. Configured on the switch as <b>802.1Q trunks</b>. A controller has several, for bandwidth and redundancy.</td></tr>
<tr><td><b>Service port</b></td><td>An out-of-band management Ethernet port. It carries no client or AP traffic, is untagged, and should sit in a separate management network. Handy when the DS ports are broken.</td></tr>
<tr><td><b>Redundancy port (RP)</b></td><td>Connects two controllers in a high-availability (HA SSO) pair, for keepalives and state synchronisation.</td></tr>
<tr><td><b>Console port</b></td><td>Serial CLI access for initial setup and recovery.</td></tr>
</table>

<h3>LAG: bundling the distribution ports</h3>
<p><b>Link Aggregation (LAG)</b> bundles all distribution ports into one logical link, like an EtherChannel. With LAG enabled, traffic is load-shared across the links and a single cable failure is invisible. Two rules matter:</p>
<ul>
<li>AireOS controllers support only <b>static</b> bundling. On the switch you configure <code>channel-group 1 mode on</code>; <b>LACP and PAgP are not supported</b>.</li>
<li>With LAG, <b>all</b> DS ports join the bundle; you cannot leave one out. On older releases enabling LAG needs a reboot.</li>
</ul>
<p>Without LAG, each interface is assigned a primary (and optionally backup) physical port, and you spread interfaces across ports by hand.</p>

<h3>Logical interfaces</h3>
<dl class="terms">
<dt>Management interface</dt><dd>The WLC's main IP address: the GUI, SSH and SNMP address, the source of RADIUS and TACACS+ requests, and the <b>CAPWAP endpoint</b> that APs join. In the lab: 10.10.99.10/24, VLAN 99, gateway 10.10.99.1.</dd>
<dt>AP-manager (concept)</dt><dd>On very old controllers a separate AP-manager interface terminated CAPWAP. On modern AireOS the <b>management interface acts as the AP manager by default</b> (the "Ap Mgr: Yes" column), and you can optionally enable dynamic AP management on other interfaces. Remember the concept: the address APs join.</dd>
<dt>Virtual interface</dt><dd>A <b>non-routable</b> address, typically <code>192.0.2.1</code>, that clients see as the web-authentication redirect page and as the DHCP server identifier when the WLC relays DHCP. It is never pinged or routed, and must be identical on all controllers in a mobility group.</dd>
<dt>Service-port interface</dt><dd>The IP address of the physical service port, in its own out-of-band subnet.</dd>
<dt>Dynamic interfaces</dt><dd>One per client VLAN, each with an IP, mask, gateway, VLAN tag and DHCP server. <b>A WLAN is mapped to a dynamic interface</b>, and that decides which VLAN and subnet its clients land in. In the lab: staff (VLAN 20), guest (VLAN 30), corp (VLAN 40).</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Controller interfaces riding on a LAG">
<rect x="20" y="20" width="600" height="120" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">WLC1 logical interfaces</text>
<rect x="40" y="58" width="130" height="64" rx="6" fill="#e2e8f0"/><text x="105" y="82" text-anchor="middle" class="svg-ink" font-size="12">management</text><text x="105" y="100" text-anchor="middle" class="svg-muted" font-size="12">VLAN 99 .99.10</text><text x="105" y="115" text-anchor="middle" class="svg-muted" font-size="12">CAPWAP, GUI</text>
<rect x="185" y="58" width="110" height="64" rx="6" fill="#bbf7d0"/><text x="240" y="82" text-anchor="middle" class="svg-ink" font-size="12">staff</text><text x="240" y="100" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20</text>
<rect x="305" y="58" width="110" height="64" rx="6" fill="#fed7aa"/><text x="360" y="82" text-anchor="middle" class="svg-ink" font-size="12">guest</text><text x="360" y="100" text-anchor="middle" class="svg-muted" font-size="12">VLAN 30</text>
<rect x="425" y="58" width="80" height="64" rx="6" fill="#bae6fd"/><text x="465" y="82" text-anchor="middle" class="svg-ink" font-size="12">corp</text><text x="465" y="100" text-anchor="middle" class="svg-muted" font-size="12">VLAN 40</text>
<rect x="515" y="58" width="90" height="64" rx="6" fill="#fde68a"/><text x="560" y="82" text-anchor="middle" class="svg-ink" font-size="12">virtual</text><text x="560" y="100" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.1</text>
<rect x="120" y="180" width="300" height="40" rx="8" fill="#e2e8f0"/><text x="270" y="205" text-anchor="middle" class="svg-ink" font-size="13">DS ports 1+2 in LAG (802.1Q trunk)</text>
<rect x="460" y="180" width="150" height="40" rx="8" fill="#e2e8f0"/><text x="535" y="205" text-anchor="middle" class="svg-ink" font-size="13">service port (OOB)</text>
<line x1="270" y1="140" x2="270" y2="180" stroke="#64748b" stroke-width="4"/>
<text x="270" y="245" text-anchor="middle" class="svg-muted" font-size="12">all tagged interfaces share the same physical bundle</text>
</svg><p class="cap">Interfaces are logical and tagged; ports are physical. Every dynamic interface and the management interface ride the same trunk.</p></div>

<h3>Configuring a dynamic interface (lab task 2)</h3>
<p>GUI: <b>Controller &gt; Interfaces &gt; New</b>, enter the name and VLAN ID, then fill in the IP, netmask, gateway, physical port and DHCP server. CLI:</p>
<pre class="code">(WLC1) &gt;config interface create staff 20
(WLC1) &gt;config interface address dynamic-interface staff 10.10.20.5 255.255.255.0 10.10.20.1
(WLC1) &gt;config interface dhcp dynamic-interface staff primary 10.10.20.1
<span class="c">! the management interface was set up at first boot:</span>
<span class="c">! config interface address management 10.10.99.10 255.255.255.0 10.10.99.1</span>
<span class="c">! config interface vlan management 99</span></pre>

<pre class="out">(WLC1) &gt;show interface summary

Number of Interfaces............................. 3

Interface Name        Port  Vlan Id   IP Address       Type     Ap Mgr  Guest
--------------------  ----  --------  ---------------  -------  ------  -----
<span class="hl">management            1     99        10.10.99.10      Static   Yes     No</span>
<span class="hl">staff                 1     20        10.10.20.5       Dynamic  No      No</span>
virtual               N/A   N/A       192.0.2.1        Static   No      No</pre>

<div class="eg"><p><b>Worked example.</b> A laptop joins a WLAN mapped to interface staff. The WLC receives its DHCP Discover through the CAPWAP tunnel, and relays it from 10.10.20.5 to the configured DHCP server 10.10.20.1 (R1). R1 sees the relay address in 10.10.20.0/24 and picks pool STAFF, so the laptop receives 10.10.20.21 with gateway 10.10.20.1. The laptop's frames then leave the WLC's trunk tagged VLAN 20. Change the interface's VLAN to 21 and the frames leave tagged 21: if SW1 has no VLAN 21, the client is stranded.</p></div>

<div class="warn"><p><b>Common mistake.</b> Creating a dynamic interface with VLAN 30 on the WLC but forgetting VLAN 30 on the switch, or leaving it out of the trunk's allowed list. The WLC happily sends tagged frames; the switch silently drops them. Clients associate and authenticate but get no IP address.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Port" answers (service port, DS port, redundancy port, console) are physical; "interface" answers (management, virtual, dynamic, service-port interface) are logical. LAG on a WLC = static <b>mode on</b>, no LACP. The virtual interface uses a non-routable address like 192.0.2.1. APs join the <b>management</b> interface.</p></div>

<div class="scn"><h4>The LAG that never came up</h4><p>An engineer connected a new controller's two DS ports to a switch and configured the switch side as <code>channel-group 1 mode active</code> (LACP). The port-channel stayed down, both member ports showed "suspended", and APs could not reach the WLC. <code>show etherchannel summary</code> on the switch showed the members waiting for LACP partners that never answered. The engineer changed the switch to <code>channel-group 1 mode on</code>, matching the WLC's static LAG. The port-channel came up immediately and APs joined.</p><p><b>Lesson:</b> AireOS LAG is static only. LACP or PAgP on the switch side leaves the bundle down.</p></div>

<div class="iv"><p class="q">"What is the difference between a port and an interface on a WLC? Name the main interfaces."</p><p>Strong answer: ports are physical connectors (distribution system ports, service port, redundancy port, console); interfaces are logical IP addresses mapped to VLANs and carried over ports. Main interfaces: management (GUI/SSH, RADIUS source, CAPWAP endpoint and AP manager), virtual (non-routable, web-auth and DHCP relay identity), service-port (out-of-band) and dynamic interfaces (one per client VLAN, where WLANs are mapped). Add that DS ports are trunks and can be bundled in a static LAG.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ports are physical: distribution system (trunks), service (out-of-band), redundancy, console.</li>
<li>LAG bundles all DS ports; AireOS supports only static mode on, no LACP or PAgP.</li>
<li>Management interface = GUI/SSH address, AAA source and CAPWAP endpoint (acts as AP manager).</li>
<li>Virtual interface = non-routable address (192.0.2.1) for web-auth and DHCP relay.</li>
<li>Dynamic interfaces map WLANs to client VLANs; the VLAN must also exist on the switch and trunk.</li>
</ul></div>
`,hi:`
<p>Ek office building ke baare mein socho. <b>Darwaze</b> physical hain: main entrance, loading bay, staff-only peeche ka darwaza. <b>Departments</b> logical hain: Sales floor 2 par, Finance floor 3 par, Reception ground floor par. Kai departments same main door share karte hain, aur department ka naam aapko kuch nahi batata ki aap kis darwaze se aaye. WLC mein bhi yahi split hai: <b>ports</b> physical sockets hain, <b>interfaces</b> VLANs mein logical addresses hain jo un ports ke upar chalte hain. Dono ko mix karna is topic par galat answers ka number one kaaran hai.</p>

<h3>Controller par physical ports</h3>
<table class="cmp"><tr><th>Port</th><th>Kya karta hai</th></tr>
<tr><td><b>Distribution system (DS) ports</b></td><td>Data ports jo WLC ko switch se jodte hain. Yeh APs se CAPWAP, client VLANs par client traffic, aur management traffic le jaate hain. Switch par <b>802.1Q trunks</b> ke roop mein configure hote hain. Controller mein bandwidth aur redundancy ke liye kai hote hain.</td></tr>
<tr><td><b>Service port</b></td><td>Out-of-band management Ethernet port. Yeh koi client ya AP traffic nahi le jaata, untagged hota hai, aur alag management network mein hona chahiye. Jab DS ports toote hon tab kaam aata hai.</td></tr>
<tr><td><b>Redundancy port (RP)</b></td><td>High-availability (HA SSO) pair mein do controllers ko jodta hai, keepalives aur state synchronisation ke liye.</td></tr>
<tr><td><b>Console port</b></td><td>Initial setup aur recovery ke liye serial CLI access.</td></tr>
</table>

<h3>LAG: distribution ports ko bundle karna</h3>
<p><b>Link Aggregation (LAG)</b> saare distribution ports ko ek logical link mein bundle karta hai, EtherChannel jaisa. LAG enabled ho to traffic links par load-share hota hai aur ek cable fail hona dikhta bhi nahi. Do rules matter karte hain:</p>
<ul>
<li>AireOS controllers sirf <b>static</b> bundling support karte hain. Switch par aap <code>channel-group 1 mode on</code> configure karte ho; <b>LACP aur PAgP supported nahi hain</b>.</li>
<li>LAG ke saath <b>saare</b> DS ports bundle mein aate hain; aap ek ko bahar nahi chhod sakte. Purani releases mein LAG enable karne ke liye reboot chahiye.</li>
</ul>
<p>LAG ke bina har interface ko ek primary (aur optional backup) physical port diya jaata hai, aur aap interfaces ko haath se ports par failaate ho.</p>

<h3>Logical interfaces</h3>
<dl class="terms">
<dt>Management interface</dt><dd>WLC ka main IP address: GUI, SSH aur SNMP address, RADIUS aur TACACS+ requests ka source, aur woh <b>CAPWAP endpoint</b> jise APs join karte hain. Lab mein: 10.10.99.10/24, VLAN 99, gateway 10.10.99.1.</dd>
<dt>AP-manager (concept)</dt><dd>Bahut purane controllers par alag AP-manager interface CAPWAP terminate karta tha. Modern AireOS par <b>management interface default se AP manager ka kaam karta hai</b> ("Ap Mgr: Yes" column), aur aap optionally doosre interfaces par dynamic AP management enable kar sakte ho. Concept yaad rakho: woh address jise APs join karte hain.</dd>
<dt>Virtual interface</dt><dd>Ek <b>non-routable</b> address, aam taur par <code>192.0.2.1</code>, jise clients web-authentication redirect page ke roop mein aur WLC ke DHCP relay karte waqt DHCP server identifier ke roop mein dekhte hain. Ise kabhi ping ya route nahi kiya jaata, aur mobility group ke saare controllers par yeh same hona chahiye.</dd>
<dt>Service-port interface</dt><dd>Physical service port ka IP address, uske apne out-of-band subnet mein.</dd>
<dt>Dynamic interfaces</dt><dd>Har client VLAN ke liye ek, har ek ke saath IP, mask, gateway, VLAN tag aur DHCP server. <b>WLAN ek dynamic interface se map hota hai</b>, aur wahi tay karta hai ki uske clients kis VLAN aur subnet mein aayenge. Lab mein: staff (VLAN 20), guest (VLAN 30), corp (VLAN 40).</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="LAG par chalte controller interfaces">
<rect x="20" y="20" width="600" height="120" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">WLC1 ke logical interfaces</text>
<rect x="40" y="58" width="130" height="64" rx="6" fill="#e2e8f0"/><text x="105" y="82" text-anchor="middle" class="svg-ink" font-size="12">management</text><text x="105" y="100" text-anchor="middle" class="svg-muted" font-size="12">VLAN 99 .99.10</text><text x="105" y="115" text-anchor="middle" class="svg-muted" font-size="12">CAPWAP, GUI</text>
<rect x="185" y="58" width="110" height="64" rx="6" fill="#bbf7d0"/><text x="240" y="82" text-anchor="middle" class="svg-ink" font-size="12">staff</text><text x="240" y="100" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20</text>
<rect x="305" y="58" width="110" height="64" rx="6" fill="#fed7aa"/><text x="360" y="82" text-anchor="middle" class="svg-ink" font-size="12">guest</text><text x="360" y="100" text-anchor="middle" class="svg-muted" font-size="12">VLAN 30</text>
<rect x="425" y="58" width="80" height="64" rx="6" fill="#bae6fd"/><text x="465" y="82" text-anchor="middle" class="svg-ink" font-size="12">corp</text><text x="465" y="100" text-anchor="middle" class="svg-muted" font-size="12">VLAN 40</text>
<rect x="515" y="58" width="90" height="64" rx="6" fill="#fde68a"/><text x="560" y="82" text-anchor="middle" class="svg-ink" font-size="12">virtual</text><text x="560" y="100" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.1</text>
<rect x="120" y="180" width="300" height="40" rx="8" fill="#e2e8f0"/><text x="270" y="205" text-anchor="middle" class="svg-ink" font-size="13">DS ports 1+2 LAG mein (802.1Q trunk)</text>
<rect x="460" y="180" width="150" height="40" rx="8" fill="#e2e8f0"/><text x="535" y="205" text-anchor="middle" class="svg-ink" font-size="13">service port (OOB)</text>
<line x1="270" y1="140" x2="270" y2="180" stroke="#64748b" stroke-width="4"/>
<text x="270" y="245" text-anchor="middle" class="svg-muted" font-size="12">saare tagged interfaces same physical bundle share karte hain</text>
</svg><p class="cap">Interfaces logical aur tagged hain; ports physical hain. Har dynamic interface aur management interface same trunk par chalte hain.</p></div>

<h3>Dynamic interface configure karna (lab task 2)</h3>
<p>GUI: <b>Controller &gt; Interfaces &gt; New</b>, naam aur VLAN ID daalo, phir IP, netmask, gateway, physical port aur DHCP server bharo. CLI:</p>
<pre class="code">(WLC1) &gt;config interface create staff 20
(WLC1) &gt;config interface address dynamic-interface staff 10.10.20.5 255.255.255.0 10.10.20.1
(WLC1) &gt;config interface dhcp dynamic-interface staff primary 10.10.20.1
<span class="c">! management interface pehle boot par set hua tha:</span>
<span class="c">! config interface address management 10.10.99.10 255.255.255.0 10.10.99.1</span>
<span class="c">! config interface vlan management 99</span></pre>

<pre class="out">(WLC1) &gt;show interface summary

Number of Interfaces............................. 3

Interface Name        Port  Vlan Id   IP Address       Type     Ap Mgr  Guest
--------------------  ----  --------  ---------------  -------  ------  -----
<span class="hl">management            1     99        10.10.99.10      Static   Yes     No</span>
<span class="hl">staff                 1     20        10.10.20.5       Dynamic  No      No</span>
virtual               N/A   N/A       192.0.2.1        Static   No      No</pre>

<div class="eg"><p><b>Worked example.</b> Ek laptop interface staff se mapped WLAN join karta hai. WLC CAPWAP tunnel se uska DHCP Discover receive karta hai, aur use 10.10.20.5 se configured DHCP server 10.10.20.1 (R1) ko relay karta hai. R1 relay address 10.10.20.0/24 mein dekhta hai aur pool STAFF chunta hai, isliye laptop ko gateway 10.10.20.1 ke saath 10.10.20.21 milta hai. Phir laptop ke frames WLC ke trunk se VLAN 20 tagged nikalte hain. Interface ka VLAN 21 kar do to frames 21 tagged nikalenge: agar SW1 par VLAN 21 nahi hai, client phans jaata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> WLC par VLAN 30 wala dynamic interface banana lekin switch par VLAN 30 bhool jaana, ya use trunk ki allowed list se bahar chhod dena. WLC khushi se tagged frames bhejta hai; switch chupchaap unhe drop kar deta hai. Clients associate aur authenticate hote hain lekin IP address nahi milta.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Port" answers (service port, DS port, redundancy port, console) physical hain; "interface" answers (management, virtual, dynamic, service-port interface) logical hain. WLC par LAG = static <b>mode on</b>, LACP nahi. Virtual interface 192.0.2.1 jaisa non-routable address use karta hai. APs <b>management</b> interface ko join karte hain.</p></div>

<div class="scn"><h4>Woh LAG jo kabhi up nahi hua</h4><p>Ek engineer ne naye controller ke do DS ports switch se jode aur switch side ko <code>channel-group 1 mode active</code> (LACP) configure kiya. Port-channel down raha, dono member ports "suspended" dikha rahe the, aur APs WLC tak nahi pahunch pa rahe the. Switch par <code>show etherchannel summary</code> ne dikhaya ki members un LACP partners ka wait kar rahe the jo kabhi jawab nahi dete. Engineer ne switch ko <code>channel-group 1 mode on</code> kiya, jo WLC ke static LAG se match karta hai. Port-channel turant up hua aur APs ne join kiya.</p><p><b>Seekh:</b> AireOS LAG sirf static hai. Switch side par LACP ya PAgP bundle ko down chhod deta hai.</p></div>

<div class="iv"><p class="q">"WLC par port aur interface mein kya farak hai? Main interfaces ke naam batao."</p><p>Strong answer: ports physical connectors hain (distribution system ports, service port, redundancy port, console); interfaces logical IP addresses hain jo VLANs se mapped hote hain aur ports par carry hote hain. Main interfaces: management (GUI/SSH, RADIUS source, CAPWAP endpoint aur AP manager), virtual (non-routable, web-auth aur DHCP relay identity), service-port (out-of-band) aur dynamic interfaces (har client VLAN ke liye ek, jahan WLANs map hote hain). Jodo ki DS ports trunks hote hain aur static LAG mein bundle ho sakte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ports physical hain: distribution system (trunks), service (out-of-band), redundancy, console.</li>
<li>LAG saare DS ports bundle karta hai; AireOS sirf static mode on support karta hai, LACP ya PAgP nahi.</li>
<li>Management interface = GUI/SSH address, AAA source aur CAPWAP endpoint (AP manager ka kaam karta hai).</li>
<li>Virtual interface = web-auth aur DHCP relay ke liye non-routable address (192.0.2.1).</li>
<li>Dynamic interfaces WLANs ko client VLANs se map karte hain; VLAN switch aur trunk par bhi hona chahiye.</li>
</ul></div>
`}};export{e as default};