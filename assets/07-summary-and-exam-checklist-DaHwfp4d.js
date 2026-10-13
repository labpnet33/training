var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p><b>Where we are.</b> You have designed for six customers: a food distributor (architecture), a bank (AP modes and FlexConnect), a hospital group (controller placement), a university library (PoE and uplinks), a hotel (SSIDs and QoS) and an airport (security, AAA, guest). This chapter joins them into one repeatable method and gives you the checklist for the 300-425 exam, domain "Wired and wireless infrastructure".</p>

<h3>The five-step design method</h3>
<p>For every scenario question, run these five steps in order. Writing them on the exam scratch sheet saves marks.</p>
<ol>
<li><b>Requirements:</b> users, devices, applications (voice, video, scanners), availability goals, compliance rules.</li>
<li><b>Constraints:</b> WAN bandwidth and latency, cabling, PoE, budget, staff skills, existing controllers.</li>
<li><b>Options:</b> list at least two, with the trade-off for each (scale, cost, failure behaviour, operations).</li>
<li><b>Decision:</b> pick one and justify it using a requirement, not a preference.</li>
<li><b>Failure check:</b> ask what happens when the WAN, a controller, a switch, a RADIUS server or a power supply fails.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Design method and chapter map">
<rect x="10" y="10" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="40" text-anchor="middle" class="svg-ink" font-size="12">Requirements</text>
<rect x="140" y="10" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="195" y="40" text-anchor="middle" class="svg-ink" font-size="12">Constraints</text>
<rect x="270" y="10" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="325" y="40" text-anchor="middle" class="svg-ink" font-size="12">Options</text>
<rect x="400" y="10" width="110" height="50" rx="8" fill="#fde68a"/><text x="455" y="40" text-anchor="middle" class="svg-ink" font-size="12">Decision</text>
<rect x="530" y="10" width="100" height="50" rx="8" fill="#fed7aa"/><text x="580" y="40" text-anchor="middle" class="svg-ink" font-size="12">Failure check</text>
<line x1="120" y1="35" x2="140" y2="35" stroke="#64748b"/><line x1="250" y1="35" x2="270" y2="35" stroke="#64748b"/><line x1="380" y1="35" x2="400" y2="35" stroke="#64748b"/><line x1="510" y1="35" x2="530" y2="35" stroke="#64748b"/>
<rect x="10" y="100" width="200" height="34" rx="8" fill="#e2e8f0"/><text x="110" y="122" text-anchor="middle" class="svg-ink" font-size="12">Architecture and AP modes</text>
<rect x="220" y="100" width="200" height="34" rx="8" fill="#e2e8f0"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="12">Controllers, HA, AP join</text>
<rect x="430" y="100" width="200" height="34" rx="8" fill="#e2e8f0"/><text x="530" y="122" text-anchor="middle" class="svg-ink" font-size="12">PoE, mGig, uplinks, VLANs</text>
<rect x="115" y="150" width="200" height="34" rx="8" fill="#e2e8f0"/><text x="215" y="172" text-anchor="middle" class="svg-ink" font-size="12">SSIDs, rates, QoS</text>
<rect x="325" y="150" width="200" height="34" rx="8" fill="#e2e8f0"/><text x="425" y="172" text-anchor="middle" class="svg-ink" font-size="12">Security, AAA, assurance</text>
<text x="10" y="214" class="svg-muted" font-size="11">Every design topic in this module plugs into steps 3 and 4 of the method.</text>
</svg><p class="cap">The method on top; the topics below feed the options and the decision.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Choose between 9800 appliance, 9800-CL, embedded wireless, SD-Access fabric wireless and Meraki, and justify the choice.</li>
<li>Pick the AP mode (local, FlexConnect, bridge, monitor, sniffer) and say whether each WLAN is switched centrally or locally.</li>
<li>Build a FlexConnect branch design that survives WAN failure, including authentication.</li>
<li>Size a controller on APs, clients and throughput, add growth, and remember that an SSO pair equals one unit.</li>
<li>Explain how an AP discovers a controller and what DHCP option 43, NTP, UDP 5246 and 5247 do.</li>
<li>Calculate a PoE budget and an uplink oversubscription ratio.</li>
<li>Choose the SSID count, minimum data rate and QoS marks for voice and video.</li>
<li>Design WPA3, 802.1X, MAB, guest anchor, DHCP and DNS, and explain rogue handling and Spaces and Catalyst Center roles.</li>
</ul>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact to remember</th></tr>
<tr><td>PoE</td><td>af 15.4 W, at 30 W, bt 60 W and 90 W at the switch; the device gets less</td></tr>
<tr><td>FlexConnect</td><td>Local switching only on FlexConnect APs; tolerates higher RTT than local mode (about 300 ms versus about 100 ms)</td></tr>
<tr><td>HA</td><td>SSO preserves client state; N+1 is slower; a pair has one unit of capacity</td></tr>
<tr><td>AP join</td><td>DHCP option 43, DNS, stored controller, broadcast; CAPWAP UDP 5246 and 5247</td></tr>
<tr><td>Beacon overhead</td><td>Controlled by the number of SSIDs and the lowest mandatory rate</td></tr>
<tr><td>QoS</td><td>Voice EF to UP 6 AC_VO; video AF41 to UP 4 AC_VI; best effort 0; background CS1 to UP 1</td></tr>
<tr><td>6 GHz</td><td>WPA3 only; PMF required; no legacy rates</td></tr>
<tr><td>Guest</td><td>Foreign controller tunnels to an anchor in the DMZ</td></tr>
</table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>CAPWAP</dt><dd>The tunnel protocol between AP and controller.</dd>
<dt>SSO</dt><dd>Stateful switchover: hot standby controller that keeps AP and client state.</dd>
<dt>PMF</dt><dd>Protected Management Frames, which stop forged management frames.</dd>
<dt>AAA override</dt><dd>The RADIUS server assigns VLAN, ACL or SGT to a user after login.</dd>
<dt>CoA</dt><dd>Change of Authorization: the server changes a session's policy while it is running.</dd>
<dt>RAP and MAP</dt><dd>Root AP with a wire, and mesh AP using wireless backhaul.</dd>
</dl>

<div class="warn"><p><b>Common mistakes to avoid on the exam.</b> Choosing a product before reading the constraints. Ignoring the failure check. Answering with the biggest option. Forgetting that the wired network (PoE, uplinks, DHCP) is part of the wireless design.</p></div>
<div class="exam"><p><b>Exam trap.</b> Scenario questions often hide the deciding fact in one sentence, such as "the WAN has 150 ms latency" or "the switch has a 370 W budget". Underline numbers before you read the options.</p></div>

<div class="scn"><h4>The design review that caught three faults</h4><p>A team presented a retail design: 9800 appliance in the head office, 60 stores in local mode over a 120 ms WAN, 24 Wi-Fi 6E APs per 48-port PoE+ switch, and 6 SSIDs. The reviewer using the five-step method found three faults in ten minutes: local mode over a latency above the guidance (use FlexConnect), a PoE budget that would not hold 24 APs, and too many SSIDs. The team revised before ordering any hardware, saving a costly re-install.</p><p><b>Lesson:</b> a structured review is cheaper than a redesign after installation.</p></div>

<div class="iv"><p class="q">"Walk me through how you would design Wi-Fi for a new customer."</p><p>Strong answer: use the five steps. Gather requirements and constraints, shortlist architectures, pick AP modes and switching per site type, size and place controllers with HA, check the access switches for PoE, mGig and uplinks, then design WLAN, QoS, security, AAA, DHCP and DNS, and finally confirm assurance and the failure behaviour. Mention that you validate with a survey.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use requirements, constraints, options, decision and failure check every time.</li>
<li>Branch sites over a WAN usually mean FlexConnect and a local authentication plan.</li>
<li>Size controllers and PoE for worst case plus growth.</li>
<li>Fewer SSIDs, higher minimum rate, consistent DSCP to UP marking.</li>
<li>Guest goes to a DMZ anchor; staff use 802.1X with ISE; assurance tools prove the design works.</li>
</ul></div>
`,hi:`
<p><b>Ab tak ka safar.</b> Aapne chhe customers ke liye design kiya hai: food distributor (architecture), bank (AP modes aur FlexConnect), hospital group (controller placement), university library (PoE aur uplinks), hotel (SSIDs aur QoS) aur airport (security, AAA, guest). Yeh chapter inhe ek repeatable method mein jodta hai aur 300-425 exam, domain "Wired and wireless infrastructure" ki checklist deta hai.</p>

<h3>Paanch-step design method</h3>
<p>Har scenario question par yeh paanch steps order mein chalao. Inhe exam scratch sheet par likhne se marks bachte hain.</p>
<ol>
<li><b>Requirements:</b> users, devices, applications (voice, video, scanners), availability goals, compliance rules.</li>
<li><b>Constraints:</b> WAN bandwidth aur latency, cabling, PoE, budget, staff skills, existing controllers.</li>
<li><b>Options:</b> kam se kam do likho, har ek ke trade-off ke saath (scale, cost, failure behaviour, operations).</li>
<li><b>Decision:</b> ek chuno aur requirement se justify karo, preference se nahi.</li>
<li><b>Failure check:</b> poochho ki WAN, controller, switch, RADIUS server ya power supply fail ho to kya hoga.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Design method aur chapter map">
<rect x="10" y="10" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="40" text-anchor="middle" class="svg-ink" font-size="12">Requirements</text>
<rect x="140" y="10" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="195" y="40" text-anchor="middle" class="svg-ink" font-size="12">Constraints</text>
<rect x="270" y="10" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="325" y="40" text-anchor="middle" class="svg-ink" font-size="12">Options</text>
<rect x="400" y="10" width="110" height="50" rx="8" fill="#fde68a"/><text x="455" y="40" text-anchor="middle" class="svg-ink" font-size="12">Decision</text>
<rect x="530" y="10" width="100" height="50" rx="8" fill="#fed7aa"/><text x="580" y="40" text-anchor="middle" class="svg-ink" font-size="12">Failure check</text>
<line x1="120" y1="35" x2="140" y2="35" stroke="#64748b"/><line x1="250" y1="35" x2="270" y2="35" stroke="#64748b"/><line x1="380" y1="35" x2="400" y2="35" stroke="#64748b"/><line x1="510" y1="35" x2="530" y2="35" stroke="#64748b"/>
<rect x="10" y="100" width="200" height="34" rx="8" fill="#e2e8f0"/><text x="110" y="122" text-anchor="middle" class="svg-ink" font-size="12">Architecture aur AP modes</text>
<rect x="220" y="100" width="200" height="34" rx="8" fill="#e2e8f0"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="12">Controllers, HA, AP join</text>
<rect x="430" y="100" width="200" height="34" rx="8" fill="#e2e8f0"/><text x="530" y="122" text-anchor="middle" class="svg-ink" font-size="12">PoE, mGig, uplinks, VLANs</text>
<rect x="115" y="150" width="200" height="34" rx="8" fill="#e2e8f0"/><text x="215" y="172" text-anchor="middle" class="svg-ink" font-size="12">SSIDs, rates, QoS</text>
<rect x="325" y="150" width="200" height="34" rx="8" fill="#e2e8f0"/><text x="425" y="172" text-anchor="middle" class="svg-ink" font-size="12">Security, AAA, assurance</text>
<text x="10" y="214" class="svg-muted" font-size="11">Is module ka har design topic method ke step 3 aur 4 mein fit hota hai.</text>
</svg><p class="cap">Upar method; neeche ke topics options aur decision ko feed karte hain.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>9800 appliance, 9800-CL, embedded wireless, SD-Access fabric wireless aur Meraki mein se chuno aur choice justify karo.</li>
<li>AP mode (local, FlexConnect, bridge, monitor, sniffer) chuno aur batao ki har WLAN centrally ya locally switched hai.</li>
<li>Aisa FlexConnect branch design banao jo WAN failure survive kare, authentication samet.</li>
<li>Controller ko APs, clients aur throughput par size karo, growth jodo, aur yaad rakho ki SSO pair ek unit ke barabar hai.</li>
<li>Samjhao ki AP controller kaise discover karta hai aur DHCP option 43, NTP, UDP 5246 aur 5247 kya karte hain.</li>
<li>PoE budget aur uplink oversubscription ratio calculate karo.</li>
<li>Voice aur video ke liye SSID count, minimum data rate aur QoS marks chuno.</li>
<li>WPA3, 802.1X, MAB, guest anchor, DHCP aur DNS design karo, aur rogue handling tatha Spaces aur Catalyst Center ke roles samjhao.</li>
</ul>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakhne wala fact</th></tr>
<tr><td>PoE</td><td>Switch par af 15.4 W, at 30 W, bt 60 W aur 90 W; device ko kam milta hai</td></tr>
<tr><td>FlexConnect</td><td>Local switching sirf FlexConnect APs par; local mode se zyada RTT tolerate karta hai (lagbhag 300 ms vs lagbhag 100 ms)</td></tr>
<tr><td>HA</td><td>SSO client state bachata hai; N+1 slow hai; pair ki capacity ek unit ke barabar</td></tr>
<tr><td>AP join</td><td>DHCP option 43, DNS, stored controller, broadcast; CAPWAP UDP 5246 aur 5247</td></tr>
<tr><td>Beacon overhead</td><td>SSIDs ki sankhya aur sabse kam mandatory rate se control hota hai</td></tr>
<tr><td>QoS</td><td>Voice EF se UP 6 AC_VO; video AF41 se UP 4 AC_VI; best effort 0; background CS1 se UP 1</td></tr>
<tr><td>6 GHz</td><td>Sirf WPA3; PMF required; legacy rates nahi</td></tr>
<tr><td>Guest</td><td>Foreign controller DMZ ke anchor tak tunnel karta hai</td></tr>
</table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>CAPWAP</dt><dd>AP aur controller ke beech tunnel protocol.</dd>
<dt>SSO</dt><dd>Stateful switchover: hot standby controller jo AP aur client state rakhta hai.</dd>
<dt>PMF</dt><dd>Protected Management Frames, jo forged management frames rokte hain.</dd>
<dt>AAA override</dt><dd>RADIUS server login ke baad user ko VLAN, ACL ya SGT assign karta hai.</dd>
<dt>CoA</dt><dd>Change of Authorization: server chalte session ki policy badalta hai.</dd>
<dt>RAP aur MAP</dt><dd>Root AP jiske paas wire hai, aur mesh AP jo wireless backhaul use karta hai.</dd>
</dl>

<div class="warn"><p><b>Exam mein bachne wali common mistakes.</b> Constraints padhne se pehle product chunna. Failure check ignore karna. Sabse bade option se answer dena. Yeh bhoolna ki wired network (PoE, uplinks, DHCP) wireless design ka hissa hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Scenario questions aksar deciding fact ek vaakya mein chhupate hain, jaise "WAN ki latency 150 ms hai" ya "switch ka budget 370 W hai". Options padhne se pehle numbers underline karo.</p></div>

<div class="scn"><h4>Design review jisne teen galtiyan pakdi</h4><p>Ek team ne retail design present kiya: head office mein 9800 appliance, 120 ms WAN ke upar 60 stores local mode mein, har 48-port PoE+ switch par 24 Wi-Fi 6E APs, aur 6 SSIDs. Paanch-step method use karne wale reviewer ne dus minute mein teen galtiyan pakdi: guidance se zyada latency par local mode (FlexConnect use karo), aisa PoE budget jo 24 APs nahi sambhal sakta, aur bahut zyada SSIDs. Team ne hardware order karne se pehle revise kiya, jisse mehenga re-install bach gaya.</p><p><b>Lesson:</b> structured review installation ke baad redesign se sasta hai.</p></div>

<div class="iv"><p class="q">"Naye customer ke liye Wi-Fi kaise design karoge, step by step batao."</p><p>Strong answer: paanch steps use karo. Requirements aur constraints jama karo, architectures shortlist karo, site type ke hisaab se AP modes aur switching chuno, HA ke saath controllers size aur place karo, access switches par PoE, mGig aur uplinks check karo, phir WLAN, QoS, security, AAA, DHCP aur DNS design karo, aur aakhir mein assurance aur failure behaviour confirm karo. Mention karo ki aap survey se validate karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har baar requirements, constraints, options, decision aur failure check use karo.</li>
<li>WAN ke upar branch sites aam taur par FlexConnect aur local authentication plan maangte hain.</li>
<li>Controllers aur PoE ko worst case plus growth ke hisaab se size karo.</li>
<li>Kam SSIDs, ooncha minimum rate, consistent DSCP se UP marking.</li>
<li>Guest DMZ anchor par jata hai; staff ISE ke saath 802.1X use karta hai; assurance tools design ko prove karte hain.</li>
</ul></div>
`}};export{e as default};