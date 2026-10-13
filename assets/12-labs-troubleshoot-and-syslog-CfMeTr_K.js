var e={id:`labs-troubleshoot-and-syslog`,h:{en:`Lab walkthroughs: pn-logfwd-ts and pn-logfwd-syslog`,hi:`Lab walkthroughs: pn-logfwd-ts aur pn-logfwd-syslog`},body:{en:`
<p>Two labs remain. One is a repair job and one is a design job. In a repair job you are a detective: the symptom is given and the causes are hidden. In a design job you are an architect: the requirement is given and you choose the parts. This chapter helps you work both without giving away the answers.</p>

<h3>Lab pn-logfwd-ts: the logs that never reach Panorama</h3>
<p><b>Symptom.</b> Policy works and users browse, but Panorama shows no traffic logs from the branches. The rule already has a forwarding profile attached and it was pushed. The brief tells you there are <b>two causes</b>: one on the profile and one on the rule.</p>
<table class="tbl"><tr><th>Move</th><th>Why</th></tr>
<tr><td>Read the profile on Panorama (match list, filter, destination switch)</td><td>Rungs 2 and 3 of the ladder</td></tr>
<tr><td>Read the rule line for its logging words</td><td>Rung 1</td></tr>
<tr><td>Use the firewall counters after real traffic</td><td>To see created, forwarded and waiting</td></tr>
<tr><td>Fix one, commit, push, retest, then fix the other</td><td>One change at a time</td></tr>
</table>
<p>Notice in the lab that when the rule has a profile and the firewall is connected, the created and forwarded counters tell you quickly which side of the problem you are on. If created never moves, think about whether the session logged at all. If it moves but the forwarded counter stays still, think about what selects logs for forwarding. After both fixes, run traffic from both PCs and confirm that both firewalls appear on Panorama.</p>

<h3>Lab pn-logfwd-syslog: everything to Panorama, only denies to the SIEM</h3>
<p><b>Requirement.</b> Panorama keeps every traffic log. The SIEM at 192.0.2.60 gets only denied sessions. The brief reminds you where each object lives: the syslog server profile in a template, the match lists in a log forwarding profile.</p>
<ol>
<li><b>Device side first.</b> Create the syslog server profile in the template that the lab provides for logging, then push the template stack. Chapter 5 shows the shape.</li>
<li><b>Policy side.</b> Build a profile with two match lists: one for all traffic going to Panorama, one with a deny filter naming the syslog profile. Chapter 4 shows the pieces.</li>
<li><b>Commit and push the device group.</b> The profile reaches the firewall by name, so the template push must already have happened.</li>
<li><b>Generate both kinds of traffic from Pune.</b> A web request is allowed. An SSH attempt to the internet host is denied by a rule that already exists.</li>
<li><b>Confirm the split.</b> Panorama holds both sessions. The syslog counter on the firewall counts only the denial.</li>
</ol>
<p>The last proof looks like this when the design is right:</p>
<pre class="out">PA1&gt; show logging-status

Log forwarding agent: connected to Panorama 192.0.2.50
Panorama Server 1: 192.0.2.50  connected
Traffic logs:
    Total logs created                : 2
    Forwarded to Panorama             : 2
    Waiting to be forwarded           : 0
    Forwarded to syslog profile NK-SYSLOG : 1</pre>
<pre class="out">PANO&gt; show log traffic
Device              Time                App             From        Source          To          Destination     Rule              Action
==================================================================================================================================
NK-PUNE-PA          2026/10/04 13:07:38 ssh             trust       10.1.1.10       untrust     8.8.8.8         Block-SSH-Out     deny
NK-PUNE-PA          2026/10/04 13:07:26 web-browsing    trust       10.1.1.10       untrust     8.8.8.8         Allow-Out         allow</pre>
<p>Two logs at Panorama, one forward to syslog. If the syslog counter is higher than the number of denials, your filter is too broad. If it stays zero after a denial, the filter or the profile name is wrong, or the template never reached the firewall.</p>

<h3>Habits that win both labs</h3>
<ul>
<li>Say the requirement in one sentence before typing.</li>
<li>Know the object, its place (shared, device group or template) and its push.</li>
<li>Generate real traffic every time you test; silent checks produce nothing.</li>
<li>Read the counters, not your hopes.</li>
</ul>

<div class="warn"><p><b>Honest boundary.</b> The syslog counter shows that logs were forwarded to a profile that exists. The lab does not deliver messages to a real syslog host and does not model transport differences such as UDP loss or SSL setup.</p></div>

<div class="scn"><h4>Fix one, still broken</h4><p>A support engineer repaired a profile at midnight, saw no change on Panorama and rolled the profile back, assuming it was never the issue. In the morning another engineer re-applied the fix and examined the rule: its end log was off. Two causes had been covering for each other.</p><p><b>Lesson:</b> keep good fixes, keep climbing, and test after each.</p></div>

<div class="iv"><p class="q">"How do you confirm that only denies go to the SIEM while Panorama gets everything?"</p><p>I generate one allowed and one denied session from a branch PC. On Panorama I expect both logs. On the firewall I expect the forwarded to Panorama count to equal created, and the syslog counter to equal the number of denials only.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Repair labs: ladder, one fix at a time, there may be two causes.</li>
<li>Design labs: object, place, push, in the right order.</li>
<li>Prove the split with allowed and denied traffic and the counters.</li>
<li>Template push first when a profile references a template object.</li>
</ul></div>
`,hi:`
<p>Do labs bache hain. Ek repair job hai aur ek design job. Repair job mein aap detective ho: symptom diya gaya hai aur causes chhupe hain. Design job mein aap architect ho: requirement di gayi hai aur parts aap chunte ho. Ye chapter dono ko answers diye bina karne mein madad karta hai.</p>

<h3>Lab pn-logfwd-ts: woh logs jo Panorama tak nahi pahunchte</h3>
<p><b>Symptom.</b> Policy chalti hai aur users browse karte hain, lekin Panorama branches ke traffic logs nahi dikhata. Rule par forwarding profile pehle se attached hai aur push hua. Brief batata hai ki <b>do causes</b> hain: ek profile par aur ek rule par.</p>
<table class="tbl"><tr><th>Move</th><th>Kyun</th></tr>
<tr><td>Panorama par profile padho (match list, filter, destination switch)</td><td>Ladder ke rung 2 aur 3</td></tr>
<tr><td>Rule line ke logging shabd padho</td><td>Rung 1</td></tr>
<tr><td>Real traffic ke baad firewall counters</td><td>Created, forwarded aur waiting dekhne ke liye</td></tr>
<tr><td>Ek fix karo, commit, push, retest, phir doosra</td><td>Ek time par ek change</td></tr>
</table>
<p>Lab mein dhyan do ki jab rule par profile ho aur firewall connected ho, created aur forwarded counters jaldi batate hain ki aap problem ki kaunsi taraf ho. Created kabhi nahi hilta to socho ki session ne log kiya bhi ya nahi. Hilta hai lekin forwarded counter sthir hai to socho forwarding ke liye logs kaun select karta hai. Dono fix ke baad dono PCs se traffic chalao aur confirm karo ki dono firewalls Panorama par dikhte hain.</p>

<h3>Lab pn-logfwd-syslog: sab Panorama ko, sirf denies SIEM ko</h3>
<p><b>Requirement.</b> Panorama har traffic log rakhta hai. 192.0.2.60 par SIEM ko sirf denied sessions milte hain. Brief yaad dilata hai ki har object kahan rehta hai: syslog server profile template mein, match lists log forwarding profile mein.</p>
<ol>
<li><b>Pehle device side.</b> Lab ke diye logging template mein syslog server profile banao, phir template stack push karo. Chapter 5 shakal dikhata hai.</li>
<li><b>Policy side.</b> Do match lists wala profile banao: ek Panorama ko saare traffic ke liye, ek deny filter ke saath jo syslog profile ka naam le. Chapter 4 pieces dikhata hai.</li>
<li><b>Device group commit aur push karo.</b> Profile naam se firewall tak pahunchta hai, isliye template push pehle ho chuka hona chahiye.</li>
<li><b>Pune se dono tarah ka traffic banao.</b> Web request allowed hai. Internet host par SSH attempt pehle se maujood rule se denied hota hai.</li>
<li><b>Split confirm karo.</b> Panorama dono sessions rakhta hai. Firewall par syslog counter sirf denial ginta hai.</li>
</ol>
<p>Design sahi ho to aakhri proof aisa dikhta hai:</p>
<pre class="out">PA1&gt; show logging-status

Log forwarding agent: connected to Panorama 192.0.2.50
Panorama Server 1: 192.0.2.50  connected
Traffic logs:
    Total logs created                : 2
    Forwarded to Panorama             : 2
    Waiting to be forwarded           : 0
    Forwarded to syslog profile NK-SYSLOG : 1</pre>
<pre class="out">PANO&gt; show log traffic
Device              Time                App             From        Source          To          Destination     Rule              Action
==================================================================================================================================
NK-PUNE-PA          2026/10/04 13:07:38 ssh             trust       10.1.1.10       untrust     8.8.8.8         Block-SSH-Out     deny
NK-PUNE-PA          2026/10/04 13:07:26 web-browsing    trust       10.1.1.10       untrust     8.8.8.8         Allow-Out         allow</pre>
<p>Panorama par do logs, syslog ko ek forward. Syslog counter denials ki ginti se zyada ho to aapka filter bahut broad hai. Denial ke baad bhi zero rahe to filter ya profile naam galat hai, ya template firewall tak pahunchi hi nahi.</p>

<h3>Aadatein jo dono labs jitati hain</h3>
<ul>
<li>Type karne se pehle requirement ek vaakya mein bolo.</li>
<li>Object, uski jagah (shared, device group ya template) aur uska push jaano.</li>
<li>Har test par real traffic generate karo; silent checks kuch nahi banate.</li>
<li>Counters padho, apni umeed nahi.</li>
</ul>

<div class="warn"><p><b>Honest boundary.</b> Syslog counter dikhata hai ki logs us profile ko forward hue jo exist karta hai. Lab messages real syslog host ko deliver nahi karta aur UDP loss ya SSL setup jaise transport differences model nahi karta.</p></div>

<div class="scn"><h4>Ek fix kiya, phir bhi toota</h4><p>Ek support engineer ne raat ko profile repair kiya, Panorama par koi change nahi dikha aur ye maan kar profile rollback kar diya ki wo issue tha hi nahi. Subah doosre engineer ne fix phir lagaya aur rule dekha: uska end log off tha. Do causes ek doosre ko chhupa rahe the.</p><p><b>Lesson:</b> achhe fixes rakho, chadhte raho, aur har ek ke baad test karo.</p></div>

<div class="iv"><p class="q">"Kaise confirm karoge ki sirf denies SIEM ko jate hain aur Panorama ko sab kuch?"</p><p>Branch PC se ek allowed aur ek denied session generate karta hoon. Panorama par dono logs expect karta hoon. Firewall par forwarded to Panorama count created ke barabar, aur syslog counter sirf denials ki ginti ke barabar expect karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Repair labs: ladder, ek time par ek fix, do causes ho sakte hain.</li>
<li>Design labs: object, jagah, push, sahi order mein.</li>
<li>Allowed aur denied traffic aur counters se split prove karo.</li>
<li>Profile template object refer kare to pehle template push.</li>
</ul></div>
`}};export{e as default};