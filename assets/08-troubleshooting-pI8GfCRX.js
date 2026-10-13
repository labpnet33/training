var e={id:`troubleshooting`,h:{en:`Troubleshooting profiles: why was it not inspected, or why was it blocked`,hi:`Profiles troubleshooting: inspect kyun nahi hua, ya block kyun hua`},body:{en:`
<p>Profile tickets come in two flavours: "something bad got through" and "something good was blocked". Both begin with the same question: <b>was this session inspected, and by which rule?</b> Only after that do you ask about signatures and actions. This chapter is a workflow. The first two steps can be done in the simulator for the policy side; the log commands are real PAN-OS tools, shown as reference.</p>
<div class="dia"><svg viewBox="0 0 640 114" role="img" aria-label="Profile troubleshooting workflow"><rect x="20" y="20" width="99" height="74" rx="10" fill="#bbf7d0"/><text x="69.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">1 Rule</text><text x="69.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">which matched?</text><line x1="122" y1="57" x2="142" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="142,57 136,53 136,61" fill="#64748b"/><rect x="145" y="20" width="99" height="74" rx="10" fill="#fde68a"/><text x="194.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">2 Profile</text><text x="194.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">attached? allow?</text><line x1="247" y1="57" x2="267" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="267,57 261,53 261,61" fill="#64748b"/><rect x="270" y="20" width="99" height="74" rx="10" fill="#bae6fd"/><text x="319.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">3 Traffic</text><text x="319.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">decrypted?</text><line x1="372" y1="57" x2="392" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="392,57 386,53 386,61" fill="#64748b"/><rect x="395" y="20" width="99" height="74" rx="10" fill="#ddd6fe"/><text x="444.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">4 Content</text><text x="444.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">updates current?</text><line x1="497" y1="57" x2="517" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="517,57 511,53 511,61" fill="#64748b"/><rect x="520" y="20" width="99" height="74" rx="10" fill="#fed7aa"/><text x="569.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">5 Logs</text><text x="569.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">threat, url, wf</text></svg><p class="cap">Work from the rule outwards to the content, then confirm in the logs.</p></div>
<h3>Step 1: which rule decided?</h3>
<p>Run the test command with the real zones, addresses, protocol and port. In the rule-order ticket of the policy module the admin traffic matched <code>Block-SSH</code> first. Profiles live on rules, so the first fact you need is the matching rule name. Here it is for web traffic on TCP 443:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
<span class="hl">"Allow-Out; index: 1" {</span>
        from trust;
        source any;
        source-region none;
        to untrust;
        destination any;
        destination-region none;
        category any;
        application/service [ ping dns web-browsing ssl ]/application-default;
<span class="hl">        action allow;</span>
        icmp-unreachable: no
        terminal yes;
}</pre>
<h3>Step 2: was a profile applied to the session?</h3>
<p>The session detail answers it for URL filtering. After a real request, look at this line:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show session id 9362
	layer7 packet count(c2s)             : 3
	layer7 packet count(s2c)             : 2
	rule                                 : Allow-Out
	nat-rule                             : SNAT-Out(vsys1)
	layer7 processing                    : enabled
<span class="hl">	URL filtering enabled                : False</span>
	session QoS rule                     : N/A (class 4)</pre>
<p><code>False</code> means that the matching rule carries no URL filtering profile. In the simulator that is the permanent state, because it has no profiles. On a real firewall, <code>False</code> on a session that should be filtered tells you to fix the rule (wrong rule, group missing, or action not allow) and not to chase signatures.</p>
<h3>Step 3 to 5: traffic, content and logs (reference)</h3>
<pre class="code"># Reference commands on a real firewall (not run in the simulator)
show log threat
show log url
show log wildfire
show system info
request content upgrade check</pre>
<table class="cmp"><tr><th>Symptom</th><th>First suspicion</th></tr><tr><td>Malicious download not blocked</td><td>rule has no group; traffic encrypted and not decrypted; content or subscription stale; decoder action is alert</td></tr><tr><td>Exploit attempt only alerted</td><td>vulnerability rule action is alert or the threat has an exception</td></tr><tr><td>Good site blocked</td><td>site category is odd; fix with a custom category or allow list, not by removing the profile</td></tr><tr><td>Application broke after block</td><td>false positive: find the threat ID in the threat log, add a scoped exception</td></tr><tr><td>Files never reach WildFire</td><td>file type or direction not in the profile; no licence for the type; connectivity to the service</td></tr><tr><td>Block page not shown on a secure site</td><td>no decryption: only a connection reset is possible</td></tr></table>
<div class="note"><p><b>Honest limit.</b> The captured outputs in this chapter are policy-side evidence from the simulator. There is no threat, URL or WildFire log in the simulator; the table and the reference commands describe what to read on a real firewall. For practice with the same decision logic, work the rule-order and NAT labs and the other-vendor profile modules.</p></div>
<div class="warn"><p><b>Common mistake.</b> Removing the profile to "fix" a blocked application. That leaves every other user exposed. Create the narrowest exception instead, record it and set a review date.</p></div>
<div class="exam"><p><b>Exam trap.</b> The first question in any profile ticket is which rule matched and whether it is an allow rule with the profile attached. Then think about decryption, content updates and licences.</p></div>
<div class="scn"><h4>The urgent block that was really a stale update</h4><p>A new threat was in the news and management asked whether the firewall blocks it. The engineer checked the rule, the group and the installed threat content version; the scheduled download had been failing for a week because of an expired licence. After renewing the licence and installing the update, he confirmed the signature in the threat content and watched the threat log. The finding led to an alert on update failures.</p><p><b>Lesson:</b> a profile is only as good as its content; monitor the updates.</p></div>
<div class="iv"><p class="q">"A user reports they downloaded a malicious file through the firewall. How do you investigate?"</p><p>I find the session and the rule that matched, and check that it is an allow rule with the antivirus and WildFire profiles attached. I check whether the traffic was encrypted and not decrypted, whether the content versions are current and the subscriptions valid, and I read the threat and WildFire logs for that user and time. Then I fix the gap, such as the missing group or the stale updates, and add the file hash and domain to blocking lists if needed.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>First ask which rule matched and whether a profile applies to that session.</li><li><code>URL filtering enabled</code> in <code>show session id</code> is a quick check.</li><li>Then consider decryption, content updates and licences.</li><li>Fix false positives with scoped exceptions, never by removing the profile.</li></ul></div>
`,hi:`
<p>Profile tickets do tarah ke aate hain: "kuch kharab nikal gaya" aur "kuch achha block ho gaya". Dono ek hi sawaal se shuru hote hain: <b>kya yeh session inspect hua, aur kaunsi rule se?</b> Uske baad hi signatures aur actions ke baare mein poochte hain. Yeh chapter ek workflow hai. Pehle do steps policy side ke liye simulator mein ho sakte hain; log commands asli PAN-OS tools hain, reference ke roop mein dikhaye hain.</p>
<div class="dia"><svg viewBox="0 0 640 114" role="img" aria-label="Profile troubleshooting workflow"><rect x="20" y="20" width="99" height="74" rx="10" fill="#bbf7d0"/><text x="69.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">1 Rule</text><text x="69.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">kaunsi match?</text><line x1="122" y1="57" x2="142" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="142,57 136,53 136,61" fill="#64748b"/><rect x="145" y="20" width="99" height="74" rx="10" fill="#fde68a"/><text x="194.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">2 Profile</text><text x="194.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">laga? allow?</text><line x1="247" y1="57" x2="267" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="267,57 261,53 261,61" fill="#64748b"/><rect x="270" y="20" width="99" height="74" rx="10" fill="#bae6fd"/><text x="319.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">3 Traffic</text><text x="319.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">decrypt hua?</text><line x1="372" y1="57" x2="392" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="392,57 386,53 386,61" fill="#64748b"/><rect x="395" y="20" width="99" height="74" rx="10" fill="#ddd6fe"/><text x="444.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">4 Content</text><text x="444.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">updates current?</text><line x1="497" y1="57" x2="517" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="517,57 511,53 511,61" fill="#64748b"/><rect x="520" y="20" width="99" height="74" rx="10" fill="#fed7aa"/><text x="569.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">5 Logs</text><text x="569.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">threat, url, wf</text></svg><p class="cap">Rule se bahar content ki taraf kaam karo, phir logs mein confirm karo.</p></div>
<h3>Step 1: kaunsi rule ne decide kiya?</h3>
<p>Test command asli zones, addresses, protocol aur port ke saath chalao. Policy module ke rule-order ticket mein admin traffic pehle <code>Block-SSH</code> se match hua. Profiles rules par rehte hain, isliye pehla fact matching rule ka naam hai. TCP 443 ke web traffic ke liye yeh raha:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
<span class="hl">"Allow-Out; index: 1" {</span>
        from trust;
        source any;
        source-region none;
        to untrust;
        destination any;
        destination-region none;
        category any;
        application/service [ ping dns web-browsing ssl ]/application-default;
<span class="hl">        action allow;</span>
        icmp-unreachable: no
        terminal yes;
}</pre>
<h3>Step 2: kya session par profile lagu hua?</h3>
<p>Session detail URL filtering ke liye jawab deta hai. Asli request ke baad yeh line dekho:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show session id 9362
	layer7 packet count(c2s)             : 3
	layer7 packet count(s2c)             : 2
	rule                                 : Allow-Out
	nat-rule                             : SNAT-Out(vsys1)
	layer7 processing                    : enabled
<span class="hl">	URL filtering enabled                : False</span>
	session QoS rule                     : N/A (class 4)</pre>
<p><code>False</code> ka matlab hai ki matching rule par URL filtering profile nahi hai. Simulator mein yeh permanent state hai, kyunki isme profiles nahi hain. Asli firewall par jis session ko filter hona chahiye uspar <code>False</code> aapko rule theek karne ko kehta hai (galat rule, group missing, ya action allow nahi) aur signatures ke peeche na bhagne ko.</p>
<h3>Step 3 se 5: traffic, content aur logs (reference)</h3>
<pre class="code"># Reference commands on a real firewall (not run in the simulator)
show log threat
show log url
show log wildfire
show system info
request content upgrade check</pre>
<table class="cmp"><tr><th>Symptom</th><th>Pehla shak</th></tr><tr><td>Malicious download not blocked</td><td>rule par group nahi; traffic encrypted aur decrypt nahi; content ya subscription purana; decoder action alert hai</td></tr><tr><td>Exploit attempt only alerted</td><td>vulnerability rule ka action alert hai ya threat par exception hai</td></tr><tr><td>Good site blocked</td><td>site ki category ajeeb hai; custom category ya allow list se fix karo, profile hatakar nahi</td></tr><tr><td>Application broke after block</td><td>false positive: threat log mein threat ID dhoondo, scoped exception jodo</td></tr><tr><td>Files never reach WildFire</td><td>file type ya direction profile mein nahi; type ka licence nahi; service tak connectivity</td></tr><tr><td>Block page not shown on a secure site</td><td>decryption nahi: sirf connection reset possible hai</td></tr></table>
<div class="note"><p><b>Imaandar seema.</b> Is chapter ke captured outputs simulator ke policy-side saboot hain. Simulator mein threat, URL ya WildFire log nahi hai; table aur reference commands batate hain ki asli firewall par kya padhna hai. Wahi decision logic ke practice ke liye rule-order aur NAT labs aur doosre vendors ke profile modules karo.</p></div>
<div class="warn"><p><b>Common mistake.</b> Blocked application ko "fix" karne ke liye profile hata dena. Isse baaki sab users exposed ho jaate hain. Sabse narrow exception banao, record karo aur review date set karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kisi bhi profile ticket ka pehla sawaal hai ki kaunsi rule match hui aur kya woh profile attached allow rule hai. Phir decryption, content updates aur licences ke baare mein socho.</p></div>
<div class="scn"><h4>Urgent block jo asal mein purana update tha</h4><p>Ek nayi threat khabron mein thi aur management ne poocha ki kya firewall use block karta hai. Engineer ne rule, group aur installed threat content version check kiye; scheduled download expire hui licence ke karan ek hafte se fail ho raha tha. Licence renew karne aur update install karne ke baad usne threat content mein signature confirm kiya aur threat log dekha. Is finding se update failures par alert bana.</p><p><b>Lesson:</b> profile utna hi achha hai jitna uska content; updates monitor karo.</p></div>
<div class="iv"><p class="q">"Ek user batata hai ki usne firewall ke through malicious file download ki. Kaise investigate karte ho?"</p><p>Main session aur matching rule dhoondta hoon, aur check karta hoon ki woh allow rule hai jis par antivirus aur WildFire profiles lage hain. Dekhta hoon ki traffic encrypted tha aur decrypt nahi hua, content versions current aur subscriptions valid hain ya nahi, aur us user aur samay ke threat aur WildFire logs padhta hoon. Phir gap theek karta hoon, jaise missing group ya purane updates, aur zaroorat ho to file hash aur domain blocking lists mein jodta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Pehle poochho kaunsi rule match hui aur kya us session par profile lagu hai.</li><li><code>show session id</code> mein <code>URL filtering enabled</code> ek tez check hai.</li><li>Phir decryption, content updates aur licences ke baare mein socho.</li><li>False positives ko scoped exceptions se fix karo, profile hatakar kabhi nahi.</li></ul></div>
`}};export{e as default};