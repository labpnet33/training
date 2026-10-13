var e={id:`frames-association`,h:{en:`802.11 frames and the association process`,hi:`802.11 frames aur association process`},body:{en:`
<p>Joining a gym follows the same steps every time. You see the poster outside (the <b>beacon</b>), or you walk in and ask at the desk whether there is a gym here (the <b>probe</b>). The desk checks that you are a person, not a robot (802.11 <b>authentication</b>, a formality). You fill in the membership form and get a member number (<b>association</b>). Then comes the real check: your ID card or the secret joining code (<b>802.1X or PSK</b>), and you receive your locker key (<b>encryption keys</b> from the 4-way handshake). Finally you are given a seat in a class (<b>DHCP</b>). Every Wi-Fi join is this sequence, and every failure stops at one of these steps.</p>

<h3>The three frame types</h3>
<p>Every 802.11 frame has a 2-bit <b>type</b> field in its Frame Control header:</p>
<table class="cmp"><tr><th>Type</th><th>Purpose</th><th>Examples (subtypes)</th></tr>
<tr><td><b>Management</b></td><td>Find, join and leave a BSS</td><td>Beacon, probe request and response, authentication, association request and response, reassociation request and response, disassociation, deauthentication, action</td></tr>
<tr><td><b>Control</b></td><td>Help deliver frames and control access to the air</td><td>ACK, block ACK, RTS (request to send), CTS (clear to send), PS-Poll</td></tr>
<tr><td><b>Data</b></td><td>Carry user traffic</td><td>Data, QoS data, null data (used to signal power-save)</td></tr></table>

<h3>Inside an 802.11 frame</h3>
<dl class="terms">
<dt>Frame Control</dt><dd>Type, subtype and flags such as To DS and From DS (is the frame going to or coming from the wired distribution system?), retry and protected (encrypted).</dd>
<dt>Duration/ID</dt><dd>How many microseconds the channel will stay busy. Other stations set their <b>NAV</b> (network allocation vector) timer from it and stay quiet. This is virtual carrier sense.</dd>
<dt>Address 1 to 4</dt><dd>Up to four MAC addresses. For a normal frame from a client to the AP: Address 1 = receiver (the BSSID), Address 2 = transmitter (the client), Address 3 = final destination (for example the gateway's MAC). All four are used only when frames are bridged between APs, as in mesh.</dd>
<dt>Sequence control, QoS control, body, FCS</dt><dd>Fragment and sequence numbers to detect duplicates, the QoS priority, the payload, and a 32-bit frame check sequence (CRC).</dd>
</dl>
<p>An AP sends a <b>beacon</b> for each SSID roughly ten times per second: the default beacon interval is 100 time units = 102.4 ms. Beacons advertise the SSID, supported data rates, channel, capabilities (802.11n/ac/ax) and security (the RSN information element), plus a traffic map for sleeping clients.</p>

<h3>The join, step by step</h3>
<div class="dia"><svg viewBox="0 0 640 350" role="img" aria-label="Association sequence">
<rect x="70" y="10" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="120" y="30" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1</text>
<rect x="470" y="10" width="100" height="30" rx="6" fill="#bae6fd"/><text x="520" y="30" text-anchor="middle" class="svg-ink" font-size="13">AP2 / WLC1</text>
<line x1="120" y1="40" x2="120" y2="340" stroke="#64748b" stroke-width="1.5"/><line x1="520" y1="40" x2="520" y2="340" stroke="#64748b" stroke-width="1.5"/>
<line x1="520" y1="62" x2="126" y2="62" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="4 3"/><text x="320" y="57" text-anchor="middle" class="svg-muted" font-size="12">1 Beacon (passive discovery)</text>
<line x1="120" y1="88" x2="514" y2="88" stroke="#0284c7" stroke-width="1.5"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="12">1 Probe request</text>
<line x1="520" y1="112" x2="126" y2="112" stroke="#0284c7" stroke-width="1.5"/><text x="320" y="107" text-anchor="middle" class="svg-ink" font-size="12">Probe response</text>
<line x1="120" y1="138" x2="514" y2="138" stroke="#16a34a" stroke-width="1.5"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="12">2 Authentication (open system)</text>
<line x1="520" y1="162" x2="126" y2="162" stroke="#16a34a" stroke-width="1.5"/><text x="320" y="157" text-anchor="middle" class="svg-ink" font-size="12">Authentication response</text>
<line x1="120" y1="188" x2="514" y2="188" stroke="#7c3aed" stroke-width="1.5"/><text x="320" y="183" text-anchor="middle" class="svg-ink" font-size="12">3 Association request</text>
<line x1="520" y1="212" x2="126" y2="212" stroke="#7c3aed" stroke-width="1.5"/><text x="320" y="207" text-anchor="middle" class="svg-ink" font-size="12">Association response (AID)</text>
<line x1="120" y1="238" x2="514" y2="238" stroke="#d97706" stroke-width="1.5"/><text x="320" y="233" text-anchor="middle" class="svg-ink" font-size="12">4 802.1X/EAP (enterprise only)</text>
<line x1="520" y1="264" x2="126" y2="264" stroke="#d97706" stroke-width="2.5"/><text x="320" y="259" text-anchor="middle" class="svg-ink" font-size="12">5 4-way handshake M1-M4 (keys)</text>
<line x1="120" y1="290" x2="514" y2="290" stroke="#64748b" stroke-width="1.5"/><text x="320" y="285" text-anchor="middle" class="svg-ink" font-size="12">6 DHCP, ARP for gateway</text>
<text x="320" y="325" text-anchor="middle" class="svg-accent" font-size="12">encrypted user traffic flows</text>
</svg><p class="cap">The six stages of a Wi-Fi join. A failure at each stage has a different symptom.</p></div>
<ol>
<li><b>Discovery</b>: the client learns about networks passively (beacons) or actively (probe request on each channel, probe response from each AP).</li>
<li><b>802.11 authentication</b>: normally <b>Open System</b>, a formality that always succeeds. The old Shared Key method belonged to WEP and is obsolete. In WPA3-Personal this exchange carries <b>SAE</b> instead.</li>
<li><b>Association</b>: the client asks to join, listing its capabilities and chosen security; the AP answers with an <b>association ID (AID)</b>. The client is now associated but cannot send user data yet.</li>
<li><b>802.1X/EAP</b> (enterprise networks only): the client proves its identity to a RADIUS server through the AP and WLC.</li>
<li><b>4-way handshake</b>: four EAPOL-Key messages prove both sides hold the same master key and derive the per-client unicast key (PTK) and the group key (GTK). A wrong passphrase fails here.</li>
<li><b>IP connectivity</b>: DHCP in the VLAN the WLAN maps to, then ARP for the gateway.</li>
</ol>

<pre class="out">LAPTOP1&gt; wifi connect NK-STAFF psk NkStaff2024
Found "NK-STAFF" on AP2 (5 GHz, channel 40, -54 dBm)
Associating with BSSID 52:54:00:3a:12:10 ... ok
<span class="hl">WPA2-PSK 4-way handshake ... completed</span>

LAPTOP1&gt; wifi status
SSID        : NK-STAFF
BSSID       : 52:54:00:3a:12:10
AP          : AP2
Band/channel: 5 GHz / 40
Signal      : -54 dBm
Security    : WPA2-Personal (PSK)
<span class="hl">IP address  : 10.10.20.11/24 (DHCP)</span></pre>
<p>On the controller the same event appears in <code>show msglog</code>:</p>
<pre class="out">Sep 29 09:14:02.118 %APF-6-CLIENT_ASSOC: Client 52:54:00:aa:00:01 associated to AP AP2 (5 GHz ch 40) on WLAN 1 (NK-STAFF), interface staff VLAN 20</pre>

<p>Leaving is also a management frame: <b>disassociation</b> ends the association, <b>deauthentication</b> ends the authentication, each with a reason code. In WPA2 these frames were unprotected, so they could be spoofed to knock clients off. <b>Protected Management Frames</b> (802.11w, PMF) encrypt and sign them; PMF is mandatory in WPA3.</p>

<div class="eg"><p><b>Worked example.</b> LAPTOP1 (52:54:00:aa:00:01) sends a ping to SRV1. The data frame to AP2 carries Address 1 = 52:54:00:3a:12:10 (BSSID, receiver), Address 2 = 52:54:00:aa:00:01 (transmitter), Address 3 = R1's MAC on VLAN 20 (the gateway, final Layer 2 destination), with To DS = 1. AP2 replies with an ACK control frame within microseconds; if the ACK is missing, the laptop resends with the retry bit set.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating the 802.11 "authentication" frames as the security check. Open System authentication always succeeds; the real proof of identity is the PSK 4-way handshake or 802.1X, which happen after association.</p></div>

<div class="exam"><p><b>Exam trap.</b> Beacons, probes, authentication and association are <b>management</b> frames; RTS, CTS and ACK are <b>control</b> frames. Order: probe, authentication, association, then 802.1X or PSK and the 4-way handshake, then DHCP. The default beacon interval is 102.4 ms.</p></div>

<div class="scn"><h4>Laptops kicked off every few minutes</h4><p>In a meeting room, laptops kept disconnecting and reconnecting every few minutes although the signal was strong. An AP in monitor mode reported a flood of deauthentication frames that claimed to come from the room's BSSID, but the real AP had sent none; they came from a misbehaving device. The WLAN used WPA2 without protected management frames, so clients believed the spoofed frames. The team located and removed the device and enabled PMF (and later WPA3), after which forged deauths were ignored.</p><p><b>Lesson:</b> management frames control who stays connected; protect them with PMF and watch for floods with monitor-mode APs.</p></div>

<div class="iv"><p class="q">"Walk me through what happens when a laptop joins a WPA2-Personal network."</p><p>Strong answer: the laptop discovers the SSID from beacons or a probe response, performs open system 802.11 authentication, sends an association request and receives an association response with an AID. Both sides derive the PMK from the passphrase and SSID, then run the 4-way handshake to prove it and install the PTK and GTK. Only then does the laptop send DHCP in the WLAN's VLAN and ARP for the gateway. Point out where common faults show: SSID not visible, handshake failure for a wrong key, no IP for a VLAN problem.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Frame types: management (beacon, probe, auth, assoc, deauth), control (ACK, RTS, CTS), data.</li>
<li>802.11 frames carry up to four addresses; client to AP: receiver = BSSID, transmitter = client, third = destination.</li>
<li>Join order: discovery, open authentication, association, 802.1X (enterprise), 4-way handshake, DHCP.</li>
<li>Beacons every 102.4 ms advertise SSID, rates, capabilities and security.</li>
<li>PMF (802.11w) protects deauth and disassoc frames and is mandatory in WPA3.</li>
</ul></div>
`,hi:`
<p>Gym join karna har baar same steps follow karta hai. Aap bahar poster dekhte ho (<b>beacon</b>), ya andar jaakar desk par poochte ho ki yahan gym hai kya (<b>probe</b>). Desk check karta hai ki aap insaan ho, robot nahi (802.11 <b>authentication</b>, ek formality). Aap membership form bharte ho aur member number milta hai (<b>association</b>). Phir asli check aata hai: aapka ID card ya secret joining code (<b>802.1X ya PSK</b>), aur aapko locker ki chaabi milti hai (4-way handshake se <b>encryption keys</b>). Aakhir mein class mein seat milti hai (<b>DHCP</b>). Har Wi-Fi join yahi sequence hai, aur har failure inme se kisi ek step par rukta hai.</p>

<h3>Teen frame types</h3>
<p>Har 802.11 frame ke Frame Control header mein 2-bit ka <b>type</b> field hota hai:</p>
<table class="cmp"><tr><th>Type</th><th>Purpose</th><th>Examples (subtypes)</th></tr>
<tr><td><b>Management</b></td><td>BSS dhoondhna, join karna aur chhodna</td><td>Beacon, probe request aur response, authentication, association request aur response, reassociation request aur response, disassociation, deauthentication, action</td></tr>
<tr><td><b>Control</b></td><td>Frames deliver karne aur hawa ka access control karne mein madad</td><td>ACK, block ACK, RTS (request to send), CTS (clear to send), PS-Poll</td></tr>
<tr><td><b>Data</b></td><td>User traffic le jaana</td><td>Data, QoS data, null data (power-save signal karne ke liye)</td></tr></table>

<h3>802.11 frame ke andar</h3>
<dl class="terms">
<dt>Frame Control</dt><dd>Type, subtype aur flags jaise To DS aur From DS (frame wired distribution system ki taraf jaa raha hai ya wahan se aa raha hai?), retry aur protected (encrypted).</dd>
<dt>Duration/ID</dt><dd>Channel kitne microseconds busy rahega. Doosre stations isse apna <b>NAV</b> (network allocation vector) timer set karte hain aur chup rehte hain. Yeh virtual carrier sense hai.</dd>
<dt>Address 1 se 4</dt><dd>Chaar MAC addresses tak. Client se AP tak normal frame ke liye: Address 1 = receiver (BSSID), Address 2 = transmitter (client), Address 3 = final destination (jaise gateway ka MAC). Chaaron sirf tab use hote hain jab frames APs ke beech bridge hote hain, jaise mesh mein.</dd>
<dt>Sequence control, QoS control, body, FCS</dt><dd>Duplicates pakadne ke liye fragment aur sequence numbers, QoS priority, payload, aur 32-bit frame check sequence (CRC).</dd>
</dl>
<p>AP har SSID ke liye lagbhag second mein das baar <b>beacon</b> bhejta hai: default beacon interval 100 time units = 102.4 ms hai. Beacons SSID, supported data rates, channel, capabilities (802.11n/ac/ax) aur security (RSN information element) advertise karte hain, plus sote hue clients ke liye traffic map.</p>

<h3>Join, step by step</h3>
<div class="dia"><svg viewBox="0 0 640 350" role="img" aria-label="Association sequence">
<rect x="70" y="10" width="100" height="30" rx="6" fill="#bbf7d0"/><text x="120" y="30" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1</text>
<rect x="470" y="10" width="100" height="30" rx="6" fill="#bae6fd"/><text x="520" y="30" text-anchor="middle" class="svg-ink" font-size="13">AP2 / WLC1</text>
<line x1="120" y1="40" x2="120" y2="340" stroke="#64748b" stroke-width="1.5"/><line x1="520" y1="40" x2="520" y2="340" stroke="#64748b" stroke-width="1.5"/>
<line x1="520" y1="62" x2="126" y2="62" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="4 3"/><text x="320" y="57" text-anchor="middle" class="svg-muted" font-size="12">1 Beacon (passive discovery)</text>
<line x1="120" y1="88" x2="514" y2="88" stroke="#0284c7" stroke-width="1.5"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="12">1 Probe request</text>
<line x1="520" y1="112" x2="126" y2="112" stroke="#0284c7" stroke-width="1.5"/><text x="320" y="107" text-anchor="middle" class="svg-ink" font-size="12">Probe response</text>
<line x1="120" y1="138" x2="514" y2="138" stroke="#16a34a" stroke-width="1.5"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="12">2 Authentication (open system)</text>
<line x1="520" y1="162" x2="126" y2="162" stroke="#16a34a" stroke-width="1.5"/><text x="320" y="157" text-anchor="middle" class="svg-ink" font-size="12">Authentication response</text>
<line x1="120" y1="188" x2="514" y2="188" stroke="#7c3aed" stroke-width="1.5"/><text x="320" y="183" text-anchor="middle" class="svg-ink" font-size="12">3 Association request</text>
<line x1="520" y1="212" x2="126" y2="212" stroke="#7c3aed" stroke-width="1.5"/><text x="320" y="207" text-anchor="middle" class="svg-ink" font-size="12">Association response (AID)</text>
<line x1="120" y1="238" x2="514" y2="238" stroke="#d97706" stroke-width="1.5"/><text x="320" y="233" text-anchor="middle" class="svg-ink" font-size="12">4 802.1X/EAP (sirf enterprise)</text>
<line x1="520" y1="264" x2="126" y2="264" stroke="#d97706" stroke-width="2.5"/><text x="320" y="259" text-anchor="middle" class="svg-ink" font-size="12">5 4-way handshake M1-M4 (keys)</text>
<line x1="120" y1="290" x2="514" y2="290" stroke="#64748b" stroke-width="1.5"/><text x="320" y="285" text-anchor="middle" class="svg-ink" font-size="12">6 DHCP, gateway ke liye ARP</text>
<text x="320" y="325" text-anchor="middle" class="svg-accent" font-size="12">encrypted user traffic chalta hai</text>
</svg><p class="cap">Wi-Fi join ke chhe stages. Har stage par failure ka alag symptom hota hai.</p></div>
<ol>
<li><b>Discovery</b>: client networks ke baare mein passively (beacons) ya actively (har channel par probe request, har AP se probe response) seekhta hai.</li>
<li><b>802.11 authentication</b>: normally <b>Open System</b>, ek formality jo hamesha succeed hoti hai. Purana Shared Key method WEP ka tha aur obsolete hai. WPA3-Personal mein yeh exchange iski jagah <b>SAE</b> le jaata hai.</li>
<li><b>Association</b>: client apni capabilities aur chuni hui security batate hue join karne ko kehta hai; AP <b>association ID (AID)</b> ke saath jawab deta hai. Client ab associated hai par abhi user data nahi bhej sakta.</li>
<li><b>802.1X/EAP</b> (sirf enterprise networks): client AP aur WLC ke through RADIUS server ko apni identity prove karta hai.</li>
<li><b>4-way handshake</b>: chaar EAPOL-Key messages prove karte hain ki dono taraf same master key hai aur per-client unicast key (PTK) aur group key (GTK) banate hain. Galat passphrase yahin fail hota hai.</li>
<li><b>IP connectivity</b>: WLAN jis VLAN se mapped hai usme DHCP, phir gateway ke liye ARP.</li>
</ol>

<pre class="out">LAPTOP1&gt; wifi connect NK-STAFF psk NkStaff2024
Found "NK-STAFF" on AP2 (5 GHz, channel 40, -54 dBm)
Associating with BSSID 52:54:00:3a:12:10 ... ok
<span class="hl">WPA2-PSK 4-way handshake ... completed</span>

LAPTOP1&gt; wifi status
SSID        : NK-STAFF
BSSID       : 52:54:00:3a:12:10
AP          : AP2
Band/channel: 5 GHz / 40
Signal      : -54 dBm
Security    : WPA2-Personal (PSK)
<span class="hl">IP address  : 10.10.20.11/24 (DHCP)</span></pre>
<p>Controller par yahi event <code>show msglog</code> mein dikhta hai:</p>
<pre class="out">Sep 29 09:14:02.118 %APF-6-CLIENT_ASSOC: Client 52:54:00:aa:00:01 associated to AP AP2 (5 GHz ch 40) on WLAN 1 (NK-STAFF), interface staff VLAN 20</pre>

<p>Chhodna bhi management frame hai: <b>disassociation</b> association khatam karta hai, <b>deauthentication</b> authentication khatam karta hai, dono reason code ke saath. WPA2 mein yeh frames unprotected the, isliye inhe spoof karke clients ko bahar kiya ja sakta tha. <b>Protected Management Frames</b> (802.11w, PMF) inhe encrypt aur sign karte hain; WPA3 mein PMF mandatory hai.</p>

<div class="eg"><p><b>Worked example.</b> LAPTOP1 (52:54:00:aa:00:01) SRV1 ko ping bhejta hai. AP2 ko jaane wale data frame mein Address 1 = 52:54:00:3a:12:10 (BSSID, receiver), Address 2 = 52:54:00:aa:00:01 (transmitter), Address 3 = VLAN 20 par R1 ka MAC (gateway, final Layer 2 destination), To DS = 1 ke saath. AP2 microseconds mein ACK control frame se jawab deta hai; ACK na aaye to laptop retry bit set karke dobara bhejta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> 802.11 "authentication" frames ko security check samajhna. Open System authentication hamesha succeed hoti hai; identity ka asli saboot PSK 4-way handshake ya 802.1X hai, jo association ke baad hote hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Beacons, probes, authentication aur association <b>management</b> frames hain; RTS, CTS aur ACK <b>control</b> frames hain. Order: probe, authentication, association, phir 802.1X ya PSK aur 4-way handshake, phir DHCP. Default beacon interval 102.4 ms hai.</p></div>

<div class="scn"><h4>Har kuch minute mein laptops bahar</h4><p>Ek meeting room mein laptops har kuch minute mein disconnect aur reconnect ho rahe the jabki signal strong tha. Monitor mode ke ek AP ne deauthentication frames ki baadh report ki jo room ke BSSID se aane ka daava karte the, par asli AP ne ek bhi nahi bheja tha; woh ek gadbad device se aa rahe the. WLAN bina protected management frames ke WPA2 use karta tha, isliye clients ne spoofed frames par bharosa kiya. Team ne device dhoondh kar hataya aur PMF enable kiya (aur baad mein WPA3), jiske baad nakli deauths ignore hone lage.</p><p><b>Seekh:</b> management frames tay karte hain ki kaun connected rahega; unhe PMF se protect karo aur monitor-mode APs se baadh par nazar rakho.</p></div>

<div class="iv"><p class="q">"Mujhe batao jab laptop WPA2-Personal network join karta hai to kya hota hai."</p><p>Strong answer: laptop beacons ya probe response se SSID discover karta hai, open system 802.11 authentication karta hai, association request bhejta hai aur AID ke saath association response paata hai. Dono taraf passphrase aur SSID se PMK banta hai, phir use prove karne aur PTK aur GTK install karne ke liye 4-way handshake chalta hai. Uske baad hi laptop WLAN ke VLAN mein DHCP bhejta hai aur gateway ke liye ARP karta hai. Batao ki common faults kahan dikhte hain: SSID nahi dikhna, galat key par handshake failure, VLAN problem par IP nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Frame types: management (beacon, probe, auth, assoc, deauth), control (ACK, RTS, CTS), data.</li>
<li>802.11 frames mein chaar addresses tak; client se AP: receiver = BSSID, transmitter = client, teesra = destination.</li>
<li>Join order: discovery, open authentication, association, 802.1X (enterprise), 4-way handshake, DHCP.</li>
<li>Har 102.4 ms par beacons SSID, rates, capabilities aur security advertise karte hain.</li>
<li>PMF (802.11w) deauth aur disassoc frames ko protect karta hai aur WPA3 mein mandatory hai.</li>
</ul></div>
`}};export{e as default};