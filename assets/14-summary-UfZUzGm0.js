var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This chapter pulls the module together: a checklist of what you should now be able to do, a mini glossary, the facts ENCOR tests most often, and a cheat-sheet of the lab commands and GUI paths. Use it for revision the day before the exam and before a wireless interview.</p>

<h3>An analogy: the pilot's pre-flight checklist</h3>
<p>Experienced pilots still read the checklist before every flight, not because they forgot how to fly, but because missing one small item (a fuel valve, a flap setting) is what causes accidents. Wireless is the same: most outages come from one small setting (an AP mode, a radio policy, a shared secret, a VLAN mapping). A checklist catches them.</p>

<h3>Can-do checklist</h3>
<ul>
<li>I can convert mW to dBm with the rule of 3s and 10s, and calculate a link budget and SNR.</li>
<li>I can calculate EIRP and choose omni, patch, sector, Yagi or dish antennas for a space.</li>
<li>I can list the 5 GHz UNII sub-bands, explain DFS and 6 GHz rules, and choose a channel width.</li>
<li>I can explain CCI, ACI and non-Wi-Fi interference and what DCA, TPC and CHD do.</li>
<li>I can explain OFDMA, MU-MIMO, BSS colouring, TWT and MLO, and why client capabilities decide the result.</li>
<li>I can compare centralised, FlexConnect, embedded, cloud and SD-Access fabric deployments, and all AP modes.</li>
<li>I can walk an AP through Discovery, DTLS, Join, Image, Configure and RUN, and give the WLC selection order.</li>
<li>I can explain intra-controller, L2 and L3 inter-controller roaming, anchor/foreign and guest anchor.</li>
<li>I can describe the four EAPOL messages and the PMK/PTK/GTK hierarchy, SAE, PMF and OWE.</li>
<li>I can configure PSK, SAE transition mode, WPA3-Enterprise with RADIUS, and explain LWA and CWA.</li>
<li>I can compare PMK caching, OKC and 802.11r.</li>
<li>I can explain RSSI, fingerprinting, AoA, TDoA and FastLocate location and their use cases.</li>
<li>I can build a WLAN with a WLAN profile, a policy profile and a policy tag in the web UI and the CLI, and explain what an untagged AP does.</li>
<li>I can troubleshoot a client from the GUI by finding the stage where it stops, and I solved both labs.</li></ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Revision map">
<rect x="10" y="20" width="140" height="50" rx="8" fill="#fde68a"/><text x="80" y="42" text-anchor="middle" class="svg-ink" font-size="13">RF: dBm, EIRP,</text><text x="80" y="60" text-anchor="middle" class="svg-ink" font-size="13">SNR, channels</text>
<rect x="170" y="20" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="240" y="42" text-anchor="middle" class="svg-ink" font-size="13">Models, modes,</text><text x="240" y="60" text-anchor="middle" class="svg-ink" font-size="13">AP join</text>
<rect x="330" y="20" width="140" height="50" rx="8" fill="#fed7aa"/><text x="400" y="42" text-anchor="middle" class="svg-ink" font-size="13">Roaming,</text><text x="400" y="60" text-anchor="middle" class="svg-ink" font-size="13">anchor/foreign</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="13">Security: EAPOL,</text><text x="560" y="60" text-anchor="middle" class="svg-ink" font-size="13">SAE, 802.1X</text>
<rect x="170" y="100" width="300" height="50" rx="8" fill="#bae6fd"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="13">Location + GUI troubleshooting</text><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">(the stage where the client stops)</text>
<line x1="80" y1="70" x2="250" y2="100" stroke="#64748b"/><line x1="240" y1="70" x2="300" y2="100" stroke="#64748b"/><line x1="400" y1="70" x2="340" y2="100" stroke="#64748b"/><line x1="560" y1="70" x2="390" y2="100" stroke="#64748b"/>
</svg><p class="cap">Everything feeds troubleshooting: you cannot fix what you cannot explain.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>dBm / dBi</dt><dd>Power relative to 1 mW / antenna gain relative to isotropic.</dd>
<dt>EIRP</dt><dd>Tx power − cable loss + antenna gain.</dd>
<dt>SNR</dt><dd>RSSI − noise floor, in dB.</dd>
<dt>DFS</dt><dd>Radar detection on UNII-2 and UNII-2e channels.</dd>
<dt>OFDMA / RU</dt><dd>Splitting a channel into resource units for several clients at once.</dd>
<dt>BSS colouring</dt><dd>Wi-Fi 6 marking that allows spatial reuse between overlapping BSSs.</dd>
<dt>FlexConnect</dt><dd>AP mode with local switching and survival when the WLC is unreachable.</dd>
<dt>Anchor / foreign</dt><dd>Original / new controller in a Layer 3 roam.</dd>
<dt>PMK / PTK / GTK</dt><dd>Master key / per-session unicast key / group key.</dd>
<dt>SAE</dt><dd>WPA3-Personal password exchange, resistant to offline attacks.</dd>
<dt>OWE</dt><dd>Enhanced Open: encryption without authentication.</dd>
<dt>OKC / FT</dt><dd>PMK shared across APs / 802.11r fast transition.</dd>
<dt>CWA / CoA</dt><dd>Central web auth on ISE / change of authorization after login.</dd>
<dt>NMSP</dt><dd>Protocol carrying location data from the WLC to CMX or Cisco Spaces.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Rule of 3s and 10s</td><td>+3 dB ×2, +10 dB ×10; 20 dBm = 100 mW; 30 dBm = 1 W</td></tr>
<tr><td>Design targets</td><td>Voice: −67 dBm, SNR 25 dB; location: 3+ APs at −75 dBm</td></tr>
<tr><td>dBd to dBi</td><td>+2.14</td></tr>
<tr><td>DFS</td><td>Channels 52–144 (UNII-2 and 2e)</td></tr>
<tr><td>CAPWAP</td><td>UDP 5246 control (DTLS), 5247 data; echo every 30 s</td></tr>
<tr><td>WLC selection</td><td>Primary, secondary, tertiary, then least loaded; a master controller exists on AireOS only (the exam still lists it)</td></tr>
<tr><td>9800 objects</td><td>WLAN profile (SSID, security) + policy profile (VLAN) joined by a policy tag, tag set on the AP; no tag = default tags = no SSID</td></tr>
<tr><td>Option 43</td><td>f1, length 4 × number of WLCs, addresses in hex</td></tr>
<tr><td>Mobility</td><td>UDP 16666 control, 16667 data; up to 24 WLCs per group</td></tr>
<tr><td>L3 roam</td><td>Client keeps IP; anchor = original, foreign = new; symmetric tunnel</td></tr>
<tr><td>4-way handshake</td><td>M1 ANonce, M2 SNonce+MIC, M3 GTK+MIC, M4 ack</td></tr>
<tr><td>WPA3</td><td>SAE, PMF mandatory, forward secrecy; 6 GHz requires WPA3/OWE</td></tr>
<tr><td>RADIUS</td><td>UDP 1812 auth, 1813 accounting; CoA 1700 (Cisco) / 3799</td></tr>
<tr><td>Location</td><td>AoA 1–3 m, RSSI 5–10 m, FastLocate uses data packets</td></tr></table>

<h3>Command and GUI cheat-sheet (lab controller)</h3>
<pre class="code"><span class="c">! WLAN, policy, tags (GUI: Configuration &gt; Tags &amp; Profiles &gt; WLANs | Policy | Tags)</span>
wlan &lt;profile&gt; &lt;id&gt; &lt;ssid&gt;
 security wpa wpa3 | security wpa akm sae | security wpa akm psk
 security wpa psk set-key ascii 0 &lt;key&gt;
 security pmf optional | mandatory
 security dot1x authentication-list &lt;list&gt;
 shutdown | no shutdown          <span class="c">! disable before security edits</span>
wireless profile policy &lt;name&gt; ; vlan &lt;n&gt; ; no shutdown
wireless tag policy &lt;name&gt; ; wlan &lt;wlan&gt; policy &lt;policy&gt;
ap name &lt;ap&gt; policy-tag &lt;tag&gt;
<span class="c">! AAA (GUI: Configuration &gt; Security &gt; AAA)</span>
radius server &lt;n&gt; ; address ipv4 &lt;ip&gt; auth-port 1812 acct-port 1813 ; key 0 &lt;secret&gt;
aaa new-model ; aaa group server radius &lt;g&gt; ; server name &lt;n&gt;
aaa authentication dot1x &lt;list&gt; group &lt;g&gt;
<span class="c">! AP mode and radios (GUI: Configuration &gt; Wireless &gt; Access Points)</span>
ap name &lt;ap&gt; mode local | monitor | sniffer
ap name &lt;ap&gt; dot11 5ghz channel &lt;n&gt; ; ap name &lt;ap&gt; dot11 5ghz txpower &lt;1-8&gt;
<span class="c">! Verification (GUI: Monitoring &gt; Wireless, Troubleshooting &gt; Logs)</span>
show wlan summary | show wlan name &lt;profile&gt; | show ap summary | show ap tag summary
show ap name &lt;ap&gt; config general | show wireless client summary
show wireless client mac-address &lt;mac&gt; detail | show aaa servers | show logging
AP1&gt; show capwap      LAPTOP1&gt; wifi status      RAD1&gt; aaa-server show log</pre>

<div class="note"><p><b>Where to go next (ccnp-wireless course).</b> This module stays at ENCOR scope. Concept-only items here are practised in: <b>wl-start</b> (Wireless from zero) and <b>wl-security</b> (Wireless identity and trust) for the 9800 basics and PSK/802.1X; <b>wl-rf</b> (RF design and survey evidence) and <b>wl-design</b> (Wireless site survey and design) for RF and RRM depth; <b>wl-control</b> (Catalyst 9800 control and AP join) for CAPWAP join; <b>wl-roaming</b> (Roaming, tags and segmentation) and <b>wl-mobility</b> (Roaming, mobility and anchoring) for roaming; <b>wl-flex</b> (FlexConnect and branch design); <b>wl-secure</b> (Advanced wireless security) for web auth, ISE, PMF, WPA3 details; <b>wl-qos</b> (QoS, AVC and multicast); <b>wl-ops</b> (Wireless operations and troubleshooting) and <b>wl-diag</b> (Wireless troubleshooting like a CCIE) for troubleshooting; <b>wl-auto</b> (Wireless automation and Spaces) for Catalyst Center (formerly DNA Center), Cisco Spaces and programmability.</p></div>

<div class="eg"><p><b>Worked example: a five-line exam answer.</b> "A voice client roams between two controllers on different subnets and calls drop." Answer: the WLCs must be mobility peers in the same group (UDP 16666/16667 open, same WLAN and virtual IP) so the client keeps its IP with the original WLC as anchor; enable OKC or 802.11r so the roam avoids full 802.1X; check RSSI at the roaming point is about −67 dBm with 25 dB SNR.</p></div>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Mixing up dBi and dBm; saying the AP decides to roam; saying OWE authenticates; putting DFS on 36–48; calling a monitor-mode AP "serving"; treating a RADIUS timeout as a wrong password.</p></div>

<div class="exam"><p><b>Exam traps recap.</b> GUI screenshots: read the client state first. L3 roam keeps the IP. SAE replaces open authentication, not the 4-way handshake. Selection order starts with primary/secondary/tertiary (master controller is AireOS only). FastLocate uses data packets. TPC lowers power, CHD raises it.</p></div>

<div class="scn"><h4>The pre-audit walk-through</h4><p>Before a security audit, an engineer used this checklist on a 400-AP campus. She found three APs still in sniffer mode from an old investigation, one WLAN in WPA2/WPA3 transition mode with PMF disabled, and a guest anchor whose firewall rule for UDP 16667 had been removed (guests could associate but not pass traffic). All three were fixed in an hour, and the audit passed without findings on wireless.</p><p><b>Lesson:</b> the summary is not just revision; it is an operational checklist for real networks.</p></div>

<div class="iv"><p class="q">"Summarise how you would design a secure, roam-friendly enterprise WLAN."</p><p>Strong answer: survey for −67 dBm and 25 dB SNR with 20/40 MHz channels on 5 GHz and 6 GHz where clients support it; RRM for channels and power; centralised controllers in an SSO pair with FlexConnect at branches; WPA3-Enterprise (or transition during migration) with EAP-TLS or PEAP, PMF, OKC/802.11r and 802.11k/v; guest on OWE or open with CWA, anchored in the DMZ; monitor-mode APs for wIPS and location; and assurance plus GUI troubleshooting workflows for operations.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RF numbers (dBm, EIRP, SNR) explain most user complaints.</li>
<li>Deployment model and AP mode are per-site design choices.</li>
<li>Know the CAPWAP join states, WLC selection order and roaming types by heart.</li>
<li>Security: 4-way handshake, SAE, PMF, OWE, 802.1X methods, WebAuth, fast roaming.</li>
<li>Troubleshoot by finding the stage where the client stops, using the controller GUI.</li>
</ul></div>
`,hi:`
<p>Yeh chapter module ko ek saath laata hai: ab aapko kya kar paana chahiye uski checklist, mini glossary, ENCOR sabse zyada kya test karta hai woh facts, aur lab commands aur GUI paths ki cheat-sheet. Exam se ek din pehle aur wireless interview se pehle revision ke liye use karo.</p>

<h3>Ek analogy: pilot ki pre-flight checklist</h3>
<p>Experienced pilots bhi har flight se pehle checklist padhte hain, isliye nahi ki udna bhool gaye, balki isliye ki ek chhoti cheez (fuel valve, flap setting) miss karna hi accidents ki wajah banta hai. Wireless bhi aisa hi hai: zyada tar outages ek chhoti setting se aate hain (AP mode, radio policy, shared secret, VLAN mapping). Checklist unhe pakad leti hai.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Main 3s aur 10s ke rule se mW ko dBm mein badal sakta hoon, aur link budget aur SNR calculate kar sakta hoon.</li>
<li>Main EIRP calculate kar sakta hoon aur kisi space ke liye omni, patch, sector, Yagi ya dish antenna chun sakta hoon.</li>
<li>Main 5 GHz UNII sub-bands list kar sakta hoon, DFS aur 6 GHz rules samjha sakta hoon, aur channel width chun sakta hoon.</li>
<li>Main CCI, ACI aur non-Wi-Fi interference, aur DCA, TPC aur CHD kya karte hain, samjha sakta hoon.</li>
<li>Main OFDMA, MU-MIMO, BSS colouring, TWT aur MLO samjha sakta hoon, aur kyun client capabilities result tay karti hain.</li>
<li>Main centralised, FlexConnect, embedded, cloud aur SD-Access fabric deployments, aur saare AP modes compare kar sakta hoon.</li>
<li>Main AP ko Discovery, DTLS, Join, Image, Configure aur RUN se guzaar sakta hoon, aur WLC selection order bata sakta hoon.</li>
<li>Main intra-controller, L2 aur L3 inter-controller roaming, anchor/foreign aur guest anchor samjha sakta hoon.</li>
<li>Main chaar EAPOL messages aur PMK/PTK/GTK hierarchy, SAE, PMF aur OWE describe kar sakta hoon.</li>
<li>Main PSK, SAE transition mode, RADIUS ke saath WPA3-Enterprise configure kar sakta hoon, aur LWA aur CWA samjha sakta hoon.</li>
<li>Main PMK caching, OKC aur 802.11r compare kar sakta hoon.</li>
<li>Main RSSI, fingerprinting, AoA, TDoA aur FastLocate location aur unke use cases samjha sakta hoon.</li>
<li>Main web UI aur CLI dono mein WLAN profile, policy profile aur policy tag se WLAN bana sakta hoon, aur samjha sakta hoon ki tag-less AP kya karta hai.</li>
<li>Main GUI se client ko us stage ko dhoondh kar troubleshoot kar sakta hoon jahan woh rukta hai, aur maine dono labs solve ki.</li></ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Revision map">
<rect x="10" y="20" width="140" height="50" rx="8" fill="#fde68a"/><text x="80" y="42" text-anchor="middle" class="svg-ink" font-size="13">RF: dBm, EIRP,</text><text x="80" y="60" text-anchor="middle" class="svg-ink" font-size="13">SNR, channels</text>
<rect x="170" y="20" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="240" y="42" text-anchor="middle" class="svg-ink" font-size="13">Models, modes,</text><text x="240" y="60" text-anchor="middle" class="svg-ink" font-size="13">AP join</text>
<rect x="330" y="20" width="140" height="50" rx="8" fill="#fed7aa"/><text x="400" y="42" text-anchor="middle" class="svg-ink" font-size="13">Roaming,</text><text x="400" y="60" text-anchor="middle" class="svg-ink" font-size="13">anchor/foreign</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="13">Security: EAPOL,</text><text x="560" y="60" text-anchor="middle" class="svg-ink" font-size="13">SAE, 802.1X</text>
<rect x="170" y="100" width="300" height="50" rx="8" fill="#bae6fd"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="13">Location + GUI troubleshooting</text><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">(jis stage par client rukta hai)</text>
<line x1="80" y1="70" x2="250" y2="100" stroke="#64748b"/><line x1="240" y1="70" x2="300" y2="100" stroke="#64748b"/><line x1="400" y1="70" x2="340" y2="100" stroke="#64748b"/><line x1="560" y1="70" x2="390" y2="100" stroke="#64748b"/>
</svg><p class="cap">Sab kuch troubleshooting ko feed karta hai: jo samjha nahi sakte use theek nahi kar sakte.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>dBm / dBi</dt><dd>1 mW ke relative power / isotropic ke relative antenna gain.</dd>
<dt>EIRP</dt><dd>Tx power − cable loss + antenna gain.</dd>
<dt>SNR</dt><dd>RSSI − noise floor, dB mein.</dd>
<dt>DFS</dt><dd>UNII-2 aur UNII-2e channels par radar detection.</dd>
<dt>OFDMA / RU</dt><dd>Channel ko resource units mein baantna taaki ek saath kai clients serve hon.</dd>
<dt>BSS colouring</dt><dd>Wi-Fi 6 marking jo overlapping BSSs ke beech spatial reuse allow karti hai.</dd>
<dt>FlexConnect</dt><dd>Local switching aur WLC unreachable hone par survive karne wala AP mode.</dd>
<dt>Anchor / foreign</dt><dd>Layer 3 roam mein original / naya controller.</dd>
<dt>PMK / PTK / GTK</dt><dd>Master key / har session ki unicast key / group key.</dd>
<dt>SAE</dt><dd>WPA3-Personal password exchange, offline attacks se surakshit.</dd>
<dt>OWE</dt><dd>Enhanced Open: authentication ke bina encryption.</dd>
<dt>OKC / FT</dt><dd>APs mein shared PMK / 802.11r fast transition.</dd>
<dt>CWA / CoA</dt><dd>ISE par central web auth / login ke baad change of authorization.</dd>
<dt>NMSP</dt><dd>Protocol jo location data WLC se CMX ya Cisco Spaces tak le jaata hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>3s aur 10s ka rule</td><td>+3 dB ×2, +10 dB ×10; 20 dBm = 100 mW; 30 dBm = 1 W</td></tr>
<tr><td>Design targets</td><td>Voice: −67 dBm, SNR 25 dB; location: 3+ APs −75 dBm par</td></tr>
<tr><td>dBd se dBi</td><td>+2.14</td></tr>
<tr><td>DFS</td><td>Channels 52–144 (UNII-2 aur 2e)</td></tr>
<tr><td>CAPWAP</td><td>UDP 5246 control (DTLS), 5247 data; har 30 s echo</td></tr>
<tr><td>WLC selection</td><td>Primary, secondary, tertiary, phir least loaded; master controller sirf AireOS mein hota hai (exam ise abhi bhi list karta hai)</td></tr>
<tr><td>9800 objects</td><td>WLAN profile (SSID, security) + policy profile (VLAN) ko policy tag jodta hai, tag AP par lagta hai; tag nahi = default tags = koi SSID nahi</td></tr>
<tr><td>Option 43</td><td>f1, length 4 × WLCs ki sankhya, hex mein addresses</td></tr>
<tr><td>Mobility</td><td>UDP 16666 control, 16667 data; har group mein 24 WLCs tak</td></tr>
<tr><td>L3 roam</td><td>Client IP rakhta hai; anchor = original, foreign = naya; symmetric tunnel</td></tr>
<tr><td>4-way handshake</td><td>M1 ANonce, M2 SNonce+MIC, M3 GTK+MIC, M4 ack</td></tr>
<tr><td>WPA3</td><td>SAE, PMF zaroori, forward secrecy; 6 GHz ko WPA3/OWE chahiye</td></tr>
<tr><td>RADIUS</td><td>UDP 1812 auth, 1813 accounting; CoA 1700 (Cisco) / 3799</td></tr>
<tr><td>Location</td><td>AoA 1–3 m, RSSI 5–10 m, FastLocate data packets use karta hai</td></tr></table>

<h3>Command aur GUI cheat-sheet (lab controller)</h3>
<pre class="code"><span class="c">! WLAN, policy, tags (GUI: Configuration &gt; Tags &amp; Profiles &gt; WLANs | Policy | Tags)</span>
wlan &lt;profile&gt; &lt;id&gt; &lt;ssid&gt;
 security wpa wpa3 | security wpa akm sae | security wpa akm psk
 security wpa psk set-key ascii 0 &lt;key&gt;
 security pmf optional | mandatory
 security dot1x authentication-list &lt;list&gt;
 shutdown | no shutdown          <span class="c">! security edit se pehle disable karo</span>
wireless profile policy &lt;name&gt; ; vlan &lt;n&gt; ; no shutdown
wireless tag policy &lt;name&gt; ; wlan &lt;wlan&gt; policy &lt;policy&gt;
ap name &lt;ap&gt; policy-tag &lt;tag&gt;
<span class="c">! AAA (GUI: Configuration &gt; Security &gt; AAA)</span>
radius server &lt;n&gt; ; address ipv4 &lt;ip&gt; auth-port 1812 acct-port 1813 ; key 0 &lt;secret&gt;
aaa new-model ; aaa group server radius &lt;g&gt; ; server name &lt;n&gt;
aaa authentication dot1x &lt;list&gt; group &lt;g&gt;
<span class="c">! AP mode and radios (GUI: Configuration &gt; Wireless &gt; Access Points)</span>
ap name &lt;ap&gt; mode local | monitor | sniffer
ap name &lt;ap&gt; dot11 5ghz channel &lt;n&gt; ; ap name &lt;ap&gt; dot11 5ghz txpower &lt;1-8&gt;
<span class="c">! Verification (GUI: Monitoring &gt; Wireless, Troubleshooting &gt; Logs)</span>
show wlan summary | show wlan name &lt;profile&gt; | show ap summary | show ap tag summary
show ap name &lt;ap&gt; config general | show wireless client summary
show wireless client mac-address &lt;mac&gt; detail | show aaa servers | show logging
AP1&gt; show capwap      LAPTOP1&gt; wifi status      RAD1&gt; aaa-server show log</pre>

<div class="note"><p><b>Aage kahan jaana hai (ccnp-wireless course).</b> Yeh module ENCOR scope par rehta hai. Yahan ke concept-only items inmein practise hote hain: <b>wl-start</b> (Wireless from zero) aur <b>wl-security</b> (Wireless identity and trust) 9800 basics aur PSK/802.1X ke liye; <b>wl-rf</b> (RF design and survey evidence) aur <b>wl-design</b> (Wireless site survey and design) RF aur RRM depth ke liye; <b>wl-control</b> (Catalyst 9800 control and AP join) CAPWAP join ke liye; <b>wl-roaming</b> (Roaming, tags and segmentation) aur <b>wl-mobility</b> (Roaming, mobility and anchoring) roaming ke liye; <b>wl-flex</b> (FlexConnect and branch design); <b>wl-secure</b> (Advanced wireless security) web auth, ISE, PMF, WPA3 details ke liye; <b>wl-qos</b> (QoS, AVC and multicast); <b>wl-ops</b> (Wireless operations and troubleshooting) aur <b>wl-diag</b> (Wireless troubleshooting like a CCIE) troubleshooting ke liye; <b>wl-auto</b> (Wireless automation and Spaces) Catalyst Center (pehle DNA Center), Cisco Spaces aur programmability ke liye.</p></div>

<div class="eg"><p><b>Worked example: paanch line ka exam answer.</b> "Ek voice client alag subnets wale do controllers ke beech roam karta hai aur calls drop hoti hain." Answer: WLCs same group mein mobility peers hone chahiye (UDP 16666/16667 khule, same WLAN aur virtual IP) taaki original WLC anchor ho aur client apna IP rakhe; OKC ya 802.11r enable karo taaki roam poore 802.1X se bache; check karo ki roaming point par RSSI lagbhag −67 dBm aur SNR 25 dB ho.</p></div>

<div class="warn"><p><b>Aakhri minute ki galtiyan jinse bachna hai.</b> dBi aur dBm mila dena; kehna ki roam ka faisla AP karta hai; kehna ki OWE authenticate karta hai; DFS ko 36–48 par lagana; monitor-mode AP ko "serving" kehna; RADIUS timeout ko galat password samajhna.</p></div>

<div class="exam"><p><b>Exam traps recap.</b> GUI screenshots: pehle client state padho. L3 roam IP rakhta hai. SAE open authentication ki jagah leta hai, 4-way handshake ki nahi. Selection order primary/secondary/tertiary se shuru hota hai (master controller sirf AireOS mein). FastLocate data packets use karta hai. TPC power ghatata hai, CHD badhata hai.</p></div>

<div class="scn"><h4>Audit se pehle ka walk-through</h4><p>Security audit se pehle ek engineer ne 400-AP campus par yeh checklist chalayi. Use teen APs mile jo ek purani investigation se abhi bhi sniffer mode mein the, ek WLAN WPA2/WPA3 transition mode mein PMF disabled ke saath, aur ek guest anchor jiska UDP 16667 wala firewall rule hata diya gaya tha (guests associate to kar paate the par traffic nahi). Teeno ek ghante mein theek hue, aur audit wireless par bina findings ke pass hua.</p><p><b>Lesson:</b> summary sirf revision nahi; yeh real networks ke liye operational checklist hai.</p></div>

<div class="iv"><p class="q">"Secure, roam-friendly enterprise WLAN kaise design karoge, summarise karo."</p><p>Strong answer: −67 dBm aur 25 dB SNR ke liye survey, 5 GHz par 20/40 MHz channels aur jahan clients support karein wahan 6 GHz; channels aur power ke liye RRM; SSO pair mein centralised controllers aur branches par FlexConnect; EAP-TLS ya PEAP, PMF, OKC/802.11r aur 802.11k/v ke saath WPA3-Enterprise (ya migration ke dauraan transition); guest OWE ya CWA wale open par, DMZ mein anchored; wIPS aur location ke liye monitor-mode APs; aur operations ke liye assurance plus GUI troubleshooting workflows.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RF numbers (dBm, EIRP, SNR) zyada tar user complaints samjhate hain.</li>
<li>Deployment model aur AP mode har site ke design choices hain.</li>
<li>CAPWAP join states, WLC selection order aur roaming types zubaani yaad rakho.</li>
<li>Security: 4-way handshake, SAE, PMF, OWE, 802.1X methods, WebAuth, fast roaming.</li>
<li>Controller GUI se us stage ko dhoondh kar troubleshoot karo jahan client rukta hai.</li>
</ul></div>
`}};export{e as default};