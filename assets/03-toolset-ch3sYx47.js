var e={id:`toolset`,h:{en:`The 9800 toolset: show commands, client states, reason codes and logs`,hi:`9800 toolset: show commands, client states, reason codes aur logs`},body:{en:`
<p>A mechanic has a toolbox with a tool for each job. A wireless engineer has the same: a handful of <code>show</code> commands that answer almost every question without ever changing the configuration. This chapter lists them, shows what their output looks like and explains which ones are real on the platform but <i>not simulated in the lab</i>.</p>
<h3>Read-only first: the show commands</h3>
<table class="cmp"><tr><th>Question</th><th>Command (lab supports)</th></tr>
<tr><td>Which APs are registered, with which IP and country?</td><td><code>show ap summary</code></td></tr>
<tr><td>Which tags does each AP carry?</td><td><code>show ap tag summary</code></td></tr>
<tr><td>Details of one AP</td><td><code>show ap name AP2 config general</code></td></tr>
<tr><td>Are 2.4 or 5 GHz radios serving, on which channel and power?</td><td><code>show ap dot11 24ghz summary</code> and <code>show ap dot11 5ghz summary</code></td></tr>
<tr><td>Which WLANs exist and are enabled?</td><td><code>show wlan summary</code></td></tr>
<tr><td>Is the policy profile enabled and in which VLAN?</td><td><code>show wireless profile policy summary</code> and <code>... detailed PP-VOICE</code></td></tr>
<tr><td>Which WLAN maps to which policy?</td><td><code>show wireless tag policy detailed PT-CAMPUS</code></td></tr>
<tr><td>Who is connected and how?</td><td><code>show wireless client summary</code> and <code>show wireless client mac-address &lt;mac&gt; detail</code></td></tr>
<tr><td>Is RADIUS answering?</td><td><code>show aaa servers</code>, <code>show radius server-group all</code></td></tr>
<tr><td>What did the controller log?</td><td><code>show logging</code></td></tr>
<tr><td>Is VLAN 99 on the trunk?</td><td><code>show interfaces trunk</code>, <code>show vlan brief</code></td></tr>
<tr><td>Country, management interface</td><td><code>show wireless country configured</code>, <code>show wireless management interface</code></td></tr>
</table>
<h3>Reading the key outputs</h3>
<pre class="code">WLC1# show ap tag summary</pre>
<pre class="out">Number of APs: 2

AP Name   AP Mac        Site Tag Name   Policy Tag Name      RF Tag Name   Misconfigured  Tag Source
AP1       0011.2233.0001 default-site-tag PT-CAMPUS           default-rf-tag No            Static
AP2       0011.2233.0002 default-site-tag <span class="hl">default-policy-tag</span>  default-rf-tag No            <span class="hl">Default</span></pre>
<p>Tag Source <b>Default</b> means nobody assigned a tag to AP2, so it falls back to <code>default-policy-tag</code>, which has no WLANs. The <b>Misconfigured</b> column says <b>Yes</b> when an AP points to a tag that no longer exists.</p>
<pre class="code">WLC1# show wireless profile policy detailed PP-VOICE</pre>
<pre class="out">Policy Profile Name              : PP-VOICE
Status                           : <span class="hl">DISABLED</span>
VLAN                             : 30
Central Switching                : ENABLED
Central Authentication           : ENABLED
Central DHCP                     : DISABLED</pre>
<p>If the VLAN line ends with <code>(NOT IN VLAN DATABASE)</code> the policy VLAN was never created on the controller; clients will associate but cannot be placed.</p>
<h3>Client states and what they tell you</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Client states">
<rect x="8" y="35" width="100" height="60" rx="8" fill="#bae6fd"/><text x="58" y="60" text-anchor="middle" class="svg-ink" font-size="12">Probe / Auth</text><text x="58" y="78" text-anchor="middle" class="svg-muted" font-size="11">SSID seen</text>
<rect x="128" y="35" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="178" y="60" text-anchor="middle" class="svg-ink" font-size="12">Association</text><text x="178" y="78" text-anchor="middle" class="svg-muted" font-size="11">AP accepts</text>
<rect x="248" y="35" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="298" y="60" text-anchor="middle" class="svg-ink" font-size="12">L2 / 802.1X</text><text x="298" y="78" text-anchor="middle" class="svg-muted" font-size="11">key or EAP</text>
<rect x="368" y="35" width="100" height="60" rx="8" fill="#fde68a"/><text x="418" y="60" text-anchor="middle" class="svg-ink" font-size="12">DHCP</text><text x="418" y="78" text-anchor="middle" class="svg-muted" font-size="11">IP in VLAN</text>
<rect x="488" y="35" width="100" height="60" rx="8" fill="#fed7aa"/><text x="538" y="60" text-anchor="middle" class="svg-ink" font-size="12">Run</text><text x="538" y="78" text-anchor="middle" class="svg-muted" font-size="11">traffic flows</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">The state where the client stops tells you which layer to inspect.</text>
</svg><p class="cap">Simplified client path on the 9800. The client summary shows State Run when it is complete.</p></div>
<pre class="out">Number of Local Clients: 1

MAC Address     AP Name   WLAN  State   Protocol  Method
aabb.cc00.0001  AP2       1     Run     11ac      PSK</pre>
<ul>
<li>Not in the list at all: failed before association (SSID not broadcast, wrong key, band mismatch).</li>
<li>Listed but IP 0.0.0.0 in the detail view: DHCP or VLAN problem.</li>
<li>Method <b>Dot1x</b> in the list: the session used RADIUS, so check AAA when it fails.</li>
</ul>
<h3>Logs and reason codes</h3>
<p>The controller writes messages with a facility, severity and mnemonic, for example <code>%CAPWAP-5-AP_JOINED</code>, <code>%CAPWAP-3-AP_LOST</code>, <code>%DOT1X-3-SERVER_TIMEOUT</code> and <code>%DOT1X-4-AUTH_REJECT</code>. The number is severity: 0 is emergency, 3 error, 4 warning, 5 notice, 6 informational. Read the newest lines first with <code>show logging</code>; a timeout versus a reject is a classic fork: <b>timeout</b> points to address, port or shared secret; <b>reject</b> means RADIUS answered and said no, so check the user or policy.</p>
<h3>Real platform tools that the lab does not simulate</h3>
<div class="note"><p><b>Concept only, not simulated in the lab.</b> On a real 9800 you also use <b>Radioactive Trace</b> (per-client MAC trace in the GUI or CLI that collects every internal step with timestamps), <b>packet capture</b> on the controller and on the AP, client <b>debug</b> commands bounded by a MAC filter, <b>show tech-support wireless</b> for a TAC case, and <b>Catalyst Center Assurance</b> for historical client health. Coming up: module wl-diag (Troubleshooting like a CCIE). These are heavier tools: use them after the simple show commands have narrowed the problem, and always filter by one MAC to avoid flooding the CPU.</p></div>
<div class="warn"><p><b>Common mistakes.</b> (1) Running broad debugs on a production controller; filter by MAC and set a time limit. (2) Reading only the latest log line; a failure may have happened several lines earlier. (3) Treating <b>Misconfigured: No</b> as proof the tag is right; it only says the tag exists.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tag source Default does not mean healthy. It means the AP has no static assignment and uses the default tags.</p></div>
<div class="scn"><h4>The empty default tag</h4><p>A helpdesk engineer rebooted AP2 after a firmware step and the staff SSID vanished from that corner. <code>show ap summary</code> said Registered, so the AP looked fine. <code>show ap tag summary</code> showed Tag Source Default: the tag assignment was lost. One command, <code>ap name AP2 policy-tag PT-CAMPUS</code>, restored service.</p><p><b>Lesson:</b> registered is not the same as serving. Always check the tags.</p></div>
<div class="iv"><p class="q">"Which commands would you run first on a 9800 for a client that cannot connect?"</p><p>Client summary, client detail by MAC, AP tag summary, policy profile detail, tag policy detail, show logging, and for 802.1X show aaa servers. Add that Radioactive Trace and captures come later and are filtered by MAC.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Most answers come from read-only show commands.</li>
<li>Tag Source Default means no static tags were assigned.</li>
<li>Where the client stops (not listed, no IP, Run) selects the layer.</li>
<li>Timeout versus reject separates AAA reachability from user decisions.</li>
<li>Radioactive Trace, captures and Assurance are real but not simulated in the lab.</li>
</ul></div>
`,hi:`
<p>Mechanic ke paas har kaam ke liye tool hota hai. Wireless engineer ke paas bhi hai: kuch <code>show</code> commands jo configuration badle bina lagbhag har sawal ka jawab dete hain. Yeh chapter unhe list karta hai, unka output dikhata hai aur batata hai ki kaun se real platform par hain lekin <i>not simulated in the lab</i>.</p>
<h3>Pehle read-only: show commands</h3>
<table class="cmp"><tr><th>Sawal</th><th>Command (lab support karta hai)</th></tr>
<tr><td>Kaun se APs registered hain, kaunse IP aur country ke saath?</td><td><code>show ap summary</code></td></tr>
<tr><td>Har AP ke paas kaunse tags hain?</td><td><code>show ap tag summary</code></td></tr>
<tr><td>Ek AP ki details</td><td><code>show ap name AP2 config general</code></td></tr>
<tr><td>2.4 ya 5 GHz radios serve kar rahe hain, kaunse channel aur power par?</td><td><code>show ap dot11 24ghz summary</code> aur <code>show ap dot11 5ghz summary</code></td></tr>
<tr><td>Kaun se WLANs hain aur enabled hain?</td><td><code>show wlan summary</code></td></tr>
<tr><td>Policy profile enabled hai aur kaunse VLAN mein?</td><td><code>show wireless profile policy summary</code> aur <code>... detailed PP-VOICE</code></td></tr>
<tr><td>Kaunsa WLAN kaunsi policy se map hai?</td><td><code>show wireless tag policy detailed PT-CAMPUS</code></td></tr>
<tr><td>Kaun connected hai aur kaise?</td><td><code>show wireless client summary</code> aur <code>show wireless client mac-address &lt;mac&gt; detail</code></td></tr>
<tr><td>RADIUS jawab de raha hai?</td><td><code>show aaa servers</code>, <code>show radius server-group all</code></td></tr>
<tr><td>Controller ne kya log kiya?</td><td><code>show logging</code></td></tr>
<tr><td>VLAN 99 trunk par hai?</td><td><code>show interfaces trunk</code>, <code>show vlan brief</code></td></tr>
<tr><td>Country, management interface</td><td><code>show wireless country configured</code>, <code>show wireless management interface</code></td></tr>
</table>
<h3>Key outputs ko padhna</h3>
<pre class="code">WLC1# show ap tag summary</pre>
<pre class="out">Number of APs: 2

AP Name   AP Mac        Site Tag Name   Policy Tag Name      RF Tag Name   Misconfigured  Tag Source
AP1       0011.2233.0001 default-site-tag PT-CAMPUS           default-rf-tag No            Static
AP2       0011.2233.0002 default-site-tag <span class="hl">default-policy-tag</span>  default-rf-tag No            <span class="hl">Default</span></pre>
<p>Tag Source <b>Default</b> ka matlab kisi ne AP2 ko tag assign nahi kiya, isliye woh <code>default-policy-tag</code> par girta hai jisme koi WLAN nahi. <b>Misconfigured</b> column <b>Yes</b> hota hai jab AP aise tag ko point karta hai jo ab exist nahi karta.</p>
<pre class="code">WLC1# show wireless profile policy detailed PP-VOICE</pre>
<pre class="out">Policy Profile Name              : PP-VOICE
Status                           : <span class="hl">DISABLED</span>
VLAN                             : 30
Central Switching                : ENABLED
Central Authentication           : ENABLED
Central DHCP                     : DISABLED</pre>
<p>Agar VLAN line <code>(NOT IN VLAN DATABASE)</code> par khatam ho to policy VLAN controller par kabhi create nahi hua; clients associate honge lekin place nahi ho paayenge.</p>
<h3>Client states aur woh kya batate hain</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Client states">
<rect x="8" y="35" width="100" height="60" rx="8" fill="#bae6fd"/><text x="58" y="60" text-anchor="middle" class="svg-ink" font-size="12">Probe / Auth</text><text x="58" y="78" text-anchor="middle" class="svg-muted" font-size="11">SSID dikha</text>
<rect x="128" y="35" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="178" y="60" text-anchor="middle" class="svg-ink" font-size="12">Association</text><text x="178" y="78" text-anchor="middle" class="svg-muted" font-size="11">AP accept kare</text>
<rect x="248" y="35" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="298" y="60" text-anchor="middle" class="svg-ink" font-size="12">L2 / 802.1X</text><text x="298" y="78" text-anchor="middle" class="svg-muted" font-size="11">key ya EAP</text>
<rect x="368" y="35" width="100" height="60" rx="8" fill="#fde68a"/><text x="418" y="60" text-anchor="middle" class="svg-ink" font-size="12">DHCP</text><text x="418" y="78" text-anchor="middle" class="svg-muted" font-size="11">VLAN mein IP</text>
<rect x="488" y="35" width="100" height="60" rx="8" fill="#fed7aa"/><text x="538" y="60" text-anchor="middle" class="svg-ink" font-size="12">Run</text><text x="538" y="78" text-anchor="middle" class="svg-muted" font-size="11">traffic chalta hai</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">Client jis state par ruke, wahi layer inspect karni hai.</text>
</svg><p class="cap">9800 par simplified client path. Complete hone par client summary State Run dikhati hai.</p></div>
<pre class="out">Number of Local Clients: 1

MAC Address     AP Name   WLAN  State   Protocol  Method
aabb.cc00.0001  AP2       1     Run     11ac      PSK</pre>
<ul>
<li>List mein bilkul nahi: association se pehle fail (SSID broadcast nahi, galat key, band mismatch).</li>
<li>List mein hai lekin detail mein IP 0.0.0.0: DHCP ya VLAN problem.</li>
<li>List mein Method <b>Dot1x</b>: session ne RADIUS use kiya, fail ho to AAA check karo.</li>
</ul>
<h3>Logs aur reason codes</h3>
<p>Controller messages facility, severity aur mnemonic ke saath likhta hai, jaise <code>%CAPWAP-5-AP_JOINED</code>, <code>%CAPWAP-3-AP_LOST</code>, <code>%DOT1X-3-SERVER_TIMEOUT</code> aur <code>%DOT1X-4-AUTH_REJECT</code>. Number severity hai: 0 emergency, 3 error, 4 warning, 5 notice, 6 informational. <code>show logging</code> mein naye lines pehle padho; timeout versus reject classic fork hai: <b>timeout</b> address, port ya shared secret ki taraf point karta hai; <b>reject</b> matlab RADIUS ne jawab diya aur mana kiya, to user ya policy check karo.</p>
<h3>Real platform tools jo lab simulate nahi karta</h3>
<div class="note"><p><b>Sirf concept, not simulated in the lab.</b> Real 9800 par aap <b>Radioactive Trace</b> bhi use karte ho (per-client MAC trace jo GUI ya CLI mein har internal step timestamps ke saath collect karta hai), controller aur AP par <b>packet capture</b>, MAC filter se bandhe client <b>debug</b> commands, TAC case ke liye <b>show tech-support wireless</b>, aur historical client health ke liye <b>Catalyst Center Assurance</b>. Aage aane wala module: wl-diag (Troubleshooting like a CCIE). Yeh bhaari tools hain: simple show commands se problem narrow hone ke baad use karo, aur CPU flood se bachne ke liye hamesha ek MAC se filter karo.</p></div>
<div class="warn"><p><b>Common mistakes.</b> (1) Production controller par broad debugs chalana; MAC se filter karo aur time limit lagao. (2) Sirf latest log line padhna; failure kai lines pehle ho sakta hai. (3) <b>Misconfigured: No</b> ko proof samajhna ki tag sahi hai; woh sirf batata hai ki tag exist karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tag source Default ka matlab healthy nahi. Matlab AP ko static assignment nahi mila aur woh default tags use karta hai.</p></div>
<div class="scn"><h4>Khaali default tag</h4><p>Firmware step ke baad helpdesk engineer ne AP2 reboot kiya aur us corner se staff SSID gayab ho gaya. <code>show ap summary</code> ne Registered kaha, isliye AP theek lagta tha. <code>show ap tag summary</code> ne Tag Source Default dikhaya: tag assignment kho gaya tha. Ek command, <code>ap name AP2 policy-tag PT-CAMPUS</code>, ne service wapas laa di.</p><p><b>Seekh:</b> registered ka matlab serving nahi. Hamesha tags check karo.</p></div>
<div class="iv"><p class="q">"Jo client connect nahi ho raha, uske liye 9800 par pehle kaunse commands chalaoge?"</p><p>Client summary, MAC se client detail, AP tag summary, policy profile detail, tag policy detail, show logging, aur 802.1X ke liye show aaa servers. Jodo ki Radioactive Trace aur captures baad mein aate hain aur MAC se filter hote hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zyadatar jawab read-only show commands se milte hain.</li>
<li>Tag Source Default matlab static tags assign nahi hue.</li>
<li>Client kahan ruka (list mein nahi, IP nahi, Run) yeh layer chunta hai.</li>
<li>Timeout versus reject AAA reachability aur user decision ko alag karta hai.</li>
<li>Radioactive Trace, captures aur Assurance real hain lekin lab mein simulated nahi.</li>
</ul></div>
`}};export{e as default};