var e={id:`rogues-wips-exclusion`,h:{en:`Rogue detection, aWIPS and client exclusion`,hi:`Rogue detection, aWIPS aur client exclusion`},body:{en:`
<p>A shopping mall has security guards who walk the corridors and also cameras. Guards notice a stall that nobody rented and a stranger trying every shop door. Wireless networks have the same two jobs: <b>spot access points that should not be there</b> (rogue detection) and <b>slow down clients that behave badly</b> (client exclusion). Behind both stands a smarter watcher, the <b>wireless intrusion prevention system</b> (aWIPS), that recognises attack patterns. This chapter has a simulated part (detection thresholds and client exclusion) and a concept-only part (classification, containment, aWIPS).</p>

<h3>What is a rogue AP?</h3>
<p>Your managed APs hear every other radio in the air. Any AP that is <b>not part of your controller</b> is a <b>rogue</b> from the controller's point of view, including the neighbouring shop's AP. Most are harmless. A few matter:</p>
<ul>
<li>An <b>employee-installed AP</b> plugged into a wall port, bypassing your security.</li>
<li>An <b>impostor (evil twin)</b> that broadcasts one of your SSIDs to attract clients.</li>
<li>An AP in your building <b>on your wired network</b>, which is the dangerous case.</li>
</ul>
<p>Detection works because managed APs spend some time off-channel scanning. When they hear a foreign BSSID above a signal threshold, the controller lists it.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Rogue detection threshold">
<rect x="10" y="20" width="620" height="190" rx="10" fill="#f1f5f9" stroke="#cbd5e1"/>
<circle cx="150" cy="110" r="22" fill="#ddd6fe"/><text x="150" y="115" text-anchor="middle" class="svg-ink" font-size="12">AP1</text>
<circle cx="330" cy="110" r="22" fill="#ddd6fe"/><text x="330" y="115" text-anchor="middle" class="svg-ink" font-size="12">AP2</text>
<circle cx="500" cy="75" r="20" fill="#fed7aa"/><text x="500" y="79" text-anchor="middle" class="svg-ink" font-size="11">Rogue</text>
<line x1="522" y1="85" x2="352" y2="105" stroke="#0ea5e9" stroke-width="2"/>
<text x="440" y="108" class="svg-accent" font-size="11">-70 dBm: heard, listed</text>
<line x1="480" y1="90" x2="172" y2="108" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4"/>
<text x="190" y="148" class="svg-muted" font-size="11">-91 dBm: too weak, below the floor</text>
<text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="12">Detected when an AP hears it above max(-82, min-rssi)</text>
</svg><p class="cap">The minimum RSSI setting filters distant neighbours so the rogue list stays useful.</p></div>

<h3>Configuring and reading detection (simulated)</h3>
<pre class="code"><span class="c">! ignore rogues weaker than -75 dBm (range -128 to -70)</span>
wireless wps rogue detection min-rssi -75</pre>
<pre class="out">WLC1# show wireless wps rogue ap summary

Minimum RSSI for rogue detection: -75 dBm
Number of rogue APs: 1

MAC Address     Classification  # APs  Best RSSI  Chan  SSID
aabb.cc00.0102  Unclassified    2      -68 dBm    36    <span class="hl">NK-CORP  (uses a managed SSID)</span>

WLC1# show wireless wps rogue ap detailed aabb.cc00.0102
Uses a managed SSID: YES - possible impersonation of a WLAN on this controller</pre>
<p>Web UI: <b>Monitoring &gt; Rogues</b> lists rogue APs and clients. The key flag to learn is "uses a managed SSID": an unknown BSSID advertising a name you own deserves immediate attention, because users cannot tell it from the real one. Physical location (which APs hear it, and how loudly) tells you where to walk with a survey tool.</p>

<h3>Classification and containment (concept only)</h3>
<p>Real controllers sort rogues into <b>Friendly</b> (known neighbours you allow-listed), <b>Malicious</b> (rule match: for example it uses your SSID, or it is detected on your wired network by a rogue location discovery check, RLDP, or by switch-port correlation) and <b>Unclassified</b> (not yet decided). Classification rules are written by you: SSID match, minimum RSSI, number of clients, channel and so on. <b>Containment</b> means your APs send management frames to disrupt clients of a malicious rogue. It is powerful and risky: you may disrupt a neighbour's legitimate network, and in many places there are legal limits on interfering with radio. Treat containment as a decision for your security and legal teams, enable it only for rogues proven to be on your premises and wired network, and prefer the physical fix: find the device and remove it, shut the switch port.</p>

<h3>aWIPS (concept only)</h3>
<p><b>Adaptive wIPS</b> adds <b>signature-based detection</b> of wireless attack behaviour, for example floods of deauthentication or association frames, or malformed frames. Selected APs act as monitors, report to the controller and a management platform, and raise alarms. A well-configured aWIPS tells the defender "this pattern matches a known attack at 14:05 from this location". As with PMF, it is a detection and prevention layer: it does not replace strong authentication. The exact feature set and profile syntax depend on the release, so check it.</p>

<h3>Client exclusion (simulated)</h3>
<p>A client that keeps failing may be attacking, or just misconfigured. <b>Client exclusion</b> blocks it for a time after repeated failures so it cannot hammer the authentication server. Failure types you can enable: <code>dot11-assoc</code> (association or PMF/SAE rejects), <code>dot11-auth</code>, <code>dot1x-auth</code>, <code>web-auth</code> and <code>ip-theft</code>. In the model, <b>three consecutive failures</b> of an enabled counted type exclude the client for <b>60 seconds</b> by default; the policy profile can change the timeout, and 0 means "until cleared". An excluded client is rejected at association. Real thresholds differ by release.</p>
<pre class="code">wireless wps client-exclusion web-auth
no wireless wps client-exclusion ip-theft
wireless profile policy PP-GUEST
 shutdown
 exclusionlist timeout 120
 no shutdown
 exit</pre>
<pre class="out">WLC1# show wireless exclusionlist

Number of excluded clients: 1

Client MAC      WLAN  Left (s)  Reason
0050.7966.6801  3     47        Web authentication failures

WLC1# clear wireless exclusionlist client mac-address 0050.7966.6801</pre>
<p>Web UI for these settings is part of the policy profile (exclusion timeout) and the security settings of the controller; the exclusion list is read with the CLI above.</p>

<h3>The false positive cost</h3>
<p>Every protective action can hurt a real user. A conference room full of guests typing the wrong password can fill the exclusion list; an aggressive rogue rule can alarm on every neighbour. Tune: keep exclusion on, keep timeouts short, give the helpdesk the clear command, and review the rogue list weekly with an allow list for known neighbours.</p>

<div class="eg"><p><b>Worked example.</b> At a conference, 200 guests share NK-GUEST. Ten typed the password wrongly three times and were excluded for 60 s. The helpdesk saw "Web authentication failures" in the list, told them to wait a minute, and no tickets escalated. Without a timeout (0, until cleared) the helpdesk would have cleared ten entries by hand.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Turning on automatic containment against any unclassified rogue. Setting min-rssi so high that real nearby rogues vanish from the list. Ignoring "uses a managed SSID". Leaving the exclusion timeout at 0 on a guest policy.</p></div>

<div class="exam"><p><b>Exam traps.</b> A rogue is any AP not in your controller group. Containment is an action, detection is not. Friendly, Malicious, Unclassified are the classes. The client exclusion list is per controller policy and has a timer; exclusion is not permanent unless set so.</p></div>

<div class="scn"><h4>The twin in the car park</h4><p>The rogue summary showed an AP broadcasting NK-CORP at -66 dBm, heard only by the AP nearest the car park. The engineer flagged it as a managed-SSID impostor. Security walked to the car park and found a mobile hotspot in a vehicle. They did not enable containment; they asked the owner to move on and reminded staff to use only the corporate SSID with certificate validation on (chapter 8).</p><p><b>Lesson:</b> detection tells you where; a human fix is often better than containment.</p></div>

<div class="iv"><p class="q">"How would you handle a rogue AP that clones your SSID?"</p><p>Confirm it in the rogue list and location data, check whether it is on the wired network, then locate and remove it physically. Use containment only when policy and legal allow it and the rogue is proven on premises. Strengthen clients with 802.1X server certificate validation so a clone cannot collect credentials.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rogue detection lists foreign APs heard above a signal floor; <code>wireless wps rogue detection min-rssi</code> filters weak ones.</li>
<li>"Uses a managed SSID" marks possible impersonation: investigate first.</li>
<li>Classification (friendly, malicious, unclassified), containment and aWIPS are concept only.</li>
<li>Client exclusion: failures of an enabled type exclude a client for a timeout (60 s default).</li>
<li>Tune to limit false positives; containment has legal and operational risks.</li>
</ul></div>
`,hi:`
<p>Shopping mall mein security guards corridors mein ghoomte hain aur cameras bhi hote hain. Guards dekh lete hain ki ek stall jo kisi ne kiraye par nahi li, aur ek ajnabi jo har dukaan ka darwaza try kar raha hai. Wireless networks ke bhi wahi do kaam hain: <b>aise access points pakadna jo wahan nahi hone chahiye</b> (rogue detection) aur <b>kharab behave karne wale clients ko dheema karna</b> (client exclusion). Dono ke peeche ek smarter watcher hai, <b>wireless intrusion prevention system</b> (aWIPS), jo attack patterns pehchaanta hai. Is chapter ka ek simulated hissa hai (detection thresholds aur client exclusion) aur ek concept-only hissa (classification, containment, aWIPS).</p>

<h3>Rogue AP kya hai?</h3>
<p>Aapke managed APs hawa mein har doosre radio ko sunte hain. Jo bhi AP <b>aapke controller ka hissa nahi</b> hai woh controller ki nazar mein <b>rogue</b> hai, padosi dukaan ka AP bhi. Zyada tar harmless hote hain. Kuch matter karte hain:</p>
<ul>
<li><b>Employee ka lagaya AP</b> jo wall port mein plug hai aur aapki security bypass karta hai.</li>
<li><b>Impostor (evil twin)</b> jo clients ko khinchne ke liye aapka koi SSID broadcast karta hai.</li>
<li>Aapki building mein <b>aapke wired network par</b> AP, jo khatarnaak case hai.</li>
</ul>
<p>Detection isliye kaam karta hai ki managed APs kuch waqt off-channel scanning mein bitate hain. Jab woh signal threshold se upar kisi foreign BSSID ko sunte hain, controller use list kar deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Rogue detection threshold">
<rect x="10" y="20" width="620" height="190" rx="10" fill="#f1f5f9" stroke="#cbd5e1"/>
<circle cx="150" cy="110" r="22" fill="#ddd6fe"/><text x="150" y="115" text-anchor="middle" class="svg-ink" font-size="12">AP1</text>
<circle cx="330" cy="110" r="22" fill="#ddd6fe"/><text x="330" y="115" text-anchor="middle" class="svg-ink" font-size="12">AP2</text>
<circle cx="500" cy="75" r="20" fill="#fed7aa"/><text x="500" y="79" text-anchor="middle" class="svg-ink" font-size="11">Rogue</text>
<line x1="522" y1="85" x2="352" y2="105" stroke="#0ea5e9" stroke-width="2"/>
<text x="440" y="108" class="svg-accent" font-size="11">-70 dBm: suna, list hua</text>
<line x1="480" y1="90" x2="172" y2="108" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4"/>
<text x="190" y="148" class="svg-muted" font-size="11">-91 dBm: bahut weak, floor se neeche</text>
<text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="12">Detect tab hota hai jab koi AP use max(-82, min-rssi) se upar sune</text>
</svg><p class="cap">Minimum RSSI setting door ke padosiyon ko filter karti hai taaki rogue list kaam ki rahe.</p></div>

<h3>Detection configure aur padhna (simulated)</h3>
<pre class="code"><span class="c">! -75 dBm se weak rogues ignore karo (range -128 se -70)</span>
wireless wps rogue detection min-rssi -75</pre>
<pre class="out">WLC1# show wireless wps rogue ap summary

Minimum RSSI for rogue detection: -75 dBm
Number of rogue APs: 1

MAC Address     Classification  # APs  Best RSSI  Chan  SSID
aabb.cc00.0102  Unclassified    2      -68 dBm    36    <span class="hl">NK-CORP  (uses a managed SSID)</span>

WLC1# show wireless wps rogue ap detailed aabb.cc00.0102
Uses a managed SSID: YES - possible impersonation of a WLAN on this controller</pre>
<p>Web UI: <b>Monitoring &gt; Rogues</b> rogue APs aur clients list karta hai. Jo key flag seekhna hai woh hai "uses a managed SSID": aapke naam ko advertise karta anjaan BSSID turant dhyaan maangta hai, kyunki users use asli se alag nahi kar sakte. Physical location (kaunse APs use sunte hain, aur kitni tez) batati hai ki survey tool le kar kahan chalna hai.</p>

<h3>Classification aur containment (concept only)</h3>
<p>Real controllers rogues ko <b>Friendly</b> (jaane hue padosi jinhe aapne allow-list kiya), <b>Malicious</b> (rule match: jaise woh aapka SSID use karta hai, ya rogue location discovery check, RLDP, ya switch-port correlation se aapke wired network par pakda gaya) aur <b>Unclassified</b> (abhi decide nahi hua) mein baantte hain. Classification rules aap likhte ho: SSID match, minimum RSSI, clients ki sankhya, channel wagairah. <b>Containment</b> ka matlab aapke APs malicious rogue ke clients ko disrupt karne ke liye management frames bhejte hain. Yeh powerful aur risky hai: aap padosi ka legitimate network disrupt kar sakte ho, aur kai jagah radio mein interference par kanooni limits hain. Containment ko security aur legal teams ka decision samjho, ise sirf un rogues ke liye enable karo jo aapke premises aur wired network par prove ho chuke hain, aur physical fix prefer karo: device dhoondo aur hatao, switch port shut karo.</p>

<h3>aWIPS (concept only)</h3>
<p><b>Adaptive wIPS</b> wireless attack behaviour ki <b>signature-based detection</b> jodta hai, jaise deauthentication ya association frames ke floods, ya malformed frames. Chuninda APs monitor ka kaam karte hain, controller aur management platform ko report karte hain, aur alarms uthate hain. Achhi tarah configured aWIPS defender ko batata hai "yeh pattern 14:05 par is location se ek known attack se match karta hai". PMF ki tarah yeh detection aur prevention layer hai: strong authentication ki jagah nahi leta. Exact feature set aur profile syntax release par depend karta hai, isliye check karo.</p>

<h3>Client exclusion (simulated)</h3>
<p>Jo client baar baar fail ho woh attack kar raha ho sakta hai, ya bas misconfigured. <b>Client exclusion</b> repeated failures ke baad use kuch time ke liye block karta hai taaki woh authentication server par hathoda na maare. Jo failure types enable kar sakte ho: <code>dot11-assoc</code> (association ya PMF/SAE rejects), <code>dot11-auth</code>, <code>dot1x-auth</code>, <code>web-auth</code> aur <code>ip-theft</code>. Model mein enabled counted type ki <b>teen consecutive failures</b> client ko default <b>60 seconds</b> ke liye exclude karti hain; policy profile timeout badal sakta hai, aur 0 ka matlab "jab tak clear na ho". Excluded client association par reject hota hai. Real thresholds release ke hisaab se alag hote hain.</p>
<pre class="code">wireless wps client-exclusion web-auth
no wireless wps client-exclusion ip-theft
wireless profile policy PP-GUEST
 shutdown
 exclusionlist timeout 120
 no shutdown
 exit</pre>
<pre class="out">WLC1# show wireless exclusionlist

Number of excluded clients: 1

Client MAC      WLAN  Left (s)  Reason
0050.7966.6801  3     47        Web authentication failures

WLC1# clear wireless exclusionlist client mac-address 0050.7966.6801</pre>
<p>In settings ka Web UI policy profile (exclusion timeout) aur controller ki security settings ka hissa hai; exclusion list upar diye CLI se padhi jati hai.</p>

<h3>False positive ki keemat</h3>
<p>Har protective action asli user ko nuksan pahucha sakta hai. Guests se bhara conference room galat password se exclusion list bhar sakta hai; aggressive rogue rule har padosi par alarm de sakta hai. Tune karo: exclusion on rakho, timeouts chhote rakho, helpdesk ko clear command do, aur known padosiyon ki allow list ke saath rogue list ko har hafte review karo.</p>

<div class="eg"><p><b>Worked example.</b> Conference mein 200 guests NK-GUEST share karte hain. Dus ne password teen baar galat type kiya aur 60 s ke liye exclude ho gaye. Helpdesk ne list mein "Web authentication failures" dekha, unhe ek minute rukne ko kaha, aur koi ticket escalate nahi hua. Timeout ke bina (0, jab tak clear na ho) helpdesk ko dus entries haath se clear karni padti.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Har unclassified rogue ke khilaf automatic containment on karna. min-rssi itna high set karna ki asli paas ke rogues list se gayab ho jaayein. "uses a managed SSID" ko ignore karna. Guest policy par exclusion timeout 0 chhodna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Rogue woh har AP hai jo aapke controller group mein nahi. Containment ek action hai, detection nahi. Friendly, Malicious, Unclassified classes hain. Client exclusion list per controller policy hai aur uska timer hota hai; exclusion permanent nahi jab tak aisa set na ho.</p></div>

<div class="scn"><h4>Car park mein twin</h4><p>Rogue summary mein ek AP -66 dBm par NK-CORP broadcast karta dikha, jo sirf car park ke sabse paas wale AP ne suna. Engineer ne use managed-SSID impostor flag kiya. Security car park gayi aur gaadi mein ek mobile hotspot mila. Unhone containment enable nahi kiya; owner se aage jaane ko kaha aur staff ko yaad dilaya ki sirf corporate SSID use karein, certificate validation on ke saath (chapter 8).</p><p><b>Lesson:</b> detection batata hai kahan; insaan ka fix aksar containment se behtar hai.</p></div>

<div class="iv"><p class="q">"Jo rogue AP aapka SSID clone kare use aap kaise handle karoge?"</p><p>Rogue list aur location data mein confirm karo, check karo ki woh wired network par hai ya nahi, phir use physically dhoondo aur hatao. Containment sirf tab use karo jab policy aur legal allow karein aur rogue premises par prove ho. Clients ko 802.1X server certificate validation se strong karo taaki clone credentials na le sake.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rogue detection signal floor se upar sune foreign APs list karta hai; <code>wireless wps rogue detection min-rssi</code> weak waalon ko filter karta hai.</li>
<li>"Uses a managed SSID" possible impersonation batata hai: pehle investigate karo.</li>
<li>Classification (friendly, malicious, unclassified), containment aur aWIPS concept only hain.</li>
<li>Client exclusion: enabled type ki failures client ko timeout ke liye exclude karti hain (default 60 s).</li>
<li>False positives limit karne ke liye tune karo; containment ke legal aur operational risks hain.</li>
</ul></div>
`}};export{e as default};