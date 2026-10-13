var e={id:`ap-modes`,h:{en:`AP modes, central vs local switching, FlexConnect and mesh`,hi:`AP modes, central vs local switching, FlexConnect aur mesh`},body:{en:`
<p><b>Start with a post-office analogy.</b> An AP in <b>local mode</b> is like a post-office counter that hands every parcel to a central sorting hall far away. An AP in <b>FlexConnect mode</b> can sort local parcels at the counter itself, and keeps working even if the road to the central hall is closed.</p>

<h3>The case: Lakeside Bank</h3>
<p>Lakeside Bank, a fictional regional bank, has 40 branches, each with 3 to 6 APs, linked to a data center by a 10 Mbps MPLS WAN with 80 ms round-trip time. Staff use a corporate SSID with 802.1X, and a branch must keep taking card payments when the WAN is down. Each branch also has a drive-through ATM kiosk 180 metres from the building, with no cable run allowed across the car park.</p>
<p>Requirements: staff Wi-Fi survives WAN failure; branch traffic to the branch printers and the payment terminals should not cross the WAN twice; the ATM kiosk needs a link. Constraints: thin WAN, one branch technician, no trenching.</p>

<h3>AP modes you must know</h3>
<table class="cmp"><tr><th>Mode</th><th>What it does</th><th>Design use</th></tr>
<tr><td><b>Local</b></td><td>Serves clients, tunnels all data to the controller in CAPWAP, scans other channels briefly</td><td>Campus with the controller close and a fast link</td></tr>
<tr><td><b>FlexConnect</b></td><td>Serves clients; each WLAN can be switched centrally or locally; keeps working in standalone mode if the controller is lost</td><td>Branches across a WAN</td></tr>
<tr><td><b>Bridge (mesh)</b></td><td>AP uses a radio as a wireless backhaul to a root AP</td><td>Outdoor areas and places with no cable</td></tr>
<tr><td><b>Monitor</b></td><td>Does not serve clients; scans all channels for rogues, wIPS and location</td><td>Dedicated security or location sensor</td></tr>
<tr><td><b>Sniffer</b></td><td>Captures 802.11 frames and sends them to a packet analyser</td><td>Troubleshooting, not a permanent role</td></tr>
</table>
<p>Other modes exist on specific platforms (for example Flex+Bridge and SE-Connect for spectrum analysis), but the five above are what the blueprint tests most.</p>

<h3>Central switching versus local switching</h3>
<p>This is the heart of the chapter. With <b>central switching</b>, the AP wraps client data in a CAPWAP tunnel and the controller puts it on a VLAN. With <b>local switching</b>, the AP drops the client traffic straight onto the local access-switch VLAN, and only control traffic goes to the controller. Local switching is only possible on FlexConnect APs.</p>
<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Central versus local switching">
<rect x="10" y="10" width="620" height="260" rx="10" fill="none" stroke="#e2e8f0"/>
<rect x="20" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="75" y="48" text-anchor="middle" class="svg-ink" font-size="12">Controller</text>
<rect x="500" y="20" width="120" height="46" rx="8" fill="#fed7aa"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="12">Data center</text><text x="560" y="56" text-anchor="middle" class="svg-ink" font-size="12">ISE, DHCP</text>
<line x1="130" y1="43" x2="500" y2="43" stroke="#64748b"/>
<rect x="250" y="93" width="140" height="26" rx="13" fill="#e2e8f0"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="12">WAN</text>
<line x1="75" y1="66" x2="75" y2="160" stroke="#64748b"/><line x1="75" y1="160" x2="200" y2="160" stroke="#64748b"/>
<rect x="200" y="140" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="260" y="160" text-anchor="middle" class="svg-ink" font-size="12">Branch AP</text><text x="260" y="176" text-anchor="middle" class="svg-ink" font-size="12">FlexConnect</text>
<line x1="260" y1="184" x2="260" y2="214" stroke="#64748b"/>
<rect x="190" y="214" width="140" height="36" rx="8" fill="#ddd6fe"/><text x="260" y="236" text-anchor="middle" class="svg-ink" font-size="12">Branch switch</text>
<rect x="440" y="214" width="170" height="36" rx="8" fill="#fde68a"/><text x="525" y="236" text-anchor="middle" class="svg-ink" font-size="12">Printer, payment POS</text>
<line x1="330" y1="232" x2="440" y2="232" stroke="#16a34a" stroke-width="3"/>
<text x="385" y="224" text-anchor="middle" class="svg-accent" font-size="11">Local</text>
<text x="105" y="150" class="svg-muted" font-size="11">Central</text>
<text x="20" y="262" class="svg-muted" font-size="11">Green = local switching stays in branch. Grey line = tunnel over WAN.</text>
</svg><p class="cap">Central switching crosses the WAN to the controller. Local switching keeps branch traffic inside the branch.</p></div>

<table class="cmp"><tr><th>Question</th><th>Central switching</th><th>Local switching</th></tr>
<tr><td>Where do client packets go?</td><td>To the controller over CAPWAP</td><td>Straight to the local VLAN</td></tr>
<tr><td>WAN load</td><td>High: all data crosses the WAN</td><td>Low: only control and AAA</td></tr>
<tr><td>Policy and inspection</td><td>One central point (firewall, ACL)</td><td>Must be applied at the branch</td></tr>
<tr><td>WAN failure</td><td>Clients lose service</td><td>Existing and new clients can still work if auth is local or cached</td></tr>
</table>

<h3>FlexConnect groups and branch design</h3>
<p>A <b>FlexConnect group</b> collects the APs of one branch (or one region). It shares local authentication information, a backup RADIUS server, and key caches for fast roaming such as CCKM and OKC, so a user moving between APs does not call the data center each time. On the Catalyst 9800 you build this with a <b>flex profile</b> attached to a <b>site tag</b> (with local site turned off), and a <b>policy profile</b> that turns central switching off for the WLAN.</p>
<pre class="code"><span class="c">! 9800 policy profile for local switching</span>
wireless profile policy POL-STAFF-LOCAL
 no central switching
 vlan 20
 no shutdown
<span class="c">! Flex profile and site tag for the branch</span>
wireless profile flex FLEX-BRANCH
 native-vlan-id 10
wireless tag site SITE-BRANCH
 flex-profile FLEX-BRANCH
 no local-site</pre>
<p>Design rules: the VLAN must exist on the branch switch trunk; the AP's own management VLAN is its native VLAN; round-trip time to the controller should stay below about 300 ms for FlexConnect (about 100 ms is the guidance for local mode); and a backup RADIUS or local authentication path must be planned for WAN-down.</p>

<h3>Outdoor and mesh for the ATM kiosk</h3>
<p>The kiosk 180 m away cannot be cabled, so Lakeside uses an outdoor <b>mesh</b>. A <b>root AP (RAP)</b> on the branch building has a wire; a <b>mesh AP (MAP)</b> at the kiosk connects to it over a 5 GHz wireless backhaul in bridge mode. Design points: line of sight, antenna choice, keep the hop count low (three or fewer is the usual guidance), and use a dedicated backhaul rather than competing with client traffic. Mesh bandwidth halves roughly with every extra hop on a single-radio backhaul.</p>

<div class="warn"><p><b>Common mistakes.</b> Local switching a WLAN but forgetting to add the VLAN on the branch switch trunk, so clients associate but get no address. Using bridge mode for an AP that actually has a cable. Putting 5 mesh hops on a payment link.</p></div>
<div class="exam"><p><b>Exam trap.</b> FlexConnect is an AP mode; local and central switching are per-WLAN settings. A FlexConnect AP can still switch some WLANs centrally. Do not say "FlexConnect means everything is local".</p></div>

<div class="scn"><h4>The WAN went down, the branch did not</h4><p>A fibre cut isolated a Lakeside branch for three hours. Staff on the corporate SSID kept working on the printers and the local payment terminal because the WLAN was locally switched and the FlexConnect group held a backup RADIUS server in the branch. New users could not authenticate for a short time until the local server was reached, which the team then fixed by adding a second local authentication option.</p><p><b>Lesson:</b> design for the failure, not for the happy day. Decide in advance what must work when the WAN is down.</p></div>

<div class="iv"><p class="q">"Why use FlexConnect at a branch instead of local mode?"</p><p>Strong answer: local mode tunnels everything to the controller, so a WAN outage drops the AP and its clients, and every packet crosses a thin WAN. FlexConnect keeps working in standalone mode, can switch locally so branch traffic stays in the branch, and shares fast-roaming keys through a FlexConnect group. Mention the RTT limits and a backup authentication plan.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Modes: local, FlexConnect, bridge, monitor, sniffer; each has one clear job.</li>
<li>Central switching tunnels data to the controller; local switching drops it on the branch VLAN.</li>
<li>FlexConnect groups share backup RADIUS and fast-roaming keys across a branch.</li>
<li>On the 9800 use flex profile, site tag and a policy profile with no central switching.</li>
<li>Mesh uses a root AP, a mesh AP, a 5 GHz backhaul and few hops.</li>
</ul></div>
`,hi:`
<p><b>Post-office ki analogy se shuru karte hain.</b> <b>Local mode</b> mein AP ek post-office counter jaisa hai jo har parcel door ke central sorting hall ko bhej deta hai. <b>FlexConnect mode</b> mein AP local parcels counter par hi sort kar sakta hai, aur central hall ka raasta band ho tab bhi kaam karta rehta hai.</p>

<h3>Case: Lakeside Bank</h3>
<p>Lakeside Bank, ek fictional regional bank, ke 40 branches hain, har ek mein 3 se 6 APs, jo 10 Mbps MPLS WAN aur 80 ms round-trip time se data center se jude hain. Staff 802.1X wale corporate SSID ka use karta hai, aur WAN down hone par bhi branch ko card payments lena jaari rakhna hai. Har branch mein building se 180 metre door ek drive-through ATM kiosk bhi hai, jahan car park ke across cable bichhane ki permission nahi hai.</p>
<p>Requirements: WAN failure mein staff Wi-Fi survive kare; branch printers aur payment terminals ka traffic WAN ko do baar cross na kare; ATM kiosk ko link mile. Constraints: patli WAN, ek branch technician, trenching nahi.</p>

<h3>AP modes jo aapko aani chahiye</h3>
<table class="cmp"><tr><th>Mode</th><th>Kya karta hai</th><th>Design use</th></tr>
<tr><td><b>Local</b></td><td>Clients serve karta hai, saara data CAPWAP mein controller ko tunnel karta hai, thodi der ke liye doosre channels scan karta hai</td><td>Campus jahan controller paas ho aur link fast ho</td></tr>
<tr><td><b>FlexConnect</b></td><td>Clients serve karta hai; har WLAN central ya local switch ho sakta hai; controller kho jaye to standalone mode mein chalta rehta hai</td><td>WAN ke upar branches</td></tr>
<tr><td><b>Bridge (mesh)</b></td><td>AP ek radio ko root AP tak wireless backhaul ke roop mein use karta hai</td><td>Outdoor areas aur jahan cable nahi hai</td></tr>
<tr><td><b>Monitor</b></td><td>Clients serve nahi karta; rogues, wIPS aur location ke liye saare channels scan karta hai</td><td>Dedicated security ya location sensor</td></tr>
<tr><td><b>Sniffer</b></td><td>802.11 frames capture karke packet analyser ko bhejta hai</td><td>Troubleshooting, permanent role nahi</td></tr>
</table>
<p>Specific platforms par aur modes bhi hain (jaise Flex+Bridge aur spectrum analysis ke liye SE-Connect), lekin blueprint mein sabse zyada upar wale paanch test hote hain.</p>

<h3>Central switching versus local switching</h3>
<p>Yeh chapter ka dil hai. <b>Central switching</b> mein AP client data ko CAPWAP tunnel mein wrap karta hai aur controller use VLAN par daalta hai. <b>Local switching</b> mein AP client traffic ko seedha local access-switch VLAN par chhod deta hai, aur sirf control traffic controller ko jata hai. Local switching sirf FlexConnect APs par possible hai.</p>
<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Central versus local switching">
<rect x="10" y="10" width="620" height="260" rx="10" fill="none" stroke="#e2e8f0"/>
<rect x="20" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="75" y="48" text-anchor="middle" class="svg-ink" font-size="12">Controller</text>
<rect x="500" y="20" width="120" height="46" rx="8" fill="#fed7aa"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="12">Data center</text><text x="560" y="56" text-anchor="middle" class="svg-ink" font-size="12">ISE, DHCP</text>
<line x1="130" y1="43" x2="500" y2="43" stroke="#64748b"/>
<rect x="250" y="93" width="140" height="26" rx="13" fill="#e2e8f0"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="12">WAN</text>
<line x1="75" y1="66" x2="75" y2="160" stroke="#64748b"/><line x1="75" y1="160" x2="200" y2="160" stroke="#64748b"/>
<rect x="200" y="140" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="260" y="160" text-anchor="middle" class="svg-ink" font-size="12">Branch AP</text><text x="260" y="176" text-anchor="middle" class="svg-ink" font-size="12">FlexConnect</text>
<line x1="260" y1="184" x2="260" y2="214" stroke="#64748b"/>
<rect x="190" y="214" width="140" height="36" rx="8" fill="#ddd6fe"/><text x="260" y="236" text-anchor="middle" class="svg-ink" font-size="12">Branch switch</text>
<rect x="440" y="214" width="170" height="36" rx="8" fill="#fde68a"/><text x="525" y="236" text-anchor="middle" class="svg-ink" font-size="12">Printer, payment POS</text>
<line x1="330" y1="232" x2="440" y2="232" stroke="#16a34a" stroke-width="3"/>
<text x="385" y="224" text-anchor="middle" class="svg-accent" font-size="11">Local</text>
<text x="105" y="150" class="svg-muted" font-size="11">Central</text>
<text x="20" y="262" class="svg-muted" font-size="11">Green = local switching branch ke andar. Grey line = WAN par tunnel.</text>
</svg><p class="cap">Central switching WAN cross karke controller tak jata hai. Local switching branch traffic ko branch ke andar rakhta hai.</p></div>

<table class="cmp"><tr><th>Sawal</th><th>Central switching</th><th>Local switching</th></tr>
<tr><td>Client packets kahan jaate hain?</td><td>CAPWAP se controller tak</td><td>Seedha local VLAN par</td></tr>
<tr><td>WAN load</td><td>Zyada: saara data WAN cross karta hai</td><td>Kam: sirf control aur AAA</td></tr>
<tr><td>Policy aur inspection</td><td>Ek central point (firewall, ACL)</td><td>Branch par apply karni padti hai</td></tr>
<tr><td>WAN failure</td><td>Clients ki service chali jaati hai</td><td>Agar auth local ya cached ho to existing aur naye clients chal sakte hain</td></tr>
</table>

<h3>FlexConnect groups aur branch design</h3>
<p><b>FlexConnect group</b> ek branch (ya ek region) ke APs ko ek saath rakhta hai. Yeh local authentication information, backup RADIUS server, aur CCKM aur OKC jaise fast-roaming ke key caches share karta hai, taaki user ek AP se doosre AP par jaye to har baar data center ko call na karna pade. Catalyst 9800 par aap iske liye <b>flex profile</b> ko <b>site tag</b> se attach karte ho (local site off ke saath), aur ek <b>policy profile</b> jo WLAN ke liye central switching off karta hai.</p>
<pre class="code"><span class="c">! 9800 policy profile for local switching</span>
wireless profile policy POL-STAFF-LOCAL
 no central switching
 vlan 20
 no shutdown
<span class="c">! Flex profile and site tag for the branch</span>
wireless profile flex FLEX-BRANCH
 native-vlan-id 10
wireless tag site SITE-BRANCH
 flex-profile FLEX-BRANCH
 no local-site</pre>
<p>Design rules: VLAN branch switch ke trunk par exist karni chahiye; AP ki apni management VLAN uski native VLAN hoti hai; FlexConnect ke liye controller tak round-trip time lagbhag 300 ms se kam rehna chahiye (local mode ke liye guidance lagbhag 100 ms hai); aur WAN-down ke liye backup RADIUS ya local authentication path plan karna zaroori hai.</p>

<h3>ATM kiosk ke liye outdoor aur mesh</h3>
<p>180 m door kiosk par cable nahi ja sakta, isliye Lakeside outdoor <b>mesh</b> use karta hai. Branch building par <b>root AP (RAP)</b> ke paas wire hai; kiosk par <b>mesh AP (MAP)</b> bridge mode mein 5 GHz wireless backhaul se uske saath connect hota hai. Design points: line of sight, antenna choice, hop count kam rakho (teen ya usse kam usual guidance hai), aur backhaul ko dedicated rakho taaki wo client traffic ke saath compete na kare. Single-radio backhaul par har extra hop ke saath mesh bandwidth lagbhag aadhi hoti jaati hai.</p>

<div class="warn"><p><b>Common mistakes.</b> WLAN ko local switch karna lekin branch switch ke trunk par VLAN add karna bhool jana, jisse clients associate to hote hain par address nahi milta. Aise AP ke liye bridge mode use karna jiske paas actual cable hai. Payment link par 5 mesh hops lagana.</p></div>
<div class="exam"><p><b>Exam trap.</b> FlexConnect ek AP mode hai; local aur central switching per-WLAN settings hain. FlexConnect AP kuch WLANs ko central switch bhi kar sakta hai. "FlexConnect matlab sab kuch local" mat bolo.</p></div>

<div class="scn"><h4>WAN gira, branch nahi gira</h4><p>Fibre cut ne Lakeside ke ek branch ko teen ghante ke liye alag kar diya. Corporate SSID par staff printers aur local payment terminal par kaam karta raha, kyunki WLAN locally switched thi aur FlexConnect group ke paas branch mein backup RADIUS server tha. Naye users kuch der ke liye authenticate nahi kar paaye jab tak local server tak pahunch nahi hui, jise team ne doosra local authentication option jodkar fix kiya.</p><p><b>Lesson:</b> failure ke liye design karo, happy day ke liye nahi. Pehle se decide karo ki WAN down hone par kya chalna chahiye.</p></div>

<div class="iv"><p class="q">"Branch par local mode ki jagah FlexConnect kyun use karte hain?"</p><p>Strong answer: local mode sab kuch controller ko tunnel karta hai, isliye WAN outage mein AP aur uske clients gir jaate hain, aur har packet patli WAN cross karta hai. FlexConnect standalone mode mein chalta rehta hai, locally switch kar sakta hai taaki branch traffic branch mein rahe, aur FlexConnect group ke through fast-roaming keys share karta hai. RTT limits aur backup authentication plan mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Modes: local, FlexConnect, bridge, monitor, sniffer; har ek ka ek clear kaam hai.</li>
<li>Central switching data ko controller tak tunnel karta hai; local switching use branch VLAN par chhodta hai.</li>
<li>FlexConnect groups ek branch mein backup RADIUS aur fast-roaming keys share karte hain.</li>
<li>9800 par flex profile, site tag aur no central switching wala policy profile use karo.</li>
<li>Mesh mein root AP, mesh AP, 5 GHz backhaul aur kam hops hote hain.</li>
</ul></div>
`}};export{e as default};