var e={id:`design-choices`,h:{en:`Choosing security per SSID: guest, voice, corporate, migration and hardening`,hi:`Har SSID ke liye security chunna: guest, voice, corporate, migration aur hardening`},body:{en:`
<p>Knowing the mechanisms is half the job. The other half is choosing the right one for each SSID, migrating safely and hardening what you build. This chapter ties the module together and previews features you will meet on real controllers but that the lab does not simulate.</p>

<h3>One security model per purpose</h3>
<table class="cmp"><tr><th>SSID</th><th>Users</th><th>Best choice</th><th>Why</th></tr>
<tr><td>NK-CORP</td><td>Managed laptops, phones</td><td>WPA2/WPA3-Enterprise, 802.1X</td><td>Per-user identity, revocation, auditing</td></tr>
<tr><td>NK-STAFF</td><td>Small team, simple devices</td><td>WPA2-PSK now; WPA3-SAE when clients allow</td><td>Easy, but rotate keys regularly</td></tr>
<tr><td>NK-VOICE</td><td>Handsets that lack 802.1X</td><td>WPA2-PSK (or iPSK), dedicated VLAN 30</td><td>Compatibility; isolate the device class</td></tr>
<tr><td>NK-GUEST</td><td>Visitors</td><td>Open (or OWE), isolated VLAN 50, web consent</td><td>No credentials to share; contain with ACL</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="SSID design">
<rect x="20" y="25" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="90" y="52" text-anchor="middle" class="svg-ink" font-size="12">NK-CORP</text><text x="90" y="70" text-anchor="middle" class="svg-muted" font-size="11">802.1X, VLAN 40</text>
<rect x="180" y="25" width="140" height="60" rx="10" fill="#fde68a"/><text x="250" y="52" text-anchor="middle" class="svg-ink" font-size="12">NK-STAFF</text><text x="250" y="70" text-anchor="middle" class="svg-muted" font-size="11">PSK, VLAN 20</text>
<rect x="340" y="25" width="140" height="60" rx="10" fill="#bae6fd"/><text x="410" y="52" text-anchor="middle" class="svg-ink" font-size="12">NK-VOICE</text><text x="410" y="70" text-anchor="middle" class="svg-muted" font-size="11">PSK, VLAN 30</text>
<rect x="500" y="25" width="120" height="60" rx="10" fill="#e2e8f0"/><text x="560" y="52" text-anchor="middle" class="svg-ink" font-size="12">NK-GUEST</text><text x="560" y="70" text-anchor="middle" class="svg-muted" font-size="11">Open, VLAN 50</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">Security type, VLAN and policy are chosen together for each device class</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">Do not run more SSIDs than needed: each one adds beacon overhead</text>
</svg><p class="cap">Four SSIDs, four security models, four VLANs.</p></div>

<h3>Migrating to WPA3 safely</h3>
<ol>
<li>Inventory clients and their capabilities (WPA3, PMF, SAE support).</li>
<li>Enable <b>transition mode</b> on a pilot SSID: WPA2 and WPA3 together, PMF optional.</li>
<li>Watch which clients still associate with WPA2. Replace or upgrade them.</li>
<li>Move to WPA3-only with PMF required when the client list is clean. The 6 GHz band requires WPA3 (and OWE for open networks) anyway.</li>
</ol>
<p>In the 9800 syntax you would change the AKM to <code>sae</code> with <code>security wpa wpa3</code>, after shutting the WLAN as always. The lab models the AKM and the shut-before-edit behaviour, but PMF and the SAE exchange are concept only.</p>

<h3>Guest networks and OWE</h3>
<p>Open guest Wi-Fi has no encryption, so any neighbour can capture the traffic. <b>OWE</b> (Opportunistic Wireless Encryption, branded Enhanced Open) gives each client its own key with no password, so passive eavesdropping fails while the user experience stays the same. Guest <b>web authentication</b> portals (LWA, CWA) add terms acceptance or sponsor approval. Portals and OWE are <b>concept only, not simulated in the lab</b>. What the lab does teach is the containment: guest in VLAN 50 and an ACL on R1 blocking server and staff networks.</p>

<h3>Fast roaming and security</h3>
<p>802.1X adds delay when a client moves to another AP, because a full EAP exchange can take hundreds of milliseconds. Voice calls notice that. <b>802.11r</b> (fast BSS transition), <b>OKC</b> and PMK caching let the client reuse key material, while <b>802.11k</b> and <b>802.11v</b> help it choose the next AP. These real exchanges are <b>not simulated in the lab</b>; you only need to know they exist, that they are negotiated per WLAN, and that some old clients fail on 11r.</p>

<h3>Hardening checklist</h3>
<ul>
<li>Use WPA2-AES or WPA3 only; no TKIP, no WEP.</li>
<li>Use long random PSKs and rotate them on a schedule and when staff leave.</li>
<li>Use 802.1X for people; validate the server certificate on clients.</li>
<li>Two RADIUS servers in the server group; unique secrets per server, 20+ random characters.</li>
<li>Restrict who can edit the controller and send RADIUS from a known management address.</li>
<li>Keep guest isolated; log authentications; enable PMF where clients support it.</li>
<li>Do not treat SSID hiding or MAC filtering as security.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> A clinic has 30 staff laptops, 12 handheld scanners (WPA2 only), and a waiting room. The design: NK-CORP with 802.1X for laptops, NK-VOICE style PSK for scanners in their own VLAN with an ACL to the application server only, and an isolated guest SSID. The scanner key is rotated twice a year using the safe procedure from chapter 4.</p></div>
<div class="warn"><p><b>Common mistake.</b> Putting 802.1X-capable laptops on the PSK SSID "because it is easier". One leaked key then exposes the laptops' VLAN. Match the model to the device class.</p></div>
<div class="exam"><p><b>Exam trap.</b> WPA3 transition mode is not "secure like WPA3". It keeps the WPA2 path, so an attacker can target the weaker path.</p></div>

<div class="scn"><h4>The scanner SSID that leaked</h4><p>A warehouse used one PSK for laptops and scanners. A contractor photographed the key from a label. After the incident, the company split the design: laptops to 802.1X, scanners to a separate PSK SSID in a restricted VLAN with an ACL. A leak of the scanner key no longer reached laptops or servers.</p><p><b>Lesson:</b> blast radius is a design choice. Separate device classes by SSID and VLAN.</p></div>
<div class="iv"><p class="q">"How would you secure Wi-Fi for staff, handsets and guests in one building?"</p><p>802.1X for managed staff devices, a separate PSK or iPSK SSID in its own VLAN for headless handsets, and an isolated open or OWE guest SSID with an ACL. Add rotation, two RADIUS servers, PMF where supported and a WPA3 migration plan using transition mode.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Choose the security model per device class, with its own VLAN.</li>
<li>WPA3 migration goes through transition mode and a client inventory.</li>
<li>OWE encrypts open guest networks; portals and posture are concept only.</li>
<li>Fast roaming (11r/k/v) is real but not simulated in the lab.</li>
<li>Hardening: AES only, long keys, rotation, two servers, certificate validation.</li>
</ul></div>
`,hi:`
<p>Mechanisms jaanna aadha kaam hai. Baaki aadha har SSID ke liye sahi mechanism chunna, safely migrate karna aur jo build kiya use harden karna hai. Yeh chapter module ko jodta hai aur un features ka preview deta hai jo real controllers par milte hain lekin lab simulate nahi karti.</p>

<h3>Har purpose ke liye ek security model</h3>
<table class="cmp"><tr><th>SSID</th><th>Users</th><th>Best choice</th><th>Kyun</th></tr>
<tr><td>NK-CORP</td><td>Managed laptops, phones</td><td>WPA2/WPA3-Enterprise, 802.1X</td><td>Per-user identity, revocation, auditing</td></tr>
<tr><td>NK-STAFF</td><td>Chhoti team, simple devices</td><td>Abhi WPA2-PSK; clients allow karein to WPA3-SAE</td><td>Aasaan, lekin keys regularly rotate karo</td></tr>
<tr><td>NK-VOICE</td><td>Handsets jinme 802.1X nahi</td><td>WPA2-PSK (ya iPSK), dedicated VLAN 30</td><td>Compatibility; device class isolate karo</td></tr>
<tr><td>NK-GUEST</td><td>Visitors</td><td>Open (ya OWE), isolated VLAN 50, web consent</td><td>Share karne ke liye credentials nahi; ACL se contain karo</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="SSID design">
<rect x="20" y="25" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="90" y="52" text-anchor="middle" class="svg-ink" font-size="12">NK-CORP</text><text x="90" y="70" text-anchor="middle" class="svg-muted" font-size="11">802.1X, VLAN 40</text>
<rect x="180" y="25" width="140" height="60" rx="10" fill="#fde68a"/><text x="250" y="52" text-anchor="middle" class="svg-ink" font-size="12">NK-STAFF</text><text x="250" y="70" text-anchor="middle" class="svg-muted" font-size="11">PSK, VLAN 20</text>
<rect x="340" y="25" width="140" height="60" rx="10" fill="#bae6fd"/><text x="410" y="52" text-anchor="middle" class="svg-ink" font-size="12">NK-VOICE</text><text x="410" y="70" text-anchor="middle" class="svg-muted" font-size="11">PSK, VLAN 30</text>
<rect x="500" y="25" width="120" height="60" rx="10" fill="#e2e8f0"/><text x="560" y="52" text-anchor="middle" class="svg-ink" font-size="12">NK-GUEST</text><text x="560" y="70" text-anchor="middle" class="svg-muted" font-size="11">Open, VLAN 50</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">Security type, VLAN aur policy har device class ke liye saath chune jaate hain</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">Zaroorat se zyada SSIDs mat chalao: har ek beacon overhead badhata hai</text>
</svg><p class="cap">Chaar SSIDs, chaar security models, chaar VLANs.</p></div>

<h3>WPA3 par safely migrate karna</h3>
<ol>
<li>Clients aur unki capabilities ki inventory banao (WPA3, PMF, SAE support).</li>
<li>Pilot SSID par <b>transition mode</b> enable karo: WPA2 aur WPA3 saath, PMF optional.</li>
<li>Dekho kaunse clients abhi bhi WPA2 se associate hote hain. Unhe replace ya upgrade karo.</li>
<li>Client list saaf hone par PMF required ke saath WPA3-only par jao. 6 GHz band waise bhi WPA3 (aur open networks ke liye OWE) maangta hai.</li>
</ol>
<p>9800 syntax mein aap hamesha ki tarah WLAN shut karke <code>security wpa wpa3</code> ke saath AKM <code>sae</code> mein badloge. Lab AKM aur shut-before-edit behaviour model karti hai, lekin PMF aur SAE exchange sirf concept hain.</p>

<h3>Guest networks aur OWE</h3>
<p>Open guest Wi-Fi mein encryption nahi hoti, to koi bhi padosi traffic capture kar sakta hai. <b>OWE</b> (Opportunistic Wireless Encryption, brand naam Enhanced Open) har client ko bina password ke apni key deta hai, to passive eavesdropping fail hoti hai jabki user experience wahi rehta hai. Guest <b>web authentication</b> portals (LWA, CWA) terms acceptance ya sponsor approval jodte hain. Portals aur OWE <b>concept only, lab mein simulated nahi</b> hain. Lab jo sikhati hai woh containment hai: guest VLAN 50 mein aur R1 par ACL jo server aur staff networks block karti hai.</p>

<h3>Fast roaming aur security</h3>
<p>802.1X client ke doosre AP par jaane par delay jodta hai, kyunki poora EAP exchange sainkdon milliseconds le sakta hai. Voice calls isse notice karti hain. <b>802.11r</b> (fast BSS transition), <b>OKC</b> aur PMK caching client ko key material reuse karne dete hain, jabki <b>802.11k</b> aur <b>802.11v</b> agla AP chunne mein madad karte hain. Yeh real exchanges <b>lab mein simulated nahi</b> hain; bas jaanna kaafi hai ki yeh exist karte hain, per WLAN negotiate hote hain, aur kuch purane clients 11r par fail ho jaate hain.</p>

<h3>Hardening checklist</h3>
<ul>
<li>Sirf WPA2-AES ya WPA3 use karo; TKIP nahi, WEP nahi.</li>
<li>Lambe random PSKs use karo aur schedule par aur staff ke jaane par rotate karo.</li>
<li>Logon ke liye 802.1X use karo; clients par server certificate validate karwao.</li>
<li>Server group mein do RADIUS servers; har server ka unique secret, 20+ random characters.</li>
<li>Controller edit karne walon ko restrict karo aur RADIUS known management address se bhejo.</li>
<li>Guest isolated rakho; authentications log karo; jahan clients support karein PMF enable karo.</li>
<li>SSID hiding ya MAC filtering ko security mat samjho.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Ek clinic mein 30 staff laptops, 12 handheld scanners (sirf WPA2) aur ek waiting room hai. Design: laptops ke liye 802.1X wala NK-CORP, scanners ke liye apne VLAN mein NK-VOICE jaisa PSK jisme ACL sirf application server tak jaati hai, aur isolated guest SSID. Scanner key saal mein do baar chapter 4 ki safe procedure se rotate hoti hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> 802.1X-capable laptops ko "aasaan hai" kehkar PSK SSID par rakhna. Ek leaked key phir laptops ke VLAN ko expose kar deti hai. Model ko device class se match karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> WPA3 transition mode "WPA3 jitna secure" nahi hai. Yeh WPA2 path rakhta hai, to attacker kamzor path ko target kar sakta hai.</p></div>

<div class="scn"><h4>Scanner SSID jo leak hua</h4><p>Ek warehouse laptops aur scanners ke liye ek hi PSK use karta tha. Ek contractor ne label se key ki photo le li. Incident ke baad company ne design split kiya: laptops 802.1X par, scanners ek alag PSK SSID par restricted VLAN mein ACL ke saath. Ab scanner key leak hone par laptops ya servers tak nahi pahunchta.</p><p><b>Lesson:</b> blast radius design choice hai. Device classes ko SSID aur VLAN se alag karo.</p></div>
<div class="iv"><p class="q">"Ek building mein staff, handsets aur guests ke liye Wi-Fi kaise secure karoge?"</p><p>Managed staff devices ke liye 802.1X, headless handsets ke liye apne VLAN mein alag PSK ya iPSK SSID, aur ACL ke saath isolated open ya OWE guest SSID. Rotation, do RADIUS servers, jahan supported ho PMF aur transition mode se WPA3 migration plan jodo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security model har device class ke liye chuno, apne VLAN ke saath.</li>
<li>WPA3 migration transition mode aur client inventory se hoti hai.</li>
<li>OWE open guest networks ko encrypt karta hai; portals aur posture concept only hain.</li>
<li>Fast roaming (11r/k/v) real hai lekin lab mein simulated nahi.</li>
<li>Hardening: sirf AES, lambi keys, rotation, do servers, certificate validation.</li>
</ul></div>
`}};export{e as default};