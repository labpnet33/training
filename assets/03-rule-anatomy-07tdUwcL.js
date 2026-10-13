var e={id:`rule-anatomy`,h:{en:`Anatomy of a security rule and your first outbound policy`,hi:`Security rule ki banawat aur aapki pehli outbound policy`},body:{en:`
<p>A security rule is a sentence: "<i>Traffic from</i> these zones <i>to</i> those zones, <i>from</i> these addresses <i>to</i> those addresses, <i>using</i> these applications <i>on</i> these services, <i>is</i> allowed or denied." Each part of the sentence is a field. A packet matches the rule only if it matches <b>all</b> the fields; inside one field a packet needs to match <b>any one</b> of the listed members.</p>
<table class="cmp"><tr><th>Field</th><th>Meaning</th><th>Typical value</th></tr><tr><td><code>from</code> / <code>to</code></td><td>source and destination zone (post-NAT destination zone)</td><td>trust / untrust</td></tr><tr><td><code>source</code> / <code>destination</code></td><td>address objects, groups or <code>any</code> (pre-NAT addresses)</td><td>any, ADMIN-PC</td></tr><tr><td><code>application</code></td><td>App-ID names, one or a list</td><td>[ ping dns web-browsing ssl ]</td></tr><tr><td><code>service</code></td><td>ports; <code>application-default</code> or <code>any</code> or a service object</td><td>application-default</td></tr><tr><td><code>action</code></td><td>allow, deny, drop, reset-client, reset-server, reset-both</td><td>allow</td></tr></table>
<h3>Build the first outbound rule</h3>
<p>Management wants DNS, web and ping out of the LAN, on standard ports only, and nothing else. We write one rule and list four applications. DNS is a separate application from the web, and so is <code>ssl</code> for port 443.</p>
<pre class="out">admin@NK-PUNE-PA&gt; configure
Entering configuration mode
[edit]
admin@NK-PUNE-PA# set rulebase security rules Allow-Out from trust to untrust source any destination any application [ ping dns web-browsing ssl ] service application-default action allow
[edit]
admin@NK-PUNE-PA# commit
Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span>

[edit]
admin@NK-PUNE-PA# exit
Exiting configuration mode</pre>
<p>Notice that the <code>set</code> line returns nothing: success is silent on PAN-OS. Nothing is active until the commit finishes. The commit validates the whole candidate configuration; an unknown zone name or a missing object reference makes the whole commit fail.</p>
<h3>Verify what is running</h3>
<pre class="out">admin@NK-PUNE-PA&gt; show running security-policy
"Allow-Out; index: 1" {
        from trust;
        source any;
        source-region none;
        to untrust;
        destination any;
        destination-region none;
        user any;
        category any;
<span class="hl">        application/service [ ping dns web-browsing ssl ]/application-default;</span>
<span class="hl">        action allow;</span>
        icmp-unreachable: no
        terminal yes;
}</pre>
<p>The line <code>application/service [ ping dns web-browsing ssl ]/application-default</code> is the heart of the rule. <code>terminal yes</code> means that a match ends the search. Now the same ping and web request that failed before:</p>
<pre class="out">PC1&gt; ping 8.8.8.8 -c 1
<span class="hl">84 bytes from 8.8.8.8 icmp_seq=1 ttl=62 time=0.500 ms</span>
PC1&gt; curl 8.8.8.8
&lt;html&gt;&lt;body&gt;&lt;h1&gt;INET-SRV&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;
PC1&gt; curl 8.8.8.8:8080
<span class="hl">curl: (28) Failed to connect to 8.8.8.8 port 8080 after 2001 ms: Timeout was reached</span></pre>
<p>Ping and the web page on port 80 work. The request to port <b>8080</b> times out, because <code>web-browsing</code> with <code>application-default</code> covers only TCP 80. That surprise is a feature, and the next chapter explains it.</p>
<div class="eg"><p><b>Worked example.</b> A rule says <code>from trust to untrust, source any, destination any, application [ ping dns web-browsing ssl ], service application-default, allow</code>. A packet from 10.0.1.10 to 8.8.8.8, TCP 443, identified as ssl: zones match, addresses match (any), application ssl is in the list, TCP 443 is the default port of ssl, so the rule allows it. The same packet identified as <code>ssh</code> does not match the application field, so evaluation continues to the next rule and finally to <code>interzone-default</code>.</p></div>
<div class="warn"><p><b>Common mistake.</b> Forgetting <code>commit</code>. Candidate rules do nothing. Also forgetting that applications such as <code>ssl</code> and <code>dns</code> need to be listed on their own: allowing only <code>web-browsing</code> will not allow HTTPS.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default values: if <code>application</code> is left as <code>any</code> and <code>service</code> is <code>application-default</code>, any application is allowed on its own default ports. If service is <code>any</code> and the application is <code>any</code>, you have recreated a port-based "allow all". Know both.</p></div>
<div class="scn"><h4>The quarterly audit finding</h4><p>An auditor asked why the rule "Allow-Out" listed only four applications when users browse hundreds of sites. The engineer explained that the sites all use <code>web-browsing</code> or <code>ssl</code>; what the rule restricts is the <i>kind</i> of traffic, not the website. For site-level control the company would later attach URL filtering profiles, which are covered in the profiles module. The auditor accepted the rule and asked for logging at session end to be kept on, which was already the default.</p><p><b>Lesson:</b> separate "what kind of traffic" (policy) from "which sites and which content" (profiles).</p></div>
<div class="iv"><p class="q">"Which fields does a PAN-OS security rule match on?"</p><p>Source and destination zone, source and destination address, source user, application, service, and optionally URL category. The action can be allow, deny, drop or one of the reset options, and a profile or group can be attached to allowed traffic. Say that all fields must match and that the first matching rule from the top wins.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>A rule matches only if every field matches; in a list, one member is enough.</li><li><code>set</code> is silent; the commit makes it live.</li><li>List <code>dns</code>, <code>web-browsing</code> and <code>ssl</code> separately.</li><li><code>show running security-policy</code> shows the active rulebase with index numbers.</li></ul></div>
`,hi:`
<p>Security rule ek vakya hai: "<i>In</i> zones <i>se</i> un zones <i>tak</i>, <i>in</i> addresses <i>se</i> un addresses <i>tak</i>, <i>in</i> applications <i>ko</i> in services <i>par</i>, allow ya deny." Vakya ka har hissa ek field hai. Packet rule se tabhi match karta hai jab woh <b>saare</b> fields se match kare; ek field ke andar usse listed members mein se <b>koi ek</b> match karna hota hai.</p>
<table class="cmp"><tr><th>Field</th><th>Matlab</th><th>Aam value</th></tr><tr><td><code>from</code> / <code>to</code></td><td>source aur destination zone (post-NAT destination zone)</td><td>trust / untrust</td></tr><tr><td><code>source</code> / <code>destination</code></td><td>address objects, groups ya <code>any</code> (pre-NAT addresses)</td><td>any, ADMIN-PC</td></tr><tr><td><code>application</code></td><td>App-ID ke naam, ek ya list</td><td>[ ping dns web-browsing ssl ]</td></tr><tr><td><code>service</code></td><td>ports; <code>application-default</code> ya <code>any</code> ya service object</td><td>application-default</td></tr><tr><td><code>action</code></td><td>allow, deny, drop, reset-client, reset-server, reset-both</td><td>allow</td></tr></table>
<h3>Pehli outbound rule banao</h3>
<p>Management chahta hai ki LAN se DNS, web aur ping bahar jaaye, sirf standard ports par, aur kuch nahi. Hum ek rule likhte hain aur chaar applications list karte hain. DNS web se alag application hai, aur port 443 ke liye <code>ssl</code> alag application hai.</p>
<pre class="out">admin@NK-PUNE-PA&gt; configure
Entering configuration mode
[edit]
admin@NK-PUNE-PA# set rulebase security rules Allow-Out from trust to untrust source any destination any application [ ping dns web-browsing ssl ] service application-default action allow
[edit]
admin@NK-PUNE-PA# commit
Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span>

[edit]
admin@NK-PUNE-PA# exit
Exiting configuration mode</pre>
<p>Dhyan do ki <code>set</code> line kuch return nahi karti: PAN-OS par success silent hoti hai. Commit khatam hone tak kuch active nahi hota. Commit poori candidate configuration validate karta hai; unknown zone naam ya missing object reference se poora commit fail ho jaata hai.</p>
<h3>Dekho kya chal raha hai</h3>
<pre class="out">admin@NK-PUNE-PA&gt; show running security-policy
"Allow-Out; index: 1" {
        from trust;
        source any;
        source-region none;
        to untrust;
        destination any;
        destination-region none;
        user any;
        category any;
<span class="hl">        application/service [ ping dns web-browsing ssl ]/application-default;</span>
<span class="hl">        action allow;</span>
        icmp-unreachable: no
        terminal yes;
}</pre>
<p>Line <code>application/service [ ping dns web-browsing ssl ]/application-default</code> rule ka dil hai. <code>terminal yes</code> ka matlab hai ki match hote hi search khatam. Ab wahi ping aur web request jo pehle fail hui thi:</p>
<pre class="out">PC1&gt; ping 8.8.8.8 -c 1
<span class="hl">84 bytes from 8.8.8.8 icmp_seq=1 ttl=62 time=0.500 ms</span>
PC1&gt; curl 8.8.8.8
&lt;html&gt;&lt;body&gt;&lt;h1&gt;INET-SRV&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;
PC1&gt; curl 8.8.8.8:8080
<span class="hl">curl: (28) Failed to connect to 8.8.8.8 port 8080 after 2001 ms: Timeout was reached</span></pre>
<p>Ping aur port 80 ka web page chalte hain. Port <b>8080</b> ki request timeout hoti hai, kyunki <code>application-default</code> ke saath <code>web-browsing</code> sirf TCP 80 cover karta hai. Yeh surprise ek feature hai, aur agla chapter ise samjhata hai.</p>
<div class="eg"><p><b>Worked example.</b> Rule kehti hai <code>from trust to untrust, source any, destination any, application [ ping dns web-browsing ssl ], service application-default, allow</code>. 10.0.1.10 se 8.8.8.8 ka packet, TCP 443, ssl pehchana gaya: zones match, addresses match (any), application ssl list mein hai, TCP 443 ssl ka default port hai, isliye rule allow karti hai. Wahi packet agar <code>ssh</code> pehchana jaaye to application field se match nahi hota, evaluation agli rule par aur akhir mein <code>interzone-default</code> par jaata hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> <code>commit</code> bhool jaana. Candidate rules kuch nahi karti. Yeh bhi bhool jaana ki <code>ssl</code> aur <code>dns</code> jaisi applications ko alag se list karna padta hai: sirf <code>web-browsing</code> allow karne se HTTPS allow nahi hota.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default values: <code>application</code> <code>any</code> aur <code>service</code> <code>application-default</code> ho to koi bhi application apne default ports par allow hota hai. Service <code>any</code> aur application <code>any</code> ho to aapne port-based "allow all" dobara bana diya. Dono yaad rakho.</p></div>
<div class="scn"><h4>Quarterly audit ka finding</h4><p>Ek auditor ne poocha ki "Allow-Out" rule mein sirf chaar applications kyun hain jabki users sainkdon sites browse karte hain. Engineer ne samjhaya ki saari sites <code>web-browsing</code> ya <code>ssl</code> use karti hain; rule traffic ki <i>kism</i> restrict karti hai, website nahi. Site-level control ke liye company baad mein URL filtering profiles lagayegi, jo profiles module mein hain. Auditor ne rule maan li aur session end par logging on rakhne ko kaha, jo pehle se default tha.</p><p><b>Lesson:</b> "Kis kism ka traffic" (policy) ko "kaunsi sites aur kaunsa content" (profiles) se alag rakho.</p></div>
<div class="iv"><p class="q">"PAN-OS security rule kin fields par match karti hai?"</p><p>Source aur destination zone, source aur destination address, source user, application, service, aur optionally URL category. Action allow, deny, drop ya reset options mein se koi ek ho sakta hai, aur allowed traffic par profile ya group lagaya ja sakta hai. Batao ki saare fields match hone chahiye aur upar se pehli matching rule jeetti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Rule tabhi match karti hai jab har field match kare; list mein ek member kaafi hai.</li><li><code>set</code> silent hai; commit use live karta hai.</li><li><code>dns</code>, <code>web-browsing</code> aur <code>ssl</code> alag-alag list karo.</li><li><code>show running security-policy</code> index numbers ke saath active rulebase dikhata hai.</li></ul></div>
`}};export{e as default};