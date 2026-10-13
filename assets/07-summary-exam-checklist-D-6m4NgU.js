var e=(e,t,n,r,i)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(i||`start`)+`" class="`+(r||`svg-ink`)+`" font-size="12">`+n+`</text>`,t=(t,n,r,i,a,o)=>`<rect x="`+t+`" y="`+n+`" width="200" height="90" rx="8" fill="`+r+`" stroke="#64748b"/>`+e(t+12,n+22,i,`svg-accent`)+e(t+12,n+46,a)+e(t+12,n+64,o)+`<circle cx="`+(t+180)+`" cy="`+(n+18)+`" r="8" fill="#0ea5e9" stroke="#0369a1"/><circle cx="`+(t+180)+`" cy="`+(n+72)+`" r="6" fill="#22c55e" stroke="#15803d" stroke-width="2"/>`,n=n=>`<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="`+n.aria+`">`+t(10,10,`#ddd6fe`,n.a1,n.b1,n.c1)+t(220,10,`#bae6fd`,n.a2,n.b2,n.c2)+t(430,10,`#fde68a`,n.a3,n.b3,n.c3)+t(10,112,`#bbf7d0`,n.a4,n.b4,n.c4)+t(220,112,`#fed7aa`,n.a5,n.b5,n.c5)+t(430,112,`#e2e8f0`,n.a6,n.b6,n.c6)+`<line x1="150" y1="82" x2="180" y2="82" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4"/><circle cx="188" cy="82" r="5" fill="#fff" stroke="#15803d" stroke-width="2"/><circle cx="24" cy="238" r="8" fill="#0ea5e9" stroke="#0369a1"/>`+e(38,242,n.k1)+`<circle cx="110" cy="238" r="6" fill="#22c55e" stroke="#15803d" stroke-width="2"/>`+e(122,242,n.k2)+`<rect x="210" y="230" width="22" height="16" rx="4" fill="#ddd6fe" stroke="#64748b"/>`+e(240,242,n.k3)+`<line x1="400" y1="238" x2="430" y2="238" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4"/>`+e(438,242,n.k4)+e(320,268,n.note,`svg-muted`,`middle`)+`</svg><p class="cap">`+n.cap+`</p></div>`,r=n({aria:`Six cases and the design rule each one teaches`,a1:`Roaming (Lakeside)`,b1:`L2 same VLAN, L3 tunnel`,c1:`11k/v/r, Adaptive FT`,a2:`Voice (Summit)`,b2:`-67 dBm, 25 dB SNR, EF`,c2:`WMM, CAC, 5 GHz`,a3:`Multicast (Northfield)`,b3:`Mcast mode, IGMP snooping`,c3:`mDNS gateway + policy`,a4:`High density (Eastbank)`,b4:`Small cells, 20 MHz`,c4:`Few SSIDs, 6 GHz WPA3`,a5:`Location (Marigold)`,b5:`3+ APs at -75 dBm`,c5:`iPSK for IoT, Spaces`,a6:`Guest and BYOD (Redstone)`,b6:`DMZ anchor, CWA, CoA`,c6:`EAP-TLS onboarding`,k1:`AP`,k2:`Client`,k3:`Case area`,k4:`Roam example`,note:`Match the requirement to the pattern, then validate.`,cap:`The six cases of this module on one page, each with the rule you must remember.`}),i=n({aria:`Chhe cases aur har ek ka design rule`,a1:`Roaming (Lakeside)`,b1:`L2 same VLAN, L3 tunnel`,c1:`11k/v/r, Adaptive FT`,a2:`Voice (Summit)`,b2:`-67 dBm, 25 dB SNR, EF`,c2:`WMM, CAC, 5 GHz`,a3:`Multicast (Northfield)`,b3:`Mcast mode, IGMP snooping`,c3:`mDNS gateway + policy`,a4:`High density (Eastbank)`,b4:`Chhoti cells, 20 MHz`,c4:`Kam SSIDs, 6 GHz WPA3`,a5:`Location (Marigold)`,b5:`3+ APs, -75 dBm par`,c5:`IoT ke liye iPSK, Spaces`,a6:`Guest aur BYOD (Redstone)`,b6:`DMZ anchor, CWA, CoA`,c6:`EAP-TLS onboarding`,k1:`AP`,k2:`Client`,k3:`Case area`,k4:`Roam example`,note:`Requirement ko pattern se match karo, phir validate karo.`,cap:`Is module ke chhe cases ek page par, har ek ke saath yaad rakhne wala rule.`}),a={id:`summary-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This last chapter pulls the six customer cases together. The ENWLSD 300-425 exam describes a customer, lists needs and limits, and asks for the best design choice. Your job is to recognise the pattern, apply the numbers, and avoid the trap. Read this chapter once the others feel familiar.</p>
`+r+`
<h3>Can-do checklist</h3>
<p>You are ready when you can do each of these without notes:</p>
<ul>
<li>Explain Layer 2 and Layer 3 roaming, the roles of anchor and foreign controllers, and what a mobility group and a mobility domain are.</li>
<li>Choose between 802.11k, 802.11v, 802.11r, OKC and CCKM for a given client mix, and say when to use Adaptive FT.</li>
<li>Validate mobility: peers up, matching group names, identical WLAN settings, open firewall ports.</li>
<li>Design a voice WLAN: targets, QoS markings, WMM, CAC, 5 GHz, overlap and a voice survey.</li>
<li>Pick a multicast mode and explain multicast-to-unicast limits; design an mDNS gateway with service and location filtering.</li>
<li>Reduce cell size, set minimum rates, limit SSIDs and size radios for a high-density venue.</li>
<li>State the 6 GHz rules: WPA3, PMF, PSC, no DFS, power modes; and the Wi-Fi 7 features.</li>
<li>Describe a location-ready design and the Cisco Spaces data path; onboard IoT safely.</li>
<li>Build guest anchor, CWA with CoA and a BYOD onboarding flow ending in EAP-TLS.</li>
<li>Adapt a design for healthcare, retail, warehouse and manufacturing.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Anchor and foreign</dt><dd>Anchor holds the client IP point of presence; foreign is where the client is now.</dd>
<dt>FT</dt><dd>Fast Transition, the 802.11r roaming method. Adaptive FT offers it only to capable clients.</dd>
<dt>OKC</dt><dd>Opportunistic key caching, a PMK reuse method for WPA2 Enterprise.</dd>
<dt>CAC</dt><dd>Call admission control, which protects existing calls from overload.</dd>
<dt>VideoStream</dt><dd>Multicast-to-unicast conversion for reliable video to selected clients.</dd>
<dt>mDNS gateway</dt><dd>Controller feature that shares Bonjour services across VLANs under a policy.</dd>
<dt>PSC</dt><dd>Preferred scanning channel in 6 GHz, used for discovery.</dd>
<dt>MLO</dt><dd>Multi-link operation, a Wi-Fi 7 feature that uses several links at once.</dd>
<dt>CWA, CoA</dt><dd>Central web authentication and change of authorization.</dd>
<dt>iPSK</dt><dd>Identity pre-shared key, a per-group or per-device key.</dd>
</dl>

<h3>Most-tested facts and numbers</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact to remember (typical values)</th></tr>
<tr><td>Voice</td><td>150 ms delay, 30 ms jitter, 1 percent loss; -67 dBm, 25 dB SNR; about 20 percent overlap; EF, UP 6</td></tr>
<tr><td>Video</td><td>AF41 (34), UP 5, AC_VI</td></tr>
<tr><td>Roaming</td><td>Voice roam below about 50 ms; L2 needs no tunnel; L3 tunnels to anchor</td></tr>
<tr><td>Mobility ports</td><td>UDP 16666 control and 16667 data on CAPWAP mobility; confirm for your release</td></tr>
<tr><td>mDNS</td><td>UDP 5353 to 224.0.0.251, link-local</td></tr>
<tr><td>6 GHz</td><td>WPA3 only, OWE for open, PMF required, 59 x 20 MHz in the US, no DFS</td></tr>
<tr><td>Location</td><td>3 or more APs at about -75 dBm; perimeter APs; Wi-Fi about 5 to 10 m</td></tr>
<tr><td>Guest</td><td>DMZ anchor, CWA, RADIUS UDP 1812 and 1813, CoA 3799 or 1700</td></tr>
</table>

<h3>Design pattern finder</h3>
<pre class="out">REQUIREMENT                          FIRST CHOICE
Keep IP across buildings             Mobility group, L3 roam through anchor
Roam under 50 ms for voice           802.11r (Adaptive), 11k, 11v, OKC
Legacy device will not join          Adaptive FT or disable FT on that WLAN
Live video to many clients           Multicast mode, higher mandatory rate
Video to a few critical clients      VideoStream
Printer across VLANs                 mDNS gateway with policy
<span class="hl">Too many clients in one room         Smaller cells, narrow channels, fewer SSIDs</span>
Guests isolated from LAN             Anchor in DMZ, CWA
Employee phones                      BYOD onboarding, EAP-TLS
</pre>

<div class="warn"><p><b>Last-minute traps.</b> Mixing up mobility and RF groups; assuming 802.11v forces a client to move; using 160 MHz in dense rooms; forgetting WPA3 on 6 GHz; using one PSK for IoT; counting probing phones as visitors; and trusting a predictive plan without a validation survey.</p></div>
<div class="exam"><p><b>Exam strategy.</b> Read the stem for the constraint word (legacy, dense, voice, DMZ, privacy). Remove options that break that constraint. Of the remaining answers, choose the one that is simplest and validated. Numbers in this module are typical planning values, so prefer the answer that says to verify by survey.</p></div>

<div class="scn"><h4>A design review that caught three faults</h4><p>A senior engineer reviewed a hospital plan with a checklist. Fault one: voice and data shared a VLAN across two controllers, but the mobility peers were down. Fault two: the voice SSID had Enabled FT, which would break old pumps. Fault three: the guest SSID used the same redirect ACL name on the foreign and anchor controllers with different rules. All three were fixed before go-live, and the pilot ran clean.</p><p><b>Lesson:</b> review designs against a fixed checklist: tunnels, security settings, legacy clients, QoS and policy path.</p></div>

<div class="iv"><p class="q">"Walk me through how you would review a wireless design before go-live."</p><p>Strong answer: confirm requirements, then check RF (signal, SNR, overlap, channels), roaming (mobility peers, FT, legacy clients), QoS and multicast, capacity and airtime, security and guest paths including CoA, location needs, and finish with a validation survey and a pilot.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every ENWLSD question is a customer case: requirement, constraint, option, best design.</li>
<li>Know the typical numbers and say they are typical; validate by survey.</li>
<li>Roaming: L2 or L3, mobility group, 11k/v/r, OKC, Adaptive FT.</li>
<li>Voice, multicast, density, location and guest each have one core rule to apply.</li>
<li>Check the path end to end: wired, tunnel, policy, return path.</li>
</ul></div>
`,hi:`
<p>Yeh aakhri chapter chhe customer cases ko ek saath laata hai. ENWLSD 300-425 exam ek customer describe karta hai, needs aur limits batata hai, aur best design choice poochta hai. Aapka kaam pattern pehchanna, numbers lagana aur trap se bachna hai. Baaki chapters jab familiar lagne lagein tab yeh chapter ek baar padho.</p>
`+i+`
<h3>Can-do checklist</h3>
<p>Aap tab ready ho jab bina notes ke yeh sab kar sako:</p>
<ul>
<li>Layer 2 aur Layer 3 roaming, anchor aur foreign controllers ke roles, aur mobility group aur mobility domain kya hain, yeh explain karo.</li>
<li>Diye gaye client mix ke liye 802.11k, 802.11v, 802.11r, OKC aur CCKM mein se chuno, aur batao Adaptive FT kab use karna hai.</li>
<li>Mobility validate karo: peers up, matching group names, identical WLAN settings, firewall ports open.</li>
<li>Voice WLAN design karo: targets, QoS markings, WMM, CAC, 5 GHz, overlap aur voice survey.</li>
<li>Multicast mode chuno aur multicast-to-unicast ki limits explain karo; service aur location filtering ke saath mDNS gateway design karo.</li>
<li>High-density venue ke liye cell size kam karo, minimum rates set karo, SSIDs limit karo aur radios size karo.</li>
<li>6 GHz rules batao: WPA3, PMF, PSC, no DFS, power modes; aur Wi-Fi 7 features.</li>
<li>Location-ready design aur Cisco Spaces data path describe karo; IoT ko safely onboard karo.</li>
<li>Guest anchor, CoA ke saath CWA aur EAP-TLS par khatam hone wala BYOD onboarding flow banao.</li>
<li>Design ko healthcare, retail, warehouse aur manufacturing ke liye adapt karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Anchor aur foreign</dt><dd>Anchor client ke IP ka point of presence rakhta hai; foreign woh hai jahan client ab hai.</dd>
<dt>FT</dt><dd>Fast Transition, 802.11r roaming method. Adaptive FT ise sirf capable clients ko offer karta hai.</dd>
<dt>OKC</dt><dd>Opportunistic key caching, WPA2 Enterprise ke liye PMK reuse method.</dd>
<dt>CAC</dt><dd>Call admission control, jo maujooda calls ko overload se bachata hai.</dd>
<dt>VideoStream</dt><dd>Chuné hue clients ko reliable video ke liye multicast-to-unicast conversion.</dd>
<dt>mDNS gateway</dt><dd>Controller feature jo policy ke under VLANs ke beech Bonjour services share karta hai.</dd>
<dt>PSC</dt><dd>6 GHz mein preferred scanning channel, discovery ke liye.</dd>
<dt>MLO</dt><dd>Multi-link operation, Wi-Fi 7 feature jo ek saath kai links use karta hai.</dd>
<dt>CWA, CoA</dt><dd>Central web authentication aur change of authorization.</dd>
<dt>iPSK</dt><dd>Identity pre-shared key, per-group ya per-device key.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts aur numbers</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakhne wala fact (typical values)</th></tr>
<tr><td>Voice</td><td>150 ms delay, 30 ms jitter, 1 percent loss; -67 dBm, 25 dB SNR; lagbhag 20 percent overlap; EF, UP 6</td></tr>
<tr><td>Video</td><td>AF41 (34), UP 5, AC_VI</td></tr>
<tr><td>Roaming</td><td>Voice roam lagbhag 50 ms se kam; L2 ko tunnel nahi chahiye; L3 anchor tak tunnel hota hai</td></tr>
<tr><td>Mobility ports</td><td>CAPWAP mobility par UDP 16666 control aur 16667 data; apni release ke liye confirm karo</td></tr>
<tr><td>mDNS</td><td>UDP 5353, 224.0.0.251 par, link-local</td></tr>
<tr><td>6 GHz</td><td>Sirf WPA3, open ke liye OWE, PMF required, US mein 59 x 20 MHz, DFS nahi</td></tr>
<tr><td>Location</td><td>3 ya zyada APs lagbhag -75 dBm par; perimeter APs; Wi-Fi lagbhag 5 se 10 m</td></tr>
<tr><td>Guest</td><td>DMZ anchor, CWA, RADIUS UDP 1812 aur 1813, CoA 3799 ya 1700</td></tr>
</table>

<h3>Design pattern finder</h3>
<pre class="out">REQUIREMENT                          FIRST CHOICE
Keep IP across buildings             Mobility group, L3 roam through anchor
Roam under 50 ms for voice           802.11r (Adaptive), 11k, 11v, OKC
Legacy device will not join          Adaptive FT or disable FT on that WLAN
Live video to many clients           Multicast mode, higher mandatory rate
Video to a few critical clients      VideoStream
Printer across VLANs                 mDNS gateway with policy
<span class="hl">Too many clients in one room         Smaller cells, narrow channels, fewer SSIDs</span>
Guests isolated from LAN             Anchor in DMZ, CWA
Employee phones                      BYOD onboarding, EAP-TLS
</pre>

<div class="warn"><p><b>Last-minute traps.</b> Mobility aur RF groups mix karna; yeh maan lena ki 802.11v client ko zabardasti move karta hai; dense rooms mein 160 MHz use karna; 6 GHz par WPA3 bhool jana; IoT ke liye ek PSK use karna; probing phones ko visitors ginna; aur validation survey ke bina predictive plan par bharosa karna.</p></div>
<div class="exam"><p><b>Exam strategy.</b> Stem mein constraint word padho (legacy, dense, voice, DMZ, privacy). Jo options us constraint ko todte hain unhe hatao. Bache hue answers mein sabse simple aur validated wala chuno. Is module ke numbers typical planning values hain, isliye woh answer prefer karo jo survey se verify karne ko kehta hai.</p></div>

<div class="scn"><h4>Design review jisne teen faults pakde</h4><p>Ek senior engineer ne checklist ke saath hospital plan review kiya. Fault ek: voice aur data do controllers ke beech ek VLAN share karte the, lekin mobility peers down the. Fault do: voice SSID par FT Enabled tha, jo purane pumps ko tod deta. Fault teen: guest SSID ne foreign aur anchor controllers par same redirect ACL name alag rules ke saath use kiya. Teeno go-live se pehle fix ho gaye, aur pilot clean chala.</p><p><b>Seekh:</b> designs ko fixed checklist se review karo: tunnels, security settings, legacy clients, QoS aur policy path.</p></div>

<div class="iv"><p class="q">"Go-live se pehle wireless design kaise review karoge, mujhe walk through karo."</p><p>Strong answer: requirements confirm karo, phir RF (signal, SNR, overlap, channels), roaming (mobility peers, FT, legacy clients), QoS aur multicast, capacity aur airtime, security aur CoA samet guest paths, location needs check karo, aur validation survey aur pilot se khatam karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har ENWLSD sawal ek customer case hai: requirement, constraint, option, best design.</li>
<li>Typical numbers jaano aur unhe typical hi kaho; survey se validate karo.</li>
<li>Roaming: L2 ya L3, mobility group, 11k/v/r, OKC, Adaptive FT.</li>
<li>Voice, multicast, density, location aur guest, har ek ka ek core rule hai.</li>
<li>Path end to end check karo: wired, tunnel, policy, return path.</li>
</ul></div>
`}};export{a as default};