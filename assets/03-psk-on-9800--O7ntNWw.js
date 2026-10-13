var e={id:`psk-on-9800`,h:{en:`PSK WLANs on the 9800: AKM, keys and the shut-before-edit rule`,hi:`9800 par PSK WLANs: AKM, keys aur shut-before-edit rule`},body:{en:`
<p>A PSK WLAN is the simplest secure SSID to build and the one you will touch most often, because keys change. In this chapter you learn the exact configuration, what each line means and the rule that surprises every new engineer: a WLAN must be disabled before you edit its security.</p>

<h3>Anatomy of a PSK WLAN profile</h3>
<p>You met the WLAN profile in the first module. Here is the security part of NK-STAFF (id 1), the staff SSID from the labs:</p>
<pre class="code"><span class="c">! WLAN profile NK-STAFF, id 1, SSID name NK-STAFF</span>
wlan NK-STAFF 1 NK-STAFF
 no security wpa akm dot1x
 security wpa wpa2
 security wpa wpa2 ciphers aes
 security wpa akm psk
 security wpa psk set-key ascii 0 NkStaff2024
 no shutdown</pre>
<ul>
<li><code>wlan NK-STAFF 1 NK-STAFF</code>: profile name, numeric id, SSID name broadcast to clients.</li>
<li><code>security wpa wpa2</code> and <code>ciphers aes</code>: WPA2 with AES-CCMP. Newly created WLANs default to WPA2 with 802.1X, which is why a PSK build removes the dot1x AKM first.</li>
<li><code>security wpa akm psk</code>: the <b>AKM</b> (authentication and key management) type. Choices in our lab are <code>psk</code>, <code>dot1x</code> and <code>sae</code>. For WPA3-Personal you would use <code>sae</code> with <code>security wpa wpa3</code>.</li>
<li><code>psk set-key ascii 0 &lt;key&gt;</code>: the passphrase. The <code>0</code> means "the text that follows is clear text, not already encrypted". The controller stores it as given, so in a real network you protect the configuration file and enable password encryption.</li>
<li><code>no shutdown</code>: a new WLAN starts <b>shut down</b>. Nothing is broadcast until you enable it.</li>
</ul>

<h3>The shut-before-edit rule</h3>
<p>If you try to change security on an enabled WLAN, the controller refuses, with a message telling you to disable the WLAN first. Real controllers do this because changing the AKM or key under live clients would leave them in an undefined state. So the safe sequence is always:</p>
<ol>
<li><code>wlan NK-STAFF</code> (enter the profile)</li>
<li><code>shutdown</code> (SSID disappears, clients are dropped)</li>
<li>edit the security line</li>
<li><code>no shutdown</code> (SSID returns)</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Shut before edit">
<rect x="15" y="40" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="62" text-anchor="middle" class="svg-ink" font-size="12">1. WLAN enabled</text><text x="80" y="78" text-anchor="middle" class="svg-muted" font-size="11">clients online</text>
<rect x="175" y="40" width="130" height="50" rx="8" fill="#fed7aa"/><text x="240" y="62" text-anchor="middle" class="svg-ink" font-size="12">2. shutdown</text><text x="240" y="78" text-anchor="middle" class="svg-muted" font-size="11">clients dropped</text>
<rect x="335" y="40" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="400" y="62" text-anchor="middle" class="svg-ink" font-size="12">3. edit security</text><text x="400" y="78" text-anchor="middle" class="svg-muted" font-size="11">set-key new</text>
<rect x="495" y="40" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="62" text-anchor="middle" class="svg-ink" font-size="12">4. no shutdown</text><text x="560" y="78" text-anchor="middle" class="svg-muted" font-size="11">SSID back</text>
<line x1="145" y1="65" x2="175" y2="65" stroke="#64748b"/><line x1="305" y1="65" x2="335" y2="65" stroke="#64748b"/><line x1="465" y1="65" x2="495" y2="65" stroke="#64748b"/>
<text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">Plan the change window: every client on this SSID is disconnected at step 2</text>
</svg><p class="cap">Security changes are disruptive by design. Do them in a window.</p></div>

<h3>Showing the result</h3>
<pre class="out">WLC1# show wlan summary
Number of WLANs: 1

ID   Profile Name    SSID          Status   Security
------------------------------------------------------
<span class="hl">1    NK-STAFF        NK-STAFF      UP       [WPA2][PSK][AES]</span></pre>
<p>The key itself is deliberately not displayed in this summary. To see it you would read the configuration with <code>show running-config | section wlan NK-STAFF</code>. Treat that output as sensitive.</p>

<h3>Passphrase quality</h3>
<ul>
<li>8 to 63 characters for ASCII. Longer, random passphrases resist guessing; 20 characters or more is good practice.</li>
<li>A 64-character hexadecimal string is a raw PMK, not a passphrase.</li>
<li>Never reuse one PSK across guest, staff and voice SSIDs.</li>
</ul>

<h3>Limits of PSK</h3>
<p>One key for everybody means no individual accountability, no per-user revocation and a leaked key is a leaked network. <b>iPSK</b> (identity PSK) gives each user or device group its own key delivered through RADIUS, and <b>PSK + MAC filtering</b> is weaker. iPSK is a real 9800 feature but is <b>not simulated in the lab</b>. Coming up: module wl-secure (Advanced security). For people, 802.1X is the answer, which is the second half of this module. PSK remains right for headless devices such as handsets, printers and sensors.</p>
<div class="eg"><p><b>Worked example.</b> NK-STAFF has 80 clients. At step 2 all 80 drop. At step 4 the SSID is back, but each client still stores the old key. Clients that auto-reconnect with the old key fail the 4-way handshake and stay disconnected until someone updates the saved network. Communicate before you change.</p></div>
<div class="warn"><p><b>Common mistake.</b> Typing the new key on an enabled WLAN and assuming the command worked. If the controller rejects it, the old key stays in force while you believe you rotated it. Always verify afterwards.</p></div>
<div class="exam"><p><b>Exam trap.</b> The WLAN profile name, the SSID name and the id are three different fields. The SSID is what clients see; the profile name is what the policy tag references.</p></div>

<div class="scn"><h4>The rotation that did nothing</h4><p>An engineer pasted <code>security wpa psk set-key ascii 0 NewKey2025</code> into an enabled WLAN during office hours. The controller printed an error that he did not notice in a long paste. The old key kept working, and the audit later showed the key had never changed.</p><p><b>Lesson:</b> always read the output of a security change and prove the result by connecting with the new key and failing with the old one.</p></div>
<div class="iv"><p class="q">"Why does the 9800 make you shut a WLAN before changing its security?"</p><p>Because AKM, cipher and key define how every associated client derived its keys. Changing them live would leave existing sessions inconsistent. So the WLAN is disabled, the change applied, and the WLAN re-enabled. Mention the outage window for that SSID.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PSK WLAN: wpa2, ciphers aes, akm psk, psk set-key.</li>
<li>New WLANs start shut down; enable them with no shutdown.</li>
<li>Disable the WLAN before editing security, then re-enable.</li>
<li>The shutdown drops every client on that SSID.</li>
<li>iPSK is concept only in our lab; PSK suits headless devices.</li>
</ul></div>
`,hi:`
<p>PSK WLAN sabse simple secure SSID hai aur aap ise sabse zyada chhuoge kyunki keys badalti rehti hain. Is chapter mein aap exact configuration, har line ka matlab aur woh rule seekhoge jo har naye engineer ko surprise karta hai: security edit karne se pehle WLAN disable karna padta hai.</p>

<h3>PSK WLAN profile ki anatomy</h3>
<p>WLAN profile aap pehle module mein mile the. Yeh NK-STAFF (id 1) ka security part hai, labs ka staff SSID:</p>
<pre class="code"><span class="c">! WLAN profile NK-STAFF, id 1, SSID name NK-STAFF</span>
wlan NK-STAFF 1 NK-STAFF
 no security wpa akm dot1x
 security wpa wpa2
 security wpa wpa2 ciphers aes
 security wpa akm psk
 security wpa psk set-key ascii 0 NkStaff2024
 no shutdown</pre>
<ul>
<li><code>wlan NK-STAFF 1 NK-STAFF</code>: profile name, numeric id, SSID name jo clients ko broadcast hota hai.</li>
<li><code>security wpa wpa2</code> aur <code>ciphers aes</code>: AES-CCMP ke saath WPA2. Naya WLAN default mein 802.1X ke saath WPA2 hota hai, isliye PSK build pehle dot1x AKM hata deta hai.</li>
<li><code>security wpa akm psk</code>: <b>AKM</b> (authentication and key management) type. Hamari lab mein choices <code>psk</code>, <code>dot1x</code> aur <code>sae</code> hain. WPA3-Personal ke liye <code>security wpa wpa3</code> ke saath <code>sae</code> use karoge.</li>
<li><code>psk set-key ascii 0 &lt;key&gt;</code>: passphrase. <code>0</code> ka matlab "aage ka text clear text hai, pehle se encrypted nahi". Controller jaisa diya waisa store karta hai, isliye real network mein configuration file protect karo aur password encryption enable karo.</li>
<li><code>no shutdown</code>: naya WLAN <b>shut down</b> start hota hai. Jab tak enable nahi karte kuch broadcast nahi hota.</li>
</ul>

<h3>Shut-before-edit rule</h3>
<p>Agar enabled WLAN par security change karne ki koshish karo to controller mana kar deta hai aur message deta hai ki pehle WLAN disable karo. Real controllers aisa isliye karte hain kyunki live clients ke neeche AKM ya key badalna unhe undefined state mein chhod deta. To safe sequence hamesha yeh hai:</p>
<ol>
<li><code>wlan NK-STAFF</code> (profile mein jao)</li>
<li><code>shutdown</code> (SSID gayab, clients drop)</li>
<li>security line edit karo</li>
<li><code>no shutdown</code> (SSID wapas)</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Shut before edit">
<rect x="15" y="40" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="62" text-anchor="middle" class="svg-ink" font-size="12">1. WLAN enabled</text><text x="80" y="78" text-anchor="middle" class="svg-muted" font-size="11">clients online</text>
<rect x="175" y="40" width="130" height="50" rx="8" fill="#fed7aa"/><text x="240" y="62" text-anchor="middle" class="svg-ink" font-size="12">2. shutdown</text><text x="240" y="78" text-anchor="middle" class="svg-muted" font-size="11">clients drop</text>
<rect x="335" y="40" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="400" y="62" text-anchor="middle" class="svg-ink" font-size="12">3. security edit</text><text x="400" y="78" text-anchor="middle" class="svg-muted" font-size="11">naya set-key</text>
<rect x="495" y="40" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="62" text-anchor="middle" class="svg-ink" font-size="12">4. no shutdown</text><text x="560" y="78" text-anchor="middle" class="svg-muted" font-size="11">SSID wapas</text>
<line x1="145" y1="65" x2="175" y2="65" stroke="#64748b"/><line x1="305" y1="65" x2="335" y2="65" stroke="#64748b"/><line x1="465" y1="65" x2="495" y2="65" stroke="#64748b"/>
<text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">Change window plan karo: step 2 par is SSID ke saare clients disconnect hote hain</text>
</svg><p class="cap">Security changes design se hi disruptive hain. Window mein karo.</p></div>

<h3>Result dekhna</h3>
<pre class="out">WLC1# show wlan summary
Number of WLANs: 1

ID   Profile Name    SSID          Status   Security
------------------------------------------------------
<span class="hl">1    NK-STAFF        NK-STAFF      UP       [WPA2][PSK][AES]</span></pre>
<p>Key khud is summary mein jaanbujhkar display nahi hoti. Dekhne ke liye configuration padho: <code>show running-config | section wlan NK-STAFF</code>. Us output ko sensitive maano.</p>

<h3>Passphrase quality</h3>
<ul>
<li>ASCII ke liye 8 se 63 characters. Lambe, random passphrases guessing resist karte hain; 20 ya zyada characters achhi practice hai.</li>
<li>64-character hexadecimal string raw PMK hai, passphrase nahi.</li>
<li>Ek PSK ko guest, staff aur voice SSIDs mein kabhi reuse mat karo.</li>
</ul>

<h3>PSK ki limits</h3>
<p>Sabke liye ek key ka matlab individual accountability nahi, per-user revocation nahi, aur leaked key matlab leaked network. <b>iPSK</b> (identity PSK) har user ya device group ko RADIUS se apni key deta hai, aur <b>PSK + MAC filtering</b> kamzor hai. iPSK real 9800 feature hai lekin <b>lab mein simulated nahi</b>. Aage aane wala module: wl-secure (Advanced security). Logon ke liye 802.1X jawab hai, jo is module ka doosra half hai. PSK headless devices jaise handsets, printers aur sensors ke liye sahi rehta hai.</p>
<div class="eg"><p><b>Worked example.</b> NK-STAFF par 80 clients hain. Step 2 par 80 ke 80 drop. Step 4 par SSID wapas, lekin har client abhi bhi purani key store karta hai. Jo clients purani key se auto-reconnect karte hain woh 4-way handshake mein fail hote hain aur tab tak disconnected rehte hain jab tak koi saved network update na kare. Change se pehle communicate karo.</p></div>
<div class="warn"><p><b>Common mistake.</b> Enabled WLAN par nayi key type karke maan lena ki command chal gayi. Agar controller reject kare to purani key chalu rehti hai jabki aap sochte ho rotate ho gayi. Baad mein hamesha verify karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> WLAN profile name, SSID name aur id teen alag fields hain. SSID woh hai jo clients dekhte hain; profile name woh hai jo policy tag reference karta hai.</p></div>

<div class="scn"><h4>Woh rotation jisne kuch nahi badla</h4><p>Ek engineer ne office hours mein enabled WLAN mein <code>security wpa psk set-key ascii 0 NewKey2025</code> paste kiya. Controller ne error print kiya jo lambe paste mein usse dikha nahi. Purani key chalti rahi, aur baad ke audit mein pata chala ki key kabhi badli hi nahi.</p><p><b>Lesson:</b> security change ka output hamesha padho aur nayi key se connect karke aur purani se fail hoke result prove karo.</p></div>
<div class="iv"><p class="q">"9800 security change se pehle WLAN shut karne par majboor kyun karta hai?"</p><p>Kyunki AKM, cipher aur key define karte hain ki har associated client ne keys kaise derive ki. Inhe live badalne se existing sessions inconsistent ho jaate. Isliye WLAN disable, change apply, aur WLAN re-enable. Us SSID ki outage window ka zikr karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PSK WLAN: wpa2, ciphers aes, akm psk, psk set-key.</li>
<li>Naye WLANs shut down start hote hain; no shutdown se enable karo.</li>
<li>Security edit se pehle WLAN disable karo, phir re-enable.</li>
<li>Shutdown us SSID ke har client ko drop karta hai.</li>
<li>iPSK hamari lab mein sirf concept hai; PSK headless devices ke liye theek hai.</li>
</ul></div>
`}};export{e as default};