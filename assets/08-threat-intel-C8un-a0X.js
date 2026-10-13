var e={id:`intel`,h:{en:`Threat intelligence: IOCs, TTPs, STIX, TAXII, TLP and Talos`,hi:`Threat intelligence: IOCs, TTPs, STIX, TAXII, TLP aur Talos`},body:{en:`
<p>Neighbourhood watch groups work because one house's experience protects every house: "a white van without plates has been checking back doors on our street". <b>Threat intelligence</b> is the same idea for networks: evidence-based knowledge about threats, written in a form others can act on, shared quickly and with rules about who may see it.</p>

<h3>Levels and lifecycle</h3>
<ul>
<li><b>Strategic</b>: for executives. Which groups target our sector, and why.</li>
<li><b>Operational</b>: about specific campaigns: timing, targets, methods.</li>
<li><b>Tactical</b>: <b>TTPs</b> (tactics, techniques and procedures), usually mapped to <b>MITRE ATT&amp;CK</b> technique IDs such as T1566 Phishing.</li>
<li><b>Technical</b>: <b>IOCs</b> (indicators of compromise): file hashes, IP addresses, domains, URLs.</li>
</ul>
<p>The intelligence lifecycle is: direction (what do we need to know), collection, processing, analysis, dissemination, and feedback.</p>

<h3>The pyramid of pain</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Pyramid of pain">
<polygon points="320,10 370,50 270,50" fill="#fed7aa"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="12">TTPs</text>
<polygon points="270,54 370,54 410,86 230,86" fill="#fde68a"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="12">Tools</text>
<polygon points="230,90 410,90 450,122 190,122" fill="#ddd6fe"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="12">Network and host artifacts</text>
<polygon points="190,126 450,126 490,158 150,158" fill="#bbf7d0"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="12">Domain names</text>
<polygon points="150,162 490,162 530,194 110,194" fill="#bae6fd"/><text x="320" y="184" text-anchor="middle" class="svg-ink" font-size="12">IP addresses</text>
<polygon points="110,198 530,198 570,230 70,230" fill="#e2e8f0"/><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="12">Hash values</text>
<text x="590" y="30" text-anchor="end" class="svg-accent" font-size="12">tough for attacker to change</text>
<text x="590" y="236" text-anchor="end" class="svg-muted" font-size="12">trivial</text>
</svg><p class="cap">Blocking a hash costs the attacker seconds; detecting a technique forces them to change how they work.</p></div>
<p>IOCs are cheap to change, so they expire quickly. Detections built on behaviour and TTPs last longer. Good programs use both: IOCs for fast blocking, TTPs for durable detection and hunting.</p>

<h3>STIX 2.1: the language</h3>
<p><b>STIX</b> (Structured Threat Information eXpression) is a JSON format from OASIS. Its building blocks are <b>STIX Domain Objects (SDOs)</b> such as indicator, malware, threat-actor, attack-pattern, campaign, intrusion-set, vulnerability, course-of-action, identity and observed-data; <b>STIX Cyber-observable Objects</b> such as domain-name, ipv4-addr and file; and <b>Relationship objects</b> (for example indicator "indicates" malware) and <b>Sightings</b> ("we saw this indicator here").</p>
<pre class="code"><span class="c"># a STIX 2.1 indicator for the C2 domain from INC-2231 (abridged)</span>
{
  "type": "indicator",
  "spec_version": "2.1",
  "id": "indicator--6f1c2d9e-3b8a-4e41-9d0c-7a52b1e0c4aa",
  "created": "2026-09-27T10:15:00Z",
  "modified": "2026-09-27T10:15:00Z",
  "name": "C2 domain seen in INC-2231",
  "indicator_types": ["malicious-activity"],
  "pattern": "[domain-name:value = 'k7x2qvz9lm.example']",
  "pattern_type": "stix",
  "valid_from": "2026-09-27T10:15:00Z",
  "valid_until": "2026-12-27T00:00:00Z",
  "confidence": 85,
  "object_marking_refs": ["marking-definition--(TLP:AMBER)"]
}</pre>
<p>Read it like a defender: <b>pattern</b> is what to match, <b>valid_until</b> makes it expire, <b>confidence</b> (0 to 100) lets consumers decide whether to block or only alert, and the <b>marking</b> sets sharing limits.</p>

<h3>TAXII 2.1: the transport</h3>
<p><b>TAXII</b> (Trusted Automated eXchange of Intelligence Information) is a REST API over TLS that carries STIX. A server offers a <b>discovery</b> endpoint, one or more <b>API roots</b>, and inside them <b>collections</b>. Clients <b>poll</b> a collection with GET on its objects path (optionally only objects added after a time) and, if allowed, <b>publish</b> with POST. Remember: <b>STIX = content, TAXII = transport</b>.</p>

<h3>TLP 2.0: who may see it</h3>
<table class="cmp"><tr><th>Label</th><th>Sharing</th></tr>
<tr><td>TLP:RED</td><td>Named recipients only, for example people in the meeting</td></tr>
<tr><td>TLP:AMBER+STRICT</td><td>Recipient's organisation only</td></tr>
<tr><td>TLP:AMBER</td><td>Recipient's organisation and its clients, need-to-know</td></tr>
<tr><td>TLP:GREEN</td><td>The wider community, but not public</td></tr>
<tr><td>TLP:CLEAR</td><td>Public, no restriction (replaced TLP:WHITE)</td></tr>
</table>

<h3>Cisco Talos and consuming intelligence</h3>
<p><b>Cisco Talos</b> is Cisco's threat intelligence and research group. It analyses telemetry from Cisco products worldwide and turns it into reputation data for IPs, domains, URLs and files, Snort intrusion rules, ClamAV signatures and research reports, and it runs incident response. Talos intelligence arrives automatically in Secure Firewall Security Intelligence and IPS rules, Secure Access and Umbrella DNS verdicts, Secure Email reputation and Secure Endpoint detections. Your <b>own</b> intelligence and partner feeds are consumed through destination lists, custom detections, Threat Intelligence Director on the Management Center, and XDR or SIEM enrichment.</p>

<div class="eg"><p><b>Worked example: authoring, sharing, consuming.</b> In INC-2231 you confirmed <code>k7x2qvz9lm.example</code> as a command-and-control domain. <b>Author</b>: create a STIX indicator with confidence 85, expiry in 90 days and TLP:AMBER. <b>Share</b>: POST it to your sector ISAC's TAXII collection, so members can import it automatically, but it is not published on the internet. <b>Consume</b> internally: add the domain to the Secure Access IR-Blocklist (you will do that through the API in chapter 11) and let XDR enrich any past sightings.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Importing feeds with no expiry, so a shared-hosting IP stays blocked for years and breaks business sites. Treating every IOC with the same confidence. Sharing TLP:AMBER data in a public channel.</p></div>

<div class="exam"><p><b>Exam traps.</b> STIX is JSON content; TAXII is the transport with collections. TLP:CLEAR replaced TLP:WHITE in TLP 2.0. In the pyramid of pain, hash values are at the bottom (easiest to change) and TTPs at the top. Talos is Cisco's intelligence group, not a product you install.</p></div>

<div class="scn"><h4>The feed that blocked the CDN</h4><p>A company subscribed to a free IP blocklist and pushed it straight into the firewall's Security Intelligence. On a Monday, users could not reach several SaaS apps. The feed had listed a content delivery network address that malware had briefly used. The team switched to domain and URL indicators with confidence scores, set automatic expiry, kept the feed in "monitor" for a week before blocking, and added an allow-list for critical SaaS ranges.</p><p><b>Lesson:</b> intelligence needs context, confidence and expiry before it becomes a block.</p></div>

<div class="iv"><p class="q">"What is the difference between STIX and TAXII, and how would you share an indicator with partners?"</p><p>STIX is the standard JSON language for describing threat information: indicators, malware, actors, relationships, sightings. TAXII is the API that moves STIX between systems using collections that clients poll or publish to. To share, create a STIX indicator with confidence, validity and a TLP marking such as AMBER, and publish it to the partner community's TAXII collection. Mention Talos as the source of Cisco's built-in intelligence.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Intelligence levels: strategic, operational, tactical (TTPs, ATT&amp;CK), technical (IOCs).</li>
<li>Pyramid of pain: hashes and IPs are easy to change; TTPs are hard, so behaviour detections last longer.</li>
<li>STIX 2.1 = JSON objects (indicator, malware, relationship, sighting); TAXII 2.1 = REST transport with collections.</li>
<li>TLP 2.0: RED, AMBER+STRICT, AMBER, GREEN, CLEAR.</li>
<li>Cisco Talos feeds reputation, Snort and ClamAV content into Cisco products; add your own intel with confidence and expiry.</li>
</ul></div>
`,hi:`
<p>Neighbourhood watch groups isliye kaam karte hain kyunki ek ghar ka anubhav har ghar ko bachata hai: "bina number plate wali ek safed van hamari street ke back doors check kar rahi thi". <b>Threat intelligence</b> networks ke liye wahi idea hai: threats ke baare mein saboot par tika gyaan, aise roop mein likha ki doosre us par action le sakein, jaldi share kiya aur rules ke saath ki kaun dekh sakta hai.</p>

<h3>Levels aur lifecycle</h3>
<ul>
<li><b>Strategic</b>: executives ke liye. Kaunse groups hamare sector ko target karte hain, aur kyun.</li>
<li><b>Operational</b>: specific campaigns ke baare mein: timing, targets, methods.</li>
<li><b>Tactical</b>: <b>TTPs</b> (tactics, techniques aur procedures), aam taur par <b>MITRE ATT&amp;CK</b> technique IDs par mapped jaise T1566 Phishing.</li>
<li><b>Technical</b>: <b>IOCs</b> (indicators of compromise): file hashes, IP addresses, domains, URLs.</li>
</ul>
<p>Intelligence lifecycle hai: direction (humein kya jaanna hai), collection, processing, analysis, dissemination, aur feedback.</p>

<h3>Pyramid of pain</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Pyramid of pain">
<polygon points="320,10 370,50 270,50" fill="#fed7aa"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="12">TTPs</text>
<polygon points="270,54 370,54 410,86 230,86" fill="#fde68a"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="12">Tools</text>
<polygon points="230,90 410,90 450,122 190,122" fill="#ddd6fe"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="12">Network aur host artifacts</text>
<polygon points="190,126 450,126 490,158 150,158" fill="#bbf7d0"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="12">Domain names</text>
<polygon points="150,162 490,162 530,194 110,194" fill="#bae6fd"/><text x="320" y="184" text-anchor="middle" class="svg-ink" font-size="12">IP addresses</text>
<polygon points="110,198 530,198 570,230 70,230" fill="#e2e8f0"/><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="12">Hash values</text>
<text x="590" y="30" text-anchor="end" class="svg-accent" font-size="12">attacker ke liye badalna mushkil</text>
<text x="590" y="236" text-anchor="end" class="svg-muted" font-size="12">bahut aasaan</text>
</svg><p class="cap">Hash block karne se attacker ke kuch second jaate hain; technique detect karne se use kaam karne ka tareeka badalna padta hai.</p></div>
<p>IOCs badalna sasta hai, isliye woh jaldi expire hote hain. Behaviour aur TTPs par bani detections zyada chalti hain. Achhe programs dono use karte hain: tez blocking ke liye IOCs, tikaau detection aur hunting ke liye TTPs.</p>

<h3>STIX 2.1: bhasha</h3>
<p><b>STIX</b> (Structured Threat Information eXpression) OASIS ka JSON format hai. Iske building blocks hain <b>STIX Domain Objects (SDOs)</b> jaise indicator, malware, threat-actor, attack-pattern, campaign, intrusion-set, vulnerability, course-of-action, identity aur observed-data; <b>STIX Cyber-observable Objects</b> jaise domain-name, ipv4-addr aur file; aur <b>Relationship objects</b> (jaise indicator "indicates" malware) aur <b>Sightings</b> ("humne yeh indicator yahan dekha").</p>
<pre class="code"><span class="c"># INC-2231 ke C2 domain ke liye STIX 2.1 indicator (chhota kiya hua)</span>
{
  "type": "indicator",
  "spec_version": "2.1",
  "id": "indicator--6f1c2d9e-3b8a-4e41-9d0c-7a52b1e0c4aa",
  "created": "2026-09-27T10:15:00Z",
  "modified": "2026-09-27T10:15:00Z",
  "name": "C2 domain seen in INC-2231",
  "indicator_types": ["malicious-activity"],
  "pattern": "[domain-name:value = 'k7x2qvz9lm.example']",
  "pattern_type": "stix",
  "valid_from": "2026-09-27T10:15:00Z",
  "valid_until": "2026-12-27T00:00:00Z",
  "confidence": 85,
  "object_marking_refs": ["marking-definition--(TLP:AMBER)"]
}</pre>
<p>Ise defender ki tarah padho: <b>pattern</b> batata hai kya match karna hai, <b>valid_until</b> use expire karwata hai, <b>confidence</b> (0 se 100) consumers ko decide karne deta hai ki block karein ya sirf alert, aur <b>marking</b> sharing limits set karti hai.</p>

<h3>TAXII 2.1: transport</h3>
<p><b>TAXII</b> (Trusted Automated eXchange of Intelligence Information) TLS par ek REST API hai jo STIX le jaati hai. Server ek <b>discovery</b> endpoint, ek ya zyada <b>API roots</b>, aur unke andar <b>collections</b> deta hai. Clients collection ko uske objects path par GET se <b>poll</b> karte hain (chaho to sirf ek time ke baad jude objects), aur allowed ho to POST se <b>publish</b> karte hain. Yaad rakho: <b>STIX = content, TAXII = transport</b>.</p>

<h3>TLP 2.0: kaun dekh sakta hai</h3>
<table class="cmp"><tr><th>Label</th><th>Sharing</th></tr>
<tr><td>TLP:RED</td><td>Sirf named recipients, jaise meeting ke log</td></tr>
<tr><td>TLP:AMBER+STRICT</td><td>Sirf recipient ka organisation</td></tr>
<tr><td>TLP:AMBER</td><td>Recipient ka organisation aur uske clients, need-to-know</td></tr>
<tr><td>TLP:GREEN</td><td>Badi community, par public nahi</td></tr>
<tr><td>TLP:CLEAR</td><td>Public, koi restriction nahi (TLP:WHITE ki jagah)</td></tr>
</table>

<h3>Cisco Talos aur intelligence consume karna</h3>
<p><b>Cisco Talos</b> Cisco ka threat intelligence aur research group hai. Yeh duniya bhar ke Cisco products ki telemetry analyse karke use IPs, domains, URLs aur files ke reputation data, Snort intrusion rules, ClamAV signatures aur research reports mein badalta hai, aur incident response bhi chalata hai. Talos intelligence apne aap Secure Firewall Security Intelligence aur IPS rules, Secure Access aur Umbrella DNS verdicts, Secure Email reputation aur Secure Endpoint detections mein pahunchti hai. Aapki <b>apni</b> intelligence aur partner feeds destination lists, custom detections, Management Center par Threat Intelligence Director, aur XDR ya SIEM enrichment se consume hoti hain.</p>

<div class="eg"><p><b>Worked example: authoring, sharing, consuming.</b> INC-2231 mein aapne <code>k7x2qvz9lm.example</code> ko command-and-control domain confirm kiya. <b>Author</b>: confidence 85, 90 din mein expiry aur TLP:AMBER ke saath STIX indicator banao. <b>Share</b>: ise apne sector ISAC ke TAXII collection mein POST karo, taaki members ise automatically import kar sakein, par yeh internet par publish na ho. Andar <b>consume</b> karo: domain ko Secure Access IR-Blocklist mein jodo (chapter 11 mein API se karoge) aur XDR ko purani sightings enrich karne do.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Bina expiry feeds import karna, jisse shared-hosting IP saalon block rehta hai aur business sites tod deta hai. Har IOC ko same confidence dena. TLP:AMBER data public channel mein share karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> STIX JSON content hai; TAXII collections wala transport hai. TLP 2.0 mein TLP:CLEAR ne TLP:WHITE ki jagah li. Pyramid of pain mein hash values sabse neeche (badalna sabse aasaan) aur TTPs sabse upar. Talos Cisco ka intelligence group hai, install karne wala product nahi.</p></div>

<div class="scn"><h4>Feed jisne CDN block kar diya</h4><p>Ek company ne free IP blocklist subscribe ki aur use seedha firewall ki Security Intelligence mein daal diya. Ek Monday ko users kai SaaS apps tak nahi pahunch paaye. Feed ne ek content delivery network ka address list kiya tha jise malware ne thodi der use kiya tha. Team ne confidence scores ke saath domain aur URL indicators par switch kiya, automatic expiry set ki, block karne se pehle feed ko ek hafte "monitor" mein rakha, aur critical SaaS ranges ke liye allow-list jodi.</p><p><b>Seekh:</b> intelligence ko block banne se pehle context, confidence aur expiry chahiye.</p></div>

<div class="iv"><p class="q">"STIX aur TAXII mein kya fark hai, aur aap partners ke saath indicator kaise share karoge?"</p><p>STIX threat information describe karne ki standard JSON bhasha hai: indicators, malware, actors, relationships, sightings. TAXII woh API hai jo collections ke zariye STIX ko systems ke beech le jaati hai, jinhe clients poll ya publish karte hain. Share karne ke liye confidence, validity aur AMBER jaisi TLP marking ke saath STIX indicator banao, aur use partner community ke TAXII collection mein publish karo. Cisco ki built-in intelligence ke source ke roop mein Talos mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Intelligence levels: strategic, operational, tactical (TTPs, ATT&amp;CK), technical (IOCs).</li>
<li>Pyramid of pain: hashes aur IPs badalna aasaan; TTPs mushkil, isliye behaviour detections zyada chalti hain.</li>
<li>STIX 2.1 = JSON objects (indicator, malware, relationship, sighting); TAXII 2.1 = collections wala REST transport.</li>
<li>TLP 2.0: RED, AMBER+STRICT, AMBER, GREEN, CLEAR.</li>
<li>Cisco Talos reputation, Snort aur ClamAV content Cisco products mein bhejta hai; apni intel confidence aur expiry ke saath jodo.</li>
</ul></div>
`}};export{e as default};