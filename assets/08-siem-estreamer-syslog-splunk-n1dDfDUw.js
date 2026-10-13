var e={id:`siem`,h:{en:`Events out: eStreamer, syslog, Security Analytics and Logging, and Splunk`,hi:`Events bahar: eStreamer, syslog, Security Analytics and Logging, aur Splunk`},body:{en:`
<p>The Management Center stores events, but a SOC rarely lives in it. Analysts work in a SIEM such as <b>Splunk</b>, where firewall events sit next to endpoint, identity, DNS and cloud logs. This chapter shows the three ways events leave Secure Firewall and how to choose between them.</p>

<h3>An analogy: postcards and registered parcels</h3>
<p>A <b>syslog</b> message is a postcard: quick, cheap, anyone can read it, sent straight from where it was written, and if one gets lost (UDP) nobody notices. <b>eStreamer</b> is a registered parcel service from the head office: you sign up with a certificate, you choose exactly which kinds of parcels you want, and each one arrives complete with all its attachments (packet data, user, application, file details) over an authenticated channel.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Event paths to a SIEM">
<rect x="20" y="150" width="130" height="55" rx="8" fill="#fed7aa"/><text x="85" y="173" text-anchor="middle" class="svg-ink" font-size="13">FTD1</text><text x="85" y="191" text-anchor="middle" class="svg-muted" font-size="12">LINA + Snort</text>
<rect x="250" y="40" width="160" height="55" rx="8" fill="#ddd6fe"/><text x="330" y="63" text-anchor="middle" class="svg-ink" font-size="13">Management Center</text><text x="330" y="81" text-anchor="middle" class="svg-muted" font-size="12">event store</text>
<rect x="480" y="100" width="150" height="55" rx="8" fill="#fde68a"/><text x="555" y="123" text-anchor="middle" class="svg-ink" font-size="13">Splunk</text><text x="555" y="141" text-anchor="middle" class="svg-muted" font-size="12">siem.nwk.example</text>
<rect x="250" y="190" width="160" height="45" rx="8" fill="#e2e8f0"/><text x="330" y="217" text-anchor="middle" class="svg-ink" font-size="13">SAL (cloud / on-prem)</text>
<line x1="150" y1="165" x2="250" y2="80" stroke="#64748b" stroke-width="2"/><text x="160" y="110" class="svg-muted" font-size="12">sftunnel 8305</text>
<line x1="410" y1="70" x2="480" y2="115" stroke="#64748b" stroke-width="2"/><text x="470" y="80" text-anchor="middle" class="svg-accent" font-size="12">eStreamer 8302</text>
<line x1="150" y1="180" x2="480" y2="135" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="330" y="160" text-anchor="middle" class="svg-accent" font-size="12">syslog from the device</text>
<line x1="150" y1="195" x2="250" y2="212" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Events go to the Management Center and from there by eStreamer, or straight from the device by syslog, or to Security Analytics and Logging.</p></div>

<h3>Path 1 — eStreamer from the Management Center</h3>
<p><b>eStreamer (Event Streamer)</b> is the Management Center's API for streaming events to an external client. It runs on <b>TCP 8302</b> with TLS and <b>client-certificate</b> authentication. On the eStreamer page of the Management Center you tick the event types to send (intrusion events and their packet data, connection and Security Intelligence events, file and malware events, correlation events, discovery and user activity), then <b>create a client</b> for the SIEM's IP or hostname with a password; the Management Center generates a PKCS#12 file you install on the client. In Splunk the client is the <b>Cisco Security Cloud</b> app, which includes the Secure Firewall eStreamer input (it replaced the older eNcore add-on).</p>
<p>eStreamer gives the richest data — events are enriched with user, application, URL category, file disposition and geolocation, exactly as you see them in the Management Center.</p>

<h3>Path 2 — syslog straight from Threat Defense</h3>
<p>Two different engines produce syslog. <b>LINA</b> messages (interface, NAT, VPN, connection build/teardown — the familiar %FTD-6-302013 family) are configured in <b>Devices → Platform Settings → Syslog</b>: logging enabled, destinations, servers (IP, interface, UDP or TCP, optional secure syslog). <b>Snort</b> events (connection, intrusion, file, malware) are sent when the access control policy's <b>Logging</b> tab (or each rule's logging setting) says so, using either a syslog alert or the Platform Settings servers. Snort syslog uses message IDs 430001 (intrusion), 430002 (connection start), 430003 (connection end), 430004 (file) and 430005 (file malware).</p>
<pre class="code"><span class="c">! Devices → Platform Settings → Syslog → Syslog Servers</span>
IP Address   : siem.nwk.example (10.0.9.30)
Protocol     : TCP 1470               <span class="c">! TCP: delivery is noticed if the server goes away</span>
Interface    : inside
<span class="c">! Policies → Access Control → NK-ACP → Logging</span>
IPS Settings : Send Syslog messages for IPS events
Syslog source: Use the syslog settings in the FTD Platform Settings</pre>
<pre class="out"><span class="hl">%FTD-1-430001:</span> EventPriority: High, InstanceID: 1, ConnectionID: 5, AccessControlRuleAction: Allow, SrcIP: 10.0.1.10, DstIP: 8.8.8.8, SrcPort: 51522, DstPort: 80, Protocol: tcp, IngressInterface: inside, EgressInterface: outside, IngressZone: INSIDE, EgressZone: OUTSIDE, Priority: 1, GID: 1, <span class="hl">SID: 58003</span>, Revision: 1, Message: MALWARE-CNC outbound beacon from infected host (nk-sim), Classification: A Network Trojan was Detected, ApplicationProtocol: HTTP, IntrusionPolicy: Balanced Security and Connectivity, ACPolicy: NK-ACP, AccessControlRuleName: Inside-Out, <span class="hl">InlineResult: Blocked</span></pre>

<h3>Path 3 — Security Analytics and Logging (SAL)</h3>
<p><b>SAL</b> is Cisco's own log store for firewall events, offered as <b>SaaS</b> (devices send through a Secure Event Connector, viewed in Security Cloud Control) or <b>on premises</b> (a Secure Network Analytics manager with a data store). It gives long retention and traffic analytics without paying SIEM ingest for every connection event, and the Management Center can query it remotely.</p>

<table class="cmp"><tr><th></th><th>eStreamer</th><th>Device syslog</th><th>SAL</th></tr>
<tr><td>Sent by</td><td>Management Center</td><td>Each Threat Defense</td><td>Devices / connector</td></tr>
<tr><td>Transport</td><td>TCP 8302, TLS, client cert</td><td>UDP or TCP (optional TLS)</td><td>Secure connector / on-prem collector</td></tr>
<tr><td>Detail</td><td>Richest, enriched</td><td>Text fields, no packet data</td><td>Rich, firewall-focused</td></tr>
<tr><td>Best for</td><td>SIEM with the Cisco app</td><td>Any SIEM, simple, scales with devices</td><td>Long retention, cost control</td></tr></table>

<div class="eg"><p><b>Worked example — volume.</b> 2,000 users generate roughly 40 million connections a day. Logging every connection at start and end doubles that. Logging only at end of connection, and only on rules that matter, cuts it to about 15 million; intrusion, file and malware events are a few thousand. Many SOCs send all security events (intrusion, malware, Security Intelligence, correlation) to Splunk and keep bulk connection logs in SAL.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Firewall between the SIEM and the Management Center blocking TCP 8302. eStreamer client certificate created for a different IP than the one the SIEM connects from. Expecting Snort events in syslog when only LINA syslog was configured. Logging connections at both beginning and end everywhere, then running out of SIEM licence.</p></div>

<div class="exam"><p><b>Exam trap.</b> eStreamer is served by the <b>Management Center</b> (TCP 8302, certificate authentication), not by the managed device. Syslog for Snort events can come directly from the device. Intrusion syslog is 430001; connection end is 430003.</p></div>

<div class="scn"><h4>The silent Splunk dashboard</h4><p>After a Management Center upgrade, the SOC's firewall dashboard in Splunk went flat. The eStreamer input logs showed TLS handshake failures. The engineer checked the eStreamer client entry: the PKCS#12 file had been created for the old SIEM collector IP before a migration, and the new collector presented the same certificate from a different address. He created a new client for 10.0.9.30, installed the new PKCS#12 in the Cisco Security Cloud app, and events resumed from the last bookmark without gaps.</p><p><b>Lesson:</b> eStreamer authenticates the client by certificate tied to its address. When the collector moves, create a new client.</p></div>

<div class="iv"><p class="q">"How would you get Secure Firewall intrusion events into Splunk, and what are the trade-offs?"</p><p>Strong answer: either eStreamer from the Management Center into the Cisco Security Cloud app — TCP 8302, client certificate, richest enriched data, a single source for all devices — or syslog directly from each Threat Defense, using the access policy logging settings for Snort events (430001 for intrusion) and Platform Settings for LINA messages, which is simpler and works with any SIEM but carries less context. For long retention of bulk connection logs, add Security Analytics and Logging.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>eStreamer: Management Center → SIEM, TCP 8302, TLS with a client certificate, richest data.</li>
<li>Syslog: LINA via Platform Settings; Snort events via the access policy Logging settings (430001–430005).</li>
<li>Splunk uses the Cisco Security Cloud app to ingest eStreamer data.</li>
<li>SAL stores firewall events long-term in the cloud or on premises.</li>
<li>Plan volume: log what matters, at end of connection, and route bulk logs wisely.</li>
</ul></div>
`,hi:`
<p>Management Center events store karta hai, lekin SOC shayad hi usmein rehta hai. Analysts <b>Splunk</b> jaise SIEM mein kaam karte hain, jahan firewall events endpoint, identity, DNS aur cloud logs ke bagal mein hote hain. Yeh chapter dikhata hai ki events Secure Firewall se teen tareekon se kaise nikalte hain aur unmein kaise chunna hai.</p>

<h3>Ek analogy: postcards aur registered parcels</h3>
<p><b>Syslog</b> message ek postcard hai: tez, sasta, koi bhi padh sakta hai, seedha wahin se bheja jaata hai jahan likha gaya, aur agar ek kho jaaye (UDP) to kisi ko pata nahi chalta. <b>eStreamer</b> head office ki registered parcel service hai: aap certificate se sign up karte ho, exactly chunte ho ki kis tarah ke parcels chahiye, aur har ek apne saare attachments (packet data, user, application, file details) ke saath ek authenticated channel par poora pahunchta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="SIEM tak event paths">
<rect x="20" y="150" width="130" height="55" rx="8" fill="#fed7aa"/><text x="85" y="173" text-anchor="middle" class="svg-ink" font-size="13">FTD1</text><text x="85" y="191" text-anchor="middle" class="svg-muted" font-size="12">LINA + Snort</text>
<rect x="250" y="40" width="160" height="55" rx="8" fill="#ddd6fe"/><text x="330" y="63" text-anchor="middle" class="svg-ink" font-size="13">Management Center</text><text x="330" y="81" text-anchor="middle" class="svg-muted" font-size="12">event store</text>
<rect x="480" y="100" width="150" height="55" rx="8" fill="#fde68a"/><text x="555" y="123" text-anchor="middle" class="svg-ink" font-size="13">Splunk</text><text x="555" y="141" text-anchor="middle" class="svg-muted" font-size="12">siem.nwk.example</text>
<rect x="250" y="190" width="160" height="45" rx="8" fill="#e2e8f0"/><text x="330" y="217" text-anchor="middle" class="svg-ink" font-size="13">SAL (cloud / on-prem)</text>
<line x1="150" y1="165" x2="250" y2="80" stroke="#64748b" stroke-width="2"/><text x="160" y="110" class="svg-muted" font-size="12">sftunnel 8305</text>
<line x1="410" y1="70" x2="480" y2="115" stroke="#64748b" stroke-width="2"/><text x="470" y="80" text-anchor="middle" class="svg-accent" font-size="12">eStreamer 8302</text>
<line x1="150" y1="180" x2="480" y2="135" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="330" y="160" text-anchor="middle" class="svg-accent" font-size="12">device se syslog</text>
<line x1="150" y1="195" x2="250" y2="212" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Events Management Center tak jaate hain aur wahan se eStreamer se, ya seedha device se syslog se, ya Security Analytics and Logging tak.</p></div>

<h3>Path 1 — Management Center se eStreamer</h3>
<p><b>eStreamer (Event Streamer)</b> Management Center ki API hai jo events ko external client tak stream karti hai. Yeh <b>TCP 8302</b> par TLS aur <b>client-certificate</b> authentication ke saath chalti hai. Management Center ke eStreamer page par aap bhejne wale event types tick karte ho (intrusion events aur unka packet data, connection aur Security Intelligence events, file aur malware events, correlation events, discovery aur user activity), phir SIEM ke IP ya hostname ke liye password ke saath <b>client create</b> karte ho; Management Center ek PKCS#12 file banata hai jise aap client par install karte ho. Splunk mein client <b>Cisco Security Cloud</b> app hai, jismein Secure Firewall eStreamer input hai (isne purane eNcore add-on ki jagah li).</p>
<p>eStreamer sabse rich data deta hai — events user, application, URL category, file disposition aur geolocation ke saath enriched hote hain, bilkul waise jaise aap Management Center mein dekhte ho.</p>

<h3>Path 2 — seedha Threat Defense se syslog</h3>
<p>Do alag engines syslog banate hain. <b>LINA</b> messages (interface, NAT, VPN, connection build/teardown — jaani-pehchaani %FTD-6-302013 family) <b>Devices → Platform Settings → Syslog</b> mein configure hote hain: logging enabled, destinations, servers (IP, interface, UDP ya TCP, optional secure syslog). <b>Snort</b> events (connection, intrusion, file, malware) tab bheje jaate hain jab access control policy ka <b>Logging</b> tab (ya har rule ki logging setting) aisa kahe, ya to syslog alert se ya Platform Settings servers se. Snort syslog message IDs 430001 (intrusion), 430002 (connection start), 430003 (connection end), 430004 (file) aur 430005 (file malware) use karta hai.</p>
<pre class="code"><span class="c">! Devices → Platform Settings → Syslog → Syslog Servers</span>
IP Address   : siem.nwk.example (10.0.9.30)
Protocol     : TCP 1470               <span class="c">! TCP: server chala jaaye to delivery ka pata chalta hai</span>
Interface    : inside
<span class="c">! Policies → Access Control → NK-ACP → Logging</span>
IPS Settings : Send Syslog messages for IPS events
Syslog source: Use the syslog settings in the FTD Platform Settings</pre>
<pre class="out"><span class="hl">%FTD-1-430001:</span> EventPriority: High, InstanceID: 1, ConnectionID: 5, AccessControlRuleAction: Allow, SrcIP: 10.0.1.10, DstIP: 8.8.8.8, SrcPort: 51522, DstPort: 80, Protocol: tcp, IngressInterface: inside, EgressInterface: outside, IngressZone: INSIDE, EgressZone: OUTSIDE, Priority: 1, GID: 1, <span class="hl">SID: 58003</span>, Revision: 1, Message: MALWARE-CNC outbound beacon from infected host (nk-sim), Classification: A Network Trojan was Detected, ApplicationProtocol: HTTP, IntrusionPolicy: Balanced Security and Connectivity, ACPolicy: NK-ACP, AccessControlRuleName: Inside-Out, <span class="hl">InlineResult: Blocked</span></pre>

<h3>Path 3 — Security Analytics and Logging (SAL)</h3>
<p><b>SAL</b> firewall events ke liye Cisco ka apna log store hai, <b>SaaS</b> (devices Secure Event Connector ke through bhejte hain, Security Cloud Control mein dikhta hai) ya <b>on premises</b> (data store ke saath Secure Network Analytics manager) ke roop mein. Yeh har connection event ke liye SIEM ingest ka paisa diye bina lamba retention aur traffic analytics deta hai, aur Management Center ise remotely query kar sakta hai.</p>

<table class="cmp"><tr><th></th><th>eStreamer</th><th>Device syslog</th><th>SAL</th></tr>
<tr><td>Kaun bhejta hai</td><td>Management Center</td><td>Har Threat Defense</td><td>Devices / connector</td></tr>
<tr><td>Transport</td><td>TCP 8302, TLS, client cert</td><td>UDP ya TCP (optional TLS)</td><td>Secure connector / on-prem collector</td></tr>
<tr><td>Detail</td><td>Sabse rich, enriched</td><td>Text fields, packet data nahi</td><td>Rich, firewall-focused</td></tr>
<tr><td>Kiske liye best</td><td>Cisco app wala SIEM</td><td>Koi bhi SIEM, simple, devices ke saath scale</td><td>Lamba retention, cost control</td></tr></table>

<div class="eg"><p><b>Worked example — volume.</b> 2,000 users roz lagbhag 4 crore (40 million) connections banate hain. Har connection ko start aur end dono par log karne se yeh double ho jaata hai. Sirf end of connection par, aur sirf important rules par log karne se yeh lagbhag 1.5 crore reh jaata hai; intrusion, file aur malware events kuch hazaar hote hain. Kai SOCs saare security events (intrusion, malware, Security Intelligence, correlation) Splunk ko bhejte hain aur bulk connection logs SAL mein rakhte hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> SIEM aur Management Center ke beech ka firewall TCP 8302 block kar raha hai. eStreamer client certificate us IP se alag IP ke liye bana jahan se SIEM connect karta hai. Syslog mein Snort events ki ummeed jab sirf LINA syslog configure tha. Har jagah connections ko beginning aur end dono par log karna, phir SIEM licence khatam ho jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> eStreamer <b>Management Center</b> serve karta hai (TCP 8302, certificate authentication), managed device nahi. Snort events ka syslog seedha device se aa sakta hai. Intrusion syslog 430001 hai; connection end 430003.</p></div>

<div class="scn"><h4>Khamosh Splunk dashboard</h4><p>Management Center upgrade ke baad Splunk mein SOC ka firewall dashboard flat ho gaya. eStreamer input logs mein TLS handshake failures the. Engineer ne eStreamer client entry check ki: PKCS#12 file migration se pehle purane SIEM collector IP ke liye bani thi, aur naya collector wahi certificate alag address se present kar raha tha. Usne 10.0.9.30 ke liye naya client banaya, naya PKCS#12 Cisco Security Cloud app mein install kiya, aur events aakhri bookmark se bina gap ke resume ho gaye.</p><p><b>Seekh:</b> eStreamer client ko uske address se bandhe certificate se authenticate karta hai. Collector move ho to naya client banao.</p></div>

<div class="iv"><p class="q">"Aap Secure Firewall intrusion events Splunk mein kaise laoge, aur trade-offs kya hain?"</p><p>Strong answer: ya to Management Center se Cisco Security Cloud app mein eStreamer — TCP 8302, client certificate, sabse rich enriched data, saare devices ke liye ek source — ya har Threat Defense se seedha syslog, Snort events ke liye access policy logging settings (intrusion ke liye 430001) aur LINA messages ke liye Platform Settings use karke, jo simple hai aur kisi bhi SIEM ke saath chalta hai par kam context deta hai. Bulk connection logs ke lambe retention ke liye Security Analytics and Logging jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>eStreamer: Management Center → SIEM, TCP 8302, client certificate ke saath TLS, sabse rich data.</li>
<li>Syslog: LINA Platform Settings se; Snort events access policy Logging settings se (430001–430005).</li>
<li>Splunk eStreamer data ingest karne ke liye Cisco Security Cloud app use karta hai.</li>
<li>SAL firewall events ko cloud ya on premises mein lambe samay tak rakhta hai.</li>
<li>Volume plan karo: jo zaroori hai woh log karo, end of connection par, aur bulk logs samajhdaari se route karo.</li>
</ul></div>
`}};export{e as default};