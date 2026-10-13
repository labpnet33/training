var e={id:`frames`,h:{en:`802.11 frames: management, control and data`,hi:`802.11 frames: management, control aur data`},body:{en:`
<p>Ethernet has one frame type for user data. Wi-Fi needs far more, because the medium is shared, unreliable and has no cable to tell you who is connected. So 802.11 adds <b>management frames</b> (join, leave, advertise), <b>control frames</b> (manage access to the air, acknowledge) and <b>data frames</b> (your traffic). If you can read a capture, you can solve most client problems.</p>

<h3>Analogy: a meeting room</h3>
<p>Management frames are the receptionist: "Welcome, here is our name" (beacon), "I would like to join" (association). Control frames are the chairperson: "May I speak?" (RTS), "Go ahead" (CTS), "Got it" (ACK). Data frames are what people actually say.</p>

<h3>The frame layout</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="802.11 frame layout">
<rect x="10" y="30" width="60" height="40" fill="#bae6fd"/><text x="40" y="55" text-anchor="middle" class="svg-ink" font-size="11">Frame Ctl 2</text>
<rect x="72" y="30" width="55" height="40" fill="#bbf7d0"/><text x="100" y="55" text-anchor="middle" class="svg-ink" font-size="11">Dur 2</text>
<rect x="129" y="30" width="70" height="40" fill="#fde68a"/><text x="164" y="55" text-anchor="middle" class="svg-ink" font-size="11">Addr1 6</text>
<rect x="201" y="30" width="70" height="40" fill="#fde68a"/><text x="236" y="55" text-anchor="middle" class="svg-ink" font-size="11">Addr2 6</text>
<rect x="273" y="30" width="70" height="40" fill="#fde68a"/><text x="308" y="55" text-anchor="middle" class="svg-ink" font-size="11">Addr3 6</text>
<rect x="345" y="30" width="55" height="40" fill="#ddd6fe"/><text x="372" y="55" text-anchor="middle" class="svg-ink" font-size="11">Seq 2</text>
<rect x="402" y="30" width="70" height="40" fill="#e2e8f0"/><text x="437" y="55" text-anchor="middle" class="svg-ink" font-size="11">Addr4 (opt)</text>
<rect x="474" y="30" width="100" height="40" fill="#fed7aa"/><text x="524" y="55" text-anchor="middle" class="svg-ink" font-size="11">Body (0 to 7951)</text>
<rect x="576" y="30" width="54" height="40" fill="#bae6fd"/><text x="603" y="55" text-anchor="middle" class="svg-ink" font-size="11">FCS 4</text>
<text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">QoS Control and HT/VHT/HE Control fields are added to QoS data frames</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Sizes in bytes. FCS = frame check sequence (error detection)</text>
</svg><p class="cap">Up to four addresses: receiver, transmitter, and two more that depend on the frame direction (To DS and From DS bits).</p></div>
<p>The two-byte <b>Frame Control</b> field carries the <b>type</b> (0 management, 1 control, 2 data), the <b>subtype</b>, and flag bits: To DS, From DS, More Fragments, <b>Retry</b>, Power Management, More Data, <b>Protected</b> (the payload is encrypted) and Order. A high percentage of frames with the Retry bit set means a poor link.</p>
<p>Addresses: <b>RA</b> is the receiver, <b>TA</b> the transmitter, <b>DA</b> the final destination and <b>SA</b> the original source. In an infrastructure network a client sending to the wired side has To DS = 1: Address 1 is the AP's BSSID, Address 2 is the client, Address 3 is the destination.</p>

<h3>Management frames (type 0)</h3>
<table class="cmp"><tr><th>Frame</th><th>Purpose</th></tr>
<tr><td><b>Beacon</b></td><td>The AP advertises SSID, supported rates, security (RSN), capabilities and country, roughly every 102.4 ms (100 time units, TU, of 1024 microseconds)</td></tr>
<tr><td><b>Probe request / response</b></td><td>Client asks "who is there?"; AP answers directly</td></tr>
<tr><td><b>Authentication / Deauthentication</b></td><td>Start or end the 802.11 authentication state; also used for SAE in WPA3</td></tr>
<tr><td><b>Association request / response</b></td><td>Client asks to join, lists its capabilities; AP replies with a status code and an association ID (AID)</td></tr>
<tr><td><b>Reassociation request / response</b></td><td>Used when a client roams to another AP in the same ESS</td></tr>
<tr><td><b>Disassociation</b></td><td>End the association</td></tr>
<tr><td><b>Action</b></td><td>Extra functions: block-ack setup, 802.11k and v requests, fast transition, spectrum management</td></tr></table>
<p>A beacon is sent at the lowest basic (mandatory) rate so every client can hear it. If your 2.4 GHz network keeps 1 Mbps as a basic rate, every beacon takes about 20 times more airtime than at 24 Mbps. This is why Lab 4 disables the low rates.</p>

<h3>Control frames (type 1)</h3>
<ul>
<li><b>RTS / CTS</b> (request and clear to send): reserve the air before a long frame, solving the hidden-node problem.</li>
<li><b>ACK</b> and <b>Block ACK</b>: confirm receipt; Block ACK acknowledges a whole aggregate in one reply.</li>
<li><b>PS-Poll</b>: a sleeping client asks the AP for the data it buffered.</li>
</ul>
<p>Every unicast frame needs an ACK. A missing ACK means retry with a lower rate, and this is how the sender learns a link is bad.</p>

<h3>Data frames (type 2)</h3>
<p><b>Data</b> frames carry your IP traffic, encrypted with CCMP or GCMP when security is enabled. <b>QoS data</b> frames add the QoS control field with the access category priority (chapter 9). <b>Null</b> frames carry no payload and tell the AP a client is going to sleep or waking up. Only data frames are encrypted; in WPA2 management frames are open unless <b>Protected Management Frames (802.11w)</b> is enabled, so an attacker can forge a deauthentication. WPA3 makes PMF mandatory.</p>

<h3>Reading a capture</h3>
<pre class="out">No.  Time     Source           Destination      Info
 1   0.000    AP1 (0011.2233.4401)   Broadcast        <span class="hl">Beacon frame, SSID=NK-STAFF, BI=100</span>
 2   0.045    LAPTOP1                AP1              Probe Request, SSID=NK-STAFF
 3   0.046    AP1                    LAPTOP1          Probe Response
 4   0.047    LAPTOP1                AP1              Authentication (Open System, seq 1)
 5   0.048    AP1                    LAPTOP1          Authentication (seq 2, status 0 Successful)
 6   0.050    LAPTOP1                AP1              Association Request (HE, 2 streams, 80 MHz)
 7   0.052    AP1                    LAPTOP1          <span class="hl">Association Response (status 0, AID 1)</span>
 8   0.060    AP1                    LAPTOP1          EAPOL Key (message 1 of 4)</pre>
<p>This is an illustrative decode, not a simulator command. In real life you capture with a sniffer on the right channel or with an AP in sniffer mode and filter with <code>wlan.fc.type_subtype</code> in Wireshark. On a 9800 you also get an embedded packet capture; those tools are taught in wl-diag. The point here: learn the order.</p>

<div class="eg"><p><b>Worked example: airtime of a beacon.</b> A beacon of about 300 bytes (2400 bits) at 1 Mbps takes 2.4 ms plus a 192 microsecond preamble. At 6 Mbps it takes 0.4 ms and at 24 Mbps 0.1 ms. With four SSIDs on an AP each sending a beacon every 102.4 ms at 1 Mbps, the AP uses about 4 x 2.6 ms / 102.4 ms = 10 percent of the airtime just announcing itself, before any client sends a bit.</p></div>

<div class="warn"><p><b>Common mistake.</b> Running many SSIDs. Each SSID is a separate set of beacons and probe responses. Cisco guidance is to keep SSIDs few (often three or four at most per radio).</p></div>
<div class="exam"><p><b>Exam trap.</b> Beacons, probes, authentication and association are management frames. RTS, CTS and ACK are control frames. A deauthentication flood works against WPA2 because management frames are not protected unless PMF (802.11w) is on.</p></div>

<div class="scn"><h4>Fourteen SSIDs on one AP</h4><p>A hotel advertised 14 SSIDs (staff, guest, per-department and legacy). Clients near the AP saw poor throughput even with low client counts. A site survey showed 35 percent channel utilisation with almost no data frames: it was mostly beacons and probe responses at 1 Mbps. The team cut to three SSIDs, disabled 1, 2, 5.5 and 11 Mbps, and utilisation dropped to 8 percent.</p><p><b>Lesson:</b> management frames also use airtime. Fewer SSIDs and higher basic rates give airtime back to users.</p></div>

<div class="iv"><p class="q">"Name the three 802.11 frame types and an example of each."</p><p>Strong answer: management (beacon, probe, authentication, association), control (RTS, CTS, ACK, Block ACK) and data (data, QoS data, null). Add that the Frame Control field identifies type and subtype, and that only data frames are encrypted unless 802.11w protects management frames.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Types: management (0), control (1), data (2); Frame Control holds type, subtype and flags such as Retry and Protected.</li>
<li>Beacons announce the BSS about every 102.4 ms at the lowest basic rate; probes find it; auth and association join it.</li>
<li>RTS/CTS and ACK are control frames; Block ACK confirms a whole aggregate.</li>
<li>Management frames are not encrypted unless PMF (802.11w) is on; WPA3 requires PMF.</li>
<li>More SSIDs and low basic rates waste airtime.</li>
</ul></div>
`,hi:`
<p>Ethernet mein user data ke liye ek hi frame type hota hai. Wi-Fi ko kahin zyada chahiye, kyunki medium shared aur unreliable hai aur koi cable nahi jo batae ki kaun connected hai. Isliye 802.11 <b>management frames</b> (join, leave, advertise), <b>control frames</b> (hawa tak access manage karna, acknowledge) aur <b>data frames</b> (aapka traffic) jodta hai. Agar aap capture padh sakte ho to zyada tar client problems solve kar sakte ho.</p>

<h3>Analogy: meeting room</h3>
<p>Management frames receptionist hain: "Welcome, yeh hamara naam hai" (beacon), "Main join karna chahta hoon" (association). Control frames chairperson hain: "Kya main bol sakta hoon?" (RTS), "Boliye" (CTS), "Samajh gaya" (ACK). Data frames woh hain jo log asal mein bolte hain.</p>

<h3>Frame layout</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="802.11 frame layout">
<rect x="10" y="30" width="60" height="40" fill="#bae6fd"/><text x="40" y="55" text-anchor="middle" class="svg-ink" font-size="11">Frame Ctl 2</text>
<rect x="72" y="30" width="55" height="40" fill="#bbf7d0"/><text x="100" y="55" text-anchor="middle" class="svg-ink" font-size="11">Dur 2</text>
<rect x="129" y="30" width="70" height="40" fill="#fde68a"/><text x="164" y="55" text-anchor="middle" class="svg-ink" font-size="11">Addr1 6</text>
<rect x="201" y="30" width="70" height="40" fill="#fde68a"/><text x="236" y="55" text-anchor="middle" class="svg-ink" font-size="11">Addr2 6</text>
<rect x="273" y="30" width="70" height="40" fill="#fde68a"/><text x="308" y="55" text-anchor="middle" class="svg-ink" font-size="11">Addr3 6</text>
<rect x="345" y="30" width="55" height="40" fill="#ddd6fe"/><text x="372" y="55" text-anchor="middle" class="svg-ink" font-size="11">Seq 2</text>
<rect x="402" y="30" width="70" height="40" fill="#e2e8f0"/><text x="437" y="55" text-anchor="middle" class="svg-ink" font-size="11">Addr4 (opt)</text>
<rect x="474" y="30" width="100" height="40" fill="#fed7aa"/><text x="524" y="55" text-anchor="middle" class="svg-ink" font-size="11">Body (0 se 7951)</text>
<rect x="576" y="30" width="54" height="40" fill="#bae6fd"/><text x="603" y="55" text-anchor="middle" class="svg-ink" font-size="11">FCS 4</text>
<text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">QoS Control aur HT/VHT/HE Control fields QoS data frames mein jodte hain</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Sizes bytes mein. FCS = frame check sequence (error detection)</text>
</svg><p class="cap">Chaar addresses tak: receiver, transmitter, aur do aur jo frame direction (To DS aur From DS bits) par depend karte hain.</p></div>
<p>Do-byte ka <b>Frame Control</b> field <b>type</b> (0 management, 1 control, 2 data), <b>subtype</b>, aur flag bits carry karta hai: To DS, From DS, More Fragments, <b>Retry</b>, Power Management, More Data, <b>Protected</b> (payload encrypted hai) aur Order. Retry bit wale frames ka bada percentage kharab link batata hai.</p>
<p>Addresses: <b>RA</b> receiver hai, <b>TA</b> transmitter, <b>DA</b> final destination aur <b>SA</b> original source. Infrastructure network mein wired side ko bhejne wale client ka To DS = 1 hota hai: Address 1 AP ka BSSID, Address 2 client, Address 3 destination.</p>

<h3>Management frames (type 0)</h3>
<table class="cmp"><tr><th>Frame</th><th>Maqsad</th></tr>
<tr><td><b>Beacon</b></td><td>AP SSID, supported rates, security (RSN), capabilities aur country advertise karta hai, lagbhag har 102.4 ms (100 time units, TU, 1024 microseconds ke)</td></tr>
<tr><td><b>Probe request / response</b></td><td>Client poochta hai "kaun hai wahan?"; AP seedha jawab deta hai</td></tr>
<tr><td><b>Authentication / Deauthentication</b></td><td>802.11 authentication state shuru ya khatam karna; WPA3 mein SAE ke liye bhi</td></tr>
<tr><td><b>Association request / response</b></td><td>Client join maangta hai, apni capabilities list karta hai; AP status code aur association ID (AID) ke saath jawab deta hai</td></tr>
<tr><td><b>Reassociation request / response</b></td><td>Jab client same ESS ke dusre AP par roam karta hai</td></tr>
<tr><td><b>Disassociation</b></td><td>Association khatam karna</td></tr>
<tr><td><b>Action</b></td><td>Extra functions: block-ack setup, 802.11k aur v requests, fast transition, spectrum management</td></tr></table>
<p>Beacon sabse low basic (mandatory) rate par bheja jaata hai taaki har client sun sake. Agar aapke 2.4 GHz network mein 1 Mbps basic rate hai to har beacon 24 Mbps ke mukable lagbhag 20 guna zyada airtime leta hai. Isliye Lab 4 low rates disable karta hai.</p>

<h3>Control frames (type 1)</h3>
<ul>
<li><b>RTS / CTS</b> (request aur clear to send): lambe frame se pehle hawa reserve karte hain, hidden-node problem solve karte hain.</li>
<li><b>ACK</b> aur <b>Block ACK</b>: receipt confirm karte hain; Block ACK ek reply mein poore aggregate ko acknowledge karta hai.</li>
<li><b>PS-Poll</b>: sote hue client AP se woh data maangta hai jo usne buffer kiya.</li>
</ul>
<p>Har unicast frame ko ACK chahiye. ACK na aaye to lower rate par retry hota hai, aur sender isi tarah jaanta hai ki link kharab hai.</p>

<h3>Data frames (type 2)</h3>
<p><b>Data</b> frames aapka IP traffic carry karte hain, security enabled ho to CCMP ya GCMP se encrypted. <b>QoS data</b> frames QoS control field jodte hain jisme access category priority hoti hai (chapter 9). <b>Null</b> frames mein payload nahi hota aur AP ko batate hain ki client sone ya jaagne wala hai. Sirf data frames encrypted hote hain; WPA2 mein management frames open rehte hain jab tak <b>Protected Management Frames (802.11w)</b> enable na ho, isliye attacker deauthentication forge kar sakta hai. WPA3 PMF ko mandatory banata hai.</p>

<h3>Capture padhna</h3>
<pre class="out">No.  Time     Source           Destination      Info
 1   0.000    AP1 (0011.2233.4401)   Broadcast        <span class="hl">Beacon frame, SSID=NK-STAFF, BI=100</span>
 2   0.045    LAPTOP1                AP1              Probe Request, SSID=NK-STAFF
 3   0.046    AP1                    LAPTOP1          Probe Response
 4   0.047    LAPTOP1                AP1              Authentication (Open System, seq 1)
 5   0.048    AP1                    LAPTOP1          Authentication (seq 2, status 0 Successful)
 6   0.050    LAPTOP1                AP1              Association Request (HE, 2 streams, 80 MHz)
 7   0.052    AP1                    LAPTOP1          <span class="hl">Association Response (status 0, AID 1)</span>
 8   0.060    AP1                    LAPTOP1          EAPOL Key (message 1 of 4)</pre>
<p>Yeh ek illustrative decode hai, simulator command nahi. Real life mein aap sahi channel par sniffer se ya sniffer mode wale AP se capture karte ho aur Wireshark mein <code>wlan.fc.type_subtype</code> se filter karte ho. 9800 par embedded packet capture bhi milta hai; woh tools wl-diag mein sikhaye jaate hain. Yahan point hai: order seekho.</p>

<div class="eg"><p><b>Worked example: beacon ka airtime.</b> Lagbhag 300 bytes (2400 bits) ka beacon 1 Mbps par 2.4 ms plus 192 microsecond preamble leta hai. 6 Mbps par 0.4 ms aur 24 Mbps par 0.1 ms. Ek AP par chaar SSIDs har ek har 102.4 ms par 1 Mbps par beacon bheje to AP lagbhag 4 x 2.6 ms / 102.4 ms = 10 percent airtime sirf apna naam batane mein use karta hai, kisi client ke ek bit bhejne se pehle.</p></div>

<div class="warn"><p><b>Common galti.</b> Bahut saare SSIDs chalana. Har SSID beacons aur probe responses ka alag set hai. Cisco guidance hai SSIDs kam rakho (aksar har radio par teen ya chaar tak).</p></div>
<div class="exam"><p><b>Exam trap.</b> Beacons, probes, authentication aur association management frames hain. RTS, CTS aur ACK control frames hain. Deauthentication flood WPA2 par isliye chalta hai kyunki management frames protected nahi hote jab tak PMF (802.11w) on na ho.</p></div>

<div class="scn"><h4>Ek AP par chaudah SSIDs</h4><p>Ek hotel ne 14 SSIDs advertise kiye (staff, guest, department-wise aur legacy). AP ke paas ke clients ko kam client count par bhi kharab throughput mila. Site survey mein 35 percent channel utilisation dikha jabki data frames lagbhag nahi the: zyada tar 1 Mbps par beacons aur probe responses the. Team ne teen SSIDs rakhe, 1, 2, 5.5 aur 11 Mbps disable kiye, aur utilisation 8 percent par aa gaya.</p><p><b>Seekh:</b> management frames bhi airtime khate hain. Kam SSIDs aur higher basic rates users ko airtime wapas dete hain.</p></div>

<div class="iv"><p class="q">"Teen 802.11 frame types aur har ek ka example batao."</p><p>Strong answer: management (beacon, probe, authentication, association), control (RTS, CTS, ACK, Block ACK) aur data (data, QoS data, null). Jodo ki Frame Control field type aur subtype batata hai, aur sirf data frames encrypted hote hain jab tak 802.11w management frames ko protect na kare.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Types: management (0), control (1), data (2); Frame Control mein type, subtype aur Retry, Protected jaise flags hote hain.</li>
<li>Beacons lagbhag har 102.4 ms par lowest basic rate se BSS announce karte hain; probes use dhoondhte hain; auth aur association join karate hain.</li>
<li>RTS/CTS aur ACK control frames hain; Block ACK poore aggregate ko confirm karta hai.</li>
<li>Management frames encrypted nahi hote jab tak PMF (802.11w) on na ho; WPA3 ko PMF chahiye.</li>
<li>Zyada SSIDs aur low basic rates airtime waste karte hain.</li>
</ul></div>
`}};export{e as default};