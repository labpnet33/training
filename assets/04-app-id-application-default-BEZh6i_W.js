var e={id:`app-id`,h:{en:`App-ID and application-default: policy by what the traffic really is`,hi:`App-ID aur application-default: traffic asal mein kya hai uske hisaab se policy`},body:{en:`
<p><b>App-ID</b> is the technology that makes a Palo Alto firewall "next generation". The firewall does not trust the port number. It examines the first packets with signatures, protocol decoders and heuristics, and names the application: <code>web-browsing</code>, <code>ssl</code>, <code>ssh</code>, <code>dns</code>, <code>ping</code>, or one of thousands of named applications. The name is then used in the rulebase.</p>
<h3>Why application-default exists</h3>
<p>An application rule alone says "SSH is allowed". But on which port? If the service field is <code>any</code>, SSH is allowed on every port, including port 80 or 443, where it hides well. With <code>application-default</code> the firewall allows an application only on the ports in its definition: <code>web-browsing</code> on TCP 80, <code>ssl</code> on TCP 443, <code>dns</code> on 53, <code>ssh</code> on 22. Anything else is not a match.</p>
<table class="cmp"><tr><th>Service field</th><th>Effect</th><th>Use when</th></tr><tr><td><code>application-default</code></td><td>application only on its standard ports</td><td>almost always (best practice)</td></tr><tr><td><code>any</code></td><td>application on every port</td><td>only for an application that truly uses random ports</td></tr><tr><td>service object or <code>service-h&#116;tp</code></td><td>fixed ports you define (or the predefined 80 and 8080)</td><td>non-standard internal apps on a known port</td></tr></table>
<h3>See it in the simulator</h3>
<p>In the previous chapter the request to port 8080 timed out. Prove why with the test command and then look at what the firewall recorded for the traffic it did allow:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 8080
<span class="hl">No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</span></pre>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
"Allow-Out; index: 1" {
        from trust;
        source any;
        source-region none;
        to untrust;
        destination any;
        destination-region none;
        category any;
<span class="hl">        application/service [ ping dns web-browsing ssl ]/application-default;</span>
        action allow;
        icmp-unreachable: no
        terminal yes;
}</pre>
<p>TCP 443 matches the rule through <code>ssl</code>; TCP 8080 is not a default port of any listed application, so no rule matches. The session table shows the identified application per session:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show session all
--------------------------------------------------------------------------------
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
--------------------------------------------------------------------------------
<span class="hl">9361         ping           ACTIVE  FLOW NS    10.0.1.10[19499]/trust/1  (203.0.113.2[40001])</span>
vsys1                                          8.8.8.8[8]/untrust  (8.8.8.8[8])
<span class="hl">9362         web-browsing   ACTIVE  FLOW NS    10.0.1.10[64251]/trust/6  (203.0.113.2[60001])</span>
vsys1                                          8.8.8.8[80]/untrust  (8.8.8.8[80])</pre>
<p>The <code>Application</code> column is the App-ID result; the <code>Flag NS</code> means source NAT was applied. For a full picture of one session use <code>show session id</code>. These excerpted lines show the rule that allowed it and the NAT rule:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show session id 9362
<span class="hl">	application                          : web-browsing</span>
<span class="hl">	rule                                 : Allow-Out</span>
<span class="hl">	nat-rule                             : SNAT-Out(vsys1)</span>
	ingress interface                    : ethernet1/2
	egress interface                     : ethernet1/1
<span class="hl">	session QoS rule                     : N/A (class 4)</span></pre>
<div class="note"><p><b>How App-ID can change during a session.</b> The firewall needs a few packets to be sure. A rule that allows only <code>web-browsing</code> may first match on a generic stage and then be re-evaluated when the application becomes known. Applications also have <b>dependencies</b>: many web-based applications ride on <code>web-browsing</code> or <code>ssl</code>, so the dependent application must be allowed together with its base, or the traffic is blocked at the base. The firewall shows these in the application details. Do not guess: when a new application is blocked, read the traffic log for the application name and the rule that matched.</p></div>
<div class="warn"><p><b>Common mistake.</b> Leaving <code>service any</code> on an allow rule "to make it work". It works because it re-opens every port for the application. Fix the real cause instead: add the missing application or a service object for the specific port.</p></div>
<div class="exam"><p><b>Exam trap.</b> Web on TCP 8080 with <code>application-default</code>: the application is still <code>web-browsing</code>, but 8080 is not its default port, so a rule with <code>application-default</code> does not match. To permit it add a service object for TCP 8080 on that rule, or a separate narrow rule.</p></div>
<div class="scn"><h4>The developer's web server on port 8081</h4><p>A developer exposed an internal test site on TCP 8081 and users in the LAN could not open it. The engineer ran <code>test security-policy-match</code> for TCP 8081 and the result was <code>interzone-default</code>. Rather than loosening the main rule he created a service object <code>tcp-8081</code> and a small rule that allowed <code>web-browsing</code> on that service to the one server address only.</p><p><b>Lesson:</b> use the test command to find the reason, then add the narrowest rule that solves it.</p></div>
<div class="iv"><p class="q">"What does application-default do and why is it a best practice?"</p><p>It restricts an application to its standard ports. Without it, an allow rule for an application permits that application on every port, so an application can run on a port it was not meant for. With it, a mismatch between application and port does not match the rule, and the traffic is blocked or logged for review. It removes the need to list ports by hand and still stops port-hopping.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>App-ID names the application from the traffic, independent of the port.</li><li><code>application-default</code> allows an application only on its standard ports.</li><li><code>show session all</code> shows the application per session.</li><li>Dependent applications must be allowed with their base application.</li></ul></div>
`,hi:`
<p><b>App-ID</b> woh technology hai jo Palo Alto firewall ko "next generation" banati hai. Firewall port number par bharosa nahi karta. Woh pehle packets ko signatures, protocol decoders aur heuristics se examine karke application ka naam batata hai: <code>web-browsing</code>, <code>ssl</code>, <code>ssh</code>, <code>dns</code>, <code>ping</code>, ya hazaaron named applications mein se koi. Phir yeh naam rulebase mein use hota hai.</p>
<h3>application-default kyun hai</h3>
<p>Sirf application wali rule kehti hai "SSH allowed hai". Lekin kaunse port par? Service field <code>any</code> ho to SSH har port par allow hota hai, port 80 ya 443 par bhi, jahan woh achhe se chhup jaata hai. <code>application-default</code> ke saath firewall application ko sirf uski definition ke ports par allow karta hai: <code>web-browsing</code> TCP 80, <code>ssl</code> TCP 443, <code>dns</code> 53, <code>ssh</code> 22. Baaki sab match nahi hota.</p>
<table class="cmp"><tr><th>Service field</th><th>Asar</th><th>Kab use karein</th></tr><tr><td><code>application-default</code></td><td>application sirf apne standard ports par</td><td>lagbhag hamesha (best practice)</td></tr><tr><td><code>any</code></td><td>application har port par</td><td>sirf tab jab application sach mein random ports use kare</td></tr><tr><td>service object or <code>service-h&#116;tp</code></td><td>aap ke diye fixed ports (ya predefined 80 aur 8080)</td><td>known port par non-standard internal apps</td></tr></table>
<h3>Simulator mein dekho</h3>
<p>Pichhle chapter mein port 8080 ki request timeout hui. Test command se saabit karo kyun, phir dekho ki jo traffic allow hua usme firewall ne kya record kiya:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 8080
<span class="hl">No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</span></pre>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
"Allow-Out; index: 1" {
        from trust;
        source any;
        source-region none;
        to untrust;
        destination any;
        destination-region none;
        category any;
<span class="hl">        application/service [ ping dns web-browsing ssl ]/application-default;</span>
        action allow;
        icmp-unreachable: no
        terminal yes;
}</pre>
<p>TCP 443 rule se <code>ssl</code> ke through match hota hai; TCP 8080 listed kisi application ka default port nahi, isliye koi rule match nahi hoti. Session table har session ka pehchana hua application dikhati hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show session all
--------------------------------------------------------------------------------
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
--------------------------------------------------------------------------------
<span class="hl">9361         ping           ACTIVE  FLOW NS    10.0.1.10[19499]/trust/1  (203.0.113.2[40001])</span>
vsys1                                          8.8.8.8[8]/untrust  (8.8.8.8[8])
<span class="hl">9362         web-browsing   ACTIVE  FLOW NS    10.0.1.10[64251]/trust/6  (203.0.113.2[60001])</span>
vsys1                                          8.8.8.8[80]/untrust  (8.8.8.8[80])</pre>
<p><code>Application</code> column App-ID ka result hai; <code>Flag NS</code> ka matlab source NAT lagu hua. Ek session ki poori tasveer ke liye <code>show session id</code> use karo. Yeh excerpt wali lines us rule ko dikhati hain jisne allow kiya aur NAT rule:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show session id 9362
<span class="hl">	application                          : web-browsing</span>
<span class="hl">	rule                                 : Allow-Out</span>
<span class="hl">	nat-rule                             : SNAT-Out(vsys1)</span>
	ingress interface                    : ethernet1/2
	egress interface                     : ethernet1/1
<span class="hl">	session QoS rule                     : N/A (class 4)</span></pre>
<div class="note"><p><b>Session ke dauran App-ID badal sakta hai.</b> Firewall ko pakka karne ke liye kuch packets chahiye. Sirf <code>web-browsing</code> allow karne wali rule pehle generic stage par match ho sakti hai aur application pata chalne par dobara evaluate hoti hai. Applications ki <b>dependencies</b> bhi hoti hain: kai web-based applications <code>web-browsing</code> ya <code>ssl</code> par chalti hain, isliye dependent application ko uske base ke saath allow karna padta hai, nahi to traffic base par block ho jaata hai. Firewall yeh application details mein dikhata hai. Andaza mat lagao: nayi application block ho to traffic log mein application ka naam aur matching rule padho.</p></div>
<div class="warn"><p><b>Common mistake.</b> Allow rule par "chalane ke liye" <code>service any</code> chhod dena. Woh isliye chalta hai kyunki application ke liye har port wapas khul jaata hai. Asli wajah theek karo: missing application ya specific port ka service object jodo.</p></div>
<div class="exam"><p><b>Exam trap.</b> TCP 8080 par web aur <code>application-default</code>: application abhi bhi <code>web-browsing</code> hai, lekin 8080 uska default port nahi, isliye <code>application-default</code> wali rule match nahi karti. Allow karne ke liye us rule par TCP 8080 ka service object jodo, ya alag narrow rule banao.</p></div>
<div class="scn"><h4>Developer ka web server port 8081 par</h4><p>Ek developer ne internal test site TCP 8081 par khola aur LAN ke users use nahi khol paaye. Engineer ne TCP 8081 ke liye <code>test security-policy-match</code> chalaya aur result <code>interzone-default</code> aaya. Main rule dheeli karne ke bajay usne service object <code>tcp-8081</code> banaya aur ek chhoti rule likhi jo sirf us ek server address ke liye us service par <code>web-browsing</code> allow karti hai.</p><p><b>Lesson:</b> Kaaran dhoondne ke liye test command use karo, phir sabse narrow rule jodo jo solve kare.</p></div>
<div class="iv"><p class="q">"application-default kya karta hai aur yeh best practice kyun hai?"</p><p>Yeh application ko uske standard ports tak restrict karta hai. Iske bina application ke liye allow rule us application ko har port par permit karti hai, isliye application ussi port par chal sakti hai jiske liye woh bani nahi. Iske saath application aur port ka mismatch rule se match nahi hota, aur traffic block ya review ke liye log hota hai. Ports haath se list karne ki zaroorat nahi padti aur port-hopping bhi rukti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>App-ID port se alag, traffic se application ka naam batata hai.</li><li><code>application-default</code> application ko sirf uske standard ports par allow karta hai.</li><li><code>show session all</code> har session ka application dikhata hai.</li><li>Dependent applications ko unki base application ke saath allow karna padta hai.</li></ul></div>
`}};export{e as default};