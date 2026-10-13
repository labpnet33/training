var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p><b>You now have the telemetry and automation objectives of SPCOR 350-501 covered.</b> Use the checklist to spot gaps. Remember there are no simulator labs here; to build the same muscles use encor-yang (YANG), encor-python (APIs), enarsi-security and sec-infra.</p>
<h3>Can-do checklist</h3>
<ul><li>Explain why streaming telemetry scales better than polling.</li>
<li>Read a YANG path and say whether it is operational or configuration data.</li>
<li>Compare NETCONF, RESTCONF and gNMI by transport, port and encoding.</li>
<li>List the four gNMI RPCs and the Subscribe modes.</li>
<li>Configure a dial-out subscription with sensor group, destination group and interval.</li>
<li>Explain NSO components and FASTMAP and run a dry-run workflow.</li>
<li>Explain secure ZTP and its trust model.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>MDT</dt><dd>Model-driven telemetry.</dd><dt>gNMI</dt><dd>gRPC Network Management Interface (OpenConfig).</dd><dt>Sensor path</dt><dd>YANG path that names the data to stream.</dd><dt>Dial-out</dt><dd>Router initiates the telemetry connection.</dd><dt>NED</dt><dd>Network Element Driver in NSO.</dd><dt>CDB</dt><dd>NSO configuration database.</dd><dt>FASTMAP</dt><dd>NSO algorithm for service create, change and delete.</dd><dt>IDevID</dt><dd>Manufacturer-installed device identity certificate.</dd></dl>
<h3>Most tested facts</h3>
<ul><li>NETCONF: SSH port 830, XML. RESTCONF: REST with JSON or XML. gNMI: gRPC with protobuf.</li>
<li>gNMI RPCs: Capabilities, Get, Set, Subscribe.</li>
<li>IOS XR MDT objects: destination-group, sensor-group, subscription; sample-interval in milliseconds.</li>
<li>Periodic suits counters; on-change suits state.</li>
<li>NSO: service model + mapping, NEDs, CDB, FASTMAP, atomic commit, dry-run, check-sync.</li>
<li>Secure ZTP: RFC 8572, ownership voucher RFC 8366, IDevID.</li></ul>
<h3>Command cheat sheet (reference, check your release)</h3>
<pre class="code">show telemetry model-driven subscription     <span class="c">! IOS XR</span>
show telemetry model-driven destination
show telemetry ietf subscription all         <span class="c">! IOS XE</span>
devices check-sync                           <span class="c">! NSO</span>
commit dry-run outformat native              <span class="c">! NSO</span>
ztp initiate                                 <span class="c">! IOS XR ZTP</span></pre>
<div class="eg"><p><b>Worked example.</b> Exam-style question: "A provider wants the router to push interface state changes to a collector with minimal data." The answer: model-driven telemetry dial-out with on-change subscription for the interface state path, optionally with a heartbeat, over gRPC with TLS.</p></div>
<div class="exam"><p><b>Exam trap.</b> Do not confuse the model (YANG), the transport (NETCONF, gRPC) and the encoding (XML, JSON, protobuf). Do not confuse NSO (service orchestration) with telemetry (monitoring).</p></div>
<div class="scn"><h4>From alarm to action</h4><p>A provider combined all three pieces: telemetry detected rising errors on a link, an alert opened a ticket with the data, and an NSO service change shifted the customer to a backup path after approval. New devices joined through secure ZTP and were in telemetry and NSO within minutes.</p><p><b>Lesson:</b> Telemetry sees, NSO acts, secure ZTP onboards.</p></div>
<div class="iv"><p class="q">"Describe an automated operations workflow for a provider."</p><p>Secure ZTP onboards devices with signed content and hands them to NSO. NSO configures services from YANG models in atomic transactions. Streaming telemetry over gNMI or MDT feeds a time-series store and alerts. Alerts open tickets or, with approval, trigger NSO changes. Everything is verified with dry-runs and logged for audit.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Streaming, model-driven telemetry replaces most polling.</li>
<li>Know the transports, encodings and gNMI RPCs.</li>
<li>Subscriptions: what, where, how often; periodic versus on-change.</li>
<li>NSO automates services atomically; FASTMAP handles lifecycle.</li>
<li>Secure ZTP trusts signatures, not the network.</li></ul></div>
`,hi:`
<p><b>Ab SPCOR 350-501 ke telemetry aur automation objectives cover ho gaye.</b> Gaps dhoondne ke liye checklist use karo. Yaad rakho yahan simulator labs nahi hain; wahi muscles banane ke liye encor-yang (YANG), encor-python (APIs), enarsi-security aur sec-infra use karo.</p>
<h3>Can-do checklist</h3>
<ul><li>Explain karo ki streaming telemetry polling se better scale kyun karti hai.</li>
<li>YANG path padho aur batao ki woh operational hai ya configuration data.</li>
<li>NETCONF, RESTCONF aur gNMI ko transport, port aur encoding se compare karo.</li>
<li>Char gNMI RPCs aur Subscribe modes list karo.</li>
<li>Sensor group, destination group aur interval ke saath dial-out subscription configure karo.</li>
<li>NSO components aur FASTMAP explain karo aur dry-run workflow chalao.</li>
<li>Secure ZTP aur uska trust model explain karo.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>MDT</dt><dd>Model-driven telemetry.</dd><dt>gNMI</dt><dd>gRPC Network Management Interface (OpenConfig).</dd><dt>Sensor path</dt><dd>YANG path jo stream hone wala data name karta hai.</dd><dt>Dial-out</dt><dd>Router telemetry connection initiate karta hai.</dd><dt>NED</dt><dd>NSO mein Network Element Driver.</dd><dt>CDB</dt><dd>NSO configuration database.</dd><dt>FASTMAP</dt><dd>Service create, change aur delete ke liye NSO algorithm.</dd><dt>IDevID</dt><dd>Manufacturer-installed device identity certificate.</dd></dl>
<h3>Sabse zyada tested facts</h3>
<ul><li>NETCONF: SSH port 830, XML. RESTCONF: JSON ya XML ke saath REST. gNMI: protobuf ke saath gRPC.</li>
<li>gNMI RPCs: Capabilities, Get, Set, Subscribe.</li>
<li>IOS XR MDT objects: destination-group, sensor-group, subscription; sample-interval milliseconds mein.</li>
<li>Periodic counters ke liye; on-change state ke liye.</li>
<li>NSO: service model + mapping, NEDs, CDB, FASTMAP, atomic commit, dry-run, check-sync.</li>
<li>Secure ZTP: RFC 8572, ownership voucher RFC 8366, IDevID.</li></ul>
<h3>Command cheat sheet (reference, apni release check karo)</h3>
<pre class="code">show telemetry model-driven subscription     <span class="c">! IOS XR</span>
show telemetry model-driven destination
show telemetry ietf subscription all         <span class="c">! IOS XE</span>
devices check-sync                           <span class="c">! NSO</span>
commit dry-run outformat native              <span class="c">! NSO</span>
ztp initiate                                 <span class="c">! IOS XR ZTP</span></pre>
<div class="eg"><p><b>Worked example.</b> Exam-style sawaal: "Provider chahta hai ki router interface state changes minimal data ke saath collector ko push kare." Jawab: interface state path ke liye on-change subscription ke saath model-driven telemetry dial-out, optional heartbeat ke saath, TLS ke saath gRPC par.</p></div>
<div class="exam"><p><b>Exam trap.</b> Model (YANG), transport (NETCONF, gRPC) aur encoding (XML, JSON, protobuf) ko mat milao. NSO (service orchestration) ko telemetry (monitoring) se mat milao.</p></div>
<div class="scn"><h4>Alarm se action tak</h4><p>Provider ne teeno pieces combine kiye: telemetry ne link par badhte errors detect kiye, alert ne data ke saath ticket kholi, aur approval ke baad NSO service change ne customer ko backup path par shift kiya. Naye devices secure ZTP se join hue aur minutes mein telemetry aur NSO mein the.</p><p><b>Lesson:</b> Telemetry dekhti hai, NSO act karta hai, secure ZTP onboard karta hai.</p></div>
<div class="iv"><p class="q">"Provider ke liye automated operations workflow describe karo."</p><p>Secure ZTP devices ko signed content ke saath onboard karta hai aur NSO ko saunpta hai. NSO YANG models se services ko atomic transactions mein configure karta hai. gNMI ya MDT par streaming telemetry time-series store aur alerts ko feed karti hai. Alerts tickets kholte hain ya approval ke saath NSO changes trigger karte hain. Sab kuch dry-runs se verify aur audit ke liye log hota hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Streaming, model-driven telemetry zyaadatar polling replace karti hai.</li>
<li>Transports, encodings aur gNMI RPCs jaano.</li>
<li>Subscriptions: kya, kahan, kitni baar; periodic versus on-change.</li>
<li>NSO services atomically automate karta hai; FASTMAP lifecycle handle karta hai.</li>
<li>Secure ZTP signatures par bharosa karta hai, network par nahi.</li></ul></div>
`}};export{e as default};