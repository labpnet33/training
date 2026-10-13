var e={id:`wlan-and-policy-profile`,h:{en:`WLAN profile and policy profile in detail`,hi:`WLAN profile aur policy profile detail mein`},body:{en:`
<p>Chapter 5 gave you the map. Now we open the two most-used profiles and learn their fields, their rules and the order in which you must build them. These are the objects you will create in lab wl-first-wlan.</p>

<h3>Analogy: a ticket and a seat</h3>
<p>A cinema ticket has the film name and the entry rule (the WLAN profile: what is the show, how do I get in). The seat allocation decides which hall and row you sit in (the policy profile: where do I land). The usher with a seating chart (the policy tag) connects each ticket type to a seat zone.</p>

<h3>The WLAN profile</h3>
<p>Create it with one command that sets three things: profile name, WLAN id and SSID.</p>
<pre class="code">WLC1(config)# wlan NK-STAFF 1 NK-STAFF
WLC1(config-wlan)# no security wpa akm dot1x
WLC1(config-wlan)# security wpa akm psk
WLC1(config-wlan)# security wpa psk set-key ascii 0 NkStaff2024
WLC1(config-wlan)# no shutdown
WLC1(config-wlan)# exit</pre>
<dl class="terms">
<dt>Profile name</dt><dd>The internal name used in tags (NK-STAFF). Staff see only the SSID.</dd>
<dt>WLAN id</dt><dd>A unique number. The policy tag and many show commands refer to it.</dd>
<dt>SSID</dt><dd>The network name broadcast over the air. The profile name and SSID may differ; keeping them equal avoids confusion.</dd>
<dt>Security (AKM)</dt><dd>Authentication and key management. <code>psk</code> means a shared passphrase, <code>dot1x</code> means 802.1X with RADIUS, <code>sae</code> is WPA3-Personal. <code>ascii 0 NkStaff2024</code> says the key is typed in plain ASCII, with the 0 meaning "unencrypted entry".</dd>
<dt>Status</dt><dd>A new WLAN starts <b>shut down</b>. You enable it with <code>no shutdown</code>.</dd>
</dl>
<p>Why the <code>no security wpa akm dot1x</code> line? A freshly created WLAN in the model starts with 802.1X key management selected (as many real defaults do); you remove it and select PSK. A WPA2-PSK WLAN with AES ciphers is the normal basic choice. The enterprise variant comes in the security module.</p>
<div class="note"><p><b>Rule enforced by the platform.</b> To change the security of a WLAN you must <b>shut it down</b> first. This protects live clients from a half-edited configuration. You will practise this deliberately in the security module.</p></div>

<h3>The policy profile</h3>
<pre class="code">WLC1(config)# wireless profile policy PP-STAFF
WLC1(config-wireless-policy)# vlan 20
WLC1(config-wireless-policy)# no shutdown
WLC1(config-wireless-policy)# exit</pre>
<dl class="terms">
<dt>vlan</dt><dd>The VLAN where clients of this policy land. You can give a VLAN number or a VLAN name; in the lab it is a number, 20.</dd>
<dt>central switching</dt><dd>Client traffic is carried in the CAPWAP data tunnel to the controller, which puts it in the VLAN. This is the default and the lab behaviour. The alternative, local switching at the AP, is FlexConnect and is not simulated in the lab.</dd>
<dt>central authentication</dt><dd>Authentication happens at the controller. Local alternatives belong to FlexConnect.</dd>
<dt>description</dt><dd>Free text that helps the next engineer.</dd>
<dt>Status</dt><dd>A new policy profile starts <b>shut down</b>; you must <code>no shutdown</code> it. A policy profile must be shut down before its VLAN is changed.</dd>
</dl>
<p>The <b>policy VLAN must exist in the controller's VLAN database</b>, and it must also be carried by the switch trunk and routed by R1 for the client to get an address. The controller VLAN database is the list you build with <code>vlan N</code>. In the foundation lab VLAN 20 STAFF is present from the start of wl-first-wlan; a missing VLAN is a classic fault covered in the roaming module.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Order of build">
<rect x="10" y="20" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="12">1 WLAN profile</text><text x="80" y="63" text-anchor="middle" class="svg-muted" font-size="11">no shutdown</text>
<rect x="170" y="20" width="140" height="60" rx="8" fill="#fed7aa"/><text x="240" y="45" text-anchor="middle" class="svg-ink" font-size="12">2 Policy profile</text><text x="240" y="63" text-anchor="middle" class="svg-muted" font-size="11">vlan 20, no shutdown</text>
<rect x="330" y="20" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="400" y="45" text-anchor="middle" class="svg-ink" font-size="12">3 Policy tag</text><text x="400" y="63" text-anchor="middle" class="svg-muted" font-size="11">WLAN to policy map</text>
<rect x="490" y="20" width="140" height="60" rx="8" fill="#fde68a"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="12">4 Tag the APs</text><text x="560" y="63" text-anchor="middle" class="svg-muted" font-size="11">ap name ... policy-tag</text>
<line x1="150" y1="50" x2="170" y2="50" stroke="#64748b"/><line x1="310" y1="50" x2="330" y2="50" stroke="#64748b"/><line x1="470" y1="50" x2="490" y2="50" stroke="#64748b"/>
<text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">Condition for an SSID to be on the air</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">WLAN enabled AND policy profile enabled AND mapped in the AP's policy tag</text>
<text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">AND policy VLAN exists AND AP radio on (country allowed)</text>
</svg><p class="cap">Four build steps, and five conditions that must all be true for broadcasting.</p></div>

<h3>Verify the objects</h3>
<pre class="out">WLC1# show wlan summary

Number of WLANs: 1

ID   Profile Name                     SSID                             Status Security
------------------------------------------------------------
1    NK-STAFF                         NK-STAFF                         <span class="hl">UP</span>     [WPA2][PSK][AES]

WLC1# show wireless profile policy detailed PP-STAFF

Policy Profile Name              : PP-STAFF
Description                      :
Status                           : <span class="hl">ENABLED</span>
VLAN                             : <span class="hl">20</span>
Central Switching                : ENABLED
Central Authentication           : ENABLED
Central DHCP                     : DISABLED</pre>
<p>Notice that "Status" appears in both. Most "SSID missing" tickets are found by reading these two lines first.</p>

<div class="eg"><p><b>Worked example.</b> You want a voice SSID NK-VOICE in VLAN 30 with PSK NkVoice2024. You need: WLAN NK-VOICE id 4, PSK; policy PP-VOICE with <code>vlan 30</code>; both enabled; a map in the policy tag; and the VLAN present in the controller database. Skipping any one of those yields a handset that sees nothing. That exact chain is a ticket in the operations module.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Leaving the WLAN or the policy profile shut down because "creating it" felt like enough. (2) Editing security on a live WLAN without shutting it down first. (3) Using a policy VLAN that is not in the VLAN database. (4) Typing the passphrase wrong; PSK passphrases must be 8 to 63 ASCII characters. (5) Duplicate WLAN ids.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Status" lives in two places: the WLAN and the policy profile, and each must be enabled. Also remember that new objects are shut down by default.</p></div>

<div class="scn"><h4>Created, not enabled</h4><p>A junior engineer built WLAN, policy and tag for a new guest SSID and reported "done". Guests found nothing. <code>show wlan summary</code> printed Status DOWN, and the policy profile was DISABLED. Two <code>no shutdown</code> commands put the SSID on the air.</p><p><b>Lesson:</b> built is not the same as enabled. Always read the Status column.</p></div>

<div class="iv"><p class="q">"Where do VLAN assignment and security get configured on a 9800?"</p><p>Strong answer: security in the WLAN profile (AKM, passphrase, authentication list); VLAN in the policy profile; the policy tag joins them; objects are shut down by default and the WLAN must be shut down before security changes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>wlan NAME ID SSID creates the WLAN profile; security lives inside it.</li>
<li>wireless profile policy NAME holds the VLAN and switching mode.</li>
<li>New WLANs and policy profiles start shut down; enable both.</li>
<li>Edit WLAN security only while it is shut down.</li>
<li>The policy VLAN must exist in the controller VLAN database.</li>
</ul></div>
`,hi:`
<p>Chapter 5 ne aapko map diya. Ab hum do sabse zyada use hone wale profiles kholte hain aur unki fields, rules aur build karne ka order seekhte hain. Yeh wahi objects hain jo aap lab wl-first-wlan mein banaoge.</p>

<h3>Analogy: ticket aur seat</h3>
<p>Cinema ke ticket par film ka naam aur entry rule hota hai (WLAN profile: show kya hai, andar kaise aaun). Seat allocation decide karta hai ki aap kaunse hall aur row mein baithoge (policy profile: main kahan land karun). Seating chart wala usher (policy tag) har ticket type ko seat zone se jodta hai.</p>

<h3>WLAN profile</h3>
<p>Ise ek command se banate hain jo teen cheezein set karta hai: profile name, WLAN id aur SSID.</p>
<pre class="code">WLC1(config)# wlan NK-STAFF 1 NK-STAFF
WLC1(config-wlan)# no security wpa akm dot1x
WLC1(config-wlan)# security wpa akm psk
WLC1(config-wlan)# security wpa psk set-key ascii 0 NkStaff2024
WLC1(config-wlan)# no shutdown
WLC1(config-wlan)# exit</pre>
<dl class="terms">
<dt>Profile name</dt><dd>Tags mein use hone wala internal naam (NK-STAFF). Staff sirf SSID dekhte hain.</dd>
<dt>WLAN id</dt><dd>Unique number. Policy tag aur kai show commands ise refer karte hain.</dd>
<dt>SSID</dt><dd>Hawa mein broadcast hone wala network name. Profile name aur SSID alag ho sakte hain; barabar rakhne se confusion kam hota hai.</dd>
<dt>Security (AKM)</dt><dd>Authentication aur key management. <code>psk</code> matlab shared passphrase, <code>dot1x</code> matlab RADIUS ke saath 802.1X, <code>sae</code> WPA3-Personal hai. <code>ascii 0 NkStaff2024</code> kehta hai key plain ASCII mein type hui hai, jahan 0 ka matlab "unencrypted entry".</dd>
<dt>Status</dt><dd>Naya WLAN <b>shut down</b> shuru hota hai. Ise <code>no shutdown</code> se enable karte hain.</dd>
</dl>
<p><code>no security wpa akm dot1x</code> line kyun? Model mein fresh WLAN 802.1X key management selected ke saath shuru hota hai (jaise kai real defaults hote hain); aap use hata ke PSK select karte ho. AES ciphers wala WPA2-PSK WLAN normal basic choice hai. Enterprise variant security module mein aayega.</p>
<div class="note"><p><b>Platform ka enforced rule.</b> WLAN ki security badalne ke liye pehle use <b>shut down</b> karna padta hai. Yeh live clients ko aadhi-edit hui configuration se bachata hai. Security module mein aap yeh jaan-boojh ke practise karoge.</p></div>

<h3>Policy profile</h3>
<pre class="code">WLC1(config)# wireless profile policy PP-STAFF
WLC1(config-wireless-policy)# vlan 20
WLC1(config-wireless-policy)# no shutdown
WLC1(config-wireless-policy)# exit</pre>
<dl class="terms">
<dt>vlan</dt><dd>Woh VLAN jahan is policy ke clients land karte hain. VLAN number ya VLAN name de sakte ho; lab mein number hai, 20.</dd>
<dt>central switching</dt><dd>Client traffic CAPWAP data tunnel mein controller tak jaata hai, jo use VLAN mein daalta hai. Yeh default hai aur lab ka behaviour hai. Alternative, AP par local switching, FlexConnect hai aur lab mein simulated nahi.</dd>
<dt>central authentication</dt><dd>Authentication controller par hota hai. Local alternatives FlexConnect ke hain.</dd>
<dt>description</dt><dd>Free text jo agle engineer ki madad karta hai.</dd>
<dt>Status</dt><dd>Naya policy profile <b>shut down</b> shuru hota hai; <code>no shutdown</code> karna padta hai. VLAN badalne se pehle policy profile shut down hona chahiye.</dd>
</dl>
<p><b>Policy VLAN controller ke VLAN database mein exist karna chahiye</b>, aur use switch trunk par carry hona aur R1 par route hona bhi chahiye taaki client ko address mile. Controller VLAN database woh list hai jo aap <code>vlan N</code> se banate ho. Foundation lab mein VLAN 20 STAFF wl-first-wlan ke shuru se present hai; VLAN missing hona classic fault hai jo roaming module mein cover hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Build ka order">
<rect x="10" y="20" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="12">1 WLAN profile</text><text x="80" y="63" text-anchor="middle" class="svg-muted" font-size="11">no shutdown</text>
<rect x="170" y="20" width="140" height="60" rx="8" fill="#fed7aa"/><text x="240" y="45" text-anchor="middle" class="svg-ink" font-size="12">2 Policy profile</text><text x="240" y="63" text-anchor="middle" class="svg-muted" font-size="11">vlan 20, no shutdown</text>
<rect x="330" y="20" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="400" y="45" text-anchor="middle" class="svg-ink" font-size="12">3 Policy tag</text><text x="400" y="63" text-anchor="middle" class="svg-muted" font-size="11">WLAN to policy map</text>
<rect x="490" y="20" width="140" height="60" rx="8" fill="#fde68a"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="12">4 APs ko tag karo</text><text x="560" y="63" text-anchor="middle" class="svg-muted" font-size="11">ap name ... policy-tag</text>
<line x1="150" y1="50" x2="170" y2="50" stroke="#64748b"/><line x1="310" y1="50" x2="330" y2="50" stroke="#64748b"/><line x1="470" y1="50" x2="490" y2="50" stroke="#64748b"/>
<text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">SSID on-air hone ki shart</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">WLAN enabled AUR policy profile enabled AUR AP ke policy tag mein mapped</text>
<text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">AUR policy VLAN exist kare AUR AP radio on (country allowed)</text>
</svg><p class="cap">Chaar build steps, aur paanch conditions jo broadcast ke liye sab sach honi chahiye.</p></div>

<h3>Objects verify karo</h3>
<pre class="out">WLC1# show wlan summary

Number of WLANs: 1

ID   Profile Name                     SSID                             Status Security
------------------------------------------------------------
1    NK-STAFF                         NK-STAFF                         <span class="hl">UP</span>     [WPA2][PSK][AES]

WLC1# show wireless profile policy detailed PP-STAFF

Policy Profile Name              : PP-STAFF
Description                      :
Status                           : <span class="hl">ENABLED</span>
VLAN                             : <span class="hl">20</span>
Central Switching                : ENABLED
Central Authentication           : ENABLED
Central DHCP                     : DISABLED</pre>
<p>Dhyan do ki "Status" dono mein aata hai. Zyadatar "SSID missing" tickets inhi do lines ko pehle padhne se mil jaate hain.</p>

<div class="eg"><p><b>Worked example.</b> Aapko voice SSID NK-VOICE chahiye VLAN 30 mein PSK NkVoice2024 ke saath. Zaroorat: WLAN NK-VOICE id 4, PSK; policy PP-VOICE with <code>vlan 30</code>; dono enabled; policy tag mein map; aur VLAN controller database mein present. Inmein se ek bhi chhoota to handset ko kuch nahi dikhta. Yahi exact chain operations module ka ek ticket hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) WLAN ya policy profile shut chhod dena kyunki "bana diya" kaafi laga. (2) Live WLAN ki security bina shut kiye edit karna. (3) Aisa policy VLAN use karna jo VLAN database mein nahi. (4) Passphrase galat type karna; PSK passphrases 8 se 63 ASCII characters ke hone chahiye. (5) Duplicate WLAN ids.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Status" do jagah hai: WLAN aur policy profile, aur dono enabled hone chahiye. Yeh bhi yaad rakho ki naye objects default roop se shut hote hain.</p></div>

<div class="scn"><h4>Bana diya, enable nahi kiya</h4><p>Ek junior engineer ne naye guest SSID ke liye WLAN, policy aur tag banaye aur "done" report kiya. Guests ko kuch nahi mila. <code>show wlan summary</code> ne Status DOWN print kiya, aur policy profile DISABLED tha. Do <code>no shutdown</code> commands ne SSID ko on-air kar diya.</p><p><b>Seekh:</b> bana hona aur enabled hona alag hai. Hamesha Status column padho.</p></div>

<div class="iv"><p class="q">"9800 par VLAN assignment aur security kahan configure hoti hai?"</p><p>Strong answer: security WLAN profile mein (AKM, passphrase, authentication list); VLAN policy profile mein; policy tag dono ko jodta hai; objects default roop se shut hote hain aur security badalne se pehle WLAN shut hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>wlan NAME ID SSID WLAN profile banata hai; security uske andar rehti hai.</li>
<li>wireless profile policy NAME VLAN aur switching mode rakhta hai.</li>
<li>Naye WLANs aur policy profiles shut shuru hote hain; dono enable karo.</li>
<li>WLAN security sirf shut hone par edit karo.</li>
<li>Policy VLAN controller VLAN database mein exist karna chahiye.</li>
</ul></div>
`}};export{e as default};