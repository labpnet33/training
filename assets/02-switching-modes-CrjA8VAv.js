var e={id:`switching-modes`,h:{en:`Central and local switching, central and local authentication`,hi:`Central aur local switching, central aur local authentication`},body:{en:`
<p>Think of a courier company. <b>Central switching</b> means every parcel goes to the Mumbai sorting hub first, even if it is addressed to the next street in Pune. <b>Local switching</b> means the Pune depot hands it over directly. A separate question is who checks the sender's ID: the hub (<b>central authentication</b>) or the depot (<b>local authentication</b>). FlexConnect lets you choose both, <b>per WLAN</b>.</p>

<h3>Central switching</h3>
<p>The AP wraps the client frame in the CAPWAP data tunnel (UDP 5247) and sends it to the controller. The controller puts the client in the VLAN or interface that the policy profile names and routes it from there. This is the only behaviour of a local-mode AP, and it is what you want for a <b>guest WLAN</b> at a branch: guest traffic leaves the company network at headquarters, in the guest VLAN 50, and never touches the branch LAN.</p>

<h3>Local switching</h3>
<p>The AP removes the 802.11 header and puts the frame on its switch port, tagged with the client VLAN. The controller never sees the data. You enable it in the policy profile with <code>no central switching</code>. In the lab, the policy profile <code>PP-STAFF-PUN</code> uses VLAN 220, and a client of NK-STAFF in Pune gets an address from R2 in 10.30.20.0/24.</p>
<pre class="code"><span class="c">! policy profile: shut it down before changing the switching mode</span>
wireless profile policy PP-STAFF-PUN
 shutdown
 vlan 220
 no central switching
 no shutdown</pre>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Central versus local switching data paths">
<text x="160" y="18" text-anchor="middle" class="svg-ink" font-size="13">Central switching</text>
<rect x="20" y="130" width="70" height="34" rx="6" fill="#fed7aa"/><text x="55" y="152" text-anchor="middle" class="svg-ink" font-size="12">AP-PUN1</text>
<rect x="230" y="30" width="80" height="34" rx="6" fill="#bae6fd"/><text x="270" y="52" text-anchor="middle" class="svg-ink" font-size="12">WLC1</text>
<rect x="230" y="130" width="80" height="34" rx="6" fill="#bbf7d0"/><text x="270" y="152" text-anchor="middle" class="svg-ink" font-size="12">Pune server</text>
<path d="M70 130 L250 64" stroke="#2563eb" stroke-width="3" fill="none"/><path d="M280 64 L280 130" stroke="#2563eb" stroke-width="3" fill="none" stroke-dasharray="6 4"/>
<text x="60" y="95" class="svg-accent" font-size="12">tunnel over WAN</text>
<text x="160" y="205" text-anchor="middle" class="svg-muted" font-size="12">two WAN crossings</text>
<text x="480" y="18" text-anchor="middle" class="svg-ink" font-size="13">Local switching</text>
<rect x="360" y="130" width="70" height="34" rx="6" fill="#fed7aa"/><text x="395" y="152" text-anchor="middle" class="svg-ink" font-size="12">AP-PUN2</text>
<rect x="560" y="130" width="70" height="34" rx="6" fill="#bbf7d0"/><text x="595" y="152" text-anchor="middle" class="svg-ink" font-size="12">Pune server</text>
<rect x="470" y="30" width="80" height="34" rx="6" fill="#bae6fd"/><text x="510" y="52" text-anchor="middle" class="svg-ink" font-size="12">WLC1</text>
<line x1="430" y1="147" x2="560" y2="147" stroke="#16a34a" stroke-width="3"/>
<line x1="395" y1="130" x2="490" y2="64" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="420" y="95" class="svg-muted" font-size="12">control only</text>
<text x="480" y="205" text-anchor="middle" class="svg-muted" font-size="12">data stays on the branch VLAN</text>
</svg><p class="cap">Blue: client data in a CAPWAP tunnel to the controller. Green: data switched on the branch.</p></div>

<h3>Central and local authentication</h3>
<p>For a WLAN that only needs a pre-shared key (WPA2-Personal), the AP can finish the four-way handshake itself. For 802.1X, somebody has to relay EAP to RADIUS.</p>
<ul>
<li><b>Central authentication</b> (default): the controller talks to RADIUS. If the WAN is down, no new 802.1X client can join.</li>
<li><b>Local authentication</b>: the AP sends the RADIUS request itself, to a RADIUS server group named in the flex profile. The server (RAD-PUN in the branch server room) sees the <b>AP address</b> as the network access device. The policy profile needs <code>no central authentication</code>. Details in chapter 7.</li>
</ul>

<h3>Central association</h3>
<p>By default a FlexConnect AP answers the 802.11 association itself. The policy profile option <code>central association</code> sends it to the controller; it needs the WAN for every association, so it also stops working in standalone mode. Use it only when the design needs controller-side decisions at association time. <code>central dhcp</code> is the matching option for DHCP: with local switching, the default is that the branch DHCP server answers; central DHCP forwards the client DHCP to the controller path.</p>

<h3>The matrix to remember</h3>
<table class="cmp">
<tr><th>Switching</th><th>Authentication</th><th>WAN up</th><th>WAN down (standalone)</th></tr>
<tr><td>Central</td><td>Central</td><td>works</td><td>not served</td></tr>
<tr><td>Local</td><td>Central (802.1X)</td><td>works</td><td>no new 802.1X clients (not served in the lab)</td></tr>
<tr><td>Local</td><td>Local (AP to RADIUS)</td><td>works</td><td>works, needs reachable branch RADIUS</td></tr>
<tr><td>Local</td><td>PSK or open</td><td>works</td><td>works</td></tr>
</table>

<h3>What the client detail shows</h3>
<p>The simulator adds a FlexConnect block to the client detail, to make the choice visible.</p>
<pre class="out">WLC1# show wireless client mac-address 0050.32e9.9f01 detail
Client MAC Address : 0050.32e9.9f01
Client IPv4 Address: 10.30.20.51
AP Name            : AP-PUN1
Policy Profile     : PP-STAFF-PUN
VLAN               : 220
FlexConnect (model view):
  <span class="hl">Switching Mode                : Local (switched on the AP, not tunnelled to the controller)</span>
  Flex Profile                  : FLEX-PUNE
  Client VLAN placement         : VLAN 220 (vlan-name STAFF-PUN)</pre>
<p>Compare it with a client on AP1 at headquarters: <code>Switching Mode (model): Central (local-mode AP)</code>. Same controller, two behaviours, decided by the tags of the AP.</p>

<div class="eg"><p><b>Worked example.</b> Pune has three WLANs. NK-STAFF: PSK, local switching, survives a WAN cut. NK-CORP: 802.1X, local switching, local authentication, survives only if RAD-PUN knows the AP addresses 10.30.10.11 and 10.30.10.12 as clients with the right key. NK-GUEST: central switching into HQ VLAN 50, disappears when the WAN drops. That is a deliberate design: you accept that guests lose service, because their traffic must exit through headquarters.</p></div>

<div class="warn"><p><b>Common mistake.</b> Editing the policy profile while it is enabled. The model, like the real controller, refuses: shut the profile down first, change it, then <code>no shutdown</code>. A shut policy profile takes its WLAN off the air for that tag.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>no central switching</code> is the command for <b>local</b> switching. Central switching is the default, and it is the setting shown when you see no line at all in the profile.</p></div>

<div class="scn"><h4>Guests that should not stay in Pune</h4><p>A retail chain wanted guest Wi-Fi in every shop but refused to let guest traffic touch the shop LAN. The team made NK-GUEST centrally switched at all branches: guests got headquarters addresses and a firewall policy there. During a provider fault, shops lost guest Wi-Fi but staff scanners kept working, since staff WLANs were locally switched and PSK based.</p><p><b>Lesson:</b> pick switching per WLAN, by where the traffic is allowed to live.</p></div>

<div class="iv"><p class="q">"Can one FlexConnect AP do both central and local switching?"</p><p>Yes, per WLAN. The decision is in the policy profile mapped to that WLAN by the policy tag. A branch AP can serve a locally switched staff WLAN and a centrally switched guest WLAN at the same time. Mention that in standalone mode only the locally switched WLANs survive.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Central switching tunnels data to the controller; local switching puts it on the branch VLAN.</li>
<li>Local switching is <code>no central switching</code> in the policy profile (profile shut first).</li>
<li>Authentication is independent: central by default, local needs a flex profile group and <code>no central authentication</code>.</li>
<li>Choice is per WLAN; guests are usually centrally switched.</li>
<li>In standalone mode only locally switched WLANs that need nothing from the controller survive.</li>
</ul></div>
`,hi:`
<p>Ek courier company socho. <b>Central switching</b> ka matlab har parcel pehle Mumbai sorting hub jata hai, chahe address Pune ki agli gali ka ho. <b>Local switching</b> ka matlab Pune depot use seedha hand over kar deta hai. Alag sawal hai ki sender ka ID kaun check kare: hub (<b>central authentication</b>) ya depot (<b>local authentication</b>). FlexConnect dono choose karne deta hai, <b>per WLAN</b>.</p>

<h3>Central switching</h3>
<p>AP client frame ko CAPWAP data tunnel (UDP 5247) mein wrap karke controller ko bhejta hai. Controller client ko us VLAN ya interface mein rakhta hai jo policy profile batata hai aur wahin se route karta hai. Local-mode AP ka yahi ek behaviour hai, aur branch ke <b>guest WLAN</b> ke liye yahi chahiye: guest traffic headquarters mein, guest VLAN 50 mein, company network se bahar nikalta hai aur branch LAN ko chhuta bhi nahi.</p>

<h3>Local switching</h3>
<p>AP 802.11 header hata kar frame ko apne switch port par rakhta hai, client VLAN ke tag ke saath. Controller data kabhi nahi dekhta. Policy profile mein <code>no central switching</code> se enable hota hai. Lab mein policy profile <code>PP-STAFF-PUN</code> VLAN 220 use karta hai, aur Pune mein NK-STAFF ke client ko R2 se 10.30.20.0/24 mein address milta hai.</p>
<pre class="code"><span class="c">! policy profile: switching mode badalne se pehle shut karo</span>
wireless profile policy PP-STAFF-PUN
 shutdown
 vlan 220
 no central switching
 no shutdown</pre>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Central aur local switching data paths">
<text x="160" y="18" text-anchor="middle" class="svg-ink" font-size="13">Central switching</text>
<rect x="20" y="130" width="70" height="34" rx="6" fill="#fed7aa"/><text x="55" y="152" text-anchor="middle" class="svg-ink" font-size="12">AP-PUN1</text>
<rect x="230" y="30" width="80" height="34" rx="6" fill="#bae6fd"/><text x="270" y="52" text-anchor="middle" class="svg-ink" font-size="12">WLC1</text>
<rect x="230" y="130" width="80" height="34" rx="6" fill="#bbf7d0"/><text x="270" y="152" text-anchor="middle" class="svg-ink" font-size="12">Pune server</text>
<path d="M70 130 L250 64" stroke="#2563eb" stroke-width="3" fill="none"/><path d="M280 64 L280 130" stroke="#2563eb" stroke-width="3" fill="none" stroke-dasharray="6 4"/>
<text x="60" y="95" class="svg-accent" font-size="12">WAN par tunnel</text>
<text x="160" y="205" text-anchor="middle" class="svg-muted" font-size="12">do baar WAN crossing</text>
<text x="480" y="18" text-anchor="middle" class="svg-ink" font-size="13">Local switching</text>
<rect x="360" y="130" width="70" height="34" rx="6" fill="#fed7aa"/><text x="395" y="152" text-anchor="middle" class="svg-ink" font-size="12">AP-PUN2</text>
<rect x="560" y="130" width="70" height="34" rx="6" fill="#bbf7d0"/><text x="595" y="152" text-anchor="middle" class="svg-ink" font-size="12">Pune server</text>
<rect x="470" y="30" width="80" height="34" rx="6" fill="#bae6fd"/><text x="510" y="52" text-anchor="middle" class="svg-ink" font-size="12">WLC1</text>
<line x1="430" y1="147" x2="560" y2="147" stroke="#16a34a" stroke-width="3"/>
<line x1="395" y1="130" x2="490" y2="64" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="420" y="95" class="svg-muted" font-size="12">sirf control</text>
<text x="480" y="205" text-anchor="middle" class="svg-muted" font-size="12">data branch VLAN par rehta hai</text>
</svg><p class="cap">Neela: client data CAPWAP tunnel mein controller tak. Hara: branch par switch hua data.</p></div>

<h3>Central aur local authentication</h3>
<p>Sirf pre-shared key (WPA2-Personal) wale WLAN ke liye AP four-way handshake khud poora kar sakta hai. 802.1X ke liye kisi ko EAP ko RADIUS tak relay karna padta hai.</p>
<ul>
<li><b>Central authentication</b> (default): controller RADIUS se baat karta hai. WAN down ho to koi naya 802.1X client join nahi kar sakta.</li>
<li><b>Local authentication</b>: AP khud RADIUS request bhejta hai, flex profile mein diye RADIUS server group ko. Server (branch server room ka RAD-PUN) <b>AP ka address</b> network access device ke roop mein dekhta hai. Policy profile mein <code>no central authentication</code> chahiye. Details chapter 7 mein.</li>
</ul>

<h3>Central association</h3>
<p>Default mein FlexConnect AP 802.11 association ka jawab khud deta hai. Policy profile option <code>central association</code> use controller ko bhejta hai; har association ke liye WAN chahiye, isliye woh standalone mode mein bhi kaam karna band kar deta hai. Sirf tab use karo jab design ko association ke time controller-side decisions chahiye. <code>central dhcp</code> DHCP ka matching option hai: local switching mein default yeh hai ki branch DHCP server jawab deta hai; central DHCP client DHCP ko controller path se forward karta hai.</p>

<h3>Yaad rakhne wala matrix</h3>
<table class="cmp">
<tr><th>Switching</th><th>Authentication</th><th>WAN up</th><th>WAN down (standalone)</th></tr>
<tr><td>Central</td><td>Central</td><td>chalta hai</td><td>serve nahi hota</td></tr>
<tr><td>Local</td><td>Central (802.1X)</td><td>chalta hai</td><td>naye 802.1X clients nahi (lab mein serve nahi hota)</td></tr>
<tr><td>Local</td><td>Local (AP se RADIUS)</td><td>chalta hai</td><td>chalta hai, branch RADIUS reachable chahiye</td></tr>
<tr><td>Local</td><td>PSK ya open</td><td>chalta hai</td><td>chalta hai</td></tr>
</table>

<h3>Client detail kya dikhata hai</h3>
<p>Simulator client detail mein FlexConnect block jodta hai, taaki choice dikhe.</p>
<pre class="out">WLC1# show wireless client mac-address 0050.32e9.9f01 detail
Client MAC Address : 0050.32e9.9f01
Client IPv4 Address: 10.30.20.51
AP Name            : AP-PUN1
Policy Profile     : PP-STAFF-PUN
VLAN               : 220
FlexConnect (model view):
  <span class="hl">Switching Mode                : Local (switched on the AP, not tunnelled to the controller)</span>
  Flex Profile                  : FLEX-PUNE
  Client VLAN placement         : VLAN 220 (vlan-name STAFF-PUN)</pre>
<p>Headquarters ke AP1 ke client se compare karo: <code>Switching Mode (model): Central (local-mode AP)</code>. Controller wahi, behaviour do, AP ke tags decide karte hain.</p>

<div class="eg"><p><b>Worked example.</b> Pune mein teen WLANs hain. NK-STAFF: PSK, local switching, WAN cut bhi survive karta hai. NK-CORP: 802.1X, local switching, local authentication, tabhi survive karta hai jab RAD-PUN AP addresses 10.30.10.11 aur 10.30.10.12 ko sahi key ke saath clients ke roop mein jaanta ho. NK-GUEST: HQ VLAN 50 mein central switching, WAN girte hi gayab. Yeh jaanbujh kar design hai: aap maante ho ki guests ki service jayegi, kyunki unka traffic headquarters se hi niklna chahiye.</p></div>

<div class="warn"><p><b>Common mistake.</b> Policy profile ko enabled rehte edit karna. Model, asli controller ki tarah, mana kar deta hai: pehle profile shut karo, badlo, phir <code>no shutdown</code>. Shut policy profile us tag ke liye apna WLAN air se hata deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>no central switching</code> <b>local</b> switching ka command hai. Central switching default hai, aur profile mein koi line na dikhe tab wahi setting hoti hai.</p></div>

<div class="scn"><h4>Guests jo Pune mein nahi rehne chahiye</h4><p>Ek retail chain har shop mein guest Wi-Fi chahti thi lekin guest traffic ko shop LAN chhune nahi dena chahti thi. Team ne sab branches par NK-GUEST ko centrally switched banaya: guests ko headquarters ke addresses aur wahan firewall policy mili. Provider fault mein shops ka guest Wi-Fi gaya lekin staff scanners chalte rahe, kyunki staff WLANs locally switched aur PSK based the.</p><p><b>Lesson:</b> switching per WLAN choose karo, is hisaab se ki traffic kahan rehne ki ijazat hai.</p></div>

<div class="iv"><p class="q">"Kya ek FlexConnect AP central aur local dono switching kar sakta hai?"</p><p>Haan, per WLAN. Decision us policy profile mein hota hai jo policy tag se WLAN ko map hota hai. Branch AP ek locally switched staff WLAN aur ek centrally switched guest WLAN ek saath serve kar sakta hai. Bolo ki standalone mode mein sirf locally switched WLANs bachte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Central switching data ko controller tak tunnel karta hai; local switching use branch VLAN par rakhta hai.</li>
<li>Local switching policy profile mein <code>no central switching</code> hai (pehle profile shut).</li>
<li>Authentication independent hai: default central, local ke liye flex profile group aur <code>no central authentication</code> chahiye.</li>
<li>Choice per WLAN hai; guests aam taur par centrally switched hote hain.</li>
<li>Standalone mode mein sirf woh locally switched WLANs bachte hain jinhe controller se kuch nahi chahiye.</li>
</ul></div>
`}};export{e as default};