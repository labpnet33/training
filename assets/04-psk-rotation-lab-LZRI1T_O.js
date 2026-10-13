var e={id:`psk-rotation-lab`,h:{en:`Lab walkthrough: rotating the staff passphrase (wl-psk-rotate)`,hi:`Lab walkthrough: staff passphrase rotate karna (wl-psk-rotate)`},body:{en:`
<p>Security has asked for a new staff passphrase, <b>NkStaff2025</b>. The WLAN NK-STAFF currently uses NkStaff2024 and is enabled. In this chapter you plan the rotation like a change request, run it, and prove that the new key works and the old one is rejected. This is the lab <code>wl-psk-rotate</code>.</p>

<h3>Step 0: plan the change</h3>
<p>A good rotation has five parts. Write them in the ticket before you type anything.</p>
<ol>
<li><b>Scope:</b> only WLAN NK-STAFF (id 1). NK-VOICE has its own key and is not touched.</li>
<li><b>Window:</b> all clients on NK-STAFF drop for the duration of the change.</li>
<li><b>Communication:</b> staff are told the new key before the window.</li>
<li><b>Rollback:</b> the old key NkStaff2024 is kept in the ticket vault in case you must revert.</li>
<li><b>Proof:</b> a client joins with the new key, and the old key is rejected.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Rotation flow">
<rect x="20" y="30" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="75" y="58" text-anchor="middle" class="svg-ink" font-size="12">Plan + notify</text>
<rect x="150" y="30" width="110" height="46" rx="8" fill="#fed7aa"/><text x="205" y="58" text-anchor="middle" class="svg-ink" font-size="12">shutdown</text>
<rect x="280" y="30" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="335" y="58" text-anchor="middle" class="svg-ink" font-size="12">set-key new</text>
<rect x="410" y="30" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="465" y="58" text-anchor="middle" class="svg-ink" font-size="12">no shutdown</text>
<rect x="540" y="30" width="85" height="46" rx="8" fill="#bae6fd"/><text x="582" y="58" text-anchor="middle" class="svg-ink" font-size="12">Prove</text>
<line x1="130" y1="53" x2="150" y2="53" stroke="#64748b"/><line x1="260" y1="53" x2="280" y2="53" stroke="#64748b"/><line x1="390" y1="53" x2="410" y2="53" stroke="#64748b"/><line x1="520" y1="53" x2="540" y2="53" stroke="#64748b"/>
<text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="12">Proof = new key joins VLAN 20 and reaches RAD1; old key is rejected</text>
</svg><p class="cap">The lab commands follow this flow exactly.</p></div>

<h3>Step 1: look before you change</h3>
<pre class="out">WLC1# show wlan summary
ID   Profile Name    SSID          Status   Security
------------------------------------------------------
<span class="hl">1    NK-STAFF        NK-STAFF      UP       [WPA2][PSK][AES]</span></pre>
<p>The WLAN is UP with PSK. Good: you are changing the right object.</p>

<h3>Step 2: rotate</h3>
<pre class="code">WLC1# configure terminal
WLC1(config)# wlan NK-STAFF
WLC1(config-wlan)# shutdown
<span class="c">! WLAN is disabled. Clients are dropped. Now edit security.</span>
WLC1(config-wlan)# security wpa psk set-key ascii 0 NkStaff2025
WLC1(config-wlan)# no shutdown
WLC1(config-wlan)# end
WLC1# write memory</pre>
<p>Notice you do <b>not</b> recreate the WLAN, do not touch the policy profile PP-STAFF and do not touch the policy tag. Only the key changes. That is the advantage of the 9800 object model: one object owns one concern.</p>

<h3>Step 3: prove the new key works</h3>
<p>Use LAPTOP1, which is a Wi-Fi client in the lab. The client command line takes the SSID and the key:</p>
<pre class="code">LAPTOP1&gt; wifi connect NK-STAFF psk NkStaff2025
LAPTOP1&gt; wifi status
LAPTOP1&gt; ping 10.10.60.20</pre>
<pre class="out">LAPTOP1&gt; wifi status
SSID: NK-STAFF   State: <span class="hl">Associated</span>   AP: AP1
IP: 10.10.20.x/24   <span class="hl">VLAN 20</span>   Gateway: 10.10.20.1

LAPTOP1&gt; ping 10.10.60.20
!!!!!   Success rate is 100 percent (5/5)</pre>
<p>Three facts are proven: association succeeded (the 4-way handshake accepted the key), the client received an address in the staff subnet 10.10.20.0/24 from R1 DHCP (the policy profile maps VLAN 20), and the client reaches the RADIUS server in the server network 10.10.60.0/24 through the gateway.</p>

<h3>Step 4: prove the old key fails</h3>
<pre class="code">LAPTOP2&gt; wifi connect NK-STAFF psk NkStaff2024</pre>
<pre class="out">LAPTOP2&gt; wifi connect NK-STAFF psk NkStaff2024
<span class="hl">Authentication failed: 4-way handshake timeout - the passphrase does not match.</span></pre>
<p>This negative test is the part people skip. A rotation is only complete when the old secret is dead. Without the negative test you cannot tell whether your set-key worked or the WLAN was unchanged.</p>
<div class="note"><p>The simulator prints a clear failure message. A real client prints nothing so friendly: on a real network a wrong PSK shows up as repeated association attempts and, on the controller, a client in a "PSK failure" or "4-way handshake timeout" style state. Use client debugging and the controller client detail, concept only in this lab.</p></div>

<h3>What can go wrong</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Command refused</td><td>WLAN still enabled</td><td>shutdown first</td></tr>
<tr><td>No client sees the SSID after change</td><td>Forgot no shutdown</td><td>show wlan summary shows DOWN</td></tr>
<tr><td>New key fails</td><td>Typo, or key typed on the wrong WLAN</td><td>Re-enter on NK-STAFF</td></tr>
<tr><td>Old key still works</td><td>Change not applied</td><td>Repeat; read the output</td></tr></table>
<div class="warn"><p><b>Common mistake.</b> Rotating the key while leaving the WLAN shut down at the end of the session. SSID disappears for everybody and the helpdesk phone rings. Always finish with <code>show wlan summary</code> and look for UP.</p></div>
<div class="exam"><p><b>Exam trap.</b> After <code>shutdown</code> the WLAN configuration is kept; only the broadcast stops. Shut does not delete the WLAN or its policy mapping.</p></div>

<div class="scn"><h4>The Friday-night rotation</h4><p>A network engineer rotated NK-STAFF on Friday evening and tested only with his own laptop, which he had just re-entered the new key on. On Monday, 40 people could not connect because their phones auto-joined with the old key and then failed silently. A short notice with the new key and a banner on the intranet would have avoided the calls.</p><p><b>Lesson:</b> the technical change is five lines; the real work is communication and proof.</p></div>
<div class="iv"><p class="q">"Walk me through rotating a PSK on a production WLAN."</p><p>Plan scope, window, communication and rollback. On the controller shut the WLAN, set the new key, enable it, save. Prove with a client on the new key and a failed attempt with the old one, and confirm the VLAN and reachability. Mention that every client is dropped, so choose a quiet window.</p></div>
<div class="tip"><p><b>Doing it in the web UI.</b> <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs</b>: turn the NK-STAFF <b>Status</b> off, open <b>Edit &gt; Security</b>, enter the new key and save, then turn <b>Status</b> on. Prove it in <b>Monitoring &gt; Wireless &gt; Clients</b>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rotation: shutdown, set-key, no shutdown, write memory.</li>
<li>Only the WLAN changes; policy profile and tag stay as they are.</li>
<li>Prove both directions: new key works, old key is rejected.</li>
<li>Verify the client VLAN (20) and reachability to RAD1.</li>
<li>Communication and a window matter as much as the commands.</li>
</ul></div>
`,hi:`
<p>Security ne naya staff passphrase maanga hai, <b>NkStaff2025</b>. WLAN NK-STAFF abhi NkStaff2024 use karta hai aur enabled hai. Is chapter mein aap rotation ko change request ki tarah plan karte ho, chalate ho, aur prove karte ho ki nayi key chalti hai aur purani reject hoti hai. Yeh lab <code>wl-psk-rotate</code> hai.</p>

<h3>Step 0: change plan karo</h3>
<p>Achhi rotation ke paanch hisse hote hain. Kuch type karne se pehle ticket mein likho.</p>
<ol>
<li><b>Scope:</b> sirf WLAN NK-STAFF (id 1). NK-VOICE ki apni key hai aur woh touch nahi hota.</li>
<li><b>Window:</b> change ke dauran NK-STAFF ke saare clients drop honge.</li>
<li><b>Communication:</b> window se pehle staff ko nayi key bata do.</li>
<li><b>Rollback:</b> purani key NkStaff2024 ticket vault mein rakho agar revert karna pade.</li>
<li><b>Proof:</b> ek client nayi key se join kare, aur purani key reject ho.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Rotation flow">
<rect x="20" y="30" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="75" y="58" text-anchor="middle" class="svg-ink" font-size="12">Plan + notify</text>
<rect x="150" y="30" width="110" height="46" rx="8" fill="#fed7aa"/><text x="205" y="58" text-anchor="middle" class="svg-ink" font-size="12">shutdown</text>
<rect x="280" y="30" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="335" y="58" text-anchor="middle" class="svg-ink" font-size="12">set-key new</text>
<rect x="410" y="30" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="465" y="58" text-anchor="middle" class="svg-ink" font-size="12">no shutdown</text>
<rect x="540" y="30" width="85" height="46" rx="8" fill="#bae6fd"/><text x="582" y="58" text-anchor="middle" class="svg-ink" font-size="12">Prove</text>
<line x1="130" y1="53" x2="150" y2="53" stroke="#64748b"/><line x1="260" y1="53" x2="280" y2="53" stroke="#64748b"/><line x1="390" y1="53" x2="410" y2="53" stroke="#64748b"/><line x1="520" y1="53" x2="540" y2="53" stroke="#64748b"/>
<text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="12">Proof = nayi key VLAN 20 mein join aur RAD1 reach; purani key reject</text>
</svg><p class="cap">Lab commands bilkul isi flow ko follow karte hain.</p></div>

<h3>Step 1: change se pehle dekho</h3>
<pre class="out">WLC1# show wlan summary
ID   Profile Name    SSID          Status   Security
------------------------------------------------------
<span class="hl">1    NK-STAFF        NK-STAFF      UP       [WPA2][PSK][AES]</span></pre>
<p>WLAN UP hai aur PSK ke saath. Achha: aap sahi object badal rahe ho.</p>

<h3>Step 2: rotate</h3>
<pre class="code">WLC1# configure terminal
WLC1(config)# wlan NK-STAFF
WLC1(config-wlan)# shutdown
<span class="c">! WLAN disabled hai. Clients drop. Ab security edit karo.</span>
WLC1(config-wlan)# security wpa psk set-key ascii 0 NkStaff2025
WLC1(config-wlan)# no shutdown
WLC1(config-wlan)# end
WLC1# write memory</pre>
<p>Dhyan do ki aap WLAN dobara create <b>nahi</b> karte, policy profile PP-STAFF ko touch nahi karte aur policy tag ko touch nahi karte. Sirf key badalti hai. 9800 object model ka yahi faayda hai: ek object ek concern ka owner hai.</p>

<h3>Step 3: prove karo nayi key chalti hai</h3>
<p>LAPTOP1 use karo, jo lab mein Wi-Fi client hai. Client command line SSID aur key leti hai:</p>
<pre class="code">LAPTOP1&gt; wifi connect NK-STAFF psk NkStaff2025
LAPTOP1&gt; wifi status
LAPTOP1&gt; ping 10.10.60.20</pre>
<pre class="out">LAPTOP1&gt; wifi status
SSID: NK-STAFF   State: <span class="hl">Associated</span>   AP: AP1
IP: 10.10.20.x/24   <span class="hl">VLAN 20</span>   Gateway: 10.10.20.1

LAPTOP1&gt; ping 10.10.60.20
!!!!!   Success rate is 100 percent (5/5)</pre>
<p>Teen facts prove hue: association succeed hua (4-way handshake ne key accept ki), client ko R1 DHCP se staff subnet 10.10.20.0/24 ka address mila (policy profile VLAN 20 map karta hai), aur client gateway ke through server network 10.10.60.0/24 mein RADIUS server tak pahunchta hai.</p>

<h3>Step 4: prove karo purani key fail hoti hai</h3>
<pre class="code">LAPTOP2&gt; wifi connect NK-STAFF psk NkStaff2024</pre>
<pre class="out">LAPTOP2&gt; wifi connect NK-STAFF psk NkStaff2024
<span class="hl">Authentication failed: 4-way handshake timeout - the passphrase does not match.</span></pre>
<p>Yeh negative test woh hissa hai jo log skip karte hain. Rotation tab hi poori hoti hai jab purana secret dead ho. Negative test ke bina pata nahi chalta ki aapka set-key chala ya WLAN unchanged tha.</p>
<div class="note"><p>Simulator clear failure message print karta hai. Real client itna friendly nahi hota: real network par galat PSK baar-baar association attempts ke roop mein dikhta hai aur controller par client "PSK failure" ya "4-way handshake timeout" jaisi state mein hota hai. Client debugging aur controller client detail use karo, jo is lab mein sirf concept hai.</p></div>

<h3>Kya galat ho sakta hai</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Command refuse hua</td><td>WLAN abhi enabled hai</td><td>pehle shutdown</td></tr>
<tr><td>Change ke baad koi client SSID nahi dekhta</td><td>no shutdown bhool gaye</td><td>show wlan summary mein DOWN</td></tr>
<tr><td>Nayi key fail</td><td>Typo, ya key galat WLAN par type ki</td><td>NK-STAFF par dobara enter karo</td></tr>
<tr><td>Purani key abhi bhi chalti hai</td><td>Change apply nahi hua</td><td>Dobara karo; output padho</td></tr></table>
<div class="warn"><p><b>Common mistake.</b> Key rotate karke session ke end mein WLAN shut down chhod dena. SSID sabke liye gayab ho jaata hai aur helpdesk ka phone bajta hai. Hamesha <code>show wlan summary</code> se finish karo aur UP dekho.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>shutdown</code> ke baad WLAN configuration rehti hai; sirf broadcast ruk jaata hai. Shut WLAN ya uske policy mapping ko delete nahi karta.</p></div>

<div class="scn"><h4>Friday-night rotation</h4><p>Ek network engineer ne Friday shaam NK-STAFF rotate kiya aur sirf apne laptop se test kiya, jis par usne abhi nayi key enter ki thi. Monday ko 40 logon ke phones purani key se auto-join hote rahe aur silently fail hue, to woh connect nahi kar paye. Nayi key ke saath ek chhota notice aur intranet banner se calls bach jaate.</p><p><b>Lesson:</b> technical change paanch lines ka hai; asli kaam communication aur proof hai.</p></div>
<div class="iv"><p class="q">"Production WLAN par PSK rotate karne ka process batao."</p><p>Scope, window, communication aur rollback plan karo. Controller par WLAN shut, nayi key set, enable, save. Nayi key wale client se aur purani key ki failed attempt se prove karo, aur VLAN aur reachability confirm karo. Yeh bolo ki har client drop hota hai, isliye quiet window choose karo.</p></div>
<div class="tip"><p><b>Web UI mein kaise karein.</b> <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs</b>: NK-STAFF ka <b>Status</b> off karo, <b>Edit &gt; Security</b> kholo, naya key daalo aur save karo, phir <b>Status</b> on karo. Prove karo <b>Monitoring &gt; Wireless &gt; Clients</b> mein.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rotation: shutdown, set-key, no shutdown, write memory.</li>
<li>Sirf WLAN badalta hai; policy profile aur tag jaise hain waise rehte hain.</li>
<li>Dono direction prove karo: nayi key chalti hai, purani reject hoti hai.</li>
<li>Client VLAN (20) aur RAD1 tak reachability verify karo.</li>
<li>Communication aur window commands jitne hi important hain.</li>
</ul></div>
`}};export{e as default};