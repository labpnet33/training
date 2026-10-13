var e={id:`pmf-wpa3-owe`,h:{en:`PMF (802.11w), WPA3 SAE, OWE and 192-bit security`,hi:`PMF (802.11w), WPA3 SAE, OWE aur 192-bit security`},body:{en:`
<p>Imagine a conference call where anyone can shout "Alice has left the call!" and the system believes it. Alice's audio stops although she is still there. In older Wi-Fi, the <b>management frames</b> that start and end a connection (deauthentication, disassociation) were sent unprotected, so any radio could forge them and kick a client off. <b>Protected Management Frames (PMF, IEEE 802.11w)</b> fixes this by making the client and the AP verify those frames cryptographically.</p>

<h3>PMF in plain words</h3>
<p>After a client joins a secured WLAN, unicast management frames are encrypted and integrity checked with the session keys, and broadcast management frames are protected with a group integrity key. A forged deauthentication frame fails the check and is ignored. If the AP loses a client's keys, an <b>SA Query</b> exchange lets both sides confirm the other is really there before tearing down. On the 9800 the PMF setting is per WLAN with three states:</p>
<table class="cmp"><tr><th>Setting</th><th>Meaning</th><th>Who can join</th></tr>
<tr><td>Disabled (default)</td><td>No PMF offered</td><td>Clients that do not require PMF</td></tr>
<tr><td><code>optional</code></td><td>PMF capable: used if the client supports it</td><td>Both PMF-capable and legacy clients</td></tr>
<tr><td><code>mandatory</code></td><td>PMF required</td><td>Only PMF-capable clients (others get status code 31)</td></tr>
</table>
<pre class="code">wlan NK-SECURE
 shutdown
 security pmf optional
 no shutdown
 exit</pre>
<p>Web UI: <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs</b>, edit the WLAN, <b>Security &gt; Layer2</b>, PMF; in this build you can also use <b>Configuration &gt; Security &gt; Web Auth &gt; WLAN Security</b>. Command spelling and menu placement can differ between releases, so confirm on your release.</p>

<h3>WPA3 in short</h3>
<ul>
<li><b>WPA3-Personal</b> replaces the PSK handshake with <b>SAE</b> (Simultaneous Authentication of Equals, a Dragonfly handshake). An observer who records the handshake cannot test guessed passwords offline, and recorded traffic cannot be decrypted later even if the password leaks (forward secrecy). PMF is required.</li>
<li><b>WPA3-Enterprise</b> is 802.1X with PMF required. A stricter <b>192-bit mode</b> (concept only here) uses 256-bit GCMP, 384-bit elliptic curve cryptography and EAP-TLS with matching suites, for high-security networks.</li>
<li><b>OWE</b> (Opportunistic Wireless Encryption) gives <b>open guest networks encryption</b>: client and AP perform a Diffie-Hellman exchange, so each client has its own key, with no password. OWE encrypts but does not authenticate the AP, so a fake AP can still impersonate it. <b>OWE transition mode</b> pairs a hidden OWE SSID with an open SSID so old clients still join. Concept only.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="WPA2/WPA3 transition and PMF">
<rect x="10" y="20" width="620" height="40" rx="8" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">WLAN NK-SECURE: WPA2-PSK + WPA3-SAE (transition mode), PMF optional</text>
<rect x="10" y="90" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="105" y="115" text-anchor="middle" class="svg-ink" font-size="12">LAPTOP1: SAE + PMF</text><text x="105" y="133" text-anchor="middle" class="svg-ink" font-size="12">joins with WPA3</text>
<rect x="225" y="90" width="190" height="60" rx="8" fill="#fde68a"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="12">SCANNER1: PSK, no PMF</text><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="12">joins with WPA2</text>
<rect x="440" y="90" width="190" height="60" rx="8" fill="#fed7aa"/><text x="535" y="115" text-anchor="middle" class="svg-ink" font-size="12">If PMF = mandatory:</text><text x="535" y="133" text-anchor="middle" class="svg-ink" font-size="12">SCANNER1 gets status 31</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Optional keeps both on one SSID; mandatory locks out any client without PMF.</text>
</svg><p class="cap">Transition mode needs PMF optional (or mandatory) so WPA3 and WPA2 clients can share the WLAN.</p></div>

<h3>The rules the controller enforces</h3>
<ol>
<li>PMF needs a WPA2 or WPA3 WLAN. It cannot be set on an open WLAN.</li>
<li>A WLAN that offers <b>only</b> WPA3-SAE, or WPA3-Enterprise, needs PMF <b>mandatory</b>.</li>
<li>A WPA2+WPA3 <b>transition</b> WLAN must have PMF set (optional or mandatory).</li>
<li>At association: a client with no PMF is refused on <code>mandatory</code> with <b>status code 31</b> (robust management frame policy violation). A client that requires PMF is also refused if the WLAN has PMF disabled. An SAE-only WLAN refuses a client that cannot do SAE with <b>status code 43</b> (invalid AKMP).</li>
<li><b>6 GHz</b> (Wi-Fi 6E and 7): WPA3 and PMF are mandatory there, and open or WPA2 personal are not allowed. Plan the client population before moving an SSID to 6 GHz. (Concept only.)</li>
</ol>
<pre class="out">WLC1# show logging
<span class="hl">%APF-4-ASSOC_REJECT: Client 0050.7966.6807 rejected on WLAN 4 (NK-SECURE): PMF is required, client is not PMF capable (status 31)</span>

WLC1# show wlan name NK-SECURE
...
Security:  WPA3 [SAE] [PSK]   PMF: mandatory</pre>

<h3>Choosing optional or mandatory</h3>
<p><b>Mandatory</b> is the strongest choice and the right default for new WLANs when every device is modern. <b>Optional</b> is the migration choice: modern clients are protected, legacy clients keep working, and you track how many legacy clients remain, then move to mandatory. Hardening by flipping to mandatory without an inventory is a classic way to cause an outage, as lab 4 shows.</p>

<div class="eg"><p><b>Worked example.</b> A warehouse has 120 laptops (PMF and SAE capable) and 30 old scanners (WPA2, no PMF). Plan: NK-SECURE in WPA2/WPA3 transition mode with PMF optional. Laptops use WPA3 and protected management frames. Scanners keep WPA2. A report of scanners still seen shows the replacement list; when it reaches zero, switch PMF to mandatory and drop WPA2.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Setting mandatory while legacy clients exist. Forgetting to shut down the WLAN before editing security. Assuming OWE authenticates the AP. Assuming WPA3 stops all attacks: weak passwords still matter for SAE and rogue APs still exist.</p></div>

<div class="exam"><p><b>Exam traps.</b> 802.11w protects management frames, not data (data is protected by the cipher). Status 31 is a PMF policy violation, status 43 is an invalid AKM. WPA3-only needs mandatory PMF. PMF does not stop radio jamming. SAE is not the same as 802.1X.</p></div>

<div class="scn"><h4>The scanners that vanished</h4><p>After a hardening change to PMF mandatory, the warehouse scanners stopped joining while laptops were fine. The log showed status code 31 for the scanner MAC. The engineer confirmed the scanners had no PMF support, shut down NK-SECURE, set <code>security pmf optional</code>, enabled it again, and both client types joined. A replacement plan for the scanners was filed.</p><p><b>Lesson:</b> read the status code, then compare client capability with the WLAN setting.</p></div>

<div class="iv"><p class="q">"What does 802.11w protect against, and when would you choose optional over mandatory?"</p><p>It protects management frames such as deauthentication from being forged to disconnect clients. Choose mandatory when all clients support it (and always for WPA3 and 6 GHz). Choose optional during migration so legacy clients are not locked out while you measure how many remain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PMF (802.11w) protects management frames against forged disconnects: disabled, optional, mandatory.</li>
<li>Status 31 means PMF policy violation; status 43 means invalid AKM (SAE-only WLAN, client without SAE).</li>
<li>WPA3-Personal uses SAE with forward secrecy; WPA3 needs PMF mandatory when it is the only AKM.</li>
<li>OWE encrypts open guest networks but does not authenticate the AP; 192-bit mode is concept only.</li>
<li>Use WPA2/WPA3 transition with PMF optional to migrate safely.</li>
</ul></div>
`,hi:`
<p>Ek conference call socho jahan koi bhi chillakar keh sakta hai "Alice call chhod gayi!" aur system maan leta hai. Alice ki audio band ho jati hai jabki woh abhi bhi wahin hai. Purane Wi-Fi mein jo <b>management frames</b> connection shuru aur khatam karte hain (deauthentication, disassociation) woh unprotected bheje jaate the, isliye koi bhi radio unhe forge karke client ko nikaal sakta tha. <b>Protected Management Frames (PMF, IEEE 802.11w)</b> isse theek karta hai: client aur AP un frames ko cryptographically verify karte hain.</p>

<h3>PMF saaf shabdon mein</h3>
<p>Secured WLAN join karne ke baad unicast management frames session keys se encrypt aur integrity-checked hote hain, aur broadcast management frames group integrity key se protected hote hain. Forge kiya hua deauthentication frame check mein fail hota hai aur ignore ho jata hai. Agar AP client ki keys kho de to <b>SA Query</b> exchange dono ko confirm karne deta hai ki doosra sach mein wahan hai, tab hi teardown hota hai. 9800 par PMF setting per WLAN hai aur teen states hain:</p>
<table class="cmp"><tr><th>Setting</th><th>Matlab</th><th>Kaun join kar sakta hai</th></tr>
<tr><td>Disabled (default)</td><td>PMF offer nahi hota</td><td>Wo clients jo PMF require nahi karte</td></tr>
<tr><td><code>optional</code></td><td>PMF capable: client support kare to use hota hai</td><td>PMF-capable aur legacy dono clients</td></tr>
<tr><td><code>mandatory</code></td><td>PMF required</td><td>Sirf PMF-capable clients (baaki ko status code 31)</td></tr>
</table>
<pre class="code">wlan NK-SECURE
 shutdown
 security pmf optional
 no shutdown
 exit</pre>
<p>Web UI: <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs</b>, WLAN edit karo, <b>Security &gt; Layer2</b>, PMF; is build mein <b>Configuration &gt; Security &gt; Web Auth &gt; WLAN Security</b> bhi use kar sakte ho. Command ki spelling aur menu ki jagah releases ke beech alag ho sakti hai, isliye apni release par confirm karo.</p>

<h3>WPA3 sankshep mein</h3>
<ul>
<li><b>WPA3-Personal</b> PSK handshake ki jagah <b>SAE</b> (Simultaneous Authentication of Equals, ek Dragonfly handshake) lata hai. Jo observer handshake record kare woh guessed passwords ko offline test nahi kar sakta, aur password leak hone par bhi recorded traffic baad mein decrypt nahi hota (forward secrecy). PMF required hai.</li>
<li><b>WPA3-Enterprise</b> PMF required ke saath 802.1X hai. Ek zyada strict <b>192-bit mode</b> (yahan concept only) 256-bit GCMP, 384-bit elliptic curve cryptography aur matching suites ke saath EAP-TLS use karta hai, high-security networks ke liye.</li>
<li><b>OWE</b> (Opportunistic Wireless Encryption) <b>open guest networks ko encryption</b> deta hai: client aur AP Diffie-Hellman exchange karte hain, to har client ki apni key hoti hai, password ke bina. OWE encrypt karta hai lekin AP ko authenticate nahi karta, isliye fake AP phir bhi uski nakal kar sakta hai. <b>OWE transition mode</b> ek hidden OWE SSID ko open SSID ke saath jodta hai taaki purane clients bhi join karein. Concept only.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="WPA2/WPA3 transition aur PMF">
<rect x="10" y="20" width="620" height="40" rx="8" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">WLAN NK-SECURE: WPA2-PSK + WPA3-SAE (transition mode), PMF optional</text>
<rect x="10" y="90" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="105" y="115" text-anchor="middle" class="svg-ink" font-size="12">LAPTOP1: SAE + PMF</text><text x="105" y="133" text-anchor="middle" class="svg-ink" font-size="12">WPA3 se join</text>
<rect x="225" y="90" width="190" height="60" rx="8" fill="#fde68a"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="12">SCANNER1: PSK, PMF nahi</text><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="12">WPA2 se join</text>
<rect x="440" y="90" width="190" height="60" rx="8" fill="#fed7aa"/><text x="535" y="115" text-anchor="middle" class="svg-ink" font-size="12">PMF = mandatory ho to:</text><text x="535" y="133" text-anchor="middle" class="svg-ink" font-size="12">SCANNER1 ko status 31</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Optional dono ko ek SSID par rakhta hai; mandatory PMF-less har client ko bahar karta hai.</text>
</svg><p class="cap">Transition mode ko PMF optional (ya mandatory) chahiye taaki WPA3 aur WPA2 clients WLAN share karein.</p></div>

<h3>Controller jo rules enforce karta hai</h3>
<ol>
<li>PMF ko WPA2 ya WPA3 WLAN chahiye. Open WLAN par set nahi hota.</li>
<li>Jo WLAN <b>sirf</b> WPA3-SAE ya WPA3-Enterprise offer kare use PMF <b>mandatory</b> chahiye.</li>
<li>WPA2+WPA3 <b>transition</b> WLAN par PMF set hona chahiye (optional ya mandatory).</li>
<li>Association par: PMF-less client <code>mandatory</code> par <b>status code 31</b> (robust management frame policy violation) ke saath refuse hota hai. Jo client PMF require karta hai woh bhi refuse hota hai agar WLAN par PMF disabled hai. SAE-only WLAN aise client ko refuse karta hai jo SAE nahi kar sakta, <b>status code 43</b> (invalid AKMP) ke saath.</li>
<li><b>6 GHz</b> (Wi-Fi 6E aur 7): WPA3 aur PMF wahan mandatory hain, aur open ya WPA2 personal allowed nahi. SSID ko 6 GHz par le jaane se pehle client population plan karo. (Concept only.)</li>
</ol>
<pre class="out">WLC1# show logging
<span class="hl">%APF-4-ASSOC_REJECT: Client 0050.7966.6807 rejected on WLAN 4 (NK-SECURE): PMF is required, client is not PMF capable (status 31)</span>

WLC1# show wlan name NK-SECURE
...
Security:  WPA3 [SAE] [PSK]   PMF: mandatory</pre>

<h3>Optional ya mandatory chunna</h3>
<p><b>Mandatory</b> sabse strong choice hai aur naye WLANs ke liye sahi default jab har device modern ho. <b>Optional</b> migration choice hai: modern clients protected rehte hain, legacy clients chalte rehte hain, aap track karte ho kitne legacy clients bache hain, phir mandatory par jaate ho. Inventory ke bina mandatory par flip karke hardening karna outage ka classic tareeka hai, jaisa lab 4 dikhata hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek warehouse mein 120 laptops (PMF aur SAE capable) aur 30 purane scanners (WPA2, PMF nahi) hain. Plan: NK-SECURE WPA2/WPA3 transition mode mein PMF optional ke saath. Laptops WPA3 aur protected management frames use karte hain. Scanners WPA2 par rehte hain. Jo scanners abhi dikh rahe hain unki report replacement list banati hai; jab woh zero ho jaye, PMF mandatory karo aur WPA2 hata do.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Legacy clients hote hue mandatory set karna. Security edit karne se pehle WLAN shut down karna bhool jana. Yeh maanna ki OWE AP ko authenticate karta hai. Yeh maanna ki WPA3 har attack rokta hai: SAE ke liye weak passwords ab bhi matter karte hain aur rogue APs ab bhi hote hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> 802.11w management frames protect karta hai, data nahi (data cipher se protected hota hai). Status 31 PMF policy violation hai, status 43 invalid AKM hai. WPA3-only ko mandatory PMF chahiye. PMF radio jamming nahi rokta. SAE aur 802.1X ek cheez nahi hain.</p></div>

<div class="scn"><h4>Scanners jo gayab ho gaye</h4><p>PMF mandatory ki hardening change ke baad warehouse scanners join karna band ho gaye jabki laptops theek the. Log ne scanner MAC ke liye status code 31 dikhaya. Engineer ne confirm kiya ki scanners PMF support nahi karte, NK-SECURE shut down kiya, <code>security pmf optional</code> set kiya, dobara enable kiya, aur dono type ke clients join ho gaye. Scanners ka replacement plan file kiya gaya.</p><p><b>Lesson:</b> status code padho, phir client capability ko WLAN setting se compare karo.</p></div>

<div class="iv"><p class="q">"802.11w kis se bachata hai, aur optional ki jagah mandatory kab chunoge?"</p><p>Yeh deauthentication jaise management frames ko forge karke clients disconnect karne se bachata hai. Mandatory tab chuno jab saare clients support karte hon (aur WPA3 aur 6 GHz ke liye hamesha). Optional migration mein chuno taaki legacy clients lock out na hon jab tak aap naap rahe ho ki kitne bache hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PMF (802.11w) forged disconnects se management frames ko bachata hai: disabled, optional, mandatory.</li>
<li>Status 31 matlab PMF policy violation; status 43 matlab invalid AKM (SAE-only WLAN, SAE-less client).</li>
<li>WPA3-Personal SAE use karta hai forward secrecy ke saath; jab WPA3 akela AKM ho to PMF mandatory chahiye.</li>
<li>OWE open guest networks ko encrypt karta hai lekin AP ko authenticate nahi karta; 192-bit mode concept only hai.</li>
<li>Safe migration ke liye WPA2/WPA3 transition aur PMF optional use karo.</li>
</ul></div>
`}};export{e as default};