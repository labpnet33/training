var e={id:`lab-logfwd-build`,h:{en:`Lab walkthrough: pn-logfwd-build`,hi:`Lab walkthrough: pn-logfwd-build`},body:{en:`
<p>In the lab <b>pn-logfwd-build</b> (Forward traffic logs from firewalls to Panorama) you build the whole path yourself for two branches, Pune (PA1) and Delhi (PA2). Treat it as cooking from a recipe card: gather the ingredients first, then follow the order. This chapter prepares you without handing over the exact answers; the lab's tasks are your checklist.</p>

<h3>What you start with</h3>
<ul>
<li>Panorama NK-PANORAMA (192.0.2.50) managing both firewalls, both connected.</li>
<li>One device group holding both firewalls, with a NAT rule and a pushed security rule named Allow-Out for trust to untrust web traffic.</li>
<li>No log forwarding profile. The default collector group already holds both firewalls.</li>
<li>Two PCs: PC1 in Pune and PC2 in Delhi, and an internet host at 8.8.8.8.</li>
</ul>

<h3>Plan before you type</h3>
<table class="tbl"><tr><th>Step</th><th>Question to answer</th><th>Where it lives</th></tr>
<tr><td>1</td><td>Where do forwarding profiles live, and what is the profile for?</td><td>Shared log settings on Panorama (chapters 4 and 5)</td></tr>
<tr><td>2</td><td>Which match-list fields make a profile that sends all traffic logs to Panorama?</td><td>Log type, filter and a destination switch (chapter 4)</td></tr>
<tr><td>3</td><td>How does a rule use the profile?</td><td>The rule's log-setting word (chapter 3)</td></tr>
<tr><td>4</td><td>What gets the rule to the firewalls?</td><td>Commit on Panorama, then a device group push (chapter 2 of the earlier commit module)</td></tr>
<tr><td>5</td><td>How do you prove the logs arrived?</td><td>Real traffic from both PCs, then the log view on Panorama</td></tr>
</table>
<p>The commands you will use are of these shapes. They are templates, not the answer: fill in the values from the brief.</p>
<pre class="code">set shared log-settings profiles &lt;profile&gt; match-list &lt;name&gt; log-type traffic filter "&lt;filter&gt;" send-to-panorama yes|no
set device-group &lt;dg&gt; pre-rulebase security rules &lt;rule&gt; log-setting &lt;profile&gt;
commit
commit-all shared-policy device-group &lt;dg&gt; include-template no</pre>

<h3>Test with real traffic</h3>
<p>Go to the PC consoles and make a real web request such as <code>curl http:&#47;&#47;8.8.8.8</code>. Before the policy reaches the firewall the request fails, and no log is produced. That failure is not a log problem: it tells you the push has not happened yet.</p>
<p>After the push, look at the firewall counters and then at Panorama. This is the shape of a healthy result (your times will differ):</p>
<pre class="out">PA1&gt; show logging-status

Log forwarding agent: connected to Panorama 192.0.2.50
Panorama Server 1: 192.0.2.50  connected
Traffic logs:
    Total logs created                : 2
    Forwarded to Panorama             : 2
    Waiting to be forwarded           : 0</pre>
<p>On Panorama you should see rows for both NK-PUNE-PA and NK-DELHI-PA with the rule Allow-Out and action allow. If one firewall is missing, treat it as its own problem: it may be that you ran traffic from only one PC.</p>

<h3>The last task</h3>
<p>The lab asks which firewall command shows whether it is forwarding logs. You have met it in every chapter. Run it on a firewall and read all three counters before you answer.</p>

<h3>If you get stuck</h3>
<ol>
<li>Did you commit on Panorama before you pushed? A push sends only what has been committed.</li>
<li>Did you push the device group, not only commit?</li>
<li>Did you create traffic after the push, from both PCs?</li>
<li>Do the firewall counters show created, forwarded and waiting? Use the troubleshooting ladder from the previous chapter.</li>
</ol>

<div class="warn"><p><b>Honest boundary.</b> The lab models the forwarding logic, the counters and the default collector group. It does not model real TCP 3978 transport, certificates or log queries by time. Check the documentation for your PAN-OS version for real deployments.</p></div>

<div class="scn"><h4>Pilot before rollout</h4><p>A team enabled forwarding for two branches first, validated the search and the counters, then rolled the same profile out to forty more. The two-branch pilot found that one rule had no profile attached; fixing it on two sites was a ten-minute job instead of forty.</p><p><b>Lesson:</b> prove the path on a small scope, then widen it.</p></div>

<div class="iv"><p class="q">"You have enabled forwarding for a new branch. How do you prove it works?"</p><p>I generate a real session from a PC at that branch, read created, forwarded and waiting on the firewall, and then search Panorama for the firewall's logs showing the rule and action I expect. Only then do I mark the change complete.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Plan the pieces: profile, rule link, commit, push, test traffic, proof on Panorama.</li>
<li>A push sends what was committed; test only after it.</li>
<li>Prove with counters on the firewall and logs on Panorama for both sites.</li>
<li>Pilot on a small scope first.</li>
</ul></div>
`,hi:`
<p>Lab <b>pn-logfwd-build</b> (Forward traffic logs from firewalls to Panorama) mein aap do branches, Pune (PA1) aur Delhi (PA2), ke liye poora path khud banate ho. Ise recipe card se khana pakane jaisa samjho: pehle samaan jama karo, phir order follow karo. Ye chapter aapko exact answers diye bina taiyaar karta hai; lab ke tasks aapki checklist hain.</p>

<h3>Aap kis se shuru karte ho</h3>
<ul>
<li>Panorama NK-PANORAMA (192.0.2.50) dono firewalls manage kar raha hai, dono connected.</li>
<li>Ek device group jisme dono firewalls hain, ek NAT rule aur trust se untrust web traffic ke liye Allow-Out naam ka pushed security rule.</li>
<li>Koi log forwarding profile nahi. Default collector group mein pehle se dono firewalls hain.</li>
<li>Do PCs: Pune mein PC1 aur Delhi mein PC2, aur 8.8.8.8 par internet host.</li>
</ul>

<h3>Type karne se pehle plan</h3>
<table class="tbl"><tr><th>Step</th><th>Kaunsa sawal solve karna hai</th><th>Kahan rehta hai</th></tr>
<tr><td>1</td><td>Forwarding profiles kahan rehte hain, aur profile kis liye hai?</td><td>Panorama par shared log settings (chapters 4 aur 5)</td></tr>
<tr><td>2</td><td>Kaunse match-list fields aisa profile banate hain jo saare traffic logs Panorama ko bheje?</td><td>Log type, filter aur destination switch (chapter 4)</td></tr>
<tr><td>3</td><td>Rule profile ko kaise use karta hai?</td><td>Rule ka log-setting shabd (chapter 3)</td></tr>
<tr><td>4</td><td>Rule ko firewalls tak kya pahunchata hai?</td><td>Panorama par commit, phir device group push (pichhle commit module ka concept)</td></tr>
<tr><td>5</td><td>Logs aaye ye prove kaise karoge?</td><td>Dono PCs se real traffic, phir Panorama par log view</td></tr>
</table>
<p>Jo commands aap use karoge unki shakal ye hai. Ye templates hain, answer nahi: values brief se bharo.</p>
<pre class="code">set shared log-settings profiles &lt;profile&gt; match-list &lt;name&gt; log-type traffic filter "&lt;filter&gt;" send-to-panorama yes|no
set device-group &lt;dg&gt; pre-rulebase security rules &lt;rule&gt; log-setting &lt;profile&gt;
commit
commit-all shared-policy device-group &lt;dg&gt; include-template no</pre>

<h3>Real traffic se test</h3>
<p>PC consoles par jao aur real web request karo, jaise <code>curl http:&#47;&#47;8.8.8.8</code>. Policy firewall tak pahunchne se pehle request fail hoti hai aur log nahi banta. Wo failure log problem nahi hai: wo batati hai ki push abhi hua nahi.</p>
<p>Push ke baad firewall counters dekho, phir Panorama. Healthy result ki shakal ye hai (aapke times alag honge):</p>
<pre class="out">PA1&gt; show logging-status

Log forwarding agent: connected to Panorama 192.0.2.50
Panorama Server 1: 192.0.2.50  connected
Traffic logs:
    Total logs created                : 2
    Forwarded to Panorama             : 2
    Waiting to be forwarded           : 0</pre>
<p>Panorama par NK-PUNE-PA aur NK-DELHI-PA dono ki rows dikhni chahiye, rule Allow-Out aur action allow ke saath. Ek firewall missing ho to use alag problem maano: ho sakta hai aapne sirf ek PC se traffic chalaya.</p>

<h3>Aakhri task</h3>
<p>Lab poochta hai ki kaunsa firewall command batata hai ki wo logs forward kar raha hai ya nahi. Aap use har chapter mein mil chuke ho. Jawab dene se pehle firewall par chalao aur teeno counters padho.</p>

<h3>Atak jao to</h3>
<ol>
<li>Push se pehle Panorama par commit kiya? Push sirf wahi bhejta hai jo commit hua ho.</li>
<li>Sirf commit nahi, device group push kiya?</li>
<li>Push ke baad dono PCs se traffic banaya?</li>
<li>Firewall counters created, forwarded aur waiting dikhate hain? Pichhle chapter ki troubleshooting ladder use karo.</li>
</ol>

<div class="warn"><p><b>Honest boundary.</b> Lab forwarding logic, counters aur default collector group model karta hai. Real TCP 3978 transport, certificates ya time ke hisaab se log queries model nahi karta. Real deployments ke liye apne PAN-OS version ki documentation check karo.</p></div>

<div class="scn"><h4>Rollout se pehle pilot</h4><p>Ek team ne pehle do branches ke liye forwarding enable ki, search aur counters validate kiye, phir wahi profile chalis aur branches par roll out kiya. Do-branch pilot mein pata chala ki ek rule par profile attached nahi tha; do sites par fix das minute ka kaam tha, chalis par nahi.</p><p><b>Lesson:</b> chhote scope par path prove karo, phir widen karo.</p></div>

<div class="iv"><p class="q">"Naye branch ke liye forwarding enable ki hai. Kaise prove karoge ki chal rahi hai?"</p><p>Us branch ke PC se real session generate karta hoon, firewall par created, forwarded aur waiting padhta hoon, phir Panorama par us firewall ke logs search karta hoon jo mere expected rule aur action dikhayein. Tabhi change complete maanta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pieces plan karo: profile, rule link, commit, push, test traffic, Panorama par proof.</li>
<li>Push wahi bhejta hai jo commit hua; test uske baad hi karo.</li>
<li>Dono sites ke liye firewall counters aur Panorama logs se prove karo.</li>
<li>Pehle chhote scope par pilot karo.</li>
</ul></div>
`}};export{e as default};