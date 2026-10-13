var e={id:`create-wlan`,h:{en:`Creating a WLAN: GUI tabs, CLI and mapping to a VLAN`,hi:`WLAN banana: GUI tabs, CLI aur VLAN se mapping`},body:{en:`
<p>Opening a new branch of a bank needs a form with several pages: the branch name and address (general details), who holds the keys and the alarm code (security), which customers get priority service (quality of service), and opening hours and limits (advanced rules). Creating a WLAN on a controller is exactly that form. The AireOS GUI splits it into four tabs: <b>General, Security, QoS and Advanced</b>. The CCNA exam loves screenshots of these tabs, so learn what lives where.</p>

<h3>Three names you must not mix up</h3>
<dl class="terms">
<dt>WLAN ID</dt><dd>A number (1 to 512 on AireOS) that identifies the WLAN inside the controller. APs in the default AP group only advertise WLAN IDs 1 to 16, so keep ordinary WLANs in that range.</dd>
<dt>Profile name</dt><dd>An administrative label, unique on the controller, that clients never see. Example: <code>STAFF</code>.</dd>
<dt>SSID</dt><dd>The network name broadcast in beacons that users pick on their device. Example: <code>NK-STAFF</code>. Two WLANs can even share an SSID if their security differs; the profile names must still be unique.</dd>
</dl>

<h3>Step 1: WLANs &gt; Create New</h3>
<p>In the top menu choose <b>WLANs</b>, select <b>Create New</b> and click <b>Go</b>. Enter Type <i>WLAN</i>, Profile Name <i>STAFF</i>, SSID <i>NK-STAFF</i>, ID <i>1</i>, and click <b>Apply</b>. The WLAN now exists but is <b>disabled</b>, and its default security is <b>WPA2 with 802.1X</b>. The edit page opens with the four tabs.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="The four tabs of a WLAN edit page">
<rect x="10" y="10" width="620" height="36" rx="6" fill="#e2e8f0"/><text x="30" y="33" class="svg-ink" font-size="13">WLANs &gt; Edit 'STAFF'</text>
<rect x="10" y="56" width="150" height="34" rx="6" fill="#bae6fd"/><text x="85" y="78" text-anchor="middle" class="svg-ink" font-size="13">General</text>
<rect x="166" y="56" width="150" height="34" rx="6" fill="#bbf7d0"/><text x="241" y="78" text-anchor="middle" class="svg-ink" font-size="13">Security</text>
<rect x="322" y="56" width="150" height="34" rx="6" fill="#fde68a"/><text x="397" y="78" text-anchor="middle" class="svg-ink" font-size="13">QoS</text>
<rect x="478" y="56" width="152" height="34" rx="6" fill="#ddd6fe"/><text x="554" y="78" text-anchor="middle" class="svg-ink" font-size="13">Advanced</text>
<text x="85" y="115" text-anchor="middle" class="svg-muted" font-size="12">Status Enabled</text><text x="85" y="133" text-anchor="middle" class="svg-muted" font-size="12">Radio Policy</text><text x="85" y="151" text-anchor="middle" class="svg-muted" font-size="12">Interface</text><text x="85" y="169" text-anchor="middle" class="svg-muted" font-size="12">Broadcast SSID</text>
<text x="241" y="115" text-anchor="middle" class="svg-muted" font-size="12">Layer 2: WPA2/WPA3</text><text x="241" y="133" text-anchor="middle" class="svg-muted" font-size="12">AKM PSK/802.1X/SAE</text><text x="241" y="151" text-anchor="middle" class="svg-muted" font-size="12">Layer 3: web auth</text><text x="241" y="169" text-anchor="middle" class="svg-muted" font-size="12">AAA Servers</text>
<text x="397" y="115" text-anchor="middle" class="svg-muted" font-size="12">Platinum voice</text><text x="397" y="133" text-anchor="middle" class="svg-muted" font-size="12">Gold video</text><text x="397" y="151" text-anchor="middle" class="svg-muted" font-size="12">Silver best effort</text><text x="397" y="169" text-anchor="middle" class="svg-muted" font-size="12">Bronze background</text>
<text x="554" y="115" text-anchor="middle" class="svg-muted" font-size="12">AAA override</text><text x="554" y="133" text-anchor="middle" class="svg-muted" font-size="12">Session timeout</text><text x="554" y="151" text-anchor="middle" class="svg-muted" font-size="12">Max clients, P2P</text><text x="554" y="169" text-anchor="middle" class="svg-muted" font-size="12">FlexConnect local sw.</text>
<rect x="250" y="200" width="140" height="34" rx="6" fill="#fed7aa"/><text x="320" y="222" text-anchor="middle" class="svg-ink" font-size="13">Apply</text>
</svg><p class="cap">What each tab of the WLAN edit page holds. Nothing changes on the APs until you click Apply.</p></div>

<h3>Step 2: the General tab</h3>
<ul>
<li><b>Status</b>: tick <i>Enabled</i>. A disabled WLAN is not advertised by any AP.</li>
<li><b>Security Policies</b>: a read-only summary such as <code>[WPA2][Auth(PSK)]</code> that updates when you change the Security tab.</li>
<li><b>Radio Policy</b>: All, 802.11a only (5 GHz), 802.11g/b only (2.4 GHz) and so on.</li>
<li><b>Interface/Interface Group(G)</b>: the <b>dynamic interface</b> this WLAN's clients use. This is how a WLAN is mapped to a VLAN.</li>
<li><b>Broadcast SSID</b>: whether the SSID appears in beacons.</li>
</ul>

<h3>Step 3: the Security tab</h3>
<p>Sub-tabs <b>Layer 2</b> (WPA2/WPA3 policy, encryption AES, Authentication Key Management: 802.1X, PSK, SAE, FT; PSK format ASCII or hex; PMF), <b>Layer 3</b> (web authentication and passthrough for guests), <b>AAA Servers</b> (which RADIUS servers this WLAN uses). The next chapter covers each security type in depth. For a WPA2-Personal staff WLAN: untick 802.1X, tick PSK, choose ASCII, type the passphrase.</p>

<h3>Step 4: the QoS tab</h3>
<table class="cmp"><tr><th>Profile</th><th>Intended traffic</th></tr>
<tr><td>Platinum</td><td>Voice</td></tr><tr><td>Gold</td><td>Video</td></tr>
<tr><td>Silver</td><td>Best effort (the default)</td></tr><tr><td>Bronze</td><td>Background, for example a guest WLAN you want to deprioritise</td></tr></table>
<p>The same tab has the <b>WMM</b> policy (Disabled, Allowed, Required); WMM is 802.11e QoS and is required for 802.11n/ac/ax speeds.</p>

<h3>Step 5: the Advanced tab</h3>
<p>Useful settings: <b>Allow AAA Override</b> (let RADIUS assign a VLAN or ACL per user), <b>Enable Session Timeout</b> (default 1800 s; after it the client reauthenticates), <b>Maximum Allowed Clients</b>, <b>P2P Blocking</b> (stop clients talking to each other, great for guests), <b>Client Exclusion</b> (temporarily block a client after repeated failures), <b>DHCP Addr. Assignment Required</b>, and <b>FlexConnect Local Switching</b>.</p>

<h3>The same WLAN in the CLI (lab tasks 3 and 4)</h3>
<pre class="code">(WLC1) &gt;config wlan create 1 STAFF NK-STAFF
<span class="c">! id 1, profile STAFF, SSID NK-STAFF: created disabled, WPA2 + 802.1X</span>
(WLC1) &gt;config wlan interface 1 staff
(WLC1) &gt;config wlan security wpa akm 802.1x disable 1
(WLC1) &gt;config wlan security wpa akm psk enable 1
(WLC1) &gt;config wlan security wpa akm psk set-key ascii NkStaff2024 1
(WLC1) &gt;config wlan enable 1
<span class="c">! broadcast is on by default; to change: config wlan broadcast-ssid enable|disable 1</span>
(WLC1) &gt;save config</pre>
<p>Notice the AireOS habit: the WLAN ID comes <b>last</b> in most <code>config wlan</code> commands. Many settings (security, interface) can only be changed while the WLAN is disabled on a real controller; the GUI warns you.</p>

<pre class="out">(WLC1) &gt;show wlan summary

Number of WLANs.................................. 1

WLAN ID  WLAN Profile Name / SSID          Status    Interface Name    Security
-------  --------------------------------  --------  ----------------  --------------------
<span class="hl">1        STAFF / NK-STAFF                  Enabled   staff             WPA2-Personal (PSK)</span>

(WLC1) &gt;show wlan 1

WLAN Identifier.................................. 1
Profile Name..................................... STAFF
Network Name (SSID).............................. NK-STAFF
<span class="hl">Status........................................... Enabled</span>
Broadcast SSID................................... Enabled
Number of Active Clients......................... 1
<span class="hl">Interface........................................ staff</span>
Radio Policy..................................... All
...
Security Summary................................. [WPA2][Auth(PSK)]</pre>

<h3>Proving it end to end (lab task 5)</h3>
<pre class="out">LAPTOP1&gt; wifi connect NK-STAFF psk NkStaff2024
...
<span class="hl">DDORA IP 10.10.20.21/24 GW 10.10.20.1</span>
LAPTOP1&gt; ping 10.10.50.10
84 bytes from 10.10.50.10 icmp_seq=1 ttl=63 time=2.114 ms</pre>
<p>On the WLC, <code>show client summary</code> lists LAPTOP1's MAC, the AP it joined, WLAN 1 and its 10.10.20.x address.</p>

<div class="eg"><p><b>Worked example.</b> Why did LAPTOP1 land in 10.10.20.0/24? WLAN 1 → interface <code>staff</code> → VLAN 20 → SW1 trunk → R1 Gi0/0.20 (10.10.20.1) → DHCP pool STAFF. Change only the first arrow (<code>config wlan interface 1 corp</code>) and the same laptop, same SSID, same key, would receive a 10.10.40.x address. The WLAN-to-interface mapping, not the AP port, decides the client VLAN.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Creating the WLAN and forgetting to tick <b>Enabled</b> (nobody sees the SSID). Leaving 802.1X ticked alongside PSK on a staff WLAN with no RADIUS server. Leaving the WLAN on the <b>management</b> interface (the default in the GUI), which drops wireless clients into the controller's own management VLAN.</p></div>

<div class="exam"><p><b>Exam trap.</b> The <b>Interface</b> (VLAN) is on the <b>General</b> tab. PSK, 802.1X and SAE are under <b>Security &gt; Layer 2</b>. RADIUS server selection is under <b>Security &gt; AAA Servers</b>. Platinum/Gold/Silver/Bronze are on the <b>QoS</b> tab. Session timeout, AAA override and P2P blocking are on <b>Advanced</b>. A new WLAN defaults to WPA2 + 802.1X and disabled.</p></div>

<div class="scn"><h4>The SSID nobody could find</h4><p>An engineer created WLAN 2 "NK-EVENTS" for a conference, set a PSK, mapped it to the right interface and went home. The next morning attendees could not see it. <code>show wlan summary</code> showed Status <i>Disabled</i>: the WLAN had been created but never enabled. After <code>config wlan enable 2</code>, the APs began beaconing NK-EVENTS within seconds.</p><p><b>Lesson:</b> a WLAN goes on air only when it is enabled and Apply has been clicked. Always verify with show wlan summary.</p></div>

<div class="iv"><p class="q">"Walk me through creating a WPA2-PSK WLAN on a WLC and putting its clients in VLAN 20."</p><p>Strong answer: first create a dynamic interface in VLAN 20 with an IP, gateway and DHCP server, and make sure VLAN 20 is on the switch and the WLC trunk. Then WLANs, Create New: type, profile name, SSID, ID. General tab: status enabled, interface = the VLAN 20 dynamic interface, broadcast SSID. Security, Layer 2: WPA2 with AES, AKM PSK (untick 802.1X), enter the passphrase. Optional QoS and Advanced settings. Apply, then verify with show wlan summary and a test client.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WLAN ID, profile name and SSID are three different things; only the SSID is seen by users.</li>
<li>General tab: status, radio policy, interface (VLAN mapping), broadcast SSID.</li>
<li>Security tab: Layer 2 (WPA2/WPA3, PSK/802.1X/SAE), Layer 3 (web auth), AAA Servers.</li>
<li>QoS tab: Platinum voice, Gold video, Silver best effort (default), Bronze background.</li>
<li>The WLAN-to-dynamic-interface mapping decides the client's VLAN; a new WLAN is disabled with WPA2 + 802.1X by default.</li>
</ul></div>
`,hi:`
<p>Bank ki nayi branch kholne ke liye kai pages wala form chahiye: branch ka naam aur address (general details), chaabiyan aur alarm code kiske paas hai (security), kaunse customers ko priority service milti hai (quality of service), aur opening hours aur limits (advanced rules). Controller par WLAN banana bilkul wahi form hai. AireOS GUI ise chaar tabs mein baantta hai: <b>General, Security, QoS aur Advanced</b>. CCNA exam ko in tabs ke screenshots bahut pasand hain, isliye seekho ki kya kahan rehta hai.</p>

<h3>Teen naam jo mix nahi karne</h3>
<dl class="terms">
<dt>WLAN ID</dt><dd>Ek number (AireOS par 1 se 512) jo controller ke andar WLAN ko identify karta hai. Default AP group ke APs sirf WLAN IDs 1 se 16 advertise karte hain, isliye normal WLANs isi range mein rakho.</dd>
<dt>Profile name</dt><dd>Ek administrative label, controller par unique, jo clients kabhi nahi dekhte. Example: <code>STAFF</code>.</dd>
<dt>SSID</dt><dd>Beacons mein broadcast hone wala network naam jo users apne device par chunte hain. Example: <code>NK-STAFF</code>. Do WLANs ka SSID bhi same ho sakta hai agar unki security alag ho; profile names phir bhi unique hone chahiye.</dd>
</dl>

<h3>Step 1: WLANs &gt; Create New</h3>
<p>Top menu mein <b>WLANs</b> chuno, <b>Create New</b> select karo aur <b>Go</b> click karo. Type <i>WLAN</i>, Profile Name <i>STAFF</i>, SSID <i>NK-STAFF</i>, ID <i>1</i> daalo, aur <b>Apply</b> click karo. Ab WLAN exist karta hai lekin <b>disabled</b> hai, aur uski default security <b>WPA2 with 802.1X</b> hai. Edit page chaar tabs ke saath khulta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="WLAN edit page ke chaar tabs">
<rect x="10" y="10" width="620" height="36" rx="6" fill="#e2e8f0"/><text x="30" y="33" class="svg-ink" font-size="13">WLANs &gt; Edit 'STAFF'</text>
<rect x="10" y="56" width="150" height="34" rx="6" fill="#bae6fd"/><text x="85" y="78" text-anchor="middle" class="svg-ink" font-size="13">General</text>
<rect x="166" y="56" width="150" height="34" rx="6" fill="#bbf7d0"/><text x="241" y="78" text-anchor="middle" class="svg-ink" font-size="13">Security</text>
<rect x="322" y="56" width="150" height="34" rx="6" fill="#fde68a"/><text x="397" y="78" text-anchor="middle" class="svg-ink" font-size="13">QoS</text>
<rect x="478" y="56" width="152" height="34" rx="6" fill="#ddd6fe"/><text x="554" y="78" text-anchor="middle" class="svg-ink" font-size="13">Advanced</text>
<text x="85" y="115" text-anchor="middle" class="svg-muted" font-size="12">Status Enabled</text><text x="85" y="133" text-anchor="middle" class="svg-muted" font-size="12">Radio Policy</text><text x="85" y="151" text-anchor="middle" class="svg-muted" font-size="12">Interface</text><text x="85" y="169" text-anchor="middle" class="svg-muted" font-size="12">Broadcast SSID</text>
<text x="241" y="115" text-anchor="middle" class="svg-muted" font-size="12">Layer 2: WPA2/WPA3</text><text x="241" y="133" text-anchor="middle" class="svg-muted" font-size="12">AKM PSK/802.1X/SAE</text><text x="241" y="151" text-anchor="middle" class="svg-muted" font-size="12">Layer 3: web auth</text><text x="241" y="169" text-anchor="middle" class="svg-muted" font-size="12">AAA Servers</text>
<text x="397" y="115" text-anchor="middle" class="svg-muted" font-size="12">Platinum voice</text><text x="397" y="133" text-anchor="middle" class="svg-muted" font-size="12">Gold video</text><text x="397" y="151" text-anchor="middle" class="svg-muted" font-size="12">Silver best effort</text><text x="397" y="169" text-anchor="middle" class="svg-muted" font-size="12">Bronze background</text>
<text x="554" y="115" text-anchor="middle" class="svg-muted" font-size="12">AAA override</text><text x="554" y="133" text-anchor="middle" class="svg-muted" font-size="12">Session timeout</text><text x="554" y="151" text-anchor="middle" class="svg-muted" font-size="12">Max clients, P2P</text><text x="554" y="169" text-anchor="middle" class="svg-muted" font-size="12">FlexConnect local sw.</text>
<rect x="250" y="200" width="140" height="34" rx="6" fill="#fed7aa"/><text x="320" y="222" text-anchor="middle" class="svg-ink" font-size="13">Apply</text>
</svg><p class="cap">WLAN edit page ka har tab kya rakhta hai. Jab tak Apply click na karo, APs par kuch nahi badalta.</p></div>

<h3>Step 2: General tab</h3>
<ul>
<li><b>Status</b>: <i>Enabled</i> tick karo. Disabled WLAN koi AP advertise nahi karta.</li>
<li><b>Security Policies</b>: read-only summary jaise <code>[WPA2][Auth(PSK)]</code> jo Security tab badalne par update hoti hai.</li>
<li><b>Radio Policy</b>: All, 802.11a only (5 GHz), 802.11g/b only (2.4 GHz) waghera.</li>
<li><b>Interface/Interface Group(G)</b>: woh <b>dynamic interface</b> jo is WLAN ke clients use karte hain. Isi tarah WLAN VLAN se map hota hai.</li>
<li><b>Broadcast SSID</b>: SSID beacons mein dikhe ya nahi.</li>
</ul>

<h3>Step 3: Security tab</h3>
<p>Sub-tabs <b>Layer 2</b> (WPA2/WPA3 policy, encryption AES, Authentication Key Management: 802.1X, PSK, SAE, FT; PSK format ASCII ya hex; PMF), <b>Layer 3</b> (guests ke liye web authentication aur passthrough), <b>AAA Servers</b> (yeh WLAN kaunse RADIUS servers use karta hai). Agla chapter har security type ko gehraai se cover karta hai. WPA2-Personal staff WLAN ke liye: 802.1X untick karo, PSK tick karo, ASCII chuno, passphrase type karo.</p>

<h3>Step 4: QoS tab</h3>
<table class="cmp"><tr><th>Profile</th><th>Kis traffic ke liye</th></tr>
<tr><td>Platinum</td><td>Voice</td></tr><tr><td>Gold</td><td>Video</td></tr>
<tr><td>Silver</td><td>Best effort (default)</td></tr><tr><td>Bronze</td><td>Background, jaise guest WLAN jise aap kam priority dena chahte ho</td></tr></table>
<p>Isi tab mein <b>WMM</b> policy bhi hai (Disabled, Allowed, Required); WMM 802.11e QoS hai aur 802.11n/ac/ax speeds ke liye zaroori hai.</p>

<h3>Step 5: Advanced tab</h3>
<p>Useful settings: <b>Allow AAA Override</b> (RADIUS ko har user ke liye VLAN ya ACL assign karne do), <b>Enable Session Timeout</b> (default 1800 s; uske baad client reauthenticate karta hai), <b>Maximum Allowed Clients</b>, <b>P2P Blocking</b> (clients ko aapas mein baat karne se roko, guests ke liye badhiya), <b>Client Exclusion</b> (baar baar fail hone par client ko kuch der block karo), <b>DHCP Addr. Assignment Required</b>, aur <b>FlexConnect Local Switching</b>.</p>

<h3>Wahi WLAN CLI mein (lab tasks 3 aur 4)</h3>
<pre class="code">(WLC1) &gt;config wlan create 1 STAFF NK-STAFF
<span class="c">! id 1, profile STAFF, SSID NK-STAFF: disabled banta hai, WPA2 + 802.1X</span>
(WLC1) &gt;config wlan interface 1 staff
(WLC1) &gt;config wlan security wpa akm 802.1x disable 1
(WLC1) &gt;config wlan security wpa akm psk enable 1
(WLC1) &gt;config wlan security wpa akm psk set-key ascii NkStaff2024 1
(WLC1) &gt;config wlan enable 1
<span class="c">! broadcast default se on hai; badalne ke liye: config wlan broadcast-ssid enable|disable 1</span>
(WLC1) &gt;save config</pre>
<p>AireOS ki aadat dekho: zyada tar <code>config wlan</code> commands mein WLAN ID <b>aakhir mein</b> aata hai. Real controller par kai settings (security, interface) sirf tab badli ja sakti hain jab WLAN disabled ho; GUI aapko warn karta hai.</p>

<pre class="out">(WLC1) &gt;show wlan summary

Number of WLANs.................................. 1

WLAN ID  WLAN Profile Name / SSID          Status    Interface Name    Security
-------  --------------------------------  --------  ----------------  --------------------
<span class="hl">1        STAFF / NK-STAFF                  Enabled   staff             WPA2-Personal (PSK)</span>

(WLC1) &gt;show wlan 1

WLAN Identifier.................................. 1
Profile Name..................................... STAFF
Network Name (SSID).............................. NK-STAFF
<span class="hl">Status........................................... Enabled</span>
Broadcast SSID................................... Enabled
Number of Active Clients......................... 1
<span class="hl">Interface........................................ staff</span>
Radio Policy..................................... All
...
Security Summary................................. [WPA2][Auth(PSK)]</pre>

<h3>End to end saabit karna (lab task 5)</h3>
<pre class="out">LAPTOP1&gt; wifi connect NK-STAFF psk NkStaff2024
...
<span class="hl">DDORA IP 10.10.20.21/24 GW 10.10.20.1</span>
LAPTOP1&gt; ping 10.10.50.10
84 bytes from 10.10.50.10 icmp_seq=1 ttl=63 time=2.114 ms</pre>
<p>WLC par <code>show client summary</code> LAPTOP1 ka MAC, jis AP ko join kiya, WLAN 1 aur uska 10.10.20.x address list karta hai.</p>

<div class="eg"><p><b>Worked example.</b> LAPTOP1 10.10.20.0/24 mein kyun aaya? WLAN 1 → interface <code>staff</code> → VLAN 20 → SW1 trunk → R1 Gi0/0.20 (10.10.20.1) → DHCP pool STAFF. Sirf pehla arrow badlo (<code>config wlan interface 1 corp</code>) aur wahi laptop, wahi SSID, wahi key ke saath 10.10.40.x address paayega. Client VLAN WLAN-to-interface mapping tay karti hai, AP port nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> WLAN banana aur <b>Enabled</b> tick karna bhool jaana (kisi ko SSID nahi dikhta). Bina RADIUS server wale staff WLAN par PSK ke saath 802.1X bhi ticked chhod dena. WLAN ko <b>management</b> interface par chhod dena (GUI mein default), jo wireless clients ko controller ke apne management VLAN mein daal deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>Interface</b> (VLAN) <b>General</b> tab par hai. PSK, 802.1X aur SAE <b>Security &gt; Layer 2</b> mein hain. RADIUS server selection <b>Security &gt; AAA Servers</b> mein hai. Platinum/Gold/Silver/Bronze <b>QoS</b> tab par hain. Session timeout, AAA override aur P2P blocking <b>Advanced</b> par hain. Naya WLAN default se WPA2 + 802.1X aur disabled hota hai.</p></div>

<div class="scn"><h4>Woh SSID jo kisi ko nahi mila</h4><p>Ek engineer ne conference ke liye WLAN 2 "NK-EVENTS" banaya, PSK set kiya, sahi interface se map kiya aur ghar chala gaya. Agli subah attendees ko woh dikha hi nahi. <code>show wlan summary</code> ne Status <i>Disabled</i> dikhaya: WLAN bana tha lekin kabhi enable nahi hua. <code>config wlan enable 2</code> ke baad APs ne kuch seconds mein NK-EVENTS beacon karna shuru kar diya.</p><p><b>Seekh:</b> WLAN tabhi hawa mein jaata hai jab woh enabled ho aur Apply click hua ho. Hamesha show wlan summary se verify karo.</p></div>

<div class="iv"><p class="q">"WLC par WPA2-PSK WLAN banane aur uske clients ko VLAN 20 mein daalne ka process batao."</p><p>Strong answer: pehle VLAN 20 mein IP, gateway aur DHCP server ke saath dynamic interface banao, aur pakka karo ki VLAN 20 switch aur WLC trunk par hai. Phir WLANs, Create New: type, profile name, SSID, ID. General tab: status enabled, interface = VLAN 20 wala dynamic interface, broadcast SSID. Security, Layer 2: AES ke saath WPA2, AKM PSK (802.1X untick), passphrase daalo. Optional QoS aur Advanced settings. Apply, phir show wlan summary aur test client se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WLAN ID, profile name aur SSID teen alag cheezein hain; users sirf SSID dekhte hain.</li>
<li>General tab: status, radio policy, interface (VLAN mapping), broadcast SSID.</li>
<li>Security tab: Layer 2 (WPA2/WPA3, PSK/802.1X/SAE), Layer 3 (web auth), AAA Servers.</li>
<li>QoS tab: Platinum voice, Gold video, Silver best effort (default), Bronze background.</li>
<li>WLAN-to-dynamic-interface mapping client ka VLAN tay karti hai; naya WLAN default se disabled aur WPA2 + 802.1X hota hai.</li>
</ul></div>
`}};export{e as default};