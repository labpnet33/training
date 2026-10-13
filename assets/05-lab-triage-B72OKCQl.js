var e={id:`lab-triage`,h:{en:`Lab walkthrough: voice handsets cannot connect (wl-ops-triage)`,hi:`Lab walkthrough: voice handsets connect nahi ho rahe (wl-ops-triage)`},body:{en:`
<p>Now we apply the method. The lab <b>wl-ops-triage</b> gives you a typical ticket: a new SSID exists, the phones cannot see it, and staff Wi-Fi must stay untouched.</p>
<div class="eg"><p><b>Ticket.</b> The NK-VOICE WLAN (WPA2-PSK, key NkVoice2024) was added for handsets on VLAN 30. PHONE1 does not see it. Walk the chain WLAN, policy profile, policy tag, AP and fix every missing link. Staff Wi-Fi must keep working.</p></div>
<h3>Step 0: symptom and scope</h3>
<p>The phone sees no NK-VOICE, but LAPTOP1 is still happy on NK-STAFF. So the controller and APs work; the problem is specific to one SSID. By the scope table, suspect the WLC layer for that SSID: WLAN, policy profile or policy tag map.</p>
<h3>Step 1: the chain on the 9800</h3>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Broadcast chain">
<rect x="10" y="40" width="120" height="70" rx="8" fill="#bae6fd"/><text x="70" y="68" text-anchor="middle" class="svg-ink" font-size="13">WLAN profile</text><text x="70" y="88" text-anchor="middle" class="svg-muted" font-size="11">NK-VOICE id 4</text>
<rect x="165" y="40" width="130" height="70" rx="8" fill="#ddd6fe"/><text x="230" y="68" text-anchor="middle" class="svg-ink" font-size="13">Policy tag map</text><text x="230" y="88" text-anchor="middle" class="svg-muted" font-size="11">PT-CAMPUS</text>
<rect x="330" y="40" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="395" y="68" text-anchor="middle" class="svg-ink" font-size="13">Policy profile</text><text x="395" y="88" text-anchor="middle" class="svg-muted" font-size="11">PP-VOICE VLAN 30</text>
<rect x="495" y="40" width="135" height="70" rx="8" fill="#fde68a"/><text x="562" y="68" text-anchor="middle" class="svg-ink" font-size="13">AP tag</text><text x="562" y="88" text-anchor="middle" class="svg-muted" font-size="11">AP1 AP2 = PT-CAMPUS</text>
<line x1="130" y1="75" x2="165" y2="75" stroke="#64748b"/><line x1="295" y1="75" x2="330" y2="75" stroke="#64748b"/><line x1="460" y1="75" x2="495" y2="75" stroke="#64748b"/>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Every link must be enabled and present for the SSID to broadcast.</text>
</svg><p class="cap">The four links checked in this lab, from WLAN to AP.</p></div>
<h3>Step 2: evidence, read-only</h3>
<pre class="code">WLC1# show wlan summary
WLC1# show wireless tag policy detailed PT-CAMPUS
WLC1# show wireless profile policy detailed PP-VOICE
WLC1# show ap tag summary</pre>
<pre class="out">WLC1# show wireless tag policy detailed PT-CAMPUS

Policy Tag Name   : PT-CAMPUS
Description       :
Number of WLAN-POLICY maps: 1

WLAN Profile Name                  Policy Name
NK-STAFF                           PP-STAFF

WLC1# show wireless profile policy detailed PP-VOICE

Policy Profile Name              : PP-VOICE
Status                           : <span class="hl">DISABLED</span>
VLAN                             : 30
Central Switching                : ENABLED</pre>
<p>Two broken links appear at once. The policy tag has only one map (NK-STAFF); there is <b>no map for NK-VOICE</b>. And <b>PP-VOICE is DISABLED</b> because a new policy profile starts shut down. The APs already carry PT-CAMPUS (<code>show ap tag summary</code> shows Static), so the AP link is fine, and VLAN 30 exists. Notice how a single missing link is not enough to describe this ticket: you must walk the whole chain, as the task says, and fix every missing link.</p>
<h3>Step 3: the smallest correct change</h3>
<pre class="code">WLC1# configure terminal
WLC1(config)# wireless profile policy PP-VOICE
WLC1(config-wireless-policy)# no shutdown
WLC1(config-wireless-policy)# exit
WLC1(config)# wireless tag policy PT-CAMPUS
WLC1(config-policy-tag)# wlan NK-VOICE policy PP-VOICE
WLC1(config-policy-tag)# end
WLC1# write memory</pre>
<p>We do not recreate the WLAN, we do not touch PT-CAMPUS entries for NK-STAFF, and we do not change the APs. The policy tag is shared by every AP, so adding a map takes effect on both APs without any AP edit.</p>
<h3>Step 4: prove it</h3>
<pre class="code">PHONE1&gt; wifi connect NK-VOICE psk NkVoice2024
PHONE1&gt; wifi status
LAPTOP1&gt; wifi status</pre>
<pre class="out">PHONE1&gt; wifi status
SSID        : NK-VOICE
BSSID       : 00:50:42:a6:98:12
AP          : AP1
Band/channel: 5 GHz / 36
Signal      : -55 dBm
Security    : WPA2-Personal (PSK)
IP address  : 10.10.30.<span class="hl">11</span>/24 (DHCP)

LAPTOP1&gt; wifi status
SSID        : NK-STAFF
Security    : WPA2-Personal (PSK)
IP address  : 10.10.20.<span class="hl">11</span>/24 (DHCP)</pre>
<p>PHONE1 is in the VOICE subnet 10.10.30.0/24 and LAPTOP1 is still in STAFF 10.10.20.0/24. The exact wording of the status line in your lab may differ; what matters is the SSID, the subnet and the VLAN.</p>
<h3>Why the 9800 starts everything disabled</h3>
<p>A new WLAN, policy profile, RF profile or tag starts shut down or empty. This is deliberate: you build a complete object, then enable it, so clients never meet half-built service. The cost is that "configured but not enabled" is the most common operations fault. After building anything, read it back with the detailed show command and check the Status line.</p>
<table class="cmp"><tr><th>Symptom in the lab</th><th>Evidence</th><th>Fix</th></tr>
<tr><td>SSID not seen</td><td>No map for the WLAN in the policy tag detail</td><td><code>wlan NK-VOICE policy PP-VOICE</code> under the policy tag</td></tr>
<tr><td>SSID not seen</td><td>Policy profile Status DISABLED</td><td><code>no shutdown</code> under the policy profile</td></tr>
<tr><td>SSID not seen on one AP</td><td>Tag Source Default for that AP</td><td><code>ap name AP2 policy-tag PT-CAMPUS</code></td></tr>
<tr><td>Seen but no IP</td><td>VLAN (NOT IN VLAN DATABASE)</td><td><code>vlan 30</code> / <code>name VOICE</code></td></tr>
</table>
<div class="warn"><p><b>Common mistakes.</b> (1) Fixing only the policy profile and testing; the SSID still does not appear because the map is missing. (2) Editing the WLAN security while the WLAN is enabled; the 9800 requires shutdown first. (3) Forgetting <code>write memory</code>, so the next reload brings the broken state back.</p></div>
<div class="exam"><p><b>Exam trap.</b> A WLAN profile alone broadcasts nothing. It needs a policy tag map, an enabled policy profile and an AP carrying that tag.</p></div>
<div class="scn"><h4>The voice rollout that went quiet</h4><p>A retailer added a voice SSID before opening a warehouse. The installer built the WLAN and policy profile and went home. On opening morning the handsets could not find the network. The shift lead followed the chain: map missing, profile disabled. Two commands later the handsets registered. The post-incident checklist now includes "read back Status and map after every build".</p><p><b>Lesson:</b> build, enable, map, tag, then verify with a real client.</p></div>
<div class="iv"><p class="q">"A new SSID is configured but invisible. What do you check?"</p><p>WLAN enabled, policy tag map present, policy profile enabled with an existing VLAN, APs carrying that policy tag, and radios serving. Mention the default-policy-tag behaviour and the fact that new objects start shut.</p></div>
<div class="tip"><p><b>Doing it in the web UI.</b> Inspect and edit the map in <b>Configuration &gt; Tags &amp; Profiles &gt; Tags &gt; Policy</b>, enable PP-VOICE in <b>Configuration &gt; Tags &amp; Profiles &gt; Policy</b> (<b>Status</b>), then confirm both phones and laptops in <b>Monitoring &gt; Wireless &gt; Clients</b>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Walk WLAN, policy tag map, policy profile, AP tag, in that chain.</li>
<li>New profiles start DISABLED; enable them explicitly.</li>
<li>The lab has two missing links: PP-VOICE disabled and the map absent.</li>
<li>Adding a map to the shared policy tag reaches every tagged AP.</li>
<li>Prove with PHONE1 in VLAN 30 and LAPTOP1 still in VLAN 20.</li>
</ul></div>
`,hi:`
<p>Ab hum method lagate hain. Lab <b>wl-ops-triage</b> ek typical ticket deta hai: naya SSID maujood hai, phones ko dikhta nahi, aur staff Wi-Fi ko chhuna nahi hai.</p>
<div class="eg"><p><b>Ticket.</b> NK-VOICE WLAN (WPA2-PSK, key NkVoice2024) VLAN 30 ke handsets ke liye add hua. PHONE1 ko dikhta nahi. Chain WLAN, policy profile, policy tag, AP walk karo aur har missing link fix karo. Staff Wi-Fi chalta rehna chahiye.</p></div>
<h3>Step 0: symptom aur scope</h3>
<p>Phone ko NK-VOICE nahi dikhta, lekin LAPTOP1 NK-STAFF par khush hai. Matlab controller aur APs kaam karte hain; problem ek SSID tak seemit hai. Scope table ke hisaab se us SSID ke liye WLC layer suspect karo: WLAN, policy profile ya policy tag map.</p>
<h3>Step 1: 9800 par chain</h3>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Broadcast chain">
<rect x="10" y="40" width="120" height="70" rx="8" fill="#bae6fd"/><text x="70" y="68" text-anchor="middle" class="svg-ink" font-size="13">WLAN profile</text><text x="70" y="88" text-anchor="middle" class="svg-muted" font-size="11">NK-VOICE id 4</text>
<rect x="165" y="40" width="130" height="70" rx="8" fill="#ddd6fe"/><text x="230" y="68" text-anchor="middle" class="svg-ink" font-size="13">Policy tag map</text><text x="230" y="88" text-anchor="middle" class="svg-muted" font-size="11">PT-CAMPUS</text>
<rect x="330" y="40" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="395" y="68" text-anchor="middle" class="svg-ink" font-size="13">Policy profile</text><text x="395" y="88" text-anchor="middle" class="svg-muted" font-size="11">PP-VOICE VLAN 30</text>
<rect x="495" y="40" width="135" height="70" rx="8" fill="#fde68a"/><text x="562" y="68" text-anchor="middle" class="svg-ink" font-size="13">AP tag</text><text x="562" y="88" text-anchor="middle" class="svg-muted" font-size="11">AP1 AP2 = PT-CAMPUS</text>
<line x1="130" y1="75" x2="165" y2="75" stroke="#64748b"/><line x1="295" y1="75" x2="330" y2="75" stroke="#64748b"/><line x1="460" y1="75" x2="495" y2="75" stroke="#64748b"/>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">SSID broadcast ke liye har link enabled aur present hona chahiye.</text>
</svg><p class="cap">Is lab mein check hone wale chaar links, WLAN se AP tak.</p></div>
<h3>Step 2: evidence, read-only</h3>
<pre class="code">WLC1# show wlan summary
WLC1# show wireless tag policy detailed PT-CAMPUS
WLC1# show wireless profile policy detailed PP-VOICE
WLC1# show ap tag summary</pre>
<pre class="out">WLC1# show wireless tag policy detailed PT-CAMPUS

Policy Tag Name   : PT-CAMPUS
Description       :
Number of WLAN-POLICY maps: 1

WLAN Profile Name                  Policy Name
NK-STAFF                           PP-STAFF

WLC1# show wireless profile policy detailed PP-VOICE

Policy Profile Name              : PP-VOICE
Status                           : <span class="hl">DISABLED</span>
VLAN                             : 30
Central Switching                : ENABLED</pre>
<p>Do broken links ek saath dikhte hain. Policy tag mein sirf ek map hai (NK-STAFF); <b>NK-VOICE ka map nahi hai</b>. Aur <b>PP-VOICE DISABLED hai</b> kyunki naya policy profile shut down se start hota hai. APs ke paas pehle se PT-CAMPUS hai (<code>show ap tag summary</code> Static dikhata hai), isliye AP link theek hai, aur VLAN 30 maujood hai. Dhyan do: ek missing link is ticket ko describe karne ke liye kaafi nahi; task ke hisaab se poori chain walk karni hai aur har missing link fix karna hai.</p>
<h3>Step 3: sabse chhota sahi change</h3>
<pre class="code">WLC1# configure terminal
WLC1(config)# wireless profile policy PP-VOICE
WLC1(config-wireless-policy)# no shutdown
WLC1(config-wireless-policy)# exit
WLC1(config)# wireless tag policy PT-CAMPUS
WLC1(config-policy-tag)# wlan NK-VOICE policy PP-VOICE
WLC1(config-policy-tag)# end
WLC1# write memory</pre>
<p>Hum WLAN recreate nahi karte, NK-STAFF ki PT-CAMPUS entries ko nahi chhute, aur APs ko nahi badalte. Policy tag har AP ke saath shared hai, isliye map add karne se dono APs par bina AP edit ke effect aa jaata hai.</p>
<h3>Step 4: prove karo</h3>
<pre class="code">PHONE1&gt; wifi connect NK-VOICE psk NkVoice2024
PHONE1&gt; wifi status
LAPTOP1&gt; wifi status</pre>
<pre class="out">PHONE1&gt; wifi status
SSID        : NK-VOICE
BSSID       : 00:50:42:a6:98:12
AP          : AP1
Band/channel: 5 GHz / 36
Signal      : -55 dBm
Security    : WPA2-Personal (PSK)
IP address  : 10.10.30.<span class="hl">11</span>/24 (DHCP)

LAPTOP1&gt; wifi status
SSID        : NK-STAFF
Security    : WPA2-Personal (PSK)
IP address  : 10.10.20.<span class="hl">11</span>/24 (DHCP)</pre>
<p>PHONE1 VOICE subnet 10.10.30.0/24 mein hai aur LAPTOP1 abhi bhi STAFF 10.10.20.0/24 mein. Aapke lab mein status line ke shabd alag ho sakte hain; zaroori SSID, subnet aur VLAN hain.</p>
<h3>9800 sab kuch disabled kyun start karta hai</h3>
<p>Naya WLAN, policy profile, RF profile ya tag shut down ya khaali start hota hai. Yeh jaanbujhkar hai: pehle poora object banao, phir enable karo, taaki clients adhuri service se na milen. Keemat yeh hai ki "configured but not enabled" operations ka sabse common fault hai. Kuch bhi banane ke baad use detailed show command se wapas padho aur Status line check karo.</p>
<table class="cmp"><tr><th>Lab mein symptom</th><th>Evidence</th><th>Fix</th></tr>
<tr><td>SSID nahi dikhta</td><td>Policy tag detail mein WLAN ka map nahi</td><td>Policy tag ke neeche <code>wlan NK-VOICE policy PP-VOICE</code></td></tr>
<tr><td>SSID nahi dikhta</td><td>Policy profile Status DISABLED</td><td>Policy profile ke neeche <code>no shutdown</code></td></tr>
<tr><td>Ek AP par SSID nahi dikhta</td><td>Us AP ka Tag Source Default</td><td><code>ap name AP2 policy-tag PT-CAMPUS</code></td></tr>
<tr><td>Dikhta hai lekin IP nahi</td><td>VLAN (NOT IN VLAN DATABASE)</td><td><code>vlan 30</code> / <code>name VOICE</code></td></tr>
</table>
<div class="warn"><p><b>Common mistakes.</b> (1) Sirf policy profile fix karke test karna; SSID phir bhi nahi aata kyunki map missing hai. (2) WLAN enabled rehte security edit karna; 9800 pehle shutdown maangta hai. (3) <code>write memory</code> bhoolna, to agla reload broken state wapas le aata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Akela WLAN profile kuch broadcast nahi karta. Use policy tag map, enabled policy profile aur us tag wala AP chahiye.</p></div>
<div class="scn"><h4>Voice rollout jo chup ho gaya</h4><p>Ek retailer ne warehouse khulne se pehle voice SSID add kiya. Installer ne WLAN aur policy profile banaya aur ghar chala gaya. Opening ki subah handsets ko network nahi mila. Shift lead ne chain follow ki: map missing, profile disabled. Do commands baad handsets register ho gaye. Post-incident checklist mein ab "har build ke baad Status aur map wapas padho" shamil hai.</p><p><b>Seekh:</b> build, enable, map, tag, phir real client se verify.</p></div>
<div class="iv"><p class="q">"Naya SSID configured hai lekin invisible hai. Kya check karte ho?"</p><p>WLAN enabled, policy tag map present, policy profile enabled aur VLAN maujood, APs us policy tag ke saath, aur radios serve kar rahe. Default-policy-tag behaviour aur naye objects ke shut start hone ka zikr karo.</p></div>
<div class="tip"><p><b>Web UI mein kaise karein.</b> Map <b>Configuration &gt; Tags &amp; Profiles &gt; Tags &gt; Policy</b> mein inspect aur edit karo, PP-VOICE ko <b>Configuration &gt; Tags &amp; Profiles &gt; Policy</b> mein enable karo (<b>Status</b>), phir phones aur laptops <b>Monitoring &gt; Wireless &gt; Clients</b> mein confirm karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chain walk karo: WLAN, policy tag map, policy profile, AP tag.</li>
<li>Naye profiles DISABLED start hote hain; explicitly enable karo.</li>
<li>Lab mein do missing links: PP-VOICE disabled aur map absent.</li>
<li>Shared policy tag mein map add karna har tagged AP tak pahunchta hai.</li>
<li>PHONE1 VLAN 30 mein aur LAPTOP1 abhi bhi VLAN 20 mein, isse prove karo.</li>
</ul></div>
`}};export{e as default};