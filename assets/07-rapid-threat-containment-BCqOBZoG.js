var e={id:`rtc`,h:{en:`Rapid Threat Containment end to end, and the quarantine lab`,hi:`Rapid Threat Containment end to end, aur quarantine lab`},body:{en:`
<p><b>Rapid Threat Containment (RTC)</b> is Cisco's name for the chain you built piece by piece in the last two chapters: the firewall <b>detects</b>, the Management Center <b>decides</b> through a correlation policy, pxGrid <b>carries</b> the request, and ISE <b>enforces</b> at the access port with a Change of Authorization (CoA). This chapter puts the chain together, shows the ISE and switch side, and walks the lab <b>"Rapid Threat Containment: quarantine an infected host automatically"</b>.</p>

<h3>An analogy: the hospital isolation ward</h3>
<p>A lab test (the firewall) finds an infectious patient. The lab does not walk to the ward and move the patient; it calls the hospital administration (the Management Center), which follows its protocol (correlation) and phones the ward manager (ISE) over the internal line (pxGrid). The ward manager moves the patient to the isolation room (quarantine authorization) and tells the nurses at the door (the switch, via CoA). When the patient is cured, the manager moves them back.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Rapid Threat Containment chain">
<rect x="10" y="190" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="212" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="65" y="230" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="170" y="190" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="225" y="220" text-anchor="middle" class="svg-ink" font-size="13">SW-ACC1</text>
<rect x="330" y="190" width="110" height="50" rx="8" fill="#fed7aa"/><text x="385" y="220" text-anchor="middle" class="svg-ink" font-size="13">FTD1</text>
<rect x="330" y="30" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="405" y="52" text-anchor="middle" class="svg-ink" font-size="13">Management Center</text><text x="405" y="70" text-anchor="middle" class="svg-muted" font-size="12">correlation</text>
<rect x="120" y="30" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="185" y="52" text-anchor="middle" class="svg-ink" font-size="13">ISE1</text><text x="185" y="70" text-anchor="middle" class="svg-muted" font-size="12">ANC Quarantine</text>
<line x1="120" y1="215" x2="170" y2="215" stroke="#64748b" stroke-width="2"/><line x1="280" y1="215" x2="330" y2="215" stroke="#64748b" stroke-width="2"/>
<line x1="395" y1="190" x2="400" y2="80" stroke="#64748b" stroke-width="2"/><text x="470" y="140" text-anchor="middle" class="svg-accent" font-size="12">1 intrusion event</text>
<line x1="330" y1="55" x2="250" y2="55" stroke="#64748b" stroke-width="2"/><text x="290" y="47" text-anchor="middle" class="svg-accent" font-size="12">2 pxGrid ANC</text>
<line x1="190" y1="80" x2="220" y2="190" stroke="#64748b" stroke-width="2"/><text x="140" y="140" text-anchor="middle" class="svg-accent" font-size="12">3 RADIUS CoA</text>
<text x="225" y="262" text-anchor="middle" class="svg-muted" font-size="12">4 port re-authorized: quarantine dACL / VLAN / SGT</text>
</svg><p class="cap">Detect on the firewall, decide on the Management Center, enforce on the access switch.</p></div>

<h3>The ISE side</h3>
<p>ISE needs three things. (1) An <b>ANC policy</b>: Operations → Adaptive Network Control → Policy List, name <code>Quarantine</code>, action QUARANTINE (other actions are PORT_BOUNCE and SHUT_DOWN). (2) An <b>authorization exception rule</b> that reacts to it: condition <code>Session:ANCPolicy EQUALS Quarantine</code>, result a restricted profile — a downloadable ACL that allows only DNS and the remediation server, a quarantine VLAN, or a Quarantined SGT. (3) Switches that accept <b>CoA</b>. When the Management Center's request arrives, ISE assigns the ANC policy to the endpoint (matched by IP to its MAC session), sends a CoA, the switch re-authenticates, and the exception rule now matches.</p>
<pre class="code"><span class="c">! SW-ACC1 — accept Change of Authorization from ISE (taught fully in sec-ise)</span>
aaa server radius dynamic-author
 client 10.0.9.20 server-key NkCoA-Key
<span class="c">! ISE sends CoA to UDP 1700 by default for Cisco devices</span></pre>
<pre class="out">SW-ACC1# show access-session interface GigabitEthernet1/0/5 details
          MAC Address:  0050.56aa.0110
         IPv4 Address:  10.0.1.10
            User-Name:  priya@nwk.example
               Status:  Authorized
Server Policies:
<span class="hl">              ACS ACL: xACSACLx-IP-QUARANTINE-ACL-5f3a2b1c</span></pre>

<h3>The lab, step by step</h3>
<p>The lab topology is the same as before; the access rule Inside-Out already uses the intrusion policy <b>Balanced Security and Connectivity</b>, in which rule 1:58003 (the nk-sim beacon) drops. The lab simulates ISE and the switch: a quarantined host is shown blocked at FTD1 with the reason <b>RTC Quarantine</b>, standing in for the access-port enforcement.</p>
<p><b>Task 1 — build the correlation.</b> Policies → Correlation: rule <b>Contain-CnC</b>, event "intrusion event", priority ≤ 1, response <b>pxGrid Mitigation: ISE ANC Quarantine</b>. Tick the correlation policy active. No Deploy.</p>
<p><b>Task 2 — play the infected laptop.</b></p>
<pre class="code"><span class="c">! on PC1 — a harmless simulated beacon</span>
curl news.example/nk-sim/beacon</pre>
<pre class="out">PC1&gt; curl news.example/nk-sim/beacon
<span class="hl">curl: (28) Operation timed out after 5001 milliseconds with 0 bytes received</span>

Analysis &gt; Correlation
Time      Rule         Event                                                        Host        Response
11:20:14  Contain-CnC  1:58003 MALWARE-CNC outbound beacon from infected host (nk-sim)  10.0.1.10  ISE-ANC-Quarantine
<span class="hl">Result: Remediation successful: pxGrid ANC policy "Quarantine" applied to 10.0.1.10</span></pre>
<p><b>Task 3 — prove containment, and that it is targeted.</b></p>
<pre class="out">PC1&gt; curl news.example
<span class="hl">curl: (28) Failed to connect to news.example port 80 after 2001 ms: Timeout was reached</span>
ADMIN&gt; curl news.example
&lt;html&gt;&lt;body&gt;…MyPnetLab news…&lt;/body&gt;&lt;/html&gt;</pre>
<p>PC1 can no longer browse even a clean site, while ADMIN (10.0.1.50) is unaffected. The quarantined host the lab asks for is <b>10.0.1.10</b>; Security Intelligence events show its traffic blocked by list <b>RTC Quarantine</b>.</p>
<p><b>Task 4 — release after clean-up.</b> Analysis → Correlation → Release 10.0.1.10, then <code>curl news.example</code> on PC1 works again. In a real network the Management Center does <b>not</b> release automatically: an operator clears the ANC assignment in ISE (Operations → Adaptive Network Control → Endpoint Assignment), ISE sends another CoA and the port returns to its normal authorization.</p>

<div class="eg"><p><b>Worked example — timing.</b> 11:20:14.2 beacon dropped (intrusion event). 11:20:14.6 event received by the Management Center, rule matches. 11:20:15.1 pxGrid request accepted by ISE. 11:20:15.4 CoA to SW-ACC1, re-authentication. 11:20:16 quarantine dACL applied. About two seconds from first beacon to containment — no analyst could do that.</p></div>

<div class="warn"><p><b>Common mistakes.</b> ANC policy exists in ISE but no authorization rule uses <code>Session:ANCPolicy</code>, so the CoA re-applies the same normal access. The switch lacks <code>aaa server radius dynamic-author</code> and ignores the CoA. The host has no ISE session (a static server), so ISE cannot map the IP to an endpoint. Forgetting the release process, leaving cleaned laptops quarantined for days.</p></div>

<div class="exam"><p><b>Exam trap.</b> Order of the chain: Threat Defense event → Management Center correlation → pxGrid → ISE ANC → RADIUS CoA → switch/WLC. RTC requires an ISE session for the endpoint. ANC actions: Quarantine, Port Bounce, Shut Down.</p></div>

<div class="scn"><h4>Quarantine that changed nothing</h4><p>After building RTC, a retailer tested it: Analysis → Correlation → Status said "Successful completion of remediation", and ISE showed the laptop under Endpoint Assignment with policy Quarantine — yet the laptop kept full access. ISE live logs showed the CoA and a re-authentication that matched the normal Employee rule. The authorization policy had no exception rule for <code>Session:ANCPolicy EQUALS Quarantine</code>. Adding it above the standard rules fixed the test.</p><p><b>Lesson:</b> ANC only marks the endpoint; your authorization policy decides what "quarantined" actually means.</p></div>

<div class="iv"><p class="q">"Explain Rapid Threat Containment between Secure Firewall and ISE, step by step."</p><p>Strong answer: Threat Defense raises an event (for example a priority-1 intrusion event); the Management Center's active correlation policy matches it and runs the pxGrid Mitigation remediation; over pxGrid it asks ISE to apply an ANC policy to the source IP; ISE maps it to the endpoint's session, assigns the ANC policy and sends a RADIUS CoA; the switch re-authenticates and an authorization exception on Session:ANCPolicy applies the quarantine result. Release is done by clearing the ANC assignment in ISE.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RTC = detect (Threat Defense) → decide (correlation) → carry (pxGrid) → enforce (ISE CoA).</li>
<li>ISE needs an ANC policy, an authorization rule on Session:ANCPolicy, and CoA-capable switches.</li>
<li>In the lab, rule Contain-CnC quarantines 10.0.1.10 after the 1:58003 beacon; ADMIN stays online.</li>
<li>Release is manual: clear the ANC assignment, ISE sends a new CoA.</li>
<li>No ISE session for the host means no RTC.</li>
</ul></div>
`,hi:`
<p><b>Rapid Threat Containment (RTC)</b> us chain ka Cisco naam hai jo aapne pichhle do chapters mein tukdon mein banayi: firewall <b>detect</b> karta hai, Management Center correlation policy se <b>decide</b> karta hai, pxGrid request <b>le jaata</b> hai, aur ISE access port par Change of Authorization (CoA) se <b>enforce</b> karta hai. Yeh chapter chain ko jodta hai, ISE aur switch side dikhata hai, aur lab <b>"Rapid Threat Containment: quarantine an infected host automatically"</b> walk karta hai.</p>

<h3>Ek analogy: hospital ka isolation ward</h3>
<p>Ek lab test (firewall) ek infectious patient dhoondhta hai. Lab khud ward mein jaakar patient ko move nahi karti; woh hospital administration (Management Center) ko call karti hai, jo apna protocol (correlation) follow karta hai aur internal line (pxGrid) par ward manager (ISE) ko phone karta hai. Ward manager patient ko isolation room (quarantine authorization) mein bhejta hai aur gate ki nurses (switch, CoA se) ko batata hai. Jab patient theek ho jaata hai, manager use wapas bhej deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Rapid Threat Containment chain">
<rect x="10" y="190" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="212" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="65" y="230" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="170" y="190" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="225" y="220" text-anchor="middle" class="svg-ink" font-size="13">SW-ACC1</text>
<rect x="330" y="190" width="110" height="50" rx="8" fill="#fed7aa"/><text x="385" y="220" text-anchor="middle" class="svg-ink" font-size="13">FTD1</text>
<rect x="330" y="30" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="405" y="52" text-anchor="middle" class="svg-ink" font-size="13">Management Center</text><text x="405" y="70" text-anchor="middle" class="svg-muted" font-size="12">correlation</text>
<rect x="120" y="30" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="185" y="52" text-anchor="middle" class="svg-ink" font-size="13">ISE1</text><text x="185" y="70" text-anchor="middle" class="svg-muted" font-size="12">ANC Quarantine</text>
<line x1="120" y1="215" x2="170" y2="215" stroke="#64748b" stroke-width="2"/><line x1="280" y1="215" x2="330" y2="215" stroke="#64748b" stroke-width="2"/>
<line x1="395" y1="190" x2="400" y2="80" stroke="#64748b" stroke-width="2"/><text x="470" y="140" text-anchor="middle" class="svg-accent" font-size="12">1 intrusion event</text>
<line x1="330" y1="55" x2="250" y2="55" stroke="#64748b" stroke-width="2"/><text x="290" y="47" text-anchor="middle" class="svg-accent" font-size="12">2 pxGrid ANC</text>
<line x1="190" y1="80" x2="220" y2="190" stroke="#64748b" stroke-width="2"/><text x="140" y="140" text-anchor="middle" class="svg-accent" font-size="12">3 RADIUS CoA</text>
<text x="225" y="262" text-anchor="middle" class="svg-muted" font-size="12">4 port re-authorize: quarantine dACL / VLAN / SGT</text>
</svg><p class="cap">Firewall par detect, Management Center par decide, access switch par enforce.</p></div>

<h3>ISE side</h3>
<p>ISE ko teen cheezein chahiye. (1) Ek <b>ANC policy</b>: Operations → Adaptive Network Control → Policy List, naam <code>Quarantine</code>, action QUARANTINE (doosre actions PORT_BOUNCE aur SHUT_DOWN hain). (2) Ek <b>authorization exception rule</b> jo uspar react kare: condition <code>Session:ANCPolicy EQUALS Quarantine</code>, result ek restricted profile — ek downloadable ACL jo sirf DNS aur remediation server allow kare, quarantine VLAN, ya Quarantined SGT. (3) Switches jo <b>CoA</b> accept karein. Jab Management Center ki request aati hai, ISE endpoint ko ANC policy assign karta hai (IP se uske MAC session tak match karke), CoA bhejta hai, switch re-authenticate karta hai, aur ab exception rule match hoti hai.</p>
<pre class="code"><span class="c">! SW-ACC1 — ISE se Change of Authorization accept karo (poora sec-ise mein padhaya gaya)</span>
aaa server radius dynamic-author
 client 10.0.9.20 server-key NkCoA-Key
<span class="c">! Cisco devices ke liye ISE default UDP 1700 par CoA bhejta hai</span></pre>
<pre class="out">SW-ACC1# show access-session interface GigabitEthernet1/0/5 details
          MAC Address:  0050.56aa.0110
         IPv4 Address:  10.0.1.10
            User-Name:  priya@nwk.example
               Status:  Authorized
Server Policies:
<span class="hl">              ACS ACL: xACSACLx-IP-QUARANTINE-ACL-5f3a2b1c</span></pre>

<h3>Lab, step by step</h3>
<p>Lab topology pehle jaisi hai; access rule Inside-Out pehle se intrusion policy <b>Balanced Security and Connectivity</b> use karti hai, jismein rule 1:58003 (nk-sim beacon) drop karti hai. Lab ISE aur switch ko simulate karti hai: quarantined host FTD1 par reason <b>RTC Quarantine</b> ke saath blocked dikhta hai, jo access-port enforcement ki jagah khada hai.</p>
<p><b>Task 1 — correlation banao.</b> Policies → Correlation: rule <b>Contain-CnC</b>, event "intrusion event", priority ≤ 1, response <b>pxGrid Mitigation: ISE ANC Quarantine</b>. Correlation policy active tick karo. Deploy nahi.</p>
<p><b>Task 2 — infected laptop bano.</b></p>
<pre class="code"><span class="c">! PC1 par — ek harmless simulated beacon</span>
curl news.example/nk-sim/beacon</pre>
<pre class="out">PC1&gt; curl news.example/nk-sim/beacon
<span class="hl">curl: (28) Operation timed out after 5001 milliseconds with 0 bytes received</span>

Analysis &gt; Correlation
Time      Rule         Event                                                        Host        Response
11:20:14  Contain-CnC  1:58003 MALWARE-CNC outbound beacon from infected host (nk-sim)  10.0.1.10  ISE-ANC-Quarantine
<span class="hl">Result: Remediation successful: pxGrid ANC policy "Quarantine" applied to 10.0.1.10</span></pre>
<p><b>Task 3 — containment saabit karo, aur yeh ki woh targeted hai.</b></p>
<pre class="out">PC1&gt; curl news.example
<span class="hl">curl: (28) Failed to connect to news.example port 80 after 2001 ms: Timeout was reached</span>
ADMIN&gt; curl news.example
&lt;html&gt;&lt;body&gt;…MyPnetLab news…&lt;/body&gt;&lt;/html&gt;</pre>
<p>PC1 ab clean site bhi browse nahi kar sakta, jabki ADMIN (10.0.1.50) par koi asar nahi. Lab jo quarantined host poochti hai woh <b>10.0.1.10</b> hai; Security Intelligence events uska traffic list <b>RTC Quarantine</b> se blocked dikhate hain.</p>
<p><b>Task 4 — clean-up ke baad release.</b> Analysis → Correlation → Release 10.0.1.10, phir PC1 par <code>curl news.example</code> phir chalta hai. Asli network mein Management Center apne aap release <b>nahi</b> karta: operator ISE mein ANC assignment clear karta hai (Operations → Adaptive Network Control → Endpoint Assignment), ISE ek aur CoA bhejta hai aur port apne normal authorization par laut aata hai.</p>

<div class="eg"><p><b>Worked example — timing.</b> 11:20:14.2 beacon drop (intrusion event). 11:20:14.6 Management Center ko event mila, rule match. 11:20:15.1 ISE ne pxGrid request accept ki. 11:20:15.4 SW-ACC1 ko CoA, re-authentication. 11:20:16 quarantine dACL laga. Pehle beacon se containment tak lagbhag do second — koi analyst itna tez nahi kar sakta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> ISE mein ANC policy hai lekin koi authorization rule <code>Session:ANCPolicy</code> use nahi karti, isliye CoA wahi normal access dobara laga deta hai. Switch mein <code>aaa server radius dynamic-author</code> nahi hai aur woh CoA ignore karta hai. Host ka koi ISE session nahi hai (static server), isliye ISE IP ko endpoint se map nahi kar sakta. Release process bhool jaana, jisse saaf kiye laptops dinon tak quarantine rehte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Chain ka order: Threat Defense event → Management Center correlation → pxGrid → ISE ANC → RADIUS CoA → switch/WLC. RTC ke liye endpoint ka ISE session chahiye. ANC actions: Quarantine, Port Bounce, Shut Down.</p></div>

<div class="scn"><h4>Woh quarantine jisne kuch nahi badla</h4><p>RTC banane ke baad ek retailer ne test kiya: Analysis → Correlation → Status ne kaha "Successful completion of remediation", aur ISE ne laptop ko Endpoint Assignment ke neeche policy Quarantine ke saath dikhaya — phir bhi laptop ka poora access bana raha. ISE live logs mein CoA aur ek re-authentication dikha jo normal Employee rule se match hua. Authorization policy mein <code>Session:ANCPolicy EQUALS Quarantine</code> ke liye koi exception rule nahi thi. Use standard rules ke upar jodne se test theek ho gaya.</p><p><b>Seekh:</b> ANC sirf endpoint ko mark karta hai; "quarantined" ka asal matlab aapki authorization policy tay karti hai.</p></div>

<div class="iv"><p class="q">"Secure Firewall aur ISE ke beech Rapid Threat Containment step by step samjhao."</p><p>Strong answer: Threat Defense ek event banata hai (jaise priority-1 intrusion event); Management Center ki active correlation policy use match karke pxGrid Mitigation remediation chalati hai; pxGrid par woh ISE se source IP par ANC policy lagane ko kehta hai; ISE use endpoint ke session se map karta hai, ANC policy assign karta hai aur RADIUS CoA bhejta hai; switch re-authenticate karta hai aur Session:ANCPolicy par authorization exception quarantine result lagata hai. Release ISE mein ANC assignment clear karke hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RTC = detect (Threat Defense) → decide (correlation) → carry (pxGrid) → enforce (ISE CoA).</li>
<li>ISE ko ANC policy, Session:ANCPolicy par authorization rule, aur CoA-capable switches chahiye.</li>
<li>Lab mein rule Contain-CnC 1:58003 beacon ke baad 10.0.1.10 ko quarantine karti hai; ADMIN online rehta hai.</li>
<li>Release manual hai: ANC assignment clear karo, ISE naya CoA bhejta hai.</li>
<li>Host ka ISE session nahi to RTC nahi.</li>
</ul></div>
`}};export{e as default};