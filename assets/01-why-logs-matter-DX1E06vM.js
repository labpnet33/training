var e={id:`why-logs-matter`,h:{en:`Why logs matter and which log types exist`,hi:`Logs kyun zaroori hain aur log types kaunse hain`},body:{en:`
<p>A firewall decides thousands of times a minute: allow this, block that. A decision nobody can look back at is almost useless. Think of a shop with a CCTV camera. The camera does not stop a thief, but when something goes missing the recording tells you who, when and through which door. A <b>log</b> is that recording for a firewall: one line that says what happened, to whom, and which rule decided it.</p>

<h3>What a log is used for</h3>
<ul>
<li><b>Troubleshooting:</b> "Why can Pune not reach the server?" The log shows the rule and the action.</li>
<li><b>Security investigation:</b> "Which host talked to that bad address last week?"</li>
<li><b>Audit and compliance:</b> proof that policy was enforced and who changed it.</li>
<li><b>Capacity and trends:</b> which applications grow, which sites are busiest.</li>
</ul>

<h3>The common log types</h3>
<p>A PAN-OS firewall writes several kinds of logs. The exact list and the fields in each depend on the version and on the licences, so check the documentation for your PAN-OS version. The ones every engineer meets first are below.</p>
<table class="tbl"><tr><th>Log type</th><th>What it records</th><th>Typical question it answers</th></tr>
<tr><td>Traffic</td><td>A session: source, destination, application, rule, action</td><td>Was this connection allowed or denied, and by which rule?</td></tr>
<tr><td>Threat</td><td>A detection by a security profile (when such profiles are in use)</td><td>Did something malicious get seen?</td></tr>
<tr><td>URL</td><td>Web requests classified by category (when URL filtering is in use)</td><td>Which sites did users visit?</td></tr>
<tr><td>System</td><td>Events about the device itself: connections, jobs, faults</td><td>Why did the firewall lose its management connection?</td></tr>
<tr><td>Configuration</td><td>Who changed which setting, and when</td><td>Who edited this rule yesterday?</td></tr>
</table>
<p>In this course the simulator generates and forwards <b>traffic logs</b> only. That is enough to teach the whole forwarding idea, because the logic is the same for the other types: something is written locally, a setting decides where it is sent, and a path must be healthy for delivery.</p>

<h3>A traffic log in the lab</h3>
<pre class="out">PANO&gt; show log traffic
Device              Time                App             From        Source          To          Destination     Rule              Action
==================================================================================================================================
NK-PUNE-PA          2026/10/04 13:07:38 ssh             trust       10.1.1.10       untrust     8.8.8.8         Block-SSH-Out     deny
NK-PUNE-PA          2026/10/04 13:07:26 web-browsing    trust       10.1.1.10       untrust     8.8.8.8         Allow-Out         allow</pre>
<p>Read it column by column: which firewall, when, which application, zone and address on each side, which rule matched and what the action was. Two sessions, two lines, one allowed and one denied.</p>

<h3>Where logs live</h3>
<p>A log is first written <b>on the firewall</b>. Keeping it only there has a weakness: the firewall holds a limited amount, and if you manage thirty firewalls you would log in to thirty boxes to investigate one incident. So logs are <b>forwarded</b> to a central place such as Panorama, or to an external system. The rest of this module is about how that forwarding is configured and how it breaks.</p>

<div class="scn"><h4>The missing evidence</h4><p>A company suspects that a laptop in a branch contacted an unknown address. The security manager asks for last week's traffic for that laptop across all branches. Because every firewall forwards to Panorama, one search answers it in minutes. A neighbouring company, where logs stayed on each firewall, spent two days logging in to devices, and found that one box had already rolled over its old entries.</p><p><b>Lesson:</b> central logs turn an investigation from days into minutes.</p></div>

<div class="iv"><p class="q">"Name the main log types on a Palo Alto firewall and what each is for."</p><p>Traffic logs record sessions and the matching rule and action; threat logs record detections by security profiles; URL logs record categorised web access; system logs record device events; configuration logs record administrative changes. I would add that availability of types depends on licences and version, so I check the documentation for the PAN-OS version in use.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A log is the firewall's memory: what happened, which rule, which action.</li>
<li>Main types: traffic, threat, URL, system and configuration. Check the documentation for your PAN-OS version for the exact list.</li>
<li>Logs are written on the firewall first and then forwarded to central places.</li>
<li>The simulator teaches the forwarding logic using traffic logs.</li>
</ul></div>
`,hi:`
<p>Firewall ek minute mein hazaron baar decide karta hai: ise allow karo, usse block karo. Jis decision ko koi baad mein dekh na sake, wo lagbhag bekaar hai. Ek dukaan socho jisme CCTV camera laga hai. Camera chor ko roka nahi, lekin kuch gum ho jaye to recording batati hai kaun, kab aur kis darwaze se. <b>Log</b> firewall ke liye wahi recording hai: ek line jo batati hai kya hua, kiske saath, aur kis rule ne decide kiya.</p>

<h3>Log kis kaam aata hai</h3>
<ul>
<li><b>Troubleshooting:</b> "Pune server tak kyun nahi pahunch raha?" Log mein rule aur action dikhta hai.</li>
<li><b>Security investigation:</b> "Pichhle hafte kaunsa host us kharab address se baat kar raha tha?"</li>
<li><b>Audit aur compliance:</b> proof ki policy enforce hui aur kisne change kiya.</li>
<li><b>Capacity aur trends:</b> kaunsi applications badh rahi hain, kaunsi site sabse busy hai.</li>
</ul>

<h3>Common log types</h3>
<p>PAN-OS firewall kai tarah ke logs likhta hai. Exact list aur har log ke fields version aur licences par depend karte hain, isliye apne PAN-OS version ki documentation check karo. Jo types har engineer ko pehle milte hain wo neeche hain.</p>
<table class="tbl"><tr><th>Log type</th><th>Kya record karta hai</th><th>Kaunsa sawal solve karta hai</th></tr>
<tr><td>Traffic</td><td>Ek session: source, destination, application, rule, action</td><td>Ye connection allow hua ya deny, aur kis rule se?</td></tr>
<tr><td>Threat</td><td>Security profile ki detection (jab aise profiles use mein hon)</td><td>Kya kuch malicious dikha?</td></tr>
<tr><td>URL</td><td>Category ke hisaab se web requests (jab URL filtering use mein ho)</td><td>Users ne kaunsi sites dekhi?</td></tr>
<tr><td>System</td><td>Device ke apne events: connections, jobs, faults</td><td>Firewall ka management connection kyun toota?</td></tr>
<tr><td>Configuration</td><td>Kisne kaunsi setting kab badli</td><td>Kal ye rule kisne edit kiya?</td></tr>
</table>
<p>Is course mein simulator sirf <b>traffic logs</b> generate aur forward karta hai. Poori forwarding ka idea samjhane ke liye itna kaafi hai, kyunki logic baaki types ka bhi wahi hai: kuch locally likha jata hai, ek setting decide karti hai kahan bhejna hai, aur delivery ke liye path healthy hona chahiye.</p>

<h3>Lab mein ek traffic log</h3>
<pre class="out">PANO&gt; show log traffic
Device              Time                App             From        Source          To          Destination     Rule              Action
==================================================================================================================================
NK-PUNE-PA          2026/10/04 13:07:38 ssh             trust       10.1.1.10       untrust     8.8.8.8         Block-SSH-Out     deny
NK-PUNE-PA          2026/10/04 13:07:26 web-browsing    trust       10.1.1.10       untrust     8.8.8.8         Allow-Out         allow</pre>
<p>Column by column padho: kaunsa firewall, kab, kaunsi application, har taraf ka zone aur address, kaunsa rule match hua aur action kya tha. Do sessions, do lines, ek allowed aur ek denied.</p>

<h3>Logs rehte kahan hain</h3>
<p>Log sabse pehle <b>firewall par</b> likha jata hai. Sirf wahin rakhne mein kamzori hai: firewall limited jagah rakhta hai, aur tees firewalls hon to ek incident ke liye tees boxes mein login karna padega. Isliye logs ko Panorama jaise central place ya external system ko <b>forward</b> kiya jata hai. Is module ka baaki hissa batata hai ki forwarding kaise configure hoti hai aur kaise toot'ti hai.</p>

<div class="scn"><h4>Gum hua evidence</h4><p>Ek company ko shak hai ki branch ke ek laptop ne unknown address se contact kiya. Security manager sabhi branches ka pichhle hafte ka us laptop ka traffic maangta hai. Har firewall Panorama ko forward karta hai, isliye ek search minutes mein jawab de deti hai. Padosi company mein logs har firewall par hi the, unhone do din devices mein login karne mein lagaye, aur ek box ne apni purani entries pehle hi overwrite kar di thi.</p><p><b>Lesson:</b> central logs investigation ko dinon se minutes mein badal dete hain.</p></div>

<div class="iv"><p class="q">"Palo Alto firewall ke main log types batao aur har ek kis kaam ka hai."</p><p>Traffic logs sessions aur matching rule aur action record karte hain; threat logs security profiles ki detections; URL logs categorised web access; system logs device events; configuration logs administrative changes. Main ye bhi bolunga ki types ki availability licences aur version par depend karti hai, isliye use kiye ja rahe PAN-OS version ki documentation check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Log firewall ki memory hai: kya hua, kaunsa rule, kaunsa action.</li>
<li>Main types: traffic, threat, URL, system aur configuration. Exact list ke liye apne PAN-OS version ki documentation check karo.</li>
<li>Logs pehle firewall par likhe jate hain, phir central places ko forward hote hain.</li>
<li>Simulator forwarding logic traffic logs se sikhata hai.</li>
</ul></div>
`}};export{e as default};