var e={id:`fortimanager-fortianalyzer`,h:{en:`FortiManager and FortiAnalyzer together (theory)`,hi:`FortiManager aur FortiAnalyzer saath mein (theory)`},body:{en:`
<div class="note"><p><b>Theory chapter.</b> The simulator has no FortiAnalyzer, no log forwarding and no Security Fabric. This chapter explains the real product at an overview level so that you can place FortiManager in a bigger picture. It does not add labs. Commands shown are shown as examples of the real FortiGate CLI and cannot be run in the lab.</p></div>

<p>In a shop, one person writes the price list and the shelf rules, and another person watches the cameras and keeps the receipts. They work for the same owner, but their jobs are different and they do not replace each other. FortiManager is the person with the rule book: it decides and distributes configuration. <b>FortiAnalyzer</b> is the person with the cameras and the receipts: it receives, stores and analyses logs from the FortiGates and produces reports.</p>

<h3>Two products, two questions</h3>
<table class="cmp"><tr><th></th><th>FortiManager</th><th>FortiAnalyzer</th></tr>
<tr><td>Main question</td><td>What should the configuration be, and was it installed?</td><td>What happened on the network, and who did it?</td></tr>
<tr><td>Data it keeps</td><td>Device database, objects, policy packages, templates, revisions</td><td>Logs, events, reports</td></tr>
<tr><td>Direction</td><td>Configuration flows from manager to FortiGate</td><td>Logs flow from FortiGate to analyzer</td></tr>
<tr><td>In traffic path</td><td>No</td><td>No</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="FortiManager and FortiAnalyzer around a FortiGate">
<rect x="30" y="20" width="160" height="56" rx="8" fill="#ddd6fe"/><text x="110" y="44" text-anchor="middle" class="svg-ink" font-size="13">FortiManager</text><text x="110" y="62" text-anchor="middle" class="svg-muted" font-size="12">configuration</text>
<rect x="450" y="20" width="160" height="56" rx="8" fill="#fed7aa"/><text x="530" y="44" text-anchor="middle" class="svg-ink" font-size="13">FortiAnalyzer</text><text x="530" y="62" text-anchor="middle" class="svg-muted" font-size="12">logs and reports</text>
<rect x="240" y="140" width="160" height="56" rx="8" fill="#bae6fd"/><text x="320" y="164" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="320" y="182" text-anchor="middle" class="svg-muted" font-size="12">forwards traffic</text>
<line x1="110" y1="76" x2="260" y2="140" stroke="#64748b" stroke-width="2"/><text x="112" y="118" class="svg-accent" font-size="12">FGFM TCP 541</text>
<line x1="530" y1="76" x2="380" y2="140" stroke="#64748b" stroke-width="2"/><text x="440" y="118" class="svg-accent" font-size="12">logs (theory)</text>
</svg><p class="cap">Configuration comes down from FortiManager; logs go up to FortiAnalyzer.</p></div>

<h3>How a FortiGate sends logs</h3>
<p><b>Log forwarding</b> means that the FortiGate sends its log messages to a central server instead of keeping them only on its own disk. In the real FortiOS CLI the setting is under <code>config log fortianalyzer setting</code>, with the server address and the enable switch. You can run it on the FortiGate in a real lab, but the simulator does not have the section, so the example below is for reading only.</p>
<pre class="code"><span class="c">! real FortiOS, not available in the simulator</span>
config log fortianalyzer setting
    set status enable
    set server 192.0.2.6
end</pre>
<p>The address 192.0.2.6 is an invented documentation address for a FortiAnalyzer. Note how different this is from central management: log forwarding is a separate setting and a separate connection. A device can be managed by FortiManager and send no logs, or send logs and not be managed.</p>

<h3>The Security Fabric at overview level</h3>
<p>The <b>Security Fabric</b> is Fortinet's name for connecting its products so that they share information, such as a topology view and shared threat information. FortiGates, FortiManager and FortiAnalyzer can all take part. For a fresher, the useful point is only this: the products are designed to be deployed together, and each keeps its own job. Details differ by version and licence, so read the current guide before you design anything.</p>

<div class="eg"><p><b>Worked example.</b> Ticket: "Since yesterday the Madurai branch cannot reach SRV-WEB." FortiManager answers one half: its revision diff for MDU-FGT shows that a package install changed policy 1 yesterday at a given time, and which administrator made the install. FortiAnalyzer answers the other half: the logs show the traffic from PC-MDU to 192.0.2.80 being denied after that time. Together: the change at 14:10 caused the denial from 14:11. With only one product, the story has a hole.</p></div>

<h3>Where each product helps in operations</h3>
<ul>
<li><b>Change audit:</b> FortiManager revisions and the diff between them (the earlier module on revisions).</li>
<li><b>Incident analysis:</b> FortiAnalyzer logs and event views.</li>
<li><b>Reporting to management:</b> FortiAnalyzer reports; FortiManager provides the list of managed devices and their config status.</li>
<li><b>Capacity planning:</b> each system has its own sizing, because logs often need far more storage than configuration.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Expecting FortiManager to show traffic logs. Expecting FortiAnalyzer to push configuration. Assuming that onboarding a device to one product also onboards it to the other. Forgetting the second connection when you rebuild a branch: the new unit needs both settings.</p></div>

<div class="exam"><p><b>Exam traps.</b> Neither product is in the traffic path. FortiManager manages configuration; FortiAnalyzer collects and analyses logs. ADOMs exist in both and are separate concepts per product. In this course FortiAnalyzer and the Security Fabric are theory only.</p></div>

<div class="scn"><h4>Who changed it, and what did it break?</h4><p>A retail company asked its security team after an outage: who changed the rule, and which users were affected? The FortiManager revision history named the install and the time, and the revision diff showed the removed line. The FortiAnalyzer logs showed that only the cash-desk subnet was denied. The report to management had a start time, an end time, a cause and a scope, all from two sources.</p><p><b>Lesson:</b> configuration history and traffic history answer different parts of the same question.</p></div>

<div class="iv"><p class="q">"What is the difference between FortiManager and FortiAnalyzer?"</p><p>FortiManager is the configuration plane: it stores objects, policy packages and templates, installs them and keeps revisions. FortiAnalyzer is the logging and reporting plane: it receives logs and builds reports. Neither carries user traffic. In an incident I use FortiManager to find what changed and FortiAnalyzer to find what it affected. Be honest that the lab covers FortiManager only.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiManager distributes configuration; FortiAnalyzer collects logs and builds reports.</li>
<li>Log forwarding is a separate setting and connection from central management.</li>
<li>Neither product is in the traffic path.</li>
<li>Revision history plus logs answer who changed what and what it affected.</li>
<li>FortiAnalyzer and the Security Fabric are theory in this course.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Theory chapter.</b> Simulator mein FortiAnalyzer, log forwarding ya Security Fabric nahi hai. Ye chapter real product ko overview level par samjhata hai taaki aap FortiManager ko bade picture mein rakh sako. Ismein labs nahi hain. Jo commands dikhaye gaye hain wo real FortiGate CLI ke examples hain aur lab mein chalaye nahi ja sakte.</p></div>

<p>Dukaan mein ek vyakti price list aur shelf rules likhta hai, aur doosra cameras dekhta hai aur receipts rakhta hai. Dono ek hi malik ke liye kaam karte hain, par unke kaam alag hain aur wo ek doosre ki jagah nahi lete. FortiManager rule book wala vyakti hai: wo configuration decide aur distribute karta hai. <b>FortiAnalyzer</b> cameras aur receipts wala vyakti hai: wo FortiGates se logs receive, store aur analyse karta hai aur reports banata hai.</p>

<h3>Do products, do sawal</h3>
<table class="cmp"><tr><th></th><th>FortiManager</th><th>FortiAnalyzer</th></tr>
<tr><td>Main sawal</td><td>Configuration kya honi chahiye, aur kya install hui?</td><td>Network par kya hua, aur kisne kiya?</td></tr>
<tr><td>Kaun sa data rakhta hai</td><td>Device database, objects, policy packages, templates, revisions</td><td>Logs, events, reports</td></tr>
<tr><td>Direction</td><td>Configuration manager se FortiGate ko jaati hai</td><td>Logs FortiGate se analyzer ko jaate hain</td></tr>
<tr><td>Traffic path mein</td><td>Nahi</td><td>Nahi</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="FortiManager and FortiAnalyzer around a FortiGate">
<rect x="30" y="20" width="160" height="56" rx="8" fill="#ddd6fe"/><text x="110" y="44" text-anchor="middle" class="svg-ink" font-size="13">FortiManager</text><text x="110" y="62" text-anchor="middle" class="svg-muted" font-size="12">configuration</text>
<rect x="450" y="20" width="160" height="56" rx="8" fill="#fed7aa"/><text x="530" y="44" text-anchor="middle" class="svg-ink" font-size="13">FortiAnalyzer</text><text x="530" y="62" text-anchor="middle" class="svg-muted" font-size="12">logs aur reports</text>
<rect x="240" y="140" width="160" height="56" rx="8" fill="#bae6fd"/><text x="320" y="164" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="320" y="182" text-anchor="middle" class="svg-muted" font-size="12">traffic forward karta hai</text>
<line x1="110" y1="76" x2="260" y2="140" stroke="#64748b" stroke-width="2"/><text x="112" y="118" class="svg-accent" font-size="12">FGFM TCP 541</text>
<line x1="530" y1="76" x2="380" y2="140" stroke="#64748b" stroke-width="2"/><text x="440" y="118" class="svg-accent" font-size="12">logs (theory)</text>
</svg><p class="cap">Configuration FortiManager se neeche aati hai; logs FortiAnalyzer ko upar jaate hain.</p></div>

<h3>FortiGate logs kaise bhejta hai</h3>
<p><b>Log forwarding</b> ka matlab hai ki FortiGate apne log messages sirf apni disk par rakhne ki jagah central server ko bhejta hai. Real FortiOS CLI mein setting <code>config log fortianalyzer setting</code> ke neeche hai, server address aur enable switch ke saath. Real lab mein ise FortiGate par chala sakte ho, par simulator mein ye section nahi hai, isliye neeche ka example sirf padhne ke liye hai.</p>
<pre class="code"><span class="c">! real FortiOS, not available in the simulator</span>
config log fortianalyzer setting
    set status enable
    set server 192.0.2.6
end</pre>
<p>Address 192.0.2.6 FortiAnalyzer ke liye banaya gaya documentation address hai. Dhyan do ki ye central management se kitna alag hai: log forwarding alag setting aur alag connection hai. Device FortiManager se managed ho sakta hai aur logs na bheje, ya logs bheje aur managed na ho.</p>

<h3>Security Fabric overview level par</h3>
<p><b>Security Fabric</b> Fortinet ka naam hai apne products ko jodne ke liye taaki wo information share karein, jaise topology view aur shared threat information. FortiGates, FortiManager aur FortiAnalyzer sab isme hissa le sakte hain. Fresher ke liye kaam ki baat sirf ye hai: products saath deploy hone ke liye design hue hain, aur har ek apna kaam rakhta hai. Details version aur licence ke hisaab se badalti hain, isliye kuch design karne se pehle current guide padho.</p>

<div class="eg"><p><b>Worked example.</b> Ticket: "Kal se Madurai branch SRV-WEB tak nahi pahunch pa raha." FortiManager aadha jawab deta hai: MDU-FGT ka revision diff dikhata hai ki kal ek package install ne ek time par policy 1 badli, aur ye install kis administrator ne kiya. FortiAnalyzer doosra aadha jawab deta hai: logs dikhate hain ki us time ke baad PC-MDU se 192.0.2.80 ka traffic deny hua. Milkar: 14:10 ke change ne 14:11 se denial kiya. Sirf ek product se kahani mein ched rehta hai.</p></div>

<h3>Operations mein har product kahan madad karta hai</h3>
<ul>
<li><b>Change audit:</b> FortiManager revisions aur unke beech ka diff (revisions wala pichhla module).</li>
<li><b>Incident analysis:</b> FortiAnalyzer logs aur event views.</li>
<li><b>Management ko reporting:</b> FortiAnalyzer reports; FortiManager managed devices ki list aur unka config status deta hai.</li>
<li><b>Capacity planning:</b> har system ki apni sizing hoti hai, kyunki logs ko aksar configuration se bahut zyada storage chahiye.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> FortiManager se traffic logs dikhne ki ummeed karna. FortiAnalyzer se configuration push hone ki ummeed karna. Ye maanna ki ek product mein onboard karne se device doosre mein bhi onboard ho jata hai. Branch rebuild karte time doosra connection bhoolna: naye unit ko dono settings chahiye.</p></div>

<div class="exam"><p><b>Exam traps.</b> Dono products traffic path mein nahi hain. FortiManager configuration manage karta hai; FortiAnalyzer logs collect aur analyse karta hai. ADOMs dono mein hote hain aur har product ke liye alag concept hain. Is course mein FortiAnalyzer aur Security Fabric sirf theory hain.</p></div>

<div class="scn"><h4>Kisne badla, aur kya tod diya?</h4><p>Ek retail company ne outage ke baad security team se poocha: rule kisne badla, aur kin users par asar pada? FortiManager revision history ne install aur time batayi, aur revision diff ne hata hui line dikhayi. FortiAnalyzer logs ne dikhaya ki sirf cash-desk subnet deny hua. Management ki report mein start time, end time, cause aur scope sab do sources se aaye.</p><p><b>Lesson:</b> configuration history aur traffic history ek hi sawal ke alag hisse batate hain.</p></div>

<div class="iv"><p class="q">"FortiManager aur FortiAnalyzer mein kya fark hai?"</p><p>FortiManager configuration plane hai: wo objects, policy packages aur templates store karta hai, install karta hai aur revisions rakhta hai. FortiAnalyzer logging aur reporting plane hai: wo logs receive karta hai aur reports banata hai. Dono user traffic carry nahi karte. Incident mein main FortiManager se dhoondhta hoon kya badla aur FortiAnalyzer se kis par asar pada. Imandari se kaho ki lab sirf FortiManager cover karti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiManager configuration distribute karta hai; FortiAnalyzer logs collect karta hai aur reports banata hai.</li>
<li>Log forwarding central management se alag setting aur connection hai.</li>
<li>Koi bhi product traffic path mein nahi hai.</li>
<li>Revision history aur logs milkar batate hain kisne kya badla aur kya asar hua.</li>
<li>FortiAnalyzer aur Security Fabric is course mein theory hain.</li>
</ul></div>
`}};export{e as default};