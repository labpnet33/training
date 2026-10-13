var e={id:`connector-architecture`,h:{en:`Secure Client and the Secure Endpoint connector`,hi:`Secure Client aur Secure Endpoint connector`},body:{en:`
<p>Picture a chain of pharmacies. Each shop has a pharmacist (the connector) who can make quick decisions locally: "this prescription is fine", "this one is clearly forged". For anything doubtful, the pharmacist phones head office (the cloud), which sees prescriptions from every shop in the country and knows instantly if the same forged prescription appeared in three cities this morning. Head office also writes the rulebook (the policy) and decides which shops follow which rulebook (groups).</p>

<h3>Cisco Secure Client: one agent, many modules</h3>
<p><b>Cisco Secure Client</b> (formerly AnyConnect Secure Mobility Client) is a single endpoint agent framework with optional modules. You install only what each device needs:</p>
<table class="cmp"><tr><th>Module</th><th>What it does</th></tr>
<tr><td>VPN</td><td>Remote access SSL/IPsec VPN (the <i>VPN on Threat Defense</i> module)</td></tr>
<tr><td>Secure Endpoint</td><td>EPP and EDR connector (this module)</td></tr>
<tr><td>Umbrella / Secure Access roaming</td><td>DNS-layer and secure web protection off-network</td></tr>
<tr><td>ISE Posture</td><td>Posture checks for ISE (the <i>ISE</i> module)</td></tr>
<tr><td>Network Visibility Module (NVM)</td><td>Flow telemetry with process context, sent to a collector or SIEM</td></tr>
<tr><td>Network Access Manager</td><td>802.1X supplicant for wired and wireless</td></tr>
</table>
<p>Secure Endpoint can be deployed as a Secure Client module or as its own standalone connector installer. Either way, it is the same <b>connector</b>, the term Cisco uses for the endpoint agent. Connectors exist for Windows, macOS, Linux, Android and iOS, with the richest engine set on Windows.</p>

<h3>The cloud console and how the pieces relate</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Connector, groups and policies">
<rect x="230" y="15" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">Secure Endpoint cloud</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">console, dispositions, Talos</text>
<rect x="40" y="105" width="160" height="44" rx="8" fill="#fde68a"/><text x="120" y="132" text-anchor="middle" class="svg-ink" font-size="13">Policy NK-Standard</text>
<rect x="240" y="105" width="160" height="44" rx="8" fill="#bae6fd"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="13">Group Endpoints</text>
<rect x="440" y="105" width="160" height="44" rx="8" fill="#bae6fd"/><text x="520" y="132" text-anchor="middle" class="svg-ink" font-size="13">Group Workstations</text>
<rect x="240" y="190" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="217" text-anchor="middle" class="svg-ink" font-size="13">PC1 connector 8.4.1</text>
<rect x="440" y="190" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="520" y="217" text-anchor="middle" class="svg-ink" font-size="13">PC-SALES, PC-HR, PC-FIN</text>
<line x1="200" y1="127" x2="240" y2="127" stroke="#64748b" stroke-width="2"/><text x="220" y="100" text-anchor="middle" class="svg-muted" font-size="12">uses</text>
<line x1="320" y1="149" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><line x1="520" y1="149" x2="520" y2="190" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="65" x2="320" y2="105" stroke="#64748b" stroke-dasharray="4 4"/><line x1="380" y1="65" x2="520" y2="105" stroke="#64748b" stroke-dasharray="4 4"/>
</svg><p class="cap">A computer belongs to one group; a group points at one policy per operating system; the policy controls the connector.</p></div>
<dl class="terms">
<dt>Computer</dt><dd>One endpoint with a registered connector. The console shows its hostname, OS, connector version, group, policy, last seen time and isolation state.</dd>
<dt>Group</dt><dd>A container of computers. Each group has one policy per OS (Windows, Mac, Linux and so on). Moving a computer between groups changes its policy. Groups can be nested and inherit.</dd>
<dt>Policy</dt><dd>The rulebook: protection modes, which engines are on, exclusions, outbreak-control lists, proxy settings, update schedule and the connector UI options. Cisco ships default policies such as Audit, Protect, Triage, Server and Domain Controller; you usually copy one and adjust it.</dd>
<dt>Deployment package</dt><dd>An installer downloaded from the console for a chosen group. A connector installed from it registers into that group automatically.</dd>
</dl>

<h3>How a file verdict is reached</h3>
<p>When a file is copied, moved or executed, the connector computes its <b>SHA-256</b> and checks its local cache. If there is no cached answer, it sends a <b>cloud lookup</b> (just the hash and metadata, not the file) over TLS. The cloud returns a <b>disposition</b>:</p>
<ul>
<li><b>Clean</b>: known good. Allowed.</li>
<li><b>Malicious</b>: known bad, with a threat name. Quarantined in Protect mode, logged in Audit mode.</li>
<li><b>Unknown</b>: no verdict yet. The file is allowed, recorded, and may be analysed further. If the verdict later turns Malicious, <b>retrospection</b> acts on it.</li>
</ul>
<p>Answers are cached with time-to-live values configured in the policy, so the same file is not looked up again every time. When the endpoint is offline, local engines (TETRA on Windows, ClamAV on Mac and Linux) still provide signature protection.</p>

<h3>Reading the connector status in the lab</h3>
<pre class="out">PC1&gt; secure-endpoint status
<span class="hl">Cisco Secure Endpoint Connector 8.4.1</span>
  Computer   : PC1
<span class="hl">  Group      : Endpoints</span>
<span class="hl">  Policy     : NK-Standard (audit)</span>
  Isolation  : Not isolated
  Quarantined: 0 file(s)</pre>
<p>Line by line: the connector is installed and its version is 8.4.1; the computer is registered as PC1; it sits in group <b>Endpoints</b>; that group uses policy <b>NK-Standard</b>, currently in <b>audit</b> mode; it is not isolated; nothing has been quarantined. In lab (a), task 1 asks you to read exactly this and answer the mode. If the output said <code>no connector installed on this computer</code>, the problem would be deployment, not policy.</p>

<div class="eg"><p><b>Worked example.</b> The console has groups Workstations (policy Protect), Servers (policy Server) and Audit (policy Audit). A new finance laptop is installed from the Audit group's package for a two-week pilot. At the end of the pilot you do not reinstall anything: you move the computer from group Audit to Workstations, and within a few minutes the connector pulls the Protect policy. <code>secure-endpoint status</code> on the laptop then shows <code>Policy : Protect (protect)</code>.</p></div>

<h3>Private cloud and connectivity</h3>
<p>The connector needs outbound HTTPS to the Secure Endpoint cloud for its region (North America, Europe or Asia Pacific). Environments that cannot send hashes to a public cloud can run <b>Secure Endpoint Private Cloud</b>, an on-premises appliance that hosts the console and dispositions locally. Proxy settings for the connector live in the policy.</p>

<div class="warn"><p><b>Common mistake.</b> Changing a policy and forgetting which group the computer is actually in. Always read the effective policy on the computer (console or <code>secure-endpoint status</code>) before assuming a change applies to it.</p></div>

<div class="exam"><p><b>Exam trap.</b> The connector sends the file's <b>hash</b> for a cloud lookup, not the whole file. Files are uploaded only for analysis (for example to Secure Malware Analytics) when you or a policy choose to. "Unknown" does not mean safe and does not mean blocked.</p></div>

<div class="scn"><h4>The pilot that never ended</h4><p>Six months after a Secure Endpoint rollout, a ransomware sample ran on 12 laptops in the marketing department while every other department was protected. The connectors had been installed from the Audit group's package during the pilot and nobody moved them afterwards. <code>secure-endpoint status</code> on each laptop showed <code>Policy : Audit (audit)</code>. The fix was moving the 12 computers to the Workstations group; the lesson was adding a weekly report of computers in audit groups.</p><p><b>Lesson:</b> group membership decides the policy; a forgotten pilot group is an open door.</p></div>

<div class="iv"><p class="q">"How does a Secure Endpoint connector decide whether a file is malicious?"</p><p>Strong answer: it hashes the file with SHA-256, checks its local cache, and otherwise sends a cloud lookup of the hash. The cloud returns Clean, Malicious or Unknown, using Talos intelligence and engines such as machine learning. Local engines (TETRA, ClamAV) cover offline cases, and behavioural engines watch what processes do. The policy of the computer's group decides whether a Malicious verdict is quarantined or only logged.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Secure Client is one agent with modules; Secure Endpoint is the EPP/EDR connector module.</li>
<li>Computer → group → policy (one per OS). Moving a computer between groups changes its policy.</li>
<li>Cloud lookups send the SHA-256, not the file; dispositions are Clean, Malicious or Unknown.</li>
<li><code>secure-endpoint status</code> shows version, group, policy and mode, isolation and quarantine count.</li>
<li>Private Cloud exists for environments that cannot use the public cloud.</li>
</ul></div>
`,hi:`
<p>Pharmacies ki ek chain socho. Har dukaan mein ek pharmacist (connector) hai jo locally jaldi faisle le sakta hai: "yeh prescription theek hai", "yeh to saaf nakli hai". Kisi bhi shak wali cheez ke liye pharmacist head office (cloud) ko phone karta hai, jo desh ki har dukaan ke prescriptions dekhta hai aur turant jaanta hai ki wahi nakli prescription aaj subah teen shehron mein aaya. Head office rulebook (policy) bhi likhta hai aur tay karta hai ki kaunsi dukaan kaunsi rulebook follow karegi (groups).</p>

<h3>Cisco Secure Client: ek agent, kai modules</h3>
<p><b>Cisco Secure Client</b> (pehle AnyConnect Secure Mobility Client) ek single endpoint agent framework hai jismein optional modules hain. Har device ko jo chahiye sirf woh install karo:</p>
<table class="cmp"><tr><th>Module</th><th>Kya karta hai</th></tr>
<tr><td>VPN</td><td>Remote access SSL/IPsec VPN (<i>VPN on Threat Defense</i> module)</td></tr>
<tr><td>Secure Endpoint</td><td>EPP aur EDR connector (yeh module)</td></tr>
<tr><td>Umbrella / Secure Access roaming</td><td>Network ke bahar DNS-layer aur secure web protection</td></tr>
<tr><td>ISE Posture</td><td>ISE ke liye posture checks (<i>ISE</i> module)</td></tr>
<tr><td>Network Visibility Module (NVM)</td><td>Process context ke saath flow telemetry, collector ya SIEM ko</td></tr>
<tr><td>Network Access Manager</td><td>Wired aur wireless ke liye 802.1X supplicant</td></tr>
</table>
<p>Secure Endpoint ko Secure Client module ke roop mein ya apne standalone connector installer se deploy kiya ja sakta hai. Dono tarah se yeh wahi <b>connector</b> hai, jo endpoint agent ke liye Cisco ka shabd hai. Connectors Windows, macOS, Linux, Android aur iOS ke liye hain, sabse rich engine set Windows par.</p>

<h3>Cloud console aur pieces ka aapsi rishta</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Connector, groups aur policies">
<rect x="230" y="15" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">Secure Endpoint cloud</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">console, dispositions, Talos</text>
<rect x="40" y="105" width="160" height="44" rx="8" fill="#fde68a"/><text x="120" y="132" text-anchor="middle" class="svg-ink" font-size="13">Policy NK-Standard</text>
<rect x="240" y="105" width="160" height="44" rx="8" fill="#bae6fd"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="13">Group Endpoints</text>
<rect x="440" y="105" width="160" height="44" rx="8" fill="#bae6fd"/><text x="520" y="132" text-anchor="middle" class="svg-ink" font-size="13">Group Workstations</text>
<rect x="240" y="190" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="217" text-anchor="middle" class="svg-ink" font-size="13">PC1 connector 8.4.1</text>
<rect x="440" y="190" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="520" y="217" text-anchor="middle" class="svg-ink" font-size="13">PC-SALES, PC-HR, PC-FIN</text>
<line x1="200" y1="127" x2="240" y2="127" stroke="#64748b" stroke-width="2"/><text x="220" y="100" text-anchor="middle" class="svg-muted" font-size="12">use karta</text>
<line x1="320" y1="149" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><line x1="520" y1="149" x2="520" y2="190" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="65" x2="320" y2="105" stroke="#64748b" stroke-dasharray="4 4"/><line x1="380" y1="65" x2="520" y2="105" stroke="#64748b" stroke-dasharray="4 4"/>
</svg><p class="cap">Ek computer ek group mein hota hai; group har operating system ke liye ek policy ki taraf point karta hai; policy connector ko control karti hai.</p></div>
<dl class="terms">
<dt>Computer</dt><dd>Registered connector wala ek endpoint. Console uska hostname, OS, connector version, group, policy, last seen time aur isolation state dikhata hai.</dd>
<dt>Group</dt><dd>Computers ka container. Har group ki har OS (Windows, Mac, Linux waghera) ke liye ek policy hoti hai. Computer ko groups ke beech move karne se uski policy badal jaati hai. Groups nested ho sakte hain aur inherit karte hain.</dd>
<dt>Policy</dt><dd>Rulebook: protection modes, kaunse engines on hain, exclusions, outbreak-control lists, proxy settings, update schedule aur connector UI options. Cisco Audit, Protect, Triage, Server aur Domain Controller jaisi default policies deta hai; aap aam taur par ek copy karke adjust karte ho.</dd>
<dt>Deployment package</dt><dd>Chune hue group ke liye console se download kiya installer. Isse install hua connector apne aap us group mein register hota hai.</dd>
</dl>

<h3>File ka verdict kaise banta hai</h3>
<p>Jab file copy, move ya execute hoti hai, connector uska <b>SHA-256</b> nikaalta hai aur apna local cache check karta hai. Cached answer na ho to woh TLS par <b>cloud lookup</b> bhejta hai (sirf hash aur metadata, file nahi). Cloud ek <b>disposition</b> lautata hai:</p>
<ul>
<li><b>Clean</b>: known good. Allowed.</li>
<li><b>Malicious</b>: known bad, threat name ke saath. Protect mode mein quarantine, Audit mode mein log.</li>
<li><b>Unknown</b>: abhi verdict nahi. File allowed hai, record hoti hai, aur aage analyse ho sakti hai. Agar baad mein verdict Malicious ho jaaye, to <b>retrospection</b> uspar act karta hai.</li>
</ul>
<p>Answers policy mein configure kiye time-to-live values ke saath cache hote hain, taaki same file baar baar lookup na ho. Endpoint offline ho to local engines (Windows par TETRA, Mac aur Linux par ClamAV) phir bhi signature protection dete hain.</p>

<h3>Lab mein connector status padhna</h3>
<pre class="out">PC1&gt; secure-endpoint status
<span class="hl">Cisco Secure Endpoint Connector 8.4.1</span>
  Computer   : PC1
<span class="hl">  Group      : Endpoints</span>
<span class="hl">  Policy     : NK-Standard (audit)</span>
  Isolation  : Not isolated
  Quarantined: 0 file(s)</pre>
<p>Line by line: connector installed hai aur version 8.4.1 hai; computer PC1 naam se registered hai; woh group <b>Endpoints</b> mein hai; woh group policy <b>NK-Standard</b> use karta hai, jo abhi <b>audit</b> mode mein hai; isolated nahi hai; kuch quarantine nahi hua. Lab (a) mein task 1 aapse bilkul yahi padhkar mode batane ko kehta hai. Agar output <code>no connector installed on this computer</code> kehta, to problem deployment hoti, policy nahi.</p>

<div class="eg"><p><b>Worked example.</b> Console mein groups hain Workstations (policy Protect), Servers (policy Server) aur Audit (policy Audit). Ek naya finance laptop do hafte ke pilot ke liye Audit group ke package se install hota hai. Pilot ke end par aap kuch reinstall nahi karte: computer ko group Audit se Workstations mein move karte ho, aur kuch minutes mein connector Protect policy kheench leta hai. Laptop par <code>secure-endpoint status</code> phir <code>Policy : Protect (protect)</code> dikhata hai.</p></div>

<h3>Private cloud aur connectivity</h3>
<p>Connector ko apne region (North America, Europe ya Asia Pacific) ke Secure Endpoint cloud tak outbound HTTPS chahiye. Jo environments public cloud ko hashes nahi bhej sakte, woh <b>Secure Endpoint Private Cloud</b> chala sakte hain, ek on-premises appliance jo console aur dispositions locally host karta hai. Connector ki proxy settings policy mein hoti hain.</p>

<div class="warn"><p><b>Common galti.</b> Policy badalna aur bhool jaana ki computer asal mein kis group mein hai. Yeh maanne se pehle ki change uspar lagta hai, hamesha computer ki effective policy padho (console ya <code>secure-endpoint status</code>).</p></div>

<div class="exam"><p><b>Exam trap.</b> Connector cloud lookup ke liye file ka <b>hash</b> bhejta hai, poori file nahi. Files sirf analysis ke liye upload hoti hain (jaise Secure Malware Analytics ko) jab aap ya policy aisa chune. "Unknown" ka matlab na safe hai na blocked.</p></div>

<div class="scn"><h4>Woh pilot jo kabhi khatam nahi hua</h4><p>Secure Endpoint rollout ke chhe mahine baad marketing department ke 12 laptops par ransomware sample chala jabki baaki har department protected tha. Pilot ke dauraan connectors Audit group ke package se install hue the aur baad mein kisi ne unhe move nahi kiya. Har laptop par <code>secure-endpoint status</code> ne <code>Policy : Audit (audit)</code> dikhaya. Fix tha 12 computers ko Workstations group mein move karna; seekh thi audit groups wale computers ki weekly report jodna.</p><p><b>Seekh:</b> group membership policy tay karti hai; bhula hua pilot group khula darwaza hai.</p></div>

<div class="iv"><p class="q">"Secure Endpoint connector kaise decide karta hai ki file malicious hai?"</p><p>Strong answer: woh file ko SHA-256 se hash karta hai, apna local cache check karta hai, warna hash ka cloud lookup bhejta hai. Cloud Talos intelligence aur machine learning jaise engines use karke Clean, Malicious ya Unknown lautata hai. Local engines (TETRA, ClamAV) offline cases cover karte hain, aur behavioural engines dekhte hain ki processes kya karte hain. Computer ke group ki policy tay karti hai ki Malicious verdict quarantine hoga ya sirf log.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Secure Client modules wala ek agent hai; Secure Endpoint EPP/EDR connector module hai.</li>
<li>Computer → group → policy (har OS ke liye ek). Computer ko groups ke beech move karne se policy badalti hai.</li>
<li>Cloud lookups SHA-256 bhejte hain, file nahi; dispositions Clean, Malicious ya Unknown hain.</li>
<li><code>secure-endpoint status</code> version, group, policy aur mode, isolation aur quarantine count dikhata hai.</li>
<li>Jo environments public cloud use nahi kar sakte unke liye Private Cloud hai.</li>
</ul></div>
`}};export{e as default};